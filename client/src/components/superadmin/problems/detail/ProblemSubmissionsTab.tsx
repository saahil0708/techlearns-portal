'use client';

import React from 'react';
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
import Link from 'next/link';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { ProblemEntity } from '@/types/problem';
import { ProblemSubmissionItem } from './types';

interface ProblemSubmissionsTabProps {
  problem: ProblemEntity;
  submissions: ProblemSubmissionItem[];
  filteredSubmissions: ProblemSubmissionItem[];
  submissionSearch: string;
  onSearchChange: (query: string) => void;
  onExportCSV: () => void;
  onViewCode: (sub: ProblemSubmissionItem) => void;
}

export default function ProblemSubmissionsTab({
  problem,
  submissions,
  filteredSubmissions,
  submissionSearch,
  onSearchChange,
  onExportCSV,
  onViewCode,
}: ProblemSubmissionsTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
          Student Submissions & Verdicts Log
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search submissions..."
            size="small"
            value={submissionSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
          />
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={onExportCSV}
            disabled={submissions.length === 0}
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

      {submissions.length === 0 ? (
        <Box
          sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed #CBD5E1',
            bgcolor: '#F8FAFC',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: '#FAF5FF',
              border: '1px solid #FAF5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <HistoryRoundedIcon sx={{ fontSize: 28, color: '#0B1F3A' }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.75, fontSize: '1.05rem' }}>
            No Student Submissions Logged Yet
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 480, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
            There are currently 0 submissions recorded for <strong>{problem.title}</strong>. When enrolled students compile and submit code in the platform sandbox, their verdicts and execution telemetry will appear in this table.
          </Typography>
          <Button
            component={Link}
            href={`/problems/${problem.slug}`}
            target="_blank"
            variant="outlined"
            size="small"
            startIcon={<PlayArrowRoundedIcon />}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              borderColor: '#0B1F3A',
              color: '#0B1F3A',
              px: 2.5,
              py: 0.75,
              '&:hover': { bgcolor: '#FAF5FF', borderColor: '#17366E' },
            }}
          >
            Open in Student IDE Workspace
          </Button>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>SUBMISSION ID</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STUDENT & INSTITUTION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>VERDICT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>LANGUAGE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>RUNTIME & RAM</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>TIMESTAMP</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>INSPECT</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A3B8' }}>
                    No submissions found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((sub) => {
                  const isAcc = sub.verdict === 'Accepted';
                  return (
                    <TableRow key={sub.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell className="ide-code-font" sx={{ fontWeight: 800, color: '#0B1F3A', fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important' }}>
                        {sub.id}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                          {sub.studentName}
                        </Typography>
                        <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                          {sub.institution} • {sub.studentEmail}
                        </Typography>
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
                          sx={{ textTransform: 'none', fontWeight: 700, color: '#0B1F3A' }}
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
      )}
    </Card>
  );
}
