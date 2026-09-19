'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Button,
  ButtonGroup,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { apiService } from '@/lib/api-service';

interface ProblemSubmissionsWidgetProps {
  primaryBlue?: string;
}

interface ProblemSubmissionStat {
  name: string;
  short: string;
  fullName: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  accepted: number;
  failed: number;
  total: number;
  rate: string;
}

interface DomainSubmissionStat {
  domain: string;
  short: string;
  fullName: string;
  count: number;
  color: string;
  rate: string;
}

const DEFAULT_DOMAINS: DomainSubmissionStat[] = [];

interface ProblemBarTooltipPayloadItem {
  name?: string;
  value?: number;
  color?: string;
  fill?: string;
  dataKey?: string;
  payload?: ProblemSubmissionStat | DomainSubmissionStat;
}

interface ProblemBarTooltipProps {
  active?: boolean;
  payload?: ProblemBarTooltipPayloadItem[];
  label?: string;
  viewMode?: 'problems' | 'domains';
}

function ProblemBarTooltip({ active, payload, label, viewMode }: ProblemBarTooltipProps) {
  if (active && payload && payload.length) {
    if (viewMode === 'domains') {
      const domainItem = payload[0]?.payload as DomainSubmissionStat | undefined;
      return (
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.25)',
            borderRadius: '10px',
            p: 1.5,
            minWidth: 160,
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
            {domainItem?.fullName || label}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 0.35 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: domainItem?.color || '#38BDF8' }} />
              <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
                Total Submissions
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
              {domainItem?.count?.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ mt: 0.75, pt: 0.5, borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Avg Pass Rate</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>{domainItem?.rate}</Typography>
          </Box>
        </Box>
      );
    }

    const item = payload[0]?.payload as ProblemSubmissionStat;
    const diffBg =
      item?.difficulty === 'Easy'
        ? '#ECFDF5'
        : item?.difficulty === 'Medium'
        ? '#FFFBEB'
        : '#FEF2F2';
    const diffColor =
      item?.difficulty === 'Easy'
        ? '#059669'
        : item?.difficulty === 'Medium'
        ? '#D97706'
        : '#DC2626';
    const diffBorder =
      item?.difficulty === 'Easy'
        ? '#A7F3D0'
        : item?.difficulty === 'Medium'
        ? '#FDE68A'
        : '#FECACA';

    return (
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 30px -10px rgba(0, 0, 0, 0.25)',
          borderRadius: '10px',
          p: 1.5,
          minWidth: 170,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75, gap: 1 }}>
          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
            {item?.fullName || label}
          </Typography>
          {item?.difficulty && (
            <Chip
              size="small"
              label={item.difficulty}
              sx={{
                height: 17,
                fontSize: '0.62rem',
                fontWeight: 700,
                bgcolor: diffBg,
                color: diffColor,
                border: `1px solid ${diffBorder}`,
              }}
            />
          )}
        </Box>

        {payload.map((entry, index) => (
          <Box key={`item-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, my: 0.3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.fill || entry.color }} />
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 500 }}>
                {entry.name}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
              {entry.value?.toLocaleString()}
            </Typography>
          </Box>
        ))}

        {item?.rate && (
          <Box sx={{ mt: 0.75, pt: 0.5, borderTop: '1px dashed #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>Pass Rate</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#059669', fontWeight: 700 }}>{item.rate}</Typography>
          </Box>
        )}
      </Box>
    );
  }
  return null;
}

export default function ProblemSubmissionsWidget({ primaryBlue = '#2563eb' }: ProblemSubmissionsWidgetProps) {
  const [viewMode, setViewMode] = useState<'problems' | 'domains'>('problems');
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const [topProblems, setTopProblems] = useState<ProblemSubmissionStat[]>([]);
  const [domainSubmissions, setDomainSubmissions] = useState<DomainSubmissionStat[]>([]);

  React.useEffect(() => {
    async function loadLiveProblemStats() {
      try {
        const [liveProblems, liveSubs] = await Promise.all([
          apiService.getProblems({ limit: 10 }).catch(() => null),
          apiService.getLiveSubmissions(100).catch(() => null),
        ]);

        const problems = liveProblems?.items || [];
        const subs = liveSubs || [];

        if (problems.length > 0) {
          const mapped: ProblemSubmissionStat[] = problems.slice(0, 5).map((p: any, idx: number) => {
            const problemSubs = subs.filter((s: any) => s.problem?.id === p.id || s.problemId === p.id);
            const total = problemSubs.length || p._count?.submissions || 0;
            const accepted = problemSubs.filter((s: any) => s.verdict === 'ACCEPTED' || s.status === 'ACCEPTED').length;
            const failed = Math.max(0, total - accepted);
            return {
              name: p.title.length > 12 ? p.title.slice(0, 10) + '..' : p.title,
              short: p.title.length > 10 ? p.title.slice(0, 8) : p.title,
              fullName: `${idx + 1}. ${p.title}`,
              difficulty: p.difficulty === 'HARD' ? 'Hard' : p.difficulty === 'MEDIUM' ? 'Medium' : 'Easy',
              accepted,
              failed,
              total,
              rate: total > 0 ? `${Math.round((accepted / total) * 100)}%` : '0%',
            };
          });
          setTopProblems(mapped);

          // Domain tagging aggregation
          const domainMap = new Map<string, { count: number; accepted: number }>();
          problems.forEach((p: any) => {
            const tags = Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ['General'];
            tags.forEach((t: string) => {
              const cur = domainMap.get(t) || { count: 0, accepted: 0 };
              cur.count += 1;
              domainMap.set(t, cur);
            });
          });

          subs.forEach((s: any) => {
            const tags = Array.isArray(s.problem?.tags) && s.problem.tags.length > 0 ? s.problem.tags : [];
            tags.forEach((t: string) => {
              const cur = domainMap.get(t);
              if (cur) {
                cur.count += 1;
                if (s.verdict === 'ACCEPTED' || s.status === 'ACCEPTED') cur.accepted += 1;
              }
            });
          });

          const colors = ['#38BDF8', '#34D399', '#A78BFA', '#FBBF24', '#F472B6'];
          const domMapped: DomainSubmissionStat[] = [];
          let colorIdx = 0;
          domainMap.forEach((val, key) => {
            domMapped.push({
              domain: key,
              short: key.length > 10 ? key.slice(0, 8) : key,
              fullName: key,
              count: val.count,
              color: colors[colorIdx % colors.length],
              rate: val.count > 0 ? `${Math.round((val.accepted / val.count) * 100)}%` : '0%',
            });
            colorIdx++;
          });
          domMapped.sort((a, b) => b.count - a.count);
          setDomainSubmissions(domMapped.slice(0, 5));
        } else {
          setTopProblems([]);
          setDomainSubmissions([]);
        }
      } catch (err) {
        console.warn('Problem submissions widget live fetch:', err);
      }
    }
    loadLiveProblemStats();
  }, []);

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadAnchorEl(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadAnchorEl(null);
  };

  const totalProblemSubmissions = topProblems.reduce((acc, curr) => acc + curr.total, 0);
  const topDomain = domainSubmissions.length > 0
    ? domainSubmissions.reduce((max, d) => (d.count > max.count ? d : max), domainSubmissions[0])
    : null;

  const downloadAsExcel = () => {
    let tableContent = '';
    if (viewMode === 'problems') {
      tableContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <table border="1">
            <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
              <th>Problem Name</th>
              <th>Difficulty</th>
              <th>Accepted</th>
              <th>Failed / TLE</th>
              <th>Total Submissions</th>
              <th>Pass Rate</th>
            </tr>
            ${topProblems.map(
              (p) => `
              <tr>
                <td>${p.fullName}</td>
                <td>${p.difficulty}</td>
                <td align="right">${p.accepted}</td>
                <td align="right">${p.failed}</td>
                <td align="right">${p.total}</td>
                <td align="right">${p.rate}</td>
              </tr>`
            ).join('')}
          </table>
        </body>
        </html>
      `;
    } else {
      tableContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"/></head>
        <body>
          <table border="1">
            <tr style="background-color: #2563EB; color: #FFFFFF; font-weight: bold;">
              <th>Domain</th>
              <th>Total Submissions</th>
              <th>Avg Pass Rate</th>
            </tr>
            ${domainSubmissions.map(
              (d) => `
              <tr>
                <td>${d.fullName}</td>
                <td align="right">${d.count}</td>
                <td align="right">${d.rate}</td>
              </tr>`
            ).join('')}
          </table>
        </body>
        </html>
      `;
    }

    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `problem_submissions_${viewMode}_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    handleCloseDownloadMenu();
  };

  const downloadAsCSV = () => {
    let csvContent = '';
    if (viewMode === 'problems') {
      const headers = ['Problem Name', 'Difficulty', 'Accepted', 'Failed', 'Total Submissions', 'Pass Rate'];
      const rows = topProblems.map((p) => [
        `"${p.fullName}"`,
        `"${p.difficulty}"`,
        p.accepted,
        p.failed,
        p.total,
        `"${p.rate}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } else {
      const headers = ['Domain', 'Total Submissions', 'Avg Pass Rate'];
      const rows = domainSubmissions.map((d) => [
        `"${d.fullName}"`,
        d.count,
        `"${d.rate}"`,
      ]);
      csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `problem_submissions_${viewMode}_${new Date().toISOString().slice(0, 10)}.csv`);
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
        bgcolor: '#3B82F6',
        backgroundImage: 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 16px 36px rgba(37, 99, 235, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.25,
              }}
            >
              Problem Submissions
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 500, color: 'rgba(255, 255, 255, 0.78)', mt: 0.2 }}>
              Verdicts & domain volume
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {/* Compact View Switcher */}
          <ButtonGroup size="small" sx={{ bgcolor: 'rgba(0, 0, 0, 0.2)', borderRadius: '9999px', p: 0.35, border: '1px solid rgba(255, 255, 255, 0.15)', flexShrink: 0 }}>
            <Button
              onClick={() => setViewMode('problems')}
              sx={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'none',
                color: viewMode === 'problems' ? '#1D4ED8' : 'rgba(255, 255, 255, 0.8)',
                bgcolor: viewMode === 'problems' ? '#FFFFFF' : 'transparent',
                borderRadius: '9999px !important',
                border: 'none !important',
                boxShadow: viewMode === 'problems' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                px: 1.3,
                py: 0.35,
                minWidth: 62,
                '&:hover': { bgcolor: viewMode === 'problems' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)' },
              }}
            >
              Problems
            </Button>
            <Button
              onClick={() => setViewMode('domains')}
              sx={{
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'none',
                color: viewMode === 'domains' ? '#1D4ED8' : 'rgba(255, 255, 255, 0.8)',
                bgcolor: viewMode === 'domains' ? '#FFFFFF' : 'transparent',
                borderRadius: '9999px !important',
                border: 'none !important',
                boxShadow: viewMode === 'domains' ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                px: 1.3,
                py: 0.35,
                minWidth: 62,
                '&:hover': { bgcolor: viewMode === 'domains' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.15)' },
              }}
            >
              Domains
            </Button>
          </ButtonGroup>

          {/* Download Excel / CSV Button */}
          <Tooltip title="Download Excel / CSV">
            <IconButton
              size="small"
              onClick={handleOpenDownloadMenu}
              sx={{
                color: '#FFFFFF',
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '9999px',
                p: 0.7,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.28)',
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
        </Box>
      </Box>

      {/* KPI Stats Strip */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
        <Box
          sx={{
            p: 1.4,
            borderRadius: '14px',
            bgcolor: 'rgba(0, 0, 0, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <Typography sx={{ fontSize: '0.67rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Top Problems Total
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.3 }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              {totalProblemSubmissions.toLocaleString()}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              runs
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.4,
            borderRadius: '14px',
            bgcolor: 'rgba(0, 0, 0, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <Typography sx={{ fontSize: '0.67rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Domain Focus
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 0.3 }}>
            <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#D4FF00', letterSpacing: '-0.02em' }}>
              {domainSubmissions.length} {domainSubmissions.length === 1 ? 'Track' : 'Tracks'}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.75)' }}>
              tracked
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Recharts Bar Graph */}
      <Box sx={{ width: '100%', height: 185 }}>
        {viewMode === 'problems' && topProblems.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0, 0, 0, 0.12)', borderRadius: '12px' }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              No problem submission activity recorded yet
            </Typography>
          </Box>
        ) : viewMode === 'domains' && domainSubmissions.length === 0 ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(0, 0, 0, 0.12)', borderRadius: '12px' }}>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              No domain tracks recorded yet
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'problems' ? (
              <BarChart data={topProblems} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" vertical={false} />
                <XAxis dataKey="short" stroke="rgba(255, 255, 255, 0.75)" fontSize={10} tickLine={false} axisLine={false} dy={4} />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.75)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                />
                <RechartsTooltip content={<ProblemBarTooltip viewMode="problems" />} />
                <Bar
                  dataKey="accepted"
                  name="Accepted"
                  fill="#D4FF00"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="failed"
                  name="Wrong / TLE"
                  fill="rgba(255, 255, 255, 0.35)"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            ) : (
              <BarChart data={domainSubmissions} margin={{ top: 10, right: 5, left: -22, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" vertical={false} />
                <XAxis dataKey="short" stroke="rgba(255, 255, 255, 0.75)" fontSize={10} tickLine={false} axisLine={false} dy={4} />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.75)"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                />
                <RechartsTooltip content={<ProblemBarTooltip viewMode="domains" />} />
                <Bar dataKey="count" name="Submissions" radius={[5, 5, 0, 0]}>
                  {domainSubmissions.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#D4FF00' : entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </Box>

      {/* Dynamic Legend & Summary Info */}
      <Box
        sx={{
          p: 1.2,
          px: 1.4,
          borderRadius: '12px',
          bgcolor: 'rgba(0, 0, 0, 0.18)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {viewMode === 'problems' ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#D4FF00' }} />
                <Typography sx={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: 600 }}>Accepted</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'rgba(255, 255, 255, 0.45)' }} />
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>Wrong / TLE</Typography>
              </Box>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpRoundedIcon sx={{ fontSize: 16, color: '#D4FF00' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: 600 }}>
                Top Domain:{' '}
                {topDomain && topDomain.count > 0 ? (
                  <strong style={{ color: '#D4FF00' }}>
                    {topDomain.domain} ({topDomain.count.toLocaleString()})
                  </strong>
                ) : (
                  <span style={{ color: 'rgba(255, 255, 255, 0.75)' }}>None</span>
                )}
              </Typography>
            </Box>
          )}
        </Box>

        <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 500 }}>
          {viewMode === 'problems' ? 'Top 5 solved challenges' : 'Ranked by student submissions'}
        </Typography>
      </Box>
    </Card>
  );
}
