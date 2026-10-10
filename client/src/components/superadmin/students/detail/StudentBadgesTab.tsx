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
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { StudentBadgeItem } from './types';
import PaginationToolbar from './PaginationToolbar';

interface StudentBadgesTabProps {
  badges: StudentBadgeItem[];
}

export default function StudentBadgesTab({ badges }: StudentBadgesTabProps) {
  const [badgeSearch, setBadgeSearch] = useState('');
  const [badgePage, setBadgePage] = useState<number>(0);
  const [badgeRowsPerPage, setBadgeRowsPerPage] = useState<number>(10);
  const borderColor = '#E2E8F0';

  const filteredBadges = badges.filter((b) => {
    if (
      badgeSearch &&
      !b.title.toLowerCase().includes(badgeSearch.toLowerCase()) &&
      !b.issuer.toLowerCase().includes(badgeSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const paginatedBadges = filteredBadges.slice(
    badgePage * badgeRowsPerPage,
    badgePage * badgeRowsPerPage + badgeRowsPerPage
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Badges Filter bar */}
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
          placeholder="Search credentials & badges..."
          value={badgeSearch}
          onChange={(e) => {
            setBadgeSearch(e.target.value);
            setBadgePage(0);
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
          Showing <strong style={{ color: '#0F172A' }}>{filteredBadges.length}</strong> verified credentials
        </Typography>
      </Card>

      {/* Badges Table */}
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
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>CREDENTIAL / BADGE</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>CATEGORY</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ISSUER</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ISSUE DATE</TableCell>
                <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>CREDENTIAL ID</TableCell>
                <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedBadges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                    No verified credentials or badges found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBadges.map((b) => (
                  <TableRow key={b.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                    <TableCell sx={{ pl: 3, py: 1.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FAF5FF', color: '#0B1F3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <MilitaryTechRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                          {b.title}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ py: 1.75 }}>
                      <Chip label={b.category} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569', borderRadius: '5px' }} />
                    </TableCell>

                    <TableCell sx={{ py: 1.75, fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                      {b.issuer}
                    </TableCell>

                    <TableCell sx={{ py: 1.75, fontSize: '0.78rem', color: '#64748B' }}>
                      {b.issueDate}
                    </TableCell>

                    <TableCell sx={{ py: 1.75, fontFamily: 'monospace', fontSize: '0.76rem', color: '#475569' }}>
                      {b.credentialId}
                    </TableCell>

                    <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                      <Chip
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                        label="Verified"
                        size="small"
                        sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: '5px' }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Badges Pagination */}
      <PaginationToolbar
        totalEntries={filteredBadges.length}
        currentPage={badgePage}
        rowsPerPage={badgeRowsPerPage}
        onPageChange={setBadgePage}
        onRowsPerPageChange={setBadgeRowsPerPage}
        itemLabel="credentials"
        rowsOptions={[5, 10, 20]}
      />
    </Box>
  );
}
