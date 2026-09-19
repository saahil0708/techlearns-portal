'use client';

import React from 'react';
import { Card, Chip, Button, IconButton, Tooltip, Divider } from '@mui/material';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  itemLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
  onDelete?: () => void;
  deleteLabel?: string;
  children?: React.ReactNode;
}

export default function BulkActionBar({
  selectedCount,
  onClear,
  itemLabel = 'Selected',
  onExport,
  exportLabel = 'Export Selected',
  onDelete,
  deleteLabel,
  children,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <Card
      elevation={10}
      sx={{
        position: 'fixed',
        bottom: { xs: 20, md: 28 },
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1300,
        width: 'auto',
        maxWidth: 'calc(100vw - 32px)',
        py: 0.85,
        px: 1.5,
        borderRadius: '9999px',
        bgcolor: '#FFFFFF',
        border: '1px solid #BFDBFE',
        boxShadow: '0 20px 40px -4px rgba(37, 99, 235, 0.2), 0 2px 8px rgba(0, 0, 0, 0.06)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'nowrap',
        whiteSpace: 'nowrap',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        '@keyframes slideUp': {
          from: { transform: 'translate(-50%, 40px)', opacity: 0 },
          to: { transform: 'translate(-50%, 0)', opacity: 1 },
        },
      }}
    >
      <Chip
        label={`${selectedCount} ${itemLabel}`}
        size="small"
        sx={{
          bgcolor: '#2563EB',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: '0.75rem',
          borderRadius: '9999px',
          height: 26,
          px: 0.5,
        }}
      />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: '#E2E8F0' }} />

      {/* Custom Action Children (e.g. Compare, Reset Passwords) */}
      {children}

      {/* Built-in Export Action */}
      {onExport && (
        <Button
          size="small"
          variant="outlined"
          onClick={onExport}
          startIcon={<TableChartRoundedIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            borderRadius: '9999px',
            borderColor: '#CBD5E1',
            color: '#0F172A',
            bgcolor: '#FFFFFF',
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'none',
            height: 30,
            px: 1.5,
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          {exportLabel}
        </Button>
      )}

      {/* Built-in Delete Action */}
      {onDelete && (
        <Button
          size="small"
          variant="outlined"
          onClick={onDelete}
          startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: '1rem' }} />}
          sx={{
            borderRadius: '9999px',
            borderColor: '#FECACA',
            color: '#DC2626',
            bgcolor: '#FEF2F2',
            fontSize: '0.78rem',
            fontWeight: 600,
            textTransform: 'none',
            height: 30,
            px: 1.5,
            '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' },
          }}
        >
          {deleteLabel || 'Delete Selected'}
        </Button>
      )}

      <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5, borderColor: '#E2E8F0' }} />

      {/* Clear Selection */}
      <Tooltip title="Clear selection">
        <IconButton
          size="small"
          onClick={onClear}
          sx={{
            color: '#64748B',
            width: 28,
            height: 28,
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Card>
  );
}
