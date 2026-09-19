'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import { getRatingTier } from '@/utils/codechefRating';

export interface RatingDataPoint {
  contestCode: string;
  contestName: string;
  date: string;
  rating: number;
  delta: number;
  rank: number;
}

interface RatingHistoryChartProps {
  currentRating?: number;
  highestRating?: number;
  globalRank?: number;
  data?: RatingDataPoint[];
}

const DEFAULT_RATING_HISTORY: RatingDataPoint[] = [
  { contestCode: 'START180', contestName: 'CodeChef Starters 180 (Div 4)', date: 'Jan 2026', rating: 1320, delta: 0, rank: 412 },
  { contestCode: 'START185', contestName: 'CodeChef Starters 185 (Div 4)', date: 'Feb 2026', rating: 1410, delta: 90, rank: 180 },
  { contestCode: 'COOK130', contestName: 'CodeChef Cook-Off 130 (Div 3)', date: 'Mar 2026', rating: 1495, delta: 85, rank: 145 },
  { contestCode: 'START192', contestName: 'CodeChef Starters 192 (Div 3)', date: 'Apr 2026', rating: 1580, delta: 85, rank: 98 },
  { contestCode: 'LUNCH98', contestName: 'CodeChef Lunchtime 98 (Div 3)', date: 'May 2026', rating: 1640, delta: 60, rank: 74 },
  { contestCode: 'START200', contestName: 'CodeChef Starters 200 (Div 2)', date: 'Jun 2026', rating: 1610, delta: -30, rank: 210 },
  { contestCode: 'START215', contestName: 'CodeChef Starters 215 (Div 2)', date: 'Jul 2026', rating: 1720, delta: 110, rank: 45 },
  { contestCode: 'COOK135', contestName: 'CodeChef Cook-Off 135 (Div 2)', date: 'Aug 2026', rating: 1790, delta: 70, rank: 32 },
  { contestCode: 'START256', contestName: 'CodeChef Starters 256 (Div 2)', date: 'Sep 2026', rating: 1850, delta: 60, rank: 18 },
];

export default function RatingHistoryChart({
  currentRating,
  highestRating,
  globalRank = 142,
  data,
}: RatingHistoryChartProps) {
  const [filterRange, setFilterRange] = useState<'ALL' | '6M' | '1Y'>('ALL');

  const historyData = data ?? DEFAULT_RATING_HISTORY;

  // Derive rating values from the matching historyData source
  const effectiveCurrentRating = currentRating ?? (historyData.length > 0 ? historyData[historyData.length - 1].rating : 1500);
  const effectiveHighestRating = highestRating ?? (historyData.length > 0 ? Math.max(...historyData.map((d) => d.rating)) : effectiveCurrentRating);

  const filteredData = React.useMemo(() => {
    if (!historyData || historyData.length === 0) return [];
    if (filterRange === 'ALL') return historyData;

    const now = new Date();
    const cutoffMonths = filterRange === '6M' ? 6 : 12;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - cutoffMonths, now.getDate());

    const filtered = historyData.filter((d) => {
      const parsed = new Date(d.date);
      if (isNaN(parsed.getTime())) return true;
      return parsed >= cutoffDate;
    });

    return filtered.length > 0 ? filtered : historyData;
  }, [historyData, filterRange]);

  const currentTier = getRatingTier(effectiveCurrentRating);
  const highestTier = getRatingTier(effectiveHighestRating);

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
        gap: 3,
      }}
    >
      {/* Top Header & Summary Stats */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <TrendingUpRoundedIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
            <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Contest Rating Progression
            </Typography>
          </Box>
          <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>
            Historical rating changes across official rated contests and competitive divisions.
          </Typography>
        </Box>

        <ToggleButtonGroup
          size="small"
          value={filterRange}
          exclusive
          onChange={(_, val) => val && setFilterRange(val)}
          sx={{
            bgcolor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            p: '2px',
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.76rem',
              px: 1.5,
              py: 0.4,
              color: '#94A3B8',
              '&.Mui-selected': {
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.4)',
                '&:hover': { bgcolor: '#1D4ED8' },
              },
            },
          }}
        >
          <ToggleButton value="6M">6 Months</ToggleButton>
          <ToggleButton value="1Y">1 Year</ToggleButton>
          <ToggleButton value="ALL">All Time</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Metrics Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Current Rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: currentTier.color }}>
              {effectiveCurrentRating}
            </Typography>
            <Chip
              label={currentTier.starString}
              size="small"
              sx={{ bgcolor: currentTier.bgColor, color: currentTier.color, fontWeight: 900, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Highest Rating
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF' }}>
              {effectiveHighestRating}
            </Typography>
            <Chip
              label={highestTier.division}
              size="small"
              sx={{ bgcolor: 'rgba(37, 99, 235, 0.2)', color: '#60A5FA', border: '1px solid rgba(59, 130, 246, 0.3)', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
            />
          </Box>
        </Box>

        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Global Standing
          </Typography>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#38BDF8', mt: 0.5 }}>
            #{globalRank}
          </Typography>
        </Box>

        <Box sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Contests Attended
          </Typography>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', mt: 0.5 }}>
            {historyData.length}
          </Typography>
        </Box>
      </Box>

      {/* Recharts Rating Line Graph with Division Bands */}
      <Box sx={{ width: '100%', height: 320, pt: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" vertical={false} />

            {/* Division Threshold Reference Lines */}
            <ReferenceLine y={1400} stroke="#16A34A" strokeDasharray="3 3" label={{ value: 'Div 3 (1400)', position: 'insideTopRight', fill: '#4ADE80', fontSize: 10, fontWeight: 700 }} />
            <ReferenceLine y={1600} stroke="#2563EB" strokeDasharray="3 3" label={{ value: 'Div 2 (1600)', position: 'insideTopRight', fill: '#60A5FA', fontSize: 10, fontWeight: 700 }} />
            <ReferenceLine y={2000} stroke="#D97706" strokeDasharray="3 3" label={{ value: 'Div 1 (2000)', position: 'insideTopRight', fill: '#FCD34D', fontSize: 10, fontWeight: 700 }} />

            <XAxis
              dataKey="date"
              stroke="#94A3B8"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: 'rgba(59, 130, 246, 0.2)' }}
            />
            <YAxis
              domain={['dataMin - 100', 'dataMax + 100']}
              stroke="#94A3B8"
              fontSize={11}
              fontWeight={600}
              tickLine={false}
              axisLine={{ stroke: 'rgba(59, 130, 246, 0.2)' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="#38BDF8"
              strokeWidth={3}
              dot={{ fill: '#38BDF8', stroke: '#0F172A', strokeWidth: 2, r: 5 }}
              activeDot={{ fill: '#60A5FA', stroke: '#FFFFFF', strokeWidth: 3, r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data: RatingDataPoint = payload[0].payload;
  const tier = getRatingTier(data.rating);

  return (
    <Box
      sx={{
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        p: 2,
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        minWidth: 200,
      }}
    >
      <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#93C5FD', mb: 0.5 }}>
        {data.contestName}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mb: 1 }}>
        {data.date} • Code: {data.contestCode}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Rating:</Typography>
        <Typography sx={{ fontSize: '0.86rem', fontWeight: 800, color: tier.color }}>
          {data.rating} ({tier.starString})
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Rating Change:</Typography>
        <Typography
          sx={{
            fontSize: '0.82rem',
            fontWeight: 800,
            color: data.delta >= 0 ? '#4ADE80' : '#F87171',
          }}
        >
          {data.delta >= 0 ? `+${data.delta}` : data.delta}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '0.78rem', color: '#CBD5E1' }}>Contest Rank:</Typography>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#FCD34D' }}>
          #{data.rank}
        </Typography>
      </Box>
    </Box>
  );
}
