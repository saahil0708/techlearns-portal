export interface BlogAuthor {
  name: string;
  avatarBg: string;
  avatarImg?: string;
  role: string;
  college: string;
  handle: string;
  isVerified?: boolean;
}

export interface BlogComment {
  id: string;
  author: string;
  avatarBg: string;
  time: string;
  text: string;
}

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  publishedAt: string;
  coverImage: string;
  author: BlogAuthor;
  tags: string[];
  claps: number;
  commentsCount: number;
  views: number;
  isBookmarked?: boolean;
  hasLiked?: boolean;
  status?: 'Published' | 'Draft' | 'Archived';
  content: string;
  comments?: BlogComment[];
}

export const BLOG_CATEGORIES = [
  'All Stories',
  'System Architecture',
  'DSA & Algorithms',
  'AI & Machine Learning',
  'Frontend & React',
  'Backend & DevOps',
  'Interview Experiences',
  'Cloud & Distributed',
] as const;

export function formatBlogDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Designing a Real-Time Distributed Leaderboard with Redis Sorted Sets & BullMQ',
    subtitle: 'A deep-dive architectural post-mortem on handling 500k concurrent score updates with sub-10ms p99 latency without database row contention.',
    category: 'System Architecture',
    readTime: '7 min read',
    publishedAt: '2026-09-15T16:30:00.000Z',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Aarav Sharma',
      avatarBg: '#2563EB',
      avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Final Year CSE',
      college: 'IIT Bombay',
      handle: '@aarav_arch',
      isVerified: true,
    },
    tags: ['Redis', 'DistributedSystems', 'BullMQ', 'SystemDesign'],
    claps: 248,
    commentsCount: 34,
    views: 1820,
    isBookmarked: true,
    hasLiked: false,
    content: `## The Problem: High-Frequency Score Ingestion

In competitive programming contests and gaming platforms, leaderboards experience massive bursts of write traffic whenever a challenge concludes. Direct relational database updates (\`UPDATE user_scores SET score = score + 100\`) quickly lead to row lock contention, deadlocks, and connection pool exhaustion.

### Architecture Overview

To solve this, we decoupled the ingestion pipeline from permanent storage:

\`\`\`
[ HTTP Clients / Submissions ]
             │
             ▼
      [ Fastify / NestJS ]
             │
   (Push Job to BullMQ Queue)
             │
             ▼
    [ Redis ZSET Cluster ] ◄── ZADD contest:101:ranks score userId
             │
    (Async Worker Persistence Batch)
             │
             ▼
     [ PostgreSQL Database ]
\`\`\`

### Key Benchmarks & Takeaways
- **p99 Latency**: Dropped from 420ms to 4.2ms.
- **Throughput**: 48,000 ranking evaluations per second per Redis shard.
- **Zero Data Loss**: Append-Only File (AOF) with \`everysec\` fsync policy ensured safety.`,
  },
  {
    id: 'blog-2',
    title: 'Mastering Dynamic Programming on Trees: Rerooting Techniques & Subtree Aggregations',
    subtitle: 'From standard subtree DFS to O(N) all-node DP calculations with detailed mathematical transitions and CP templates.',
    category: 'DSA & Algorithms',
    readTime: '12 min read',
    publishedAt: '2026-09-13T10:00:00.000Z',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Priya Iyer',
      avatarBg: '#7C3AED',
      avatarImg: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
      role: 'Grandmaster (2420)',
      college: 'BITS Pilani',
      handle: '@priya_cp',
      isVerified: true,
    },
    tags: ['Algorithms', 'DP', 'Trees', 'CompetitiveProgramming'],
    claps: 412,
    commentsCount: 56,
    views: 3150,
    isBookmarked: false,
    hasLiked: true,
    content: `## What is Tree Rerooting DP?

When solving tree problems where we need the answer for *every* node if that node were the root, a naive approach runs an $O(N)$ DFS from each node, taking $O(N^2)$ overall.

### The Two-Pass Paradigm

By calculating subtree results in pass 1 and pushing "parent-contribution" results down in pass 2, we achieve optimal $O(N)$ runtime.`,
  },
  {
    id: 'blog-3',
    title: 'Building a Low-Latency Remote Code Execution Engine inside Secure Docker Sandboxes',
    subtitle: 'How we isolated untrusted student C++, Java, and Python code executions using Linux cgroups v2, seccomp-bpf, and ephemeral Alpine micro-containers.',
    category: 'Backend & DevOps',
    readTime: '9 min read',
    publishedAt: '2026-05-12T14:00:00.000Z',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Rohan Deshmukh',
      avatarBg: '#059669',
      avatarImg: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      role: 'Platform Architect',
      college: 'IIIT Hyderabad',
      handle: '@rohan_kernel',
      isVerified: true,
    },
    tags: ['Docker', 'Linux', 'Security', 'cgroups', 'Compilers'],
    claps: 389,
    commentsCount: 42,
    views: 2640,
    isBookmarked: true,
    hasLiked: false,
    content: `## Threat Model for Untrusted Code

A malicious user submission might attempt fork bombs (\`:(){ :|:& };:\`), socket connects to metadata servers, filesystem tampering, or CPU hogging.

### Multi-Layered Defense
1. **Seccomp Filters**: Whitelisting only safe syscalls (\`read\`, \`write\`, \`mmap\`).
2. **cgroups v2**: Hard memory ceilings (256 MB) and exact CPU quotas (1.0 core).
3. **OverlayFS Reset**: Ephemeral container destroyed within 20ms of execution.`,
  },
  {
    id: 'blog-4',
    title: 'How I Cracked Google L4 Software Engineering Interview: Complete Preparation Blueprint',
    subtitle: 'System design strategies, behavioral framing with the STAR method, and 450+ curated LeetCode/Codeforces problems broken down.',
    category: 'Interview Experiences',
    readTime: '15 min read',
    publishedAt: '2026-05-08T09:00:00.000Z',
    status: 'Published',
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Ananya Verma',
      avatarBg: '#DC2626',
      avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: 'Incoming SDE II @ Google',
      college: 'DTU Delhi',
      handle: '@ananya_v',
      isVerified: true,
    },
    tags: ['Google', 'Interviews', 'FAANG', 'SystemDesign', 'Career'],
    claps: 680,
    commentsCount: 112,
    views: 6420,
    isBookmarked: true,
    hasLiked: true,
    content: `## My 6-Month Timeline

Consistent practice beats cramming. Here is the exact week-by-week curriculum I followed while balancing final-year semester coursework.`,
  },
];
