
import { Box, Typography, Card, Chip, Stack, IconButton } from '@mui/material';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

export interface NotificationSignal {
  id: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  borderColor: string;
  title: string;
  description: string;
  timeAgo?: string;
}

const NOTIFICATION_SIGNALS: NotificationSignal[] = [
  {
    id: 'sig_1',
    tag: 'Renewal',
    tagBg: '#FEF2F2',
    tagColor: '#DC2626',
    borderColor: '#EF4444',
    title: 'Geeta Engineering College expires in 208 days at 94% seat usage',
    description: 'Your highest-usage account. Their HoD asked about the Placement release twice; a proposal now closes this before the budget cycle.',
    timeAgo: '2h ago',
  },
  {
    id: 'sig_2',
    tag: 'Onboarding',
    tagBg: '#FFFBEB',
    tagColor: '#D97706',
    borderColor: '#F59E0B',
    title: 'Delhi Polytechnic (pilot) has imported 0 students after 12 days',
    description: 'Pilots that import within 14 days reach 70% activation; after that it falls to 35%. Send faculty reminder walkthrough.',
    timeAgo: '5h ago',
  },
  {
    id: 'sig_3',
    tag: 'Content',
    tagBg: '#EFF6FF',
    tagColor: '#2563EB',
    borderColor: '#3B82F6',
    title: 'Problem library is 14 intermediate problems short of the 40/40/20 mix',
    description: 'DP and Graphs are the thinnest topics across every college. 9 problems are waiting in review queue for 2+ days.',
    timeAgo: '1d ago',
  },
];

interface ImportantNotificationsCardProps {
  primaryBlue?: string;
}

export default function ImportantNotificationsCard({
  primaryBlue = '#2563eb',
}: ImportantNotificationsCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.25, sm: 2.75 },
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        bgcolor: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#DC2626',
              flexShrink: 0,
            }}
          >
            <NotificationsActiveRoundedIcon sx={{ fontSize: 19 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Important Notifications
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 400, color: '#64748B' }}>
              Actionable insights & account signals
            </Typography>
          </Box>
        </Box>

        <Chip
          size="small"
          label="3 Action Items"
          sx={{
            height: 22,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            px: 0.5,
          }}
        />
      </Box>

      {/* Notifications Stack */}
      <Stack spacing={1.5}>
        {NOTIFICATION_SIGNALS.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1.75,
              borderRadius: '12px',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderLeft: `4px solid ${item.borderColor}`,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              '&:hover': {
                borderColor: '#CBD5E1',
                borderLeftColor: item.borderColor,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Chip
                size="small"
                label={item.tag}
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: item.tagBg,
                  color: item.tagColor,
                  border: 'none',
                  borderRadius: '5px',
                  px: 0.25,
                  mt: 0.1,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  lineHeight: 1.35,
                  letterSpacing: '-0.01em',
                }}
              >
                {item.title}
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 400,
                color: '#475569',
                lineHeight: 1.45,
                pl: 0.25,
              }}
            >
              {item.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
