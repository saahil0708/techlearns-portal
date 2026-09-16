'use client';

import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

export interface RadialDonutGaugeProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  label: string;
  sublabel?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export default function RadialDonutGauge({
  percentage,
  size = 94,
  strokeWidth = 8,
  color,
  trackColor = '#F1F5F9',
  label,
  sublabel,
  badge,
  icon,
}: RadialDonutGaugeProps) {
  const clampedPct = Math.min(100, Math.max(0, Math.round(percentage)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        p: { xs: 1.5, sm: 2 },
        borderRadius: '14px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
        flex: 1,
        minWidth: 140,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04)',
          borderColor: '#CBD5E1',
        },
      }}
    >
      {/* Top Icon / Label Header if provided */}
      {icon && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '8px',
            bgcolor: `${color}12`,
            color: color,
            mb: 1,
          }}
        >
          {icon}
        </Box>
      )}

      {/* Radial Donut SVG */}
      <Box sx={{ position: 'relative', width: size, height: size, my: 0.5 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Active Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
            {clampedPct}%
          </Typography>
        </Box>
      </Box>

      {/* Label & Sublabel */}
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#0F172A', mt: 1, lineHeight: 1.2 }}>
        {label}
      </Typography>
      {sublabel && (
        <Typography sx={{ fontSize: '0.7rem', color: '#64748B', mt: 0.4, lineHeight: 1.2 }}>
          {sublabel}
        </Typography>
      )}

      {badge && (
        <Chip
          size="small"
          label={badge}
          sx={{
            height: 20,
            fontSize: '0.65rem',
            fontWeight: 700,
            bgcolor: `${color}14`,
            color: color,
            border: `1px solid ${color}30`,
            borderRadius: '6px',
            mt: 1,
          }}
        />
      )}
    </Box>
  );
}
