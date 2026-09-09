'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import { StudentCertification } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

const MODAL_THEMES: Record<string, {
  badgeGradient: string;
  glowColor: string;
  starColor: string;
  subTitleColor: string;
  accent: string;
}> = {
  'C++': {
    badgeGradient: 'linear-gradient(145deg, #0F2A66 0%, #1D4ED8 50%, #3B82F6 100%)',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    starColor: '#FBBF24',
    subTitleColor: '#DBEAFE',
    accent: '#2563EB',
  },
  'Python': {
    badgeGradient: 'linear-gradient(145deg, #075985 0%, #0284C7 45%, #EAB308 100%)',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    starColor: '#F59E0B',
    subTitleColor: '#FEF08A',
    accent: '#0284C7',
  },
  'DSA': {
    badgeGradient: 'linear-gradient(145deg, #4C1D95 0%, #7C3AED 50%, #10B981 100%)',
    glowColor: 'rgba(124, 58, 237, 0.25)',
    starColor: '#FBBF24',
    subTitleColor: '#EDE9FE',
    accent: '#7C3AED',
  },
};

const DEFAULT_MODAL_THEME = {
  badgeGradient: 'linear-gradient(145deg, #1E293B 0%, #334155 50%, #475569 100%)',
  glowColor: 'rgba(51, 65, 85, 0.2)',
  starColor: '#FBBF24',
  subTitleColor: '#CBD5E1',
  accent: '#2563EB',
};

interface ViewCertificateModalProps {
  open: boolean;
  cert: StudentCertification | null;
  studentName: string;
  onClose: () => void;
}

export default function ViewCertificateModal({
  open,
  cert,
  studentName,
  onClose,
}: ViewCertificateModalProps) {
  const toast = useToast();

  if (!cert) return null;

  const theme = MODAL_THEMES[cert.badgeCode] || DEFAULT_MODAL_THEME;

  const handleCopyId = () => {
    navigator.clipboard.writeText(cert.credentialId);
    toast.success(`Credential ID copied: ${cert.credentialId}`, 'Copied to Clipboard');
  };

  const handleDownload = () => {
    toast.success(`Downloading ${cert.title} Certificate PDF...`, 'Certificate Exported');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/verify/${cert.credentialId}`;
      navigator.clipboard.writeText(shareUrl);
      toast.success(`Verification link copied to clipboard: ${shareUrl}`, 'Share Link');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: 1,
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', pt: 2, px: 3, pb: 1 }}>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: '#94A3B8',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
              Verified Platform Certificate
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              CodePlatform Assessment Credential
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ px: 3, py: 1 }}>
        {/* Certificate Display Card */}
        <Box
          sx={{
            p: 3,
            borderRadius: '20px',
            bgcolor: '#FAFAFC',
            border: '1.5px solid #E2E8F0',
            textAlign: 'center',
            position: 'relative',
            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Top verified badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.75,
              py: 0.6,
              borderRadius: '9999px',
              bgcolor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#059669',
              fontSize: '0.76rem',
              fontWeight: 800,
              mb: 2.5,
              boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1)',
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 16 }} /> Verified Credential
          </Box>

          {/* 3D Shield Badge in Modal */}
          <Box
            sx={{
              width: 90,
              height: 98,
              mx: 'auto',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
              filter: `drop-shadow(0 8px 18px ${theme.glowColor})`,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: theme.badgeGradient,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                inset: '3px',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.2) 100%)',
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
            />
            <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography
                sx={{
                  fontSize: '1.25rem',
                  fontWeight: 900,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                  textShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
                }}
              >
                {cert.badgeCode}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  color: theme.subTitleColor,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  mt: 0.2,
                }}
              >
                {cert.language}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.25, mt: 0.4 }}>
                {Array.from({ length: cert.stars || 3 }).map((_, i) => (
                  <StarRoundedIcon key={i} sx={{ fontSize: 14, color: theme.starColor }} />
                ))}
              </Box>
            </Box>
          </Box>

          <Typography sx={{ fontSize: '0.76rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>
            Certificate of Accomplishment
          </Typography>

          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mt: 0.75, mb: 0.75, fontSize: '1.25rem' }}>
            {cert.title}
          </Typography>

          <Typography sx={{ fontSize: '0.86rem', color: '#475569', mb: 2, lineHeight: 1.5, maxWidth: 440, mx: 'auto' }}>
            Awarded to <strong>{studentName}</strong> for demonstrating verified competency in {cert.language} programming and algorithmic mastery.
          </Typography>

          {/* Skills Assessed */}
          {cert.skills && cert.skills.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.75, mb: 2.5 }}>
              {cert.skills.map((skill, idx) => (
                <Chip
                  key={idx}
                  label={skill}
                  size="small"
                  sx={{
                    bgcolor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                  }}
                />
              ))}
            </Box>
          )}

          {/* Credential Details Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              p: 2,
              bgcolor: '#FFFFFF',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              textAlign: 'left',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em' }}>
                ISSUED BY
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', mt: 0.25 }}>
                {cert.issuer || 'CodePlatform Academy'}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em' }}>
                ISSUE DATE
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', mt: 0.25 }}>
                {cert.issueDate}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 2', pt: 1, borderTop: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.04em' }}>
                CREDENTIAL ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.25 }}>
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 800, fontFamily: 'monospace', color: '#2563EB' }}>
                  {cert.credentialId}
                </Typography>
                <Tooltip title="Copy Credential ID" arrow>
                  <IconButton size="small" onClick={handleCopyId} sx={{ p: 0.5, color: '#64748B', '&:hover': { color: '#2563EB' } }}>
                    <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, px: 3, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={handleShare}
          startIcon={<ShareRoundedIcon />}
          sx={{
            borderRadius: '12px',
            borderColor: '#CBD5E1',
            color: '#475569',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.84rem',
            px: 2,
            '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
          }}
        >
          Share
        </Button>
        <Button
          variant="contained"
          onClick={handleDownload}
          startIcon={<DownloadRoundedIcon />}
          sx={{
            bgcolor: '#2563EB',
            borderRadius: '12px',
            fontWeight: 800,
            textTransform: 'none',
            fontSize: '0.84rem',
            px: 2.5,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
}
