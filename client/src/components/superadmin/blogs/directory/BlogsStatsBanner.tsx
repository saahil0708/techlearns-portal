'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import CategoryRoundedIcon from '@mui/icons-material/CategoryRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import { BlogPost } from '@/types/blog';

interface BlogsStatsBannerProps {
  blogs: BlogPost[];
  totalViews: number;
  totalClaps: number;
  activeCategoriesCount: number;
  onOpenCreateModal: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
}

export default function BlogsStatsBanner({
  blogs,
  totalViews,
  totalClaps,
  activeCategoriesCount,
  onOpenCreateModal,
  onExportExcel,
  onExportCSV,
}: BlogsStatsBannerProps) {
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const publishedCount = blogs.filter(
    (b: any) => !b.status || b.status === 'PUBLISHED' || b.status === 'Published'
  ).length;

  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const publishedThisWeek = blogs.filter((b: any) => {
    const isPublished = !b.status || b.status === 'PUBLISHED' || b.status === 'Published';
    if (!isPublished) return false;
    if (!b.publishedAt) return false;
    const t = new Date(b.publishedAt).getTime();
    return !isNaN(t) && t >= oneWeekAgo;
  }).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Header Row */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 38, height: 38, borderRadius: '10px', bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArticleRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Developer Blogs & Editorial Publications
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.86rem', color: '#64748B', mt: 0.5, ml: 6.5 }}>
            System architecture breakdowns, contest post-mortems, editorial solutions, and collegiate engineering articles.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleOpenDownloadMenu}
            sx={{
              bgcolor: '#FFFFFF',
              borderColor: '#E2E8F0',
              color: '#475569',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2,
              py: 0.85,
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
            }}
          >
            Export Data
          </Button>

          <Menu
            anchorEl={downloadAnchorEl}
            open={Boolean(downloadAnchorEl)}
            onClose={handleCloseDownloadMenu}
            slotProps={{ paper: { sx: { borderRadius: '12px', minWidth: 190, p: 0.5 } } }}
          >
            <MenuItem
              onClick={() => {
                handleCloseDownloadMenu();
                onExportExcel();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ color: '#16A34A', minWidth: 32 }}><TableChartRoundedIcon fontSize="small" /></ListItemIcon>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>Download Excel (.xls)</Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleCloseDownloadMenu();
                onExportCSV();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ color: '#0284C7', minWidth: 32 }}><DescriptionRoundedIcon fontSize="small" /></ListItemIcon>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 600 }}>Download CSV (.csv)</Typography>
            </MenuItem>
          </Menu>

          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenCreateModal}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
              px: 2.25,
              py: 0.85,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Write Article
          </Button>
        </Box>
      </Box>

      {/* 4 Themed KPI StatsCards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        <StatsCard
          title="Published Articles"
          value={publishedCount}
          icon={<ArticleRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="orbital"
          subtitle="Live in Student SkillOS"
          trendBadge={publishedThisWeek > 0 ? { text: `+${publishedThisWeek} this week`, type: 'positive' } : undefined}
        />

        <StatsCard
          title="Total Article Views"
          value={totalViews.toLocaleString()}
          icon={<VisibilityOutlinedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="topography"
          subtitle="Student & recruiter impressions"
        />

        <StatsCard
          title="Community Claps"
          value={totalClaps.toLocaleString()}
          icon={<FavoriteRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="hex-grid"
          subtitle="Peer endorsements"
        />

        <StatsCard
          title="Technical Domains"
          value={activeCategoriesCount}
          icon={<CategoryRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="aurora-waves"
          subtitle="Curated disciplines"
        />
      </Box>
    </Box>
  );
}
