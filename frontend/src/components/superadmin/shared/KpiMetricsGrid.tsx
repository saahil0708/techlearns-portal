'use client';

import { Box } from '@mui/material';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import StatsCard from '@/components/superadmin/shared/StatsCard';

interface KpiMetricsGridProps {
  primaryBlue?: string;
}

export default function KpiMetricsGrid({ primaryBlue = '#2563eb' }: KpiMetricsGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
      {/* 1. Institutes */}
      <StatsCard
        title="Institutes"
        value="32"
        icon={<AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />}
        variant="blue"
        shape="orbital"
        trendBadge={{ text: '+12.5%', type: 'positive' }}
        subtitle="14,200 Enrolled Coders"
      />

      {/* 2. Active Cohorts & Batches */}
      <StatsCard
        title="Active Batches"
        value="86"
        icon={<SchoolRoundedIcon sx={{ fontSize: 20 }} />}
        variant="black"
        shape="topography"
        trendBadge={{ text: '+18.0%', type: 'positive' }}
        subtitle="Structured Cohorts"
      />

      {/* 3. Individual Students */}
      <StatsCard
        title="Individual Students"
        value="8,940"
        icon={<PersonRoundedIcon sx={{ fontSize: 20 }} />}
        variant="blue"
        shape="hex-grid"
        trendBadge={{ text: '+24.2%', type: 'positive' }}
        subtitle="Self-Paced Learners"
      />

      {/* 4. Submissions Today */}
      <StatsCard
        title="Submissions Today"
        value="4,120"
        icon={<CodeRoundedIcon sx={{ fontSize: 20 }} />}
        variant="black"
        shape="aurora-waves"
        trendBadge={{ text: '69.2% Acc.', type: 'speed' }}
        subtitle="38ms avg judge speed"
      />
    </Box>
  );
}
