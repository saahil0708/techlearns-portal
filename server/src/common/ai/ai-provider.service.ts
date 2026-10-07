import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

export type ProgressiveHintLevel = 1 | 2 | 3;

export interface ProblemContextPayload {
  title: string;
  statement: string;
  difficulty?: string;
  tags?: string[];
  currentCode?: string;
  language?: string;
  verdict?: string;
  failedInput?: string;
  expectedOutput?: string;
  actualOutput?: string;
}

interface CacheEntry {
  data: string;
  timestamp: number;
}

@Injectable()
export class AIProviderService {
  private readonly logger = new Logger(AIProviderService.name);
  private client: OpenAI | null = null;
  private modelName: string;

  // In-memory LRU/TTL cache for repeated problem explanations & hints (TTL: 1 hour)
  // Saves 100% of tokens when multiple students inspect the same challenge
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor() {
    const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    const baseURL = process.env.AI_BASE_URL || (process.env.GROQ_API_KEY ? 'https://api.groq.com/openai/v1' : undefined);
    this.modelName = process.env.AI_MODEL_NAME || (process.env.GROQ_API_KEY ? 'llama-3.3-70b-versatile' : 'gpt-4.1-mini');

    let resolvedBaseURL = baseURL;
    if (resolvedBaseURL && resolvedBaseURL.includes('.services.ai.azure.com') && resolvedBaseURL.includes('/api/projects/')) {
      // Convert Azure AI Foundry project URL to OpenAI compatibility endpoint (/openai/v1)
      const match = resolvedBaseURL.match(/^(https:\/\/[^/]+)/);
      if (match) {
        resolvedBaseURL = `${match[1]}/openai/v1`;
      }
    }

    if (apiKey) {
      try {
        const headers: Record<string, string> = {};
        const isAzure = Boolean(resolvedBaseURL && (resolvedBaseURL.includes('azure') || resolvedBaseURL.includes('services.ai.azure.com') || resolvedBaseURL.includes('models.ai.azure.com')));
        
        if (isAzure) {
          headers['api-key'] = apiKey;
        }

        this.client = new OpenAI({
          apiKey,
          baseURL: resolvedBaseURL || undefined,
          defaultHeaders: Object.keys(headers).length > 0 ? headers : undefined,
        });
        this.logger.log(`Initialized AIProviderService with model: [${this.modelName}] on [${resolvedBaseURL || 'OpenAI Standard'}] (Azure Mode: ${isAzure})`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize OpenAI client: ${err?.message}`);
      }
    } else {
      this.logger.warn('AIProviderService: No API keys configured. Running with local intelligent assistant engine.');
    }
  }

  // --- Context Sanitization & Token Optimization Helpers ---
  private cleanText(raw?: string, maxLen = 450): string {
    if (!raw) return '';
    return raw
      .replace(/<[^>]*>?/gm, ' ') // Strip HTML tags
      .replace(/`{3,}[\s\S]*?`{3,}/g, ' ') // Remove redundant fenced code blocks in statement
      .replace(/\s+/g, ' ') // Collapse whitespace
      .trim()
      .slice(0, maxLen);
  }

  private cleanCode(code?: string, maxLines = 35, maxLen = 600): string {
    if (!code) return '';
    const lines = code.split('\n').slice(0, maxLines);
    return lines.join('\n').slice(0, maxLen).trim();
  }

  private getFromCache(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.CACHE_TTL_MS) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  private setInCache(key: string, data: string): void {
    if (this.cache.size > 500) {
      // Evict oldest entries if cache exceeds 500
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * 1. Explain Problem with Concrete Walkthrough Examples (Token Budget: max 200 tokens)
   * High context compression + Cache for 100% token savings on repeated student views.
   */
  async explainProblem(context: ProblemContextPayload): Promise<string> {
    const cleanTitle = (context.title || 'Challenge').trim();
    const cleanStatement = this.cleanText(context.statement, 450);
    const cacheKey = `explain_${cleanTitle}_${cleanStatement.slice(0, 50)}`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`explainProblem: cache hit for [${cleanTitle}]`);
      return cached;
    }

    if (!this.client) {
      return this.getLocalProblemExplanation(context);
    }

    try {
      const systemPrompt = `You are a concise algorithmic coach in a competitive coding IDE.
Explain the algorithmic problem strictly in GitHub Markdown under 120 words:
1. **Core Goal**: 1-sentence objective.
2. **Trace Example**: Small sample input with step-by-step trace.
3. **Key Constraints**: 1-2 bullet points on limits and boundary conditions.
Rules: Be extremely brief. Do NOT provide full code solutions.`;

      const userPrompt = `Title: ${cleanTitle} (${context.difficulty || 'Medium'})\nStatement: ${cleanStatement}`;

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        temperature: 0.2,
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const explanation = response.choices[0]?.message?.content?.trim() || this.getLocalProblemExplanation(context);
      this.setInCache(cacheKey, explanation);
      return explanation;
    } catch (err: any) {
      this.logger.error(`explainProblem failed: ${err?.message}`, err?.stack);
      return this.getLocalProblemExplanation(context);
    }
  }

  /**
   * 2. Progressive Socratic Hints (Levels 1 to 3)
   * Progressive token budgeting: Level 1 (60 tokens), Level 2 (90 tokens), Level 3 (140 tokens).
   */
  async getProgressiveHint(context: ProblemContextPayload, level: ProgressiveHintLevel): Promise<{ level: ProgressiveHintLevel; hint: string }> {
    const cleanTitle = (context.title || 'Challenge').trim();
    const cleanStatement = this.cleanText(context.statement, 350);
    const cacheKey = `hint_${level}_${cleanTitle}_${cleanStatement.slice(0, 40)}`;

    const cached = this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`getProgressiveHint L${level}: cache hit for [${cleanTitle}]`);
      return { level, hint: cached };
    }

    if (!this.client) {
      return { level, hint: this.getLocalHint(context, level) };
    }

    try {
      const levelConfigs = {
        1: {
          instruction: 'Give ONLY a 1-sentence conceptual nudge/question toward the algorithmic pattern (e.g. Hash Map, Two Pointers, Monotonic Stack). Zero code.',
          maxTokens: 60,
        },
        2: {
          instruction: 'State the required auxiliary state to track and target Time/Space complexity in 2 concise sentences. Zero code.',
          maxTokens: 90,
        },
        3: {
          instruction: 'Provide 3 high-level algorithmic steps and 1 subtle edge case warning. Do NOT write executable code.',
          maxTokens: 140,
        },
      }[level];

      const systemPrompt = `You are a competitive programming coach using the Socratic method.\n${levelConfigs.instruction}`;
      const userPrompt = `Problem: ${cleanTitle}\nStatement: ${cleanStatement}\nCode Excerpt:\n${this.cleanCode(context.currentCode, 25, 300) || '// In progress'}`;

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        temperature: 0.2,
        max_tokens: levelConfigs.maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const hintText = response.choices[0]?.message?.content?.trim() || this.getLocalHint(context, level);
      this.setInCache(cacheKey, hintText);
      return { level, hint: hintText };
    } catch (err: any) {
      this.logger.error(`getProgressiveHint failed: ${err?.message}`, err?.stack);
      return { level, hint: this.getLocalHint(context, level) };
    }
  }

  /**
   * 3. Diagnose Compilation / Test Case Failure (Token Budget: max 140 tokens)
   */
  async diagnoseFailure(context: ProblemContextPayload): Promise<string> {
    if (!this.client) {
      return 'Inspect your array boundary indices and ensure edge cases (empty input, duplicates, or large numbers) are handled.';
    }

    try {
      const systemPrompt = `You are a precision code debugger in an algorithmic judge sandbox.
Identify why the student code failed the test case in 2 concise bullet points:
- Root cause (e.g. integer overflow, off-by-one, unhandled empty case, infinite loop).
- Fix direction.
Rules: Under 80 words. Do NOT provide full rewritten code.`;

      const userPrompt = `Problem: ${context.title}\nLanguage: ${context.language || 'Python'}\nCode:\n\`\`\`\n${this.cleanCode(context.currentCode, 30, 450)}\n\`\`\`\nVerdict: ${context.verdict || 'Wrong Answer'}\nFailed Input: ${this.cleanText(context.failedInput, 80) || 'N/A'}\nExpected: ${this.cleanText(context.expectedOutput, 80) || 'N/A'}\nActual: ${this.cleanText(context.actualOutput, 80) || 'N/A'}`;

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        temperature: 0.1,
        max_tokens: 140,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      return response.choices[0]?.message?.content?.trim() || 'Review your loop conditions and return type.';
    } catch (err: any) {
      this.logger.error(`diagnoseFailure failed: ${err?.message}`, err?.stack);
      return 'Check for out-of-bounds indexing or unexpected state mutations.';
    }
  }

  /**
   * 4. AI Problem Authoring: Generate complete coding challenge (Token Budget: max 850 tokens)
   */
  async generateProblem(params: {
    prompt?: string;
    title?: string;
    category?: string;
    difficulty?: string;
    statement?: string;
    taskType?: 'full_problem' | 'statement_only' | 'test_cases' | 'constraints_only';
  }): Promise<any> {
    const taskType = params.taskType || 'full_problem';
    const category = params.category || 'Dynamic Programming';
    const difficulty = params.difficulty || 'Medium';
    const seedTitle = params.title || (params.prompt ? params.prompt.slice(0, 40) : 'Algorithmic Optimization Challenge');

    if (!this.client) {
      return this.getLocalGeneratedProblem(params);
    }

    try {
      const systemPrompt = `You are a competitive programming problem creator and judge architect.
Return ONLY compact, valid JSON matching this exact structure without markdown backticks or commentary:
{
  "title": "${seedTitle}",
  "category": "${category}",
  "difficulty": "${difficulty}",
  "statementHtml": "<p>Rich HTML problem description with rules and examples.</p>",
  "statementMarkdown": "Markdown version of problem description",
  "inputFormat": "Input details",
  "outputFormat": "Expected output details",
  "constraints": "1 <= N <= 10^5, Time Limit: 1.0s",
  "sampleInput": "4\\n1 2 3 4",
  "sampleOutput": "10",
  "sampleExplanation": "Example 1: Standard case",
  "publicTestCases": [
    { "input": "4\\n1 2 3 4", "expectedOutput": "10", "explanation": "Example 1: Standard array" },
    { "input": "1\\n5", "expectedOutput": "5", "explanation": "Example 2: Single element" },
    { "input": "5\\n-2 -5 10 -3 4", "expectedOutput": "11", "explanation": "Example 3: Mixed positive and negative values" }
  ],
  "hiddenTestCases": [
    { "input": "10\\n...", "expectedOutput": "...", "explanation": "Hidden edge case: large values" },
    { "input": "...", "expectedOutput": "...", "explanation": "Hidden edge case: boundary limits" }
  ],
  "tags": ["${category}", "Algorithms"]
}

Important Rules:
- Provide 2 to 3 distinct, accurate 'publicTestCases' (Example 1, Example 2, Example 3).
- Ensure all expectedOutputs in publicTestCases and hiddenTestCases are mathematically exact and logically consistent with the problem rules.`;

      const userPrompt = `Task: ${taskType}\nTitle: ${seedTitle}\nTopic: ${category}\nDifficulty: ${difficulty}\nContext/Statement:\n${this.cleanText(params.prompt || params.statement || 'Create algorithmic challenge with accurate public and hidden test cases.', 450)}`;

      const response = await this.client.chat.completions.create({
        model: this.modelName,
        temperature: 0.3,
        max_tokens: 950,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const raw = response.choices[0]?.message?.content?.trim() || '';
      const cleanJson = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();

      try {
        const parsed = JSON.parse(cleanJson);
        const fallback = this.getLocalGeneratedProblem(params);
        const publicTestCases = Array.isArray(parsed.publicTestCases) && parsed.publicTestCases.length > 0
          ? parsed.publicTestCases.map((tc: any, idx: number) => ({
              input: String(tc.input ?? ''),
              expectedOutput: String(tc.expectedOutput ?? tc.output ?? ''),
              explanation: tc.explanation ? String(tc.explanation) : `Example #${idx + 1}`,
              isHidden: false,
            }))
          : fallback.publicTestCases;

        const firstSample = publicTestCases[0] || { input: parsed.sampleInput || '', expectedOutput: parsed.sampleOutput || '', explanation: parsed.sampleExplanation || '' };

        return {
          ...fallback,
          ...parsed,
          sampleInput: firstSample.input,
          sampleOutput: firstSample.expectedOutput,
          sampleExplanation: firstSample.explanation,
          publicTestCases,
          hiddenTestCases: Array.isArray(parsed.hiddenTestCases)
            ? parsed.hiddenTestCases.map((tc: any, idx: number) => ({
                input: String(tc.input ?? ''),
                expectedOutput: String(tc.expectedOutput ?? tc.output ?? ''),
                explanation: tc.explanation ? String(tc.explanation) : `Hidden case #${idx + 1}`,
                isHidden: true,
              }))
            : fallback.hiddenTestCases,
        };
      } catch {
        return this.getLocalGeneratedProblem(params);
      }
    } catch (err: any) {
      this.logger.error(`generateProblem failed: ${err?.message}`, err?.stack);
      return this.getLocalGeneratedProblem(params);
    }
  }

  /**
   * 5. Interactive Assistant Chat (Token Budget: max 260 tokens)
   */
  async chatWithAssistant(params: {
    message: string;
    title: string;
    statement: string;
    difficulty?: string;
    tags?: string[];
    currentCode?: string;
    language?: string;
  }): Promise<string> {
    if (this.client) {
      try {
        const cleanTitle = (params.title || 'Coding Challenge').trim();
        const cleanStatement = this.cleanText(params.statement, 350);
        const cleanCodeSnippet = this.cleanCode(params.currentCode, 35, 450);
        const lang = params.language || 'Python';

        const systemPrompt = `You are a concise, helpful competitive programming coach.
Problem: "${cleanTitle}" (${params.difficulty || 'Standard'}).
Statement: ${cleanStatement}
Language: ${lang}
Student Code Buffer:
\`\`\`${lang.toLowerCase()}
${cleanCodeSnippet || '// No code written yet'}
\`\`\`

Instructions:
- Be ultra-concise: max 1-2 short sentences of explanation followed by clean code if requested.
- When providing code snippets, ALWAYS wrap them in standard markdown code blocks with language identifier (e.g. \`\`\`python ... \`\`\`).
- Preserve standard 4-space indentation for Python and clean formatting for C++/Java.`;

        const response = await this.client.chat.completions.create({
          model: this.modelName,
          temperature: 0.3,
          max_tokens: 380,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: params.message.trim().slice(0, 300) },
          ],
        });

        const reply = response.choices[0]?.message?.content?.trim();
        if (reply) return reply;
      } catch (err: any) {
        this.logger.warn(`chatWithAssistant API call failed, using dynamic local engine: ${err?.message}`);
      }
    }

    return this.getLocalAssistantChat(params);
  }

  // --- Dynamic Local Fallback Engines (0 API cost) ---
  private getLocalAssistantChat(params: {
    message: string;
    title: string;
    statement: string;
    difficulty?: string;
    tags?: string[];
    currentCode?: string;
    language?: string;
  }): string {
    const q = (params.message || '').toLowerCase().trim();
    const title = params.title || 'the problem';
    const lang = (params.language || 'python').toLowerCase();
    const cleanStatement = this.cleanText(params.statement, 300);

    // 1. Greeting
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hello') || q.startsWith('hi ')) {
      return `Hello! I'm here to help you solve **${title}**. \n\nYou can ask me for:\n- **Brute Force vs Optimal** approach comparison\n- **Dry run & sample trace** walkthroughs\n- **Time and Space complexity** breakdowns\n- **Code syntax & implementation** in ${lang.toUpperCase()}`;
    }

    // 2. Brute Force Specific Inquiry
    if (q.includes('brute') || q.includes('naive')) {
      return `### Brute Force Approach for **${title}**\n\n1. **Intuition**: Checks all combinations pairwise ($O(N^2)$ time).\n2. **Complexity**: **$O(N^2)$** Time, **$O(1)$** Space.\n3. **Why it fails**: For $N = 10^5$, $10^{10}$ operations exceed the 1.0s time limit (TLE).\n*Recommendation: Use a single linear scan ($O(N)$).*`;
    }

    // 3. Which Approach / Comparison / Recommendation
    if (
      q.includes('which approach') ||
      q.includes('what approach') ||
      q.includes('best approach') ||
      q.includes('recommend') ||
      q.includes('compare') ||
      q.includes('should i go for')
    ) {
      return `### Approach Options for **${title}**\n\n| Approach | Strategy | Time | Space | Status |\n| :--- | :--- | :--- | :--- | :--- |\n| **1. Brute Force** | Nested pairwise scan | $O(N^2)$ | $O(1)$ | ❌ TLE |\n| **2. Sorting** | Array sorting | $O(N \\log N)$ | $O(1)$ | ⚠️ Slower |\n| **3. Linear Scan** | Running state tracker | **$O(N)$** | **$O(1)$** | ✅ **Optimal** |\n\n**Recommendation:** Use **Approach 3 (Linear Scan)** to finish within 1.0s with zero auxiliary memory.`;
    }

    // 4. Dry Run / Step-by-Step Trace Walkthrough
    if (q.includes('dry run') || q.includes('trace') || q.includes('walkthrough') || q.includes('example trace') || q.includes('step by step')) {
      return `### Dry Run Walkthrough for **${title}**\n\nSample input: \`nums = [3, 1, 7, 5, 9, 2]\`\n\n| Step | Element | Running Tracker | Action |\n| :--- | :--- | :--- | :--- |\n| **Init** | \`nums[0] = 3\` | **3** | Initialize |\n| **1** | \`1\` | **3** | $1 < 3 \\rightarrow$ Keep \`3\` |\n| **2** | \`7\` | **7** | $7 > 3 \\rightarrow$ **Update to 7** |\n| **3** | \`5\` | **7** | $5 < 7 \\rightarrow$ Keep \`7\` |\n| **4** | \`9\` | **9** | $9 > 7 \\rightarrow$ **Update to 9** |\n| **5** | \`2\` | **9** | $2 < 9 \\rightarrow$ Keep \`9\` |\n\n**Result:** \`9\` in $O(N)$ single loop.`;
    }

    // 5. Complexity / Big-O
    if (q.includes('complexity') || q.includes('big o') || q.includes('time') || q.includes('space') || q.includes('o(n)')) {
      return `### Optimal Complexity for **${title}**\n\n- **Time Complexity**: **$O(N)$** — Single pass over $N$ items.\n- **Space Complexity**: **$O(1)$** — Minimal scalar variables.\n\n*Avoids quadratic $O(N^2)$ brute force loops.*`;
    }

    // 6. Code / Implementation / Solution
    if (
      q.includes('code') ||
      q.includes('solution') ||
      q.includes('python') ||
      q.includes('c++') ||
      q.includes('cpp') ||
      q.includes('java') ||
      q.includes('javascript') ||
      q.includes('write') ||
      q.includes('implement')
    ) {
      if (lang === 'cpp' || q.includes('c++') || q.includes('cpp')) {
        return `\`\`\`cpp\n#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint solve(const vector<int>& nums) {\n    if (nums.empty()) return 0;\n    int result = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        result = max(result, nums[i]);\n    }\n    return result;\n}\n\`\`\`\n\n**O(N)** Time & **O(1)** Space.`;
      }

      if (lang === 'java' || q.includes('java')) {
        return `\`\`\`java\npublic class Solution {\n    public static int solve(int[] nums) {\n        if (nums == null || nums.length == 0) return 0;\n        int result = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            result = Math.max(result, nums[i]);\n        }\n        return result;\n    }\n}\n\`\`\`\n\n**O(N)** Time & **O(1)** Space.`;
      }

      return `\`\`\`python\ndef solve(nums: list[int]) -> int:\n    if not nums:\n        return 0\n    max_val = nums[0]\n    for x in nums[1:]:\n        if x > max_val:\n            max_val = x\n    return max_val\n\`\`\`\n\n**O(N)** Time & **O(1)** Space. Handles negative numbers cleanly.`;
    }

    // 7. Bugs / Debugging / Failed test case
    if (q.includes('bug') || q.includes('error') || q.includes('wrong') || q.includes('fail') || q.includes('test case') || q.includes('tle') || q.includes('fix')) {
      return `### Traps to Check in **${title}**\n\n1. **All Negative Numbers**: Initialize answer with \`nums[0]\` rather than \`0\`.\n2. **Single Element Input**: Ensure $N = 1$ correctly returns the element.\n3. **Loop Bounds**: Verify 0-based indexing limits to prevent off-by-one crashes.`;
    }

    // 8. General Dynamic Fallback
    return `### Response for: "${params.message}"\n\nFor **${title}**, solve by scanning elements in a single linear pass ($O(N)$ time, $O(1)$ space).\n\n- **Key Insight**: Maintain a tracker initialized to \`nums[0]\` and update when larger elements are encountered.\n\n*Would you like a syntax template in ${lang.toUpperCase()}, or a complexity breakdown?*`;
  }

  private getLocalGeneratedProblem(params: {
    prompt?: string;
    title?: string;
    category?: string;
    difficulty?: string;
  }) {
    const title = params.title || (params.prompt ? params.prompt.slice(0, 40) : 'Maximum Subarray Target Partition');
    const category = params.category || 'Dynamic Programming';
    const difficulty = params.difficulty || 'Medium';

    return {
      title,
      category,
      difficulty,
      statementHtml: `<p>Given an array of integers <code>nums</code> and an integer <code>k</code>, return the maximum sum of a non-empty contiguous subarray such that the length of the subarray is at most <code>k</code>.</p><p>An optimal solution should run in <strong>O(N)</strong> or <strong>O(N log N)</strong> time.</p>`,
      statementMarkdown: `Given an array of integers \`nums\` and an integer \`k\`, return the maximum sum of a non-empty contiguous subarray such that the length of the subarray is at most \`k\`.\n\nAn optimal solution should run in **O(N)** or **O(N log N)** time.`,
      inputFormat: `The first line contains two integers N and k (1 <= N <= 10^5, 1 <= k <= N).\nThe second line contains N space-separated integers representing nums.`,
      outputFormat: `Output a single integer representing the maximum subarray sum satisfying the length constraint.`,
      constraints: `1 <= N <= 100,000\n1 <= k <= N\n-10^4 <= nums[i] <= 10^4\nTime Limit: 1000 ms\nMemory Limit: 256 MB`,
      sampleInput: `5 2\n-1 2 4 -3 5`,
      sampleOutput: `6`,
      sampleExplanation: `The subarray [2, 4] has length 2 <= 2 and yields the maximum sum of 2 + 4 = 6.`,
      publicTestCases: [
        { input: `5 2\n-1 2 4 -3 5`, expectedOutput: `6`, explanation: `Example 1: The subarray [2, 4] yields the maximum sum of 2 + 4 = 6.`, isHidden: false },
        { input: `4 2\n1 2 3 4`, expectedOutput: `7`, explanation: `Example 2: All positive elements, subarray [3, 4] yields 3 + 4 = 7.`, isHidden: false },
        { input: `3 1\n-5 -2 -8`, expectedOutput: `-2`, explanation: `Example 3: All negative values with k=1, max element is -2.`, isHidden: false },
      ],
      hiddenTestCases: [
        { input: `1 1\n-5`, expectedOutput: `-5`, explanation: `Single negative element`, isHidden: true },
        { input: `4 4\n1 2 3 4`, expectedOutput: `10`, explanation: `All positive elements`, isHidden: true },
        { input: `6 3\n10 -20 15 20 -5 30`, expectedOutput: `45`, explanation: `Mixed values with window boundary`, isHidden: true },
        { input: `5 1\n-1 -2 -3 -4 -5`, expectedOutput: `-1`, explanation: `All negative values with k=1`, isHidden: true },
      ],
      tags: [category, 'Algorithms', 'Arrays'],
    };
  }

  private getLocalProblemExplanation(context: ProblemContextPayload): string {
    return `### Problem Objective\nUnderstand the problem constraints and design an optimal data structure approach for **${context.title}**.\n\n### Step-by-Step Walkthrough\n1. Break down the input structure.\n2. Identify if sorting, hashing, or two-pointer traversal simplifies lookups.\n3. Track edge cases like single elements or empty arrays.`;
  }

  private getLocalHint(context: ProblemContextPayload, level: ProgressiveHintLevel): string {
    if (level === 1) return `Consider what data structure enables fast O(1) or O(log N) lookups for this problem.`;
    if (level === 2) return `Target an optimal Time Complexity of O(N) or O(N log N) by avoiding nested brute-force loops.`;
    return `Maintain state tracking seen elements, iterate through the input once, and handle boundary conditions before returning.`;
  }
}
