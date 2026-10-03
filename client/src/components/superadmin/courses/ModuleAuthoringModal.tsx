'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

interface ModuleAuthoringModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; description: string }) => Promise<void> | void;
  initialData?: { id?: string; title: string; description?: string } | null;
  isEditing?: boolean;
}

export default function ModuleAuthoringModal({
  open,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: ModuleAuthoringModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const borderColor = '#E2E8F0';

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDescription(initialData.description || '');
      } else {
        setTitle('');
        setDescription('');
      }
      setIsSubmitting(false);
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        description: description.trim(),
      });
      onClose();
    } catch (err) {
      console.error('Failed to save module:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: { xs: 2.5, md: 3 },
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.16)',
            border: `1px solid ${borderColor}`,
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE',
            }}
          >
            <LayersRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
              {isEditing ? 'Edit Curriculum Module' : 'Create New Curriculum Module'}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
              Group topics, tutorials, and practical milestone labs into structured units.
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 0, py: 1.5, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Module Title */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Module Title <span style={{ color: '#EF4444' }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Module 1: Core Syntax & Data Structures"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              slotProps={{
                input: {
                  startAdornment: (
                    <LayersRoundedIcon sx={{ fontSize: 18, color: '#94A3B8', mr: 1 }} />
                  ),
                  sx: {
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: borderColor },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                },
              }}
            />
          </Box>

          {/* Module Description / Summary */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Module Overview / Learning Goals
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder="Outline what students will master in this unit (e.g., variables, memory references, control flow)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#94A3B8', mr: 1, mt: 0.8, alignSelf: 'flex-start' }} />
                  ),
                  sx: {
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: borderColor },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 0, pt: 2, borderTop: `1px solid ${borderColor}`, gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.2,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!title.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : null}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 3,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Module'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
