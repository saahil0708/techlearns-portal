'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  CircularProgress,
  Divider,
  Paper,
  Alert,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
} from '@mui/material';

// Material Rounded Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ContentPasteOffRoundedIcon from '@mui/icons-material/ContentPasteOffRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { NewContestData, ContestScope, ScoringFormat } from '@/types/contest';
import { apiService } from '@/lib/api-service';

interface CreateContestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewContestData) => void;
  defaultBatchId?: string;
  defaultInstitutionId?: string;
}

const SCOPES: { value: ContestScope; label: string; desc: string }[] = [
  {
    value: 'Batch Assessment (Cohort-Specific)',
    label: 'Cohort Assessment',
    desc: 'Restricted and auto-assigned to students in the selected batch.',
  },
  {
    value: 'Internal Faculty Assessment',
    label: 'Departmental Exam',
    desc: 'Internal classroom test conducted under faculty invigilation.',
  },
  {
    value: 'Institute League',
    label: 'College-Wide Contest',
    desc: 'Open to all registered students across departments.',
  },
  {
    value: 'Institutional Invitational',
    label: 'Invitational Round',
    desc: 'Competitive assessment with custom access keys.',
  },
];

const SCORING_FORMATS: { label: ScoringFormat; title: string; desc: string; penalty: string }[] = [
  {
    label: 'LeetCode (Score + Penalty)',
    title: 'Weighted Points (LeetCode)',
    desc: 'Ranked by total problem score. 5-minute penalty added per wrong attempt on accept.',
    penalty: '+5 min on AC',
  },
  {
    label: 'ICPC (Penalty Time)',
    title: 'ICPC Standard',
    desc: 'Ranked by solve count. Ties resolved by total solve time + 20m per rejected submission.',
    penalty: '+20 min per rejected try',
  },
  {
    label: 'IOI (Partial Subtasks)',
    title: 'IOI Partial Subtasks',
    desc: 'Candidates receive partial points proportional to testcases passed.',
    penalty: 'Graded partial marks',
  },
  {
    label: 'AtCoder (Scored)',
    title: 'Speed Rank (AtCoder)',
    desc: 'Score by total problem points with absolute submission timestamp tiebreaker.',
    penalty: 'Pure speed rank',
  },
];

const STEPS = [
  { step: 1, title: 'Details & Cohort', icon: AssignmentRoundedIcon },
  { step: 2, title: 'Question Bank', icon: CodeRoundedIcon },
  { step: 3, title: 'Schedule & Timing', icon: AccessTimeRoundedIcon },
  { step: 4, title: 'Anti-Cheat Suite', icon: ShieldRoundedIcon },
  { step: 5, title: 'Review & Publish', icon: RocketLaunchRoundedIcon },
];

const POPULAR_TAGS = [
  'DSA',
  'Arrays',
  'Dynamic Programming',
  'Trees & Graphs',
  'Placement Prep',
  'Mid-Term Exam',
  'SQL',
  'Python',
];

const formatLocalDatetime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function CreateContestModal({
  open,
  onClose,
  onSubmit,
  defaultBatchId,
  defaultInstitutionId,
}: CreateContestModalProps) {
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState<NewContestData>({
    title: '',
    slug: '',
    code: '',
    description: '',
    scope: 'Batch Assessment (Cohort-Specific)',
    scoringFormat: 'LeetCode (Score + Penalty)',
    status: 'UPCOMING',
    startTime: formatLocalDatetime(new Date(Date.now() + 3600000)),
    durationMinutes: 90,
    problemsCount: 0,
    organizer: 'Faculty Assessment Cell',
    rated: true,
    tags: ['DSA', 'Placement Prep'],
    institutionId: defaultInstitutionId || '',
    batchId: defaultBatchId || '',
    problemIds: [],
    // Proctoring suite defaults
    isProctored: true,
    enforceFullScreen: true,
    tabSwitchLimit: 3,
    disableCopyPaste: true,
    webcamProctoring: false,
    audioProctoring: false,
    plagiarismCheck: true,
    windowType: 'FIXED',
    shuffleQuestions: false,
    ipRestriction: '',
  });

  const [tagInput, setTagInput] = useState('DSA, Placement Prep');
  const [copiedCode, setCopiedCode] = useState(false);

  // Async data sources
  const [batches, setBatches] = useState<
    Array<{ id: string; name: string; institutionId?: string; _count?: { students: number } }>
  >([]);
  const [problems, setProblems] = useState<
    Array<{ id: string; title: string; difficulty: string; points?: number; category?: string; tags?: string[] }>
  >([]);
  const [loadingData, setLoadingData] = useState(false);

  // Problem Search & Filter
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setLoadingData(true);
      try {
        const [batchData, probData] = await Promise.allSettled([
          apiService.getBatches(),
          apiService.getProblems({ limit: 100 }),
        ]);

        if (!isMounted) return;

        let loadedBatches: any[] = [];
        if (batchData.status === 'fulfilled' && Array.isArray(batchData.value)) {
          loadedBatches = batchData.value;
          setBatches(loadedBatches);
        }
        if (probData.status === 'fulfilled' && probData.value?.items) {
          setProblems(probData.value.items);
        }

        // Set default batch / institution context if available
        setFormData((prev) => {
          const updated = { ...prev };
          if (defaultBatchId) {
            updated.batchId = defaultBatchId;
            const targetBatch = loadedBatches.find((b) => b.id === defaultBatchId);
            if (targetBatch?.institutionId) {
              updated.institutionId = targetBatch.institutionId;
            }
          }
          if (defaultInstitutionId && !updated.institutionId) {
            updated.institutionId = defaultInstitutionId;
          }
          return updated;
        });
      } catch (err) {
        console.error('Failed to load contest metadata:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [open, defaultBatchId, defaultInstitutionId]);

  const selectedBatchInfo = useMemo(() => {
    return batches.find((b) => b.id === formData.batchId);
  }, [batches, formData.batchId]);

  // Derive unique categories from problem bank
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    problems.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [problems]);

  // Filter problems based on search, difficulty, and category
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedDifficulty !== 'ALL' && p.difficulty?.toUpperCase() !== selectedDifficulty) {
        return false;
      }
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      if (problemSearch.trim()) {
        const q = problemSearch.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCategory && !matchesTags) return false;
      }
      return true;
    });
  }, [problems, problemSearch, selectedDifficulty, selectedCategory]);

  const selectedProblemList = useMemo(() => {
    const ids = formData.problemIds || [];
    return ids
      .map((id) => problems.find((p) => p.id === id))
      .filter((p): p is { id: string; title: string; difficulty: string; points?: number; category?: string; tags?: string[] } => !!p);
  }, [problems, formData.problemIds]);

  // Difficulty stats breakdown for selected questions
  const blueprintStats = useMemo(() => {
    const easy = selectedProblemList.filter((p) => p.difficulty?.toUpperCase() === 'EASY').length;
    const medium = selectedProblemList.filter((p) => p.difficulty?.toUpperCase() === 'MEDIUM').length;
    const hard = selectedProblemList.filter((p) => p.difficulty?.toUpperCase() === 'HARD').length;
    const totalPoints = selectedProblemList.reduce((sum, p) => {
      if (p.points) return sum + p.points;
      const diff = p.difficulty?.toUpperCase();
      return sum + (diff === 'HARD' ? 150 : diff === 'MEDIUM' ? 100 : 50);
    }, 0);
    const estimatedMinutes = easy * 15 + medium * 25 + hard * 45 || 60;
    return { easy, medium, hard, totalPoints, estimatedMinutes };
  }, [selectedProblemList]);

  const handleChange = (field: keyof NewContestData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !prev.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      if (field === 'batchId' && value) {
        const chosen = batches.find((b) => b.id === value);
        if (chosen?.institutionId) {
          updated.institutionId = chosen.institutionId;
        }
        updated.scope = 'Batch Assessment (Cohort-Specific)';
      }
      return updated;
    });
  };

  const handleAddTag = (tag: string) => {
    const currentTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setTagInput(newTags);
    }
  };

  const toggleProblemSelection = (problemId: string) => {
    setFormData((prev) => {
      const current = prev.problemIds || [];
      const updated = current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId];
      return {
        ...prev,
        problemIds: updated,
        problemsCount: updated.length,
      };
    });
  };

  // Step Validation
  const isStep1Valid = Boolean(formData.title.trim().length >= 3);
  const isStep2Valid = Boolean(formData.problemIds && formData.problemIds.length > 0);
  const isStep3Valid = Boolean(formData.startTime && formData.durationMinutes > 0);
  const isStep4Valid = true;

  const canProceed = () => {
    if (activeStep === 0) return isStep1Valid;
    if (activeStep === 1) return isStep2Valid;
    if (activeStep === 2) return isStep3Valid;
    if (activeStep === 3) return isStep4Valid;
    return true;
  };

  const canNavigateToStep = (targetStep: number) => {
    if (targetStep <= activeStep) return true;
    if (targetStep >= 1 && !isStep1Valid) return false;
    if (targetStep >= 2 && !isStep2Valid) return false;
    if (targetStep >= 3 && !isStep3Valid) return false;
    return true;
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1 && canProceed()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleCopyAccessCode = () => {
    let code = formData.code;
    if (!code) {
      code = `ASSESS-${Date.now().toString(36).toUpperCase()}`;
      setFormData((prev) => ({ ...prev, code }));
    }
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let autoCode = formData.code;
    if (!autoCode) {
      autoCode = `ASSESS-${Date.now().toString(36).toUpperCase()}`;
      setFormData((prev) => ({ ...prev, code: autoCode }));
    }

    onSubmit({
      ...formData,
      code: autoCode,
      tags: parsedTags,
      problemsCount: (formData.problemIds && formData.problemIds.length > 0)
        ? formData.problemIds.length
        : formData.problemsCount,
      batch: selectedBatchInfo ? { id: selectedBatchInfo.id, name: selectedBatchInfo.name } : undefined,
    });

    onClose();
  };

  const progressPercent = Math.round(((activeStep + 1) / STEPS.length) * 100);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#F8FAFC',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* ── TOP APP BAR (Clean, focused header) ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          zIndex: 30,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 }, minHeight: '64px !important' }}>
          {/* Left Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5 0%, #2563EB 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
              }}
            >
              <CodeRoundedIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                  Create Assessment
                </Typography>
                <Chip
                  size="small"
                  label="DRAFT"
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: 20,
                  }}
                />
              </Box>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                {selectedBatchInfo
                  ? `Assigned to: ${selectedBatchInfo.name} (${selectedBatchInfo._count?.students || 0} Students)`
                  : 'Open College-Wide Assessment'}
              </Typography>
            </Box>
          </Box>

          {/* Right Action */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{
                color: '#64748B',
                borderColor: '#CBD5E1',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: '8px',
                px: 2,
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
              }}
            >
              Cancel
            </Button>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: '#64748B',
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>

        {/* ── DEDICATED MUI TABS STEP BAR (Coding Ninjas / HackerRank style) ── */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderTop: '1px solid #F1F5F9',
            px: { xs: 2, md: 4 },
          }}
        >
          <Tabs
            value={activeStep}
            onChange={(_, newValue) => {
              if (canNavigateToStep(newValue)) {
                setActiveStep(newValue);
              }
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 48,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                background: 'linear-gradient(90deg, #4F46E5 0%, #2563EB 100%)',
              },
            }}
          >
            {STEPS.map((s, idx) => {
              const IconComp = s.icon;
              const isCompleted = activeStep > idx;
              const isCurrent = activeStep === idx;
              return (
                <Tab
                  key={s.step}
                  icon={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          bgcolor: isCurrent ? '#4F46E5' : isCompleted ? '#10B981' : '#E2E8F0',
                          color: isCurrent || isCompleted ? '#FFFFFF' : '#64748B',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 13 }} /> : s.step}
                      </Box>
                      <IconComp
                        sx={{
                          fontSize: 18,
                          color: isCurrent ? '#4F46E5' : isCompleted ? '#10B981' : '#94A3B8',
                        }}
                      />
                    </Box>
                  }
                  iconPosition="start"
                  label={
                    <Typography
                      sx={{
                        fontSize: '0.82rem',
                        fontWeight: isCurrent ? 800 : isCompleted ? 700 : 600,
                        color: isCurrent ? '#0F172A' : isCompleted ? '#059669' : '#64748B',
                        textTransform: 'none',
                      }}
                    >
                      {s.title}
                    </Typography>
                  }
                  sx={{
                    minHeight: 48,
                    py: 1,
                    px: { xs: 1.5, sm: 2.5 },
                    opacity: 1,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                    },
                  }}
                />
              );
            })}
          </Tabs>
        </Box>

        {/* Linear Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 2.5,
            bgcolor: '#F1F5F9',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #4F46E5 0%, #2563EB 50%, #10B981 100%)',
            },
          }}
        />
      </AppBar>

      {/* ── STEP CONTENT CONTAINER ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: { xs: 2, md: 6, lg: 8 },
          py: 3.5,
        }}
      >
        <Box sx={{ maxWidth: '1100px', mx: 'auto' }}>
          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 1: DETAILS & COHORT                                      */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 1. Target Student Cohort */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <GroupsRoundedIcon sx={{ color: '#4F46E5', fontSize: 24 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A' }}>
                      Target Student Batch / Cohort
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Select which student cohort or class will receive this assessment
                    </Typography>
                  </Box>
                </Box>

                <TextField
                  select
                  fullWidth
                  label="Select Batch / Section"
                  value={formData.batchId || ''}
                  onChange={(e) => handleChange('batchId', e.target.value)}
                  sx={lightFieldSx}
                  helperText="Enrolled candidates in this batch will be automatically assigned to this test"
                >
                  <MenuItem value="">
                    <em>Open College-Wide Assessment (All Registered Students)</em>
                  </MenuItem>
                  {batches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} {b._count?.students !== undefined ? `(${b._count.students} Students)` : ''}
                    </MenuItem>
                  ))}
                </TextField>

                {selectedBatchInfo && (
                  <Alert
                    icon={<SchoolRoundedIcon fontSize="inherit" sx={{ color: '#2563EB' }} />}
                    sx={{
                      mt: 2,
                      bgcolor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1E40AF',
                      borderRadius: '12px',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Auto-Enrollment: {selectedBatchInfo.name} ({selectedBatchInfo._count?.students || 0} Students)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#3B82F6' }}>
                      Candidates will automatically see this test on their student dashboard.
                    </Typography>
                  </Alert>
                )}
              </Paper>

              {/* 2. Assessment Identification */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2.5 }}>
                  Assessment Details & Instructions
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Assessment Title *"
                      placeholder="e.g. Data Structures & Algorithms Mid-Term Exam"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      required
                      error={!isStep1Valid && formData.title.length > 0}
                      helperText={!isStep1Valid && formData.title.length > 0 ? 'Minimum 3 characters required' : ''}
                      sx={lightFieldSx}
                    />
                    <TextField
                      fullWidth
                      label="Test Access Code"
                      placeholder="e.g. DSA-2026-TEST"
                      value={formData.code || ''}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      sx={lightFieldSx}
                      helperText="Auto-generated if empty"
                    />
                  </Box>

                  <TextField
                    select
                    fullWidth
                    label="Assessment Category"
                    value={formData.scope}
                    onChange={(e) => handleChange('scope', e.target.value)}
                    sx={lightFieldSx}
                  >
                    {SCOPES.map((sc) => (
                      <MenuItem key={sc.value} value={sc.value}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                            {sc.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {sc.desc}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Skills / Topics */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Skills & Tags (comma-separated)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="DSA, Arrays, Dynamic Programming"
                      sx={lightFieldSx}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        Quick Suggestions:
                      </Typography>
                      {POPULAR_TAGS.map((t) => (
                        <Chip
                          key={t}
                          label={`+ ${t}`}
                          size="small"
                          clickable
                          onClick={() => handleAddTag(t)}
                          sx={{
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            '&:hover': { bgcolor: '#EEF2FF', color: '#4F46E5' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    rows={3.5}
                    label="Instructions for Candidates"
                    placeholder="1. Fullscreen mode is strictly monitored during the assessment.&#10;2. Tab switching or minimizing the window will be logged.&#10;3. Partial marks are awarded based on passing subtasks and test cases."
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    sx={lightFieldSx}
                  />
                </Box>
              </Paper>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 2: QUESTION BANK & MARKING SCHEME                        */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Summary Metrics Bar (Coding Ninjas style) */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '14px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    QUESTIONS SELECTED
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    {selectedProblemList.length} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Problems</span>
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    TOTAL MARKS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                    {blueprintStats.totalPoints} <span style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 500 }}>Pts</span>
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    ESTIMATED TIME
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
                    ~{blueprintStats.estimatedMinutes} <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 500 }}>Mins</span>
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, display: 'block' }}>
                    DIFFICULTY BREAKDOWN
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.5 }}>
                    <Chip size="small" label={`Easy: ${blueprintStats.easy}`} sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                    <Chip size="small" label={`Med: ${blueprintStats.medium}`} sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                    <Chip size="small" label={`Hard: ${blueprintStats.hard}`} sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.68rem', height: 20 }} />
                  </Box>
                </Box>
              </Paper>

              {/* Filter Bar */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  flexWrap: 'wrap',
                }}
              >
                <TextField
                  size="small"
                  placeholder="Search problem bank by title, category, topic..."
                  value={problemSearch}
                  onChange={(e) => setProblemSearch(e.target.value)}
                  sx={{ flex: 1, minWidth: '240px', ...lightFieldSx }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: '#94A3B8' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box sx={{ display: 'flex', gap: 0.75 }}>
                  {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                    <Chip
                      key={diff}
                      label={diff}
                      clickable
                      onClick={() => setSelectedDifficulty(diff)}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        bgcolor:
                          selectedDifficulty === diff
                            ? diff === 'EASY'
                              ? '#10B981'
                              : diff === 'MEDIUM'
                              ? '#F59E0B'
                              : diff === 'HARD'
                              ? '#EF4444'
                              : '#4F46E5'
                            : '#F1F5F9',
                        color: selectedDifficulty === diff ? '#FFFFFF' : '#64748B',
                        border: '1px solid',
                        borderColor: selectedDifficulty === diff ? 'transparent' : '#E2E8F0',
                      }}
                    />
                  ))}
                </Box>

                {availableCategories.length > 0 && (
                  <TextField
                    select
                    size="small"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{ minWidth: 140, ...lightFieldSx }}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {availableCategories.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Paper>

              {/* Problem Selection Dual Pane */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' }, gap: 2.5 }}>
                {/* Available Library */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    maxHeight: '520px',
                    overflowY: 'auto',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 800, mb: 1.5 }}>
                    PROBLEM LIBRARY ({filteredProblems.length})
                  </Typography>

                  {loadingData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress size={30} sx={{ color: '#4F46E5' }} />
                    </Box>
                  ) : filteredProblems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                      <CodeRoundedIcon sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>No problems found</Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {filteredProblems.map((p) => {
                        const isSelected = formData.problemIds?.includes(p.id);
                        const defaultPoints = p.difficulty?.toUpperCase() === 'HARD' ? 150 : p.difficulty?.toUpperCase() === 'MEDIUM' ? 100 : 50;
                        return (
                          <Box
                            key={p.id}
                            onClick={() => toggleProblemSelection(p.id)}
                            sx={{
                              p: 1.5,
                              borderRadius: '10px',
                              bgcolor: isSelected ? '#EEF2FF' : '#F8FAFC',
                              border: isSelected ? '1.5px solid #6366F1' : '1px solid #E2E8F0',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              transition: 'all 0.15s ease',
                              '&:hover': {
                                bgcolor: isSelected ? '#E0E7FF' : '#F1F5F9',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, mr: 1.5 }}>
                              <Checkbox
                                checked={!!isSelected}
                                size="small"
                                sx={{
                                  color: '#CBD5E1',
                                  '&.Mui-checked': { color: '#4F46E5' },
                                }}
                              />
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                  {p.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {p.category || 'Algorithms'} • {p.points || defaultPoints} Pts
                                </Typography>
                              </Box>
                            </Box>

                            <Chip
                              size="small"
                              label={p.difficulty || 'MEDIUM'}
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.65rem',
                                height: 20,
                                bgcolor:
                                  p.difficulty?.toUpperCase() === 'EASY'
                                    ? '#ECFDF5'
                                    : p.difficulty?.toUpperCase() === 'HARD'
                                    ? '#FEF2F2'
                                    : '#FFFBEB',
                                color:
                                  p.difficulty?.toUpperCase() === 'EASY'
                                    ? '#059669'
                                    : p.difficulty?.toUpperCase() === 'HARD'
                                    ? '#DC2626'
                                    : '#D97706',
                              }}
                            />
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>

                {/* Selected Test Deck */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '520px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ color: '#4F46E5', fontWeight: 800 }}>
                      TEST DECK ({selectedProblemList.length})
                    </Typography>
                    {selectedProblemList.length > 0 && (
                      <Button
                        size="small"
                        onClick={() => setFormData((prev) => ({ ...prev, problemIds: [], problemsCount: 0 }))}
                        sx={{ color: '#EF4444', fontSize: '0.72rem', textTransform: 'none', fontWeight: 600 }}
                      >
                        Clear All
                      </Button>
                    )}
                  </Box>

                  {selectedProblemList.length === 0 ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        p: 4,
                        textAlign: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <AddRoundedIcon sx={{ fontSize: 36, mb: 1, color: '#94A3B8' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                        No questions in test deck
                      </Typography>
                      <Typography variant="caption">
                        Select problems from the library to include in the test.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flex: 1 }}>
                      {selectedProblemList.map((p, idx) => {
                        const defaultPoints = p.difficulty?.toUpperCase() === 'HARD' ? 150 : p.difficulty?.toUpperCase() === 'MEDIUM' ? 100 : 50;
                        return (
                          <Box
                            key={p.id}
                            sx={{
                              p: 1.25,
                              borderRadius: '10px',
                              bgcolor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box
                                sx={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: '6px',
                                  bgcolor: '#4F46E5',
                                  color: '#FFFFFF',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.72rem',
                                  fontWeight: 800,
                                }}
                              >
                                {idx + 1}
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                  {p.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {p.points || defaultPoints} Pts • {p.difficulty}
                                </Typography>
                              </Box>
                            </Box>

                            <IconButton
                              size="small"
                              onClick={() => toggleProblemSelection(p.id)}
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 3: SCHEDULE, TIMING & SCORING                            */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Access Window */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                  Test Access Window
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box
                    onClick={() => handleChange('windowType', 'FIXED')}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      bgcolor: formData.windowType === 'FIXED' ? '#EEF2FF' : '#F8FAFC',
                      border: formData.windowType === 'FIXED' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <AccessTimeRoundedIcon sx={{ color: '#4F46E5' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          Fixed Window (Live Scheduled Test)
                        </Typography>
                      </Box>
                      {formData.windowType === 'FIXED' && <CheckCircleRoundedIcon sx={{ color: '#4F46E5', fontSize: 18 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      All students must join and begin the exam synchronously at the specified datetime.
                    </Typography>
                  </Box>

                  <Box
                    onClick={() => handleChange('windowType', 'FLEXIBLE')}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      bgcolor: formData.windowType === 'FLEXIBLE' ? '#EEF2FF' : '#F8FAFC',
                      border: formData.windowType === 'FLEXIBLE' ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <PlayCircleOutlineRoundedIcon sx={{ color: '#059669' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          Flexible Window (Open Slot)
                        </Typography>
                      </Box>
                      {formData.windowType === 'FLEXIBLE' && <CheckCircleRoundedIcon sx={{ color: '#4F46E5', fontSize: 18 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Students can start anytime within an open timeframe. Individual timer starts upon test entry.
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Schedule & Duration */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2.5 }}>
                  Schedule Date & Duration
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Test Start Datetime *"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    sx={lightFieldSx}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      label="Allocated Duration (Minutes)"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => handleChange('durationMinutes', Math.max(10, parseInt(e.target.value, 10) || 60))}
                      sx={lightFieldSx}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end" sx={{ color: '#64748B', fontWeight: 700 }}>MINS</InputAdornment>,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                      {[30, 45, 60, 90, 120, 180].map((mins) => (
                        <Chip
                          key={mins}
                          label={`${mins}m`}
                          size="small"
                          clickable
                          onClick={() => handleChange('durationMinutes', mins)}
                          sx={{
                            fontWeight: 700,
                            bgcolor:
                              formData.durationMinutes === mins ? '#4F46E5' : '#F1F5F9',
                            color: formData.durationMinutes === mins ? '#FFFFFF' : '#475569',
                            border: '1px solid',
                            borderColor: formData.durationMinutes === mins ? 'transparent' : '#E2E8F0',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Scoring Rules */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0F172A', mb: 2 }}>
                  Leaderboard Scoring Rules
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {SCORING_FORMATS.map((fmt) => {
                    const isSelected = formData.scoringFormat === fmt.label;
                    return (
                      <Box
                        key={fmt.label}
                        onClick={() => handleChange('scoringFormat', fmt.label)}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: isSelected ? '#EEF2FF' : '#F8FAFC',
                          border: isSelected ? '2px solid #4F46E5' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {fmt.title}
                          </Typography>
                          {isSelected && <CheckCircleRoundedIcon sx={{ color: '#4F46E5', fontSize: 18 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                          {fmt.desc}
                        </Typography>
                        <Chip
                          size="small"
                          label={fmt.penalty}
                          sx={{
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            height: 20,
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 4: PROCTORING & ANTI-CHEAT SUITE                         */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Master Toggle */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)',
                  border: '1px solid #C7D2FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShieldRoundedIcon sx={{ color: '#4F46E5', fontSize: 32 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Proctored Anti-Cheat Security Suite
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#4F46E5' }}>
                      Enforces browser lockdowns, tab switch tracking, and automated plagiarism analysis.
                    </Typography>
                  </Box>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.isProctored}
                      onChange={(e) => handleChange('isProctored', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6366F1' },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                      {formData.isProctored ? 'PROCTORED' : 'DISABLED'}
                    </Typography>
                  }
                />
              </Paper>

              {/* Proctoring Settings Matrix */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {/* 1. Full Screen */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <FullscreenRoundedIcon sx={{ color: '#4F46E5' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Native Fullscreen Lockdown
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Forces candidates into fullscreen. Exiting or minimizing records violations.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.enforceFullScreen}
                      onChange={(e) => handleChange('enforceFullScreen', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 2. Tab Switch Limit */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <WarningAmberRoundedIcon sx={{ color: '#D97706' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        Tab Switch Tolerance Limit
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Max allowed tab switches before the test is auto-submitted.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[0, 1, 2, 3, 5].map((limit) => (
                      <Chip
                        key={limit}
                        disabled={!formData.isProctored}
                        label={limit === 0 ? 'Strict 0' : `${limit} Switches`}
                        size="small"
                        clickable
                        onClick={() => handleChange('tabSwitchLimit', limit)}
                        sx={{
                          fontWeight: 700,
                          bgcolor: formData.tabSwitchLimit === limit ? '#F59E0B' : '#F1F5F9',
                          color: formData.tabSwitchLimit === limit ? '#FFFFFF' : '#475569',
                          border: '1px solid',
                          borderColor: formData.tabSwitchLimit === limit ? 'transparent' : '#E2E8F0',
                        }}
                      />
                    ))}
                  </Box>
                </Paper>

                {/* 3. Clipboard Shield */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <ContentPasteOffRoundedIcon sx={{ color: '#DC2626' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Clipboard & Paste Lock
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Blocks pasting external code snippets and right-click inspect element.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.disableCopyPaste}
                      onChange={(e) => handleChange('disableCopyPaste', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 4. MOSS Plagiarism Engine */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <AutoAwesomeRoundedIcon sx={{ color: '#0284C7' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          MOSS Plagiarism Scanner
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Runs automated token-similarity cross-checks across all student submissions.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.plagiarismCheck}
                      onChange={(e) => handleChange('plagiarismCheck', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 5. Webcam Snapshots */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <VideocamRoundedIcon sx={{ color: '#059669' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Webcam Presence Snapshots
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Requires webcam stream to verify candidate presence during the exam.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.webcamProctoring}
                      onChange={(e) => handleChange('webcamProctoring', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 6. Shuffle Questions */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <ShuffleRoundedIcon sx={{ color: '#7C3AED' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Shuffle Question Order
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Presents problems in randomized order to prevent peer collaboration.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.shuffleQuestions}
                      onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 5: REVIEW & PUBLISH                                      */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 4 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Access Code Banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ color: '#059669', fontSize: 26 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Test Ready for Scheduling
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      All parameters configured and verified
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    bgcolor: '#F8FAFC',
                    p: 1,
                    px: 2,
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>
                      TEST ACCESS CODE
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#4F46E5', letterSpacing: '0.05em' }}>
                      {formData.code || 'PROC-AUTO-ASSIGNED'}
                    </Typography>
                  </Box>
                  <Tooltip title={copiedCode ? 'Copied!' : 'Copy Code'}>
                    <IconButton size="small" onClick={handleCopyAccessCode} sx={{ color: '#64748B' }}>
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>

              {/* Summary Cards Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                {/* Schedule Summary */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Cohort & Schedule Summary
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Test Title</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{formData.title}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Target Batch</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
                        {selectedBatchInfo ? `${selectedBatchInfo.name} (${selectedBatchInfo._count?.students || 0} Students)` : 'Open / All Batches'}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Start Datetime</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {new Date(formData.startTime).toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Duration & Window</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {formData.durationMinutes} Mins • {formData.windowType} Window
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Security Summary */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Proctoring & Integrity Summary
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Proctored Mode</Typography>
                      <Chip
                        size="small"
                        label={formData.isProctored ? 'ACTIVE' : 'OFF'}
                        sx={{
                          fontWeight: 800,
                          bgcolor: formData.isProctored ? '#ECFDF5' : '#F1F5F9',
                          color: formData.isProctored ? '#059669' : '#64748B',
                          height: 20,
                        }}
                      />
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Fullscreen Lock</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: formData.enforceFullScreen ? '#059669' : '#64748B' }}>
                        {formData.enforceFullScreen ? 'Enforced' : 'Disabled'}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Tab Switch Tolerance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#D97706' }}>
                        {formData.tabSwitchLimit} Max Switches
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Plagiarism Scan</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: formData.plagiarismCheck ? '#0284C7' : '#64748B' }}>
                        {formData.plagiarismCheck ? 'MOSS Automated' : 'Disabled'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Questions Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Selected Questions ({selectedProblemList.length})
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: '#4F46E5', fontWeight: 800 }}>
                    TOTAL: {blueprintStats.totalPoints} POINTS
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedProblemList.map((p, idx) => (
                    <Chip
                      key={p.id}
                      icon={<CodeRoundedIcon sx={{ color: '#4F46E5 !important' }} />}
                      label={`Q${idx + 1}: ${p.title} (${p.difficulty} • ${p.points || (p.difficulty?.toUpperCase() === 'HARD' ? 150 : p.difficulty?.toUpperCase() === 'MEDIUM' ? 100 : 50)} Pts)`}
                      sx={{
                        bgcolor: '#F8FAFC',
                        color: '#0F172A',
                        fontWeight: 600,
                        border: '1px solid #E2E8F0',
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>

      {/* ── PERSISTENT BOTTOM NAVIGATION DOCK ── */}
      <Box
        sx={{
          p: 2,
          px: { xs: 2, md: 6, lg: 8 },
          bgcolor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 30,
        }}
      >
        <Button
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{
            color: '#475569',
            fontWeight: 700,
            textTransform: 'none',
            px: 2.5,
            py: 1,
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
          }}
        >
          Previous
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onClose}
            sx={{
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { color: '#0F172A' },
            }}
          >
            Cancel
          </Button>

          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!canProceed()}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                bgcolor: '#4F46E5',
                color: '#FFFFFF',
                fontWeight: 700,
                textTransform: 'none',
                px: 3.5,
                py: 1,
                borderRadius: '10px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                '&:hover': { bgcolor: '#4338CA' },
                '&.Mui-disabled': { bgcolor: '#F1F5F9', color: '#94A3B8' },
              }}
            >
              Continue to {STEPS[activeStep + 1].title}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid}
              startIcon={<DoneAllRoundedIcon />}
              sx={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                textTransform: 'none',
                px: 4,
                py: 1,
                borderRadius: '10px',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                },
              }}
            >
              Publish & Auto-Enroll Batch
            </Button>
          )}
        </Box>
      </Box>
    </Dialog>
  );
}

const lightFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '10px',
    color: '#0F172A',
    '& fieldset': {
      borderColor: '#CBD5E1',
    },
    '&:hover fieldset': {
      borderColor: '#4F46E5',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4F46E5',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#475569',
    '&.Mui-focused': {
      color: '#4F46E5',
    },
  },
  '& .MuiSelect-icon': {
    color: '#64748B',
  },
  '& .MuiFormHelperText-root': {
    color: '#64748B',
  },
};
