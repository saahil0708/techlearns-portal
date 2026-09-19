
import { Box, Typography, Card, Chip, Paper, Stack, Divider } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

export interface ContestItem {
  title: string;
  audience: string;
  startTime: string;
  participants: number;
  status: string;
  duration: string;
}

interface ContestsPanelCardProps {
  contests: ContestItem[];
  primaryBlue?: string;
}

export default function ContestsPanelCard({
  contests,
  primaryBlue = '#2563eb',
}: ContestsPanelCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '8px',
            bgcolor: '#FFFBEB',
            border: '1px solid #FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
          }}
        >
          <EmojiEventsRoundedIcon sx={{ fontSize: 19 }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
            Contest Arena
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 400, color: '#64748B' }}>
            Live & upcoming tournaments
          </Typography>
        </Box>
      </Box>

      <Stack spacing={1.75}>
        {contests.map((contest, i) => {
          const isLiveSoon = contest.status.toLowerCase().includes('live');
          return (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: isLiveSoon ? '1px solid #93C5FD' : '1px solid #E2E8F0',
                bgcolor: isLiveSoon ? '#EFF6FF' : '#F8FAFC',
                boxShadow: isLiveSoon ? '0 4px 14px rgba(37, 99, 235, 0.08)' : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: isLiveSoon ? '#3B82F6' : '#CBD5E1',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Chip
                  label={contest.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    bgcolor: isLiveSoon ? '#2563EB' : '#E2E8F0',
                    color: isLiveSoon ? '#FFFFFF' : '#475569',
                    borderRadius: '4px',
                    boxShadow: isLiveSoon ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                  }}
                />
                <Chip
                  label={contest.audience}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #DBEAFE',
                    borderRadius: '4px',
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A', mb: 1 }}>
                {contest.title}
              </Typography>
              <Divider sx={{ my: 1, borderColor: '#E2E8F0' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 500, color: '#64748B' }}>
                  {contest.startTime}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                  {contest.participants} registered
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Stack>
    </Card>
  );
}

