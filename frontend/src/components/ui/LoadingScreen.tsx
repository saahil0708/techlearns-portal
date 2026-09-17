'use client';

import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';

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
 * Universal Simple Centered Loading Screen Component
 * Uses MUI CircularProgress loader with SSR hydration protection.
 */
export default function LoadingScreen({
  mode = 'screen',
  size = 38,
  minHeight = mode === 'fullscreen' ? '100vh' : mode === 'tab' ? '35vh' : mode === 'inline' ? '180px' : '70vh',
  color = '#2563EB',
}: LoadingScreenProps) {
  const isFullScreen = mode === 'fullscreen';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const containerStyle: React.CSSProperties = isFullScreen
    ? {
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }
    : {
        width: '100%',
        minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
      };

  return (
    <div style={containerStyle} aria-label="Loading" role="status" suppressHydrationWarning>
      {mounted ? (
        <CircularProgress
          size={size}
          thickness={4}
          sx={{
            color,
          }}
        />
      ) : (
        <div
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            border: '4px solid rgba(0, 0, 0, 0.08)',
            borderTopColor: color,
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
    </div>
  );
}

export { LoadingScreen };
