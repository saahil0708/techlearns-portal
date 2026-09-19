'use client';

import React from 'react';
import { Box, Card, Typography, Avatar, Chip, Button, Tooltip } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

interface FacultyHeaderCardProps {
  name: string;
  email: string;
  department: string;
  collegeName: string;
  collegeCode: string;
  collegeDomain: string;
  location: string;
  roleTitle: string;
  onEditProfile: () => void;
}

export default function FacultyHeaderCard({
  name,
  email,
  department,
  collegeName,
  collegeCode,
  collegeDomain,
  location,
  roleTitle,
  onEditProfile,
}: FacultyHeaderCardProps) {
  const borderColor = '#E2E8F0';

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: '24px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 25px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 3,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative top background gradient accent */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 50%, #059669 100%)',
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, minWidth: 0, flexWrap: 'wrap' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: '#2563EB',
            fontWeight: 900,
            fontSize: '1.75rem',
            color: '#FFFFFF',
            borderRadius: '22px',
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
          }}
        >
          {(name || email || 'F').slice(0, 2).toUpperCase()}
        </Avatar>

        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.4rem', md: '1.7rem' },
                color: '#0F172A',
                letterSpacing: '-0.02em',
              }}
            >
              {name}
            </Typography>
            <Chip
              icon={<VerifiedRoundedIcon sx={{ fontSize: 14, color: '#059669 !important' }} />}
              label="Active Instructor"
              size="small"
              sx={{
                height: 24,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: '#ECFDF5',
                border: '1px solid #A7F3D0',
                color: '#059669',
                borderRadius: '8px',
              }}
            />
          </Box>

          <Typography sx={{ color: '#2563EB', fontWeight: 700, fontSize: '0.92rem', mt: 0.25 }}>
            {roleTitle} • {department}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1.25 }}>
            <Typography sx={{ color: '#64748B', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SchoolRoundedIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
              <strong>{collegeName}</strong> ({collegeCode})
            </Typography>
            <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>•</Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <EmailRoundedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
              {email}
            </Typography>
            {location && (
              <>
                <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem' }}>•</Typography>
                <Typography sx={{ color: '#64748B', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOnRoundedIcon sx={{ fontSize: 16, color: '#D97706' }} />
                  {location}
                </Typography>
              </>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Profile Action */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Button
          variant="contained"
          startIcon={<EditRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={onEditProfile}
          sx={{
            bgcolor: '#0F172A',
            color: '#FFFFFF',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.86rem',
            px: 2.5,
            py: 1,
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
            '&:hover': { bgcolor: '#1E293B' },
          }}
        >
          Edit Academic Bio
        </Button>
      </Box>
    </Card>
  );
}
