'use client';

import React, { useState } from 'react';
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
  LinearProgress,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import FacultyInviteStudentsModal from './FacultyInviteStudentsModal';
import type { FacultyBatchItem } from '@/data';

export type { FacultyBatchItem };

interface FacultyBatchesTabProps {
  batches: FacultyBatchItem[];
  collegeName: string;
  collegeId?: string;
}

export default function FacultyBatchesTab({ batches, collegeName, collegeId }: FacultyBatchesTabProps) {
  const [search, setSearch] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedBatchForInvite, setSelectedBatchForInvite] = useState<string | undefined>(undefined);

  const borderColor = '#E2E8F0';

  const filteredBatches = batches.filter((b) => {
    if (!search) return true;
    return (
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleOpenInviteModal = (batchId?: string) => {
    setSelectedBatchForInvite(batchId);
    setIsInviteModalOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Search & Action Header */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 260 }}>
          <TextField
            size="small"
            placeholder="Search cohort by name, batch code..."
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
            sx={{ maxWidth: 360, width: '100%' }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>
            Showing <strong>{filteredBatches.length}</strong> of {batches.length} Assigned Cohorts in {collegeName}
          </Typography>

          <Button
            variant="contained"
            size="small"
            startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 17 }} />}
            onClick={() => handleOpenInviteModal()}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              px: 2,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1D4ED8',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              },
            }}
          >
            Invite Students
          </Button>
        </Box>
      </Card>

      {/* Structured List Table */}
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
                  COHORT NAME & CODE
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  ACADEMIC YEAR
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  STUDENT ENROLLMENT
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  COURSES ASSIGNED
                </TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>
                  AVG ACCURACY
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
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#94A3B8' }}>
                    <SchoolRoundedIcon sx={{ fontSize: 36, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748B' }}>
                      No assigned cohorts found matching your criteria.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => {
                  const hasCapacity = batch.maxCapacity !== null && batch.maxCapacity !== undefined;
                  const maxCap = hasCapacity ? batch.maxCapacity : undefined;
                  const studentCount = batch.studentsCount || 0;
                  const capacityPercent = hasCapacity && maxCap! > 0
                    ? Math.round((studentCount / maxCap!) * 100)
                    : (hasCapacity && maxCap === 0 ? 100 : 0);
                  const avgAccuracyDisplay =
                    batch.avgAccuracy !== null && batch.avgAccuracy !== undefined && batch.avgAccuracy !== ''
                      ? batch.avgAccuracy
                      : 'N/A';
                  return (
                    <TableRow key={batch.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
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
                              fontWeight: 800,
                              fontSize: '0.8rem',
                            }}
                          >
                            {batch.name.slice(0, 2).toUpperCase()}
                          </Box>
                          <Box>
                            <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                              {batch.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                              {batch.code}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                          {batch.year || '2026–2027'}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 2, minWidth: 160 }}>
                        <Box sx={{ width: '100%', maxWidth: 140 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                              {studentCount}{hasCapacity ? ` / ${maxCap}` : ''}
                            </Typography>
                            {hasCapacity && (
                              <Typography sx={{ fontSize: '0.74rem', color: '#2563EB', fontWeight: 700 }}>
                                {capacityPercent}%
                              </Typography>
                            )}
                          </Box>
                          {hasCapacity && (
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, capacityPercent)}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: '#E2E8F0',
                                '& .MuiLinearProgress-bar': { bgcolor: capacityPercent > 90 ? '#EF4444' : '#2563EB', borderRadius: 3 },
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
                          {batch.coursesAssigned} Courses & Labs
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#059669' }}>
                          {avgAccuracyDisplay}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 2 }}>
                        <Chip
                          label={batch.status || 'Active'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: '#ECFDF5',
                            border: '1px solid #A7F3D0',
                            color: '#059669',
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 3, py: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => handleOpenInviteModal(batch.id)}
                          sx={{
                            textTransform: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: '#2563EB',
                            borderColor: '#BFDBFE',
                            bgcolor: '#EFF6FF',
                            borderRadius: '8px',
                            py: 0.4,
                            px: 1.25,
                            '&:hover': {
                              bgcolor: '#DBEAFE',
                              borderColor: '#93C5FD',
                            },
                          }}
                        >
                          Invite
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

      {/* Invite Students Modal */}
      <FacultyInviteStudentsModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        collegeId={collegeId}
        collegeName={collegeName}
        batches={batches}
        preSelectedBatchId={selectedBatchForInvite}
      />
    </Box>
  );
}
