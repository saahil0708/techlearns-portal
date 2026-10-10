'use client';

import React from 'react';
import { Box, Typography, Card, Chip, Button, Divider } from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import QRCodeCanvas from './QRCodeCanvas';

interface PassportVerificationSidebarProps {
  verificationUrl: string;
  verificationHash: string;
  onOpenQrModal: () => void;
  onCopyLink: () => void;
}

export default function PassportVerificationSidebar({
  verificationUrl,
  verificationHash,
  onOpenQrModal,
  onCopyLink,
}: PassportVerificationSidebarProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Card 1: Official Titanium Credential Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '22px',
          bgcolor: '#0F172A',
          backgroundImage: 'linear-gradient(145deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          p: 3,
          border: '1px solid #334155',
          boxShadow: '0 14px 32px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#FCD34D', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Digital Recruiter Verification
        </Typography>

        {/* Scannable QR */}
        <Box
          component="button"
          type="button"
          aria-label="Expand verification QR Code"
          sx={{
            border: 'none',
            outline: 'none',
            bgcolor: '#FFFFFF',
            p: 1.5,
            borderRadius: '16px',
            mx: 'auto',
            cursor: 'pointer',
            display: 'inline-block',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.03)' },
            '&:focus-visible': { outline: '2px solid #C084FC', outlineOffset: '2px' },
          }}
          onClick={onOpenQrModal}
          title="Click to expand QR Code"
        >
          <QRCodeCanvas url={verificationUrl} size={120} />
        </Box>

        <Box>
          <Typography sx={{ fontWeight: 850, fontSize: '0.9rem', color: '#FFFFFF' }}>
            Instant Recruiter Verification
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8', mt: 0.3 }}>
            Scan to inspect authentic solution source, runtime benchmarks, and signatures
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          onClick={onCopyLink}
          startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: '#0B1F3A',
            fontWeight: 800,
            fontSize: '0.8rem',
            textTransform: 'none',
            borderRadius: '10px',
            py: 0.9,
            '&:hover': { bgcolor: '#17366E' },
          }}
        >
          Copy Verification URL
        </Button>
      </Card>

      {/* Card 2: Cryptographic Security / Verification Preview Block */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: 2.8,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <ShieldRoundedIcon sx={{ fontSize: 20, color: '#0B1F3A' }} />
          <Typography sx={{ fontWeight: 850, fontSize: '0.88rem', color: '#0F172A' }}>
            Attestation & Verification Preview
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '0.74rem', color: '#64748B', lineHeight: 1.5 }}>
          Sample transcript and ledger preview. Cryptographic signatures and audit hashes will reflect live audited results when synced with student evaluation services.
        </Typography>

        <Box sx={{ p: 1.2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 700 }}>PREVIEW VERIFICATION HASH</Typography>
          <Typography sx={{ fontSize: '0.68rem', fontFamily: 'monospace', color: '#0F172A', wordBreak: 'break-all', mt: 0.2 }}>
            {verificationHash}
          </Typography>
        </Box>

        <Divider />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
            Record Status
          </Typography>
          <Chip
            label="PREVIEW DEMO"
            size="small"
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: '#FAF5FF', color: '#0B1F3A' }}
          />
        </Box>
      </Card>
    </Box>
  );
}
