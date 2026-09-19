'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

interface FacultyCreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  collegeId?: string;
  collegeName?: string;
  onCourseCreated?: (course: any) => void;
}

export default function FacultyCreateCourseModal({
  open,
  onClose,
  collegeId,
  collegeName = 'Academic Institution',
  onCourseCreated,
}: FacultyCreateCourseModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('PUBLISHED');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a course title.', 'Validation Error');
      return;
    }

    setCreating(true);
    try {
      const created = await apiService.createCourse({
        title: title.trim(),
        description: description.trim() || undefined,
        collegeId: collegeId || undefined,
        status: status,
      });

      toast.success(`Curriculum course "${title.trim()}" created successfully!`, 'Course Created');
      onCourseCreated?.(created);
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create curriculum course.', 'Creation Failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #DDD6FE',
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Create Curriculum Course
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
              Author syllabus track for {collegeName}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <Box component="form" onSubmit={handleCreate}>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Course Title"
            placeholder="e.g. Advanced Data Structures & Algorithms Lab"
            required
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MenuBookRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Course Description & Learning Outcomes"
            placeholder="Overview of curriculum modules, lab tasks, problem assignments, and grading criteria..."
            multiline
            rows={3}
            fullWidth
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <FormControl fullWidth size="small">
            <InputLabel>Publish Status</InputLabel>
            <Select
              value={status}
              label="Publish Status"
              onChange={(e) => setStatus(e.target.value)}
            >
              <MenuItem value="PUBLISHED">Published (Available to Students)</MenuItem>
              <MenuItem value="DRAFT">Draft (Faculty Authoring Mode)</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            p: '16px 24px',
            bgcolor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              color: '#64748B',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={creating || !title.trim()}
            sx={{
              bgcolor: '#7C3AED',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '10px',
              px: 3,
              py: 0.9,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#6D28D9' },
            }}
          >
            {creating ? 'Creating...' : 'Create Course'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
