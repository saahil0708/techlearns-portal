'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import Link from 'next/link';
import { FluidArrowLeft } from '@/utils/fluid_arrow';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import MilitaryTechRoundedIcon from '@mui/icons-material/MilitaryTechRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';
import RadialDonutGauge from '@/components/superadmin/shared/RadialDonutGauge';
import { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';
import { StudentCourseItem, StudentContestItem, StudentSubmissionItem } from './types';

interface StudentHeaderStatsProps {
  student: StudentDirectoryEntity;
  submissions: StudentSubmissionItem[];
  courses: StudentCourseItem[];
  contests: StudentContestItem[];
  onDownloadExcel: () => void;
  onDownloadCSV: () => void;
}

export default function StudentHeaderStats({
  student,
  submissions,
  courses,
  contests,
  onDownloadExcel,
  onDownloadCSV,
}: StudentHeaderStatsProps) {
  const [downloadAnchorEl, setDownloadAnchorEl] = useState<null | HTMLElement>(null);
  const borderColor = '#E2E8F0';

  // Derived Student Gauge Metrics
  const parsedAccuracy = parseInt((student.accuracy || '').replace('%', ''), 10);
  const accuracyPercentage = Number.isFinite(parsedAccuracy) ? parsedAccuracy : 0;
  const accuracyBadge = !Number.isFinite(parsedAccuracy)
    ? 'No Data'
    : accuracyPercentage >= 80
      ? 'High Precision'
      : accuracyPercentage >= 60
        ? 'Moderate'
        : 'Developing';

  // Course completion derived from courses
  const hasCourses = courses && courses.length > 0;
  const completedCoursesCount = hasCourses ? courses.filter((c) => c.status === 'Completed').length : 0;
  const avgCourseProgress = hasCourses
    ? Math.round(courses.reduce((acc, c) => acc + (c.progressPct || 0), 0) / courses.length)
    : 0;
  const courseCompletionPct = hasCourses ? avgCourseProgress : 0;
  const courseBadge = hasCourses
    ? courseCompletionPct >= 80
      ? 'Ahead of Pace'
      : courseCompletionPct >= 50
        ? 'On Track'
        : 'In Progress'
    : 'No Courses';
  const courseSublabel = hasCourses
    ? `${completedCoursesCount} of ${courses.length} courses completed`
    : 'No assigned courses';

  // Practice consistency derived from streak & activity
  const hasStreakData = typeof student.streakDays === 'number' && Number.isFinite(student.streakDays);
  const streakDays = hasStreakData ? student.streakDays : 0;
  const practiceConsistencyPct = hasStreakData
    ? Math.min(100, Math.round((streakDays / 14) * 100))
    : 0;
  const consistencyBadge = hasStreakData
    ? streakDays >= 14
      ? 'Dedicated'
      : streakDays >= 5
        ? 'Active Streak'
        : streakDays > 0
          ? 'Building Habit'
          : 'Zero Streak'
    : 'No Streak';
  const consistencySublabel = hasStreakData
    ? `${streakDays} day active streak`
    : '0 day streak recorded';

  // Contest benchmark derived from contest rating / contests
  const latestContestWithRating = contests?.find((c) => typeof c.newRating === 'number' && c.newRating > 0);
  const derivedRating = (typeof student.contestRating === 'number' && student.contestRating > 0)
    ? student.contestRating
    : latestContestWithRating?.newRating;

  const hasValidRating = typeof derivedRating === 'number' && derivedRating > 0;

  const contestBenchmarkPct = hasValidRating
    ? Math.min(100, Math.max(0, Math.round((derivedRating / 2400) * 100)))
    : 0;
  const contestBadge = hasValidRating
    ? student.ratingTier || (contestBenchmarkPct >= 80 ? 'Top 15%' : 'Ranked')
    : 'Unrated';
  const contestSublabel = hasValidRating
    ? `Rating: ${derivedRating} (${student.ratingTier || 'Ranked'})`
    : 'Unrated: No valid contest rating.';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Breadcrumb & Top Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            component={Link}
            href="/superadmin/students"
            startIcon={<FluidArrowLeft size={18} />}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.84rem',
            }}
          >
            Back to Students
          </Button>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.9rem' }}>
            {student.name}
          </Typography>
          <Chip
            label={`@${student.handle}`}
            size="small"
            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FAF5FF', color: '#0B1F3A', borderRadius: '5px' }}
          />
        </Box>

        {/* Actions: Export Report */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Tooltip title="Export Student Analytics">
            <Button
              onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#475569',
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.84rem',
                px: 1.75,
                py: 0.75,
                '&:hover': { bgcolor: '#FAF5FF', color: '#0B1F3A', borderColor: '#D8B4FE' },
              }}
            >
              Export Report
            </Button>
          </Tooltip>

          <Menu
            anchorEl={downloadAnchorEl}
            open={Boolean(downloadAnchorEl)}
            onClose={() => setDownloadAnchorEl(null)}
            slotProps={{
              paper: {
                elevation: 4,
                sx: {
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  mt: 1,
                  minWidth: 210,
                  p: 0.5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08)',
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setDownloadAnchorEl(null);
                onDownloadExcel();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <TableChartRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download Excel (.xls)
              </Typography>
            </MenuItem>
            <MenuItem
              onClick={() => {
                setDownloadAnchorEl(null);
                onDownloadCSV();
              }}
              sx={{ borderRadius: '8px', py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
              </ListItemIcon>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A' }}>
                Download CSV (.csv)
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      {/* 4 Summary Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2.5 }}>
        <StatsCard
          title="Problems Solved"
          value={student.problemsSolved}
          icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="orbital"
          subtitle={
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              <Typography sx={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 700 }}>
                {student.solvedEasy}E
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>•</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#A855F7', fontWeight: 700 }}>
                {student.solvedMedium}M
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>•</Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#F87171', fontWeight: 700 }}>
                {student.solvedHard}H
              </Typography>
            </Box>
          }
        />

        <StatsCard
          title="Contest Rating"
          value={student.contestRating}
          icon={<MilitaryTechRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="topography"
          subtitle={`${student.ratingTier} • Rank #${student.globalRank}`}
        />

        <StatsCard
          title="Accuracy Rate"
          value={student.accuracy}
          icon={<CheckCircleRoundedIcon sx={{ fontSize: 20 }} />}
          variant="blue"
          shape="hex-grid"
          subtitle={`${submissions.length} Total Submissions`}
        />

        <StatsCard
          title="Active Streak"
          value={`${student.streakDays} Days`}
          icon={<WhatshotRoundedIcon sx={{ fontSize: 20 }} />}
          variant="black"
          shape="aurora-waves"
          subtitle={student.streakDays > 0 ? 'Daily practice consistency' : 'No active streak'}
        />
      </Box>

      {/* Student Competency & Execution Radial Donut Gauges */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: '#FAF5FF',
                color: '#0B1F3A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieChartRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.96rem', fontWeight: 800, color: '#0F172A' }}>
                Student Mastery & Execution Health
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                First-pass testbench accuracy, syllabus adherence, and contest readiness
              </Typography>
            </Box>
          </Box>
          <Chip
            size="small"
            label={student.ratingTier || 'Unrated'}
            sx={{
              height: 22,
              fontSize: '0.68rem',
              fontWeight: 700,
              bgcolor: '#FAF5FF',
              color: '#0B1F3A',
              border: '1px solid #F3E8FF',
              borderRadius: '6px',
            }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <RadialDonutGauge
            percentage={accuracyPercentage}
            color='#0B1F3A'
            label="First-Pass Accuracy"
            sublabel={Number.isFinite(parsedAccuracy) ? 'Accepted on first run' : 'Sample: No submissions yet'}
            badge={accuracyBadge}
          />
          <RadialDonutGauge
            percentage={courseCompletionPct}
            color="#059669"
            label="Course Completion"
            sublabel={courseSublabel}
            badge={courseBadge}
          />
          <RadialDonutGauge
            percentage={practiceConsistencyPct}
            color="#7C3AED"
            label="Practice Consistency"
            sublabel={consistencySublabel}
            badge={consistencyBadge}
          />
          <RadialDonutGauge
            percentage={contestBenchmarkPct}
            color="#D97706"
            label="Contest Benchmark"
            sublabel={contestSublabel}
            badge={contestBadge}
          />
        </Box>
      </Card>

      {/* 365-Day Activity Heatmap Matrix (GitHub / LeetCode Style) */}
      <Card
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WhatshotRoundedIcon sx={{ color: '#F97316', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
              Annual Submission Activity
            </Typography>
            <Chip
              label="648 Submissions in Past Year (Sample)"
              size="small"
              sx={{
                bgcolor: '#FAF5FF',
                color: '#0B1F3A',
                fontWeight: 700,
                fontSize: '0.72rem',
                borderRadius: '9999px',
              }}
            />
          </Box>

          {/* Heatmap Legend */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mr: 0.5 }}>Less</Typography>
            <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#BBF7D0' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#4ADE80' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#16A34A' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '2px', bgcolor: '#15803D' }} />
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', ml: 0.5 }}>More</Typography>
          </Box>
        </Box>

        {/* Scrollable Heatmap Grid */}
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box sx={{ display: 'flex', gap: '3px', minWidth: 780 }}>
            {Array.from({ length: 52 }, (_, weekIdx) => (
              <Box key={weekIdx} sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {Array.from({ length: 7 }, (_, dayIdx) => {
                  const seed = (weekIdx * 7 + dayIdx + student.problemsSolved) % 19;
                  const intensity =
                    weekIdx > 46 && dayIdx <= 4
                      ? (weekIdx + dayIdx) % 3 + 2
                      : seed === 0
                      ? 0
                      : seed < 7
                      ? 1
                      : seed < 13
                      ? 2
                      : seed < 17
                      ? 3
                      : 4;

                  const colors = ['#F1F5F9', '#BBF7D0', '#4ADE80', '#16A34A', '#15803D'];
                  const subCounts = [0, 1, 3, 6, 9];

                  return (
                    <Tooltip
                      key={dayIdx}
                      title={`Week ${weekIdx + 1}, Day ${dayIdx + 1}: ${subCounts[intensity]} submissions (Sample)`}
                      arrow
                      placement="top"
                    >
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '3px',
                          bgcolor: colors[intensity],
                          border: intensity === 0 ? '1px solid #E2E8F0' : 'none',
                          cursor: 'pointer',
                          transition: 'transform 0.1s ease',
                          '&:hover': {
                            transform: 'scale(1.25)',
                            zIndex: 2,
                          },
                        }}
                      />
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Heatmap Footer Stats */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            mt: 1,
            borderTop: '1px solid #F1F5F9',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
            Active on <strong style={{ color: '#0F172A' }}>284 of 365 days</strong> (Sample)
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
              Current Streak: <strong style={{ color: '#D97706' }}>🔥 {student.streakDays} Days</strong>
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B' }}>
              Longest Streak: <strong style={{ color: '#0B1F3A' }}>⚡ 65 Days (Sample)</strong>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
