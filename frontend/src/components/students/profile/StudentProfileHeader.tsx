'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import { StudentProfileData } from '@/types/student-profile';

interface StudentProfileHeaderProps {
  profile: StudentProfileData;
  isOwner?: boolean;
  onEditClick: () => void;
  onShareClick: () => void;
}

export default function StudentProfileHeader({
  profile,
  isOwner = true,
  onEditClick,
  onShareClick,
}: StudentProfileHeaderProps) {
  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'CP';

  return (
    <>
      {/* Top Hero Banner */}
      <Box
        sx={{
          height: { xs: 160, sm: 220, md: 260 },
          background: profile.bannerGradient || 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
          position: 'relative',
          boxShadow: 'inset 0 -10px 25px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: 'auto',
            height: '100%',
            px: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            alignItems: 'flex-end',
            pb: 2,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Chip
              label={`Global Rank #${profile.globalRank}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontWeight: 800,
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            />
            <Chip
              label={`${profile.contestRating} Rating • ${profile.ratingTier}`}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontWeight: 800,
                border: '1px solid rgba(255, 255, 255, 0.35)',
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Profile Info Header Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          p: { xs: 2.5, sm: 3.5 },
          mb: 3.5,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3.5, alignItems: { xs: 'center', md: 'flex-start' } }}>
          {/* Avatar */}
          <Avatar
            src={profile.avatarUrl}
            sx={{
              width: { xs: 100, sm: 128 },
              height: { xs: 100, sm: 128 },
              bgcolor: '#2563EB',
              fontSize: { xs: '2rem', sm: '2.5rem' },
              fontWeight: 800,
              color: '#FFFFFF',
              border: '4px solid #FFFFFF',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
              mt: { xs: -8, sm: -10 },
            }}
          >
            {initials}
          </Avatar>

          {/* Middle Identity Info */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.8rem' } }}>
                {profile.name}
              </Typography>
              <Chip
                label={`@${profile.handle}`}
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  border: '1px solid #DBEAFE',
                  borderRadius: '8px',
                }}
              />
              <Chip
                label={profile.role.replace('_', ' ')}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#475569',
                  border: '1px solid #E2E8F0',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  borderRadius: '8px',
                }}
              />
            </Box>

            <Typography sx={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: 740, mb: 2 }}>
              {profile.bio}
            </Typography>

            {/* Meta tags */}
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center', color: '#64748B', fontSize: '0.84rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SchoolRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#334155' }}>
                  {profile.institution}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <LocationOnRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.84rem' }}>{profile.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography sx={{ fontSize: '0.84rem' }}>Joined {profile.joinedDate}</Typography>
              </Box>
            </Box>

            {/* Social links */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              {profile.githubUrl && (
                <Tooltip title="GitHub Profile" arrow>
                  <IconButton component="a" href={profile.githubUrl} target="_blank" size="small" sx={{ color: '#334155', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F1F5F9' } }}>
                    <GitHubIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {profile.linkedinUrl && (
                <Tooltip title="LinkedIn Profile" arrow>
                  <IconButton component="a" href={profile.linkedinUrl} target="_blank" size="small" sx={{ color: '#0A66C2', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F1F5F9' } }}>
                    <LinkedInIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {profile.websiteUrl && (
                <Tooltip title="Portfolio Website" arrow>
                  <IconButton component="a" href={profile.websiteUrl} target="_blank" size="small" sx={{ color: '#2563EB', border: '1px solid #E2E8F0', '&:hover': { bgcolor: '#F1F5F9' } }}>
                    <LanguageRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, gap: 1.5, alignSelf: { xs: 'center', md: 'flex-start' } }}>
            {isOwner && (
              <Button
                variant="contained"
                startIcon={<EditRoundedIcon />}
                onClick={onEditClick}
                sx={{
                  bgcolor: '#2563EB',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  borderRadius: '9999px',
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Edit Profile
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ShareRoundedIcon />}
              onClick={onShareClick}
              sx={{
                borderRadius: '9999px',
                borderColor: '#CBD5E1',
                color: '#475569',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.88rem',
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Share Profile
            </Button>
          </Box>
        </Box>
      </Card>
    </>
  );
}
