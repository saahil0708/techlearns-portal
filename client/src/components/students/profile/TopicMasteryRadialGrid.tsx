'use client';

import React from 'react';
import { Box, Typography, Card, Tooltip, Chip } from '@mui/material';
import { FaGraduationCap, FaArrowTrendUp } from 'react-icons/fa6';

export interface TopicSkillItem {
  id: string;
  name: string;
  percentage: number;
  solvedCount?: number;
  totalCount?: number;
  color?: string;
}

interface TopicMasteryRadialGridProps {
  skills?: TopicSkillItem[];
  cohortLabel?: string;
}

export default function TopicMasteryRadialGrid({
  skills,
  cohortLabel,
}: TopicMasteryRadialGridProps) {
  const size = 68;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const hasSkills = Array.isArray(skills) && skills.length > 0;

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
          borderColor: '#CBD5E1',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #DBEAFE',
            }}
          >
            <FaGraduationCap size={16} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.2 }}>
              Topic & Skill Mastery
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B', mt: 0.2 }}>
              Calculated from problem test pass rates & contest evaluations
            </Typography>
          </Box>
        </Box>

        {hasSkills && cohortLabel && (
          <Chip
            size="small"
            icon={<FaArrowTrendUp size={11} color="#059669" />}
            label={cohortLabel}
            sx={{
              bgcolor: '#ECFDF5',
              color: '#065F46',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: '6px',
              border: '1px solid #A7F3D0',
            }}
          />
        )}
      </Box>

      {/* Grid or Explicit Empty State */}
      {!hasSkills ? (
        <Box
          sx={{
            py: 4,
            px: 2,
            textAlign: 'center',
            bgcolor: '#F8FAFC',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
          }}
        >
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
            No topic mastery data available
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
            Solve topic-specific problems to generate your personalized skill metrics.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
            gap: { xs: 2.5, sm: 3 },
            pt: 1,
          }}
        >
          {skills.map((skill) => {
          const strokeDashoffset = circumference - (skill.percentage / 100) * circumference;

          return (
            <Tooltip
              key={skill.id}
              title={`${skill.name}: ${skill.percentage}% mastery (${skill.solvedCount ?? skill.percentage} completed)`}
              placement="top"
              arrow
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  p: 1.5,
                  borderRadius: '16px',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: '#F8FAFC',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  },
                }}
              >
                {/* SVG Radial Donut */}
                <Box sx={{ position: 'relative', width: size, height: size }}>
                  <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Track */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke="#F1F5F9"
                      strokeWidth={strokeWidth}
                      fill="transparent"
                    />
                    {/* Active Progress Ring */}
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      r={radius}
                      stroke={skill.color || '#2563EB'}
                      strokeWidth={strokeWidth}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      style={{
                        transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.25))',
                      }}
                    />
                  </svg>

                  {/* Percentage in center */}
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.86rem',
                        color: '#0F172A',
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {skill.percentage}%
                    </Typography>
                  </Box>
                </Box>

                {/* Topic Label Underneath */}
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#334155',
                    lineHeight: 1.25,
                    maxWidth: 100,
                  }}
                >
                  {skill.name}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
        </Box>
      )}
    </Card>
  );
}
