'use client';

import React from 'react';
import {
  Typography,
  Card,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import { StudentContestHistory } from '@/types/student-profile';

interface StudentContestsTabProps {
  contests: StudentContestHistory[];
}

export default function StudentContestsTab({ contests }: StudentContestsTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2.5 }}>
        Competitive Contest Performance Log
      </Typography>

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>CONTEST NAME</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DATE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>RANK / TOTAL</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SCORE & PENALTY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>RATING DELTA</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>NEW RATING</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.map((c) => (
              <TableRow key={c.id} hover>
                <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{c.contestName}</TableCell>
                <TableCell sx={{ color: '#64748B', fontSize: '0.84rem' }}>{c.contestDate}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2563EB', fontSize: '0.86rem' }}>
                  #{c.rank} / {c.totalParticipants.toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>
                  <strong>{c.score} pts</strong> • {c.penaltyTime}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: c.ratingDelta > 0 ? '#16A34A' : '#DC2626' }}>
                  {c.ratingDelta > 0 ? `+${c.ratingDelta}` : c.ratingDelta}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                  {c.newRating}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
