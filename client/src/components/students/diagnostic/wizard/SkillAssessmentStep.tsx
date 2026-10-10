'use client';

import React from 'react';
import { Box, Typography, Card, Chip, Button, Slider } from '@mui/material';
import { CareerTrack } from './types';

interface SkillAssessmentStepProps {
  activeTrackObj: CareerTrack;
  skillRatings: Record<string, number>;
  onSkillRatingChange: (key: string, value: number) => void;
  onChangeTrack: () => void;
}

const SKILL_CONFIG = [
  { key: 'frontend', label: 'Frontend & UI Engineering', desc: 'React, Next.js, HTML5/CSS3, TypeScript, State Management' },
  { key: 'backend', label: 'Backend APIs & Architecture', desc: 'Node.js, NestJS/Express, RESTful endpoints, Auth & Security' },
  { key: 'dsa', label: 'Data Structures & Algorithms', desc: 'Arrays, Trees, Graphs, Dynamic Programming, Time Complexity' },
  { key: 'database', label: 'Database Design & SQL', desc: 'PostgreSQL, Prisma ORM, Query Optimization, Indexing' },
  { key: 'devops', label: 'DevOps & Cloud Infrastructure', desc: 'Docker, CI/CD pipelines, Kubernetes, Cloud Deployments' },
  { key: 'system_design', label: 'System Design & Scalability', desc: 'Caching, Microservices, Message Queues (Redis/BullMQ)' },
];

export function SkillAssessmentStep({
  activeTrackObj,
  skillRatings,
  onSkillRatingChange,
  onChangeTrack,
}: SkillAssessmentStepProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          Rate Your Confidence in Core Domains
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Self-evaluate your comfort level from Beginner (1) to Expert (5). This adjusts diagnostic starting levels and course prerequisites.
        </Typography>
      </Box>

      {/* Active Track Highlight Banner */}
      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: '12px',
          bgcolor: activeTrackObj.bgLight,
          border: `1px solid ${activeTrackObj.borderLight}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#FFFFFF',
              color: activeTrackObj.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${activeTrackObj.borderLight}`,
            }}
          >
            {activeTrackObj.icon}
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
              Track: {activeTrackObj.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Standard industry benchmark index: {activeTrackObj.benchmarkScore}/100 pts
            </Typography>
          </Box>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={onChangeTrack}
          sx={{
            borderColor: activeTrackObj.color,
            color: activeTrackObj.color,
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'none',
            borderRadius: '8px',
            bgcolor: '#FFFFFF',
            '&:hover': { bgcolor: '#F8FAFC', borderColor: activeTrackObj.color },
          }}
        >
          Change Track
        </Button>
      </Box>

      {/* Rating Sliders */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2.5 }}>
        {SKILL_CONFIG.map((skill) => {
          const val = skillRatings[skill.key] || 3;
          const labels = ['', 'Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];
          return (
            <Card
              key={skill.key}
              sx={{
                p: 2.5,
                borderRadius: '12px',
                border: '1.5px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {skill.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                    {skill.desc}
                  </Typography>
                </Box>
                <Chip
                  label={`${labels[val]} (${val}/5)`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    bgcolor: val >= 4 ? '#ECFDF5' : val === 3 ? '#FAF5FF' : '#FFFBEB',
                    color: val >= 4 ? '#059669' : val === 3 ? '#0B1F3A' : '#D97706',
                    border: '1px solid',
                    borderColor: val >= 4 ? '#A7F3D0' : val === 3 ? '#D8B4FE' : '#FDE68A',
                  }}
                />
              </Box>

              <Slider
                value={val}
                min={1}
                max={5}
                step={1}
                marks={[
                  { value: 1, label: '1' },
                  { value: 2, label: '2' },
                  { value: 3, label: '3' },
                  { value: 4, label: '4' },
                  { value: 5, label: '5' },
                ]}
                onChange={(_, newVal) => onSkillRatingChange(skill.key, newVal as number)}
                sx={{
                  color: '#0B1F3A',
                  height: 6,
                  mt: 1,
                  '& .MuiSlider-thumb': {
                    bgcolor: '#FFFFFF',
                    border: '3px solid #0B1F3A',
                    boxShadow: '0 2px 6px rgba(91, 45, 144, 0.3)',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(91, 45, 144, 0.16)',
                    },
                  },
                  '& .MuiSlider-track': {
                    bgcolor: '#0B1F3A',
                  },
                  '& .MuiSlider-rail': {
                    bgcolor: '#E2E8F0',
                  },
                  '& .MuiSlider-markLabel': {
                    color: '#94A3B8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  },
                }}
              />
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
