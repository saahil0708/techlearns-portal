import { ProblemEntity } from '@/types/problem';

export const MOCK_PROBLEMS: ProblemEntity[] = [
  {
    id: 'prob-1',
    code: 'LC-001',
    slug: 'two-sum',
    title: 'Two Sum',
    category: 'Arrays & Two Pointers',
    difficulty: 'Easy',
    acceptanceRate: 51.4,
    totalSubmissions: 342150,
    acceptedSubmissions: 175865,
    testCasesCount: 55,
    authorName: 'Algorithmic Staff',
    tags: ['Array', 'Hash Table', 'Two Pointers'],
    status: 'Published',
    points: 100,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 12450,
    dislikes: 412,
    premium: false,
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    statementMarkdown: `### Description
Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.

---

### Constraints
- $2 \\le \\text{nums.length} \\le 10^4$
- $-10^9 \\le \\text{nums}[i] \\le 10^9$
- $-10^9 \\le \\text{target} \\le 10^9$
- **Only one valid answer exists.**
`,
    sampleTestCases: [
      {
        input: `4 9\n2 7 11 15`,
        output: `[0, 1]`,
        explanation: `Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1].`,
      },
      {
        input: `3 6\n3 2 4`,
        output: `[1, 2]`,
        explanation: `Because nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].`,
      },
      {
        input: `2 6\n3 3`,
        output: `[0, 1]`,
        explanation: `Because nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].`,
      },
    ],
  },
  {
    id: 'prob-2',
    code: 'LC-002',
    slug: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    category: 'Strings & Tries',
    difficulty: 'Medium',
    acceptanceRate: 34.8,
    totalSubmissions: 289410,
    acceptedSubmissions: 100714,
    testCasesCount: 48,
    authorName: 'Competitive Programming Cell',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    status: 'Published',
    points: 200,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 9840,
    dislikes: 310,
    premium: false,
    companies: ['Amazon', 'Bloomberg', 'Google', 'Adobe'],
    statementMarkdown: `### Description
Given a string \`s\`, find the length of the **longest substring** without repeating characters.

---

### Constraints
- $0 \\le s.\\text{length} \\le 5 \\times 10^4$
- \`s\` consists of English letters, digits, symbols and spaces.
`,
    sampleTestCases: [
      {
        input: `abcabcbb`,
        output: `3`,
        explanation: `The answer is "abc", with the length of 3.`,
      },
      {
        input: `bbbbb`,
        output: `1`,
        explanation: `The answer is "b", with the length of 1.`,
      },
      {
        input: `pwwkew`,
        output: `3`,
        explanation: `The answer is "wke", with the length of 3. Notice that "pwke" is a subsequence and not a substring.`,
      },
    ],
  },
  {
    id: 'prob-3',
    code: 'LC-003',
    slug: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    category: 'Arrays & Two Pointers',
    difficulty: 'Hard',
    acceptanceRate: 38.6,
    totalSubmissions: 198450,
    acceptedSubmissions: 76601,
    testCasesCount: 62,
    authorName: 'Grandmaster Coach',
    tags: ['Array', 'Binary Search', 'Divide and Conquer'],
    status: 'Published',
    points: 350,
    timeLimitMs: 1500,
    memoryLimitMb: 256,
    likes: 15400,
    dislikes: 920,
    premium: false,
    companies: ['Google', 'Microsoft', 'Goldman Sachs', 'Apple'],
    statementMarkdown: `### Description
Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.

The overall run time complexity should be $\\mathcal{O}(\\log(m+n))$.

---

### Constraints
- \`nums1.length == m\`, \`nums2.length == n\`
- $0 \\le m \\le 1000$, $0 \\le n \\le 1000$
- $1 \\le m + n \\le 2000$
- $-10^6 \\le \\text{nums1}[i], \\text{nums2}[i] \\le 10^6$
`,
    sampleTestCases: [
      {
        input: `2 1\n1 3\n2`,
        output: `2.00000`,
        explanation: `Merged array = [1,2,3] and median is 2.`,
      },
      {
        input: `2 2\n1 2\n3 4`,
        output: `2.50000`,
        explanation: `Merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.`,
      },
    ],
  },
  {
    id: 'prob-4',
    code: 'LC-004',
    slug: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    category: 'Dynamic Programming',
    difficulty: 'Hard',
    acceptanceRate: 61.2,
    totalSubmissions: 245100,
    acceptedSubmissions: 150001,
    testCasesCount: 70,
    authorName: 'Faculty Dean',
    tags: ['Array', 'Two Pointers', 'Dynamic Programming', 'Stack', 'Monotonic Stack'],
    status: 'Published',
    points: 350,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 18920,
    dislikes: 405,
    premium: false,
    companies: ['Amazon', 'Google', 'Meta', 'Uber', 'Microsoft'],
    statementMarkdown: `### Description
Given \`n\` non-negative integers representing an elevation map where the width of each bar is \`1\`, compute how much water it can trap after raining.

---

### Constraints
- $n == \\text{height.length}$
- $1 \\le n \\le 2 \\times 10^4$
- $0 \\le \\text{height}[i] \\le 10^5$
`,
    sampleTestCases: [
      {
        input: `12\n0 1 0 2 1 0 1 3 2 1 2 1`,
        output: `6`,
        explanation: `The elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.`,
      },
      {
        input: `6\n4 2 0 3 2 5`,
        output: `9`,
        explanation: `Traps 9 units of rain water.`,
      },
    ],
  },
  {
    id: 'prob-5',
    code: 'LC-005',
    slug: 'coin-change',
    title: 'Coin Change',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    acceptanceRate: 43.1,
    totalSubmissions: 312000,
    acceptedSubmissions: 134472,
    testCasesCount: 50,
    authorName: 'Competitive Programming Cell',
    tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
    status: 'Published',
    points: 200,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 11400,
    dislikes: 380,
    premium: false,
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Walmart'],
    statementMarkdown: `### Description
You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return *the fewest number of coins that you need to make up that amount*. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.

---

### Constraints
- $1 \\le \\text{coins.length} \\le 12$
- $1 \\le \\text{coins}[i] \\le 2^{31} - 1$
- $0 \\le \\text{amount} \\le 10^4$
`,
    sampleTestCases: [
      {
        input: `3 11\n1 2 5`,
        output: `3`,
        explanation: `11 = 5 + 5 + 1 (3 coins)`,
      },
      {
        input: `1 3\n2`,
        output: `-1`,
        explanation: `Amount 3 cannot be formed using only coins of 2.`,
      },
      {
        input: `1 0\n1`,
        output: `0`,
        explanation: `0 amount needs 0 coins.`,
      },
    ],
  },
  {
    id: 'prob-6',
    code: 'LC-006',
    slug: 'number-of-islands',
    title: 'Number of Islands',
    category: 'Graph Theory & BFS/DFS',
    difficulty: 'Medium',
    acceptanceRate: 58.7,
    totalSubmissions: 280400,
    acceptedSubmissions: 164594,
    testCasesCount: 52,
    authorName: 'Graph Specialist',
    tags: ['Array', 'Depth-First Search', 'Breadth-First Search', 'Union Find', 'Matrix'],
    status: 'Published',
    points: 200,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 14200,
    dislikes: 310,
    premium: false,
    companies: ['Amazon', 'Google', 'Meta', 'Oracle', 'Apple'],
    statementMarkdown: `### Description
Given an \`m x n\` 2D binary grid \`grid\` which represents a map of \`'1'\`s (land) and \`'0'\`s (water), return *the number of islands*.

An **island** is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.

---

### Constraints
- $m == \\text{grid.length}$
- $n == \\text{grid}[i].\\text{length}$
- $1 \\le m, n \\le 300$
- $\\text{grid}[i][j]$ is \`'0'\` or \`'1'\`.
`,
    sampleTestCases: [
      {
        input: `4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0`,
        output: `1`,
        explanation: `All 1s form a single connected component island.`,
      },
      {
        input: `4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1`,
        output: `3`,
        explanation: `There are 3 separate connected components.`,
      },
    ],
  },
  {
    id: 'prob-7',
    code: 'LC-007',
    slug: 'binary-tree-maximum-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    category: 'Trees & Binary Search Trees',
    difficulty: 'Hard',
    acceptanceRate: 39.9,
    totalSubmissions: 172000,
    acceptedSubmissions: 68628,
    testCasesCount: 60,
    authorName: 'Tree Architect',
    tags: ['Dynamic Programming', 'Tree', 'Depth-First Search', 'Binary Tree'],
    status: 'Published',
    points: 350,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 12800,
    dislikes: 610,
    premium: false,
    companies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'ByteDance'],
    statementMarkdown: `### Description
A **path** in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence **at most once**. Note that the path does not need to pass through the root.

The **path sum** of a path is the sum of the node's values in the path.

Given the \`root\` of a binary tree, return *the maximum **path sum** of any **non-empty** path*.

---

### Constraints
- The number of nodes in the tree is in the range $[1, 3 \\times 10^4]$.
- $-1000 \\le \\text{Node.val} \\le 1000$
`,
    sampleTestCases: [
      {
        input: `1 2 3`,
        output: `6`,
        explanation: `The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.`,
      },
      {
        input: `-10 9 20 null null 15 7`,
        output: `42`,
        explanation: `The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.`,
      },
    ],
  },
  {
    id: 'prob-8',
    code: 'LC-008',
    slug: 'valid-parentheses',
    title: 'Valid Parentheses',
    category: 'Strings & Tries',
    difficulty: 'Easy',
    acceptanceRate: 40.5,
    totalSubmissions: 412000,
    acceptedSubmissions: 166860,
    testCasesCount: 40,
    authorName: 'Algorithmic Staff',
    tags: ['String', 'Stack'],
    status: 'Published',
    points: 100,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    likes: 16500,
    dislikes: 420,
    premium: false,
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'LinkedIn'],
    statementMarkdown: `### Description
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

---

### Constraints
- $1 \\le s.\\text{length} \\le 10^4$
- \`s\` consists of parentheses only \`'()[]{}'\`.
`,
    sampleTestCases: [
      {
        input: `()`,
        output: `true`,
        explanation: `Matched opening and closing parenthesis.`,
      },
      {
        input: `()[]{}`,
        output: `true`,
        explanation: `All types closed in correct order.`,
      },
      {
        input: `(]`,
        output: `false`,
        explanation: `Mismatched bracket types.`,
      },
    ],
  },
];

export function getProblemBySlug(slug: string): ProblemEntity | undefined {
  return MOCK_PROBLEMS.find((p) => p.slug === slug || p.code.toLowerCase() === slug.toLowerCase() || p.id === slug);
}
