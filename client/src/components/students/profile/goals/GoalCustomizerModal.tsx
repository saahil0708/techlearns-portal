'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogContent,
  Slider,
  TextField,
  MenuItem,
  Select,
  FormControl,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { CAREER_TRACKS } from '@/components/students/diagnostic/IdentityDiagnosticWizard';
import { UserGoalData, DEFAULT_GOAL } from './types';

interface GoalCustomizerModalProps {
  open: boolean;
  onClose: () => void;
  formData: UserGoalData;
  setFormData: React.Dispatch<React.SetStateAction<UserGoalData>>;
  onSave: () => void;
  onOpenWizard: () => void;
  initialTab?: number;
}

export function GoalCustomizerModal({
  open,
  onClose,
  formData,
  setFormData,
  onSave,
  onOpenWizard,
  initialTab = 0,
}: GoalCustomizerModalProps) {
  const [formTab, setFormTab] = useState(initialTab);

  React.useEffect(() => {
    if (open) {
      setFormTab(initialTab);
    }
  }, [open, initialTab]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.18)',
            p: 0,
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Modal Header */}
      <Box
        sx={{
          p: 3,
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TuneRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', fontSize: '1.15rem' }}>
              Customize Target & Learning Goals
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Fine-tune your career target, speed targets, and skill capability baseline.
            </Typography>
          </Box>
        </Box>

        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      {/* Modal Tabs */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0', px: 3, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={formTab}
          onChange={(_, val) => setFormTab(val)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              minHeight: 44,
              py: 1,
              color: '#64748B',
              '&.Mui-selected': { color: '#2563EB' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3 },
          }}
        >
          <Tab label="1. Career Track & Horizon" />
          <Tab label="2. Speed & Daily Cadence" />
          <Tab label="3. Skill Sets Baseline" />
        </Tabs>
      </Box>

      {/* Modal Content */}
      <DialogContent sx={{ p: 3, maxHeight: '65vh', overflowY: 'auto' }}>
        {/* TAB 1: CAREER TRACK */}
        {formTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', mb: 1.2 }}>
                Target Engineering Role / Track
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                }}
              >
                {CAREER_TRACKS.map((track) => {
                  const isSelected = formData.targetTrackId ? formData.targetTrackId === track.id : formData.targetTrack === track.title;
                  return (
                    <Box
                      key={track.id}
                      onClick={() => setFormData((prev: UserGoalData) => ({ ...prev, targetTrack: track.title, targetTrackId: track.id }))}
                      sx={{
                        p: 1.8,
                        borderRadius: '12px',
                        border: '2px solid',
                        borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                        bgcolor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: '#93C5FD' },
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: isSelected ? '#1D4ED8' : '#0F172A', mb: 0.3 }}>
                        {track.title}
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                        {track.subtitle}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              {/* Timeline */}
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', mb: 1 }}>
                  Target Completion Horizon
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.timeline}
                    onChange={(e) => setFormData((prev: UserGoalData) => ({ ...prev, timeline: e.target.value }))}
                    sx={{ borderRadius: '8px', fontSize: '0.86rem', fontWeight: 700 }}
                  >
                    <MenuItem value="3 months (Intensive)">3 months (Intensive Sprint)</MenuItem>
                    <MenuItem value="6 months (Standard)">6 months (Standard Pace)</MenuItem>
                    <MenuItem value="9 months (Extended)">9 months (Extended Prep)</MenuItem>
                    <MenuItem value="12 months (Comprehensive)">12 months (Comprehensive Degree Pace)</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Weekly Hours */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                    Weekly Commitment
                  </Typography>
                  <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.88rem' }}>
                    {formData.weeklyHours} hrs/week
                  </Typography>
                </Box>
                <Slider
                  value={formData.weeklyHours}
                  onChange={(_, val) => setFormData((prev: UserGoalData) => ({ ...prev, weeklyHours: val as number }))}
                  min={4}
                  max={35}
                  step={1}
                  valueLabelDisplay="auto"
                  sx={{ color: '#2563EB' }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>4 hrs (Part-time)</Typography>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem' }}>35 hrs (Bootcamp)</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* TAB 2: SPEED & CADENCE QUOTA */}
        {formTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Solve Time Per Problem */}
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                  Target Solve Time / Problem
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#2563EB', fontSize: '0.86rem' }}>
                  {formData.targetSolveTimeMins} minutes / problem
                </Typography>
              </Box>
              <Slider
                value={formData.targetSolveTimeMins || 18}
                onChange={(_, val) => setFormData((prev: UserGoalData) => ({ ...prev, targetSolveTimeMins: val as number }))}
                min={8}
                max={45}
                step={1}
                valueLabelDisplay="auto"
                sx={{ color: '#2563EB' }}
              />
              <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                Industry Benchmark for Medium problems is ~20 mins. Competitive benchmark is ~15 mins.
              </Typography>
            </Box>

            {/* Daily Active Minutes Goal */}
            <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                  Daily Coding Focus Goal
                </Typography>
                <Typography sx={{ fontWeight: 800, color: '#059669', fontSize: '0.86rem' }}>
                  {formData.dailyGoalMins} minutes / day
                </Typography>
              </Box>
              <Slider
                value={formData.dailyGoalMins || 60}
                onChange={(_, val) => setFormData((prev: UserGoalData) => ({ ...prev, dailyGoalMins: val as number }))}
                min={15}
                max={180}
                step={15}
                valueLabelDisplay="auto"
                sx={{ color: '#059669' }}
              />
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                {[30, 45, 60, 90, 120].map((mins) => (
                  <Chip
                    key={mins}
                    label={`${mins}m`}
                    size="small"
                    onClick={() => setFormData((prev: UserGoalData) => ({ ...prev, dailyGoalMins: mins }))}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                      bgcolor: formData.dailyGoalMins === mins ? '#059669' : '#FFFFFF',
                      color: formData.dailyGoalMins === mins ? '#FFFFFF' : '#475569',
                      border: '1px solid #CBD5E1',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* 3-Column Velocity Settings */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', mb: 0.8 }}>
                  Weekly Problem Quota
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={formData.weeklyProblemQuota !== undefined ? formData.weeklyProblemQuota : ''}
                  onChange={(e) =>
                    setFormData((prev: UserGoalData) => ({
                      ...prev,
                      weeklyProblemQuota: e.target.value === '' ? undefined : Number(e.target.value),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 5, max: 60 } }}
                  sx={{ '& input': { fontWeight: 800 } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', mb: 0.8 }}>
                  Target Contest Rating
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={formData.targetContestRating !== undefined ? formData.targetContestRating : ''}
                  onChange={(e) =>
                    setFormData((prev: UserGoalData) => ({
                      ...prev,
                      targetContestRating: e.target.value === '' ? undefined : Number(e.target.value),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 1000, max: 2800 } }}
                  sx={{ '& input': { fontWeight: 800 } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem', mb: 0.8 }}>
                  First-Try Pass Target (%)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  value={formData.firstAttemptTargetRate !== undefined ? formData.firstAttemptTargetRate : ''}
                  onChange={(e) =>
                    setFormData((prev: UserGoalData) => ({
                      ...prev,
                      firstAttemptTargetRate: e.target.value === '' ? undefined : Number(e.target.value),
                    }))
                  }
                  slotProps={{ htmlInput: { min: 50, max: 99 } }}
                  sx={{ '& input': { fontWeight: 800 } }}
                />
              </Box>
            </Box>
          </Box>
        )}

        {/* TAB 3: SKILL SETS CALIBRATION */}
        {formTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Typography sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Adjust your present baseline competence across domains. Labels update automatically.
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {formData.skills.map((skill: { id: string; name: string; level: number; label: string }, index: number) => {
                const getBadge = (lvl: number) => {
                  if (lvl >= 80) return 'Advanced';
                  if (lvl >= 65) return 'Intermediate';
                  if (lvl >= 50) return 'Foundational';
                  return 'Elementary';
                };

                return (
                  <Box
                    key={skill.id}
                    sx={{
                      p: 1.8,
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.82rem' }}>
                        {skill.name}
                      </Typography>
                      <Chip
                        label={`${skill.level}% • ${skill.label}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.66rem',
                          bgcolor: skill.level >= 80 ? '#ECFDF5' : skill.level >= 65 ? '#EFF6FF' : '#FFFBEB',
                          color: skill.level >= 80 ? '#059669' : skill.level >= 65 ? '#1D4ED8' : '#D97706',
                        }}
                      />
                    </Box>
                    <Slider
                      value={skill.level}
                      onChange={(_, val) => {
                        const lvl = val as number;
                        setFormData((prev: UserGoalData) => {
                          const updated = [...(prev.skills || [])];
                          if (updated[index]) {
                            updated[index] = {
                              ...updated[index],
                              level: lvl,
                              label: getBadge(lvl),
                            };
                          }
                          return { ...prev, skills: updated };
                        });
                      }}
                      min={10}
                      max={100}
                      step={1}
                      sx={{
                        color: skill.level >= 80 ? '#10B981' : skill.level >= 65 ? '#2563EB' : '#F59E0B',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Modal Footer */}
      <Box
        sx={{
          p: 2.5,
          px: 3,
          bgcolor: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Button
          variant="text"
          size="small"
          startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setFormData(DEFAULT_GOAL)}
          sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none', fontSize: '0.78rem' }}
        >
          Reset Defaults
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              onClose();
              onOpenWizard();
            }}
            startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15 }} />}
            sx={{
              color: '#2563EB',
              borderColor: '#BFDBFE',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.78rem',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
            }}
          >
            Diagnostic Quiz
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={onSave}
            startIcon={<SaveRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.8rem',
              borderRadius: '8px',
              px: 2.2,
              py: 0.8,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Save & Apply Goals
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
