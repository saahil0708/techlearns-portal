'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  CircularProgress,
  Autocomplete,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

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

interface ScheduledPotdItem {
  date: string;
  problem: {
    id: string;
    title: string;
    slug: string;
    difficulty: string;
    status: string;
  };
  bonusPoints: number;
  isCustom: boolean;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
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

  const [activeTab, setActiveTab] = useState<number>(0);

  // Tab 1: Single Day Form
  const todayStr = new Date().toISOString().slice(0, 10);
  const [targetDate, setTargetDate] = useState<string>(todayStr);
  const [selectedProblem, setSelectedProblem] = useState<ProblemEntity | null>(
    initialSelectedProblem || publishedProblems[0] || null
  );
  const [bonusPoints, setBonusPoints] = useState<number>(50);
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);

  // Tab 2: Continuous Queue Form
  const [queueStartDate, setQueueStartDate] = useState<string>(todayStr);
  const [queueBonusPoints, setQueueBonusPoints] = useState<number>(50);
  const [queueProblemPicker, setQueueProblemPicker] = useState<ProblemEntity | null>(null);
  const [queuedProblems, setQueuedProblems] = useState<ProblemEntity[]>([]);
  const [isSubmittingQueue, setIsSubmittingQueue] = useState(false);

  // Tab 3: Schedule / Queue List Table
  const [scheduleList, setScheduleList] = useState<ScheduledPotdItem[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const fetchSchedule = useCallback(async () => {
    setLoadingSchedule(true);
    try {
      const data = await apiService.getPotdSchedule(30);
      if (Array.isArray(data)) {
        setScheduleList(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  // Sync state when modal opens
  useEffect(() => {
    if (open) {
      if (initialSelectedProblem) {
        setSelectedProblem(initialSelectedProblem);
      } else if (!selectedProblem && publishedProblems.length > 0) {
        setSelectedProblem(publishedProblems[0]);
      }
      setTargetDate(new Date().toISOString().slice(0, 10));
      setQueueStartDate(new Date().toISOString().slice(0, 10));
      fetchSchedule();
    }
  }, [open, initialSelectedProblem, publishedProblems, fetchSchedule]);

  // Tab 1: Save / Update Single Day POTD
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProblem) {
      toast.error('Please select a problem from the published directory.', 'Validation Error');
      return;
    }

    setIsSubmittingSingle(true);
    try {
      const result = await apiService.setPotd({
        problemId: selectedProblem.id,
        date: targetDate,
        bonusPoints,
      });

      toast.success(
        `Problem of the Day assigned for ${targetDate}: "${selectedProblem.title}" (+${bonusPoints} pts)`,
        'POTD Assigned'
      );
      if (onSuccess) {
        onSuccess(result);
      }
      await fetchSchedule();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to configure Problem of the Day', 'Server Error');
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  // Tab 2: Queue builders
  const handleAddToQueue = () => {
    if (!queueProblemPicker) return;
    setQueuedProblems((prev) => [...prev, queueProblemPicker]);
    setQueueProblemPicker(null);
  };

  const handleRemoveFromQueue = (index: number) => {
    setQueuedProblems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveQueueItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === queuedProblems.length - 1) return;

    setQueuedProblems((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleQueueSubmit = async () => {
    if (queuedProblems.length === 0) {
      toast.error('Add at least one problem to the sequential queue.', 'Validation Error');
      return;
    }

    setIsSubmittingQueue(true);
    try {
      const problemIds = queuedProblems.map((p) => p.id);
      const res = await apiService.queuePotd({
        startDate: queueStartDate,
        problemIds,
        bonusPoints: queueBonusPoints,
      });

      toast.success(
        `Successfully queued ${queuedProblems.length} continuous days starting from ${queueStartDate}`,
        'Batch Queue Configured'
      );
      setQueuedProblems([]);
      if (onSuccess) {
        onSuccess(res);
      }
      await fetchSchedule();
      setActiveTab(2); // Switch to schedule list tab to inspect
    } catch (err: any) {
      toast.error(err?.message || 'Failed to queue continuous POTDs', 'Server Error');
    } finally {
      setIsSubmittingQueue(false);
    }
  };

  // Tab 3: Delete / Reset custom assignment
  const handleDeleteAssignment = async (date: string) => {
    setDeletingDate(date);
    try {
      await apiService.deletePotd(date);
      toast.success(`Removed custom assignment for ${date}. Automated rotation restored.`, 'Assignment Cleared');
      await fetchSchedule();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete custom assignment', 'Server Error');
    } finally {
      setDeletingDate(null);
    }
  };

  // Tab 3: Edit assignment (populates Tab 1)
  const handleEditAssignment = (item: ScheduledPotdItem) => {
    setTargetDate(item.date);
    setBonusPoints(item.bonusPoints || 50);
    const probMatch = publishedProblems.find((p) => p.id === item.problem.id) || null;
    setSelectedProblem(probMatch);
    setActiveTab(0);
  };

  // Compute calculated date for items in the continuous queue
  const getQueueItemDate = (index: number): string => {
    try {
      const [year, month, day] = queueStartDate.split('-').map(Number);
      const d = new Date(Date.UTC(year, month - 1, day));
      d.setUTCDate(d.getUTCDate() + index);
      return d.toISOString().slice(0, 10);
    } catch {
      return '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: 2.5,
          pb: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
            Problem of the Day Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem', mt: 0.25 }}>
            Schedule single days, queue consecutive challenges, or manage automated rotation
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: '1px solid #E2E8F0', px: 2.5, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontSize: '0.84rem',
              fontWeight: 700,
              textTransform: 'none',
              py: 1,
            },
          }}
        >
          <Tab label="Single Day Assignment" />
          <Tab label="Continuous Days Queue" />
          <Tab label={`Schedule & Queue (${scheduleList.length})`} />
        </Tabs>
      </Box>

      {/* Content Area */}
      <DialogContent sx={{ p: 3 }}>
        {/* ========================================================================= */}
        {/* TAB 0: SINGLE DAY ASSIGNMENT / EDIT */}
        {/* ========================================================================= */}
        {activeTab === 0 && (
          <form onSubmit={handleSingleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Problem Selector */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Select Problem *
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
                    placeholder="Search published problems..."
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
                  Target Date (YYYY-MM-DD) *
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
                  Bonus Points
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(Number(e.target.value))}
                >
                  <MenuItem value={50}>+50 Points (Standard)</MenuItem>
                  <MenuItem value={100}>+100 Points (Double)</MenuItem>
                  <MenuItem value={150}>+150 Points (Weekend)</MenuItem>
                  <MenuItem value={200}>+200 Points (Milestone)</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Selected Problem Summary */}
            {selectedProblem && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                  Assignment Overview
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#475569', mt: 0.5 }}>
                  Problem <strong>{selectedProblem.title}</strong> will be served as the Problem of the Day on{' '}
                  <strong>{targetDate}</strong> awarding <strong>+{bonusPoints} bonus points</strong> upon successful solve.
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingSingle || !selectedProblem}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#2563EB',
                  '&:hover': { bgcolor: '#1D4ED8' },
                  borderRadius: '8px',
                  px: 2.5,
                }}
              >
                {isSubmittingSingle ? 'Saving...' : 'Save Assignment'}
              </Button>
            </Box>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: CONTINUOUS DAYS BATCH QUEUE */}
        {/* ========================================================================= */}
        {activeTab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Queue Start Date *
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={queueStartDate}
                  onChange={(e) => setQueueStartDate(e.target.value)}
                  required
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Bonus Points per Challenge
                </Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={queueBonusPoints}
                  onChange={(e) => setQueueBonusPoints(Number(e.target.value))}
                >
                  <MenuItem value={50}>+50 Points</MenuItem>
                  <MenuItem value={100}>+100 Points</MenuItem>
                  <MenuItem value={150}>+150 Points</MenuItem>
                  <MenuItem value={200}>+200 Points</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Problem Selector for adding to queue */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end' }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Add Problem to Queue
                </Typography>
                <Autocomplete
                  options={publishedProblems}
                  getOptionLabel={(option) => `[${option.code}] ${option.title} (${option.difficulty})`}
                  value={queueProblemPicker}
                  onChange={(_, val) => setQueueProblemPicker(val)}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Search problem to append..." size="small" />
                  )}
                />
              </Box>
              <Button
                variant="outlined"
                disabled={!queueProblemPicker}
                onClick={handleAddToQueue}
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  height: 40,
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  whiteSpace: 'nowrap',
                }}
              >
                Add to Queue
              </Button>
            </Box>

            {/* Queue List Table */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 1 }}>
                Sequential Queue ({queuedProblems.length} Days)
              </Typography>

              {queuedProblems.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px dashed #CBD5E1',
                  }}
                >
                  <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                    No problems in the batch queue. Search and add problems above to build a continuous daily schedule.
                  </Typography>
                </Box>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '10px' }}>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem', width: 60 }}>DAY</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>SCHEDULED DATE</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>PROBLEM</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>DIFFICULTY</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {queuedProblems.map((prob, idx) => (
                        <TableRow key={`${prob.id}-${idx}`} hover>
                          <TableCell sx={{ fontWeight: 700, color: '#2563EB', fontSize: '0.8rem' }}>
                            #{idx + 1}
                          </TableCell>
                          <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#0F172A' }}>
                            {getQueueItemDate(idx)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>
                            {prob.title}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={prob.difficulty}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                height: 20,
                                bgcolor:
                                  prob.difficulty === 'Easy'
                                    ? '#DCFCE7'
                                    : prob.difficulty === 'Hard'
                                    ? '#FEE2E2'
                                    : '#FFEDD5',
                                color:
                                  prob.difficulty === 'Easy'
                                    ? '#15803D'
                                    : prob.difficulty === 'Hard'
                                    ? '#B91C1C'
                                    : '#C2410C',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                disabled={idx === 0}
                                onClick={() => handleMoveQueueItem(idx, 'up')}
                                sx={{ p: 0.5 }}
                              >
                                <ArrowUpwardRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                disabled={idx === queuedProblems.length - 1}
                                onClick={() => handleMoveQueueItem(idx, 'down')}
                                sx={{ p: 0.5 }}
                              >
                                <ArrowDownwardRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFromQueue(idx)}
                                sx={{ p: 0.5, color: '#EF4444' }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <Button
                variant="contained"
                disabled={isSubmittingQueue || queuedProblems.length === 0}
                onClick={handleQueueSubmit}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  bgcolor: '#2563EB',
                  '&:hover': { bgcolor: '#1D4ED8' },
                  borderRadius: '8px',
                  px: 2.5,
                }}
              >
                {isSubmittingQueue ? 'Queueing Continuous Days...' : `Queue for ${queuedProblems.length} Days`}
              </Button>
            </Box>
          </Box>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: SCHEDULE & QUEUE LIST TABLE */}
        {/* ========================================================================= */}
        {activeTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B' }}>
                Showing scheduled challenges for the upcoming 30 days. Custom assignments override the default automated cycle.
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={fetchSchedule}
                disabled={loadingSchedule}
                startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
              >
                Refresh
              </Button>
            </Box>

            {loadingSchedule ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>DATE</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>PROBLEM TITLE</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>DIFFICULTY</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>POINTS</TableCell>
                      <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>ASSIGNMENT MODE</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.74rem' }}>ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scheduleList.map((item) => (
                      <TableRow
                        key={item.date}
                        hover
                        sx={{
                          bgcolor: item.isToday ? 'rgba(37, 99, 235, 0.04)' : undefined,
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: item.isToday ? 800 : 600, fontSize: '0.8rem' }}>
                          {item.date}
                        </TableCell>
                        <TableCell>
                          {item.isToday ? (
                            <Chip label="Today" size="small" sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.68rem', height: 20 }} />
                          ) : item.isFuture ? (
                            <Chip label="Upcoming" size="small" sx={{ bgcolor: '#E0F2FE', color: '#0369A1', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                          ) : (
                            <Chip label="Past" size="small" sx={{ bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#0F172A' }}>
                          {item.problem?.title || 'Unassigned'}
                        </TableCell>
                        <TableCell>
                          {item.problem?.difficulty && (
                            <Chip
                              label={item.problem.difficulty}
                              size="small"
                              sx={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                height: 20,
                                bgcolor:
                                  item.problem.difficulty === 'Easy'
                                    ? '#DCFCE7'
                                    : item.problem.difficulty === 'Hard'
                                    ? '#FEE2E2'
                                    : '#FFEDD5',
                                color:
                                  item.problem.difficulty === 'Easy'
                                    ? '#15803D'
                                    : item.problem.difficulty === 'Hard'
                                    ? '#B91C1C'
                                    : '#C2410C',
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#475569' }}>
                          +{item.bonusPoints} pts
                        </TableCell>
                        <TableCell>
                          {item.isCustom ? (
                            <Chip label="Custom Scheduled" size="small" sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 800, fontSize: '0.68rem', height: 20 }} />
                          ) : (
                            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
                              Automated Rotation
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                            <Tooltip title="Edit Assignment">
                              <IconButton
                                size="small"
                                onClick={() => handleEditAssignment(item)}
                                sx={{ p: 0.5, color: '#2563EB' }}
                              >
                                <EditOutlinedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            {item.isCustom && (
                              <Tooltip title="Delete custom schedule and revert to automated">
                                <IconButton
                                  size="small"
                                  disabled={deletingDate === item.date}
                                  onClick={() => handleDeleteAssignment(item.date)}
                                  sx={{ p: 0.5, color: '#EF4444' }}
                                >
                                  {deletingDate === item.date ? (
                                    <CircularProgress size={14} />
                                  ) : (
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Button
          onClick={onClose}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            color: '#64748B',
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
