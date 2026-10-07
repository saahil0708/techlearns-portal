'use client';

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  MenuItem,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import YouBadge from '@/components/common/YouBadge';
import { StudentDirectoryEntity, SortField, SortDirection } from './types';

interface StudentsDataTableProps {
  paginatedStudents: StudentDirectoryEntity[];
  processedStudents: StudentDirectoryEntity[];
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onToggleSelectRow: (id: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  page: number;
  rowsPerPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  onResetFilters: () => void;
  onPeekStudent: (stu: StudentDirectoryEntity) => void;
  onOpenAssignBatchSingle: (stu: StudentDirectoryEntity) => void;
  currentUserId?: string;
  currentUserEmail?: string;
  currentUserHandle?: string;
}

export default function StudentsDataTable({
  paginatedStudents,
  processedStudents,
  selectedIds,
  onSelectAll,
  onToggleSelectRow,
  sortField,
  sortDirection,
  onSort,
  page,
  rowsPerPage,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
  onResetFilters,
  onPeekStudent,
  onOpenAssignBatchSingle,
  currentUserId,
  currentUserEmail,
  currentUserHandle,
}: StudentsDataTableProps) {
  const borderColor = '#E2E8F0';
  const visibleSelectedCount = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return processedStudents.filter((s) => selectedSet.has(s.id)).length;
  }, [processedStudents, selectedIds]);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              {/* Checkbox Column */}
              <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                <Checkbox
                  indeterminate={visibleSelectedCount > 0 && visibleSelectedCount < processedStudents.length}
                  checked={processedStudents.length > 0 && visibleSelectedCount === processedStudents.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  sx={{
                    color: '#CBD5E1',
                    '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                  }}
                />
              </TableCell>

              {/* Rank Header (Sortable) */}
              <TableCell
                onClick={() => onSort('globalRank')}
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Rank
                  {sortField === 'globalRank' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ) : (
                      <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Student & Handle Header (Sortable) */}
              <TableCell
                onClick={() => onSort('name')}
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Coder & Handle
                  {sortField === 'name' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ) : (
                      <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Institution & Cohort */}
              <TableCell
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                }}
              >
                Affiliation & Cohort
              </TableCell>

              {/* Problems Solved (Sortable) */}
              <TableCell
                onClick={() => onSort('problemsSolved')}
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Problems Solved
                  {sortField === 'problemsSolved' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ) : (
                      <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Accuracy & Streak */}
              <TableCell
                onClick={() => onSort('accuracy')}
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Accuracy / Streak
                  {sortField === 'accuracy' &&
                    (sortDirection === 'asc' ? (
                      <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ) : (
                      <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Status */}
              <TableCell
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                }}
              >
                Status
              </TableCell>

              {/* Actions */}
              <TableCell
                align="right"
                sx={{
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderColor: '#E2E8F0',
                  pr: 3,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} sx={{ textAlign: 'center', py: 8, borderColor: '#E2E8F0' }}>
                  <Typography variant="subtitle1" sx={{ color: '#64748B', fontWeight: 600 }}>
                    No competitive coders found matching your criteria.
                  </Typography>
                  <Button
                    size="small"
                    onClick={onResetFilters}
                    sx={{ mt: 1.5, color: '#2563EB', borderRadius: '9999px', textTransform: 'none' }}
                  >
                    Reset All Filters
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStudents.map((stu) => {
                const isSelected = selectedIds.includes(stu.id);
                const isCurrentUser = Boolean(
                  (currentUserId && currentUserId === stu.id) ||
                    (currentUserEmail && stu.email && currentUserEmail.toLowerCase() === stu.email.toLowerCase()) ||
                    (currentUserHandle && stu.handle && currentUserHandle.toLowerCase() === stu.handle.toLowerCase())
                );
                return (
                  <TableRow
                    key={stu.id}
                    selected={isSelected}
                    sx={{
                      transition: 'all 0.15s ease',
                      borderColor: '#E2E8F0',
                      bgcolor: isSelected ? '#EFF6FF' : isCurrentUser ? '#F8FAFC' : '#FFFFFF',
                      '&:hover': {
                        bgcolor: isSelected ? '#DBEAFE' : '#F8FAFC',
                      },
                    }}
                  >
                    {/* Row Checkbox */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(stu.id)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>

                    {/* Rank Column */}
                    <TableCell sx={{ borderColor: '#E2E8F0' }}>
                      {stu.globalRank && stu.globalRank > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          {stu.globalRank === 1 ? (
                            <EmojiEventsRoundedIcon sx={{ color: '#F59E0B', fontSize: '1.2rem' }} />
                          ) : stu.globalRank === 2 ? (
                            <EmojiEventsRoundedIcon sx={{ color: '#94A3B8', fontSize: '1.2rem' }} />
                          ) : stu.globalRank === 3 ? (
                            <EmojiEventsRoundedIcon sx={{ color: '#B45309', fontSize: '1.2rem' }} />
                          ) : null}
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color: stu.globalRank <= 3 ? '#D97706' : '#64748B',
                              fontSize: '0.85rem',
                              fontFamily: 'monospace',
                            }}
                          >
                            #{stu.globalRank}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600, pl: 0.5 }}>
                          —
                        </Typography>
                      )}
                    </TableCell>

                    {/* Coder Info Column */}
                    <TableCell sx={{ borderColor: '#E2E8F0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={stu.avatarUrl}
                          sx={{
                            width: 38,
                            height: 38,
                            bgcolor: stu.avatarColor,
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            border: '2px solid #E2E8F0',
                          }}
                        >
                          {stu.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                            <Typography
                              onClick={() => onPeekStudent(stu)}
                              sx={{
                                fontWeight: 700,
                                color: '#0F172A',
                                fontSize: '0.88rem',
                                cursor: 'pointer',
                                '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                              }}
                            >
                              {stu.name}
                            </Typography>
                            {isCurrentUser && <YouBadge />}
                            <Typography
                              sx={{
                                color: '#2563EB',
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                fontWeight: 600,
                              }}
                            >
                              @{stu.handle}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            ID: {stu.studentId} • {stu.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Affiliation & Cohort Column */}
                    <TableCell sx={{ borderColor: '#E2E8F0' }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.3 }}>
                          <Chip
                            label={stu.institutionType}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              borderRadius: '9999px',
                              bgcolor:
                                stu.institutionType === 'Institute'
                                  ? '#EFF6FF'
                                  : '#FAF5FF',
                              color:
                                stu.institutionType === 'Institute'
                                  ? '#2563EB'
                                  : '#7C3AED',
                              border: '1px solid',
                              borderColor:
                                stu.institutionType === 'Institute'
                                  ? '#BFDBFE'
                                  : '#E9D5FF',
                            }}
                          />
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: '#0F172A',
                              fontSize: '0.8rem',
                              maxWidth: 220,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {stu.institutionName}
                          </Typography>
                        </Box>
                        <Tooltip title="Click to assign or change academic cohort">
                          <Typography
                            variant="caption"
                            onClick={() => onOpenAssignBatchSingle(stu)}
                            sx={{
                              color: stu.cohort === 'No Batch Assigned' ? '#94A3B8' : '#2563EB',
                              fontStyle: stu.cohort === 'No Batch Assigned' ? 'italic' : 'normal',
                              fontWeight: stu.cohort === 'No Batch Assigned' ? 500 : 700,
                              fontSize: '0.72rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 0.25,
                              cursor: 'pointer',
                              borderRadius: '4px',
                              px: 0.5,
                              py: 0.1,
                              bgcolor: stu.cohort === 'No Batch Assigned' ? 'transparent' : 'rgba(37, 99, 235, 0.06)',
                              '&:hover': { color: '#1D4ED8', textDecoration: 'underline', bgcolor: 'rgba(37, 99, 235, 0.1)' },
                            }}
                          >
                            {stu.cohort}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    {/* Problems Solved Breakdown */}
                    <TableCell sx={{ borderColor: '#E2E8F0' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem' }}>
                          {stu.problemsSolved}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                          <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700, fontSize: '0.68rem' }}>
                            E: {stu.solvedEasy}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>•</Typography>
                          <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, fontSize: '0.68rem' }}>
                            M: {stu.solvedMedium}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.68rem' }}>•</Typography>
                          <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 700, fontSize: '0.68rem' }}>
                            H: {stu.solvedHard}
                          </Typography>
                          {!stu.hasVerifiedDifficulty && stu.problemsSolved > 0 && (
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', fontStyle: 'italic', ml: 0.25 }}>
                              (est.)
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Accuracy & Streak */}
                    <TableCell sx={{ borderColor: '#E2E8F0' }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#16A34A', fontSize: '0.82rem' }}>
                          {stu.accuracy}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#D97706', fontSize: '0.72rem', fontWeight: 700 }}>
                          <WhatshotRoundedIcon sx={{ fontSize: '0.85rem' }} />
                          {stu.streakDays}d Streak
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Status */}
                    <TableCell sx={{ borderColor: '#E2E8F0' }}>
                      <Chip
                        label={stu.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          borderRadius: '9999px',
                          bgcolor: stu.status === 'Active' ? '#F0FDF4' : '#F1F5F9',
                          color: stu.status === 'Active' ? '#16A34A' : '#64748B',
                          border: '1px solid',
                          borderColor: stu.status === 'Active' ? '#BBF7D0' : '#CBD5E1',
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ pr: 2.5, borderColor: '#E2E8F0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {/* Assign Batch Action */}
                        <Tooltip title="Assign to Batch / Cohort">
                          <IconButton
                            size="small"
                            onClick={() => onOpenAssignBatchSingle(stu)}
                            sx={{
                              color: '#2563EB',
                              borderRadius: '9999px',
                              bgcolor: 'rgba(37, 99, 235, 0.06)',
                              '&:hover': { color: '#1D4ED8', bgcolor: 'rgba(37, 99, 235, 0.14)' },
                            }}
                          >
                            <SchoolRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Peek Quick View */}
                        <Tooltip title="Quick Peek Profile">
                          <IconButton
                            size="small"
                            onClick={() => onPeekStudent(stu)}
                            sx={{
                              color: '#64748B',
                              borderRadius: '9999px',
                              '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' },
                            }}
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {/* Full Profile Link */}
                        <Link href={`/superadmin/students/${stu.id}`} passHref style={{ textDecoration: 'none' }}>
                          <IconButton
                            size="small"
                            sx={{
                              color: '#64748B',
                              borderRadius: '9999px',
                              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                            }}
                          >
                            <FluidArrowRight size={16} />
                          </IconButton>
                        </Link>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Controls */}
      <Box
        sx={{
          p: '16px 24px',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          borderTop: `1px solid ${borderColor}`,
          bgcolor: '#FFFFFF',
        }}
      >
        {/* Left: Range & Rows per page */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Showing{' '}
            <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
              {processedStudents.length === 0 ? 0 : page * rowsPerPage + 1}–
              {Math.min((page + 1) * rowsPerPage, processedStudents.length)}
            </Typography>{' '}
            of{' '}
            <Typography component="span" sx={{ color: '#0F172A', fontWeight: 700 }}>
              {processedStudents.length}
            </Typography>{' '}
            students
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748B' }}>
              Rows per page:
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(e) => {
                onRowsPerPageChange(Number(e.target.value));
              }}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#0F172A',
                borderRadius: '9999px',
                fontSize: '0.78rem',
                height: 28,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                '& .MuiSvgIcon-root': { color: '#64748B' },
              }}
            >
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
              <MenuItem value={100}>100</MenuItem>
            </Select>
          </Box>
        </Box>

        {/* Right: Full-Pill Navigation Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => onPageChange(0)}
            sx={{
              borderRadius: '9999px',
              width: 32,
              height: 32,
              border: '1px solid #E2E8F0',
              color: '#64748B',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
            }}
          >
            <FirstPageRoundedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            disabled={page === 0}
            onClick={() => onPageChange(Math.max(0, page - 1))}
            sx={{
              borderRadius: '9999px',
              width: 32,
              height: 32,
              border: '1px solid #E2E8F0',
              color: '#64748B',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
            }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>

          {/* Page Number Pills */}
          {Array.from({ length: totalPages }, (_, i) => i)
            .filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)
            .map((p, idx, arr) => {
              const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsis && (
                    <Typography variant="caption" sx={{ color: '#94A3B8', px: 0.5 }}>
                      …
                    </Typography>
                  )}
                  <Button
                    size="small"
                    onClick={() => onPageChange(p)}
                    sx={{
                      minWidth: 32,
                      height: 32,
                      p: 0,
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: page === p ? 800 : 500,
                      bgcolor: page === p ? '#2563EB' : '#FFFFFF',
                      color: page === p ? '#FFFFFF' : '#64748B',
                      border: '1px solid',
                      borderColor: page === p ? '#2563EB' : '#E2E8F0',
                      '&:hover': {
                        bgcolor: page === p ? '#1D4ED8' : '#F1F5F9',
                        color: page === p ? '#FFFFFF' : '#0F172A',
                      },
                    }}
                  >
                    {p + 1}
                  </Button>
                </React.Fragment>
              );
            })}

          <IconButton
            size="small"
            disabled={page >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
            sx={{
              borderRadius: '9999px',
              width: 32,
              height: 32,
              border: '1px solid #E2E8F0',
              color: '#64748B',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
            }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            disabled={page >= totalPages - 1 || totalPages === 0}
            onClick={() => onPageChange(totalPages - 1)}
            sx={{
              borderRadius: '9999px',
              width: 32,
              height: 32,
              border: '1px solid #E2E8F0',
              color: '#64748B',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
              '&.Mui-disabled': { color: '#CBD5E1', borderColor: '#F1F5F9' },
            }}
          >
            <LastPageRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
}
