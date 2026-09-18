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
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import dynamic from 'next/dynamic';

const AssignBatchModal = dynamic(() => import('@/components/superadmin/students/AssignBatchModal'), { loading: () => null });
import type { AssignBatchStudentTarget } from '@/components/superadmin/students/AssignBatchModal';

import InstitutionAdminSidebar from '@/components/institution-admin/layout/InstitutionAdminSidebar';
import InstitutionAdminNavbar from '@/components/institution-admin/layout/InstitutionAdminNavbar';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';

export default function InstitutionStudentsClient() {
  const user = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Assign Batch Modal State
  const [isAssignBatchOpen, setIsAssignBatchOpen] = useState<boolean>(false);
  const [assignBatchTargets, setAssignBatchTargets] = useState<AssignBatchStudentTarget[]>([]);

  const handleOpenAssignBatchSingle = (s: any) => {
    setAssignBatchTargets([
      {
        id: s.id,
        name: s.name || 'Student',
        email: s.email,
        handle: s.handle,
        currentCohort: s.batchName || s.batch?.name || s.cohort || 'No Batch Assigned',
        currentInstitution: collegeName,
      },
    ]);
    setIsAssignBatchOpen(true);
  };

  const handleAssignedSuccess = (assignedBatchName: string, _institutionName: string, updatedStudentIds: string[]) => {
    const idSet = new Set(updatedStudentIds);
    setStudents((prev) =>
      prev.map((s) => {
        if (idSet.has(s.id)) {
          return {
            ...s,
            batchName: assignedBatchName,
            cohort: assignedBatchName,
          };
        }
        return s;
      })
    );
  };

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

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      try {
        const res = await apiService.getUsers({ limit: 300 });
        if (res?.items) {
          const studentUsers = res.items.filter((u: any) => {
            const hasStudentMembership = u.memberships?.some(
              (m: any) =>
                m.role === 'STUDENT' &&
                (!collegeId || m.collegeId === collegeId || m.institutionId === collegeId)
            );
            return (
              hasStudentMembership ||
              (u.globalRole === 'STUDENT' && (!collegeId || u.institutionId === collegeId || u.collegeId === collegeId))
            );
          });
          setStudents(studentUsers);
        }
      } catch (err) {
        console.warn('Failed to load student directory:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, [collegeId]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        searchQuery === '' ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.handle?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && s.status !== 'SUSPENDED' && s.status !== 'INACTIVE') ||
        (statusFilter === 'SUSPENDED' && s.status === 'SUSPENDED');

      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const paginatedStudents = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredStudents.slice(start, start + rowsPerPage);
  }, [filteredStudents, page, rowsPerPage]);

  const handleExportCSV = () => {
    const headers = ['Student Name,Email,Roll Number,Contest Rating,Status'];
    const rows = filteredStudents.map((s) => {
      const name = `"${s.name || 'Student'}"`;
      const email = `"${s.email || ''}"`;
      const roll = `"${s.rollNo || s.handle || 'N/A'}"`;
      const rating = s.contestRating || 1200;
      const status = `"${s.status || 'Active'}"`;
      return [name, email, roll, rating, status].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Student_Directory_${collegeCode}_${new Date().toISOString().slice(0, 10)}.csv`);
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
                  Institutional Student Directory
                </Typography>
                <Chip
                  label={`${filteredStudents.length} students`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF', borderRadius: '6px' }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>
                Master directory of all enrolled students across all campus departments and cohorts.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
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
                placeholder="Search students by name, email, roll number, or handle..."
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
                <MenuItem value="ACTIVE">Active Students</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>STUDENT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>ROLL NUMBER</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>COHORT / BATCH</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>CONTEST RATING</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5, textAlign: 'right' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedStudents.map((s: any) => {
                  return (
                    <TableRow key={s.id || s.email} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell sx={{ py: 1.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: 'rgba(30, 64, 175, 0.08)',
                              color: '#1E40AF',
                              fontWeight: 800,
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {s.name ? s.name[0]?.toUpperCase() : 'S'}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                              {s.name || 'Student'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {s.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                          {s.rollNo || s.handle || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Tooltip title="Click to assign or change cohort">
                          <Chip
                            label={s.batchName || s.batch?.name || s.cohort || 'No Batch Assigned'}
                            size="small"
                            onClick={() => handleOpenAssignBatchSingle(s)}
                            sx={{
                              cursor: 'pointer',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              bgcolor: (s.batchName || s.batch?.name || s.cohort) ? 'rgba(30, 64, 175, 0.08)' : '#F1F5F9',
                              color: (s.batchName || s.batch?.name || s.cohort) ? '#1E40AF' : '#64748B',
                              '&:hover': { bgcolor: 'rgba(30, 64, 175, 0.16)' },
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Chip
                          label={`${s.contestRating || 1200} pts`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            bgcolor: '#FEF3C7',
                            color: '#92400E',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Chip
                          icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          label={s.status === 'SUSPENDED' ? 'Suspended' : 'Active'}
                          size="small"
                          sx={{
                            height: 24,
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: s.status === 'SUSPENDED' ? '#FEE2E2' : '#ECFDF5',
                            color: s.status === 'SUSPENDED' ? '#B91C1C' : '#047857',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ py: 1.75, textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Assign to Batch / Cohort">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenAssignBatchSingle(s)}
                              sx={{ color: '#1E40AF', bgcolor: 'rgba(30, 64, 175, 0.06)', '&:hover': { bgcolor: 'rgba(30, 64, 175, 0.14)' } }}
                            >
                              <SchoolRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Email Student">
                            <IconButton
                              size="small"
                              href={`mailto:${s.email}`}
                              sx={{ color: '#64748B', '&:hover': { color: '#1E40AF', bgcolor: 'rgba(30,64,175,0.06)' } }}
                            >
                              <MailOutlineRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {paginatedStudents.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                      No students found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredStudents.length}
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

      {/* Assign Batch Modal */}
      <AssignBatchModal
        open={isAssignBatchOpen}
        onClose={() => setIsAssignBatchOpen(false)}
        students={assignBatchTargets}
        onAssignedSuccess={handleAssignedSuccess}
      />
    </Box>
  );
}
