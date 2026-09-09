'use client';

import React from 'react';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import { useToast } from '@/context/ToastContext';

export default function StudentSettingsTab() {
  const toast = useToast();

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
      <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
          Account Credentials & Security
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Two-Factor Authentication (2FA)</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>Time-based OTP token security enabled</Typography>
            </Box>
            <Chip label="Active" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, border: '1px solid #BBF7D0' }} />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>Password & Authentication</Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>Encrypted with bcrypt (12 rounds)</Typography>
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LockResetRoundedIcon />}
              onClick={() => toast.info('Password reset instructions sent to your email.', 'Security Action')}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              Reset
            </Button>
          </Box>
        </Box>
      </Card>

      <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
          Notification Preferences
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem' }}>
            Configure email digests for upcoming competitive contests, course milestones, and faculty assignment grades.
          </Typography>
          <Button
            variant="contained"
            onClick={() => toast.success('Notification preferences updated.', 'Saved')}
            sx={{ bgcolor: '#2563EB', borderRadius: '8px', textTransform: 'none', fontWeight: 700, mt: 2, alignSelf: 'flex-start' }}
          >
            Save Preferences
          </Button>
        </Box>
      </Card>
    </Box>
  );
}
