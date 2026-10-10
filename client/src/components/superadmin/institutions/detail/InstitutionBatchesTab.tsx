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
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { BatchItem } from './types';

interface InstitutionBatchesTabProps {
  batches: BatchItem[];
  onOpenCreateBatch: () => void;
  onOpenEditBatch: (batch: BatchItem) => void;
  onDeleteBatch: (batch: BatchItem) => void;
}

export default function InstitutionBatchesTab({
  batches,
  onOpenCreateBatch,
  onOpenEditBatch,
  onDeleteBatch,
}: InstitutionBatchesTabProps) {
  const [search, setSearch] = useState('');

  const filteredBatches = useMemo(() => {
    return batches.filter(
      (b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.code.toLowerCase().includes(search.toLowerCase()) ||
        b.facultyLead.toLowerCase().includes(search.toLowerCase())
    );
  }, [batches, search]);

  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Academic Batches & Student Cohorts
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Manage cohort rosters, faculty coordinators, and batch capacity limits.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search batches, faculty lead..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
          />

          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenCreateBatch}
            sx={{
              bgcolor: '#0B1F3A',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              '&:hover': { bgcolor: '#17366E' },
            }}
          >
            New Batch
          </Button>
        </Box>
      </Box>

      {filteredBatches.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
          <SchoolRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, color: '#475569' }}>
            No batches found matching search.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>BATCH NAME & CODE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>FACULTY MENTORS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>CAPACITY & ENROLLED</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>COURSES</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>AVG ACCURACY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBatches.map((b) => {
                const capPct = Math.min(100, Math.round((b.studentsCount / (b.maxCapacity || 1)) * 100));
                return (
                  <TableRow key={b.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                        {b.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                        {b.code} • Class of {b.year}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.86rem', fontWeight: 600 }}>
                      {b.faculty && b.faculty.length > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', maxWidth: 220 }}>
                          {b.faculty.slice(0, 2).map((f: any, fIdx: number) => (
                            <Chip
                              key={f.id || f.user?.id || fIdx}
                              label={f.user?.name || 'Faculty'}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.72rem',
                                fontWeight: 600,
                                bgcolor: '#FAF5FF',
                                color: '#5B2D90',
                                border: '1px solid #C7D2FE',
                              }}
                            />
                          ))}
                          {b.faculty.length > 2 && (
                            <Tooltip title={b.faculty.map((f: any) => f.user?.name).filter(Boolean).join(', ')}>
                              <Chip
                                label={`+${b.faculty.length - 2} more`}
                                size="small"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }}
                              />
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography sx={{ color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                          {b.facultyLead || 'Unassigned'}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 140 }}>
                        <LinearProgress
                          variant="determinate"
                          value={capPct}
                          sx={{
                            flex: 1,
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: capPct > 90 ? '#DC2626' : '#0B1F3A',
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                          {b.studentsCount}/{b.maxCapacity}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.84rem' }}>
                      {b.coursesAssigned} Courses
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800, color: '#16A34A', fontSize: '0.85rem' }}>
                      {b.avgAccuracy}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={b.status}
                        size="small"
                        sx={{
                          bgcolor: b.status === 'Active' ? '#ECFDF5' : '#F1F5F9',
                          color: b.status === 'Active' ? '#059669' : '#64748B',
                          border: `1px solid ${b.status === 'Active' ? '#A7F3D0' : '#E2E8F0'}`,
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ textAlign: 'right' }}>
                      <Tooltip title="Edit Batch">
                        <IconButton
                          size="small"
                          onClick={() => onOpenEditBatch(b)}
                          sx={{ color: '#64748B', '&:hover': { color: '#0B1F3A', bgcolor: '#FAF5FF' } }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Batch">
                        <IconButton
                          size="small"
                          onClick={() => onDeleteBatch(b)}
                          sx={{ color: '#64748B', '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
