'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import { StudentTopicItem } from './types';
import PaginationToolbar from './PaginationToolbar';

interface StudentTopicsTabProps {
  topics: StudentTopicItem[];
}

export default function StudentTopicsTab({ topics }: StudentTopicsTabProps) {
  const [topicSearch, setTopicSearch] = useState('');
  const [topicPage, setTopicPage] = useState<number>(0);
  const [topicRowsPerPage, setTopicRowsPerPage] = useState<number>(10);
  const borderColor = '#E2E8F0';

  const filteredTopics = topics.filter((t) => {
    if (
      topicSearch &&
      !t.topicName.toLowerCase().includes(topicSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const paginatedTopics = filteredTopics.slice(
    topicPage * topicRowsPerPage,
    topicPage * topicRowsPerPage + topicRowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Topic Filter bar */}
      <Card
        elevation={0}
        sx={{
          p: 2,
          px: 2.5,
          borderRadius: '14px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <TextField
          size="small"
          placeholder="Search topic domain..."
          value={topicSearch}
          onChange={(e) => {
            setTopicSearch(e.target.value);
            setTopicPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#64748B', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            minWidth: { xs: '100%', sm: 300 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
              bgcolor: '#F8FAFC',
              fontSize: '0.84rem',
              height: 36,
              '& fieldset': { borderColor: '#E2E8F0' },
            },
          }}
        />

        <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A' }}>{filteredTopics.length}</strong> skill domains
        </Typography>
      </Card>

      {/* Topics Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>TOPIC DOMAIN</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SOLVED COUNT</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>CATALOG COMPLETION</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ACCURACY</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>MASTERY LEVEL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                    No topic domains found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTopics.map((top) => {
                  const pct = top.totalAvailable > 0
                    ? Math.min(100, Math.max(0, Math.round((top.solvedCount / top.totalAvailable) * 100)))
                    : 0;

                  return (
                    <TableRow key={top.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                      <TableCell sx={{ pl: 3, py: 1.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FAF5FF', color: '#0B1F3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CategoryRoundedIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                            {top.topicName}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                          {top.solvedCount}{' '}
                          <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>/ {top.totalAvailable}</span>
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Box sx={{ minWidth: 160 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                              {pct}% Solved
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#0B1F3A', borderRadius: 3 } }}
                          />
                        </Box>
                      </TableCell>

                      <TableCell sx={{ py: 1.75 }}>
                        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#059669' }}>
                          {top.accuracy}
                        </Typography>
                      </TableCell>

                      <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                        <Chip
                          label={top.levelMastery}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            bgcolor: top.levelMastery === 'Master' ? '#FEF2F2' : top.levelMastery === 'Proficient' ? '#FAF5FF' : '#F1F5F9',
                            color: top.levelMastery === 'Master' ? '#DC2626' : top.levelMastery === 'Proficient' ? '#0B1F3A' : '#475569',
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
      </Card>

      {/* Topics Pagination */}
      <PaginationToolbar
        totalEntries={filteredTopics.length}
        currentPage={topicPage}
        rowsPerPage={topicRowsPerPage}
        onPageChange={setTopicPage}
        onRowsPerPageChange={setTopicRowsPerPage}
        itemLabel="topics"
        rowsOptions={[5, 10, 20]}
      />
    </Box>
  );
}
