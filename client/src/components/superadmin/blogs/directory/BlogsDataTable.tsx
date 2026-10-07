'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Checkbox,
  Avatar,
  Select,
  MenuItem,
} from '@mui/material';
import Link from 'next/link';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { BlogPost, formatBlogDate } from '@/types/blog';

interface BlogsDataTableProps {
  paginatedBlogs: BlogPost[];
  selectedBlogIds: string[];
  selectedOnCurrentPageCount: number;
  onSelectAll: (checked: boolean) => void;
  onToggleSelect: (id: string) => void;
  sortField: keyof BlogPost;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof BlogPost) => void;
  onReadBlog: (b: BlogPost) => void;
  onEditBlog: (b: BlogPost) => void;
  onDeleteBlog: (b: BlogPost) => void;
  page: number;
  totalPages: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
}

export default function BlogsDataTable({
  paginatedBlogs,
  selectedBlogIds,
  selectedOnCurrentPageCount,
  onSelectAll,
  onToggleSelect,
  sortField,
  sortDirection,
  onSort,
  onReadBlog,
  onEditBlog,
  onDeleteBlog,
  page,
  totalPages,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: BlogsDataTableProps) {
  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Table */}
      <TableContainer sx={{ minHeight: 380 }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                <Checkbox
                  size="small"
                  checked={paginatedBlogs.length > 0 && selectedOnCurrentPageCount === paginatedBlogs.length}
                  indeterminate={selectedOnCurrentPageCount > 0 && selectedOnCurrentPageCount < paginatedBlogs.length}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell onClick={() => onSort('title')} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                ARTICLE & TITLE {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell onClick={() => onSort('category')} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                CATEGORY & TAGS {sortField === 'category' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                AUTHOR & COLLEGE
              </TableCell>
              <TableCell onClick={() => onSort('views')} sx={{ cursor: 'pointer', fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em', textAlign: 'center' }}>
                METRICS (VIEWS / CLAPS) {sortField === 'views' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em' }}>
                READ TIME
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em', textAlign: 'center' }}>
                STATUS
              </TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.74rem', color: '#64748B', letterSpacing: '0.04em', textAlign: 'right', pr: 3 }}>
                ACTIONS
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#64748B' }}>
                  No articles match the current filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedBlogs.map((b) => {
                const isSelected = selectedBlogIds.includes(b.id);
                return (
                  <TableRow
                    key={b.id}
                    hover
                    selected={isSelected}
                    sx={{
                      '& td': { borderBottom: `1px solid #F1F5F9` },
                      '&:hover': { bgcolor: '#F8FAFC !important' },
                    }}
                  >
                    <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                      <Checkbox size="small" checked={isSelected} onChange={() => onToggleSelect(b.id)} />
                    </TableCell>

                    {/* Article Title & Cover */}
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          component="img"
                          src={b.coverImage}
                          alt={b.title}
                          sx={{ width: 56, height: 40, borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0', flexShrink: 0 }}
                        />
                        <Box sx={{ minWidth: 0, maxWidth: 380 }}>
                          <Typography
                            onClick={() => onReadBlog(b)}
                            sx={{
                              fontSize: '0.88rem',
                              fontWeight: 700,
                              color: '#0F172A',
                              cursor: 'pointer',
                              '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {b.title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}>
                            {b.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Category & Tags */}
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip
                          size="small"
                          label={b.category}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            bgcolor: '#EFF6FF',
                            color: '#2563EB',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            width: 'fit-content',
                          }}
                        />
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {b.tags.slice(0, 2).map((t) => (
                            <Typography key={t} sx={{ fontSize: '0.68rem', color: '#64748B', bgcolor: '#F1F5F9', px: 0.75, py: 0.2, borderRadius: '4px' }}>
                              #{t}
                            </Typography>
                          ))}
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Author & College */}
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar src={b.author.avatarImg} sx={{ width: 28, height: 28, bgcolor: b.author.avatarBg, fontSize: '0.75rem', fontWeight: 700 }}>
                          {b.author.name[0]}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                            {b.author.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {b.author.college}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Metrics */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <Tooltip title="Total Views">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#475569' }}>
                            <VisibilityOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{b.views.toLocaleString()}</Typography>
                          </Box>
                        </Tooltip>
                        <Tooltip title="Total Claps">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#DC2626' }}>
                            <FavoriteRoundedIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{b.claps}</Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                    </TableCell>

                    {/* Read Time */}
                    <TableCell>
                      <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                        {b.readTime}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        {formatBlogDate(b.publishedAt)}
                      </Typography>
                    </TableCell>

                    {/* Status */}
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={b.status || 'Published'}
                        sx={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          bgcolor: b.status === 'Draft' ? '#FEF3C7' : b.status === 'Archived' ? '#F1F5F9' : '#ECFDF5',
                          color: b.status === 'Draft' ? '#D97706' : b.status === 'Archived' ? '#64748B' : '#059669',
                          border: `1px solid ${b.status === 'Draft' ? '#FDE68A' : b.status === 'Archived' ? '#CBD5E1' : '#A7F3D0'}`,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ pr: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Read Article (Modal Preview)">
                          <IconButton size="small" onClick={() => onReadBlog(b)} sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}>
                            <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Open Dynamic Reading & Editing Page">
                          <IconButton component={Link} href={`/superadmin/blogs/${b.id}`} size="small" sx={{ color: '#0F172A', '&:hover': { bgcolor: '#F1F5F9' } }}>
                            <OpenInNewRoundedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Article (TipTap Editor)">
                          <IconButton
                            size="small"
                            onClick={() => onEditBlog(b)}
                            sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}
                          >
                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Article">
                          <IconButton
                            size="small"
                            onClick={() => onDeleteBlog(b)}
                            sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Toolbar */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#F8FAFC', borderTop: `1px solid ${borderColor}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>Rows per page:</Typography>
          <Select
            size="small"
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
            }}
            sx={{ bgcolor: '#FFFFFF', borderRadius: '8px', fontSize: '0.8rem', height: 32 }}
          >
            <MenuItem value={5}>5</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
            Page {page + 1} of {totalPages}
          </Typography>
          <IconButton size="small" disabled={page === 0} onClick={() => onPageChange(0)}>
            <FirstPageRoundedIcon />
          </IconButton>
          <IconButton size="small" disabled={page === 0} onClick={() => onPageChange(Math.max(0, page - 1))}>
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
            <ChevronRightRoundedIcon />
          </IconButton>
          <IconButton size="small" disabled={page >= totalPages - 1} onClick={() => onPageChange(totalPages - 1)}>
            <LastPageRoundedIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
