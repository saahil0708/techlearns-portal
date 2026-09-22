'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import { FaGithub, FaJira } from 'react-icons/fa6';
import { useToast } from '@/context/ToastContext';
import { StudentProfileData } from '@/types/student-profile';

export interface SkillOSToolItem {
  name: string;
  iconType: 'github' | 'jira' | 'ide' | 'passport' | string;
  url: string;
  badge: string;
  status: string;
  description?: string;
}

export interface SkillOSWorkspaceData {
  corporateId: string;
  corporateEmail: string;
  track: string;
  status?: string;
  passportScore?: number;
  prsMerged?: number;
  jiraPointsBurned?: number;
  tools: SkillOSToolItem[];
}

interface SkillOSDockProps {
  profile?: Partial<StudentProfileData>;
}

export const SkillOSDock: React.FC<SkillOSDockProps> = ({ profile }) => {
  const toast = useToast();
  const [data, setData] = useState<SkillOSWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/skillos/workspace')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (isMounted) {
          if (resData?.success && resData.workspace) {
            const studentHandle = profile?.handle || (profile?.email ? profile.email.split('@')[0] : 'dev');
            const studentName = profile?.name ? profile.name.toLowerCase().replace(/\s+/g, '.') : 'student';
            const dynamicEmail = `${studentName}@techlearns.corp`;
            const dynamicId = `TL-2026-DEV-${(profile?.id || '8492').toString().slice(-4).padStart(4, '0')}`;

            setData({
              ...resData.workspace,
              corporateId: profile?.id ? dynamicId : resData.workspace.corporateId,
              corporateEmail: profile?.name ? dynamicEmail : resData.workspace.corporateEmail,
            });
          }
        }
      })
      .catch((err) => {
        console.error('SkillOS fetch error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profile?.id, profile?.name, profile?.email, profile?.handle]);

  const copyToClipboard = (text: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(text);
      toast.success(`${label} copied to clipboard!`, 'Copied');
    }
  };

  const renderToolIcon = (iconType: string) => {
    switch (iconType) {
      case 'github':
        return <FaGithub size={18} color="#0F172A" />;
      case 'jira':
        return <FaJira size={18} color="#0052CC" />;
      case 'ide':
        return <TerminalRoundedIcon sx={{ fontSize: 20, color: '#2563EB' }} />;
      case 'passport':
      default:
        return <ShieldRoundedIcon sx={{ fontSize: 20, color: '#10B981' }} />;
    }
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 3,
        }}
      >
        <Skeleton variant="rounded" height={130} sx={{ borderRadius: '16px', mb: 2 }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: '12px', mb: 1 }} />
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: '12px' }} />
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        p: 3,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        position: 'relative',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 28px rgba(0, 0, 0, 0.08)',
          borderColor: '#CBD5E1',
        },
      }}
    >
      {/* Header section title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BusinessRoundedIcon sx={{ color: '#4F46E5', fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', letterSpacing: '-0.01em' }}>
            SkillOS™ Corporate Workspace
          </Typography>
        </Box>
        <Chip
          label="Provisioned"
          size="small"
          icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important', color: '#10B981 !important' }} />}
          sx={{
            bgcolor: '#ECFDF5',
            color: '#047857',
            fontWeight: 700,
            fontSize: '0.68rem',
            height: 22,
            border: '1px solid #A7F3D0',
          }}
        />
      </Box>

      {/* 1. Header Corporate Badge Card (Dark Tech/Enterprise Gradient) */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
          color: '#FFFFFF',
          borderRadius: '16px',
          mb: 2.5,
          boxShadow: '0 8px 20px rgba(15, 23, 42, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative glow */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            sx={{
              fontSize: '0.68rem',
              fontFamily: 'monospace',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#818CF8',
              textTransform: 'uppercase',
            }}
          >
            Digital Corporate ID
          </Typography>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.25,
              bgcolor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '999px',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#34D399' }} />
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#6EE7B7' }}>
              Active
            </Typography>
          </Box>
        </Box>

        {/* Corporate ID with Copy Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography
            sx={{
              fontSize: '1.2rem',
              fontWeight: 800,
              fontFamily: 'monospace',
              letterSpacing: '0.04em',
              color: '#FFFFFF',
            }}
          >
            {data.corporateId}
          </Typography>
          <Tooltip title="Copy Corporate ID" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(data.corporateId, 'Corporate ID')}
              sx={{
                color: '#94A3B8',
                p: 0.5,
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Corporate Email Alias */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'monospace' }}>
            {data.corporateEmail}
          </Typography>
          <Tooltip title="Copy Corporate Email" arrow placement="top">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(data.corporateEmail, 'Corporate Email')}
              sx={{
                color: '#94A3B8',
                p: 0.5,
                '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Track info bar */}
        <Box
          sx={{
            mt: 2,
            pt: 1.5,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#C7D2FE',
          }}
        >
          <Typography sx={{ fontSize: '0.72rem', color: '#A5B4FC', fontWeight: 600 }}>
            {data.track}
          </Typography>
        </Box>
      </Box>

      {/* 2. Corporate Tool Launch Tiles */}
      <Typography
        sx={{
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#64748B',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          mb: 1.5,
          px: 0.5,
        }}
      >
        Corporate Dev Tools & Sandboxes
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {data.tools.map((tool, idx) => {
          const isInternal = tool.url.startsWith('/');
          const content = (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.75,
                borderRadius: '14px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                textDecoration: 'none',
                '&:hover': {
                  bgcolor: '#EEF2FF',
                  borderColor: '#C7D2FE',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.08)',
                  '& .tool-arrow': {
                    color: '#4F46E5',
                    transform: 'translate(2px, -2px)',
                  },
                  '& .tool-title': {
                    color: '#4338CA',
                  },
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  {renderToolIcon(tool.iconType)}
                </Box>
                <Box>
                  <Typography
                    className="tool-title"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      color: '#0F172A',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {tool.name}
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>
                    {tool.badge}
                  </Typography>
                </Box>
              </Box>

              <OpenInNewRoundedIcon
                className="tool-arrow"
                sx={{
                  fontSize: 16,
                  color: '#94A3B8',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              />
            </Box>
          );

          if (isInternal) {
            return (
              <Link key={idx} href={tool.url} style={{ textDecoration: 'none' }}>
                {content}
              </Link>
            );
          }

          return (
            <a
              key={idx}
              href={tool.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none' }}
            >
              {content}
            </a>
          );
        })}
      </Box>
    </Card>
  );
};

export default SkillOSDock;
