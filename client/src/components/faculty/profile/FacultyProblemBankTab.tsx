'use client';

import React, { useState, useMemo } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import Link from 'next/link';

import FacultyCreateProblemModal from './FacultyCreateProblemModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { generateSafeCsv, downloadCsvBlob } from '@/utils/csv';

interface FacultyProblemBankTabProps {
  problems: any[];
  collegeName: string;
  collegeId?: string;
  onProblemCreated?: (newProblem: any) => void;
}

export default function FacultyProblemBankTab({
  problems,
  collegeName,
  collegeId,
  onProblemCreated,
}: FacultyProblemBankTabProps) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Test Cases Inspection State
  const [inspectingProblem, setInspectingProblem] = useState<any | null>(null);
  const [testCases, setTestCases] = useState<any[]>([]);
  const [testCaseError, setTestCaseError] = useState<string | null>(null);
  const [loadingTestCases, setLoadingTestCases] = useState(false);
  const requestTokenRef = React.useRef<number>(0);

  const borderColor = '#E2E8F0';

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.slug?.toLowerCase().includes(search.toLowerCase());

      const matchesDifficulty =
        selectedDifficulty === 'ALL' ||
        p.difficulty?.toUpperCase() === selectedDifficulty;

      const matchesStatus =
        selectedStatus === 'ALL' ||
        p.status?.toUpperCase() === selectedStatus;

      return matchesSearch && matchesDifficulty && matchesStatus;
    });
  }, [problems, search, selectedDifficulty, selectedStatus]);

  const handleOpenTestCases = async (problem: any) => {
    const token = ++requestTokenRef.current;
    setInspectingProblem(problem);
    setTestCaseError(null);
    setTestCases([]);
    setLoadingTestCases(true);
    try {
      const cases = await apiService.getProblemTestCases(problem.id);
      if (token === requestTokenRef.current) {
        setTestCases(Array.isArray(cases) ? cases : []);
      }
    } catch (err: any) {
      if (token === requestTokenRef.current) {
        const errorMsg = err?.message || 'Failed to load test cases for this problem.';
        setTestCaseError(errorMsg);
        toast.error(errorMsg, 'Test Case Error');
      }
    } finally {
      if (token === requestTokenRef.current) {
        setLoadingTestCases(false);
      }
    }
  };

  const handleExportCSV = () => {
    if (problems.length === 0) {
      toast.info('No problems to export.', 'Empty Problem Bank');
      return;
    }

    const headers = ['Problem ID', 'Title', 'Slug', 'Difficulty', 'Time Limit (ms)', 'Memory Limit (MB)', 'Status'];
    const rows = problems.map((p) => [
      p.id || '',
      p.title || '',
      p.slug || '',
      p.difficulty || 'MEDIUM',
      p.timeLimit || 1000,
      p.memoryLimit || 256,
      p.status || 'PUBLISHED',
    ]);

    const csvContent = generateSafeCsv(headers, rows);
    downloadCsvBlob('question_bank.csv', csvContent);
    toast.success(`Exported ${problems.length} problems to CSV!`, 'Export Successful');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Search & Actions Bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 260, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search problems by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: '10px', fontSize: '0.85rem' },
              },
            }}
            sx={{ maxWidth: 300, width: '100%' }}
          />

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={selectedDifficulty}
              label="Difficulty"
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              sx={{ borderRadius: '10px', fontSize: '0.82rem' }}
            >
              <MenuItem value="ALL">All Levels</MenuItem>
              <MenuItem value="EASY">Easy</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HARD">Hard</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              label="Status"
              onChange={(e) => setSelectedStatus(e.target.value)}
              sx={{ borderRadius: '10px', fontSize: '0.82rem' }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PUBLISHED">Published</MenuItem>
              <MenuItem value="DRAFT">Draft</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={handleExportCSV}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderColor: '#CBD5E1',
              color: '#334155',
              bgcolor: '#FFFFFF',
              px: 1.75,
              py: 0.75,
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Export CSV
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleRoundedIcon sx={{ fontSize: 17 }} />}
            onClick={() => setIsCreateModalOpen(true)}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              px: 2,
              py: 0.75,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Author Lab Problem
          </Button>
        </Box>
      </Card>

      {/* Structured List Table (Rule 10) */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '18px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>
                  PROBLEM TITLE & SLUG
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  DIFFICULTY
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  RUNTIME & MEMORY LIMITS
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  STATUS
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProblems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <CodeRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>
                      No coding problems found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProblems.map((prob) => {
                  const difficultyColor =
                    prob.difficulty === 'HARD'
                      ? { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' }
                      : prob.difficulty === 'MEDIUM'
                      ? { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' }
                      : { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' };

                  return (
                    <TableRow key={prob.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                      <TableCell sx={{ pl: 3, py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: '10px',
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CodeRoundedIcon sx={{ fontSize: 20 }} />
                          </Box>
                          <Box>
                            <Link href={`/problems/${prob.slug || prob.id}`} style={{ textDecoration: 'none' }}>
                              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A', '&:hover': { color: '#2563EB' } }}>
                                {prob.title}
                              </Typography>
                            </Link>
                            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                              /{prob.slug || prob.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={prob.difficulty || 'MEDIUM'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor: difficultyColor.bg,
                            color: difficultyColor.text,
                            border: `1px solid ${difficultyColor.border}`,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography sx={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <TimerRoundedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                            {prob.timeLimit || 1000} ms
                          </Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MemoryRoundedIcon sx={{ fontSize: 15, color: '#94A3B8' }} />
                            {prob.memoryLimit || 256} MB
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={prob.status || 'PUBLISHED'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: prob.status === 'DRAFT' ? '#F1F5F9' : '#ECFDF5',
                            color: prob.status === 'DRAFT' ? '#64748B' : '#059669',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 3, py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ScienceRoundedIcon sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenTestCases(prob)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              color: '#475569',
                              borderColor: '#CBD5E1',
                              borderRadius: '8px',
                              py: 0.35,
                              px: 1.25,
                              '&:hover': { bgcolor: '#F8FAFC' },
                            }}
                          >
                            Test Cases
                          </Button>

                          <Button
                            component={Link}
                            href={`/problems/${prob.slug || prob.id}`}
                            size="small"
                            variant="contained"
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              bgcolor: '#0F172A',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              py: 0.35,
                              px: 1.25,
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#1E293B' },
                            }}
                          >
                            Solve / Run
                          </Button>
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

      {/* Author Problem Modal */}
      <FacultyCreateProblemModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        collegeId={collegeId}
        collegeName={collegeName}
        onProblemCreated={(p) => {
          onProblemCreated?.(p);
        }}
      />

      {/* Test Cases Inspection Modal */}
      <Dialog
        open={Boolean(inspectingProblem)}
        onClose={() => setInspectingProblem(null)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: '20px', p: 1, maxHeight: '80vh', display: 'flex', flexDirection: 'column' } },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
              Sandbox Test Cases: {inspectingProblem?.title}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
              Automated evaluation cases for Docker sandbox judge
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setInspectingProblem(null)} sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
          {loadingTestCases ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={28} sx={{ color: '#2563EB' }} />
            </Box>
          ) : testCaseError ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#DC2626' }}>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600 }}>
                {testCaseError}
              </Typography>
            </Box>
          ) : testCases.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6, color: '#94A3B8' }}>
              <ScienceRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#64748B' }}>
                No explicit test cases found for this problem.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {testCases.map((tc, idx) => (
                <Card
                  key={tc.id || idx}
                  elevation={0}
                  sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#0F172A' }}>
                      Test Case #{idx + 1}
                    </Typography>
                    <Chip
                      label={tc.isHidden ? 'Hidden Test Case' : 'Sample Public Case'}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        bgcolor: tc.isHidden ? '#FEF2F2' : '#EFF6FF',
                        color: tc.isHidden ? '#DC2626' : '#2563EB',
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, mb: 0.5 }}>
                        INPUT
                      </Typography>
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: '8px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          fontFamily: 'monospace',
                          fontSize: '0.76rem',
                          color: '#0F172A',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {tc.input || '–'}
                      </Box>
                    </Box>

                    <Box>
                      <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, mb: 0.5 }}>
                        EXPECTED OUTPUT
                      </Typography>
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: '8px',
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          fontFamily: 'monospace',
                          fontSize: '0.76rem',
                          color: '#059669',
                          fontWeight: 700,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {tc.expectedOutput || '–'}
                      </Box>
                    </Box>
                  </Box>

                  {tc.explanation && (
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748B', mt: 1, fontStyle: 'italic' }}>
                      Note: {tc.explanation}
                    </Typography>
                  )}
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setInspectingProblem(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
