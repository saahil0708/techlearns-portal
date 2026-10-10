'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Checkbox,
  Chip,
} from '@mui/material';
import dynamic from 'next/dynamic';

import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { InstitutionEntity } from '@/components/superadmin/institutions/InstitutionsDirectoryClient';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

import { BatchItem, StudentRosterItem, FacultyItem, CourseAssignmentItem } from './detail/types';
export type { BatchItem, StudentRosterItem, FacultyItem, CourseAssignmentItem };

import InstitutionHeaderStats from './detail/InstitutionHeaderStats';
import InstitutionBatchesTab from './detail/InstitutionBatchesTab';
import InstitutionStudentsTab from './detail/InstitutionStudentsTab';
import InstitutionFacultyTab from './detail/InstitutionFacultyTab';
import InstitutionSettingsTab from './detail/InstitutionSettingsTab';

const BulkImportStudentsModal = dynamic(() => import('@/components/superadmin/students/BulkImportStudentsModal'), { loading: () => null });

interface InstitutionDetailClientProps {
  institution: InstitutionEntity;
  initialBatches: BatchItem[];
  initialStudents: StudentRosterItem[];
  initialCourses: CourseAssignmentItem[];
  initialFaculty: FacultyItem[];
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
  const [liveInstitution, setLiveInstitution] = useState<InstitutionEntity>(institution);
  const [batches, setBatches] = useState<BatchItem[]>(initialBatches);
  const [students, setStudents] = useState<StudentRosterItem[]>(initialStudents);
  const [faculty, setFaculty] = useState<FacultyItem[]>(initialFaculty);
  const [courses, setCourses] = useState<CourseAssignmentItem[]>(initialCourses);

  // Tenant Settings
  const [settingsName, setSettingsName] = useState(institution.name);
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsAddress, setSettingsAddress] = useState(institution.region || '');
  const [settingsTier, setSettingsTier] = useState(institution.tier || 'Standard Academic');
  const [settingsQuota, setSettingsQuota] = useState<number>(institution.maxQuota || 100);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Modals
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchCode, setNewBatchCode] = useState('');
  const [newBatchCapacity, setNewBatchCapacity] = useState(60);
  const [newBatchYear, setNewBatchYear] = useState('2026');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const [isInviteFacultyOpen, setIsInviteFacultyOpen] = useState(false);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science & Engineering');
  const [newFacultyRole, setNewFacultyRole] = useState<'Professor' | 'HOD' | 'Dean' | 'Lab Assistant'>('Professor');
  const [isSubmittingFaculty, setIsSubmittingFaculty] = useState(false);

  // Edit / Delete Student
  const [editingStudent, setEditingStudent] = useState<StudentRosterItem | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentEmail, setEditStudentEmail] = useState('');
  const [editStudentRollNo, setEditStudentRollNo] = useState('');
  const [isSubmittingEditStudent, setIsSubmittingEditStudent] = useState(false);

  const [assigningStudent, setAssigningStudent] = useState<StudentRosterItem | null>(null);
  const [assignBatchId, setAssignBatchId] = useState('');
  const [isSubmittingAssignBatch, setIsSubmittingAssignBatch] = useState(false);

  const refreshLiveInstitution = async () => {
    try {
      const live = await apiService.getInstitutionById(institution.id);
      if (live?.id) {
        setLiveInstitution({
          id: live.id,
          name: live.name,
          code: live.code,
          domain: live.email && live.email.includes('@') ? live.email.split('@')[1] : `${live.code?.toLowerCase()}.edu`,
          region: live.address || live.region || 'Asia-Pacific',
          tier: live.tier || 'Standard Academic',
          studentsCount: live._count?.memberships || live.studentsCount || 0,
          maxQuota: live.quota || live.maxQuota || 100,
          coursesCount: live._count?.courses || 0,
          cohortsCount: live._count?.batches || 0,
          facultyCount: live.facultyCount || 0,
          status: live.status === 'ACTIVE' ? 'Active' : 'Suspended',
          logoColor: institution.logoColor,
        });
        setSettingsName(live.name || '');
        setSettingsAddress(live.address || live.region || '');
        setSettingsTier(live.tier || 'Standard Academic');
        setSettingsQuota(live.quota || live.maxQuota || 100);
        setSettingsEmail(live.email ?? '');
        setSettingsPhone(live.phone ?? '');
      }
    } catch {
      // background
    }
  };

  const reloadStudentsAndBatches = async () => {
    await refreshLiveInstitution();
    try {
      const targetInstId = liveInstitution.id || institution.id;
      const [batchesRes, usersRes, facultyRes] = await Promise.allSettled([
        apiService.getBatchesByInstitution(targetInstId),
        apiService.getUsers({ role: 'STUDENT', limit: 100 }),
        apiService.getInstitutionMembers(targetInstId),
      ]);

      if (batchesRes.status === 'fulfilled' && Array.isArray(batchesRes.value)) {
        const mappedBatches: BatchItem[] = batchesRes.value.map((b: any) => {
          const assignedFaculty = Array.isArray(b.faculty) ? b.faculty : [];
          const leadName = assignedFaculty.length > 0
            ? (assignedFaculty.length === 1 ? assignedFaculty[0].user?.name : `${assignedFaculty.length} Mentors`)
            : 'Unassigned';
          return {
            id: b.id,
            name: b.name,
            code: b.code || b.name.substring(0, 8).toUpperCase(),
            studentsCount: b._count?.students ?? b._count?.enrollments ?? b.studentsCount ?? 0,
            maxCapacity: b.maxCapacity || 60,
            facultyLead: leadName,
            faculty: assignedFaculty,
            facultyIds: assignedFaculty.map((f: any) => f.userId || f.user?.id).filter(Boolean),
            coursesAssigned: b._count?.courses ?? 0,
            year: b.year || '2026',
            status: b.status === 'ACTIVE' ? 'Active' : b.status === 'COMPLETED' ? 'Completed' : 'Upcoming',
            avgAccuracy: '0%',
          };
        });
        setBatches(mappedBatches);
      }

      if (usersRes.status === 'fulfilled') {
        const rawUsers = usersRes.value?.items || (Array.isArray(usersRes.value) ? usersRes.value : []);
        const instUsers = rawUsers.filter((u: any) =>
          u.institutionId === targetInstId ||
          (Array.isArray(u.memberships) && u.memberships.some((m: any) => m.institutionId === targetInstId || m.collegeId === targetInstId))
        );
        if (instUsers.length > 0) {
          const mappedStudents: StudentRosterItem[] = instUsers.map((u: any, idx: number) => ({
            id: u.id,
            name: u.name || 'Student Coder',
            email: u.email,
            rollNo: u.rollNo || u.studentId || `STU-${String(idx + 1).padStart(3, '0')}`,
            batch: u.batchEnrollments?.[0]?.batch?.name || u.cohort || 'General',
            problemsSolved: u.problemsSolved ?? u.solvedCount ?? u.solvedProblems ?? u._count?.solvedProblems ?? 0,
            totalSubmissions: u._count?.submissions ?? u.totalSubmissions ?? 0,
            accuracy: u.accuracy ?? '0%',
            activeStreak: u.streakDays ?? 0,
            lastActive: 'Recently',
            status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
          }));
          setStudents(mappedStudents);
        }
      }

      if (facultyRes.status === 'fulfilled') {
        const rawMembers = facultyRes.value?.items || (Array.isArray(facultyRes.value) ? facultyRes.value : []);
        const instFaculty = rawMembers.filter((m: any) =>
          m.role === 'FACULTY' || m.role === 'INSTITUTION_ADMIN' || m.role === 'COLLEGE_ADMIN' || m.user?.globalRole === 'FACULTY'
        );
        if (instFaculty.length > 0) {
          const mappedFaculty: FacultyItem[] = instFaculty.map((m: any) => {
            const u = m.user || m;
            return {
              id: u.id || m.userId,
              name: u.name || 'Faculty Mentor',
              email: u.email || '',
              department: m.department || 'Computer Science & Engineering',
              role: (m.role === 'INSTITUTION_ADMIN' ? 'Professor' : 'Professor') as 'Professor' | 'HOD' | 'Dean' | 'Lab Assistant',
              activeBatches: batches.length || 1,
              problemsCreated: u._count?.createdProblems ?? 0,
              joinedDate: new Date(u.createdAt || m.createdAt || Date.now()).toLocaleDateString(),
              status: 'Active',
            };
          });
          setFaculty(mappedFaculty);
        }
      }
    } catch {
      // background refresh fallback
    }
  };

  useEffect(() => {
    reloadStudentsAndBatches();
  }, [institution.id]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      await apiService.updateInstitution(liveInstitution.id, {
        name: settingsName,
        address: settingsAddress,
        tier: settingsTier,
        quota: settingsQuota,
        email: settingsEmail,
        phone: settingsPhone,
      });
      setLiveInstitution((prev) => ({
        ...prev,
        name: settingsName,
        region: settingsAddress,
        tier: settingsTier,
        maxQuota: settingsQuota,
      }));
      toast.success('Institution profile updated successfully.', 'Settings Saved');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update settings.', 'Save Failed');
    } finally {
      setIsSavingSettings(false);
    }
  };

const escapeHtml = (unsafe: any): string => {
  return String(unsafe ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

  const handleCloseBatchDialog = () => {
    setIsCreateBatchOpen(false);
    setEditingBatch(null);
    setNewBatchName('');
    setNewBatchCode('');
    setNewBatchCapacity(60);
    setNewBatchYear('2026');
    setSelectedFacultyIds([]);
  };

  const handleCreateBatch = async () => {
    if (!newBatchName.trim() || !newBatchCode.trim()) {
      toast.error('Batch name and code are required.', 'Validation Error');
      return;
    }
    setIsSubmittingBatch(true);
    try {
      const assignedFacultyObjs = faculty
        .filter((f) => selectedFacultyIds.includes(f.id))
        .map((f) => ({ id: f.id, user: { id: f.id, name: f.name, email: f.email, department: f.department } }));
      const leadName = assignedFacultyObjs.length > 0
        ? (assignedFacultyObjs.length === 1 ? assignedFacultyObjs[0].user?.name : `${assignedFacultyObjs.length} Mentors`)
        : 'Unassigned';

      if (editingBatch?.id) {
        const oldBatchName = editingBatch.name;
        const trimmedNewName = newBatchName.trim();
        await apiService.updateBatch(editingBatch.id, {
          name: trimmedNewName,
          maxCapacity: newBatchCapacity,
          facultyIds: selectedFacultyIds,
        });
        setBatches((prev) =>
          prev.map((b) =>
            b.id === editingBatch.id
              ? {
                  ...b,
                  name: trimmedNewName,
                  maxCapacity: newBatchCapacity,
                  facultyLead: leadName,
                  faculty: assignedFacultyObjs,
                  facultyIds: selectedFacultyIds,
                }
              : b
          )
        );
        setStudents((prev) =>
          prev.map((s) =>
            s.batch === oldBatchName
              ? { ...s, batch: trimmedNewName }
              : s
          )
        );
        toast.success(`Batch "${trimmedNewName}" updated with ${selectedFacultyIds.length} faculty mentor(s).`, 'Batch Updated');
      } else {
        const created = await apiService.createBatch({
          name: newBatchName.trim(),
          code: newBatchCode.trim().toUpperCase(),
          institutionId: liveInstitution.id,
          maxCapacity: newBatchCapacity || 60,
          facultyIds: selectedFacultyIds,
        });

        const newBatchItem: BatchItem = {
          id: created?.id || `batch-${Date.now()}`,
          name: newBatchName.trim(),
          code: newBatchCode.trim().toUpperCase(),
          studentsCount: 0,
          maxCapacity: newBatchCapacity,
          facultyLead: leadName,
          faculty: assignedFacultyObjs,
          facultyIds: selectedFacultyIds,
          coursesAssigned: 0,
          year: newBatchYear,
          status: 'Active',
          avgAccuracy: '0%',
        };

        setBatches((prev) => [newBatchItem, ...prev]);
        toast.success(`Batch "${newBatchName}" created with ${selectedFacultyIds.length} faculty mentor(s).`, 'Batch Created');
      }
      handleCloseBatchDialog();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save batch.', 'Save Failed');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleSaveEditStudent = async () => {
    if (!editingStudent) return;
    const name = editStudentName.trim();
    const email = editStudentEmail.trim().toLowerCase();
    if (!name || !email) {
      toast.error('Student name and email are required.', 'Validation Error');
      return;
    }
    setIsSubmittingEditStudent(true);
    try {
      await apiService.updateUser(editingStudent.id, {
        name,
        email,
      });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name,
                email,
              }
            : s
        )
      );
      toast.success(`Student "${name}" updated.`, 'Student Updated');
      setEditingStudent(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update student.', 'Update Failed');
    } finally {
      setIsSubmittingEditStudent(false);
    }
  };

  const handleAssignBatchSubmit = async () => {
    if (!assigningStudent || !assignBatchId) return;
    setIsSubmittingAssignBatch(true);
    try {
      const selectedBatch = batches.find((b) => b.id === assignBatchId);
      const oldBatchName = assigningStudent.batch;
      const newBatchName = selectedBatch?.name;

      await apiService.assignStudentsToBatch(assignBatchId, [assigningStudent.id]);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === assigningStudent.id ? { ...s, batch: newBatchName || s.batch } : s
        )
      );

      if (newBatchName && newBatchName !== oldBatchName) {
        setBatches((prev) =>
          prev.map((b) => {
            if (b.id === assignBatchId || b.name === newBatchName) {
              return { ...b, studentsCount: b.studentsCount + 1 };
            }
            if (oldBatchName && oldBatchName !== 'Unassigned' && b.name === oldBatchName) {
              return { ...b, studentsCount: Math.max(0, b.studentsCount - 1) };
            }
            return b;
          })
        );
      }

      toast.success(`Student assigned to batch "${selectedBatch?.name || 'Selected'}".`, 'Batch Assigned');
      setAssigningStudent(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to assign batch.', 'Assignment Failed');
    } finally {
      setIsSubmittingAssignBatch(false);
    }
  };

  const handleInviteFaculty = async () => {
    if (!newFacultyName.trim() || !newFacultyEmail.trim()) {
      toast.error('Name and email are required.', 'Validation Error');
      return;
    }
    setIsSubmittingFaculty(true);
    try {
      await apiService.bulkInviteUsers({
        users: [
          {
            name: newFacultyName.trim(),
            email: newFacultyEmail.trim().toLowerCase(),
            role: newFacultyRole === 'HOD' || newFacultyRole === 'Dean' ? 'INSTITUTION_ADMIN' : 'FACULTY',
            institutionId: liveInstitution.id,
          },
        ],
      });

      const newFacultyItem: FacultyItem = {
        id: `fac-${Date.now()}`,
        name: newFacultyName.trim(),
        email: newFacultyEmail.trim().toLowerCase(),
        department: newFacultyDept,
        role: newFacultyRole,
        activeBatches: 0,
        problemsCreated: 0,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'Invited',
      };

      setFaculty((prev) => [newFacultyItem, ...prev]);
      setIsInviteFacultyOpen(false);
      setNewFacultyName('');
      setNewFacultyEmail('');
      toast.success(`Invitation sent to ${newFacultyEmail.trim()}.`, 'Faculty Invited');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to invite faculty.', 'Invitation Failed');
    } finally {
      setIsSubmittingFaculty(false);
    }
  };

  const handleDeleteBatch = async (batch: BatchItem) => {
    if (!window.confirm(`Are you sure you want to delete batch "${batch.name}"?`)) return;
    try {
      await apiService.deleteBatch(batch.id);
      setBatches((prev) => prev.filter((b) => b.id !== batch.id));
      toast.success(`Batch "${batch.name}" deleted.`, 'Batch Deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete batch.', 'Delete Failed');
    }
  };

  const handleDeleteStudent = async (student: StudentRosterItem) => {
    if (!window.confirm(`Are you sure you want to remove student "${student.name}"?`)) return;
    try {
      await apiService.deleteUser(student.id);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      if (student.batch && student.batch !== 'Unassigned') {
        setBatches((prev) =>
          prev.map((b) =>
            b.name === student.batch
              ? { ...b, studentsCount: Math.max(0, b.studentsCount - 1) }
              : b
          )
        );
      }
      toast.success(`Student "${student.name}" removed.`, 'Student Removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete student.', 'Delete Failed');
    }
  };

  const handleExportRosterExcel = () => {
    const sanitizeExcelCell = (val: string | number | undefined | null): string => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return escapeHtml(str);
    };

    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>${escapeHtml(liveInstitution.name)} — Student Roster</h2>
        <table border="1">
          <tr style="background-color: #0B1F3A; color: #FFFFFF; font-weight: bold;">
            <th>Name</th><th>Email</th><th>Roll No</th><th>Batch</th><th>Problems Solved</th><th>Accuracy</th><th>Status</th>
          </tr>
          ${students
            .map(
              (s) => `
            <tr>
              <td>${sanitizeExcelCell(s.name)}</td><td>${sanitizeExcelCell(s.email)}</td><td>${sanitizeExcelCell(s.rollNo)}</td><td>${sanitizeExcelCell(s.batch)}</td>
              <td align="right">${sanitizeExcelCell(s.problemsSolved)}</td><td align="right">${sanitizeExcelCell(s.accuracy)}</td><td>${sanitizeExcelCell(s.status)}</td>
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
    link.href = url;
    link.download = `${liveInstitution.code}_students_${Date.now()}.xls`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Student roster exported as Excel.', 'Export Ready');
  };

  const handleExportRosterCSV = () => {
    const csvEscape = (val: string | number) => {
      let str = String(val ?? '');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };
    const headers = ['Name', 'Email', 'RollNo', 'Batch', 'ProblemsSolved', 'Accuracy', 'Status'];
    const rows = students.map((s) => [
      csvEscape(s.name),
      csvEscape(s.email),
      csvEscape(s.rollNo),
      csvEscape(s.batch),
      csvEscape(s.problemsSolved),
      csvEscape(s.accuracy),
      csvEscape(s.status),
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${liveInstitution.code}_students_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Student roster exported as CSV.', 'Export Ready');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      <FloatingSidebar />
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 2.5, md: 4.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            pb: { xs: 4, md: 6 },
          }}
        >
          <Navbar />

          {/* 1. Header and Key Metrics */}
          <InstitutionHeaderStats
            institution={liveInstitution}
            totalBatches={batches.length}
            totalStudents={students.length}
            totalFaculty={faculty.length}
            totalCourses={courses.length}
            onOpenCreateBatch={() => setIsCreateBatchOpen(true)}
            onOpenInviteFaculty={() => setIsInviteFacultyOpen(true)}
            onOpenBulkImport={() => setIsBulkImportOpen(true)}
            onExportExcel={handleExportRosterExcel}
            onExportCSV={handleExportRosterCSV}
          />

          {/* 2. Navigation Tabs */}
          <Box sx={{ borderBottom: '1px solid #E2E8F0' }}>
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              sx={{
                '& .MuiTabs-indicator': { bgcolor: '#0B1F3A', height: 3, borderRadius: '3px 3px 0 0' },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: '#64748B',
                  minWidth: 120,
                  '&.Mui-selected': { color: '#0B1F3A' },
                },
              }}
            >
              <Tab label={`Student Batches (${batches.length})`} />
              <Tab label={`Student Roster (${students.length})`} />
              <Tab label={`Faculty Mentors (${faculty.length})`} />
              <Tab label="Institution Settings" />
            </Tabs>
          </Box>

          {/* 3. Tab Contents */}
          {activeTab === 0 && (
            <InstitutionBatchesTab
              batches={batches}
              onOpenCreateBatch={() => {
                setEditingBatch(null);
                setNewBatchName('');
                setNewBatchCode('');
                setNewBatchCapacity(60);
                setNewBatchYear('2026');
                setSelectedFacultyIds([]);
                setIsCreateBatchOpen(true);
              }}
              onOpenEditBatch={(b) => {
                setEditingBatch(b);
                setNewBatchName(b.name);
                setNewBatchCode(b.code);
                setNewBatchCapacity(b.maxCapacity);
                setNewBatchYear(b.year);
                setSelectedFacultyIds(b.facultyIds || b.faculty?.map((f: any) => f.userId || f.user?.id || f.id).filter(Boolean) || []);
                setIsCreateBatchOpen(true);
              }}
              onDeleteBatch={handleDeleteBatch}
            />
          )}

          {activeTab === 1 && (
            <InstitutionStudentsTab
              students={students}
              batches={batches}
              onOpenEditStudent={(s) => {
                setEditingStudent(s);
                setEditStudentName(s.name);
                setEditStudentEmail(s.email);
                setEditStudentRollNo(s.rollNo);
              }}
              onOpenAssignBatch={(s) => {
                setAssigningStudent(s);
                const match = batches.find((b) => b.name === s.batch);
                setAssignBatchId(match ? match.id : batches[0]?.id || '');
              }}
              onOpenDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 2 && (
            <InstitutionFacultyTab
              faculty={faculty}
              onOpenInviteFaculty={() => setIsInviteFacultyOpen(true)}
            />
          )}

          {activeTab === 3 && (
            <InstitutionSettingsTab
              name={settingsName}
              onNameChange={setSettingsName}
              address={settingsAddress}
              onAddressChange={setSettingsAddress}
              tier={settingsTier}
              onTierChange={setSettingsTier}
              quota={settingsQuota}
              onQuotaChange={setSettingsQuota}
              email={settingsEmail}
              onEmailChange={setSettingsEmail}
              phone={settingsPhone}
              onPhoneChange={setSettingsPhone}
              onSave={handleSaveSettings}
              isSaving={isSavingSettings}
            />
          )}
        </Box>
      </Box>

      {/* Modal: Create / Edit Batch */}
      <Dialog open={isCreateBatchOpen} onClose={handleCloseBatchDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
          {editingBatch ? 'Edit Academic Batch' : 'Create New Academic Batch'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Batch Name"
            placeholder="e.g. Batch 2026 - CS Alpha"
            value={newBatchName}
            onChange={(e) => setNewBatchName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Batch Code"
            placeholder="e.g. CS26-ALPHA"
            value={newBatchCode}
            onChange={(e) => setNewBatchCode(e.target.value)}
            disabled={Boolean(editingBatch)}
            helperText={editingBatch ? 'Batch code cannot be modified after creation' : undefined}
            fullWidth
            size="small"
          />
          <TextField
            label="Academic Year"
            value={newBatchYear}
            onChange={(e) => setNewBatchYear(e.target.value)}
            disabled={Boolean(editingBatch)}
            helperText={editingBatch ? 'Academic year cannot be modified after creation' : undefined}
            fullWidth
            size="small"
          />
          <TextField
            label="Max Student Capacity"
            type="number"
            value={newBatchCapacity}
            onChange={(e) => setNewBatchCapacity(Number(e.target.value))}
            fullWidth
            size="small"
          />

          {/* Multiple Faculty Mentors Selection */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                Assign Faculty Mentors & Coordinators
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
                {selectedFacultyIds.length} Selected
              </Typography>
            </Box>

            <Box
              sx={{
                maxHeight: 160,
                overflowY: 'auto',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                p: 1,
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              {faculty.length === 0 ? (
                <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', p: 1, textAlign: 'center' }}>
                  No faculty mentors registered under this institution.
                </Typography>
              ) : (
                faculty.map((f) => {
                  const isSelected = selectedFacultyIds.includes(f.id);
                  return (
                    <Box
                      key={f.id}
                      onClick={() => {
                        setSelectedFacultyIds((prev) =>
                          prev.includes(f.id) ? prev.filter((id) => id !== f.id) : [...prev, f.id]
                        );
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '6px 10px',
                        borderRadius: '6px',
                        bgcolor: isSelected ? '#FAF5FF' : '#FFFFFF',
                        border: isSelected ? '1px solid #E9D5FF' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        '&:hover': { bgcolor: isSelected ? '#E9D5FF' : '#F1F5F9' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox checked={isSelected} size="small" sx={{ p: 0, color: '#CBD5E1', '&.Mui-checked': { color: '#0B1F3A' } }} />
                        <Box>
                          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A' }}>
                            {f.name}
                          </Typography>
                          <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                            {f.email} • {f.department || 'Faculty'}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={f.role}
                        size="small"
                        sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}
                      />
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={handleCloseBatchDialog} sx={{ color: '#64748B', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateBatch}
            disabled={isSubmittingBatch}
            sx={{ bgcolor: '#0B1F3A', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
          >
            {isSubmittingBatch ? (editingBatch ? 'Saving...' : 'Creating...') : (editingBatch ? 'Save Changes' : 'Create Batch')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Edit Student */}
      <Dialog open={Boolean(editingStudent)} onClose={() => setEditingStudent(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
          Edit Student Details
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Student Name"
            value={editStudentName}
            onChange={(e) => setEditStudentName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Email Address"
            value={editStudentEmail}
            onChange={(e) => setEditStudentEmail(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Roll Number / Student ID"
            value={editStudentRollNo}
            disabled
            helperText="Roll number cannot be updated directly"
            fullWidth
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setEditingStudent(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEditStudent}
            disabled={isSubmittingEditStudent}
            sx={{ bgcolor: '#0B1F3A', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
          >
            {isSubmittingEditStudent ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Assign Batch */}
      <Dialog open={Boolean(assigningStudent)} onClose={() => setAssigningStudent(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
          Assign Student to Batch
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Typography sx={{ fontSize: '0.86rem', color: '#64748B' }}>
            Assign <strong>{assigningStudent?.name}</strong> to an academic cohort:
          </Typography>
          <FormControl size="small" fullWidth>
            <InputLabel>Academic Batch</InputLabel>
            <Select
              value={assignBatchId}
              label="Academic Batch"
              onChange={(e) => setAssignBatchId(e.target.value)}
            >
              {batches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name} ({b.year})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setAssigningStudent(null)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignBatchSubmit}
            disabled={isSubmittingAssignBatch || !assignBatchId}
            sx={{ bgcolor: '#0B1F3A', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
          >
            {isSubmittingAssignBatch ? 'Assigning...' : 'Assign Batch'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal: Invite Faculty */}
      <Dialog open={isInviteFacultyOpen} onClose={() => setIsInviteFacultyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
          Invite Faculty Coordinator
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label="Faculty Name"
            placeholder="e.g. Dr. Arthur Pendelton"
            value={newFacultyName}
            onChange={(e) => setNewFacultyName(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Email Address"
            placeholder="e.g. arthur@institution.edu"
            value={newFacultyEmail}
            onChange={(e) => setNewFacultyEmail(e.target.value)}
            fullWidth
            size="small"
          />
          <TextField
            label="Department"
            value={newFacultyDept}
            onChange={(e) => setNewFacultyDept(e.target.value)}
            fullWidth
            size="small"
          />
          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={newFacultyRole}
              label="Role"
              onChange={(e) => setNewFacultyRole(e.target.value as any)}
            >
              <MenuItem value="Professor">Professor</MenuItem>
              <MenuItem value="HOD">Head of Department (HOD)</MenuItem>
              <MenuItem value="Dean">Dean / Academic Director</MenuItem>
              <MenuItem value="Lab Assistant">Lab Assistant</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button onClick={() => setIsInviteFacultyOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleInviteFaculty}
            disabled={isSubmittingFaculty}
            sx={{ bgcolor: '#0B1F3A', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
          >
            {isSubmittingFaculty ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Import Students Modal */}
      <BulkImportStudentsModal
        open={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        institutionId={liveInstitution.id}
        onImportSuccess={() => reloadStudentsAndBatches()}
      />
    </Box>
  );
}
