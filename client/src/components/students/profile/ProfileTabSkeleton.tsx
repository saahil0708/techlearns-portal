'use client';

import React from 'react';
import { Box, Card, Skeleton } from '@mui/material';

export default function ProfileTabSkeleton() {
  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 4 Metrics Cards Grid Skeleton */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: '20px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Skeleton variant="text" width="50%" height={20} sx={{ bgcolor: '#F1F5F9' }} />
              <Skeleton variant="rounded" width={32} height={32} sx={{ bgcolor: '#EFF6FF', borderRadius: '10px' }} />
            </Box>
            <Skeleton variant="text" width="40%" height={38} sx={{ bgcolor: '#E2E8F0', mb: 0.5 }} />
            <Skeleton variant="text" width="65%" height={18} sx={{ bgcolor: '#F1F5F9' }} />
          </Card>
        ))}
      </Box>

      {/* Main Content Body Skeleton */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ width: '45%' }}>
            <Skeleton variant="text" width="60%" height={26} sx={{ bgcolor: '#E2E8F0', mb: 0.5 }} />
            <Skeleton variant="text" width="85%" height={18} sx={{ bgcolor: '#F1F5F9' }} />
          </Box>
          <Skeleton variant="rounded" width={140} height={36} sx={{ bgcolor: '#EFF6FF', borderRadius: '10px' }} />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3, 4].map((i) => (
            <Box
              key={i}
              sx={{
                p: 2,
                borderRadius: '14px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Box sx={{ width: '30%' }}>
                <Skeleton variant="text" width="75%" height={20} sx={{ bgcolor: '#E2E8F0' }} />
                <Skeleton variant="text" width="45%" height={16} sx={{ bgcolor: '#F1F5F9' }} />
              </Box>
              <Skeleton variant="rounded" width="45%" height={8} sx={{ bgcolor: '#E2E8F0', borderRadius: '4px' }} />
              <Skeleton variant="rounded" width={80} height={28} sx={{ bgcolor: '#EFF6FF', borderRadius: '8px' }} />
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
