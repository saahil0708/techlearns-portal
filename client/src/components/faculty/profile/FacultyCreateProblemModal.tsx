'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tabs,
  Tab,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import TiptapProblemEditor from '@/components/editor/TiptapProblemEditor';

interface FacultyCreateProblemModalProps {
  open: boolean;
  onClose: () => void;
  collegeId?: string;
  collegeName?: string;
  onProblemCreated?: (problem: any) => void;
}

interface LocalTestCaseItem {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export default function FacultyCreateProblemModal({
  open,
  onClose,
  collegeId,
  collegeName = 'Academic Institution',
  onProblemCreated,
}: FacultyCreateProblemModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [timeLimit, setTimeLimit] = useState('1000');
  const [memoryLimit, setMemoryLimit] = useState('256');
  const [statement, setStatement] = useState('');
  const [inputFormat, setInputFormat] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [constraints, setConstraints] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [testCaseTab, setTestCaseTab] = useState<'sample' | 'hidden'>('sample');
  const [publicCases, setPublicCases] = useState<LocalTestCaseItem[]>([
    {
      id: 'tc-fac-pub-1',
      input: '',
      expectedOutput: '',
      explanation: '',
    },
  ]);
  const [hiddenCases, setHiddenCases] = useState<LocalTestCaseItem[]>([
    {
      id: 'tc-faculty-hidden-1',
      input: '',
      expectedOutput: '',
    },
  ]);
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDifficulty('MEDIUM');
    setTimeLimit('1000');
    setMemoryLimit('256');
    setStatement('');
    setInputFormat('');
    setOutputFormat('');
    setConstraints('');
    setStatus('PUBLISHED');
    setTestCaseTab('sample');
    setPublicCases([
      {
        id: 'tc-fac-pub-1',
        input: '',
        expectedOutput: '',
        explanation: '',
      },
    ]);
    setHiddenCases([
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tc-faculty-hidden-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        input: '',
        expectedOutput: '',
      },
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddPublicCase = () => {
    setPublicCases((prev) => [
      ...prev,
      {
        id: `tc-fac-pub-${Date.now()}-${prev.length + 1}`,
        input: '',
        expectedOutput: '',
        explanation: `Example #${prev.length + 1}`,
      },
    ]);
  };

  const handleRemovePublicCase = (id: string) => {
    setPublicCases((prev) => {
      if (prev.length <= 1) {
        return [{ id: 'tc-fac-pub-1', input: '', expectedOutput: '', explanation: '' }];
      }
      return prev.filter((tc) => tc.id !== id);
    });
  };

  const handlePublicCaseChange = (id: string, field: 'input' | 'expectedOutput' | 'explanation', value: string) => {
    setPublicCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleAddHiddenCase = () => {
    setHiddenCases((prev) => [
      ...prev,
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tc-faculty-hidden-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        input: '',
        expectedOutput: '',
      },
    ]);
  };

  const handleRemoveHiddenCase = (id: string) => {
    setHiddenCases((prev) => {
      if (prev.length <= 1) {
        return [{ id: 'tc-faculty-hidden-1', input: '', expectedOutput: '' }];
      }
      return prev.filter((tc) => tc.id !== id);
    });
  };

  const handleHiddenCaseChange = (id: string, field: 'input' | 'expectedOutput', value: string) => {
    setHiddenCases((prev) =>
      prev.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a problem title.', 'Validation Error');
      return;
    }
    if (!statement.trim()) {
      toast.error('Please provide a problem statement.', 'Validation Error');
      return;
    }

    const validPublics = publicCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim());
    if (validPublics.length === 0) {
      toast.error('Please provide at least one Public Sample Test Case.', 'Validation Error');
      setTestCaseTab('sample');
      return;
    }

    // Validate hidden test cases before proceeding
    for (let i = 0; i < hiddenCases.length; i++) {
      const tc = hiddenCases[i];
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

    setCreating(true);
    try {
      // Build test cases payload
      const testCasesPayload: Array<{
        input: string;
        expectedOutput: string;
        isHidden?: boolean;
        explanation?: string;
        order?: number;
      }> = [];

      validPublics.forEach((tc, idx) => {
        testCasesPayload.push({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation?.trim() || undefined,
          isHidden: false,
          order: idx,
        });
      });

      hiddenCases.forEach((tc) => {
        const hasInput = Boolean(tc.input.trim());
        const hasOutput = Boolean(tc.expectedOutput.trim());
        if (hasInput && hasOutput) {
          testCasesPayload.push({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            isHidden: true,
            order: testCasesPayload.length,
          });
        }
      });

      const created = await apiService.createProblem({
        title: title.trim(),
        statement: statement.trim(),
        inputFormat: inputFormat.trim() || undefined,
        outputFormat: outputFormat.trim() || undefined,
        constraints: constraints.trim() || undefined,
        difficulty: difficulty,
        timeLimit: Number(timeLimit) || 1000,
        memoryLimit: Number(memoryLimit) || 256,
        status: status,
        collegeId: collegeId || undefined,
        testCases: testCasesPayload.length > 0 ? testCasesPayload : undefined,
      });

      const successTitle = status === 'DRAFT' ? 'Problem Draft Saved' : 'Problem Published';
      const successMessage =
        status === 'DRAFT'
          ? `Lab problem draft "${title.trim()}" saved with ${testCasesPayload.length} testcase(s)!`
          : `Lab problem "${title.trim()}" published with ${testCasesPayload.length} testcase(s)!`;

      toast.success(successMessage, successTitle);
      onProblemCreated?.(created);
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create lab problem.', 'Creation Failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE',
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Author New Lab Coding Challenge
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
              Create algorithmic problem with sample & hidden sandbox test cases for {collegeName}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Form Body */}
      <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
          {/* Row 1: Title & Difficulty */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
            <TextField
              label="Problem Title"
              placeholder="e.g. Invert Binary Tree & Path Sum"
              required
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select
                value={difficulty}
                label="Difficulty"
                onChange={(e) => setDifficulty(e.target.value as any)}
              >
                <MenuItem value="EASY">Easy</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HARD">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Row 2: Limits & Status */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Time Limit (ms)"
              type="number"
              fullWidth
              size="small"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimerRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Memory Limit (MB)"
              type="number"
              fullWidth
              size="small"
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <MemoryRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="PUBLISHED">Published</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Statement Rich Text Editor */}
          <Box>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Problem Statement (Rich Text Editor) *
            </Typography>
            <TiptapProblemEditor
              content={statement}
              onChange={(val) => setStatement(val)}
              placeholder="Describe the problem narrative, constraints, and examples..."
              minHeight={200}
            />
          </Box>

          {/* Input & Output Format */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Input Format Specification"
              placeholder="The first line contains an integer N representing..."
              multiline
              rows={2}
              fullWidth
              size="small"
              value={inputFormat}
              onChange={(e) => setInputFormat(e.target.value)}
            />

            <TextField
              label="Output Format Specification"
              placeholder="Print the level order traversal separated by space..."
              multiline
              rows={2}
              fullWidth
              size="small"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
            />
          </Box>

          <TextField
            label="Constraints"
            placeholder="1 <= N <= 10^5, 0 <= Node.val <= 10^9"
            fullWidth
            size="small"
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
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
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>Public Samples</span>
                      <Chip
                        size="small"
                        label={publicCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim()).length}
                        sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669' }}
                      />
                    </Box>
                  }
                />
                <Tab
                  value="hidden"
                  icon={<VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />}
                  iconPosition="start"
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>Hidden Test Cases</span>
                      <Chip
                        size="small"
                        label={hiddenCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim()).length}
                        sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800, bgcolor: '#EFF6FF', color: '#2563EB' }}
                      />
                    </Box>
                  }
                />
              </Tabs>

              {testCaseTab === 'sample' ? (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddPublicCase}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    bgcolor: '#ECFDF5',
                    color: '#059669',
                    borderRadius: '8px',
                    px: 1.5,
                    '&:hover': { bgcolor: '#D1FAE5' },
                  }}
                >
                  Add Sample Case
                </Button>
              ) : (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleAddHiddenCase}
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

            {/* Public Sample Cases */}
            {testCaseTab === 'sample' && (
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', fontSize: '0.8rem' }}>
                  <VisibilityRoundedIcon sx={{ fontSize: 16, color: '#059669' }} />
                  <span>Publicly visible in problem statement for student guidance and initial test runs.</span>
                </Box>

                {publicCases.map((tc, index) => (
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
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`Example #${index + 1}`}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: '0.75rem', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}
                        />
                        <Chip
                          label="Public Sample"
                          size="small"
                          sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: '#F0FDF4', color: '#16A34A' }}
                        />
                      </Box>

                      {publicCases.length > 1 && (
                        <Tooltip title="Remove sample test case">
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePublicCase(tc.id)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                      <TextField
                        label="Sample Input"
                        placeholder="4 2 7 1 3 6 9"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        value={tc.input}
                        onChange={(e) => handlePublicCaseChange(tc.id, 'input', e.target.value)}
                        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } } }}
                      />
                      <TextField
                        label="Expected Output"
                        placeholder="4 7 2 9 6 3 1"
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        value={tc.expectedOutput}
                        onChange={(e) => handlePublicCaseChange(tc.id, 'expectedOutput', e.target.value)}
                        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } } }}
                      />
                    </Box>

                    <TextField
                      label="Sample Step Explanation (Optional)"
                      placeholder="Explain how the sample output was derived..."
                      fullWidth
                      size="small"
                      value={tc.explanation || ''}
                      onChange={(e) => handlePublicCaseChange(tc.id, 'explanation', e.target.value)}
                    />
                  </Box>
                ))}
              </Box>
            )}

            {/* Hidden Cases */}
            {testCaseTab === 'hidden' && (
              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', fontSize: '0.8rem' }}>
                  <ShieldRoundedIcon sx={{ fontSize: 16, color: '#10B981' }} />
                  <span>Hidden test cases are evaluated inside isolated Docker sandboxes for grading and cannot be read by students.</span>
                </Box>

                {hiddenCases.map((tc, index) => (
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

                      {hiddenCases.length > 1 && (
                        <Tooltip title="Remove hidden test case">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveHiddenCase(tc.id)}
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
                        placeholder="Hidden evaluation input..."
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        value={tc.input}
                        onChange={(e) => handleHiddenCaseChange(tc.id, 'input', e.target.value)}
                        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } } }}
                      />
                      <TextField
                        label="Expected Output"
                        placeholder="Expected output for evaluation..."
                        multiline
                        rows={2}
                        fullWidth
                        size="small"
                        value={tc.expectedOutput}
                        onChange={(e) => handleHiddenCaseChange(tc.id, 'expectedOutput', e.target.value)}
                        slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } } }}
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
            p: '16px 24px',
            bgcolor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              color: '#64748B',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={creating || !title.trim() || !statement.trim()}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              borderRadius: '10px',
              px: 3,
              py: 0.9,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {creating ? 'Publishing Challenge...' : 'Publish Lab Challenge'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
