'use client';

import React from 'react';
import { Box, Typography, Button, Chip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

interface DashboardHeaderProps {
  onRefresh?: () => void;
  onAddWidget?: () => void;
  systemStatus?: string;
}

export default function DashboardHeader({
  onRefresh,
  onAddWidget,
  systemStatus = 'ONLINE',
}: DashboardHeaderProps) {
  const isHealthy = systemStatus.toUpperCase() === 'ONLINE' || systemStatus.toUpperCase() === 'HEALTHY' || systemStatus.toUpperCase() === 'ACTIVE';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
        pt: 1,
      }}
    >
      {/* Left: Bold Page Title & Live Cluster Pulse */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.45rem', md: '1.75rem' },
              color: '#0F172A',
              letterSpacing: '-0.03em',
            }}
          >
            Dashboard
          </Typography>
          <Chip
            icon={<FiberManualRecordRoundedIcon sx={{ fontSize: '10px !important', color: isHealthy ? '#10B981 !important' : '#F59E0B !important' }} />}
            label={isHealthy ? 'Cluster Online' : systemStatus}
            size="small"
            sx={{
              bgcolor: isHealthy ? '#ECFDF5' : '#FFFBEB',
              color: isHealthy ? '#059669' : '#D97706',
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              border: `1px solid ${isHealthy ? '#A7F3D0' : '#FDE68A'}`,
              borderRadius: '9999px',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
          Real-time institutional throughput, evaluation velocity, and compiler health
        </Typography>
      </Box>

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {onRefresh && (
          <Button
            variant="outlined"
            onClick={onRefresh}
            startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#475569',
              borderColor: '#E2E8F0',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              height: 38,
              px: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#CBD5E1',
                color: '#0F172A',
              },
            }}
          >
            Sync Realtime
          </Button>
        )}

        <Button
          variant="contained"
          onClick={onAddWidget}
          startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            height: 38,
            px: 2.25,
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#1E293B',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 20px rgba(15, 23, 42, 0.35)',
            },
          }}
        >
          Add Custom Widget
        </Button>
      </Box>
    </Box>
  );
}
