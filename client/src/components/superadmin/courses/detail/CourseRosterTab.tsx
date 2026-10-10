'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import { EnrolledStudent } from './types';
import { useToast } from '@/context/ToastContext';

interface CourseRosterTabProps {
  students: EnrolledStudent[];
  rosterSearch: string;
  onRosterSearchChange: (search: string) => void;
  rosterStatusFilter: string;
  onRosterStatusFilterChange: (status: string) => void;
}

export default function CourseRosterTab({
  students,
  rosterSearch,
  onRosterSearchChange,
  rosterStatusFilter,
  onRosterStatusFilterChange,
}: CourseRosterTabProps) {
  const toast = useToast();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        s.handle.toLowerCase().includes(rosterSearch.toLowerCase()) ||
        s.institution.toLowerCase().includes(rosterSearch.toLowerCase());
      const matchStatus = rosterStatusFilter === 'ALL' || s.status === rosterStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [students, rosterSearch, rosterStatusFilter]);

  const totalEntries = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedStudents = filteredStudents.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleExportCSV = () => {
    const csvEscape = (val: string | number) => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };
    const headers = ['Student ID', 'Name', 'Handle', 'Institution', 'Enrolled Date', 'Progress %', 'Completed Lessons', 'Quiz Score %', 'Last Active', 'Status'];
    const rows = filteredStudents.map((s) => [
      csvEscape(s.id),
      csvEscape(s.name),
      csvEscape(s.handle),
      csvEscape(s.institution),
      csvEscape(s.enrolledDate),
      csvEscape(s.progressPct),
      csvEscape(s.completedLessons),
      csvEscape(s.quizScorePct),
      csvEscape(s.lastActive),
      csvEscape(s.status),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `course_roster_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${filteredStudents.length} student records to CSV.`, 'Roster Export Ready');
  };

  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Enrolled Student Roster & Learning Metrics
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Live performance tracking, curriculum completion rates, and quiz assessment diagnostics.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by student name, handle, college..."
            size="small"
            value={rosterSearch}
            onChange={(e) => {
              onRosterSearchChange(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
          />

          <Select
            size="small"
            value={rosterStatusFilter}
            onChange={(e) => {
              onRosterStatusFilterChange(e.target.value);
              setPage(0);
            }}
            sx={{
              height: 36,
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '9999px',
              bgcolor: '#F8FAFC',
              minWidth: 140,
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
            <MenuItem value="In Progress" sx={{ fontSize: '0.8rem' }}>In Progress</MenuItem>
            <MenuItem value="Completed" sx={{ fontSize: '0.8rem' }}>Completed</MenuItem>
            <MenuItem value="Inactive" sx={{ fontSize: '0.8rem' }}>Inactive</MenuItem>
          </Select>

          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleExportCSV}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#CBD5E1',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Roster Table (Rule 10 List Table Format) */}
      <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>STUDENT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>INSTITUTION</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ENROLLED</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>PROGRESS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>QUIZ ACCURACY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>LAST ACTIVE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
                  No students found matching current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((s) => (
                <TableRow key={s.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#FAF5FF', color: '#0B1F3A', fontWeight: 700 }}>
                        {s.name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                          {s.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                          {s.handle}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.84rem' }}>
                    {s.institution}
                  </TableCell>
                  <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                    {s.enrolledDate}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 140 }}>
                      <LinearProgress
                        variant="determinate"
                        value={s.progressPct}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#E2E8F0',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: s.progressPct === 100 ? '#10B981' : '#0B1F3A',
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A', minWidth: 32 }}>
                        {s.progressPct}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: s.quizScorePct >= 80 ? '#16A34A' : '#D97706', fontSize: '0.85rem' }}>
                    {s.quizScorePct}%
                  </TableCell>
                  <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                    {s.lastActive}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status}
                      size="small"
                      sx={{
                        bgcolor: s.status === 'Completed' ? '#ECFDF5' : s.status === 'In Progress' ? '#FAF5FF' : '#F1F5F9',
                        color: s.status === 'Completed' ? '#059669' : s.status === 'In Progress' ? '#0B1F3A' : '#64748B',
                        border: `1px solid ${s.status === 'Completed' ? '#A7F3D0' : s.status === 'In Progress' ? '#E9D5FF' : '#E2E8F0'}`,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
          Showing <strong>{startEntry}</strong> to <strong>{endEntry}</strong> of <strong>{totalEntries}</strong> students
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            disabled={currentPage === 0}
            onClick={() => setPage(0)}
            sx={{ border: '1px solid #E2E8F0', borderRadius: '9999px' }}
          >
            <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            disabled={currentPage === 0}
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            sx={{ border: '1px solid #E2E8F0', borderRadius: '9999px' }}
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', px: 1 }}>
            Page {currentPage + 1} of {totalPages}
          </Typography>
          <IconButton
            size="small"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            sx={{ border: '1px solid #E2E8F0', borderRadius: '9999px' }}
          >
            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
            sx={{ border: '1px solid #E2E8F0', borderRadius: '9999px' }}
          >
            <LastPageRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
