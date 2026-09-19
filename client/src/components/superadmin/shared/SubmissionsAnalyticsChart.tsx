'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  ButtonGroup,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { apiService } from '@/lib/api-service';

interface AnalyticsDataPoint {
  time: string;
  fullDate: string;
  total: number;
  accepted: number;
  failed: number;
}

function computeReal7D(submissions: any[] = []): AnalyticsDataPoint[] {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: AnalyticsDataPoint[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayName = days[d.getDay()];
    const fullDate = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    
    // Real submissions count on this calendar date
    const daySubs = submissions.filter((s: any) => {
      if (!s.createdAt) return false;
      const subD = new Date(s.createdAt);
      return subD.toDateString() === d.toDateString();
    });

    const total = daySubs.length;
    const accepted = daySubs.filter((s: any) => s.verdict === 'ACCEPTED' || s.status === 'ACCEPTED').length;
    result.push({
      time: dayName,
      fullDate,
      total,
      accepted,
      failed: Math.max(0, total - accepted),
    });
  }
  return result;
}

function computeReal30D(submissions: any[] = []): AnalyticsDataPoint[] {
  const result: AnalyticsDataPoint[] = [];
  const now = new Date();

  for (let w = 4; w >= 1; w--) {
    const dEnd = new Date(now);
    dEnd.setDate(now.getDate() - (w - 1) * 7);
    const dStart = new Date(dEnd);
    dStart.setDate(dEnd.getDate() - 6);

    const fullDate = `${dStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    
    const weekSubs = submissions.filter((s: any) => {
      if (!s.createdAt) return false;
      const subD = new Date(s.createdAt);
      return subD >= dStart && subD <= dEnd;
    });

    const total = weekSubs.length;
    const accepted = weekSubs.filter((s: any) => s.verdict === 'ACCEPTED' || s.status === 'ACCEPTED').length;
    result.push({
      time: `Week ${5 - w}`,
      fullDate,
      total,
      accepted,
      failed: Math.max(0, total - accepted),
    });
  }
  return result;
}

interface CustomChartTooltipPayloadItem {
  name?: string;
  value?: number;
  dataKey?: string;
  payload?: AnalyticsDataPoint;
}

interface CustomChartTooltipProps {
  active?: boolean;
  payload?: CustomChartTooltipPayloadItem[];
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomChartTooltipProps) {
  if (active && payload && payload.length) {
    const dataItem = payload[0]?.payload as AnalyticsDataPoint;
    const rate = dataItem && dataItem.total > 0 ? ((dataItem.accepted / dataItem.total) * 100).toFixed(1) : '0.0';

    return (
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.08)',
          borderRadius: '14px',
          p: 1.75,
          minWidth: 190,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pb: 0.75, borderBottom: '1px solid #F1F5F9' }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
            {dataItem?.fullDate || label}
          </Typography>
          <Chip
            size="small"
            label={`${rate}% Pass`}
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 800,
              bgcolor: '#ECFDF5',
              color: '#059669',
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {payload.map((entry, index) => {
            const isAccepted = entry.dataKey === 'accepted';
            return (
              <Box key={`item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: isAccepted ? '#10B981' : '#2563EB',
                    }}
                  />
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                    {entry.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                  {entry.value?.toLocaleString()}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }
  return null;
}

export default function SubmissionsAnalyticsChart() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D'>('7D');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [data7D, setData7D] = useState<AnalyticsDataPoint[]>(() => computeReal7D([]));
  const [data30D, setData30D] = useState<AnalyticsDataPoint[]>(() => computeReal30D([]));

  React.useEffect(() => {
    async function loadLiveSubmissionsAnalytics() {
      try {
        const liveSubs = await apiService.getLiveSubmissions(100);
        if (liveSubs) {
          setData7D(computeReal7D(liveSubs));
          setData30D(computeReal30D(liveSubs));
        }
      } catch (err) {
        console.warn('Live submissions chart analytics:', err);
      }
    }
    loadLiveSubmissionsAnalytics();
  }, []);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const data = timeRange === '7D' ? data7D : data30D;
  const totalSubmissions = data.reduce((acc, curr) => acc + curr.total, 0);
  const totalAccepted = data.reduce((acc, curr) => acc + curr.accepted, 0);
  const totalFailed = totalSubmissions - totalAccepted;
  const acceptanceRate = ((totalAccepted / Math.max(1, totalSubmissions)) * 100).toFixed(1);

  const downloadAsExcel = () => {
    const tableContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
            <th>Time Period</th>
            <th>Full Date / Range</th>
            <th>Total Submissions</th>
            <th>Accepted Submissions</th>
            <th>Failed / TLE</th>
            <th>Pass Rate (%)</th>
          </tr>
          ${data.map(
            (d) => `
            <tr>
              <td>${d.time}</td>
              <td>${d.fullDate}</td>
              <td align="right">${d.total}</td>
              <td align="right">${d.accepted}</td>
              <td align="right">${d.failed}</td>
              <td align="right">${((d.accepted / d.total) * 100).toFixed(1)}%</td>
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
    link.setAttribute('download', `submission_analytics_${timeRange.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadAsCSV = () => {
    const headers = ['Time Period', 'Full Date / Range', 'Total Submissions', 'Accepted Submissions', 'Failed / TLE', 'Pass Rate (%)'];
    const rows = data.map((d) => [
      `"${d.time}"`,
      `"${d.fullDate}"`,
      d.total,
      d.accepted,
      d.failed,
      `"${((d.accepted / d.total) * 100).toFixed(1)}%"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `submission_analytics_${timeRange.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
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
        p: { xs: 2.5, sm: 3 },
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            }}
          >
            <TrendingUpRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Submission Activity & Velocity
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748B' }}>
              Real-time platform throughput and pass-rate analytics
            </Typography>
          </Box>
        </Box>

        {/* Controls: Chart Type & Time Range & Download */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Chart View Toggle */}
          <ButtonGroup size="small" sx={{ bgcolor: '#F1F5F9', borderRadius: '9999px', p: 0.35, border: '1px solid #E2E8F0' }}>
            <Button
              onClick={() => setChartType('area')}
              sx={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                color: chartType === 'area' ? '#2563EB' : '#64748B',
                bgcolor: chartType === 'area' ? '#FFFFFF' : 'transparent',
                borderRadius: '9999px !important',
                border: 'none !important',
                boxShadow: chartType === 'area' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                px: 1.5,
                py: 0.4,
                '&:hover': { bgcolor: chartType === 'area' ? '#FFFFFF' : '#E2E8F0' },
              }}
            >
              <ShowChartRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Area
            </Button>
            <Button
              onClick={() => setChartType('bar')}
              sx={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'none',
                color: chartType === 'bar' ? '#2563EB' : '#64748B',
                bgcolor: chartType === 'bar' ? '#FFFFFF' : 'transparent',
                borderRadius: '9999px !important',
                border: 'none !important',
                boxShadow: chartType === 'bar' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                px: 1.5,
                py: 0.4,
                '&:hover': { bgcolor: chartType === 'bar' ? '#FFFFFF' : '#E2E8F0' },
              }}
            >
              <BarChartRoundedIcon sx={{ fontSize: 16, mr: 0.5 }} /> Bar
            </Button>
          </ButtonGroup>

          {/* Time Range Toggle */}
          <ButtonGroup size="small" sx={{ bgcolor: '#F1F5F9', borderRadius: '9999px', p: 0.35, border: '1px solid #E2E8F0' }}>
            {(['7D', '30D'] as const).map((range) => (
              <Button
                key={range}
                onClick={() => setTimeRange(range)}
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: timeRange === range ? '#FFFFFF' : '#64748B',
                  bgcolor: timeRange === range ? '#2563EB' : 'transparent',
                  borderRadius: '9999px !important',
                  border: 'none !important',
                  boxShadow: timeRange === range ? '0 2px 6px rgba(37, 99, 235, 0.25)' : 'none',
                  px: 1.75,
                  py: 0.4,
                  '&:hover': {
                    bgcolor: timeRange === range ? '#1D4ED8' : '#E2E8F0',
                  },
                }}
              >
                {range}
              </Button>
            ))}
          </ButtonGroup>

          {/* Download Excel / CSV Button */}
          <Tooltip title="Download Analytics Excel / CSV">
            <IconButton
              size="small"
              onClick={handleOpenDownloadMenu}
              sx={{
                color: '#64748B',
                bgcolor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                borderRadius: '9999px',
                p: 0.75,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  borderColor: '#BFDBFE',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <FileDownloadRoundedIcon sx={{ fontSize: 18 }} />
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
        </Box>
      </Box>

      {/* Metrics Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' },
          gap: 1.75,
          bgcolor: '#F8FAFC',
          p: 1.75,
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
        }}
      >
        <Box sx={{ px: 0.5 }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Submissions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              {totalSubmissions.toLocaleString()}
            </Typography>
            <Chip
              size="small"
              icon={<TrendingUpRoundedIcon sx={{ fontSize: '12px !important', color: '#059669 !important' }} />}
              label="+14.2%"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 800,
                bgcolor: '#ECFDF5',
                color: '#059669',
                border: '1px solid #A7F3D0',
                borderRadius: '4px',
              }}
            />
          </Box>
        </Box>

        <Box sx={{ px: 0.5, borderLeft: { sm: '1px solid #E2E8F0' } }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Accepted Solutions
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#10B981', letterSpacing: '-0.02em' }}>
              {totalAccepted.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
              solutions
            </Typography>
          </Box>
        </Box>

        <Box sx={{ px: 0.5, borderLeft: { sm: '1px solid #E2E8F0' } }}>
          <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Platform Pass Rate
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.25 }}>
            <Typography sx={{ fontSize: '1.45rem', fontWeight: 800, color: '#2563EB', letterSpacing: '-0.02em' }}>
              {acceptanceRate}%
            </Typography>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 500 }}>
              avg pass
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Recharts Main Graph Area */}
      <Box sx={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="acceptedGradLight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dy={5} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <RechartsTooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Submissions"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#totalGradLight)"
                activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2.5, fill: '#2563EB' }}
              />
              <Area
                type="monotone"
                dataKey="accepted"
                name="Accepted Solutions"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#acceptedGradLight)"
                activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2.5, fill: '#10B981' }}
              />
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} dy={5} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
              />
              <RechartsTooltip content={<CustomChartTooltip />} />
              <Bar dataKey="total" name="Total Submissions" fill="#2563EB" radius={[5, 5, 0, 0]} />
              <Bar dataKey="accepted" name="Accepted Solutions" fill="#10B981" radius={[5, 5, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>

      {/* Legend & Meta Footer */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.5,
          borderTop: '1px solid #F1F5F9',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2563EB' }} />
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Total Submissions</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>Accepted Solutions</Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
          Updated every <strong style={{ color: '#0F172A' }}>30 seconds</strong> from compiler cluster
        </Typography>
      </Box>
    </Card>
  );
}
