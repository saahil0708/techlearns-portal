'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';

import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import TipTapEditor from '@/components/shared/TipTapEditor';
import DeleteConfirmModal from '@/components/superadmin/shared/DeleteConfirmModal';
import { BlogPost, BLOG_CATEGORIES, formatBlogDate } from '@/types/blog';
import { apiService } from '@/lib/api-service';
import { uploadFileToAzureBlob } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';

const CURATED_BLOG_COVERS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516116211227-bbc03a089025?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
];

interface SuperAdminBlogReaderClientProps {
  initialBlog: BlogPost;
  relatedBlogs?: BlogPost[];
}

export default function SuperAdminBlogReaderClient({
  initialBlog,
  relatedBlogs = [],
}: SuperAdminBlogReaderClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [blog, setBlog] = useState<BlogPost>(initialBlog);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: initialBlog.title,
    subtitle: initialBlog.subtitle || '',
    category: initialBlog.category || 'System Architecture',
    coverImage: initialBlog.coverImage || CURATED_BLOG_COVERS[0],
    tags: (initialBlog.tags || []).join(', '),
    status: initialBlog.status || 'Published',
    authorName: initialBlog.author?.name || 'Platform Administrator',
    authorCollege: initialBlog.author?.college || 'CodePlatform HQ',
    content: initialBlog.content || '',
  });

  const [coverSelectionMode, setCoverSelectionMode] = useState<'upload' | 'preset' | 'url'>('preset');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setBlog(initialBlog);
    setEditForm({
      title: initialBlog.title,
      subtitle: initialBlog.subtitle || '',
      category: initialBlog.category || 'System Architecture',
      coverImage: initialBlog.coverImage || CURATED_BLOG_COVERS[0],
      tags: (initialBlog.tags || []).join(', '),
      status: initialBlog.status || 'Published',
      authorName: initialBlog.author?.name || 'Platform Administrator',
      authorCollege: initialBlog.author?.college || 'CodePlatform HQ',
      content: initialBlog.content || '',
    });
  }, [initialBlog]);

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
      setEditForm((prev) => ({ ...prev, coverImage: res.blobUrl }));
      toast.success('Cover image uploaded successfully to storage!', 'Image Uploaded');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to upload cover image', 'Upload Error');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm.title.trim()) {
      toast.error('Article title is required.', 'Validation Error');
      return;
    }

    setIsSaving(true);
    const wordCount = editForm.content.trim().split(/\s+/).filter(Boolean).length || 120;
    const computedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

    const payload: Partial<BlogPost> = {
      title: editForm.title.trim(),
      subtitle: editForm.subtitle.trim(),
      category: editForm.category,
      readTime: computedReadTime,
      status: editForm.status as 'Published' | 'Draft' | 'Archived',
      coverImage: editForm.coverImage,
      tags: editForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      content: editForm.content,
      author: {
        ...blog.author,
        name: editForm.authorName,
        college: editForm.authorCollege,
      },
    };

    try {
      if (blog.id && !blog.id.startsWith('blog-') && !blog.id.startsWith('client-')) {
        await apiService.updateBlog(blog.id, payload);
      }

      setBlog((prev) => ({
        ...prev,
        ...payload,
        tags: payload.tags || prev.tags,
        author: {
          ...prev.author,
          name: editForm.authorName,
          college: editForm.authorCollege,
        },
      } as BlogPost));

      setIsEditing(false);
      toast.success('Technical article updated successfully!', 'Changes Saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update article', 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      if (blog.id && !blog.id.startsWith('blog-') && !blog.id.startsWith('client-')) {
        await apiService.deleteBlog(blog.id);
      }
      toast.success('Article deleted successfully from platform directory.', 'Article Deleted');
      router.push('/superadmin/blogs');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete article', 'Delete Failed');
    }
  };

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
      {/* Superadmin Sidebar Navigation */}
      <CurvedSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container: Navbar + Reader Content */}
        <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 1.5, sm: 2.5, md: 3 }, display: 'flex', flexDirection: 'column', gap: 3.5, pb: { xs: 6, md: 8 } }}>
          <Navbar />

          {/* Breadcrumb Navigation & Top Action Toolbar */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3,
            }}
          >
            {/* Breadcrumb Hierarchy */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem', color: '#64748B' }}>
              <Link href="/superadmin" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>
                Platform
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
              <Link href="/superadmin/blogs" style={{ color: '#64748B', textDecoration: 'none', fontWeight: 600 }}>
                Technical Blogs
              </Link>
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ color: '#0F172A', fontWeight: 700, fontSize: '0.85rem' }} noWrap>
                {blog.title}
              </Typography>
            </Box>

            {/* Quick Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => router.push('/superadmin/blogs')}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Back to Blogs
              </Button>
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={() => setIsEditing(true)}
                sx={{
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Edit Article
              </Button>
              <Tooltip title="Delete Article">
                <IconButton
                  onClick={() => setDeleteModalOpen(true)}
                  sx={{
                    color: '#94A3B8',
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    borderRadius: '10px',
                    '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2', borderColor: '#FECACA' },
                  }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* ========================================================================= */}
          {/* ARTICLE READER CONTAINER                                                  */}
          {/* ========================================================================= */}
          <Card
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 25px rgba(0,0,0,0.03)',
            }}
          >
            {/* Category & Status Badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={blog.category}
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #BFDBFE',
                }}
              />
              <Chip
                label={blog.status || 'Published'}
                sx={{
                  bgcolor: blog.status === 'Draft' ? '#FEF3C7' : '#ECFDF5',
                  color: blog.status === 'Draft' ? '#D97706' : '#059669',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  border: `1px solid ${blog.status === 'Draft' ? '#FDE68A' : '#A7F3D0'}`,
                }}
              />
              {blog.tags &&
                blog.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    sx={{
                      bgcolor: '#F8FAFC',
                      color: '#64748B',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  />
                ))}
            </Box>

            {/* Headline Title */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.35rem', md: '2.85rem' },
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.03em',
                lineHeight: 1.25,
                mb: 2,
              }}
            >
              {blog.title}
            </Typography>

            {/* Subtitle */}
            {blog.subtitle && (
              <Typography
                sx={{
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  color: '#475569',
                  lineHeight: 1.65,
                  mb: 3,
                }}
              >
                {blog.subtitle}
              </Typography>
            )}

            {/* Author & Telemetry Row */}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 2.5,
                my: 2.5,
                borderTop: '1px solid #F1F5F9',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={blog.author.avatarImg}
                  sx={{ width: 44, height: 44, bgcolor: blog.author.avatarBg, fontWeight: 800, fontSize: '1rem' }}
                >
                  {blog.author.name[0]}
                </Avatar>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {blog.author.name}
                    {blog.author.isVerified && <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#2563EB' }} />}
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {blog.author.role} • {blog.author.college}
                  </Typography>
                </Box>
              </Box>

              {/* Read Time, Published Date & Metrics */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
                  <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{blog.readTime}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{formatBlogDate(blog.publishedAt)}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
                  <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{blog.views.toLocaleString()} views</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#DC2626' }}>
                  <FavoriteRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700 }}>{blog.claps} claps</Typography>
                </Box>
              </Box>
            </Box>

            {/* Cover Image Banner */}
            {blog.coverImage && (
              <Box sx={{ my: 3.5, borderRadius: '16px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <Box
                  component="img"
                  src={blog.coverImage}
                  alt={blog.title}
                  sx={{
                    width: '100%',
                    maxHeight: 480,
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            )}

            {/* Main Article Body (Universal MarkdownViewer) */}
            <Box sx={{ mt: 4, mb: 4 }}>
              <MarkdownViewer content={blog.content} />
            </Box>

            {/* Bottom Footer Actions */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 3,
                mt: 4,
                borderTop: '1px solid #E2E8F0',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Typography sx={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 600 }}>
                Published in <strong style={{ color: '#0F172A' }}>{blog.category}</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  startIcon={<EditRoundedIcon />}
                  onClick={() => setIsEditing(true)}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderColor: '#2563EB',
                    color: '#2563EB',
                  }}
                >
                  Edit This Article
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push('/superadmin/blogs')}
                  sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 700,
                    bgcolor: '#0F172A',
                    '&:hover': { bgcolor: '#1E293B' },
                  }}
                >
                  Back to Directory
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* DYNAMIC EDIT MODAL (WITH TIPTAP RICH TEXT EDITOR)                         */}
      {/* ========================================================================= */}
      <Dialog
        open={isEditing}
        onClose={() => setIsEditing(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '18px' } } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: '1.25rem',
            color: '#0F172A',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #E2E8F0',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EditRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Edit Technical Article
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                Update title, content, tags, and cover assets
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setIsEditing(false)} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
          <TextField
            label="Article Title"
            fullWidth
            required
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />

          <TextField
            label="Subtitle / Summary"
            fullWidth
            multiline
            rows={2}
            value={editForm.subtitle}
            onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="edit-category-label">Category</InputLabel>
              <Select
                labelId="edit-category-label"
                label="Category"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              >
                {BLOG_CATEGORIES.filter((c) => c !== 'All Stories').map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="edit-status-label">Publication Status</InputLabel>
              <Select
                labelId="edit-status-label"
                label="Publication Status"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
              >
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Cover Image Selector */}
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
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                Cover Image
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.8 }}>
                <Button
                  size="small"
                  variant={coverSelectionMode === 'upload' ? 'contained' : 'outlined'}
                  onClick={() => setCoverSelectionMode('upload')}
                  startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  Upload
                </Button>
                <Button
                  size="small"
                  variant={coverSelectionMode === 'preset' ? 'contained' : 'outlined'}
                  onClick={() => setCoverSelectionMode('preset')}
                  startIcon={<ImageRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  Presets
                </Button>
                <Button
                  size="small"
                  variant={coverSelectionMode === 'url' ? 'contained' : 'outlined'}
                  onClick={() => setCoverSelectionMode('url')}
                  startIcon={<LinkRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
                >
                  Image URL
                </Button>
              </Box>
            </Box>

            {/* Mode 1: Upload */}
            {coverSelectionMode === 'upload' && (
              <Box sx={{ p: 2, border: '2px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center', bgcolor: '#FFFFFF' }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCoverUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
                <Button
                  variant="outlined"
                  disabled={isUploadingCover}
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<CloudUploadRoundedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                >
                  {isUploadingCover ? 'Uploading to Azure Storage...' : 'Select Image File'}
                </Button>
              </Box>
            )}

            {/* Mode 2: Presets */}
            {coverSelectionMode === 'preset' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
                {CURATED_BLOG_COVERS.map((imgUrl, i) => (
                  <Box
                    key={i}
                    onClick={() => setEditForm({ ...editForm, coverImage: imgUrl })}
                    sx={{
                      height: 52,
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: editForm.coverImage === imgUrl ? '2px solid #2563EB' : '1px solid #CBD5E1',
                    }}
                  >
                    <Box component="img" src={imgUrl} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                ))}
              </Box>
            )}

            {/* Mode 3: URL */}
            {coverSelectionMode === 'url' && (
              <TextField
                size="small"
                fullWidth
                placeholder="https://images.unsplash.com/..."
                value={editForm.coverImage}
                onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            )}

            {/* Preview */}
            {editForm.coverImage && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, borderTop: '1px solid #E2E8F0' }}>
                <Box
                  component="img"
                  src={editForm.coverImage}
                  alt="Preview"
                  sx={{ width: 80, height: 48, objectFit: 'cover', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
                <Typography sx={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> Current Cover Picture
                </Typography>
              </Box>
            )}
          </Box>

          <TextField
            label="Tags (comma-separated)"
            fullWidth
            placeholder="TypeScript, NextJS, NestJS, Azure"
            value={editForm.tags}
            onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
          />

          {/* TipTap Rich Editor */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
              Article Body (TipTap Visual Rich Editor)
            </Typography>
            <TipTapEditor
              content={editForm.content}
              onChange={(html) => setEditForm({ ...editForm, content: html })}
              placeholder="Edit your technical article here..."
              minHeight={280}
              maxHeight={440}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={() => setIsEditing(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isSaving}
            onClick={handleSaveEdit}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              px: 3,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {isSaving ? 'Saving Changes...' : 'Save & Publish Updates'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteModalOpen}
        title="Delete Technical Article"
        subtitle={`Are you sure you want to permanently delete "${blog.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </Box>
  );
}
