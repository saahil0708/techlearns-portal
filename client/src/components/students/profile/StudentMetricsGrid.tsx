'use client';

import React from 'react';
import { Box, Typography, Card } from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { StudentProfileData } from '@/types/student-profile';

interface StudentMetricsGridProps {
  profile: StudentProfileData;
}

export default function StudentMetricsGrid({ profile }: StudentMetricsGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3.5 }}>
      {/* Card 1: Solved Problems */}
      <Card elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Solved Challenges
          </Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CodeRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          {profile.solvedTotal}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, fontSize: '0.74rem' }}>
          <Typography sx={{ color: '#16A34A', fontWeight: 700 }}>{profile.solvedEasy} Easy</Typography>
          <Typography sx={{ color: '#94A3B8' }}>•</Typography>
          <Typography sx={{ color: '#D97706', fontWeight: 700 }}>{profile.solvedMedium} Med</Typography>
          <Typography sx={{ color: '#94A3B8' }}>•</Typography>
          <Typography sx={{ color: '#DC2626', fontWeight: 700 }}>{profile.solvedHard} Hard</Typography>
        </Box>
      </Card>

      {/* Card 2: Contest Rating */}
      <Card elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Contest Rating
          </Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          {profile.contestRating}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 600 }}>
          Tier: <strong>{profile.ratingTier}</strong> (Top 0.5% Global)
        </Typography>
      </Card>

      {/* Card 3: Active Streak */}
      <Card elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Daily Streak
          </Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#FFF1F2', color: '#E11D48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalFireDepartmentRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          {profile.currentStreakDays} Days
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '0.78rem' }}>
          Longest: <strong>{profile.maxStreakDays} days</strong> unbroken
        </Typography>
      </Card>

      {/* Card 4: Submission Accuracy */}
      <Card elevation={0} sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            Accuracy Rate
          </Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#16A34A', mb: 1 }}>
          {profile.accuracyRate}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: '0.78rem' }}>
          Across <strong>{profile.totalSubmissions.toLocaleString()}</strong> total runs
        </Typography>
      </Card>
    </Box>
  );
}
