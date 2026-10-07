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
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { BLOG_CATEGORIES } from '@/types/blog';
import { useToast } from '@/context/ToastContext';
import { uploadFileToAzureBlob } from '@/lib/storage';
import TipTapEditor from '@/components/shared/TipTapEditor';
import { CURATED_BLOG_COVERS, EditBlogFormState } from './types';

interface BlogEditModalProps {
  open: boolean;
  onClose: () => void;
  editBlogForm: EditBlogFormState;
  setEditBlogForm: React.Dispatch<React.SetStateAction<EditBlogFormState>>;
  isSavingEdit: boolean;
  onSave: () => void;
}

export default function BlogEditModal({
  open,
  onClose,
  editBlogForm,
  setEditBlogForm,
  isSavingEdit,
  onSave,
}: BlogEditModalProps) {
  const toast = useToast();
  const editFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingEditCover, setIsUploadingEditCover] = useState(false);
  const [editCoverSelectionMode, setEditCoverSelectionMode] = useState<'upload' | 'preset' | 'url'>('preset');
  const activeSessionRef = useRef<number>(0);

  React.useEffect(() => {
    activeSessionRef.current += 1;
    if (!open) {
      setIsUploadingEditCover(false);
    }
  }, [open]);

  const handleEditCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, JPG, WebP, SVG).', 'Invalid File');
      return;
    }

    const currentSession = activeSessionRef.current;

    try {
      setIsUploadingEditCover(true);
      const res = await uploadFileToAzureBlob(file, {
        folder: 'blogs',
        allowedTypes: ['image/*'],
      });
      if (activeSessionRef.current === currentSession && open) {
        setEditBlogForm((prev) => ({ ...prev, coverImage: res.blobUrl }));
        toast.success('Cover image uploaded successfully to storage!', 'Image Uploaded');
      }
    } catch (err: any) {
      if (activeSessionRef.current === currentSession && open) {
        toast.error(err?.message || 'Failed to upload cover picture. Please try again.', 'Upload Failed');
      }
    } finally {
      if (activeSessionRef.current === currentSession) {
        setIsUploadingEditCover(false);
      }
      if (editFileInputRef.current) editFileInputRef.current.value = '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
              Edit Technical Article
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              Update title, content, status, tags, and cover assets
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 3 }}>
        <TextField
          label="Article Title"
          fullWidth
          required
          value={editBlogForm.title}
          onChange={(e) => setEditBlogForm({ ...editBlogForm, title: e.target.value })}
        />

        <TextField
          label="Subtitle / Summary"
          fullWidth
          multiline
          rows={2}
          value={editBlogForm.subtitle}
          onChange={(e) => setEditBlogForm({ ...editBlogForm, subtitle: e.target.value })}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="superadmin-edit-category-label">Category</InputLabel>
            <Select
              labelId="superadmin-edit-category-label"
              label="Category"
              value={editBlogForm.category}
              onChange={(e) => setEditBlogForm({ ...editBlogForm, category: e.target.value })}
            >
              {BLOG_CATEGORIES.filter((c) => c !== 'All Stories').map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="superadmin-edit-status-label">Publication Status</InputLabel>
            <Select
              labelId="superadmin-edit-status-label"
              label="Publication Status"
              value={editBlogForm.status}
              onChange={(e) => setEditBlogForm({ ...editBlogForm, status: e.target.value as any })}
            >
              <MenuItem value="Published">Published</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </Select>
          </FormControl>
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
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
              Cover Picture
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.8 }}>
              <Button
                size="small"
                variant={editCoverSelectionMode === 'upload' ? 'contained' : 'outlined'}
                onClick={() => setEditCoverSelectionMode('upload')}
                startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
              >
                Upload
              </Button>
              <Button
                size="small"
                variant={editCoverSelectionMode === 'preset' ? 'contained' : 'outlined'}
                onClick={() => setEditCoverSelectionMode('preset')}
                startIcon={<ImageRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
              >
                Presets
              </Button>
              <Button
                size="small"
                variant={editCoverSelectionMode === 'url' ? 'contained' : 'outlined'}
                onClick={() => setEditCoverSelectionMode('url')}
                startIcon={<LinkRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: '8px' }}
              >
                Image URL
              </Button>
            </Box>
          </Box>

          {/* Mode 1: Upload */}
          {editCoverSelectionMode === 'upload' && (
            <Box sx={{ p: 2, border: '2px dashed #CBD5E1', borderRadius: '8px', textAlign: 'center', bgcolor: '#FFFFFF' }}>
              <input
                type="file"
                ref={editFileInputRef}
                onChange={handleEditCoverUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Button
                variant="outlined"
                disabled={isUploadingEditCover}
                onClick={() => editFileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                {isUploadingEditCover ? 'Uploading to Azure Storage...' : 'Select Image File'}
              </Button>
            </Box>
          )}

          {/* Mode 2: Presets */}
          {editCoverSelectionMode === 'preset' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1 }}>
              {CURATED_BLOG_COVERS.map((imgUrl, i) => (
                <Box
                  key={i}
                  component="button"
                  type="button"
                  aria-label={`Select preset cover ${i + 1}`}
                  onClick={() => setEditBlogForm({ ...editBlogForm, coverImage: imgUrl })}
                  sx={{
                    height: 52,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: editBlogForm.coverImage === imgUrl ? '2px solid #2563EB' : '1px solid #CBD5E1',
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

          {/* Mode 3: URL */}
          {editCoverSelectionMode === 'url' && (
            <TextField
              size="small"
              fullWidth
              placeholder="https://images.unsplash.com/..."
              value={editBlogForm.coverImage}
              onChange={(e) => setEditBlogForm({ ...editBlogForm, coverImage: e.target.value })}
              sx={{ bgcolor: '#FFFFFF' }}
            />
          )}

          {/* Preview */}
          {editBlogForm.coverImage && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 1, borderTop: '1px solid #E2E8F0' }}>
              <Box
                component="img"
                src={editBlogForm.coverImage}
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
          value={editBlogForm.tags}
          onChange={(e) => setEditBlogForm({ ...editBlogForm, tags: e.target.value })}
        />

        {/* TipTap Rich Editor */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
            Article Body (TipTap Visual Rich Editor)
          </Typography>
          <TipTapEditor
            content={editBlogForm.content}
            onChange={(html) => setEditBlogForm({ ...editBlogForm, content: html })}
            placeholder="Edit your technical article here..."
            minHeight={280}
            maxHeight={440}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isSavingEdit || isUploadingEditCover}
          onClick={onSave}
          sx={{
            bgcolor: '#2563EB',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            px: 3,
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {isSavingEdit ? 'Saving Changes...' : isUploadingEditCover ? 'Uploading Cover...' : 'Save & Publish Updates'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
