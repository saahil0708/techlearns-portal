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
import StarRatingBadge from '@/components/shared/StarRatingBadge';
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
          background: profile.bannerGradient || 'linear-gradient(135deg, #020617 0%, #0F172A 35%, #0B1F3A 75%, #0B1F3A 100%)',
          position: 'relative',
          boxShadow: 'inset 0 -10px 25px rgba(0, 0, 0, 0.4)',
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
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip
              label={`🏆 ${((profile.totalPoints ?? profile.score) || ((profile.solvedEasy * 100) + (profile.solvedMedium * 200) + (profile.solvedHard * 350))).toLocaleString()} Points`}
              size="small"
              sx={{
                bgcolor: 'rgba(234, 179, 8, 0.18)',
                backdropFilter: 'blur(10px)',
                color: '#FDE047',
                fontWeight: 900,
                border: '1px solid rgba(250, 204, 21, 0.5)',
                boxShadow: '0 4px 14px rgba(234, 179, 8, 0.25)',
              }}
            />
            <Chip
              label={`Global Rank #${profile.globalRank}`}
              size="small"
              sx={{
                bgcolor: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(10px)',
                color: '#A855F7',
                fontWeight: 800,
                border: '1px solid rgba(91, 45, 144, 0.4)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
            />
            {profile.collegeRank !== undefined && profile.collegeRank !== null && (
              <Chip
                label={`College Rank #${profile.collegeRank}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  backdropFilter: 'blur(10px)',
                  color: '#C084FC',
                  fontWeight: 800,
                  border: '1px solid rgba(192, 132, 252, 0.4)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              />
            )}
            <StarRatingBadge rating={profile.contestRating} size="medium" showDivision={true} />
          </Box>
        </Box>
      </Box>

      {/* Profile Info Header Card */}
      <Card
        elevation={0}
        sx={{
          borderRadius: '24px',
          bgcolor: '#0F172A',
          border: '1px solid rgba(91, 45, 144, 0.25)',
          p: { xs: 2.5, sm: 3.5 },
          mb: 3.5,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(91, 45, 144, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3.5, alignItems: { xs: 'center', md: 'flex-start' } }}>
          {/* Avatar */}
          <Avatar
            src={profile.avatarUrl}
            sx={{
              width: { xs: 100, sm: 128 },
              height: { xs: 100, sm: 128 },
              bgcolor: '#0B1F3A',
              fontSize: { xs: '2rem', sm: '2.5rem' },
              fontWeight: 800,
              color: '#FFFFFF',
              border: '4px solid #0F172A',
              boxShadow: '0 0 24px rgba(192, 132, 252, 0.35), 0 8px 24px rgba(91, 45, 144, 0.4)',
              mt: { xs: -8, sm: -10 },
            }}
          >
            {initials}
          </Avatar>

          {/* Middle Identity Info */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: { xs: 'center', md: 'flex-start' }, flexWrap: 'wrap', mb: 0.75 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: { xs: '1.4rem', sm: '1.8rem' }, letterSpacing: '-0.02em' }}>
                {profile.name}
              </Typography>
              <Chip
                label={`@${profile.handle}`}
                size="small"
                sx={{
                  bgcolor: 'rgba(91, 45, 144, 0.2)',
                  color: '#A855F7',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  border: '1px solid rgba(91, 45, 144, 0.35)',
                  borderRadius: '8px',
                }}
              />
              <Chip
                label={profile.role.replace('_', ' ')}
                size="small"
                sx={{
                  bgcolor: 'rgba(30, 41, 59, 0.8)',
                  color: '#94A3B8',
                  border: '1px solid rgba(51, 65, 85, 0.6)',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  borderRadius: '8px',
                }}
              />
            </Box>

            <Typography sx={{ color: '#94A3B8', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: 740, mb: 2 }}>
              {profile.bio}
            </Typography>

            {/* Meta tags */}
            <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', justifyContent: { xs: 'center', md: 'flex-start' }, alignItems: 'center', color: '#94A3B8', fontSize: '0.84rem' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SchoolRoundedIcon sx={{ fontSize: 18, color: '#C084FC' }} />
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#E2E8F0' }}>
                  {profile.institution}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <LocationOnRoundedIcon sx={{ fontSize: 18, color: '#A855F7' }} />
                <Typography sx={{ fontSize: '0.84rem', color: '#CBD5E1' }}>{profile.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#818CF8' }} />
                <Typography sx={{ fontSize: '0.84rem', color: '#CBD5E1' }}>Joined {profile.joinedDate}</Typography>
              </Box>
            </Box>

            {/* Social links */}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
              {profile.githubUrl && (
                <Tooltip title="GitHub Profile" arrow>
                  <IconButton
                    component="a"
                    href={profile.githubUrl}
                    target="_blank"
                    size="small"
                    sx={{
                      color: '#F8FAFC',
                      bgcolor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(91, 45, 144, 0.25)',
                      '&:hover': { bgcolor: 'rgba(91, 45, 144, 0.2)', borderColor: '#A855F7' },
                    }}
                  >
                    <GitHubIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {profile.linkedinUrl && (
                <Tooltip title="LinkedIn Profile" arrow>
                  <IconButton
                    component="a"
                    href={profile.linkedinUrl}
                    target="_blank"
                    size="small"
                    sx={{
                      color: '#C084FC',
                      bgcolor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(91, 45, 144, 0.25)',
                      '&:hover': { bgcolor: 'rgba(91, 45, 144, 0.2)', borderColor: '#C084FC' },
                    }}
                  >
                    <LinkedInIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              )}
              {profile.websiteUrl && (
                <Tooltip title="Portfolio Website" arrow>
                  <IconButton
                    component="a"
                    href={profile.websiteUrl}
                    target="_blank"
                    size="small"
                    sx={{
                      color: '#A855F7',
                      bgcolor: 'rgba(30, 41, 59, 0.8)',
                      border: '1px solid rgba(91, 45, 144, 0.25)',
                      '&:hover': { bgcolor: 'rgba(91, 45, 144, 0.2)', borderColor: '#A855F7' },
                    }}
                  >
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
                  bgcolor: '#0B1F3A',
                  backgroundImage: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                  borderRadius: '9999px',
                  px: 3,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 16px rgba(91, 45, 144, 0.4)',
                  '&:hover': { backgroundImage: 'linear-gradient(135deg, #5B2D90 0%, #0B1F3A 100%)' },
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
                borderColor: 'rgba(91, 45, 144, 0.4)',
                color: '#C084FC',
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.88rem',
                '&:hover': { bgcolor: 'rgba(11, 31, 58, 0.15)', borderColor: '#A855F7' },
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
