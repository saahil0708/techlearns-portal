'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import DomainRoundedIcon from '@mui/icons-material/DomainRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

export interface DirectoryEntry {
  name: string;
  type: string;
  code?: string;
  handle?: string;
  count: string;
  detail: string;
  region: string;
  status: string;
}

interface PlatformDirectoryTableProps {
  entries: DirectoryEntry[];
  allEntries?: DirectoryEntry[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  primaryBlue?: string;
}

export default function PlatformDirectoryTable({
  entries,
  allEntries,
  currentTab,
  onTabChange,
  primaryBlue = '#2563eb',
}: PlatformDirectoryTableProps) {
  const router = useRouter();
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(4);

  const listForCounts = allEntries || entries;
  const collegeCount = listForCounts.filter((e) => e.type.toLowerCase() === 'college').length;
  const schoolCount = listForCounts.filter((e) => e.type.toLowerCase() === 'school').length;
  const individualCount = listForCounts.filter((e) => e.type.toLowerCase() === 'individual').length;
  const totalAll = listForCounts.length;

  const totalEntries = entries.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);

  const paginatedEntries = entries.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );

  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

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
            <th>Name / Entity</th>
            <th>Category</th>
            <th>Code / Handle</th>
            <th>Volume / Stats</th>
            <th>Details & Tracks</th>
            <th>Region</th>
            <th>Status</th>
          </tr>
          ${entries.map(
            (e) => `
            <tr>
              <td>${e.name}</td>
              <td>${e.type}</td>
              <td>${e.code || e.handle || '-'}</td>
              <td>${e.count}</td>
              <td>${e.detail}</td>
              <td>${e.region}</td>
              <td>${e.status}</td>
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
    link.setAttribute('download', `platform_directory_${currentTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadAsCSV = () => {
    const headers = ['Name', 'Category', 'Code/Handle', 'Volume/Stats', 'Details & Tracks', 'Region', 'Status'];
    const rows = entries.map((e) => [
      `"${e.name}"`,
      `"${e.type}"`,
      `"${e.code || e.handle || '-'}"`,
      `"${e.count}"`,
      `"${e.detail}"`,
      `"${e.region}"`,
      `"${e.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `platform_directory_${currentTab.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

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
            <DomainRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Platform Directory
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', mt: 0.25 }}>
            Colleges, Universities & Academic Campus Tenants
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Segmented Toggle Tabs */}
          <ToggleButtonGroup
            value={currentTab}
            exclusive
            onChange={(_, val) => {
              if (val) {
                onTabChange(val);
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
            <ToggleButton value="ALL">All Institutions ({totalAll})</ToggleButton>
            <ToggleButton value="COLLEGE">Colleges ({collegeCount})</ToggleButton>
            <ToggleButton value="SCHOOL">Schools ({schoolCount})</ToggleButton>
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

      {/* Table Content */}
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>NAME / USER</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>CATEGORY</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>VOLUME / STATS</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>DETAILS & TRACKS</TableCell>
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>REGION</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, letterSpacing: '0.04em', borderBottom: `1px solid ${borderColor}` }}>STATUS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#64748B' }}>
                  No directory entries found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntries.map((item, idx) => {
                const targetRoute =
                  item.type === 'College'
                    ? '/superadmin/colleges'
                    : item.type === 'School'
                    ? '/superadmin/schools'
                    : '/superadmin/students';

                return (
                  <TableRow
                    key={idx}
                    hover
                    onClick={() => router.push(targetRoute)}
                    sx={{
                      cursor: 'pointer',
                      '& td': { borderBottom: `1px solid #F1F5F9` },
                      '&:hover': { bgcolor: '#F8FAFC !important' },
                    }}
                  >
                    <TableCell sx={{ pl: 3, py: 1.85 }}>
                      <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#0F172A' }}>{item.name}</Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace', fontWeight: 500 }}>
                        {item.code || item.handle || ''}
                      </Typography>
                    </TableCell>
                  <TableCell sx={{ py: 1.85 }}>
                    <Chip
                      size="small"
                      icon={
                        item.type === 'College' ? (
                          <AccountBalanceRoundedIcon sx={{ fontSize: '13px !important' }} />
                        ) : item.type === 'School' ? (
                          <SchoolRoundedIcon sx={{ fontSize: '13px !important' }} />
                        ) : (
                          <PersonRoundedIcon sx={{ fontSize: '13px !important' }} />
                        )
                      }
                      label={item.type === 'Individual' ? 'Student' : item.type}
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        bgcolor:
                          item.type === 'College'
                            ? '#EFF6FF'
                            : item.type === 'School'
                            ? '#FAF5FF'
                            : '#FFFBEB',
                        border:
                          item.type === 'College'
                            ? '1px solid #BFDBFE'
                            : item.type === 'School'
                            ? '1px solid #E9D5FF'
                            : '1px solid #FDE68A',
                        color:
                          item.type === 'College'
                            ? '#2563EB'
                            : item.type === 'School'
                            ? '#9333EA'
                            : '#D97706',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#0F172A', py: 1.85 }}>{item.count}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#475569', py: 1.85 }}>{item.detail}</TableCell>
                  <TableCell sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', py: 1.85 }}>{item.region}</TableCell>
                  <TableCell align="right" sx={{ pr: 3, py: 1.85 }}>
                    <Chip
                      label={item.status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        bgcolor: item.status.includes('Pro') ? '#FFFBEB' : '#ECFDF5',
                        border: item.status.includes('Pro') ? '1px solid #FDE68A' : '1px solid #A7F3D0',
                        color: item.status.includes('Pro') ? '#D97706' : '#059669',
                        borderRadius: '5px',
                      }}
                    />
                  </TableCell>
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
            Showing <strong style={{ color: '#0F172A', fontWeight: 700 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 700 }}>{totalEntries}</strong> entries
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
              <MenuItem value={8}>8</MenuItem>
              <MenuItem value={12}>12</MenuItem>
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

          {/* Dynamic Page Indicator Pills for Long Lists */}
          {(() => {
            const getPaginationRange = (current: number, total: number) => {
              if (total <= 7) return Array.from({ length: total }, (_, i) => i);
              if (current <= 3) return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
              if (current >= total - 4) return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
              return [0, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total - 1];
            };

            return getPaginationRange(currentPage, totalPages).map((item, idx) => {
              if (typeof item === 'string') {
                return (
                  <Box
                    key={`ellipsis-${idx}`}
                    sx={{
                      width: 28,
                      height: 28,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94A3B8',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      userSelect: 'none',
                    }}
                  >
                    •••
                  </Box>
                );
              }

              const pageIndex = item as number;
              const isActive = currentPage === pageIndex;

              return (
                <Box
                  key={pageIndex}
                  onClick={() => setPage(pageIndex)}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    px: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '9999px',
                    cursor: 'pointer',
                    fontSize: '0.76rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#FFFFFF' : '#64748B',
                    bgcolor: isActive ? '#2563EB' : '#FFFFFF',
                    border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: isActive ? '#1D4ED8' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#0F172A',
                    },
                  }}
                >
                  {pageIndex + 1}
                </Box>
              );
            });
          })()}

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
    </Card>
  );
}

