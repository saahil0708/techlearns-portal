'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser, setClientAuthCookie } from '@/store/slices/authSlice';

export default function LogoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function performLogout() {
      try {
        setClientAuthCookie(undefined);
        await dispatch(logoutUser());
      } catch (e) {
        console.warn('Logout error:', e);
      } finally {
        router.push('/login');
      }
    }
    performLogout();
  }, [dispatch, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#0B0F19',
        gap: 2,
      }}
    >
      <CircularProgress size={32} sx={{ color: '#2563EB' }} />
      <Typography sx={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: 600 }}>
        Signing out & clearing active session...
      </Typography>
    </Box>
  );
}
