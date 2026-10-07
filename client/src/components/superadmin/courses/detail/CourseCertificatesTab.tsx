'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
} from '@mui/material';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import type { CourseDirectoryEntity } from '@/types/course';

interface CourseCertificatesTabProps {
  course: CourseDirectoryEntity;
  isStudent?: boolean;
  onViewCertificate?: () => void;
}

export default function CourseCertificatesTab({
  course,
  isStudent = false,
  onViewCertificate,
}: CourseCertificatesTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 4 }}>
      <Box sx={{ maxWidth: 640, mx: 'auto', textAlign: 'center' }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '20px',
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
            border: '1px solid #BFDBFE',
          }}
        >
          <WorkspacePremiumRoundedIcon sx={{ fontSize: 32 }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
          Verified Course Certification
        </Typography>

        <Typography sx={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6, mb: 3 }}>
          Students who complete all modules and pass all capstone evaluations earn an accredited cryptographically verifiable digital certificate for <strong>{course.title}</strong>.
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <Chip
            icon={<VerifiedRoundedIcon sx={{ fontSize: 16, color: '#16A34A !important' }} />}
            label="Cryptographically Signed"
            sx={{ bgcolor: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0', fontWeight: 700 }}
          />
          <Chip
            icon={<ShieldRoundedIcon sx={{ fontSize: 16, color: '#2563EB !important' }} />}
            label="Industry Recognized"
            sx={{ bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', fontWeight: 700 }}
          />
        </Box>

        {onViewCertificate && (
          <Button
            variant="contained"
            onClick={onViewCertificate}
            sx={{
              bgcolor: '#2563EB',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 800,
              px: 4,
              py: 1,
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            Preview Certificate Template
          </Button>
        )}
      </Box>
    </Card>
  );
}
