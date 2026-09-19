import React from 'react';
import { Box, Typography, LinearProgress, Skeleton, Card } from '@mui/material';
import LoadingScreen, { LoadingScreenProps } from '@/components/ui/LoadingScreen';

export { LoadingScreen };
export type { LoadingScreenProps };

/**
 * Clean Centered MUI Loader for Tab Transitions, Data Loading & Screen Transitions
 */
export function MuiCenterLoader({
  size = 36,
  minHeight = '35vh',
}: {
  size?: number;
  minHeight?: string | number;
  message?: string;
}) {
  return (
    <LoadingScreen
      mode="tab"
      size={size}
      minHeight={minHeight}
    />
  );
}

/**
 * Clean Full-Page / Route-Level Centered MUI Loader
 */
export function MuiPageLoader({
  minHeight = '70vh',
  size = 40,
}: {
  message?: string;
  subMessage?: string;
  minHeight?: string | number;
  size?: number;
}) {
  return (
    <LoadingScreen
      mode="screen"
      minHeight={minHeight}
      size={size}
    />
  );
}

/**
 * Sleek List Table Skeleton Loader for Collections & Datasets
 */
export function MuiTableLoader({ rows = 5 }: { rows?: number }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Box>
            <Skeleton variant="text" width={180} height={24} />
            <Skeleton variant="text" width={120} height={18} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '9999px' }} />
          <Skeleton variant="rounded" width={90} height={36} sx={{ borderRadius: '9999px' }} />
        </Box>
      </Box>

      {/* Header bar */}
      <Skeleton variant="rectangular" width="100%" height={42} sx={{ borderRadius: '12px', bgcolor: '#F8FAFC' }} />

      {/* Row skeletons */}
      {Array.from({ length: rows }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="rounded" width="28%" height={24} sx={{ borderRadius: '6px' }} />
          <Skeleton variant="rounded" width="22%" height={24} sx={{ borderRadius: '6px' }} />
          <Skeleton variant="rounded" width="18%" height={24} sx={{ borderRadius: '6px' }} />
          <Skeleton variant="rounded" width="15%" height={24} sx={{ borderRadius: '6px' }} />
          <Skeleton variant="circular" width={28} height={28} sx={{ ml: 'auto' }} />
        </Box>
      ))}

      {/* Pagination bar skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #F1F5F9' }}>
        <Skeleton variant="text" width={140} height={20} />
        <Skeleton variant="rounded" width={220} height={32} sx={{ borderRadius: '9999px' }} />
      </Box>
    </Card>
  );
}

/**
 * Sleek Card / Chart Loader Placeholder
 */
export function MuiChartLoader({ height = 340 }: { height?: number }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Skeleton variant="text" width={160} height={26} />
          <Skeleton variant="text" width={240} height={18} />
        </Box>
        <Skeleton variant="rounded" width={110} height={32} sx={{ borderRadius: '9999px' }} />
      </Box>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <Skeleton variant="rectangular" width="100%" height="80%" sx={{ borderRadius: '16px', bgcolor: '#F8FAFC' }} />
        <LinearProgress
          aria-label="Loading..."
          sx={{
            width: 140,
            height: 4,
            borderRadius: 2,
            position: 'absolute',
            bgcolor: 'rgba(37, 99, 235, 0.12)',
            '& .MuiLinearProgress-bar': { bgcolor: '#2563EB', borderRadius: 2 },
          }}
        />
      </Box>
    </Card>
  );
}

/**
 * Lightweight Drawer / Modal Loading Placeholder
 */
export function MuiDrawerLoader() {
  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" width={160} height={28} />
        <Skeleton variant="circular" width={32} height={32} />
      </Box>
      <Skeleton variant="rounded" width="100%" height={120} sx={{ borderRadius: '16px' }} />
      <Skeleton variant="rounded" width="100%" height={180} sx={{ borderRadius: '16px' }} />
      <Box sx={{ display: 'flex', gap: 1.5, mt: 'auto' }}>
        <Skeleton variant="rounded" width="50%" height={44} sx={{ borderRadius: '9999px' }} />
        <Skeleton variant="rounded" width="50%" height={44} sx={{ borderRadius: '9999px' }} />
      </Box>
    </Box>
  );
}
