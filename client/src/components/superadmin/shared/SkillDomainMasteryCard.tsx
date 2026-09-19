'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Tooltip,
  Button,
} from '@mui/material';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import { useRouter } from 'next/navigation';

export interface SkillDomainMetric {
  id: string;
  name: string;
  shortLabel: string;
  percentage: number;
  color: string;
  gradient: string;
  solvedCount: string;
  activeLearners: string;
  trend: string;
  status: 'Mastered' | 'Advanced' | 'Competent' | 'Needs Focus';
}

const DOMAIN_DATA: Record<string, SkillDomainMetric[]> = {
  ALL: [
    {
      id: 'd-1',
      name: 'Algorithms & Data Structures',
      shortLabel: 'Algorithms structures',
      percentage: 92,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
      solvedCount: '148,200 solves',
      activeLearners: '12,450 students',
      trend: '+5.4% this month',
      status: 'Mastered',
    },
    {
      id: 'd-2',
      name: 'Object-Oriented Programming',
      shortLabel: 'Object program.',
      percentage: 83,
      color: '#4F46E5',
      gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)',
      solvedCount: '112,800 solves',
      activeLearners: '10,120 students',
      trend: '+3.1% this month',
      status: 'Advanced',
    },
    {
      id: 'd-3',
      name: 'Database & SQL Engineering',
      shortLabel: 'Database program.',
      percentage: 78,
      color: '#0891B2',
      gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)',
      solvedCount: '94,600 solves',
      activeLearners: '8,940 students',
      trend: '+6.8% this month',
      status: 'Competent',
    },
    {
      id: 'd-4',
      name: 'Full-Stack Web Development',
      shortLabel: 'Web develop.',
      percentage: 97,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669, #10B981)',
      solvedCount: '186,400 solves',
      activeLearners: '14,200 students',
      trend: '+4.2% this month',
      status: 'Mastered',
    },
    {
      id: 'd-5',
      name: 'Mobile & Cloud Systems',
      shortLabel: 'Mobile application',
      percentage: 96,
      color: '#7C3AED',
      gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
      solvedCount: '132,100 solves',
      activeLearners: '9,800 students',
      trend: '+7.1% this month',
      status: 'Mastered',
    },
    {
      id: 'd-6',
      name: 'Machine Learning & AI',
      shortLabel: 'Machine learning',
      percentage: 89,
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
      solvedCount: '88,900 solves',
      activeLearners: '7,650 students',
      trend: '+11.5% this month',
      status: 'Advanced',
    },
  ],
  TIER1: [
    {
      id: 'd-1',
      name: 'Algorithms & Data Structures',
      shortLabel: 'Algorithms structures',
      percentage: 96,
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB, #3B82F6)',
      solvedCount: '68,400 solves',
      activeLearners: '4,100 students',
      trend: '+6.2% this month',
      status: 'Mastered',
    },
    {
      id: 'd-2',
      name: 'Object-Oriented Programming',
      shortLabel: 'Object program.',
      percentage: 89,
      color: '#4F46E5',
      gradient: 'linear-gradient(135deg, #4F46E5, #6366F1)',
      solvedCount: '52,100 solves',
      activeLearners: '3,800 students',
      trend: '+4.0% this month',
      status: 'Advanced',
    },
    {
      id: 'd-3',
      name: 'Database & SQL Engineering',
      shortLabel: 'Database program.',
      percentage: 84,
      color: '#0891B2',
      gradient: 'linear-gradient(135deg, #0891B2, #06B6D4)',
      solvedCount: '41,000 solves',
      activeLearners: '3,200 students',
      trend: '+8.1% this month',
      status: 'Advanced',
    },
    {
      id: 'd-4',
      name: 'Full-Stack Web Development',
      shortLabel: 'Web develop.',
      percentage: 98,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669, #10B981)',
      solvedCount: '82,000 solves',
      activeLearners: '4,500 students',
      trend: '+3.5% this month',
      status: 'Mastered',
    },
    {
      id: 'd-5',
      name: 'Mobile & Cloud Systems',
      shortLabel: 'Mobile application',
      percentage: 97,
      color: '#7C3AED',
      gradient: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
      solvedCount: '58,300 solves',
      activeLearners: '3,400 students',
      trend: '+5.8% this month',
      status: 'Mastered',
    },
    {
      id: 'd-6',
      name: 'Machine Learning & AI',
      shortLabel: 'Machine learning',
      percentage: 93,
      color: '#D97706',
      gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
      solvedCount: '44,200 solves',
      activeLearners: '2,900 students',
      trend: '+14.2% this month',
      status: 'Mastered',
    },
  ],
};

interface CircularProgressRingProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function CircularProgressRing({
  percentage,
  color,
  size = 84,
  strokeWidth = 9,
}: CircularProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          overflow: 'visible',
        }}
      >
        {/* Background Track Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#EAEFF5"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Foreground Progress Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>

      {/* Percentage Center Text */}
      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '1.05rem',
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
}

interface SkillDomainMasteryCardProps {
  primaryBlue?: string;
}

export default function SkillDomainMasteryCard({
  primaryBlue = '#2563EB',
}: SkillDomainMasteryCardProps) {
  const router = useRouter();
  const [cohortTab, setCohortTab] = useState<'ALL' | 'TIER1'>('ALL');
  const metrics = DOMAIN_DATA[cohortTab] || DOMAIN_DATA.ALL;

  // Calculate Overall Platform Average
  const averagePercentage = Math.round(
    metrics.reduce((acc, curr) => acc + curr.percentage, 0) / metrics.length
  );

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        p: { xs: 2.5, sm: 3 },
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* 1. Header Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: primaryBlue,
            }}
          >
            <PsychologyRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                sx={{
                  fontSize: '1.05rem',
                  fontWeight: 900,
                  color: '#0F172A',
                  lineHeight: 1.2,
                }}
              >
                Global Skill Domain Proficiency
              </Typography>
              <Chip
                icon={<CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
                label={`${averagePercentage}% Platform Benchmark`}
                size="small"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 22,
                  borderRadius: '6px',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.25 }}>
              Aggregated technical competency across core engineering curriculums
            </Typography>
          </Box>
        </Box>

        {/* Cohort Toggle */}
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Chip
            label="All Colleges"
            clickable
            size="small"
            onClick={() => setCohortTab('ALL')}
            sx={{
              fontWeight: cohortTab === 'ALL' ? 800 : 600,
              fontSize: '0.76rem',
              height: 28,
              borderRadius: '8px',
              bgcolor: cohortTab === 'ALL' ? '#0F172A' : '#F1F5F9',
              color: cohortTab === 'ALL' ? '#FFFFFF' : '#475569',
            }}
          />
          <Chip
            label="Tier 1 Institutions"
            clickable
            size="small"
            onClick={() => setCohortTab('TIER1')}
            sx={{
              fontWeight: cohortTab === 'TIER1' ? 800 : 600,
              fontSize: '0.76rem',
              height: 28,
              borderRadius: '8px',
              bgcolor: cohortTab === 'TIER1' ? '#0F172A' : '#F1F5F9',
              color: cohortTab === 'TIER1' ? '#FFFFFF' : '#475569',
            }}
          />
        </Box>
      </Box>

      {/* 2. Circular Radial Progress Graphs Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(6, 1fr)',
          },
          gap: { xs: 2, sm: 2.5 },
          py: 1,
        }}
      >
        {metrics.map((item) => (
          <Tooltip
            key={item.id}
            arrow
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#FFFFFF' }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#CBD5E1', mt: 0.25 }}>
                  {item.solvedCount} • {item.activeLearners}
                </Typography>
                <Typography sx={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 700, mt: 0.25 }}>
                  {item.trend}
                </Typography>
              </Box>
            }
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 1.5,
                borderRadius: '16px',
                bgcolor: '#FAFAFC',
                border: '1px solid #F1F5F9',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  bgcolor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              {/* Radial Donut Progress Ring */}
              <CircularProgressRing percentage={item.percentage} color={item.color} />

              {/* Title Underneath */}
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  color: '#0F172A',
                  mt: 1.5,
                  mb: 0.5,
                  lineHeight: 1.25,
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.shortLabel}
              </Typography>

              {/* Sub-pill status indicator */}
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: '6px',
                  bgcolor: 'rgba(255, 255, 255, 0.8)',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: item.color,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    color: '#64748B',
                    letterSpacing: '0.02em',
                  }}
                >
                  {item.status}
                </Typography>
              </Box>
            </Box>
          </Tooltip>
        ))}
      </Box>

      {/* 3. Bottom Summary Strip */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          p: 1.75,
          px: 2.25,
          borderRadius: '16px',
          bgcolor: '#F8FAFC',
          border: '1px solid #F1F5F9',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <TrendingUpRoundedIcon sx={{ fontSize: 16, color: '#059669' }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>
              Highest Track: <strong style={{ color: '#0F172A' }}>Full-Stack Web (97%)</strong>
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <InfoOutlinedIcon sx={{ fontSize: 16, color: '#D97706' }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#475569' }}>
              Growth Opportunity: <strong style={{ color: '#0F172A' }}>Database & SQL (78%)</strong>
            </Typography>
          </Box>
        </Box>

        <Button
          size="small"
          endIcon={<FluidArrowRight size={15} />}
          onClick={() => router.push('/superadmin/analytics')}
          sx={{
            textTransform: 'none',
            fontWeight: 800,
            fontSize: '0.78rem',
            color: primaryBlue,
            p: 0,
            minWidth: 0,
            '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
          }}
        >
          View Full Analytics
        </Button>
      </Box>
    </Card>
  );
}
