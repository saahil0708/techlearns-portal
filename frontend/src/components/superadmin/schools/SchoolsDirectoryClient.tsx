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
  Avatar,
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
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import dynamic from 'next/dynamic';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import type { NewSchoolData } from '@/components/superadmin/schools/CreateSchoolModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { isSchoolOrganization } from '@/utils/organization';

const CreateSchoolModal = dynamic(() => import('@/components/superadmin/schools/CreateSchoolModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });
import StatsCard from '@/components/superadmin/shared/StatsCard';

export interface SchoolEntity {
  id: string;
  name: string;
  code: string;
  domain: string;
  district: string;
  curriculum: string;
  grades: string;
  studentsCount: number;
  maxQuota: number;
  labsCount: number;
  gradeCohortsCount: number;
  teachersCount: number;
  status: 'Active' | 'Provisioning' | 'Trial' | 'Suspended';
  logoColor: string;
}

interface SchoolsDirectoryClientProps {
  initialSchools: SchoolEntity[];
}

export default function SchoolsDirectoryClient({ initialSchools }: SchoolsDirectoryClientProps) {
  const toast = useToast();
  const [schools, setSchools] = useState<SchoolEntity[]>(initialSchools);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; school: SchoolEntity } | null>(null);

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveSchools() {
      try {
        const liveData = await apiService.getColleges({ limit: 50 });
        if (liveData?.items && Array.isArray(liveData.items)) {
          const schoolItems = liveData.items.filter((item: any) => isSchoolOrganization(item));
          const mapped: SchoolEntity[] = schoolItems.map((item: any, idx: number) => {
            const studentCount = Array.isArray(item.memberships)
              ? item.memberships.filter((m: any) => m.role === 'STUDENT').length
              : (item.studentsCount ?? item._count?.memberships ?? 0);

            const facultyCount = Array.isArray(item.memberships)
              ? item.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN').length
              : (item.facultyCount ?? item.teachersCount ?? 8);

            return {
              id: item.id,
              name: item.name,
              code: item.code,
              domain: item.email && item.email.includes('@') ? item.email.split('@')[1] : `${item.code.toLowerCase()}.edu`,
              district: item.district || item.address || item.region || 'Regional STEM District',
              curriculum: item.curriculum || item.tier || (idx % 2 === 0 ? 'STEM Honors / AP' : 'IB Diploma Programme'),
              grades: item.grades || 'Grades 9–12',
              studentsCount: studentCount,
              maxQuota: item.maxQuota ?? item.quota ?? 3000,
              labsCount: item.labsCount ?? (item._count?.courses !== undefined ? item._count.courses * 2 : 6),
              gradeCohortsCount: item.gradeCohortsCount ?? item._count?.batches ?? 4,
              teachersCount: facultyCount,
              status: item.status === 'ACTIVE' ? 'Active' : (item.status || 'Active'),
              logoColor: item.logoColor || ['#2563EB', '#DC2626', '#059669', '#7C3AED', '#D97706'][idx % 5],
            };
          });
          setSchools(mapped);
        }
      } catch (err) {
        console.warn('Live schools fetch on client:', err);
      }
    }
    loadLiveSchools();
  }, []);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredSchools.map((s) => s.id));
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
    setSchools((prev) => prev.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    for (const id of idsToDelete) {
      try {
        await apiService.deleteCollege(id);
      } catch (err) {
        console.error(`Failed to delete school ${id}:`, err);
      }
    }
    toast.success(`Deleted ${count} high school and STEM institution${count > 1 ? 's' : ''}.`, 'School Directory');
  };

  const handleDeleteSingleSchool = async (id: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    try {
      await apiService.deleteCollege(id);
    } catch (err) {
      console.error(`Failed to delete school ${id}:`, err);
    }
    toast.success('School record deleted successfully.', 'School Directory');
  };

  // Curriculum Track Counters
  const totalCount = schools.length;
  const stemCount = schools.filter((s) => s.curriculum === 'STEM Honors / AP').length;
  const ibCount = schools.filter((s) => s.curriculum === 'IB Diploma Programme').length;
  const apCount = schools.filter((s) => s.curriculum === 'Advanced Placement (AP)').length;
  const cbseCount = schools.filter((s) => s.curriculum === 'CBSE / Olympiad Track').length;
  const aLevelsCount = schools.filter((s) => s.curriculum === 'Cambridge A-Levels').length;

  // Filtered Schools List
  const filteredSchools = schools.filter((sch) => {
    if (selectedCurriculum !== 'ALL' && sch.curriculum !== selectedCurriculum) return false;
    if (selectedStatus !== 'ALL' && sch.status !== selectedStatus) return false;
    if (
      searchQuery &&
      !sch.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sch.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !sch.district.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalEntries = filteredSchools.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedSchools = filteredSchools.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleCreateSchool = async (data: NewSchoolData) => {
    const tempId = `sch-${Date.now()}`;
    const newEntry: SchoolEntity = {
      id: tempId,
      name: data.name,
      code: data.code,
      domain: data.domain,
      district: data.district,
      curriculum: data.curriculum,
      grades: data.grades,
      studentsCount: 0,
      maxQuota: data.quota,
      labsCount: 0,
      gradeCohortsCount: 0,
      teachersCount: 1,
      status: 'Active',
      logoColor: '#2563EB',
    };
    setSchools((prev) => [newEntry, ...prev]);

    try {
      const created = await apiService.createCollege({
        name: data.name,
        code: data.code,
        address: data.district,
      });
      if (created?.id) {
        setSchools((prev) =>
          prev.map((s) => (s.id === tempId ? { ...s, id: created.id } : s))
        );
      }
      toast.success(`School "${data.name}" (${data.code}) registered in database.`, 'School Created');
    } catch {
      toast.info(`School "${data.name}" added to local platform state.`, 'School Registered');
    }
  };

  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadSchoolsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>High Schools & STEM Academies Directory</h2>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Code</th>
            <th>School Name</th>
            <th>Domain</th>
            <th>District / League</th>
            <th>Curriculum Track</th>
            <th>Grades</th>
            <th>Students Enrolled</th>
            <th>Max Quota</th>
            <th>Coding Labs</th>
            <th>Grade Cohorts</th>
            <th>CS Faculty</th>
            <th>Status</th>
          </tr>
          ${filteredSchools
            .map(
              (s) => `
            <tr>
              <td>${s.code}</td>
              <td>${s.name}</td>
              <td>${s.domain}</td>
              <td>${s.district}</td>
              <td>${s.curriculum}</td>
              <td>${s.grades}</td>
              <td align="right">${s.studentsCount}</td>
              <td align="right">${s.maxQuota}</td>
              <td align="right">${s.labsCount}</td>
              <td align="right">${s.gradeCohortsCount}</td>
              <td align="right">${s.teachersCount}</td>
              <td>${s.status}</td>
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
    link.setAttribute('download', `schools_directory_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadSchoolsCSV = () => {
    const headers = [
      'Code',
      'School Name',
      'Domain',
      'District / League',
      'Curriculum Track',
      'Grades',
      'Students Enrolled',
      'Max Quota',
      'Coding Labs',
      'Grade Cohorts',
      'CS Faculty',
      'Status',
    ];
    const rows = filteredSchools.map((s) => [
      `"${s.code}"`,
      `"${s.name}"`,
      `"${s.domain}"`,
      `"${s.district}"`,
      `"${s.curriculum}"`,
      `"${s.grades}"`,
      s.studentsCount,
      s.maxQuota,
      s.labsCount,
      s.gradeCohortsCount,
      s.teachersCount,
      `"${s.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `schools_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
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
        {/* Unified Layout Container: Navbar + Page Content */}
        <Box sx={{ maxWidth: 1400, width: '100%', mx: 'auto', px: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', gap: 4, pb: { xs: 4, md: 6 } }}>
          {/* 2. Top Header Navbar */}
          <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          {/* Header Summary & Actions */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
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
                  }}
                >
                  <SchoolRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                  Schools & STEM Academies
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
                Manage K-12 secondary schools, AP/IB coding labs, grade section cohorts, and seat quotas
              </Typography>
            </Box>

            {/* Actions: Export & Register School */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Tooltip title="Export Schools Directory">
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
                <MenuItem onClick={downloadSchoolsExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadSchoolsCSV} sx={{ borderRadius: '8px', py: 1 }}>
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
                onClick={() => setIsModalOpen(true)}
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
                Register School
              </Button>
            </Box>
          </Box>

          {/* 3. Stats Metric Ribbon Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Total Schools"
              value={schools.length}
              icon={<AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle="100% Verified Districts"
            />

            <StatsCard
              title="STEM Students"
              value={schools.reduce((acc, c) => acc + c.studentsCount, 0).toLocaleString()}
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="Active K-12 Learners"
            />

            <StatsCard
              title="Coding Labs & Clubs"
              value={schools.reduce((acc, c) => acc + c.labsCount, 0)}
              icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="AP / IB curriculum tracks"
            />

            <StatsCard
              title="Quota Utilization"
              value={
                schools.reduce((acc, c) => acc + c.maxQuota, 0) > 0
                  ? `${Math.round(
                      (schools.reduce((acc, c) => acc + c.studentsCount, 0) /
                        schools.reduce((acc, c) => acc + c.maxQuota, 0)) *
                        100
                    )}%`
                  : '0%'
              }
              icon={<PieChartRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle={`Allocated: ${schools.reduce((acc, c) => acc + c.maxQuota, 0).toLocaleString()}`}
            />
          </Box>

          {/* 4. Controls & Filters Toolbar */}
          {/* Filters Toolbar Card with MUI Tabs */}
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
            {/* MUI Tabs for Curriculum Tracks */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedCurriculum}
                onChange={(_, newValue) => {
                  setSelectedCurriculum(newValue);
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
                  { id: 'ALL', label: 'All Curriculums', count: totalCount },
                  { id: 'STEM Honors / AP', label: 'STEM Honors / AP', count: stemCount },
                  { id: 'IB Diploma Programme', label: 'IB Diploma', count: ibCount },
                  { id: 'Advanced Placement (AP)', label: 'AP Track', count: apCount },
                  { id: 'CBSE / Olympiad Track', label: 'CBSE / Olympiad', count: cbseCount },
                  { id: 'Cambridge A-Levels', label: 'Cambridge A-Levels', count: aLevelsCount },
                ].map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedCurriculum === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
                          {tab.label}
                        </Typography>
                        <Chip
                          label={tab.count}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            borderRadius: '9999px',
                            bgcolor: selectedCurriculum === tab.id ? '#EFF6FF' : '#F1F5F9',
                            color: selectedCurriculum === tab.id ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedCurriculum === tab.id ? '#BFDBFE' : '#E2E8F0',
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
                      color: selectedCurriculum === tab.id ? '#2563EB !important' : '#64748B',
                      '&:hover': {
                        color: '#0F172A',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Bar & Status Filter Row */}
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
                placeholder="Search by school name, code, district..."
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
                  maxWidth: { xs: '100%', md: 400 },
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

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  STATUS:
                </Typography>

                {/* Status Filter */}
                <Select
                  size="small"
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
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
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
                  <MenuItem value="Active" sx={{ fontSize: '0.8rem' }}>Active</MenuItem>
                  <MenuItem value="Provisioning" sx={{ fontSize: '0.8rem' }}>Provisioning</MenuItem>
                  <MenuItem value="Trial" sx={{ fontSize: '0.8rem' }}>Trial</MenuItem>
                </Select>

                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, ml: 1 }}>
                  Showing {totalEntries} {totalEntries === 1 ? 'school' : 'schools'}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={downloadSchoolsExcel}
            onDelete={handleDeleteSelected}
          />

          {/* 5. Main Content: List Table View */}
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
              <Table size="small" sx={{ minWidth: 1060 }}>
                <TableHead sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ pl: 2.5, width: 48, borderColor: '#E2E8F0' }}>
                      <Checkbox
                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredSchools.length}
                        checked={filteredSchools.length > 0 && selectedIds.length === filteredSchools.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '28%', minWidth: 260 }}>
                      SCHOOL / ACADEMY
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '18%', minWidth: 160 }}>
                      DISTRICT & GRADES
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '14%', minWidth: 140 }}>
                      CURRICULUM TRACK
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '16%', minWidth: 160 }}>
                      SEAT UTILIZATION
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '14%', minWidth: 150 }}>
                      LABS & FACULTY
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '10%', minWidth: 90 }}>
                      STATUS
                    </TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5, letterSpacing: '0.04em', width: '10%', minWidth: 110 }}>
                      ACTIONS
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSchools.map((school) => {
                    const isSelected = selectedIds.includes(school.id);
                    const quotaPercent = school.maxQuota > 0 ? Math.round((school.studentsCount / school.maxQuota) * 100) : 0;

                    return (
                      <TableRow
                        key={school.id}
                        hover
                        selected={isSelected}
                        sx={{
                          '& td': { borderBottom: '1px solid #F1F5F9' },
                          bgcolor: isSelected ? '#EFF6FF !important' : 'inherit',
                          '&:hover': { bgcolor: isSelected ? '#DBEAFE !important' : '#F8FAFC !important' },
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2.5 }}>
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(school.id)}
                            sx={{
                              color: '#CBD5E1',
                              '&.Mui-checked': { color: '#2563EB' },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box
                            component={Link}
                            href={`/superadmin/schools/${school.id}`}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover .school-name': { color: '#2563EB' },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                flexShrink: 0,
                                bgcolor: school.logoColor,
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                color: '#FFFFFF',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              }}
                            >
                              {school.code.split('-')[0].substring(0, 3)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                className="school-name"
                                sx={{
                                  fontSize: '0.88rem',
                                  fontWeight: 700,
                                  color: '#0F172A',
                                  lineHeight: 1.35,
                                  transition: 'color 0.15s ease',
                                }}
                              >
                                {school.name}
                              </Typography>
                              <Typography noWrap sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{school.code}</span>
                                {' • '}
                                <span>@{school.domain}</span>
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            {school.district}
                          </Typography>
                          <Typography noWrap sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.25 }}>
                            {school.grades}
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={school.curriculum}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #DBEAFE',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ minWidth: 130, maxWidth: 180 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography noWrap sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                                {school.studentsCount.toLocaleString()} / {school.maxQuota.toLocaleString()}
                              </Typography>
                              <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700, ml: 1 }}>
                                {quotaPercent}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, quotaPercent)}
                              sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: '#E2E8F0',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: quotaPercent > 90 ? '#EF4444' : '#2563EB',
                                  borderRadius: 3,
                                },
                              }}
                            />
                          </Box>
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Typography noWrap sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                            {school.labsCount} Labs • {school.gradeCohortsCount} Sections
                          </Typography>
                          <Typography noWrap sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.25 }}>
                            {school.teachersCount} CS Instructors
                          </Typography>
                        </TableCell>

                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={school.status}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                              bgcolor:
                                school.status === 'Active'
                                  ? '#ECFDF5'
                                  : school.status === 'Provisioning'
                                  ? '#EFF6FF'
                                  : '#FFFBEB',
                              color:
                                school.status === 'Active'
                                  ? '#059669'
                                  : school.status === 'Provisioning'
                                  ? '#2563EB'
                                  : '#D97706',
                              border: '1px solid',
                              borderColor:
                                school.status === 'Active'
                                  ? '#A7F3D0'
                                  : school.status === 'Provisioning'
                                  ? '#BFDBFE'
                                  : '#FEF3C7',
                            }}
                          />
                        </TableCell>

                        <TableCell align="right" sx={{ pr: 3, py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                            <Button
                              component={Link}
                              href={`/superadmin/schools/${school.id}`}
                              size="small"
                              variant="outlined"
                              endIcon={<FluidArrowRight size={13} />}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                fontSize: '0.75rem',
                                color: '#2563EB',
                                borderColor: '#DBEAFE',
                                bgcolor: '#EFF6FF',
                                borderRadius: '6px',
                                px: 1.35,
                                py: 0.35,
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                  bgcolor: '#DBEAFE',
                                  borderColor: '#93C5FD',
                                },
                              }}
                            >
                              Manage
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          {/* 6. Pagination Footer Toolbar */}
          <Card
            elevation={0}
            sx={{
              p: 2,
              px: 3,
              borderRadius: '14px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalEntries}</strong> schools
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>Rows per page:</Typography>
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
                    fontWeight: 600,
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
            </Box>

            {/* Pagination Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
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

              {/* Smart Long-List Pagination Pills */}
              {(() => {
                const getPaginationRange = (current: number, total: number) => {
                  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
                  if (current <= 3) return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
                  if (current >= total - 4) return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
                  return [0, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total - 1];
                };

                return getPaginationRange(currentPage, totalPages).map((item, idx) => {
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
          </Card>
        </Box>
      </Box>

      {/* Row Action Menu with Explicit Status Options */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{
          paper: {
            elevation: 4,
            sx: {
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              mt: 0.5,
              minWidth: 220,
              p: 0.75,
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
            },
          },
        }}
      >
        <MenuItem
          component={Link}
          href={menuAnchor ? `/superadmin/schools/${menuAnchor.school.id}` : '#'}
          onClick={() => setMenuAnchor(null)}
          sx={{ borderRadius: '8px', py: 1, '&:hover': { bgcolor: '#EFF6FF' } }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <SchoolRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
          </ListItemIcon>
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
            Open School Portal
          </Typography>
        </MenuItem>

        <Divider sx={{ my: 0.75 }} />

        <Box sx={{ px: 1.5, py: 0.5 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Change Status
          </Typography>
        </Box>

        {(['Active', 'Trial', 'Provisioning', 'Suspended'] as const).map((statusOption) => {
          const isSelected = menuAnchor?.school.status === statusOption;
          const statusColor =
            statusOption === 'Active'
              ? '#10B981'
              : statusOption === 'Trial'
              ? '#F59E0B'
              : statusOption === 'Provisioning'
              ? '#0284C7'
              : '#EF4444';

          const statusBg =
            statusOption === 'Active'
              ? '#ECFDF5'
              : statusOption === 'Trial'
              ? '#FFFBEB'
              : statusOption === 'Provisioning'
              ? '#F0F9FF'
              : '#FEF2F2';

          return (
            <MenuItem
              key={statusOption}
              onClick={() => {
                if (menuAnchor) {
                  const targetId = menuAnchor.school.id;
                  const targetName = menuAnchor.school.name;
                  setSchools((prev) =>
                    prev.map((s) => (s.id === targetId ? { ...s, status: statusOption } : s))
                  );
                  setToastMessage(`Status for "${targetName}" updated to ${statusOption}.`);
                }
                setMenuAnchor(null);
              }}
              sx={{
                borderRadius: '8px',
                py: 0.8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: isSelected ? '#F8FAFC' : 'transparent',
                '&:hover': { bgcolor: statusBg },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: statusColor }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0F172A' : '#475569' }}>
                  {statusOption}
                </Typography>
              </Box>

              {isSelected && <CheckRoundedIcon sx={{ fontSize: 16, color: statusColor }} />}
            </MenuItem>
          );
        })}
      </Menu>

      {/* Action Toast Feedback */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastMessage(null)} severity="success" sx={{ width: '100%', borderRadius: '10px', fontWeight: 600 }}>
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Create School Modal */}
      <CreateSchoolModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSchool}
      />
    </Box>
  );
}
