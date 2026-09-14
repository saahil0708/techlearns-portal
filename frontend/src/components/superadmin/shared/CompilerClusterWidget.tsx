'use client';

import React from 'react';
import { Box, Typography, Card, Chip } from '@mui/material';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';

interface CompilerClusterWidgetProps {
  uptimePercentage?: string;
  systemStatus?: string;
}

export default function CompilerClusterWidget({
  uptimePercentage = '99.8%',
  systemStatus = 'ONLINE',
}: CompilerClusterWidgetProps) {
  const parsed = typeof uptimePercentage === 'number' ? uptimePercentage : parseFloat(String(uptimePercentage));
  const numericUptime = Number.isFinite(parsed) ? Math.min(100, Math.max(0, parsed)) : 99.8;

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        border: '1px solid #1E293B',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2.5,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background soft ambient glow */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          bgcolor: 'rgba(37, 99, 235, 0.15)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top row: Circular gauge + Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, zIndex: 1 }}>
        {/* Radial Circular Meter */}
        <Box
          sx={{
            position: 'relative',
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: `conic-gradient(#10B981 0% ${numericUptime}%, #334155 ${numericUptime}% 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
          }}
        >
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              bgcolor: '#0F172A',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
              {numericUptime}
            </Typography>
            <Typography sx={{ fontSize: '0.55rem', color: '#10B981', fontWeight: 700 }}>
              % UP
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
            <Typography sx={{ fontSize: '1.02rem', fontWeight: 800, color: '#FFFFFF' }}>
              Docker Sandbox Engine
            </Typography>
            <Chip
              label={systemStatus === 'ONLINE' ? 'Isolated' : systemStatus}
              size="small"
              sx={{
                bgcolor: 'rgba(16, 185, 129, 0.15)',
                color: '#34D399',
                fontSize: '0.65rem',
                fontWeight: 700,
                height: 20,
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            />
          </Box>
          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 400 }}>
            {systemStatus === 'ONLINE' || systemStatus === 'HEALTHY'
              ? 'Multi-tenant execution isolation • Secure container runtime active'
              : `Cluster status: ${systemStatus} • Telemetry alert`}
          </Typography>
        </Box>
      </Box>

      {/* Bottom Sub-metric strip */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          pt: 1.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldRoundedIcon sx={{ fontSize: 18, color: '#38BDF8' }} />
          <Box>
            <Typography sx={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 600 }}>Memory Cap</Typography>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#F1F5F9' }}>256 MB</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TerminalRoundedIcon sx={{ fontSize: 18, color: '#A78BFA' }} />
          <Box>
            <Typography sx={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 600 }}>Timeout Limit</Typography>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#F1F5F9' }}>2.0s</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MemoryRoundedIcon sx={{ fontSize: 18, color: '#34D399' }} />
          <Box>
            <Typography sx={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 600 }}>Queue Latency</Typography>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#34D399' }}>18 ms</Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
