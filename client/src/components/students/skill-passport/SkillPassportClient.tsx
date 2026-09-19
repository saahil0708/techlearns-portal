'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Avatar,
  Divider,
} from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import { useToast } from '@/context/ToastContext';

interface VerifiedSkillEntry {
  skill: string;
  category: string;
  percentile: number;
  testPassedCount: number;
  cryptographicProof: string;
  verificationDate: string;
}

const PASSPORT_SKILLS: VerifiedSkillEntry[] = [
  {
    skill: 'Data Structures & Algorithms',
    category: 'Computer Science Core',
    percentile: 98.4,
    testPassedCount: 680,
    cryptographicProof: '0x8f192bca9104...7e1a',
    verificationDate: 'Sep 12, 2025',
  },
  {
    skill: 'Distributed Systems & Concurrency',
    category: 'Backend Architecture',
    percentile: 95.2,
    testPassedCount: 140,
    cryptographicProof: '0x44a19c118e20...91ab',
    verificationDate: 'Aug 28, 2025',
  },
  {
    skill: 'Relational Database Optimization',
    category: 'Persistence & SQL',
    percentile: 92.0,
    testPassedCount: 95,
    cryptographicProof: '0x12bb99341aa8...44fa',
    verificationDate: 'Aug 14, 2025',
  },
  {
    skill: 'React 19 & Next.js Architecture',
    category: 'Frontend Engineering',
    percentile: 96.8,
    testPassedCount: 110,
    cryptographicProof: '0x99fe11283ccb...021d',
    verificationDate: 'Sep 01, 2025',
  },
];

export default function SkillPassportClient() {
  const toast = useToast();
  const passportId = 'SKILL-PASS-2026-9912-IN';

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(`https://techlearns.io/verify/passport/${passportId}`);
      toast.success('Cryptographic verification link copied to clipboard!', 'Link Copied');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* 1. Top Header Banner */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
                border: '1px solid #DBEAFE',
              }}
            >
              <BadgeOutlinedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.35rem', lineHeight: 1.2 }}>
                Digital Skill Passport & Transcript
              </Typography>
              <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.3 }}>
                Cryptographically verifiable skill transcript for hiring partners, universities, and recruiters
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<ContentCopyRoundedIcon />}
            onClick={handleCopyLink}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '12px',
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.86rem',
              px: 2.5,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Copy Verification Link
          </Button>
        </Box>
      </Card>

      {/* 2. Cryptographic Passport ID Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#0F172A',
          backgroundImage: 'radial-gradient(ellipse at 80% 20%, rgba(37, 99, 235, 0.3) 0%, transparent 60%)',
          color: '#FFFFFF',
          p: 3.5,
          border: '1px solid #1E293B',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityRoundedIcon sx={{ color: '#60A5FA', fontSize: 20 }} />
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#93C5FD' }}>
              Official Verified Credential
            </Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
            Student Coder Skill Passport
          </Typography>
          <Typography sx={{ fontFamily: 'monospace', fontSize: '0.86rem', color: '#94A3B8' }}>
            ID: <span style={{ color: '#60A5FA', fontWeight: 700 }}>{passportId}</span>
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Chip label="Global Top 1.5% Percentile" size="small" sx={{ bgcolor: 'rgba(37, 99, 235, 0.4)', color: '#FFFFFF', fontWeight: 700, border: '1px solid rgba(96, 165, 250, 0.4)' }} />
            <Chip label="Anti-Cheat Sandbox Verified" size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.2)', color: '#34D399', fontWeight: 700, border: '1px solid rgba(52, 211, 153, 0.4)' }} />
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <QrCode2RoundedIcon sx={{ fontSize: 72, color: '#0F172A' }} />
          <Typography sx={{ fontSize: '0.64rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
            Scan to Verify
          </Typography>
        </Box>
      </Card>

      {/* 3. Structured Skill Proof Table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#0F172A' }}>
            Verified Skill Transcript & Proof of Work
          </Typography>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem', py: 2 }}>COMPETENCY & DOMAIN</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>GLOBAL PERCENTILE</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>PASSED TEST SUITES</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>CRYPTOGRAPHIC HASH PROOF</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#475569', fontSize: '0.78rem' }}>AUDIT DATE</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PASSPORT_SKILLS.map((sk) => (
                <TableRow key={sk.skill} hover sx={{ '&:last-child td': { borderBottom: 'none' } }}>
                  <TableCell sx={{ py: 2.25 }}>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
                        {sk.skill}
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                        {sk.category}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell sx={{ fontWeight: 900, color: '#059669', fontSize: '0.88rem' }}>
                    Top {sk.percentile}%
                  </TableCell>

                  <TableCell sx={{ fontWeight: 700, color: '#334155', fontSize: '0.84rem' }}>
                    {sk.testPassedCount} Tests Passed
                  </TableCell>

                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#2563EB' }}>
                    {sk.cryptographicProof}
                  </TableCell>

                  <TableCell align="right" sx={{ color: '#64748B', fontSize: '0.84rem' }}>
                    {sk.verificationDate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
