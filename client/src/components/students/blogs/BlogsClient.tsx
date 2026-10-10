'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card, Typography, Button, TablePagination } from '@mui/material';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { BlogPost, formatBlogDate, INITIAL_BLOG_POSTS } from '@/types/blog';

export {
  CATEGORIES,
  parseBlogDateToTime,
  getBlogThemeConfig,
  DEFAULT_COVER_OPTIONS,
} from './components/types';
import {
  CATEGORIES,
  parseBlogDateToTime,
} from './components/types';
import BlogsHeroHeader from './components/BlogsHeroHeader';
import BlogsFilterToolbar from './components/BlogsFilterToolbar';
import BlogsGridView from './components/BlogsGridView';
import BlogsDataTable from './components/BlogsDataTable';
import BlogReaderModal from './components/BlogReaderModal';
import BlogWriterModal from './components/BlogWriterModal';

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
  const selectedBlogIdRef = React.useRef<string | null>(null);
  useEffect(() => {
    selectedBlogIdRef.current = selectedBlog?.id || null;
  }, [selectedBlog]);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  // Fetch blogs on load
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

  // Filtered and sorted stories
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
    if (activeTab === 'latest' || activeTab === 'bookmarks') {
      return [...list].sort((a, b) => parseBlogDateToTime(b.publishedAt) - parseBlogDateToTime(a.publishedAt));
    }
    return list;
  }, [posts, selectedCategory, searchQuery, activeTab]);

  // Export to CSV
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

  // Clap / Upvote
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

  // Bookmark
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

  // Share
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

  const [isAddingComment, setIsAddingComment] = useState(false);

  // Add Comment in Reader
  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedBlog || isAddingComment) return;
    const targetBlogId = selectedBlog.id;
    const textToSend = commentText.trim();
    setIsAddingComment(true);
    let newC = {
      id: `c-${Date.now()}`,
      author: 'You (Student)',
      avatarBg: '#0B1F3A',
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

      if (selectedBlogIdRef.current === targetBlogId) {
        setCommentText((current) => (current.trim() === textToSend ? '' : current));
      }
      toast.success('Your comment was posted to the discussion!', 'Comment Added');
    } catch (err) {
      console.error('Backend comment persistence error:', err);
      toast.error('Failed to post comment. Please try again.', 'Comment Error');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Publish Story
  const handlePublishPost = async (blogInput: {
    title: string;
    subtitle: string;
    category: string;
    tags: string[];
    content: string;
    coverImage: string;
    readTime: string;
  }) => {
    let createdPost: BlogPost = {
      id: `blog-${Date.now()}`,
      title: blogInput.title,
      subtitle: blogInput.subtitle,
      category: blogInput.category,
      readTime: blogInput.readTime,
      publishedAt: new Date().toISOString(),
      coverImage: blogInput.coverImage,
      author: {
        name: 'You (Student)',
        avatarBg: '#0B1F3A',
        role: 'Full Stack Learner',
        college: 'Your Institution',
        handle: '@you_student',
        isVerified: true,
      },
      tags: blogInput.tags,
      claps: 1,
      commentsCount: 0,
      views: 12,
      isBookmarked: false,
      hasLiked: true,
      content: blogInput.content,
      comments: [],
    };

    try {
      const serverBlog = await apiService.createBlog({
        title: blogInput.title,
        subtitle: blogInput.subtitle,
        category: blogInput.category,
        readTime: blogInput.readTime,
        coverImage: blogInput.coverImage,
        content: blogInput.content,
        tags: blogInput.tags,
        status: 'Published',
      });
      if (serverBlog?.id) {
        createdPost = serverBlog;
      }

      setPosts((prev) => [createdPost, ...prev]);
      toast.success('Your tech article is now published live on SkillOS Blogs!', 'Story Published');
    } catch (err) {
      console.error('Failed to publish blog:', err);
      toast.error('Failed to publish article. Please check your connection and try again.', 'Publish Failed');
      throw err;
    }
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. HERO HEADER */}
      <BlogsHeroHeader
        onExportCSV={handleExportCSV}
        onOpenWriteModal={() => setWriteModalOpen(true)}
      />

      {/* 2. CARD CONTAINER WITH CONTROLS, GRID & LIST TABLE VIEWS */}
      <Card
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        {/* Controls Bar & Category Filter Bar */}
        <BlogsFilterToolbar
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setPage(0);
          }}
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            setPage(0);
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setPage(0);
          }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

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
              sx={{ textTransform: 'none', fontWeight: 700, color: '#0B1F3A', borderColor: '#0B1F3A' }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : viewMode === 'grid' ? (
          <BlogsGridView
            posts={filteredPosts}
            page={page}
            rowsPerPage={rowsPerPage}
            activeTab={activeTab}
            onOpenBlog={handleOpenBlog}
            onToggleClap={handleToggleClap}
            onToggleBookmark={handleToggleBookmark}
            onShare={handleShare}
          />
        ) : (
          <BlogsDataTable
            posts={filteredPosts}
            page={page}
            rowsPerPage={rowsPerPage}
            onOpenBlog={handleOpenBlog}
            onToggleClap={handleToggleClap}
            onToggleBookmark={handleToggleBookmark}
            onShare={handleShare}
          />
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

      {/* 3. Rich Article Reader Dialog */}
      <BlogReaderModal
        selectedBlog={selectedBlog}
        onClose={() => setSelectedBlog(null)}
        onToggleClap={handleToggleClap}
        onToggleBookmark={handleToggleBookmark}
        onShare={handleShare}
        commentText={commentText}
        onCommentChange={setCommentText}
        onAddComment={handleAddComment}
        isAddingComment={isAddingComment}
      />

      {/* 4. Write New Story / Publication Composer Modal */}
      <BlogWriterModal
        open={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onPublish={handlePublishPost}
      />
    </Box>
  );
}
