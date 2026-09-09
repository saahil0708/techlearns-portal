
import { Box, Typography, Card, Button, Paper, Stack, Chip } from '@mui/material';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import Link from 'next/link';

interface QuickActionsCardProps {
  primaryBlue?: string;
  onActionClick?: (actionKey: string) => void;
}

const ACTION_ITEMS = [
  {
    key: 'create_problem',
    title: 'Create New Problem',
    subtitle: 'Author statement, test cases & code templates',
    icon: AddCircleOutlineRoundedIcon,
    iconColor: '#059669',
    iconBg: '#ECFDF5',
    iconBorder: '#A7F3D0',
    badge: 'IDE Studio',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    href: '/problems',
  },
  {
    key: 'schedule_contest',
    title: 'Schedule Contest Arena',
    subtitle: 'Configure timers, problem pools & rankings',
    icon: EmojiEventsRoundedIcon,
    iconColor: '#D97706',
    iconBg: '#FFFBEB',
    iconBorder: '#FDE68A',
    badge: 'Tournaments',
    badgeColor: '#D97706',
    badgeBg: '#FFFBEB',
    href: '/contests',
  },
  {
    key: 'onboard_college',
    title: 'Onboard College / School',
    subtitle: 'Provision new tenant org and faculty seats',
    icon: AccountBalanceRoundedIcon,
    iconColor: '#2563EB',
    iconBg: '#EFF6FF',
    iconBorder: '#DBEAFE',
    badge: 'Multi-Tenant',
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
    href: '/colleges',
  },
  {
    key: 'import_roster',
    title: 'Import Student Roster',
    subtitle: 'Bulk CSV cohort upload with auth credentials',
    icon: GroupAddRoundedIcon,
    iconColor: '#7C3AED',
    iconBg: '#FAF5FF',
    iconBorder: '#DDD6FE',
    badge: 'Batches',
    badgeColor: '#7C3AED',
    badgeBg: '#FAF5FF',
    href: '/colleges',
  },
];

export default function QuickActionsCard({
  primaryBlue = '#2563eb',
  onActionClick,
}: QuickActionsCardProps) {
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
        gap: 2.25,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '9px',
              bgcolor: '#FAF5FF',
              border: '1px solid #DDD6FE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#7C3AED',
              flexShrink: 0,
            }}
          >
            <BoltRoundedIcon sx={{ fontSize: 21 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Important Actions
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', fontWeight: 400, color: '#64748B' }}>
              Quick administrative operations
            </Typography>
          </Box>
        </Box>

        <Chip
          size="small"
          icon={<CheckCircleRoundedIcon sx={{ fontSize: '12px !important', color: '#059669 !important' }} />}
          label="Judge Live"
          sx={{
            height: 22,
            fontSize: '0.68rem',
            fontWeight: 700,
            bgcolor: '#ECFDF5',
            color: '#059669',
            border: '1px solid #A7F3D0',
            borderRadius: '6px',
            px: 0.5,
          }}
        />
      </Box>

      {/* Action Items List */}
      <Stack spacing={1.25}>
        {ACTION_ITEMS.map((action) => {
          const IconComp = action.icon;
          return (
            <Paper
              key={action.key}
              component={Link}
              href={action.href}
              elevation={0}
              onClick={() => onActionClick && onActionClick(action.key)}
              sx={{
                p: 1.5,
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                bgcolor: '#FFFFFF',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#F8FAFC',
                  borderColor: '#CBD5E1',
                  transform: 'translateY(-1.5px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  '& .action-chevron': {
                    color: '#2563EB',
                    transform: 'translateX(3px)',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    bgcolor: action.iconBg,
                    border: `1px solid ${action.iconBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: action.iconColor,
                    flexShrink: 0,
                  }}
                >
                  <IconComp sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '0.86rem',
                        fontWeight: 700,
                        color: '#0F172A',
                        lineHeight: 1.25,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 400,
                      color: '#64748B',
                      mt: 0.25,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {action.subtitle}
                  </Typography>
                </Box>
              </Box>

              <ChevronRightRoundedIcon
                className="action-chevron"
                sx={{
                  fontSize: 18,
                  color: '#94A3B8',
                  flexShrink: 0,
                  ml: 1,
                  transition: 'all 0.2s ease',
                }}
              />
            </Paper>
          );
        })}
      </Stack>

      {/* Footer System Status Strip */}
      <Box
        sx={{
          p: 1.25,
          px: 1.5,
          borderRadius: '10px',
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#10B981',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
            }}
          />
          <Typography sx={{ fontSize: '0.72rem', color: '#475569', fontWeight: 600 }}>
            Sandbox Execution Cluster
          </Typography>
        </Box>
        <Typography sx={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
          12ms Latency
        </Typography>
      </Box>
    </Card>
  );
}
