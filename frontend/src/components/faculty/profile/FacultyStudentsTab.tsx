'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  CircularProgress,
  Menu,
  ListItemIcon,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

import FacultyInviteStudentsModal from './FacultyInviteStudentsModal';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';
import YouBadge from '@/components/common/YouBadge';
import { apiService } from '@/lib/api-service';
import { generateSafeCsv, downloadCsvBlob, escapeHtml } from '@/utils/csv';
import type { FacultyBatchItem } from '@/data';

export interface CollegeStudentEntity {
  id: string;
  name: string;
  email: string;
  rollNo: string;
  batchId?: string;
  batchName: string;
  contestRating: number;
  ratingTier: string;
  status: string;
  createdAt?: string;
  avatarColor: string;
}

interface FacultyStudentsTabProps {
  collegeId?: string;
  collegeName: string;
  batches: FacultyBatchItem[];
  onRosterUpdated?: () => void;
}

export default function FacultyStudentsTab({
  collegeId,
  collegeName,
  batches,
  onRosterUpdated,
}: FacultyStudentsTabProps) {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [students, setStudents] = useState<CollegeStudentEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal States
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<CollegeStudentEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [studentToReassign, setStudentToReassign] = useState<CollegeStudentEntity | null>(null);
  const [targetBatchId, setTargetBatchId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  const borderColor = '#E2E8F0';

  const avatarColors = ['#2563EB', '#3B82F6', '#10B981', '#7C3AED', '#DC2626', '#0284C7', '#059669'];

  const loadCollegeStudents = useCallback(async () => {
    if (!collegeId) return;
    setLoading(true);
    try {
      // 1. Fetch college members via REST or GraphQL
      const [membersData, usersData] = await Promise.all([
        apiService.getCollegeMembers(collegeId).catch(() => []),
        apiService.getUsers({ limit: 100, role: 'STUDENT' }).catch(() => null),
      ]);

      const memberUserMap = new Map<string, any>();

      if (Array.isArray(membersData)) {
        for (const m of membersData) {
          if (m.user && (m.role === 'STUDENT' || !m.role)) {
            memberUserMap.set(m.userId || m.user.id, {
              ...m.user,
              membershipRole: m.role,
              createdAt: m.createdAt || m.user.createdAt,
            });
          }
        }
      }

      // If GraphQL users items has students belonging to this college
      if (usersData?.items && Array.isArray(usersData.items)) {
        for (const u of usersData.items) {
          const hasCollegeMembership =
            u.memberships && u.memberships.length > 0
              ? u.memberships.some((m: any) => {
                  const ids = [m.collegeId, m.college?.id, m.institutionId, m.institution?.id].filter(Boolean);
                  if (ids.length > 0) {
                    return ids.includes(collegeId);
                  }
                  return Boolean(collegeName && (m.institution?.name === collegeName || m.college?.name === collegeName));
                })
              : Boolean(
                  u.institutionId === collegeId ||
                  u.collegeId === collegeId ||
                  (!u.institutionId && !u.collegeId && collegeName && u.institution === collegeName)
                );
          if (hasCollegeMembership && (u.globalRole === 'STUDENT' || !u.globalRole)) {
            memberUserMap.set(u.id, {
              ...(memberUserMap.get(u.id) || {}),
              ...u,
            });
          }
        }
      }

      // Also map batch students if available
      const batchMap = new Map(batches.map((b) => [b.id, b.name]));

      const mappedList: CollegeStudentEntity[] = Array.from(memberUserMap.values()).map(
        (u: any, idx: number) => {
          const batchEnrollment = Array.isArray(u.batchEnrollments)
            ? u.batchEnrollments.find((be: any) => batchMap.has(be.batchId) || be.batch?.name)
            : null;

          const batchId = batchEnrollment?.batchId || batchEnrollment?.batch?.id;
          const batchName = batchEnrollment?.batch?.name || (batchId ? batchMap.get(batchId) : undefined) || 'Unassigned Cohort';
          const rollNo = u.rollNo || batchEnrollment?.rollNo || u.studentId || '—';

          return {
            id: u.id,
            name: u.name || 'Student Coder',
            email: u.email || '',
            rollNo,
            batchId,
            batchName,
            contestRating: u.contestRating ?? 1200,
            ratingTier: u.ratingTier || 'Novice',
            status: u.status === 'ACTIVE' || !u.status ? 'Active' : u.status,
            createdAt: u.createdAt,
            avatarColor: avatarColors[idx % avatarColors.length],
          };
        }
      );

      setStudents(mappedList);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load college students roster.', 'Error');
    } finally {
      setLoading(false);
    }
  }, [collegeId, batches, toast]);

  useEffect(() => {
    loadCollegeStudents();
  }, [loadCollegeStudents]);

  // Filter & Search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (selectedBatchFilter !== 'ALL') {
        if (selectedBatchFilter === 'UNASSIGNED') {
          if (s.batchId) return false;
        } else if (s.batchId !== selectedBatchFilter) {
          return false;
        }
      }
      if (selectedStatusFilter !== 'ALL') {
        if (s.status.toUpperCase() !== selectedStatusFilter.toUpperCase()) return false;
      }
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q) ||
        s.batchName.toLowerCase().includes(q)
      );
    });
  }, [students, search, selectedBatchFilter, selectedStatusFilter]);

  // Remove Student from College Handler
  const handleConfirmDeleteStudent = async () => {
    if (!collegeId || !studentToDelete) return;
    setIsDeleting(true);
    try {
      await apiService.removeCollegeMember(collegeId, studentToDelete.id);
      toast.success(
        `Student "${studentToDelete.name}" (${studentToDelete.rollNo}) has been removed from ${collegeName}.`,
        'Student Removed'
      );
      setStudentToDelete(null);
      await loadCollegeStudents();
      onRosterUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove student from college.', 'Removal Error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Reassign / Assign Batch Handler
  const handleConfirmReassignBatch = async () => {
    if (!studentToReassign || !targetBatchId) return;
    setIsReassigning(true);
    try {
      await apiService.assignStudentsToBatch(targetBatchId, [studentToReassign.id]);
      const targetBatchObj = batches.find((b) => b.id === targetBatchId);
      toast.success(
        `Assigned ${studentToReassign.name} to cohort "${targetBatchObj?.name || 'Cohort'}".`,
        'Cohort Updated'
      );
      setStudentToReassign(null);
      setTargetBatchId('');
      await loadCollegeStudents();
      onRosterUpdated?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reassign student cohort.', 'Assignment Error');
    } finally {
      setIsReassigning(false);
    }
  };

  // Export handlers
  const handleExportCSV = () => {
    setExportMenuAnchor(null);
    if (students.length === 0) {
      toast.info('No student records to export.', 'Empty Roster');
      return;
    }
    const headers = ['Student ID / Roll No', 'Full Name', 'Email', 'Assigned Cohort', 'Rating', 'Tier', 'Status'];
    const rows = filteredStudents.map((s) => [
      s.rollNo,
      s.name,
      s.email,
      s.batchName,
      s.contestRating,
      s.ratingTier,
      s.status,
    ]);
    const csvData = generateSafeCsv(headers, rows);
    downloadCsvBlob(`${collegeName.replace(/\s+/g, '_')}_students_roster.csv`, csvData);
    toast.success(`Exported ${filteredStudents.length} student records to CSV!`, 'Export Complete');
  };

  const handleExportExcel = () => {
    setExportMenuAnchor(null);
    if (students.length === 0) {
      toast.info('No student records to export.', 'Empty Roster');
      return;
    }
    const headers = ['Student ID / Roll No', 'Full Name', 'Email', 'Assigned Cohort', 'Rating', 'Tier', 'Status'];
    let table = '<table border="1"><tr>' + headers.map((k) => `<th>${escapeHtml(k)}</th>`).join('') + '</tr>';
    filteredStudents.forEach((s) => {
      table += `<tr><td>${escapeHtml(s.rollNo)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.email)}</td><td>${escapeHtml(s.batchName)}</td><td>${escapeHtml(s.contestRating)}</td><td>${escapeHtml(s.ratingTier)}</td><td>${escapeHtml(s.status)}</td></tr>`;
    });
    table += '</table>';
    const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collegeName.replace(/\s+/g, '_')}_students_roster_${Date.now()}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredStudents.length} student records to Excel!`, 'Export Complete');
  };

  const isFilterActive = search || selectedBatchFilter !== 'ALL' || selectedStatusFilter !== 'ALL';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.01em' }}>
              College Student Roster
            </Typography>
            <Chip
              label={`${students.length} Total Enrolled`}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.74rem',
                borderRadius: '9999px',
                border: '1px solid #BFDBFE',
              }}
            />
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '0.84rem', mt: 0.25 }}>
            Manage collegiate students, update cohort assignments, and remove student accounts for {collegeName}
          </Typography>
        </Box>

        {/* Top Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="Refresh Student Roster">
            <IconButton
              onClick={loadCollegeStudents}
              disabled={loading}
              sx={{
                bgcolor: '#FFFFFF',
                border: `1px solid ${borderColor}`,
                borderRadius: '9999px',
                p: 0.85,
                '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB' },
              }}
            >
              <RefreshRoundedIcon sx={{ fontSize: 19, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </Tooltip>

          {/* Export Menu */}
          <Button
            onClick={(e) => setExportMenuAnchor(e.currentTarget)}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#475569',
              border: `1px solid ${borderColor}`,
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
            }}
          >
            Export Roster
          </Button>

          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
            slotProps={{
              paper: {
                elevation: 4,
                sx: { borderRadius: '14px', border: '1px solid #E2E8F0', mt: 1, minWidth: 200, p: 0.5 },
              },
            }}
          >
            <MenuItem onClick={handleExportExcel} sx={{ borderRadius: '8px', py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download Excel (.xls)
              </Typography>
            </MenuItem>
            <MenuItem onClick={handleExportCSV} sx={{ borderRadius: '8px', py: 1 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download CSV (.csv)
              </Typography>
            </MenuItem>
          </Menu>

          {/* Bulk Invite */}
          <Button
            variant="contained"
            onClick={() => setIsInviteModalOpen(true)}
            startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              px: 2.25,
              py: 0.75,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Invite Students
          </Button>
        </Box>
      </Box>

      {/* Filter & Search Bar */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search by student name, roll number, email, or cohort..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', md: 400 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              bgcolor: '#F8FAFC',
              fontSize: '0.85rem',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#2563EB' },
            },
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
            COHORT:
          </Typography>
          <Select
            size="small"
            value={selectedBatchFilter}
            onChange={(e) => setSelectedBatchFilter(e.target.value)}
            sx={{
              bgcolor: '#F8FAFC',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              height: 34,
              minWidth: 140,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Cohorts ({students.length})</MenuItem>
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.id} sx={{ fontSize: '0.8rem' }}>
                {b.name}
              </MenuItem>
            ))}
            <MenuItem value="UNASSIGNED" sx={{ fontSize: '0.8rem' }}>Unassigned</MenuItem>
          </Select>

          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
            STATUS:
          </Typography>
          <Select
            size="small"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            sx={{
              bgcolor: '#F8FAFC',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              height: 34,
              minWidth: 110,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
            <MenuItem value="ACTIVE" sx={{ fontSize: '0.8rem' }}>Active</MenuItem>
            <MenuItem value="INACTIVE" sx={{ fontSize: '0.8rem' }}>Inactive</MenuItem>
          </Select>

          {isFilterActive && (
            <Button
              size="small"
              onClick={() => {
                setSearch('');
                setSelectedBatchFilter('ALL');
                setSelectedStatusFilter('ALL');
              }}
              startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                borderRadius: '9999px',
                color: '#DC2626',
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'none',
                height: 34,
                px: 1.5,
                '&:hover': { bgcolor: '#FEE2E2' },
              }}
            >
              Reset
            </Button>
          )}
        </Box>
      </Card>

      {/* Structured List Table (Rule 10) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow sx={{ '& th': { borderBottom: `1px solid ${borderColor}`, py: 1.75 } }}>
                <TableCell sx={{ pl: 3, fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                  Student
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                  Roll No / ID
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                  Assigned Cohort
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                  Contest Rating
                </TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                  Status
                </TableCell>
                <TableCell align="right" sx={{ pr: 3, fontWeight: 800, fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={32} sx={{ color: '#2563EB' }} />
                    <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 1.5, fontWeight: 600 }}>
                      Loading students for {collegeName}...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    <SchoolRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                      No Students Found
                    </Typography>
                    <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5, maxWidth: 360, mx: 'auto' }}>
                      {search || isFilterActive
                        ? 'No student matches the specified filter criteria. Try resetting the filters.'
                        : `No students are currently enrolled under ${collegeName}. Use the button below to invite your student roster.`}
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setIsInviteModalOpen(true)}
                      startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 17 }} />}
                      sx={{
                        mt: 2,
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        borderRadius: '9999px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      Invite Students via CSV / Email
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((stu) => {
                  const initials = stu.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();
                  const isCurrentUser = Boolean(
                    currentUser &&
                      (currentUser.id === stu.id ||
                        (currentUser.email && stu.email && currentUser.email.toLowerCase() === stu.email.toLowerCase()))
                  );

                  return (
                    <TableRow key={stu.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9', py: 1.75 }, bgcolor: isCurrentUser ? '#F8FAFC' : 'inherit' }}>
                      {/* Student Info */}
                      <TableCell sx={{ pl: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: '#EFF6FF',
                              color: stu.avatarColor,
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              border: '1px solid #BFDBFE',
                            }}
                          >
                            {initials}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                              <Typography noWrap sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                                {stu.name}
                              </Typography>
                              {isCurrentUser && <YouBadge />}
                            </Box>
                            <Typography noWrap sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                              {stu.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Roll No / Student ID */}
                      <TableCell>
                        <Chip
                          icon={<BadgeRoundedIcon sx={{ fontSize: '14px !important', color: '#2563EB' }} />}
                          label={stu.rollNo}
                          size="small"
                          sx={{
                            bgcolor: '#F8FAFC',
                            color: '#0F172A',
                            border: '1px solid #E2E8F0',
                            fontWeight: 700,
                            fontSize: '0.74rem',
                            fontFamily: 'monospace',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      {/* Assigned Cohort */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: stu.batchId ? '#0F172A' : '#94A3B8' }}>
                            {stu.batchName}
                          </Typography>
                          <Tooltip title="Change or assign student cohort">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setStudentToReassign(stu);
                                setTargetBatchId(stu.batchId || (batches[0]?.id ?? ''));
                              }}
                              sx={{ color: '#94A3B8', p: 0.5, '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                            >
                              <DriveFileRenameOutlineRoundedIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>

                      {/* Contest Rating & Tier */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#2563EB' }}>
                            {stu.contestRating}
                          </Typography>
                          <Chip
                            label={stu.ratingTier}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                              borderRadius: '4px',
                            }}
                          />
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={stu.status}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: stu.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                            color: stu.status === 'Active' ? '#059669' : '#64748B',
                            border: '1px solid',
                            borderColor: stu.status === 'Active' ? '#A7F3D0' : '#E2E8F0',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell align="right" sx={{ pr: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title={`Delete ${stu.name} from ${collegeName}`}>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<PersonRemoveRoundedIcon sx={{ fontSize: 15 }} />}
                              onClick={() => setStudentToDelete(stu)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                py: 0.4,
                                px: 1.25,
                                borderRadius: '8px',
                                borderColor: '#FECACA',
                                color: '#DC2626',
                                bgcolor: '#FEF2F2',
                                '&:hover': { bgcolor: '#FEE2E2', borderColor: '#DC2626' },
                              }}
                            >
                              Delete from College
                            </Button>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Reassign Batch Modal */}
      <Dialog
        open={Boolean(studentToReassign)}
        onClose={() => setStudentToReassign(null)}
        slotProps={{
          paper: { sx: { borderRadius: '20px', p: 1, maxWidth: 440, width: '100%' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
          Assign Student to Cohort
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.86rem', color: '#475569', mb: 2 }}>
            Assign <strong>{studentToReassign?.name}</strong> ({studentToReassign?.rollNo}) to a cohort under {collegeName}:
          </Typography>
          <Select
            fullWidth
            size="small"
            value={targetBatchId}
            onChange={(e) => setTargetBatchId(e.target.value)}
            sx={{
              borderRadius: '10px',
              bgcolor: '#F8FAFC',
              fontSize: '0.86rem',
              fontWeight: 600,
            }}
          >
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name} ({b.code}) — {b.studentsCount}/{b.maxCapacity || 100} Enrolled
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setStudentToReassign(null)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isReassigning || !targetBatchId}
            onClick={handleConfirmReassignBatch}
            sx={{
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {isReassigning ? 'Assigning...' : 'Save Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete / Remove Student from College Confirmation Dialog */}
      <Dialog
        open={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        slotProps={{
          paper: { sx: { borderRadius: '20px', p: 1, maxWidth: 460, width: '100%' } },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonRemoveRoundedIcon sx={{ fontSize: 24, color: '#DC2626' }} />
          Remove Student from College
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
            Are you sure you want to remove <strong>{studentToDelete?.name}</strong> (Roll No: <code>{studentToDelete?.rollNo}</code>) from <strong>{collegeName}</strong>?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: '#FEF2F2', borderRadius: '10px', border: '1px solid #FECACA' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#991B1B', fontWeight: 600 }}>
              This will remove their college membership and unenroll them from all cohorts in {collegeName}. Their individual practice submissions and account will not be lost.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setStudentToDelete(null)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isDeleting}
            onClick={handleConfirmDeleteStudent}
            sx={{
              bgcolor: '#DC2626',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: '8px',
              '&:hover': { bgcolor: '#B91C1C' },
            }}
          >
            {isDeleting ? 'Removing Student...' : 'Confirm Removal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Invite Modal */}
      <FacultyInviteStudentsModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        batches={batches}
        collegeName={collegeName}
        collegeId={collegeId}
        onInviteSuccess={() => {
          loadCollegeStudents();
          onRosterUpdated?.();
        }}
      />
    </Box>
  );
}
