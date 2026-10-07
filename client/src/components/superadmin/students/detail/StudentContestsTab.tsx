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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { StudentContestItem } from './types';
import PaginationToolbar from './PaginationToolbar';

interface StudentContestsTabProps {
  contests: StudentContestItem[];
}

export default function StudentContestsTab({ contests }: StudentContestsTabProps) {
  const [contestSearch, setContestSearch] = useState('');
  const [contestPage, setContestPage] = useState<number>(0);
  const [contestRowsPerPage, setContestRowsPerPage] = useState<number>(10);
  const borderColor = '#E2E8F0';

  const filteredContests = contests.filter((c) => {
    if (
      contestSearch &&
      !c.contestName.toLowerCase().includes(contestSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const paginatedContests = filteredContests.slice(
    contestPage * contestRowsPerPage,
    contestPage * contestRowsPerPage + contestRowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Contest Filter bar */}
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
          placeholder="Search contest title..."
          value={contestSearch}
          onChange={(e) => {
            setContestSearch(e.target.value);
            setContestPage(0);
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
          Showing <strong style={{ color: '#0F172A' }}>{filteredContests.length}</strong> contested matches
        </Typography>
      </Card>

      {/* Contest Table */}
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
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>CONTEST NAME</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>DATE</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>RANK SECURED</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SOLVED IN MATCH</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>PENALTY TIME</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>RATING DELTA</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>NEW RATING</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedContests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                    No contested matches found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedContests.map((cnt) => (
                  <TableRow key={cnt.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                    <TableCell sx={{ pl: 3, py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <EmojiEventsRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                          {cnt.contestName}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.75, fontSize: '0.8rem', color: '#64748B' }}>
                      {cnt.contestDate}
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, color: '#0F172A' }}>
                        #{cnt.rank}{' '}
                        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>/ {cnt.totalParticipants}</span>
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Chip label={`${cnt.problemsSolved} Solved`} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', borderRadius: '5px' }} />
                    </TableCell>

                    <TableCell sx={{ py: 1.75, fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                      {cnt.penaltyTime}
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Typography
                        sx={{
                          fontSize: '0.84rem',
                          fontWeight: 800,
                          color: cnt.ratingDelta >= 0 ? '#16A34A' : '#DC2626',
                        }}
                      >
                        {cnt.ratingDelta >= 0 ? `+${cnt.ratingDelta}` : cnt.ratingDelta}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                      <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A' }}>
                        {cnt.newRating}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Contests Pagination */}
      <PaginationToolbar
        totalEntries={filteredContests.length}
        currentPage={contestPage}
        rowsPerPage={contestRowsPerPage}
        onPageChange={setContestPage}
        onRowsPerPageChange={setContestRowsPerPage}
        itemLabel="contests"
        rowsOptions={[5, 10, 20]}
      />
    </Box>
  );
}
