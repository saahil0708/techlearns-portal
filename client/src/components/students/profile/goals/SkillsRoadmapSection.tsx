'use client';

import React from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
} from '@mui/material';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { UserGoalData, getDomainColor, DOMAIN_ICONS, CircularSkillGauge } from './types';

interface SkillsRoadmapSectionProps {
  goalData: UserGoalData;
  onOpenCustomizer: (initialTab?: number) => void;
}

export default function SkillsRoadmapSection({
  goalData,
  onOpenCustomizer,
}: SkillsRoadmapSectionProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1.08fr' },
        gap: 2.5,
        alignItems: 'start',
      }}
    >
      {/* LEFT: PRESENT SKILL SETS */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3 },
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          height: 'fit-content',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '8px',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PsychologyRoundedIcon sx={{ fontSize: 17 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.98rem' }}>
                  Present Skill Sets & Baseline
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                  Calibrated capability baseline across engineering domains.
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                onClick={() => onOpenCustomizer(2)}
                startIcon={<TuneRoundedIcon sx={{ fontSize: 13 }} />}
                sx={{
                  color: '#2563EB',
                  bgcolor: '#EFF6FF',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  borderRadius: '8px',
                  textTransform: 'none',
                  px: 1.2,
                  py: 0.3,
                  '&:hover': { bgcolor: '#DBEAFE' },
                }}
              >
                Calibrate
              </Button>
              <Chip
                label={`${goalData.skills?.length || 6} Domains`}
                size="small"
                sx={{ bgcolor: '#F8FAFC', color: '#475569', fontWeight: 700, fontSize: '0.68rem', height: 22, border: '1px solid #E2E8F0' }}
              />
            </Box>
          </Box>

          {/* 2-Column Skill Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 1.5,
            }}
          >
            {goalData.skills.map((skill) => {
              const domainStyle = getDomainColor(skill.level);
              const icon = DOMAIN_ICONS[skill.id] || <CodeRoundedIcon sx={{ fontSize: 15 }} />;

              return (
                <Box
                  key={skill.id}
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      bgcolor: '#FFFFFF',
                      borderColor: '#CBD5E1',
                      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.04)',
                    },
                  }}
                >
                  {/* Left Info */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.4 }}>
                      <Box sx={{ color: domainStyle.stroke, display: 'flex', alignItems: 'center' }}>
                        {icon}
                      </Box>
                      <Chip
                        label={skill.label}
                        size="small"
                        sx={{
                          bgcolor: domainStyle.bg,
                          color: domainStyle.text,
                          fontWeight: 800,
                          fontSize: '0.64rem',
                          height: 18,
                          border: `1px solid ${domainStyle.border}`,
                        }}
                      />
                    </Box>

                    <Typography
                      sx={{
                        color: '#0F172A',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {skill.name}
                    </Typography>
                  </Box>

                  {/* Right Circular Gauge */}
                  <CircularSkillGauge percentage={skill.level} color={domainStyle.stroke} size={48} strokeWidth={4.5} />
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#64748B', fontSize: '0.72rem' }}>
            Calibrated via self-rating & diagnostic quiz
          </Typography>
          <Chip
            label="Calibration Ready"
            size="small"
            sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
          />
        </Box>
      </Card>

      {/* RIGHT: SUGGESTED ACTION PLAN & ROADMAP */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3 },
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          height: 'fit-content',
        }}
      >
        <Box>
          {/* Roadmap Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrackChangesRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>
                  Career Milestone Roadmap
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                  Target pathway: {goalData.targetTrack}
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<HubRoundedIcon sx={{ fontSize: 13, color: '#2563EB !important' }} />}
              label="3 Step Path"
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.68rem', height: 22, border: '1px solid #BFDBFE' }}
            />
          </Box>

          {/* VISUAL ROADMAP TIMELINE SPINE & NODES */}
          <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative', mt: 1 }}>
            
            {/* STEP 1: FOUNDATION TRACK */}
            <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {/* Node & Connecting Line */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#2563EB',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    boxShadow: '0 0 0 4px #DBEAFE',
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                >
                  1
                </Box>
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    bgcolor: '#2563EB',
                    my: 0.5,
                  }}
                />
              </Box>

              {/* Step Card Content */}
              <Box
                sx={{
                  flex: 1,
                  mb: 2,
                  p: 1.8,
                  borderRadius: '12px',
                  bgcolor: '#EFF6FF',
                  border: '1.5px solid #BFDBFE',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <Chip
                        label="Current Phase ⚡"
                        size="small"
                        sx={{ bgcolor: '#2563EB', color: '#FFFFFF', fontWeight: 800, fontSize: '0.64rem', height: 20 }}
                      />
                      <Typography sx={{ color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 700 }}>
                        12 Modules
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.86rem', mb: 0.3 }}>
                      Mastery Curriculum: {goalData.targetTrack}
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: '0.74rem', lineHeight: 1.35 }}>
                      SSR architectures, NestJS APIs, Postgres indexing & security.
                    </Typography>
                  </Box>

                  <CircularSkillGauge percentage={35} color="#2563EB" size={50} strokeWidth={4.5} />
                </Box>

                <Link href="/courses" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    startIcon={<MenuBookRoundedIcon sx={{ fontSize: 15 }} />}
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      textTransform: 'none',
                      borderRadius: '6px',
                      py: 0.6,
                      boxShadow: 'none',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Continue Curriculum
                  </Button>
                </Link>
              </Box>
            </Box>

            {/* STEP 2: SKILL DRILLS */}
            <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#059669',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    boxShadow: '0 0 0 4px #D1FAE5',
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                >
                  2
                </Box>
                <Box
                  sx={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    bgcolor: '#CBD5E1',
                    borderStyle: 'dashed',
                    my: 0.5,
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  mb: 2,
                  p: 1.8,
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.18s ease',
                  '&:hover': { borderColor: '#059669', bgcolor: '#FFFFFF' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <Chip
                        label="Up Next"
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#047857', fontWeight: 700, fontSize: '0.64rem', height: 20, border: '1px solid #A7F3D0' }}
                      />
                      <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700 }}>
                        4 Drills / wk
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.86rem', mb: 0.3 }}>
                      Targeted Problem Solving Drills
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.74rem', lineHeight: 1.35 }}>
                      Concurrency, distributed cache invalidation, and tree algorithms.
                    </Typography>
                  </Box>

                  <CircularSkillGauge percentage={60} color="#059669" size={50} strokeWidth={4.5} />
                </Box>

                <Link href="/practice" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<TerminalRoundedIcon sx={{ fontSize: 15 }} />}
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      color: '#059669',
                      borderColor: '#059669',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      textTransform: 'none',
                      borderRadius: '6px',
                      py: 0.6,
                      '&:hover': { bgcolor: '#ECFDF5', borderColor: '#047857' },
                    }}
                  >
                    Launch Practice Engine
                  </Button>
                </Link>
              </Box>
            </Box>

            {/* STEP 3: CAPSTONE ARTIFACT */}
            <Box sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    bgcolor: '#D97706',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '0.82rem',
                    boxShadow: '0 0 0 4px #FEF3C7',
                    flexShrink: 0,
                    zIndex: 2,
                  }}
                >
                  3
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 1.8,
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.18s ease',
                  '&:hover': { borderColor: '#D97706', bgcolor: '#FFFFFF' },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, mb: 1.2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.5 }}>
                      <Chip
                        label="Career Milestone 🏆"
                        size="small"
                        sx={{ bgcolor: '#FFFBEB', color: '#B45309', fontWeight: 700, fontSize: '0.64rem', height: 20, border: '1px solid #FDE68A' }}
                      />
                      <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700 }}>
                        Recruiter Ready
                      </Typography>
                    </Box>
                    <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.86rem', mb: 0.3 }}>
                      Portfolio Project Milestone
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.74rem', lineHeight: 1.35 }}>
                      Build industry briefs with rubric peer reviews to certify your Skill Passport.
                    </Typography>
                  </Box>

                  <CircularSkillGauge percentage={20} color="#D97706" size={50} strokeWidth={4.5} />
                </Box>

                <Link href="/students/projects" style={{ textDecoration: 'none' }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    startIcon={<LaptopMacRoundedIcon sx={{ fontSize: 15 }} />}
                    endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 13 }} />}
                    sx={{
                      color: '#D97706',
                      borderColor: '#D97706',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      textTransform: 'none',
                      borderRadius: '6px',
                      py: 0.6,
                      '&:hover': { bgcolor: '#FFFBEB', borderColor: '#B45309' },
                    }}
                  >
                    Project Workspace
                  </Button>
                </Link>
              </Box>
            </Box>

          </Box>
        </Box>

        {/* Footer Status */}
        <Box sx={{ pt: 2, mt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ color: '#64748B', fontSize: '0.72rem' }}>
            Linear milestone completion track
          </Typography>
          <Chip
            label="Track Active"
            size="small"
            sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 800, fontSize: '0.66rem', height: 20 }}
          />
        </Box>
      </Card>
    </Box>
  );
}
