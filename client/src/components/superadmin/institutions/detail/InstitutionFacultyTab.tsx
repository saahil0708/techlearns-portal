'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { FacultyItem } from './types';

interface InstitutionFacultyTabProps {
  faculty: FacultyItem[];
  onOpenInviteFaculty: () => void;
}

export default function InstitutionFacultyTab({
  faculty,
  onOpenInviteFaculty,
}: InstitutionFacultyTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
            Faculty Coordinators & Mentors Directory
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
            Educators and lab coordinators overseeing student batches and problem authoring.
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddRoundedIcon />}
          onClick={onOpenInviteFaculty}
          sx={{
            bgcolor: '#0B1F3A',
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 700,
            '&:hover': { bgcolor: '#17366E' },
          }}
        >
          Invite Faculty
        </Button>
      </Box>

      {faculty.length === 0 ? (
        <Box sx={{ py: 6, textAlign: 'center', color: '#94A3B8' }}>
          <SupervisorAccountRoundedIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
          <Typography sx={{ fontWeight: 700, color: '#475569' }}>
            No faculty members registered for this institution yet.
          </Typography>
        </Box>
      ) : (
        <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>NAME & EMAIL</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>DEPARTMENT</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ROLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ACTIVE BATCHES</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>JOINED DATE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {faculty.map((f) => (
                <TableRow key={f.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#FAF5FF', color: '#0B1F3A', fontWeight: 700 }}>
                        {f.name[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.86rem' }}>
                          {f.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          {f.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>
                    {f.department}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={f.role}
                      size="small"
                      sx={{
                        bgcolor: '#FAF5FF',
                        color: '#0B1F3A',
                        border: '1px solid #FAF5FF',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.84rem' }}>
                    {f.activeBatches} Batches
                  </TableCell>
                  <TableCell sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                    {f.joinedDate}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={f.status}
                      size="small"
                      sx={{
                        bgcolor: f.status === 'Active' ? '#ECFDF5' : '#FFFBEB',
                        color: f.status === 'Active' ? '#059669' : '#D97706',
                        border: `1px solid ${f.status === 'Active' ? '#A7F3D0' : '#FDE68A'}`,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
