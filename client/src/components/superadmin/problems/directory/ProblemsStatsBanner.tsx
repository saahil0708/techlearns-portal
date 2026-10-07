import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';

interface ProblemsStatsBannerProps {
  totalCount: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  publishedCount: number;
  underReviewCount: number;
  draftCount: number;
  totalPlatformSubmissions: number;
  avgAcceptance: number;
}

export default function ProblemsStatsBanner({
  totalCount,
  easyCount,
  mediumCount,
  hardCount,
  publishedCount,
  underReviewCount,
  draftCount,
  totalPlatformSubmissions,
  avgAcceptance,
}: ProblemsStatsBannerProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
      <StatsCard
        title="Total Problem Bank"
        value={totalCount}
        icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
        variant="blue"
        shape="orbital"
        subtitle={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 700 }}>
              {easyCount} Easy
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>•</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#FBBF24', fontWeight: 700 }}>
              {mediumCount} Med
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>•</Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#F87171', fontWeight: 700 }}>
              {hardCount} Hard
            </Typography>
          </Box>
        }
      />

      <StatsCard
        title="Published & Active"
        value={
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
            <span>{publishedCount}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>
              / {totalCount}
            </span>
          </Box>
        }
        icon={<CheckCircleRoundedIcon sx={{ fontSize: 20 }} />}
        variant="black"
        shape="topography"
        subtitle={
          <Box sx={{ width: '100%', mt: 0.5 }}>
            <LinearProgress
              variant="determinate"
              value={Math.round((publishedCount / (totalCount || 1)) * 100)}
              sx={{
                height: 5,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                '& .MuiLinearProgress-bar': { bgcolor: '#34D399', borderRadius: 3 },
              }}
            />
          </Box>
        }
      />

      <StatsCard
        title="Evaluated Submissions"
        value={totalPlatformSubmissions.toLocaleString()}
        icon={<BoltRoundedIcon sx={{ fontSize: 20 }} />}
        variant="blue"
        shape="hex-grid"
        subtitle="Across all testbench runs"
      />

      <StatsCard
        title="Platform Avg Pass Rate"
        value={`${avgAcceptance}%`}
        icon={<EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />}
        variant="black"
        shape="aurora-waves"
        subtitle={`${underReviewCount} under review • ${draftCount} drafts`}
      />
    </Box>
  );
}
