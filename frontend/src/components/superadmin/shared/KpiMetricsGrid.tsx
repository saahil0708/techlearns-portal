
import { Box, Typography, Card, Chip } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

interface KpiMetricsGridProps {
  primaryBlue?: string;
}

export default function KpiMetricsGrid({ primaryBlue = '#2563eb' }: KpiMetricsGridProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 3 }}>
      {/* 1. Colleges */}
      <Card
        elevation={0}
        sx={{
          p: 2.75,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#93C5FD',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Colleges
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AccountBalanceRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'baseline', mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
            32
          </Typography>
          <Chip
            size="small"
            icon={<TrendingUpRoundedIcon sx={{ fontSize: '13px !important' }} />}
            label="+12.5%"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '5px',
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', mt: 0.5 }}>
          14,200 Undergrads
        </Typography>
      </Card>

      {/* 2. Schools */}
      <Card
        elevation={0}
        sx={{
          p: 2.75,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#D8B4FE',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(147, 51, 234, 0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Schools
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#FAF5FF',
              border: '1px solid #F3E8FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SchoolRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'baseline', mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
            26
          </Typography>
          <Chip
            size="small"
            icon={<TrendingUpRoundedIcon sx={{ fontSize: '13px !important' }} />}
            label="+18.0%"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '5px',
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', mt: 0.5 }}>
          6,450 High Schoolers
        </Typography>
      </Card>

      {/* 3. Individual Students */}
      <Card
        elevation={0}
        sx={{
          p: 2.75,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#FCD34D',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(217, 119, 6, 0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Individual Students
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#FFFBEB',
              border: '1px solid #FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'baseline', mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
            8,940
          </Typography>
          <Chip
            size="small"
            icon={<TrendingUpRoundedIcon sx={{ fontSize: '13px !important' }} />}
            label="+24.2%"
            sx={{
              bgcolor: '#ECFDF5',
              color: '#059669',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '5px',
              border: '1px solid #A7F3D0',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', mt: 0.5 }}>
          Self-Paced Learners
        </Typography>
      </Card>

      {/* 4. Submissions Today */}
      <Card
        elevation={0}
        sx={{
          p: 2.75,
          borderRadius: '16px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#6EE7B7',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.08)',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Submissions Today
          </Typography>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              bgcolor: '#ECFDF5',
              border: '1px solid #D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.25, alignItems: 'baseline', mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '2.2rem', letterSpacing: '-0.02em' }}>
            4,120
          </Typography>
          <Chip
            size="small"
            label="69.2% Acc."
            sx={{
              bgcolor: '#F1F5F9',
              color: '#334155',
              fontWeight: 600,
              fontSize: '0.72rem',
              height: 22,
              borderRadius: '5px',
              border: '1px solid #E2E8F0',
            }}
          />
        </Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 500, color: '#64748B', mt: 0.5 }}>
          38ms avg judge speed
        </Typography>
      </Card>
    </Box>
  );
}

