'use client';

import React from 'react';
import { Box, Typography, Card, Chip, Button } from '@mui/material';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';

interface PassportHeaderDossierProps {
  studentName: string;
  studentHandle: string;
  studentRollNo: string;
  studentDegree: string;
  studentGradYear: string;
  institutionName: string;
  passportId: string;
  onOpenShareModal: () => void;
  onExportPDF: () => void;
}

export default function PassportHeaderDossier({
  studentName,
  studentHandle,
  studentRollNo,
  studentDegree,
  studentGradYear,
  institutionName,
  passportId,
  onOpenShareModal,
  onExportPDF,
}: PassportHeaderDossierProps) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: '24px',
        bgcolor: '#070D1E',
        backgroundImage:
          'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.28) 0%, transparent 50%), radial-gradient(circle at 0% 100%, rgba(217, 119, 6, 0.18) 0%, transparent 45%), linear-gradient(135deg, #070D1E 0%, #0F172A 65%, #131F37 100%)',
        color: '#FFFFFF',
        p: { xs: 3, sm: 3.5, md: 4 },
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 16px 40px rgba(7, 13, 30, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle Watermark Branding in Background */}
      <Box
        sx={{
          position: 'absolute',
          right: -20,
          bottom: -30,
          opacity: 0.04,
          userSelect: 'none',
          pointerEvents: 'none',
        }}
      >
        <FingerprintRoundedIcon sx={{ fontSize: 320, color: '#FFFFFF' }} />
      </Box>

      {/* Top Issuing Authority Strip */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          pb: 2.5,
          mb: 3,
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '8px',
              bgcolor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60A5FA',
            }}
          >
            <SecurityRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', color: '#94A3B8', textTransform: 'uppercase' }}>
            DIGITAL SKILL PASSPORT · MERIT & TRANSCRIPT PREVIEW
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<VerifiedRoundedIcon sx={{ fontSize: '13px !important', color: '#10B981 !important' }} />}
            label="PREVIEW LEDGER · DEMO CONTENT"
            size="small"
            sx={{
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              color: '#6EE7B7',
              fontWeight: 800,
              fontSize: '0.68rem',
              letterSpacing: '0.04em',
              border: '1px solid rgba(16, 185, 129, 0.28)',
              height: 22,
            }}
          />
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B' }}>
            ISSUED: OCT 2026 · NO EXPIRY
          </Typography>
        </Box>
      </Box>

      {/* Candidate Identity Dossier Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3.5,
        }}
      >
        {/* Identity & Badges */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          {/* Holographic Avatar Box */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '22px',
              p: '2px',
              background: 'linear-gradient(135deg, #FBBF24 0%, #3B82F6 50%, #10B981 100%)',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: '20px',
                bgcolor: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '2rem',
                color: '#FFFFFF',
              }}
            >
              {studentName && studentName !== '—' ? studentName.charAt(0).toUpperCase() : 'U'}
            </Box>
          </Box>

          {/* Candidate Metadata */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFFFFF', fontSize: { xs: '1.4rem', sm: '1.75rem' }, letterSpacing: '-0.02em' }}>
                {studentName}
              </Typography>
              <Chip
                label="TIER 1 MERIT"
                size="small"
                sx={{
                  bgcolor: 'rgba(245, 158, 11, 0.18)',
                  color: '#FCD34D',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  height: 22,
                }}
              />
            </Box>

            <Typography sx={{ color: '#93C5FD', fontSize: '0.9rem', fontWeight: 600, mt: 0.4 }}>
              @{studentHandle} · Roll: <span style={{ color: '#FFFFFF', fontFamily: 'monospace' }}>{studentRollNo}</span> · {studentDegree} ({studentGradYear})
            </Typography>

            <Typography sx={{ color: '#94A3B8', fontSize: '0.82rem', mt: 0.2 }}>
              {institutionName}
            </Typography>

            {/* Passport Serial & Rating Tier Badges */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.78rem',
                  color: '#FDE68A',
                  fontWeight: 700,
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  px: 1.2,
                  py: 0.4,
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                PASSPORT ID: {passportId}
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  px: 1.4,
                  py: 0.4,
                  borderRadius: '6px',
                  bgcolor: '#F59E0B',
                  color: '#0F172A',
                  fontWeight: 900,
                  fontSize: '0.76rem',
                  letterSpacing: '0.02em',
                }}
              >
                <StarRoundedIcon sx={{ fontSize: 16 }} />
                4-Star Coder · 1,842 Rating (Division 1)
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Action Toolbar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="medium"
            startIcon={<ShareRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={onOpenShareModal}
            sx={{
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              fontWeight: 700,
              fontSize: '0.84rem',
              textTransform: 'none',
              borderRadius: '10px',
              px: 2.2,
              py: 0.9,
              '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)', borderColor: '#FFFFFF' },
            }}
          >
            Share Portfolio
          </Button>

          <Button
            variant="contained"
            size="medium"
            startIcon={<DownloadRoundedIcon sx={{ fontSize: 18 }} />}
            onClick={onExportPDF}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.84rem',
              textTransform: 'none',
              borderRadius: '10px',
              px: 2.5,
              py: 0.9,
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Export Official PDF
          </Button>
        </Box>
      </Box>
    </Card>
  );
}
