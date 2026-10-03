'use client';

import React, { useState } from 'react';
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
  Tabs,
  Tab,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

import { useToast } from '@/context/ToastContext';
import { NewProblemData, ProblemCategory, ProblemDifficulty, ProblemTestCaseItem } from '@/types/problem';

interface CreateProblemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewProblemData) => void;
}

const CATEGORIES: ProblemCategory[] = [
  'Dynamic Programming',
  'Graph Theory & BFS/DFS',
  'Trees & Binary Search Trees',
  'Arrays & Two Pointers',
  'Strings & Tries',
  'Math & Number Theory',
  'Greedy & Heuristics',
];

const DIFFICULTIES: ProblemDifficulty[] = ['Easy', 'Medium', 'Hard'];

interface LocalTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden: boolean;
}

export default function CreateProblemModal({
  open,
  onClose,
  onSubmit,
}: CreateProblemModalProps) {
  const toast = useToast();
  const [formData, setFormData] = useState<NewProblemData>({
    title: '',
    slug: '',
    code: '',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'Published',
    points: 100,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    testCasesCount: 20,
    tags: ['Dynamic Programming', 'Algorithms'],
    statementMarkdown: '',
    sampleInput: '',
    sampleOutput: '',
    sampleExplanation: '',
  });

  const [testCaseTab, setTestCaseTab] = useState<'sample' | 'hidden'>('sample');
  const [hiddenTestCases, setHiddenTestCases] = useState<LocalTestCase[]>([
    {
      id: 'tc-hidden-1',
      input: '',
      expectedOutput: '',
      isHidden: true,
    },
  ]);

  const [tagInput, setTagInput] = useState('Dynamic Programming, Algorithms');

  const handleChange = (field: keyof NewProblemData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'title' && !prev.slug) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  };

  const handleAddHiddenTestCase = () => {
    setHiddenTestCases((prev) => [
      ...prev,
      {
        id: `tc-hidden-${Date.now()}`,
        input: '',
        expectedOutput: '',
        isHidden: true,
      },
    ]);
  };

  const handleRemoveHiddenTestCase = (id: string) => {
    setHiddenTestCases((prev) => prev.filter((tc) => tc.id !== id));
  };

  const handleHiddenTestCaseChange = (id: string, field: 'input' | 'expectedOutput' | 'explanation', value: string) => {
    setHiddenTestCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.statementMarkdown) return;

    // Validate sample testcase presence
    const hasSampleInput = Boolean(formData.sampleInput.trim());
    const hasSampleOutput = Boolean(formData.sampleOutput.trim());
    if ((hasSampleInput && !hasSampleOutput) || (!hasSampleInput && hasSampleOutput)) {
      toast.error(
        'Please provide both Sample Input and Expected Output, or leave both empty.',
        'Validation Error'
      );
      return;
    }

    // Validate hidden test cases presence
    for (let i = 0; i < hiddenTestCases.length; i++) {
      const tc = hiddenTestCases[i];
      const hasInput = Boolean(tc.input.trim());
      const hasOutput = Boolean(tc.expectedOutput.trim());
      if ((hasInput && !hasOutput) || (!hasInput && hasOutput)) {
        toast.error(
          `Please provide both Input and Expected Output for Hidden Case #${i + 1}, or leave both empty.`,
          'Validation Error'
        );
        return;
      }
    }

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Build array of test cases
    const allTestCases: ProblemTestCaseItem[] = [];

    // 1. Public sample case if provided
    if (hasSampleInput && hasSampleOutput) {
      allTestCases.push({
        input: formData.sampleInput,
        expectedOutput: formData.sampleOutput,
        explanation: formData.sampleExplanation?.trim() || undefined,
        isHidden: false,
        order: 0,
      });
    }

    // 2. Hidden test cases
    hiddenTestCases.forEach((tc) => {
      const hasInput = Boolean(tc.input.trim());
      const hasOutput = Boolean(tc.expectedOutput.trim());
      if (hasInput && hasOutput) {
        allTestCases.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation?.trim() || undefined,
          isHidden: true,
          order: allTestCases.length,
        });
      }
    });

    onSubmit({
      ...formData,
      tags: parsedTags,
      code: formData.code || `PROB-${Date.now().toString(36).toUpperCase()}`,
      testCases: allTestCases,
      testCasesCount: allTestCases.length,
    });

    onClose();
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
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
            maxHeight: '90vh',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <DialogTitle
          sx={{
            p: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CodeRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Author New Coding Problem
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                Add statement, sample test cases, hidden evaluation test cases, and resource limits
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>

        {/* Form Body */}
        <DialogContent sx={{ px: 3, pt: '24px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Row 1: Title & Code */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
            <TextField
              label="Problem Title"
              size="small"
              required
              fullWidth
              placeholder="e.g., Longest Palindromic Subsequence"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <TextField
              label="Problem Code"
              size="small"
              placeholder="e.g., PROB-104"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
            />
          </Box>

          {/* Row 2: Category & Difficulty */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Topic Category"
              size="small"
              required
              fullWidth
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Difficulty Tier"
              size="small"
              required
              fullWidth
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
            >
              {DIFFICULTIES.map((diff) => (
                <MenuItem key={diff} value={diff}>
                  {diff}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Points Value"
              type="number"
              size="small"
              required
              fullWidth
              slotProps={{ htmlInput: { min: 10, max: 10000 } }}
              value={formData.points}
              onChange={(e) => handleChange('points', Math.max(10, Math.min(10000, Number(e.target.value))))}
            />
          </Box>

          {/* Row 3: Limits & Tags */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 2fr' }, gap: 2 }}>
            <TextField
              label="Time Limit (ms)"
              type="number"
              size="small"
              required
              fullWidth
              helperText="Sandbox execution cap"
              slotProps={{ htmlInput: { min: 100, max: 30000, step: 100 } }}
              value={formData.timeLimitMs}
              onChange={(e) => handleChange('timeLimitMs', Math.max(100, Math.min(30000, Number(e.target.value))))}
            />

            <TextField
              label="Memory Limit (MB)"
              type="number"
              size="small"
              required
              fullWidth
              helperText="Max container RAM"
              slotProps={{ htmlInput: { min: 16, max: 2048, step: 16 } }}
              value={formData.memoryLimitMb}
              onChange={(e) => handleChange('memoryLimitMb', Math.max(16, Math.min(2048, Number(e.target.value))))}
            />

            <TextField
              label="Tags (comma separated)"
              size="small"
              fullWidth
              placeholder="DP, String, Two Pointers"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </Box>

          {/* Statement Markdown */}
          <TextField
            label="Problem Statement Markdown"
            multiline
            rows={4}
            required
            fullWidth
            placeholder="Given an integer array nums, return the length of the longest strictly increasing subsequence..."
            value={formData.statementMarkdown}
            onChange={(e) => handleChange('statementMarkdown', e.target.value)}
          />

          {/* Test Cases Section with Tabs */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', bgcolor: '#F8FAFC' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 1, borderBottom: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
              <Tabs
                value={testCaseTab}
                onChange={(_, val) => setTestCaseTab(val)}
                sx={{
                  minHeight: 44,
                  '& .MuiTab-root': {
                    minHeight: 44,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  },
                }}
              >
                <Tab
                  value="sample"
                  icon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                  label="Sample Test Case (Public)"
                />
                <Tab
                  value="hidden"
                  icon={<VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>Hidden Test Cases (Private)</span>
                      <Chip
                        size="small"
                        label={hiddenTestCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim()).length}
                        sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB' }}
                      />
                    </Box>
                  }
                />
              </Tabs>

              {testCaseTab === 'hidden' && (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddHiddenTestCase}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    borderRadius: '8px',
                    px: 1.5,
                    '&:hover': { bgcolor: '#DBEAFE' },
                  }}
                >
                  Add Hidden Case
                </Button>
              )}
            </Box>

            {/* Tab 1: Sample Test Case (Public) */}
            {testCaseTab === 'sample' && (
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', fontSize: '0.8rem' }}>
                  <VisibilityRoundedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
                  <span>Publicly visible in problem statement for student guidance and initial test runs.</span>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <TextField
                    label="Sample Input"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="nums = [10,9,2,5,3,7,101,18]"
                    value={formData.sampleInput}
                    onChange={(e) => handleChange('sampleInput', e.target.value)}
                  />
                  <TextField
                    label="Sample Expected Output"
                    multiline
                    rows={3}
                    fullWidth
                    placeholder="4"
                    value={formData.sampleOutput}
                    onChange={(e) => handleChange('sampleOutput', e.target.value)}
                  />
                </Box>
                <TextField
                  label="Sample Explanation (Optional)"
                  size="small"
                  fullWidth
                  placeholder="e.g. The longest increasing subsequence is [2,3,7,101], therefore the length is 4."
                  value={formData.sampleExplanation || ''}
                  onChange={(e) => handleChange('sampleExplanation', e.target.value)}
                />
              </Box>
            )}

            {/* Tab 2: Hidden Test Cases (Private) */}
            {testCaseTab === 'hidden' && (
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', fontSize: '0.8rem' }}>
                    <ShieldRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                    <span>Hidden test cases are evaluated inside isolated Docker sandboxes and never exposed in client API responses.</span>
                  </Box>
                </Box>

                {hiddenTestCases.map((tc, index) => (
                  <Box
                    key={tc.id}
                    sx={{
                      p: 2,
                      bgcolor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`Hidden Case #${index + 1}`}
                          size="small"
                          sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#F1F5F9', color: '#334155' }}
                        />
                        <Chip
                          label="Private / Judge Sandbox"
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: '#FEF2F2', color: '#DC2626' }}
                        />
                      </Box>

                      {hiddenTestCases.length > 1 && (
                        <Tooltip title="Remove hidden test case">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveHiddenTestCase(tc.id)}
                            sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                      <TextField
                        label="Hidden Input"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        placeholder="Edge case input (e.g., [0,0,0,0], large bounds, negative values)"
                        value={tc.input}
                        onChange={(e) => handleHiddenTestCaseChange(tc.id, 'input', e.target.value)}
                      />
                      <TextField
                        label="Expected Output"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        placeholder="Expected output for this hidden case"
                        value={tc.expectedOutput}
                        onChange={(e) => handleHiddenTestCaseChange(tc.id, 'expectedOutput', e.target.value)}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            p: 2.5,
            borderTop: '1px solid #E2E8F0',
            bgcolor: '#F8FAFC',
            gap: 1.5,
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748B',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              px: 3,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Publish Problem
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
