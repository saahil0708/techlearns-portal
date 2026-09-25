'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

const TRACK_OPTIONS = [
  'GenAI & LLMs',
  'Full Stack',
  'System Design',
  'Cloud & DevOps',
  'Cybersecurity',
  'Data Engineering',
  'Mobile Engineering',
];

const LEVEL_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

interface CreateBootcampModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (bootcamp: any) => void;
}

export default function CreateBootcampModal({
  open,
  onClose,
  onCreated,
}: CreateBootcampModalProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    track: 'GenAI & LLMs',
    instructor: '',
    instructorRole: 'Staff AI Architect',
    duration: '6 Weeks (Live Sprints)',
    level: 'Intermediate',
    badge: 'CEL Featured',
    maxSeats: 100,
    totalSessions: 12,
    nextSessionTopic: '',
  });

  const [syllabus, setSyllabus] = useState<{ week: string; topic: string; deliverables: string }[]>([
    { week: 'Week 1-2', topic: 'Core Architecture & Foundations', deliverables: 'Production Microservice Blueprint' },
    { week: 'Week 3-4', topic: 'Advanced Implementation & Pipelines', deliverables: 'High-Throughput Integration Service' },
    { week: 'Week 5-6', topic: 'Testing, Deployment & Capstone', deliverables: 'Live Production Gateway' },
  ]);

  const handleAddSyllabusItem = () => {
    setSyllabus((prev) => [
      ...prev,
      { week: `Week ${prev.length * 2 + 1}-${prev.length * 2 + 2}`, topic: '', deliverables: '' },
    ]);
  };

  const handleRemoveSyllabusItem = (index: number) => {
    setSyllabus((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSyllabusChange = (index: number, field: 'week' | 'topic' | 'deliverables', value: string) => {
    setSyllabus((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.instructor.trim()) {
      toast.error('Title and Lead Instructor are required', 'Validation Error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiService.createBootcamp({
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim() || undefined,
        track: formData.track,
        instructor: formData.instructor.trim(),
        instructorRole: formData.instructorRole.trim() || undefined,
        duration: formData.duration.trim() || undefined,
        level: formData.level,
        badge: formData.badge.trim() || undefined,
        maxSeats: Number(formData.maxSeats) || 100,
        totalSessions: Number(formData.totalSessions) || 12,
        nextSessionTopic: formData.nextSessionTopic.trim() || undefined,
        syllabus: syllabus.filter((s) => s.topic.trim().length > 0),
        status: 'PUBLISHED',
      });

      toast.success(`Bootcamp "${formData.title}" created successfully!`, 'Bootcamp Published');
      onCreated(res);
      onClose();
    } catch (err: any) {
      console.error('Failed to create bootcamp:', err);
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to create bootcamp. Please try again.',
        'Creation Failed',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#FEF3C7',
                color: '#D97706',
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                Launch New Sprint Bootcamp
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Create an intensive live cohort with syllabus deliverables and session tracking
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: '24px !important' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Row 1: Title & Track */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  BOOTCAMP TITLE *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. GenAI & Autonomous Agentic Workflows"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  TRACK *
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.track}
                  onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                >
                  {TRACK_OPTIONS.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Box>

            {/* Row 2: Subtitle */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                SUBTITLE / HIGH-LEVEL PROMISE
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Build production-ready LLM pipelines with LangGraph, LlamaIndex, and Vector RAG engines."
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>

            {/* Row 3: Instructor & Designation */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  LEAD INSTRUCTOR NAME *
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. Dr. Sarah Chen"
                  value={formData.instructor}
                  onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  INSTRUCTOR DESIGNATION / TITLE
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. Staff AI Research Scientist"
                  value={formData.instructorRole}
                  onChange={(e) => setFormData({ ...formData, instructorRole: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Row 4: Duration, Level, Badge */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  DURATION
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. 6 Weeks (Live Sprints)"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  TARGET LEVEL
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                >
                  {LEVEL_OPTIONS.map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  FEATURED BADGE
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g. CEL Featured, Flagship"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Row 5: Total Sessions & Seats */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  TOTAL LIVE MASTERCLASSES
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  value={formData.totalSessions}
                  onChange={(e) => setFormData({ ...formData, totalSessions: Number(e.target.value) })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                  MAX SEATS / CAPACITY
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  value={formData.maxSeats}
                  onChange={(e) => setFormData({ ...formData, maxSeats: Number(e.target.value) })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#FFFFFF',
                      borderRadius: '8px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Row 6: Next Live Session Topic */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.5, display: 'block' }}>
                NEXT UPCOMING SESSION TOPIC
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Autonomous Tool Calling with LangGraph & Hybrid Vector Search"
                value={formData.nextSessionTopic}
                onChange={(e) => setFormData({ ...formData, nextSessionTopic: e.target.value })}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            </Box>

            {/* Syllabus Milestones */}
            <Box>
              <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 700 }}>
                  Syllabus Sprint Milestones
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddCircleOutlineRoundedIcon />}
                  onClick={handleAddSyllabusItem}
                  sx={{ color: '#2563EB', textTransform: 'none', fontWeight: 600 }}
                >
                  Add Milestone
                </Button>
              </Box>

              {syllabus.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <TextField
                    size="small"
                    placeholder="Week 1-2"
                    value={item.week}
                    onChange={(e) => handleSyllabusChange(idx, 'week', e.target.value)}
                    sx={{
                      width: '120px',
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Sprint Topic (e.g. Vector Search & RAG)"
                    value={item.topic}
                    onChange={(e) => handleSyllabusChange(idx, 'topic', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Capstone Deliverable"
                    value={item.deliverables}
                    onChange={(e) => handleSyllabusChange(idx, 'deliverables', e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                  {syllabus.length > 1 && (
                    <IconButton size="small" onClick={() => handleRemoveSyllabusItem(idx)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
            justifyContent: 'space-between',
          }}
        >
          <Button onClick={onClose} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={<BoltRoundedIcon />}
            sx={{
              bgcolor: '#2563EB',
              backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              px: 3,
              borderRadius: '8px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              '&:hover': {
                bgcolor: '#1D4ED8',
                boxShadow: '0 6px 18px rgba(37, 99, 235, 0.5)',
              },
            }}
          >
            {submitting ? 'Publishing...' : 'Publish Sprint Bootcamp'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
