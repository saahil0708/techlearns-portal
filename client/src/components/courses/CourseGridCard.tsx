'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';

import { CourseDirectoryEntity } from '@/types/course';

interface CourseGridCardProps {
  course: CourseDirectoryEntity;
  progress?: number;
  onInspect: (course: CourseDirectoryEntity) => void;
  onEnroll: (courseId: string, title: string) => void;
}

// 3D Illustration assets and theme accents corresponding to course categories
function getCourseThemeConfig(category: string) {
  switch (category) {
    case 'UI/UX & Product Design':
      return {
        image: '/images/courses/uiux.jpg',
        fallbackBg: '#FFE4E8',
        cardBg: '#EEF2F6',
        titleColor: '#FF6433',
        btnBg: '#FA5A35',
        btnHover: '#E84824',
      };
    case 'Computer Science & DSA':
      return {
        image: '/images/courses/dsa.jpg',
        fallbackBg: '#E0F2FE',
        cardBg: '#EEF2F6',
        titleColor: '#2563EB',
        btnBg: '#2563EB',
        btnHover: '#1D4ED8',
      };
    case 'System Design & Architecture':
      return {
        image: '/images/courses/system.jpg',
        fallbackBg: '#F3E8FF',
        cardBg: '#EEF2F6',
        titleColor: '#7C3AED',
        btnBg: '#7C3AED',
        btnHover: '#6D28D9',
      };
    case 'AI, ML & Data Science':
      return {
        image: '/images/courses/ai.jpg',
        fallbackBg: '#FEF3C7',
        cardBg: '#EEF2F6',
        titleColor: '#D97706',
        btnBg: '#D97706',
        btnHover: '#B45309',
      };
    case 'Competitive Programming':
      return {
        image: '/images/courses/cp.jpg',
        fallbackBg: '#DCFCE7',
        cardBg: '#EEF2F6',
        titleColor: '#059669',
        btnBg: '#059669',
        btnHover: '#047857',
      };
    case 'Web & Full-Stack Development':
    default:
      return {
        image: '/images/courses/web.jpg',
        fallbackBg: '#E0F2FE',
        cardBg: '#EEF2F6',
        titleColor: '#0284C7',
        btnBg: '#0284C7',
        btnHover: '#0369A1',
      };
  }
}

export default function CourseGridCard({
  course,
  progress,
  onInspect,
  onEnroll,
}: CourseGridCardProps) {
  const theme = getCourseThemeConfig(course.category);
  const isEnrolled = progress !== undefined;

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onInspect(course)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          onInspect(course);
        } else if (e.key === ' ') {
          e.preventDefault();
          onInspect(course);
        }
      }}
      sx={{
        width: '100%',
        maxWidth: 320,
        mx: 'auto',
        borderRadius: '18px',
        bgcolor: theme.cardBg,
        border: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: 'none',
        },
      }}
    >
      {/* ========================================================================= */}
      {/* TOP 3D ARTWORK BANNER WITH SHARP SLANT CLIPPED DIVIDER */}
      {/* ========================================================================= */}
      <Box
        sx={{
          height: 215,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: theme.fallbackBg,
        }}
      >
        <Box
          component="img"
          src={theme.image}
          alt={course.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
            transition: 'transform 0.4s ease',
            '&:hover': {
              transform: 'scale(1.04)',
            },
          }}
        />

        {/* Sharp Pronounced Slant Clipped Shape Transition at Top */}
        <svg
          viewBox="0 0 320 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            bottom: -1,
            left: 0,
            width: '100%',
            height: '38px',
            zIndex: 5,
            pointerEvents: 'none',
          }}
          preserveAspectRatio="none"
        >
          <path
            d="M 0 38 L 0 26 L 85 26 L 118 0 L 320 0 L 320 38 Z"
            fill={theme.cardBg}
          />
        </svg>
      </Box>

      {/* ========================================================================= */}
      {/* CARD CONTENT BODY WITH RICH ICONS & METRICS */}
      {/* ========================================================================= */}
      <Box
        sx={{
          px: 2.8,
          pt: 1.6,
          pb: 1.2,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        {/* Course Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: '1.2rem',
            lineHeight: 1.32,
            color: theme.titleColor,
            mb: 0.8,
            letterSpacing: '-0.01em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {course.title}
        </Typography>

        {/* Level, Rating & Enrolled Stats Row with Icons */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 1.2,
            flexWrap: 'wrap',
          }}
        >
          {/* Level Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: '#F1F5F9',
              px: 1,
              py: 0.3,
              borderRadius: '6px',
            }}
          >
            <BarChartRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569' }}>
              {course.level}
            </Typography>
          </Box>

          {/* Rating */}
          {typeof course.rating === 'number' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <StarRoundedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                {course.rating.toFixed(1)}
              </Typography>
            </Box>
          )}

          {/* Students Enrolled */}
          {typeof course.enrolledStudents === 'number' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              <PeopleAltRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>
                {course.enrolledStudents >= 1000
                  ? `${(course.enrolledStudents / 1000).toFixed(1)}k`
                  : course.enrolledStudents}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: '#64748B',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 1.2,
          }}
        >
          {course.description}
        </Typography>

        {/* Modules & Lessons Spec Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pt: 0.8,
            borderTop: '1px solid #F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <LayersRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>
              {course.modulesCount} Modules
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <MenuBookRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>
              {course.lessonsCount} Lessons
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* CARD FOOTER WITH CLIPPED NOTCH (CLEAN NEUTRAL) & PILL BUTTON AT BASE */}
      {/* ========================================================================= */}
      <Box
        sx={{
          position: 'relative',
          mt: 'auto',
          height: 48,
          bgcolor: theme.cardBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Bottom-Right Clipped Notch Backdrop (Pure White Pocket for Button) */}
        <svg
          viewBox="0 0 320 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '100%',
            height: '48px',
            zIndex: 1,
            pointerEvents: 'none',
          }}
          preserveAspectRatio="none"
        >
          <path
            d="M 140 48 L 173 0 L 320 0 L 320 48 Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Left Side Metadata inside Pure White Section */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
          }}
        >
          <AccessTimeRoundedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B' }}>
            {course.durationHours} hrs
          </Typography>
        </Box>

        {/* Right Side: True Pill Action Button Shifted More Right at Base */}
        <Box
          sx={{
            position: 'absolute',
            right: -0.5,
            bottom: 0,
            zIndex: 2,
          }}
        >
          {isEnrolled ? (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onInspect(course);
              }}
              startIcon={progress === 100 ? <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 40,
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                px: 2.8,
                bgcolor: progress === 100 ? '#0F172A' : '#2563EB',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: progress === 100 ? '#1E293B' : '#1D4ED8',
                  transform: 'scale(1.03)',
                  boxShadow: '0 6px 16px rgba(37, 99, 235, 0.35)',
                },
              }}
            >
              {progress === 100 ? 'Review' : 'Resume'}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(course.id, course.title);
              }}
              endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                height: 40,
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                px: 2.8,
                bgcolor: theme.btnBg,
                color: '#FFFFFF',
                boxShadow: `0 4px 12px ${theme.btnBg}40`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: theme.btnHover,
                  transform: 'scale(1.03)',
                  boxShadow: `0 6px 16px ${theme.btnBg}60`,
                },
              }}
            >
              Enroll Now
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}
