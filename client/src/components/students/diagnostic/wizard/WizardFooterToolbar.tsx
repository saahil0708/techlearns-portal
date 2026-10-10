'use client';

import React from 'react';
import { FluidArrowBack, FluidArrowForward } from '@/utils/fluid_arrow';
import { Box, Button, CircularProgress } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

interface WizardFooterToolbarProps {
  currentStep: number;
  savingGoals: boolean;
  onPrevious: () => void;
  onContinue: () => void;
  onEvaluate: () => void;
  onApplyGoals: () => void;
}

export function WizardFooterToolbar({
  currentStep,
  savingGoals,
  onPrevious,
  onContinue,
  onEvaluate,
  onApplyGoals,
}: WizardFooterToolbarProps) {
  return (
    <Box
      sx={{
        px: { xs: 2.5, md: 4 },
        py: 2.5,
        bgcolor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Button
        disabled={currentStep === 1}
        onClick={onPrevious}
        startIcon={<FluidArrowBack />}
        variant="outlined"
        sx={{
          color: '#475569',
          borderColor: '#CBD5E1',
          textTransform: 'none',
          fontWeight: 700,
          borderRadius: '10px',
          px: 2.5,
          '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          '&.Mui-disabled': {
            opacity: 0.4,
            borderColor: '#E2E8F0',
          },
        }}
      >
        Previous
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {currentStep < 4 ? (
          <Button
            variant="contained"
            onClick={() => {
              if (currentStep === 3) {
                onEvaluate();
              } else {
                onContinue();
              }
            }}
            endIcon={<FluidArrowForward />}
            sx={{
              bgcolor: '#0B1F3A',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px',
              px: 3.5,
              py: 1,
              boxShadow: '0 2px 6px rgba(91, 45, 144, 0.25)',
              '&:hover': { bgcolor: '#17366E' },
            }}
          >
            {currentStep === 3 ? 'Evaluate & Calibrate' : 'Continue'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={onApplyGoals}
            disabled={savingGoals}
            startIcon={savingGoals ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />}
            sx={{
              bgcolor: '#10B981',
              color: '#FFFFFF',
              fontWeight: 800,
              textTransform: 'none',
              borderRadius: '10px',
              px: 4,
              py: 1,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            {savingGoals ? 'Saving Goals...' : 'Save Goals & Apply to Profile'}
          </Button>
        )}
      </Box>
    </Box>
  );
}
