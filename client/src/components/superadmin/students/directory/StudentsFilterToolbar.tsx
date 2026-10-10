'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';

interface StudentsFilterToolbarProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  minSolvedFilter: string;
  onMinSolvedFilterChange: (val: string) => void;
  minStreakFilter: string;
  onMinStreakFilterChange: (val: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
  isFilterActive: boolean;
  totalCount: number;
  instituteCount: number;
  indCount: number;
}

export default function StudentsFilterToolbar({
  selectedType,
  onTypeChange,
  searchQuery,
  onSearchChange,
  minSolvedFilter,
  onMinSolvedFilterChange,
  minStreakFilter,
  onMinStreakFilterChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  isFilterActive,
  totalCount,
  instituteCount,
  indCount,
}: StudentsFilterToolbarProps) {
  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* MUI Tabs for Institution Types */}
      <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={selectedType}
          onChange={(_, newValue) => onTypeChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              backgroundColor: '#0B1F3A',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTabs-flexContainer': {
              gap: { xs: 0.5, sm: 1.5 },
            },
          }}
        >
          {[
            { id: 'ALL', label: 'All Students', count: totalCount },
            { id: 'Institute', label: 'Institutes', count: instituteCount },
            { id: 'Independent', label: 'Independent', count: indCount },
          ].map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: selectedType === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
                    {tab.label}
                  </Typography>
                  <Chip
                    label={tab.count}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      bgcolor: selectedType === tab.id ? '#FAF5FF' : '#F1F5F9',
                      color: selectedType === tab.id ? '#0B1F3A' : '#64748B',
                      border: '1px solid',
                      borderColor: selectedType === tab.id ? '#D8B4FE' : '#E2E8F0',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>
              }
              disableRipple
              sx={{
                minHeight: 48,
                py: 1,
                px: 1.25,
                textTransform: 'none',
                color: selectedType === tab.id ? '#0B1F3A !important' : '#64748B',
                '&:hover': {
                  color: '#0F172A',
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Search Bar & Secondary Dropdowns */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search by student name, @handle, ID, institution, or cohort..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', lg: 480 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              fontSize: '0.85rem',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
            },
          }}
        />

        {/* Secondary Dropdown Filters & Reset */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mr: 0.5 }}>
            FILTERS:
          </Typography>

          {/* Min Solved */}
          <Select
            size="small"
            value={minSolvedFilter}
            onChange={(e) => onMinSolvedFilterChange(e.target.value)}
            sx={{
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              height: 32,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '& .MuiSvgIcon-root': { color: '#64748B' },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Solved Counts</MenuItem>
            <MenuItem value="500" sx={{ fontSize: '0.8rem' }}>500+ Solved</MenuItem>
            <MenuItem value="300" sx={{ fontSize: '0.8rem' }}>300+ Solved</MenuItem>
            <MenuItem value="100" sx={{ fontSize: '0.8rem' }}>100+ Solved</MenuItem>
          </Select>

          {/* Min Streak */}
          <Select
            size="small"
            value={minStreakFilter}
            onChange={(e) => onMinStreakFilterChange(e.target.value)}
            sx={{
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              height: 32,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '& .MuiSvgIcon-root': { color: '#64748B' },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Streaks</MenuItem>
            <MenuItem value="30" sx={{ fontSize: '0.8rem' }}>30+ Days Active Streak</MenuItem>
            <MenuItem value="14" sx={{ fontSize: '0.8rem' }}>14+ Days Streak</MenuItem>
            <MenuItem value="7" sx={{ fontSize: '0.8rem' }}>7+ Days Streak</MenuItem>
          </Select>

          {/* Status */}
          <Select
            size="small"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 600,
              height: 32,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '& .MuiSvgIcon-root': { color: '#64748B' },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
            <MenuItem value="Active" sx={{ fontSize: '0.8rem' }}>Active Only</MenuItem>
            <MenuItem value="Inactive" sx={{ fontSize: '0.8rem' }}>Inactive</MenuItem>
            <MenuItem value="Invited" sx={{ fontSize: '0.8rem' }}>Invited (Pending)</MenuItem>
            <MenuItem value="Suspended" sx={{ fontSize: '0.8rem' }}>Suspended</MenuItem>
          </Select>

          {/* Reset Pill */}
          {isFilterActive && (
            <Button
              size="small"
              onClick={onResetFilters}
              startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 15 }} />}
              sx={{
                textTransform: 'none',
                borderRadius: '9999px',
                color: '#EF4444',
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA',
                fontWeight: 700,
                fontSize: '0.75rem',
                px: 1.5,
                py: 0.4,
                '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' },
              }}
            >
              Reset Filters
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
