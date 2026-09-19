'use client';

import React from 'react';
import { Box, Card, Typography, Chip, Button, Divider, Link as MuiLink } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';

interface FacultyBioSectionProps {
  bio: string;
  department: string;
  specialization: string;
  officeHours: string;
  location: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  onEdit: () => void;
}

export default function FacultyBioSection({
  bio,
  department,
  specialization,
  officeHours,
  location,
  githubUrl,
  linkedinUrl,
  websiteUrl,
  onEdit,
}: FacultyBioSectionProps) {
  const borderColor = '#E2E8F0';

  const researchTopics = specialization
    ? specialization.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: '20px',
        bgcolor: '#FFFFFF',
        border: `1px solid ${borderColor}`,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
          Academic Biography & Research Focus
        </Typography>
        <Button
          size="small"
          startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
          onClick={onEdit}
          sx={{
            color: '#2563EB',
            bgcolor: '#EFF6FF',
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.8rem',
            px: 1.5,
            '&:hover': { bgcolor: '#DBEAFE' },
          }}
        >
          Edit Bio
        </Button>
      </Box>

      <Typography sx={{ fontSize: '0.9rem', color: bio ? '#475569' : '#94A3B8', fontStyle: bio ? 'normal' : 'italic', lineHeight: 1.7, mb: 3 }}>
        {bio || 'Not provided'}
      </Typography>

      <Divider sx={{ my: 2.5, borderColor: '#F1F5F9' }} />

      {/* Specialization & Research Focus */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', mb: 1, letterSpacing: '0.04em' }}>
          Specialization & Lab Domains
        </Typography>
        {researchTopics.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {researchTopics.map((topic) => (
              <Chip
                key={topic}
                label={topic}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#334155',
                  border: '1px solid #E2E8F0',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  borderRadius: '8px',
                  py: 0.5,
                }}
              />
            ))}
          </Box>
        ) : (
          <Typography sx={{ fontSize: '0.86rem', color: '#94A3B8', fontStyle: 'italic' }}>
            Not provided
          </Typography>
        )}
      </Box>

      {/* Academic Logistics & Links Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, bgcolor: '#F8FAFC', p: 2.5, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
        <Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
            Office Hours & Mentorship
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', fontWeight: officeHours ? 700 : 500, color: officeHours ? '#0F172A' : '#94A3B8', fontStyle: officeHours ? 'normal' : 'italic', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <AccessTimeRoundedIcon sx={{ fontSize: 17, color: '#2563EB' }} />
            {officeHours || 'Not provided'}
          </Typography>
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', mb: 0.5 }}>
            Department Lab / Cabin
          </Typography>
          <Typography sx={{ fontSize: '0.86rem', fontWeight: location ? 700 : 500, color: location ? '#0F172A' : '#94A3B8', fontStyle: location ? 'normal' : 'italic', display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <BusinessRoundedIcon sx={{ fontSize: 17, color: '#7C3AED' }} />
            {location || 'Not provided'}
          </Typography>
        </Box>

        {(githubUrl || linkedinUrl || websiteUrl) && (
          <Box sx={{ gridColumn: { sm: '1 / -1' }, pt: 1, borderTop: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>
              Academic & Professional Profiles
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {githubUrl && (
                <MuiLink
                  href={githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.82rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  <GitHubIcon sx={{ fontSize: 16, color: '#0F172A' }} />
                  GitHub Profile
                </MuiLink>
              )}
              {linkedinUrl && (
                <MuiLink
                  href={linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.82rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  <LinkedInIcon sx={{ fontSize: 16, color: '#0077B5' }} />
                  LinkedIn
                </MuiLink>
              )}
              {websiteUrl && (
                <MuiLink
                  href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontSize: '0.82rem', fontWeight: 600, color: '#2563EB', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                >
                  <LanguageRoundedIcon sx={{ fontSize: 16, color: '#059669' }} />
                  Personal Website / Publications
                </MuiLink>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </Card>
  );
}
