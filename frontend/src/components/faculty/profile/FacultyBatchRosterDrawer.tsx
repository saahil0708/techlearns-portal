'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchIcon from '@mui/icons-material/Search';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { generateSafeCsv, downloadCsvBlob } from '@/utils/csv';
import type { FacultyBatchItem } from '@/data';

interface FacultyBatchRosterDrawerProps {
  open: boolean;
  onClose: () => void;
  batch: FacultyBatchItem | null;
  collegeName?: string;
  collegeId?: string;
  onInviteStudents: (batchId: string) => void;
  onRosterUpdated?: () => void;
}

export default function FacultyBatchRosterDrawer({
  open,
  onClose,
  batch,
  collegeName = 'Academic Institution',
  collegeId,
  onInviteStudents,
  onRosterUpdated,
}: FacultyBatchRosterDrawerProps) {
  const toast = useToast();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const activeBatchIdRef = React.useRef<string | null>(null);

  // Remove Student State
  const [studentToRemove, setStudentToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removeScope, setRemoveScope] = useState<'BATCH_ONLY' | 'COLLEGE_ENTIRE'>('BATCH_ONLY');
  const [isRemoving, setIsRemoving] = useState(false);

  const borderColor = '#E2E8F0';

  const loadRoster = React.useCallback(async (targetBatchId: string) => {
    activeBatchIdRef.current = targetBatchId;
    setLoading(true);
    try {
      const data = await apiService.getStudentsInBatch(targetBatchId);
      if (activeBatchIdRef.current === targetBatchId) {
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      if (activeBatchIdRef.current === targetBatchId) {
        toast.error(err?.message || 'Failed to fetch student roster for cohort.', 'Roster Error');
        setStudents([]);
      }
    } finally {
      if (activeBatchIdRef.current === targetBatchId) {
        setLoading(false);
      }
    }
  }, [toast]);

  useEffect(() => {
    let isCurrent = true;
    if (open && batch?.id) {
      activeBatchIdRef.current = batch.id;
      setLoading(true);
      apiService
        .getStudentsInBatch(batch.id)
        .then((data) => {
          if (isCurrent && activeBatchIdRef.current === batch.id) {
            setStudents(Array.isArray(data) ? data : []);
          }
        })
        .catch((err: any) => {
          if (isCurrent && activeBatchIdRef.current === batch.id) {
            toast.error(err?.message || 'Failed to fetch student roster for cohort.', 'Roster Error');
            setStudents([]);
          }
        })
        .finally(() => {
          if (isCurrent && activeBatchIdRef.current === batch.id) {
            setLoading(false);
          }
        });
    } else {
      setStudents([]);
      setSearch('');
      setLoading(false);
    }
    return () => {
      isCurrent = false;
    };
  }, [open, batch?.id, toast]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.trim().toLowerCase();
    return students.filter((item) => {
      const user = item.user || item;
      return (
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.id?.toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.info('No students in this cohort to export.', 'Empty Roster');
      return;
    }

    const headers = ['Student ID', 'Full Name', 'Email', 'Role', 'Status', 'Enrolled Date'];
    const rows = students.map((item) => {
      const u = item.user || item;
      return [
        u.id || '',
        u.name || '',
        u.email || '',
        u.globalRole || 'STUDENT',
        u.status || 'ACTIVE',
        item.enrolledAt ? new Date(item.enrolledAt).toISOString().split('T')[0] : '',
      ];
    });

    const csvContent = generateSafeCsv(headers, rows);
    downloadCsvBlob(`${(batch?.name || 'cohort').replace(/\s+/g, '_')}_roster.csv`, csvContent);
    toast.success(`Exported ${students.length} student records to CSV!`, 'Roster Exported');
  };

  const handleConfirmRemoveStudent = async () => {
    if (!batch?.id || !studentToRemove) return;
    setIsRemoving(true);
    try {
      if (removeScope === 'COLLEGE_ENTIRE' && collegeId) {
        await apiService.removeCollegeMember(collegeId, studentToRemove.id);
        toast.success(
          `${studentToRemove.name} was removed from ${collegeName} and all associated cohorts.`,
          'Student Removed from College'
        );
      } else {
        await apiService.removeStudentFromBatch(batch.id, studentToRemove.id);
        toast.success(`${studentToRemove.name} was removed from cohort ${batch.name}.`, 'Student Removed from Cohort');
      }
      setStudentToRemove(null);
      setRemoveScope('BATCH_ONLY');
      await loadRoster(batch.id);
      onRosterUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove student.', 'Removal Failed');
    } finally {
      setIsRemoving(false);
    }
  };

  if (!batch) return null;

  const currentCount = students.length;
  const maxCap = batch.maxCapacity || 100;
  const capPercent = maxCap > 0 ? Math.round((currentCount / maxCap) * 100) : 0;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 600, md: 720 },
            bgcolor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          bgcolor: '#FFFFFF',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1rem',
                border: '1px solid #BFDBFE',
              }}
            >
              {batch.name.slice(0, 2).toUpperCase()}
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>
                  {batch.name}
                </Typography>
                <Chip
                  label={batch.code}
                  size="small"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    bgcolor: '#F1F5F9',
                    color: '#475569',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                Cohort Roster • {collegeName}
              </Typography>
            </Box>
          </Box>

          <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        {/* Capacity Indicator Bar */}
        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: `1px solid ${borderColor}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B' }}>
              ENROLLED STUDENTS
            </Typography>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
              {currentCount} / {maxCap} <span style={{ color: '#2563EB', fontSize: '0.76rem' }}>({capPercent}%)</span>
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, capPercent)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: '#E2E8F0',
              '& .MuiLinearProgress-bar': {
                bgcolor: capPercent > 90 ? '#EF4444' : '#2563EB',
                borderRadius: 3,
              },
            }}
          />
        </Box>

        {/* Search & Actions Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search roster by name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '10px', fontSize: '0.82rem', bgcolor: '#FFFFFF' },
              },
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportCSV}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                borderColor: '#CBD5E1',
                color: '#334155',
                bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              Export CSV
            </Button>

            <Button
              size="small"
              variant="contained"
              startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => onInviteStudents(batch.id)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.78rem',
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                boxShadow: 'none',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Invite to Cohort
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Roster Table Content */}
      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 8, gap: 2 }}>
            <CircularProgress size={32} sx={{ color: '#2563EB' }} />
            <Typography sx={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 600 }}>
              Loading student roster...
            </Typography>
          </Box>
        ) : (
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', pl: 2.5, py: 1.5 }}>
                      STUDENT
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                      ENROLLED ON
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                      STATUS
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', pr: 2.5, py: 1.5 }}>
                      ACTION
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                        <SchoolRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#64748B' }}>
                          No students currently enrolled in this cohort.
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 15 }} />}
                          onClick={() => onInviteStudents(batch.id)}
                          sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                        >
                          Invite Students Now
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((item) => {
                      const user = item.user || item;
                      const initials = (user.name || 'S')
                        .split(' ')
                        .map((p: string) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase();
                      const enrolledDate = item.enrolledAt
                        ? new Date(item.enrolledAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Active';

                      return (
                        <TableRow key={item.id || user.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 2.5, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar
                                sx={{
                                  width: 32,
                                  height: 32,
                                  bgcolor: '#EFF6FF',
                                  color: '#2563EB',
                                  fontSize: '0.74rem',
                                  fontWeight: 800,
                                }}
                              >
                                {initials}
                              </Avatar>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography noWrap sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                                  {user.name}
                                </Typography>
                                <Typography noWrap sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>
                              {enrolledDate}
                            </Typography>
                          </TableCell>

                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              label={user.status || 'Active'}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.66rem',
                                fontWeight: 700,
                                bgcolor: '#ECFDF5',
                                color: '#059669',
                                border: '1px solid #A7F3D0',
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>

                          <TableCell align="right" sx={{ pr: 2.5, py: 1.75 }}>
                            <IconButton
                              size="small"
                              onClick={() => setStudentToRemove({ id: user.id, name: user.name })}
                              sx={{
                                color: '#94A3B8',
                                '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                              }}
                            >
                              <PersonRemoveRoundedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        )}
      </Box>

      {/* Remove Student Confirmation Modal */}
      <Dialog
        open={Boolean(studentToRemove)}
        onClose={() => {
          setStudentToRemove(null);
          setRemoveScope('BATCH_ONLY');
        }}
        slotProps={{
          paper: { sx: { borderRadius: '20px', p: 1, maxWidth: 460, width: '100%' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonRemoveRoundedIcon sx={{ color: '#DC2626', fontSize: 22 }} />
          Remove Student Option
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569', mb: 2 }}>
            Choose how you would like to remove <strong>{studentToRemove?.name}</strong>:
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {/* Scope 1: Batch Only */}
            <Box
              onClick={() => setRemoveScope('BATCH_ONLY')}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '2px solid',
                borderColor: removeScope === 'BATCH_ONLY' ? '#2563EB' : '#E2E8F0',
                bgcolor: removeScope === 'BATCH_ONLY' ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: removeScope === 'BATCH_ONLY' ? '#2563EB' : '#0F172A' }}>
                Remove from Cohort ({batch.name})
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.25 }}>
                Student remains enrolled in {collegeName}, but is removed from this specific cohort.
              </Typography>
            </Box>

            {/* Scope 2: College Entire */}
            {collegeId && (
              <Box
                onClick={() => setRemoveScope('COLLEGE_ENTIRE')}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '2px solid',
                  borderColor: removeScope === 'COLLEGE_ENTIRE' ? '#DC2626' : '#E2E8F0',
                  bgcolor: removeScope === 'COLLEGE_ENTIRE' ? '#FEF2F2' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: removeScope === 'COLLEGE_ENTIRE' ? '#DC2626' : '#0F172A' }}>
                  Delete from College ({collegeName}) Entirely
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.25 }}>
                  Completely revokes college membership and removes from all cohorts in this college.
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => {
              setStudentToRemove(null);
              setRemoveScope('BATCH_ONLY');
            }}
            sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isRemoving}
            onClick={handleConfirmRemoveStudent}
            sx={{
              bgcolor: removeScope === 'COLLEGE_ENTIRE' ? '#DC2626' : '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              '&:hover': { bgcolor: removeScope === 'COLLEGE_ENTIRE' ? '#B91C1C' : '#1D4ED8' },
            }}
          >
            {isRemoving
              ? 'Processing...'
              : removeScope === 'COLLEGE_ENTIRE'
              ? 'Delete from College'
              : 'Remove from Cohort'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}
