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
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.25)', bgcolor: '#0F172A', p: 3, boxShadow: '0 8px 30px rgba(0,0,0,0.4)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', mb: 2.5 }}>
        Competitive Contest Performance Log
      </Typography>

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'rgba(30, 41, 59, 0.8)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', py: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }}>CONTEST NAME</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>DATE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>RANK / TOTAL</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>SCORE & PENALTY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>RATING DELTA</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#94A3B8', fontSize: '0.8rem', borderColor: 'rgba(255, 255, 255, 0.08)' }}>NEW RATING</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contests.map((c) => (
              <TableRow key={c.id} hover sx={{ '&:hover': { bgcolor: 'rgba(30, 41, 59, 0.5) !important' } }}>
                <TableCell sx={{ fontWeight: 700, color: '#F8FAFC', borderColor: 'rgba(255, 255, 255, 0.06)' }}>{c.contestName}</TableCell>
                <TableCell sx={{ color: '#94A3B8', fontSize: '0.84rem', borderColor: 'rgba(255, 255, 255, 0.06)' }}>{c.contestDate}</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#38BDF8', fontSize: '0.86rem', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  #{c.rank} / {c.totalParticipants.toLocaleString()}
                </TableCell>
                <TableCell sx={{ color: '#CBD5E1', fontSize: '0.86rem', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  <strong style={{ color: '#FFFFFF' }}>{c.score} pts</strong> • {c.penaltyTime}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: c.ratingDelta > 0 ? '#4ADE80' : '#F87171', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
                  {c.ratingDelta > 0 ? `+${c.ratingDelta}` : c.ratingDelta}
                </TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#FFFFFF', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
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
