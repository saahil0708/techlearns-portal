'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Tooltip,
  Avatar,
  IconButton,
} from '@mui/material';

// Material Rounded Icons
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import WorkOutlineRoundedIcon from '@mui/icons-material/WorkOutlineRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import LaptopMacOutlinedIcon from '@mui/icons-material/LaptopMacOutlined';
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import LogoutConfirmModal from '@/components/shared/LogoutConfirmModal';

// Complete Techlearns SkillOS Options
const STUDENT_NAV_ITEMS = [
  // Capability
  { label: 'Dashboard', icon: <GridViewRoundedIcon sx={{ fontSize: 20 }} />, path: '/students/profile' },
  { label: 'Role Skill Graph', icon: <AccountTreeOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/skill-graph' },
  { label: 'Learning Hub', icon: <MenuBookRoundedIcon sx={{ fontSize: 19 }} />, path: '/courses' },
  { label: 'Problems', icon: <CodeRoundedIcon sx={{ fontSize: 20 }} />, path: '/problems' },
  { label: 'Practice Engine', icon: <TerminalRoundedIcon sx={{ fontSize: 20 }} />, path: '/practice' },

  // Build & Prove
  { label: 'Project Workspace', icon: <LaptopMacOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/projects' },
  { label: 'Corporate Simulation', icon: <DomainOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/simulations' },
  { label: 'Bootcamps', icon: <TimerOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/bootcamps' },
  { label: 'Competitions', icon: <EmojiEventsRoundedIcon sx={{ fontSize: 19 }} />, path: '/contests' },
  { label: 'Interview Prep', icon: <DescriptionOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/interview-prep' },

  // Opportunity
  { label: 'Career Hub', icon: <WorkOutlineRoundedIcon sx={{ fontSize: 19 }} />, path: '/students/career-hub' },
  { label: 'Jobs / Placements', icon: <LocationOnOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/placements' },
  { label: 'Certifications', icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/certifications' },
  { label: 'Skill Passport', icon: <BadgeOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/skill-passport' },

  // Support
  { label: 'AI Learning Coach', icon: <AutoAwesomeOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/ai-coach' },
  { label: 'Blogs', icon: <ArticleOutlinedIcon sx={{ fontSize: 19 }} />, path: '/students/blogs' },
  { label: 'Settings', icon: <SettingsRoundedIcon sx={{ fontSize: 19 }} />, path: '/students/settings' },
];

// Module-level scroll cache to preserve scroll offset across client route transitions seamlessly
let cachedSidebarScrollTop = 0;

export default function StudentSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);

  const user = useAppSelector((state) => state.auth.user);
  const displayName = user?.name || 'Student';
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollUp(el.scrollTop > 8);
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
    }
  };

  const handleContainerScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      cachedSidebarScrollTop = el.scrollTop;
      try {
        sessionStorage.setItem('student_sidebar_scroll', String(el.scrollTop));
      } catch {}
      checkScroll();
    }
  };

  // Restore scroll position on mount & when pathname changes, keeping active item in view
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      let restoredTop = cachedSidebarScrollTop;
      try {
        const saved = sessionStorage.getItem('student_sidebar_scroll');
        if (saved !== null) {
          const parsed = parseInt(saved, 10);
          if (!isNaN(parsed) && parsed > 0) {
            restoredTop = parsed;
          }
        }
      } catch {}

      if (restoredTop > 0) {
        el.scrollTop = restoredTop;
      }

      // Ensure active item is always visible within the capsule viewport
      const activeEl = el.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }

      checkScroll();
    }
  }, [pathname]);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const handleScrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 140, behavior: 'smooth' });
    }
  };

  const handleScrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -140, behavior: 'smooth' });
    }
  };

  const handleConfirmLogout = async () => {
    setLogoutDialogOpen(false);
    await dispatch(logoutUser());
    router.push('/login');
  };

  const isItemActive = (itemPath: string) => {
    if (itemPath === '/students/profile') {
      return pathname === '/students' || pathname === '/students/profile' || pathname.startsWith('/students/profile');
    }
    return pathname === itemPath || (itemPath !== '/' && pathname.startsWith(itemPath));
  };

  return (
    <>
      <Box
        component="aside"
        aria-label="Student Capsule Navigation"
        sx={{
          position: 'fixed',
          left: { xs: 12, sm: 18, md: 24 },
          top: 0,
          height: '100vh',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 1.25, md: 1.75 },
          zIndex: 1200,
          width: 58,
          py: 1.5,
        }}
      >
        {/* 1. Dedicated Top Logo Capsule */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '9999px',
            p: '6px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 58,
            height: 58,
            flexShrink: 0,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: '0 12px 28px rgba(37, 99, 235, 0.18)',
            },
          }}
        >
          <Tooltip title="Techlearns SkillOS" placement="right" arrow>
            <Link
              href="/students/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '9999px',
                  bgcolor: '#2563EB',
                  background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                }}
              >
                <CodeRoundedIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
              </Box>
            </Link>
          </Tooltip>
        </Box>

        {/* 2. Expanded Middle Capsule - Clean, Hidden Scrollbar, More Icons Visible */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '9999px',
            p: '6px 5px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: 58,
            height: 'calc(100vh - 180px)',
            maxHeight: '600px',
            minHeight: '380px',
            position: 'relative',
            flexShrink: 1,
          }}
        >
          {/* Top Scroll Indicator */}
          {canScrollUp && (
            <Box
              onClick={handleScrollUp}
              sx={{
                position: 'absolute',
                top: 3,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
                animation: 'bounceUp 1.4s infinite',
                '@keyframes bounceUp': {
                  '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
                  '50%': { transform: 'translateX(-50%) translateY(-2px)' },
                },
              }}
            >
              <KeyboardArrowUpRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          )}

          {/* Scrollable Icon Track - Hidden Scrollbar */}
          <Box
            ref={scrollContainerRef}
            onScroll={handleContainerScroll}
            sx={{
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              py: canScrollUp ? 2 : 0.5,
              pb: canScrollDown ? 2 : 0.5,
              // Completely hide scrollbars across all browsers
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
                width: 0,
                height: 0,
              },
            }}
          >
            {STUDENT_NAV_ITEMS.map((item) => {
              const active = isItemActive(item.path);

              return (
                <Tooltip key={item.label} title={item.label} placement="right" arrow>
                  <Link
                    href={item.path}
                    scroll={false}
                    data-active={active ? 'true' : 'false'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: active ? '#2563EB' : 'transparent',
                        color: active ? '#FFFFFF' : '#64748B',
                        boxShadow: active ? '0 4px 14px rgba(37, 99, 235, 0.3)' : 'none',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        flexShrink: 0,
                        '&:hover': {
                          bgcolor: active ? '#2563EB' : '#F1F5F9',
                          color: active ? '#FFFFFF' : '#0F172A',
                          transform: 'scale(1.06)',
                        },
                      }}
                    >
                      {item.icon}
                    </Box>
                  </Link>
                </Tooltip>
              );
            })}
          </Box>

          {/* Bottom Scroll Indicator */}
          {canScrollDown && (
            <Box
              onClick={handleScrollDown}
              sx={{
                position: 'absolute',
                bottom: 3,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                borderRadius: '50%',
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
                animation: 'bounceDown 1.4s infinite',
                '@keyframes bounceDown': {
                  '0%, 100%': { transform: 'translateX(-50%) translateY(0)' },
                  '50%': { transform: 'translateX(-50%) translateY(2px)' },
                },
              }}
            >
              <KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          )}
        </Box>

        {/* 3. Bottom Avatar & Logout Capsule */}
        <Box
          sx={{
            bgcolor: '#FFFFFF',
            borderRadius: '9999px',
            p: '6px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            width: 58,
            flexShrink: 0,
          }}
        >
          <Tooltip title={`${displayName} (My Profile)`} placement="right" arrow>
            <Link href="/students/profile" style={{ textDecoration: 'none' }} aria-label="My Profile">
              <Avatar
                src={(user as any)?.avatarUrl}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: '#3B82F6',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: '2px solid #DBEAFE',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: 'scale(1.08)' },
                }}
              >
                <span suppressHydrationWarning>{initials}</span>
              </Avatar>
            </Link>
          </Tooltip>

          <Tooltip title="Sign Out" placement="right" arrow>
            <IconButton
              size="small"
              onClick={() => setLogoutDialogOpen(true)}
              sx={{
                width: 36,
                height: 36,
                color: '#EF4444',
                bgcolor: '#FEF2F2',
                borderRadius: '50%',
                '&:hover': {
                  bgcolor: 'rgba(239, 68, 68, 0.2)',
                  color: '#DC2626',
                  transform: 'scale(1.08)',
                },
              }}
            >
              <LogoutRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
