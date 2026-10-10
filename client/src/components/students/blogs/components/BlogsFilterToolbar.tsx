'use client';

import React from 'react';
import {
  Box,
  Chip,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import { CATEGORIES } from './types';

interface BlogsFilterToolbarProps {
  categories?: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  activeTab: 'trending' | 'latest' | 'bookmarks';
  onChangeTab: (tab: 'trending' | 'latest' | 'bookmarks') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export default function BlogsFilterToolbar({
  categories = CATEGORIES,
  selectedCategory,
  onSelectCategory,
  activeTab,
  onChangeTab,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: BlogsFilterToolbarProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Category Filter Chips Scroll Bar */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          '::-webkit-scrollbar': { height: 4 },
          '::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 4 },
        }}
      >
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <Chip
              key={cat}
              label={cat}
              onClick={() => onSelectCategory(cat)}
              sx={{
                fontWeight: isSelected ? 800 : 600,
                fontSize: '0.82rem',
                borderRadius: '10px',
                bgcolor: isSelected ? '#0B1F3A' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : '#475569',
                border: isSelected ? '1px solid #0B1F3A' : '1px solid #E2E8F0',
                boxShadow: isSelected ? '0 4px 12px rgba(91, 45, 144, 0.2)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                '&:hover': {
                  bgcolor: isSelected ? '#17366E' : '#F1F5F9',
                  color: isSelected ? '#FFFFFF' : '#0F172A',
                },
              }}
            />
          );
        })}
      </Box>

      {/* Controls Bar: Tabs, Search, Category Dropdown, Grid/List */}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        {/* Status Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => onChangeTab(val)}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              fontSize: '0.84rem',
              fontWeight: 700,
              textTransform: 'none',
              color: '#64748B',
              '&.Mui-selected': { color: '#0B1F3A' },
            },
            '& .MuiTabs-indicator': { bgcolor: '#0B1F3A', height: 3, borderRadius: '3px 3px 0 0' },
          }}
        >
          <Tab
            icon={<TrendingUpRoundedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Trending Stories"
            value="trending"
          />
          <Tab
            label="Latest Releases"
            value="latest"
          />
          <Tab
            icon={<BookmarkRoundedIcon sx={{ fontSize: 17 }} />}
            iconPosition="start"
            label="Saved Bookmarks"
            value="bookmarks"
          />
        </Tabs>

        {/* Search, Category Select, & Grid/List Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search topics, tags, authors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              minWidth: { xs: '100%', sm: 260 },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: '#F8FAFC',
                fontSize: '0.84rem',
                '& fieldset': { borderColor: '#E2E8F0' },
                '&:hover fieldset': { borderColor: '#CBD5E1' },
                '&.Mui-focused fieldset': { borderColor: '#0B1F3A', bgcolor: '#FFFFFF' },
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 170 }}>
            <Select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              sx={{
                borderRadius: '8px',
                bgcolor: '#F8FAFC',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat} sx={{ fontSize: '0.84rem' }}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, val) => {
              if (val) onViewModeChange(val);
            }}
            size="small"
            aria-label="view mode toggle"
            sx={{
              bgcolor: '#F1F5F9',
              borderRadius: '10px',
              p: '3px',
              border: '1px solid #E2E8F0',
              '& .MuiToggleButton-root': {
                border: 'none',
                borderRadius: '8px !important',
                px: 1.5,
                py: 0.6,
                color: '#64748B',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                gap: 0.6,
                transition: 'all 0.18s ease',
                '&.Mui-selected': {
                  bgcolor: '#FFFFFF',
                  color: '#0B1F3A',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  fontWeight: 800,
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.8)',
                },
              },
            }}
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridViewRoundedIcon sx={{ fontSize: 17 }} />
              <span>Grid</span>
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ViewListRoundedIcon sx={{ fontSize: 17 }} />
              <span>List</span>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  );
}
