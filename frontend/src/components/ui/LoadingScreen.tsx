'use client';

import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export interface LoadingScreenProps {
  /**
   * Layout mode:
   * - 'fullscreen': Fixed overlay spanning 100vw/100vh
   * - 'screen': Centered within full page height (minHeight: 70vh)
   * - 'tab': Clean centered loader for switching tabs and subviews (minHeight: 35vh)
   * - 'inline': Lightweight container spinner
   */
  mode?: 'fullscreen' | 'screen' | 'tab' | 'inline';
  size?: number;
  minHeight?: string | number;
  color?: string;
}

/**
 * Universal Simple Centered MUI Loading Screen Component
 * A clean, minimal, non-intrusive MUI CircularProgress spinner.
 */
export default function LoadingScreen({
  mode = 'screen',
  size = 38,
  minHeight = mode === 'fullscreen' ? '100vh' : mode === 'tab' ? '35vh' : mode === 'inline' ? '180px' : '70vh',
  color = '#2563EB',
}: LoadingScreenProps) {
  const isFullScreen = mode === 'fullscreen';

  const containerSx = isFullScreen
    ? {
        position: 'fixed' as const,
        inset: 0,
        zIndex: 99999,
        bgcolor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        width: '100%',
        minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'transparent',
      };

  return (
    <Box sx={containerSx} aria-label="Loading" role="status">
      <CircularProgress size={size} thickness={4} sx={{ color }} />
    </Box>
  );
}

export { LoadingScreen };
