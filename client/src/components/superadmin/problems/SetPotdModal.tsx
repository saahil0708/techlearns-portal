'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Card,
  Chip,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

import { ProblemEntity } from '@/types/problem';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

interface SetPotdModalProps {
  open: boolean;
  onClose: () => void;
  problems: ProblemEntity[];
  initialSelectedProblem?: ProblemEntity | null;
  onSuccess?: (potdResult: any) => void;
}

export default function SetPotdModal({
  open,
  onClose,
  problems,
  initialSelectedProblem,
  onSuccess,
}: SetPotdModalProps) {
  const toast = useToast();
  const publishedProblems = problems.filter((p) => p.status === 'Published');

  const todayStr = new Date().toISOString().slice(0, 10);
  const [targetDate, setTargetDate] = useState<string>(todayStr);
  const [selectedProblem, setSelectedProblem] = useState<ProblemEntity | null>(
    initialSelectedProblem || publishedProblems[0] || null
  );
  const [bonusPoints, setBonusPoints] = useState<number>(50);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPotd, setCurrentPotd] = useState<any>(null);
  const [loadingCurrentPotd, setLoadingCurrentPotd] = useState(false);

  // Sync and reset form state when modal is opened
  useEffect(() => {
    if (open) {
      setSelectedProblem(initialSelectedProblem || publishedProblems[0] || null);
      setTargetDate(new Date().toISOString().slice(0, 10));
      setBonusPoints(50);
    }
  }, [open, initialSelectedProblem, problems]);

  // Load currently active POTD for preview
  useEffect(() => {
    if (open) {
      setLoadingCurrentPotd(true);
      apiService
        .getTodayPotd()
        .then((res) => {
          setCurrentPotd(res);
        })
        .catch(() => {
          setCurrentPotd(null);
        })
        .finally(() => {
          setLoadingCurrentPotd(false);
        });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem) {
      toast.error('Please select a problem from the published directory.', 'Validation Error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await apiService.setPotd({
        problemId: selectedProblem.id,
        date: targetDate,
        bonusPoints,
      });

      toast.success(
        `Problem of the Day configured for ${targetDate}: "${selectedProblem.title}" (+${bonusPoints} pts)`,
        'POTD Scheduled'
      );
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to configure Problem of the Day', 'Server Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Modal Header */}
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '12px',
                bgcolor: '#F59E0B',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              }}
            >
              <WhatshotRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#92400E', lineHeight: 1.2 }}>
                Configure Problem of the Day
              </Typography>
              <Typography variant="body2" sx={{ color: '#B45309', fontSize: '0.8rem', mt: 0.25 }}>
                Manually schedule or set the daily featured algorithmic challenge
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#92400E',
              bgcolor: 'rgba(255,255,255,0.6)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Current Active POTD Info Box */}
          <Card
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              boxShadow: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonthRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                  Currently Active Today ({todayStr})
                </Typography>
              </Box>
              <Chip
                label="Live POTD"
                size="small"
                sx={{
                  bgcolor: '#DCFCE7',
                  color: '#15803D',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>

            {loadingCurrentPotd ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <CircularProgress size={16} sx={{ color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>Loading today's POTD status...</Typography>
              </Box>
            ) : currentPotd?.problem ? (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                    {currentPotd.problem.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                    Code: <code>{currentPotd.problem.slug}</code> • Difficulty: {currentPotd.problem.difficulty}
                  </Typography>
                </Box>
                <Chip
                  icon={<EmojiEventsRoundedIcon sx={{ fontSize: 14, color: '#D97706 !important' }} />}
                  label={`+${currentPotd.bonusPoints || 50} pts`}
                  size="small"
                  sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontWeight: 800, fontSize: '0.74rem' }}
                />
              </Box>
            ) : (
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
                Automated deterministic POTD is active from published problem bank.
              </Typography>
            )}
          </Card>

          {/* Problem Selector with Search Autocomplete */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Select Coding Problem *
            </Typography>
            <Autocomplete
              options={publishedProblems}
              getOptionLabel={(option) => `[${option.code}] ${option.title} (${option.difficulty})`}
              value={selectedProblem}
              onChange={(_, val) => setSelectedProblem(val)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderOption={(props, option) => {
                const { key, ...otherProps } = props as any;
                return (
                  <Box
                    key={key || option.id}
                    component="li"
                    {...otherProps}
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
                        {option.title}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {option.code} • {option.category}
                      </Typography>
                    </Box>
                    <Chip
                      label={option.difficulty}
                      size="small"
                      sx={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        height: 20,
                        bgcolor:
                          option.difficulty === 'Easy'
                            ? '#DCFCE7'
                            : option.difficulty === 'Hard'
                            ? '#FEE2E2'
                            : '#FFEDD5',
                        color:
                          option.difficulty === 'Easy'
                            ? '#15803D'
                            : option.difficulty === 'Hard'
                            ? '#B91C1C'
                            : '#C2410C',
                      }}
                    />
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search by title, code, or topic..."
                  size="small"
                  required
                />
              )}
            />
          </Box>

          {/* Target Date & Bonus Points */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Effective Date (YYYY-MM-DD) *
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                required
                slotProps={{
                  inputLabel: { shrink: true },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Bonus Streak Points
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={bonusPoints}
                onChange={(e) => setBonusPoints(Number(e.target.value))}
              >
                <MenuItem value={50}>+50 Pts (Standard Daily)</MenuItem>
                <MenuItem value={100}>+100 Pts (Double Bonus)</MenuItem>
                <MenuItem value={150}>+150 Pts (Grand Weekend)</MenuItem>
                <MenuItem value={200}>+200 Pts (Mega Milestone)</MenuItem>
              </TextField>
            </Box>
          </Box>

          {/* Preview confirmation banner */}
          {selectedProblem && (
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                borderLeft: '4px solid #F59E0B',
                bgcolor: 'rgba(245, 158, 11, 0.08)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarRoundedIcon sx={{ fontSize: 18, color: '#D97706' }} />
                <Typography sx={{ fontWeight: 800, fontSize: '0.82rem', color: '#92400E' }}>
                  Configuration Summary
                </Typography>
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#78350F', mt: 0.5 }}>
                <strong>{selectedProblem.title}</strong> will be presented to all students on{' '}
                <strong>{targetDate}</strong> with <strong>+{bonusPoints} bonus points</strong> and streak multiplier
                rewards.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid #F1F5F9', bgcolor: '#FAFAFA', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#64748B',
              borderColor: '#CBD5E1',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || !selectedProblem}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              ) : (
                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 800,
              bgcolor: '#F59E0B',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
              '&:hover': { bgcolor: '#D97706' },
            }}
          >
            {isSubmitting ? 'Saving Configuration...' : 'Set Problem of the Day'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
