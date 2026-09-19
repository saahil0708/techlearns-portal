'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import InstitutionAdminSidebar from '@/components/institution-admin/layout/InstitutionAdminSidebar';
import InstitutionAdminNavbar from '@/components/institution-admin/layout/InstitutionAdminNavbar';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/context/ToastContext';

export default function InstitutionBatchesClient() {
  const user = useAppSelector((state) => state.auth.user);
  const toast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [batchName, setBatchName] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [maxCapacity, setMaxCapacity] = useState(60);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const activeMemberships = Array.isArray(user?.memberships) ? user.memberships : [];
  const primaryMembership =
    activeMemberships.find(
      (m: any) =>
        m?.role === 'INSTITUTION_ADMIN' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'FACULTY'
    ) || activeMemberships[0];

  const collegeId =
    primaryMembership?.collegeId ||
    primaryMembership?.college?.id ||
    primaryMembership?.institutionId ||
    primaryMembership?.institution?.id ||
    (user as any)?.collegeId ||
    (user as any)?.institutionId ||
    '';

  const collegeName =
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (user as any)?.institution ||
    'Academic Institution';

  const collegeCode =
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'CAMPUS';

  const fetchBatches = async () => {
    setLoading(true);
    try {
      if (collegeId) {
        const res = await apiService.getBatchesByCollege(collegeId);
        if (Array.isArray(res)) {
          setBatches(res);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [collegeId]);

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        searchQuery === '' ||
        b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && b.status !== 'INACTIVE' && b.status !== 'ARCHIVED') ||
        (statusFilter === 'INACTIVE' && (b.status === 'INACTIVE' || b.status === 'ARCHIVED'));

      return matchesSearch && matchesStatus;
    });
  }, [batches, searchQuery, statusFilter]);

  const paginatedBatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBatches.slice(start, start + rowsPerPage);
  }, [filteredBatches, page, rowsPerPage]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim()) {
      toast.error('Please enter a batch cohort name', 'Validation Error');
      return;
    }
    if (!collegeId) {
      toast.error('No associated academic institution found.', 'Error');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createBatch({
        name: batchName.trim(),
        collegeId,
        maxCapacity: Number(maxCapacity) || 60,
        startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      });

      toast.success(`Batch "${batchName}" created successfully.`, 'Cohort Created');
      setCreateModalOpen(false);
      setBatchName('');
      setBatchCode('');
      setMaxCapacity(60);
      fetchBatches();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create academic batch.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Cohort Name,Batch Code,Enrolled Students,Max Capacity,Start Date,Status'];
    const rows = filteredBatches.map((b) => {
      const name = `"${b.name || ''}"`;
      const code = `"${b.code || 'BATCH'}"`;
      const enrolled = b._count?.students || b.studentsCount || 0;
      const capacity = b.maxCapacity || 60;
      const start = b.startDate ? new Date(b.startDate).toLocaleDateString() : 'N/A';
      const status = `"${b.status || 'Active'}"`;
      return [name, code, enrolled, capacity, `"${start}"`, status].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Academic_Cohorts_${collegeCode}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(30, 64, 175, 0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(14, 165, 233, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(5, 150, 105, 0.03) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      <InstitutionAdminSidebar />

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            pb: 6,
          }}
        >
          <InstitutionAdminNavbar
            collegeName={collegeName}
            collegeCode={collegeCode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onCreateBatchClick={() => setCreateModalOpen(true)}
          />

          {/* Header Action Bar */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: 3,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                  Cohorts & Academic Batches
                </Typography>
                <Chip
                  label={`${filteredBatches.length} cohorts`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF', borderRadius: '6px' }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>
                Manage departmental sections, class cohorts, capacity thresholds, and curriculum distribution.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={handleExportCSV}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  borderRadius: '10px',
                  px: 2,
                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="contained"
                onClick={() => setCreateModalOpen(true)}
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#1E40AF',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  px: 2,
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Create Academic Batch
              </Button>
            </Box>
          </Box>

          {/* Filter Bar */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: 2,
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search cohorts by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.84rem',
                  },
                }}
              />
            </Box>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel sx={{ fontSize: '0.84rem' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '10px', fontSize: '0.84rem' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active Cohorts</MenuItem>
                <MenuItem value="INACTIVE">Archived</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* List Table Presentation Standard (Rule 10) */}
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>COHORT / BATCH NAME</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>BATCH CODE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>ENROLLED ROSTER</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>START DATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBatches.map((b: any) => {
                  const enrolledCount = b._count?.students || b.studentsCount || 0;
                  const capacity = b.maxCapacity || 60;
                  const percentage = Math.min(100, Math.round((enrolledCount / capacity) * 100));

                  return (
                    <TableRow key={b.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: 'rgba(30, 64, 175, 0.08)',
                              color: '#1E40AF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <SchoolRoundedIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                              {b.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                              Capacity: {capacity} seats
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Chip
                          label={b.code || 'COHORT'}
                          size="small"
                          sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569', borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PeopleAltRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                            {enrolledCount} / {capacity}
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                            ({percentage}%)
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Active Term'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Chip
                          icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          label={b.status === 'ARCHIVED' ? 'Archived' : 'Active'}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: b.status === 'ARCHIVED' ? '#F1F5F9' : '#ECFDF5',
                            color: b.status === 'ARCHIVED' ? '#64748B' : '#047857',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {paginatedBatches.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                      No academic batches found. Click &quot;Create Academic Batch&quot; to add your first cohort.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredBatches.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ borderTop: '1px solid #E2E8F0' }}
            />
          </TableContainer>
        </Box>
      </Box>

      {/* Create Batch Modal */}
      <Dialog
        open={createModalOpen}
        onClose={() => !submitting && setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '20px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
                bgcolor: 'rgba(30, 64, 175, 0.08)',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
                Create Academic Batch
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                New student cohort in {collegeName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setCreateModalOpen(false)} disabled={submitting} size="small">
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <form onSubmit={handleCreateBatch}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField
              label="Batch / Cohort Name"
              placeholder="e.g. CSE 2026 - Section A"
              fullWidth
              required
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              slotProps={{ input: { sx: { borderRadius: '10px' } } }}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Max Student Capacity"
                type="number"
                fullWidth
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value, 10) || 60))}
                slotProps={{ input: { sx: { borderRadius: '10px' } } }}
              />

              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                slotProps={{
                  inputLabel: { shrink: true },
                  input: { sx: { borderRadius: '10px' } },
                }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button
              onClick={() => setCreateModalOpen(false)}
              disabled={submitting}
              sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <AddRoundedIcon />}
              sx={{
                bgcolor: '#1E40AF',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
                px: 2.5,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              {submitting ? 'Creating...' : 'Create Batch'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
