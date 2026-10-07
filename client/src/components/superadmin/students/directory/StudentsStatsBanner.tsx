'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';

interface StudentsStatsBannerProps {
  totalCount: number;
  instituteCount: number;
  indCount: number;
  activeSolversCount: number;
  activeParticipationRate: number;
  totalProblemsSolved: number;
  solvedEasyCount: number;
  solvedMedCount: number;
  solvedHardCount: number;
  avgAccuracy: string;
  selectedCount: number;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenBulkImport: () => void;
  onOpenCreateStudent: () => void;
}

export default function StudentsStatsBanner({
  totalCount,
  instituteCount,
  indCount,
  activeSolversCount,
  activeParticipationRate,
  totalProblemsSolved,
  solvedEasyCount,
  solvedMedCount,
  solvedHardCount,
  avgAccuracy,
  selectedCount,
  onExportExcel,
  onExportCSV,
  onOpenBulkImport,
  onOpenCreateStudent,
}: StudentsStatsBannerProps) {
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Summary & Actions */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Students & Competitive Coders
            </Typography>
            <Chip
              label={`${totalCount} Coders`}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.75rem',
                borderRadius: '9999px',
              }}
            />
          </Box>
          <Typography sx={{ color: '#64748B', fontSize: '0.86rem', mt: 0.5, fontWeight: 500 }}>
            Global developer leaderboard, collegiate cohorts, K-12 STEM coders & performance analytics
          </Typography>
        </Box>

        {/* Actions: Export, Bulk Import & Add Student */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="Export Students Directory">
            <Button
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#475569',
                border: `1px solid ${borderColor}`,
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                px: 2,
                py: 0.75,
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                '&:hover': { bgcolor: '#EFF6FF', color: '#2563EB', borderColor: '#BFDBFE' },
              }}
            >
              Export {selectedCount > 0 ? `(${selectedCount})` : 'Data'}
            </Button>
          </Tooltip>

          <Menu
            anchorEl={exportMenuAnchor}
            open={Boolean(exportMenuAnchor)}
            onClose={() => setExportMenuAnchor(null)}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  mt: 1,
                  minWidth: 210,
                  p: 0.5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onExportExcel();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download Excel (.xls)
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setExportMenuAnchor(null);
                onExportCSV();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download CSV (.csv)
              </Typography>
            </MenuItem>
          </Menu>

          {/* Bulk Import */}
          <Button
            variant="outlined"
            onClick={onOpenBulkImport}
            startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#FFFFFF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2,
              py: 0.75,
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#2563EB' },
            }}
          >
            Bulk Import
          </Button>

          {/* Add Student */}
          <Button
            variant="contained"
            onClick={onOpenCreateStudent}
            startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.84rem',
              px: 2.25,
              py: 0.75,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Add Student
          </Button>
        </Box>
      </Box>

      {/* 4 Summary Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        <StatsCard
          title="Total Enrolled Coders"
          value={totalCount.toLocaleString()}
          icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="orbital"
          subtitle={`${instituteCount} Institute • ${indCount} Independent`}
        />

        <StatsCard
          title="Active Solvers"
          value={activeSolversCount.toLocaleString()}
          icon={<WhatshotRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="topography"
          subtitle={`${activeParticipationRate}% Participation Rate`}
        />

        <StatsCard
          title="Total Problems Solved"
          value={totalProblemsSolved.toLocaleString()}
          icon={<EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="hex-grid"
          subtitle={
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#60A5FA', fontWeight: 700 }}>
                {solvedEasyCount} Easy • {solvedMedCount} Med • {solvedHardCount} Hard
              </Typography>
            </Box>
          }
        />

        <StatsCard
          title="Avg Platform Accuracy"
          value={avgAccuracy}
          icon={<CheckCircleRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="aurora-waves"
          subtitle="Compiler Pass Rate"
        />
      </Box>
    </Box>
  );
}
