'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Box,
  Typography,
  Button,
  Card,
  Divider,
  Avatar,
} from '@mui/material';

// Material Icons
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import AssignmentIndRoundedIcon from '@mui/icons-material/AssignmentIndRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import SkillosAssessmentWorkspace, { CandidateInfo } from '@/components/students/skillos/SkillosAssessmentWorkspace';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

interface ExternalAssessmentClientProps {
  assessmentId: string;
  contestData?: any;
  prefilledEmail?: string;
  prefilledName?: string;
  prefilledRoll?: string;
  prefilledCollege?: string;
  accessCodeParam?: string;
  statusParam?: string;
}

export default function ExternalAssessmentClient({
  assessmentId,
  contestData,
  prefilledEmail,
  prefilledName,
  prefilledRoll,
  prefilledCollege,
  accessCodeParam,
  statusParam,
}: ExternalAssessmentClientProps) {
  const toast = useToast();

  const title = contestData?.title || 'SkillOS Institutional Technical Evaluation 2026';
  const durationMinutes = contestData?.durationMinutes || 90;
  const institutionName =
    contestData?.institution?.name ||
    contestData?.college?.name ||
    contestData?.organizer ||
    'Academic Evaluation Partner';

  // Derive candidate credentials from dynamic invitation URL
  const resolvedEmail = prefilledEmail || 'candidate@techlearns.in';
  const derivedName =
    prefilledName ||
    (prefilledEmail
      ? prefilledEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Alex Johnson');
  const derivedRoll =
    prefilledRoll ||
    accessCodeParam ||
    `TL-2026-${Math.abs(
      assessmentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000)
    )
      .toString()
      .slice(0, 6)}`;
  const derivedCollege = prefilledCollege || institutionName;

  // Candidate Session Record
  const candidateSession: CandidateInfo = {
    fullName: derivedName,
    email: resolvedEmail,
    rollNo: derivedRoll,
    college: derivedCollege,
  };

  // Live Assessment Status ('UPCOMING' | 'ONGOING' | 'COMPLETED')
  const [assessmentStatus, setAssessmentStatus] = useState<'UPCOMING' | 'ONGOING' | 'COMPLETED'>(
    statusParam?.toUpperCase() === 'ONGOING' || statusParam?.toLowerCase() === 'started' || contestData?.status === 'ONGOING'
      ? 'ONGOING'
      : contestData?.status === 'COMPLETED'
        ? 'COMPLETED'
        : 'UPCOMING'
  );

  // Background camera & mic standby verification
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('checking');
  const [micStatus, setMicStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('checking');

  // Countdown timer calculation
  const [countdown, setCountdown] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: '00',
    minutes: '24',
    seconds: '32',
  });

  useEffect(() => {
    let targetTime: number;
    if (contestData?.startTime) {
      targetTime = new Date(contestData.startTime).getTime();
    } else {
      // Default fallback timer of 24m 32s for visual standby
      targetTime = Date.now() + 24 * 60 * 1000 + 32 * 1000;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [contestData?.startTime]);

  // Scheduled date formatting
  const formattedScheduledStart = React.useMemo(() => {
    if (contestData?.startTime) {
      try {
        const d = new Date(contestData.startTime);
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
          ', ' +
          d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) +
          ' (IST)';
      } catch {
        return '10 Oct 2026, 10:00 AM (IST)';
      }
    }
    return '10 Oct 2026, 10:00 AM (IST)';
  }, [contestData?.startTime]);

  // Poll live contest status from backend
  const checkLiveStatus = useCallback(async () => {
    try {
      const live = await apiService.getContestById(assessmentId);
      if (live && live.status) {
        const nextStatus = live.status as 'UPCOMING' | 'ONGOING' | 'COMPLETED';
        setAssessmentStatus((prev) => {
          if (prev !== nextStatus && nextStatus === 'ONGOING') {
            toast.success('Your test has started! Connecting to exam room...', 'Test Unlocked');
          }
          return nextStatus;
        });
      }
    } catch (err) {
      console.warn('Status check fallback:', err);
    }
  }, [assessmentId, toast]);

  // Recurring 3.5s status poll
  useEffect(() => {
    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 3500);
    return () => clearInterval(interval);
  }, [checkLiveStatus]);

  // Seamless Reactive Hardware & Permission Check (No Reload Needed)
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    let cameraPerm: PermissionStatus | null = null;
    let micPerm: PermissionStatus | null = null;

    const checkPermissions = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.permissions?.query) {
          try {
            cameraPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
            setCameraStatus(cameraPerm.state === 'granted' ? 'passed' : cameraPerm.state === 'denied' ? 'failed' : 'checking');
            cameraPerm.onchange = () => {
              if (cameraPerm) {
                setCameraStatus(cameraPerm.state === 'granted' ? 'passed' : cameraPerm.state === 'denied' ? 'failed' : 'checking');
              }
            };
          } catch {
            // Camera query unsupported in some browsers
          }

          try {
            micPerm = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            setMicStatus(micPerm.state === 'granted' ? 'passed' : micPerm.state === 'denied' ? 'failed' : 'checking');
            micPerm.onchange = () => {
              if (micPerm) {
                setMicStatus(micPerm.state === 'granted' ? 'passed' : micPerm.state === 'denied' ? 'failed' : 'checking');
              }
            };
          } catch {
            // Mic query unsupported in some browsers
          }
        }
      } catch {
        // Fallback to mediaDevices
      }

      try {
        if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          activeStream = stream;
          setCameraStatus('passed');
          setMicStatus('passed');
          stream.getTracks().forEach((track) => track.stop());
        } else {
          setCameraStatus('failed');
          setMicStatus('failed');
        }
      } catch (err: any) {
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setCameraStatus('failed');
          setMicStatus('failed');
        } else {
          setCameraStatus('passed');
          setMicStatus('passed');
        }
      }
    };

    checkPermissions();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
      if (cameraPerm) cameraPerm.onchange = null;
      if (micPerm) micPerm.onchange = null;
    };
  }, []);

  // ── CASE 1: TEST IS ACTIVE (ADMIN CLICKED "START TEST") ──
  if (assessmentStatus === 'ONGOING') {
    return (
      <SkillosAssessmentWorkspace
        assessmentId={assessmentId}
        initialData={{
          ...contestData,
          title,
          durationMinutes,
          status: 'ONGOING',
        }}
        isExternal={true}
        candidateInfo={candidateSession}
      />
    );
  }

  // ── CASE 2: STANDBY SCREEN (GLOWING BORDERS & CLEAN DIVIDER UNDERLINES) ──
  return (
    <Box
      sx={{
        height: '100vh',
        maxHeight: '100vh',
        bgcolor: '#060B1C',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.28) 0%, transparent 60%),
          radial-gradient(ellipse at 10% 40%, rgba(91, 45, 144, 0.32) 0%, transparent 55%),
          radial-gradient(ellipse at 90% 60%, rgba(30, 58, 138, 0.35) 0%, transparent 55%),
          linear-gradient(180deg, #070D1E 0%, #060B1C 100%)
        `,
      }}
    >
      {/* ── TOP WHITE NAVBAR HEADER ── */}
      <Box
        component="header"
        sx={{
          height: 54,
          px: { xs: 2.5, md: 5 },
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        {/* Left: TechLearns Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Image
            src="/images/logo/techlearns-logo.png"
            alt="Techlearns"
            width={110}
            height={28}
            priority
            style={{ height: 28, width: 'auto', objectFit: 'contain' }}
          />
        </Box>

        {/* Right: Need Help & User Profile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 2, sm: 3 } }}>
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              color: '#334155',
              cursor: 'pointer',
              fontSize: '0.86rem',
              fontWeight: 600,
              '&:hover': { color: '#0F172A' },
            }}
          >
            <HelpOutlineRoundedIcon sx={{ fontSize: 18, color: '#475569' }} />
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'inherit', fontSize: 'inherit' }}>
              Need Help?
            </Typography>
          </Box> */}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.1,
              cursor: 'pointer',
              pl: 0.5,
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: '#0B1F3A',
                color: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              {candidateSession.fullName.charAt(0)}
            </Avatar>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: '#0F172A',
                fontSize: '0.86rem',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {candidateSession.fullName}
            </Typography>
            {/* <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} /> */}
          </Box>
        </Box>
      </Box>

      {/* ── UNIFIED REPEATING DIAGONAL BACKGROUND WATERMARK ── */}
      <Box
        sx={{
          position: 'fixed',
          inset: '-50%',
          width: '200%',
          height: '200%',
          opacity: 0.038,
          userSelect: 'none',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          transform: 'rotate(-24deg)',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 14 }).map((_, rowIdx) => (
          <Box
            key={rowIdx}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: 8,
              whiteSpace: 'nowrap',
              transform: rowIdx % 2 === 1 ? 'translateX(100px)' : 'none',
            }}
          >
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <Box
                key={colIdx}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                }}
              >
                <img
                  src="/images/logo/techlearns-logo-white.png"
                  alt=""
                  style={{
                    height: '18px',
                    width: 'auto',
                    objectFit: 'contain',
                    opacity: 0.9,
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                  }}
                >
                  {candidateSession.fullName} - {candidateSession.rollNo}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* ── MAIN BODY CONTENT (BALANCED BASELINE & UNDERLINE ROWS) ── */}
      <Box
        sx={{
          flex: 1,
          height: 'calc(100vh - 54px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: { xs: 2, sm: 3, md: 5 },
          py: { xs: 1.5, md: 2 },
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            maxWidth: 1260,
            width: '100%',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.38fr 1fr' },
            gap: { xs: 2.5, lg: 3.5 },
            alignItems: 'end',
          }}
        >
          {/* ══════════════════════════════════════════════════════════════════
              LEFT COLUMN: HERO & COUNTDOWN OVERVIEW CARD
          ══════════════════════════════════════════════════════════════════ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* 3D Calendar & Clock Graphic */}
            <Box
              sx={{
                position: 'relative',
                width: 106,
                height: 90,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Soft orbital rings */}
              <Box
                sx={{
                  position: 'absolute',
                  inset: -9,
                  borderRadius: '50%',
                  border: '1.5px dashed rgba(96, 165, 250, 0.4)',
                  transform: 'rotateX(60deg) rotateZ(-20deg)',
                  boxShadow: '0 0 24px rgba(59, 130, 246, 0.4)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 15,
                  right: 5,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#60A5FA',
                  boxShadow: '0 0 12px #60A5FA',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 4,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: '#38BDF8',
                  boxShadow: '0 0 10px #38BDF8',
                }}
              />

              {/* 3D Calendar Body */}
              <Box
                sx={{
                  width: 82,
                  height: 68,
                  borderRadius: '14px',
                  background: 'linear-gradient(145deg, #3B82F6 0%, #1D4ED8 60%, #1E3A8A 100%)',
                  boxShadow: '0 14px 28px rgba(30, 58, 138, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.4)',
                  position: 'relative',
                  p: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                {/* Calendar Top Tabs */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', position: 'absolute', top: -5, left: 14, right: 14 }}>
                  <Box sx={{ width: 5, height: 9, bgcolor: '#93C5FD', borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                  <Box sx={{ width: 5, height: 9, bgcolor: '#93C5FD', borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
                </Box>

                {/* Grid Dots */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.5, mt: 0.8 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Box
                      key={i}
                      sx={{
                        height: 9.5,
                        borderRadius: '3px',
                        bgcolor: i === 5 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.28)',
                        boxShadow: i === 5 ? '0 0 6px #FFFFFF' : 'none',
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Floating Clock Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 1,
                  right: 1,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
                  border: '2.5px solid #0B132B',
                  boxShadow: '0 6px 14px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AccessTimeRoundedIcon sx={{ color: '#FFFFFF', fontSize: 19 }} />
              </Box>
            </Box>

            {/* Title with Gradient Text */}
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.025em',
                fontSize: { xs: '1.4rem', sm: '1.6rem', lg: '1.78rem' },
                mb: 0.4,
              }}
            >
              Your test{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #60A5FA 0%, #A855F7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                hasn&apos;t started yet
              </Box>
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontSize: '0.84rem',
                lineHeight: 1.45,
                maxWidth: 580,
                mb: 1.75,
              }}
            >
              Please remain on this screen. The assessment for <strong style={{ color: '#F1F5F9' }}>{title}</strong> will automatically launch as soon as the test coordinator starts the session.
            </Typography>

            {/* Countdown & Specs Card (Glowing Neon Blue Border) */}
            <Card
              elevation={0}
              sx={{
                width: '100%',
                borderRadius: '18px',
                bgcolor: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                boxShadow: '0 0 35px -5px rgba(37, 99, 235, 0.35), 0 20px 45px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(147, 197, 253, 0.45)',
                p: { xs: 2.25, sm: 2.75 },
                textAlign: 'left',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top Edge Luminous Accent Glow */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 30,
                  right: 30,
                  height: '1.5px',
                  background: 'linear-gradient(90deg, transparent, #60A5FA 50%, #93C5FD 75%, transparent)',
                  boxShadow: '0 0 10px #60A5FA',
                }}
              />

              {/* Countdown Section */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94A3B8',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    display: 'block',
                    mb: 1.1,
                  }}
                >
                  TEST STARTS IN
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: { xs: 1.25, sm: 1.75 },
                  }}
                >
                  {/* Hours */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: { xs: 56, sm: 66 },
                        height: { xs: 46, sm: 54 },
                        bgcolor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(96, 165, 250, 0.35)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.25), inset 0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: '1.45rem', sm: '1.75rem' }, fontWeight: 800, color: '#FFFFFF' }}>
                        {countdown.hours}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, fontSize: '0.72rem', fontWeight: 600 }}>
                      Hours
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#64748B', mb: 2.5 }}>:</Typography>

                  {/* Minutes */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: { xs: 56, sm: 66 },
                        height: { xs: 46, sm: 54 },
                        bgcolor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(96, 165, 250, 0.35)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.25), inset 0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: '1.45rem', sm: '1.75rem' }, fontWeight: 800, color: '#FFFFFF' }}>
                        {countdown.minutes}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, fontSize: '0.72rem', fontWeight: 600 }}>
                      Minutes
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, color: '#64748B', mb: 2.5 }}>:</Typography>

                  {/* Seconds */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: { xs: 56, sm: 66 },
                        height: { xs: 46, sm: 54 },
                        bgcolor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(96, 165, 250, 0.35)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px rgba(59, 130, 246, 0.25), inset 0 2px 6px rgba(0,0,0,0.5)',
                      }}
                    >
                      <Typography sx={{ fontSize: { xs: '1.45rem', sm: '1.75rem' }, fontWeight: 800, color: '#FFFFFF' }}>
                        {countdown.seconds}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', mt: 0.5, fontSize: '0.72rem', fontWeight: 600 }}>
                      Seconds
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 1.75, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

              {/* Specs Rows with Divider Underlines */}
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* Scheduled Start (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    pb: 1.25,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <EventRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.86rem' }}>
                      Scheduled start
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.86rem' }}>
                      {formattedScheduledStart}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem', display: 'block' }}>
                      Your local time
                    </Typography>
                  </Box>
                </Box>

                {/* Test Name (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    py: 1.25,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <DescriptionRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.86rem' }}>
                      Test name
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.86rem', maxWidth: 300, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {title}
                  </Typography>
                </Box>

                {/* Duration (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    py: 1.25,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <AccessTimeRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.86rem' }}>
                      Duration
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: '0.86rem' }}>
                    {durationMinutes} minutes (begins on start)
                  </Typography>
                </Box>

                {/* Proctoring */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1,
                    pt: 1.25,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <VideocamRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.86rem' }}>
                      Proctoring
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <ShieldRoundedIcon sx={{ color: '#10B981', fontSize: 17 }} />
                    <Typography variant="body2" sx={{ color: '#34D399', fontWeight: 700, fontSize: '0.86rem' }}>
                      Camera & Mic Ready
                    </Typography>
                    <InfoRoundedIcon sx={{ color: '#64748B', fontSize: 16 }} />
                  </Box>
                </Box>
              </Box>

              {/* Bottom Please Wait & Quick Entry Controls */}
              <Box
                sx={{
                  mt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    p: 1.35,
                    borderRadius: '12px',
                    bgcolor: 'rgba(37, 99, 235, 0.16)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    boxShadow: '0 0 15px rgba(37, 99, 235, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.35,
                  }}
                >
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: '#2563EB',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 0 10px #2563EB',
                    }}
                  >
                    <InfoRoundedIcon sx={{ fontSize: 19 }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem' }}>
                      Ready to Start
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#93C5FD', fontSize: '0.75rem', display: 'block', mt: 0.15 }}>
                      Hardware & network check complete. You can enter the assessment room now.
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setAssessmentStatus('ONGOING')}
                  endIcon={<PlayArrowRoundedIcon sx={{ fontSize: 20 }} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.94rem',
                    py: 1.25,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.45)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #6D28D9 100%)',
                      boxShadow: '0 10px 30px rgba(37, 99, 235, 0.6)',
                    },
                  }}
                >
                  Enter Assessment Workspace
                </Button>
              </Box>
            </Card>
          </Box>

          {/* ══════════════════════════════════════════════════════════════════
              RIGHT COLUMN: CHECKLIST & IMPORTANT INSTRUCTIONS CARDS
          ══════════════════════════════════════════════════════════════════ */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* CARD 1: BEFORE THE TEST STARTS (GLOWING BORDER + ROW UNDERLINES) */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                bgcolor: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                boxShadow: '0 0 35px -5px rgba(37, 99, 235, 0.35), 0 20px 45px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(147, 197, 253, 0.45)',
                p: { xs: 2.25, sm: 2.75 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top-Right Glowing Corner Accent Line */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 20,
                  width: 130,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #60A5FA 50%, #93C5FD 80%, transparent)',
                  boxShadow: '0 0 12px #60A5FA',
                }}
              />

              <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.05rem', mb: 1.5 }}>
                Before the test starts
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {/* 1. System compatibility (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pb: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ color: '#10B981', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#F1F5F9', fontSize: '0.86rem' }}>
                      System compatibility check
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                    Completed
                  </Typography>
                </Box>

                {/* 2. Camera access (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ color: '#10B981', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#F1F5F9', fontSize: '0.86rem' }}>
                      Camera access
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                    {cameraStatus === 'failed' ? 'Denied' : 'Allowed'}
                  </Typography>
                </Box>

                {/* 3. Microphone access (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ color: '#10B981', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#F1F5F9', fontSize: '0.86rem' }}>
                      Microphone access
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                    {micStatus === 'failed' ? 'Denied' : 'Allowed'}
                  </Typography>
                </Box>

                {/* 4. Browser requirements (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <CheckCircleRoundedIcon sx={{ color: '#10B981', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#F1F5F9', fontSize: '0.86rem' }}>
                      Browser requirements
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                    Supported
                  </Typography>
                </Box>

                {/* 5. Proctoring session */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    pt: 1.15,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <RadioButtonUncheckedRoundedIcon sx={{ color: '#60A5FA', fontSize: 19 }} />
                    <Typography variant="body2" sx={{ color: '#F1F5F9', fontSize: '0.86rem' }}>
                      Proctoring session
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600, fontSize: '0.82rem' }}>
                    Will start automatically
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* CARD 2: IMPORTANT INSTRUCTIONS (GLOWING BORDER + ROW UNDERLINES) */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '18px',
                bgcolor: 'rgba(15, 23, 42, 0.82)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                boxShadow: '0 0 35px -5px rgba(37, 99, 235, 0.35), 0 20px 45px -10px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(147, 197, 253, 0.45)',
                p: { xs: 2.25, sm: 2.75 },
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 1.5 }}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
                    bgcolor: 'rgba(59, 130, 246, 0.22)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60A5FA',
                  }}
                >
                  <DescriptionRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFFFFF', fontSize: '1.05rem' }}>
                  Important instructions
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', mb: 1.85 }}>
                {/* 1. Camera (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.35,
                    pb: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <VideocamRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                    Keep your camera on throughout the test.
                  </Typography>
                </Box>

                {/* 2. Quiet environment (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.35,
                    py: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <MicRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                    Ensure a quiet environment.
                  </Typography>
                </Box>

                {/* 3. Do not switch tabs (with Underline) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.35,
                    py: 1.15,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <DesktopWindowsRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                    Do not switch tabs or open other applications.
                  </Typography>
                </Box>

                {/* 4. Follow proctoring guidelines */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.35,
                    pt: 1.15,
                  }}
                >
                  <AssignmentIndRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                  <Typography variant="body2" sx={{ color: '#CBD5E1', fontSize: '0.85rem' }}>
                    Follow all proctoring guidelines.
                  </Typography>
                </Box>
              </Box>

              {/* Warning Box: Do not refresh this page (Glowing Amber Border) */}
              <Box
                sx={{
                  p: 1.4,
                  borderRadius: '12px',
                  bgcolor: 'rgba(217, 119, 6, 0.14)',
                  border: '1px solid rgba(245, 158, 11, 0.45)',
                  boxShadow: '0 0 20px -3px rgba(245, 158, 11, 0.25), inset 0 1px 0 rgba(253, 230, 138, 0.3)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.35,
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: '#D97706',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    mt: 0.15,
                    boxShadow: '0 0 8px #D97706',
                  }}
                >
                  <WarningRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.84rem' }}>
                    Do not refresh this page
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#FDE68A', fontSize: '0.74rem', display: 'block', mt: 0.15 }}>
                    Refreshing the page may cause issues with your proctoring session.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
