'use client';

import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

export interface LoadingScreenProps {
  /**
   * Layout mode:
   * - 'fullscreen' | 'screen': Full solid white screen (100vw/100vh) with indeterminate linear loader at top
   * - 'tab': Clean white container for tab switching with top linear bar
   * - 'inline': Inline white container with linear bar at top
   */
  mode?: 'fullscreen' | 'screen' | 'tab' | 'inline';
  size?: number;
  minHeight?: string | number;
  color?: string;
  message?: string;
}

/**
 * Universal Full White Loading Screen with Linear Indeterminate Progress Bar at Top
 */
export default function LoadingScreen({
  mode = 'screen',
  size = 3.5,
  minHeight = mode === 'fullscreen' || mode === 'screen' ? '100vh' : mode === 'tab' ? '35vh' : '120px',
  color = '#2563EB',
  message,
}: LoadingScreenProps) {
  const isFullScreen = mode === 'fullscreen' || mode === 'screen';
  const barHeight = typeof size === 'number' && size <= 10 ? size : 3.5;

  if (isFullScreen) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
        }}
        aria-label="Loading page"
        role="status"
        suppressHydrationWarning
      >
        {/* Fixed top edge linear indeterminate loader */}
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, width: '100%', zIndex: 100000 }}>
          <LinearProgress
            aria-label="Loading..."
            sx={{
              height: barHeight,
              bgcolor: 'rgba(37, 99, 235, 0.08)',
              '& .MuiLinearProgress-bar': {
                bgcolor: color,
              },
            }}
          />
        </div>

        {message && (
          <Box sx={{ mt: 8, px: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '0.86rem', color: '#64748B', fontWeight: 600, letterSpacing: '0.01em' }}>
              {message}
            </Typography>
          </Box>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        backgroundColor: '#FFFFFF',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderRadius: '12px',
        overflow: 'hidden',
      }}
      aria-label="Loading"
      role="status"
      suppressHydrationWarning
    >
      {/* Top linear indeterminate loader bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%' }}>
        <LinearProgress
          aria-label="Loading..."
          sx={{
            height: barHeight,
            bgcolor: 'rgba(37, 99, 235, 0.08)',
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
            },
          }}
        />
      </div>

      {message && (
        <Box sx={{ my: 'auto', px: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 600 }}>
            {message}
          </Typography>
        </Box>
      )}
    </div>
  );
}

export { LoadingScreen };
