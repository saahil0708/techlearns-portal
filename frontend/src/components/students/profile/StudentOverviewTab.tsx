'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Card,
  Avatar,
  IconButton,
  Button,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';

// Material Rounded Icons
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { StudentProfileData, StudentCertification } from '@/types/student-profile';
import { useToast } from '@/context/ToastContext';
import TopicMasteryRadialGrid from './TopicMasteryRadialGrid';

const CERT_THEMES: Record<string, {
  tagBg: string;
  tagColor: string;
  tagBorder: string;
  badgeGradient: string;
  badgeInner: string;
  borderColor: string;
  glowColor: string;
  starColor: string;
  subTitleColor: string;
}> = {
  'C++': {
    tagBg: '#EFF6FF',
    tagColor: '#1D4ED8',
    tagBorder: '#BFDBFE',
    badgeGradient: 'linear-gradient(145deg, #0F2A66 0%, #1D4ED8 50%, #3B82F6 100%)',
    badgeInner: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%, rgba(0,0,0,0.3) 100%)',
    borderColor: '#93C5FD',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    starColor: '#FBBF24',
    subTitleColor: '#DBEAFE',
  },
  'Python': {
    tagBg: '#FEF9C3',
    tagColor: '#854D0E',
    tagBorder: '#FDE047',
    badgeGradient: 'linear-gradient(145deg, #075985 0%, #0284C7 45%, #EAB308 100%)',
    badgeInner: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%, rgba(0,0,0,0.25) 100%)',
    borderColor: '#FDE047',
    glowColor: 'rgba(234, 179, 8, 0.25)',
    starColor: '#F59E0B',
    subTitleColor: '#FEF08A',
  },
  'DSA': {
    tagBg: '#F5F3FF',
    tagColor: '#6D28D9',
    tagBorder: '#DDD6FE',
    badgeGradient: 'linear-gradient(145deg, #4C1D95 0%, #7C3AED 50%, #10B981 100%)',
    badgeInner: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 60%, rgba(0,0,0,0.3) 100%)',
    borderColor: '#C4B5FD',
    glowColor: 'rgba(124, 58, 237, 0.25)',
    starColor: '#FBBF24',
    subTitleColor: '#EDE9FE',
  },
};

const DEFAULT_CERT_THEME = {
  tagBg: '#F1F5F9',
  tagColor: '#334155',
  tagBorder: '#CBD5E1',
  badgeGradient: 'linear-gradient(145deg, #1E293B 0%, #334155 50%, #475569 100%)',
  badgeInner: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 60%, rgba(0,0,0,0.3) 100%)',
  borderColor: '#94A3B8',
  glowColor: 'rgba(51, 65, 85, 0.2)',
  starColor: '#FBBF24',
  subTitleColor: '#CBD5E1',
};

interface StudentOverviewTabProps {
  profile: StudentProfileData;
  isOwner?: boolean;
  onEditProfile: () => void;
  onUploadResume: () => void;
  onViewCert: (cert: StudentCertification) => void;
  onRemoveResume?: () => void;
}

export default function StudentOverviewTab({
  profile,
  isOwner = true,
  onEditProfile,
  onUploadResume,
  onViewCert,
  onRemoveResume = () => { },
}: StudentOverviewTabProps) {
  const toast = useToast();
  const [medalsModalOpen, setMedalsModalOpen] = useState(false);

  const displayName = profile.name || 'Student';
  const handleName = profile.handle || (profile.email ? profile.email.split('@')[0] : 'student_coder');
  const userEmail = profile.email || 'student@codeplatform.io';
  const userPhone = profile.phone || '+91-9474156798';
  const userLocation = profile.location || 'India';
  const userCountryFlag = profile.countryFlag || '🇮🇳';

  // Calculate profile completion percentage
  const fields = [
    Boolean(profile.name),
    Boolean(profile.email),
    Boolean(profile.phone),
    Boolean(profile.location),
    Boolean(profile.institution),
    Boolean(profile.bio),
    Boolean(profile.resumeFileName || profile.resumeUrl),
    Boolean(profile.githubUrl || profile.linkedinUrl),
  ];
  const filledCount = fields.filter(Boolean).length;
  const completionPct = Math.round((filledCount / fields.length) * 100) || 60;

  // Default / Live Certifications
  const defaultCertifications: StudentCertification[] = [
    {
      id: 'cert-cpp-01',
      title: 'C++ Algorithmic Specialist',
      badgeCode: 'C++',
      language: 'CPP',
      stars: 3,
      issueDate: 'August 2025',
      issuer: 'CodePlatform Academy',
      credentialId: 'CERT-CPP-9821-X',
      skills: ['STL Algorithms', 'Pointers & Memory', 'Graph Optimization'],
    },
    {
      id: 'cert-py-02',
      title: 'Python Data Structures Expert',
      badgeCode: 'Python',
      language: 'Python',
      stars: 3,
      issueDate: 'September 2025',
      issuer: 'CodePlatform Academy',
      credentialId: 'CERT-PY-5541-A',
      skills: ['Dynamic Programming', 'Tries & Segment Trees', 'Asyncio'],
    },
    {
      id: 'cert-dsa-03',
      title: 'Advanced Algorithms & DSA Master',
      badgeCode: 'DSA',
      language: 'Algorithms',
      stars: 3,
      issueDate: 'October 2025',
      issuer: 'CodePlatform Academy',
      credentialId: 'CERT-DSA-7712-M',
      skills: ['Segment Trees', 'Max Flow', 'Tree DP'],
    },
  ];

  const certifications = profile.certifications && profile.certifications.length > 0
    ? profile.certifications
    : defaultCertifications;

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'ST';

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '330px 1fr', lg: '360px 1fr' },
        gap: 3,
        alignItems: 'start',
      }}
    >
      {/* ========================================================================= */}
      {/* LEFT COLUMN: User Card, Personal Information, My Resume */}
      {/* ========================================================================= */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* 1. User Identity Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.05)',
              borderColor: '#CBD5E1',
            },
          }}
        >
          {/* Top Right Edit Button */}
          {isOwner && (
            <Tooltip title="Edit Profile Details" placement="top" arrow>
              <IconButton
                size="small"
                onClick={onEditProfile}
                sx={{
                  position: 'absolute',
                  top: 18,
                  right: 18,
                  color: '#94A3B8',
                  borderRadius: '10px',
                  p: 0.75,
                  border: '1px solid #F1F5F9',
                  bgcolor: '#F8FAFC',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#2563EB',
                    bgcolor: '#EFF6FF',
                    borderColor: '#BFDBFE',
                  },
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* User Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={profile.avatarUrl}
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: '#F1F5F9',
                color: '#334155',
                fontSize: '1.4rem',
                fontWeight: 800,
                border: '2px solid #E2E8F0',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              }}
            >
              {initials}
            </Avatar>
          </Box>

          {/* User Name & Country Flag */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.45rem', letterSpacing: '-0.02em' }}>
              {displayName}
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
              {userCountryFlag}
            </Typography>
          </Box>

          {/* Handle */}
          <Typography sx={{ color: '#64748B', fontSize: '0.88rem', fontWeight: 500, fontFamily: 'sans-serif' }}>
            @{handleName}
          </Typography>

          {/* Optional Bio if present */}
          {profile.bio && (
            <Typography sx={{ color: '#475569', fontSize: '0.82rem', lineHeight: 1.5, mt: 1.5, pt: 1.5, borderTop: '1px solid #F1F5F9' }}>
              {profile.bio}
            </Typography>
          )}
        </Card>

        {/* 2. Personal Information Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            position: 'relative',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.05)',
              borderColor: '#CBD5E1',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              Personal Information
            </Typography>

            {isOwner && (
              <Tooltip title="Edit Personal Details" placement="top" arrow>
                <IconButton
                  size="small"
                  onClick={onEditProfile}
                  sx={{
                    color: '#94A3B8',
                    borderRadius: '10px',
                    p: 0.75,
                    border: '1px solid #F1F5F9',
                    bgcolor: '#F8FAFC',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#2563EB',
                      bgcolor: '#EFF6FF',
                      borderColor: '#BFDBFE',
                    },
                  }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* List of Information */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  flexShrink: 0,
                }}
              >
                <MailOutlineRoundedIcon sx={{ fontSize: 17 }} />
              </Box>
              <Typography sx={{ color: '#334155', fontSize: '0.88rem', fontWeight: 500, wordBreak: 'break-all' }}>
                {userEmail}
              </Typography>
            </Box>

            {/* Phone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  flexShrink: 0,
                }}
              >
                <PhoneOutlinedIcon sx={{ fontSize: 17 }} />
              </Box>
              <Typography sx={{ color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}>
                {userPhone}
              </Typography>
            </Box>

            {/* Location */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                  flexShrink: 0,
                }}
              >
                <LocationOnOutlinedIcon sx={{ fontSize: 17 }} />
              </Box>
              <Typography sx={{ color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}>
                {userLocation}
              </Typography>
            </Box>

            {/* Institution / College */}
            {profile.institution && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748B',
                    flexShrink: 0,
                  }}
                >
                  <SchoolOutlinedIcon sx={{ fontSize: 17 }} />
                </Box>
                <Typography sx={{ color: '#334155', fontSize: '0.88rem', fontWeight: 500 }}>
                  {profile.institution}
                </Typography>
              </Box>
            )}
          </Box>
        </Card>

        {/* 3. My Resume Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.05)',
              borderColor: '#CBD5E1',
            },
          }}
        >
          {/* Header with "+ Add Resume" button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
              My Resume
            </Typography>

            {isOwner && (
              <Button
                size="small"
                onClick={onUploadResume}
                startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: '#2563EB',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.82rem',
                  p: 0,
                  minWidth: 0,
                  '&:hover': {
                    bgcolor: 'transparent',
                    color: '#1D4ED8',
                    textDecoration: 'underline',
                  },
                }}
              >
                {profile.resumeFileName ? 'Update' : '+ Add Resume'}
              </Button>
            )}
          </Box>

          {/* Content Body */}
          {profile.resumeFileName ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                <DescriptionOutlinedIcon sx={{ color: '#2563EB', fontSize: 22 }} />
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#1E293B' }} noWrap>
                  {profile.resumeFileName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Download Resume">
                  <IconButton
                    size="small"
                    onClick={() => toast.success(`Downloading ${profile.resumeFileName}...`, 'Resume Export')}
                    sx={{ color: '#64748B', '&:hover': { color: '#2563EB' } }}
                  >
                    <FileDownloadOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                {isOwner && (
                  <Tooltip title="Remove Resume">
                    <IconButton
                      size="small"
                      onClick={onRemoveResume}
                      sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          ) : (
            <Typography
              onClick={isOwner ? onUploadResume : undefined}
              sx={{
                color: '#64748B',
                fontSize: '0.88rem',
                fontWeight: 500,
                cursor: isOwner ? 'pointer' : 'default',
                '&:hover': isOwner ? { color: '#2563EB' } : {},
              }}
            >
              Add your resume here
            </Typography>
          )}
        </Card>
      </Box>

      {/* ========================================================================= */}
      {/* RIGHT COLUMN: Complete Profile Banner, Orchestrate, My Certifications */}
      {/* ========================================================================= */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* 1. Complete your profile Hero Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#F0F7FF',
            border: '1.5px solid #BFDBFE',
            p: { xs: 2.5, sm: 3 },
            boxShadow: '0 4px 20px rgba(37, 99, 235, 0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#93C5FD',
              boxShadow: '0 6px 24px rgba(37, 99, 235, 0.1)',
            },
          }}
        >
          {/* Left Text Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="caption"
              sx={{
                color: '#2563EB',
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                display: 'block',
                mb: 0.5,
              }}
            >
              Complete your profile
            </Typography>

            <Typography
              onClick={onEditProfile}
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: { xs: '1.05rem', sm: '1.18rem' },
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                cursor: 'pointer',
                transition: 'color 0.2s ease',
                '&:hover': {
                  color: '#2563EB',
                },
              }}
            >
              Add your missing details <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
            </Typography>

            <Typography
              sx={{
                color: '#64748B',
                fontSize: '0.82rem',
                fontWeight: 500,
                mt: 0.75,
                lineHeight: 1.45,
              }}
            >
              This data will be helpful to auto-fill your job applications
            </Typography>
          </Box>

          {/* Right Circular Progress Ring with Percentage */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {/* Background track circle */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={68}
              thickness={4.5}
              sx={{ color: '#DBEAFE' }}
            />
            {/* Active progress circle */}
            <CircularProgress
              variant="determinate"
              value={completionPct}
              size={68}
              thickness={4.5}
              sx={{
                color: '#2563EB',
                position: 'absolute',
                left: 0,
                strokeLinecap: 'round',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                fontSize: '0.88rem',
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              {completionPct}%
            </Typography>
          </Box>
        </Card>

        {/* 2. Topic & Skill Mastery Radial Graphs Card */}
        {(() => {
          const profileTopicSkills = profile.topicSkills?.map((skill, idx) => ({
            id: `skill-${idx}-${skill.name}`,
            name: skill.name,
            percentage: skill.pct,
            solvedCount: skill.solved,
            totalCount: skill.total,
            color: '#3B82F6',
          }));

          return (
            <TopicMasteryRadialGrid
              skills={profileTopicSkills}
              cohortLabel={profile.cohortResult}
            />
          );
        })()}

        {/* 3. Coding Activity & Problem Solving Performance Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.05)',
              borderColor: '#CBD5E1',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <CodeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  Problem Solves & Activity
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                  {profile.totalSubmissions ?? 1840} Submissions • {profile.accuracyRate ?? '96.4%'} Accuracy Rate
                </Typography>
              </Box>
            </Box>

            <Link href="/problems" style={{ textDecoration: 'none' }}>
              <Typography
                sx={{
                  color: '#2563EB',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Solve Problems <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} />
              </Typography>
            </Link>
          </Box>

          {/* Metrics Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.15fr 1fr' }, gap: 2.5, alignItems: 'center' }}>
            {/* Left: Concentric Multi-Ring Radial Gauge & Difficulty Pills */}
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#F8FAFC',
                borderRadius: '20px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                gap: 2.5,
              }}
            >
              {/* Concentric 3-Ring SVG Gauge */}
              <Box sx={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
                <svg width={120} height={120} style={{ transform: 'rotate(-90deg)' }}>
                  {/* Outer Ring: Easy (Radius: 50) */}
                  <circle cx={60} cy={60} r={50} stroke="#EEF2F6" strokeWidth={6} fill="transparent" />
                  <circle
                    cx={60}
                    cy={60}
                    r={50}
                    stroke="#10B981"
                    strokeWidth={6}
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 - (((profile.solvedEasy ?? 240) / 380) * (2 * Math.PI * 50))}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />

                  {/* Middle Ring: Medium (Radius: 40) */}
                  <circle cx={60} cy={60} r={40} stroke="#EEF2F6" strokeWidth={6} fill="transparent" />
                  <circle
                    cx={60}
                    cy={60}
                    r={40}
                    stroke="#F59E0B"
                    strokeWidth={6}
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 - (((profile.solvedMedium ?? 310) / 540) * (2 * Math.PI * 40))}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />

                  {/* Inner Ring: Hard (Radius: 30) */}
                  <circle cx={60} cy={60} r={30} stroke="#EEF2F6" strokeWidth={6} fill="transparent" />
                  <circle
                    cx={60}
                    cy={60}
                    r={30}
                    stroke="#F43F5E"
                    strokeWidth={6}
                    strokeDasharray={2 * Math.PI * 30}
                    strokeDashoffset={2 * Math.PI * 30 - (((profile.solvedHard ?? 130) / 280) * (2 * Math.PI * 30))}
                    strokeLinecap="round"
                    fill="transparent"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>

                {/* Centered Total Count */}
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>
                    {profile.solvedTotal ?? 680}
                  </Typography>
                  <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mt: 0.2 }}>
                    Solved
                  </Typography>
                </Box>
              </Box>

              {/* Difficulty Breakdown Pills */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                {/* Easy Pill */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFFFFF', p: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      Easy
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {profile.solvedEasy ?? 240} <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.72rem' }}>/ 380</span>
                  </Typography>
                </Box>

                {/* Medium Pill */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFFFFF', p: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      Medium
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {profile.solvedMedium ?? 310} <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.72rem' }}>/ 540</span>
                  </Typography>
                </Box>

                {/* Hard Pill */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#FFFFFF', p: '6px 12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#F43F5E' }} />
                    <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                      Hard
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A' }}>
                    {profile.solvedHard ?? 130} <span style={{ color: '#94A3B8', fontWeight: 500, fontSize: '0.72rem' }}>/ 280</span>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right: Key Stats 2x2 Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
              {/* Contest Rating */}
              <Box sx={{ p: 1.5, bgcolor: '#EFF6FF', borderRadius: '14px', border: '1px solid #DBEAFE' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#2563EB', mb: 0.5 }}>
                  <EmojiEventsRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Rating
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                  {profile.contestRating ?? 2380}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563EB', mt: 0.25 }}>
                  {profile.ratingTier ?? 'Master'} Tier
                </Typography>
              </Box>

              {/* Daily Streak */}
              <Box sx={{ p: 1.5, bgcolor: '#FFF7ED', borderRadius: '14px', border: '1px solid #FFEDD5' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#EA580C', mb: 0.5 }}>
                  <LocalFireDepartmentRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Streak
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                  {profile.currentStreakDays ?? 48}d
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#C2410C', mt: 0.25 }}>
                  Max {profile.maxStreakDays ?? 65}d
                </Typography>
              </Box>

              {/* Global Rank */}
              <Box sx={{ p: 1.5, bgcolor: '#F0FDF4', borderRadius: '14px', border: '1px solid #DCFCE7' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#16A34A', mb: 0.5 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Rank
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                  #{profile.globalRank ?? 1}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#16A34A', mt: 0.25 }}>
                  Top 0.5%
                </Typography>
              </Box>

              {/* Accuracy */}
              <Box sx={{ p: 1.5, bgcolor: '#FAF5FF', borderRadius: '14px', border: '1px solid #F3E8FF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: '#9333EA', mb: 0.5 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                  <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Accuracy
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.1 }}>
                  {profile.accuracyRate ?? '96.4%'}
                </Typography>
                <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#9333EA', mt: 0.25 }}>
                  Precision
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* 3. My Certifications Card (Replacing "My Badges") */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
            transition: 'all 0.2s ease',
            '&:hover': {
              boxShadow: '0 8px 26px rgba(0, 0, 0, 0.05)',
              borderColor: '#CBD5E1',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563EB',
                }}
              >
                <WorkspacePremiumOutlinedIcon sx={{ fontSize: 20 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                My Certifications
              </Typography>
            </Box>

            <Link href="/practice" style={{ textDecoration: 'none' }}>
              <Button
                size="small"
                variant="outlined"
                sx={{
                  borderRadius: '9999px',
                  borderColor: '#E2E8F0',
                  color: '#475569',
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  px: 1.75,
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
                }}
              >
                Earn More
              </Button>
            </Link>
          </Box>

          {/* Hexagonal / 3D Badge Certifications Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 2.5,
            }}
          >
            {certifications.map((cert) => {
              const theme = CERT_THEMES[cert.badgeCode] || DEFAULT_CERT_THEME;
              return (
                <Card
                  key={cert.id}
                  elevation={0}
                  onClick={() => onViewCert(cert)}
                  sx={{
                    borderRadius: '20px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    p: 2.5,
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 14px 32px ${theme.glowColor}, 0 4px 12px rgba(0,0,0,0.04)`,
                      borderColor: theme.borderColor,
                      '& .cert-badge-shape': {
                        transform: 'scale(1.06)',
                      },
                      '& .cert-view-link': {
                        color: '#1D4ED8',
                        transform: 'translateX(3px)',
                      },
                    },
                  }}
                >
                  {/* Top subtle decorative ambient glow banner */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: theme.badgeGradient,
                    }}
                  />

                  {/* Top verified badge row */}
                  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      icon={<VerifiedRoundedIcon sx={{ fontSize: '13px !important', color: `${theme.tagColor} !important` }} />}
                      label="Verified"
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        fontWeight: 800,
                        bgcolor: theme.tagBg,
                        color: theme.tagColor,
                        border: `1px solid ${theme.tagBorder}`,
                        borderRadius: '6px',
                        px: 0.25,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        color: '#94A3B8',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {cert.credentialId.split('-').slice(0, 2).join('-')}
                    </Typography>
                  </Box>

                  {/* 3D Glossy Shield / Hexagon Badge */}
                  <Box
                    className="cert-badge-shape"
                    sx={{
                      width: 86,
                      height: 94,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                      transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      filter: `drop-shadow(0 6px 14px ${theme.glowColor})`,
                    }}
                  >
                    {/* Outer Hexagon with signature gradient */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background: theme.badgeGradient,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    />

                    {/* Inner Bevel Rim */}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: '3px',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.2) 100%)',
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                      }}
                    />

                    {/* Content inside badge */}
                    <Box sx={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 0.5 }}>
                      <Typography
                        sx={{
                          fontSize: '1.2rem',
                          fontWeight: 900,
                          color: '#FFFFFF',
                          letterSpacing: '-0.02em',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
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
                          lineHeight: 1.2,
                          mt: 0.2,
                          textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {cert.language}
                      </Typography>

                      {/* Golden Stars Cluster */}
                      <Box sx={{ display: 'flex', gap: 0.25, mt: 0.4 }}>
                        {Array.from({ length: cert.stars || 3 }).map((_, i) => (
                          <StarRoundedIcon
                            key={i}
                            sx={{
                              fontSize: 13,
                              color: theme.starColor,
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>

                  {/* Title */}
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '0.9rem',
                      color: '#0F172A',
                      lineHeight: 1.35,
                      mb: 0.75,
                      minHeight: '2.4em',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {cert.title}
                  </Typography>

                  {/* Skills Pills */}
                  {cert.skills && cert.skills.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 0.5, mb: 1.75 }}>
                      {cert.skills.slice(0, 2).map((skill, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            px: 1,
                            py: 0.2,
                            borderRadius: '6px',
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            color: '#64748B',
                          }}
                        >
                          {skill}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Bottom Action CTA */}
                  <Box
                    className="cert-view-link"
                    sx={{
                      mt: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      color: '#2563EB',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span>View Credential</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Card>
      </Box>

      {/* Medals & Scoring Info Modal */}
      <Dialog
        open={medalsModalOpen}
        onClose={() => setMedalsModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: '20px',
              p: 1.5,
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16)',
              border: '1px solid #E2E8F0',
            },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
          Orchestrate Medals System
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography sx={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
            Medals and rating badges are awarded based on contest performance percentile in global Orchestrate arenas:
          </Typography>
          <Box sx={{ p: 1.5, bgcolor: '#FEF3C7', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <Typography sx={{ fontWeight: 800, color: '#92400E', fontSize: '0.84rem' }}>
              🥇 Gold Medal: Top 5% participants
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Typography sx={{ fontWeight: 800, color: '#475569', fontSize: '0.84rem' }}>
              🥈 Silver Medal: Top 15% participants
            </Typography>
          </Box>
          <Box sx={{ p: 1.5, bgcolor: '#FFF7ED', borderRadius: '12px', border: '1px solid #FFEDD5' }}>
            <Typography sx={{ fontWeight: 800, color: '#C2410C', fontSize: '0.84rem' }}>
              🥉 Bronze Medal: Top 30% participants
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setMedalsModalOpen(false)}
            sx={{ bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', borderRadius: '10px' }}
          >
            Got It
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
