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
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.25)', bgcolor: '#0F172A', p: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1.05rem' }}>
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
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#60A5FA' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              width: 240,
              '& .MuiOutlinedInput-root': {
                borderRadius: '9999px',
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                color: '#F8FAFC',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                fontSize: '0.84rem',
                '& fieldset': { border: 'none' },
                '&:hover': { borderColor: '#60A5FA' },
              },
            }}
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
              color: '#93C5FD',
              borderColor: 'rgba(59, 130, 246, 0.35)',
              bgcolor: 'rgba(30, 41, 59, 0.6)',
              '&:hover': { bgcolor: 'rgba(37, 99, 235, 0.15)', borderColor: '#60A5FA' },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', py: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }}>PROBLEM</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>DIFFICULTY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>VERDICT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>LANGUAGE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>RUNTIME & RAM</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>SUBMITTED AT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', textAlign: 'right', borderColor: 'rgba(255, 255, 255, 0.08)' }}>INSPECT</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#E2E8F0' }}>
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
                  <TableRow key={sub.id} hover sx={{ '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.5) !important' }, '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      <Typography sx={{ fontWeight: 700, color: '#F8FAFC', fontSize: '0.88rem' }}>
                        {sub.problemTitle}
                      </Typography>
                      <Typography sx={{ fontSize: '0.76rem', color: '#60A5FA', fontFamily: 'monospace' }}>
                        {sub.problemCode}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      <Chip
                        label={sub.difficulty}
                        size="small"
                        sx={{
                          bgcolor: sub.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.2)' : sub.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                          color: sub.difficulty === 'Easy' ? '#34D399' : sub.difficulty === 'Medium' ? '#FCD34D' : '#FDA4AF',
                          border: `1px solid ${sub.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.35)' : sub.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      <Chip
                        label={sub.verdict}
                        size="small"
                        sx={{
                          bgcolor: isAcc ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: isAcc ? '#4ADE80' : '#F87171',
                          border: `1px solid ${isAcc ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#E2E8F0', fontSize: '0.85rem', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      {sub.language}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      <strong style={{ color: '#F8FAFC' }}>{sub.runtimeMs} ms</strong> • {(sub.memoryKb / 1024).toFixed(1)} MB
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.82rem', color: '#94A3B8', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      {sub.submittedAt}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                      <Button
                        variant="text"
                        size="small"
                        startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => onViewCode(sub)}
                        sx={{ textTransform: 'none', fontWeight: 700, color: '#38BDF8', '&:hover': { color: '#60A5FA' } }}
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
