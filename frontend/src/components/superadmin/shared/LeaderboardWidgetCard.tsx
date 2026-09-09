'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import Link from 'next/link';

import { apiService } from '@/lib/api-service';

export interface LiveLeaderboardUser {
  rank: number | string;
  name: string;
  subDate: string;
  avatar: string;
  score: number;
  trend: 'up' | 'down';
  isCurrentUser?: boolean;
}

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
];

interface LeaderboardWidgetCardProps {
  primaryBlue?: string;
}

export default function LeaderboardWidgetCard({
  primaryBlue = '#2563eb',
}: LeaderboardWidgetCardProps) {
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LiveLeaderboardUser[]>([]);

  React.useEffect(() => {
    async function loadLeaderboard() {
      try {
        const liveData = await apiService.getUsers({ role: 'STUDENT', limit: 10 });
        if (liveData?.items && liveData.items.length > 0) {
          const mapped: LiveLeaderboardUser[] = liveData.items.slice(0, 5).map((u: any, idx: number) => ({
            rank: idx + 1,
            name: u.name || 'Student Developer',
            subDate: u.createdAt ? `Joined: ${new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}` : 'Active Competitor',
            avatar: DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length],
            score: 700 - idx * 30,
            trend: idx % 2 === 0 ? 'up' : 'down',
          }));
          setLeaderboardUsers(mapped);
        }
      } catch (err) {
        console.warn('Leaderboard live stats fetch:', err);
      }
    }
    loadLeaderboard();
  }, []);

  const topUsers = leaderboardUsers;

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
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Submission Date</th>
            <th>Trend</th>
          </tr>
          ${topUsers.map(
            (u: LiveLeaderboardUser) => `
            <tr>
              <td align="center">${u.rank}</td>
              <td>${u.name}</td>
              <td align="right">${u.score}</td>
              <td>${u.subDate}</td>
              <td>${u.trend.toUpperCase()}</td>
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
    link.setAttribute('download', `leaderboard_top_coders_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadAsCSV = () => {
    const headers = ['Rank', 'Name', 'Score', 'Submission Date', 'Trend'];
    const rows = topUsers.map((user: LiveLeaderboardUser) => [
      user.rank,
      `"${user.name}"`,
      user.score,
      `"${user.subDate}"`,
      user.trend.toUpperCase(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `leaderboard_top_coders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.75,
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: '-0.02em',
              fontFamily: 'inherit',
            }}
          >
            Live mode :
          </Typography>
          {/* <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#2563EB',
              boxShadow: '0 0 8px #2563EB',
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.4, transform: 'scale(0.8)' },
                '50%': { opacity: 1, transform: 'scale(1.2)' },
                '100%': { opacity: 0.4, transform: 'scale(0.8)' },
              },
            }}
          /> */}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Download Excel / CSV Button */}
          <Tooltip title="Download Excel / CSV">
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
                  minWidth: 200,
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

          <Tooltip title="View Full Leaderboard">
            <IconButton
              component={Link}
              href="/superadmin/students"
              size="small"
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
              <OpenInFullRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Top 5 Roster Stack */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.45 }}>
        {topUsers.map((user) => {
          const numRank = Number(user.rank);
          const style =
            numRank === 1
              ? {
                  backgroundImage: 'linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #B45309 100%)',
                  border: '1px solid rgba(254, 240, 138, 0.5)',
                  boxShadow: '0 4px 14px rgba(217, 119, 6, 0.28)',
                  hoverShadow: '0 8px 22px rgba(217, 119, 6, 0.42)',
                  rankColor: '#FFFBEB',
                  trendUpColor: '#FEF08A',
                }
              : numRank === 2
              ? {
                  backgroundImage: 'linear-gradient(135deg, #94A3B8 0%, #64748B 50%, #475569 100%)',
                  border: '1px solid rgba(241, 245, 249, 0.5)',
                  boxShadow: '0 4px 14px rgba(100, 116, 139, 0.25)',
                  hoverShadow: '0 8px 22px rgba(100, 116, 139, 0.38)',
                  rankColor: '#F8FAFC',
                  trendUpColor: '#FFFFFF',
                }
              : numRank === 3
              ? {
                  backgroundImage: 'linear-gradient(135deg, #C26D38 0%, #A0522D 50%, #7A3E1D 100%)',
                  border: '1px solid rgba(254, 215, 170, 0.5)',
                  boxShadow: '0 4px 14px rgba(160, 82, 45, 0.25)',
                  hoverShadow: '0 8px 22px rgba(160, 82, 45, 0.38)',
                  rankColor: '#FFEDD5',
                  trendUpColor: '#FED7AA',
                }
              : {
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.22)',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
                  hoverShadow: '0 8px 22px rgba(37, 99, 235, 0.32)',
                  rankColor: '#FFFFFF',
                  trendUpColor: '#D4FF00',
                };

          return (
            <Box
              key={user.name}
              component={Link}
              href="/superadmin/students"
              sx={{
                textDecoration: 'none',
                py: 1.3,
                px: 1.65,
                borderRadius: '7px',
                backgroundImage: style.backgroundImage,
                border: style.border,
                boxShadow: style.boxShadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px) scale(1.01)',
                  boxShadow: style.hoverShadow,
                },
              }}
            >
              {/* Left: Rank + Avatar + Name & Sub Date */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, minWidth: 0 }}>
                {/* Rank Number */}
                <Typography
                  sx={{
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: style.rankColor,
                    minWidth: 20,
                    lineHeight: 1,
                    textAlign: 'center',
                  }}
                >
                  {user.rank}
                </Typography>

                {/* Avatar */}
                <Avatar
                  src={user.avatar}
                  alt={user.name}
                  sx={{
                    width: 38,
                    height: 38,
                    border: '2px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.18)',
                    flexShrink: 0,
                  }}
                />

                {/* User Info */}
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      lineHeight: 1.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.68rem',
                      fontWeight: 500,
                      color: 'rgba(255, 255, 255, 0.82)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      mt: 0.2,
                    }}
                  >
                    {user.subDate}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Score + Arrow */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, flexShrink: 0, ml: 1.5 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '1.02rem',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      lineHeight: 1.1,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {user.score}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.8)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      lineHeight: 1,
                      mt: 0.15,
                    }}
                  >
                    Score
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.14)',
                  }}
                >
                  {user.trend === 'up' ? (
                    <KeyboardArrowUpRoundedIcon sx={{ fontSize: 20, color: style.trendUpColor }} />
                  ) : (
                    <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20, color: '#FECACA' }} />
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
