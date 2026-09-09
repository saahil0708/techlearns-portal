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
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';

export interface NewStudentData {
  name: string;
  handle: string;
  email: string;
  password?: string;
  studentId: string;
  institutionType: 'College' | 'School' | 'Independent';
  institutionName: string;
  cohort: string;
}

interface CreateStudentModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewStudentData) => void;
}

export default function CreateStudentModal({ open, onClose, onCreate }: CreateStudentModalProps) {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('TemporaryPass123!');
  const [showPassword, setShowPassword] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [institutionType, setInstitutionType] = useState<'College' | 'School' | 'Independent'>('College');
  const [institutionName, setInstitutionName] = useState('Stanford University');
  const [cohort, setCohort] = useState('Batch 2026 - CS Alpha');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(`${result}@2026!`);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!handle) {
      const generated = val.toLowerCase().replace(/[^a-z0-9]/g, '_');
      setHandle(generated);
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!handle.trim()) errs.handle = 'Handle is required';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate({
      name,
      handle: handle.startsWith('@') ? handle.substring(1) : handle,
      email,
      password: password.trim() || 'TemporaryPass123!',
      studentId: studentId.trim() || `STU-${Date.now().toString().slice(-5)}`,
      institutionType,
      institutionName:
        institutionType === 'Independent'
          ? 'Self-Enrolled'
          : institutionName.trim() || 'Academic Campus',
      cohort:
        institutionType === 'Independent'
          ? 'No Batch Assigned'
          : cohort.trim() || 'Batch 2026 - CS Alpha',
    });
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setHandle('');
    setEmail('');
    setPassword('TemporaryPass123!');
    setShowPassword(false);
    setStudentId('');
    setInstitutionType('College');
    setInstitutionName('Stanford University');
    setCohort('Batch 2026 - CS Alpha');
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            maxWidth: 540,
            width: '100%',
            p: 1.5,
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '12px',
            bgcolor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PersonRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', letterSpacing: '-0.02em' }}>
            Register / Invite Student
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
            Provision learner identity, assign institution cohort & contest tracks
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3.5, pt: '28px !important', pb: 3 }}>
        {/* Full Name */}
        <Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Student Full Name *
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Maya Lin"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />
        </Box>

        {/* Handle and Student ID */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Platform Handle *
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. mayalin_coder"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              error={Boolean(errors.handle)}
              helperText={errors.handle}
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
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontFamily: 'monospace',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Student ID / Roll No
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. STAN-2026-042"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
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
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  fontFamily: 'monospace',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>
        </Box>

        {/* Email Address */}
        <Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Email Address *
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. maya.lin@stanford.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
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
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& fieldset': { borderColor: '#E2E8F0' },
              },
            }}
          />
        </Box>

        {/* Initial Password Section */}
        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LockRoundedIcon sx={{ color: '#2563EB', fontSize: 18 }} />
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A' }}>
                Account Initial Password
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
            placeholder="Set initial password (e.g. TemporaryPass123!)"
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
                borderRadius: '8px',
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
              label="Student can change after login"
              size="small"
              sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#475569' }}
            />
          </Box>
        </Box>

        {/* Institution Type & Organization */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Affiliation Type
            </Typography>
            <Select
              fullWidth
              size="small"
              value={institutionType}
              onChange={(e) => setInstitutionType(e.target.value as any)}
              sx={{
                borderRadius: '10px',
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              }}
            >
              <MenuItem value="College">College / University</MenuItem>
              <MenuItem value="School">High School / STEM</MenuItem>
              <MenuItem value="Independent">Independent Learner</MenuItem>
            </Select>
          </Box>

          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Institution Name
            </Typography>
            {institutionType === 'Independent' ? (
              <TextField
                fullWidth
                size="small"
                disabled
                value="Self-Paced Community Learner"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F1F5F9',
                  },
                }}
              />
            ) : (
              <TextField
                fullWidth
                size="small"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder={institutionType === 'College' ? 'e.g. Stanford University' : 'e.g. Stuyvesant High'}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    bgcolor: '#F8FAFC',
                    '& fieldset': { borderColor: '#E2E8F0' },
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Cohort Section */}
        {institutionType !== 'Independent' && (
          <Box>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
              Assigned Cohort / Section
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Batch 2026 - CS Alpha or Grade 11 AP CS"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  bgcolor: '#F8FAFC',
                  '& fieldset': { borderColor: '#E2E8F0' },
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            textTransform: 'none',
            color: '#64748B',
            fontWeight: 600,
            borderRadius: '8px',
            px: 2,
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#2563EB',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '8px',
            px: 2.75,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Register Student
        </Button>
      </DialogActions>
    </Dialog>
  );
}
