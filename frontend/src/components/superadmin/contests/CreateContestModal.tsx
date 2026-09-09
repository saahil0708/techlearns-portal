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
  FormControlLabel,
  Switch,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

import { NewContestData, ContestScope, ScoringFormat, ContestStatus } from '@/types/contest';

interface CreateContestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewContestData) => void;
}

const SCOPES: ContestScope[] = [
  'Global',
  'Collegiate League',
  'High School Invitational',
  'Internal Faculty Assessment',
];

const SCORING_FORMATS: ScoringFormat[] = [
  'ICPC (Penalty Time)',
  'LeetCode (Score + Penalty)',
  'IOI (Partial Subtasks)',
  'AtCoder (Scored)',
];

const STATUSES: ContestStatus[] = ['UPCOMING', 'LIVE', 'DRAFT'];

export default function CreateContestModal({
  open,
  onClose,
  onSubmit,
}: CreateContestModalProps) {
  const [formData, setFormData] = useState<NewContestData>({
    title: '',
    slug: '',
    code: '',
    description: '',
    scope: 'Collegiate League',
    scoringFormat: 'ICPC (Penalty Time)',
    status: 'UPCOMING',
    startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 180,
    problemsCount: 6,
    organizer: 'Department of Computer Science',
    rated: true,
    tags: ['Algorithms', 'ICPC', 'Competitive'],
  });

  const [tagInput, setTagInput] = useState('Algorithms, ICPC, Competitive');

  const handleChange = (field: keyof NewContestData, value: any) => {
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
    if (!formData.title || !formData.description) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onSubmit({
      ...formData,
      tags: parsedTags,
      code: formData.code || `CONTEST-${Math.floor(100 + Math.random() * 900)}`,
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
                bgcolor: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Schedule & Create Competitive Contest
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                Configure tournament parameters, scoring engine, problem sets, and timing windows
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
              label="Contest Title"
              size="small"
              required
              fullWidth
              placeholder="e.g., Annual Collegiate Coding Championship 2026"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
            <TextField
              label="Contest Code"
              size="small"
              placeholder="e.g., ICPC-2026-REG"
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value)}
            />
          </Box>

          {/* Row 2: Scope, Scoring Format, Status */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              select
              label="Contest Scope & League"
              size="small"
              required
              fullWidth
              value={formData.scope}
              onChange={(e) => handleChange('scope', e.target.value)}
            >
              {SCOPES.map((sc) => (
                <MenuItem key={sc} value={sc}>
                  {sc}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Scoring Engine"
              size="small"
              required
              fullWidth
              value={formData.scoringFormat}
              onChange={(e) => handleChange('scoringFormat', e.target.value)}
            >
              {SCORING_FORMATS.map((fmt) => (
                <MenuItem key={fmt} value={fmt}>
                  {fmt}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Initial Status"
              size="small"
              required
              fullWidth
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUSES.map((st) => (
                <MenuItem key={st} value={st}>
                  {st}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Row 3: Schedule & Duration */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              size="small"
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={formData.startTime}
              onChange={(e) => handleChange('startTime', e.target.value)}
            />

            <TextField
              label="Duration (Minutes)"
              type="number"
              size="small"
              required
              fullWidth
              value={formData.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', Number(e.target.value))}
            />

            <TextField
              label="Total Problems Count"
              type="number"
              size="small"
              required
              fullWidth
              value={formData.problemsCount}
              onChange={(e) => handleChange('problemsCount', Number(e.target.value))}
            />
          </Box>

          {/* Row 4: Organizer & Tags */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Host / Organizer Entity"
              size="small"
              required
              fullWidth
              placeholder="e.g., MIT ACM Chapter / Google Student Club"
              value={formData.organizer}
              onChange={(e) => handleChange('organizer', e.target.value)}
            />

            <TextField
              label="Tags (comma separated)"
              size="small"
              fullWidth
              placeholder="ICPC, Dynamic Programming, Graphs"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
            />
          </Box>

          {/* Description */}
          <TextField
            label="Contest Description & Rules"
            multiline
            rows={3}
            required
            fullWidth
            placeholder="Official institutional contest open to all verified college undergraduates..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
          />

          {/* Rated Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.rated}
                onChange={(e) => handleChange('rated', e.target.checked)}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                  Rated Contest (Updates Coder Rating Matrix)
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Participant performances will recalculate global and collegiate Elo rating points
                </Typography>
              </Box>
            }
          />
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
            Publish Tournament
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
