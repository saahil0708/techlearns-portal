'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { generateSafeCsv, downloadCsvBlob } from '@/utils/csv';
import FacultyInviteMemberModal from './FacultyInviteMemberModal';

export interface FacultyMemberEntity {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  officeHours: string;
  role: string;
  status: string;
  joinedAt: string;
}

interface FacultyRosterTabProps {
  collegeId?: string;
  collegeName?: string;
}

export default function FacultyRosterTab({
  collegeId,
  collegeName = 'Academic Department',
}: FacultyRosterTabProps) {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [facultyMembers, setFacultyMembers] = useState<FacultyMemberEntity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const borderColor = '#E2E8F0';
  const requestSeqRef = React.useRef(0);

  const loadFaculty = useCallback(async () => {
    if (!collegeId) {
      setFacultyMembers([]);
      setLoading(false);
      return;
    }

    const currentSeq = ++requestSeqRef.current;
    setLoading(true);
    try {
      const [membersData, usersData] = await Promise.all([
        apiService.getCollegeMembers(collegeId).catch(() => []),
        apiService.getUsers({ limit: 100, role: 'FACULTY' }).catch(() => null),
      ]);

      if (currentSeq !== requestSeqRef.current) return;

      const memberMap = new Map<string, FacultyMemberEntity>();

      if (Array.isArray(membersData)) {
        for (const m of membersData) {
          if (m.user && (m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN')) {
            const u = m.user;
            const joinedAt = m.createdAt
              ? new Date(m.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
              : u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
              : 'Not provided';

            memberMap.set(u.id, {
              id: u.id,
              name: u.name || 'Not provided',
              email: u.email || 'Not provided',
              department: u.department || 'Not provided',
              specialization: u.specialization || 'Not provided',
              officeHours: u.officeHours || 'Not provided',
              role: m.role || u.globalRole || 'FACULTY',
              status: u.status || 'ACTIVE',
              joinedAt,
            });
          }
        }
      }

      if (usersData?.items && Array.isArray(usersData.items)) {
        for (const u of usersData.items) {
          const hasCollegeMembership =
            u.memberships && u.memberships.length > 0
              ? u.memberships.some((m: any) => {
                  const ids = [m.collegeId, m.college?.id, m.institutionId, m.institution?.id].filter(Boolean);
                  if (ids.length > 0) return ids.includes(collegeId);
                  return Boolean(collegeName && (m.institution?.name === collegeName || m.college?.name === collegeName));
                })
              : Boolean(
                  u.institutionId === collegeId ||
                  u.collegeId === collegeId ||
                  (!u.institutionId && !u.collegeId && collegeName && u.institution === collegeName)
                );

          if (hasCollegeMembership && (u.globalRole === 'FACULTY' || u.globalRole === 'INSTITUTION_ADMIN' || (u.globalRole as any) === 'COLLEGE_ADMIN')) {
            if (!memberMap.has(u.id)) {
              const joinedAt = u.createdAt
                ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
                : 'Not provided';

              memberMap.set(u.id, {
                id: u.id,
                name: u.name || 'Not provided',
                email: u.email || 'Not provided',
                department: u.department || 'Not provided',
                specialization: u.specialization || 'Not provided',
                officeHours: u.officeHours || 'Not provided',
                role: u.globalRole || 'FACULTY',
                status: u.status || 'ACTIVE',
                joinedAt,
              });
            }
          }
        }
      }

      if (currentSeq !== requestSeqRef.current) return;
      setFacultyMembers(Array.from(memberMap.values()));
    } catch {
      if (currentSeq === requestSeqRef.current) {
        toast.error('Failed to load institutional faculty roster.', 'Error');
      }
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, [collegeId, collegeName, toast]);

  useEffect(() => {
    if (!collegeId) {
      setFacultyMembers([]);
      setLoading(false);
      return;
    }

    loadFaculty();

    return () => {
      requestSeqRef.current++;
    };
  }, [collegeId, loadFaculty]);

  const departmentList = useMemo(() => {
    const depts = new Set<string>();
    facultyMembers.forEach((f) => {
      if (f.department && f.department !== 'Not provided') depts.add(f.department);
    });
    return Array.from(depts);
  }, [facultyMembers]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return facultyMembers.filter((m) => {
      const matchSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.specialization.toLowerCase().includes(q);

      const matchDept = selectedDept === 'ALL' || m.department === selectedDept;

      return matchSearch && matchDept;
    });
  }, [facultyMembers, searchQuery, selectedDept]);

  const handleExportCsv = () => {
    if (filteredMembers.length === 0) {
      toast.info('No faculty records to export.', 'Export');
      return;
    }

    const headers = ['Faculty Name', 'Email', 'Role', 'Department', 'Specialization', 'Office Hours', 'Status', 'Joined Date'];
    const rows = filteredMembers.map((f) => [
      f.name || 'Not provided',
      f.email || 'Not provided',
      f.role === 'INSTITUTION_ADMIN' || f.role === 'COLLEGE_ADMIN' ? 'Department Head' : 'Faculty Mentor',
      f.department || 'Not provided',
      f.specialization || 'Not provided',
      f.officeHours || 'Not provided',
      f.status || 'Not provided',
      f.joinedAt || 'Not provided',
    ]);

    const csvContent = generateSafeCsv(headers, rows);
    downloadCsvBlob(csvContent, `${collegeName.replace(/\s+/g, '_')}_Faculty_Roster.csv`);
    toast.success('Faculty roster exported successfully.', 'Export Complete');
  };

  const handleCopyEmail = (email: string) => {
    if (!email || email === 'Not provided') return;
    navigator.clipboard.writeText(email);
    toast.info(`Copied ${email} to clipboard.`, 'Copied');
  };

  const renderStatusChip = (status?: string) => {
    const norm = (status || '').toUpperCase();
    if (norm === 'ACTIVE') {
      return (
        <Chip
          size="small"
          label="Active"
          sx={{
            height: 22,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: '#ECFDF5',
            color: '#059669',
          }}
        />
      );
    }
    if (norm === 'INVITED') {
      return (
        <Chip
          size="small"
          label="Invited"
          sx={{
            height: 22,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: '#EFF6FF',
            color: '#2563EB',
          }}
        />
      );
    }
    if (norm === 'INACTIVE') {
      return (
        <Chip
          size="small"
          label="Inactive"
          sx={{
            height: 22,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: '#F1F5F9',
            color: '#64748B',
          }}
        />
      );
    }
    if (norm === 'SUSPENDED') {
      return (
        <Chip
          size="small"
          label="Suspended"
          sx={{
            height: 22,
            fontSize: '0.72rem',
            fontWeight: 700,
            bgcolor: '#FEF2F2',
            color: '#DC2626',
          }}
        />
      );
    }
    return (
      <Chip
        size="small"
        label={status || 'Unknown'}
        sx={{
          height: 22,
          fontSize: '0.72rem',
          fontWeight: 700,
          bgcolor: '#F8FAFC',
          color: '#64748B',
        }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header Toolbar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            <SchoolRoundedIcon sx={{ color: '#2563EB', fontSize: 26 }} />
            Department Faculty & Mentors
          </Typography>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 500, mt: 0.25 }}>
            Manage instructors, curriculum leads, and mentorship assignments across {collegeName}.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={loadFaculty}
            disabled={loading || !collegeId}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#334155',
              borderColor: borderColor,
              borderRadius: '10px',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            onClick={handleExportCsv}
            disabled={filteredMembers.length === 0}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#334155',
              borderColor: borderColor,
              borderRadius: '10px',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            Export Roster
          </Button>

          <Button
            variant="contained"
            onClick={() => setInviteModalOpen(true)}
            disabled={!collegeId}
            startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' },
              borderRadius: '10px',
              px: 2.5,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            Invite Faculty
          </Button>
        </Box>
      </Box>

      {/* 2. Structured List Table Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '18px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        {/* Filter Controls Header */}
        <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderColor}`, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search faculty name, email, or specialization..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            sx={{ flex: 1, minWidth: 260 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {departmentList.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDept}
                label="Department"
                onChange={(e) => {
                  setSelectedDept(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                {departmentList.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Chip
            label={`${filteredMembers.length} Total Instructors`}
            sx={{ fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', height: 32 }}
          />
        </Box>

        {/* Structured List Table */}
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', py: 1.75 }}>
                  Faculty Mentor
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', py: 1.75 }}>
                  Role & Department
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', py: 1.75 }}>
                  Specialization & Research
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', py: 1.75 }}>
                  Office Hours
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', py: 1.75 }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.78rem', color: '#64748B', textTransform: 'uppercase', py: 1.75 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB', mb: 1.5 }} />
                    <Typography sx={{ fontSize: '0.88rem', color: '#64748B', fontWeight: 500 }}>
                      Loading institutional faculty directory...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <SchoolRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.98rem', fontWeight: 700, color: '#1E293B' }}>
                      No faculty members found
                    </Typography>
                    <Typography sx={{ fontSize: '0.84rem', color: '#64748B', maxWidth: 380, mx: 'auto', mt: 0.5 }}>
                      {searchQuery
                        ? 'No faculty matched your filter query. Try refining your search terms.'
                        : 'Invite your academic department instructors and faculty mentors to get started.'}
                    </Typography>
                    {!searchQuery && (
                      <Button
                        variant="contained"
                        onClick={() => setInviteModalOpen(true)}
                        disabled={!collegeId}
                        startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                          mt: 2.5,
                          textTransform: 'none',
                          fontWeight: 700,
                          bgcolor: '#2563EB',
                          borderRadius: '10px',
                        }}
                      >
                        Invite First Faculty Mentor
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((faculty) => {
                    const initials = (faculty.name || 'FM')
                      .split(' ')
                      .map((n) => n[0])
                      .filter(Boolean)
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || 'FM';

                    const isDeptHead = faculty.role === 'INSTITUTION_ADMIN' || faculty.role === 'COLLEGE_ADMIN';

                    return (
                      <TableRow
                        key={faculty.id}
                        hover
                        sx={{
                          '&:hover': { bgcolor: '#F8FAFC' },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* 1. Faculty Mentor */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: isDeptHead ? '#1E3A8A' : '#EFF6FF',
                                color: isDeptHead ? '#FFFFFF' : '#2563EB',
                                fontSize: '0.88rem',
                                fontWeight: 800,
                              }}
                            >
                              {initials}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', color: '#0F172A' }}>
                                {faculty.name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                {faculty.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* 2. Role & Department */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-start' }}>
                            <Chip
                              size="small"
                              icon={isDeptHead ? <VerifiedUserRoundedIcon sx={{ fontSize: 14 }} /> : undefined}
                              label={isDeptHead ? 'Department Head' : 'Faculty Mentor'}
                              sx={{
                                height: 22,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                bgcolor: isDeptHead ? '#EFF6FF' : '#F1F5F9',
                                color: isDeptHead ? '#2563EB' : '#475569',
                              }}
                            />
                            <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>
                              {faculty.department}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* 3. Specialization */}
                        <TableCell sx={{ py: 2, maxWidth: 280 }}>
                          <Typography
                            sx={{
                              fontSize: '0.84rem',
                              color: '#334155',
                              fontWeight: 500,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {faculty.specialization}
                          </Typography>
                        </TableCell>

                        {/* 4. Office Hours */}
                        <TableCell sx={{ py: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#64748B' }}>
                            <AccessTimeRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '0.82rem', color: '#475569', fontWeight: 500 }}>
                              {faculty.officeHours}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* 5. Status */}
                        <TableCell sx={{ py: 2 }}>
                          {renderStatusChip(faculty.status)}
                        </TableCell>

                        {/* 6. Actions */}
                        <TableCell align="right" sx={{ py: 2 }}>
                          {faculty.email && faculty.email !== 'Not provided' && (
                            <Tooltip title="Copy Email">
                              <IconButton
                                size="small"
                                onClick={() => handleCopyEmail(faculty.email)}
                                sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                              >
                                <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMembers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: `1px solid ${borderColor}` }}
        />
      </Card>

      {/* 3. Invite Faculty Modal */}
      <FacultyInviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        collegeId={collegeId}
        collegeName={collegeName}
        onSuccess={loadFaculty}
      />
    </Box>
  );
}
