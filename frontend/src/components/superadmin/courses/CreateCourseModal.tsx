'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import type { CourseLevel, CourseCategory, NewCourseData } from '@/types/course';
export type { CourseLevel, CourseCategory, NewCourseData };

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewCourseData) => void;
}

export default function CreateCourseModal({ open, onClose, onCreate }: CreateCourseModalProps) {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Computer Science & DSA');
  const [level, setLevel] = useState<CourseLevel>('Intermediate');
  const [instructorName, setInstructorName] = useState('');
  const [instructorTitle, setInstructorTitle] = useState('Senior Faculty / Professor');
  const [institutionName, setInstitutionName] = useState('Stanford University - Dept of CS');
  const [durationHours, setDurationHours] = useState<number>(36);
  const [modulesCount, setModulesCount] = useState<number>(8);
  const [lessonsCount, setLessonsCount] = useState<number>(40);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Algorithms', 'Data Structures', 'Python']);

  const borderColor = '#E2E8F0';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim() || !instructorName.trim()) return;

    onCreate({
      title: title.trim(),
      code: code.trim().toUpperCase(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      level,
      instructorName: instructorName.trim(),
      instructorTitle: instructorTitle.trim(),
      institutionName: institutionName.trim(),
      durationHours: Number(durationHours) || 20,
      modulesCount: Number(modulesCount) || 5,
      lessonsCount: Number(lessonsCount) || 25,
      description: description.trim() || 'Comprehensive mastery curriculum with interactive coding challenges.',
      status,
      tags,
    });

    // Reset Form
    setTitle('');
    setCode('');
    setSlug('');
    setInstructorName('');
    setDescription('');
    onClose();
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
            maxWidth: 560,
            width: '100%',
            borderRadius: '24px',
            p: 1,
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <MenuBookRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                Create New Course
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.25 }}>
                Author curriculum modules, interactive lessons & coding labs
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#94A3B8',
              borderRadius: '9999px',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Content Body */}
        <DialogContent sx={{ px: 3.5, pt: '28px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Row 1: Course Title */}
          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
              COURSE TITLE *
            </Typography>
            <TextField
              fullWidth
              size="small"
              required
              placeholder="e.g., Advanced Data Structures & Algorithm Design"
              value={title}
              onChange={handleTitleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                },
              }}
            />
          </Box>

          {/* Row 2: Code & Slug */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                COURSE CODE *
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g., CS-301"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                URL SLUG *
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g., advanced-dsa-301"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Row 3: Category & Level */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                CATEGORY / DOMAIN *
              </Typography>
              <Select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                }}
              >
                <MenuItem value="Computer Science & DSA">Computer Science & DSA</MenuItem>
                <MenuItem value="System Design & Architecture">System Design & Architecture</MenuItem>
                <MenuItem value="Web & Full-Stack Development">Web & Full-Stack Development</MenuItem>
                <MenuItem value="Competitive Programming">Competitive Programming</MenuItem>
                <MenuItem value="AI, ML & Data Science">AI, ML & Data Science</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                DIFFICULTY LEVEL *
              </Typography>
              <Select
                fullWidth
                size="small"
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                }}
              >
                <MenuItem value="Beginner">🟢 Beginner</MenuItem>
                <MenuItem value="Intermediate">🟡 Intermediate</MenuItem>
                <MenuItem value="Advanced">🔴 Advanced</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Row 4: Instructor & Institution */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                LEAD INSTRUCTOR *
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g., Dr. Robert Sedgewick"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                INSTITUTION / DEPARTMENT
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Row 5: Modules, Lessons & Duration */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                MODULES
              </Typography>
              <TextField
                fullWidth
                type="number"
                size="small"
                value={modulesCount}
                onChange={(e) => setModulesCount(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                LESSONS
              </Typography>
              <TextField
                fullWidth
                type="number"
                size="small"
                value={lessonsCount}
                onChange={(e) => setLessonsCount(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                EST. HOURS
              </Typography>
              <TextField
                fullWidth
                type="number"
                size="small"
                value={durationHours}
                onChange={(e) => setDurationHours(Number(e.target.value))}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Row 6: Description */}
          <Box>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
              COURSE SUMMARY & OBJECTIVES
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Brief summary of syllabus objectives, prerequisite expectations, and hands-on coding modules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>

          {/* Row 7: Tags & Status */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
              TAGS (Press Enter to add)
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  size="small"
                  onDelete={() => handleRemoveTag(tag)}
                  sx={{
                    borderRadius: '9999px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    border: '1px solid #DBEAFE',
                  }}
                />
              ))}
              <TextField
                size="small"
                placeholder="+ Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                sx={{
                  width: 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    height: 28,
                    fontSize: '0.75rem',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Actions */}
        <DialogActions sx={{ p: 2.5, pt: 2, display: 'flex', gap: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={onClose}
            sx={{
              height: 44,
              borderRadius: '9999px',
              borderColor: '#CBD5E1',
              color: '#475569',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={!title.trim() || !code.trim() || !instructorName.trim()}
            sx={{
              height: 44,
              borderRadius: '9999px',
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
              '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
            }}
          >
            Publish Course
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
