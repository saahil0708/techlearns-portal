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
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Select,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import Link from 'next/link';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { SchoolEntity } from '@/components/superadmin/schools/SchoolsDirectoryClient';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';

// Grade Section & Cohort Interface
export interface GradeCohortItem {
  id: string;
  name: string;
  code: string;
  gradeLevel: string;
  studentsCount: number;
  maxCapacity: number;
  teacherLead: string;
  labsAssigned: number;
  status: 'Active' | 'Upcoming' | 'Completed';
  avgAccuracy: string;
}

// Student Roster item
export interface SchoolStudentItem {
  id: string;
  name: string;
  studentId: string;
  email: string;
  cohort: string;
  gradeLevel: string;
  problemsSolved: number;
  accuracy: string;
  streakDays: number;
  rank: number;
  status: 'Active' | 'Inactive';
}

// Coding Lab item
export interface CodingLabItem {
  id: string;
  title: string;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modulesCount: number;
  enrolledStudents: number;
  completionRate: string;
  instructor: string;
}

// Teacher / Mentor item
export interface SchoolTeacherItem {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'CS Department Lead' | 'AP CS Instructor' | 'STEM Mentor' | 'Robotics Coach';
  cohortsAssigned: string[];
  activeLabs: number;
}

interface SchoolDetailClientProps {
  school: SchoolEntity;
  initialCohorts: GradeCohortItem[];
  initialStudents: SchoolStudentItem[];
  initialLabs: CodingLabItem[];
  initialTeachers: SchoolTeacherItem[];
}

interface PaginationToolbarProps {
  totalEntries: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  itemLabel?: string;
  rowsOptions?: number[];
}

function PaginationToolbar({
  totalEntries,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  itemLabel = 'items',
  rowsOptions = [5, 10, 25, 50],
}: PaginationToolbarProps) {
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages - 1);
  const startEntry = totalEntries === 0 ? 0 : safePage * rowsPerPage + 1;
  const endEntry = Math.min((safePage + 1) * rowsPerPage, totalEntries);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current <= 3) return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
    if (current >= total - 4) return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
    return [0, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total - 1];
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        px: 3,
        borderRadius: '14px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalEntries}</strong> {itemLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>Rows per page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(0);
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
            {rowsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(0)}
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
          disabled={safePage === 0}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
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
        {getPaginationRange(safePage, totalPages).map((item, idx) => {
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
          const isActive = safePage === pageIndex;

          return (
            <Box
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
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
        })}

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
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
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
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
  );
}

export default function SchoolDetailClient({
  school,
  initialCohorts,
  initialStudents,
  initialLabs,
  initialTeachers,
}: SchoolDetailClientProps) {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cohorts, setCohorts] = useState<GradeCohortItem[]>(initialCohorts);
  const [students] = useState<SchoolStudentItem[]>(initialStudents);
  const [teachers] = useState<SchoolTeacherItem[]>(initialTeachers);
  const [labs] = useState<CodingLabItem[]>(initialLabs);

  // Filter & Pagination states for Tab 0: Grade Sections & Cohorts
  const [cohortSearch, setCohortSearch] = useState('');
  const [cohortStatusFilter, setCohortStatusFilter] = useState('ALL');
  const [cohortPage, setCohortPage] = useState<number>(0);
  const [cohortRowsPerPage, setCohortRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 1: Student Roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterCohortFilter, setRosterCohortFilter] = useState('ALL');
  const [rosterPage, setRosterPage] = useState<number>(0);
  const [rosterRowsPerPage, setRosterRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 2: Coding Labs
  const [labsSearch, setLabsSearch] = useState('');
  const [labsLevelFilter, setLabsLevelFilter] = useState('ALL');
  const [labsPage, setLabsPage] = useState<number>(0);
  const [labsRowsPerPage, setLabsRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 3: CS Faculty & Mentors
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherRoleFilter, setTeacherRoleFilter] = useState('ALL');
  const [teacherPage, setTeacherPage] = useState<number>(0);
  const [teacherRowsPerPage, setTeacherRowsPerPage] = useState<number>(10);

  // Excel / CSV Export Menu state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  // Create Cohort Modal State
  const [isCreateCohortOpen, setIsCreateCohortOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState('');
  const [newCohortCode, setNewCohortCode] = useState('');
  const [newCohortGrade, setNewCohortGrade] = useState('Grade 10');
  const [newCohortCapacity, setNewCohortCapacity] = useState(60);
  const [newCohortTeacher, setNewCohortTeacher] = useState(teachers[0]?.name || 'Mr. David Vance');

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadSchoolReportExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>${school.name} (${school.code}) - Secondary School STEM Report</h2>
        <p>Domain: ${school.domain} | District: ${school.district} | Curriculum: ${school.curriculum}</p>
        <p>Students Enrolled: ${school.studentsCount} / ${school.maxQuota} quota</p>
        <br/>
        <h3>Student Roster & Performance</h3>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Rank</th>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>Grade Section / Club</th>
            <th>Grade Level</th>
            <th>Problems Solved</th>
            <th>Accuracy</th>
            <th>Streak (Days)</th>
          </tr>
          ${students
            .map(
              (s) => `
            <tr>
              <td align="center">${s.rank}</td>
              <td>${s.studentId}</td>
              <td>${s.name}</td>
              <td>${s.email}</td>
              <td>${s.cohort}</td>
              <td>${s.gradeLevel}</td>
              <td align="right">${s.problemsSolved}</td>
              <td align="right">${s.accuracy}</td>
              <td align="right">${s.streakDays}</td>
            </tr>`
            )
            .join('')}
        </table>
        <br/>
        <h3>Grade Sections & STEM Clubs</h3>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Cohort Code</th>
            <th>Section Name</th>
            <th>Grade</th>
            <th>Students Count</th>
            <th>Capacity</th>
            <th>Teacher Lead</th>
            <th>Average Accuracy</th>
          </tr>
          ${cohorts
            .map(
              (c) => `
            <tr>
              <td>${c.code}</td>
              <td>${c.name}</td>
              <td>${c.gradeLevel}</td>
              <td align="right">${c.studentsCount}</td>
              <td align="right">${c.maxCapacity}</td>
              <td>${c.teacherLead}</td>
              <td align="right">${c.avgAccuracy}</td>
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
    link.setAttribute('download', `${school.code.toLowerCase()}_school_report_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadSchoolReportCSV = () => {
    const headers = ['Type', 'Identifier / Code', 'Name / Title', 'Detail / Email', 'Metric 1', 'Metric 2', 'Status'];
    const studentRows = students.map((s) => [
      '"Student"',
      `"${s.studentId}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"Solved: ${s.problemsSolved}"`,
      `"Acc: ${s.accuracy}"`,
      `"${s.status}"`,
    ]);
    const cohortRows = cohorts.map((c) => [
      '"Cohort"',
      `"${c.code}"`,
      `"${c.name}"`,
      `"Teacher: ${c.teacherLead}"`,
      `"Students: ${c.studentsCount}/${c.maxCapacity}"`,
      `"Acc: ${c.avgAccuracy}"`,
      `"${c.status}"`,
    ]);

    const csvContent = [headers.join(','), ...studentRows.map((r) => r.join(',')), ...cohortRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${school.code.toLowerCase()}_school_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const handleCreateCohortSubmit = () => {
    if (!newCohortName || !newCohortCode) return;
    const created: GradeCohortItem = {
      id: `cohort-${Date.now()}`,
      name: newCohortName,
      code: newCohortCode,
      gradeLevel: newCohortGrade,
      studentsCount: 0,
      maxCapacity: Number(newCohortCapacity) || 60,
      teacherLead: newCohortTeacher,
      labsAssigned: 2,
      status: 'Active',
      avgAccuracy: '0.0%',
    };
    setCohorts([created, ...cohorts]);
    setIsCreateCohortOpen(false);
    setNewCohortName('');
    setNewCohortCode('');
  };

  // Filtered & Paginated Cohorts
  const filteredCohorts = cohorts.filter((c) => {
    if (cohortStatusFilter !== 'ALL' && c.status !== cohortStatusFilter) return false;
    if (
      cohortSearch &&
      !c.name.toLowerCase().includes(cohortSearch.toLowerCase()) &&
      !c.code.toLowerCase().includes(cohortSearch.toLowerCase()) &&
      !c.teacherLead.toLowerCase().includes(cohortSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedCohorts = filteredCohorts.slice(
    cohortPage * cohortRowsPerPage,
    cohortPage * cohortRowsPerPage + cohortRowsPerPage
  );

  // Filtered & Paginated Students
  const filteredStudents = students.filter((s) => {
    if (rosterCohortFilter !== 'ALL' && s.cohort !== rosterCohortFilter) return false;
    if (
      rosterSearch &&
      !s.name.toLowerCase().includes(rosterSearch.toLowerCase()) &&
      !s.studentId.toLowerCase().includes(rosterSearch.toLowerCase()) &&
      !s.email.toLowerCase().includes(rosterSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedStudents = filteredStudents.slice(
    rosterPage * rosterRowsPerPage,
    rosterPage * rosterRowsPerPage + rosterRowsPerPage
  );

  // Filtered & Paginated Coding Labs
  const filteredLabs = labs.filter((l) => {
    if (labsLevelFilter !== 'ALL' && l.level !== labsLevelFilter) return false;
    if (
      labsSearch &&
      !l.title.toLowerCase().includes(labsSearch.toLowerCase()) &&
      !l.code.toLowerCase().includes(labsSearch.toLowerCase()) &&
      !l.instructor.toLowerCase().includes(labsSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedLabs = filteredLabs.slice(
    labsPage * labsRowsPerPage,
    labsPage * labsRowsPerPage + labsRowsPerPage
  );

  // Filtered & Paginated Teachers
  const filteredTeachers = teachers.filter((t) => {
    if (teacherRoleFilter !== 'ALL' && t.role !== teacherRoleFilter) return false;
    if (
      teacherSearch &&
      !t.name.toLowerCase().includes(teacherSearch.toLowerCase()) &&
      !t.email.toLowerCase().includes(teacherSearch.toLowerCase()) &&
      !t.department.toLowerCase().includes(teacherSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedTeachers = filteredTeachers.slice(
    teacherPage * teacherRowsPerPage,
    teacherPage * teacherRowsPerPage + teacherRowsPerPage
  );

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

          {/* Breadcrumb & Top Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                component={Link}
                href="/superadmin/schools"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#64748B',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                }}
              >
                Back to Schools
              </Button>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                {school.name}
              </Typography>
            </Box>

            {/* Actions: Export & Create Section */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Tooltip title="Export School Data">
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
                    '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
                  }}
                >
                  Export Report
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
                <MenuItem onClick={downloadSchoolReportExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadSchoolReportCSV} sx={{ borderRadius: '8px', py: 1 }}>
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
                onClick={() => setIsCreateCohortOpen(true)}
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
                Add Grade Section
              </Button>
            </Box>
          </Box>

          {/* 4 Summary Metric Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Enrolled Students"
              value={school.studentsCount.toLocaleString()}
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="mountains"
              subtitle={`Max Quota: ${school.maxQuota.toLocaleString()}`}
            />

            <StatsCard
              title="Active Sections & Clubs"
              value={cohorts.length}
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="curves"
              subtitle={school.grades}
            />

            <StatsCard
              title="Coding Labs & Tracks"
              value={labs.length}
              icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="peaks"
              subtitle={school.curriculum}
            />

            <StatsCard
              title="CS Instructors"
              value={teachers.length}
              icon={<SupervisorAccountRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="waves"
              subtitle="STEM & Robotics Mentors"
            />
          </Box>

          {/* Navigation Tabs */}
          <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#64748B',
                  minHeight: 48,
                  px: 2.5,
                  '&.Mui-selected': { color: '#2563EB' },
                },
                '& .MuiTabs-indicator': {
                  bgcolor: '#2563EB',
                  height: 3,
                  borderRadius: '3px 3px 0 0',
                },
              }}
            >
              <Tab icon={<SchoolRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Grade Sections & Clubs" />
              <Tab icon={<PeopleAltRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Student Roster" />
              <Tab icon={<MenuBookRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Coding Labs & Tracks" />
              <Tab icon={<SecurityRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="CS Instructors" />
              <Tab icon={<SettingsRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="School Settings" />
            </Tabs>
          </Box>

          {/* TAB 0: Grade Sections & Clubs */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search section by name, code, teacher..."
                    value={cohortSearch}
                    onChange={(e) => {
                      setCohortSearch(e.target.value);
                      setCohortPage(0);
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
                      minWidth: { xs: '100%', sm: 280 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.84rem',
                        height: 36,
                        '& fieldset': { borderColor: '#E2E8F0' },
                      },
                    }}
                  />

                  <Select
                    size="small"
                    value={cohortStatusFilter}
                    onChange={(e) => {
                      setCohortStatusFilter(e.target.value);
                      setCohortPage(0);
                    }}
                    sx={{
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#F8FAFC',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Upcoming">Upcoming</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                  </Select>
                </Box>

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredCohorts.length}</strong> sections
                </Typography>
              </Card>

              {/* Sections Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>GRADE SECTION / CLUB</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>GRADE LEVEL</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>SEAT CAPACITY & UTILIZATION</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>TEACHER LEAD</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LABS ASSIGNED</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCohorts.map((cohort) => {
                        const capPercent = Math.round((cohort.studentsCount / cohort.maxCapacity) * 100);

                        return (
                          <TableRow key={cohort.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                            <TableCell sx={{ pl: 3, py: 1.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <SchoolRoundedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{cohort.name}</Typography>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{cohort.code}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Chip label={cohort.gradeLevel} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569', borderRadius: '5px' }} />
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Box sx={{ minWidth: 160 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                                    {cohort.studentsCount} / {cohort.maxCapacity} students
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700 }}>
                                    {capPercent}%
                                  </Typography>
                                </Box>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, capPercent)}
                                  sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 3 } }}
                                />
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                                {cohort.teacherLead}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                                {cohort.labsAssigned} Labs Enrolled
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Chip
                                label={cohort.status}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: cohort.status === 'Active' ? '#ECFDF5' : '#EFF6FF',
                                  border: cohort.status === 'Active' ? '1px solid #A7F3D0' : '1px solid #DBEAFE',
                                  color: cohort.status === 'Active' ? '#059669' : '#2563EB',
                                  borderRadius: '5px',
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                              <Button
                                size="small"
                                variant="outlined"
                                endIcon={<FluidArrowRight size={14} />}
                                onClick={() => {
                                  setRosterCohortFilter(cohort.name);
                                  setActiveTab(1);
                                }}
                                sx={{
                                  textTransform: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.76rem',
                                  color: '#2563EB',
                                  borderColor: '#DBEAFE',
                                  bgcolor: '#EFF6FF',
                                  borderRadius: '6px',
                                  px: 1.5,
                                  py: 0.4,
                                  '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
                                }}
                              >
                                View Roster
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Sections Pagination */}
              <PaginationToolbar
                totalEntries={filteredCohorts.length}
                currentPage={cohortPage}
                rowsPerPage={cohortRowsPerPage}
                onPageChange={setCohortPage}
                onRowsPerPageChange={setCohortRowsPerPage}
                itemLabel="sections"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 1: Student Roster */}
          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search student by name, student ID, email..."
                    value={rosterSearch}
                    onChange={(e) => {
                      setRosterSearch(e.target.value);
                      setRosterPage(0);
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
                      minWidth: { xs: '100%', sm: 280 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.84rem',
                        height: 36,
                        '& fieldset': { borderColor: '#E2E8F0' },
                      },
                    }}
                  />

                  <Select
                    size="small"
                    value={rosterCohortFilter}
                    onChange={(e) => {
                      setRosterCohortFilter(e.target.value);
                      setRosterPage(0);
                    }}
                    sx={{
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#F8FAFC',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Sections & Clubs</MenuItem>
                    {cohorts.map((c) => (
                      <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </Box>

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredStudents.length}</strong> students
                </Typography>
              </Card>

              {/* Roster Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>STUDENT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>STUDENT ID</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>SECTION / GRADE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>PROBLEMS SOLVED</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ACCURACY</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>STREAK</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>RANK</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedStudents.map((s) => (
                        <TableRow key={s.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.6 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#2563EB', fontSize: '0.76rem', fontWeight: 700 }}>
                                {s.name.substring(0, 2).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>{s.name}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{s.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.6, fontFamily: 'monospace', fontSize: '0.8rem', color: '#475569' }}>
                            {s.studentId}
                          </TableCell>
                          <TableCell sx={{ py: 1.6 }}>
                            <Chip label={s.cohort} size="small" sx={{ height: 22, fontSize: '0.72rem', bgcolor: '#F1F5F9', color: '#334155', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.6 }}>
                            <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A' }}>
                              {s.problemsSolved}{' '}
                              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>solved</span>
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.6 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#059669' }}>
                              {s.accuracy}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.6 }}>
                            <Chip label={`🔥 ${s.streakDays} days`} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FFFBEB', color: '#D97706', border: '1px solid #FEF3C7', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.6 }}>
                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: s.rank <= 3 ? '#2563EB' : '#64748B' }}>
                              #{s.rank}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Roster Pagination Toolbar */}
              <PaginationToolbar
                totalEntries={filteredStudents.length}
                currentPage={rosterPage}
                rowsPerPage={rosterRowsPerPage}
                onPageChange={setRosterPage}
                onRowsPerPageChange={setRosterRowsPerPage}
                itemLabel="students"
                rowsOptions={[5, 10, 25, 50]}
              />
            </Box>
          )}

          {/* TAB 2: Coding Labs & Tracks Table */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Labs Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search lab by title, code, instructor..."
                    value={labsSearch}
                    onChange={(e) => {
                      setLabsSearch(e.target.value);
                      setLabsPage(0);
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
                      minWidth: { xs: '100%', sm: 280 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.84rem',
                        height: 36,
                        '& fieldset': { borderColor: '#E2E8F0' },
                      },
                    }}
                  />

                  <Select
                    size="small"
                    value={labsLevelFilter}
                    onChange={(e) => {
                      setLabsLevelFilter(e.target.value);
                      setLabsPage(0);
                    }}
                    sx={{
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#F8FAFC',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Levels</MenuItem>
                    <MenuItem value="Beginner">Beginner</MenuItem>
                    <MenuItem value="Intermediate">Intermediate</MenuItem>
                    <MenuItem value="Advanced">Advanced</MenuItem>
                  </Select>
                </Box>

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredLabs.length}</strong> coding labs
                </Typography>
              </Card>

              {/* Labs Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>CODING LAB & TRACK</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LEVEL</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ENROLLED LEARNERS</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>COMPLETION PROGRESS</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>MENTOR / INSTRUCTOR</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>MODULES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLabs.map((lab) => (
                        <TableRow key={lab.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CodeRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{lab.title}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{lab.code}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              label={lab.level}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: lab.level === 'Advanced' ? '#FEF2F2' : lab.level === 'Intermediate' ? '#FFFBEB' : '#ECFDF5',
                                color: lab.level === 'Advanced' ? '#DC2626' : lab.level === 'Intermediate' ? '#D97706' : '#059669',
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                              {lab.enrolledStudents.toLocaleString()}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Students Active</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ minWidth: 140 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                                  {lab.completionRate}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(lab.completionRate) || 75}
                                sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 } }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                              {lab.instructor}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Chip
                              label={`${lab.modulesCount} Modules`}
                              size="small"
                              sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', borderRadius: '5px' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Labs Pagination */}
              <PaginationToolbar
                totalEntries={filteredLabs.length}
                currentPage={labsPage}
                rowsPerPage={labsRowsPerPage}
                onPageChange={setLabsPage}
                onRowsPerPageChange={setLabsRowsPerPage}
                itemLabel="coding labs"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 3: CS Faculty & Mentors Table */}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Faculty Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search instructor by name, email, department..."
                    value={teacherSearch}
                    onChange={(e) => {
                      setTeacherSearch(e.target.value);
                      setTeacherPage(0);
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
                      minWidth: { xs: '100%', sm: 280 },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        bgcolor: '#F8FAFC',
                        fontSize: '0.84rem',
                        height: 36,
                        '& fieldset': { borderColor: '#E2E8F0' },
                      },
                    }}
                  />

                  <Select
                    size="small"
                    value={teacherRoleFilter}
                    onChange={(e) => {
                      setTeacherRoleFilter(e.target.value);
                      setTeacherPage(0);
                    }}
                    sx={{
                      height: 36,
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      bgcolor: '#F8FAFC',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    }}
                  >
                    <MenuItem value="ALL">All Roles</MenuItem>
                    <MenuItem value="CS Department Lead">CS Department Lead</MenuItem>
                    <MenuItem value="AP CS Instructor">AP CS Instructor</MenuItem>
                    <MenuItem value="STEM Mentor">STEM Mentor</MenuItem>
                    <MenuItem value="Robotics Coach">Robotics Coach</MenuItem>
                  </Select>
                </Box>

                <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                  Showing <strong style={{ color: '#0F172A' }}>{filteredTeachers.length}</strong> instructors
                </Typography>
              </Card>

              {/* Faculty Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>CS INSTRUCTOR</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ROLE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>DEPARTMENT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ASSIGNED SECTIONS</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIVE LABS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedTeachers.map((t, idx) => (
                        <TableRow key={idx} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: '#2563EB', fontWeight: 800, fontSize: '0.8rem' }}>
                                {t.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{t.name}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{t.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={t.role} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={t.department} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#F1F5F9', color: '#475569', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {t.cohortsAssigned.map((bName, bIdx) => (
                                <Chip key={bIdx} label={bName} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '4px' }} />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                              {t.activeLabs} Labs
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>

              {/* Faculty Pagination */}
              <PaginationToolbar
                totalEntries={filteredTeachers.length}
                currentPage={teacherPage}
                rowsPerPage={teacherRowsPerPage}
                onPageChange={setTeacherPage}
                onRowsPerPageChange={setTeacherRowsPerPage}
                itemLabel="instructors"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 4: School Tenant Settings & Quota */}
          {activeTab === 4 && (
            <Card elevation={0} sx={{ p: 3.5, borderRadius: '20px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                K-12 School Organization Configuration
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${borderColor}` }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    District Domain Verification
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mb: 2 }}>
                    Students with verified school email addresses under <strong>@{school.domain}</strong> automatically gain grade section access.
                  </Typography>
                  <Chip icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />} label="Domain Active & Verified" color="success" size="small" />
                </Box>

                <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${borderColor}` }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    Age-Appropriate Sandbox & Single Sign-On
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mb: 2 }}>
                    COPPA / FERPA compliant restricted execution sandbox with Google Classroom & Clever SSO integration.
                  </Typography>
                  <Chip label="Google Classroom & Clever Enabled" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }} size="small" />
                </Box>
              </Box>
            </Card>
          )}
        </Box>
      </Box>

      {/* Create Cohort Modal Dialog */}
      <Dialog
        open={isCreateCohortOpen}
        onClose={() => setIsCreateCohortOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 480, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
          Add New Grade Section / STEM Club
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '24px !important', pb: 2.5 }}>
          <TextField
            label="Section / Club Name"
            placeholder="e.g. Grade 10 AP Computer Science"
            fullWidth
            size="small"
            value={newCohortName}
            onChange={(e) => setNewCohortName(e.target.value)}
          />
          <TextField
            label="Section Code"
            placeholder="e.g. STUY-G10-AP"
            fullWidth
            size="small"
            value={newCohortCode}
            onChange={(e) => setNewCohortCode(e.target.value)}
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                Grade Level
              </Typography>
              <Select
                fullWidth
                size="small"
                value={newCohortGrade}
                onChange={(e) => setNewCohortGrade(e.target.value)}
                sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
              >
                <MenuItem value="Grade 9">Grade 9</MenuItem>
                <MenuItem value="Grade 10">Grade 10</MenuItem>
                <MenuItem value="Grade 11">Grade 11</MenuItem>
                <MenuItem value="Grade 12">Grade 12</MenuItem>
                <MenuItem value="STEM Club">STEM / Olympiad Club</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
                Student Capacity
              </Typography>
              <TextField
                type="number"
                fullWidth
                size="small"
                value={newCohortCapacity}
                onChange={(e) => setNewCohortCapacity(Number(e.target.value))}
              />
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
              CS Teacher Lead
            </Typography>
            <Select
              fullWidth
              size="small"
              value={newCohortTeacher}
              onChange={(e) => setNewCohortTeacher(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              {teachers.map((t) => (
                <MenuItem key={t.id} value={t.name}>
                  {t.name} ({t.role})
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsCreateCohortOpen(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateCohortSubmit}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            Create Section
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
