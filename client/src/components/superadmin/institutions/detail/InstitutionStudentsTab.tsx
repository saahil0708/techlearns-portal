'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import { StudentRosterItem, BatchItem } from './types';

interface InstitutionStudentsTabProps {
  students: StudentRosterItem[];
  batches: BatchItem[];
  onOpenEditStudent: (student: StudentRosterItem) => void;
  onOpenAssignBatch: (student: StudentRosterItem) => void;
  onOpenDeleteStudent: (student: StudentRosterItem) => void;
}

export default function InstitutionStudentsTab({
  students,
  batches,
  onOpenEditStudent,
  onOpenAssignBatch,
  onOpenDeleteStudent,
}: InstitutionStudentsTabProps) {
  const [search, setSearch] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(search.toLowerCase());
      const matchBatch = selectedBatch === 'ALL' || s.batch === selectedBatch;
      return matchSearch && matchBatch;
    });
  }, [students, search, selectedBatch]);

  const totalEntries = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedStudents = filteredStudents.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Enrolled Students Roster
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Comprehensive performance diagnostics, solved problems count, and batch roster assignments.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search student, roll no, email..."
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
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
            value={selectedBatch}
            onChange={(e) => {
              setSelectedBatch(e.target.value);
              setPage(0);
            }}
            sx={{
              height: 36,
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '9999px',
              bgcolor: '#F8FAFC',
              minWidth: 160,
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Batches</MenuItem>
            {batches.map((b) => (
              <MenuItem key={b.id} value={b.name} sx={{ fontSize: '0.8rem' }}>
                {b.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Roster Table (Rule 10 List Table Format) */}
      <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>STUDENT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ROLL NO</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>BATCH</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>PROBLEMS SOLVED</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ACCURACY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</TableCell>
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
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }}>
                        {s.name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                          {s.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {s.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', color: '#475569', fontSize: '0.82rem' }}>
                    {s.rollNo}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.batch}
                      size="small"
                      sx={{
                        bgcolor: s.batch === 'Unassigned' ? '#FEF2F2' : '#EFF6FF',
                        color: s.batch === 'Unassigned' ? '#DC2626' : '#2563EB',
                        border: `1px solid ${s.batch === 'Unassigned' ? '#FECACA' : '#DBEAFE'}`,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                    {s.problemsSolved} Solved
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>
                    {s.accuracy}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={s.status}
                      size="small"
                      sx={{
                        bgcolor: s.status === 'Active' ? '#ECFDF5' : s.status === 'At Risk' ? '#FFFBEB' : '#F1F5F9',
                        color: s.status === 'Active' ? '#059669' : s.status === 'At Risk' ? '#D97706' : '#64748B',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Tooltip title="Assign Batch">
                      <IconButton
                        size="small"
                        onClick={() => onOpenAssignBatch(s)}
                        sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                      >
                        <SupervisorAccountRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Student">
                      <IconButton
                        size="small"
                        onClick={() => onOpenEditStudent(s)}
                        sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                      >
                        <EditRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Student">
                      <IconButton
                        size="small"
                        onClick={() => onOpenDeleteStudent(s)}
                        sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
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
