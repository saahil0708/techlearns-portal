'use client';

import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import {
  Box,
  Typography,
  Card,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Select,
  MenuItem,
  Tooltip,
  Menu,
  ListItemIcon,
  Drawer,
  Button,
  Divider,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

export interface SubmissionItem {
  id: string;
  user: string;
  institution: string;
  instType: string;
  problem: string;
  difficulty: string;
  language: string;
  verdict: string;
  runtime: string;
  memory: string;
  timeAgo: string;
}

interface LiveSubmissionsFeedProps {
  submissions: SubmissionItem[];
  filter: string;
  onFilterChange: (filter: string) => void;
}

export default function LiveSubmissionsFeed({
  submissions,
  filter,
  onFilterChange,
}: LiveSubmissionsFeedProps) {
  const toast = useToast();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(4);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionItem | null>(null);
  const [isRejudging, setIsRejudging] = useState(false);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadAsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Submission ID</th>
            <th>Student</th>
            <th>Institution</th>
            <th>Institution Type</th>
            <th>Problem</th>
            <th>Difficulty</th>
            <th>Language</th>
            <th>Verdict</th>
            <th>Runtime</th>
            <th>Memory</th>
            <th>Time</th>
          </tr>
          ${submissions.map(
            (s) => `
            <tr>
              <td>${s.id}</td>
              <td>${s.user}</td>
              <td>${s.institution}</td>
              <td>${s.instType}</td>
              <td>${s.problem}</td>
              <td>${s.difficulty}</td>
              <td>${s.language}</td>
              <td>${s.verdict}</td>
              <td>${s.runtime}</td>
              <td>${s.memory}</td>
              <td>${s.timeAgo}</td>
            </tr>`
          ).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `live_submissions_${filter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
    toast.success(`Exported ${submissions.length} live submissions to Excel (.xls)`, 'Export Completed');
  };

  const downloadAsCSV = () => {
    const headers = ['Submission ID', 'Student', 'Institution', 'Institution Type', 'Problem', 'Difficulty', 'Language', 'Verdict', 'Runtime', 'Memory', 'Time'];
    const rows = submissions.map((s) => [
      `"${s.id}"`,
      `"${s.user}"`,
      `"${s.institution}"`,
      `"${s.instType}"`,
      `"${s.problem}"`,
      `"${s.difficulty}"`,
      `"${s.language}"`,
      `"${s.verdict}"`,
      `"${s.runtime}"`,
      `"${s.memory}"`,
      `"${s.timeAgo}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `live_submissions_${filter.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
    toast.success(`Exported ${submissions.length} live submissions to CSV`, 'Export Completed');
  };

  const totalSubmissions = submissions.length;
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedSubmissions = submissions.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const startEntry = totalSubmissions === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalSubmissions);

  const borderColor = '#E2E8F0';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '24px',
        border: `1px solid ${borderColor}`,
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, borderBottom: `1px solid ${borderColor}` }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Live Submission Stream
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', mt: 0.25 }}>
            Real-time judge evaluation across Institutes & Independent Students
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Filter Toggle Buttons */}
          <ToggleButtonGroup
            value={filter}
            exclusive
            onChange={(_, val) => {
              if (val) {
                onFilterChange(val);
                setPage(0);
              }
            }}
            size="small"
            sx={{
              bgcolor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              p: '3.5px',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '9999px !important',
                fontSize: '0.74rem',
                fontWeight: 600,
                textTransform: 'none',
                px: 1.8,
                py: 0.45,
                color: '#64748B',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  bgcolor: '#FFFFFF',
                  color: '#2563EB',
                  fontWeight: 700,
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                },
              },
            }}
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="ACCEPTED">Accepted</ToggleButton>
            <ToggleButton value="FAILED">Failed / TLE</ToggleButton>
          </ToggleButtonGroup>

          {/* Download Excel / CSV Button */}
          <Tooltip title="Download Excel / CSV">
            <IconButton
              size="small"
              onClick={handleOpenDownloadMenu}
              sx={{
                color: '#64748B',
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.75,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  borderColor: '#BFDBFE',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <FileDownloadRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={downloadAnchorEl}
            open={Boolean(downloadAnchorEl)}
            onClose={handleCloseDownloadMenu}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  mt: 1,
                  minWidth: 210,
                  p: 0.5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          >
            <MenuItem
              onClick={downloadAsExcel}
              sx={{
                borderRadius: '10px',
                py: 0.9,
                px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#F0FDF4' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download Excel (.xls)
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={downloadAsCSV}
              sx={{
                borderRadius: '10px',
                py: 0.9,
                px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#EFF6FF' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download CSV (.csv)
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* Submissions Table */}
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>STUDENT / AFFILIATION</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>PROBLEM</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>LANG</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>VERDICT</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>METRICS</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>TIME</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSubmissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748B' }}>
                  No submissions match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedSubmissions.map((sub) => {
                const isAccepted = sub.verdict === 'ACCEPTED';
                const isTLE = sub.verdict === 'TIME_LIMIT_EXCEEDED';

                return (
                  <TableRow
                    key={sub.id}
                    hover
                    onClick={() => setSelectedSubmission(sub)}
                    sx={{
                      cursor: 'pointer',
                      '& td': { borderBottom: `1px solid #F1F5F9` },
                      '&:hover': { bgcolor: '#F8FAFC !important' },
                    }}
                  >
                    <TableCell sx={{ pl: 3, py: 1.85 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>{sub.user}</Typography>
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 500, color: '#64748B' }}>
                        {sub.institution}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.85 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>{sub.problem}</Typography>
                      <Chip
                        label={sub.difficulty}
                        size="small"
                        sx={{
                          height: 19,
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          borderRadius: '5px',
                          bgcolor: sub.difficulty === 'Hard' ? '#FEF2F2' : sub.difficulty === 'Medium' ? '#FFFBEB' : '#ECFDF5',
                          border: sub.difficulty === 'Hard' ? '1px solid #FECACA' : sub.difficulty === 'Medium' ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                          color: sub.difficulty === 'Hard' ? '#DC2626' : sub.difficulty === 'Medium' ? '#D97706' : '#059669',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.85 }}>
                      <Chip label={sub.language} size="small" sx={{ height: 21, fontSize: '0.7rem', fontWeight: 600, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '5px' }} />
                    </TableCell>
                    <TableCell sx={{ py: 1.85 }}>
                      {isAccepted ? (
                        <Chip icon={<CheckCircleRoundedIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />} label="Accepted" size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669', borderRadius: '6px' }} />
                      ) : isTLE ? (
                        <Chip icon={<AccessTimeRoundedIcon sx={{ fontSize: '13px !important', color: '#D97706 !important' }} />} label="TLE" size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706', borderRadius: '6px' }} />
                      ) : (
                        <Chip icon={<CancelRoundedIcon sx={{ fontSize: '13px !important', color: '#DC2626 !important' }} />} label="Wrong Answer" size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '6px' }} />
                      )}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 500, color: '#64748B', py: 1.85 }}>{sub.runtime} • {sub.memory}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748B', pr: 3, py: 1.85 }}>{sub.timeAgo}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer Toolbar */}
      <Box
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          borderTop: `1px solid ${borderColor}`,
          bgcolor: '#F8FAFC',
        }}
      >
        {/* Counter Info & Rows Per Page */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
            Showing <strong style={{ color: '#0F172A', fontWeight: 700 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 700 }}>{totalSubmissions}</strong> submissions
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 500 }}>
              Rows per page:
            </Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(0);
              }}
              size="small"
              sx={{
                height: 28,
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#0F172A',
                bgcolor: '#FFFFFF',
                borderRadius: '9999px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E2E8F0',
                  borderRadius: '9999px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#CBD5E1',
                },
                '& .MuiSvgIcon-root': {
                  color: '#64748B',
                  fontSize: 18,
                },
              }}
            >
              <MenuItem value={4}>4</MenuItem>
              <MenuItem value={7}>7</MenuItem>
              <MenuItem value={15}>15</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Page Navigation Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <IconButton
            size="small"
            disabled={currentPage === 0}
            onClick={() => setPage(0)}
            sx={{
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              p: 0.6,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
            }}
          >
            <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            disabled={currentPage === 0}
            onClick={() => setPage(Math.max(0, currentPage - 1))}
            sx={{
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              p: 0.6,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
            }}
          >
            <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Dynamic Page Indicator Pills */}
          {Array.from({ length: totalPages }, (_, i) => (
            <Box
              key={i}
              onClick={() => setPage(i)}
              sx={{
                minWidth: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.76rem',
                fontWeight: currentPage === i ? 700 : 500,
                color: currentPage === i ? '#FFFFFF' : '#64748B',
                bgcolor: currentPage === i ? '#2563EB' : '#FFFFFF',
                border: currentPage === i ? '1px solid #2563EB' : '1px solid #E2E8F0',
                boxShadow: currentPage === i ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: currentPage === i ? '#1D4ED8' : '#F1F5F9',
                  color: currentPage === i ? '#FFFFFF' : '#0F172A',
                },
              }}
            >
              {i + 1}
            </Box>
          ))}

          <IconButton
            size="small"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
            sx={{
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              p: 0.6,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
            }}
          >
            <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
            sx={{
              color: '#64748B',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '9999px',
              p: 0.6,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
            }}
          >
            <LastPageRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Submission Inspector Slide-over Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100vw', sm: 520 },
              p: 0,
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.1)',
            },
          },
        }}
      >
        {selectedSubmission && (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                    Submission Inspection
                  </Typography>
                  <Chip
                    label={selectedSubmission.id}
                    size="small"
                    sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem', bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' }}
                  />
                </Box>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
                  Detailed testcase evaluation and source execution trace
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedSubmission(null)} size="small" sx={{ color: '#64748B', '&:hover': { bgcolor: '#E2E8F0' } }}>
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Verdict Card */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: selectedSubmission.verdict === 'ACCEPTED' ? '#ECFDF5' : selectedSubmission.verdict === 'TIME_LIMIT_EXCEEDED' ? '#FFFBEB' : '#FEF2F2',
                  border: selectedSubmission.verdict === 'ACCEPTED' ? '1px solid #A7F3D0' : selectedSubmission.verdict === 'TIME_LIMIT_EXCEEDED' ? '1px solid #FDE68A' : '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  {selectedSubmission.verdict === 'ACCEPTED' ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 32, color: '#059669' }} />
                  ) : selectedSubmission.verdict === 'TIME_LIMIT_EXCEEDED' ? (
                    <AccessTimeRoundedIcon sx={{ fontSize: 32, color: '#D97706' }} />
                  ) : (
                    <CancelRoundedIcon sx={{ fontSize: 32, color: '#DC2626' }} />
                  )}
                  <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: selectedSubmission.verdict === 'ACCEPTED' ? '#059669' : selectedSubmission.verdict === 'TIME_LIMIT_EXCEEDED' ? '#D97706' : '#DC2626' }}>
                      {selectedSubmission.verdict === 'ACCEPTED' ? 'Accepted (Pass)' : selectedSubmission.verdict === 'TIME_LIMIT_EXCEEDED' ? 'Time Limit Exceeded' : 'Wrong Answer'}
                    </Typography>
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569' }}>
                      {selectedSubmission.verdict === 'ACCEPTED' ? '28 / 28 test cases passed successfully' : '19 / 28 test cases passed'}
                    </Typography>
                  </Box>
                </Box>
                <Chip label={selectedSubmission.timeAgo} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, fontSize: '0.72rem' }} />
              </Box>

              {/* Metrics Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}>
                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', mb: 0.5 }}>
                    <SpeedRoundedIcon sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Runtime</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                    {selectedSubmission.runtime}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', mb: 0.5 }}>
                    <MemoryRoundedIcon sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Memory</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                    {selectedSubmission.memory}
                  </Typography>
                </Box>

                <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', mb: 0.5 }}>
                    <CodeRoundedIcon sx={{ fontSize: 16 }} />
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>Language</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                    {selectedSubmission.language}
                  </Typography>
                </Box>
              </Box>

              {/* Student & Problem Info */}
              <Box sx={{ p: 2, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <AccountCircleRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
                  <Box>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{selectedSubmission.user}</Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>{selectedSubmission.institution} ({selectedSubmission.instType})</Typography>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Problem Statement</Typography>
                    <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{selectedSubmission.problem}</Typography>
                  </Box>
                  <Chip label={selectedSubmission.difficulty} size="small" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                </Box>
              </Box>

              {/* Code Preview */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Submitted Source Code ({selectedSubmission.language})
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => {
                      navigator.clipboard.writeText(`// Solution for ${selectedSubmission.problem}\n// Language: ${selectedSubmission.language}\n\nfunction solve(inputs) {\n  // Code implementation\n}`);
                      toast.info('Source code copied to clipboard!', 'Code Copied');
                    }}
                    sx={{ textTransform: 'none', fontSize: '0.74rem', fontWeight: 600, color: '#2563EB' }}
                  >
                    Copy Code
                  </Button>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: '12px',
                    bgcolor: '#0F172A',
                    color: '#E2E8F0',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    fontSize: '0.78rem',
                    lineHeight: 1.6,
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}
                >
                  <Typography component="pre" sx={{ m: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
{`// Submission ID: ${selectedSubmission.id}
// Problem: ${selectedSubmission.problem}
// Author: ${selectedSubmission.user} (${selectedSubmission.institution})

#include <iostream>
#include <vector>
#include <unordered_map>

using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Footer Actions */}
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => setSelectedSubmission(null)}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<ReplayRoundedIcon sx={{ fontSize: 16 }} />}
                disabled={isRejudging}
                onClick={() => {
                  setIsRejudging(true);
                  setTimeout(() => {
                    setIsRejudging(false);
                    toast.success(`Submission ${selectedSubmission.id} re-queued for judge cluster evaluation!`, 'Judge Execution');
                  }, 900);
                }}
                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.82rem', bgcolor: '#2563EB' }}
              >
                {isRejudging ? 'Re-evaluating...' : 'Re-judge Solution'}
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>
    </Card>
  );
}
