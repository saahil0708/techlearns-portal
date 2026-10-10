'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Slider,
  CircularProgress,
} from '@mui/material';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import { CareerTrack } from './types';

interface CuratedRoadmapStepProps {
  activeTrackObj: CareerTrack;
  quizScore: number;
  displayCourses: any[];
  enrolledCourseIds: Set<string>;
  enrollingCourseId: string | null;
  onEnrollCourse: (courseId: string) => void;
  targetProblemsPerWeek: number;
  setTargetProblemsPerWeek: (val: number) => void;
  targetWeeklyHours: number;
  setTargetWeeklyHours: (val: number) => void;
}

export function CuratedRoadmapStep({
  activeTrackObj,
  quizScore,
  displayCourses,
  enrolledCourseIds,
  enrollingCourseId,
  onEnrollCourse,
  targetProblemsPerWeek,
  setTargetProblemsPerWeek,
  targetWeeklyHours,
  setTargetWeeklyHours,
}: CuratedRoadmapStepProps) {
  return (
    <Box>
      {/* Score & Diagnostic Hero Card */}
      <Card
        sx={{
          p: 3,
          mb: 3.5,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #FAF5FF 0%, #F0FDF4 100%)',
          border: '1.5px solid #F3E8FF',
          boxShadow: '0 4px 12px 0 rgba(91, 45, 144, 0.06)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '14px',
                bgcolor: '#0B1F3A',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(91, 45, 144, 0.3)',
              }}
            >
              <StarsRoundedIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                Calibration Complete: {activeTrackObj.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#475569', mt: 0.3 }}>
                Diagnostic Score: <strong>{quizScore}%</strong> • Target Readiness Baseline Calibrated
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
              label="Curriculum Generated"
              sx={{
                bgcolor: '#DCFCE7',
                color: '#15803D',
                fontWeight: 700,
                border: '1px solid #86EFAC',
              }}
            />
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
              label="Ready for Practice"
              sx={{
                bgcolor: '#E9D5FF',
                color: '#0F264F',
                fontWeight: 700,
                border: '1px solid #E9D5FF',
              }}
            />
          </Box>
        </Box>
      </Card>

      {/* Recommended Courses Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Recommended Platform Courses for {activeTrackObj.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Curated structured learning tracks based on your diagnostic answers. Click Enroll to add directly to your profile.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/courses"
            size="small"
            sx={{
              color: '#0B1F3A',
              fontWeight: 700,
              fontSize: '0.8rem',
              textTransform: 'none',
              '&:hover': { bgcolor: '#FAF5FF' },
            }}
          >
            Browse All Courses →
          </Button>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          {displayCourses.map((course) => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            const isEnrolling = enrollingCourseId === course.id;

            return (
              <Card
                key={course.id}
                sx={{
                  p: 2.5,
                  borderRadius: '12px',
                  border: isEnrolled ? '1.5px solid #10B981' : '1.5px solid #E2E8F0',
                  bgcolor: isEnrolled ? '#F0FDF4' : '#FFFFFF',
                  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: isEnrolled ? '#10B981' : '#C084FC',
                    boxShadow: '0 4px 12px 0 rgba(91, 45, 144, 0.08)',
                  },
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Chip
                      label={course.level || course.difficulty || 'Intermediate'}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        bgcolor: '#FAF5FF',
                        color: '#17366E',
                        border: '1px solid #F3E8FF',
                      }}
                    />
                    {isEnrolled && (
                      <Chip
                        label="Enrolled"
                        size="small"
                        color="success"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800 }}
                      />
                    )}
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, lineHeight: 1.3 }}>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748B',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      mb: 2,
                      lineHeight: 1.4,
                    }}
                  >
                    {course.description || 'Master key fundamentals, hands-on architectural design, and modern best practices.'}
                  </Typography>
                </Box>

                <Box sx={{ pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
                  {isEnrolled ? (
                    <Button
                      component={Link}
                      href={`/courses/${course.slug || course.id}`}
                      fullWidth
                      variant="outlined"
                      color="success"
                      size="small"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                      }}
                    >
                      Continue Learning
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onEnrollCourse(course.id)}
                      disabled={isEnrolling}
                      fullWidth
                      variant="contained"
                      size="small"
                      startIcon={isEnrolling ? <CircularProgress size={14} color="inherit" /> : <RocketLaunchRoundedIcon />}
                      sx={{
                        bgcolor: '#0B1F3A',
                        color: '#FFFFFF',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderRadius: '8px',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#17366E' },
                      }}
                    >
                      {isEnrolling ? 'Enrolling...' : 'Enroll in Course'}
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Target Goals Configuration */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          Configure Your Weekly Learning Targets
        </Typography>
        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 2.5 }}>
          These goals sync with your student dashboard and feed your weekly momentum metrics.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
          {/* Problems per week */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Target Problems Solved / Week
              </Typography>
              <Chip
                label={`${targetProblemsPerWeek} Problems`}
                size="small"
                sx={{ bgcolor: '#FAF5FF', color: '#0B1F3A', fontWeight: 800, border: '1px solid #F3E8FF' }}
              />
            </Box>
            <Slider
              value={targetProblemsPerWeek}
              min={5}
              max={40}
              step={5}
              marks={[
                { value: 5, label: '5' },
                { value: 15, label: '15' },
                { value: 25, label: '25' },
                { value: 40, label: '40' },
              ]}
              onChange={(_, val) => setTargetProblemsPerWeek(val as number)}
              sx={{
                color: '#0B1F3A',
                '& .MuiSlider-thumb': { bgcolor: '#FFFFFF', border: '3px solid #0B1F3A' },
              }}
            />
          </Card>

          {/* Study hours per week */}
          <Card
            sx={{
              p: 2.5,
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              bgcolor: '#FFFFFF',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                Dedicated Study Hours / Week
              </Typography>
              <Chip
                label={`${targetWeeklyHours} Hours`}
                size="small"
                sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, border: '1px solid #A7F3D0' }}
              />
            </Box>
            <Slider
              value={targetWeeklyHours}
              min={3}
              max={30}
              step={1}
              marks={[
                { value: 3, label: '3h' },
                { value: 10, label: '10h' },
                { value: 20, label: '20h' },
                { value: 30, label: '30h' },
              ]}
              onChange={(_, val) => setTargetWeeklyHours(val as number)}
              sx={{
                color: '#059669',
                '& .MuiSlider-thumb': { bgcolor: '#FFFFFF', border: '3px solid #059669' },
              }}
            />
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
