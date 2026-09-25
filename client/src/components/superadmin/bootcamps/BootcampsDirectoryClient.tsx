'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

// Icons
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';

import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import CreateBootcampModal from './CreateBootcampModal';
import DeleteConfirmModal from '@/components/superadmin/shared/DeleteConfirmModal';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

interface BootcampsDirectoryClientProps {
  initialBootcamps: any[];
  initialError?: string | null;
}

export default function BootcampsDirectoryClient({ initialBootcamps, initialError }: BootcampsDirectoryClientProps) {
  const toast = useToast();
  const [bootcamps, setBootcamps] = useState<any[]>(initialBootcamps);
  const [error, setError] = useState<string | null>(initialError || null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const refreshBootcamps = async () => {
    try {
      setLoading(true);
      setError(null);
      let curPage = 1;
      let totalPages = 1;
      const allItems: any[] = [];

      do {
        const data = await apiService.getBootcamps({ page: curPage, limit: 100 });
        if (data?.items) {
          allItems.push(...data.items);
          totalPages = data.totalPages || 1;
        }
        curPage++;
      } while (curPage <= totalPages);

      setBootcamps(allItems);
      setPage(0);
    } catch (err: any) {
      setError(err?.message || 'Failed to reload bootcamps');
      toast.error('Failed to fetch bootcamps from server', 'Network Error');
    } finally {
      setLoading(false);
    }
  };

  // Distinct tracks
  const tracks = useMemo(() => {
    const set = new Set<string>();
    bootcamps.forEach((b) => {
      if (b.track) set.add(b.track);
    });
    return Array.from(set);
  }, [bootcamps]);

  // Filtered dataset
  const filtered = useMemo(() => {
    return bootcamps.filter((bc) => {
      const matchesSearch =
        bc.title?.toLowerCase().includes(search.toLowerCase()) ||
        bc.instructor?.toLowerCase().includes(search.toLowerCase()) ||
        bc.track?.toLowerCase().includes(search.toLowerCase());

      const matchesTrack = trackFilter === 'ALL' || bc.track === trackFilter;
      const matchesStatus = statusFilter === 'ALL' || (bc.rawStatus || bc.status) === statusFilter;

      return matchesSearch && matchesTrack && matchesStatus;
    });
  }, [bootcamps, search, trackFilter, statusFilter]);

  const paginated = useMemo(() => {
    return filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // Statistics (only real valid data)
  const stats = useMemo(() => {
    const total = bootcamps.length;
    const totalEnrolled = bootcamps.reduce(
      (acc, b) => acc + (typeof (b.enrolledStudents ?? b.enrolledCount) === 'number' ? (b.enrolledStudents ?? b.enrolledCount) : 0),
      0,
    );
    const ratedBootcamps = bootcamps.filter((b) => typeof b.rating === 'number' && !isNaN(b.rating));
    const avgRating =
      ratedBootcamps.length > 0
        ? (ratedBootcamps.reduce((acc, b) => acc + b.rating, 0) / ratedBootcamps.length).toFixed(2)
        : '—';
    const totalSessions = bootcamps.reduce(
      (acc, b) => acc + (typeof b.totalSessions === 'number' && !isNaN(b.totalSessions) ? b.totalSessions : 0),
      0,
    );

    return { total, totalEnrolled, avgRating, totalSessions };
  }, [bootcamps]);

  const handleCreated = (newBc: any) => {
    setBootcamps((prev) => [newBc, ...prev]);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiService.deleteBootcamp(deleteTarget.id);
      setBootcamps((prev) => {
        const nextList = prev.filter((b) => b.id !== deleteTarget.id);
        const remainingFiltered = nextList.filter((bc) => {
          const matchesSearch =
            bc.title?.toLowerCase().includes(search.toLowerCase()) ||
            bc.instructor?.toLowerCase().includes(search.toLowerCase()) ||
            bc.track?.toLowerCase().includes(search.toLowerCase());
          const matchesTrack = trackFilter === 'ALL' || bc.track === trackFilter;
          const matchesStatus = statusFilter === 'ALL' || (bc.rawStatus || bc.status) === statusFilter;
          return matchesSearch && matchesTrack && matchesStatus;
        });
        const maxPage = Math.max(0, Math.ceil(remainingFiltered.length / rowsPerPage) - 1);
        if (page > maxPage) {
          setPage(maxPage);
        }
        return nextList;
      });
      toast.success(`Bootcamp "${deleteTarget.title}" removed successfully`, 'Deleted');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete bootcamp', 'Error');
    }
  };

  const escapeCsvValue = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Track', 'Instructor', 'Duration', 'Level', 'Enrolled', 'Sessions', 'Rating', 'Status'];
    const rows = filtered.map((b) => [
      escapeCsvValue(b.title),
      escapeCsvValue(b.track),
      escapeCsvValue(b.instructor),
      escapeCsvValue(b.duration),
      escapeCsvValue(b.level),
      escapeCsvValue(b.enrolledStudents ?? b.enrolledCount ?? 0),
      escapeCsvValue(b.totalSessions ?? 0),
      escapeCsvValue(b.rating ?? '—'),
      escapeCsvValue(b.rawStatus || b.status || 'PUBLISHED'),
    ]);

    const csvData = [headers.map(escapeCsvValue).join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bootcamps_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTrackChipStyle = (track: string = '') => {
    const t = track.toLowerCase();
    if (t.includes('ai') || t.includes('llm') || t.includes('learning')) {
      return { bgcolor: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' };
    }
    if (t.includes('cloud') || t.includes('devops') || t.includes('sre') || t.includes('infra')) {
      return { bgcolor: '#E0F2FE', color: '#0284C7', border: '1px solid #BAE6FD' };
    }
    if (t.includes('system') || t.includes('backend') || t.includes('architect')) {
      return { bgcolor: '#F3E8FF', color: '#7C3AED', border: '1px solid #E9D5FF' };
    }
    if (t.includes('full') || t.includes('stack') || t.includes('web')) {
      return { bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' };
    }
    if (t.includes('cp') || t.includes('dsa') || t.includes('algo')) {
      return { bgcolor: '#DCFCE7', color: '#059669', border: '1px solid #BBF7D0' };
    }
    return { bgcolor: '#F1F5F9', color: '#475569', border: '1px solid #E2E8F0' };
  };

  const getStatusChipStyle = (rawStatus: string = '') => {
    const s = rawStatus.toUpperCase();
    if (s === 'PUBLISHED' || s === 'ACTIVE') {
      return { bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0' };
    }
    if (s === 'UPCOMING' || s === 'DRAFT') {
      return { bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' };
    }
    return { bgcolor: '#F1F5F9', color: '#64748B', border: '1px solid #E2E8F0' };
  };

  const borderColor = '#E2E8F0';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F4F5F7',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(37, 99, 235, 0.06) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(37, 99, 235, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(14, 165, 233, 0.04) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      <CurvedSidebar />

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            pb: { xs: 4, md: 6 },
          }}
        >
          {/* Top Header Navbar */}
          <Navbar />

          {/* Section Navigation Tabs: Contests vs Bootcamps */}
          <Box sx={{ display: 'inline-flex', p: 0.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <Link href="/superadmin/contests" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                startIcon={<EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: '#64748B',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.6,
                  '&:hover': { bgcolor: '#F8FAFC', color: '#0F172A' },
                }}
              >
                Contests & Tournaments
              </Button>
            </Link>
            <Link href="/superadmin/bootcamps" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                startIcon={<BoltRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#2563EB',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.6,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                }}
              >
                Live Bootcamps & Sprints
              </Button>
            </Link>
          </Box>

          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BoltRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Bootcamps & Industry Cohorts
                </Typography>
                <Chip
                  label="SkillOS Sprints"
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #DBEAFE',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    height: 22,
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
                Create, configure, and manage live industry sprint bootcamps, masterclasses, and capstones.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={handleExportCSV}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: '#475569',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  px: 1.75,
                  py: 0.75,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<AddCircleRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setCreateModalOpen(true)}
                sx={{
                  bgcolor: '#2563EB',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 2.25,
                  py: 0.75,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  '&:hover': {
                    bgcolor: '#1D4ED8',
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.5)',
                  },
                }}
              >
                Create Bootcamp
              </Button>
            </Box>
          </Box>

          {/* Stats Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Total Bootcamps"
              value={stats.total}
              icon={<LayersRoundedIcon sx={{ fontSize: 24 }} />}
              subtitle="Active on platform"
              variant="blue"
              shape="orbital"
              index={0}
            />
            <StatsCard
              title="Total Enrolled Students"
              value={stats.totalEnrolled.toLocaleString()}
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 24 }} />}
              subtitle="Across all cohorts"
              variant="black"
              shape="topography"
              index={1}
            />
            <StatsCard
              title="Total Live Masterclasses"
              value={stats.totalSessions}
              icon={<TimerOutlinedIcon sx={{ fontSize: 24 }} />}
              subtitle="Live sprint sessions"
              variant="blue"
              shape="hex-grid"
              index={2}
            />
            <StatsCard
              title="Average Cohort Rating"
              value={`${stats.avgRating} / 5.0`}
              icon={<StarRoundedIcon sx={{ fontSize: 24 }} />}
              subtitle="Industry benchmark"
              variant="black"
              shape="aurora-waves"
              index={3}
            />
          </Box>

          {/* List Table Card Standard */}
          <Card
            sx={{
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Controls Bar */}
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: '#FAFAFA',
              }}
            >
              <TextField
                size="small"
                placeholder="Search bootcamps, instructors, topics..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  minWidth: { xs: '100%', sm: 320 },
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '0.875rem',
                    borderRadius: '10px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                {/* Track Selector */}
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <Select
                    value={trackFilter}
                    onChange={(e) => {
                      setTrackFilter(e.target.value);
                      setPage(0);
                    }}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                      borderRadius: '10px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Tracks</MenuItem>
                    {tracks.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Status Selector */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(0);
                    }}
                    sx={{
                      bgcolor: '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.85rem',
                      borderRadius: '10px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="PUBLISHED">Published</MenuItem>
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="UPCOMING">Upcoming</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* List Table */}
            <TableContainer>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', py: 1.8, borderBottom: '1px solid #E2E8F0' }}>
                      Bootcamp & Track
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                      Lead Instructor
                    </TableCell>
                    <TableCell sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                      Duration & Level
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                      Enrolled
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                      Masterclasses
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                      Status
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: '#64748B' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <BoltRoundedIcon sx={{ fontSize: 40, color: error ? '#EF4444' : '#94A3B8' }} />
                          <Typography variant="body1" sx={{ color: error ? '#EF4444' : '#0F172A', fontWeight: 600 }}>
                            {error ? `Failed to load bootcamps: ${error}` : 'No bootcamps match the selected filters'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {error ? 'Please check your connection and retry' : 'Try adjusting your search term or track filter'}
                          </Typography>
                          {error && (
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={refreshBootcamps}
                              disabled={loading}
                              sx={{
                                mt: 1,
                                color: '#2563EB',
                                borderColor: '#2563EB',
                                textTransform: 'none',
                                fontWeight: 600,
                              }}
                            >
                              {loading ? 'Retrying...' : 'Retry Loading'}
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((bc) => {
                      const trackStyle = getTrackChipStyle(bc.track);
                      const statusStyle = getStatusChipStyle(bc.rawStatus || bc.status);

                      return (
                        <TableRow
                          key={bc.id}
                          hover
                          sx={{
                            '&:hover': { bgcolor: '#F8FAFC' },
                            borderBottom: '1px solid #F1F5F9',
                          }}
                        >
                          {/* Title & Track */}
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.92rem' }}>
                                  {bc.title}
                                </Typography>
                                {bc.badge && (
                                  <Chip
                                    label={bc.badge}
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      bgcolor: '#FEF3C7',
                                      color: '#D97706',
                                      border: '1px solid #FDE68A',
                                    }}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={bc.track}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    ...trackStyle,
                                  }}
                                />
                                {bc.subtitle && (
                                  <Typography variant="caption" sx={{ color: '#64748B', maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {bc.subtitle}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Instructor */}
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                              <Avatar
                                src={bc.instructorAvatar}
                                sx={{ width: 32, height: 32, bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.8rem', border: '1px solid #DBEAFE' }}
                              >
                                {bc.instructor ? bc.instructor.charAt(0) : 'I'}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.85rem' }}>
                                  {bc.instructor}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748B' }}>
                                  {bc.instructorRole || 'Lead Faculty'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Duration & Level */}
                          <TableCell>
                            <Typography variant="body2" sx={{ color: '#334155', fontSize: '0.85rem', fontWeight: 600 }}>
                              {bc.duration}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              {bc.level || 'Intermediate'}
                            </Typography>
                          </TableCell>

                          {/* Enrolled */}
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 700 }}>
                              {(bc.enrolledStudents ?? bc.enrolledCount ?? 0).toLocaleString()}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              / {bc.maxSeats || 100} seats
                            </Typography>
                          </TableCell>

                          {/* Sessions */}
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ color: '#7C3AED', fontWeight: 700 }}>
                              {bc.totalSessions || 12}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B' }}>
                              Sprints
                            </Typography>
                          </TableCell>

                          {/* Status */}
                          <TableCell align="center">
                            <Chip
                              label={bc.rawStatus || bc.status || 'PUBLISHED'}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                ...statusStyle,
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                              <Tooltip title="Delete Bootcamp">
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteTarget(bc)}
                                  sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239, 68, 68, 0.08)' } }}
                                >
                                  <DeleteOutlineRoundedIcon fontSize="small" />
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

            {/* Table Pagination */}
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 20, 50]}
              sx={{
                color: '#64748B',
                borderTop: '1px solid #E2E8F0',
                '& .MuiTablePagination-select': { color: '#0F172A' },
                '& .MuiTablePagination-actions button': { color: '#64748B' },
              }}
            />
          </Card>
        </Box>
      </Box>

      {/* Create Modal */}
      <CreateBootcampModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleCreated}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteConfirmModal
          open={Boolean(deleteTarget)}
          title="Delete Bootcamp"
          subtitle={`Are you sure you want to delete "${deleteTarget.title}"? All student enrollments and session schedules will be permanently deleted.`}
          confirmLabel="Delete Bootcamp"
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}
    </Box>
  );
}
