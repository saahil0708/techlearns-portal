'use client';

import React, { useRef, useState } from 'react';
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
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { BLOG_CATEGORIES } from '@/types/blog';
import { useToast } from '@/context/ToastContext';
import { uploadFileToAzureBlob } from '@/lib/storage';
import TipTapEditor from '@/components/shared/TipTapEditor';
import { CURATED_BLOG_COVERS, NewBlogFormState } from './types';

interface BlogCreateModalProps {
  open: boolean;
  onClose: () => void;
  newBlog: NewBlogFormState;
  setNewBlog: React.Dispatch<React.SetStateAction<NewBlogFormState>>;
  onSubmit: () => void;
}

export default function BlogCreateModal({
  open,
  onClose,
  newBlog,
  setNewBlog,
  onSubmit,
}: BlogCreateModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverSelectionMode, setCoverSelectionMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const activeSessionRef = useRef<number>(0);

  React.useEffect(() => {
    activeSessionRef.current += 1;
    if (!open) {
      setIsUploadingCover(false);
    }
  }, [open]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, SVG).', 'Invalid File');
      return;
    }

    const currentSession = activeSessionRef.current;

    try {
      setIsUploadingCover(true);
      const res = await uploadFileToAzureBlob(file, {
        folder: 'blogs',
        allowedTypes: ['image/*'],
      });
      if (activeSessionRef.current === currentSession && open) {
        setNewBlog((prev) => ({ ...prev, coverImage: res.blobUrl }));
        toast.success('Cover image uploaded successfully to storage!', 'Image Uploaded');
      }
    } catch (err: any) {
      console.error('Failed to upload image to Azure Storage:', err);
      if (activeSessionRef.current === currentSession && open) {
        toast.error(err?.message || 'Failed to upload cover picture. Please try again.', 'Upload Failed');
      }
    } finally {
      if (activeSessionRef.current === currentSession) {
        setIsUploadingCover(false);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px' } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Publish New Technical Article
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
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

        <Select
          value={newBlog.category}
          onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
          fullWidth
        >
          {BLOG_CATEGORIES.filter((c) => c !== 'All Stories').map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>

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
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
              Cover Picture
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                size="small"
                variant={coverSelectionMode === 'upload' ? 'contained' : 'outlined'}
                onClick={() => setCoverSelectionMode('upload')}
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
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
                variant={coverSelectionMode === 'preset' ? 'contained' : 'outlined'}
                onClick={() => setCoverSelectionMode('preset')}
                startIcon={<ImageRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
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
                variant={coverSelectionMode === 'url' ? 'contained' : 'outlined'}
                onClick={() => setCoverSelectionMode('url')}
                startIcon={<LinkRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
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

          {/* Mode 1: Choose / Upload File from Device */}
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
                  p: 2.5,
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
                    <CircularProgress size={26} sx={{ color: '#0B1F3A' }} />
                    <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0B1F3A' }}>
                      Uploading picture to cloud storage...
                    </Typography>
                  </>
                ) : (
                  <>
                    <CloudUploadRoundedIcon sx={{ fontSize: 32, color: '#0B1F3A' }} />
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                      Click to choose a picture from your device
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                      PNG, JPG, WebP, SVG (Max 10MB)
                    </Typography>
                  </>
                )}
              </Box>
            </Box>
          )}

          {/* Mode 2: Presets */}
          {coverSelectionMode === 'preset' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
              {CURATED_BLOG_COVERS.map((imgUrl, i) => (
                <Box
                  key={i}
                  component="button"
                  type="button"
                  aria-label={`Select preset cover ${i + 1}`}
                  onClick={() => setNewBlog((prev) => ({ ...prev, coverImage: imgUrl }))}
                  sx={{
                    height: 56,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: newBlog.coverImage === imgUrl ? '2.5px solid #0B1F3A' : '1px solid #CBD5E1',
                    transform: newBlog.coverImage === imgUrl ? 'scale(1.04)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    p: 0,
                    background: 'none',
                  }}
                >
                  <Box
                    component="img"
                    src={imgUrl}
                    alt={`Preset ${i + 1}`}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Mode 3: Image URL fallback */}
          {coverSelectionMode === 'url' && (
            <TextField
              size="small"
              fullWidth
              placeholder="https://images.unsplash.com/..."
              value={newBlog.coverImage}
              onChange={(e) => setNewBlog({ ...newBlog, coverImage: e.target.value })}
              sx={{ bgcolor: '#FFFFFF' }}
            />
          )}

          {/* Preview Banner */}
          {newBlog.coverImage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 0.5, borderTop: '1px solid #E2E8F0' }}>
              <Box
                component="img"
                src={newBlog.coverImage}
                alt="Cover Preview"
                onError={(e: any) => {
                  e.currentTarget.src = CURATED_BLOG_COVERS[0];
                }}
                sx={{
                  width: 88,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleRoundedIcon sx={{ fontSize: 15 }} /> Current Cover Picture
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {newBlog.coverImage}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        <TextField
          label="Tags (comma-separated)"
          fullWidth
          placeholder="Redis, WebSockets, Backend, SystemDesign"
          value={newBlog.tags}
          onChange={(e) => setNewBlog({ ...newBlog, tags: e.target.value })}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            Article Content (Rich TipTap Editor)
          </Typography>
          <TipTapEditor
            content={newBlog.content}
            onChange={(html) => setNewBlog({ ...newBlog, content: html })}
            placeholder="Write your technical article here... Use the toolbar for bold, italic, underline, strike, code blocks, tables, lists, links, and images."
            minHeight={260}
            maxHeight={420}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isUploadingCover}
          onClick={onSubmit}
          sx={{ bgcolor: '#0B1F3A', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 3, '&:hover': { bgcolor: '#17366E' } }}
        >
          {isUploadingCover ? 'Uploading Cover...' : 'Publish Article'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
