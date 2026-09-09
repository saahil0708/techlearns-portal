'use client';

import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Button,
  Divider,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import type { CourseDirectoryEntity } from '@/types/course';

interface CourseQuickPeekDrawerProps {
  open: boolean;
  onClose: () => void;
  course: CourseDirectoryEntity | null;
}

export default function CourseQuickPeekDrawer({
  open,
  onClose,
  course,
}: CourseQuickPeekDrawerProps) {
  const toast = useToast();
  if (!course) return null;

  const [copied, setCopied] = React.useState(false);
  const borderColor = '#E2E8F0';

  const handleCopySlug = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/courses/${course.slug}`);
      setCopied(true);
      toast.info('Course share URL copied to clipboard!', 'Link Copied');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getLevelBadgeStyle = (level: string) => {
    switch (level) {
      case 'Beginner':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' };
      case 'Intermediate':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' };
      case 'Advanced':
        return { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F8FAFC', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const levelStyle = getLevelBadgeStyle(course.level);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 460 },
            bgcolor: '#FFFFFF',
            borderLeft: `1px solid ${borderColor}`,
            boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.1)',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: course.accentColor || '#2563EB',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
            }}
          >
            <MenuBookRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Course Quick View
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontFamily: 'monospace' }}>
              CODE: {course.code}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Drawer Body Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Title & Category */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
            <Chip
              label={course.category}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE',
              }}
            />
            <Chip
              label={course.level}
              size="small"
              sx={{
                bgcolor: levelStyle.bg,
                color: levelStyle.text,
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: '9999px',
                border: `1px solid ${levelStyle.border}`,
              }}
            />
            <Chip
              label={course.status}
              size="small"
              sx={{
                bgcolor: course.status === 'Published' ? '#F0FDF4' : '#FFFBEB',
                color: course.status === 'Published' ? '#16A34A' : '#D97706',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: '9999px',
                border: '1px solid',
                borderColor: course.status === 'Published' ? '#BBF7D0' : '#FDE68A',
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.3 }}>
            {course.title}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 1, fontSize: '0.86rem', lineHeight: 1.5 }}>
            {course.description}
          </Typography>
        </Box>

        {/* 4 Metric Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: `1px solid ${borderColor}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', mb: 0.5 }}>
              <LayersRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                SYLLABUS
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              {course.modulesCount} Modules
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              {course.lessonsCount} Interactive Lessons
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: `1px solid ${borderColor}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', mb: 0.5 }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 18, color: '#7C3AED' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                DURATION
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              {course.durationHours} Hours
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Self-paced Labs
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: `1px solid ${borderColor}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', mb: 0.5 }}>
              <PeopleAltRoundedIcon sx={{ fontSize: 18, color: '#059669' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                ENROLLMENTS
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              {course.enrolledStudents.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600 }}>
              Active Coders
            </Typography>
          </Box>

          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: `1px solid ${borderColor}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', mb: 0.5 }}>
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: '#D97706' }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                COMPLETION RATE
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              {course.completionRate}%
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Passed Evaluations
            </Typography>
          </Box>
        </Box>

        {/* Lead Instructor Card */}
        <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#F8FAFC', border: `1px solid ${borderColor}` }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5, display: 'block' }}>
            Lead Faculty & Author
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={course.instructorAvatar}
              sx={{
                width: 44,
                height: 44,
                bgcolor: course.accentColor || '#2563EB',
                fontWeight: 800,
                fontSize: '0.95rem',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              {course.instructorName.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                {course.instructorName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.76rem' }}>
                {course.instructorTitle}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                <SchoolRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 600, fontSize: '0.74rem' }}>
                  {course.institutionName}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Course Syllabus Preview */}
        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5, display: 'block' }}>
            Syllabus Modules Highlights
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {course.moduleHighlights.map((mod, idx) => (
              <Box
                key={idx}
                sx={{
                  p: '10px 14px',
                  borderRadius: '10px',
                  bgcolor: '#FFFFFF',
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                    0{idx + 1}
                  </Typography>
                  <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.82rem' }}>
                    {mod.title}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                  {mod.lessons} Lessons
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Tags */}
        <Box>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1, display: 'block' }}>
            Curriculum Skills & Topics
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {course.tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                size="small"
                sx={{
                  borderRadius: '9999px',
                  bgcolor: '#F1F5F9',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  border: '1px solid #E2E8F0',
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Drawer Footer Actions */}
      <Box
        sx={{
          p: 2.5,
          borderTop: `1px solid ${borderColor}`,
          bgcolor: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleCopySlug}
          startIcon={copied ? <CheckCircleRoundedIcon sx={{ color: '#16A34A' }} /> : <ContentCopyRoundedIcon />}
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: '9999px',
            borderColor: borderColor,
            color: '#475569',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.84rem',
            py: 0.8,
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          {copied ? 'Course Link Copied!' : 'Copy Direct Syllabus Link'}
        </Button>

        <Link href={`/superadmin/courses/${course.slug}`} passHref style={{ textDecoration: 'none' }}>
          <Button
            fullWidth
            variant="contained"
            endIcon={<FluidArrowRight size={18} />}
            sx={{
              height: 44,
              borderRadius: '9999px',
              bgcolor: '#2563EB',
              fontWeight: 700,
              fontSize: '0.86rem',
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Launch Course Workspace & Syllabus
          </Button>
        </Link>
      </Box>
    </Drawer>
  );
}
