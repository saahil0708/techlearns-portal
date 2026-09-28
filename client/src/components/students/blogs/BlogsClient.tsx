'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api-service';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Select,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  Tabs,
  Tab,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { uploadFileToAzureBlob } from '@/lib/storage';
import { FluidArrowRight } from '@/utils/fluid_arrow';

import { useToast } from '@/context/ToastContext';
import { BlogPost, formatBlogDate, INITIAL_BLOG_POSTS } from '@/types/blog';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import TipTapEditor from '@/components/shared/TipTapEditor';

const CATEGORIES = [
  'All Stories',
  'System Architecture',
  'DSA & Algorithms',
  'AI & Machine Learning',
  'Frontend & React',
  'Backend & DevOps',
  'Interview Experiences',
  'Cloud & Distributed',
];

export function parseBlogDateToTime(dateStr?: string): number {
  if (!dateStr) return 0;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;

  const lower = dateStr.toLowerCase();
  const now = Date.now();
  if (lower.includes('just now') || lower.includes('min ago')) return now;
  if (lower.includes('hour ago') || lower.includes('hours ago')) {
    const hours = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - hours * 3600 * 1000;
  }
  if (lower.includes('yesterday')) return now - 24 * 3600 * 1000;
  if (lower.includes('day ago') || lower.includes('days ago')) {
    const days = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - days * 24 * 3600 * 1000;
  }
  if (lower.includes('week ago') || lower.includes('weeks ago')) {
    const weeks = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - weeks * 7 * 24 * 3600 * 1000;
  }
  if (lower.includes('month ago') || lower.includes('months ago')) {
    const months = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - months * 30 * 24 * 3600 * 1000;
  }
  return 0;
}

export function getBlogThemeConfig(category: string = '') {
  const c = category.toLowerCase();

  // AI / ML
  if (/\b(ai|llm|ml|machine learning|deep learning)\b/i.test(c)) {
    return {
      accentColor: '#D97706',
      tagBg: 'rgba(217, 119, 6, 0.08)',
      tagText: '#D97706',
      btnBg: '#D97706',
      btnHover: '#B45309',
      badgeBg: 'linear-gradient(135deg, rgba(120, 53, 15, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(251, 191, 36, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(245, 158, 11, 0.25)',
      badgeText: '#FFFBEB',
      badgeIconColor: '#FBBF24',
      badgeLabel: 'AI & ML STORY',
    };
  }

  // System Architecture / Backend / Cloud
  if (/\b(system|architecture|backend|distributed|cloud|devops)\b/i.test(c)) {
    return {
      accentColor: '#0284C7',
      tagBg: 'rgba(2, 132, 199, 0.08)',
      tagText: '#0284C7',
      btnBg: '#0284C7',
      btnHover: '#0369A1',
      badgeBg: 'linear-gradient(135deg, rgba(12, 74, 110, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(56, 189, 248, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(56, 189, 248, 0.25)',
      badgeText: '#F0F9FF',
      badgeIconColor: '#38BDF8',
      badgeLabel: 'ARCHITECTURE POST',
    };
  }

  // DSA & Competitive Programming
  if (/\b(dsa|algo|algorithm|competitive)\b/i.test(c)) {
    return {
      accentColor: '#059669',
      tagBg: 'rgba(5, 150, 105, 0.08)',
      tagText: '#059669',
      btnBg: '#059669',
      btnHover: '#047857',
      badgeBg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(52, 211, 153, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(16, 185, 129, 0.25)',
      badgeText: '#ECFDF5',
      badgeIconColor: '#34D399',
      badgeLabel: 'ALGORITHM DEEP-DIVE',
    };
  }

  // Interview Experiences
  if (/\b(interview|career|faang|google)\b/i.test(c)) {
    return {
      accentColor: '#7C3AED',
      tagBg: 'rgba(124, 58, 237, 0.08)',
      tagText: '#7C3AED',
      btnBg: '#7C3AED',
      btnHover: '#6D28D9',
      badgeBg: 'linear-gradient(135deg, rgba(76, 29, 149, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(192, 132, 252, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(124, 58, 237, 0.25)',
      badgeText: '#FAF5FF',
      badgeIconColor: '#C084FC',
      badgeLabel: 'INTERVIEW DEBRIEF',
    };
  }

  // Default / Web / Frontend
  return {
    accentColor: '#2563EB',
    tagBg: 'rgba(37, 99, 235, 0.08)',
    tagText: '#2563EB',
    btnBg: '#2563EB',
    btnHover: '#1D4ED8',
    badgeBg: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
    badgeBorder: '1px solid rgba(96, 165, 250, 0.45)',
    badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(37, 99, 235, 0.25)',
    badgeText: '#EFF6FF',
    badgeIconColor: '#60A5FA',
    badgeLabel: 'ENGINEERING POST',
  };
}

const INITIAL_BLOGS: BlogPost[] = INITIAL_BLOG_POSTS;
const UNUSED_DEMO_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Designing a Real-Time Distributed Leaderboard with Redis Sorted Sets & BullMQ',
    subtitle: 'A deep-dive architectural post-mortem on handling 500k concurrent score updates with sub-10ms p99 latency without database row contention.',
    category: 'System Architecture',
    readTime: '7 min read',
    publishedAt: '2026-09-27T16:30:00.000Z',
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

### Key Takeaways & Benchmarks

1. **Redis ZSET (\`ZADD\`, \`ZREVRANGEBYSCORE\`)** provides O(log N) time complexity for rank updates.
2. **Batching DB writes via BullMQ** reduced Postgres IOPS by **84%**.
3. **Pipeline flushing every 500ms** kept cache consistency seamlessly synchronized.

> **Pro Tip**: Always use Redis pipelining when issuing concurrent rank calculations to eliminate network round-trip overhead!`,
    comments: [
      {
        id: 'c-1',
        author: 'Priya Patel',
        avatarBg: '#059669',
        time: '3 hours ago',
        text: 'Fantastic breakdown! Did you consider Redis cluster sharding for contest rooms with >100k active participants?',
      },
      {
        id: 'c-2',
        author: 'Rohan Deshmukh',
        avatarBg: '#D97706',
        time: '1 hour ago',
        text: 'The BullMQ batching pattern is super clean. We used a similar strategy during our college hackathon!',
      },
    ],
  },
  {
    id: 'blog-2',
    title: 'Cracking the Google L4 Assessment: 6-Month Roadmap & Topological DAG Patterns',
    subtitle: 'How I structured my preparation, Mastered Monotonic Stacks, and conquered complex Dynamic Programming on Trees.',
    category: 'Interview Experiences',
    readTime: '10 min read',
    publishedAt: '2026-09-25T14:15:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1516116211227-bbc03a089025?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Elena Rostova',
      avatarBg: '#059669',
      avatarImg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      role: 'SDE Intern',
      college: 'BITS Pilani',
      handle: '@elena_dev',
      isVerified: true,
    },
    tags: ['Google', 'Interviews', 'Algorithms', 'DynamicProgramming'],
    claps: 512,
    commentsCount: 67,
    views: 4230,
    isBookmarked: false,
    hasLiked: true,
    content: `## My 6-Month Timeline

Preparing for top tier product companies while balancing university coursework requires strict pattern recognition rather than blindly solving 1000+ random problems.

### Core Focus Areas

- **Month 1-2**: Data Structure Foundations (Heaps, Segment Trees, Trie, Union-Find)
- **Month 3-4**: Graph Algorithms (Tarjan's SCC, Dijkstra, Topological Sort, Bipartite Matching)
- **Month 5**: Dynamic Programming (Digit DP, Bitmask DP, Tree DP)
- **Month 6**: Mock Interviews, Time-Constrained Contests, and Behavioral STAR framing.

### The Problem That Came Up in Round 2

The interviewer asked a variation of **Course Schedule III** with deadline constraints:
- We modeled prerequisites as a Directed Acyclic Graph (DAG).
- Utilized a Max-Heap to greedily backtrack durations whenever total elapsed time exceeded the deadline.

\`\`\`python
import heapq

def scheduleCourse(courses):
    courses.sort(key=lambda x: x[1])
    max_heap = []
    total_time = 0
    
    for duration, last_day in courses:
        if total_time + duration <= last_day:
            heapq.heappush(max_heap, -duration)
            total_time += duration
        elif max_heap and -max_heap[0] > duration:
            total_time += heapq.heappop(max_heap) + duration
            heapq.heappush(max_heap, -duration)
            
    return len(max_heap)
\`\`\`

Remember to communicate your thought process aloud before typing any code!`,
    comments: [
      {
        id: 'c-3',
        author: 'Vikram Mehta',
        avatarBg: '#4F46E5',
        time: 'Yesterday',
        text: 'Bookmark worthy! The course schedule python snippet with the max-heap greedy backtrack was super clear.',
      },
    ],
  },
  {
    id: 'blog-3',
    title: 'Building Next-Gen AI Coding Agents: Function Calling, AST Parsing & Sandbox Safety',
    subtitle: 'Understanding how agentic systems inspect abstract syntax trees, run tests in isolated Docker containers, and self-heal failed builds.',
    category: 'AI & Machine Learning',
    readTime: '6 min read',
    publishedAt: '2026-05-12T14:00:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Karan Sen',
      avatarBg: '#7C3AED',
      avatarImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      role: 'AI Researcher',
      college: 'IIIT Hyderabad',
      handle: '@karansen_ai',
      isVerified: true,
    },
    tags: ['AIAgents', 'LLMs', 'Docker', 'AST', 'Python'],
    claps: 318,
    commentsCount: 29,
    views: 2980,
    isBookmarked: false,
    hasLiked: false,
    content: `## How Autonomous Coding Agents Work

Modern coding assistants go beyond simple autocompletion. They act as autonomous loops capable of reading ASTs, generating diffs, and evaluating sandbox test suites.

### The Execution Loop

1. **Prompt & Context Gathering**: Parse AST symbols, import graphs, and git diffs.
2. **Tool Execution**: Execute commands inside ephemeral Docker containers.
3. **Self-Correction**: Parse stderr/stack trace and feed back into the prompt context for iterative repair.

\`\`\`typescript
interface AgentTurn {
  thought: string;
  toolCall: {
    tool: 'runSandbox' | 'editFile' | 'grep';
    args: Record<string, unknown>;
  };
}
\`\`\`

The future of software development is deeply collaborative pairing with autonomous agents.`,
    comments: [],
  },
  {
    id: 'blog-4',
    title: 'Zero-Downtime Database Migrations with Prisma, Postgres Locks & Shadow Schemas',
    subtitle: 'How to safely add non-null columns, backfill millions of rows, and drop legacy tables without causing table-level lock spikes.',
    category: 'Backend & DevOps',
    readTime: '5 min read',
    publishedAt: '2026-09-23T11:20:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Siddharth Roy',
      avatarBg: '#DB2777',
      role: 'Backend Architect',
      college: 'NIT Trichy',
      handle: '@sid_roy',
      isVerified: false,
    },
    tags: ['PostgreSQL', 'Prisma', 'Database', 'DevOps'],
    claps: 194,
    commentsCount: 16,
    views: 1410,
    isBookmarked: true,
    hasLiked: false,
    content: `## Safe Column Additions in Postgres

Adding a column with a default value in older Postgres versions used to rewrite the entire table. In modern Postgres (v11+), it is fast, but adding \`NOT NULL\` without a default will still trigger an **ACCESS EXCLUSIVE** lock.

### The 3-Step Expand/Contract Pattern

1. **Step 1 (Expand)**: Add the column as nullable.
2. **Step 2 (Backfill)**: Run background async script in batches to populate values.
3. **Step 3 (Contract)**: Add the \`NOT NULL\` constraint using \`VALIDATE CONSTRAINT\`.

This guarantees 99.99% database uptime during high-concurrency production deployments!`,
    comments: [],
  },
  {
    id: 'blog-5',
    title: 'React 19 Server Components vs Client Island Architecture: A Practical Guide',
    subtitle: 'When to leverage streaming SSR, when to isolate interactive leaves, and how to avoid hydration waterfalls in modern Next.js apps.',
    category: 'Frontend & React',
    readTime: '8 min read',
    publishedAt: '2026-09-21T08:45:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Neha Verma',
      avatarBg: '#0D9488',
      avatarImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
      role: 'Frontend Engineer',
      college: 'DTU Delhi',
      handle: '@neha_ui',
      isVerified: true,
    },
    tags: ['React19', 'NextJS', 'WebDev', 'SSR'],
    claps: 405,
    commentsCount: 42,
    views: 3670,
    isBookmarked: false,
    hasLiked: true,
    content: `## Server Components First

By adopting React Server Components (RSC) as the default mental model, we shift bundle size overhead away from the client browser and onto edge servers.

### Rules of Thumb

- **Data Fetching Boundaries**: Always use async Server Components for direct DB / API queries.
- **Client Components ('use client')**: Strictly limit to browser state, event handlers, animations, and local form validation.
- **Streaming Suspense**: Wrap heavy dashboard widgets in \`<Suspense fallback={<Skeleton />}>\` for lightning-fast First Contentful Paint.`,
    comments: [],
  },
  {
    id: 'blog-6',
    title: 'Demystifying Raft Consensus: Leader Election, Heartbeats & Log Compaction in Go',
    subtitle: 'A step-by-step visual exploration of building a distributed fault-tolerant key-value store using Raft consensus in Golang.',
    category: 'Cloud & Distributed',
    readTime: '9 min read',
    publishedAt: '2026-09-14T15:10:00.000Z',
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
    author: {
      name: 'Tanmay Bhatt',
      avatarBg: '#4338CA',
      role: 'Core Systems Engineer',
      college: 'IIT Delhi',
      handle: '@tanmay_raft',
      isVerified: true,
    },
    tags: ['Raft', 'Golang', 'Distributed', 'Consensus'],
    claps: 362,
    commentsCount: 28,
    views: 2450,
    isBookmarked: false,
    hasLiked: false,
    content: `## The Raft State Machine

Raft decomposes distributed consensus into 3 independent subproblems:
1. **Leader Election**: When an existing leader fails, a candidate requests votes.
2. **Log Replication**: The leader accepts log entries and forces followers to agree.
3. **Safety**: If any server has applied a particular log entry, no other server may apply a different command for that log index.`,
    comments: [],
  },
];

const DEFAULT_COVER_OPTIONS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516116211227-bbc03a089025?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
];

export default function BlogsClient() {
  const router = useRouter();
  const toast = useToast();

  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'bookmarks'>('trending');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(9);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  const handleOpenBlog = (post: BlogPost) => {
    const isResolvable =
      INITIAL_BLOG_POSTS.some((p) => p.id === post.id) ||
      (!post.id.startsWith('blog-') && !post.id.startsWith('client-'));
    if (isResolvable) {
      router.push(`/students/blogs/${post.id}`);
    } else {
      setSelectedBlog(post);
    }
  };

  useEffect(() => {
    let isMounted = true;
    apiService
      .getBlogs()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setPosts(data);
        }
      })
      .catch((err) => console.warn('Blogs fetch error, using cache:', err));
    return () => {
      isMounted = false;
    };
  }, []);

  // Writer Modal State
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('System Architecture');
  const [newTags, setNewTags] = useState('Backend, Distributed Systems');
  const [newContent, setNewContent] = useState('');
  const [writeTab, setWriteTab] = useState<'edit' | 'preview'>('edit');
  const [newCoverImg, setNewCoverImg] = useState(DEFAULT_COVER_OPTIONS[0]);
  const [coverSelectionMode, setCoverSelectionMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, SVG).', 'Invalid File');
      return;
    }

    try {
      setIsUploadingCover(true);
      const res = await uploadFileToAzureBlob(file, {
        folder: 'blogs',
        allowedTypes: ['image/*'],
      });
      setNewCoverImg(res.blobUrl);
      toast.success('Cover image uploaded successfully!', 'Image Uploaded');
    } catch (err: any) {
      console.error('Failed to upload image:', err);
      toast.error(err?.message || 'Failed to upload image. Please try again.', 'Upload Failed');
    } finally {
      setIsUploadingCover(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Comment input in Reader
  const [commentText, setCommentText] = useState('');

  // Filtering & Sorting
  const filteredPosts = useMemo(() => {
    const list = posts.filter((post) => {
      if (selectedCategory !== 'All Stories' && post.category !== selectedCategory) {
        return false;
      }
      if (activeTab === 'bookmarks' && !post.isBookmarked) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSubtitle = (post.subtitle || '').toLowerCase().includes(q);
        const matchesAuthor =
          (post.author.name || '').toLowerCase().includes(q) ||
          (post.author.handle || '').toLowerCase().includes(q) ||
          (post.author.college || '').toLowerCase().includes(q);
        const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesAuthor && !matchesTags) {
          return false;
        }
      }
      return true;
    });

    if (activeTab === 'trending') {
      return [...list].sort((a, b) => {
        const scoreA = (a.claps || 0) * 10 + (a.views || 0);
        const scoreB = (b.claps || 0) * 10 + (b.views || 0);
        return scoreB - scoreA;
      });
    }
    if (activeTab === 'latest') {
      return [...list].sort((a, b) => parseBlogDateToTime(b.publishedAt) - parseBlogDateToTime(a.publishedAt));
    }
    if (activeTab === 'bookmarks') {
      return [...list].sort((a, b) => parseBlogDateToTime(b.publishedAt) - parseBlogDateToTime(a.publishedAt));
    }
    return list;
  }, [posts, selectedCategory, searchQuery, activeTab]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = ['Title', 'Category', 'Author', 'College', 'Read Time', 'Published Date', 'Claps', 'Comments', 'Tags'];
    const rows = filteredPosts.map((p) => [
      `"${(p.title || '').replace(/"/g, '""')}"`,
      `"${p.category || ''}"`,
      `"${(p.author?.name || '').replace(/"/g, '""')}"`,
      `"${(p.author?.college || p.author?.institute || '').replace(/"/g, '""')}"`,
      `"${p.readTime || ''}"`,
      `"${formatBlogDate(p.publishedAt)}"`,
      p.claps || 0,
      p.commentsCount || 0,
      `"${(p.tags || []).join(', ')}"`,
    ]);

    const csvData = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tech_blogs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle Clap / Upvote (Additive applause system)
  const handleToggleClap = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();

    const currentPost = posts.find((p) => p.id === id);
    if (currentPost?.hasLiked) {
      toast.info('You have already clapped for this story!', 'Already Clapped');
      return;
    }

    const prevLiked = currentPost?.hasLiked ?? false;
    const prevClaps = currentPost?.claps ?? 0;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          return { ...p, hasLiked: true, claps: p.claps + 1 };
        }
        return p;
      })
    );

    if (selectedBlog?.id === id) {
      setSelectedBlog((prev) => {
        if (!prev) return null;
        return { ...prev, hasLiked: true, claps: prev.claps + 1 };
      });
    }

    try {
      if (id && !id.startsWith('blog-')) {
        await apiService.clapBlog(id);
      }
      toast.success('Clap added to story!', 'Clap Added');
    } catch (err) {
      console.warn('Backend clap warning:', err);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === id) {
            return { ...p, hasLiked: prevLiked, claps: prevClaps };
          }
          return p;
        })
      );
      if (selectedBlog?.id === id) {
        setSelectedBlog((prev) => {
          if (!prev) return null;
          return { ...prev, hasLiked: prevLiked, claps: prevClaps };
        });
      }
      toast.error('Failed to clap for story. Please try again.', 'Clap Failed');
    }
  };

  // Handle Bookmark
  const handleToggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const isBookmarked = !p.isBookmarked;
          toast.success(isBookmarked ? 'Article saved to your reading list!' : 'Removed from saved reading list.', 'Bookmarks');
          return { ...p, isBookmarked };
        }
        return p;
      })
    );
    if (selectedBlog?.id === id) {
      setSelectedBlog((prev) => (prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null));
    }
  };

  // Handle Share with async / await and error catching
  const handleShare = async (post: BlogPost, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${window.location.origin}/students/blogs#${post.id}`);
        toast.success('Story link copied to clipboard!', 'Link Copied');
      } catch {
        toast.error('Failed to copy link to clipboard.', 'Copy Error');
      }
    } else {
      toast.error('Clipboard copy is not supported on this device.', 'Copy Error');
    }
  };

  // Handle Add Comment
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedBlog) return;
    const targetBlogId = selectedBlog.id;
    const textToSend = commentText.trim();
    let newC = {
      id: `c-${Date.now()}`,
      author: 'You (Student)',
      avatarBg: '#2563EB',
      time: 'Just now',
      text: textToSend,
    };

    try {
      if (targetBlogId && !targetBlogId.startsWith('blog-')) {
        const savedComment = await apiService.addBlogComment(targetBlogId, textToSend);
        if (savedComment) {
          newC = {
            ...newC,
            id: savedComment.id || newC.id,
            author: savedComment.author?.name || newC.author,
            time: 'Just now',
          };
        }
      }

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === targetBlogId) {
            return {
              ...p,
              commentsCount: p.commentsCount + 1,
              comments: [newC, ...(p.comments || [])],
            };
          }
          return p;
        })
      );

      setSelectedBlog((prev) => {
        if (!prev || prev.id !== targetBlogId) return prev;
        return {
          ...prev,
          commentsCount: prev.commentsCount + 1,
          comments: [newC, ...(prev.comments || [])],
        };
      });

      setCommentText((currentDraft) => {
        if (selectedBlog?.id === targetBlogId && currentDraft === textToSend) {
          return '';
        }
        return currentDraft;
      });
      toast.success('Your comment was posted to the discussion!', 'Comment Added');
    } catch (err) {
      console.error('Backend comment persistence error:', err);
      toast.error('Failed to post comment. Please try again.', 'Comment Error');
    }
  };

  // Handle Create Post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter a title and story content.', 'Incomplete Story');
      return;
    }

    const tagsArr = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const safeCoverImage =
      newCoverImg && !newCoverImg.startsWith('blob:')
        ? newCoverImg
        : DEFAULT_COVER_OPTIONS[0];

    const wordCount = (newContent.trim().split(/\s+/).filter(Boolean).length) || 120;
    const computedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

    let createdPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'A detailed walkthrough and technical breakdown.',
      category: newCategory,
      readTime: computedReadTime,
      publishedAt: new Date().toISOString(),
      coverImage: safeCoverImage,
      author: {
        name: 'You (Student)',
        avatarBg: '#2563EB',
        role: 'Full Stack Learner',
        college: 'Your Institution',
        handle: '@you_student',
        isVerified: true,
      },
      tags: tagsArr,
      claps: 1,
      commentsCount: 0,
      views: 12,
      isBookmarked: false,
      hasLiked: true,
      content: newContent,
      comments: [],
    };

    try {
      const serverBlog = await apiService.createBlog({
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || 'A detailed walkthrough and technical breakdown.',
        category: newCategory,
        readTime: computedReadTime,
        coverImage: safeCoverImage,
        content: newContent,
        tags: tagsArr,
        status: 'Published',
      });
      if (serverBlog?.id) {
        createdPost = serverBlog;
      }

      setPosts((prev) => [createdPost, ...prev]);
      setWriteModalOpen(false);
      setNewTitle('');
      setNewSubtitle('');
      setNewContent('');
      toast.success('Your tech article is now published live on SkillOS Blogs!', 'Story Published');
    } catch (err) {
      console.error('Failed to publish blog:', err);
      toast.error('Failed to publish article. Please check your connection and try again.', 'Publish Failed');
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ========================================================================= */}
      {/* 1. HERO HEADER (Matching Bootcamps & Courses Gold Standard)             */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              bgcolor: '#EFF6FF',
              background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
              flexShrink: 0,
            }}
          >
            <ArticleOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 0.3 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', md: '1.45rem' }, letterSpacing: '-0.02em' }}>
                Tech Blogs & Engineering Articles
              </Typography>
              <Chip
                label="SkillOS Publications"
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 22,
                  border: '1px solid #DBEAFE',
                }}
              />
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#D97706 !important' }} />}
                label="Student Knowledge Hub"
                size="small"
                sx={{
                  bgcolor: 'rgba(245, 158, 11, 0.08)',
                  color: '#D97706',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.86rem', color: '#64748B' }}>
              Explore deep architecture post-mortems, algorithm breakdowns, contest recaps, and interview experiences.
            </Typography>
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 17 }} />}
            onClick={handleExportCSV}
            sx={{
              bgcolor: '#FFFFFF',
              borderColor: '#CBD5E1',
              color: '#334155',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px',
              px: 2,
              py: 0.9,
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<EditNoteRoundedIcon />}
            onClick={() => setWriteModalOpen(true)}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.88rem',
              px: 2.6,
              py: 0.9,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
              '&:hover': { bgcolor: '#1D4ED8', transform: 'translateY(-1px)' },
              transition: 'all 0.18s ease',
            }}
          >
            Write Story
          </Button>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. CATEGORY FILTER CHIPS SCROLL BAR                                       */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          '::-webkit-scrollbar': { height: 4 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 4 },
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(0);
              }}
              sx={{
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.82rem',
                borderRadius: '10px',
                bgcolor: isSelected ? '#2563EB' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#475569',
                border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.2)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: isSelected ? '#1D4ED8' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#0F172A',
                },
              }}
            />
          );
        })}
      </Box>

      {/* ========================================================================= */}
      {/* 3. CARD CONTAINER WITH CONTROLS, GRID & LIST TABLE VIEWS                   */}
      {/* ========================================================================= */}
      <Card
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Controls Bar */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: { xs: 'stretch', lg: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Status Tabs */}
          <Tabs
            value={activeTab}
            onChange={(_, val) => {
              setActiveTab(val);
              setPage(0);
            }}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                fontSize: '0.84rem',
                fontWeight: 700,
                textTransform: 'none',
                color: '#64748B',
                '&.Mui-selected': { color: '#2563EB' },
              },
              '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            <Tab
              icon={<TrendingUpRoundedIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Trending Stories"
              value="trending"
            />
            <Tab
              label="Latest Releases"
              value="latest"
            />
            <Tab
              icon={<BookmarkRoundedIcon sx={{ fontSize: 17 }} />}
              iconPosition="start"
              label="Saved Bookmarks"
              value="bookmarks"
            />
          </Tabs>

          {/* Search, Category Select, & Grid/List Switcher */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search topics, tags, authors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                minWidth: { xs: '100%', sm: 260 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.84rem',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#2563EB', bgcolor: '#FFFFFF' },
                },
              }}
            />

            <FormControl size="small" sx={{ minWidth: 170 }}>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
                sx={{
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#334155',
                }}
              >
                {CATEGORIES.map((cat) => (
                  <MenuItem key={cat} value={cat} sx={{ fontSize: '0.84rem' }}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* View Mode Toggle: Grid & List */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, val) => {
                if (val) setViewMode(val);
              }}
              size="small"
              aria-label="view mode toggle"
              sx={{
                bgcolor: '#F1F5F9',
                borderRadius: '10px',
                p: '3px',
                border: '1px solid #E2E8F0',
                '& .MuiToggleButton-root': {
                  border: 'none',
                  borderRadius: '8px !important',
                  px: 1.5,
                  py: 0.6,
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  gap: 0.6,
                  transition: 'all 0.18s ease',
                  '&.Mui-selected': {
                    bgcolor: '#FFFFFF',
                    color: '#2563EB',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    fontWeight: 800,
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.8)',
                  },
                },
              }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <GridViewRoundedIcon sx={{ fontSize: 17 }} />
                <span>Grid</span>
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListRoundedIcon sx={{ fontSize: 17 }} />
                <span>List</span>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* Empty State */}
        {filteredPosts.length === 0 ? (
          <Box sx={{ py: 10, px: 3, textAlign: 'center', bgcolor: '#F8FAFC' }}>
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', mb: 0.5 }}>
              No stories found
            </Typography>
            <Typography sx={{ fontSize: '0.86rem', color: '#64748B', mb: 2 }}>
              Try searching for another topic or reset the category and search filters.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSelectedCategory('All Stories');
                setSearchQuery('');
                setActiveTab('trending');
              }}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB', borderColor: '#2563EB' }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : viewMode === 'grid' ? (
          /* ========================================================================= */
          /* 4. GRID VIEW RENDERING (Matching Bootcamps & Courses Design Standard)     */
          /* ========================================================================= */
          <Box
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              bgcolor: '#F8FAFC',
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(260px, 1fr))',
                md: 'repeat(auto-fill, minmax(280px, 1fr))',
                lg: 'repeat(auto-fill, minmax(285px, 1fr))',
              },
              columnGap: { xs: 1.5, sm: 2, md: 2 },
              rowGap: { xs: 4, sm: 5, md: 5 },
            }}
          >
            {filteredPosts
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((post, idx) => {
                const isTopTrending = activeTab === 'trending' && idx === 0 && page === 0;
                const theme = getBlogThemeConfig(post.category);
                return (
                  <Card
                    key={post.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Read story: ${post.title}`}
                    onClick={() => handleOpenBlog(post)}
                    onKeyDown={(e) => {
                      if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleOpenBlog(post);
                      }
                    }}
                    sx={{
                      width: '100%',
                      borderRadius: '18px',
                      bgcolor: '#FFFFFF',
                      border: 'none',
                      boxShadow: 'none',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {/* ========================================================================= */}
                    {/* TOP 3D ARTWORK BANNER WITH SIGNATURE SLANT CLIPPED CUTOUT */}
                    {/* ========================================================================= */}
                    <Box
                      sx={{
                        height: 200,
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: theme.tagBg,
                      }}
                    >
                      <Box
                        component="img"
                        className="card-cover-img"
                        src={post.coverImage || DEFAULT_COVER_OPTIONS[0]}
                        alt={post.title}
                        onError={(e: any) => {
                          e.currentTarget.src = DEFAULT_COVER_OPTIONS[0];
                        }}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'center',
                          display: 'block',
                          transition: 'transform 0.4s ease',
                          '&:hover': {
                            transform: 'scale(1.04)',
                          },
                        }}
                      />

                      {/* Status Pill Badge Overlay (Matching Bootcamps) */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: 14,
                          zIndex: 3,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          background: isTopTrending
                            ? 'linear-gradient(135deg, rgba(120, 53, 15, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                            : theme.badgeBg,
                          backdropFilter: 'blur(12px)',
                          px: 1.3,
                          py: 0.5,
                          borderRadius: '9999px',
                          border: isTopTrending
                            ? '1px solid rgba(251, 191, 36, 0.45)'
                            : theme.badgeBorder,
                          boxShadow: isTopTrending
                            ? '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(245, 158, 11, 0.25)'
                            : theme.badgeShadow,
                        }}
                      >
                        {isTopTrending ? (
                          <LocalFireDepartmentRoundedIcon
                            sx={{
                              fontSize: 14,
                              color: '#FBBF24',
                              filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.9))',
                            }}
                          />
                        ) : (
                          <RocketLaunchRoundedIcon
                            sx={{
                              fontSize: 13,
                              color: theme.badgeIconColor,
                              filter: `drop-shadow(0 0 4px ${theme.badgeIconColor})`,
                            }}
                          />
                        )}

                        <Typography
                          sx={{
                            color: isTopTrending ? '#FFFBEB' : theme.badgeText,
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {isTopTrending ? 'TRENDING STORY' : theme.badgeLabel}
                        </Typography>
                      </Box>

                      {/* Sharp Slant Clipped Shape Transition at Top (Fills with Pure White) */}
                      <svg
                        viewBox="0 0 320 38"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: 'absolute',
                          bottom: -1,
                          left: 0,
                          width: '100%',
                          height: '38px',
                          zIndex: 5,
                          pointerEvents: 'none',
                        }}
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 0 38 L 0 26 L 85 26 L 118 0 L 320 0 L 320 38 Z"
                          fill="#FFFFFF"
                        />
                      </svg>
                    </Box>

                    {/* ========================================================================= */}
                    {/* CARD CONTENT BODY WITH CLEAN MINIMAL INFO */}
                    {/* ========================================================================= */}
                    <Box
                      sx={{
                        px: 2.5,
                        pt: 1.4,
                        pb: 1.4,
                        display: 'flex',
                        flexDirection: 'column',
                        flexGrow: 1,
                        bgcolor: '#FFFFFF',
                      }}
                    >
                      {/* Track / Category Badge & Enrolled/Read Count */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Chip
                          label={post.category}
                          size="small"
                          sx={{
                            bgcolor: theme.tagBg,
                            color: theme.tagText,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            height: 22,
                            borderRadius: '6px',
                          }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <PeopleAltRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>
                            {post.views || 860} readers
                          </Typography>
                        </Box>
                      </Box>

                      {/* Blog Story Title */}
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 800,
                          fontSize: '1.08rem',
                          lineHeight: 1.34,
                          color: '#0F172A',
                          mb: 0.8,
                          letterSpacing: '-0.015em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '2.7em',
                        }}
                      >
                        {post.title}
                      </Typography>

                      {/* Author Line */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.6 }}>
                        <SchoolRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                        <Typography
                          sx={{
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#475569',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {post.author.name}
                        </Typography>
                      </Box>

                      {/* Highlights Specs Row */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 'auto',
                          pt: 1,
                          borderTop: '1px solid #F8FAFC',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                          <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>
                            {post.readTime}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.4,
                            bgcolor: 'rgba(245, 158, 11, 0.08)',
                            px: 1,
                            py: 0.3,
                            borderRadius: '6px',
                          }}
                        >
                          <BoltRoundedIcon sx={{ fontSize: 14, color: '#D97706' }} />
                          <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#D97706' }}>
                            {post.claps} Claps
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* ========================================================================= */}
                    {/* CARD FOOTER WITH SIGNATURE CLIPPED NOTCH & PILL BUTTON */}
                    {/* ========================================================================= */}
                    <Box
                      sx={{
                        position: 'relative',
                        mt: 'auto',
                        height: 48,
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        pl: 2.5,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Bottom-Right Clipped Notch Backdrop (Pocket for Floating Pill Button) */}
                      <svg
                        viewBox="0 0 320 48"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '100%',
                          height: '48px',
                          zIndex: 1,
                          pointerEvents: 'none',
                        }}
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 140 48 L 173 0 L 320 0 L 320 48 Z"
                          fill="#F8FAFC"
                        />
                      </svg>

                      {/* Left Side: Published Date */}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.6,
                          minWidth: 0,
                          maxWidth: 'calc(100% - 132px)',
                          pr: 0.5,
                        }}
                      >
                        <CalendarTodayRoundedIcon sx={{ fontSize: 13.5, color: '#94A3B8', flexShrink: 0 }} />
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#64748B',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {formatBlogDate(post.publishedAt)}
                        </Typography>
                      </Box>

                      {/* Right Side: Floating Pill Action Button Shifted Right at Base */}
                      <Box
                        sx={{
                          position: 'absolute',
                          right: -0.5,
                          bottom: 0,
                          zIndex: 2,
                        }}
                      >
                        <Button
                          variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenBlog(post);
                          }}
                          endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 14 }} />}
                          sx={{
                            height: 38,
                            borderRadius: '9999px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.82rem',
                            px: 2.2,
                            bgcolor: theme.btnBg,
                            color: '#FFFFFF',
                            boxShadow: `0 4px 12px ${theme.btnBg}40`,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: theme.btnHover,
                              transform: 'scale(1.03)',
                              boxShadow: `0 6px 16px ${theme.btnBg}60`,
                            },
                          }}
                        >
                          Read Story
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                );
              })}
          </Box>
        ) : (
          /* ========================================================================= */
          /* 5. LIST TABLE VIEW RENDERING (Rule 10 Data Presentation Standard)        */
          /* ========================================================================= */
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5 }}>
                    Story & Overview
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 220 }}>
                    Category & Tags
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 200 }}>
                    Author & Campus
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 160 }}>
                    Read Time & Date
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 140 }}>
                    Engagement
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', py: 1.5, width: 140 }}>
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPosts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((post) => (
                    <TableRow
                      key={post.id}
                      hover
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(248, 250, 252, 0.9)' },
                        transition: 'background-color 0.15s ease',
                      }}
                      onClick={() => handleOpenBlog(post)}
                    >
                      {/* Story & Overview */}
                      <TableCell sx={{ py: 1.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            component="img"
                            src={post.coverImage || DEFAULT_COVER_OPTIONS[0]}
                            alt={post.title}
                            onError={(e: any) => {
                              e.currentTarget.src = DEFAULT_COVER_OPTIONS[0];
                            }}
                            sx={{
                              width: 80,
                              height: 56,
                              borderRadius: '10px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              border: '1px solid #E2E8F0',
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: '#0F172A',
                                fontSize: '0.92rem',
                                lineHeight: 1.3,
                                mb: 0.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                '&:hover': { color: '#2563EB' },
                              }}
                            >
                              {post.title}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '0.78rem',
                                color: '#64748B',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {post.subtitle}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Category & Tags */}
                      <TableCell sx={{ py: 1.8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, alignItems: 'flex-start' }}>
                          <Chip
                            label={post.category}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(37, 99, 235, 0.08)',
                              color: '#2563EB',
                              fontWeight: 800,
                              fontSize: '0.7rem',
                              height: 20,
                            }}
                          />
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {post.tags.slice(0, 2).map((t) => (
                              <Typography key={t} sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                                #{t}
                              </Typography>
                            ))}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Author */}
                      <TableCell sx={{ py: 1.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar
                            src={post.author.avatarImg}
                            sx={{
                              width: 28,
                              height: 28,
                              bgcolor: post.author.avatarBg || '#2563EB',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {post.author.name[0]}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {post.author.name}
                              </Typography>
                              {post.author.isVerified && (
                                <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 13, flexShrink: 0 }} />
                              )}
                            </Box>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {post.author.college || post.author.institute || 'CodePlatform'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Read Time & Date */}
                      <TableCell sx={{ py: 1.8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                            {post.readTime}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {formatBlogDate(post.publishedAt)}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Engagement */}
                      <TableCell sx={{ py: 1.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: post.hasLiked ? '#EF4444' : '#64748B', fontSize: '0.78rem', fontWeight: 700 }}>
                            {post.hasLiked ? <FavoriteRoundedIcon sx={{ fontSize: 15 }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 15 }} />}
                            {post.claps}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#64748B', fontSize: '0.78rem', fontWeight: 600 }}>
                            <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 14 }} />
                            {post.commentsCount}
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ py: 1.8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => handleToggleBookmark(post.id, e)}
                            sx={{ color: post.isBookmarked ? '#2563EB' : '#94A3B8' }}
                          >
                            {post.isBookmarked ? <BookmarkRoundedIcon sx={{ fontSize: 17 }} /> : <BookmarkBorderRoundedIcon sx={{ fontSize: 17 }} />}
                          </IconButton>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBlog(post);
                            }}
                            sx={{
                              borderRadius: '6px',
                              textTransform: 'none',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              px: 1.5,
                              py: 0.4,
                              borderColor: '#2563EB',
                              color: '#2563EB',
                              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.08)', borderColor: '#1D4ED8' },
                            }}
                          >
                            Read
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[6, 9, 18, 36]}
          component="div"
          count={filteredPosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: '1px solid #F1F5F9' }}
        />
      </Card>

      {/* ========================================================================= */}
      {/* 6. Rich Article Reader Dialog                                             */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedBlog)}
        onClose={() => setSelectedBlog(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              maxHeight: '92vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          },
        }}
      >
        {selectedBlog && (
          <>
            {/* Header / Cover Banner with Image */}
            <Box
              sx={{
                height: { xs: 200, md: 280 },
                position: 'relative',
                overflow: 'hidden',
                color: '#FFFFFF',
              }}
            >
              <Box
                component="img"
                src={selectedBlog.coverImage}
                alt={selectedBlog.title}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15,23,42,0.6) 100%)',
                }}
              />

              <IconButton
                onClick={() => setSelectedBlog(null)}
                sx={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  color: '#FFFFFF',
                  bgcolor: 'rgba(0,0,0,0.4)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
                }}
              >
                <CloseRoundedIcon />
              </IconButton>

              <Box sx={{ position: 'absolute', bottom: 20, left: { xs: 20, md: 32 }, right: { xs: 20, md: 32 } }}>
                <Chip
                  label={selectedBlog.category}
                  size="small"
                  sx={{
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    mb: 1,
                  }}
                />

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.25rem', md: '1.55rem' },
                    lineHeight: 1.3,
                    mb: 1,
                  }}
                >
                  {selectedBlog.title}
                </Typography>

                {/* Author Strip */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar
                    src={selectedBlog.author.avatarImg}
                    sx={{ width: 34, height: 34, bgcolor: selectedBlog.author.avatarBg, fontWeight: 700 }}
                  >
                    {selectedBlog.author.name[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#FFFFFF' }}>
                      {selectedBlog.author.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                      {selectedBlog.author.role} • {selectedBlog.author.college} • {selectedBlog.readTime}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Article Body Content */}
            <DialogContent
              sx={{
                p: { xs: 3, md: 4 },
                overflowY: 'auto',
                fontSize: '0.96rem',
                color: '#1E293B',
                lineHeight: 1.7,
              }}
            >
              {/* Formatted Markdown Display */}
              <Box sx={{ mt: 1 }}>
                <MarkdownViewer content={selectedBlog.content} />
              </Box>

              {/* Tags inside reader */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
                {selectedBlog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: '0.78rem' }}
                  />
                ))}
              </Box>

              {/* Social Reaction Bar */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  bgcolor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant={selectedBlog.hasLiked ? 'contained' : 'outlined'}
                    onClick={() => handleToggleClap(selectedBlog.id)}
                    startIcon={selectedBlog.hasLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      bgcolor: selectedBlog.hasLiked ? '#EF4444' : 'transparent',
                      color: selectedBlog.hasLiked ? '#FFFFFF' : '#EF4444',
                      borderColor: '#FCA5A5',
                      '&:hover': { bgcolor: selectedBlog.hasLiked ? '#DC2626' : '#FEF2F2' },
                    }}
                  >
                    {selectedBlog.claps} Claps
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ShareRoundedIcon />}
                    onClick={() => handleShare(selectedBlog)}
                    sx={{
                      borderRadius: '10px',
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#475569',
                      borderColor: '#CBD5E1',
                      '&:hover': { borderColor: '#94A3B8', bgcolor: '#F1F5F9' },
                    }}
                  >
                    Share Article
                  </Button>
                </Box>

                <IconButton
                  aria-label={selectedBlog.isBookmarked ? 'Remove from bookmarks' : 'Save bookmark'}
                  onClick={() => handleToggleBookmark(selectedBlog.id)}
                  sx={{ color: selectedBlog.isBookmarked ? '#2563EB' : '#94A3B8' }}
                >
                  {selectedBlog.isBookmarked ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
                </IconButton>
              </Box>

              {/* Comments / Discussion Thread */}
              <Box sx={{ mt: 3 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', mb: 1.5 }}>
                  Discussion & Responses ({selectedBlog.commentsCount})
                </Typography>

                {/* Comment Input */}
                <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={2}
                    placeholder="Write a thoughtful response or ask a question..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        fontSize: '0.86rem',
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddComment}
                    disabled={!commentText.trim()}
                    sx={{
                      bgcolor: '#2563EB',
                      borderRadius: '12px',
                      px: 2.5,
                      fontWeight: 700,
                      textTransform: 'none',
                    }}
                  >
                    <SendRoundedIcon fontSize="small" />
                  </Button>
                </Box>

                {/* Comments List */}
                {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedBlog.comments.map((comm) => (
                      <Box
                        key={comm.id}
                        sx={{
                          p: 2,
                          bgcolor: '#F8FAFC',
                          borderRadius: '12px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 26, height: 26, bgcolor: comm.avatarBg, fontSize: '0.72rem', fontWeight: 700 }}>
                              {comm.author[0]}
                            </Avatar>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                              {comm.author}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                            {comm.time}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: '0.84rem', color: '#334155', pl: 4.2 }}>
                          {comm.text}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography sx={{ fontSize: '0.84rem', color: '#94A3B8', fontStyle: 'italic' }}>
                    No responses yet. Be the first to share your thoughts!
                  </Typography>
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ========================================================================= */}
      {/* 7. Write New Story / Publication Composer Modal                           */}
      {/* ========================================================================= */}
      <Dialog
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '24px',
              p: 1,
              maxHeight: '94vh',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditNoteRoundedIcon sx={{ color: '#2563EB' }} />
            Write & Publish Story
          </Box>
          <IconButton size="small" onClick={() => setWriteModalOpen(false)}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handlePublishPost}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.2, pt: 1 }}>
            <TextField
              label="Article Title"
              size="small"
              fullWidth
              required
              placeholder="e.g. How We Reduced Postgres CPU Spikes by 70% with Connection Pooling"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { fontWeight: 700, borderRadius: '12px' } }}
            />

            <TextField
              label="Subtitle / Short Excerpt"
              size="small"
              fullWidth
              placeholder="Brief 1-2 sentence overview shown in the article feed..."
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Category"
                size="small"
                select
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              >
                {CATEGORIES.filter((c) => c !== 'All Stories').map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Tags (comma separated)"
                size="small"
                fullWidth
                placeholder="e.g. Postgres, DistributedSystems, Node"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
              />
            </Box>

            {/* Cover Picture Selector */}
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Cover Picture
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  <Button
                    size="small"
                    variant={coverSelectionMode === 'preset' ? 'contained' : 'outlined'}
                    onClick={() => setCoverSelectionMode('preset')}
                    startIcon={<ImageRoundedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      ...(coverSelectionMode === 'preset'
                        ? { bgcolor: '#2563EB', color: '#fff', '&:hover': { bgcolor: '#1D4ED8' } }
                        : { color: '#475569', borderColor: '#CBD5E1', bgcolor: '#FFFFFF' }),
                    }}
                  >
                    Presets
                  </Button>
                  <Button
                    size="small"
                    variant={coverSelectionMode === 'upload' ? 'contained' : 'outlined'}
                    onClick={() => setCoverSelectionMode('upload')}
                    startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      ...(coverSelectionMode === 'upload'
                        ? { bgcolor: '#2563EB', color: '#fff', '&:hover': { bgcolor: '#1D4ED8' } }
                        : { color: '#475569', borderColor: '#CBD5E1', bgcolor: '#FFFFFF' }),
                    }}
                  >
                    Choose Picture
                  </Button>
                  <Button
                    size="small"
                    variant={coverSelectionMode === 'url' ? 'contained' : 'outlined'}
                    onClick={() => setCoverSelectionMode('url')}
                    startIcon={<LinkRoundedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      ...(coverSelectionMode === 'url'
                        ? { bgcolor: '#2563EB', color: '#fff', '&:hover': { bgcolor: '#1D4ED8' } }
                        : { color: '#475569', borderColor: '#CBD5E1', bgcolor: '#FFFFFF' }),
                    }}
                  >
                    Image URL
                  </Button>
                </Box>
              </Box>

              {/* Mode: Preset Gallery */}
              {coverSelectionMode === 'preset' && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
                  {DEFAULT_COVER_OPTIONS.map((imgUrl, i) => (
                    <Box
                      key={i}
                      component="button"
                      type="button"
                      aria-label={`Select cover image option ${i + 1}`}
                      onClick={() => setNewCoverImg(imgUrl)}
                      sx={{
                        height: 52,
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: newCoverImg === imgUrl ? '2.5px solid #2563EB' : '1px solid #CBD5E1',
                        transform: newCoverImg === imgUrl ? 'scale(1.04)' : 'scale(1)',
                        transition: 'all 0.15s ease',
                        p: 0,
                        background: 'none',
                      }}
                    >
                      <Box component="img" src={imgUrl} alt={`Option ${i + 1}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </Box>
                  ))}
                </Box>
              )}

              {/* Mode: Upload Picture from Device */}
              {coverSelectionMode === 'upload' && (
                <Box>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleCoverUpload}
                  />
                  <Box
                    role="button"
                    tabIndex={isUploadingCover ? -1 : 0}
                    aria-disabled={isUploadingCover}
                    aria-label="Choose cover picture from device"
                    onClick={() => !isUploadingCover && fileInputRef.current?.click()}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && !isUploadingCover) {
                        e.preventDefault();
                        fileInputRef.current?.click();
                      }
                    }}
                    sx={{
                      border: '2px dashed #CBD5E1',
                      borderRadius: '10px',
                      p: 2.2,
                      textAlign: 'center',
                      bgcolor: '#FFFFFF',
                      cursor: isUploadingCover ? 'wait' : 'pointer',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      '&:hover, &:focus-visible': {
                        borderColor: '#2563EB',
                        bgcolor: '#F0F7FF',
                        boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 0.8,
                    }}
                  >
                    {isUploadingCover ? (
                      <>
                        <CircularProgress size={24} sx={{ color: '#2563EB' }} />
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#2563EB' }}>
                          Uploading picture to cloud storage...
                        </Typography>
                      </>
                    ) : (
                      <>
                        <CloudUploadRoundedIcon sx={{ fontSize: 28, color: '#2563EB' }} />
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                          Click to choose a picture from your device
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          PNG, JPG, WebP, SVG (Max 10MB)
                        </Typography>
                      </>
                    )}
                  </Box>
                </Box>
              )}

              {/* Mode: Image URL */}
              {coverSelectionMode === 'url' && (
                <TextField
                  size="small"
                  fullWidth
                  placeholder="https://images.unsplash.com/..."
                  value={newCoverImg}
                  onChange={(e) => setNewCoverImg(e.target.value)}
                  sx={{ bgcolor: '#FFFFFF' }}
                />
              )}

              {/* Current Preview */}
              {newCoverImg && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 0.5, borderTop: '1px solid #E2E8F0' }}>
                  <Box
                    component="img"
                    src={newCoverImg}
                    alt="Cover Preview"
                    onError={(e: any) => {
                      e.currentTarget.src = DEFAULT_COVER_OPTIONS[0];
                    }}
                    sx={{
                      width: 80,
                      height: 46,
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> Selected Cover
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {newCoverImg}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Content Tabs (Write vs Preview) & Live Auto Read Time */}
            <Box sx={{ borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  onClick={() => setWriteTab('edit')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    color: writeTab === 'edit' ? '#2563EB' : '#64748B',
                    borderBottom: writeTab === 'edit' ? '2px solid #2563EB' : 'none',
                    borderRadius: 0,
                  }}
                >
                  Write Markdown
                </Button>
                <Button
                  size="small"
                  onClick={() => setWriteTab('preview')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    color: writeTab === 'preview' ? '#2563EB' : '#64748B',
                    borderBottom: writeTab === 'preview' ? '2px solid #2563EB' : 'none',
                    borderRadius: 0,
                  }}
                >
                  Live Preview
                </Button>
              </Box>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#2563EB' }} />
                Read Time: <strong style={{ color: '#0F172A' }}>{Math.max(1, Math.ceil((newContent.trim().split(/\s+/).filter(Boolean).length || 100) / 180))} min read</strong> (auto-calculated)
              </Typography>
            </Box>

            {writeTab === 'edit' ? (
              <TipTapEditor
                content={newContent}
                onChange={setNewContent}
                placeholder="Write your article... Use the toolbar above for formatting, code blocks, tables, lists, and images."
                minHeight={260}
                maxHeight={360}
              />
            ) : (
              <Box
                sx={{
                  p: 2.5,
                  minHeight: 200,
                  maxHeight: 300,
                  overflowY: 'auto',
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}
              >
                <MarkdownViewer content={newContent || '_No content written yet..._'} />
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
            <Button onClick={() => setWriteModalOpen(false)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                bgcolor: '#2563EB',
                textTransform: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                px: 3,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Publish Article
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
