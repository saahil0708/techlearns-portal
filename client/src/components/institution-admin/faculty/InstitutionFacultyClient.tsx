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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TablePagination,
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';

import InstitutionAdminSidebar from '@/components/institution-admin/layout/InstitutionAdminSidebar';
import InstitutionAdminNavbar from '@/components/institution-admin/layout/InstitutionAdminNavbar';
import FacultyInviteMemberModal from '@/components/faculty/profile/FacultyInviteMemberModal';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';

export default function InstitutionFacultyClient() {
  const user = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  const fetchFacultyList = async () => {
    setLoading(true);
    try {
      const res = await apiService.getUsers({ limit: 200 });
      if (res?.items) {
        const institutionFaculty = res.items.filter((u: any) => {
          const hasFacultyMembership = u.memberships?.some(
            (m: any) =>
              (m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN' || m.role === 'INSTITUTION_ADMIN') &&
              (!collegeId || m.collegeId === collegeId || m.institutionId === collegeId)
          );
          return (
            hasFacultyMembership ||
            ((u.globalRole === 'FACULTY' || u.globalRole === 'COLLEGE_ADMIN' || u.globalRole === 'INSTITUTION_ADMIN') &&
              (!collegeId || u.institutionId === collegeId || u.collegeId === collegeId))
          );
        });
        setFacultyList(institutionFaculty);
      }
    } catch (err) {
      console.warn('Failed to load institution faculty:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyList();
  }, [collegeId]);

  // Extract unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set<string>();
    facultyList.forEach((f) => {
      if (f.department) set.add(f.department);
    });
    return Array.from(set);
  }, [facultyList]);

  // Filtered faculty items
  const filteredFaculty = useMemo(() => {
    return facultyList.filter((f) => {
      const matchesSearch =
        searchQuery === '' ||
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.specialization?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDept = departmentFilter === 'ALL' || f.department === departmentFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && f.status !== 'INVITED' && f.status !== 'SUSPENDED') ||
        (statusFilter === 'INVITED' && f.status === 'INVITED') ||
        (statusFilter === 'SUSPENDED' && f.status === 'SUSPENDED');

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [facultyList, searchQuery, departmentFilter, statusFilter]);

  const paginatedFaculty = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredFaculty.slice(start, start + rowsPerPage);
  }, [filteredFaculty, page, rowsPerPage]);

  const handleExportCSV = () => {
    const headers = ['Name,Email,Department,Specialization,Office Hours,Status,Phone'];
    const rows = filteredFaculty.map((f) => {
      const name = `"${f.name || 'Invited Mentor'}"`;
      const email = `"${f.email || ''}"`;
      const dept = `"${f.department || 'Computer Science'}"`;
      const spec = `"${f.specialization || 'Not provided'}"`;
      const office = `"${f.officeHours || 'Not provided'}"`;
      const status = `"${f.status || 'Active'}"`;
      const phone = `"${f.phone || 'Not provided'}"`;
      return [name, email, dept, spec, office, status, phone].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Faculty_Roster_${collegeCode}_${new Date().toISOString().slice(0, 10)}.csv`);
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
            onInviteFacultyClick={() => setInviteModalOpen(true)}
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
                  Department Faculty & Mentors
                </Typography>
                <Chip
                  label={`${filteredFaculty.length} educators`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF', borderRadius: '6px' }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>
                Manage college professors, teaching assistants, and mentors assigned to courses and cohorts.
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
                onClick={() => setInviteModalOpen(true)}
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
                Invite Faculty Mentor
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
                placeholder="Search by name, email, department, or specialization..."
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

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel sx={{ fontSize: '0.84rem' }}>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
                sx={{ borderRadius: '10px', fontSize: '0.84rem' }}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>
                    {dept}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel sx={{ fontSize: '0.84rem' }}>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ borderRadius: '10px', fontSize: '0.84rem' }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INVITED">Invited</MenuItem>
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
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>FACULTY MENTOR</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>DEPARTMENT</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>SPECIALIZATION</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>OFFICE HOURS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', py: 1.5, textAlign: 'right' }}>ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedFaculty.map((f: any) => {
                  const isInvited = f.status === 'INVITED';
                  const isSuspended = f.status === 'SUSPENDED';

                  return (
                    <TableRow key={f.id || f.email} hover sx={{ '&:last-child td': { border: 0 } }}>
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
                            {f.name ? f.name[0]?.toUpperCase() : 'F'}
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                              {f.name || 'Invited Mentor'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {f.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                          {f.department || 'Computer Science'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {f.specialization || 'Not provided'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                          {f.officeHours || 'Not provided'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 1.75 }}>
                        {isInvited ? (
                          <Chip
                            icon={<ScheduleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label="Invited"
                            size="small"
                            sx={{ height: 24, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEF3C7', color: '#B45309' }}
                          />
                        ) : isSuspended ? (
                          <Chip
                            label="Suspended"
                            size="small"
                            sx={{ height: 24, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#B91C1C' }}
                          />
                        ) : (
                          <Chip
                            icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label="Active"
                            size="small"
                            sx={{ height: 24, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#047857' }}
                          />
                        )}
                      </TableCell>
                      <TableCell sx={{ py: 1.75, textAlign: 'right' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="Email Faculty">
                            <IconButton
                              size="small"
                              href={`mailto:${f.email}`}
                              sx={{ color: '#64748B', '&:hover': { color: '#1E40AF', bgcolor: 'rgba(30,64,175,0.06)' } }}
                            >
                              <MailOutlineRoundedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          {f.phone && f.phone !== 'Not provided' && (
                            <Tooltip title={`Call: ${f.phone}`}>
                              <IconButton
                                size="small"
                                href={`tel:${f.phone}`}
                                sx={{ color: '#64748B', '&:hover': { color: '#059669', bgcolor: 'rgba(5,150,105,0.06)' } }}
                              >
                                <PhoneRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {paginatedFaculty.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                      No faculty mentors found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredFaculty.length}
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

      {/* Invite Faculty Modal */}
      <FacultyInviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        collegeId={collegeId}
        collegeName={collegeName}
        onSuccess={() => {
          setInviteModalOpen(false);
          fetchFacultyList();
        }}
      />
    </Box>
  );
}
