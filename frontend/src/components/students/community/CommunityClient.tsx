'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { FluidArrowUp } from '@/utils/fluid_arrow';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useToast } from '@/context/ToastContext';

interface ForumPost {
  id: string;
  title: string;
  channel: string;
  author: { name: string; avatarBg: string; handle: string };
  upvotes: number;
  repliesCount: number;
  lastActivity: string;
  tags: string[];
  content: string;
}

const CHANNELS = ['All Channels', 'DSA & Algorithms', 'System Architecture', 'Interview Experiences', 'Project Show & Tell'];

const INITIAL_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    title: 'How I passed Google SDE-2 Assessment: Key DP and Graph Patterns Breakdown',
    channel: 'Interview Experiences',
    author: { name: 'Aarav Sharma', avatarBg: '#2563EB', handle: 'aarav_coder' },
    upvotes: 142,
    repliesCount: 38,
    lastActivity: '12m ago',
    tags: ['Google', 'Interviews', 'Algorithms'],
    content: 'Sharing my complete 6-month revision timeline, focus areas on Monotonic Deques and Topological DAG traversals with test cases.',
  },
  {
    id: 'post-2',
    title: 'Benchmarking Redis Slotted Hashes vs MongoDB for Slotted Token Expiry',
    channel: 'System Architecture',
    author: { name: 'Priya Patel', avatarBg: '#8B5CF6', handle: 'priya_arch' },
    upvotes: 98,
    repliesCount: 24,
    lastActivity: '1h ago',
    tags: ['Redis', 'Distributed Systems', 'Performance'],
    content: 'We ran 100k concurrent read/write throughput tests. Redis sub-millisecond memory footprint crushed MongoDB TTL indices by 6x.',
  },
  {
    id: 'post-3',
    title: 'Showcase: Full-Stack Real-time Collaborative Code Editor with Yjs & WebSockets',
    channel: 'Project Show & Tell',
    author: { name: 'Rohan Gupta', avatarBg: '#10B981', handle: 'rohan_dev' },
    upvotes: 86,
    repliesCount: 19,
    lastActivity: '3h ago',
    tags: ['Next.js 15', 'NestJS', 'WebSockets', 'OpenSource'],
    content: 'Built during the SkillOS capstone sprint! Features live multi-cursor syncing and sandbox code runner with Docker rootless containers.',
  },
];

export default function CommunityClient() {
  const toast = useToast();
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_POSTS);
  const [selectedChannel, setSelectedChannel] = useState('All Channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newChannel, setNewChannel] = useState('DSA & Algorithms');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('Algorithms, C++');

  const filtered = posts.filter((p) => {
    const matchChannel = selectedChannel === 'All Channels' || p.channel === selectedChannel;
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchChannel && matchSearch;
  });

  const handleUpvote = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
    toast.success('Post upvoted!', 'Upvote Registered');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const post: ForumPost = {
      id: `post-${Date.now()}`,
      title: newTitle.trim(),
      channel: newChannel,
      author: { name: 'You (Student)', avatarBg: '#2563EB', handle: 'student_coder' },
      upvotes: 1,
      repliesCount: 0,
      lastActivity: 'Just now',
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      content: newContent.trim(),
    };

    setPosts([post, ...posts]);
    setCreateModalOpen(false);
    setNewTitle('');
    setNewContent('');
    toast.success('Discussion thread published to the community!', 'Thread Created');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Header Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              <ArticleOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Student Developer Blogs & Tech Articles
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Engineering blogs, system design case studies, contest write-ups, and placement interview breakdowns
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.86rem',
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Write Blog Post
          </Button>
        </Box>

        {/* Channel filter pills */}
        <Box sx={{ display: 'flex', gap: 1, mt: 3, flexWrap: 'wrap' }}>
          {CHANNELS.map((ch) => (
            <Chip
              key={ch}
              label={ch}
              onClick={() => setSelectedChannel(ch)}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                borderRadius: '8px',
                bgcolor: selectedChannel === ch ? '#2563EB' : '#F1F5F9',
                color: selectedChannel === ch ? '#FFFFFF' : '#475569',
                cursor: 'pointer',
                '&:hover': { bgcolor: selectedChannel === ch ? '#1D4ED8' : '#E2E8F0' },
              }}
            />
          ))}
        </Box>

        {/* Search */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search discussion threads, questions, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.84rem' } }}
          />
        </Box>
      </Card>

      {/* 2. Structured Forum Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>DISCUSSION TOPIC</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>CHANNEL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>AUTHOR</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>STATS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ACTIVITY</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((post) => (
                <TableRow
                  key={post.id}
                  hover
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 'none' } }}
                  onClick={() => setSelectedPost(post)}
                >
                  <TableCell sx={{ py: 2.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpvote(post.id);
                        }}
                        sx={{
                          bgcolor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '8px',
                          p: 0.75,
                          flexDirection: 'column',
                          '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' },
                        }}
                      >
                        <FluidArrowUp size={16} color="#2563EB" />
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#0F172A' }}>
                          {post.upvotes}
                        </Typography>
                      </IconButton>

                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem', lineHeight: 1.3 }}>
                          {post.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                          {post.tags.map((t) => (
                            <Chip key={t} label={`#${t}`} size="small" sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontSize: '0.68rem', height: 20 }} />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip label={post.channel} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.72rem' }} />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ bgcolor: post.author.avatarBg, width: 28, height: 28, fontSize: '0.72rem', fontWeight: 800 }}>
                        {post.author.name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                          {post.author.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.68rem', color: '#64748B' }}>
                          @{post.author.handle}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                      <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>
                        {post.repliesCount}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                    {post.lastActivity}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 3. Thread Detail Dialog */}
      <Dialog
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        {selectedPost && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Chip label={selectedPost.channel} size="small" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.72rem', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {selectedPost.title}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
                  Posted by {selectedPost.author.name} • {selectedPost.lastActivity}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedPost(null)} size="small">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                {selectedPost.content}
              </Typography>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Join Discussion ({selectedPost.repliesCount} Replies)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="Write your insightful answer or feedback..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '0.84rem' } }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setSelectedPost(null)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  toast.success('Reply submitted to discussion thread!', 'Reply Added');
                  setSelectedPost(null);
                }}
                sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
              >
                Post Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 4. Create Thread Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Create New Discussion Thread
        </DialogTitle>
        <form onSubmit={handleCreatePost}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Topic Title"
              size="small"
              fullWidth
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. How to handle write skew in distributed transactions"
            />
            <TextField
              label="Discussion Channel"
              size="small"
              fullWidth
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value)}
            />
            <TextField
              label="Tags (comma separated)"
              size="small"
              fullWidth
              value={newTags}
              onChange={(e) => setNewTags(e.target.value)}
            />
            <TextField
              label="Details & Code Snippet"
              size="small"
              fullWidth
              multiline
              rows={4}
              required
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Provide background context, code snippets, or questions..."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 0 }}>
            <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}>
              Publish Thread
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
