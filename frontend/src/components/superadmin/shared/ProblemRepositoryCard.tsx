'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

import { apiService } from '@/lib/api-service';

interface ProblemRepositoryCardProps {
  primaryBlue?: string;
  onManageClick?: () => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      pct: number;
      color: string;
    };
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
          borderRadius: '10px',
          px: 1.5,
          py: 1,
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: data.color }}>
          {data.name} Tier
        </Typography>
        <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
          {data.value} problems <Typography component="span" sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>({data.pct}%)</Typography>
        </Typography>
      </Box>
    );
  }
  return null;
}

export default function ProblemRepositoryCard({
  primaryBlue = '#2563eb',
  onManageClick,
}: ProblemRepositoryCardProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);

  const [easyCount, setEasyCount] = useState(0);
  const [mediumCount, setMediumCount] = useState(0);
  const [hardCount, setHardCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [topicTags, setTopicTags] = useState<{ name: string; count: number }[]>([]);

  React.useEffect(() => {
    async function loadStats() {
      try {
        const liveData = await apiService.getProblems({ limit: 100 });
        if (liveData?.items) {
          const items = liveData.items;
          const e = items.filter((p: any) => p.difficulty === 'EASY' || p.difficulty === 'Easy').length;
          const m = items.filter((p: any) => p.difficulty === 'MEDIUM' || p.difficulty === 'Medium').length;
          const h = items.filter((p: any) => p.difficulty === 'HARD' || p.difficulty === 'Hard').length;
          const tot = items.length;
          setEasyCount(e);
          setMediumCount(m);
          setHardCount(h);
          setTotalCount(tot);

          // Extract dynamic tags from live problems
          const tagMap = new Map<string, number>();
          items.forEach((p: any) => {
            if (Array.isArray(p.tags) && p.tags.length > 0) {
              p.tags.forEach((t: string) => {
                tagMap.set(t, (tagMap.get(t) || 0) + 1);
              });
            }
          });
          const tagsList = Array.from(tagMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
          setTopicTags(tagsList.slice(0, 6));
        }
      } catch (err) {
        console.warn('Problem repository live stats fetch:', err);
      }
    }
    loadStats();
  }, []);

  const total = Math.max(1, totalCount);
  const difficultyData = [
    {
      name: 'Easy',
      value: easyCount,
      pct: totalCount > 0 ? Math.round((easyCount / total) * 100) : 0,
      color: '#10B981',
      glowColor: 'rgba(16, 185, 129, 0.4)',
    },
    {
      name: 'Medium',
      value: mediumCount,
      pct: totalCount > 0 ? Math.round((mediumCount / total) * 100) : 0,
      color: '#0284C7',
      glowColor: 'rgba(2, 132, 199, 0.4)',
    },
    {
      name: 'Hard',
      value: hardCount,
      pct: totalCount > 0 ? Math.round((hardCount / total) * 100) : 0,
      color: '#EF4444',
      glowColor: 'rgba(239, 68, 68, 0.4)',
    },
  ];

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const downloadAsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h3>Difficulty Breakdown</h3>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Difficulty Tier</th>
            <th>Problem Count</th>
            <th>Percentage</th>
          </tr>
          ${difficultyData.map(
            (d: any) => `
            <tr>
              <td>${d.name}</td>
              <td align="right">${d.value}</td>
              <td align="right">${d.pct}%</td>
            </tr>`
          ).join('')}
        </table>
        <br/>
        <h3>Topic Tags & Categories</h3>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Topic / Domain</th>
            <th>Total Problems</th>
          </tr>
          ${topicTags.map(
            (t: any) => `
            <tr>
              <td>${t.name}</td>
              <td align="right">${t.count}</td>
            </tr>`
          ).join('')}
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `problem_repository_catalog_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadAsCSV = () => {
    const headers = ['Category Type', 'Name / Tier', 'Problem Count', 'Percentage'];
    const rows = [
      ...difficultyData.map((d: any) => ['"Difficulty Tier"', `"${d.name}"`, d.value, `"${d.pct}%"`]),
      ...topicTags.map((t: any) => ['"Topic Domain"', `"${t.name}"`, t.count, '""']),
    ];

    const csvContent = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `problem_repository_catalog_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const activeItem = hoveredIndex !== null ? difficultyData[hoveredIndex] : null;

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0,
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              Problem Repository
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 500, color: '#64748B', mt: 0.2 }}>
              {totalCount.toLocaleString()} Global Coding Challenges
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Download Excel / CSV Button */}
          <Tooltip title="Download Problems Excel / CSV">
            <IconButton
              size="small"
              onClick={handleOpenDownloadMenu}
              sx={{
                color: '#64748B',
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.7,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  borderColor: '#BFDBFE',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <FileDownloadRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={downloadAnchorEl}
            open={Boolean(downloadAnchorEl)}
            onClose={handleCloseDownloadMenu}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: '16px',
                  border: '1px solid #E2E8F0',
                  mt: 1,
                  minWidth: 210,
                  p: 0.5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                },
              },
            }}
          >
            <MenuItem
              onClick={downloadAsExcel}
              sx={{
                borderRadius: '10px',
                py: 0.9,
                px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#F0FDF4' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download Excel (.xls)
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={downloadAsCSV}
              sx={{
                borderRadius: '10px',
                py: 0.9,
                px: 1.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#EFF6FF' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download CSV (.csv)
              </Typography>
            </MenuItem>
          </Menu>

          <Button
            size="small"
            onClick={onManageClick}
            endIcon={<FluidArrowRight size={14} />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.78rem',
              color: '#2563EB',
              borderRadius: '9999px',
              px: 1.4,
              py: 0.35,
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              '&:hover': {
                bgcolor: '#DBEAFE',
              },
            }}
          >
            Manage
          </Button>
        </Box>
      </Box>

      {/* Donut & Clean Difficulty Rows */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          px: 1,
        }}
      >
        {/* Recharts Pie Chart (Donut) */}
        <Box sx={{ width: 130, height: 130, position: 'relative', flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <RechartsTooltip content={<CustomTooltip />} />
              <Pie
                data={difficultyData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={60}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {difficultyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    style={{
                      filter: hoveredIndex === index ? `drop-shadow(0 0 8px ${entry.glowColor})` : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Callout */}
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            <Typography
              sx={{
                fontSize: activeItem ? '1.2rem' : '1.3rem',
                fontWeight: 900,
                color: activeItem ? activeItem.color : '#0F172A',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                transition: 'color 0.2s ease',
              }}
            >
              {activeItem ? activeItem.value : totalCount}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.62rem',
                fontWeight: 700,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                mt: 0.2,
              }}
            >
              {activeItem ? activeItem.name : 'Problems'}
            </Typography>
          </Box>
        </Box>

        {/* Right: Clean Difficulty Tier List */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.25, pl: 1 }}>
          {difficultyData.map((tier, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <Box
                key={tier.name}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  py: 0.3,
                  px: 0.6,
                  borderRadius: '8px',
                  bgcolor: isHovered ? '#F8FAFC' : 'transparent',
                  transition: 'all 0.15s ease',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tier.color }} />
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 600, color: '#0F172A' }}>
                    {tier.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.6 }}>
                  <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: tier.color }}>
                    {tier.value}
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
                    ({tier.pct}%)
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Footer Topic / Domain Tags */}
      <Box sx={{ pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.2 }}>
          Popular Domains & Tracks
        </Typography>
        {topicTags.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {topicTags.map((tag) => (
              <Chip
                key={tag.name}
                label={`${tag.name} (${tag.count})`}
                size="small"
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: '#334155',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  height: 26,
                  '&:hover': {
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    borderColor: '#BFDBFE',
                  },
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontStyle: 'italic', py: 0.5 }}>
            No active problem tracks recorded yet
          </Typography>
        )}
      </Box>
    </Card>
  );
}
