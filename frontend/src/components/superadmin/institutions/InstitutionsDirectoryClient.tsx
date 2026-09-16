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
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import EventSeatRoundedIcon from '@mui/icons-material/EventSeatRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

import dynamic from 'next/dynamic';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { apiService } from '@/lib/api-service';
import type { NewInstitutionData } from '@/components/superadmin/institutions/CreateInstitutionModal';
import EditInstitutionModal, { UpdateInstitutionData } from '@/components/superadmin/institutions/EditInstitutionModal';
import { useToast } from '@/context/ToastContext';
import { isCollegeOrganization } from '@/utils/organization';

const CreateInstitutionModal = dynamic(() => import('@/components/superadmin/institutions/CreateInstitutionModal'), { loading: () => null });
const BulkActionBar = dynamic(() => import('@/components/superadmin/shared/BulkActionBar'), { loading: () => null });
import StatsCard from '@/components/superadmin/shared/StatsCard';

export interface InstitutionEntity {
  id: string;
  name: string;
  code: string;
  domain: string;
  region: string;
  tier: string;
  studentsCount: number;
  maxQuota: number;
  coursesCount: number;
  cohortsCount: number;
  facultyCount: number;
  status: 'Active' | 'Provisioning' | 'Trial' | 'Suspended';
  logoColor: string;
}

export type CollegeEntity = InstitutionEntity;

interface InstitutionsDirectoryClientProps {
  initialInstitutions: InstitutionEntity[];
}

export default function InstitutionsDirectoryClient({ initialInstitutions }: InstitutionsDirectoryClientProps) {
  const router = useRouter();
  const toast = useToast();
  const [institutions, setInstitutions] = useState<InstitutionEntity[]>(initialInstitutions);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement; institution: InstitutionEntity } | null>(null);
  const [editingInstitution, setEditingInstitution] = useState<InstitutionEntity | null>(null);

  // Client-side live data refresh
  React.useEffect(() => {
    async function loadLiveInstitutions() {
      try {
        const liveData = await apiService.getInstitutions({ limit: 50 });
        if (liveData?.items && Array.isArray(liveData.items)) {
          const institutionItems = liveData.items.filter((item: any) => isCollegeOrganization(item));
          const mapped: InstitutionEntity[] = institutionItems.map((item: any) => {
            const faculty = Array.isArray(item.memberships)
              ? item.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN').length
              : (item.facultyCount ?? 0);
            const students = Array.isArray(item.memberships)
              ? item.memberships.filter((m: any) => m.role === 'STUDENT').length
              : (item._count?.memberships ?? 0);

            return {
              id: item.id,
              name: item.name,
              code: item.code,
              domain: item.email && item.email.includes('@') ? item.email.split('@')[1] : `${item.code.toLowerCase()}.edu`,
              region: item.address || item.region || 'Asia-Pacific',
              tier: item.tier ?? 'Standard Academic',
              studentsCount: students,
              maxQuota: item.quota ?? item.maxQuota ?? 100,
              coursesCount: item._count?.courses || 0,
              cohortsCount: item._count?.batches || 0,
              facultyCount: faculty,
              status: item.status === 'ACTIVE' ? 'Active' : 'Suspended',
              logoColor: '#3B82F6',
            };
          });
          setInstitutions(mapped);
        }
      } catch (err) {
        console.warn('Live institutions fetch on client:', err);
      }
    }
    loadLiveInstitutions();
  }, []);

  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredInstitutions.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = [...selectedIds];
    setInstitutions((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
    setSelectedIds([]);
    for (const id of idsToDelete) {
      try {
        await apiService.deleteInstitution(id);
      } catch (err) {
        console.error(`Failed to delete institution ${id}:`, err);
      }
    }
  };

  const handleDeleteSingleInstitution = async (id: string) => {
    setInstitutions((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    try {
      await apiService.deleteInstitution(id);
      toast.success('Institution removed successfully.', 'Institution Deleted');
    } catch (err: any) {
      console.error(`Failed to delete institution ${id}:`, err);
      toast.error(err?.message || 'Failed to delete institution.', 'Delete Error');
    }
  };

  const handleUpdateInstitution = async (data: UpdateInstitutionData) => {
    const original = institutions.find((c) => c.id === data.id);
    // Optimistic update
    setInstitutions((prev) =>
      prev.map((c) =>
        c.id === data.id
          ? {
              ...c,
              name: data.name || c.name,
              code: data.code || c.code,
              region: data.region || c.region,
              tier: data.tier || c.tier,
              maxQuota: data.quota !== undefined ? data.quota : c.maxQuota,
              status: data.status === 'ACTIVE' ? 'Active' : data.status === 'SUSPENDED' ? 'Suspended' : c.status,
            }
          : c
      )
    );
    try {
      await apiService.updateInstitution(data.id, {
        name: data.name,
        code: data.code,
        email: data.email,
        phone: data.phone,
        address: data.region,
        tier: data.tier,
        quota: data.quota,
        status: data.status,
      });
      toast.success(`"${data.name}" updated successfully.`, 'Institution Updated');
    } catch (err: any) {
      // Revert on error
      if (original) {
        setInstitutions((prev) => prev.map((c) => (c.id === data.id ? original : c)));
      }
      toast.error(err?.message || 'Failed to update institution.', 'Update Error');
      throw err;
    }
  };

  // Tier Counters
  const totalCount = institutions.length;
  const enterpriseCount = institutions.filter((c) => c.tier === 'Enterprise Tier').length;
  const proCount = institutions.filter((c) => c.tier === 'Pro Academic').length;
  const standardCount = institutions.filter((c) => c.tier === 'Standard Academic').length;

  // Filtered Institutions List
  const filteredInstitutions = institutions.filter((col) => {
    if (selectedRegion !== 'ALL' && col.region !== selectedRegion) return false;
    if (selectedTier !== 'ALL' && col.tier !== selectedTier) return false;
    if (
      searchQuery &&
      !col.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !col.code.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalEntries = filteredInstitutions.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedInstitutions = filteredInstitutions.slice(
    currentPage * rowsPerPage,
    currentPage * rowsPerPage + rowsPerPage
  );
  const startEntry = totalEntries === 0 ? 0 : currentPage * rowsPerPage + 1;
  const endEntry = Math.min((currentPage + 1) * rowsPerPage, totalEntries);

  const handleCreateInstitution = async (data: NewInstitutionData) => {
    const tempId = `inst-${Date.now()}`;
    const newEntry: InstitutionEntity = {
      id: tempId,
      name: data.name,
      code: data.code,
      domain: data.domain || `${data.code.toLowerCase()}.edu`,
      region: data.region,
      tier: data.tier,
      studentsCount: 0,
      maxQuota: data.quota,
      coursesCount: 0,
      cohortsCount: 0,
      facultyCount: 0,
      status: 'Active',
      logoColor: '#3B82F6',
    };
    setInstitutions((prev) => [newEntry, ...prev]);

    try {
      const created = await apiService.createInstitution({
        name: data.name,
        code: data.code,
        email: data.adminEmail,
        address: data.region,
        tier: data.tier,
        quota: data.quota,
      });
      if (created?.id) {
        setInstitutions((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: created.id } : c))
        );
      }
      toast.success(`Successfully provisioned "${data.name}" (${data.code}) to platform database.`, 'Institution Created');
    } catch {
      setInstitutions((prev) => prev.filter((c) => c.id !== tempId));
      toast.error(`Failed to register "${data.name}".`, 'Registration Error');
    }
  };

  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadInstitutionsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>Institutions & Academic Organizations Directory</h2>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Code</th>
            <th>Institution Name</th>
            <th>Domain</th>
            <th>Region</th>
            <th>Subscription Tier</th>
            <th>Students Enrolled</th>
            <th>Max Quota</th>
            <th>Courses</th>
            <th>Cohorts</th>
            <th>Faculty</th>
            <th>Status</th>
          </tr>
          ${filteredInstitutions.map(
            (c) => `
            <tr>
              <td>${c.code}</td>
              <td>${c.name}</td>
              <td>${c.domain}</td>
              <td>${c.region}</td>
              <td>${c.tier}</td>
              <td align="right">${c.studentsCount}</td>
              <td align="right">${c.maxQuota}</td>
              <td align="right">${c.coursesCount}</td>
              <td align="right">${c.cohortsCount}</td>
              <td align="right">${c.facultyCount}</td>
              <td>${c.status}</td>
            </tr>`
          ).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `institutions_directory_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadInstitutionsCSV = () => {
    const headers = ['Code', 'Institution Name', 'Domain', 'Region', 'Subscription Tier', 'Students Enrolled', 'Max Quota', 'Courses', 'Cohorts', 'Faculty', 'Status'];
    const rows = filteredInstitutions.map((c) => [
      `"${c.code}"`,
      `"${c.name}"`,
      `"${c.domain}"`,
      `"${c.region}"`,
      `"${c.tier}"`,
      c.studentsCount,
      c.maxQuota,
      c.coursesCount,
      c.cohortsCount,
      c.facultyCount,
      `"${c.status}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `institutions_directory_${new Date().toISOString().slice(0, 10)}.csv`);
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
                    border: '1px solid #DBEAFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#2563EB',
                  }}
                >
                  <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.4rem', letterSpacing: '-0.02em' }}>
                  Institutions & University Tenants
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.84rem', mt: 0.5, fontWeight: 500 }}>
                Multi-tenant academic organizations, cohort roster isolation & seat quotas
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Tooltip title="Export Directory to Excel / CSV">
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
                    fontSize: '0.85rem',
                    px: 2,
                    py: 1,
                    '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                  }}
                >
                  Export Directory
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
                <MenuItem onClick={downloadInstitutionsExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadInstitutionsCSV} sx={{ borderRadius: '8px', py: 1 }}>
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
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  px: 2.5,
                  py: 1,
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
                  '&:hover': {
                    bgcolor: '#1D4ED8',
                  },
                }}
              >
                Onboard Institution
              </Button>
            </Box>
          </Box>

          {/* 4 KPI Metric Strips */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Active Institutions"
              value={institutions.length}
              icon={<AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              trendBadge={{ text: '+3 onboarded this month', type: 'positive' }}
            />

            <StatsCard
              title="Enrolled Students"
              value={institutions.reduce((acc, curr) => acc + curr.studentsCount, 0).toLocaleString()}
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle={`Across ${institutions.reduce((acc, curr) => acc + curr.cohortsCount, 0)} cohorts`}
            />

            <StatsCard
              title="Total Allocated Seats"
              value={institutions.reduce((acc, curr) => acc + curr.maxQuota, 0).toLocaleString()}
              icon={<EventSeatRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="78.4% capacity utilization"
            />

            <StatsCard
              title="Faculty Mentors"
              value={institutions.reduce((acc, curr) => acc + curr.facultyCount, 0)}
              icon={<SupervisorAccountRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Department coordinators"
            />
          </Box>

          {/* Filters Toolbar Card with MUI Tabs */}
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* MUI Tabs for Organization Tiers */}
            <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
              <Tabs
                value={selectedTier}
                onChange={(_, newValue) => {
                  setSelectedTier(newValue);
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
                  { id: 'ALL', label: 'All Organizations', count: totalCount },
                  { id: 'Enterprise Tier', label: 'Enterprise Tier', count: enterpriseCount },
                  { id: 'Pro Academic', label: 'Pro Academic', count: proCount },
                  { id: 'Standard Academic', label: 'Standard Academic', count: standardCount },
                ].map((tab) => (
                  <Tab
                    key={tab.id}
                    value={tab.id}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ fontWeight: selectedTier === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
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
                            bgcolor: selectedTier === tab.id ? '#EFF6FF' : '#F1F5F9',
                            color: selectedTier === tab.id ? '#2563EB' : '#64748B',
                            border: '1px solid',
                            borderColor: selectedTier === tab.id ? '#BFDBFE' : '#E2E8F0',
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
                      color: selectedTier === tab.id ? '#2563EB !important' : '#64748B',
                      '&:hover': {
                        color: '#0F172A',
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>

            {/* Search Bar & Region Filter Row */}
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
                placeholder="Search by institution name or code..."
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
                  REGION:
                </Typography>

                {/* Region Filter */}
                <Select
                  size="small"
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
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
                  <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Regions</MenuItem>
                  <MenuItem value="North America" sx={{ fontSize: '0.8rem' }}>North America</MenuItem>
                  <MenuItem value="Asia-Pacific" sx={{ fontSize: '0.8rem' }}>Asia-Pacific</MenuItem>
                  <MenuItem value="Europe" sx={{ fontSize: '0.8rem' }}>Europe</MenuItem>
                </Select>

                <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600, ml: 1 }}>
                  Showing {totalEntries} {totalEntries === 1 ? 'organization' : 'organizations'}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Floating Fixed Bottom Bulk Action Bar */}
          <BulkActionBar
            selectedCount={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={downloadInstitutionsExcel}
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
                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredInstitutions.length}
                        checked={filteredInstitutions.length > 0 && selectedIds.length === filteredInstitutions.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: '#CBD5E1',
                          '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: '#2563EB' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '28%', minWidth: 260 }}>
                      INSTITUTION
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '18%', minWidth: 160 }}>
                      REGION / LOCATION
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '14%', minWidth: 140 }}>
                      SUBSCRIPTION TIER
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '16%', minWidth: 160 }}>
                      SEAT UTILIZATION
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, letterSpacing: '0.04em', width: '14%', minWidth: 150 }}>
                      COHORTS & FACULTY
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
                  {paginatedInstitutions.map((institution) => {
                    const isSelected = selectedIds.includes(institution.id);
                    const quotaPercent = Math.round((institution.studentsCount / institution.maxQuota) * 100);

                    return (
                      <TableRow
                        key={institution.id}
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
                            onChange={() => handleToggleSelectRow(institution.id)}
                            sx={{
                              color: '#CBD5E1',
                              '&.Mui-checked': { color: '#2563EB' },
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box
                            component={Link}
                            href={`/superadmin/institutions/${institution.id}`}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              textDecoration: 'none',
                              color: 'inherit',
                              '&:hover .institution-name': { color: '#2563EB' },
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                flexShrink: 0,
                                bgcolor: institution.logoColor,
                                fontSize: '0.8rem',
                                fontWeight: 800,
                                borderRadius: '12px',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                              }}
                            >
                              {institution.code.split('-')[0].substring(0, 3)}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                className="institution-name"
                                sx={{
                                  fontSize: '0.88rem',
                                  fontWeight: 700,
                                  color: '#0F172A',
                                  lineHeight: 1.35,
                                  transition: 'color 0.15s ease',
                                }}
                              >
                                {institution.name}
                              </Typography>
                              <Typography noWrap sx={{ fontSize: '0.73rem', color: '#64748B', fontFamily: 'monospace', mt: 0.25 }}>
                                {institution.code} • @{institution.domain}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Tooltip title={institution.region || 'Global'} arrow placement="top">
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, maxWidth: 200, px: 1, py: 0.4, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                              <LocationOnRoundedIcon sx={{ fontSize: 15, color: '#64748B', flexShrink: 0 }} />
                              <Typography
                                noWrap
                                sx={{
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: '#334155',
                                }}
                              >
                                {institution.region || 'Global'}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={institution.tier}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: '#EFF6FF',
                              color: '#2563EB',
                              borderRadius: '6px',
                              border: '1px solid #DBEAFE',
                              whiteSpace: 'nowrap',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Box sx={{ minWidth: 130, maxWidth: 180 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                              <Typography noWrap sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                                {institution.studentsCount.toLocaleString()} / {institution.maxQuota.toLocaleString()}
                              </Typography>
                              <Typography sx={{ fontSize: '0.72rem', color: quotaPercent > 90 ? '#DC2626' : '#2563EB', fontWeight: 700, ml: 1 }}>
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
                            {institution.coursesCount} Courses • {institution.cohortsCount} Cohorts
                          </Typography>
                          <Typography noWrap sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.25 }}>
                            {institution.facultyCount} Faculty Mentors
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 1.5 }}>
                          <Chip
                            label={institution.status}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: institution.status === 'Active' ? '#ECFDF5' : '#FFFBEB',
                              border: institution.status === 'Active' ? '1px solid #A7F3D0' : '1px solid #FEF3C7',
                              color: institution.status === 'Active' ? '#059669' : '#D97706',
                              borderRadius: '6px',
                              whiteSpace: 'nowrap',
                            }}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, py: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Edit Institution">
                              <IconButton
                                size="small"
                                onClick={() => setEditingInstitution(institution)}
                                sx={{
                                  color: '#2563EB',
                                  width: 30,
                                  height: 30,
                                  borderRadius: '6px',
                                  border: '1px solid #DBEAFE',
                                  bgcolor: '#EFF6FF',
                                  '&:hover': { color: '#1D4ED8', bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
                                }}
                              >
                                <EditRoundedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Institution">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteSingleInstitution(institution.id)}
                                sx={{
                                  color: '#EF4444',
                                  width: 32,
                                  height: 32,
                                  borderRadius: '6px',
                                  border: '1px solid #FEE2E2',
                                  bgcolor: '#FEF2F2',
                                  '&:hover': { color: '#DC2626', bgcolor: '#FEE2E2', borderColor: '#FECACA' },
                                }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More Options">
                              <IconButton
                                size="small"
                                onClick={(e) => setMenuAnchor({ element: e.currentTarget, institution })}
                                sx={{
                                  color: '#64748B',
                                  width: 32,
                                  height: 32,
                                  borderRadius: '6px',
                                  border: '1px solid #E2E8F0',
                                  bgcolor: '#F8FAFC',
                                  '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
                                }}
                              >
                                <MoreVertRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
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
                Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalEntries}</strong> institutions
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

      {/* 7. Action Context Menu */}
      <Menu
        anchorEl={menuAnchor?.element}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
              color: '#0F172A',
              borderRadius: '8px',
              minWidth: 160,
              '& .MuiMenuItem-root': {
                fontSize: '0.82rem',
                py: 1,
                color: '#334155',
                '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB' },
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) router.push(`/superadmin/institutions/${menuAnchor.institution.id}`);
            setMenuAnchor(null);
          }}
          sx={{ borderRadius: '8px', py: 1, '&:hover': { bgcolor: '#EFF6FF' } }}
        >
          <ListItemIcon sx={{ minWidth: 28 }}>
            <AccountBalanceRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
          </ListItemIcon>
          <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
            Open Institution Portal
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            router.push('/superadmin/students');
            setMenuAnchor(null);
          }}
          sx={{ borderRadius: '8px', py: 1 }}
        >
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
            View Student Roster
          </Typography>
        </MenuItem>

        <Divider sx={{ my: 0.75 }} />

        <Box sx={{ px: 1.5, py: 0.5 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Change Status
          </Typography>
        </Box>

        {(['Active', 'Trial', 'Provisioning', 'Suspended'] as const).map((statusOption) => {
          const isSelected = menuAnchor?.institution.status === statusOption;
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
                  const targetId = menuAnchor.institution.id;
                  const targetName = menuAnchor.institution.name;
                  setInstitutions((prev) =>
                    prev.map((c) => (c.id === targetId ? { ...c, status: statusOption } : c))
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

      {/* 8. Onboarding Modal */}
      <CreateInstitutionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateInstitution}
      />

      {/* 9. Edit Institution Modal */}
      <EditInstitutionModal
        open={Boolean(editingInstitution)}
        institution={editingInstitution}
        onClose={() => setEditingInstitution(null)}
        onSubmit={handleUpdateInstitution}
      />
    </Box>
  );
}
