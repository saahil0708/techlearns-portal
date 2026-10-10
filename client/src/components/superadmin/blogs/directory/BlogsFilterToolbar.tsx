'use client';

import React from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import { BLOG_CATEGORIES, BlogPost } from '@/types/blog';

interface BlogsFilterToolbarProps {
  blogs: BlogPost[];
  filteredCount: number;
  selectedTab: string;
  onTabChange: (newTab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onResetFilters: () => void;
}

export default function BlogsFilterToolbar({
  blogs,
  filteredCount,
  selectedTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  onResetFilters,
}: BlogsFilterToolbarProps) {
  const borderColor = '#E2E8F0';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Status Tabs Header */}
      <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={selectedTab}
          onChange={(_, val) => onTabChange(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': { backgroundColor: '#0B1F3A', height: 3, borderRadius: '3px 3px 0 0' },
            '& .MuiTabs-flexContainer': { gap: { xs: 0.5, sm: 1.5 } },
          }}
        >
          <Tab value="ALL" label={`All Articles (${blogs.length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
          <Tab value="PUBLISHED" label={`Published (${blogs.filter((b) => (b.status || 'Published') === 'Published').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
          <Tab value="DRAFT" label={`Drafts (${blogs.filter((b) => b.status === 'Draft').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
          <Tab value="ARCHIVED" label={`Archived (${blogs.filter((b) => b.status === 'Archived').length})`} sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.85rem' }} />
        </Tabs>
      </Box>

      {/* Filter & Search Toolbar */}
      <Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: '#F8FAFC', borderBottom: `1px solid ${borderColor}` }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, flex: 1 }}>
          <TextField
            size="small"
            placeholder="Search articles by title, author, or tags..."
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
              width: { xs: '100%', sm: 340 },
              bgcolor: '#FFFFFF',
              '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.85rem' },
            }}
          />

          <Select
            size="small"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '0.84rem',
              minWidth: 190,
            }}
          >
            {BLOG_CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat} sx={{ fontSize: '0.84rem' }}>
                {cat}
              </MenuItem>
            ))}
          </Select>

          {(searchQuery || selectedCategory !== 'All Stories') && (
            <Button
              size="small"
              startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={onResetFilters}
              sx={{ textTransform: 'none', color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}
            >
              Reset Filters
            </Button>
          )}
        </Box>

        <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
          Showing {filteredCount} of {blogs.length} articles
        </Typography>
      </Box>
    </Box>
  );
}
