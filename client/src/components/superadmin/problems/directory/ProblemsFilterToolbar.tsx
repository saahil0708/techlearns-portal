import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';

interface ProblemsFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  onResetFilters: () => void;
  getCategoryCount: (cat: string) => number;
  filteredCount: number;
  totalCount: number;
}

const CATEGORIES = [
  'All Topics',
  'Dynamic Programming',
  'Graph Theory & BFS/DFS',
  'Trees & Binary Search Trees',
  'Arrays & Two Pointers',
  'Strings & Tries',
  'Math & Number Theory',
  'Greedy & Heuristics',
];

export default function ProblemsFilterToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedStatus,
  onStatusChange,
  onResetFilters,
  getCategoryCount,
  filteredCount,
  totalCount,
}: ProblemsFilterToolbarProps) {
  const borderColor = '#E2E8F0';
  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All Topics' ||
    selectedDifficulty !== 'ALL' ||
    selectedStatus !== 'ALL';

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* MUI Tabs for Algorithmic Topic Categories */}
      <Box sx={{ borderBottom: `1px solid ${borderColor}`, px: { xs: 2, md: 3 }, pt: 0.5, bgcolor: '#FFFFFF' }}>
        <Tabs
          value={selectedCategory}
          onChange={(_, newValue) => onCategoryChange(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              backgroundColor: '#2563EB',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTabs-flexContainer': {
              gap: { xs: 0.5, sm: 1.5 },
            },
          }}
        >
          {CATEGORIES.map((cat) => (
            <Tab
              key={cat}
              value={cat}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: selectedCategory === cat ? 700 : 600, fontSize: '0.84rem' }}>
                    {cat}
                  </Typography>
                  <Chip
                    label={getCategoryCount(cat)}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      bgcolor: selectedCategory === cat ? '#EFF6FF' : '#F1F5F9',
                      color: selectedCategory === cat ? '#2563EB' : '#64748B',
                      border: '1px solid',
                      borderColor: selectedCategory === cat ? '#BFDBFE' : '#E2E8F0',
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
                color: selectedCategory === cat ? '#2563EB !important' : '#64748B',
                '&:hover': { color: '#0F172A' },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Search Bar & Dropdown Filters Row */}
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <TextField
          size="small"
          placeholder="Search by problem title, code, tag, company..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            flex: 1,
            maxWidth: { xs: '100%', md: 380 },
            '& .MuiOutlinedInput-root': {
              borderRadius: '9999px',
              bgcolor: '#F8FAFC',
              color: '#0F172A',
              fontSize: '0.85rem',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused fieldset': { borderColor: '#2563EB' },
            },
          }}
        />

        {/* Filter Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
            DIFFICULTY:
          </Typography>
          <Select
            size="small"
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            sx={{
              height: 32,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#0F172A',
              bgcolor: '#F8FAFC',
              borderRadius: '9999px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Difficulties</MenuItem>
            <MenuItem value="Easy" sx={{ fontSize: '0.8rem' }}>Easy</MenuItem>
            <MenuItem value="Medium" sx={{ fontSize: '0.8rem' }}>Medium</MenuItem>
            <MenuItem value="Hard" sx={{ fontSize: '0.8rem' }}>Hard</MenuItem>
          </Select>

          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, ml: 0.5 }}>
            STATUS:
          </Typography>
          <Select
            size="small"
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            sx={{
              height: 32,
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#0F172A',
              bgcolor: '#F8FAFC',
              borderRadius: '9999px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              '& .MuiSvgIcon-root': { color: '#64748B', fontSize: 18 },
            }}
          >
            <MenuItem value="ALL" sx={{ fontSize: '0.8rem' }}>All Statuses</MenuItem>
            <MenuItem value="Published" sx={{ fontSize: '0.8rem' }}>Published</MenuItem>
            <MenuItem value="Under Review" sx={{ fontSize: '0.8rem' }}>Under Review</MenuItem>
            <MenuItem value="Draft" sx={{ fontSize: '0.8rem' }}>Draft</MenuItem>
          </Select>

          {hasActiveFilters && (
            <Button
              size="small"
              onClick={onResetFilters}
              startIcon={<FilterAltOffRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                textTransform: 'none',
                fontSize: '0.78rem',
                fontWeight: 600,
                color: '#EF4444',
                bgcolor: '#FEF2F2',
                borderRadius: '9999px',
                px: 1.5,
                py: 0.5,
                '&:hover': { bgcolor: '#FEE2E2' },
              }}
            >
              Reset Filters
            </Button>
          )}

          <Typography sx={{ color: '#94A3B8', fontSize: '0.75rem', fontWeight: 600, ml: 1 }}>
            Showing {filteredCount} of {totalCount}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
