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
  Grid,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

import { NewProblemData, ProblemCategory, ProblemDifficulty } from '@/types/problem';

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

export default function CreateProblemModal({
  open,
  onClose,
  onSubmit,
}: CreateProblemModalProps) {
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
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.statementMarkdown) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      ...formData,
      tags: parsedTags,
      code: formData.code || `PROB-${Math.floor(100 + Math.random() * 900)}`,
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
                Add problem statement, test cases, and time/memory limits
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
        <DialogContent sx={{ px: 3, pt: '28px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
              value={formData.points}
              onChange={(e) => handleChange('points', Number(e.target.value))}
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
              value={formData.timeLimitMs}
              onChange={(e) => handleChange('timeLimitMs', Number(e.target.value))}
            />

            <TextField
              label="Memory Limit (MB)"
              type="number"
              size="small"
              required
              fullWidth
              value={formData.memoryLimitMb}
              onChange={(e) => handleChange('memoryLimitMb', Number(e.target.value))}
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

          {/* Sample Input & Output */}
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
              label="Sample Output"
              multiline
              rows={3}
              fullWidth
              placeholder="4"
              value={formData.sampleOutput}
              onChange={(e) => handleChange('sampleOutput', e.target.value)}
            />
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
