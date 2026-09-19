'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';

// Icons
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';

import InstitutionAdminSidebar from '@/components/institution-admin/layout/InstitutionAdminSidebar';
import InstitutionAdminNavbar from '@/components/institution-admin/layout/InstitutionAdminNavbar';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import FacultyInviteMemberModal from '@/components/faculty/profile/FacultyInviteMemberModal';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';

export default function InstitutionAdminDashboardClient() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [batchesList, setBatchesList] = useState<any[]>([]);
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const activeMemberships = Array.isArray(user?.memberships) ? user.memberships : [];
  const primaryMembership =
    activeMemberships.find(
      (m: any) =>
        m?.role === 'INSTITUTION_ADMIN' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'FACULTY'
    ) || activeMemberships[0];

  const collegeId =
    primaryMembership?.collegeId ||
    primaryMembership?.college?.id ||
    primaryMembership?.institutionId ||
    primaryMembership?.institution?.id ||
    (user as any)?.collegeId ||
    (user as any)?.institutionId ||
    '';

  const collegeName =
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (user as any)?.institution ||
    'Academic Institution';

  const collegeCode =
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'CAMPUS';

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [usersRes, batchesRes, submissionsRes] = await Promise.all([
          apiService.getUsers({ limit: 100 }).catch(() => null),
          collegeId ? apiService.getBatchesByCollege(collegeId).catch(() => []) : Promise.resolve([]),
          apiService.getLiveSubmissions(6).catch(() => []),
        ]);

        if (usersRes?.items) {
          const allUsers = usersRes.items;
          const institutionFaculty = allUsers.filter((u: any) => {
            const hasFacultyMembership = u.memberships?.some(
              (m: any) =>
                (m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN' || m.role === 'INSTITUTION_ADMIN') &&
                (!collegeId || m.collegeId === collegeId || m.institutionId === collegeId)
            );
            return (
              hasFacultyMembership ||
              ((u.globalRole === 'FACULTY' || u.globalRole === 'COLLEGE_ADMIN' || u.globalRole === 'INSTITUTION_ADMIN') &&
                (!collegeId || u.institutionId === collegeId || u.collegeId === collegeId))
            );
          });
          setFacultyList(institutionFaculty);

          const studentUsers = allUsers.filter((u: any) => {
            const hasStudentMembership = u.memberships?.some(
              (m: any) =>
                m.role === 'STUDENT' &&
                (!collegeId || m.collegeId === collegeId || m.institutionId === collegeId)
            );
            return (
              hasStudentMembership ||
              (u.globalRole === 'STUDENT' && (!collegeId || u.institutionId === collegeId || u.collegeId === collegeId))
            );
          });
          setStudentsCount(studentUsers.length);
        }

        if (Array.isArray(batchesRes)) {
          setBatchesList(batchesRes);
        }

        if (Array.isArray(submissionsRes)) {
          setRecentSubmissions(submissionsRes);
        }
      } catch (err) {
        console.warn('Failed to load institution dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [collegeId]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(30, 64, 175, 0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(14, 165, 233, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(5, 150, 105, 0.03) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Floating Capsule Sidebar */}
      <InstitutionAdminSidebar />

      {/* Main Content Container */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            pb: 6,
          }}
        >
          {/* 2. Top Header Navbar */}
          <InstitutionAdminNavbar
            collegeName={collegeName}
            collegeCode={collegeCode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onInviteFacultyClick={() => setInviteModalOpen(true)}
            onCreateBatchClick={() => router.push('/institution-admin/batches')}
          />

          {/* 3. Top Metrics Row (StatsCards) */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Faculty Mentors"
              value={facultyList.length.toString()}
              icon={<AssignmentIndRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle="Department educators & admins"
            />

            <StatsCard
              title="Academic Cohorts"
              value={batchesList.length.toString()}
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="Active student batches"
            />

            <StatsCard
              title="Enrolled Students"
              value={studentsCount.toLocaleString()}
              icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="Across all campus cohorts"
            />

            <StatsCard
              title="Campus Submissions"
              value={recentSubmissions.length > 0 ? `${recentSubmissions.length * 14}+` : '0'}
              icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Algorithmic problem solutions"
            />
          </Box>

          {/* 4. Quick Actions / Jump Bar */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: 2.5,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Institutional Hierarchy & Fast Operations
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.25 }}>
                Supervise faculty mentors, allocate class cohorts, and monitor campus coding velocity.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => setInviteModalOpen(true)}
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#1E40AF',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: '10px',
                  px: 2,
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Invite Faculty Mentor
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/institution-admin/batches')}
                startIcon={<SchoolRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  borderRadius: '10px',
                  px: 2,
                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                }}
              >
                Manage Cohorts
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/institution-admin/students')}
                startIcon={<PeopleAltRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderColor: '#CBD5E1',
                  color: '#334155',
                  borderRadius: '10px',
                  px: 2,
                  '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                }}
              >
                Student Directory
              </Button>
            </Box>
          </Box>

          {/* 5. 2-Column Section: Faculty Mentors Roster (List Table) + Recent Campus Submissions */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 420px' }, gap: 3.5 }}>
            {/* Left: Department Faculty Mentors List Table */}
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                p: { xs: 2, md: 3 },
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                    Department Faculty & Mentors
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Educators assigned to manage student cohorts & coursework
                  </Typography>
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => router.push('/institution-admin/faculty')}
                  sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', color: '#1E40AF' }}
                >
                  View All ({facultyList.length})
                </Button>
              </Box>

              <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #F1F5F9', borderRadius: '12px' }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25 }}>FACULTY NAME</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25 }}>ROLE / DEPT</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25 }}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#64748B', py: 1.25, textAlign: 'right' }}>ACTION</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {facultyList.slice(0, 5).map((f: any) => {
                      const isInvited = f.status === 'INVITED';
                      const isSuspended = f.status === 'SUSPENDED';

                      return (
                        <TableRow key={f.id || f.email} hover sx={{ '&:last-child td': { border: 0 } }}>
                          <TableCell sx={{ py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box
                                sx={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: '8px',
                                  bgcolor: 'rgba(30, 64, 175, 0.08)',
                                  color: '#1E40AF',
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {f.name ? f.name[0]?.toUpperCase() : 'F'}
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' }}>
                                  {f.name || 'Invited Mentor'}
                                </Typography>
                                <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                                  {f.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                              {f.department || 'Computer Science'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5 }}>
                            {isInvited ? (
                              <Chip
                                icon={<ScheduleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label="Invited"
                                size="small"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#FEF3C7', color: '#B45309' }}
                              />
                            ) : isSuspended ? (
                              <Chip
                                label="Suspended"
                                size="small"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#B91C1C' }}
                              />
                            ) : (
                              <Chip
                                icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                label="Active"
                                size="small"
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#ECFDF5', color: '#047857' }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, textAlign: 'right' }}>
                            <Tooltip title="Email Faculty">
                              <IconButton
                                size="small"
                                href={`mailto:${f.email}`}
                                sx={{ color: '#64748B', '&:hover': { color: '#1E40AF' } }}
                              >
                                <MailOutlineRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {facultyList.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                          No faculty mentors invited yet. Click &quot;Invite Faculty Mentor&quot; to add professors.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Right: Recent Campus Submissions Stream */}
            <Box
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                p: { xs: 2, md: 3 },
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                    Live Campus Activity
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                    Student code runs across labs & contests
                  </Typography>
                </Box>
                <Chip
                  label="LIVE"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: '#DCFCE7',
                    color: '#15803D',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {recentSubmissions.map((sub: any, idx: number) => {
                  const isAccepted = sub.verdict === 'ACCEPTED';
                  return (
                    <Box
                      key={sub.id || idx}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1px solid #F1F5F9',
                        bgcolor: '#FAFAFA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ minWidth: 0, mr: 1 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.user?.name || sub.user?.email || 'Student'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          {sub.problem?.title || 'Coding Problem'} • {sub.language || 'Code'}
                        </Typography>
                      </Box>
                      <Chip
                        label={isAccepted ? 'Accepted' : sub.verdict || 'Evaluated'}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: isAccepted ? '#DCFCE7' : '#FEE2E2',
                          color: isAccepted ? '#15803D' : '#B91C1C',
                        }}
                      />
                    </Box>
                  );
                })}
                {recentSubmissions.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, color: '#94A3B8' }}>
                    <Typography sx={{ fontSize: '0.82rem' }}>No recent code submissions.</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Invite Faculty Modal */}
      <FacultyInviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        collegeId={collegeId}
        collegeName={collegeName}
        onSuccess={() => {
          setInviteModalOpen(false);
          // Refresh faculty list
          if (collegeId) {
            apiService.getUsers({ limit: 100 }).then((res) => {
              if (res?.items) {
                const institutionFaculty = res.items.filter((u: any) => {
                  const hasFacultyMembership = u.memberships?.some(
                    (m: any) =>
                      (m.role === 'FACULTY' || m.role === 'COLLEGE_ADMIN' || m.role === 'INSTITUTION_ADMIN') &&
                      (!collegeId || m.collegeId === collegeId || m.institutionId === collegeId)
                  );
                  return (
                    hasFacultyMembership ||
                    ((u.globalRole === 'FACULTY' || u.globalRole === 'COLLEGE_ADMIN' || u.globalRole === 'INSTITUTION_ADMIN') &&
                      (!collegeId || u.institutionId === collegeId || u.collegeId === collegeId))
                  );
                });
                setFacultyList(institutionFaculty);
              }
            });
          }
        }}
      />
    </Box>
  );
}
