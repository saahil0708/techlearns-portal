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
  InputAdornment,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getInitialDates() {
  const now = new Date();
  const startDate = formatLocalDate(now);
  const nextYear = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const endDate = formatLocalDate(nextYear);
  return { startDate, endDate };
}

interface FacultyCreateBatchModalProps {
  open: boolean;
  onClose: () => void;
  collegeId?: string;
  collegeName?: string;
  onBatchCreated?: (batch: any) => void;
}

export default function FacultyCreateBatchModal({
  open,
  onClose,
  collegeId,
  collegeName = 'Academic Institution',
  onBatchCreated,
}: FacultyCreateBatchModalProps) {
  const toast = useToast();
  const initialDates = getInitialDates();
  const [name, setName] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('100');
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [creating, setCreating] = useState(false);

  const resetForm = () => {
    const dates = getInitialDates();
    setName('');
    setMaxCapacity('100');
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a valid cohort name.', 'Validation Error');
      return;
    }
    if (!collegeId) {
      toast.error('College organization ID is missing.', 'Error');
      return;
    }

    setCreating(true);
    try {
      const created = await apiService.createBatch({
        name: name.trim(),
        collegeId,
        maxCapacity: Number(maxCapacity) || 100,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      });

      toast.success(`Cohort "${name.trim()}" created successfully!`, 'Cohort Created');
      onBatchCreated?.(created);
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create cohort batch.', 'Creation Failed');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
            overflow: 'hidden',
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
            <SchoolRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Create New Student Cohort
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
              Assign new academic cohort in {collegeName}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Form Content */}
      <Box component="form" onSubmit={handleCreate}>
        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Cohort / Batch Name"
            placeholder="e.g. Batch 2026 CS-Alpha"
            required
            fullWidth
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Maximum Student Capacity"
            type="number"
            required
            fullWidth
            size="small"
            value={maxCapacity}
            onChange={(e) => setMaxCapacity(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupsRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                inputProps: { min: 1, max: 1000 },
              },
            }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Academic Term Start"
              type="date"
              fullWidth
              size="small"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Academic Term End"
              type="date"
              fullWidth
              size="small"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
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
            disabled={creating || !name.trim()}
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
            {creating ? 'Creating...' : 'Create Cohort'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
