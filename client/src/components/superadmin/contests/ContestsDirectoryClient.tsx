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
  IconButton,
  Tooltip,
  ListItemIcon,
  LinearProgress,
  Menu,
  MenuItem,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Tabs,
  Tab,
  Checkbox,
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { FluidArrowRight } from '@/utils/fluid_arrow';

import dynamic from 'next/dynamic';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import { ContestEntity, NewContestData, ContestStatus, ContestScope, ScoringFormat } from '@/types/contest';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

const ContestQuickPeekDrawer = dynamic(() => import('@/components/superadmin/contests/ContestQuickPeekDrawer'), { loading: () => null });
const CreateContestModal = dynamic(() => import('@/components/superadmin/contests/CreateContestModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });

interface ContestsDirectoryClientProps {
  initialContests: ContestEntity[];
}

type SortField = 'code' | 'title' | 'startTime' | 'durationMinutes' | 'registeredParticipants' | 'problemsCount';
type SortDirection = 'asc' | 'desc';

export default function ContestsDirectoryClient({ initialContests }: ContestsDirectoryClientProps) {
  const toast = useToast();
  const [contests, setContests] = useState<ContestEntity[]>(initialContests);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [selectedScope, setSelectedScope] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('startTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveContests() {
      try {
        const liveData = await apiService.getContests({ limit: 50 });
        if (liveData?.items && liveData.items.length > 0) {
          const mapped: ContestEntity[] = liveData.items.map((item: any, idx: number) => ({
            id: item.id,
            code: `CNT-${String(idx + 1).padStart(3, '0')}`,
            slug: item.title ? item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : `contest-${idx + 1}`,
            title: item.title,
            description: item.description || 'Competitive programming tournament.',
            scope: 'Global',
            scoringFormat: 'ICPC (Penalty Time)',
            status: item.status || 'UPCOMING',
            startTime: item.startTime || new Date().toISOString(),
            endTime: item.endTime || new Date(Date.now() + 7200000).toISOString(),
            durationMinutes: 120,
            problemsCount: item._count?.problems || 0,
            registeredParticipants: item._count?.registrations || 0,
            submissionsCount: item._count?.submissions || 0,
            organizer: 'CodePlatform Global',
            bannerColor: '#2563EB',
            tags: ['Competitive', 'Algorithms'],
            rated: true,
          }));
          setContests(mapped);
        }
      } catch (err) {
        console.warn('Live contests fetch on client:', err);
      }
    }
    loadLiveContests();
  }, []);

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [peekContest, setPeekContest] = useState<ContestEntity | null>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredContests.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = [...selectedIds];
    const count = idsToDelete.length;
    setContests((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    for (const id of idsToDelete) {
      try {
        await apiService.deleteContest(id);
      } catch (err) {
        console.error(`Failed to delete contest ${id}:`, err);
      }
    }
    toast.success(`Deleted ${count} contest tournament${count > 1 ? 's' : ''}.`, 'Contests Management');
  };

  const handleDeleteSingleContest = async (id: string) => {
    setContests((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    try {
      await apiService.deleteContest(id);
    } catch (err) {
      console.error(`Failed to delete contest ${id}:`, err);
    }
    toast.success('Contest tournament deleted successfully.', 'Contests Management');
  };

  // Sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // KPI calculations
  const totalCount = contests.length;
  const liveCount = contests.filter((c) => c.status === 'LIVE').length;
  const upcomingCount = contests.filter((c) => c.status === 'UPCOMING').length;
  const pastCount = contests.filter((c) => c.status === 'PAST').length;
  const instituteCount = contests.filter((c) => c.scope === 'Institute League').length;
  const invitationalCount = contests.filter((c) => c.scope === 'Institutional Invitational').length;
  const totalRegistrations = contests.reduce((acc, c) => acc + c.registeredParticipants, 0);
  const totalSubmissions = contests.reduce((acc, c) => acc + c.submissionsCount, 0);

  // Tab count resolver
  const getTabCount = (tabKey: string) => {
    if (tabKey === 'ALL') return totalCount;
    if (tabKey === 'LIVE') return liveCount;
    if (tabKey === 'UPCOMING') return upcomingCount;
    if (tabKey === 'PAST') return pastCount;
    if (tabKey === 'INSTITUTE') return instituteCount;
    if (tabKey === 'INVITATIONAL') return invitationalCount;
    return 0;
  };

  // Filtered & Sorted Contests
  const filteredContests = contests
    .filter((c) => {
      // Tab filter
      if (selectedTab === 'LIVE' && c.status !== 'LIVE') return false;
      if (selectedTab === 'UPCOMING' && c.status !== 'UPCOMING') return false;
      if (selectedTab === 'PAST' && c.status !== 'PAST') return false;
      if (selectedTab === 'INSTITUTE' && c.scope !== 'Institute League') return false;
      if (selectedTab === 'INVITATIONAL' && c.scope !== 'Institutional Invitational') return false;

      // Dropdown filters
      if (selectedScope !== 'ALL' && c.scope !== selectedScope) return false;
      if (selectedFormat !== 'ALL' && !c.scoringFormat.includes(selectedFormat)) return false;

      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(q);
        const matchesCode = c.code.toLowerCase().includes(q);
        const matchesOrganizer = c.organizer.toLowerCase().includes(q);
        const matchesTags = c.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCode && !matchesOrganizer && !matchesTags) return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'code') {
        comparison = a.code.localeCompare(b.code, undefined, { numeric: true });
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'startTime') {
        comparison = new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
      } else if (sortField === 'durationMinutes') {
        comparison = a.durationMinutes - b.durationMinutes;
      } else if (sortField === 'registeredParticipants') {
        comparison = a.registeredParticipants - b.registeredParticipants;
      } else if (sortField === 'problemsCount') {
        comparison = a.problemsCount - b.problemsCount;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Pagination calculation
  const totalEntries = filteredContests.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedContests = filteredContests.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleCreateContest = async (data: NewContestData) => {
    const end = new Date(new Date(data.startTime).getTime() + data.durationMinutes * 60000).toISOString();
    const tempId = `contest-${Date.now()}`;
    const newEntry: ContestEntity = {
      id: tempId,
      code: data.code,
      slug: data.slug,
      title: data.title,
      description: data.description,
      scope: data.scope,
      scoringFormat: data.scoringFormat,
      status: data.status,
      startTime: data.startTime,
      endTime: end,
      durationMinutes: data.durationMinutes,
      problemsCount: data.problemsCount,
      registeredParticipants: 0,
      submissionsCount: 0,
      organizer: data.organizer,
      bannerColor: '#2563EB',
      tags: data.tags,
      rated: data.rated,
    };
    setContests((prev) => [newEntry, ...prev]);

    try {
      const created = await apiService.createContest({
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(end),
      });
      if (created?.id) {
        setContests((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: created.id } : c))
        );
      }
      toast.success(`Contest "${data.title}" created and scheduled.`, 'Contest Created');
    } catch {
      toast.info(`Contest "${data.title}" saved locally.`, 'Contest Registered');
    }
  };

  // Export handlers
  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadContestsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>Competitive Contests & Tournaments Directory</h2>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Code</th>
            <th>Contest Title</th>
            <th>Status</th>
            <th>Scope</th>
            <th>Scoring Engine</th>
            <th>Start Time</th>
            <th>Duration (Mins)</th>
            <th>Problems</th>
            <th>Registered Coders</th>
            <th>Submissions</th>
            <th>Organizer</th>
            <th>Rated</th>
          </tr>
          ${filteredContests
            .map(
              (c) => `
            <tr>
              <td>${c.code}</td>
              <td>${c.title}</td>
              <td>${c.status}</td>
              <td>${c.scope}</td>
              <td>${c.scoringFormat}</td>
              <td>${c.startTime}</td>
              <td align="right">${c.durationMinutes}</td>
              <td align="right">${c.problemsCount}</td>
              <td align="right">${c.registeredParticipants}</td>
              <td align="right">${c.submissionsCount}</td>
              <td>${c.organizer}</td>
              <td>${c.rated ? 'Yes' : 'No'}</td>
            </tr>`
            )
            .join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contests_directory_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadContestsCSV = () => {
    const headers = ['Code', 'Title', 'Status', 'Scope', 'ScoringFormat', 'StartTime', 'DurationMinutes', 'Problems', 'Registrations', 'Submissions', 'Organizer', 'Rated'];
    const rows = filteredContests.map((c) => [
      `"${c.code}"`,
      `"${c.title}"`,
      `"${c.status}"`,
      `"${c.scope}"`,
      `"${c.scoringFormat}"`,
      `"${c.startTime}"`,
      c.durationMinutes,
      c.problemsCount,
      c.registeredParticipants,
      c.submissionsCount,
      `"${c.organizer}"`,
      c.rated ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `contests_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const formatHours = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const statusChipStyles = {
    LIVE: { bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' },
    UPCOMING: { bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE' },
    PAST: { bgcolor: '#F1F5F9', color: '#64748B', border: '1px solid #CBD5E1' },
    DRAFT: { bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FDE68A' },
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
      {/* 1. Left Curved Navigation Sidebar */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container */}
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
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Section Navigation Tabs: Contests vs Bootcamps */}
          <Box sx={{ display: 'inline-flex', p: 0.5, bgcolor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', width: 'fit-content', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <Link href="/superadmin/contests" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                startIcon={<EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />}
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
                Contests & Tournaments
              </Button>
            </Link>
            <Link href="/superadmin/bootcamps" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                startIcon={<BoltRoundedIcon sx={{ fontSize: 16 }} />}
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
                Live Bootcamps & Sprints
              </Button>
            </Link>
          </Box>

          {/* Header Summary & Actions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
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
                  <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Competitive Contests & Tournaments
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
                Live arenas, ICPC qualifiers, institute coding cups, and official rated programming rounds
              </Typography>
            </Box>

            {/* Actions: Export & Create Contest */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Export Tournament Directory">
                <Button
                  onClick={handleOpenDownloadMenu}
                  startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
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
                  Export Data
                </Button>
              </Tooltip>

              <Menu
                anchorEl={downloadAnchorEl}
                open={Boolean(downloadAnchorEl)}
                onClose={handleCloseDownloadMenu}
                slotProps={{
                  paper: {
                    elevation: 4,
                    sx: {
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      mt: 1,
                      minWidth: 210,
                      p: 0.5,
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                    },
                  },
                }}
              >
                <MenuItem onClick={downloadContestsExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadContestsCSV} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download CSV (.csv)
                  </Typography>
                </MenuItem>
              </Menu>

              <Button
                variant="contained"
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setIsCreateModalOpen(true)}
                sx={{
                  bgcolor: '#2563EB',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  px: 2.25,
                  py: 0.75,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Schedule Contest
              </Button>
            </Box>
          </Box>

          {/* 3. Stats Metric Ribbon Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Active Live Arenas"
              value={liveCount}
              icon={<RadioButtonCheckedRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle={liveCount > 0 ? 'Ongoing live battles' : 'No active arenas right now'}
              trendBadge={liveCount > 0 ? { text: '● LIVE NOW', type: 'positive' } : undefined}
            />

            <StatsCard
              title="Upcoming Scheduled"
              value={upcomingCount}
              icon={<AccessTimeRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="Next round starting soon"
            />

            <StatsCard
              title="Registered Coders"
              value={totalRegistrations.toLocaleString()}
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="Across all active brackets"
            />

            <StatsCard
              title="Tournament Submissions"
              value={totalSubmissions.toLocaleString()}
              icon={<EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle={`${pastCount} archived tournaments`}
            />
          </Box>

          {/* 4. Controls & Filters Toolbar with MUI Tabs */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* MUI Tabs for Contest State & Leagues */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedTab}
                onChange={(_, newValue) => {
                  setSelectedTab(newValue);
                  setPage(0);
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 48,
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#2563EB',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                  '& .MuiTabs-flexContainer': {
                    gap: { xs: 0.5, sm: 1.5 },
                  },
                }}
              >
                {[
                  { id: 'ALL', label: 'All Contests' },
                  { id: 'LIVE', label: 'Live Arenas' },
                  { id: 'UPCOMING', label: 'Upcoming Rounds' },
                  { id: 'PAST', label: 'Past Archives' },
                  { id: 'INSTITUTE', label: 'Institute Leagues' },
                  { id: 'INVITATIONAL', label: 'Invitationals' },
                ].map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedTab === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
                          {tab.label}
                        </Typography>
                        <Chip
                          label={getTabCount(tab.id)}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            bgcolor: selectedTab === tab.id ? '#EFF6FF' : '#F1F5F9',
                            color: selectedTab === tab.id ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedTab === tab.id ? '#BFDBFE' : '#E2E8F0',
                            pointerEvents: 'none',
                          }}
                        />
                      </Box>
                    }
                    disableRipple
                    sx={{
                      minHeight: 48,
                      py: 1,
                      px: 1.25,
                      textTransform: 'none',
                      color: selectedTab === tab.id ? '#2563EB !important' : '#64748B',
                      '&:hover': { color: '#0F172A' },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Bar & Dropdown Filters Row */}
            <Box
              sx={{
                p: { xs: 2, md: 2.5 },
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                alignItems: { xs: 'stretch', md: 'center' },
                justifyContent: 'space-between',
              }}
            >
              {/* Search Input */}
              <TextField
                size="small"
                placeholder="Search by contest title, code, organizer, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(0);
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  flex: 1,
                  maxWidth: { xs: '100%', md: 380 },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    bgcolor: '#F8FAFC',
                    color: '#0F172A',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />

              {/* Filter Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  SCOPE:
                </Typography>
                <Select
                  size="small"
                  value={selectedScope}
                  onChange={(e) => {
                    setSelectedScope(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    height: 32,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    bgcolor: '#F8FAFC',
                    borderRadius: '9999px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Scopes</MenuItem>
                  <MenuItem value="Global" sx={{ fontSize: '0.8rem' }}>Global</MenuItem>
                  <MenuItem value="Institute League" sx={{ fontSize: '0.8rem' }}>Institute League</MenuItem>
                  <MenuItem value="Institutional Invitational" sx={{ fontSize: '0.8rem' }}>Institutional Invitational</MenuItem>
                  <MenuItem value="Internal Faculty Assessment" sx={{ fontSize: '0.8rem' }}>Faculty Internal</MenuItem>
                </Select>

                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, ml: 0.5 }}>
                  ENGINE:
                </Typography>
                <Select
                  size="small"
                  value={selectedFormat}
                  onChange={(e) => {
                    setSelectedFormat(e.target.value);
                    setPage(0);
                  }}
                  sx={{
                    height: 32,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    bgcolor: '#F8FAFC',
                    borderRadius: '9999px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
                  }}
                >
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Engines</MenuItem>
                  <MenuItem value="ICPC" sx={{ fontSize: '0.8rem' }}>ICPC Penalty</MenuItem>
                  <MenuItem value="LeetCode" sx={{ fontSize: '0.8rem' }}>LeetCode Scoring</MenuItem>
                  <MenuItem value="IOI" sx={{ fontSize: '0.8rem' }}>IOI Subtasks</MenuItem>
                </Select>

                {(searchQuery || selectedTab !== 'ALL' || selectedScope !== 'ALL' || selectedFormat !== 'ALL') && (
                  <Button
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTab('ALL');
                      setSelectedScope('ALL');
                      setSelectedFormat('ALL');
                      setPage(0);
                    }}
                    startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      color: '#EF4444',
                      bgcolor: '#FEF2F2',
                      borderRadius: '9999px',
                      textTransform: 'none',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      height: 32,
                      px: 1.5,
                      '&:hover': { bgcolor: '#FEE2E2' },
                    }}
                  >
                    Reset Filters
                  </Button>
                )}
              </Box>
            </Box>
          </Card>

          {/* Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={downloadContestsExcel}
            onDelete={handleDeleteSelected}
            itemLabel="Contests"
          />

          {/* 5. Main Content: List Table View (Rule 10 Standard) */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${borderColor}`,
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    {/* Checkbox Select All */}
                    <TableCell padding="checkbox" sx={{ pl: 2.5, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredContests.length}
                        checked={filteredContests.length > 0 && selectedIds.length === filteredContests.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, width: 110, whiteSpace: 'nowrap' }}>
                      STATUS
                    </TableCell>

                    {/* Title & Code (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('title')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        minWidth: 280,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        TOURNAMENT TITLE
                        {sortField === 'title' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Schedule & Timing (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('startTime')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        minWidth: 170,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        SCHEDULE & TIMING
                        {sortField === 'startTime' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Format & Problems (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('problemsCount')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        minWidth: 160,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        SCORING & PROBLEMS
                        {sortField === 'problemsCount' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Registered Coders (Sortable) */}
                    <TableCell
                      onClick={() => handleSort('registeredParticipants')}
                      sx={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#64748B',
                        py: 1.5,
                        cursor: 'pointer',
                        userSelect: 'none',
                        minWidth: 130,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        REGISTRATIONS
                        {sortField === 'registeredParticipants' &&
                          (sortDirection === 'asc' ? (
                            <ArrowUpwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : (
                            <ArrowDownwardRoundedIcon sx={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ))}
                      </Box>
                    </TableCell>

                    {/* Scope & Tags */}
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 140, whiteSpace: 'nowrap' }}>
                      SCOPE & LEAGUE
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, width: 140, whiteSpace: 'nowrap' }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {paginatedContests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ py: 8, textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ p: 2, borderRadius: '50%', bgcolor: '#EFF6FF', color: '#2563EB' }}>
                            <SearchIcon sx={{ fontSize: 32 }} />
                          </Box>
                          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
                            No contests match your filter criteria
                          </Typography>
                          <Typography sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                            Try adjusting your tab, search keyword, or scoring engine filters.
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedContests.map((contest) => {
                      const isSelected = selectedIds.includes(contest.id);
                      const statusStyle = statusChipStyles[contest.status];

                      return (
                        <TableRow
                          key={contest.id}
                          hover
                          selected={isSelected}
                          sx={{
                            '& td': { borderBottom: '1px solid #F1F5F9' },
                            bgcolor: isSelected ? '#EFF6FF !important' : 'inherit',
                            '&:hover': { bgcolor: isSelected ? '#DBEAFE !important' : '#F8FAFC !important' },
                          }}
                        >
                          {/* Checkbox */}
                          <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(contest.id)}
                              sx={{
                                color: '#CBD5E1',
                                '&.Mui-checked': { color: '#2563EB' },
                              }}
                            />
                          </TableCell>

                          {/* Status Pill */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              icon={
                                contest.status === 'LIVE' ? (
                                  <RadioButtonCheckedRoundedIcon sx={{ fontSize: '14px !important', color: '#DC2626 !important' }} />
                                ) : undefined
                              }
                              label={contest.status}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: '0.74rem',
                                fontWeight: 800,
                                borderRadius: '9999px',
                                ...statusStyle,
                              }}
                            />
                          </TableCell>

                          {/* Title & Code */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography
                                    component={Link}
                                    href={`/superadmin/contests/${contest.id}`}
                                    sx={{
                                      fontSize: '0.9rem',
                                      fontWeight: 700,
                                      color: '#0F172A',
                                      textDecoration: 'none',
                                      '&:hover': { color: '#2563EB', textDecoration: 'underline' },
                                    }}
                                  >
                                    {contest.title}
                                  </Typography>
                                  {contest.rated && (
                                    <Tooltip title="Official Rated Round">
                                      <StarRoundedIcon sx={{ fontSize: 16, color: '#D97706' }} />
                                    </Tooltip>
                                  )}
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontSize: '0.73rem', color: '#64748B', fontFamily: 'monospace', whiteSpace: 'nowrap', fontWeight: 600 }}>
                                    {contest.code}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.73rem', color: '#94A3B8' }}>•</Typography>
                                  <Typography sx={{ fontSize: '0.73rem', color: '#64748B', whiteSpace: 'nowrap' }}>
                                    Hosted by {contest.organizer}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>

                          {/* Schedule & Timing */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                              {formatDate(contest.startTime)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', fontSize: '0.72rem', mt: 0.25 }}>
                              <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                              {formatHours(contest.durationMinutes)} duration
                            </Box>
                          </TableCell>

                          {/* Scoring Format & Problems */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              label={contest.scoringFormat.split(' ')[0]}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                bgcolor: '#EFF6FF',
                                color: '#2563EB',
                                border: '1px solid #BFDBFE',
                                borderRadius: '6px',
                              }}
                            />
                            <Typography sx={{ fontSize: '0.73rem', color: '#64748B', fontWeight: 600, mt: 0.5 }}>
                              {contest.problemsCount} Problems • {contest.submissionsCount.toLocaleString()} Runs
                            </Typography>
                          </TableCell>

                          {/* Registered Participants */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                              {contest.registeredParticipants.toLocaleString()}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#16A34A', fontWeight: 600 }}>
                              Coders Enrolled
                            </Typography>
                          </TableCell>

                          {/* Scope */}
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              label={contest.scope}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                bgcolor: '#F1F5F9',
                                color: '#334155',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                              }}
                            />
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="Quick Peek Tournament">
                                <IconButton
                                  size="small"
                                  onClick={() => setPeekContest(contest)}
                                  sx={{
                                    color: '#64748B',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    border: '1px solid #E2E8F0',
                                    '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF', borderColor: '#BFDBFE' },
                                  }}
                                >
                                  <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              <Tooltip title="Delete Contest">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSingleContest(contest.id)}
                                  sx={{
                                    color: '#EF4444',
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    border: '1px solid #FEE2E2',
                                    bgcolor: '#FEF2F2',
                                    '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2', borderColor: '#FECACA' },
                                  }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>

                              <Button
                                component={Link}
                                href={`/superadmin/contests/${contest.id}`}
                                size="small"
                                variant={contest.status === 'LIVE' ? 'contained' : 'outlined'}
                                endIcon={<FluidArrowRight size={14} />}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  bgcolor: contest.status === 'LIVE' ? '#DC2626' : '#EFF6FF',
                                  color: contest.status === 'LIVE' ? '#FFFFFF' : '#2563EB',
                                  borderColor: contest.status === 'LIVE' ? '#DC2626' : '#DBEAFE',
                                  borderRadius: '8px',
                                  px: 1.5,
                                  py: 0.4,
                                  whiteSpace: 'nowrap',
                                  '&:hover': {
                                    bgcolor: contest.status === 'LIVE' ? '#B91C1C' : '#DBEAFE',
                                    borderColor: contest.status === 'LIVE' ? '#B91C1C' : '#93C5FD',
                                  },
                                }}
                              >
                                {contest.status === 'LIVE' ? 'Enter Arena' : 'Manage'}
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 6. Full-Pill Pagination Footer Toolbar */}
            <Box
              sx={{
                p: '16px 24px',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                borderTop: `1px solid ${borderColor}`,
                bgcolor: '#FFFFFF',
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                Showing <strong style={{ color: '#0F172A' }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A' }}>{totalEntries}</strong> tournaments
              </Typography>

              {/* Rows Per Page & Page Numbers */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748B', fontWeight: 600 }}>Rows:</Typography>
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    size="small"
                    sx={{
                      height: 28,
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      bgcolor: '#FFFFFF',
                      borderRadius: '9999px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '9999px' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                      '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
                    }}
                  >
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                  </Select>
                </Box>

                {/* Pagination Controls */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    disabled={currentPage === 0}
                    onClick={() => setPage(0)}
                    sx={{
                      width: 32,
                      height: 32,
                      color: '#64748B',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '9999px',
                      p: 0.5,
                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                      '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
                    }}
                  >
                    <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  <IconButton
                    size="small"
                    disabled={currentPage === 0}
                    onClick={() => setPage(Math.max(0, currentPage - 1))}
                    sx={{
                      width: 32,
                      height: 32,
                      color: '#64748B',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '9999px',
                      p: 0.5,
                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                      '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
                    }}
                  >
                    <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  {/* Page Pill Buttons */}
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
                    let end = Math.min(totalPages, start + maxVisible);

                    if (end - start < maxVisible) {
                      start = Math.max(0, end - maxVisible);
                    }

                    if (start > 0) {
                      pages.push(0);
                      if (start > 1) pages.push('ellipsis-start');
                    }

                    for (let i = start; i < end; i++) {
                      if (!pages.includes(i)) pages.push(i);
                    }

                    if (end < totalPages) {
                      if (end < totalPages - 1) pages.push('ellipsis-end');
                      pages.push(totalPages - 1);
                    }

                    return pages.map((item, idx) => {
                      if (typeof item === 'string') {
                        return (
                          <Box
                            key={`ellipsis-${idx}`}
                            sx={{
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94A3B8',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              userSelect: 'none',
                            }}
                          >
                            •••
                          </Box>
                        );
                      }

                      const pageIndex = item as number;
                      const isActive = currentPage === pageIndex;

                      return (
                        <Box
                          key={pageIndex}
                          onClick={() => setPage(pageIndex)}
                          sx={{
                            minWidth: 32,
                            height: 32,
                            px: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            fontSize: '0.78rem',
                            fontWeight: isActive ? 800 : 600,
                            color: isActive ? '#FFFFFF' : '#64748B',
                            bgcolor: isActive ? '#2563EB' : '#FFFFFF',
                            border: isActive ? '1px solid #2563EB' : '1px solid #E2E8F0',
                            boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.3)' : 'none',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                              bgcolor: isActive ? '#1D4ED8' : '#F1F5F9',
                              color: isActive ? '#FFFFFF' : '#0F172A',
                              borderColor: isActive ? '#1D4ED8' : '#CBD5E1',
                            },
                          }}
                        >
                          {pageIndex + 1}
                        </Box>
                      );
                    });
                  })()}

                  <IconButton
                    size="small"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setPage(Math.min(totalPages - 1, currentPage + 1))}
                    sx={{
                      width: 32,
                      height: 32,
                      color: '#64748B',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '9999px',
                      p: 0.5,
                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                      '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
                    }}
                  >
                    <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>

                  <IconButton
                    size="small"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setPage(totalPages - 1)}
                    sx={{
                      width: 32,
                      height: 32,
                      color: '#64748B',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '9999px',
                      p: 0.5,
                      '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                      '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
                    }}
                  >
                    <LastPageRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* 7. Quick Peek Drawer */}
      <ContestQuickPeekDrawer
        contest={peekContest}
        open={Boolean(peekContest)}
        onClose={() => setPeekContest(null)}
      />

      {/* 8. Create Contest Modal */}
      <CreateContestModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateContest}
      />
    </Box>
  );
}
