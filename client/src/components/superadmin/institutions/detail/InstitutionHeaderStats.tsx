'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  LinearProgress,
} from '@mui/material';
import Link from 'next/link';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { FluidArrowLeft } from '@/utils/fluid_arrow';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import RadialDonutGauge from '@/components/superadmin/shared/RadialDonutGauge';
import { InstitutionEntity } from '@/components/superadmin/institutions/InstitutionsDirectoryClient';

interface InstitutionHeaderStatsProps {
  institution: InstitutionEntity;
  totalBatches: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  onOpenCreateBatch: () => void;
  onOpenInviteFaculty: () => void;
  onOpenBulkImport: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export default function InstitutionHeaderStats({
  institution,
  totalBatches,
  totalStudents,
  totalFaculty,
  totalCourses,
  onOpenCreateBatch,
  onOpenInviteFaculty,
  onOpenBulkImport,
  onExportExcel,
  onExportCSV,
}: InstitutionHeaderStatsProps) {
  const [downloadAnchorEl, setDownloadAnchorEl] = React.useState<null | HTMLElement>(null);

  const quotaPct = Math.min(
    100,
    Math.round((totalStudents / (institution.maxQuota || 1)) * 100)
  );

  return (
    <>
      {/* Back Link & Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            component={Link}
            href="/superadmin/institutions"
            variant="outlined"
            size="small"
            startIcon={<FluidArrowLeft size={18} />}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
            }}
          >
            Back to Institutions Directory
          </Button>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>{institution.code}</Typography>
        </Box>

        {/* Header Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#475569',
              borderColor: '#CBD5E1',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Export Roster
          </Button>

          <Menu
            anchorEl={downloadAnchorEl}
            open={Boolean(downloadAnchorEl)}
            onClose={() => setDownloadAnchorEl(null)}
          >
            <MenuItem
              onClick={() => {
                setDownloadAnchorEl(null);
                onExportExcel();
              }}
            >
              <ListItemIcon>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              Export as Excel (.xls)
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDownloadAnchorEl(null);
                onExportCSV();
              }}
            >
              <ListItemIcon>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </ListItemIcon>
              Export as CSV (.csv)
            </MenuItem>
          </Menu>

          <Button
            variant="outlined"
            size="small"
            startIcon={<CloudUploadRoundedIcon />}
            onClick={onOpenBulkImport}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: '#334155',
              borderColor: '#CBD5E1',
              bgcolor: '#FFFFFF',
              '&:hover': { bgcolor: '#F8FAFC' },
            }}
          >
            Bulk Import CSV
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<SupervisorAccountRoundedIcon />}
            onClick={onOpenInviteFaculty}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#2563EB',
              borderColor: '#BFDBFE',
              bgcolor: '#EFF6FF',
              '&:hover': { bgcolor: '#DBEAFE' },
            }}
          >
            Invite Faculty
          </Button>

          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenCreateBatch}
            sx={{
              borderRadius: '8px',
              bgcolor: '#2563EB',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Create New Batch
          </Button>
        </Box>
      </Box>

      {/* Hero Overview Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2.5, alignItems: 'flex-start', flex: 1 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: institution.logoColor || '#2563EB',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '1.5rem',
                borderRadius: '16px',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              }}
            >
              {institution.name ? institution.name[0] : 'U'}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.75 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' } }}>
                  {institution.name}
                </Typography>
                <Chip
                  label={institution.status}
                  size="small"
                  sx={{
                    bgcolor: institution.status === 'Active' ? '#ECFDF5' : '#FEF2F2',
                    color: institution.status === 'Active' ? '#059669' : '#DC2626',
                    border: `1px solid ${institution.status === 'Active' ? '#A7F3D0' : '#FECACA'}`,
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={institution.tier}
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #DBEAFE',
                    fontWeight: 700,
                    fontSize: '0.74rem',
                    borderRadius: '8px',
                  }}
                />
              </Box>

              <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2 }}>
                {institution.region} • Primary Domain: <strong>{institution.domain}</strong> • Code: <code>{institution.code}</code>
              </Typography>

              {/* Progress & Quota Bar */}
              <Box sx={{ maxWidth: 520 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                    Student License Allocation
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#0F172A', fontWeight: 800 }}>
                    {totalStudents} / {institution.maxQuota} Seats ({quotaPct}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={quotaPct}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: quotaPct > 90 ? '#DC2626' : quotaPct > 70 ? '#D97706' : '#2563EB',
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* 4 Stats Cards Ribbon */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        <StatsCard
          title="Student Cohorts"
          value={totalBatches}
          subtitle="Active academic batches"
          icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="orbital"
        />
        <StatsCard
          title="Enrolled Students"
          value={totalStudents}
          subtitle={`Across ${totalBatches} cohorts`}
          icon={<PeopleAltRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="topography"
        />
        <StatsCard
          title="Faculty Mentors"
          value={totalFaculty}
          subtitle="Coordinators & professors"
          icon={<SupervisorAccountRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="hex-grid"
        />
        <StatsCard
          title="Assigned Courses"
          value={totalCourses}
          subtitle="Active curricula"
          icon={<MenuBookRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="aurora-waves"
        />
      </Box>
    </>
  );
}
