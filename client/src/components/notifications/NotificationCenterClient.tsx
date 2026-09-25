'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Checkbox,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';

// Icons
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';

import StudentAppLayout from '@/components/students/layout/StudentAppLayout';
import SendNotificationModal from '@/components/shared/SendNotificationModal';
import { useNotifications, type AppNotification } from '@/context/NotificationContext';
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/context/ToastContext';

const CATEGORY_MAP: Record<
  string,
  { label: string; color: string; bg: string; border: string; icon: React.ReactElement }
> = {
  contests: {
    label: 'Contest / Arena',
    color: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    icon: <EmojiEventsRoundedIcon sx={{ fontSize: 14 }} />,
  },
  submissions: {
    label: 'Verdict / Evaluation',
    color: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
  },
  courses: {
    label: 'Course / Module',
    color: '#0284C7',
    bg: '#F0F9FF',
    border: '#BAE6FD',
    icon: <MenuBookRoundedIcon sx={{ fontSize: 14 }} />,
  },
  cel: {
    label: 'Proof of Skill / CEL',
    color: '#9333EA',
    bg: '#FAF5FF',
    border: '#E9D5FF',
    icon: <VerifiedRoundedIcon sx={{ fontSize: 14 }} />,
  },
  system: {
    label: 'System Alert',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    icon: <InfoRoundedIcon sx={{ fontSize: 14 }} />,
  },
};

/**
 * Format timestamps into human-readable relative time with live updates
 */
export function formatRelativeTime(timestamp: number | string): string {
  const ts = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp;
  if (!ts || isNaN(ts)) return 'Just now';

  const now = new Date();
  const notifDate = new Date(ts);
  const diffSec = Math.floor((now.getTime() - ts) / 1000);
  if (diffSec < 20) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
  const isYesterday = ts >= startOfYesterday && ts < startOfToday;

  if (isYesterday) {
    return `Yesterday at ${notifDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return notifDate.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== notifDate.getFullYear() ? 'numeric' : undefined,
  });
}

function sanitizeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export default function NotificationCenterClient() {
  const router = useRouter();
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.user);

  const {
    notifications,
    unreadCount,
    permissionStatus,
    requestPushPermission,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    refreshNotifications,
  } = useNotifications();

  // Tick state to keep relative timestamps dynamic & fresh in real time
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((n) => n + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isStaffOrAdmin =
    user?.globalRole === 'SUPER_ADMIN' ||
    user?.globalRole === 'PLATFORM_ADMIN' ||
    user?.globalRole === 'INSTITUTION_ADMIN' ||
    user?.globalRole === 'FACULTY';

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (unreadOnly && !item.unread) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesDesc = item.desc?.toLowerCase().includes(q);
        const matchesBadge = item.badge?.toLowerCase().includes(q);
        const matchesCat = item.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesBadge && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, selectedCategory, unreadOnly, searchQuery]);

  // Paginated Rows
  const paginatedNotifications = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredNotifications.slice(start, start + rowsPerPage);
  }, [filteredNotifications, page, rowsPerPage]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      total: notifications.length,
      unread: notifications.filter((n) => n.unread).length,
      contests: notifications.filter((n) => n.category === 'contests').length,
      submissions: notifications.filter((n) => n.category === 'submissions').length,
      system: notifications.filter((n) => n.category === 'system').length,
    };
  }, [notifications]);

  // Clamp page to valid range whenever filteredNotifications or rowsPerPage changes
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredNotifications.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [filteredNotifications.length, rowsPerPage, page]);

  // Synchronize selectedIds with existing notifications
  useEffect(() => {
    const validIds = new Set(notifications.map((n) => n.id));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [notifications]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginatedNotifications.map((n) => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkMarkRead = async () => {
    const ids = [...selectedIds];
    setSelectedIds([]);
    await Promise.all(ids.map((id) => markAsRead(id)));
    toast.success(`Marked ${ids.length} notification(s) as read.`, 'Updated');
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    setSelectedIds([]);
    await Promise.all(ids.map((id) => deleteNotification(id)));
    toast.info(`Removed ${ids.length} notification(s).`, 'Deleted');
  };

  const handleDeleteSingle = async (id: string) => {
    setDeletingId(id);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    try {
      await deleteNotification(id);
      toast.info('Notification removed from ledger.', 'Deleted');
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirmClearAll = async () => {
    setClearConfirmOpen(false);
    setSelectedIds([]);
    await clearAll();
  };

  const handleExportCsv = () => {
    if (filteredNotifications.length === 0) {
      toast.error('No notifications available to export.', 'Export Empty');
      return;
    }

    const headers = ['ID', 'Title', 'Message', 'Category', 'Status', 'Timestamp', 'Action URL'];
    const rows = filteredNotifications.map((n) => [
      sanitizeCsv(n.id),
      sanitizeCsv(n.title),
      sanitizeCsv(n.desc),
      sanitizeCsv(n.category),
      sanitizeCsv(n.unread ? 'UNREAD' : 'READ'),
      sanitizeCsv(new Date(n.timestamp).toISOString()),
      sanitizeCsv(n.actionUrl || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `notifications_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Notification ledger exported to CSV.', 'Exported');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshNotifications();
    setTimeout(() => setIsRefreshing(false), 400);
    toast.info('Notification ledger refreshed.', 'Refreshed');
  };

  return (
    <StudentAppLayout>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pb: 4 }}>
        {/* Header Hero Banner */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2.5,
            p: { xs: 2.5, md: 3.25 },
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #090D1A 0%, #0F172A 55%, #1E293B 100%)',
            color: '#FFFFFF',
            boxShadow: '0 16px 40px -10px rgba(15, 23, 42, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.25, zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 56,
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                flexShrink: 0,
              }}
            >
              <NotificationsActiveRoundedIcon sx={{ fontSize: 28, color: '#FFFFFF' }} />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: '1.3rem', md: '1.55rem' },
                    letterSpacing: '-0.025em',
                    color: '#FFFFFF',
                  }}
                >
                  Notification Center
                </Typography>
                {unreadCount > 0 ? (
                  <Chip
                    label={`${unreadCount} Unread`}
                    size="small"
                    sx={{
                      bgcolor: '#EF4444',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      height: 24,
                      px: 0.5,
                      boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      bgcolor: 'rgba(22, 163, 74, 0.15)',
                      border: '1px solid rgba(74, 222, 128, 0.35)',
                      borderRadius: '20px',
                      px: 1.25,
                      py: 0.4,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: '#4ADE80',
                        boxShadow: '0 0 8px #4ADE80',
                      }}
                    />
                    <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ADE80' }}>
                      All Caught Up
                    </Typography>
                  </Box>
                )}
              </Box>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.84rem', mt: 0.5, fontWeight: 500 }}>
                Live ledger of broadcast alerts, contest invitations, evaluation verdicts, and platform dispatches.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', zIndex: 1 }}>
            <Tooltip title="Refresh ledger from server" arrow>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  p: 1.1,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.18)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
              onClick={handleExportCsv}
              sx={{
                color: '#FFFFFF',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                bgcolor: 'rgba(255, 255, 255, 0.06)',
                backdropFilter: 'blur(8px)',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: '12px',
                px: 2,
                py: 0.85,
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#FFFFFF',
                  bgcolor: 'rgba(255, 255, 255, 0.14)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Export CSV
            </Button>

            {isStaffOrAdmin && (
              <Button
                variant="contained"
                size="small"
                startIcon={<CampaignRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setSendModalOpen(true)}
                sx={{
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  borderRadius: '12px',
                  px: 2.25,
                  py: 0.85,
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.55)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Broadcast Alert
              </Button>
            )}
          </Box>
        </Box>

        {/* Web Push Prompt Bar if permission not granted */}
        {permissionStatus !== 'granted' && permissionStatus !== 'unsupported' && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              p: 2,
              px: 2.5,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #F0F9FF 100%)',
              border: '1px solid #BFDBFE',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)',
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: '#DBEAFE',
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)',
                }}
              >
                <NotificationsActiveRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E40AF' }}>
                  Stay updated with instant contest alerts and code verdicts
                </Typography>
                <Typography sx={{ fontSize: '0.76rem', color: '#3B82F6', fontWeight: 500 }}>
                  Enable desktop push alerts to receive live notifications even when CodePlatform is in the background.
                </Typography>
              </Box>
            </Box>
            {permissionStatus === 'denied' ? (
              <Box
                sx={{
                  bgcolor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: '10px',
                  px: 2,
                  py: 0.85,
                }}
              >
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>
                  Notifications blocked in browser. Enable in site permissions.
                </Typography>
              </Box>
            ) : (
              <Button
                size="small"
                variant="contained"
                onClick={requestPushPermission}
                sx={{
                  bgcolor: '#2563EB',
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  px: 2.25,
                  py: 0.8,
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Enable Push Alerts
              </Button>
            )}
          </Box>
        )}

        {/* Stats Strip */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
            gap: 2,
          }}
        >
          {[
            {
              label: 'Total In Ledger',
              val: stats.total,
              color: '#0F172A',
              bg: '#FFFFFF',
              border: '#E2E8F0',
              borderTop: '#3B82F6',
              labelColor: '#64748B',
              bgIcon: '#EFF6FF',
              iconColor: '#2563EB',
              icon: <NotificationsActiveRoundedIcon sx={{ fontSize: 20 }} />,
            },
            {
              label: 'Unread Alerts',
              val: stats.unread,
              color: stats.unread > 0 ? '#E11D48' : '#16A34A',
              bg: stats.unread > 0 ? '#FFF1F2' : '#F0FDF4',
              border: stats.unread > 0 ? '#FECDD3' : '#BBF7D0',
              borderTop: stats.unread > 0 ? '#EF4444' : '#22C55E',
              labelColor: stats.unread > 0 ? '#BE123C' : '#15803D',
              bgIcon: stats.unread > 0 ? '#FFE4E6' : '#DCFCE7',
              iconColor: stats.unread > 0 ? '#E11D48' : '#16A34A',
              icon: <InfoRoundedIcon sx={{ fontSize: 20 }} />,
            },
            {
              label: 'Contest / Arena',
              val: stats.contests,
              color: '#D97706',
              bg: '#FEFCE8',
              border: '#FEF08A',
              borderTop: '#F59E0B',
              labelColor: '#B45309',
              bgIcon: '#FEF9C3',
              iconColor: '#D97706',
              icon: <EmojiEventsRoundedIcon sx={{ fontSize: 20 }} />,
            },
            {
              label: 'Verdicts / Solves',
              val: stats.submissions,
              color: '#16A34A',
              bg: '#F0FDF4',
              border: '#BBF7D0',
              borderTop: '#10B981',
              labelColor: '#15803D',
              bgIcon: '#DCFCE7',
              iconColor: '#16A34A',
              icon: <CheckCircleRoundedIcon sx={{ fontSize: 20 }} />,
            },
          ].map((s, idx) => (
            <Card
              key={idx}
              sx={{
                p: 2.25,
                borderRadius: '18px',
                bgcolor: s.bg,
                border: `1px solid ${s.border}`,
                borderTop: `3px solid ${s.borderTop}`,
                boxShadow: '0 4px 16px rgba(15, 23, 42, 0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.08)',
                },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: s.labelColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {s.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '1.65rem',
                    fontWeight: 800,
                    color: s.color,
                    lineHeight: 1.2,
                    mt: 0.4,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {s.val}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  bgcolor: s.bgIcon,
                  color: s.iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 4px 12px ${s.bgIcon}`,
                }}
              >
                {s.icon}
              </Box>
            </Card>
          ))}
        </Box>

        {/* Filter Toolbar Card */}
        <Card
          sx={{
            p: 2.25,
            borderRadius: '18px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search notifications by title, details, category, or sender..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <ClearRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
              sx={{
                maxWidth: { md: 480 },
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.86rem',
                  border: '1px solid #E2E8F0',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    bgcolor: '#FFFFFF',
                  },
                  '&.Mui-focused': {
                    borderColor: '#2563EB',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.12)',
                  },
                },
              }}
            />

            {/* Actions Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
              <Button
                size="small"
                variant={unreadOnly ? 'contained' : 'outlined'}
                onClick={() => {
                  setUnreadOnly((prev) => !prev);
                  setPage(0);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  bgcolor: unreadOnly ? '#2563EB' : '#FFFFFF',
                  color: unreadOnly ? '#FFFFFF' : '#475569',
                  borderColor: unreadOnly ? '#2563EB' : '#CBD5E1',
                  px: 1.75,
                  py: 0.75,
                  boxShadow: unreadOnly ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: unreadOnly ? '#1D4ED8' : '#F1F5F9',
                    borderColor: unreadOnly ? '#1D4ED8' : '#94A3B8',
                  },
                }}
              >
                {unreadOnly ? 'Showing Unread' : 'Filter Unread'}
              </Button>

              <Button
                size="small"
                variant="outlined"
                startIcon={<DoneAllRoundedIcon sx={{ fontSize: 17 }} />}
                onClick={markAllAsRead}
                disabled={stats.unread === 0}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  color: '#16A34A',
                  borderColor: '#BBF7D0',
                  bgcolor: '#FFFFFF',
                  px: 1.75,
                  py: 0.75,
                  transition: 'all 0.2s ease',
                  '&:hover': { borderColor: '#16A34A', bgcolor: '#F0FDF4' },
                }}
              >
                Mark All Read
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />}
                onClick={() => setClearConfirmOpen(true)}
                disabled={notifications.length === 0}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  borderRadius: '10px',
                  px: 1.75,
                  py: 0.75,
                  bgcolor: '#FFFFFF',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#FEF2F2', borderColor: '#DC2626' },
                }}
              >
                Clear All
              </Button>
            </Box>
          </Box>

          {/* Category Filter Chips */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', pb: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B', mr: 0.5 }}>
              <FilterListRoundedIcon sx={{ fontSize: 16 }} />
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                CATEGORY:
              </Typography>
            </Box>

            {[
              { key: 'all', label: 'All Categories', count: notifications.length },
              { key: 'system', label: 'System Alert', count: notifications.filter((n) => n.category === 'system').length },
              { key: 'contests', label: 'Contests', count: notifications.filter((n) => n.category === 'contests').length },
              { key: 'submissions', label: 'Verdicts', count: notifications.filter((n) => n.category === 'submissions').length },
              { key: 'courses', label: 'Courses', count: notifications.filter((n) => n.category === 'courses').length },
              { key: 'cel', label: 'CEL / Proof', count: notifications.filter((n) => n.category === 'cel').length },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
                <Chip
                  key={cat.key}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <span>{cat.label}</span>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: 0.65,
                          py: 0.1,
                          borderRadius: '10px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: isSelected ? 'rgba(255, 255, 255, 0.2)' : '#E2E8F0',
                          color: isSelected ? '#FFFFFF' : '#475569',
                        }}
                      >
                        {cat.count}
                      </Box>
                    </Box>
                  }
                  size="small"
                  onClick={() => {
                    setSelectedCategory(cat.key);
                    setPage(0);
                  }}
                  sx={{
                    height: 32,
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    bgcolor: isSelected ? '#0F172A' : '#F8FAFC',
                    color: isSelected ? '#FFFFFF' : '#475569',
                    border: isSelected ? '1px solid #0F172A' : '1px solid #E2E8F0',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(15, 23, 42, 0.15)' : 'none',
                    '&:hover': {
                      bgcolor: isSelected ? '#1E293B' : '#F1F5F9',
                      transform: 'translateY(-1px)',
                    },
                  }}
                />
              );
            })}
          </Box>
        </Card>

        {/* Bulk Selection Actions Strip (when rows selected) */}
        {selectedIds.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '14px',
              p: 1.5,
              px: 2.5,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.08)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.86rem', color: '#1E40AF' }}>
                {selectedIds.length} notification(s) selected
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleBulkMarkRead}
                sx={{
                  bgcolor: '#2563EB',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Mark Selected Read
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={handleBulkDelete}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'none',
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#FEF2F2' },
                }}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        )}

        {/* Structured List Table Format (AGENTS.md Rule 10) */}
        <Card
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 4px 24px rgba(15, 23, 42, 0.04)',
            overflow: 'hidden',
          }}
        >
          {isRefreshing && <LinearProgress sx={{ height: 3 }} />}
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ pl: 2.75 }}>
                    <Checkbox
                      size="small"
                      checked={
                        paginatedNotifications.length > 0 &&
                        paginatedNotifications.every((n) => selectedIds.includes(n.id))
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        !paginatedNotifications.every((n) => selectedIds.includes(n.id))
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Category
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Title & Details
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Origin / Sender
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Timestamp
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', pr: 2.75 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedNotifications.length > 0 ? (
                  paginatedNotifications.map((notif) => {
                    const catMeta = CATEGORY_MAP[notif.category] || CATEGORY_MAP.system;
                    const isSelected = selectedIds.includes(notif.id);
                    const formattedTime = formatRelativeTime(notif.timestamp);
                    const exactDate = new Date(notif.timestamp).toLocaleString();

                    return (
                      <TableRow
                        key={notif.id}
                        hover
                        sx={{
                          bgcolor: notif.unread ? 'rgba(239, 246, 255, 0.4)' : '#FFFFFF',
                          transition: 'background-color 0.15s ease',
                          borderLeft: notif.unread ? '3px solid #2563EB' : '3px solid transparent',
                          '&:hover': {
                            bgcolor: notif.unread ? '#EFF6FF' : '#F8FAFC',
                          },
                        }}
                      >
                        {/* Checkbox */}
                        <TableCell padding="checkbox" sx={{ pl: 2.75 }}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(notif.id, e.target.checked)}
                          />
                        </TableCell>

                        {/* Status (Unread Dot / Read Check) */}
                        <TableCell sx={{ py: 1.85 }}>
                          <Tooltip title={notif.unread ? 'Unread Notification' : 'Read Notification'} arrow>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                              {notif.unread ? (
                                <Box
                                  sx={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 0.6,
                                    bgcolor: '#DBEAFE',
                                    color: '#1D4ED8',
                                    border: '1px solid #93C5FD',
                                    borderRadius: '6px',
                                    px: 0.9,
                                    py: 0.25,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      borderRadius: '50%',
                                      bgcolor: '#2563EB',
                                    }}
                                  />
                                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800 }}>
                                    NEW
                                  </Typography>
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8' }}>
                                  <CheckCircleRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                                    READ
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Tooltip>
                        </TableCell>

                        {/* Category Chip */}
                        <TableCell sx={{ py: 1.85 }}>
                          <Chip
                            icon={catMeta.icon}
                            label={catMeta.label}
                            size="small"
                            sx={{
                              height: 26,
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              bgcolor: catMeta.bg,
                              color: catMeta.color,
                              borderRadius: '8px',
                              border: `1px solid ${catMeta.border}`,
                              '& .MuiChip-icon': {
                                color: catMeta.color,
                                ml: 0.5,
                              },
                            }}
                          />
                        </TableCell>

                        {/* Title & Description */}
                        <TableCell sx={{ py: 1.85, maxWidth: 420 }}>
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: notif.unread ? 800 : 600,
                                color: '#0F172A',
                                fontSize: '0.88rem',
                                lineHeight: 1.35,
                              }}
                            >
                              {notif.title}
                            </Typography>
                            <Typography
                              sx={{
                                color: '#64748B',
                                fontSize: '0.78rem',
                                mt: 0.4,
                                lineHeight: 1.45,
                              }}
                            >
                              {notif.desc}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Origin / Sender Badge */}
                        <TableCell sx={{ py: 1.85 }}>
                          <Chip
                            label={notif.badge || 'SUPER ADMIN'}
                            size="small"
                            sx={{
                              height: 24,
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              bgcolor: '#F1F5F9',
                              color: '#334155',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              letterSpacing: '0.02em',
                            }}
                          />
                        </TableCell>

                        {/* Dynamic Timestamp */}
                        <TableCell sx={{ py: 1.85 }}>
                          <Tooltip title={exactDate} arrow>
                            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, cursor: 'default' }}>
                              <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                                {formattedTime}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right" sx={{ py: 1.85, pr: 2.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                            {notif.actionUrl && (
                              <Tooltip title="Go to Destination URL" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    markAsRead(notif.id);
                                    router.push(notif.actionUrl!);
                                  }}
                                  sx={{
                                    bgcolor: '#EFF6FF',
                                    color: '#2563EB',
                                    border: '1px solid #DBEAFE',
                                    borderRadius: '8px',
                                    p: 0.75,
                                    transition: 'all 0.15s ease',
                                    '&:hover': { bgcolor: '#DBEAFE', transform: 'scale(1.05)' },
                                  }}
                                >
                                  <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            {notif.unread && (
                              <Tooltip title="Mark as Read" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => markAsRead(notif.id)}
                                  sx={{
                                    bgcolor: '#F8FAFC',
                                    color: '#475569',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '8px',
                                    p: 0.75,
                                    transition: 'all 0.15s ease',
                                    '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A', transform: 'scale(1.05)' },
                                  }}
                                >
                                  <MarkEmailReadRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Tooltip>
                            )}

                            <Tooltip title="Delete notification" arrow>
                              <IconButton
                                size="small"
                                disabled={deletingId === notif.id}
                                onClick={() => handleDeleteSingle(notif.id)}
                                sx={{
                                  bgcolor: '#FEF2F2',
                                  color: '#DC2626',
                                  border: '1px solid #FEE2E2',
                                  borderRadius: '8px',
                                  p: 0.75,
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: '#FEE2E2', transform: 'scale(1.05)' },
                                }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ py: 9, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            bgcolor: '#F1F5F9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#94A3B8',
                          }}
                        >
                          <NotificationsOffOutlinedIcon sx={{ fontSize: 30 }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, color: '#1E293B', fontSize: '1.05rem', mt: 0.5 }}>
                          No notifications found
                        </Typography>
                        <Typography sx={{ color: '#64748B', fontSize: '0.84rem', maxWidth: 420 }}>
                          {searchQuery || selectedCategory !== 'all' || unreadOnly
                            ? 'No notifications match your current search or category filter criteria.'
                            : 'All caught up! You have no alerts or broadcast messages in your ledger.'}
                        </Typography>
                        {(searchQuery || selectedCategory !== 'all' || unreadOnly) && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('all');
                              setUnreadOnly(false);
                            }}
                            sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}
                          >
                            Reset Filters
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredNotifications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
            }}
          />
        </Card>

        {/* Clear All Confirmation Dialog */}
        <Dialog
          open={clearConfirmOpen}
          onClose={() => setClearConfirmOpen(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: { borderRadius: '20px', p: 1 },
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>
            Clear Notification Ledger?
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: '0.86rem', color: '#64748B' }}>
              Are you sure you want to dismiss all notifications? This action will permanently remove all alerts from your ledger.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setClearConfirmOpen(false)}
              sx={{ textTransform: 'none', fontWeight: 700, color: '#64748B', borderRadius: '10px' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmClearAll}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '10px', boxShadow: 'none' }}
            >
              Clear All
            </Button>
          </DialogActions>
        </Dialog>

        {/* Send Notification Modal (Faculty / Super Admin) */}
        {isStaffOrAdmin && (
          <SendNotificationModal
            open={sendModalOpen}
            onClose={() => setSendModalOpen(false)}
            onSuccess={() => {
              refreshNotifications();
            }}
          />
        )}
      </Box>
    </StudentAppLayout>
  );
}
