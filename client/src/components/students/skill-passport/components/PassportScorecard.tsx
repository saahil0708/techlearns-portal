'use client';

import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

export default function PassportScorecard() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        gap: 2.5,
      }}
    >
      {/* Metric 1: Algorithmic Mastery */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 2.8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Algorithmic Problems
            </Typography>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#FAF5FF', color: '#0B1F3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CodeRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            142 Solved
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: '#16A34A', fontWeight: 700, mt: 0.4 }}>
            94.2% First Attempt Accuracy
          </Typography>
        </Box>

        {/* Custom Visual: Segmented Difficulty Ratio Meter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', width: '100%', height: 8, borderRadius: '9999px', overflow: 'hidden', bgcolor: '#F1F5F9', gap: '2px' }}>
            <Box sx={{ width: '33.8%', bgcolor: '#10B981', borderRadius: '4px 0 0 4px' }} title="Easy: 48 (33.8%)" />
            <Box sx={{ width: '52.1%', bgcolor: '#0B1F3A' }} title="Medium: 74 (52.1%)" />
            <Box sx={{ width: '14.1%', bgcolor: '#EF4444', borderRadius: '0 4px 4px 0' }} title="Hard: 20 (14.1%)" />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#166534' }}>48 Easy</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#0B1F3A' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#0F264F' }}>74 Med</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#EF4444' }} />
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 750, color: '#991B1B' }}>20 Hard</Typography>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Metric 2: Contest Standing */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 2.8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Contest Standing
            </Typography>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            1,842 Rating
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: '#D97706', fontWeight: 700, mt: 0.4 }}>
            Division 1 · Top 2.4% Global
          </Typography>
        </Box>

        {/* SVG Rating Sparkline Graph */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          <Box sx={{ width: '100%', height: 38, position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 200 40" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="contestSparklineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 Q 40 28, 70 24 T 140 16 T 200 4 L 200 40 L 0 40 Z"
                fill="url(#contestSparklineGrad)"
              />
              <path
                d="M 0 35 Q 40 28, 70 24 T 140 16 T 200 4"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="200" cy="4" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2" />
            </svg>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
              4 Tournaments
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#B45309', fontWeight: 800 }}>
              Peak: 1,842 (+188 Δ)
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Metric 3: Academic Accreditations */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 2.8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Accredited Curriculum
            </Typography>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            3 Certifications
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: '#059669', fontWeight: 700, mt: 0.4 }}>
            155 Verified Lab Hours · 96.4% GPA
          </Typography>
        </Box>

        {/* 3-Track Completion Milestone Strip */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
            <Box sx={{ height: 6, borderRadius: '9999px', bgcolor: '#10B981' }} title="Track 1: Algorithms (100%)" />
            <Box sx={{ height: 6, borderRadius: '9999px', bgcolor: '#10B981' }} title="Track 2: Data Structures (100%)" />
            <Box sx={{ height: 6, borderRadius: '9999px', bgcolor: '#10B981' }} title="Track 3: Distributed Systems (100%)" />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <VerifiedRoundedIcon sx={{ fontSize: 13, color: '#10B981' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#059669' }}>
                3/3 Completed
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#047857' }}>
              96.4% Distinction
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Metric 4: Integrity & Originality */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 2.8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Integrity & Originality
            </Typography>
            <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Typography sx={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
            100% Original
          </Typography>
          <Typography sx={{ fontSize: '0.76rem', color: '#7C3AED', fontWeight: 700, mt: 0.4 }}>
            AST Static Analysis Verified (0 Strikes)
          </Typography>
        </Box>

        {/* Security Status Pulse Indicator */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: '6px 10px',
              borderRadius: '8px',
              bgcolor: '#FAF5FF',
              border: '1px solid #F3E8FF',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#7C3AED' }} />
              <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#6B21A8' }}>
                AST Parser: 0 Flags
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.66rem', fontWeight: 800, color: '#16A34A', bgcolor: '#ECFDF5', px: 0.8, py: 0.2, borderRadius: '4px' }}>
              SECURE
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.2 }}>
            <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700 }}>
              Proctored Labs
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: '#7C3AED', fontWeight: 800 }}>
              Clean Sandbox
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
