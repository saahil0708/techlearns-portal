'use client';

import React from 'react';
import {
  Dialog,
  Typography,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';

export interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoggingOut?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
}

export default function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoggingOut = false,
  title = 'Confirm Logout',
  message = 'Are you sure you want to exit the Admin Control Center?',
  confirmLabel = 'Logout Session',
}: LogoutConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={isLoggingOut ? undefined : onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(4px)',
          },
        },
        paper: {
          sx: {
            borderRadius: '20px',
            p: { xs: 2.5, sm: 3 },
            maxWidth: { xs: '92vw', sm: 510 },
            width: '100%',
            bgcolor: '#FFFFFF',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.22)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {/* Title */}
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 800,
            fontSize: '1.35rem',
            color: '#0F172A',
            letterSpacing: '-0.02em',
            mb: 1.25,
          }}
        >
          {title}
        </Typography>

        {/* Message */}
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#475569',
            fontWeight: 500,
            lineHeight: 1.5,
            mb: 2.75,
          }}
        >
          {message}
        </Typography>

        {/* Actions Row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1.75,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isLoggingOut}
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              px: 2,
              py: 0.75,
              borderRadius: '8px',
              '&:hover': {
                bgcolor: 'rgba(37, 99, 235, 0.08)',
              },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={onConfirm}
            disabled={isLoggingOut}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.9rem',
              textTransform: 'none',
              px: 2.75,
              py: 0.85,
              borderRadius: '10px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1D4ED8',
                boxShadow: 'none',
              },
            }}
          >
            {isLoggingOut ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                <span>Signing out...</span>
              </Box>
            ) : (
              confirmLabel
            )}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
