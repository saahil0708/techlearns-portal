'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
} from '@mui/material';

// Icons
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';

import InstitutionAdminSidebar from '@/components/institution-admin/layout/InstitutionAdminSidebar';
import InstitutionAdminNavbar from '@/components/institution-admin/layout/InstitutionAdminNavbar';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import { useAppSelector } from '@/store/hooks';

export default function InstitutionAnalyticsClient() {
  const user = useAppSelector((state) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');

  const activeMemberships = Array.isArray(user?.memberships) ? user.memberships : [];
  const primaryMembership =
    activeMemberships.find(
      (m: any) =>
        m?.role === 'INSTITUTION_ADMIN' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'FACULTY'
    ) || activeMemberships[0];

  const collegeName =
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (user as any)?.institution ||
    'Academic Institution';

  const collegeCode =
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'CAMPUS';

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
      <InstitutionAdminSidebar />

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
          <InstitutionAdminNavbar
            collegeName={collegeName}
            collegeCode={collegeCode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Header */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: 3,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                Institutional Performance & Analytics
              </Typography>
              <Chip
                label={collegeCode}
                size="small"
                sx={{ fontWeight: 700, bgcolor: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF', borderRadius: '6px' }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>
              Macro insights on campus problem solving velocity, cohort benchmarks, and pass rates.
            </Typography>
          </Box>

          {/* StatsCards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            <StatsCard
              title="Campus Solve Rate"
              value="78.4%"
              icon={<AssignmentTurnedInRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="orbital"
              subtitle="First-attempt test pass"
            />
            <StatsCard
              title="Active Cohorts"
              value="12"
              icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="topography"
              subtitle="Engaged across departments"
            />
            <StatsCard
              title="Weekly Code Runs"
              value="3,480"
              icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
              variant="blue"
              shape="hex-grid"
              subtitle="Judge evaluations"
            />
            <StatsCard
              title="Campus Rank"
              value="#4"
              icon={<LeaderboardRoundedIcon sx={{ fontSize: 20 }} />}
              variant="black"
              shape="aurora-waves"
              subtitle="Inter-college leaderboard"
            />
          </Box>

          {/* Detailed Performance Breakdowns */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Departmental Velocity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { dept: 'Computer Science & Engineering', solved: 1420, rate: '86%' },
                  { dept: 'Information Technology', solved: 980, rate: '81%' },
                  { dept: 'Electronics & Communication', solved: 640, rate: '74%' },
                  { dept: 'Artificial Intelligence & DS', solved: 850, rate: '89%' },
                ].map((item) => (
                  <Box
                    key={item.dept}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' }}>
                        {item.dept}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {item.solved} challenges solved
                      </Typography>
                    </Box>
                    <Chip
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                      label={`${item.rate} pass`}
                      size="small"
                      sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#ECFDF5', color: '#047857' }}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
                Curriculum Track Completion
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { course: 'Data Structures & Algorithms in C++', completion: '92%' },
                  { course: 'Advanced Dynamic Programming', completion: '68%' },
                  { course: 'Full-Stack Web Engineering', completion: '84%' },
                  { course: 'Database Design & SQL Optimization', completion: '77%' },
                ].map((item) => (
                  <Box
                    key={item.course}
                    sx={{
                      p: 1.5,
                      borderRadius: '10px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A' }}>
                      {item.course}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.84rem', color: '#1E40AF' }}>
                      {item.completion}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
