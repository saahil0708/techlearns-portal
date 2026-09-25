'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import AnalyticsRoundedIcon from '@mui/icons-material/AnalyticsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useAppSelector } from '@/store/hooks';
import { apiService } from '@/lib/api-service';
import { useNotifications } from '@/context/NotificationContext';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

interface InstitutionAdminNavbarProps {
  collegeName?: string;
  collegeCode?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onInviteFacultyClick?: () => void;
  onCreateBatchClick?: () => void;
}

function extractInstitutionDetails(u: any) {
  const memberships = Array.isArray(u?.memberships) ? u.memberships : [];
  return (
    memberships.find(
      (m: any) =>
        m?.role === 'INSTITUTION_ADMIN' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'FACULTY'
    ) ||
    memberships.find((m: any) => m?.institution?.name || m?.college?.name) ||
    memberships[0]
  );
}

export default function InstitutionAdminNavbar({
  collegeName,
  collegeCode,
  searchQuery = '',
  onSearchChange = () => {},
  onInviteFacultyClick,
  onCreateBatchClick,
}: InstitutionAdminNavbarProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useAppSelector((state) => state.auth.user);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Administrator';
  const primaryMembership = extractInstitutionDetails(user);

  const displayCollege =
    collegeName ||
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (user as any)?.institution ||
    'Academic Institution';

  const displayCode =
    collegeCode ||
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'CAMPUS';

  // Quick Action Menu state
  const [createAnchorEl, setCreateAnchorEl] = useState<null | HTMLElement>(null);
  const isCreateOpen = Boolean(createAnchorEl);

  // Notifications state from Global Notification Context (Persistent)
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const isNotifOpen = Boolean(notifAnchorEl);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.warn('Error marking all read:', err);
    }
  };

  const handleNotificationClick = async (id: string, actionUrl?: string) => {
    try {
      await markAsRead(id);
    } catch (err) {
      console.warn('Error marking notification read:', err);
    } finally {
      if (actionUrl) {
        setNotifAnchorEl(null);
        router.push(actionUrl);
      }
    }
  };

  const handleActionSelect = (path: string, callback?: () => void) => {
    setCreateAnchorEl(null);
    if (callback) {
      callback();
    } else {
      router.push(path);
    }
  };

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        bgcolor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        p: { xs: 2, md: '14px 24px' },
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'stretch', md: 'center' },
        justifyContent: 'space-between',
        gap: 2,
      }}
    >
      {/* 1. Left: Campus Branding & Identity */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '12px',
            bgcolor: 'rgba(30, 64, 175, 0.08)',
            color: '#1E40AF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid rgba(30, 64, 175, 0.15)',
          }}
        >
          <AccountBalanceRoundedIcon sx={{ fontSize: 24 }} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '200px', sm: '320px', md: '400px' },
              }}
            >
              {displayCollege}
            </Typography>
            <Chip
              label={displayCode}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 800,
                bgcolor: 'rgba(30, 64, 175, 0.1)',
                color: '#1E40AF',
                borderRadius: '6px',
                px: 0.5,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            <Chip
              label="INSTITUTION ADMIN / DEAN"
              size="small"
              sx={{
                height: 18,
                fontSize: '0.62rem',
                fontWeight: 800,
                bgcolor: '#FEF3C7',
                color: '#92400E',
                border: '1px solid #FDE68A',
                borderRadius: '4px',
              }}
            />
            <Typography sx={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500 }}>
              Welcome back, {firstName}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. Middle: Live Filter & Universal Search */}
      <Box sx={{ flex: 1, maxWidth: { md: 400 }, mx: { md: 2 } }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search faculty, batches, student rosters..."
          value={searchQuery}
          inputRef={searchInputRef}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 20 }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              fontSize: '0.84rem',
              transition: 'all 0.2s ease',
              '& fieldset': { borderColor: '#E2E8F0' },
              '&:hover fieldset': { borderColor: '#CBD5E1' },
              '&.Mui-focused': {
                bgcolor: '#FFFFFF',
                boxShadow: '0 0 0 3px rgba(30, 64, 175, 0.1)',
                '& fieldset': { borderColor: '#1E40AF' },
              },
            },
          }}
        />
      </Box>

      {/* 3. Right: Quick Actions & Notification Trigger */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end' }}>
        {/* Notifications Icon Button */}
        <Tooltip title="Campus Notifications">
          <IconButton
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              p: 1,
              position: 'relative',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <NotificationsNoneRoundedIcon sx={{ fontSize: 20, color: '#475569' }} />
            {unreadCount > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#EF4444',
                  border: '2px solid #FFFFFF',
                }}
              />
            )}
          </IconButton>
        </Tooltip>

        {/* Quick Action Menu Button */}
        <Button
          variant="contained"
          onClick={(e) => setCreateAnchorEl(e.currentTarget)}
          startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            bgcolor: '#1E40AF',
            color: '#FFFFFF',
            borderRadius: '10px',
            px: 2,
            py: 0.9,
            boxShadow: '0 2px 8px rgba(30, 64, 175, 0.25)',
            '&:hover': {
              bgcolor: '#1D4ED8',
              boxShadow: '0 4px 12px rgba(30, 64, 175, 0.35)',
            },
          }}
        >
          Campus Action
        </Button>

        {/* Quick Action Dropdown Menu */}
        <Menu
          anchorEl={createAnchorEl}
          open={isCreateOpen}
          onClose={() => setCreateAnchorEl(null)}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '14px',
                minWidth: 230,
                boxShadow: '0 14px 35px rgba(15, 23, 42, 0.12)',
                border: '1px solid #E2E8F0',
                p: 0.75,
                mt: 1,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => handleActionSelect('/institution-admin/faculty', onInviteFacultyClick)}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ color: '#1E40AF', minWidth: 32 }}>
              <AssignmentIndRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Invite Faculty Mentor"
            />
          </MenuItem>

          <MenuItem
            onClick={() => handleActionSelect('/institution-admin/batches', onCreateBatchClick)}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ color: '#0284C7', minWidth: 32 }}>
              <SchoolRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Create Academic Batch"
            />
          </MenuItem>

          <MenuItem
            onClick={() => handleActionSelect('/institution-admin/analytics')}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ color: '#059669', minWidth: 32 }}>
              <AnalyticsRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="View Institutional Analytics"
            />
          </MenuItem>

          <Divider sx={{ my: 0.75 }} />

          <MenuItem
            onClick={() => handleActionSelect('/institution-admin/settings')}
            sx={{ borderRadius: '10px', py: 1 }}
          >
            <ListItemIcon sx={{ color: '#64748B', minWidth: 32 }}>
              <SettingsRoundedIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              slotProps={{ primary: { sx: { fontSize: '0.84rem', fontWeight: 600 } } }}
              primary="Campus Settings"
            />
          </MenuItem>
        </Menu>

        {/* Notifications Popover */}
        <Popover
          open={isNotifOpen}
          anchorEl={notifAnchorEl}
          onClose={() => setNotifAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                width: 320,
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
                mt: 1,
                overflow: 'hidden',
              },
            },
          }}
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
              Campus Activity
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={handleMarkAllRead}
                startIcon={<DoneAllRoundedIcon sx={{ fontSize: 14 }} />}
                sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 600, color: '#1E40AF', p: 0 }}
              >
                Mark read
              </Button>
            )}
          </Box>
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center', color: '#94A3B8' }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 24, mb: 1, color: '#CBD5E1' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 500 }}>No recent notifications</Typography>
              </Box>
            ) : (
              notifications.map((n) => (
                <Box
                  key={n.id}
                  onClick={() => handleNotificationClick(n.id, n.actionUrl)}
                  sx={{
                    p: 1.5,
                    borderBottom: '1px solid #F1F5F9',
                    bgcolor: n.unread ? 'rgba(30, 64, 175, 0.04)' : 'transparent',
                    '&:hover': { bgcolor: '#F8FAFC' },
                    cursor: 'pointer',
                  }}
                >
                  <Typography sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#0F172A' }}>
                    {n.title}
                  </Typography>
                  <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.25 }}>
                    {n.desc}
                  </Typography>
                  <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.5 }}>
                    {n.time}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        </Popover>
      </Box>
    </Box>
  );
}
