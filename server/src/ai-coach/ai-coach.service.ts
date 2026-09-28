import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SendCoachMessageDto } from './dto/send-coach-message.dto.js';

@Injectable()
export class AICoachService {
  constructor(private readonly prisma: PrismaService) {}

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
          text: 'Hello! I am your AI Learning Coach. I analyzed your recent problem submissions and learning track. What technical concept, algorithmic problem, or architectural pattern would you like to drill today?',
        },
      });
      return [welcome];
    }

    return messages.reverse();
  }

  async sendMessage(userId: string, dto: SendCoachMessageDto) {
    const aiResponseText = this.generateCoachResponse(dto.message, dto.codeSnippet);

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
          text: aiResponseText.text,
          codeSnippet: aiResponseText.snippet,
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
        text: `### General TLE (Time Limit Exceeded) Diagnostic Checklist

1. **Complexity Mismatch**: Verify if $N \\le 10^5$. An $O(N^2)$ algorithm ($10^{10}$ ops) will TLE (standard budget: $\\approx 10^8$ ops/sec).
2. **Pass-by-Value Copies**: Ensure collections passed into helper recursion use \`const vector<int>&\` instead of copies.
3. **I/O Overhead**: In C++, include \`cin.tie(NULL); ios_base::sync_with_stdio(false);\`. In Java, use \`BufferedReader\` / \`StringTokenizer\`.
4. **Infinite Loops / Redundant States**: Ensure recursion bases advance strictly towards termination.${codeNote}`,
      };
    }

    const isLcsSpecific =
      lower.includes('longest common subsequence') ||
      lower.includes('lcs') ||
      (lower.includes('subsequence') && lower.includes('dp'));

    if (isLcsSpecific) {
      return {
        text: `Here is the root cause and optimization for Longest Common Subsequence (LCS):

1. **State Redundancy**: A recursive 2^N branch without memoization recalculates overlapping subproblems.
2. **Space Optimization**: The standard DP table is $O(M \\times N)$. However, computing row $i$ only requires row $i-1$, allowing state reduction to $O(\\min(M, N))$ space.
3. **Branch Pruning**: Check string character matches first before taking $\\max(dp[i-1][j], dp[i][j-1])$.`,
        snippet: `// Optimal Space-Optimized LCS in C++ (O(M*N) time, O(N) space)
int longestCommonSubsequence(string s1, string s2) {
    int m = s1.size(), n = s2.size();
    vector<int> prev(n + 1, 0), curr(n + 1, 0);
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (s1[i - 1] == s2[j - 1]) curr[j] = 1 + prev[j - 1];
            else curr[j] = max(prev[j], curr[j - 1]);
        }
        prev = curr;
    }
    return prev[n];
}`,
      };
    }

    if (lower.includes('dijkstra') || lower.includes('a*') || lower.includes('graph')) {
      return {
        text: `### Dijkstra vs A* Search Comparison

- **Dijkstra's Algorithm**: Explores paths uniformly in all directions ($f(n) = g(n)$ where $g(n)$ is actual cost from start). Guarantees shortest path on non-negative weighted graphs in $O((V + E) \\log V)$.
- **A\\* Search**: Guided exploration using admissible heuristic ($f(n) = g(n) + h(n)$). Cuts search space drastically when $h(n) \\le h^*(n)$ (Manhattan or Euclidean distance in grid maps).

**Key Takeaway**: Use Dijkstra for multi-target or unknown geometry; use A* for coordinate/grid pathfinding with known target.`,
      };
    }

    if (lower.includes('raft') || lower.includes('consensus') || lower.includes('distributed')) {
      return {
        text: `### Raft Consensus: The Analogy

Imagine a classroom electing a class representative:
1. **Heartbeats**: The current Leader rings a bell every 150ms.
2. **Election Timeout**: If students (Followers) don't hear the bell for a random time (150-300ms), one becomes a Candidate and requests votes.
3. **Quorum**: If the Candidate gets votes from $> 50\\%$ of peers, they become the new Leader.
4. **Log Replication**: Every instruction must be written down by a quorum before the Leader executes it.`,
        snippet: `// Raft AppendEntries RPC State Transition
type AppendEntriesArgs struct {
    Term         int        // leader's term
    LeaderId     string     // leader UUID
    PrevLogIndex int        // index of log entry immediately preceding new ones
    PrevLogTerm  int        // term of prevLogIndex entry
    Entries      []LogEntry // log entries to store (empty for heartbeat)
    LeaderCommit int        // leader's commitIndex
}`,
      };
    }

    if (lower.includes('google') || lower.includes('interview') || lower.includes('revision plan')) {
      return {
        text: `### 3-Day Targeted SDE Assessment Revision Plan

- **Day 1 (Graphs & Trees)**: Monotonic Queues, Segment Trees, Topological Sorting (Kahn's Algorithm), LCA with Binary Lifting.
- **Day 2 (Dynamic Programming)**: Knapsack variations, DP on Trees (Rerooting), Bitmask DP ($N \\le 16$).
- **Day 3 (Concurrency & System Design)**: Rate Limiters (Token Bucket vs Leaky Bucket), Cache consistency (Write-Through vs Cache-Aside), Idempotency keys.`,
      };
    }

    if (snippet) {
      return {
        text: `I analyzed your question regarding **${query.slice(0, 50)}...** along with the supplied code snippet.

### Review of Provided Snippet:
\`\`\`
${snippet.slice(0, 400)}
\`\`\`

1. **Invariant Verification**: Ensure state transformations preserve problem invariants.
2. **Edge Cases**: Verify behavior for empty inputs, boundary ranges, and overflow.
3. **Algorithmic Complexity**: Ensure loop/recursion depth matches target bounds.`,
      };
    }

    return {
      text: `Great question! To approach **${query.slice(0, 50)}...**:

1. **Break down constraints**: Check input size $N$ to determine target complexity ($N \\le 10^5 \\implies O(N \\log N)$).
2. **Identify Invariants**: Determine what property remains consistent at each iteration (e.g. prefix sums, monotonic ordering).
3. **Edge Cases**: Empty structures, single elements, integer overflow (use 64-bit int / BigInt).

Feel free to paste your code snippet or error stack for line-by-line debugging!`,
    };
  }
}
