'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { uploadFileToAzureBlob } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';
import TipTapEditor from '@/components/shared/TipTapEditor';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import { CATEGORIES, DEFAULT_COVER_OPTIONS } from './types';

interface BlogWriterModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (blog: {
    title: string;
    subtitle: string;
    category: string;
    tags: string[];
    content: string;
    coverImage: string;
    readTime: string;
  }) => Promise<void>;
}

export default function BlogWriterModal({
  open,
  onClose,
  onPublish,
}: BlogWriterModalProps) {
  const toast = useToast();
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('System Architecture');
  const [newTags, setNewTags] = useState('Backend, Distributed Systems');
  const [newContent, setNewContent] = useState('');
  const [writeTab, setWriteTab] = useState<'edit' | 'preview'>('edit');
  const [newCoverImg, setNewCoverImg] = useState(DEFAULT_COVER_OPTIONS[0]);
  const [coverSelectionMode, setCoverSelectionMode] = useState<'preset' | 'upload' | 'url'>('preset');
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingCover) {
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please enter a title and story content.', 'Incomplete Story');
      return;
    }

    const tagsArr = newTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    let safeCoverImage = DEFAULT_COVER_OPTIONS[0];
    if (newCoverImg.trim()) {
      try {
        const parsed = new URL(newCoverImg.trim());
        if (parsed.protocol === 'https:') {
          safeCoverImage = newCoverImg.trim();
        } else {
          toast.error('Cover image must use a secure HTTPS URL.', 'Invalid Cover URL');
          return;
        }
      } catch {
        toast.error('Please provide a valid HTTPS URL for the cover image.', 'Invalid Cover URL');
        return;
      }
    }

    const wordCount = newContent.trim().split(/\s+/).filter(Boolean).length || 120;
    const computedReadTime = `${Math.max(1, Math.ceil(wordCount / 180))} min read`;

    setIsSubmitting(true);
    try {
      await onPublish({
        title: newTitle.trim(),
        subtitle: newSubtitle.trim() || 'A detailed walkthrough and technical breakdown.',
        category: newCategory,
        tags: tagsArr,
        content: newContent,
        coverImage: safeCoverImage,
        readTime: computedReadTime,
      });

      setNewTitle('');
      setNewSubtitle('');
      setNewContent('');
      onClose();
    } catch (err: any) {
      console.error('Failed to publish blog:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
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
          <EditNoteRoundedIcon sx={{ color: '#0B1F3A' }} />
          Write & Publish Story
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isSubmitting}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleFormSubmit}>
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
                      ? { bgcolor: '#0B1F3A', color: '#fff', '&:hover': { bgcolor: '#17366E' } }
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
                      ? { bgcolor: '#0B1F3A', color: '#fff', '&:hover': { bgcolor: '#17366E' } }
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
                      ? { bgcolor: '#0B1F3A', color: '#fff', '&:hover': { bgcolor: '#17366E' } }
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
                      border: newCoverImg === imgUrl ? '2.5px solid #0B1F3A' : '1px solid #CBD5E1',
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
                      borderColor: '#0B1F3A',
                      bgcolor: '#F0F7FF',
                      boxShadow: '0 0 0 3px rgba(11, 31, 58, 0.15)',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.8,
                  }}
                >
                  {isUploadingCover ? (
                    <>
                      <CircularProgress size={24} sx={{ color: '#0B1F3A' }} />
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0B1F3A' }}>
                        Uploading picture to cloud storage...
                      </Typography>
                    </>
                  ) : (
                    <>
                      <CloudUploadRoundedIcon sx={{ fontSize: 28, color: '#0B1F3A' }} />
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
                  color: writeTab === 'edit' ? '#0B1F3A' : '#64748B',
                  borderBottom: writeTab === 'edit' ? '2px solid #0B1F3A' : 'none',
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
                  color: writeTab === 'preview' ? '#0B1F3A' : '#64748B',
                  borderBottom: writeTab === 'preview' ? '2px solid #0B1F3A' : 'none',
                  borderRadius: 0,
                }}
              >
                Live Preview
              </Button>
            </Box>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5, pr: 1 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#0B1F3A' }} />
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
          <Button onClick={onClose} disabled={isSubmitting} sx={{ textTransform: 'none', borderRadius: '10px' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || isUploadingCover}
            sx={{
              bgcolor: '#0B1F3A',
              textTransform: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#17366E' },
            }}
          >
            {isSubmitting ? 'Publishing...' : isUploadingCover ? 'Uploading Cover...' : 'Publish Article'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
