import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AIProviderService } from '../common/ai/ai-provider.service.js';
import { SendCoachMessageDto } from './dto/send-coach-message.dto.js';
import { ExplainProblemDto, AnalyzeComplexityDto, ProgressiveHintDto, DiagnoseFailureDto } from './dto/ide-assistant.dto.js';
import { GenerateProblemDto } from './dto/generate-problem.dto.js';

@Injectable()
export class AICoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiProvider: AIProviderService,
  ) {}

  async getHistory(userId: string) {
    const messages = await this.prisma.aICoachMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (messages.length === 0) {
      // Seed default welcome message if empty
      const welcome = await this.prisma.aICoachMessage.create({
        data: {
          userId,
          sender: 'ai',
          text: 'Hello! I am your AI Learning Coach powered by Microsoft Phi. I can analyze your algorithmic problem submissions, explain tricky patterns with trace walkthroughs, and provide progressive hints. What concept or problem would you like to drill today?',
        },
      });
      return [welcome];
    }

    return messages.reverse();
  }

  async sendMessage(userId: string, dto: SendCoachMessageDto) {
    let aiText = '';
    let aiSnippet: string | undefined = undefined;

    try {
      const aiResponse = await this.aiProvider.chatWithAssistant({
        message: dto.message,
        title: 'DSA Mentorship',
        statement: 'Interactive algorithmic problem solving session.',
        currentCode: dto.codeSnippet,
      });

      aiText = aiResponse;
    } catch {
      const fallback = this.generateCoachResponse(dto.message, dto.codeSnippet);
      aiText = fallback.text;
      aiSnippet = fallback.snippet;
    }

    return this.prisma.$transaction(async (tx) => {
      const userMsg = await tx.aICoachMessage.create({
        data: {
          userId,
          sender: 'user',
          text: dto.message,
          codeSnippet: dto.codeSnippet,
        },
      });

      const aiMsg = await tx.aICoachMessage.create({
        data: {
          userId,
          sender: 'ai',
          text: aiText,
          codeSnippet: aiSnippet,
        },
      });

      return {
        userMessage: userMsg,
        aiMessage: aiMsg,
      };
    });
  }

  async clearHistory(userId: string) {
    await this.prisma.aICoachMessage.deleteMany({
      where: { userId },
    });
    return { success: true, message: 'Chat history cleared' };
  }

  /**
   * Explain problem with trace examples (Target: <= 250 tokens)
   */
  async explainProblem(dto: ExplainProblemDto) {
    const explanation = await this.aiProvider.explainProblem({
      title: dto.title,
      statement: dto.statement,
      difficulty: dto.difficulty,
      tags: dto.tags,
    });
    return { success: true, data: { explanation } };
  }

  /**
   * Analyze target Time & Space complexity and operations bounds
   */
  async analyzeComplexity(dto: AnalyzeComplexityDto) {
    const analysis = await this.aiProvider.analyzeComplexity({
      title: dto.title,
      statement: dto.statement,
      difficulty: dto.difficulty,
      tags: dto.tags,
      currentCode: dto.currentCode,
      language: dto.language,
    });
    return { success: true, data: { analysis } };
  }

  /**
   * Interactive IDE Assistant conversational chat
   */
  async chatWithAssistant(dto: {
    message: string;
    title: string;
    statement: string;
    difficulty?: string;
    tags?: string[];
    currentCode?: string;
    language?: string;
  }) {
    const reply = await this.aiProvider.chatWithAssistant({
      message: dto.message,
      title: dto.title,
      statement: dto.statement,
      difficulty: dto.difficulty,
      tags: dto.tags,
      currentCode: dto.currentCode,
      language: dto.language,
    });
    return { success: true, data: { reply } };
  }

  /**
   * Socratic progressive hints (Level 1, 2, or 3)
   */
  async getProgressiveHint(dto: ProgressiveHintDto) {
    const hintData = await this.aiProvider.getProgressiveHint(
      {
        title: dto.title,
        statement: dto.statement,
        currentCode: dto.currentCode,
        language: dto.language,
      },
      dto.level,
    );
    return { success: true, data: hintData };
  }

  /**
   * Diagnose runtime error or failed test case
   */
  async diagnoseFailure(dto: DiagnoseFailureDto) {
    const diagnosis = await this.aiProvider.diagnoseFailure({
      title: dto.title,
      statement: '',
      currentCode: dto.currentCode,
      language: dto.language,
      verdict: dto.verdict,
      failedInput: dto.failedInput,
      expectedOutput: dto.expectedOutput,
      actualOutput: dto.actualOutput,
    });
    return { success: true, data: { diagnosis } };
  }

  /**
   * AI Problem Authoring: generate problem statement, sample cases, constraints, and test cases
   */
  async generateProblem(dto: GenerateProblemDto) {
    const result = await this.aiProvider.generateProblem({
      prompt: dto.prompt,
      title: dto.title,
      category: dto.category,
      difficulty: dto.difficulty,
      statement: dto.statement,
      taskType: dto.taskType,
    });
    return { success: true, data: result };
  }

  private generateCoachResponse(
    query: string,
    snippet?: string,
  ): { text: string; snippet?: string } {
    const lower = query.toLowerCase();

    if (lower.includes('tle') || lower.includes('time limit exceeded') || lower.includes('timeout')) {
      const codeNote = snippet
        ? `\n\n**Code Snippet Diagnosis**: Examining your supplied code snippet:\n\`\`\`\n${snippet.slice(0, 300)}\n\`\`\`\nCheck for nested unpruned recursion, $O(N^2)$ string/vector copies inside loops (pass by const ref \`const auto&\`), or missing memoization.`
        : '';

      return {
        text: `### General TLE (Time Limit Exceeded) Diagnostic Checklist\n\n1. **Complexity Mismatch**: Verify if $N \\le 10^5$. An $O(N^2)$ algorithm ($10^{10}$ ops) will TLE (standard budget: $\\approx 10^8$ ops/sec).\n2. **Pass-by-Value Copies**: Ensure collections passed into helper recursion use \`const vector<int>&\` instead of copies.\n3. **I/O Overhead**: In C++, include \`cin.tie(NULL); ios_base::sync_with_stdio(false);\`. In Java, use \`BufferedReader\` / \`StringTokenizer\`.\n4. **Infinite Loops / Redundant States**: Ensure recursion bases advance strictly towards termination.${codeNote}`,
      };
    }

    return {
      text: `Great question! To approach **${query.slice(0, 50)}...**:\n\n1. **Break down constraints**: Check input size $N$ to determine target complexity ($N \\le 10^5 \\implies O(N \\log N)$).\n2. **Identify Invariants**: Determine what property remains consistent at each iteration.\n3. **Edge Cases**: Empty structures, single elements, integer overflow (use 64-bit int / BigInt).\n\nFeel free to paste your code snippet or error stack for line-by-line debugging!`,
    };
  }
}
