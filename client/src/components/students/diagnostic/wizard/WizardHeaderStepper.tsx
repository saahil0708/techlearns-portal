'use client';

import React from 'react';
import { Box, Typography, Chip, IconButton, LinearProgress } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import { STEP_ITEMS } from './types';

interface WizardHeaderStepperProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  isModal: boolean;
  onClose: () => void;
}

export function WizardHeaderStepper({
  currentStep,
  setCurrentStep,
  isModal,
  onClose,
}: WizardHeaderStepperProps) {
  return (
    <>
      {/* Top Header */}
      <Box
        sx={{
          px: { xs: 2.5, md: 4 },
          py: 2.5,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.12)',
            }}
          >
            <PsychologyRoundedIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem', lineHeight: 1.2 }}>
              Career Interest & Diagnostic Engine
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.85rem' }}>
              Calibrate your engineering track, evaluate baseline skills, and generate a tailored roadmap
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={`Step ${currentStep} of 4`}
            size="small"
            sx={{
              bgcolor: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 700,
              fontSize: '0.78rem',
              border: '1px solid #DBEAFE',
              borderRadius: '8px',
            }}
          />
          {isModal && (
            <IconButton onClick={onClose} size="small" sx={{ color: '#64748B', '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' } }}>
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Stepper Progress Bar */}
      <Box sx={{ bgcolor: '#F8FAFC', px: { xs: 2.5, md: 4 }, py: 2, borderBottom: '1px solid #E2E8F0' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          {STEP_ITEMS.map((item) => {
            const isActive = currentStep === item.step;
            const isDone = currentStep > item.step;
            return (
              <Box
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: item.step < currentStep ? 'pointer' : 'default',
                  opacity: item.step > currentStep ? 0.6 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    bgcolor: isDone ? '#10B981' : isActive ? '#2563EB' : '#E2E8F0',
                    color: isDone || isActive ? '#FFFFFF' : '#64748B',
                    boxShadow: isActive ? '0 0 0 4px rgba(37, 99, 235, 0.15)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {isDone ? <TaskAltRoundedIcon sx={{ fontSize: 18 }} /> : item.step}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontWeight: isActive ? 800 : isDone ? 700 : 600,
                      color: isActive ? '#2563EB' : isDone ? '#0F172A' : '#64748B',
                      lineHeight: 1.1,
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: { xs: 'none', md: 'block' },
                      color: '#94A3B8',
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
        <LinearProgress
          variant="determinate"
          value={(currentStep / 4) * 100}
          sx={{
            mt: 1.5,
            height: 4,
            borderRadius: 2,
            bgcolor: '#E2E8F0',
            '& .MuiLinearProgress-bar': {
              bgcolor: '#2563EB',
              borderRadius: 2,
            },
          }}
        />
      </Box>
    </>
  );
}
