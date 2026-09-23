'use client';

import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import { useToast } from '@/context/ToastContext';

export default function InterviewPrepClient() {
  const toast = useToast();

  const handleNotifyMe = () => {
    toast.info('Interview Prep Hub is coming soon! Stay tuned for the upcoming launch.', 'Feature Preview');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        px: 2,
        pb: 8,
      }}
    >
      <Box
        sx={{
          maxWidth: 640,
          p: { xs: 3.5, sm: 5 },
          bgcolor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2.5,
        }}
      >
        {/* Top Badge */}
        <Chip
          icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#2563EB !important' }} />}
          label="Under Active Development"
          size="small"
          sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.74rem', height: 26, px: 1 }}
        />

        {/* Big Icon Cluster */}
        <Box sx={{ display: 'flex', gap: 1.5, my: 1 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: '#F3E8FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HubRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '14px',
              bgcolor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MicRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
        </Box>

        {/* Heading */}
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#0F172A',
              fontSize: { xs: '1.6rem', sm: '2rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
            }}
          >
            Interview Prep Hub
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1.05rem',
              color: '#2563EB',
              mt: 0.5,
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}
          >
            Coming Soon
          </Typography>
        </Box>

        {/* Description */}
        <Typography sx={{ fontSize: '0.86rem', color: '#64748B', lineHeight: 1.6, maxWidth: 480 }}>
          We are building an AI-powered interactive mock interview cockpit with real-time speech probing, dynamic coding loops, and company-specific rubric evaluations.
        </Typography>

        {/* Feature Highlights Pills */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', pt: 0.5 }}>
          <Chip label="Company Round Matrix" size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.74rem', fontWeight: 600 }} />
          <Chip label="Live AI Speech Probing" size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.74rem', fontWeight: 600 }} />
          <Chip label="Real-Time Scoring Rubrics" size="small" sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.74rem', fontWeight: 600 }} />
        </Box>

        {/* Notify Me CTA */}
        <Button
          variant="contained"
          startIcon={<NotificationsActiveOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={handleNotifyMe}
          sx={{
            mt: 1,
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
            fontWeight: 800,
            fontSize: '0.82rem',
            textTransform: 'none',
            px: 3,
            py: 1,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
          }}
        >
          Notify Me When Live
        </Button>
      </Box>
    </Box>
  );
}
