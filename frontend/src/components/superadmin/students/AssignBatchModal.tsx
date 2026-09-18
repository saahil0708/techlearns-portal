'use client';

import React, { useState, useEffect, useId } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Chip,
  Alert,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

export interface AssignBatchStudentTarget {
  id: string;
  name: string;
  email?: string;
  handle?: string;
  currentCohort?: string;
  currentInstitution?: string;
}

interface AssignBatchModalProps {
  open: boolean;
  onClose: () => void;
  students: AssignBatchStudentTarget[];
  onAssignedSuccess: (assignedBatchName: string, institutionName: string, updatedStudentIds: string[]) => void;
}

export default function AssignBatchModal({
  open,
  onClose,
  students,
  onAssignedSuccess,
}: AssignBatchModalProps) {
  const toast = useToast();
  const instSelectLabelId = useId();
  const batchSelectLabelId = useId();

  const [institutions, setInstitutions] = useState<any[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);

  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('');
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch available institutions when modal opens
  useEffect(() => {
    if (!open) return;
    let isCurrent = true;

    async function fetchInstitutions() {
      setLoadingInstitutions(true);
      setErrorMsg(null);
      try {
        const res = await apiService.getInstitutions({ limit: 100 });
        if (isCurrent && res?.items && Array.isArray(res.items)) {
          setInstitutions(res.items);
          if (res.items.length > 0) {
            setSelectedInstitutionId(res.items[0].id);
          }
        }
      } catch (err: any) {
        if (isCurrent) {
          console.warn('Failed to fetch institutions for batch assignment:', err);
        }
      } finally {
        if (isCurrent) setLoadingInstitutions(false);
      }
    }

    fetchInstitutions();
    return () => {
      isCurrent = false;
    };
  }, [open]);

  // 2. Fetch batches whenever selected institution changes
  useEffect(() => {
    if (!selectedInstitutionId) {
      setBatches([]);
      setSelectedBatchId('');
      return;
    }
    let isCurrent = true;

    async function fetchBatches() {
      setLoadingBatches(true);
      setErrorMsg(null);
      try {
        const res = await apiService.getBatchesByCollege(selectedInstitutionId);
        if (isCurrent) {
          if (Array.isArray(res)) {
            setBatches(res);
            if (res.length > 0) {
              setSelectedBatchId(res[0].id);
            } else {
              setSelectedBatchId('');
            }
          } else {
            setBatches([]);
            setSelectedBatchId('');
          }
        }
      } catch (err: any) {
        if (isCurrent) {
          console.warn('Failed to load batches for institution:', err);
          setBatches([]);
          setSelectedBatchId('');
        }
      } finally {
        if (isCurrent) setLoadingBatches(false);
      }
    }

    fetchBatches();
    return () => {
      isCurrent = false;
    };
  }, [selectedInstitutionId]);

  const handleAssign = async () => {
    if (!selectedBatchId && selectedBatchId !== 'UNASSIGNED') {
      setErrorMsg('Please select a target academic batch cohort.');
      return;
    }
    if (students.length === 0) {
      setErrorMsg('No students selected for assignment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const studentIds = students.map((s) => s.id);
    const selectedInst = institutions.find((i) => i.id === selectedInstitutionId);
    const selectedBatch = batches.find((b) => b.id === selectedBatchId);
    const instName = selectedInst?.name || 'Academic Institution';
    const batchName = selectedBatchId === 'UNASSIGNED' ? 'No Batch Assigned' : (selectedBatch?.name || 'Assigned Cohort');

    try {
      if (selectedBatchId === 'UNASSIGNED') {
        // Unassign flow
        for (const s of students) {
          try {
            await apiService.updateUser(s.id, { institution: 'Independent' } as any);
          } catch {
            // continue
          }
        }
      } else {
        // 1. Ensure students have active membership in the selected institution in DB
        if (selectedInstitutionId) {
          for (const s of students) {
            try {
              await apiService.addInstitutionMember(selectedInstitutionId, {
                userId: s.id,
                role: 'STUDENT',
              });
            } catch {
              // Ignore if already a member
            }
          }
        }

        // 2. Assign students to the batch cohort in DB
        await apiService.assignStudentsToBatch(selectedBatchId, studentIds);
      }

      toast.success(
        `Successfully allocated ${students.length} student${students.length > 1 ? 's' : ''} to "${batchName}".`,
        'Batch Assigned'
      );
      onAssignedSuccess(batchName, instName, studentIds);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to assign students to batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBulk = students.length > 1;

  return (
    <Dialog
      open={open}
      onClose={() => !isSubmitting && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      {/* Title Header */}
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1.5, pt: 2, px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(37, 99, 235, 0.2)',
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
              {isBulk ? `Assign ${students.length} Students to Batch` : 'Assign Student to Batch / Cohort'}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              Allocate student coders to campus classes, batches & curriculum tracks
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} disabled={isSubmitting} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A' } }}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: '12px !important', pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {errorMsg && (
          <Alert severity="error" sx={{ borderRadius: '10px', fontSize: '0.82rem' }}>
            {errorMsg}
          </Alert>
        )}

        {/* Selected Students Info Card */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
            {isBulk ? `Target Candidates (${students.length} Selected)` : 'Target Student'}
          </Typography>

          {isBulk ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 100, overflowY: 'auto' }}>
              {students.map((s) => (
                <Chip
                  key={s.id}
                  label={`${s.name} (@${s.handle || 'student'})`}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>
          ) : students.length === 1 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                  {students[0].name}
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                  {students[0].email || `@${students[0].handle}`}
                </Typography>
              </Box>
              <Chip
                label={students[0].currentCohort || 'No Batch Assigned'}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: students[0].currentCohort && students[0].currentCohort !== 'No Batch Assigned' ? '#EFF6FF' : '#FEF3C7',
                  color: students[0].currentCohort && students[0].currentCohort !== 'No Batch Assigned' ? '#2563EB' : '#92400E',
                  borderRadius: '6px',
                }}
              />
            </Box>
          ) : null}
        </Box>

        {/* Step 1: Select Academic Institution */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
              1. Academic Institution
            </Typography>
          </Box>
          <FormControl fullWidth size="small" disabled={loadingInstitutions || isSubmitting}>
            <InputLabel id={instSelectLabelId} sx={{ fontSize: '0.85rem' }}>Select Institution</InputLabel>
            <Select
              labelId={instSelectLabelId}
              value={selectedInstitutionId}
              label="Select Institution"
              onChange={(e) => setSelectedInstitutionId(e.target.value)}
              sx={{
                borderRadius: '10px',
                fontSize: '0.86rem',
                bgcolor: '#FFFFFF',
              }}
            >
              {institutions.map((inst) => (
                <MenuItem key={inst.id} value={inst.id} sx={{ fontSize: '0.86rem', py: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                    <Typography sx={{ fontSize: '0.86rem', fontWeight: 600 }}>
                      {inst.name}
                    </Typography>
                    <Chip
                      label={inst.code || 'CAMPUS'}
                      size="small"
                      sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }}
                    />
                  </Box>
                </MenuItem>
              ))}
              {institutions.length === 0 && (
                <MenuItem disabled value="" sx={{ fontSize: '0.84rem' }}>
                  No institutions found
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Step 2: Select Batch / Cohort */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolRoundedIcon sx={{ fontSize: 18, color: '#059669' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                2. Target Batch / Cohort
              </Typography>
            </Box>
            {loadingBatches && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircularProgress size={14} />
                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>Loading batches...</Typography>
              </Box>
            )}
          </Box>
          <FormControl fullWidth size="small" disabled={loadingBatches || isSubmitting}>
            <InputLabel id={batchSelectLabelId} sx={{ fontSize: '0.85rem' }}>Select Cohort</InputLabel>
            <Select
              labelId={batchSelectLabelId}
              value={selectedBatchId}
              label="Select Cohort"
              onChange={(e) => setSelectedBatchId(e.target.value)}
              sx={{
                borderRadius: '10px',
                fontSize: '0.86rem',
                bgcolor: '#FFFFFF',
              }}
            >
              <MenuItem value="UNASSIGNED" sx={{ fontSize: '0.84rem', color: '#64748B', fontStyle: 'italic', py: 1 }}>
                — Unassigned / Remove from Cohort —
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              {batches.map((batch) => {
                const count = batch._count?.students || batch.studentsCount || 0;
                const max = batch.maxCapacity || 60;
                return (
                  <MenuItem key={batch.id} value={batch.id} sx={{ fontSize: '0.86rem', py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                          {batch.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Code: {batch.code || 'COHORT'}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<GroupRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        label={`${count}/${max} seats`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor: count >= max ? '#FEE2E2' : '#ECFDF5',
                          color: count >= max ? '#B91C1C' : '#047857',
                        }}
                      />
                    </Box>
                  </MenuItem>
                );
              })}
              {batches.length === 0 && !loadingBatches && (
                <MenuItem disabled value="" sx={{ fontSize: '0.84rem' }}>
                  No cohorts created under this institution yet
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        {/* Tip / Info Box */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '10px',
            bgcolor: '#EFF6FF',
            border: '1px solid #DBEAFE',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#2563EB', mt: 0.15, flexShrink: 0 }} />
          <Typography sx={{ fontSize: '0.75rem', color: '#1E40AF', lineHeight: 1.4 }}>
            Assigning students to a cohort automatically grants them access to batch-assigned curriculum courses, private lab challenges, and faculty mentorship.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B', borderRadius: '10px' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={isSubmitting || (!selectedBatchId && selectedBatchId !== 'UNASSIGNED')}
          startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <CheckCircleRoundedIcon />}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.86rem',
            borderRadius: '10px',
            px: 2.5,
            py: 0.9,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {isSubmitting ? 'Assigning...' : isBulk ? `Assign ${students.length} Students` : 'Assign Batch'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
