'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export interface DeleteModalItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: { bg: string; text: string; border: string };
  avatarUrl?: string;
  avatarColor?: string;
  extraInfo?: string;
}

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  subtitle?: string;
  warningNote?: string;
  confirmLabel?: string;
  items?: DeleteModalItem[];
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  subtitle = 'Are you sure you want to proceed? This action cannot be undone.',
  warningNote = 'This will permanently remove the record from the platform database and revoke all associated access privileges.',
  confirmLabel = 'Permanently Delete',
  items = [],
}: DeleteConfirmModalProps) {
  const borderColor = '#E2E8F0';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxWidth: 480,
            width: '100%',
            borderRadius: '24px',
            p: 1,
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, pb: 1.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
              flexShrink: 0,
            }}
          >
            <DeleteForeverRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem', lineHeight: 1.2 }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.25, display: 'block' }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: '#94A3B8',
            borderRadius: '9999px',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* Content */}
      <DialogContent sx={{ px: 3.5, pt: '28px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Single Item Preview */}
        {items.length === 1 && (
          <Box
            sx={{
              p: 2,
              borderRadius: '16px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Avatar
              src={items[0].avatarUrl}
              sx={{
                width: 42,
                height: 42,
                bgcolor: items[0].avatarColor || '#3B82F6',
                fontWeight: 800,
                fontSize: '0.9rem',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              {items[0].title.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }} noWrap>
                  {items[0].title}
                </Typography>
                {items[0].badge && (
                  <Chip
                    label={items[0].badge}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      bgcolor: items[0].badgeColor?.bg || '#EFF6FF',
                      color: items[0].badgeColor?.text || '#2563EB',
                      border: `1px solid ${items[0].badgeColor?.border || '#BFDBFE'}`,
                    }}
                  />
                )}
              </Box>
              {items[0].subtitle && (
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }} noWrap>
                  {items[0].subtitle}
                </Typography>
              )}
              {items[0].extraInfo && (
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', fontSize: '0.7rem' }} noWrap>
                  {items[0].extraInfo}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {/* Multi-Item Bulk List Preview */}
        {items.length > 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                AFFECTED ACCOUNTS ({items.length})
              </Typography>
              <Chip
                label={`${items.length} Selected`}
                size="small"
                sx={{
                  bgcolor: '#FEF2F2',
                  color: '#DC2626',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  height: 20,
                  borderRadius: '9999px',
                  border: '1px solid #FECACA',
                }}
              />
            </Box>
            <Box
              sx={{
                maxHeight: 180,
                overflowY: 'auto',
                p: 1,
                bgcolor: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.75,
              }}
            >
              {items.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    p: '8px 12px',
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #EEF2F6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Avatar
                    src={item.avatarUrl}
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: item.avatarColor || '#3B82F6',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  >
                    {item.title.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.8rem' }} noWrap>
                      {item.title}
                    </Typography>
                    {item.subtitle && (
                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }} noWrap>
                        {item.subtitle}
                      </Typography>
                    )}
                  </Box>
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        borderRadius: '9999px',
                        bgcolor: item.badgeColor?.bg || '#F1F5F9',
                        color: item.badgeColor?.text || '#475569',
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Warning Note Banner */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: '12px',
            bgcolor: '#FFFBEB',
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
          }}
        >
          <WarningAmberRoundedIcon sx={{ color: '#D97706', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
          <Typography sx={{ color: '#92400E', fontSize: '0.76rem', lineHeight: 1.4, fontWeight: 500 }}>
            {warningNote}
          </Typography>
        </Box>
      </DialogContent>

      <Divider sx={{ borderColor: '#F1F5F9' }} />

      {/* Actions */}
      <DialogActions sx={{ p: 2.5, pt: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          sx={{
            height: 44,
            borderRadius: '9999px',
            borderColor: '#CBD5E1',
            color: '#475569',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.86rem',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          startIcon={<DeleteForeverRoundedIcon sx={{ fontSize: '1.15rem !important' }} />}
          sx={{
            height: 44,
            borderRadius: '9999px',
            bgcolor: '#DC2626',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.86rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
            '&:hover': { bgcolor: '#B91C1C' },
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
