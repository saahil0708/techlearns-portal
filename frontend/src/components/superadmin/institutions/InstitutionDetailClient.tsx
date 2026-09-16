'use client';

import React, { useState, useEffect } from 'react';
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
import { FluidArrowRight } from '@/utils/fluid_arrow';

import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { generateBatchCode } from '@/utils/batch-code';

// Components
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { InstitutionEntity } from '@/components/superadmin/institutions/InstitutionsDirectoryClient';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import RadialDonutGauge from '@/components/superadmin/shared/RadialDonutGauge';

// Batch interface
export interface BatchItem {
  id: string;
  name: string;
  code: string;
  studentsCount: number;
  maxCapacity: number;
  facultyLead: string;
  coursesAssigned: number;
  year: string;
  status: 'Active' | 'Upcoming' | 'Completed';
  avgAccuracy: string;
}

// Student Roster item
export interface StudentRosterItem {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  batch: string;
  problemsSolved: number;
  accuracy: string;
  streakDays: number;
  rank: number;
  status: 'Active' | 'Inactive';
}

// Course Assignment item
export interface CourseAssignmentItem {
  id: string;
  title: string;
  code: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  modulesCount: number;
  enrolledStudents: number;
  completionRate: string;
  facultyInstructor: string;
}

// Faculty Coordinator item
export interface FacultyCoordinatorItem {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'Department Head' | 'Senior Mentor' | 'Lab Instructor';
  batchesAssigned: string[];
  activeCourses: number;
}

export interface InstitutionDetailClientProps {
  institution: InstitutionEntity;
  initialBatches: BatchItem[];
  initialStudents: StudentRosterItem[];
  initialCourses: CourseAssignmentItem[];
  initialFaculty: FacultyCoordinatorItem[];
}

export type CollegeDetailClientProps = InstitutionDetailClientProps;

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

export default function InstitutionDetailClient({
  institution,
  initialBatches,
  initialStudents,
  initialCourses,
  initialFaculty,
}: InstitutionDetailClientProps) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  // Live institution state (starts from SSR prop, updated by client effect)
  const [liveInstitution, setLiveInstitution] = useState<InstitutionEntity>(institution);
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [students, setStudents] = useState<StudentRosterItem[]>(initialStudents);
  const [faculty, setFaculty] = useState<FacultyCoordinatorItem[]>(initialFaculty);
  const [courses, setCourses] = useState<CourseAssignmentItem[]>(initialCourses);

  // Tenant Settings edit state
  const [settingsName, setSettingsName] = useState(institution.name);
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsAddress, setSettingsAddress] = useState(institution.region || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Add Faculty Modal State
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyRole, setNewFacultyRole] = useState<'FACULTY' | 'INSTITUTION_ADMIN'>('FACULTY');
  const [newFacultyDepartment, setNewFacultyDepartment] = useState('Computer Science & Engineering');
  const [isSubmittingFaculty, setIsSubmittingFaculty] = useState(false);

  // Enroll Student Modal State
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentBatch, setNewStudentBatch] = useState('Unassigned');
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Invitation Success & Copy Modal State
  const [invitationSuccessData, setInvitationSuccessData] = useState<{
    name: string;
    email: string;
    role: string;
    activationUrl: string;
  } | null>(null);

  // Assign / Reassign Batch Modal State (Retry / Quick Assign)
  const [assigningStudent, setAssigningStudent] = useState<StudentRosterItem | null>(null);
  const [assignTargetBatchId, setAssignTargetBatchId] = useState<string>('');
  const [isAssigningBatch, setIsAssigningBatch] = useState<boolean>(false);

  const handleOpenAssignBatchModal = (student: StudentRosterItem) => {
    if (!batches || batches.length === 0) {
      setAssignTargetBatchId('');
      return;
    }
    setAssigningStudent(student);
    const match = batches.find((b) => b.name === student.batch);
    setAssignTargetBatchId(match ? match.id : batches[0].id);
  };

  const handleAssignBatchSubmit = async () => {
    if (!assigningStudent || !assignTargetBatchId || isAssigningBatch) return;
    const studentSnapshot = assigningStudent;
    const targetBatchId = assignTargetBatchId;
    const targetBatch = batches.find((b) => b.id === targetBatchId);
    const oldBatch = batches.find((b) => b.name === studentSnapshot.batch);

    // No-op if student is already in target batch
    if (oldBatch && oldBatch.id === targetBatchId) {
      setAssigningStudent(null);
      return;
    }

    setIsAssigningBatch(true);
    try {
      await apiService.assignStudentsToBatch(targetBatchId, [studentSnapshot.id]);
      const targetBatchName = targetBatch ? targetBatch.name : 'Assigned';

      setBatches((prev) =>
        prev.map((b) => {
          if (b.id === targetBatchId) return { ...b, studentsCount: (b.studentsCount || 0) + 1 };
          if (oldBatch && b.id === oldBatch.id) return { ...b, studentsCount: Math.max(0, (b.studentsCount || 0) - 1) };
          return b;
        })
      );
      setStudents((prev) =>
        prev.map((s) => (s.id === studentSnapshot.id ? { ...s, batch: targetBatchName } : s))
      );
      toast.success(`${studentSnapshot.name} assigned to ${targetBatchName}.`, 'Batch Assigned');
      setAssigningStudent(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign batch.', 'Assignment Error');
    } finally {
      setIsAssigningBatch(false);
    }
  };

  // Client-side live institution hydration (fixes SSR fallback when token not on server)
  useEffect(() => {
    let cancelled = false;
    async function hydrateLiveInstitution() {
      try {
        const live = await apiService.getInstitutionById(institution.id);
        if (!cancelled && live?.id) {
          const facultyMembers = Array.isArray(live.memberships)
            ? live.memberships.filter((m: any) => m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN').length
            : (live.facultyCount ?? 0);
          const studentMembers = Array.isArray(live.memberships)
            ? live.memberships.filter((m: any) => m.role === 'STUDENT').length
            : (live._count?.memberships ?? 0);

          setLiveInstitution({
            id: live.id,
            name: live.name,
            code: live.code,
            domain: live.email && live.email.includes('@') ? live.email.split('@')[1] : `${live.code?.toLowerCase()}.edu`,
            region: live.address || live.region || 'Asia-Pacific',
            tier: live.tier || 'Standard Academic',
            studentsCount: studentMembers,
            maxQuota: live.quota || live.maxQuota || 100,
            coursesCount: live._count?.courses || 0,
            cohortsCount: live._count?.batches || 0,
            facultyCount: facultyMembers,
            status: live.status === 'ACTIVE' ? 'Active' : 'Suspended',
            logoColor: institution.logoColor,
          });
          setSettingsName(live.name);
          setSettingsAddress(live.address || '');
          if (live.email) setSettingsEmail(live.email);
          if (live.phone) setSettingsPhone(live.phone);

          if (Array.isArray(live.memberships)) {
            const facultyList: FacultyCoordinatorItem[] = live.memberships
              .filter((m: any) => m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN')
              .map((m: any) => ({
                id: m.user?.id || m.userId,
                name: m.user?.name || 'Faculty Member',
                email: m.user?.email || '',
                department: m.user?.department || 'Computer Science & Engineering',
                role: (m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN') ? 'Department Head' : 'Senior Mentor',
                batchesAssigned: [],
                activeCourses: 0,
              }));
            setFaculty(facultyList);

            const studentList: StudentRosterItem[] = live.memberships
              .filter((m: any) => m.role === 'STUDENT')
              .map((m: any, idx: number) => {
                const batchEnrollment = m.user?.batchEnrollments?.[0]?.batch;
                return {
                  id: m.user?.id || m.userId,
                  name: m.user?.name || 'Student Developer',
                  rollNo: `STU-${(m.user?.id || m.userId).slice(0, 4).toUpperCase()}`,
                  email: m.user?.email || '',
                  batch: batchEnrollment?.name || 'Unassigned',
                  problemsSolved: 0,
                  accuracy: '0.0%',
                  streakDays: 0,
                  rank: idx + 1,
                  status: 'Active',
                };
              });
            setStudents(studentList);
          }
        }
      } catch {
        // keep SSR-provided institution
      }
    }
    hydrateLiveInstitution();
    return () => { cancelled = true; };
  }, [institution.id]);

  // Filter & Pagination states for Tab 0: Batches & Cohorts
  const [batchSearch, setBatchSearch] = useState('');
  const [batchStatusFilter, setBatchStatusFilter] = useState('ALL');
  const [batchPage, setBatchPage] = useState<number>(0);
  const [batchRowsPerPage, setBatchRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 1: Student Roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterBatchFilter, setRosterBatchFilter] = useState('ALL');
  const [rosterPage, setRosterPage] = useState<number>(0);
  const [rosterRowsPerPage, setRosterRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 2: Assigned Courses
  const [coursesSearch, setCoursesSearch] = useState('');
  const [coursesLevelFilter, setCoursesLevelFilter] = useState('ALL');
  const [coursesPage, setCoursesPage] = useState<number>(0);
  const [coursesRowsPerPage, setCoursesRowsPerPage] = useState<number>(10);

  // Filter & Pagination states for Tab 3: Faculty & Roles
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyRoleFilter, setFacultyRoleFilter] = useState('ALL');
  const [facultyPage, setFacultyPage] = useState<number>(0);
  const [facultyRowsPerPage, setFacultyRowsPerPage] = useState<number>(10);

  // Excel / CSV Export Menu state
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  // Create Batch Modal State
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchCapacity, setNewBatchCapacity] = useState(120);
  const [newBatchFaculty, setNewBatchFaculty] = useState('Unassigned');
  const [isCreatingBatch, setIsCreatingBatch] = useState(false);

  // Edit Batch Modal State
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [editBatchName, setEditBatchName] = useState('');
  const [editBatchCapacity, setEditBatchCapacity] = useState(120);
  const [isEditingBatch, setIsEditingBatch] = useState(false);

  // Live institution re-hydration (fixes SSR fallback issue)
  useEffect(() => {
    // no-op placeholder — live batches are handled in the batches effect below
  }, []);

  // Live Batches Loading from Backend API
  React.useEffect(() => {
    let isCurrent = true;

    async function loadLiveBatches() {
      try {
        if (!institution?.id) return;
        const liveBatches = await apiService.getBatchesByInstitution(institution.id);
        if (!isCurrent) return;

        if (Array.isArray(liveBatches)) {
          const mapped: BatchItem[] = liveBatches.map((b: any) => {
            const resolvedName = b.name || (b.id ? `Batch ${b.id.slice(-4).toUpperCase()}` : 'Batch');
            return {
              id: b.id,
              name: resolvedName,
              code: b.code || generateBatchCode(resolvedName, b.id),
              studentsCount: b._count?.students || 0,
              maxCapacity: b.maxCapacity || 100,
              facultyLead: b.facultyLead || (faculty.length > 0 ? faculty[0].name : 'Unassigned'),
              coursesAssigned: b._count?.courses || 0,
              year: b.startDate ? new Date(b.startDate).getFullYear().toString() : '2026-2027',
              status: b.status === 'ACTIVE' || !b.status ? 'Active' : b.status,
              avgAccuracy: b.avgAccuracy || '0.0%',
            };
          });

          setBatches((prev) => {
            // Keep optimistic or freshly added batches that have not yet been reflected in the server response
            const localOptimistic = prev.filter(
              (p) => p.id.startsWith('batch-') && !mapped.some((m) => m.id === p.id)
            );
            return [...localOptimistic, ...mapped];
          });
        }
      } catch (err) {
        console.warn('Failed to load live batches for institution:', err);
      }
    }

    loadLiveBatches();

    return () => {
      isCurrent = false;
    };
  }, [institution?.id, faculty]);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadinstitutionReportExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>${institution.name} (${institution.code}) - Academic Report</h2>
        <p>Domain: ${institution.domain} | Region: ${institution.region} | Tier: ${institution.tier}</p>
        <p>Students Enrolled: ${institution.studentsCount} / ${institution.maxQuota} quota</p>
        <br/>
        <h3>Student Roster & Performance</h3>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Rank</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Email</th>
            <th>Batch / Cohort</th>
            <th>Problems Solved</th>
            <th>Accuracy</th>
            <th>Streak (Days)</th>
          </tr>
          ${students.map(
      (s) => `
            <tr>
              <td align="center">${s.rank}</td>
              <td>${s.rollNo}</td>
              <td>${s.name}</td>
              <td>${s.email}</td>
              <td>${s.batch}</td>
              <td align="right">${s.problemsSolved}</td>
              <td align="right">${s.accuracy}</td>
              <td align="right">${s.streakDays}</td>
            </tr>`
    ).join('')}
        </table>
        <br/>
        <h3>Active Batches & Cohorts</h3>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Batch Code</th>
            <th>Batch Name</th>
            <th>Students Count</th>
            <th>Capacity</th>
            <th>Faculty Lead</th>
            <th>Average Accuracy</th>
          </tr>
          ${batches.map(
      (b) => `
            <tr>
              <td>${b.code}</td>
              <td>${b.name}</td>
              <td align="right">${b.studentsCount}</td>
              <td align="right">${b.maxCapacity}</td>
              <td>${b.facultyLead}</td>
              <td align="right">${b.avgAccuracy}</td>
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
    link.setAttribute('download', `${institution.code.toLowerCase()}_academic_report_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadinstitutionReportCSV = () => {
    const headers = ['Type', 'Identifier / Code', 'Name / Title', 'Detail / Email', 'Metric 1', 'Metric 2', 'Status'];
    const studentRows = students.map((s) => [
      '"Student"',
      `"${s.rollNo}"`,
      `"${s.name}"`,
      `"${s.email}"`,
      `"Solved: ${s.problemsSolved}"`,
      `"Acc: ${s.accuracy}"`,
      `"${s.status}"`,
    ]);
    const batchRows = batches.map((b) => [
      '"Batch"',
      `"${b.code}"`,
      `"${b.name}"`,
      `"Lead: ${b.facultyLead}"`,
      `"Students: ${b.studentsCount}/${b.maxCapacity}"`,
      `"Acc: ${b.avgAccuracy}"`,
      `"${b.status}"`,
    ]);

    const csvContent = [headers.join(','), ...studentRows.map((r) => r.join(',')), ...batchRows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${institution.code.toLowerCase()}_academic_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const handleCreateBatchSubmit = async () => {
    if (!newBatchName.trim() || !newBatchCode.trim() || isCreatingBatch) return;
    setIsCreatingBatch(true);
    const tempId = `batch-${Date.now()}`;
    const created: BatchItem = {
      id: tempId,
      name: newBatchName.trim(),
      code: newBatchCode.trim().toUpperCase(),
      studentsCount: 0,
      maxCapacity: Number(newBatchCapacity) || 100,
      facultyLead: newBatchFaculty || (faculty.length > 0 ? faculty[0].name : 'Unassigned'),
      coursesAssigned: 0,
      year: '2026-2027',
      status: 'Active',
      avgAccuracy: '0.0%',
    };
    setBatches((prev) => [created, ...prev]);
    setIsCreateBatchOpen(false);
    setNewBatchName('');
    setNewBatchCode('');

    try {
      const liveCreated = await apiService.createBatch({
        name: created.name,
        institutionId: institution.id,
        maxCapacity: created.maxCapacity,
      });
      if (liveCreated?.id) {
        setBatches((prev) =>
          prev.map((b) => (b.id === tempId ? { ...b, id: liveCreated.id, maxCapacity: liveCreated.maxCapacity ?? created.maxCapacity } : b))
        );
      }
      toast.success(`Batch "${created.name}" created successfully.`, 'Batch Created');
    } catch (err) {
      console.warn('Batch creation backend sync:', err);
      setBatches((prev) => prev.filter((b) => b.id !== tempId));
      toast.error(err instanceof Error ? err.message : 'Failed to create batch on server.', 'Batch Error');
    } finally {
      setIsCreatingBatch(false);
    }
  };

  const handleOpenEditBatch = (batch: BatchItem) => {
    setEditingBatch(batch);
    setEditBatchName(batch.name);
    setEditBatchCapacity(batch.maxCapacity);
  };

  const handleEditBatchSubmit = async () => {
    if (!editingBatch || isEditingBatch) return;
    setIsEditingBatch(true);
    const original = editingBatch;
    // Optimistic update
    setBatches((prev) =>
      prev.map((b) =>
        b.id === editingBatch.id
          ? { ...b, name: editBatchName, maxCapacity: editBatchCapacity }
          : b
      )
    );
    setEditingBatch(null);
    try {
      await apiService.updateBatch(original.id, {
        name: editBatchName,
        maxCapacity: editBatchCapacity,
      });
      toast.success(`Batch "${editBatchName}" updated.`, 'Batch Updated');
    } catch (err) {
      // Revert
      setBatches((prev) =>
        prev.map((b) => (b.id === original.id ? original : b))
      );
      toast.error(err instanceof Error ? err.message : 'Failed to update batch.', 'Batch Error');
    } finally {
      setIsEditingBatch(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    const original = batches.find((b) => b.id === batchId);
    setBatches((prev) => prev.filter((b) => b.id !== batchId));
    try {
      await apiService.deleteBatch(batchId);
      toast.success('Batch deleted.', 'Batch Deleted');
    } catch (err) {
      if (original) setBatches((prev) => [original, ...prev]);
      toast.error(err instanceof Error ? err.message : 'Failed to delete batch.', 'Batch Error');
    }
  };

  const handleAddFacultySubmit = async () => {
    if (!newFacultyName.trim() || !newFacultyEmail.trim() || isSubmittingFaculty) return;
    setIsSubmittingFaculty(true);
    try {
      const result = await apiService.bulkInviteUsers({
        users: [
          {
            name: newFacultyName.trim(),
            email: newFacultyEmail.trim().toLowerCase(),
            role: newFacultyRole,
            institutionId: institution.id,
          },
        ],
      });

      const activationUrl = result?.invitationLinks?.[0]?.activationUrl || `${window.location.origin}/accept-invitation`;

      const newFacultyItem: FacultyCoordinatorItem = {
        id: `fac-${Date.now()}`,
        name: newFacultyName.trim(),
        email: newFacultyEmail.trim().toLowerCase(),
        department: newFacultyDepartment,
        role: newFacultyRole === 'INSTITUTION_ADMIN' ? 'Department Head' : 'Senior Mentor',
        batchesAssigned: [],
        activeCourses: 0,
      };
      setFaculty((prev) => [newFacultyItem, ...prev]);
      setLiveInstitution((prev) => ({ ...prev, facultyCount: prev.facultyCount + 1 }));
      setIsAddFacultyOpen(false);

      setInvitationSuccessData({
        name: newFacultyName.trim(),
        email: newFacultyEmail.trim().toLowerCase(),
        role: newFacultyRole === 'INSTITUTION_ADMIN' ? 'Institution Administrator' : 'Faculty Mentor',
        activationUrl,
      });

      setNewFacultyName('');
      setNewFacultyEmail('');
      toast.success(`Invitation created for ${newFacultyName.trim()}.`, 'Invitation Sent');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send invitation.', 'Error');
    } finally {
      setIsSubmittingFaculty(false);
    }
  };

  const handleAddStudentSubmit = async () => {
    if (!newStudentName.trim() || !newStudentEmail.trim() || isSubmittingStudent) return;
    setIsSubmittingStudent(true);
    try {
      const assignedPassword = `StudentPass@${Date.now().toString().slice(-4)}!`;
      const newUser = await apiService.createUser({
        name: newStudentName.trim(),
        email: newStudentEmail.trim().toLowerCase(),
        password: assignedPassword,
        globalRole: 'STUDENT',
        institutionId: institution.id,
      });

      let assignedBatchName = 'Unassigned';
      const selectedBatch = batches.find((b) => b.id === newStudentBatch || b.name === newStudentBatch);
      if (selectedBatch && selectedBatch.id && !selectedBatch.id.startsWith('batch-') && selectedBatch.id !== 'Unassigned' && newUser?.id) {
        try {
          await apiService.assignStudentsToBatch(selectedBatch.id, [newUser.id]);
          assignedBatchName = selectedBatch.name;
          setBatches((prev) =>
            prev.map((b) =>
              b.id === selectedBatch.id ? { ...b, studentsCount: (b.studentsCount || 0) + 1 } : b
            )
          );
        } catch (batchErr) {
          console.warn('Failed to assign batch during student creation:', batchErr);
          assignedBatchName = 'Unassigned';
          toast.error(
            `Student created, but batch assignment failed. You can assign ${newStudentName.trim()} to ${selectedBatch.name} from the roster.`,
            'Batch Assignment Incomplete'
          );
        }
      }

      let invitationLinkUrl: string | null = null;
      try {
        const result = await apiService.bulkInviteUsers({
          users: [
            {
              name: newStudentName.trim(),
              email: newStudentEmail.trim().toLowerCase(),
              role: 'STUDENT',
              institutionId: institution.id,
            },
          ],
        });
        if (result?.invitationLinks?.[0]?.activationUrl) {
          invitationLinkUrl = result.invitationLinks[0].activationUrl;
        }
      } catch (inviteErr) {
        console.warn('Student invitation dispatch failed:', inviteErr);
      }

      const newStudentItem: StudentRosterItem = {
        id: newUser?.id || `stu-${Date.now()}`,
        name: newStudentName.trim(),
        rollNo: `STU-${(newUser?.id || Date.now().toString()).slice(-4).toUpperCase()}`,
        email: newStudentEmail.trim().toLowerCase(),
        batch: assignedBatchName,
        problemsSolved: 0,
        accuracy: '0.0%',
        streakDays: 0,
        rank: students.length + 1,
        status: 'Active',
      };
      setStudents((prev) => [newStudentItem, ...prev]);
      setLiveInstitution((prev) => ({ ...prev, studentsCount: prev.studentsCount + 1 }));
      setIsAddStudentOpen(false);

      if (invitationLinkUrl) {
        setInvitationSuccessData({
          name: newStudentName.trim(),
          email: newStudentEmail.trim().toLowerCase(),
          role: 'Student Coder',
          activationUrl: invitationLinkUrl,
        });
      } else {
        toast.error(
          `Account created for ${newStudentName.trim()}, but invitation link generation failed. You can resend the invite or reset access.`,
          'Invitation Error'
        );
      }

      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentBatch('Unassigned');
      toast.success(`Student ${newStudentName.trim()} enrolled successfully.`, 'Student Added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to enroll student.', 'Error');
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Filtered & Paginated Batches
  const filteredBatches = batches.filter((b) => {
    if (batchStatusFilter !== 'ALL' && b.status !== batchStatusFilter) return false;
    if (
      batchSearch &&
      !b.name.toLowerCase().includes(batchSearch.toLowerCase()) &&
      !b.code.toLowerCase().includes(batchSearch.toLowerCase()) &&
      !b.facultyLead.toLowerCase().includes(batchSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedBatches = filteredBatches.slice(
    batchPage * batchRowsPerPage,
    batchPage * batchRowsPerPage + batchRowsPerPage
  );

  // Filtered & Paginated Roster
  const filteredStudents = students.filter((s) => {
    if (rosterBatchFilter !== 'ALL' && s.batch !== rosterBatchFilter) return false;
    if (
      rosterSearch &&
      !s.name.toLowerCase().includes(rosterSearch.toLowerCase()) &&
      !s.rollNo.toLowerCase().includes(rosterSearch.toLowerCase()) &&
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

  // Filtered & Paginated Courses
  const filteredCourses = courses.filter((c) => {
    if (coursesLevelFilter !== 'ALL' && c.level !== coursesLevelFilter) return false;
    if (
      coursesSearch &&
      !c.title.toLowerCase().includes(coursesSearch.toLowerCase()) &&
      !c.code.toLowerCase().includes(coursesSearch.toLowerCase()) &&
      !c.facultyInstructor.toLowerCase().includes(coursesSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedCourses = filteredCourses.slice(
    coursesPage * coursesRowsPerPage,
    coursesPage * coursesRowsPerPage + coursesRowsPerPage
  );

  // Filtered & Paginated Faculty
  const filteredFaculty = faculty.filter((f) => {
    if (facultyRoleFilter !== 'ALL' && f.role !== facultyRoleFilter) return false;
    if (
      facultySearch &&
      !f.name.toLowerCase().includes(facultySearch.toLowerCase()) &&
      !f.email.toLowerCase().includes(facultySearch.toLowerCase()) &&
      !f.department.toLowerCase().includes(facultySearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
  const paginatedFaculty = filteredFaculty.slice(
    facultyPage * facultyRowsPerPage,
    facultyPage * facultyRowsPerPage + facultyRowsPerPage
  );

  const quotaPercent = Math.round((liveInstitution.studentsCount / (liveInstitution.maxQuota || 1)) * 100);
  const borderColor = '#E2E8F0';

  // institution-specific or API-provided metrics with Sample Data fallback
  const rawPlacement = (liveInstitution as any).placementReadiness ?? (liveInstitution as any).placementRate;
  const hasApiPlacement = rawPlacement !== undefined && rawPlacement !== null;
  const placementReadyPct = hasApiPlacement
    ? (typeof rawPlacement === 'number' ? rawPlacement : parseInt(String(rawPlacement).replace('%', ''), 10) || 0)
    : 86;
  const placementBadge = hasApiPlacement
    ? placementReadyPct >= 80
      ? 'High Placement'
      : placementReadyPct >= 60
        ? 'Average'
        : 'Developing'
    : 'Sample Data';
  const placementSublabel = hasApiPlacement
    ? 'Verified placement benchmark'
    : 'Sample: Industry benchmark';

  const rawAttendance = (liveInstitution as any).weeklyAttendance ?? (liveInstitution as any).attendanceRate ?? (liveInstitution as any).attendance;
  const hasApiAttendance = rawAttendance !== undefined && rawAttendance !== null;
  const attendancePct = hasApiAttendance
    ? (typeof rawAttendance === 'number' ? rawAttendance : parseInt(String(rawAttendance).replace('%', ''), 10) || 0)
    : 91;
  const attendanceBadge = hasApiAttendance
    ? attendancePct >= 85
      ? 'Consistent'
      : attendancePct >= 65
        ? 'Moderate'
        : 'Needs Attention'
    : 'Sample Data';
  const attendanceSublabel = hasApiAttendance
    ? 'Active cohort participation'
    : 'Sample: Active logins';

  const rawCurriculum = (liveInstitution as any).curriculumProgress ?? (liveInstitution as any).courseCompletionRate;
  const hasApiCurriculum = rawCurriculum !== undefined && rawCurriculum !== null;
  const curriculumProgressPct = hasApiCurriculum
    ? (typeof rawCurriculum === 'number' ? rawCurriculum : parseInt(String(rawCurriculum).replace('%', ''), 10) || 0)
    : 88;
  const curriculumBadge = hasApiCurriculum
    ? curriculumProgressPct >= 80
      ? 'On Track'
      : curriculumProgressPct >= 50
        ? 'Pacing'
        : 'Behind Schedule'
    : 'Sample Data';
  const curriculumSublabel = hasApiCurriculum
    ? 'Lab & module completion'
    : 'Sample: Module syllabus';

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
                href="/superadmin/institutions"
                startIcon={<ArrowBackRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  color: '#64748B',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                }}
              >
                Back to institutions
              </Button>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
                {liveInstitution.name}
              </Typography>
            </Box>

            {/* Actions: Export & Create Batch */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Tooltip title="Export institution Data">
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
                <MenuItem onClick={downloadinstitutionReportExcel} sx={{ borderRadius: '8px', py: 1 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                  </ListItemIcon>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                    Download Excel (.xls)
                  </Typography>
                </MenuItem>
                <MenuItem onClick={downloadinstitutionReportCSV} sx={{ borderRadius: '8px', py: 1 }}>
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
                onClick={() => setIsCreateBatchOpen(true)}
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
                Create Batch / Cohort
              </Button>
            </Box>
          </Box>

          {/* institution Header Card */}
          {/* <Card
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3.5 },
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: institution.logoColor,
                  fontWeight: 900,
                  fontSize: '1.3rem',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.12)',
                }}
              >
                {institution.code.split('-')[0].substring(0, 3)}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                  <Typography variant="h4" sx={{ fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.5rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
                    {institution.name}
                  </Typography>
                  <Chip
                    label={institution.status}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      bgcolor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      color: '#059669',
                      borderRadius: '6px',
                    }}
                  />
                </Box>
                <Typography sx={{ color: '#64748B', fontSize: '0.84rem', mt: 0.4, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{institution.code}</span>
                  <span>•</span>
                  <span>@{institution.domain}</span>
                  <span>•</span>
                  <span>{institution.region}</span>
                  <span>•</span>
                  <strong style={{ color: '#2563EB' }}>{institution.tier}</strong>
                </Typography>
              </Box>
            </Box>

            <Box sx={{ bgcolor: '#F8FAFC', border: `1px solid ${borderColor}`, borderRadius: '14px', p: 2, minWidth: 260 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Student Seat Quota
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                  {institution.studentsCount.toLocaleString()} / {institution.maxQuota.toLocaleString()}{' '}
                  <span style={{ color: '#2563EB' }}>({quotaPercent}%)</span>
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, quotaPercent)}
                sx={{
                  height: 7,
                  borderRadius: 4,
                  bgcolor: '#E2E8F0',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: quotaPercent > 90 ? '#EF4444' : '#2563EB',
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          </Card> */}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Enrolled Students"
              value={liveInstitution.studentsCount.toLocaleString()}
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle={`Active in ${batches.length} Cohorts`}
            />

            <StatsCard
              title="Active Batches"
              value={batches.length}
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="100% Assigned to Mentors"
            />

            <StatsCard
              title="Assigned Courses"
              value={courses.length}
              icon={<MenuBookRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="Curriculum tracks & labs"
            />

            <StatsCard
              title="Faculty Coordinators"
              value={faculty.length}
              icon={<SupervisorAccountRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Department leads"
            />
          </Box>

          {/* Institutional Health & Capacity Radial Donut Gauges */}
          <Card
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '16px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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
                  <PieChartRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                    Institutional Health & Capacity Overview
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Live seat allocation, placement readiness benchmark, and student engagement
                  </Typography>
                </Box>
              </Box>
              <Chip
                size="small"
                label={`${liveInstitution.tier} Partner Campus`}
                sx={{
                  height: 22,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  border: '1px solid #BFDBFE',
                  borderRadius: '6px',
                }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              <RadialDonutGauge
                percentage={quotaPercent}
                color={quotaPercent > 90 ? '#EF4444' : '#2563EB'}
                label="License Quota"
                sublabel={`${liveInstitution.studentsCount} of ${liveInstitution.maxQuota} seats`}
                badge={quotaPercent > 90 ? 'High Load' : 'Optimal'}
              />
              <RadialDonutGauge
                percentage={placementReadyPct}
                color="#059669"
                label="Placement Ready"
                sublabel={placementSublabel}
                badge={placementBadge}
              />
              <RadialDonutGauge
                percentage={attendancePct}
                color="#7C3AED"
                label="Weekly Attendance"
                sublabel={attendanceSublabel}
                badge={attendanceBadge}
              />
              <RadialDonutGauge
                percentage={curriculumProgressPct}
                color="#D97706"
                label="Curriculum Progress"
                sublabel={curriculumSublabel}
                badge={curriculumBadge}
              />
            </Box>
          </Card>

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
              <Tab icon={<SchoolRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Batches & Cohorts" />
              <Tab icon={<PeopleAltRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Student Roster" />
              <Tab icon={<MenuBookRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Assigned Courses" />
              <Tab icon={<SecurityRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Faculty & Roles" />
              <Tab icon={<SettingsRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} />} iconPosition="start" label="Tenant Settings" />
            </Tabs>
          </Box>

          {/* TAB 0: Batches & Cohorts Table */}
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Batches Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search batch by name, code, mentor..."
                    value={batchSearch}
                    onChange={(e) => {
                      setBatchSearch(e.target.value);
                      setBatchPage(0);
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
                    value={batchStatusFilter}
                    onChange={(e) => {
                      setBatchStatusFilter(e.target.value);
                      setBatchPage(0);
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
                  Showing <strong style={{ color: '#0F172A' }}>{filteredBatches.length}</strong> batches
                </Typography>
              </Card>

              {/* Batches Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>BATCH / COHORT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>YEAR</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 200 }}>CAPACITY & UTILIZATION</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>FACULTY LEAD</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>COURSES</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>STATUS</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIONS</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBatches.map((batch) => {
                        const capPercent = Math.round((batch.studentsCount / batch.maxCapacity) * 100);

                        return (
                          <TableRow key={batch.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                            <TableCell sx={{ pl: 3, py: 1.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <SchoolRoundedIcon sx={{ fontSize: 18 }} />
                                </Box>
                                <Box>
                                  <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{batch.name}</Typography>
                                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{batch.code}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Chip label={batch.year} size="small" sx={{ height: 22, fontSize: '0.72rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569', borderRadius: '5px' }} />
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Box sx={{ minWidth: 160 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                                    {batch.studentsCount} / {batch.maxCapacity} students
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
                                {batch.facultyLead}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Typography sx={{ fontSize: '0.82rem', color: '#475569' }}>
                                {batch.coursesAssigned === 1 ? '1 Course Assigned' : `${batch.coursesAssigned} Courses Assigned`}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ py: 1.75 }}>
                              <Chip
                                label={batch.status}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: batch.status === 'Active' ? '#ECFDF5' : '#EFF6FF',
                                  border: batch.status === 'Active' ? '1px solid #A7F3D0' : '1px solid #DBEAFE',
                                  color: batch.status === 'Active' ? '#059669' : '#2563EB',
                                  borderRadius: '5px',
                                }}
                              />
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  endIcon={<FluidArrowRight size={14} />}
                                  onClick={() => {
                                    setRosterBatchFilter(batch.name);
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
                                <Tooltip title="Edit Batch">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditBatch(batch)}
                                    sx={{
                                      color: '#7C3AED',
                                      width: 30,
                                      height: 30,
                                      borderRadius: '6px',
                                      border: '1px solid #EDE9FE',
                                      bgcolor: '#F5F3FF',
                                      '&:hover': { bgcolor: '#EDE9FE', borderColor: '#C4B5FD' },
                                    }}
                                  >
                                    <EditRoundedIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete Batch">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteBatch(batch.id)}
                                    sx={{
                                      color: '#EF4444',
                                      width: 30,
                                      height: 30,
                                      borderRadius: '6px',
                                      border: '1px solid #FEE2E2',
                                      bgcolor: '#FEF2F2',
                                      '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FECACA' },
                                    }}
                                  >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
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

              {/* Batches Pagination */}
              <PaginationToolbar
                totalEntries={filteredBatches.length}
                currentPage={batchPage}
                rowsPerPage={batchRowsPerPage}
                onPageChange={setBatchPage}
                onRowsPerPageChange={setBatchRowsPerPage}
                itemLabel="batches"
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
                    placeholder="Search student by name, roll no, email..."
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
                    value={rosterBatchFilter}
                    onChange={(e) => {
                      setRosterBatchFilter(e.target.value);
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
                    <MenuItem value="ALL">All Batches</MenuItem>
                    {batches.map((b) => (
                      <MenuItem key={b.id} value={b.name}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Showing <strong style={{ color: '#0F172A' }}>{filteredStudents.length}</strong> students
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SendRoundedIcon sx={{ fontSize: 15 }} />}
                    onClick={() => setIsAddStudentOpen(true)}
                    sx={{
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      px: 1.75,
                      py: 0.6,
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Invite Student
                  </Button>
                </Box>
              </Card>

              {/* Roster Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>STUDENT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ROLL NO</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>BATCH</TableCell>
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
                            {s.rollNo}
                          </TableCell>
                          <TableCell sx={{ py: 1.6 }}>
                            {s.batch === 'Unassigned' ? (
                              <Tooltip title="Click to Assign to Cohort">
                                <Chip
                                  label="Unassigned ⚡"
                                  size="small"
                                  clickable
                                  onClick={() => handleOpenAssignBatchModal(s)}
                                  sx={{
                                    height: 22,
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    bgcolor: '#FEF2F2',
                                    color: '#DC2626',
                                    border: '1px solid #FECACA',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#FEE2E2' },
                                  }}
                                />
                              </Tooltip>
                            ) : (
                              <Tooltip title="Click to Change Cohort">
                                <Chip
                                  label={s.batch}
                                  size="small"
                                  clickable
                                  onClick={() => handleOpenAssignBatchModal(s)}
                                  sx={{
                                    height: 22,
                                    fontSize: '0.72rem',
                                    bgcolor: '#F1F5F9',
                                    color: '#334155',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    '&:hover': { bgcolor: '#E2E8F0' },
                                  }}
                                />
                              </Tooltip>
                            )}
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

          {/* TAB 2: Assigned Courses Table */}
          {activeTab === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Courses Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search course by name, code, instructor..."
                    value={coursesSearch}
                    onChange={(e) => {
                      setCoursesSearch(e.target.value);
                      setCoursesPage(0);
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
                    value={coursesLevelFilter}
                    onChange={(e) => {
                      setCoursesLevelFilter(e.target.value);
                      setCoursesPage(0);
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
                  Showing <strong style={{ color: '#0F172A' }}>{filteredCourses.length}</strong> courses
                </Typography>
              </Card>

              {/* Courses Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>COURSE NAME & CODE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>LEVEL</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ENROLLED STUDENTS</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5, minWidth: 180 }}>COMPLETION RATE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>INSTRUCTOR</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>MODULES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCourses.map((course) => (
                        <TableRow key={course.id} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CodeRoundedIcon sx={{ fontSize: 18 }} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{course.title}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontFamily: 'monospace' }}>{course.code}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip
                              label={course.level}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                bgcolor: course.level === 'Advanced' ? '#FEF2F2' : course.level === 'Intermediate' ? '#FFFBEB' : '#ECFDF5',
                                color: course.level === 'Advanced' ? '#DC2626' : course.level === 'Intermediate' ? '#D97706' : '#059669',
                                borderRadius: '5px',
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                              {course.enrolledStudents.toLocaleString()}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>Students Active</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ minWidth: 140 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#0F172A' }}>
                                  {course.completionRate}
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={parseFloat(course.completionRate) || 70}
                                sx={{ height: 5, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 3 } }}
                              />
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                              {course.facultyInstructor}
                            </Typography>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Chip
                              label={`${course.modulesCount} Modules`}
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

              {/* Courses Pagination */}
              <PaginationToolbar
                totalEntries={filteredCourses.length}
                currentPage={coursesPage}
                rowsPerPage={coursesRowsPerPage}
                onPageChange={setCoursesPage}
                onRowsPerPageChange={setCoursesRowsPerPage}
                itemLabel="courses"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 3: Faculty & Roles Table */}
          {activeTab === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Faculty Filter bar */}
              <Card elevation={0} sx={{ p: 2, px: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
                  <TextField
                    size="small"
                    placeholder="Search faculty by name, email, department..."
                    value={facultySearch}
                    onChange={(e) => {
                      setFacultySearch(e.target.value);
                      setFacultyPage(0);
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
                    value={facultyRoleFilter}
                    onChange={(e) => {
                      setFacultyRoleFilter(e.target.value);
                      setFacultyPage(0);
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
                    <MenuItem value="Department Head">Department Head</MenuItem>
                    <MenuItem value="Senior Mentor">Senior Mentor</MenuItem>
                    <MenuItem value="Lab Instructor">Lab Instructor</MenuItem>
                  </Select>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Showing <strong style={{ color: '#0F172A' }}>{filteredFaculty.length}</strong> faculty members
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<SendRoundedIcon sx={{ fontSize: 15 }} />}
                    onClick={() => setIsAddFacultyOpen(true)}
                    sx={{
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      px: 1.75,
                      py: 0.6,
                      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Invite Faculty / Admin
                  </Button>
                </Box>
              </Card>

              {/* Faculty Table */}
              <Card elevation={0} sx={{ borderRadius: '16px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pl: 3, py: 1.5 }}>FACULTY COORDINATOR</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ROLE</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>DEPARTMENT</TableCell>
                        <TableCell sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', py: 1.5 }}>ASSIGNED BATCHES</TableCell>
                        <TableCell align="right" sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', pr: 3, py: 1.5 }}>ACTIVE COURSES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedFaculty.map((f, idx) => (
                        <TableRow key={idx} hover sx={{ '& td': { borderBottom: '1px solid #F1F5F9' } }}>
                          <TableCell sx={{ pl: 3, py: 1.75 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: '#3B82F6', fontWeight: 800, fontSize: '0.8rem' }}>
                                {f.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                              </Avatar>
                              <Box>
                                <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>{f.name}</Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>{f.email}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={f.role} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Chip label={f.department} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: '#F1F5F9', color: '#475569', borderRadius: '5px' }} />
                          </TableCell>
                          <TableCell sx={{ py: 1.75 }}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {f.batchesAssigned.map((bName, bIdx) => (
                                <Chip key={bIdx} label={bName} size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', borderRadius: '4px' }} />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="right" sx={{ pr: 3, py: 1.75 }}>
                            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                              {f.activeCourses} Courses
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
                totalEntries={filteredFaculty.length}
                currentPage={facultyPage}
                rowsPerPage={facultyRowsPerPage}
                onPageChange={setFacultyPage}
                onRowsPerPageChange={setFacultyRowsPerPage}
                itemLabel="faculty members"
                rowsOptions={[5, 10, 20]}
              />
            </Box>
          )}

          {/* TAB 4: Tenant Settings & Quota */}
          {activeTab === 4 && (
            <Card elevation={0} sx={{ p: 3.5, borderRadius: '20px', bgcolor: '#FFFFFF', border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                  Multi-Tenant Organization Configuration
                </Typography>
                <Button
                  variant="contained"
                  disabled={isSavingSettings}
                  onClick={async () => {
                    setIsSavingSettings(true);
                    try {
                      const updated = await apiService.updateInstitution(liveInstitution.id, {
                        name: settingsName,
                        email: settingsEmail || undefined,
                        phone: settingsPhone || undefined,
                        address: settingsAddress || undefined,
                      });
                      if (updated?.name) {
                        setLiveInstitution((prev) => ({ ...prev, name: updated.name, region: updated.address || prev.region }));
                      }
                      toast.success('institution settings saved.', 'Settings Saved');
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to save settings.', 'Save Error');
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  sx={{
                    bgcolor: '#2563EB',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.75,
                    '&:hover': { bgcolor: '#1D4ED8' },
                  }}
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </Button>
              </Box>

              {/* Editable fields */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                <TextField
                  label="Institution Name"
                  size="small"
                  fullWidth
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                />
                <TextField
                  label="Contact Email"
                  size="small"
                  fullWidth
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                />
                <TextField
                  label="Phone Number"
                  size="small"
                  fullWidth
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                />
                <TextField
                  label="Region / Address"
                  size="small"
                  fullWidth
                  value={settingsAddress}
                  onChange={(e) => setSettingsAddress(e.target.value)}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${borderColor}` }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    Domain Verification & Auto-Roster
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mb: 2 }}>
                    Students with verified email addresses under <strong>@{liveInstitution.domain}</strong> automatically gain seat access.
                  </Typography>
                  <Chip icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />} label="Domain Active & Verified" color="success" size="small" />
                </Box>

                <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: '#F8FAFC', border: `1px solid ${borderColor}` }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                    Single Sign-On (SAML / Google Workspace)
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mb: 2 }}>
                    Allow faculty and students to authenticate via institution identity provider (IdP).
                  </Typography>
                  <Chip label="SAML 2.0 Enabled" sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }} size="small" />
                </Box>
              </Box>
            </Card>
          )}
        </Box>
      </Box>

      {/* Create Batch Modal Dialog */}
      <Dialog
        open={isCreateBatchOpen}
        onClose={() => setIsCreateBatchOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 480, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
          Create New Student Batch / Cohort
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '24px !important', pb: 2.5 }}>
          <TextField
            label="Batch Name"
            placeholder="e.g. Batch 2026 - CS Alpha"
            fullWidth
            size="small"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
          />
          <TextField
            label="Batch Code"
            placeholder="e.g. STAN-2026-A"
            fullWidth
            size="small"
            value={newBatchCode}
            onChange={(e) => setNewBatchCode(e.target.value)}
          />
          <TextField
            label="Student Capacity"
            type="number"
            fullWidth
            size="small"
            value={newBatchCapacity}
            onChange={(e) => setNewBatchCapacity(Number(e.target.value))}
          />
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
              Faculty Mentor Lead
            </Typography>
            <Select
              fullWidth
              size="small"
              value={newBatchFaculty}
              onChange={(e) => setNewBatchFaculty(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <MenuItem value="Unassigned">Unassigned</MenuItem>
              {faculty.map((f) => (
                <MenuItem key={f.id} value={f.name}>
                  {f.name} ({f.department})
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsCreateBatchOpen(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBatchSubmit}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            Create Batch
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Batch Modal Dialog */}
      <Dialog
        open={Boolean(editingBatch)}
        onClose={() => setEditingBatch(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 440, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', pb: 1 }}>
          Edit Batch / Cohort
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '16px !important', pb: 2.5 }}>
          <TextField
            label="Batch Name"
            fullWidth
            size="small"
            value={editBatchName}
            onChange={(e) => setEditBatchName(e.target.value)}
          />
          <TextField
            label="Max Capacity"
            type="number"
            fullWidth
            size="small"
            value={editBatchCapacity}
            onChange={(e) => setEditBatchCapacity(Number(e.target.value))}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setEditingBatch(null)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isEditingBatch}
            onClick={handleEditBatchSubmit}
            sx={{ bgcolor: '#7C3AED', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, '&:hover': { bgcolor: '#6D28D9' } }}
          >
            {isEditingBatch ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Faculty / institution Admin Modal Dialog */}
      <Dialog
        open={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 460, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
          Add Faculty or institution Admin
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '20px !important', pb: 2 }}>
          <TextField
            label="Full Name"
            placeholder="e.g. Dr. Ramesh Kumar"
            fullWidth
            size="small"
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
          />
          <TextField
            label="Email Address"
            placeholder="e.g. ramesh@sviet.edu"
            type="email"
            fullWidth
            size="small"
            value={newFacultyEmail}
            onChange={(e) => setNewFacultyEmail(e.target.value)}
          />
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
              Institutional Role
            </Typography>
            <Select
              fullWidth
              size="small"
              value={newFacultyRole}
              onChange={(e) => setNewFacultyRole(e.target.value as any)}
              sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <MenuItem value="FACULTY">Faculty Mentor (Instructor)</MenuItem>
              <MenuItem value="INSTITUTION_ADMIN">Institution Administrator (Campus Lead)</MenuItem>
            </Select>
          </Box>
          <TextField
            label="Department / Specialization"
            placeholder="e.g. Computer Science & Engineering"
            fullWidth
            size="small"
            value={newFacultyDepartment}
            onChange={(e) => setNewFacultyDepartment(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsAddFacultyOpen(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isSubmittingFaculty}
            onClick={handleAddFacultySubmit}
            startIcon={<SendRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, '&:hover': { bgcolor: '#1D4ED8' } }}
          >
            {isSubmittingFaculty ? 'Sending...' : 'Send Invitation Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enroll Student Modal Dialog */}
      <Dialog
        open={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 460, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A' }}>
          Invite Student to {liveInstitution.name}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '20px !important', pb: 2 }}>
          <TextField
            label="Student Full Name"
            placeholder="e.g. Priya Sharma"
            fullWidth
            size="small"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
          />
          <TextField
            label="Student Email Address"
            placeholder="e.g. priya@sviet.edu"
            type="email"
            fullWidth
            size="small"
            value={newStudentEmail}
            onChange={(e) => setNewStudentEmail(e.target.value)}
          />
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
              Assign to Initial Batch (Optional)
            </Typography>
            <Select
              fullWidth
              size="small"
              value={newStudentBatch}
              onChange={(e) => setNewStudentBatch(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              <MenuItem value="Unassigned">Unassigned (General institution Roster)</MenuItem>
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setIsAddStudentOpen(false)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isSubmittingStudent}
            onClick={handleAddStudentSubmit}
            startIcon={<SendRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, '&:hover': { bgcolor: '#1D4ED8' } }}
          >
            {isSubmittingStudent ? 'Sending...' : 'Send Student Invite'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invitation Success & Copy Link Modal */}
      <Dialog
        open={Boolean(invitationSuccessData)}
        onClose={() => setInvitationSuccessData(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '20px', width: '100%', maxWidth: 520, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          Invitation Created!
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '12px !important', pb: 2.5 }}>
          <Typography sx={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.6 }}>
            An activation invitation has been generated for <strong>{invitationSuccessData?.name}</strong> (<code>{invitationSuccessData?.email}</code>) as <strong>{invitationSuccessData?.role}</strong> under <strong>{liveInstitution.name}</strong>.
          </Typography>

          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
              Activation & Password Setup Link (Valid 72h)
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#FFFFFF', p: 1, px: 1.5, borderRadius: '8px', border: '1px solid #CBD5E1' }}>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#0F172A',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {invitationSuccessData?.activationUrl}
              </Typography>
              <Tooltip title="Copy Link to Clipboard">
                <IconButton
                  size="small"
                  onClick={() => {
                    if (invitationSuccessData?.activationUrl) {
                      navigator.clipboard.writeText(invitationSuccessData.activationUrl);
                      toast.success('Invitation activation link copied!', 'Copied');
                    }
                  }}
                  sx={{ color: '#2563EB', '&:hover': { bgcolor: '#EFF6FF' } }}
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
            When the user opens this link, they will choose their password and gain immediate access with their designated role.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => {
              if (invitationSuccessData?.activationUrl) {
                window.open(invitationSuccessData.activationUrl, '_blank');
              }
            }}
            startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px', color: '#475569', borderColor: '#CBD5E1' }}
          >
            Test Link in New Tab
          </Button>
          <Button
            variant="contained"
            onClick={() => setInvitationSuccessData(null)}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5 }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign / Re-assign Batch Modal Dialog */}
      <Dialog
        open={Boolean(assigningStudent)}
        onClose={() => setAssigningStudent(null)}
        slotProps={{
          paper: {
            sx: { borderRadius: '18px', width: '100%', maxWidth: 440, p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
          Assign Student to Batch / Cohort
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '16px !important', pb: 2 }}>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748B' }}>
            Assign <strong>{assigningStudent?.name}</strong> ({assigningStudent?.email}) to an active cohort in {liveInstitution.name}.
          </Typography>
          <Box>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748B', mb: 0.5 }}>
              Select Cohort
            </Typography>
            <Select
              fullWidth
              size="small"
              value={assignTargetBatchId}
              onChange={(e) => setAssignTargetBatchId(e.target.value)}
              sx={{ borderRadius: '8px', fontSize: '0.85rem' }}
            >
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name} ({b.studentsCount || 0} enrolled)
                </MenuItem>
              ))}
            </Select>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setAssigningStudent(null)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isAssigningBatch || !assignTargetBatchId}
            onClick={handleAssignBatchSubmit}
            sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, '&:hover': { bgcolor: '#1D4ED8' } }}
          >
            {isAssigningBatch ? 'Assigning...' : 'Assign to Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

