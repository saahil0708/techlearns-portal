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
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import { StudentCertification } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';

const MODAL_THEMES: Record<
  string,
  {
    badgeGradient: string;
    glowColor: string;
    starColor: string;
    subTitleColor: string;
    accent: string;
    borderHighlight: string;
  }
> = {
  'C++': {
    badgeGradient: 'linear-gradient(145deg, #0F2A66 0%, #1D4ED8 50%, #3B82F6 100%)',
    glowColor: 'rgba(37, 99, 235, 0.35)',
    starColor: '#FBBF24',
    subTitleColor: '#DBEAFE',
    accent: '#2563EB',
    borderHighlight: 'rgba(59, 130, 246, 0.3)',
  },
  'Python': {
    badgeGradient: 'linear-gradient(145deg, #075985 0%, #0284C7 45%, #EAB308 100%)',
    glowColor: 'rgba(234, 179, 8, 0.35)',
    starColor: '#F59E0B',
    subTitleColor: '#FEF08A',
    accent: '#0284C7',
    borderHighlight: 'rgba(234, 179, 8, 0.3)',
  },
  'DSA': {
    badgeGradient: 'linear-gradient(145deg, #4C1D95 0%, #7C3AED 50%, #10B981 100%)',
    glowColor: 'rgba(124, 58, 237, 0.35)',
    starColor: '#FBBF24',
    subTitleColor: '#EDE9FE',
    accent: '#7C3AED',
    borderHighlight: 'rgba(124, 58, 237, 0.3)',
  },
  'React': {
    badgeGradient: 'linear-gradient(145deg, #083344 0%, #0891B2 50%, #06B6D4 100%)',
    glowColor: 'rgba(6, 182, 212, 0.35)',
    starColor: '#FBBF24',
    subTitleColor: '#CFFAFE',
    accent: '#0891B2',
    borderHighlight: 'rgba(6, 182, 212, 0.3)',
  },
  'Cloud': {
    badgeGradient: 'linear-gradient(145deg, #78350F 0%, #D97706 50%, #F59E0B 100%)',
    glowColor: 'rgba(245, 158, 11, 0.35)',
    starColor: '#FBBF24',
    subTitleColor: '#FEF3C7',
    accent: '#D97706',
    borderHighlight: 'rgba(245, 158, 11, 0.3)',
  },
  'SQL': {
    badgeGradient: 'linear-gradient(145deg, #1E1B4B 0%, #4338CA 50%, #6366F1 100%)',
    glowColor: 'rgba(99, 102, 241, 0.35)',
    starColor: '#FBBF24',
    subTitleColor: '#E0E7FF',
    accent: '#4338CA',
    borderHighlight: 'rgba(99, 102, 241, 0.3)',
  },
};

const DEFAULT_MODAL_THEME = {
  badgeGradient: 'linear-gradient(145deg, #1E293B 0%, #334155 50%, #475569 100%)',
  glowColor: 'rgba(51, 65, 85, 0.25)',
  starColor: '#FBBF24',
  subTitleColor: '#CBD5E1',
  accent: '#2563EB',
  borderHighlight: 'rgba(148, 163, 184, 0.2)',
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

  const handleCopyId = async () => {
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(cert.credentialId);
        toast.success(`Credential ID copied: ${cert.credentialId}`, 'Copied to Clipboard');
      } catch {
        toast.error('Failed to copy credential ID to clipboard.', 'Copy Error');
      }
    } else {
      toast.error('Clipboard access is not supported on this browser.', 'Copy Error');
    }
  };

  const handleCopyHash = async () => {
    if (!cert.verificationHash) return;
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(cert.verificationHash);
        toast.success('Digital signature hash copied to clipboard!', 'Signature Copied');
      } catch {
        toast.error('Failed to copy digital signature hash.', 'Copy Error');
      }
    } else {
      toast.error('Clipboard access is not supported on this browser.', 'Copy Error');
    }
  };

  const handleDownload = () => {
    toast.success(`Generating and downloading verified PDF for "${cert.title}"...`, 'Certificate PDF Exported');
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator?.clipboard?.writeText) {
      try {
        const shareUrl = `${window.location.origin}/verify/${cert.credentialId}`;
        await navigator.clipboard.writeText(shareUrl);
        toast.success(`Public verification link copied: ${shareUrl}`, 'Share Link Copied');
      } catch {
        toast.error('Failed to copy verification link to clipboard.', 'Share Error');
      }
    } else {
      toast.error('Clipboard access is not supported on this browser.', 'Share Error');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
            p: { xs: 1, sm: 2 },
            boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            bgcolor: '#0B132B',
            color: '#FFFFFF',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Dialog Header */}
      <Box
        sx={{
          position: 'relative',
          pt: 1.5,
          px: 2.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${theme.borderHighlight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.accent,
            }}
          >
            <WorkspacePremiumRoundedIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: '1.2rem', lineHeight: 1.2 }}>
              Verified Platform Credential
            </Typography>
            <Typography variant="caption" sx={{ color: '#34D399', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SecurityRoundedIcon sx={{ fontSize: 13 }} />
              Proctored & Cryptographically Sealed
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#94A3B8',
            bgcolor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>

      <DialogContent sx={{ px: { xs: 1.5, sm: 2.5 }, py: 1.5 }}>
        {/* Main Certificate Plaque Container */}
        <Box
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: '24px',
            background: 'linear-gradient(180deg, #111827 0%, #0F172A 100%)',
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
            mb: 2,
          }}
        >
          {/* Certificate Header Banner */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: '0.95rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Techlearns SkillOS
              </Typography>
              <Chip
                icon={<VerifiedRoundedIcon sx={{ fontSize: 14, color: '#34D399 !important' }} />}
                label="Official Proctored Diploma"
                size="small"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34D399',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  height: 24,
                }}
              />
            </Box>

            <Chip
              label={cert.difficulty || 'Advanced Tier'}
              size="small"
              sx={{
                bgcolor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                color: '#60A5FA',
                fontWeight: 800,
                fontSize: '0.72rem',
                height: 24,
              }}
            />
          </Box>

          {/* Centered Certificate Details */}
          <Box sx={{ textAlign: 'center', py: 1 }}>
            {/* 3D Shield Badge */}
            <Box
              sx={{
                width: 96,
                height: 104,
                mx: 'auto',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
                filter: `drop-shadow(0 10px 22px ${theme.glowColor})`,
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
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.06) 50%, rgba(0,0,0,0.3) 100%)',
                  clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                }}
              />
              <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography
                  sx={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    lineHeight: 1.1,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {cert.badgeCode}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.64rem',
                    fontWeight: 800,
                    color: theme.subTitleColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    mt: 0.2,
                  }}
                >
                  {cert.language.split(' ')[0]}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.25, mt: 0.4 }}>
                  {Array.from({ length: cert.stars || 3 }).map((_, i) => (
                    <StarRoundedIcon key={i} sx={{ fontSize: 16, color: theme.starColor }} />
                  ))}
                </Box>
              </Box>
            </Box>

            <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800 }}>
              Certificate of Proctored Mastery
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#FFFFFF',
                mt: 1,
                mb: 1,
                fontSize: { xs: '1.45rem', sm: '1.8rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {cert.title}
            </Typography>

            <Typography sx={{ fontSize: '0.94rem', color: '#CBD5E1', mb: 2.5, lineHeight: 1.6, maxWidth: 540, mx: 'auto' }}>
              This certifies that <strong>{studentName}</strong> has demonstrated verified proficiency, algorithmic problem-solving rigor, and code execution accuracy under proctored evaluation.
            </Typography>

            {/* Key Accomplishment Badges */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', mb: 3 }}>
              {cert.score && (
                <Chip
                  icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 15, color: '#34D399 !important' }} />}
                  label={`Score: ${cert.score}`}
                  sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    color: '#34D399',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                />
              )}
              {cert.percentile && (
                <Chip
                  icon={<StarRoundedIcon sx={{ fontSize: 15, color: '#FBBF24 !important' }} />}
                  label={cert.percentile}
                  sx={{
                    bgcolor: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: '#FBBF24',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                />
              )}
              {cert.grade && (
                <Chip
                  label={`Grade: ${cert.grade}`}
                  sx={{
                    bgcolor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    color: '#60A5FA',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                  }}
                />
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2.5, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

          {/* Full Data Details Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
              p: 2.5,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Credential ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, fontFamily: 'monospace', color: '#60A5FA' }}>
                  {cert.credentialId}
                </Typography>
                <Tooltip title="Copy Credential ID" arrow>
                  <IconButton size="small" onClick={handleCopyId} sx={{ p: 0.25, color: '#94A3B8', '&:hover': { color: '#60A5FA' } }}>
                    <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Issuing Authority
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', mt: 0.5 }}>
                {cert.issuer || 'Techlearns Academy'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Issue & Validity
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#FFFFFF', mt: 0.5 }}>
                {cert.issueDate} • {cert.validUntil || 'Lifetime'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Assessment Format
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#E2E8F0', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimerOutlinedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                {cert.assessmentDuration || '90 Mins'} ({cert.problemsSolved || 'All Tests Passed'})
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Proctoring Protocol
              </Typography>
              <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#E2E8F0', mt: 0.5 }}>
                {cert.proctoredBy || 'AI Video & Sandbox Anti-Cheat'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Security Signature
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {cert.verificationHash ? (
                  <>
                    <Typography sx={{ fontSize: '0.8rem', fontFamily: 'monospace', color: '#94A3B8' }}>
                      {`${cert.verificationHash.slice(0, 14)}...`}
                    </Typography>
                    <Tooltip title="Copy Signature Hash" arrow>
                      <IconButton size="small" onClick={handleCopyHash} sx={{ p: 0.25, color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}>
                        <FingerprintRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontStyle: 'italic' }}>
                    Not available
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Verified Skills Section */}
          {cert.skills && cert.skills.length > 0 && (
            <Box sx={{ mt: 2.5 }}>
              <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1 }}>
                Assessed & Validated Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                {cert.skills.map((skill, idx) => (
                  <Chip
                    key={idx}
                    label={skill}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#F8FAFC',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      height: 26,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Modal Actions Footer */}
      <DialogActions
        sx={{
          p: 2,
          px: 3,
          bgcolor: '#070C1D',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button
          variant="text"
          onClick={handleShare}
          startIcon={<ShareRoundedIcon />}
          sx={{
            color: '#94A3B8',
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '0.86rem',
            '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.06)' },
          }}
        >
          Share Verification URL
        </Button>

        <Box sx={{ display: 'flex', gap: 1.25 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderRadius: '12px',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#CBD5E1',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.86rem',
              px: 2,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)', borderColor: '#FFFFFF' },
            }}
          >
            Close
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
              fontSize: '0.86rem',
              px: 2.5,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Download PDF
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
