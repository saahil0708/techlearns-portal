'use client';

import React, { useState, useMemo } from 'react';
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
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { StudentSubmission } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

interface StudentSubmissionsTabProps {
  submissions: StudentSubmission[];
  studentHandle: string;
  onViewCode: (sub: StudentSubmission) => void;
}

function sanitizeCsvField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  if (typeof value === 'number') return String(value);

  let str = String(value);
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export default function StudentSubmissionsTab({
  submissions,
  studentHandle,
  onViewCode,
}: StudentSubmissionsTabProps) {
  const toast = useToast();
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('ALL');

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.problemTitle.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.problemCode.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(submissionSearch.toLowerCase());
      const matchVerdict = selectedVerdict === 'ALL' || s.verdict === selectedVerdict;
      return matchSearch && matchVerdict;
    });
  }, [submissions, submissionSearch, selectedVerdict]);

  const handleExportSubmissionsCSV = () => {
    const headers = ['Submission ID', 'Problem Code', 'Problem Title', 'Difficulty', 'Verdict', 'Language', 'Runtime (ms)', 'Memory (KB)', 'Submitted At'];
    const rows = submissions.map((s) => [
      sanitizeCsvField(s.id),
      sanitizeCsvField(s.problemCode),
      sanitizeCsvField(s.problemTitle),
      sanitizeCsvField(s.difficulty),
      sanitizeCsvField(s.verdict),
      sanitizeCsvField(s.language),
      sanitizeCsvField(s.runtimeMs),
      sanitizeCsvField(s.memoryKb),
      sanitizeCsvField(s.submittedAt),
    ]);

    const csvData = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${studentHandle}_submissions_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${submissions.length} submissions to CSV.`, 'CSV Export Ready');
  };

  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
          Personal Submissions & Verdicts Log
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search submissions..."
            size="small"
            value={submissionSearch}
            onChange={(e) => setSubmissionSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleExportSubmissionsCSV}
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

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>PROBLEM</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DIFFICULTY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>VERDICT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>LANGUAGE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>RUNTIME & RAM</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SUBMITTED AT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>INSPECT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#475569' }}>
                    No submissions found
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', mt: 0.5 }}>
                    Solve problems in the practice portal or contests to record submissions.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSubmissions.map((sub) => {
                const isAcc = sub.verdict === 'Accepted';
                return (
                  <TableRow key={sub.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                        {sub.problemTitle}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {sub.problemCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.difficulty}
                        size="small"
                        sx={{
                          bgcolor: sub.difficulty === 'Easy' ? '#F0FDF4' : sub.difficulty === 'Medium' ? '#FFFBEB' : '#FEF2F2',
                          color: sub.difficulty === 'Easy' ? '#16A34A' : sub.difficulty === 'Medium' ? '#D97706' : '#DC2626',
                          border: `1px solid ${sub.difficulty === 'Easy' ? '#BBF7D0' : sub.difficulty === 'Medium' ? '#FDE68A' : '#FECACA'}`,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.verdict}
                        size="small"
                        sx={{
                          bgcolor: isAcc ? '#F0FDF4' : '#FEF2F2',
                          color: isAcc ? '#16A34A' : '#DC2626',
                          border: `1px solid ${isAcc ? '#BBF7D0' : '#FECACA'}`,
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                      {sub.language}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                      <strong>{sub.runtimeMs} ms</strong> • {(sub.memoryKb / 1024).toFixed(1)} MB
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                      {sub.submittedAt}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => onViewCode(sub)}
                        sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB' }}
                      >
                        View Code
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
