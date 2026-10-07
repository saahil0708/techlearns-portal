'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import SupervisorAccountRoundedIcon from '@mui/icons-material/SupervisorAccountRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';

interface UsersStatsBannerProps {
  totalCount: number;
  adminCount: number;
  facultyCount: number;
  recruiterCount: number;
  twoFaRate: number;
  activeCount: number;
  activeRate: number;
  selectedCount: number;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenBulkInvite: () => void;
  onOpenCreateUser: () => void;
}

export default function UsersStatsBanner({
  totalCount,
  adminCount,
  facultyCount,
  recruiterCount,
  twoFaRate,
  activeCount,
  activeRate,
  selectedCount,
  onExportExcel,
  onExportCSV,
  onOpenBulkInvite,
  onOpenCreateUser,
}: UsersStatsBannerProps) {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
              <SupervisorAccountRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Users & Identity Management
            </Typography>
            <Chip
              label={`${totalCount} Accounts`}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '9999px',
              }}
            />
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
            Role-based access control (RBAC), multi-tenant administration, security audits & authentication
          </Typography>
        </Box>

        {/* Actions: Export, Bulk Invite & Add User */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="Export Users Directory">
            <Button
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#475569',
                border: `1px solid ${borderColor}`,
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                px: 2,
                py: 0.75,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
              }}
            >
              Export {selectedCount > 0 ? `(${selectedCount})` : 'Data'}
            </Button>
          </Tooltip>

          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
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
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onExportExcel();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download Excel (.xls)
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onExportCSV();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download CSV (.csv)
              </Typography>
            </MenuItem>
          </Menu>

          {/* Bulk Invite */}
          <Button
            variant="outlined"
            onClick={onOpenBulkInvite}
            startIcon={<GroupAddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
            }}
          >
            Bulk Invite
          </Button>

          {/* Add User */}
          <Button
            variant="contained"
            onClick={onOpenCreateUser}
            startIcon={<PersonAddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              px: 2.25,
              py: 0.75,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Provision User
          </Button>
        </Box>
      </Box>

      {/* 4 Summary Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        <StatsCard
          title="Total Accounts"
          value={totalCount}
          icon={<SupervisorAccountRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="orbital"
          subtitle={`${adminCount} Admins • ${facultyCount} Faculty • ${recruiterCount} Recruiters`}
        />

        <StatsCard
          title="Platform Administrators"
          value={adminCount}
          icon={<AdminPanelSettingsRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="topography"
          subtitle="Super & Tenant Admins"
        />

        <StatsCard
          title="2FA Adoption Rate"
          value={`${twoFaRate}%`}
          icon={<SecurityRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="hex-grid"
          subtitle="High Security Tier"
        />

        <StatsCard
          title="Active Accounts"
          value={`${activeRate}%`}
          icon={<VerifiedUserRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="aurora-waves"
          subtitle={`${activeCount} of ${totalCount} active`}
        />
      </Box>
    </Box>
  );
}
