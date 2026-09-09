'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'COLLEGE_ADMIN'
  | 'SCHOOL_ADMIN'
  | 'FACULTY'
  | 'STUDENT'
  | 'RECRUITER';

export interface NewUserData {
  name: string;
  handle: string;
  email: string;
  password?: string;
  role: UserRole;
  institutionType: 'College' | 'School' | 'Independent';
  institutionName: string;
  sendInviteEmail: boolean;
}

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewUserData) => void;
}

export default function CreateUserModal({ open, onClose, onCreate }: CreateUserModalProps) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('TemporaryPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('FACULTY');
  const [institutionType, setInstitutionType] = useState<'College' | 'School' | 'Independent'>('College');
  const [institutionName, setInstitutionName] = useState('Stanford University - Dept of CS');

  const borderColor = '#E2E8F0';

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(`${result}@2026!`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !handle) return;

    onCreate({
      name,
      handle: handle.replace(/^@/, ''),
      email,
      password: password.trim() || 'TemporaryPass123!',
      role,
      institutionType,
      institutionName,
      sendInviteEmail: true,
    });

    // Reset & close
    setName('');
    setHandle('');
    setEmail('');
    setPassword('TemporaryPass123!');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: '20px 28px',
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: '#F8FAFC',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '9999px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BFDBFE',
              }}
            >
              <PersonAddRoundedIcon sx={{ color: '#2563EB', fontSize: '1.3rem' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
                Provision New User Account
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
                Create platform credentials with role-based access control
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            sx={{
              color: '#64748B',
              borderRadius: '9999px',
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3.5, pt: '28px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Full Name & Handle */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 1fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                FULL NAME *
              </Typography>
              <TextField
                required
                size="small"
                placeholder="e.g. Dr. Robert Sedgewick"
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BadgeRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.85rem',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                USERNAME / HANDLE *
              </Typography>
              <TextField
                required
                size="small"
                placeholder="e.g. sedgewick_cs"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AlternateEmailRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.85rem',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Email Address */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              INSTITUTIONAL / WORK EMAIL *
            </Typography>
            <TextField
              required
              type="email"
              size="small"
              placeholder="e.g. r.sedgewick@stanford.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '9999px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.85rem',
                },
              }}
            />
          </Box>

          {/* Initial Password Section */}
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <LockRoundedIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                  INITIAL ACCOUNT PASSWORD
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AutorenewRoundedIcon sx={{ fontSize: 15 }} />}
                onClick={handleGeneratePassword}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#2563EB',
                  borderColor: '#BFDBFE',
                  bgcolor: '#EFF6FF',
                  py: 0.2,
                  px: 1,
                  borderRadius: '6px',
                  '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
                }}
              >
                Generate
              </Button>
            </Box>
            <TextField
              fullWidth
              size="small"
              type={showPassword ? 'text' : 'password'}
              placeholder="e.g. TemporaryPass123!"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        sx={{ color: '#64748B' }}
                      >
                        {showPassword ? (
                          <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} />
                        ) : (
                          <VisibilityRoundedIcon sx={{ fontSize: 18 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#FFFFFF',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: '#CBD5E1' },
                },
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 0.8 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.72rem' }}>
                Default: <code style={{ color: '#2563EB', fontWeight: 600 }}>TemporaryPass123!</code>
              </Typography>
              <Chip
                label="User can change after login"
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}
              />
            </Box>
          </Box>

          {/* Role & Access Tier */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              ROLE & PERMISSION LEVEL *
            </Typography>
            <Select
              size="small"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              sx={{
                bgcolor: '#F8FAFC',
                color: '#0F172A',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              }}
            >
              <MenuItem value="SUPER_ADMIN">👑 Super Administrator (Full Cluster Control)</MenuItem>
              <MenuItem value="COLLEGE_ADMIN">🏛️ College Administrator (Tenant Admin)</MenuItem>
              <MenuItem value="SCHOOL_ADMIN">🏫 School Administrator (STEM Admin)</MenuItem>
              <MenuItem value="FACULTY">👨‍🏫 Faculty / Instructor (Course & Problem Creator)</MenuItem>
              <MenuItem value="RECRUITER">💼 Recruiter / Talent Scout</MenuItem>
            </Select>
          </Box>

          {/* Institution Affiliation */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1.5fr' }, gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                INSTITUTION TYPE
              </Typography>
              <Select
                size="small"
                value={institutionType}
                onChange={(e) => setInstitutionType(e.target.value as any)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="College">University / College</MenuItem>
                <MenuItem value="School">K-12 / High School</MenuItem>
                <MenuItem value="Independent">Independent Organization</MenuItem>
              </Select>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                ASSIGNED INSTITUTION
              </Typography>
              <TextField
                size="small"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '9999px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.85rem',
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: '16px 28px',
            borderTop: `1px solid ${borderColor}`,
            bgcolor: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Button
            onClick={onClose}
            sx={{
              color: '#64748B',
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!name || !email || !handle}
            sx={{
              borderRadius: '9999px',
              bgcolor: '#2563EB',
              px: 3.5,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
              '&:hover': { bgcolor: '#1D4ED8' },
              '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
            }}
          >
            Create & Send Invitation
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
