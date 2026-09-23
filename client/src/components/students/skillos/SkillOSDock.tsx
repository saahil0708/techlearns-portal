'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  Alert,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import BuildCircleRoundedIcon from '@mui/icons-material/BuildCircleRounded';

export interface SkillOSToolItem {
  name: string;
  iconType: string;
  url: string;
  badge: string;
  status: string;
  description: string;
}

export interface SkillOSWorkspaceData {
  corporateId: string;
  corporateEmail: string;
  track: string;
  status: string;
  passportScore: number;
  prsMerged: number;
  jiraPointsBurned: number;
  tools: SkillOSToolItem[];
}

export function SkillOSDock({
  onClose,
  compact = false,
}: {
  onClose?: () => void;
  compact?: boolean;
}) {
  const [data, setData] = useState<SkillOSWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWorkspace = () => {
    setLoading(true);
    setErrorMessage(null);
    fetch('/api/skillos/workspace')
      .then(async (res) => {
        if (res.ok) {
          const resData = await res.json();
          if (resData?.success && resData.workspace) {
            setData(resData.workspace);
          } else {
            setData(null);
          }
        } else if (res.status === 404) {
          setData(null);
          setErrorMessage(null);
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrorMessage(errData.message || 'Failed to load workspace.');
          setData(null);
        }
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Network error while fetching workspace.');
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleReProvision = async () => {
    setIsProvisioning(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/skillos/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        fetchWorkspace();
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMessage(errData.message || 'Provisioning sync failed.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Provisioning request encountered an error.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const getToolIcon = (iconType: string) => {
    switch (iconType) {
      case 'github':
        return <GitHubIcon sx={{ fontSize: 22, color: '#F8FAFC' }} />;
      case 'jira':
        return <AssignmentRoundedIcon sx={{ fontSize: 22, color: '#38BDF8' }} />;
      case 'ide':
        return <TerminalIcon sx={{ fontSize: 22, color: '#818CF8' }} />;
      case 'passport':
      default:
        return <VerifiedUserRoundedIcon sx={{ fontSize: 22, color: '#34D399' }} />;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          minHeight: 180,
          bgcolor: '#0F172A',
          borderRadius: compact ? '16px' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CircularProgress size={28} sx={{ color: '#6366F1' }} />
        <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8' }}>
          Initializing SkillOS™ Environment...
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          minHeight: 200,
          bgcolor: '#0F172A',
          color: '#FFFFFF',
          borderRadius: compact ? '16px' : '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center',
        }}
      >
        {errorMessage ? (
          <>
            <Alert
              severity="error"
              sx={{
                width: '100%',
                bgcolor: 'rgba(239, 68, 68, 0.15)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '0.8rem',
              }}
            >
              {errorMessage}
            </Alert>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchWorkspace}
              startIcon={<RefreshRoundedIcon />}
              sx={{ color: '#818CF8', borderColor: '#818CF8', textTransform: 'none', borderRadius: '8px' }}
            >
              Retry
            </Button>
          </>
        ) : (
          <>
            <BuildCircleRoundedIcon sx={{ fontSize: 40, color: '#818CF8' }} />
            <Box>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800 }}>
                No SkillOS Workspace Provisioned
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mt: 0.5 }}>
                Initialize your corporate developer environment to unlock GitHub, Jira, and Cloud IDE credentials.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={handleReProvision}
              disabled={isProvisioning}
              sx={{
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 2,
              }}
            >
              {isProvisioning ? 'Provisioning...' : 'Provision SkillOS Workspace'}
            </Button>
          </>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: compact ? '16px' : '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        p: compact ? 2 : 2.5,
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Error alert banner if sync failed */}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage(null)}
          sx={{
            mb: 2,
            bgcolor: 'rgba(239, 68, 68, 0.15)',
            color: '#FCA5A5',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.75rem',
            p: '2px 8px',
          }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* 1. Header Corporate Badge Card */}
      <Box
        sx={{
          p: 2,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 50%, #172554 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeRoundedIcon sx={{ fontSize: 16, color: '#818CF8' }} />
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontFamily: 'monospace',
                fontWeight: 800,
                letterSpacing: 1.2,
                color: '#A5B4FC',
                textTransform: 'uppercase',
              }}
            >
              SkillOS™ Developer Identity
            </Typography>
          </Box>
          <Chip
            label="● Active"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.68rem',
              fontWeight: 800,
              bgcolor: 'rgba(16, 185, 129, 0.15)',
              color: '#34D399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          />
        </Box>

        <Typography
          sx={{
            fontFamily: 'monospace',
            fontWeight: 900,
            fontSize: '1.05rem',
            color: '#FFFFFF',
            letterSpacing: 0.5,
          }}
        >
          {data.corporateId}
        </Typography>

        <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8', mt: 0.3 }}>
          {data.corporateEmail}
        </Typography>

        {/* Telemetry Stats Bar */}
        <Box
          sx={{
            mt: 1.5,
            pt: 1.2,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.72rem',
            color: '#CBD5E1',
          }}
        >
          <span>Track: <strong style={{ color: '#E2E8F0' }}>{data.track}</strong></span>
          <span>Score: <strong style={{ color: '#38BDF8' }}>{data.passportScore}/100</strong></span>
        </Box>
      </Box>

      {/* 2. Corporate Tool Tiles */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
        <Typography
          sx={{
            fontSize: '0.7rem',
            fontWeight: 800,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          Corporate Tool Matrix
        </Typography>

        <Button
          size="small"
          onClick={handleReProvision}
          disabled={isProvisioning}
          startIcon={<RefreshRoundedIcon sx={{ fontSize: 14 }} />}
          sx={{
            fontSize: '0.68rem',
            color: '#818CF8',
            textTransform: 'none',
            p: 0,
            minWidth: 'auto',
            '&:hover': { bgcolor: 'transparent', color: '#A5B4FC' },
          }}
        >
          {isProvisioning ? 'Syncing...' : 'Sync'}
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: 1.2 }}>
        {data.tools.map((tool, idx) => (
          <Box
            key={idx}
            component="a"
            href={tool.url}
            target={tool.url.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            onClick={onClose}
            sx={{
              p: 1.4,
              borderRadius: '12px',
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'rgba(49, 46, 129, 0.5)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0 }}>
              <Box
                sx={{
                  p: 0.8,
                  borderRadius: '10px',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getToolIcon(tool.iconType)}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#F8FAFC',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {tool.name}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8' }}>
                  {tool.badge}
                </Typography>
              </Box>
            </Box>
            <LaunchRoundedIcon sx={{ fontSize: 15, color: '#64748B', ml: 1, flexShrink: 0 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function SkillOSDockModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            backgroundImage: 'none',
          },
        },
      }}
    >
      <SkillOSDock onClose={onClose} />
    </Dialog>
  );
}
