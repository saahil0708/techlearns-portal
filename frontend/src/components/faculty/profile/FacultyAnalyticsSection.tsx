'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  ButtonGroup,
  Divider,
  LinearProgress,
  Tooltip,
  Avatar,
  IconButton,
} from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { apiService } from '@/lib/api-service';
import type { FacultyBatchItem, FacultyCourseItem } from '@/data';

interface FacultyAnalyticsSectionProps {
  bio: string;
  department: string;
  specialization: string;
  officeHours: string;
  location: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  batches: FacultyBatchItem[];
  courses: FacultyCourseItem[];
  onEditBio: () => void;
  onNavigateTab: (tabIndex: number) => void;
}

// 7-day trend sample data
const TREND_DATA_7D = [
  { day: 'Mon', total: 42, accepted: 38, accuracy: 90.5 },
  { day: 'Tue', total: 68, accepted: 62, accuracy: 91.2 },
  { day: 'Wed', total: 95, accepted: 89, accuracy: 93.7 },
  { day: 'Thu', total: 112, accepted: 104, accuracy: 92.8 },
  { day: 'Fri', total: 84, accepted: 79, accuracy: 94.0 },
  { day: 'Sat', total: 145, accepted: 138, accuracy: 95.2 },
  { day: 'Sun', total: 168, accepted: 161, accuracy: 95.8 },
];

const TREND_DATA_30D = [
  { day: 'Week 1', total: 320, accepted: 298, accuracy: 93.1 },
  { day: 'Week 2', total: 480, accepted: 452, accuracy: 94.2 },
  { day: 'Week 3', total: 610, accepted: 580, accuracy: 95.1 },
  { day: 'Week 4', total: 740, accepted: 712, accuracy: 96.2 },
];

const TOPIC_DISTRIBUTION = [
  { name: 'Data Structures & Trees', value: 36, color: '#2563EB', solves: '420 solves' },
  { name: 'Dynamic Programming', value: 28, color: '#7C3AED', solves: '310 solves' },
  { name: 'Graph Algorithms', value: 20, color: '#059669', solves: '240 solves' },
  { name: 'Sorting & Arrays', value: 16, color: '#D97706', solves: '180 solves' },
];

function formatTimeAgo(dateInput?: string | Date): string {
  if (!dateInput) return 'Recently';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Recently';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays}d ago`;
}

function getValidHttpUrl(url?: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

export default function FacultyAnalyticsSection({
  bio,
  department,
  specialization,
  officeHours,
  location,
  githubUrl,
  linkedinUrl,
  websiteUrl,
  batches,
  courses,
  onEditBio,
  onNavigateTab,
}: FacultyAnalyticsSectionProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadLiveSubmissions() {
      try {
        setLoadingSubmissions(true);
        const data = await apiService.getLiveSubmissions(10);
        if (isMounted) {
          setSubmissions(Array.isArray(data) ? data : []);
        }
      } catch {
        if (isMounted) {
          setSubmissions([]);
        }
      } finally {
        if (isMounted) {
          setLoadingSubmissions(false);
        }
      }
    }
    loadLiveSubmissions();
    return () => {
      isMounted = false;
    };
  }, []);

  const chartData = timeframe === '7d' ? TREND_DATA_7D : TREND_DATA_30D;

  const researchTopics = specialization
    ? specialization.split(',').map((s) => s.trim()).filter(Boolean)
    : ['Algorithms Design', 'Data Structures', 'Competitive Coding', 'System Architecture'];

  const evaluatedSolutionsCount = submissions.length;
  const acceptedSolutionsCount = submissions.filter((s) => s.verdict === 'ACCEPTED').length;
  const calculatedPassRate = evaluatedSolutionsCount > 0
    ? ((acceptedSolutionsCount / evaluatedSolutionsCount) * 100).toFixed(1)
    : '0.0';

  const validGithubUrl = getValidHttpUrl(githubUrl);
  const validLinkedinUrl = getValidHttpUrl(linkedinUrl);
  const validWebsiteUrl = getValidHttpUrl(websiteUrl);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* ─── ROW 1: Submission Velocity Chart & Topic Mastery Donut ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>
        {/* Left Card: Cohort Submission Velocity & Accuracy Chart */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          {/* Header & Filter Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <TrendingUpRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.08rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Cohort Submissions Velocity & Accuracy
                </Typography>
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.5 }}>
                Real-time algorithmic testcase evaluations across your assigned cohorts
              </Typography>
            </Box>

            {/* Timeframe Selector Pills */}
            <ButtonGroup size="small" sx={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
              <Button
                onClick={() => setTimeframe('7d')}
                sx={{
                  bgcolor: timeframe === '7d' ? '#2563EB' : '#FFFFFF',
                  color: timeframe === '7d' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  px: 1.5,
                  '&:hover': { bgcolor: timeframe === '7d' ? '#1D4ED8' : '#F8FAFC' },
                }}
              >
                Last 7 Days
              </Button>
              <Button
                onClick={() => setTimeframe('30d')}
                sx={{
                  bgcolor: timeframe === '30d' ? '#2563EB' : '#FFFFFF',
                  color: timeframe === '30d' ? '#FFFFFF' : '#64748B',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  textTransform: 'none',
                  px: 1.5,
                  '&:hover': { bgcolor: timeframe === '30d' ? '#1D4ED8' : '#F8FAFC' },
                }}
              >
                30 Days
              </Button>
            </ButtonGroup>
          </Box>

          {/* Quick Metrics Bar */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Box sx={{ p: 1.25, px: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Recent Sample Pass Rate
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', mt: 0.25 }}>
                {evaluatedSolutionsCount > 0 ? `${calculatedPassRate}%` : 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ p: 1.25, px: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Recent Submissions Evaluated
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#2563EB', mt: 0.25 }}>
                {evaluatedSolutionsCount} <span style={{ fontSize: '0.72rem', color: '#3B82F6', fontWeight: 600 }}>submissions</span>
              </Typography>
            </Box>

            <Box sx={{ p: 1.25, px: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Active Cohorts
              </Typography>
              <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
                {batches.length} <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>batches</span>
              </Typography>
            </Box>
          </Box>

          {/* Area Chart Container */}
          <Box sx={{ width: '100%', height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '12px',
                    backgroundColor: '#0F172A',
                    border: 'none',
                    color: '#FFFFFF',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                    fontSize: '0.78rem',
                  }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Submissions"
                />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAccepted)"
                  name="Accepted Testcases"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        {/* Right Card: Curriculum Topic Mastery Donut */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PsychologyRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.08rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                Curriculum Topic Breakdown
              </Typography>
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.78rem', mb: 2 }}>
              Topic problem distribution across teaching modules
            </Typography>

            {/* Donut Chart & Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 165 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={TOPIC_DISTRIBUTION}
                    innerRadius={48}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {TOPIC_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '10px',
                      backgroundColor: '#0F172A',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.74rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Topic Legend List */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 1.5 }}>
              {TOPIC_DISTRIBUTION.map((t) => (
                <Box key={t.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.color, flexShrink: 0 }} />
                  <Typography noWrap sx={{ fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                    {t.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#0F172A', fontWeight: 800, ml: 'auto' }}>
                    {t.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Topic Solves Velocity Footer */}
          <Box sx={{ pt: 2, borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 600 }}>
              Assigned Lab Tracks
            </Typography>
            <Chip
              label={`${courses.length} Active Syllabi`}
              size="small"
              sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
        </Card>
      </Box>

      {/* ─── ROW 2: Live Evaluated Submissions Stream & Assigned Cohorts Peek ─── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '7fr 5fr' }, gap: 3 }}>
        {/* Left Card: Live Student Submissions Stream */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CodeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.08rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Live Cohort Evaluations Stream
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.74rem' }}>
                  Recent automated testcase verdicts evaluated by Docker sandbox
                </Typography>
              </Box>
            </Box>

            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13, color: '#059669 !important' }} />}
              label="Live Sandbox"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 800, fontSize: '0.68rem', height: 22 }}
            />
          </Box>

          {/* Submissions List */}
          {submissions.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {submissions.map((sub) => {
                const isAccepted = sub.verdict === 'ACCEPTED';
                const studentName = sub.user?.name || sub.userName || 'Student';
                const initials = studentName
                  .split(' ')
                  .map((p: string) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'ST';
                const problemTitle = sub.problem?.title || sub.problemTitle || 'Algorithmic Problem';
                const language = sub.language || 'C++';
                const runtime = sub.runtime ? `${sub.runtime}ms` : (sub.executionTimeMs ? `${sub.executionTimeMs}ms` : '–');
                const timeAgo = formatTimeAgo(sub.createdAt || sub.submittedAt);
                const cohortName = sub.user?.cohort || (batches[0]?.name) || 'Cohort';

                return (
                  <Box
                    key={sub.id}
                    sx={{
                      p: 1.5,
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      border: '1px solid #F1F5F9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: '#F1F5F9', borderColor: '#E2E8F0' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: isAccepted ? '#EFF6FF' : '#FEE2E2',
                          color: isAccepted ? '#2563EB' : '#DC2626',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography noWrap sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                            {studentName}
                          </Typography>
                          <Chip
                            label={cohortName}
                            size="small"
                            sx={{ height: 18, fontSize: '0.64rem', fontWeight: 700, bgcolor: '#EFF6FF', color: '#2563EB' }}
                          />
                        </Box>
                        <Typography noWrap sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.2 }}>
                          {problemTitle} • <span style={{ color: '#0F172A', fontWeight: 600 }}>{language}</span> ({runtime})
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Chip
                        icon={isAccepted ? <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> : <CancelRoundedIcon sx={{ fontSize: 13 }} />}
                        label={isAccepted ? 'Accepted' : (sub.verdict ? sub.verdict.replace(/_/g, ' ') : 'Wrong Answer')}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: isAccepted ? '#ECFDF5' : '#FEF2F2',
                          color: isAccepted ? '#059669' : '#DC2626',
                          border: `1px solid ${isAccepted ? '#A7F3D0' : '#FECACA'}`,
                        }}
                      />
                      <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.3 }}>
                        {timeAgo}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Box
              sx={{
                p: 4,
                textAlign: 'center',
                borderRadius: '14px',
                bgcolor: '#F8FAFC',
                border: '1px dashed #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 180,
              }}
            >
              <CodeRoundedIcon sx={{ fontSize: 32, color: '#94A3B8', mb: 1 }} />
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#334155' }}>
                No Live Submissions Yet
              </Typography>
              <Typography sx={{ fontSize: '0.76rem', color: '#64748B', mt: 0.5, maxWidth: 380 }}>
                Automated Docker testcase evaluations will appear here in real time as students in your cohorts submit solutions.
              </Typography>
            </Box>
          )}
        </Card>

        {/* Right Card: Assigned Cohorts Health Peek & Quick Navigation */}
        <Card
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <SchoolRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.08rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                  Assigned Cohorts Roster
                </Typography>
              </Box>

              <Button
                size="small"
                endIcon={<FluidArrowRight size={14} />}
                onClick={() => onNavigateTab(1)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.76rem',
                  color: '#2563EB',
                  p: 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                View All
              </Button>
            </Box>

            {batches.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {batches.slice(0, 3).map((batch) => {
                  const hasCapacity = batch.maxCapacity !== null && batch.maxCapacity !== undefined;
                  const maxCap = hasCapacity ? batch.maxCapacity : undefined;
                  const studentCount = batch.studentsCount || 0;
                  const capacityPct = hasCapacity && maxCap! > 0
                    ? Math.round((studentCount / maxCap!) * 100)
                    : (hasCapacity && maxCap === 0 ? 100 : 0);
                  const avgAccuracyLabel =
                    batch.avgAccuracy !== null && batch.avgAccuracy !== undefined && batch.avgAccuracy !== ''
                      ? `${batch.avgAccuracy} Avg`
                      : 'N/A';

                  return (
                    <Box
                      key={batch.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '14px',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #F1F5F9',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                            {batch.name}
                          </Typography>
                          <Chip
                            label={batch.code}
                            size="small"
                            sx={{ height: 18, fontSize: '0.64rem', fontWeight: 700, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', color: '#64748B' }}
                          />
                        </Box>
                        <Chip
                          label={avgAccuracyLabel}
                          size="small"
                          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 800, bgcolor: '#ECFDF5', color: '#059669' }}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography sx={{ fontSize: '0.72rem', color: '#64748B' }}>
                          Enrollment: <strong style={{ color: '#0F172A' }}>{studentCount}</strong>
                          {hasCapacity && ` / ${maxCap}`}
                        </Typography>
                        {hasCapacity && (
                          <Typography sx={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 700 }}>
                            {capacityPct}%
                          </Typography>
                        )}
                      </Box>
                      {hasCapacity && (
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, capacityPct)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#E2E8F0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
                            },
                          }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  borderRadius: '14px',
                  bgcolor: '#F8FAFC',
                  border: '1px dashed #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 140,
                }}
              >
                <SchoolRoundedIcon sx={{ fontSize: 28, color: '#94A3B8', mb: 0.5 }} />
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155' }}>
                  No Cohorts Assigned
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.25 }}>
                  You have not been assigned to any student batches yet.
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => onNavigateTab(1)}
            startIcon={<SchoolRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              mt: 2,
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              borderColor: '#E2E8F0',
              color: '#334155',
              py: 0.9,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            Manage Assigned Cohorts
          </Button>
        </Card>
      </Box>

      {/* ─── ROW 3: Academic Biography, Credentials & Contact ─── */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                bgcolor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BusinessRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
              Academic Biography & Research Focus
            </Typography>
          </Box>

          <Button
            size="small"
            startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onEditBio}
            sx={{
              color: '#2563EB',
              bgcolor: '#EFF6FF',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 1.5,
              '&:hover': { bgcolor: '#DBEAFE' },
            }}
          >
            Edit Bio
          </Button>
        </Box>

        <Typography sx={{ fontSize: '0.9rem', color: bio ? '#475569' : '#94A3B8', fontStyle: bio ? 'normal' : 'italic', lineHeight: 1.7, mb: 3 }}>
          {bio || 'Not provided. Click Edit Bio to describe your academic curriculum, teaching domains, and research publications.'}
        </Typography>

        <Divider sx={{ my: 2.5, borderColor: '#F1F5F9' }} />

        {/* Specialization & Research Focus Chips */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
            Specialization & Lab Domains
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {researchTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Meta Attributes Row: Office Hours, Location & Socials */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#2563EB' }}>
              <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Office Hours
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
              {officeHours || 'Mon, Wed, Fri (14:00 - 16:00)'}
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#059669' }}>
              <BusinessRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Campus Office
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
              {location || 'Room 304, CS Dept Block'}
            </Typography>
          </Box>

          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, color: '#7C3AED' }}>
              <ShieldRoundedIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                Academic Profiles
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {validGithubUrl && (
                <IconButton
                  size="small"
                  href={validGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#0F172A', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <GitHubIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
              {validLinkedinUrl && (
                <IconButton
                  size="small"
                  href={validLinkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#0A66C2', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <LinkedInIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
              {validWebsiteUrl && (
                <IconButton
                  size="small"
                  href={validWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ color: '#2563EB', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}
                >
                  <LanguageRoundedIcon sx={{ fontSize: 15 }} />
                </IconButton>
              )}
              {!validGithubUrl && !validLinkedinUrl && !validWebsiteUrl && (
                <Typography sx={{ fontSize: '0.8rem', color: '#94A3B8', fontStyle: 'italic' }}>
                  No external links provided
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
