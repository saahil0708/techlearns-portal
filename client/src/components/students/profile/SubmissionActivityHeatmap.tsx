'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Card, Tooltip, Chip } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

export interface DayActivity {
  date: string;
  count: number;
}

interface SubmissionActivityHeatmapProps {
  activityData?: DayActivity[];
  totalSubmissions?: number;
  currentStreak?: number;
  maxStreak?: number;
  activeDaysCount?: number;
}

// Parses YYYY-MM-DD string into a local calendar Date to avoid timezone shifting
function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

// Generates 52 weeks (364 days) of sample realistic submission activity
function generateYearlyActivity(): DayActivity[] {
  const activity: DayActivity[] = [];
  const today = new Date();
  
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Deterministic realistic activity pattern with clusters
    const dayOfWeek = d.getDay();
    const dayOfMonth = d.getDate();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let count = 0;
    if ((dayOfMonth % 3 === 0 || isWeekend) && dayOfMonth % 5 !== 0) {
      count = ((i * 7 + dayOfMonth * 3) % 8) + 1;
    } else if (i < 30) {
      count = ((i * 3 + 2) % 6) + 1;
    }
    
    activity.push({ date: dateStr, count });
  }
  return activity;
}

export default function SubmissionActivityHeatmap({
  activityData,
  totalSubmissions,
  currentStreak,
  maxStreak,
  activeDaysCount,
}: SubmissionActivityHeatmapProps) {
  const days = useMemo(() => activityData ?? generateYearlyActivity(), [activityData]);

  // Derive stats from the activity array
  const derivedStats = useMemo(() => {
    let total = 0;
    let activeDays = 0;
    let maxS = 0;
    let curS = 0;
    let runningStreak = 0;

    for (let i = 0; i < days.length; i++) {
      const count = days[i].count;
      total += count;
      if (count > 0) {
        activeDays++;
        runningStreak++;
        if (runningStreak > maxS) maxS = runningStreak;
      } else {
        runningStreak = 0;
      }
    }

    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        curS++;
      } else {
        break;
      }
    }

    return { total, activeDays, maxS, curS };
  }, [days]);

  const effectiveTotalSubmissions = totalSubmissions ?? derivedStats.total;
  const effectiveCurrentStreak = currentStreak ?? derivedStats.curS;
  const effectiveMaxStreak = maxStreak ?? derivedStats.maxS;
  const effectiveActiveDays = activeDaysCount ?? derivedStats.activeDays;

  // Split into 52 weeks of 7 days
  const weeks = useMemo(() => {
    const result: DayActivity[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

  const getColor = (count: number) => {
    if (count === 0) return 'rgba(30, 41, 59, 0.85)';
    if (count <= 2) return '#065F46'; // Level 1 Emerald
    if (count <= 4) return '#059669'; // Level 2 Emerald
    if (count <= 7) return '#10B981'; // Level 3 Vibrant Green
    return '#34D399'; // Level 4 Bright Neon Green
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        bgcolor: '#0F172A',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        p: { xs: 2.5, sm: 3.5 },
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* Header & Streak Highlight */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <CalendarMonthRoundedIcon sx={{ color: '#10B981', fontSize: 22 }} />
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Submission Activity & Streak Calendar
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            {effectiveTotalSubmissions} problem submissions in the last 12 months across competitive practice and contests.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Chip
            icon={<LocalFireDepartmentRoundedIcon sx={{ color: '#FB923C !important', fontSize: 18 }} />}
            label={`${effectiveCurrentStreak} Days Streak`}
            sx={{
              bgcolor: 'rgba(124, 45, 18, 0.35)',
              color: '#FED7AA',
              fontWeight: 800,
              border: '1px solid rgba(249, 115, 22, 0.4)',
              borderRadius: '10px',
            }}
          />
          <Chip
            icon={<CheckCircleRoundedIcon sx={{ color: '#34D399 !important', fontSize: 16 }} />}
            label={`${effectiveActiveDays} Active Days`}
            sx={{
              bgcolor: 'rgba(6, 78, 59, 0.35)',
              color: '#A7F3D0',
              fontWeight: 800,
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '10px',
            }}
          />
        </Box>
      </Box>

      {/* Heatmap Matrix Container (Scrollable on small screens) */}
      <Box sx={{ overflowX: 'auto', pb: 1 }}>
        <Box sx={{ minWidth: 780 }}>
          {/* Month Labels Header */}
          <Box sx={{ display: 'flex', pl: 3.5, mb: 1, justifyContent: 'space-between', pr: 2 }}>
            {months.map((m, idx) => (
              <Typography key={idx} sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8' }}>
                {m}
              </Typography>
            ))}
          </Box>

          {/* Grid Rows: 7 Days (Mon - Sun) */}
          <Box sx={{ display: 'flex', gap: '3.5px' }}>
            {/* Day of Week Labels */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3.5px', pr: 1, justifyContent: 'space-around' }}>
              <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', fontWeight: 600 }}>Mon</Typography>
              <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', fontWeight: 600 }}>Wed</Typography>
              <Typography sx={{ fontSize: '0.66rem', color: '#94A3B8', fontWeight: 600 }}>Fri</Typography>
            </Box>

            {/* Weeks Columns */}
            {weeks.map((week, wIdx) => (
              <Box key={wIdx} sx={{ display: 'flex', flexDirection: 'column', gap: '3.5px' }}>
                {week.map((day, dIdx) => (
                  <Tooltip
                    key={dIdx}
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF' }}>
                          {day.count === 0 ? 'No submissions' : `${day.count} submissions`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: '#93C5FD' }}>
                          {parseLocalDate(day.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                    slotProps={{
                      popper: {
                        sx: {
                          '& .MuiTooltip-tooltip': {
                            bgcolor: '#0B1120',
                            border: '1px solid rgba(59, 130, 246, 0.35)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                          },
                        },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 11,
                        height: 11,
                        borderRadius: '2.5px',
                        bgcolor: getColor(day.count),
                        border: day.count === 0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.1s ease',
                        '&:hover': {
                          transform: 'scale(1.4)',
                          zIndex: 10,
                          boxShadow: day.count > 0 ? '0 0 10px rgba(52, 211, 153, 0.6)' : '0 2px 6px rgba(0,0,0,0.4)',
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
            ))}
          </Box>

          {/* Footer Legend */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
              Max continuous streak: <strong style={{ color: '#FCD34D' }}>{maxStreak} days</strong>
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>Less</Typography>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'rgba(30, 41, 59, 0.85)', border: '1px solid rgba(255,255,255,0.06)' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#065F46' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#059669' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#10B981' }} />
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#34D399' }} />
              <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8' }}>More</Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
