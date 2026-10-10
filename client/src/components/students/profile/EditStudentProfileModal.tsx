'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Divider,
  Avatar,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { StudentProfileData } from '@/types/student-profile';
import { uploadFileToAzureBlob } from '@/lib/storage';

interface EditStudentProfileModalProps {
  open: boolean;
  profile: StudentProfileData;
  onClose: () => void;
  onSave: (updated: Partial<StudentProfileData>) => Promise<void>;
}

export interface CountryData {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: CountryData[] = [
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩' },
  { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal', dialCode: '+977', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
];

export default function EditStudentProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: EditStudentProfileModalProps) {
  const [name, setName] = useState(profile.name || '');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [bio, setBio] = useState(profile.bio || '');
  const [institution, setInstitution] = useState(profile.institution || '');
  const [department, setDepartment] = useState((profile as any).department || '');
  const [batch, setBatch] = useState((profile as any).batch || (profile as any).graduationYear || '');
  const [rollNo, setRollNo] = useState((profile as any).rollNo || (profile as any).rollNumber || '');
  const [location, setLocation] = useState(profile.location || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || '');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || '');
  const [leetcodeUrl, setLeetcodeUrl] = useState((profile as any).leetcodeUrl || '');
  const [codeforcesUrl, setCodeforcesUrl] = useState((profile as any).codeforcesUrl || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    (profile as any).preferredSkills || (profile as any).skills || ['C++', 'Python', 'React']
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractCountryAndPhone = (rawPhone?: string, countryName?: string) => {
    let matchedCountry = COUNTRIES.find(
      (c) => c.name.toLowerCase() === (countryName || '').trim().toLowerCase()
    );

    if (!rawPhone) {
      return {
        countryCode: matchedCountry ? matchedCountry.code : 'IN',
        digits: '',
      };
    }

    const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    const foundByDial = sorted.find((c) => rawPhone.startsWith(c.dialCode));

    if (foundByDial) {
      let remainder = rawPhone.slice(foundByDial.dialCode.length);
      if (remainder.startsWith('-') || remainder.startsWith(' ')) {
        remainder = remainder.slice(1);
      }
      return {
        countryCode: matchedCountry ? matchedCountry.code : foundByDial.code,
        digits: remainder.trim(),
      };
    }

    return {
      countryCode: matchedCountry ? matchedCountry.code : 'IN',
      digits: rawPhone.trim(),
    };
  };

  const POPULAR_SKILLS = [
    'C++',
    'Python',
    'Java',
    'TypeScript',
    'JavaScript',
    'Go',
    'Rust',
    'SQL',
    'React',
    'Next.js',
    'Node.js',
    'Docker',
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  useEffect(() => {
    if (open) {
      setName(profile.name || '');
      const parsed = extractCountryAndPhone(profile.phone, profile.country);
      setSelectedCountryCode(parsed.countryCode);
      setPhoneDigits(parsed.digits);
      setBio(profile.bio || '');
      setInstitution(profile.institution || '');
      setDepartment((profile as any).department || '');
      setBatch((profile as any).batch || (profile as any).graduationYear || '');
      setRollNo((profile as any).rollNo || (profile as any).rollNumber || '');
      setLocation(profile.location || '');
      setAvatarUrl(profile.avatarUrl || '');
      setResumeUrl(profile.resumeUrl || '');
      setGithubUrl(profile.githubUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setWebsiteUrl(profile.websiteUrl || '');
      setLeetcodeUrl((profile as any).leetcodeUrl || '');
      setCodeforcesUrl((profile as any).codeforcesUrl || '');
      setSelectedSkills(
        (profile as any).preferredSkills || (profile as any).skills || ['C++', 'Python', 'React']
      );
      setErrorMessage(null);
    }
  }, [open, profile]);

  const compressFileFallback = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        if (!rawUrl) {
          resolve('');
          return;
        }

        const img = new Image();
        img.onload = () => {
          const maxDim = 320;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.82);
            resolve(compressed);
          } else {
            resolve(rawUrl);
          }
        };
        img.onerror = () => resolve(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1. Show instant local preview
      const localPreview = URL.createObjectURL(file);
      setAvatarUrl(localPreview);
      setUploadingAvatar(true);
      setErrorMessage(null);

      try {
        // 2. Upload directly to Azure Blob Storage under 'avatars/'
        const result = await uploadFileToAzureBlob(file, {
          folder: 'avatars',
          maxSizeBytes: 10 * 1024 * 1024, // 10MB limit
          allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        });
        setAvatarUrl(result.blobUrl);
      } catch (err: any) {
        console.warn('Azure direct storage upload failed, falling back to compressed data URL:', err);
        try {
          const compressed = await compressFileFallback(file);
          if (compressed) {
            setAvatarUrl(compressed);
          }
        } catch (fallbackErr) {
          console.error('Fallback image compression failed:', fallbackErr);
          setErrorMessage('Failed to process uploaded image. Please try another photo.');
        }
      } finally {
        URL.revokeObjectURL(localPreview);
        setUploadingAvatar(false);
      }
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      const activeCountry = COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];
      const trimmedDigits = phoneDigits.trim();
      const formattedPhone = trimmedDigits ? `${activeCountry.dialCode}-${trimmedDigits}` : '';

      await onSave({
        name,
        phone: formattedPhone,
        country: activeCountry.name,
        countryFlag: activeCountry.flag,
        bio,
        institution,
        department,
        location,
        avatarUrl,
        resumeUrl,
        githubUrl,
        linkedinUrl,
        websiteUrl,
        ...({
          rollNo,
          rollNumber: rollNo,
          batch,
          graduationYear: batch,
          leetcodeUrl,
          codeforcesUrl,
          preferredSkills: selectedSkills,
          skills: selectedSkills,
        } as any),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save profile details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (n: string) => {
    if (!n) return 'U';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
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
            borderRadius: '24px',
            p: 0,
            overflow: 'hidden',
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.18)',
            border: '1px solid #E2E8F0',
            bgcolor: '#FFFFFF',
          },
        },
      }}
    >
      {/* Modal Header */}
      <DialogTitle
        sx={{
          p: 3,
          pb: 2.5,
          borderBottom: '1px solid #F1F5F9',
          bgcolor: '#FAFAFA',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#FAF5FF',
              color: '#0B1F3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #F3E8FF',
            }}
          >
            <PersonRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 850, color: '#0F172A', fontSize: '1.18rem', letterSpacing: '-0.01em' }}>
              Edit Personal & Profile Details
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.2 }}>
              Update your profile photo, academic identity, and developer credentials.
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#64748B',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      {/* Modal Body / Form */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3.5 }, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        {errorMessage && (
          <Box
            sx={{
              p: 1.8,
              borderRadius: '12px',
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '0.82rem',
              fontWeight: 650,
            }}
          >
            {errorMessage}
          </Box>
        )}

        {/* Profile Picture / Avatar Showcase Strip */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: '16px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Avatar
            src={avatarUrl || undefined}
            sx={{
              width: 76,
              height: 76,
              bgcolor: '#0B1F3A',
              fontSize: '1.5rem',
              fontWeight: 900,
              boxShadow: '0 4px 14px rgba(91, 45, 144, 0.25)',
              border: '3px solid #FFFFFF',
            }}
          >
            {getInitials(name)}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}>
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
              Profile Photo & Avatar
            </Typography>
            <Typography sx={{ fontSize: '0.74rem', color: '#64748B', mt: 0.2, mb: 1.2 }}>
              Upload a PNG, JPG, or select a high-resolution developer preset avatar.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                size="small"
                variant="outlined"
                disabled={uploadingAvatar}
                startIcon={
                  uploadingAvatar ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <CloudUploadRoundedIcon sx={{ fontSize: 16 }} />
                  )
                }
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  fontSize: '0.74rem',
                  fontWeight: 750,
                  textTransform: 'none',
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  borderColor: '#CBD5E1',
                  color: '#1E293B',
                  py: 0.4,
                  px: 1.4,
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
              </Button>

              {avatarUrl && (
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setAvatarUrl('')}
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 750,
                    textTransform: 'none',
                    borderRadius: '8px',
                    py: 0.4,
                    px: 1.2,
                  }}
                >
                  Remove
                </Button>
              )}

              {/* Preset Avatars */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, ml: { sm: 1 } }}>
                <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                {PRESET_AVATARS.map((preset, idx) => (
                  <Avatar
                    key={idx}
                    src={preset}
                    onClick={() => setAvatarUrl(preset)}
                    sx={{
                      width: 26,
                      height: 26,
                      cursor: 'pointer',
                      border: avatarUrl === preset ? '2px solid #0B1F3A' : '1px solid #E2E8F0',
                      transition: 'transform 0.15s ease',
                      '&:hover': { transform: 'scale(1.15)' },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Section 1: Basic Identity & Contact Information */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              01 • Personal & Contact Information
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#F1F5F9' }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mona Sharma"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            {/* Country Selector */}
            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}>
              <InputLabel id="country-select-label">Country / Region</InputLabel>
              <Select
                labelId="country-select-label"
                label="Country / Region"
                value={selectedCountryCode}
                onChange={(e) => setSelectedCountryCode(e.target.value)}
                renderValue={(val) => {
                  const c = COUNTRIES.find((item) => item.code === val) || COUNTRIES[0];
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.1rem' }}>{c.flag}</span>
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B', ml: 'auto' }}>({c.dialCode})</Typography>
                    </Box>
                  );
                }}
              >
                {COUNTRIES.map((c) => (
                  <MenuItem key={c.code} value={c.code} sx={{ display: 'flex', alignItems: 'center', gap: 1.2, py: 1 }}>
                    <span style={{ fontSize: '1.15rem' }}>{c.flag}</span>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A', flex: 1 }}>{c.name}</Typography>
                    <Chip label={c.dialCode} size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 750, bgcolor: '#FAF5FF', color: '#0B1F3A' }} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Phone Number with synchronized Dial Code */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ minWidth: 105, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}>
                <Select
                  value={selectedCountryCode}
                  onChange={(e) => setSelectedCountryCode(e.target.value)}
                  renderValue={(val) => {
                    const c = COUNTRIES.find((item) => item.code === val) || COUNTRIES[0];
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        <span>{c.flag}</span>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }}>{c.dialCode}</Typography>
                      </Box>
                    );
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c.code} value={c.code} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span>{c.flag}</span>
                      <Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.name}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: '#64748B', ml: 'auto' }}>{c.dialCode}</Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Phone Number"
                fullWidth
                size="small"
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value)}
                placeholder="9474156798"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
              />
            </Box>

            <TextField
              label="Location (City, State / Region)"
              fullWidth
              size="small"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bengaluru, Karnataka"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <TextField
                label="Student Roll No / University Registration ID"
                fullWidth
                size="small"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                placeholder="e.g. CS2023-8849"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
              />
            </Box>
          </Box>
        </Box>

        {/* Section 2: Academic & Institutional Affiliation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              02 • Academic & University Affiliation
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#F1F5F9' }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr 0.8fr' }, gap: 2 }}>
            <TextField
              label="College / Institution"
              fullWidth
              size="small"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Stanford University / National Institute of Technology"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <TextField
              label="Department / Degree Program"
              fullWidth
              size="small"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. B.Tech Computer Science & Eng"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountTreeRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <TextField
              label="Graduation Batch"
              fullWidth
              size="small"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              placeholder="e.g. Class of 2027"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarTodayRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />
          </Box>
        </Box>

        {/* Section 3: Technical Skills & Core Languages */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              03 • Preferred Tech Stack & Languages
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#F1F5F9' }} />
          </Box>

          <Box sx={{ p: 2, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.2 }}>
              <CodeRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 750, color: '#334155' }}>
                Select Your Primary Coding Languages & Technologies
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
              {POPULAR_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <Chip
                    key={skill}
                    label={skill}
                    onClick={() => toggleSkill(skill)}
                    sx={{
                      fontSize: '0.76rem',
                      fontWeight: 750,
                      cursor: 'pointer',
                      borderRadius: '8px',
                      transition: 'all 0.15s ease',
                      bgcolor: isSelected ? '#0B1F3A' : '#FFFFFF',
                      color: isSelected ? '#FFFFFF' : '#475569',
                      border: isSelected ? '1px solid #17366E' : '1px solid #CBD5E1',
                      boxShadow: isSelected ? '0 2px 8px rgba(91, 45, 144, 0.25)' : 'none',
                      '&:hover': {
                        bgcolor: isSelected ? '#17366E' : '#F1F5F9',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        </Box>

        {/* Section 4: Professional Bio & Resume Document */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              04 • Professional Bio & Resume Link
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#F1F5F9' }} />
          </Box>

          <TextField
            label="Professional Bio"
            multiline
            rows={3}
            fullWidth
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short developer summary highlighting your passions, algorithms background, and project goals..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                    <EditNoteRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            helperText={`${bio.length}/300 characters`}
            sx={{
              '& .MuiOutlinedInput-root': { borderRadius: '12px', fontSize: '0.84rem' },
              '& .MuiFormHelperText-root': { textAlign: 'right', fontSize: '0.7rem', color: '#94A3B8' },
            }}
          />

          <TextField
            label="Resume / CV URL (Google Drive, Dropbox, or Hosted PDF)"
            fullWidth
            size="small"
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/your-resume-link/view"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
          />
        </Box>

        {/* Section 5: Developer & Competitive Profiles */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#0B1F3A', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              05 • Developer & Competitive Profiles
            </Typography>
            <Divider sx={{ flex: 1, borderColor: '#F1F5F9' }} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="GitHub Profile URL"
              fullWidth
              size="small"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/yourhandle"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaGithub size={16} color="#475569" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <TextField
              label="LinkedIn Profile URL"
              fullWidth
              size="small"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/yourhandle"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLinkedin size={16} color="#0A66C2" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <TextField
              label="LeetCode Profile URL"
              fullWidth
              size="small"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              placeholder="https://leetcode.com/u/yourhandle"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TerminalRoundedIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <TextField
              label="Codeforces Profile URL"
              fullWidth
              size="small"
              value={codeforcesUrl}
              onChange={(e) => setCodeforcesUrl(e.target.value)}
              placeholder="https://codeforces.com/profile/yourhandle"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: '#5B2D90' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
            />

            <Box sx={{ gridColumn: { sm: '1 / -1' } }}>
              <TextField
                label="Portfolio / Personal Website URL"
                fullWidth
                size="small"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourportfolio.dev"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.84rem' } }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions
        sx={{
          p: 2.5,
          px: 3.5,
          gap: 1.5,
          bgcolor: '#FAFAFA',
          borderTop: '1px solid #F1F5F9',
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: '#64748B',
            fontWeight: 750,
            fontSize: '0.84rem',
            borderRadius: '10px',
            textTransform: 'none',
            px: 2.5,
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || uploadingAvatar || !name.trim()}
          startIcon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            bgcolor: '#0B1F3A',
            fontWeight: 800,
            fontSize: '0.84rem',
            textTransform: 'none',
            px: 3.2,
            py: 1,
            borderRadius: '10px',
            boxShadow: '0 4px 14px rgba(91, 45, 144, 0.28)',
            '&:hover': { bgcolor: '#17366E' },
          }}
        >
          {saving ? 'Saving Details...' : uploadingAvatar ? 'Uploading Photo...' : 'Save Profile Details'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
