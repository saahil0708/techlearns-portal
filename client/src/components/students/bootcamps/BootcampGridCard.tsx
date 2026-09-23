'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  LinearProgress,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

export interface StudentBootcamp {
  id: string;
  title: string;
  track: string;
  instructor: string;
  duration: string;
  enrolledStudents: number;
  status: 'Enrolled' | 'Available' | 'Completed';
  progressPct: number;
  sessionsCompleted: number;
  totalSessions: number;
  nextSessionDate: string;
  nextSessionTopic: string;
  rating?: number;
  badge?: string;
  syllabus: { week: string; topic: string; deliverables: string }[];
}

interface BootcampGridCardProps {
  bootcamp: StudentBootcamp;
  onInspect: (bootcamp: StudentBootcamp) => void;
  onEnroll: (bootcamp: StudentBootcamp) => void;
  onJoin: (bootcamp: StudentBootcamp) => void;
}

function getBootcampThemeConfig(track: string) {
  switch (track) {
    case 'Systems & Backend':
    case 'Quant & Low Latency':
      return {
        image: '/images/courses/system.jpg',
        fallbackBg: '#F3E8FF',
        accentColor: '#7C3AED',
        tagBg: 'rgba(124, 58, 237, 0.08)',
        tagText: '#7C3AED',
        btnBg: '#7C3AED',
        btnHover: '#6D28D9',
      };
    case 'Competitive Programming':
      return {
        image: '/images/courses/cp.jpg',
        fallbackBg: '#DCFCE7',
        accentColor: '#059669',
        tagBg: 'rgba(5, 150, 105, 0.08)',
        tagText: '#059669',
        btnBg: '#059669',
        btnHover: '#047857',
      };
    case 'AI / Deep Learning':
      return {
        image: '/images/courses/ai.jpg',
        fallbackBg: '#FEF3C7',
        accentColor: '#D97706',
        tagBg: 'rgba(217, 119, 6, 0.08)',
        tagText: '#D97706',
        btnBg: '#D97706',
        btnHover: '#B45309',
      };
    case 'DevOps & SRE':
      return {
        image: '/images/courses/dsa.jpg',
        fallbackBg: '#E0F2FE',
        accentColor: '#0284C7',
        tagBg: 'rgba(2, 132, 199, 0.08)',
        tagText: '#0284C7',
        btnBg: '#0284C7',
        btnHover: '#0369A1',
      };
    case 'Web & Full-Stack':
    default:
      return {
        image: '/images/courses/web.jpg',
        fallbackBg: '#EFF6FF',
        accentColor: '#2563EB',
        tagBg: 'rgba(37, 99, 235, 0.08)',
        tagText: '#2563EB',
        btnBg: '#2563EB',
        btnHover: '#1D4ED8',
      };
  }
}

export default function BootcampGridCard({
  bootcamp,
  onInspect,
  onEnroll,
  onJoin,
}: BootcampGridCardProps) {
  const theme = getBootcampThemeConfig(bootcamp.track);
  const isEnrolled = bootcamp.status === 'Enrolled';
  const isAvailable = bootcamp.status === 'Available';

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => onInspect(bootcamp)}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onInspect(bootcamp);
        }
      }}
      sx={{
        width: '100%',
        borderRadius: '18px',
        bgcolor: '#FFFFFF',
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
      {/* TOP 3D ARTWORK BANNER WITH SIGNATURE SLANT CLIPPED CUTOUT */}
      {/* ========================================================================= */}
      <Box
        sx={{
          height: 200,
          position: 'relative',
          overflow: 'hidden',
          bgcolor: theme.fallbackBg,
        }}
      >
        <Box
          component="img"
          src={theme.image}
          alt={bootcamp.title}
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

        {/* Live / Cohort Status Pill Badge Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            px: 1.4,
            py: 0.45,
            borderRadius: '9999px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              bgcolor: isEnrolled ? '#10B981' : '#F59E0B',
              boxShadow: isEnrolled ? '0 0 8px #10B981' : '0 0 8px #F59E0B',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.4 },
                '100%': { opacity: 1 },
              },
            }}
          />
          <Typography sx={{ color: '#FFFFFF', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.03em' }}>
            {isEnrolled ? 'ACTIVE COHORT' : 'UPCOMING SPRINT'}
          </Typography>
        </Box>

        {/* Sharp Slant Clipped Shape Transition at Top (Fills with Pure White) */}
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
            fill="#FFFFFF"
          />
        </svg>
      </Box>

      {/* ========================================================================= */}
      {/* CARD CONTENT BODY WITH CLEAN MINIMAL INFO */}
      {/* ========================================================================= */}
      <Box
        sx={{
          px: 2.5,
          pt: 1.4,
          pb: 1.4,
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Track Badge & Enrolled Count */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={bootcamp.track}
            size="small"
            sx={{
              bgcolor: theme.tagBg,
              color: theme.tagText,
              fontWeight: 800,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '6px',
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PeopleAltRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>
              {bootcamp.enrolledStudents} enrolled
            </Typography>
          </Box>
        </Box>

        {/* Bootcamp Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            fontSize: '1.08rem',
            lineHeight: 1.34,
            color: '#0F172A',
            mb: 0.8,
            letterSpacing: '-0.015em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: '2.7em',
          }}
        >
          {bootcamp.title}
        </Typography>

        {/* Instructor */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.6 }}>
          <SchoolRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
          <Typography
            sx={{
              fontSize: '0.82rem',
              fontWeight: 700,
              color: '#475569',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {bootcamp.instructor}
          </Typography>
        </Box>

        {/* Progress or Key Milestones Specs Row */}
        {isEnrolled ? (
          <Box sx={{ mt: 'auto', pt: 0.8 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>
                  Sprint Progress
                </Typography>
                <Chip
                  label={`${bootcamp.sessionsCompleted}/${bootcamp.totalSessions} Sessions`}
                  size="small"
                  sx={{
                    height: 19,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    bgcolor: '#F1F5F9',
                    color: '#334155',
                    borderRadius: '5px',
                    px: 0.2,
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 0.9,
                  py: 0.2,
                  borderRadius: '6px',
                  bgcolor: `${theme.accentColor}12`,
                  color: theme.accentColor,
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '-0.01em' }}>
                  {bootcamp.progressPct}%
                </Typography>
              </Box>
            </Box>

            {/* 4-Phase Segmented Capsule Track */}
            <Box sx={{ display: 'flex', gap: '4px', width: '100%', height: 6 }}>
              {[0, 25, 50, 75].map((threshold, idx) => {
                const fillPct = Math.min(Math.max((bootcamp.progressPct - threshold) * 4, 0), 100);
                return (
                  <Box
                    key={idx}
                    sx={{
                      flex: 1,
                      height: '100%',
                      bgcolor: '#F1F5F9',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${fillPct}%`,
                        bgcolor: theme.accentColor,
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 'auto',
              pt: 1,
              borderTop: '1px solid #F8FAFC',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <LayersRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B' }}>
                {bootcamp.totalSessions} Masterclasses
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.4,
                bgcolor: 'rgba(245, 158, 11, 0.08)',
                px: 1,
                py: 0.3,
                borderRadius: '6px',
              }}
            >
              <BoltRoundedIcon sx={{ fontSize: 14, color: '#D97706' }} />
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#D97706' }}>
                4 Capstones
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* ========================================================================= */}
      {/* CARD FOOTER WITH SIGNATURE CLIPPED NOTCH & PILL BUTTON */}
      {/* ========================================================================= */}
      <Box
        sx={{
          position: 'relative',
          mt: 'auto',
          height: 48,
          bgcolor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pl: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Bottom-Right Clipped Notch Backdrop (Pocket for Floating Pill Button) */}
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
            fill="#F8FAFC"
          />
        </svg>

        {/* Left Side Duration */}
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
            {bootcamp.duration}
          </Typography>
        </Box>

        {/* Right Side: True Pill Action Button Shifted Right at Base */}
        <Box
          sx={{
            position: 'absolute',
            right: -0.5,
            bottom: 0,
            zIndex: 2,
          }}
        >
          {isAvailable ? (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onEnroll(bootcamp);
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
          ) : (
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                if (bootcamp.status === 'Completed') {
                  onInspect(bootcamp);
                } else {
                  onJoin(bootcamp);
                }
              }}
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 40,
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                px: 2.8,
                bgcolor: '#0F172A',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#1E293B',
                  transform: 'scale(1.03)',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.35)',
                },
              }}
            >
              {bootcamp.status === 'Completed' ? 'View Details' : 'Join Class'}
            </Button>
          )}
        </Box>
      </Box>
    </Card>
  );
}
