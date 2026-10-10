'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import { StudentSubmissionItem } from './types';
import PaginationToolbar from './PaginationToolbar';

interface StudentSubmissionsTabProps {
  submissions: StudentSubmissionItem[];
  onViewCode: (sub: StudentSubmissionItem) => void;
}

export default function StudentSubmissionsTab({
  submissions,
  onViewCode,
}: StudentSubmissionsTabProps) {
  const [subSearch, setSubSearch] = useState('');
  const [subVerdictFilter, setSubVerdictFilter] = useState('ALL');
  const [subPage, setSubPage] = useState<number>(0);
  const [subRowsPerPage, setSubRowsPerPage] = useState<number>(10);
  const borderColor = '#E2E8F0';

  const filteredSubmissions = submissions.filter((s) => {
    if (subVerdictFilter !== 'ALL' && s.verdict !== subVerdictFilter) return false;
    if (
      subSearch &&
      !s.problemTitle.toLowerCase().includes(subSearch.toLowerCase()) &&
      !s.problemCode.toLowerCase().includes(subSearch.toLowerCase()) &&
      !s.language.toLowerCase().includes(subSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const paginatedSubmissions = filteredSubmissions.slice(
    subPage * subRowsPerPage,
    subPage * subRowsPerPage + subRowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Filter bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search submissions by problem title, code, language..."
            value={subSearch}
            onChange={(e) => {
              setSubSearch(e.target.value);
              setSubPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: { xs: '100%', sm: 300 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: '#F8FAFC',
                fontSize: '0.84rem',
                height: 36,
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />

          <Select
            size="small"
            value={subVerdictFilter}
            onChange={(e) => {
              setSubVerdictFilter(e.target.value);
              setSubPage(0);
            }}
            sx={{
              height: 36,
              fontSize: '0.8rem',
              fontWeight: 600,
              bgcolor: '#F8FAFC',
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
            }}
          >
            <MenuItem value="ALL">All Verdicts</MenuItem>
            <MenuItem value="Accepted">Accepted</MenuItem>
            <MenuItem value="Wrong Answer">Wrong Answer</MenuItem>
            <MenuItem value="Time Limit Exceeded">Time Limit Exceeded</MenuItem>
            <MenuItem value="Runtime Error">Runtime Error</MenuItem>
          </Select>
        </Box>

        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A' }}>{filteredSubmissions.length}</strong> submissions
        </Typography>
      </Card>

      {/* Submissions Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>PROBLEM</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>DIFFICULTY</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LANGUAGE</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>VERDICT</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>RUNTIME</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>MEMORY</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SUBMITTED TIME</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((sub) => (
                  <TableRow key={sub.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                    <TableCell sx={{ pl: 3, py: 1.6 }}>
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                        {sub.problemTitle}
                      </Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {sub.problemCode}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.6 }}>
                      <Chip
                        label={sub.difficulty}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          bgcolor:
                            sub.difficulty === 'Easy'
                              ? '#ECFDF5'
                              : sub.difficulty === 'Medium'
                              ? '#FAF5FF'
                              : '#FEF2F2',
                          color:
                            sub.difficulty === 'Easy'
                              ? '#059669'
                              : sub.difficulty === 'Medium'
                              ? '#0B1F3A'
                              : '#DC2626',
                          borderRadius: '5px',
                        }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.6 }}>
                      <Chip
                        label={sub.language}
                        size="small"
                        sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '5px' }}
                      />
                    </TableCell>

                    <TableCell sx={{ py: 1.6 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {sub.verdict === 'Accepted' ? (
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
                        ) : (
                          <CancelRoundedIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                        )}
                        <Typography
                          sx={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: sub.verdict === 'Accepted' ? '#16A34A' : '#EF4444',
                          }}
                        >
                          {sub.verdict}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.6, fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                      {sub.runtimeMs} ms
                    </TableCell>

                    <TableCell sx={{ py: 1.6, fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                      {sub.memoryKb} KB
                    </TableCell>

                    <TableCell sx={{ py: 1.6, fontSize: '0.76rem', color: '#64748B' }}>
                      {sub.submittedAt}
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3, py: 1.6 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onViewCode(sub)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.74rem',
                          color: '#0B1F3A',
                          borderColor: '#E9D5FF',
                          bgcolor: '#FAF5FF',
                          borderRadius: '6px',
                          px: 1.25,
                          py: 0.35,
                          '&:hover': { bgcolor: '#E9D5FF', borderColor: '#C084FC' },
                        }}
                      >
                        View Code
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Submissions Pagination */}
      <PaginationToolbar
        totalEntries={filteredSubmissions.length}
        currentPage={subPage}
        rowsPerPage={subRowsPerPage}
        onPageChange={setSubPage}
        onRowsPerPageChange={setSubRowsPerPage}
        itemLabel="submissions"
        rowsOptions={[5, 10, 25, 50]}
      />
    </Box>
  );
}
