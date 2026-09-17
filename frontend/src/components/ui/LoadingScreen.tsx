'use client';

import React from 'react';

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
 * A clean, minimal, non-intrusive CircularProgress spinner without SSR Emotion hydration mismatches.
 */
export default function LoadingScreen({
  mode = 'screen',
  size = 38,
  minHeight = mode === 'fullscreen' ? '100vh' : mode === 'tab' ? '35vh' : mode === 'inline' ? '180px' : '70vh',
  color = '#2563EB',
}: LoadingScreenProps) {
  const isFullScreen = mode === 'fullscreen';

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
    <div style={containerStyle} aria-label="Loading" role="status">
      <svg
        className="animate-spin"
        style={{
          width: size,
          height: size,
          color,
        }}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-90"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export { LoadingScreen };

