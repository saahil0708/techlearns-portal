'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Select,
  MenuItem,
  IconButton,
  ButtonBase,
} from '@mui/material';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

export interface PaginationToolbarProps {
  totalEntries: number;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRows: number) => void;
  itemLabel?: string;
  rowsOptions?: number[];
}

export default function PaginationToolbar({
  totalEntries,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  itemLabel = 'items',
  rowsOptions = [5, 10, 25, 50],
}: PaginationToolbarProps) {
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safePage = Math.min(Math.max(0, currentPage), totalPages - 1);
  const startEntry = totalEntries === 0 ? 0 : safePage * rowsPerPage + 1;
  const endEntry = Math.min((safePage + 1) * rowsPerPage, totalEntries);

  React.useEffect(() => {
    if (currentPage !== safePage) {
      onPageChange(safePage);
    }
  }, [currentPage, safePage, onPageChange]);

  const getPaginationRange = (current: number, total: number) => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    if (current <= 3) return [0, 1, 2, 3, 4, 'ellipsis', total - 1];
    if (current >= total - 4) return [0, 'ellipsis', total - 5, total - 4, total - 3, total - 2, total - 1];
    return [0, 'ellipsis-start', current - 1, current, current + 1, 'ellipsis-end', total - 1];
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        px: 3,
        borderRadius: '14px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
          Showing <strong style={{ color: '#0F172A', fontWeight: 600 }}>{startEntry}–{endEntry}</strong> of <strong style={{ color: '#0F172A', fontWeight: 600 }}>{totalEntries}</strong> {itemLabel}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>Rows per page:</Typography>
          <Select
            value={rowsPerPage}
            onChange={(e) => {
              onRowsPerPageChange(Number(e.target.value));
              onPageChange(0);
            }}
            size="small"
            sx={{
              height: 28,
              fontSize: '0.76rem',
              fontWeight: 600,
              color: '#0F172A',
              bgcolor: '#FFFFFF',
              borderRadius: '9999px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0', borderRadius: '9999px' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
              '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
            }}
          >
            {rowsOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {/* Pagination Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(0)}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <FirstPageRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          disabled={safePage === 0}
          onClick={() => onPageChange(Math.max(0, safePage - 1))}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <ChevronLeftRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        {/* Smart Long-List Pagination Pills */}
        {getPaginationRange(safePage, totalPages).map((item, idx) => {
          if (typeof item === 'string') {
            return (
              <Box
                key={`ellipsis-${idx}`}
                sx={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                •••
              </Box>
            );
          }

          const pageIndex = item as number;
          const isActive = safePage === pageIndex;

          return (
            <ButtonBase
              key={pageIndex}
              onClick={() => onPageChange(pageIndex)}
              aria-label={`Page ${pageIndex + 1}`}
              aria-current={isActive ? 'page' : undefined}
              sx={{
                minWidth: 32,
                height: 32,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '9999px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#FFFFFF' : '#64748B',
                bgcolor: isActive ? '#0B1F3A' : '#FFFFFF',
                border: isActive ? '1px solid #0B1F3A' : '1px solid #E2E8F0',
                boxShadow: isActive ? '0 2px 8px rgba(91, 45, 144, 0.3)' : 'none',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: isActive ? '#17366E' : '#F1F5F9',
                  color: isActive ? '#FFFFFF' : '#0F172A',
                  borderColor: isActive ? '#17366E' : '#CBD5E1',
                },
              }}
            >
              {pageIndex + 1}
            </ButtonBase>
          );
        })}

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(Math.min(totalPages - 1, safePage + 1))}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>

        <IconButton
          size="small"
          disabled={safePage >= totalPages - 1}
          onClick={() => onPageChange(totalPages - 1)}
          sx={{
            width: 32,
            height: 32,
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            p: 0.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            '&.Mui-disabled': { opacity: 0.4, color: '#94A3B8' },
          }}
        >
          <LastPageRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Card>
  );
}
