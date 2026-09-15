'use client';

import React, { useState, useMemo } from 'react';
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
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { useToast } from '@/context/ToastContext';

export interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  publishedAt: string;
  coverImage: string;
  author: {
    name: string;
    avatarBg: string;
    avatarImg?: string;
    role: string;
    college: string;
    handle: string;
    isVerified?: boolean;
  };
  tags: string[];
  claps: number;
  commentsCount: number;
  views: number;
  isBookmarked?: boolean;
  hasLiked?: boolean;
  content: string;
  comments?: {
    id: string;
    author: string;
    avatarBg: string;
    time: string;
    text: string;
  }[];
}

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

const INITIAL_BLOGS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Designing a Real-Time Distributed Leaderboard with Redis Sorted Sets & BullMQ',
    subtitle: 'A deep-dive architectural post-mortem on handling 500k concurrent score updates with sub-10ms p99 latency without database row contention.',
    category: 'System Architecture',
    readTime: '7 min read',
    publishedAt: 'Yesterday at 4:30 PM',
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
    publishedAt: '3 days ago',
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
    publishedAt: 'May 12, 2026',
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
    publishedAt: '5 days ago',
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
    publishedAt: '1 week ago',
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
    publishedAt: '2 weeks ago',
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
  const toast = useToast();

  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOGS);
  const [selectedCategory, setSelectedCategory] = useState('All Stories');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'bookmarks'>('trending');
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);

  // Writer Modal State
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('System Architecture');
  const [newTags, setNewTags] = useState('Backend, Distributed Systems');
  const [newContent, setNewContent] = useState('');
  const [writeTab, setWriteTab] = useState<'edit' | 'preview'>('edit');
  const [newCoverImg, setNewCoverImg] = useState(DEFAULT_COVER_OPTIONS[0]);

  // Comment input in Reader
  const [commentText, setCommentText] = useState('');

  // Filtering
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (selectedCategory !== 'All Stories' && post.category !== selectedCategory) {
        return false;
      }
      if (activeTab === 'bookmarks' && !post.isBookmarked) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesSubtitle = post.subtitle.toLowerCase().includes(q);
        const matchesAuthor = post.author.name.toLowerCase().includes(q) || post.author.handle.toLowerCase().includes(q);
        const matchesTags = post.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesAuthor && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [posts, selectedCategory, searchQuery, activeTab]);

  // Featured Spotlight Post
  const featuredPost = useMemo(() => {
    return posts.reduce((prev, curr) => (curr.claps > prev.claps ? curr : prev), posts[0]);
  }, [posts]);

  // Remaining Grid Posts (excluding featured in 'trending' view if no filters active)
  const gridPosts = useMemo(() => {
    if (selectedCategory === 'All Stories' && !searchQuery.trim() && activeTab === 'trending' && featuredPost) {
      return filteredPosts.filter((p) => p.id !== featuredPost.id);
    }
    return filteredPosts;
  }, [filteredPosts, selectedCategory, searchQuery, activeTab, featuredPost]);

  // Handle Clap / Upvote - Derived toast message from resulting hasLiked
  const handleToggleClap = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    let nextLiked = true;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const hasLiked = !p.hasLiked;
          nextLiked = hasLiked;
          const claps = hasLiked ? p.claps + 1 : p.claps - 1;
          return { ...p, hasLiked, claps };
        }
        return p;
      })
    );

    if (selectedBlog?.id === id) {
      setSelectedBlog((prev) => {
        if (!prev) return null;
        const hasLiked = !prev.hasLiked;
        const claps = hasLiked ? prev.claps + 1 : prev.claps - 1;
        return { ...prev, hasLiked, claps };
      });
    }

    if (nextLiked) {
      toast.success('Clap added to story!', 'Clap Added');
    } else {
      toast.success('Clap removed from story.', 'Clap Added');
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
  const handleAddComment = () => {
    if (!commentText.trim() || !selectedBlog) return;
    const newC = {
      id: `c-${Date.now()}`,
      author: 'You (Student)',
      avatarBg: '#2563EB',
      time: 'Just now',
      text: commentText.trim(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === selectedBlog.id) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [newC, ...(p.comments || [])],
          };
        }
        return p;
      })
    );

    setSelectedBlog((prev) =>
      prev
        ? {
            ...prev,
            commentsCount: prev.commentsCount + 1,
            comments: [newC, ...(prev.comments || [])],
          }
        : null
    );

    setCommentText('');
    toast.success('Your comment was posted to the discussion!', 'Comment Added');
  };

  // Handle Create Post
  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter a title and story content.', 'Incomplete Story');
      return;
    }

    const createdPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'A detailed walkthrough and technical breakdown.',
      category: newCategory,
      readTime: `${Math.max(3, Math.ceil(newContent.split(' ').length / 150))} min read`,
      publishedAt: 'Just now',
      coverImage: newCoverImg,
      author: {
        name: 'You (Student)',
        avatarBg: '#2563EB',
        role: 'Full Stack Learner',
        college: 'Your Institution',
        handle: '@you_student',
        isVerified: true,
      },
      tags: newTags
        .split(',')
        .map((t) => t.trim().replace(/^#/, ''))
        .filter(Boolean),
      claps: 1,
      commentsCount: 0,
      views: 12,
      isBookmarked: false,
      hasLiked: true,
      content: newContent,
      comments: [],
    };

    setPosts([createdPost, ...posts]);
    setWriteModalOpen(false);
    setNewTitle('');
    setNewSubtitle('');
    setNewContent('');
    toast.success('Your tech article is now published live on SkillOS Blogs!', 'Story Published');
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, maxWidth: '1380px', margin: '0 auto' }}>
      {/* 1. Header Banner & Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '16px',
              bgcolor: '#EFF6FF',
              background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
            }}
          >
            <ArticleOutlinedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', md: '1.45rem' }, letterSpacing: '-0.02em' }}>
                Tech Blogs & Engineering Articles
              </Typography>
              <Chip
                label="SkillOS Publications"
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  height: 22,
                  border: '1px solid #DBEAFE',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.86rem', color: '#64748B', mt: 0.3 }}>
              Explore deep architecture post-mortems, algorithm breakdowns, contest recaps, and interview experiences.
            </Typography>
          </Box>
        </Box>

        {/* Right Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="contained"
            startIcon={<EditNoteRoundedIcon />}
            onClick={() => setWriteModalOpen(true)}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.88rem',
              px: 2.8,
              py: 1.1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
              '&:hover': { bgcolor: '#1D4ED8', transform: 'translateY(-1px)' },
              transition: 'all 0.18s ease',
            }}
          >
            Write Story
          </Button>
        </Box>
      </Box>

      {/* 2. Category Filter Scroll Bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1.5,
          mb: 3,
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
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: isSelected ? 700 : 500,
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

      {/* 3. Feed Controls Bar (Search + Tab Switcher) */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3.5,
          bgcolor: '#FFFFFF',
          p: 1.5,
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        {/* Tabs */}
        <Box sx={{ display: 'flex', bgcolor: '#F1F5F9', p: 0.5, borderRadius: '12px' }}>
          <Button
            size="small"
            onClick={() => setActiveTab('trending')}
            startIcon={<TrendingUpRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '9px',
              px: 2,
              py: 0.6,
              bgcolor: activeTab === 'trending' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'trending' ? '#0F172A' : '#64748B',
              boxShadow: activeTab === 'trending' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              '&:hover': { bgcolor: activeTab === 'trending' ? '#FFFFFF' : 'rgba(0,0,0,0.03)' },
            }}
          >
            Trending Stories
          </Button>
          <Button
            size="small"
            onClick={() => setActiveTab('latest')}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '9px',
              px: 2,
              py: 0.6,
              bgcolor: activeTab === 'latest' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'latest' ? '#0F172A' : '#64748B',
              boxShadow: activeTab === 'latest' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              '&:hover': { bgcolor: activeTab === 'latest' ? '#FFFFFF' : 'rgba(0,0,0,0.03)' },
            }}
          >
            Latest Releases
          </Button>
          <Button
            size="small"
            onClick={() => setActiveTab('bookmarks')}
            startIcon={<BookmarkRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderRadius: '9px',
              px: 2,
              py: 0.6,
              bgcolor: activeTab === 'bookmarks' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'bookmarks' ? '#0F172A' : '#64748B',
              boxShadow: activeTab === 'bookmarks' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              '&:hover': { bgcolor: activeTab === 'bookmarks' ? '#FFFFFF' : 'rgba(0,0,0,0.03)' },
            }}
          >
            Saved Bookmarks
          </Button>
        </Box>

        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search topics, tags, authors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: '100%', sm: 320 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              fontSize: '0.84rem',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#2563EB', bgcolor: '#FFFFFF' },
            },
          }}
        />
      </Box>

      {/* 4. Featured Spotlight Story Card (Magazine Style) */}
      {featuredPost && selectedCategory === 'All Stories' && !searchQuery.trim() && activeTab === 'trending' && (
        <Card
          role="button"
          tabIndex={0}
          aria-label={`Read featured story: ${featuredPost.title}`}
          onClick={() => setSelectedBlog(featuredPost)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedBlog(featuredPost);
            }
          }}
          sx={{
            mb: 4,
            borderRadius: '24px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
            cursor: 'pointer',
            bgcolor: '#FFFFFF',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              borderColor: '#93C5FD',
              transform: 'translateY(-3px)',
              boxShadow: '0 20px 40px rgba(37, 99, 235, 0.09)',
              '& .spotlight-img': {
                transform: 'scale(1.04)',
              },
            },
            '&:focus-visible': {
              outline: '2px solid #2563EB',
              outlineOffset: '2px',
            },
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' } }}>
            {/* Left Image Cover */}
            <Box sx={{ height: { xs: '220px', md: '340px' }, position: 'relative', overflow: 'hidden' }}>
              <Box
                component="img"
                className="spotlight-img"
                src={featuredPost.coverImage}
                alt={featuredPost.title}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.4s ease',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.1) 60%)',
                }}
              />
              {/* Badges on Image */}
              <Box sx={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 1 }}>
                <Chip
                  icon={<LocalFireDepartmentRoundedIcon sx={{ '&&': { color: '#F59E0B', fontSize: 16 } }} />}
                  label="Featured Spotlight"
                  sx={{
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                />
                <Chip
                  label={featuredPost.category}
                  sx={{
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                />
              </Box>

              <Box sx={{ position: 'absolute', bottom: 14, left: 16 }}>
                <Typography sx={{ color: '#FFFFFF', fontSize: '0.78rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 14 }} /> {featuredPost.readTime} • {featuredPost.publishedAt}
                </Typography>
              </Box>
            </Box>

            {/* Right Details */}
            <Box sx={{ p: { xs: 3, md: 4 }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                {/* Author Strip */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                  <Avatar
                    src={featuredPost.author.avatarImg}
                    sx={{ width: 36, height: 36, bgcolor: featuredPost.author.avatarBg, fontWeight: 700, fontSize: '0.85rem' }}
                  >
                    {featuredPost.author.name[0]}
                  </Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                        {featuredPost.author.name}
                      </Typography>
                      {featuredPost.author.isVerified && (
                        <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 15 }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {featuredPost.author.role} • {featuredPost.author.college}
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    fontSize: { xs: '1.18rem', md: '1.38rem' },
                    lineHeight: 1.35,
                    mb: 1.2,
                  }}
                >
                  {featuredPost.title}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '0.88rem',
                    color: '#475569',
                    lineHeight: 1.6,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    mb: 2.5,
                  }}
                >
                  {featuredPost.subtitle}
                </Typography>

                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
                  {featuredPost.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        bgcolor: '#F1F5F9',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.72rem',
                        height: 22,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Bottom Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                  <Box
                    component="button"
                    type="button"
                    aria-label={featuredPost.hasLiked ? 'Remove clap' : 'Add clap'}
                    onClick={(e) => handleToggleClap(featuredPost.id, e)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.6,
                      color: featuredPost.hasLiked ? '#EF4444' : '#64748B',
                      cursor: 'pointer',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      background: 'none',
                      border: 'none',
                      p: 0,
                      fontFamily: 'inherit',
                      '&:hover': { color: '#EF4444' },
                    }}
                  >
                    {featuredPost.hasLiked ? <FavoriteRoundedIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 18 }} />}
                    {featuredPost.claps}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#64748B', fontSize: '0.84rem', fontWeight: 600 }}>
                    <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 17 }} />
                    {featuredPost.commentsCount}
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    size="small"
                    aria-label={featuredPost.isBookmarked ? 'Remove from bookmarks' : 'Save bookmark'}
                    onClick={(e) => handleToggleBookmark(featuredPost.id, e)}
                    sx={{ color: featuredPost.isBookmarked ? '#2563EB' : '#94A3B8' }}
                  >
                    {featuredPost.isBookmarked ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
                  </IconButton>

                  <IconButton
                    size="small"
                    aria-label="Share story"
                    onClick={(e) => handleShare(featuredPost, e)}
                    sx={{ color: '#94A3B8' }}
                  >
                    <ShareRoundedIcon fontSize="small" />
                  </IconButton>

                  <Button
                    size="small"
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#2563EB',
                      fontSize: '0.82rem',
                    }}
                  >
                    Read Story
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Card>
      )}

      {/* 5. Articles RESPONSIVE GRID BOXES Layout */}
      {gridPosts.length === 0 ? (
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            border: '1px dashed #CBD5E1',
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', mb: 0.5 }}>
            No stories found
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', color: '#64748B' }}>
            Try searching for another topic or reset the category filter.
          </Typography>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {gridPosts.map((post) => (
            <Card
              key={post.id}
              role="button"
              tabIndex={0}
              aria-label={`Read story: ${post.title}`}
              onClick={() => setSelectedBlog(post)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedBlog(post);
                }
              }}
              sx={{
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.04)',
                bgcolor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'all 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: '#93C5FD',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 36px rgba(37, 99, 235, 0.1)',
                  '& .card-cover-img': {
                    transform: 'scale(1.06)',
                  },
                },
                '&:focus-visible': {
                  outline: '2px solid #2563EB',
                  outlineOffset: '2px',
                },
              }}
            >
              {/* Card Cover Image Header Box */}
              <Box
                sx={{
                  height: 170,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  component="img"
                  className="card-cover-img"
                  src={post.coverImage}
                  alt={post.title}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.35s ease',
                  }}
                />
                {/* Image Gradient Overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, rgba(15, 23, 42, 0.15) 60%)',
                  }}
                />

                {/* Floating Category Chip */}
                <Chip
                  label={post.category}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    height: 22,
                    border: '1px solid rgba(255,255,255,0.25)',
                  }}
                />

                {/* Floating Read Time Chip */}
                <Chip
                  label={post.readTime}
                  size="small"
                  icon={<AccessTimeRoundedIcon sx={{ '&&': { color: '#FFFFFF', fontSize: 13 } }} />}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(8px)',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.68rem',
                    height: 22,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}
                />

                {/* Published Date */}
                <Typography
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    left: 14,
                    color: '#F8FAFC',
                    fontSize: '0.72rem',
                    fontWeight: 500,
                  }}
                >
                  {post.publishedAt}
                </Typography>
              </Box>

              {/* Card Body Information Box */}
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'space-between' }}>
                <Box>
                  {/* Author Line */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                    <Avatar
                      src={post.author.avatarImg}
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: post.author.avatarBg,
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
                          <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 14, flexShrink: 0 }} />
                        )}
                      </Box>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.author.college}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Title */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                      color: '#0F172A',
                      fontSize: '1.02rem',
                      lineHeight: 1.35,
                      mb: 0.8,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      '&:hover': { color: '#2563EB' },
                      transition: 'color 0.15s ease',
                    }}
                  >
                    {post.title}
                  </Typography>

                  {/* Subtitle Excerpt */}
                  <Typography
                    sx={{
                      fontSize: '0.82rem',
                      color: '#64748B',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                    }}
                  >
                    {post.subtitle}
                  </Typography>

                  {/* Tech Tags */}
                  <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 2 }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <Chip
                        key={tag}
                        label={`#${tag}`}
                        size="small"
                        sx={{
                          bgcolor: '#F8FAFC',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 20,
                          border: '1px solid #E2E8F0',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Bottom Social Reaction Row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 1.5,
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                    <Box
                      component="button"
                      type="button"
                      aria-label={post.hasLiked ? 'Remove clap' : 'Add clap'}
                      onClick={(e) => handleToggleClap(post.id, e)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: post.hasLiked ? '#EF4444' : '#64748B',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: 'none',
                        border: 'none',
                        p: 0,
                        fontFamily: 'inherit',
                        '&:hover': { color: '#EF4444' },
                      }}
                    >
                      {post.hasLiked ? (
                        <FavoriteRoundedIcon sx={{ fontSize: 17 }} />
                      ) : (
                        <FavoriteBorderRoundedIcon sx={{ fontSize: 17 }} />
                      )}
                      {post.claps}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
                      <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      {post.commentsCount}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      aria-label={post.isBookmarked ? 'Remove from bookmarks' : 'Save bookmark'}
                      onClick={(e) => handleToggleBookmark(post.id, e)}
                      sx={{ color: post.isBookmarked ? '#2563EB' : '#94A3B8' }}
                    >
                      {post.isBookmarked ? <BookmarkRoundedIcon sx={{ fontSize: 18 }} /> : <BookmarkBorderRoundedIcon sx={{ fontSize: 18 }} />}
                    </IconButton>

                    <IconButton
                      size="small"
                      aria-label="Share story"
                      onClick={(e) => handleShare(post, e)}
                      sx={{ color: '#94A3B8' }}
                    >
                      <ShareRoundedIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </Card>
          ))}
        </Box>
      )}

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
              <Box
                sx={{
                  '& h2': { fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', mt: 2.5, mb: 1 },
                  '& h3': { fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', mt: 2, mb: 0.8 },
                  '& p': { mb: 1.8 },
                  '& pre': {
                    bgcolor: '#0F172A',
                    color: '#E2E8F0',
                    p: 2,
                    borderRadius: '12px',
                    overflowX: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    mb: 2,
                  },
                  '& blockquote': {
                    borderLeft: '4px solid #2563EB',
                    pl: 2,
                    py: 0.5,
                    my: 2,
                    bgcolor: '#EFF6FF',
                    borderRadius: '0 8px 8px 0',
                    fontStyle: 'italic',
                    color: '#1E3A8A',
                  },
                }}
              >
                <Box dangerouslySetInnerHTML={{ __html: formatArticleMarkdown(selectedBlog.content) }} />
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

            {/* Cover Image Picker */}
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', mb: 0.8 }}>
                Select Cover Image
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1.2 }}>
                {DEFAULT_COVER_OPTIONS.map((imgUrl, i) => (
                  <Box
                    key={i}
                    component="button"
                    type="button"
                    aria-label={`Select cover image option ${i + 1}`}
                    onClick={() => setNewCoverImg(imgUrl)}
                    sx={{
                      height: 52,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: newCoverImg === imgUrl ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      transform: newCoverImg === imgUrl ? 'scale(1.05)' : 'scale(1)',
                      transition: 'all 0.15s ease',
                      p: 0,
                      background: 'none',
                    }}
                  >
                    <Box component="img" src={imgUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Content Tabs (Write vs Preview) */}
            <Box sx={{ borderBottom: '1px solid #E2E8F0', display: 'flex', gap: 1 }}>
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

            {writeTab === 'edit' ? (
              <TextField
                label="Story Body (Markdown Supported)"
                size="small"
                fullWidth
                multiline
                rows={8}
                required
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder={`## Introduction\nDescribe the background, motivation, or challenge...\n\n### The Architecture & Code Snippet\nProvide clean explanations and code blocks.\n\n> Key takeaway: Keep performance in mind!`}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.86rem',
                    borderRadius: '12px',
                  },
                }}
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
                dangerouslySetInnerHTML={{
                  __html: formatArticleMarkdown(newContent || '_No content written yet..._'),
                }}
              />
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

// Sanitizer and Markdown helper that prevents raw HTML execution
function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatArticleMarkdown(raw: string): string {
  if (!raw) return '';
  const clean = sanitizeHtml(raw);
  return clean
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/^(&gt;|>)\s?(.*$)/gim, '<blockquote>$2</blockquote>')
    .replace(/\`\`\`([\s\S]*?)\`\`\`/gim, '<pre><code>$1</code></pre>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n$/gim, '<br />')
    .replace(/\n/g, '<br />');
}
