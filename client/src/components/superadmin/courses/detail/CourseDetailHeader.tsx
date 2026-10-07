'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { InteractiveWarpGrid } from '@/components/common/InteractiveWarpGrid';
import type { CourseDirectoryEntity } from '@/types/course';

interface CourseDetailHeaderProps {
  course: CourseDirectoryEntity;
  isStudent?: boolean;
  isStudioMode?: boolean;
  isEnrolled?: boolean;
  isEnrolling?: boolean;
  courseCompletionPct: number;
  totalProblemsCount: number;
  learningItems: string[];
  onEditCourse: () => void;
  onEnrollOrStart: (firstLessonKey: string) => void;
  firstLessonKey: string;
}

export default function CourseDetailHeader({
  course,
  isStudent = false,
  isStudioMode = false,
  isEnrolled = false,
  isEnrolling = false,
  courseCompletionPct,
  totalProblemsCount,
  learningItems,
  onEditCourse,
  onEnrollOrStart,
  firstLessonKey,
}: CourseDetailHeaderProps) {
  const borderColor = '#E2E8F0';

  return (
    <>
      {/* Breadcrumb & Global Action Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        {/* Breadcrumb Navigation Trail */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            component={Link}
            href={isStudent ? '/courses' : '/superadmin/courses'}
            sx={{
              color: '#64748B',
              fontSize: '0.86rem',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              '&:hover': { color: '#2563EB' },
            }}
          >
            Courses
          </Typography>
          <Typography sx={{ color: '#CBD5E1', fontSize: '0.86rem' }}>/</Typography>
          <Typography
            sx={{
              color: '#0F172A',
              fontSize: '0.86rem',
              fontWeight: 700,
              maxWidth: { xs: 240, sm: 380, md: 500 },
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {course.title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {(!isStudent || isStudioMode) && (
            <Button
              variant="outlined"
              onClick={onEditCourse}
              startIcon={<EditRoundedIcon sx={{ fontSize: 17 }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#2563EB',
                borderColor: '#BFDBFE',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                px: 2,
                py: 0.7,
                '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' },
              }}
            >
              Edit Course Details
            </Button>
          )}

          <Button
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#475569',
              borderColor: borderColor,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2.2,
              py: 0.7,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1', color: '#0F172A' },
            }}
          >
            Export Syllabus (.pdf)
          </Button>
          <Button
            variant="contained"
            disabled={isEnrolling}
            onClick={() => onEnrollOrStart(firstLessonKey)}
            startIcon={
              isEnrolling ? (
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: 19 }} />
              )
            }
            sx={{
              background: isEnrolled
                ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 2.5,
              py: 0.7,
              boxShadow: isEnrolled
                ? '0 4px 14px rgba(22, 163, 74, 0.25)'
                : '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                background: isEnrolled
                  ? 'linear-gradient(135deg, #15803D 0%, #166534 100%)'
                  : 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                boxShadow: isEnrolled
                  ? '0 6px 20px rgba(22, 163, 74, 0.35)'
                  : '0 6px 20px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            {isEnrolling
              ? 'Enrolling...'
              : isEnrolled
                ? 'Open Live Workspace'
                : 'Enroll & Start Learning'}
          </Button>
        </Box>
      </Box>

      {/* Hero Banner with Interactive Elastic Warp Grid */}
      <Box
        sx={{
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          bgcolor: '#07152E',
          backgroundImage: `
            radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.25) 0%, transparent 50%),
            linear-gradient(135deg, #071329 0%, #0C234F 60%, #153272 100%)
          `,
          p: { xs: 2.5, sm: 3, md: 3.5 },
          boxShadow: '0 12px 36px rgba(11, 34, 74, 0.16)',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
          gap: 3,
        }}
      >
        <InteractiveWarpGrid
          gridSize={36}
          warpRadius={200}
          warpStrength={50}
          lineColor="rgba(147, 197, 253, 0.22)"
          glowColor="rgba(59, 130, 246, 0.42)"
        />

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(7, 19, 41, 0.4) 100%)',
            zIndex: 0,
          }}
        />

        {/* Hero Left Content */}
        <Box sx={{ position: 'relative', zIndex: 1, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />
            <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.01em' }}>
              Standardized Academic Accreditation
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.15rem' },
                letterSpacing: '-0.025em',
                color: '#FFFFFF',
                lineHeight: 1.2,
              }}
            >
              {course.title}
            </Typography>
            {(!isStudent || isStudioMode) && (
              <Tooltip title="Edit Course Details">
                <IconButton
                  size="small"
                  onClick={onEditCourse}
                  sx={{
                    color: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(8px)',
                    p: 0.75,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)' },
                  }}
                >
                  <EditRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Typography
            sx={{
              color: '#CBD5E1',
              fontSize: { xs: '0.88rem', md: '0.94rem' },
              lineHeight: 1.55,
              maxWidth: 680,
              fontWeight: 450,
            }}
          >
            {course.description}
          </Typography>

          {/* Badges Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1.25, pt: 0.25 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.4,
                py: 0.5,
                borderRadius: '9999px',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
              }}
            >
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 16, color: '#FCD34D' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                Verified Certificate Included
              </Typography>
            </Box>

            {/* Rating Badge (rendered only if real rating exists) */}
            {(course as any).rating != null && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.3,
                  py: 0.5,
                  borderRadius: '9999px',
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  fontWeight: 800,
                }}
              >
                <StarRoundedIcon sx={{ fontSize: 16, color: '#0F172A' }} />
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800 }}>
                  {(course as any).rating}
                </Typography>
                {(course as any).ratingCount != null && (
                  <Typography sx={{ fontSize: '0.74rem', color: '#1E293B', fontWeight: 700 }}>
                    ({(course as any).ratingCount})
                  </Typography>
                )}
              </Box>
            )}

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.6,
                px: 1.25,
                py: 0.45,
                borderRadius: '9999px',
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
              }}
            >
              <TerminalRoundedIcon sx={{ fontSize: 15, color: '#60A5FA' }} />
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                Interactive Code Sandbox
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Hero Right Metrics */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minWidth: { xs: '100%', sm: 260 },
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            p: 2.5,
          }}
        >
          <Typography sx={{ color: '#93C5FD', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Course Overview
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#94A3B8' }}>
                <LayersRoundedIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Modules</Typography>
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem', mt: 0.25 }}>
                {course.modules?.length ?? (course.modulesCount ?? (course.moduleHighlights?.length ?? '—'))}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#94A3B8' }}>
                <CodeRoundedIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Problems</Typography>
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.2rem', mt: 0.25 }}>
                {totalProblemsCount != null ? totalProblemsCount : '—'}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#94A3B8' }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Duration</Typography>
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.1rem', mt: 0.25 }}>
                {course.durationHours != null ? `${course.durationHours} hrs` : (course as any).estimatedHours != null ? `${(course as any).estimatedHours} hrs` : '—'}
              </Typography>
            </Box>

            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#94A3B8' }}>
                <PeopleAltRoundedIcon sx={{ fontSize: 16 }} />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600 }}>Enrolled</Typography>
              </Box>
              <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '1.1rem', mt: 0.25 }}>
                {(course as any).enrolledStudentsCount != null ? Number((course as any).enrolledStudentsCount).toLocaleString() : (course as any).enrolledStudents != null ? Number((course as any).enrolledStudents).toLocaleString() : '—'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
