'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Box, Typography, CircularProgress, Button, Card } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import { useAppSelector } from '@/store/hooks';
import LoadingScreen from '@/components/ui/LoadingScreen';

interface SuperAdminAuthGuardProps {
  children: React.ReactNode;
}

export default function SuperAdminAuthGuard({ children }: SuperAdminAuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isCheckingSession } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isCheckingSession && !isAuthenticated) {
      const redirectParam = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectParam}`);
    }
  }, [isCheckingSession, isAuthenticated, pathname, router]);

  // 1. Session verification in progress or pending redirect -> Clean centered loader only
  if (isCheckingSession || !isAuthenticated || !user) {
    return <LoadingScreen mode="fullscreen" size={38} />;
  }

  // 3. Authenticated but insufficient permissions (Non-Super-Admin)
  const isSuperAdmin =
    user.globalRole === 'SUPER_ADMIN' ||
    user.globalRole === 'PLATFORM_ADMIN' ||
    user.memberships?.some((m) => m.role === 'SUPER_ADMIN' || m.role === 'COLLEGE_ADMIN');

  if (!isSuperAdmin) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#0B0F19',
          p: 3,
        }}
      >
        <Card
          sx={{
            maxWidth: 480,
            width: '100%',
            p: 4,
            borderRadius: '24px',
            bgcolor: 'rgba(17, 24, 39, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(16px)',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              bgcolor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2.5,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Typography sx={{ fontSize: '1.25rem', fontWeight: 800, color: '#F8FAFC', mb: 1 }}>
            Super Admin Access Required
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#94A3B8', mb: 3, lineHeight: 1.6 }}>
            You are signed in as <strong>{user.email}</strong> with the <strong>{user.globalRole}</strong> role, which does not have platform super administrator privileges.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              endIcon={<FluidArrowRight size={18} />}
              onClick={() => router.push(user.globalRole === 'STUDENT' ? '/students' : '/students')}
              sx={{
                bgcolor: '#2563EB',
                borderRadius: '12px',
                py: 1.2,
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Go to {user.globalRole === 'STUDENT' ? 'Student Workspace' : 'My Dashboard'}
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/login?redirect=/superadmin')}
              sx={{
                borderColor: 'rgba(255,255,255,0.2)',
                color: '#CBD5E1',
                borderRadius: '12px',
                py: 1.1,
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: 'rgba(255,255,255,0.4)', bgcolor: 'rgba(255,255,255,0.05)' },
              }}
            >
              Switch to Super Admin Account
            </Button>
          </Box>
        </Card>
      </Box>
    );
  }

  // 4. Authorized Super Admin -> Render child pages
  return <>{children}</>;
}
