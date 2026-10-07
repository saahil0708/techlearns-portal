import React from 'react';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

export interface CareerTrack {
  id: string;
  title: string;
  subtitle: string;
  targetRole?: string;
  badge: string;
  duration: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgGradient: string;
  bgGradientSelected: string;
  borderLight: string;
  benchmarkScore: number;
  popularRoles: string[];
}

export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'fullstack',
    title: 'Full-Stack Web Architect',
    subtitle: 'Next.js 15, React 19, NestJS, TypeScript, PostgreSQL, and Cloud Deployments',
    targetRole: 'Full-Stack Software Engineer',
    badge: '🔥 Most In-Demand',
    duration: '10–12 Wks',
    icon: <CodeRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#2563EB',
    bgLight: '#EFF6FF',
    bgGradient: 'linear-gradient(155deg, #F0F7FF 0%, #FFFFFF 55%, #F4F9FF 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #EFF6FF 0%, #E0EEFE 40%, #FFFFFF 100%)',
    borderLight: '#BFDBFE',
    benchmarkScore: 82,
    popularRoles: ['Frontend Engineer', 'Fullstack Developer', 'UI/UX Technologist'],
  },
  {
    id: 'backend',
    title: 'Backend & Distributed Systems',
    subtitle: 'Microservices, BullMQ, Redis Caching, High Concurrency, and Distributed Locks',
    targetRole: 'Backend Engineer',
    badge: '⚡ High Concurrency',
    duration: '10–12 Wks',
    icon: <StorageRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#7C3AED',
    bgLight: '#F5F3FF',
    bgGradient: 'linear-gradient(155deg, #FAF5FF 0%, #FFFFFF 55%, #F7F3FE 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #F5F3FF 0%, #EDE9FE 40%, #FFFFFF 100%)',
    borderLight: '#DDD6FE',
    benchmarkScore: 86,
    popularRoles: ['Backend Engineer', 'Distributed Systems Architect', 'API Specialist'],
  },
  {
    id: 'dsa',
    title: 'Algorithmic & Problem Solving (DSA)',
    subtitle: 'Dynamic Programming, Graph Theory, Segment Trees, and Contest Ranks',
    targetRole: 'Software Development Engineer (SDE-1)',
    badge: '🏆 Top Tech / FAANG',
    duration: '8–10 Wks',
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#D97706',
    bgLight: '#FFFBEB',
    bgGradient: 'linear-gradient(155deg, #FFFDF5 0%, #FFFFFF 55%, #FEF9EB 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #FFFBEB 0%, #FEF3C7 40%, #FFFFFF 100%)',
    borderLight: '#FDE68A',
    benchmarkScore: 90,
    popularRoles: ['Software Engineer (SDE-1)', 'Competitive Coder', 'Quant Dev'],
  },
  {
    id: 'cloud_devops',
    title: 'Cloud DevOps & Platform Engineering',
    subtitle: 'Docker, Kubernetes, CI/CD Pipelines, Infrastructure as Code, and Observability',
    targetRole: 'DevOps & Platform Engineer',
    badge: '☁️ Cloud Architecture',
    duration: '8–10 Wks',
    icon: <CloudQueueRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#059669',
    bgLight: '#ECFDF5',
    bgGradient: 'linear-gradient(155deg, #F0FDF8 0%, #FFFFFF 55%, #F2FBF6 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #ECFDF5 0%, #D1FAE5 40%, #FFFFFF 100%)',
    borderLight: '#A7F3D0',
    benchmarkScore: 78,
    popularRoles: ['DevOps Engineer', 'Site Reliability Engineer (SRE)', 'Cloud Architect'],
  },
  {
    id: 'ai_ml',
    title: 'AI, ML & Intelligent Systems',
    subtitle: 'Python, Neural Networks, LLM Embeddings, Vector Databases, and PyTorch',
    targetRole: 'AI & Machine Learning Engineer',
    badge: '🤖 Top Trending',
    duration: '12–14 Wks',
    icon: <SmartToyRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#DB2777',
    bgLight: '#FDF2F8',
    bgGradient: 'linear-gradient(155deg, #FDF4F8 0%, #FFFFFF 55%, #FAF1F6 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #FDF2F8 0%, #FCE7F3 40%, #FFFFFF 100%)',
    borderLight: '#FBCFE8',
    benchmarkScore: 84,
    popularRoles: ['ML Engineer', 'AI Application Developer', 'Data Scientist'],
  },
  {
    id: 'security',
    title: 'Cybersecurity & Systems Defense',
    subtitle: 'Network Security, Threat Intelligence, Cryptography, and Zero Trust Architecture',
    targetRole: 'Cybersecurity Engineer',
    badge: '🛡️ Critical Security',
    duration: '10–12 Wks',
    icon: <SecurityRoundedIcon sx={{ fontSize: 24 }} />,
    color: '#DC2626',
    bgLight: '#FEF2F2',
    bgGradient: 'linear-gradient(155deg, #FEF5F5 0%, #FFFFFF 55%, #FAF2F2 100%)',
    bgGradientSelected: 'linear-gradient(155deg, #FEF2F2 0%, #FEE2E2 40%, #FFFFFF 100%)',
    borderLight: '#FECACA',
    benchmarkScore: 80,
    popularRoles: ['Security Analyst', 'AppSec Engineer', 'Penetration Tester'],
  },
];

export interface DiagnosticQuestion {
  id: string;
  trackId: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  options: { key: string; label: string }[];
  correctKey: string;
  explanation: string;
}

export const TRACK_QUESTIONS: Record<string, DiagnosticQuestion[]> = {
  fullstack: [
    {
      id: 'fs_1',
      trackId: 'fullstack',
      question: 'In React 19 / Next.js App Router, which statement regarding React Server Components (RSC) is TRUE?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'RSCs execute on both server and client bundle simultaneously.' },
        { key: 'B', label: 'RSCs never ship component code or JavaScript dependencies to the client bundle.' },
        { key: 'C', label: 'RSCs require useState and useEffect for data synchronization.' },
        { key: 'D', label: 'RSCs cannot fetch data directly from databases via Prisma.' },
      ],
      correctKey: 'B',
      explanation: 'RSCs render purely on the server and stream HTML/JSON payloads, keeping bundle size at 0KB on client.',
    },
    {
      id: 'fs_2',
      trackId: 'fullstack',
      question: 'When implementing optimistic updates with TanStack Query or SWR, what is the key safety mechanism?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Block all user clicks until the server sends a 200 OK status.' },
        { key: 'B', label: 'Save the previous cache snapshot in onMutate and roll back in onError if the mutation fails.' },
        { key: 'C', label: 'Reload the entire webpage whenever an error occurs.' },
        { key: 'D', label: 'Disable client-side cache completely.' },
      ],
      correctKey: 'B',
      explanation: 'Snapshotting previous cache allows graceful rollback on unexpected HTTP 4xx/5xx responses.',
    },
    {
      id: 'fs_3',
      trackId: 'fullstack',
      question: 'Which HTTP header prevents MIME type sniffing security vulnerabilities on modern web platforms?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'X-Content-Type-Options: nosniff' },
        { key: 'B', label: 'Access-Control-Allow-Origin: *' },
        { key: 'C', label: 'Cache-Control: no-cache' },
        { key: 'D', label: 'X-Frame-Options: SAMEORIGIN' },
      ],
      correctKey: 'A',
      explanation: 'X-Content-Type-Options: nosniff blocks the browser from trying to guess MIME types.',
    },
  ],
  backend: [
    {
      id: 'be_1',
      trackId: 'backend',
      question: 'Why is Redis preferred over in-memory JavaScript variables for distributed rate limiting in NestJS clusters?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'Redis has faster math operators than V8 engine.' },
        { key: 'B', label: 'Redis provides centralized atomic operations (INCR/EXPIRE) shared across all horizontal instances.' },
        { key: 'C', label: 'In-memory variables cannot store numbers.' },
        { key: 'D', label: 'Redis encrypts all network requests by default.' },
      ],
      correctKey: 'B',
      explanation: 'Centralized state with atomic operations guarantees rate limits apply accurately across multi-node clusters.',
    },
    {
      id: 'be_2',
      trackId: 'backend',
      question: 'In PostgreSQL MVCC database transactions, which concurrency phenomena does the "REPEATABLE READ" isolation level prevent?',
      difficulty: 'Hard',
      options: [
        { key: 'A', label: 'Dirty reads, Non-repeatable reads, and Phantom reads' },
        { key: 'B', label: 'Serialization anomalies and serialization failures only' },
        { key: 'C', label: 'Deadlocks and lock timeouts' },
        { key: 'D', label: 'Storage corruption and write failures' },
      ],
      correctKey: 'A',
      explanation: 'In PostgreSQL, REPEATABLE READ uses snapshot isolation (MVCC), which prevents Dirty Reads, Non-Repeatable Reads, and Phantom Reads.',
    },
    {
      id: 'be_3',
      trackId: 'backend',
      question: 'What is the primary benefit of the Circuit Breaker pattern in microservice architectures?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'It speeds up database indexing automatically.' },
        { key: 'B', label: 'It stops cascading service failures by failing fast when a downstream dependency is unhealthy.' },
        { key: 'C', label: 'It reduces memory leaks in Node.js processes.' },
        { key: 'D', label: 'It compresses HTTP response payloads.' },
      ],
      correctKey: 'B',
      explanation: 'Failing fast prevents resource exhaustion (threads/sockets) when downstream services crash.',
    },
  ],
  dsa: [
    {
      id: 'dsa_1',
      trackId: 'dsa',
      question: 'What is the worst-case time complexity of searching an element in a balanced AVL tree with N nodes?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'O(1)' },
        { key: 'B', label: 'O(log N)' },
        { key: 'C', label: 'O(N)' },
        { key: 'D', label: 'O(N log N)' },
      ],
      correctKey: 'B',
      explanation: 'AVL trees strictly maintain balance factor |hL - hR| <= 1, guaranteeing O(log N) height.',
    },
    {
      id: 'dsa_2',
      trackId: 'dsa',
      question: 'Which algorithm finds Single-Source Shortest Paths in graphs with negative edge weights (no negative cycles)?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: "Dijkstra's Algorithm" },
        { key: 'B', label: 'Bellman-Ford Algorithm' },
        { key: 'C', label: "Prim's Algorithm" },
        { key: 'D', label: "Kruskal's Algorithm" },
      ],
      correctKey: 'B',
      explanation: 'Bellman-Ford relaxes all edges |V| - 1 times, handling negative weights and detecting negative cycles.',
    },
    {
      id: 'dsa_3',
      trackId: 'dsa',
      question: 'In Disjoint Set Union (DSU), what is the amortized time complexity per operation with Path Compression & Union by Rank?',
      difficulty: 'Hard',
      options: [
        { key: 'A', label: 'O(α(N)) - Inverse Ackermann Function' },
        { key: 'B', label: 'O(log N)' },
        { key: 'C', label: 'O(1) strict' },
        { key: 'D', label: 'O(sqrt(N))' },
      ],
      correctKey: 'A',
      explanation: 'Combining path compression with union by rank achieves near-constant inverse Ackermann complexity.',
    },
  ],
  cloud_devops: [
    {
      id: 'cd_1',
      trackId: 'cloud_devops',
      question: 'What is the purpose of multi-stage Docker builds?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'To run multiple operating systems in one container.' },
        { key: 'B', label: 'To separate build dependencies from the final lightweight production runtime image.' },
        { key: 'C', label: 'To increase container startup time.' },
        { key: 'D', label: 'To automatically deploy to AWS ECS.' },
      ],
      correctKey: 'B',
      explanation: 'Multi-stage builds leave compiler tools in intermediate stages, keeping the final image lean & secure.',
    },
    {
      id: 'cd_2',
      trackId: 'cloud_devops',
      question: 'In Kubernetes, which object ensures exactly one copy of a Pod runs on every matching Node in the cluster?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Deployment' },
        { key: 'B', label: 'DaemonSet' },
        { key: 'C', label: 'StatefulSet' },
        { key: 'D', label: 'Job' },
      ],
      correctKey: 'B',
      explanation: 'DaemonSets ensure that all (or some) nodes run a copy of a pod (ideal for logging/metrics agents).',
    },
    {
      id: 'cd_3',
      trackId: 'cloud_devops',
      question: 'What does Canary Deployment strategy entail?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Replacing 100% of servers at midnight.' },
        { key: 'B', label: 'Routing a small percentage of live traffic to the new version to test reliability before full rollout.' },
        { key: 'C', label: 'Running tests only in staging environments.' },
        { key: 'D', label: 'Rolling back whenever CPU usage hits 50%.' },
      ],
      correctKey: 'B',
      explanation: 'Canary testing verifies real user traffic on a minor subset before widening deployment.',
    },
  ],
  ai_ml: [
    {
      id: 'ai_1',
      trackId: 'ai_ml',
      question: 'What is the primary role of the Self-Attention mechanism in Transformer architectures?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'To reduce image resolution for convolutional layers.' },
        { key: 'B', label: 'To compute dynamic contextual relationships between all tokens in a sequence regardless of distance.' },
        { key: 'C', label: 'To compress vector weights to 8-bit integers.' },
        { key: 'D', label: 'To eliminate the need for training data.' },
      ],
      correctKey: 'B',
      explanation: 'Self-attention calculates pairwise token interactions, capturing long-range contextual semantic dependencies.',
    },
    {
      id: 'ai_2',
      trackId: 'ai_ml',
      question: 'Which vector search metric is most commonly used to measure semantic similarity between normalized text embeddings?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'Cosine Similarity' },
        { key: 'B', label: 'Manhattan Distance' },
        { key: 'C', label: 'Hamming Distance' },
        { key: 'D', label: 'Jaccard Index' },
      ],
      correctKey: 'A',
      explanation: 'Cosine similarity measures the angle between vectors, ideal for high-dimensional semantic spaces.',
    },
    {
      id: 'ai_3',
      trackId: 'ai_ml',
      question: 'What problem does Retrieval-Augmented Generation (RAG) primarily solve for Large Language Models?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'Reduces model hallucinations by injecting factual, domain-specific context from external documents.' },
        { key: 'B', label: 'Increases model inference latency.' },
        { key: 'C', label: 'Replaces the neural network weights entirely.' },
        { key: 'D', label: 'Allows training without GPUs.' },
      ],
      correctKey: 'A',
      explanation: 'RAG grounds LLM generation in verified, real-time knowledge bases without expensive retraining.',
    },
  ],
  security: [
    {
      id: 'sec_1',
      trackId: 'security',
      question: 'How does Cross-Site Request Forgery (CSRF) token validation protect web applications?',
      difficulty: 'Medium',
      options: [
        { key: 'A', label: 'It encrypts database passwords.' },
        { key: 'B', label: 'It verifies that state-changing requests originate from the legitimate user session via a secret token.' },
        { key: 'C', label: 'It prevents SQL injection vulnerabilities.' },
        { key: 'D', label: 'It forces users to change passwords every 30 days.' },
      ],
      correctKey: 'B',
      explanation: 'CSRF tokens are unpredictable server-generated secrets tied to the user session, preventing forged submissions.',
    },
    {
      id: 'sec_2',
      trackId: 'security',
      question: 'Which cryptographic algorithm is currently standard for generating asymmetric key pairs for HTTPS/TLS certificates?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'RSA 2048/4096 and ECDSA (e.g. NIST P-256)' },
        { key: 'B', label: 'MD5 Hash' },
        { key: 'C', label: 'DES 56-bit' },
        { key: 'D', label: 'Base64 Encoding' },
      ],
      correctKey: 'A',
      explanation: 'RSA and Elliptic Curve Cryptography (ECDSA) form the cryptographic bedrock of TLS 1.3 encryption.',
    },
    {
      id: 'sec_3',
      trackId: 'security',
      question: 'What does the Principle of Least Privilege (PoLP) dictate in software architecture?',
      difficulty: 'Easy',
      options: [
        { key: 'A', label: 'Every user should have administrative root access.' },
        { key: 'B', label: 'Entities are granted only the minimum permissions necessary to perform their required job function.' },
        { key: 'C', label: 'All servers should be on the public internet.' },
        { key: 'D', label: 'Passwords should be stored in plain text.' },
      ],
      correctKey: 'B',
      explanation: 'PoLP minimizes potential damage from compromised accounts or software vulnerabilities.',
    },
  ],
};

export interface IdentityDiagnosticWizardProps {
  open?: boolean;
  onClose?: () => void;
  onComplete?: (result?: any) => void;
  userId?: string;
  isModal?: boolean;
  initialTrack?: string;
}

export const STEP_ITEMS = [
  { step: 1, label: 'Career Track', desc: 'Aspirations & Domain' },
  { step: 2, label: 'Skill Assessment', desc: 'Confidence Rating' },
  { step: 3, label: 'Calibration Quiz', desc: 'Rapid Benchmark' },
  { step: 4, label: 'Curated Roadmap', desc: 'Courses & Goals' },
];
