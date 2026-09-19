'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  ListItemIcon,
  LinearProgress,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Tabs,
  Tab,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import BulkActionBar from '@/components/superadmin/shared/BulkActionBar';
import DeleteConfirmModal from '@/components/superadmin/shared/DeleteConfirmModal';
import { BlogPost, BLOG_CATEGORIES, INITIAL_BLOG_POSTS, formatBlogDate } from '@/types/blog';
import { useToast } from '@/context/ToastContext';
import { usePolling } from '@/utils/usePolling';
import { apiService } from '@/lib/api-service';
import { formatArticleMarkdown } from '@/utils/markdown';

export default function BlogsDirectoryClient({
  initialBlogs = INITIAL_BLOG_POSTS,
}: {
  initialBlogs?: BlogPost[];
}) {
  const toast = useToast();
  const [blogs, setBlogs] = useState<BlogPost[]>(initialBlogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stories');
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof BlogPost>('views');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [readBlog, setReadBlog] = useState<BlogPost | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // New Blog form state
  const [newBlog, setNewBlog] = useState({
    title: '',
    subtitle: '',
    category: 'System Architecture',
    readTime: '6 min read',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    tags: 'SystemDesign, Architecture',
    authorName: 'Platform Administrator',
    authorCollege: 'CodePlatform HQ',
    content: '',
  });

  // Export menu
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };
  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  // Auto-polling for real-time views/claps
  const refreshBlogs = useCallback(async () => {
    try {
      const live = await apiService.getBlogs();
      if (Array.isArray(live)) {
        setBlogs(live);
      }
      return live;
    } catch {
      return blogs;
    }
  }, [blogs]);

  usePolling(refreshBlogs, {
    intervalMs: 25000,
    pauseOnHidden: true,
    revalidateOnFocus: true,
  });

  // Filter & Search Logic
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      // Tab status filter
      if (selectedTab !== 'ALL') {
        const itemStatus = b.status || 'Published';
        if (selectedTab === 'PUBLISHED' && itemStatus !== 'Published') return false;
        if (selectedTab === 'DRAFT' && itemStatus !== 'Draft') return false;
        if (selectedTab === 'ARCHIVED' && itemStatus !== 'Archived') return false;
      }

      // Category filter
      if (selectedCategory !== 'All Stories' && b.category !== selectedCategory) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(query);
        const matchSubtitle = b.subtitle.toLowerCase().includes(query);
        const matchAuthor = b.author.name.toLowerCase().includes(query);
        const matchInstitute = (b.author.institute || b.author.college || '').toLowerCase().includes(query);
        const matchTags = b.tags.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchSubtitle && !matchAuthor && !matchInstitute && !matchTags) {
          return false;
        }
      }

      return true;
    });
  }, [blogs, selectedTab, selectedCategory, searchQuery]);

  // Sort logic
  const sortedBlogs = useMemo(() => {
    return [...filteredBlogs].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === undefined || bVal === undefined) return 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filteredBlogs, sortField, sortDirection]);

  // Pagination
  const paginatedBlogs = useMemo(() => {
    return sortedBlogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sortedBlogs, page, rowsPerPage]);

  const totalPages = Math.ceil(sortedBlogs.length / rowsPerPage) || 1;

  // Selected on current page count for accurate indeterminate & checked states
  const selectedOnCurrentPageCount = useMemo(() => {
    return paginatedBlogs.filter((b) => selectedBlogIds.includes(b.id)).length;
  }, [paginatedBlogs, selectedBlogIds]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedBlogs.map((b) => b.id);
      setSelectedBlogIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    } else {
      const pageIdsSet = new Set(paginatedBlogs.map((b) => b.id));
      setSelectedBlogIds((prev) => prev.filter((id) => !pageIdsSet.has(id)));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedBlogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Sorting handler
  const handleSort = (field: keyof BlogPost) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Create article handler
  const handleCreateBlog = async () => {
    if (!newBlog.title.trim()) {
      toast.error('Article title is required.', 'Validation Error');
      return;
    }
    try {
      const created = await apiService.createBlog({
        title: newBlog.title,
        subtitle: newBlog.subtitle || 'Technical post-mortem and system analysis.',
        category: newBlog.category,
        readTime: newBlog.readTime || '5 min read',
        publishedAt: new Date().toISOString(),
        status: 'Published',
        coverImage: newBlog.coverImage || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
        author: {
          name: newBlog.authorName || 'Super Administrator',
          avatarBg: '#2563EB',
          role: 'Platform Operations',
          institute: newBlog.authorCollege || 'CodePlatform Global',
          college: newBlog.authorCollege || 'CodePlatform Global',
          handle: '@admin',
          isVerified: true,
        },
        tags: newBlog.tags.split(',').map((t) => t.trim()).filter(Boolean),
        claps: 0,
        commentsCount: 0,
        views: 1,
        content: newBlog.content || `## ${newBlog.title}\n\n${newBlog.subtitle}\n\nPublished by platform leadership.`,
      });

      setBlogs((prev) => [created, ...prev.filter((b) => b.id !== created.id)]);
      setCreateModalOpen(false);
      setNewBlog({
        title: '',
        subtitle: '',
        category: 'System Architecture',
        readTime: '6 min read',
        coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
        tags: 'SystemDesign, Architecture',
        authorName: 'Platform Administrator',
        authorCollege: 'CodePlatform HQ',
        content: '',
      });
      toast.success('Technical article published successfully!', 'Article Published');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish article', 'Publish Failed');
    }
  };

  // Delete handler
  const handleDeleteBlog = async () => {
    if (blogToDelete) {
      try {
        await apiService.deleteBlog(blogToDelete.id);
        setBlogs((prev) => prev.filter((b) => b.id !== blogToDelete.id));
        setSelectedBlogIds((prev) => prev.filter((id) => id !== blogToDelete.id));
        setDeleteModalOpen(false);
        setBlogToDelete(null);
        toast.success('Article deleted from platform directory.', 'Article Deleted');
      } catch (err: any) {
        toast.error(err?.message || 'Failed to delete article', 'Delete Failed');
      }
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    try {
      const results = await Promise.allSettled(
        selectedBlogIds.map(async (id) => {
          await apiService.deleteBlog(id);
          return id;
        })
      );

      const successfulIds: string[] = [];
      let failureCount = 0;

      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          successfulIds.push(res.value);
        } else {
          failureCount++;
        }
      });

      if (successfulIds.length > 0) {
        setBlogs((prev) => prev.filter((b) => !successfulIds.includes(b.id)));
      }
      setSelectedBlogIds([]);
      setIsBulkDeleteOpen(false);

      if (failureCount === 0) {
        toast.success(`${successfulIds.length} articles deleted successfully.`, 'Bulk Action Complete');
      } else if (successfulIds.length > 0) {
        toast.warning(`${successfulIds.length} deleted, but ${failureCount} failed to delete.`, 'Partial Deletion');
      } else {
        toast.error('Failed to delete selected articles.', 'Bulk Delete Failed');
      }
    } catch (err: any) {
      setSelectedBlogIds([]);
      setIsBulkDeleteOpen(false);
      toast.error(err?.message || 'Failed to delete selected articles', 'Bulk Delete Failed');
    }
  };

  // Export handlers
  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Author', 'College', 'Views', 'Claps', 'ReadTime', 'Status'];
    const rows = sortedBlogs.map((b) => [
      `"${b.id}"`,
      `"${b.title.replace(/"/g, '""')}"`,
      `"${b.category}"`,
      `"${b.author.name}"`,
      `"${b.author.college}"`,
      b.views,
      b.claps,
      `"${b.readTime}"`,
      `"${b.status || 'Published'}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blogs_directory_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const exportExcel = () => {
    const tableContent = `
      <html><head><meta charset="utf-8"/></head><body>
      <h2>Platform Technical Blogs & Articles Directory</h2>
      <table border="1">
        <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
          <th>ID</th><th>Title</th><th>Category</th><th>Author</th><th>College</th><th>Views</th><th>Claps</th><th>Read Time</th><th>Status</th>
        </tr>
        ${sortedBlogs.map((b) => `
          <tr>
            <td>${b.id}</td>
            <td>${b.title}</td>
            <td>${b.category}</td>
            <td>${b.author.name}</td>
            <td>${b.author.college}</td>
            <td>${b.views}</td>
            <td>${b.claps}</td>
            <td>${b.readTime}</td>
            <td>${b.status || 'Published'}</td>
          </tr>
        `).join('')}
      </table>
      </body></html>
    `;
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `blogs_directory_${new Date().toISOString().slice(0, 10)}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  // Derived metrics for StatsCards
  const totalViews = useMemo(() => blogs.reduce((acc, b) => acc + (b.views || 0), 0), [blogs]);
  const totalClaps = useMemo(() => blogs.reduce((acc, b) => acc + (b.claps || 0), 0), [blogs]);
  const activeCategoriesCount = useMemo(() => new Set(blogs.map((b) => b.category)).size, [blogs]);

  const borderColor = '#E2E8F0';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      <CurvedSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Header Row */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArticleRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Developer Blogs & Editorial Publications
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.86rem', color: '#64748B', mt: 0.5, ml: 6.5 }}>
                System architecture breakdowns, contest post-mortems, editorial solutions, and collegiate engineering articles.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon />}
                onClick={handleOpenDownloadMenu}
                sx={{
                  bgcolor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 2,
                  py: 0.85,
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                }}
              >
                Export Data
              </Button>

              <Menu anchorEl={downloadAnchorEl} open={Boolean(downloadAnchorEl)} onClose={handleCloseDownloadMenu} slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 190, p: 0.5 } } }}>
                <MenuItem onClick={exportExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ color: '#16A34A', minWidth: 32 }}><TableChartRoundedIcon fontSize="small" /></ListItemIcon>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>Download Excel (.xls)</Typography>
                </MenuItem>
                <MenuItem onClick={exportCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ color: '#0284C7', minWidth: 32 }}><DescriptionRoundedIcon fontSize="small" /></ListItemIcon>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>Download CSV (.csv)</Typography>
                </MenuItem>
              </Menu>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setCreateModalOpen(true)}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 2.25,
                  py: 0.85,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Write Article
              </Button>
            </Box>
          </Box>

          {/* 4 Themed KPI StatsCards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Published Articles"
              value={blogs.length}
              icon={<ArticleRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle="Live in Student SkillOS"
              trendBadge={{ text: '+2 this week', type: 'positive' }}
            />

            <StatsCard
              title="Total Article Views"
              value={totalViews.toLocaleString()}
              icon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="Student & recruiter impressions"
              trendBadge={{ text: '+24.6% reads', type: 'speed' }}
            />

            <StatsCard
              title="Community Claps"
              value={totalClaps.toLocaleString()}
              icon={<FavoriteRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="Peer endorsements"
              trendBadge={{ text: 'High Engagement', type: 'positive' }}
            />

            <StatsCard
              title="Technical Domains"
              value={activeCategoriesCount}
              icon={<CategoryRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Curated disciplines"
            />
          </Box>

          {/* Structured Management Table Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Status Tabs Header */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedTab}
                onChange={(_, val) => {
                  setSelectedTab(val);
                  setPage(0);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  '& .MuiTabs-indicator': { backgroundColor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
                  '& .MuiTabs-flexContainer': { gap: { xs: 0.5, sm: 1.5 } },
                }}
              >
                <Tab value="ALL" label={`All Articles (${blogs.length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
                <Tab value="PUBLISHED" label={`Published (${blogs.filter((b) => (b.status || 'Published') === 'Published').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
                <Tab value="DRAFT" label={`Drafts (${blogs.filter((b) => b.status === 'Draft').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
                <Tab value="ARCHIVED" label={`Archived (${blogs.filter((b) => b.status === 'Archived').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
              </Tabs>
            </Box>

            {/* Filter & Search Toolbar */}
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#F8FAFC', borderBottom: `1px solid ${borderColor}` }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, flex: 1 }}>
                <TextField
                  size="small"
                  placeholder="Search articles by title, author, or tags..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    width: { xs: '100%', sm: 340 },
                    bgcolor: '#FFFFFF',
                    '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' },
                  }}
                />

                <Select
                  size="small"
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    bgcolor: '#FFFFFF',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    minWidth: 190,
                  }}
                >
                  {BLOG_CATEGORIES.map((cat) => (
                    <MenuItem key={cat} value={cat} sx={{ fontSize: '0.84rem' }}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>

                {(searchQuery || selectedCategory !== 'All Stories') && (
                  <Button
                    size="small"
                    startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All Stories');
                      setPage(0);
                    }}
                    sx={{ textTransform: 'none', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}
                  >
                    Reset Filters
                  </Button>
                )}
              </Box>

              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                Showing {filteredBlogs.length} of {blogs.length} articles
              </Typography>
            </Box>

            {/* Table */}
            <TableContainer sx={{ minHeight: 380 }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                      <Checkbox
                        size="small"
                        checked={paginatedBlogs.length > 0 && selectedOnCurrentPageCount === paginatedBlogs.length}
                        indeterminate={selectedOnCurrentPageCount > 0 && selectedOnCurrentPageCount < paginatedBlogs.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell onClick={() => handleSort('title')} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                      ARTICLE & TITLE {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell onClick={() => handleSort('category')} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                      CATEGORY & TAGS {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                      AUTHOR & COLLEGE
                    </TableCell>
                    <TableCell onClick={() => handleSort('views')} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em', textAlign: 'center' }}>
                      METRICS (VIEWS / CLAPS) {sortField === 'views' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                      READ TIME
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em', textAlign: 'center' }}>
                      STATUS
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em', textAlign: 'right', pr: 3 }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedBlogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748B' }}>
                        No articles match the current filter criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedBlogs.map((b) => {
                      const isSelected = selectedBlogIds.includes(b.id);
                      return (
                        <TableRow
                          key={b.id}
                          hover
                          selected={isSelected}
                          sx={{
                            '& td': { borderBottom: `1px solid #F1F5F9` },
                            '&:hover': { bgcolor: '#F8FAFC !important' },
                          }}
                        >
                          <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                            <Checkbox size="small" checked={isSelected} onChange={() => handleToggleSelect(b.id)} />
                          </TableCell>

                          {/* Article Title & Cover */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box
                                component="img"
                                src={b.coverImage}
                                alt={b.title}
                                sx={{ width: 56, height: 40, borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                              />
                              <Box sx={{ minWidth: 0, maxWidth: 380 }}>
                                <Typography
                                  onClick={() => setReadBlog(b)}
                                  sx={{
                                    fontSize: '0.88rem',
                                    fontWeight: 700,
                                    color: '#0F172A',
                                    cursor: 'pointer',
                                    '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {b.title}
                                </Typography>
                                <Typography sx={{ fontSize: '0.74rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}>
                                  {b.subtitle}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Category & Tags */}
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Chip
                                size="small"
                                label={b.category}
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  bgcolor: '#EFF6FF',
                                  color: '#2563EB',
                                  border: '1px solid #BFDBFE',
                                  borderRadius: '6px',
                                  width: 'fit-content',
                                }}
                              />
                              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                {b.tags.slice(0, 2).map((t) => (
                                  <Typography key={t} sx={{ fontSize: '0.68rem', color: '#64748B', bgcolor: '#F1F5F9', px: 0.75, py: 0.2, borderRadius: '4px' }}>
                                    #{t}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Author & College */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar src={b.author.avatarImg} sx={{ width: 28, height: 28, bgcolor: b.author.avatarBg, fontSize: '0.75rem', fontWeight: 700 }}>
                                {b.author.name[0]}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                                  {b.author.name}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {b.author.college}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Metrics */}
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                              <Tooltip title="Total Views">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
                                  <VisibilityOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{b.views.toLocaleString()}</Typography>
                                </Box>
                              </Tooltip>
                              <Tooltip title="Total Claps">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#DC2626' }}>
                                  <FavoriteRoundedIcon sx={{ fontSize: 15 }} />
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{b.claps}</Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                          </TableCell>

                          {/* Read Time */}
                          <TableCell>
                            <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                              {b.readTime}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                              {formatBlogDate(b.publishedAt)}
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={b.status || 'Published'}
                              sx={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                bgcolor: b.status === 'Draft' ? '#FEF3C7' : '#ECFDF5',
                                color: b.status === 'Draft' ? '#D97706' : '#059669',
                                border: `1px solid ${b.status === 'Draft' ? '#FDE68A' : '#A7F3D0'}`,
                                borderRadius: '6px',
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ pr: 2.5 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Read Article">
                                <IconButton size="small" onClick={() => setReadBlog(b)} sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}>
                                  <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete Article">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setBlogToDelete(b);
                                    setDeleteModalOpen(true);
                                  }}
                                  sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination Toolbar */}
            <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#F8FAFC', borderTop: `1px solid ${borderColor}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Rows per page:</Typography>
                <Select
                  size="small"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(0);
                  }}
                  sx={{ bgcolor: '#FFFFFF', borderRadius: '8px', fontSize: '0.8rem', height: 32 }}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                  Page {page + 1} of {totalPages}
                </Typography>
                <IconButton size="small" disabled={page === 0} onClick={() => setPage(0)}>
                  <FirstPageRoundedIcon />
                </IconButton>
                <IconButton size="small" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  <ChevronLeftRoundedIcon />
                </IconButton>
                <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRightRoundedIcon />
                </IconButton>
                <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>
                  <LastPageRoundedIcon />
                </IconButton>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedBlogIds.length}
        onClear={() => setSelectedBlogIds([])}
        onDelete={() => setIsBulkDeleteOpen(true)}
      />

      {/* Single Delete Confirm Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Delete Technical Article"
        subtitle={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`}
        onConfirm={handleDeleteBlog}
        onClose={() => {
          setDeleteModalOpen(false);
          setBlogToDelete(null);
        }}
      />

      {/* Bulk Delete Confirm Modal */}
      <DeleteConfirmModal
        open={isBulkDeleteOpen}
        title="Delete Selected Articles"
        subtitle={`Are you sure you want to permanently delete ${selectedBlogIds.length} selected articles?`}
        onConfirm={handleBulkDelete}
        onClose={() => setIsBulkDeleteOpen(false)}
      />

      {/* Read Article Dialog */}
      <Dialog
        open={Boolean(readBlog)}
        onClose={() => setReadBlog(null)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
      >
        {readBlog && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
              <Box>
                <Chip size="small" label={readBlog.category} sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, mb: 1 }} />
                <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>
                  {readBlog.title}
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#64748B', mt: 0.5 }}>
                  {readBlog.subtitle}
                </Typography>
              </Box>
              <IconButton onClick={() => setReadBlog(null)} sx={{ color: '#94A3B8' }}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 3 }}>
              {/* Cover Banner */}
              <Box
                component="img"
                src={readBlog.coverImage}
                alt={readBlog.title}
                sx={{ width: '100%', height: 240, borderRadius: '12px', objectFit: 'cover', mb: 3 }}
              />

              {/* Author Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={readBlog.author.avatarImg} sx={{ width: 42, height: 42, bgcolor: readBlog.author.avatarBg }}>
                    {readBlog.author.name[0]}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                      {readBlog.author.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                      {readBlog.author.role} • {readBlog.author.college}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                    {readBlog.readTime}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    {formatBlogDate(readBlog.publishedAt)}
                  </Typography>
                </Box>
              </Box>

              {/* Article Content */}
              <Box
                dangerouslySetInnerHTML={{ __html: formatArticleMarkdown(readBlog.content) }}
                sx={{ color: '#1E293B', lineHeight: 1.8, fontSize: '0.95rem' }}
              />
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>{readBlog.views.toLocaleString()} Views</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#DC2626' }}>
                  <FavoriteRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>{readBlog.claps} Claps</Typography>
                </Box>
              </Box>
              <Button onClick={() => setReadBlog(null)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
                Close Reader
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create New Article Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Publish New Technical Article
          <IconButton onClick={() => setCreateModalOpen(false)} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 2.5 }}>
          <TextField
            label="Article Title"
            fullWidth
            required
            placeholder="e.g. Scaling Real-Time WebSocket Infrastructure with Redis Pub/Sub"
            value={newBlog.title}
            onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
          />

          <TextField
            label="Subtitle / Summary"
            fullWidth
            placeholder="A brief 1-2 sentence overview of the technical topic"
            value={newBlog.subtitle}
            onChange={(e) => setNewBlog({ ...newBlog, subtitle: e.target.value })}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Select
              value={newBlog.category}
              onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
              fullWidth
            >
              {BLOG_CATEGORIES.filter((c) => c !== 'All Stories').map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>

            <TextField
              label="Read Time"
              placeholder="e.g. 8 min read"
              value={newBlog.readTime}
              onChange={(e) => setNewBlog({ ...newBlog, readTime: e.target.value })}
            />
          </Box>

          <TextField
            label="Cover Image URL"
            fullWidth
            placeholder="https://images.unsplash.com/..."
            value={newBlog.coverImage}
            onChange={(e) => setNewBlog({ ...newBlog, coverImage: e.target.value })}
          />

          <TextField
            label="Tags (comma-separated)"
            fullWidth
            placeholder="Redis, WebSockets, Backend, SystemDesign"
            value={newBlog.tags}
            onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
          />

          <TextField
            label="Article Markdown Content"
            multiline
            rows={8}
            fullWidth
            placeholder="## Technical Breakdown\n\nExplain architecture, code snippets, benchmarks..."
            value={newBlog.content}
            onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateModalOpen(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBlog}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 3, '&:hover': { bgcolor: '#1D4ED8' } }}
          >
            Publish Article
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
