'use client';

import React from 'react';
import { Box, Typography, Chip, Button } from '@mui/material';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';

interface BlogsHeroHeaderProps {
  onExportCSV: () => void;
  onOpenWriteModal: () => void;
}

export default function BlogsHeroHeader({
  onExportCSV,
  onOpenWriteModal,
}: BlogsHeroHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '16px',
            bgcolor: '#EFF6FF',
            background: 'linear-gradient(135deg, #DBEAFE 0%, #EFF6FF 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563EB',
            border: '1px solid #BFDBFE',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)',
            flexShrink: 0,
          }}
        >
          <ArticleOutlinedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', mb: 0.3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.25rem', md: '1.45rem' }, letterSpacing: '-0.02em' }}>
              Tech Blogs & Engineering Articles
            </Typography>
            <Chip
              label="SkillOS Publications"
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 800,
                fontSize: '0.72rem',
                height: 22,
                border: '1px solid #DBEAFE',
              }}
            />
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#D97706 !important' }} />}
              label="Student Knowledge Hub"
              size="small"
              sx={{
                bgcolor: 'rgba(245, 158, 11, 0.08)',
                color: '#D97706',
                fontWeight: 700,
                fontSize: '0.72rem',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.86rem', color: '#64748B' }}>
            Explore deep architecture post-mortems, algorithm breakdowns, contest recaps, and interview experiences.
          </Typography>
        </Box>
      </Box>

      {/* Right Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadRoundedIcon sx={{ fontSize: 17 }} />}
          onClick={onExportCSV}
          sx={{
            bgcolor: '#FFFFFF',
            borderColor: '#CBD5E1',
            color: '#334155',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '10px',
            px: 2,
            py: 0.9,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          Export CSV
        </Button>
        <Button
          variant="contained"
          startIcon={<EditNoteRoundedIcon />}
          onClick={onOpenWriteModal}
          sx={{
            bgcolor: '#2563EB',
            borderRadius: '10px',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.88rem',
            px: 2.6,
            py: 0.9,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)',
            '&:hover': { bgcolor: '#1D4ED8', transform: 'translateY(-1px)' },
            transition: 'all 0.18s ease',
          }}
        >
          Write Story
        </Button>
      </Box>
    </Box>
  );
}
