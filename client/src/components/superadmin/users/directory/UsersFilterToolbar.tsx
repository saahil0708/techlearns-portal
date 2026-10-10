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
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';

interface UsersFilterToolbarProps {
  selectedRoleFilter: string;
  onRoleFilterChange: (role: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  twoFactorFilter: string;
  onTwoFactorFilterChange: (val: string) => void;
  selectedStatusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onResetFilters: () => void;
  isFilterActive: boolean;
  totalCount: number;
  superAdminCount: number;
  instituteAdminCount: number;
  facultyCount: number;
  recruiterCount: number;
}

export default function UsersFilterToolbar({
  selectedRoleFilter,
  onRoleFilterChange,
  searchQuery,
  onSearchChange,
  twoFactorFilter,
  onTwoFactorFilterChange,
  selectedStatusFilter,
  onStatusFilterChange,
  onResetFilters,
  isFilterActive,
  totalCount,
  superAdminCount,
  instituteAdminCount,
  facultyCount,
  recruiterCount,
}: UsersFilterToolbarProps) {
  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* MUI Tabs for Role Categories */}
      <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={selectedRoleFilter}
          onChange={(_, newValue) => onRoleFilterChange(newValue)}
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
            { id: 'ALL', label: 'All Users', count: totalCount },
            { id: 'SUPER_ADMIN', label: 'Super Admins', count: superAdminCount },
            { id: 'COLLEGE_ADMIN', label: 'Institute Admins', count: instituteAdminCount },
            { id: 'FACULTY', label: 'Faculty', count: facultyCount },
            { id: 'RECRUITER', label: 'Recruiters', count: recruiterCount },
          ].map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: selectedRoleFilter === tab.id ? 700 : 600, fontSize: '0.84rem' }}>
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
                      bgcolor: selectedRoleFilter === tab.id ? '#FAF5FF' : '#F1F5F9',
                      color: selectedRoleFilter === tab.id ? '#0B1F3A' : '#64748B',
                      border: '1px solid',
                      borderColor: selectedRoleFilter === tab.id ? '#D8B4FE' : '#E2E8F0',
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
                color: selectedRoleFilter === tab.id ? '#0B1F3A !important' : '#64748B',
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
          placeholder="Search by user name, @handle, email, institution, or role..."
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
            maxWidth: { xs: '100%', lg: 460 },
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

        {/* Row 2: Secondary Dropdown Filters & Reset */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, mr: 0.5 }}>
            SECURITY & STATUS:
          </Typography>

          {/* 2FA Status */}
          <Select
            size="small"
            value={twoFactorFilter}
            onChange={(e) => onTwoFactorFilterChange(e.target.value)}
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
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All 2FA States</MenuItem>
            <MenuItem value="ENABLED" sx={{ fontSize: '0.8rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <VerifiedUserRoundedIcon sx={{ fontSize: 15, color: '#16A34A' }} />
                2FA Enabled
              </Box>
            </MenuItem>
            <MenuItem value="DISABLED" sx={{ fontSize: '0.8rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <GppBadRoundedIcon sx={{ fontSize: 15, color: '#D97706' }} />
                2FA Disabled
              </Box>
            </MenuItem>
          </Select>

          {/* Status */}
          <Select
            size="small"
            value={selectedStatusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
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
