'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  IconButton,
  TextField,
  Divider,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';
import { BlogPost, formatBlogDate } from '@/types/blog';
import { apiService } from '@/lib/api-service';
import { getBlogThemeConfig } from '@/components/students/blogs/BlogsClient';
import MarkdownViewer, { renderInlineContent } from '@/components/shared/MarkdownViewer';

interface BlogReaderClientProps {
  initialBlog: BlogPost;
  relatedBlogs?: BlogPost[];
}

export default function BlogReaderClient({ initialBlog, relatedBlogs = [] }: BlogReaderClientProps) {
  const router = useRouter();
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [blog, setBlog] = useState<BlogPost>(initialBlog);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Multi-clap state (up to 10 claps per user)
  const MAX_CLAPS_PER_USER = 10;
  const [userClapCount, setUserClapCount] = useState<number>(0);

  // Comment edit/delete states
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  useEffect(() => {
    setBlog(initialBlog);
  }, [initialBlog]);

  const theme = getBlogThemeConfig(blog.category);

  // Extract Table of Contents from markdown headings (skipping fenced code blocks)
  const tableOfContents = useMemo(() => {
    if (!blog.content) return [];
    const lines = blog.content.split('\n');
    const headings: { title: string; level: number; id: string }[] = [];
    let inCodeBlock = false;
    lines.forEach((line) => {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return;
      }
      if (inCodeBlock) return;
      const matchH2 = line.match(/^##\s+(.+)$/);
      const matchH3 = line.match(/^###\s+(.+)$/);
      if (matchH2) {
        const title = matchH2[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ title, level: 2, id });
      } else if (matchH3) {
        const title = matchH3[1].trim();
        const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        headings.push({ title, level: 3, id });
      }
    });
    return headings;
  }, [blog.content]);

  // Handle Clap (Allows up to 10 claps per user per story)
  const handleToggleClap = async () => {
    if (userClapCount >= MAX_CLAPS_PER_USER) {
      toast.info(`You've given the maximum ${MAX_CLAPS_PER_USER} claps to this story. Thank you for the support!`, 'Max Claps Reached');
      return;
    }

    const prevCount = userClapCount;
    const prevHasLiked = blog.hasLiked;
    const prevClaps = blog.claps;

    const nextCount = userClapCount + 1;
    setUserClapCount(nextCount);
    setBlog((prev) => ({
      ...prev,
      hasLiked: true,
      claps: prev.claps + 1,
    }));

    try {
      if (blog.id && !blog.id.startsWith('blog-') && !blog.id.startsWith('client-')) {
        await apiService.clapBlog(blog.id);
      }
      toast.success(`Clapped! (${nextCount}/${MAX_CLAPS_PER_USER})`, 'Clap Added');
    } catch (err: any) {
      console.warn('Backend clap warning:', err);
      setUserClapCount(prevCount);
      setBlog((prev) => ({
        ...prev,
        hasLiked: prevHasLiked,
        claps: prevClaps,
      }));
      const message = err?.response?.data?.message || err?.message;
      if (message && message.includes('maximum limit')) {
        toast.info(message, 'Max Claps Reached');
      } else {
        toast.error(message || 'Failed to record clap', 'Clap Error');
      }
    }
  };

  // Handle Bookmark
  const handleToggleBookmark = () => {
    const isBookmarked = !blog.isBookmarked;
    setBlog((prev) => ({ ...prev, isBookmarked }));
    toast.success(
      isBookmarked ? 'Article saved to your reading list!' : 'Removed from saved reading list.',
      'Bookmarks',
    );
  };

  // Handle Share
  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Story link copied to clipboard!', 'Link Copied');
      } catch {
        toast.error('Failed to copy link to clipboard.', 'Copy Error');
      }
    } else {
      toast.error('Clipboard copy is not supported on this device.', 'Copy Error');
    }
  };

  // Handle Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const textToSend = commentText.trim();
    setIsSubmittingComment(true);

    let newC: { id: string; author: string; authorId?: string; avatarBg: string; time: string; text: string } = {
      id: `c-${Date.now()}`,
      author: currentUser?.name || 'You (Student)',
      authorId: currentUser?.id,
      avatarBg: '#2563EB',
      time: 'Just now',
      text: textToSend,
    };

    try {
      if (blog.id && !blog.id.startsWith('blog-') && !blog.id.startsWith('client-')) {
        const savedComment = await apiService.addBlogComment(blog.id, textToSend);
        if (savedComment) {
          newC = {
            ...newC,
            id: savedComment.id || newC.id,
            author: savedComment.author?.name || newC.author,
            authorId: savedComment.authorId || savedComment.author?.id || newC.authorId,
            time: 'Just now',
          };
        }
      }

      setBlog((prev) => ({
        ...prev,
        commentsCount: (prev.commentsCount || 0) + 1,
        comments: [newC, ...(prev.comments || [])],
      }));

      setCommentText('');
      toast.success('Your comment was posted to the discussion!', 'Comment Added');
    } catch (err) {
      console.error('Backend comment persistence error:', err);
      toast.error('Failed to post comment. Please try again.', 'Comment Error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle Start Edit Comment
  const handleStartEditComment = (commentId: string, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
  };

  // Handle Cancel Edit Comment
  const handleCancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  // Handle Save Edited Comment
  const handleSaveEditComment = async (commentId: string) => {
    if (!editingCommentText.trim()) {
      toast.error('Comment cannot be empty.', 'Empty Comment');
      return;
    }

    const textToSave = editingCommentText.trim();
    setIsSavingComment(true);

    try {
      if (blog.id && !blog.id.startsWith('blog-') && !blog.id.startsWith('client-') && !commentId.startsWith('c-')) {
        await apiService.updateBlogComment(blog.id, commentId, textToSave);
      }

      setBlog((prev) => ({
        ...prev,
        comments: prev.comments?.map((c) => (c.id === commentId ? { ...c, text: textToSave } : c)),
      }));

      setEditingCommentId(null);
      setEditingCommentText('');
      toast.success('Comment updated successfully!', 'Comment Updated');
    } catch (err) {
      console.error('Failed to update comment:', err);
      toast.error('Failed to update comment. Please try again.', 'Update Failed');
    } finally {
      setIsSavingComment(false);
    }
  };

  // Handle Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      if (blog.id && !blog.id.startsWith('blog-') && !blog.id.startsWith('client-') && !commentId.startsWith('c-')) {
        await apiService.deleteBlogComment(blog.id, commentId);
      }

      setBlog((prev) => ({
        ...prev,
        commentsCount: Math.max(0, (prev.commentsCount || 0) - 1),
        comments: prev.comments?.filter((c) => c.id !== commentId),
      }));

      toast.success('Comment deleted from discussion.', 'Comment Deleted');
    } catch (err) {
      console.error('Failed to delete comment:', err);
      toast.error('Failed to delete comment. Please try again.', 'Delete Failed');
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP BREADCRUMB NAVIGATION (Blogs > Dynamic Blog Title)               */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          minWidth: 0,
          py: 0.5,
        }}
      >
        <Typography
          onClick={() => router.push('/students/blogs')}
          sx={{
            fontWeight: 700,
            fontSize: '0.92rem',
            color: '#64748B',
            cursor: 'pointer',
            transition: 'color 0.15s ease',
            '&:hover': {
              color: '#2563EB',
              textDecoration: 'underline',
            },
          }}
        >
          Blogs
        </Typography>

        <ChevronRightRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />

        <Typography
          noWrap
          title={blog.title}
          sx={{
            fontWeight: 700,
            fontSize: '0.92rem',
            color: '#0F172A',
            maxWidth: { xs: '260px', sm: '480px', md: '700px', lg: '950px' },
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {blog.title}
        </Typography>
      </Box>

      {/* ========================================================================= */}
      {/* 2. TWO-COLUMN RESPONSIVE LAYOUT (WIDENED MAIN CANVAS + COMPACT SIDEBAR)   */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 280px', xl: 'minmax(0, 1fr) 300px' },
          gap: { xs: 3, lg: 3 },
          alignItems: 'start',
          width: '100%',
        }}
      >
        {/* ========================================================================= */}
        {/* LEFT / MAIN COLUMN: ARTICLE READING CANVAS                                */}
        {/* ========================================================================= */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
            }}
          >
            {/* Article Headline on Top */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                color: '#0F172A',
                fontSize: { xs: '1.85rem', sm: '2.4rem', md: '2.85rem' },
                lineHeight: 1.2,
                letterSpacing: '-0.03em',
                mb: 0.5
                ,
              }}
            >
              {blog.title}
            </Typography>

            {/* Underline Divider */}
            <Divider sx={{ borderColor: '#00000025', mb: 2.5 }} />

            {/* Meta Badges & Info Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 3.5, flexWrap: 'wrap' }}>
              <Chip
                label={blog.category}
                size="small"
                sx={{
                  bgcolor: theme.tagBg,
                  color: theme.tagText,
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  height: 28,
                  borderRadius: '8px',
                }}
              />
              <Chip
                icon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />}
                label={`${blog.views || 0} Views`}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  height: 28,
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                }}
              />
              {blog.tags && blog.tags.length > 0 && blog.tags.map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    height: 28,
                    borderRadius: '8px',
                  }}
                />
              ))}
              <Box sx={{ ml: { xs: 0, sm: 'auto' }, display: 'flex', alignItems: 'center', gap: 0.6, color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />
                <span>Published {formatBlogDate(blog.publishedAt)}</span>
              </Box>
            </Box>

            {/* HD Cover Artwork Banner */}
            <Box
              sx={{
                width: '100%',
                maxHeight: 480,
                borderRadius: '18px',
                overflow: 'hidden',
                mb: 5,
                bgcolor: '#0F172A',
                border: '1px solid #E2E8F0',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={blog.coverImage || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80'}
                alt={blog.title}
                onError={(e: any) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80';
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  maxHeight: 480,
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  '&:hover': { transform: 'scale(1.02)' },
                }}
              />
            </Box>

            {/* Markdown Body Content */}
            <MarkdownViewer content={blog.content} accentColor={theme.accentColor} />

            <Divider sx={{ my: 5, borderColor: '#F1F5F9' }} />

            {/* Story Engagement & Share Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 2.5,
                bgcolor: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={blog.hasLiked ? <FavoriteRoundedIcon sx={{ color: '#FFFFFF' }} /> : <FavoriteBorderRoundedIcon />}
                  onClick={handleToggleClap}
                  sx={{
                    borderRadius: '9999px',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    px: 3,
                    py: 1,
                    bgcolor: blog.hasLiked ? '#EF4444' : '#2563EB',
                    color: '#FFFFFF',
                    boxShadow: blog.hasLiked ? '0 4px 14px rgba(239, 68, 68, 0.3)' : '0 4px 14px rgba(37, 99, 235, 0.25)',
                    '&:hover': { bgcolor: blog.hasLiked ? '#DC2626' : '#1D4ED8' },
                  }}
                >
                  {blog.claps || 0} Claps Given
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#64748B', fontWeight: 700, fontSize: '0.86rem' }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  <span>{blog.commentsCount || 0} Comments</span>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={blog.isBookmarked ? <BookmarkRoundedIcon sx={{ color: '#2563EB' }} /> : <BookmarkBorderRoundedIcon />}
                  onClick={handleToggleBookmark}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                  }}
                >
                  {blog.isBookmarked ? 'Saved to Reading List' : 'Bookmark'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShareRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleShare}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                  }}
                >
                  Share
                </Button>
              </Box>
            </Box>
          </Box>

          {/* ========================================================================= */}
          {/* DISCUSSION & COMMENTS SECTION                                             */}
          {/* ========================================================================= */}
          <Box
            sx={{
              pt: 5,
              mt: 1,
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <ChatBubbleOutlineRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem' }}>
                Discussion ({blog.comments?.length || blog.commentsCount || 0})
              </Typography>
            </Box>

            {/* Add Comment Input Form */}
            <Box component="form" onSubmit={handleAddComment} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your thoughts, ask questions about the architecture, or discuss edge cases..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '14px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    fontSize: '0.92rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', bgcolor: '#FFFFFF' },
                  },
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmittingComment || !commentText.trim()}
                  endIcon={<SendRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#2563EB',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 3,
                    py: 0.9,
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </Box>
            </Box>

            {/* Comments List */}
            {blog.comments && blog.comments.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {blog.comments.map((comm) => {
                  const isEditingThis = editingCommentId === comm.id;
                  const isCommentOwner = Boolean(
                    comm.authorId && currentUser?.id && comm.authorId === currentUser.id
                  );

                  return (
                    <Box
                      key={comm.id}
                      sx={{
                        p: 2.2,
                        bgcolor: isEditingThis ? '#EFF6FF' : '#F8FAFC',
                        borderRadius: '14px',
                        border: '1px solid',
                        borderColor: isEditingThis ? '#93C5FD' : '#E2E8F0',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: comm.avatarBg || '#2563EB',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                            }}
                          >
                            {comm.author?.[0] || 'U'}
                          </Avatar>
                          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                            {comm.author}
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                            • {comm.time}
                          </Typography>
                        </Box>

                        {/* Edit & Delete Action Buttons (only for author) */}
                        {isCommentOwner && !isEditingThis && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Edit comment">
                              <IconButton
                                size="small"
                                onClick={() => handleStartEditComment(comm.id, comm.text)}
                                sx={{
                                  color: '#64748B',
                                  p: 0.6,
                                  '&:hover': { color: '#2563EB', bgcolor: 'rgba(37,99,235,0.08)' },
                                }}
                              >
                                <EditRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete comment">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteComment(comm.id)}
                                sx={{
                                  color: '#64748B',
                                  p: 0.6,
                                  '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' },
                                }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>

                      {/* Comment Body / Inline Editor */}
                      {isEditingThis ? (
                        <Box sx={{ mt: 1.5, pl: 0.5 }}>
                          <TextField
                            fullWidth
                            multiline
                            rows={2}
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            sx={{
                              bgcolor: '#FFFFFF',
                              borderRadius: '10px',
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                fontSize: '0.9rem',
                                '& fieldset': { borderColor: '#93C5FD' },
                                '&:hover fieldset': { borderColor: '#2563EB' },
                              },
                            }}
                          />
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1.2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={handleCancelEditComment}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                borderColor: '#CBD5E1',
                                color: '#64748B',
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              disabled={isSavingComment || !editingCommentText.trim()}
                              onClick={() => handleSaveEditComment(comm.id)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                borderRadius: '8px',
                                bgcolor: '#2563EB',
                                '&:hover': { bgcolor: '#1D4ED8' },
                              }}
                            >
                              {isSavingComment ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6, pl: 5.2 }}>
                          {comm.text}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 5, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px dashed #E2E8F0' }}>
                <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.92rem' }}>
                  No comments yet. Be the first to start the discussion!
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: STICKY SIDEBAR (AUTHOR BIO, QUICK STATS, OUTLINE & RELATED) */}
        {/* ========================================================================= */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            position: { lg: 'sticky' },
            top: { lg: 24 },
          }}
        >
          {/* About Author Card */}
          <Card
            sx={{
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              p: 3,
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <PersonOutlineRoundedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                About the Author
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8, mb: 2 }}>
              <Avatar
                src={blog.author?.avatarImg}
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: blog.author?.avatarBg || '#2563EB',
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
                }}
              >
                {blog.author?.name?.[0] || 'A'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }} noWrap>
                    {blog.author?.name}
                  </Typography>
                  {blog.author?.isVerified && (
                    <CheckCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 16, flexShrink: 0 }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {blog.author?.handle}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2.5 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                Role & Campus:
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', color: '#0F172A', fontWeight: 700, mt: 0.3 }}>
                {blog.author?.role}
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>
                {blog.author?.college || blog.author?.institute || 'CodePlatform'}
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => router.push('/students/community')}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                borderColor: '#2563EB',
                color: '#2563EB',
                py: 0.8,
                '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.06)', borderColor: '#1D4ED8' },
              }}
            >
              View Author Profile & Posts
            </Button>
          </Card>

          {/* Table of Contents / Quick Jump */}
          {tableOfContents.length > 0 && (
            <Card
              sx={{
                borderRadius: '20px',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                p: 3,
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MenuBookRoundedIcon sx={{ color: theme.accentColor, fontSize: 19 }} />
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.96rem' }}>
                  Article Outline
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                {tableOfContents.map((h, i) => (
                  <Box
                    key={i}
                    component="a"
                    href={`#${h.id}`}
                    sx={{
                      fontSize: h.level === 2 ? '0.84rem' : '0.78rem',
                      fontWeight: h.level === 2 ? 700 : 500,
                      color: '#475569',
                      pl: h.level === 2 ? 0 : 1.8,
                      textDecoration: 'none',
                      transition: 'color 0.15s ease',
                      '&:hover': { color: '#2563EB' },
                    }}
                  >
                    • {h.title}
                  </Box>
                ))}
              </Box>
            </Card>
          )}

          {/* Quick Metrics Badge Card */}
          <Card
            sx={{
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              p: 2.5,
              boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
            }}
          >
            <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', mb: 1.8 }}>
              Story Summary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <Box sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                  Claps
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#EF4444', mt: 0.2 }}>
                  {blog.claps || 0}
                </Typography>
              </Box>
              <Box sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                  Comments
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563EB', mt: 0.2 }}>
                  {blog.commentsCount || 0}
                </Typography>
              </Box>
              <Box sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                  Views
                </Typography>
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 900, color: '#0F172A', mt: 0.2 }}>
                  {blog.views || 0}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 3. RELATED STORIES ROW AT BOTTOM                                          */}
      {/* ========================================================================= */}
      {relatedBlogs.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem' }}>
              Explore More Stories in {blog.category}
            </Typography>
            <Button
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 15 }} />}
              onClick={() => router.push('/students/blogs')}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB', fontSize: '0.86rem' }}
            >
              Browse All Stories
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(320px, 1fr))',
              },
              gap: 3,
            }}
          >
            {relatedBlogs.slice(0, 3).map((rel) => {
              const relTheme = getBlogThemeConfig(rel.category);
              return (
                <Card
                  key={rel.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Read story: ${rel.title}`}
                  onClick={() => router.push(`/students/blogs/${rel.id}`)}
                  onKeyDown={(e) => {
                    if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      router.push(`/students/blogs/${rel.id}`);
                    }
                  }}
                  sx={{
                    borderRadius: '20px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    p: 2.5,
                    cursor: 'pointer',
                    transition: 'all 0.22s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: '#2563EB',
                      boxShadow: '0 12px 28px rgba(37, 99, 235, 0.1)',
                    },
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Chip
                        label={rel.category}
                        size="small"
                        sx={{
                          bgcolor: relTheme.tagBg,
                          color: relTheme.tagText,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          height: 22,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        {rel.readTime}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem', lineHeight: 1.4, mb: 1 }}>
                      {rel.title}
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748B', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {rel.subtitle}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2.5, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={rel.author?.avatarImg}
                        sx={{ width: 24, height: 24, bgcolor: rel.author?.avatarBg || '#2563EB', fontSize: '0.7rem', fontWeight: 800 }}
                      >
                        {rel.author?.name?.[0] || 'A'}
                      </Avatar>
                      <Typography sx={{ fontSize: '0.78rem', color: '#334155', fontWeight: 700 }}>
                        {rel.author?.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#EF4444', fontSize: '0.76rem', fontWeight: 800 }}>
                      <BoltRoundedIcon sx={{ fontSize: 14 }} />
                      <span>{rel.claps || 0}</span>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
