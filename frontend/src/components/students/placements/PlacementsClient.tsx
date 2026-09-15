'use client';

import React, { useState } from 'react';
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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useToast } from '@/context/ToastContext';

interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  packageLpa: string;
  location: string;
  minRating: number;
  eligibility: boolean;
  status: 'Open' | 'Applied' | 'OA Cleared' | 'Interview' | 'Offered';
  deadline: string;
  openingsCount: number;
  logoBg: string;
  description: string;
}

const DRIVES: PlacementDrive[] = [
  {
    id: 'drv-1',
    company: 'Atlassian India',
    role: 'Graduate Software Engineer (Backend / SRE)',
    packageLpa: '₹34.5 LPA',
    location: 'Bengaluru / Remote',
    minRating: 1500,
    eligibility: true,
    status: 'Applied',
    deadline: 'In 3 Days',
    openingsCount: 15,
    logoBg: '#0052CC',
    description: 'Work on Jira Cloud infrastructure, distributed microservices, and high-concurrency event pipelines.',
  },
  {
    id: 'drv-2',
    company: 'CRED',
    role: 'Full-Stack Product Engineer',
    packageLpa: '₹28.0 LPA',
    location: 'Bengaluru',
    minRating: 1450,
    eligibility: true,
    status: 'OA Cleared',
    deadline: 'Tomorrow',
    openingsCount: 8,
    logoBg: '#111827',
    description: 'Build premium user interfaces in React Native and scalable transaction ledgers in Go.',
  },
  {
    id: 'drv-3',
    company: 'Razorpay',
    role: 'Associate Software Development Engineer',
    packageLpa: '₹24.0 LPA',
    location: 'Bengaluru',
    minRating: 1400,
    eligibility: true,
    status: 'Open',
    deadline: 'In 6 Days',
    openingsCount: 20,
    logoBg: '#0C2340',
    description: 'Payment routing engine development, webhook reliability, and banking API integrations.',
  },
  {
    id: 'drv-4',
    company: 'Microsoft IDC',
    role: 'Software Engineer - Azure Core',
    packageLpa: '₹42.0 LPA',
    location: 'Hyderabad',
    minRating: 1600,
    eligibility: true,
    status: 'Open',
    deadline: 'In 5 Days',
    openingsCount: 25,
    logoBg: '#00A4EF',
    description: 'Hyper-scale cloud virtualization, distributed storage nodes, and kernel networking optimizations.',
  },
];

export default function PlacementsClient() {
  const toast = useToast();
  const [drives, setDrives] = useState<PlacementDrive[]>(DRIVES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  const filtered = drives.filter((d) => {
    const matchesSearch =
      d.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApply = (drive: PlacementDrive) => {
    setDrives((prev) =>
      prev.map((d) => (d.id === drive.id ? { ...d, status: 'Applied' } : d))
    );
    setSelectedDrive(null);
    toast.success(`Application submitted to ${drive.company} for ${drive.role}! Verified Skill Passport attached.`, 'Application Submitted');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Header Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              <LocationOnOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Campus Placements & Partner Job Drives
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Verified college placement portal with instant 1-click Skill Passport application pipeline
              </Typography>
            </Box>
          </Box>

          <Chip
            label="4 Active Drives Open"
            size="small"
            sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.78rem', height: 28, borderRadius: '8px' }}
          />
        </Box>

        {/* Search and status filters */}
        <Box sx={{ display: 'flex', gap: 1.5, mt: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search company, job role, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, minWidth: 260, '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: '#F8FAFC', fontSize: '0.84rem' } }}
          />

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['ALL', 'Open', 'Applied', 'OA Cleared'].map((st) => (
              <Chip
                key={st}
                label={st}
                onClick={() => setStatusFilter(st)}
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  borderRadius: '8px',
                  bgcolor: statusFilter === st ? '#2563EB' : '#F1F5F9',
                  color: statusFilter === st ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* 2. Structured Placements Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>COMPANY & ROLE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PACKAGE (CTC)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>LOCATION</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ELIGIBILITY</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>APPLICATION STATUS</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>ACTION</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id} hover sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 'none' } }} onClick={() => setSelectedDrive(d)}>
                  <TableCell sx={{ py: 2.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: d.logoBg, width: 38, height: 38, fontSize: '0.86rem', fontWeight: 800 }}>
                        {d.company[0]}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>
                          {d.company}
                        </Typography>
                        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                          {d.role}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 900, color: '#0F172A', fontSize: '0.9rem' }}>
                    {d.packageLpa}
                  </TableCell>

                  <TableCell sx={{ color: '#475569', fontSize: '0.84rem' }}>
                    {d.location}
                  </TableCell>

                  <TableCell>
                    <Chip
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
                      label="Eligible (Rating > 1400)"
                      size="small"
                      sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.72rem', borderRadius: '6px' }}
                    />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={d.status}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: d.status === 'OA Cleared' ? '#ECFDF5' : d.status === 'Applied' ? '#EFF6FF' : '#F1F5F9',
                        color: d.status === 'OA Cleared' ? '#059669' : d.status === 'Applied' ? '#2563EB' : '#475569',
                      }}
                    />
                  </TableCell>

                  <TableCell align="right">
                    <Button
                      size="small"
                      variant={d.status === 'Open' ? 'contained' : 'outlined'}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (d.status === 'Open') {
                          handleApply(d);
                        } else {
                          setSelectedDrive(d);
                        }
                      }}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        bgcolor: d.status === 'Open' ? '#2563EB' : 'transparent',
                      }}
                    >
                      {d.status === 'Open' ? '1-Click Apply' : 'View Status'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* 3. Job Drive Detail Dialog */}
      <Dialog
        open={Boolean(selectedDrive)}
        onClose={() => setSelectedDrive(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        {selectedDrive && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                  {selectedDrive.company}
                </Typography>
                <Typography sx={{ fontSize: '0.84rem', color: '#2563EB', fontWeight: 700, mt: 0.25 }}>
                  {selectedDrive.role} • {selectedDrive.packageLpa}
                </Typography>
              </Box>
              <IconButton onClick={() => setSelectedDrive(null)} size="small">
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
                {selectedDrive.description}
              </Typography>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#0F172A' }}>
                  Drive Details:
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  • Location: <strong>{selectedDrive.location}</strong>
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  • Total Hiring Openings: <strong>{selectedDrive.openingsCount} Positions</strong>
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                  • Application Deadline: <strong>{selectedDrive.deadline}</strong>
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0 }}>
              <Button onClick={() => setSelectedDrive(null)} sx={{ textTransform: 'none', borderRadius: '10px' }}>
                Close
              </Button>
              {selectedDrive.status === 'Open' && (
                <Button
                  variant="contained"
                  startIcon={<SendRoundedIcon />}
                  onClick={() => handleApply(selectedDrive)}
                  sx={{ bgcolor: '#2563EB', textTransform: 'none', borderRadius: '10px', fontWeight: 700 }}
                >
                  Submit 1-Click Application
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
