import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
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
  LinearProgress,
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { FluidArrowRight, FluidArrowUpward, FluidArrowDownward } from '@/utils/fluid_arrow';
import { ProblemEntity } from '@/types/problem';

export type SortField = 'code' | 'title' | 'difficulty' | 'acceptanceRate' | 'totalSubmissions' | 'points';
export type SortDirection = 'asc' | 'desc';

interface ProblemsDataTableProps {
  problems: ProblemEntity[];
  paginatedProblems: ProblemEntity[];
  selectedIds: string[];
  onToggleSelectRow: (id: string) => void;
  onSelectAll: (checked: boolean) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onPeek: (problem: ProblemEntity) => void;
  onSetPotd: (problem: ProblemEntity) => void;
  onDeleteSingle: (id: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  startEntry: number;
  endEntry: number;
  totalEntries: number;
  totalPages: number;
}

const difficultyChipStyles = {
  Easy: { bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' },
  Medium: { bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
  Hard: { bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
};

export default function ProblemsDataTable({
  problems,
  paginatedProblems,
  selectedIds,
  onToggleSelectRow,
  onSelectAll,
  sortField,
  sortDirection,
  onSort,
  onPeek,
  onSetPotd,
  onDeleteSingle,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  startEntry,
  endEntry,
  totalEntries,
  totalPages,
}: ProblemsDataTableProps) {
  const borderColor = '#E2E8F0';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        border: `1px solid ${borderColor}`,
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              {/* Checkbox Select All */}
              <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                <Checkbox
                  indeterminate={selectedIds.length > 0 && selectedIds.length < problems.length}
                  checked={problems.length > 0 && selectedIds.length === problems.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  sx={{
                    color: '#CBD5E1',
                    '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#0B1F3A' },
                  }}
                />
              </TableCell>

              {/* Status Indicator */}
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, width: 60 }}>
                STATUS
              </TableCell>

              {/* Problem Title & Code (Sortable) */}
              <TableCell
                onClick={() => onSort('title')}
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748B',
                  py: 1.5,
                  cursor: 'pointer',
                  userSelect: 'none',
                  minWidth: 280,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  PROBLEM TITLE
                  {sortField === 'title' &&
                    (sortDirection === 'asc' ? (
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Difficulty (Sortable) */}
              <TableCell
                onClick={() => onSort('difficulty')}
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748B',
                  py: 1.5,
                  cursor: 'pointer',
                  userSelect: 'none',
                  width: 120,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  DIFFICULTY
                  {sortField === 'difficulty' &&
                    (sortDirection === 'asc' ? (
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Acceptance Rate (Sortable) */}
              <TableCell
                onClick={() => onSort('acceptanceRate')}
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748B',
                  py: 1.5,
                  minWidth: 150,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  ACCEPTANCE
                  {sortField === 'acceptanceRate' &&
                    (sortDirection === 'asc' ? (
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Submissions (Sortable) */}
              <TableCell
                onClick={() => onSort('totalSubmissions')}
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#64748B',
                  py: 1.5,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  SUBMISSIONS
                  {sortField === 'totalSubmissions' &&
                    (sortDirection === 'asc' ? (
                      <FluidArrowUpward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ) : (
                      <FluidArrowDownward sx={{ fontSize: '0.85rem', color: '#0B1F3A' }} />
                    ))}
                </Box>
              </TableCell>

              {/* Algorithmic Tags */}
              <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                TOPICS & PATTERNS
              </TableCell>

              {/* Actions */}
              <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedProblems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 8, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#FAF5FF', color: '#0B1F3A' }}>
                      <SearchIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                      No problems match your filters
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                      Try adjusting your topic tab, search query, or difficulty filters.
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedProblems.map((prob) => {
                const isSelected = selectedIds.includes(prob.id);
                const diffStyle = difficultyChipStyles[prob.difficulty];

                return (
                  <TableRow
                    key={prob.id}
                    hover
                    selected={isSelected}
                    sx={{
                      '& td': { borderBottom: '1px solid #F1F5F9' },
                      bgcolor: isSelected ? '#FAF5FF !important' : 'inherit',
                      '&:hover': { bgcolor: isSelected ? '#FAF5FF !important' : '#F8FAFC !important' },
                    }}
                  >
                    {/* Checkbox */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(prob.id)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked': { color: '#0B1F3A' },
                        }}
                      />
                    </TableCell>

                    {/* Status Pill */}
                    <TableCell>
                      <Chip
                        label={prob.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          borderRadius: '9999px',
                          bgcolor:
                            prob.status === 'Published'
                              ? '#F0FDF4'
                              : prob.status === 'Under Review'
                              ? '#FFFBEB'
                              : '#F1F5F9',
                          color:
                            prob.status === 'Published'
                              ? '#16A34A'
                              : prob.status === 'Under Review'
                              ? '#D97706'
                              : '#64748B',
                          border: '1px solid',
                          borderColor:
                            prob.status === 'Published'
                              ? '#BBF7D0'
                              : prob.status === 'Under Review'
                              ? '#FDE68A'
                              : '#CBD5E1',
                        }}
                      />
                    </TableCell>

                    {/* Title & Code */}
                    <TableCell sx={{ py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                              component={Link}
                              href={`/superadmin/problems/${prob.slug}`}
                              sx={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: '#0F172A',
                                textDecoration: 'none',
                                '&:hover': { color: '#0B1F3A', textDecoration: 'underline' },
                              }}
                            >
                              {prob.code}. {prob.title}
                            </Typography>
                          </Box>

                          {/* Company Badges */}
                          {prob.companies && prob.companies.length > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                                Asked at:
                              </Typography>
                              {prob.companies.slice(0, 3).map((comp) => (
                                <Typography
                                  key={comp}
                                  sx={{
                                    fontSize: '0.68rem',
                                    color: '#64748B',
                                    bgcolor: '#F1F5F9',
                                    px: 0.75,
                                    py: 0.1,
                                    borderRadius: '4px',
                                    fontWeight: 600,
                                  }}
                                >
                                  {comp}
                                </Typography>
                              ))}
                              {prob.companies.length > 3 && (
                                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                                  +{prob.companies.length - 3}
                                </Typography>
                              )}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Difficulty Chip */}
                    <TableCell sx={{ py: 1.75 }}>
                      <Chip
                        label={prob.difficulty}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          borderRadius: '9999px',
                          ...diffStyle,
                        }}
                      />
                    </TableCell>

                    {/* Acceptance Rate */}
                    <TableCell sx={{ py: 1.75 }}>
                      <Box sx={{ minWidth: 120 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                            {prob.acceptanceRate}%
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>
                            {prob.points} pts
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={prob.acceptanceRate}
                          sx={{
                            height: 5,
                            borderRadius: 3,
                            bgcolor: '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: prob.acceptanceRate > 60 ? '#16A34A' : prob.acceptanceRate > 40 ? '#0B1F3A' : '#D97706',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Submissions */}
                    <TableCell sx={{ py: 1.75 }}>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                        {prob.totalSubmissions.toLocaleString()}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                        {prob.acceptedSubmissions.toLocaleString()} accepted
                      </Typography>
                    </TableCell>

                    {/* Topics & Tags */}
                    <TableCell sx={{ py: 1.75 }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 260 }}>
                        {prob.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={tag}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                            }}
                          />
                        ))}
                        {prob.tags.length > 2 && (
                          <Tooltip title={prob.tags.slice(2).join(', ')}>
                            <Chip
                              label={`+${prob.tags.length - 2}`}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: '#FAF5FF',
                                color: '#0B1F3A',
                                borderRadius: '6px',
                              }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>

                    {/* Actions: Peek & Solve */}
                    <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Quick Peek Problem">
                          <IconButton
                            size="small"
                            onClick={() => onPeek(prob)}
                            sx={{
                              color: '#64748B',
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              border: '1px solid #E2E8F0',
                              '&:hover': { color: '#0B1F3A', bgcolor: '#FAF5FF', borderColor: '#D8B4FE' },
                            }}
                          >
                            <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={prob.status === 'Published' ? 'Schedule as Problem of the Day' : 'Only published problems can be set as POTD'}>
                          <span>
                            <IconButton
                              size="small"
                              disabled={prob.status !== 'Published'}
                              onClick={() => onSetPotd(prob)}
                              sx={{
                                color: '#475569',
                                width: 32,
                                height: 32,
                                borderRadius: '8px',
                                border: '1px solid #E2E8F0',
                                bgcolor: '#F8FAFC',
                                '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                                '&.Mui-disabled': {
                                  color: '#9CA3AF',
                                  bgcolor: '#F3F4F6',
                                  borderColor: '#E5E7EB',
                                },
                              }}
                            >
                              <CalendarMonthRoundedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip title="Delete Problem">
                          <IconButton
                            size="small"
                            onClick={() => onDeleteSingle(prob.id)}
                            sx={{
                              color: '#EF4444',
                              width: 32,
                              height: 32,
                              borderRadius: '8px',
                              border: '1px solid #FEE2E2',
                              bgcolor: '#FEF2F2',
                              '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2', borderColor: '#FECACA' },
                            }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        <Button
                          component={Link}
                          href={`/superadmin/problems/${prob.slug}`}
                          size="small"
                          variant="outlined"
                          endIcon={<FluidArrowRight size={14} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            color: '#0B1F3A',
                            borderColor: '#E9D5FF',
                            bgcolor: '#FAF5FF',
                            borderRadius: '8px',
                            px: 1.5,
                            py: 0.4,
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              bgcolor: '#E9D5FF',
                              borderColor: '#C084FC',
                            },
                          }}
                        >
                          Manage
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

      {/* Full-Pill Pagination Footer Toolbar */}
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
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
          Showing <strong style={{ color: '#0F172A' }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A' }}>{totalEntries}</strong> problems
        </Typography>

        {/* Rows Per Page & Page Numbers */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Rows:</Typography>
            <Select
              value={rowsPerPage}
              onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
              size="small"
              sx={{
                height: 28,
                fontSize: '0.76rem',
                fontWeight: 700,
                color: '#0F172A',
                bgcolor: '#FFFFFF',
                borderRadius: '9999px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '9999px' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={25}>25</MenuItem>
              <MenuItem value={50}>50</MenuItem>
            </Select>
          </Box>

          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => onPageChange(0)}
              sx={{
                width: 32,
                height: 32,
                color: '#64748B',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.5,
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
              }}
            >
              <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              size="small"
              disabled={page === 0}
              onClick={() => onPageChange(Math.max(0, page - 1))}
              sx={{
                width: 32,
                height: 32,
                color: '#64748B',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.5,
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
              }}
            >
              <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Page Pill Buttons */}
            {(() => {
              const pages = [];
              const maxVisible = 5;
              let start = Math.max(0, page - Math.floor(maxVisible / 2));
              let end = Math.min(totalPages, start + maxVisible);

              if (end - start < maxVisible) {
                start = Math.max(0, end - maxVisible);
              }

              if (start > 0) {
                pages.push(0);
                if (start > 1) pages.push('ellipsis-start');
              }

              for (let i = start; i < end; i++) {
                if (!pages.includes(i)) pages.push(i);
              }

              if (end < totalPages) {
                if (end < totalPages - 1) pages.push('ellipsis-end');
                pages.push(totalPages - 1);
              }

              return pages.map((p, idx) => {
                if (typeof p === 'string') {
                  return (
                    <Typography key={`ellipsis-${idx}`} sx={{ px: 0.75, color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>
                      …
                    </Typography>
                  );
                }

                const isCurrent = p === page;
                return (
                  <Button
                    key={p}
                    onClick={() => onPageChange(p)}
                    size="small"
                    sx={{
                      minWidth: 30,
                      height: 30,
                      p: 0,
                      borderRadius: '9999px',
                      fontSize: '0.78rem',
                      fontWeight: isCurrent ? 800 : 600,
                      bgcolor: isCurrent ? '#0B1F3A' : '#FFFFFF',
                      color: isCurrent ? '#FFFFFF' : '#475569',
                      border: isCurrent ? 'none' : '1px solid #E2E8F0',
                      boxShadow: isCurrent ? '0 2px 8px rgba(91, 45, 144, 0.3)' : 'none',
                      '&:hover': {
                        bgcolor: isCurrent ? '#17366E' : '#F1F5F9',
                        color: isCurrent ? '#FFFFFF' : '#0F172A',
                      },
                    }}
                  >
                    {p + 1}
                  </Button>
                );
              });
            })()}

            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              sx={{
                width: 32,
                height: 32,
                color: '#64748B',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.5,
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
              }}
            >
              <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              size="small"
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(totalPages - 1)}
              sx={{
                width: 32,
                height: 32,
                color: '#64748B',
                bgcolor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.5,
                '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
              }}
            >
              <LastPageRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
