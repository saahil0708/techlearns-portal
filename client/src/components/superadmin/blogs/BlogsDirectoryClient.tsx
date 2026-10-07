'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
} from '@mui/material';

import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import BulkActionBar from '@/components/superadmin/shared/BulkActionBar';
import DeleteConfirmModal from '@/components/superadmin/shared/DeleteConfirmModal';
import { BlogPost, INITIAL_BLOG_POSTS } from '@/types/blog';
import { useToast } from '@/context/ToastContext';
import { usePolling } from '@/utils/usePolling';
import { apiService } from '@/lib/api-service';

// Modular Subcomponents
import { CURATED_BLOG_COVERS, NewBlogFormState, EditBlogFormState } from './directory/types';
import BlogsStatsBanner from './directory/BlogsStatsBanner';
import BlogsFilterToolbar from './directory/BlogsFilterToolbar';
import BlogsDataTable from './directory/BlogsDataTable';
import BlogCreateModal from './directory/BlogCreateModal';
import BlogEditModal from './directory/BlogEditModal';
import BlogReaderModal from './directory/BlogReaderModal';

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState<BlogPost | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<BlogPost | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Edit Blog form state
  const [editBlogForm, setEditBlogForm] = useState<EditBlogFormState>({
    title: '',
    subtitle: '',
    category: 'System Architecture',
    status: 'Published',
    coverImage: CURATED_BLOG_COVERS[0],
    tags: '',
    authorName: '',
    authorCollege: '',
    content: '',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // New Blog form state
  const [newBlog, setNewBlog] = useState<NewBlogFormState>({
    title: '',
    subtitle: '',
    category: 'System Architecture',
    coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    tags: 'SystemDesign, Architecture',
    authorName: 'Platform Administrator',
    authorCollege: 'CodePlatform HQ',
    content: '',
  });

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

    const safeCoverImage =
      newBlog.coverImage && !newBlog.coverImage.startsWith('blob:')
        ? newBlog.coverImage
        : CURATED_BLOG_COVERS[0];

    const wordCount = (newBlog.content.trim().split(/\s+/).filter(Boolean).length) || 120;
    const computedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

    try {
      const created = await apiService.createBlog({
        title: newBlog.title,
        subtitle: newBlog.subtitle || 'Technical post-mortem and system analysis.',
        category: newBlog.category,
        readTime: computedReadTime,
        publishedAt: new Date().toISOString(),
        status: 'Published',
        coverImage: safeCoverImage,
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

  // Open Edit Modal handler
  const handleOpenEditModal = (b: BlogPost) => {
    setBlogToEdit(b);
    setEditBlogForm({
      title: b.title,
      subtitle: b.subtitle || '',
      category: b.category || 'System Architecture',
      status: (b.status || 'Published') as 'Published' | 'Draft' | 'Archived',
      coverImage: b.coverImage || CURATED_BLOG_COVERS[0],
      tags: (b.tags || []).join(', '),
      authorName: b.author?.name || 'Platform Administrator',
      authorCollege: b.author?.college || 'CodePlatform HQ',
      content: b.content || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveEditBlog = async () => {
    if (!blogToEdit) return;
    if (!editBlogForm.title.trim()) {
      toast.error('Article title is required.', 'Validation Error');
      return;
    }

    setIsSavingEdit(true);
    const wordCount = editBlogForm.content.trim().split(/\s+/).filter(Boolean).length || 120;
    const computedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

    const payload: Partial<BlogPost> = {
      title: editBlogForm.title.trim(),
      subtitle: editBlogForm.subtitle.trim(),
      category: editBlogForm.category,
      status: editBlogForm.status,
      readTime: computedReadTime,
      coverImage: editBlogForm.coverImage,
      tags: editBlogForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      content: editBlogForm.content,
      author: {
        ...blogToEdit.author,
        name: editBlogForm.authorName || blogToEdit.author.name,
        college: editBlogForm.authorCollege || blogToEdit.author.college,
      },
    };

    try {
      if (blogToEdit.id && !blogToEdit.id.startsWith('blog-') && !blogToEdit.id.startsWith('client-')) {
        await apiService.updateBlog(blogToEdit.id, payload);
      }

      setBlogs((prev) =>
        prev.map((item) =>
          item.id === blogToEdit.id
            ? ({
                ...item,
                ...payload,
                tags: payload.tags || item.tags,
                author: {
                  ...item.author,
                  name: editBlogForm.authorName || item.author.name,
                  college: editBlogForm.authorCollege || item.author.college,
                },
              } as BlogPost)
            : item
        )
      );

      if (readBlog && readBlog.id === blogToEdit.id) {
        setReadBlog((prev) => (prev ? ({ ...prev, ...payload } as BlogPost) : null));
      }

      setEditModalOpen(false);
      setBlogToEdit(null);
      toast.success('Article updated successfully!', 'Changes Saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update article', 'Update Failed');
    } finally {
      setIsSavingEdit(false);
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
        py: { xs: 2, sm: 2.5, md: 3 },
        pr: { xs: 2, sm: 3, md: 4 },
        pl: { xs: '88px', sm: '100px', md: '116px' },
      }}
    >
      <CurvedSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 2, sm: 3, md: 4 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Top Banner with Stats Cards */}
          <BlogsStatsBanner
            blogs={blogs}
            totalViews={totalViews}
            totalClaps={totalClaps}
            activeCategoriesCount={activeCategoriesCount}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            onExportExcel={exportExcel}
            onExportCSV={exportCSV}
          />

          {/* Structured Management Table Card */}
          <Box
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
            {/* Filter & Search Toolbar */}
            <BlogsFilterToolbar
              blogs={blogs}
              filteredCount={filteredBlogs.length}
              selectedTab={selectedTab}
              onTabChange={(val) => {
                setSelectedTab(val);
                setPage(0);
              }}
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setPage(0);
              }}
              selectedCategory={selectedCategory}
              onCategoryChange={(cat) => {
                setSelectedCategory(cat);
                setPage(0);
              }}
              onResetFilters={() => {
                setSearchQuery('');
                setSelectedCategory('All Stories');
                setPage(0);
              }}
            />

            {/* Table */}
            <BlogsDataTable
              paginatedBlogs={paginatedBlogs}
              selectedBlogIds={selectedBlogIds}
              selectedOnCurrentPageCount={selectedOnCurrentPageCount}
              onSelectAll={handleSelectAll}
              onToggleSelect={handleToggleSelect}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
              onReadBlog={setReadBlog}
              onEditBlog={handleOpenEditModal}
              onDeleteBlog={(b) => {
                setBlogToDelete(b);
                setDeleteModalOpen(true);
              }}
              page={page}
              totalPages={totalPages}
              rowsPerPage={rowsPerPage}
              onPageChange={setPage}
              onRowsPerPageChange={(newRows) => {
                setRowsPerPage(newRows);
                setPage(0);
              }}
            />
          </Box>
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
      <BlogReaderModal
        blog={readBlog}
        onClose={() => setReadBlog(null)}
        onEdit={(b) => handleOpenEditModal(b)}
      />

      {/* Create New Article Modal */}
      <BlogCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        newBlog={newBlog}
        setNewBlog={setNewBlog}
        onSubmit={handleCreateBlog}
      />

      {/* Edit Article Modal */}
      <BlogEditModal
        key={blogToEdit?.id || 'blog-edit-modal'}
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setBlogToEdit(null);
        }}
        editBlogForm={editBlogForm}
        setEditBlogForm={setEditBlogForm}
        isSavingEdit={isSavingEdit}
        onSave={handleSaveEditBlog}
      />
    </Box>
  );
}
