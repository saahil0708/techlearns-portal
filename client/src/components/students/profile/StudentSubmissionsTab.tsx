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
  TablePagination,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

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

// Circular Progress Gauge for Top Stats
function CircularMetricGauge({
  percentage,
  size = 46,
  strokeWidth = 4,
  color = '#2563EB',
  label,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percentage)) / 100) * circumference;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#EEF2F6" strokeWidth={strokeWidth} fill="transparent" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', textAlign: 'center' }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.74rem', color: '#0F172A', lineHeight: 1 }}>
          {label ?? `${Math.round(percentage)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function StudentSubmissionsTab({
  submissions,
  studentHandle,
  onViewCode,
}: StudentSubmissionsTabProps) {
  const toast = useToast();
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('ALL');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Derive unique languages
  const availableLanguages = useMemo(() => {
    const langs = new Set<string>();
    submissions.forEach((s) => {
      if (s.language) langs.add(s.language);
    });
    return Array.from(langs);
  }, [submissions]);

  // Aggregate Metrics
  const totalSubmissions = submissions.length;
  const acceptedCount = submissions.filter((s) => s.verdict === 'Accepted').length;
  const wrongAnswerCount = submissions.filter((s) => s.verdict === 'Wrong Answer').length;
  const tleCount = submissions.filter((s) => s.verdict === 'Time Limit Exceeded').length;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

  const avgRuntime = totalSubmissions > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.runtimeMs || 0), 0) / totalSubmissions)
    : 0;

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.problemTitle.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.problemCode.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(submissionSearch.toLowerCase());
      const matchVerdict = selectedVerdict === 'ALL' || s.verdict === selectedVerdict;
      const matchLang = selectedLanguage === 'ALL' || s.language === selectedLanguage;
      return matchSearch && matchVerdict && matchLang;
    });
  }, [submissions, submissionSearch, selectedVerdict, selectedLanguage]);

  const maxPage = Math.max(0, Math.ceil(filteredSubmissions.length / rowsPerPage) - 1);
  const safePage = filteredSubmissions.length === 0 ? 0 : Math.min(Math.max(0, page), maxPage);

  const paginatedSubmissions = useMemo(() => {
    return filteredSubmissions.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  }, [filteredSubmissions, safePage, rowsPerPage]);

  const handleExportSubmissionsCSV = () => {
    const headers = [
      'Submission ID',
      'Problem Code',
      'Problem Title',
      'Difficulty',
      'Verdict',
      'Language',
      'Runtime (ms)',
      'Memory (KB)',
      'Submitted At',
    ];
    const rows = filteredSubmissions.map((s) => [
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

    toast.showToast(`Exported ${filteredSubmissions.length} submissions to CSV.`, 'success');
  };

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'Accepted':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0', icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> };
      case 'Wrong Answer':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA', icon: <CancelRoundedIcon sx={{ fontSize: 14 }} /> };
      case 'Time Limit Exceeded':
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', icon: <TimerRoundedIcon sx={{ fontSize: 14 }} /> };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1', icon: <CodeRoundedIcon sx={{ fontSize: 14 }} /> };
    }
  };

  const getDifficultyStyle = (diff: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy':
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'medium':
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      case 'hard':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* ========================================================================= */}
      {/* 1. TOP STATS CARDS */}
      {/* ========================================================================= */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {/* Card 1: Total Submissions */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Total Submissions</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {totalSubmissions}
            </Typography>
            <Typography sx={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 700 }}>
              {filteredSubmissions.length} shown
            </Typography>
          </Box>
          <CircularMetricGauge percentage={100} size={48} strokeWidth={4.5} color="#2563EB" label={`${totalSubmissions}`} />
        </Card>

        {/* Card 2: Acceptance Rate */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Acceptance Rate</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {acceptanceRate}%
            </Typography>
            <Typography sx={{ color: '#059669', fontSize: '0.7rem', fontWeight: 700 }}>
              {acceptedCount} accepted
            </Typography>
          </Box>
          <CircularMetricGauge percentage={acceptanceRate} size={48} strokeWidth={4.5} color="#10B981" />
        </Card>

        {/* Card 3: Avg Runtime */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Avg Runtime</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {avgRuntime} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>ms</span>
            </Typography>
            <Typography sx={{ color: '#0284C7', fontSize: '0.7rem', fontWeight: 700 }}>
              Optimized execution
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#F0F9FF', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <SpeedRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>

        {/* Card 4: Error Breakdown */}
        <Card
          elevation={0}
          sx={{
            p: 2.2,
            borderRadius: '16px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700 }}>Failed Attempts</Typography>
            <Typography sx={{ color: '#0F172A', fontSize: '1.45rem', fontWeight: 900, mt: 0.3 }}>
              {wrongAnswerCount + tleCount}
            </Typography>
            <Typography sx={{ color: '#DC2626', fontSize: '0.7rem', fontWeight: 700 }}>
              {wrongAnswerCount} WA • {tleCount} TLE
            </Typography>
          </Box>
          <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: '#FEF2F2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MemoryRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
        </Card>
      </Box>

      {/* ========================================================================= */}
      {/* 2. MAIN SUBMISSIONS TABLE CARD */}
      {/* ========================================================================= */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header & Controls */}
        <Box sx={{ p: 2.5, borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                Submissions History Log
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.76rem' }}>
                Complete log of submitted algorithms, code solutions, verdicts, and runtime diagnostics.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search problem or ID..."
                size="small"
                value={submissionSearch}
                onChange={(e) => {
                  setSubmissionSearch(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ fontSize: 17, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  width: { xs: '100%', sm: 220 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  },
                }}
              />

              {/* Language filter */}
              {availableLanguages.length > 0 && (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <Select
                    value={selectedLanguage}
                    onChange={(e) => {
                      setSelectedLanguage(e.target.value);
                      setPage(0);
                    }}
                    sx={{ borderRadius: '8px', bgcolor: '#F8FAFC', fontSize: '0.82rem', fontWeight: 700 }}
                  >
                    <MenuItem value="ALL">All Languages</MenuItem>
                    {availableLanguages.map((lang) => (
                      <MenuItem key={lang} value={lang}>
                        {lang}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={handleExportSubmissionsCSV}
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 800,
                  color: '#2563EB',
                  borderColor: '#BFDBFE',
                  bgcolor: '#EFF6FF',
                  fontSize: '0.78rem',
                  px: 1.5,
                  py: 0.6,
                  '&:hover': { bgcolor: '#DBEAFE', borderColor: '#2563EB' },
                }}
              >
                Export CSV
              </Button>
            </Box>
          </Box>

          {/* Verdict Filter Chips */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontSize: '0.74rem', fontWeight: 700, mr: 0.5 }}>
              Filter:
            </Typography>
            {[
              { id: 'ALL', label: 'All', count: totalSubmissions },
              { id: 'Accepted', label: 'Accepted', count: acceptedCount },
              { id: 'Wrong Answer', label: 'Wrong Answer', count: wrongAnswerCount },
              { id: 'Time Limit Exceeded', label: 'Time Limit', count: tleCount },
            ].map((tab) => {
              const isSelected = selectedVerdict === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={`${tab.label} (${tab.count})`}
                  size="small"
                  onClick={() => {
                    setSelectedVerdict(tab.id);
                    setPage(0);
                  }}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.72rem',
                    bgcolor: isSelected ? '#2563EB' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563EB' : '#E2E8F0',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isSelected ? '#1D4ED8' : '#E2E8F0',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        {/* Structured List Table */}
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', py: 1.2, borderColor: '#E2E8F0' }}>VERDICT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>PROBLEM</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>DIFFICULTY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>LANGUAGE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>RUNTIME & RAM</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', borderColor: '#E2E8F0' }}>SUBMITTED AT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.72rem', textAlign: 'right', borderColor: '#E2E8F0' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: 'center', borderColor: '#F1F5F9' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
                      No submissions found
                    </Typography>
                    <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.5 }}>
                      No submissions match your active filter criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSubmissions.map((sub) => {
                  const verdStyle = getVerdictStyle(sub.verdict);
                  const diffStyle = getDifficultyStyle(sub.difficulty);

                  return (
                    <TableRow
                      key={sub.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#F8FAFC !important' },
                        '&:last-child td': { borderBottom: 0 },
                      }}
                    >
                      {/* Verdict Pill */}
                      <TableCell sx={{ borderColor: '#F1F5F9', py: 1.4 }}>
                        <Chip
                          icon={verdStyle.icon}
                          label={sub.verdict}
                          size="small"
                          sx={{
                            bgcolor: verdStyle.bg,
                            color: verdStyle.color,
                            border: `1px solid ${verdStyle.border}`,
                            fontWeight: 800,
                            fontSize: '0.72rem',
                            height: 24,
                            '& .MuiChip-icon': { color: `${verdStyle.color} !important` },
                          }}
                        />
                      </TableCell>

                      {/* Problem Title & Code */}
                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.86rem' }}>
                          {sub.problemTitle}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontFamily: 'monospace', fontWeight: 700 }}>
                          {sub.problemCode}
                        </Typography>
                      </TableCell>

                      {/* Difficulty */}
                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Chip
                          label={sub.difficulty}
                          size="small"
                          sx={{
                            bgcolor: diffStyle.bg,
                            color: diffStyle.color,
                            border: `1px solid ${diffStyle.border}`,
                            fontWeight: 800,
                            fontSize: '0.68rem',
                            height: 20,
                          }}
                        />
                      </TableCell>

                      {/* Language */}
                      <TableCell sx={{ borderColor: '#F1F5F9' }}>
                        <Chip
                          label={sub.language}
                          size="small"
                          sx={{
                            bgcolor: '#F1F5F9',
                            color: '#334155',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            height: 22,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      {/* Runtime & Memory */}
                      <TableCell sx={{ fontSize: '0.8rem', color: '#64748B', borderColor: '#F1F5F9' }}>
                        <strong style={{ color: '#0F172A' }}>{sub.runtimeMs} ms</strong> • {(sub.memoryKb / 1024).toFixed(1)} MB
                      </TableCell>

                      {/* Submitted Date */}
                      <TableCell sx={{ fontSize: '0.78rem', color: '#64748B', borderColor: '#F1F5F9' }}>
                        {sub.submittedAt}
                      </TableCell>

                      {/* Action */}
                      <TableCell sx={{ textAlign: 'right', borderColor: '#F1F5F9' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<VisibilityRoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => onViewCode(sub)}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            color: '#2563EB',
                            borderColor: '#BFDBFE',
                            bgcolor: '#EFF6FF',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            px: 1.2,
                            py: 0.3,
                            '&:hover': { bgcolor: '#DBEAFE', borderColor: '#2563EB' },
                          }}
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

        {/* Pagination */}
        {filteredSubmissions.length > 0 && (
          <TablePagination
            component="div"
            count={filteredSubmissions.length}
            page={safePage}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              fontSize: '0.78rem',
            }}
          />
        )}
      </Card>
    </Box>
  );
}
