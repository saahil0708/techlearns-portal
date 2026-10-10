'use client';

import React from 'react';
import { Box } from '@mui/material';

interface YouBadgeProps {
  sx?: object;
}

export default function YouBadge({ sx = {} }: YouBadgeProps) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        fontWeight: 800,
        letterSpacing: '0.02em',
        color: '#0B1F3A',
        bgcolor: '#FAF5FF',
        border: '1px solid #F3E8FF',
        borderRadius: '9999px',
        px: 0.85,
        py: '1px',
        lineHeight: 1.2,
        userSelect: 'none',
        verticalAlign: 'middle',
        boxShadow: '0 1px 2px rgba(91, 45, 144, 0.08)',
        flexShrink: 0,
        ...sx,
      }}
    >
      You
    </Box>
  );
}
