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
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

interface FacultyCreateProblemModalProps {
  open: boolean;
  onClose: () => void;
  collegeId?: string;
  collegeName?: string;
  onProblemCreated?: (problem: any) => void;
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
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [sampleExplanation, setSampleExplanation] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
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
    setSampleInput('');
    setSampleOutput('');
    setSampleExplanation('');
    setStatus('PUBLISHED');
  };

  const handleClose = () => {
    resetForm();
    onClose();
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

    setCreating(true);
    try {
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
      });

      // If sample test case provided, add it
      if (created?.id && sampleInput.trim() && sampleOutput.trim()) {
        try {
          await apiService.addProblemTestCase(created.id, {
            input: sampleInput.trim(),
            expectedOutput: sampleOutput.trim(),
            explanation: sampleExplanation.trim() || undefined,
            isHidden: false,
            order: 0,
          });
        } catch (tcErr: any) {
          toast.warning(
            `Problem was created, but failed to attach sample testcase: ${tcErr?.message || 'Unknown error'}. You can add testcases from the problem workspace.`,
            'Testcase Attachment Failed'
          );
        }
      }

      const successTitle = status === 'DRAFT' ? 'Problem Draft Saved' : 'Problem Published';
      const successMessage =
        status === 'DRAFT'
          ? `Lab problem draft "${title.trim()}" saved successfully!`
          : `Lab problem "${title.trim()}" published successfully!`;

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
              Create algorithmic problem with sandbox test cases for {collegeName}
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

          {/* Statement Markdown */}
          <TextField
            label="Problem Statement & Markdown Description"
            placeholder="Given the root of a binary tree, invert the tree and return its root..."
            required
            multiline
            rows={4}
            fullWidth
            size="small"
            value={statement}
            onChange={(e) => setStatement(e.target.value)}
          />

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

          <Divider sx={{ my: 0.5, borderColor: '#E2E8F0' }} />

          <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
            Sample Public Test Case
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Sample Input"
              placeholder="4 2 7 1 3 6 9"
              multiline
              rows={2}
              fullWidth
              size="small"
              value={sampleInput}
              onChange={(e) => setSampleInput(e.target.value)}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } } }}
            />

            <TextField
              label="Expected Output"
              placeholder="4 7 2 9 6 3 1"
              multiline
              rows={2}
              fullWidth
              size="small"
              value={sampleOutput}
              onChange={(e) => setSampleOutput(e.target.value)}
              slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.82rem' } } }}
            />
          </Box>

          <TextField
            label="Sample Explanation (Optional)"
            placeholder="Explanation of how the sample output was derived..."
            fullWidth
            size="small"
            value={sampleExplanation}
            onChange={(e) => setSampleExplanation(e.target.value)}
          />
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
