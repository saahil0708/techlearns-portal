import type { CourseDirectoryEntity } from '@/types/course';
import { apiService } from '@/lib/api-service';

export const ALL_COURSES: CourseDirectoryEntity[] = [
  {
    id: 'crs-001',
    code: 'DSA-201',
    slug: 'data-structures-and-algorithms-mastery',
    title: 'Data Structures & Algorithms Mastery',
    category: 'Computer Science & DSA',
    level: 'Intermediate',
    instructorName: 'Prof. Thomas Cormen',
    instructorTitle: 'Professor of Computer Science',
    institutionName: 'Massachusetts Inst of Technology (MIT)',
    durationHours: 48,
    modulesCount: 12,
    lessonsCount: 64,
    enrolledStudents: 3420,
    completionRate: 78,
    status: 'Published',
    tags: ['Data Structures', 'Algorithms', 'Trees', 'Graphs', 'Dynamic Programming'],
    description: 'Master foundational and advanced data structures, graph traversals, amortized complexity, and dynamic programming with hands-on coding tests.',
    accentColor: '#0B1F3A',
    moduleHighlights: [
      { title: 'Array, Linked Lists & Hashing Internals', lessons: 8 },
      { title: 'Binary Trees, AVL & Segment Trees', lessons: 14 },
      { title: 'Graph Algorithms & Shortest Path (Dijkstra, Bellman-Ford)', lessons: 16 },
      { title: 'Dynamic Programming & Memoization Patterns', lessons: 18 },
      { title: 'Capstone: Algorithmic Contest Challenge', lessons: 8 },
    ],
    whatYouWillLearn: [
      {
        title: 'Asymptotic Analysis & Memory Footprints',
        description: 'Analyze Big-O time and auxiliary space bounds for iterative and recursive algorithmic implementations.',
      },
      {
        title: 'Core & Non-Linear Data Structures',
        description: 'Master arrays, doubly linked lists, hash collision resolutions, heaps, binary search trees, and AVL rotations.',
      },
      {
        title: 'Graph Traversal & Shortest Path Protocols',
        description: 'Implement BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, and topological sorting on DAG structures.',
      },
      {
        title: 'Dynamic Programming Optimization Paradigms',
        description: 'Formulate state transitions, memoization tables, bitmask DP, and space-optimized bottom-up DP solutions.',
      },
      {
        title: 'Advanced Range Queries & Segment Trees',
        description: 'Build segment trees with lazy propagation and Fenwick binary indexed trees for range updates in O(log N).',
      },
      {
        title: 'Technical Interview Coding Strategies',
        description: 'Confidently tackle LeetCode Hard and Codeforces Div-2 problems with optimal test case coverage and fast I/O.',
      },
    ],
    prerequisites: [
      'Basic programming fluency in C++, Java, or Python',
      'Understanding of loops, conditional branching, and basic recursion',
      'Fundamental algebra and discrete mathematics concepts',
    ],
    targetRoles: [
      'Software Development Engineer (SDE I / SDE II)',
      'Competitive Programming ICPC Contestant',
      'Algorithms & Core Infrastructure Engineer',
    ],
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Foundations & Linear Structures',
        badgeTagline: 'Build foundational knowledge • 2 courses • 4 weeks to complete',
        summary: 'Start the journey with mastering linear memory models, pointer arithmetic, fast I/O, and amortized complexity analysis.',
        estimatedWeeks: 4,
        modules: [
          {
            id: 'mod-101',
            title: 'Linear Data Structures & Amortized Arrays',
            subtitle: 'Learn Course • 142 Problems',
            problemsCount: 142,
            topics: [
              'Memory layouts of static vs dynamic arrays',
              'Two-pointer techniques and Sliding Window patterns',
              'Singly & Doubly Linked List node manipulation',
              'Fast and slow pointer cycle detection (Floyd’s algorithm)',
              'Stack-based Monotonic Queue patterns',
              'Circular Queues and Deque implementations',
              'Hash Table collision resolution (Chaining vs Open Addressing)',
              'Prefix Sums and Difference Arrays for constant time range updates',
              'Bitwise manipulation fundamentals and bitmask states',
              'Getting started with online judge evaluation benchmarks',
            ],
            status: 'Completed',
          },
          {
            id: 'mod-102',
            title: 'Recursion, Divide & Conquer and Sorting',
            subtitle: 'Learn Course • 98 Problems',
            problemsCount: 98,
            topics: [
              'Call stack memory mechanics and recursion tree analysis',
              'Merge Sort and Quick Sort with randomized pivot selection',
              'Binary Search on Answer search spaces',
              'Matrix exponentiation for fast recurrence solutions',
            ],
            status: 'In Progress',
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Hierarchical Trees & Graph Traversal',
        badgeTagline: 'Deepen problem-solving intuition • 2 courses • 5 weeks to complete',
        summary: 'Tackle non-linear topologies, tree balancing invariants, graph search algorithms, and disjoint set union.',
        estimatedWeeks: 5,
        modules: [
          {
            id: 'mod-201',
            title: 'Binary Trees, BSTs & Heap Queues',
            subtitle: 'Learn Course • 175 Problems',
            problemsCount: 175,
            topics: [
              'Preorder, Inorder, Postorder & Level-Order BFS Traversals',
              'Lowest Common Ancestor (LCA) using Binary Lifting',
              'Self-Balancing AVL Trees and Red-Black tree properties',
              'Binary Heap internals and PriorityQueue scheduling',
              'Trie (Prefix Tree) construction for string searching',
            ],
            status: 'Not Started',
          },
          {
            id: 'mod-202',
            title: 'Graph Traversal & Shortest Paths',
            subtitle: 'Learn Course • 160 Problems',
            problemsCount: 160,
            topics: [
              'Adjacency List vs Adjacency Matrix representations',
              'Breadth-First Search (BFS) & Depth-First Search (DFS)',
              'Topological Sorting & Kahn’s Algorithm for DAGs',
              'Disjoint Set Union (DSU) with Path Compression & Union by Rank',
              'Dijkstra’s Algorithm with Min-Heap optimization',
              'Bellman-Ford Algorithm and Negative Cycle detection',
              'Minimum Spanning Trees (Kruskal & Prim algorithms)',
            ],
            status: 'Not Started',
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Dynamic Programming & State Transitions',
        badgeTagline: 'Master complex optimizations • 2 courses • 5 weeks to complete',
        summary: 'Formulate multidimensional state spaces, optimal substructure, memoization caches, and interval dynamic programming.',
        estimatedWeeks: 5,
        modules: [
          {
            id: 'mod-301',
            title: '1D & 2D Dynamic Programming Mastery',
            subtitle: 'Learn Course • 185 Problems',
            problemsCount: 185,
            topics: [
              'Top-down Memoization vs Bottom-up Tabulation paradigms',
              'Classic 0/1 Knapsack & Unbounded Knapsack variants',
              'Longest Common Subsequence (LCS) and Edit Distance',
              'Longest Increasing Subsequence (LIS) in O(N log N)',
              'Grid DP with obstacles and minimum path calculations',
            ],
            status: 'Not Started',
          },
          {
            id: 'mod-302',
            title: 'Advanced DP: Trees, Bitmask & Intervals',
            subtitle: 'Learn Course • 110 Problems',
            problemsCount: 110,
            topics: [
              'Matrix Chain Multiplication and Interval DP',
              'Tree DP: Diameter, Subtree sums, and rerooting techniques',
              'Bitmask DP for Traveling Salesperson and subset partitions',
              'Digit DP for counting numbers with custom constraints',
            ],
            status: 'Not Started',
          },
        ],
      },
      {
        levelNumber: 4,
        levelTitle: 'Advanced Structures & Competitive Capstone',
        badgeTagline: 'Achieve grandmaster mastery • 1 capstone • 4 weeks to complete',
        summary: 'Deploy segment trees with lazy propagation, persistent data structures, and execute timed mock contests.',
        estimatedWeeks: 4,
        modules: [
          {
            id: 'mod-401',
            title: 'Range Queries & Contest Simulation Lab',
            subtitle: 'Capstone Project • 120 Problems',
            problemsCount: 120,
            topics: [
              'Segment Trees with Point Updates and Range Queries',
              'Lazy Propagation for range assignments and additions',
              'Binary Indexed Trees (Fenwick Trees) for 2D prefix queries',
              'Square Root Decomposition and Mo’s Algorithm',
              'Full 5-Hour Timed ICPC Simulation Mock Evaluation',
            ],
            status: 'Not Started',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-006',
    code: 'CS-101',
    slug: 'computer-science-fundamentals-and-python',
    title: 'Computer Science Fundamentals & Python',
    category: 'Computer Science & DSA',
    level: 'Beginner',
    instructorName: 'Prof. David J. Malan',
    instructorTitle: 'Gordon McKay Professor of Practice',
    institutionName: 'Harvard University - Division of Science',
    durationHours: 32,
    modulesCount: 8,
    lessonsCount: 38,
    enrolledStudents: 5480,
    completionRate: 91,
    status: 'Published',
    tags: ['Python', 'Problem Solving', 'Recursion', 'Variables', 'OOP'],
    description: 'An entry-level gateway to computational thinking, algorithmic logic, recursion, object-oriented design, and clean code standards in Python 3.',
    accentColor: '#0B1F3A',
    moduleHighlights: [
      { title: 'Computational Logic & Control Structures', lessons: 6 },
      { title: 'Functions, Scope & Recursion Fundamentals', lessons: 8 },
      { title: 'Object-Oriented Programming (OOP) in Python', lessons: 10 },
      { title: 'File I/O, Exceptions & Testing with Pytest', lessons: 8 },
      { title: 'Capstone: Interactive CLI Game Engine', lessons: 6 },
    ],
    whatYouWillLearn: [
      {
        title: 'Core Python Syntax & Dynamic Typing',
        description: 'Understand Python variable declarations, immutability, data types, and standard library collections.',
      },
      {
        title: 'Algorithmic Problem-Solving & Conditionals',
        description: 'Write clean branching statements, truthy checks, nested iterations, and list comprehensions.',
      },
      {
        title: 'Modular Functional Design & Scope',
        description: 'Construct reusable pure functions, default arguments, *args/**kwargs, and lambda expressions.',
      },
      {
        title: 'Object-Oriented Programming (OOP)',
        description: 'Design classes, encapsulation, inheritance hierarchies, polymorphism, and dunder magic methods.',
      },
      {
        title: 'Error Handling, File I/O & Unit Testing',
        description: 'Gracefully catch exceptions, parse JSON/CSV datasets, and write automated test suites using pytest.',
      },
      {
        title: 'Foundations of Algorithmic Complexity',
        description: 'Introduction to time and space complexity with basic search and sorting implementations.',
      },
    ],
    prerequisites: [
      'No prior programming experience required',
      'Basic computer literacy and arithmetic knowledge',
    ],
    targetRoles: [
      'Junior Python Developer',
      'Data Analyst / Analytics Engineer',
      'Computer Science Undergraduate Students',
    ],
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Learn Python',
        badgeTagline: 'Build foundational knowledge • 2 courses • 4 weeks to complete',
        summary: 'Start the journey with getting a strong command over Python. Revise the important concepts if you are already familiar with the language.',
        estimatedWeeks: 4,
        modules: [
          {
            id: 'mod-py-101',
            title: 'Learn Python Programming',
            subtitle: 'Learn Course • 239 Problems',
            problemsCount: 239,
            topics: [
              'Output / Print in Python',
              'Variables and datatypes',
              'Strings & Character operations',
              'Taking input from users',
              'Conditional statements & Logic gates',
              'How to debug your code & Read tracebacks',
              'Arrays and Loops (for / while / break)',
              'Functions in python & Parameter passing',
              'Tuples and Dictionary collections',
              'Getting started with algorithmic problems',
            ],
            status: 'In Progress',
          },
          {
            id: 'mod-py-102',
            title: 'Python Collections & String Manipulation',
            subtitle: 'Learn Course • 115 Problems',
            problemsCount: 115,
            topics: [
              'List slicing, sorting, and comprehension patterns',
              'Dictionary hashing and key-value mapping methods',
              'Sets and mathematical set theory operations',
              'String parsing, regex, and formatting with f-strings',
            ],
            status: 'Not Started',
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Object-Oriented Programming & File Systems',
        badgeTagline: 'Architect clean modular applications • 2 courses • 4 weeks to complete',
        summary: 'Deep-dive into class architectures, dunder methods, exception hierarchies, and file stream handling.',
        estimatedWeeks: 4,
        modules: [
          {
            id: 'mod-py-201',
            title: 'Object-Oriented Design in Python 3',
            subtitle: 'Learn Course • 88 Problems',
            problemsCount: 88,
            topics: [
              'Classes, instances, and self pointer mechanics',
              'Inheritance, multiple inheritance, and MRO',
              'Encapsulation with private attributes and @property decorators',
              'Magic methods: __str__, __repr__, __eq__, __len__',
            ],
            status: 'Not Started',
          },
          {
            id: 'mod-py-202',
            title: 'File I/O, Serialization & Pytest Harness',
            subtitle: 'Learn Course • 64 Problems',
            problemsCount: 64,
            topics: [
              'Context managers with the "with" statement',
              'Reading and writing JSON, CSV, and binary files',
              'Custom exception classes and try/except/finally blocks',
              'Writing assertions and unit tests using pytest',
            ],
            status: 'Not Started',
          },
        ],
      },
      {
        levelNumber: 3,
        levelTitle: 'Algorithmic Problem-Solving & Capstone',
        badgeTagline: 'Transition to algorithmic coding • 1 capstone • 3 weeks to complete',
        summary: 'Apply computational logic to build interactive CLI utilities and solve entry-level algorithmic contest challenges.',
        estimatedWeeks: 3,
        modules: [
          {
            id: 'mod-py-301',
            title: 'Interactive CLI Engine Capstone Project',
            subtitle: 'Capstone Project • 45 Problems',
            problemsCount: 45,
            topics: [
              'Command-line argument parsing with argparse',
              'State machine architecture for CLI interactive games',
              'Benchmarking algorithmic runtime with cProfile',
              'Deploying Python scripts as standalone executables',
            ],
            status: 'Not Started',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-002',
    code: 'SYS-401',
    slug: 'distributed-systems-and-cloud-architecture',
    title: 'Distributed Systems & Cloud Architecture',
    category: 'System Design & Architecture',
    level: 'Advanced',
    instructorName: 'Dr. Martin Kleppmann',
    instructorTitle: 'Chair of Distributed Computing',
    institutionName: 'Cambridge University - Computer Lab',
    durationHours: 42,
    modulesCount: 10,
    lessonsCount: 52,
    enrolledStudents: 2180,
    completionRate: 64,
    status: 'Published',
    tags: ['System Design', 'Raft Consensus', 'Kafka', 'Sharding', 'CAP Theorem'],
    description: 'Design fault-tolerant, scalable distributed backends. Covers consensus protocols (Raft, Paxos), replication, consistent hashing, and message queues.',
    accentColor: '#7C3AED',
    moduleHighlights: [
      { title: 'Networking Fundamentals & RPC Frameworks', lessons: 6 },
      { title: 'Replication, Leader Election & Consensus (Raft)', lessons: 12 },
      { title: 'Distributed Storage, Partitioning & LSM-Trees', lessons: 14 },
      { title: 'Event-Driven Architectures & Stream Processing', lessons: 12 },
      { title: 'Capstone: High-Throughput Distributed Key-Value Store', lessons: 8 },
    ],
    whatYouWillLearn: [
      {
        title: 'Distributed Consensus & Replication',
        description: 'Master Raft and Multi-Paxos leader election, log replication, and split-brain safety guarantees.',
      },
      {
        title: 'Storage Engines & LSM Trees',
        description: 'Understand Write-Ahead Logs (WAL), MemTables, SSTables, Bloom Filters, and compaction strategies.',
      },
      {
        title: 'Scalable Partitioning & Consistent Hashing',
        description: 'Implement distributed hash rings, virtual nodes, quorum reads/writes, and vector clocks.',
      },
      {
        title: 'Event Streaming & Messaging Architectures',
        description: 'Design high-throughput ingestion pipelines using Apache Kafka, consumer groups, and idempotent publishers.',
      },
    ],
    prerequisites: ['Operating Systems internals', 'Basic networking (TCP/IP, HTTP/2)', 'Proficiency in Go, Rust, or Java'],
    targetRoles: ['Principal Systems Architect', 'Staff Infrastructure Engineer', 'Site Reliability Engineering Lead'],
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Foundations of Distributed State',
        badgeTagline: 'Build foundational knowledge • 2 courses • 4 weeks to complete',
        summary: 'Understand network unreliability, clock synchronization, Lamport timestamps, and RPC communication.',
        estimatedWeeks: 4,
        modules: [
          {
            id: 'mod-sys-101',
            title: 'Networking & RPC Protocols',
            subtitle: 'Learn Course • 52 Problems',
            problemsCount: 52,
            topics: [
              'TCP socket programming & connection pools',
              'gRPC and Protocol Buffers serialization',
              'Logical Clocks & Vector Clocks',
              'Failure detection & heartbeat timeouts',
            ],
            status: 'Completed',
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Consensus Protocols & Fault Tolerance',
        badgeTagline: 'Implement distributed consensus • 2 courses • 6 weeks to complete',
        summary: 'Build a full Raft consensus engine with leader election, heartbeat quorum, and snapshotting.',
        estimatedWeeks: 6,
        modules: [
          {
            id: 'mod-sys-201',
            title: 'Raft Consensus from Scratch',
            subtitle: 'Learn Course • 94 Problems',
            problemsCount: 94,
            topics: [
              'Raft state machine: Follower, Candidate, Leader',
              'RequestVote and AppendEntries RPC verification',
              'Log compaction and state machine snapshots',
              'Linearizable reads and lease mechanisms',
            ],
            status: 'In Progress',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-003',
    code: 'CP-501',
    slug: 'competitive-programming-grandmaster-track',
    title: 'Competitive Programming Grandmaster Track',
    category: 'Competitive Programming',
    level: 'Advanced',
    instructorName: 'Gennady Korotkevich',
    instructorTitle: 'Distinguished Competitive Coding Coach',
    institutionName: 'Global ICPC Excellence Institute',
    durationHours: 60,
    modulesCount: 14,
    lessonsCount: 84,
    enrolledStudents: 1890,
    completionRate: 52,
    status: 'Published',
    tags: ['Competitive Coding', 'Segment Trees', 'Flows', 'Number Theory', 'Bitmask DP'],
    description: 'Intensive ICPC and Codeforces Div-1 problem-solving strategies. Fast I/O, combinatorial math, computational geometry, max flow, and tree DP.',
    accentColor: '#DC2626',
    moduleHighlights: [
      { title: 'Advanced Number Theory & Modular Arithmetic', lessons: 10 },
      { title: 'Range Queries & Lazy Propagation Segment Trees', lessons: 16 },
      { title: 'Network Flow & Bipartite Matching (Dinic & Edmonds-Karp)', lessons: 18 },
      { title: 'Tree Decomposition & Heavy-Light Decomposition (HLD)', lessons: 22 },
      { title: 'Capstone: 5-Hour Timed ICPC Simulation Mock', lessons: 18 },
    ],
    whatYouWillLearn: [
      {
        title: 'Number Theory & Modular Combinatorics',
        description: 'Sieve of Eratosthenes, Extended Euclidean algorithm, Fermat’s Little Theorem, and Chinese Remainder Theorem.',
      },
      {
        title: 'Max Flow & Minimum Cut Algorithms',
        description: 'Implement Dinic’s algorithm, Edmonds-Karp, and Hopcroft-Karp for maximum bipartite matching.',
      },
      {
        title: 'Heavy-Light Decomposition & Centroid Decomposition',
        description: 'Perform O(log^2 N) path queries and divide-and-conquer on tree topologies.',
      },
    ],
    prerequisites: ['Mastery of C++ STL', 'Fluency in basic DP, Graphs, and Trees', 'Active Codeforces rating >= 1600'],
    targetRoles: ['ICPC World Finalist', 'Quantitative Algorithmic Trader', 'Senior Research Scientist'],
  },
  {
    id: 'crs-004',
    code: 'WEB-202',
    slug: 'modern-fullstack-engineering-with-nextjs',
    title: 'Modern Full-Stack Engineering with Next.js',
    category: 'Web & Full-Stack Development',
    level: 'Intermediate',
    instructorName: 'Guillermo Rauch & Sarah Dayan',
    instructorTitle: 'Staff Full-Stack Instructors',
    institutionName: 'Stanford University - Dept of CS',
    durationHours: 36,
    modulesCount: 9,
    lessonsCount: 45,
    enrolledStudents: 4120,
    completionRate: 86,
    status: 'Published',
    tags: ['Next.js', 'React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind'],
    description: 'Production-ready full-stack architecture with React Server Components, Next.js App Router, Prisma ORM, JWT authentication, and WebSockets.',
    accentColor: '#059669',
    moduleHighlights: [
      { title: 'TypeScript Advanced Types & Modern React 19', lessons: 8 },
      { title: 'Next.js App Router, SSR & Server Actions', lessons: 12 },
      { title: 'Prisma ORM, PostgreSQL & Migrations', lessons: 10 },
      { title: 'Authentication, RBAC & API Route Security', lessons: 8 },
      { title: 'Capstone: End-to-End Enterprise SaaS Application', lessons: 7 },
    ],
    whatYouWillLearn: [
      {
        title: 'React 19 & Server Components Architecture',
        description: 'Zero-bundle-size React Server Components, client boundaries, suspense streaming, and server actions.',
      },
      {
        title: 'Prisma ORM & PostgreSQL Schema Design',
        description: 'Database relationships, transactions, indexes, connection pooling, and automated schema migrations.',
      },
      {
        title: 'Authentication, Session Security & RBAC',
        description: 'Secure JWT token handling, HTTP-only cookies, password hashing with bcrypt, and middleware access control.',
      },
    ],
  },
  {
    id: 'crs-005',
    code: 'AI-302',
    slug: 'deep-learning-and-neural-network-architectures',
    title: 'Deep Learning & Neural Network Architectures',
    category: 'AI, ML & Data Science',
    level: 'Advanced',
    instructorName: 'Dr. Andrew Ng',
    instructorTitle: 'Adjunct Professor of Artificial Intelligence',
    institutionName: 'Stanford AI Research Laboratory',
    durationHours: 54,
    modulesCount: 11,
    lessonsCount: 58,
    enrolledStudents: 2950,
    completionRate: 71,
    status: 'Published',
    tags: ['PyTorch', 'Deep Learning', 'Transformers', 'CNN', 'LLM Fine-tuning'],
    description: 'Build neural networks from scratch in PyTorch. Covers backpropagation, attention mechanisms, vision transformers, and fine-tuning open LLMs.',
    accentColor: '#D97706',
    moduleHighlights: [
      { title: 'Tensors, Autograd & Multi-Layer Perceptrons', lessons: 10 },
      { title: 'Convolutional Networks for Computer Vision', lessons: 12 },
      { title: 'Recurrent Nets & Self-Attention Transformers', lessons: 16 },
      { title: 'LLM Prompt Engineering, LoRA & Fine-Tuning', lessons: 12 },
      { title: 'Capstone: Multimodal Generative AI Pipeline', lessons: 8 },
    ],
    whatYouWillLearn: [
      {
        title: 'Tensors, Autograd & Matrix Calculus',
        description: 'Build neural computation graphs, implement custom autograd functions, and compute backpropagation gradients.',
      },
      {
        title: 'Convolutional & Transformer Architectures',
        description: 'Design ResNet residual blocks, multi-head self-attention mechanisms, and positional encoding vectors.',
      },
      {
        title: 'LLM Fine-Tuning & Parameter Efficient Methods',
        description: 'Fine-tune open-weights models with LoRA, QLoRA, flash attention, and quantization on GPU clusters.',
      },
    ],
  },
  {
    id: 'crs-007',
    code: 'DB-203',
    slug: 'database-internals-and-query-engines',
    title: 'Database Internals & Query Optimization',
    category: 'System Design & Architecture',
    level: 'Intermediate',
    instructorName: 'Prof. Andy Pavlo',
    instructorTitle: 'Associate Professor of Computer Science',
    institutionName: 'Carnegie Mellon Database Group',
    durationHours: 40,
    modulesCount: 9,
    lessonsCount: 46,
    enrolledStudents: 1640,
    completionRate: 68,
    status: 'Published',
    tags: ['SQL', 'B+ Trees', 'Buffer Pool', 'Query Planning', 'ACID Transactions'],
    description: 'Understand what happens under the hood of database engines: disk storage managers, buffer pools, B+ tree indexes, concurrency control, and query optimization.',
    accentColor: '#7C3AED',
    moduleHighlights: [
      { title: 'Disk Storage, Slotted Pages & Buffer Pools', lessons: 8 },
      { title: 'Index Storage: B+ Trees & Extendible Hashing', lessons: 12 },
      { title: 'Query Execution, Joins & Cost-Based Optimizers', lessons: 12 },
      { title: 'Concurrency Control, 2PL & Write-Ahead Logging (WAL)', lessons: 10 },
      { title: 'Capstone: Building an In-Memory Mini-RDBMS Engine', lessons: 4 },
    ],
  },
  {
    id: 'crs-008',
    code: 'WEB-303',
    slug: 'backend-architecture-with-nestjs-and-microservices',
    title: 'Enterprise Backend Engineering with NestJS',
    category: 'Web & Full-Stack Development',
    level: 'Intermediate',
    instructorName: 'Kamil Myśliwiec',
    instructorTitle: 'NestJS Framework Architect',
    institutionName: 'IIT Delhi - Dept of Comp Science',
    durationHours: 38,
    modulesCount: 8,
    lessonsCount: 42,
    enrolledStudents: 2470,
    completionRate: 82,
    status: 'Published',
    tags: ['NestJS', 'TypeScript', 'Prisma', 'BullMQ', 'Redis', 'Microservices'],
    description: 'Architect resilient enterprise backend services with dependency injection, DTO validation, Redis caching, BullMQ asynchronous queues, and Swagger OpenAPI.',
    accentColor: '#059669',
    moduleHighlights: [
      { title: 'NestJS Modules, Providers & Dependency Injection', lessons: 8 },
      { title: 'Validation Pipes, Guards & JWT Authentication', lessons: 10 },
      { title: 'Prisma Multi-Tenant Isolation & Transaction Queues', lessons: 10 },
      { title: 'BullMQ Message Queues & Docker Sandbox Runners', lessons: 8 },
      { title: 'Capstone: High-Concurrency Submissions Judge Gateway', lessons: 6 },
    ],
  },
  {
    id: 'crs-python-fundamentals',
    code: 'PY-101',
    slug: 'python-3-programming-from-fundamentals-to-algorithmic-problem-solving',
    title: 'Python 3 Programming: From Fundamentals to Algorithmic Problem Solving',
    category: 'Computer Science & DSA',
    level: 'Beginner',
    instructorName: 'Prof. Alan Turing',
    instructorTitle: 'Core Systems & Foundations Faculty',
    institutionName: 'Stanford Computer Science',
    durationHours: 45,
    modulesCount: 4,
    lessonsCount: 7,
    enrolledStudents: 412,
    completionRate: 88,
    status: 'Published',
    tags: ['Python 3', 'Beginners', 'DSA', 'OOP', 'Problem Solving'],
    description: 'Master Python 3 fundamentals from variables, conditionals, loops, and data structures to OOP, file I/O, and coding interview challenges.',
    accentColor: '#5B2D90',
    moduleHighlights: [
      { title: 'Python Basics, Syntax & Expressions', lessons: 2 },
      { title: 'Control Flow, Conditionals & Loops', lessons: 2 },
      { title: 'Functions, Scoping & Modular Design', lessons: 1 },
      { title: 'Lists, Dictionaries, Sets & Tuples', lessons: 2 },
    ],
    whatYouWillLearn: [
      {
        title: 'Core Python Syntax & Dynamic Typing',
        description: 'Understand Python variable declarations, immutability, data types, and standard library collections.',
      },
      {
        title: 'Algorithmic Problem-Solving & Conditionals',
        description: 'Write clean branching statements, truthy checks, nested iterations, and list comprehensions.',
      },
      {
        title: 'Modular Functional Design & Scope',
        description: 'Construct reusable pure functions, default arguments, *args/**kwargs, and lambda expressions.',
      },
      {
        title: 'Core Collections & Hash Maps',
        description: 'Master in-place list mutations, hash map lookups, frequency counters, and set theory algebra.',
      },
    ],
    prerequisites: [
      'No prior programming experience required',
      'Basic arithmetic and computer literacy',
    ],
    targetRoles: [
      'Junior Python Developer',
      'Data Analyst / Analytics Engineer',
      'Computer Science Student',
    ],
    levels: [
      {
        levelNumber: 1,
        levelTitle: 'Python Fundamentals & Logic',
        badgeTagline: 'Build foundational knowledge • 2 modules • 3 weeks to complete',
        summary: 'Master syntax, dynamic typing, expressions, if-elif-else branching, and iteration loops.',
        estimatedWeeks: 3,
        modules: [
          {
            id: 'mod-py-1',
            title: 'Python Basics, Syntax & Expressions',
            subtitle: 'Core Foundation • 2 Lessons',
            problemsCount: 45,
            topics: [
              'Variables, Dynamic Typing & Standard I/O',
              'Operators, Arithmetic Precedence & Expressions',
            ],
            status: 'Completed',
          },
          {
            id: 'mod-py-2',
            title: 'Control Flow, Conditionals & Loops',
            subtitle: 'Branching & Iteration • 2 Lessons',
            problemsCount: 60,
            topics: [
              'Branching Logic with if, elif & else',
              'Iteration with for & while Loops',
            ],
            status: 'In Progress',
          },
        ],
      },
      {
        levelNumber: 2,
        levelTitle: 'Modular Code & Collections',
        badgeTagline: 'Data structures & functions • 2 modules • 4 weeks to complete',
        summary: 'Build reusable functions, master lists, dictionaries, tuples, and sets.',
        estimatedWeeks: 4,
        modules: [
          {
            id: 'mod-py-3',
            title: 'Functions, Scoping & Modular Design',
            subtitle: 'Functional Design • 1 Lesson',
            problemsCount: 35,
            topics: [
              'Defining Functions, Parameters & Return Values',
            ],
            status: 'Not Started',
          },
          {
            id: 'mod-py-4',
            title: 'Lists, Dictionaries, Sets & Tuples',
            subtitle: 'Data Structures • 2 Lessons',
            problemsCount: 75,
            topics: [
              'List Manipulation & List Comprehensions',
              'Hash Maps (Dicts) & Set Operations',
            ],
            status: 'Not Started',
          },
        ],
      },
    ],
  },
  {
    id: 'crs-fullstack-architecture',
    code: 'CS-401',
    slug: 'full-stack-web-architecture-and-cloud-microservices',
    title: 'Full-Stack Web Architecture & Cloud Microservices',
    category: 'Web & Full-Stack Development',
    level: 'Advanced',
    instructorName: 'Prof. Alan Turing',
    instructorTitle: 'Distinguished Systems Architect',
    institutionName: 'Stanford Computer Science',
    durationHours: 64,
    modulesCount: 3,
    lessonsCount: 6,
    enrolledStudents: 142,
    completionRate: 78,
    status: 'Published',
    tags: ['Next.js 15', 'NestJS', 'PostgreSQL', 'Redis', 'Docker'],
    description: 'Master enterprise full-stack development with Next.js 15, SSR, NestJS APIs, PostgreSQL, Redis BullMQ queues, and Docker container security.',
    accentColor: '#0B1F3A',
    moduleHighlights: [
      { title: 'Foundations of SSR & Next.js App Router', lessons: 2 },
      { title: 'Production API Design with NestJS & TypeScript', lessons: 2 },
      { title: 'PostgreSQL Relational Schema Design & Redis BullMQ Queues', lessons: 2 },
    ],
  },
  {
    id: 'crs-dsa-advanced',
    code: 'CS-301',
    slug: 'advanced-data-structures-and-algorithmic-problem-solving',
    title: 'Advanced Data Structures & Algorithmic Problem Solving',
    category: 'Computer Science & DSA',
    level: 'Intermediate',
    instructorName: 'Prof. Thomas Cormen',
    instructorTitle: 'Algorithms Faculty Chair',
    institutionName: 'MIT EECS',
    durationHours: 48,
    modulesCount: 2,
    lessonsCount: 4,
    enrolledStudents: 320,
    completionRate: 92,
    status: 'Published',
    tags: ['Algorithms', 'Dynamic Programming', 'Graph Theory', 'Trees'],
    description: 'Master dynamic programming, graph algorithms, segment trees, and competitive programming techniques for high-tier tech interviews.',
    accentColor: '#10B981',
    moduleHighlights: [
      { title: 'Dynamic Programming Patterns', lessons: 2 },
      { title: 'Graph Algorithms & Shortest Path Optimization', lessons: 2 },
    ],
  },
  {
    id: 'crs-cloud-devops',
    code: 'CS-501',
    slug: 'cloud-devops-docker-sandboxing-and-ci-cd-pipelines',
    title: 'Cloud DevOps, Docker Sandboxing & CI/CD Pipelines',
    category: 'System Design & Architecture',
    level: 'Advanced',
    instructorName: 'Prof. Alan Turing',
    instructorTitle: 'DevOps & Systems Specialist',
    institutionName: 'Stanford Computer Science',
    durationHours: 36,
    modulesCount: 1,
    lessonsCount: 2,
    enrolledStudents: 98,
    completionRate: 64,
    status: 'Published',
    tags: ['Docker', 'DevOps', 'CI/CD', 'Security', 'Linux'],
    description: 'Container orchestration, multi-stage builds, isolated runtime sandboxes, and automated testing deployments.',
    accentColor: '#8B5CF6',
    moduleHighlights: [
      { title: 'Docker Multi-Stage Builds & Isolation', lessons: 2 },
    ],
  },
];

export function normalizeSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function resolveCourseData(slugParam: string): Promise<CourseDirectoryEntity | null> {
  const normalizedParam = normalizeSlug(slugParam);

  // 1. Check ALL_COURSES by direct id, exact slug, or normalized title slug
  const directMatch = ALL_COURSES.find(
    (c) =>
      c.id === slugParam ||
      c.slug === slugParam ||
      normalizeSlug(c.slug) === normalizedParam ||
      normalizeSlug(c.title) === normalizedParam
  );

  // 2. Try fetching from live backend to preserve live modules / lesson IDs
  let liveCourse: any = null;
  try {
    const live = await apiService.getCourseById(slugParam);
    if (live && live.id) {
      liveCourse = live;
    }
  } catch {}

  if (!liveCourse) {
    try {
      const allLive = await apiService.getCourses({ limit: 100 });
      if (allLive?.items && allLive.items.length > 0) {
        liveCourse = allLive.items.find(
          (c: any) =>
            c.id === slugParam ||
            normalizeSlug(c.title) === normalizedParam ||
            (c.slug && normalizeSlug(c.slug) === normalizedParam) ||
            (directMatch && (c.id === directMatch.id || normalizeSlug(c.title) === normalizeSlug(directMatch.title)))
        );
      }
    } catch (err) {
      console.warn('Failed to search live courses for slug:', err);
    }
  }

  // 3. If directMatch exists, merge live backend data into it
  if (directMatch) {
    if (liveCourse && liveCourse.id) {
      const rawModules = Array.isArray(liveCourse.modules) && liveCourse.modules.length > 0
        ? liveCourse.modules
        : directMatch.modules || [];
      const hasLiveOutcomes = Array.isArray(liveCourse.learningOutcomes) && liveCourse.learningOutcomes.length > 0;
      const outcomes = hasLiveOutcomes
        ? liveCourse.learningOutcomes
        : (directMatch.learningOutcomes || directMatch.whatYouWillLearn?.map((w: any) => typeof w === 'string' ? w : w.title || w.description) || []);
      const whatYouWillLearn = hasLiveOutcomes
        ? liveCourse.learningOutcomes.map((title: string) => ({ title, description: title }))
        : directMatch.whatYouWillLearn;

      return {
        ...directMatch,
        id: liveCourse.id || directMatch.id,
        title: liveCourse.title || directMatch.title,
        description: liveCourse.description || directMatch.description,
        tags: Array.isArray(liveCourse.tags) && liveCourse.tags.length > 0 ? liveCourse.tags : directMatch.tags,
        learningOutcomes: outcomes,
        whatYouWillLearn,
        modules: rawModules,
        status: liveCourse.status === 'PUBLISHED' ? 'Published' : liveCourse.status === 'DRAFT' ? 'Draft' : directMatch.status,
      };
    }
    return directMatch;
  }

  // 4. If no static directMatch, map live course preserving live modules and learningOutcomes
  if (liveCourse && liveCourse.id) {
    const rawModules = Array.isArray(liveCourse.modules) ? liveCourse.modules : [];
    const outcomes = Array.isArray(liveCourse.learningOutcomes) && liveCourse.learningOutcomes.length > 0
      ? liveCourse.learningOutcomes
      : [];

    return {
      id: liveCourse.id,
      code: liveCourse.code || `CRS-${liveCourse.id.slice(0, 4).toUpperCase()}`,
      slug: normalizeSlug(liveCourse.slug || liveCourse.title),
      title: liveCourse.title,
      category: (liveCourse.category || 'Computer Science & DSA') as any,
      level: (liveCourse.level || 'Intermediate') as any,
      instructorName: liveCourse.instructor?.name || liveCourse.createdBy?.name || 'Academic Faculty',
      instructorTitle: 'Faculty Lead',
      institutionName: liveCourse.institution?.name || liveCourse.college?.name || 'Academic Campus',
      durationHours: liveCourse.durationHours || (liveCourse.durationWeeks ? liveCourse.durationWeeks * 5 : 40),
      modulesCount: liveCourse._count?.modules ?? rawModules.length,
      lessonsCount: rawModules.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0),
      enrolledStudents: liveCourse._count?.enrollments || 0,
      completionRate: 0,
      status: liveCourse.status === 'PUBLISHED' ? 'Published' : 'Draft',
      tags: Array.isArray(liveCourse.tags) ? liveCourse.tags : ['Curriculum', 'Programming'],
      description: liveCourse.description || 'Comprehensive programming curriculum.',
      accentColor: '#0B1F3A',
      thumbnailUrl: liveCourse.thumbnailUrl || undefined,
      modules: rawModules,
      moduleHighlights: rawModules.map((m: any) => ({
        title: m.title || 'Course Module',
        lessons: m.lessons?.length || 0,
      })),
      learningOutcomes: outcomes,
      whatYouWillLearn: outcomes.map((title: string) => ({ title, description: title })),
      prerequisites: ['Basic computer programming fundamentals'],
      targetRoles: ['Software Engineer', 'Developer'],
    };
  }

  return null;
}
