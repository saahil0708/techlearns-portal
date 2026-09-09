'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export interface NewCollegeData {
  name: string;
  code: string;
  domain: string;
  region: string;
  quota: number;
  tier: string;
  adminEmail: string;
}

interface CreateCollegeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewCollegeData) => void;
}

function generateCollegeCode(name: string): string {
  if (!name.trim()) return '';

  // 1. If name contains parentheses like "Swami Vivekanand Institute (SVIET)"
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch && parenMatch[1]) {
    const candidate = parenMatch[1].replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (candidate.length >= 2) return candidate;
  }

  // 2. Remove filler words and extract meaningful acronym
  const words = name
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 0 &&
        !['OF', 'AND', 'THE', 'FOR', 'IN', 'AT', 'DEPT', 'DEPARTMENT', 'COLLEGE', 'INSTITUTE', 'UNIVERSITY'].includes(
          w.toUpperCase()
        )
    );

  if (words.length === 0) {
    const allWords = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
    return allWords.map((w) => w[0]).join('').toUpperCase().slice(0, 6);
  }

  if (words.length === 1) {
    return words[0].slice(0, 8).toUpperCase();
  }

  const acronym = words.map((w) => w[0]).join('').toUpperCase();
  if (acronym.length >= 2 && acronym.length <= 8) {
    return acronym;
  }

  return words.slice(0, 4).map((w) => w[0]).join('').toUpperCase();
}

export default function CreateCollegeModal({ open, onClose, onSubmit }: CreateCollegeModalProps) {
  const [formData, setFormData] = useState<NewCollegeData>({
    name: '',
    code: '',
    domain: '',
    region: 'Asia-Pacific',
    quota: 2500,
    tier: 'Enterprise Tier',
    adminEmail: '',
  });

  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  const handleNameChange = (nameVal: string) => {
    setFormData((prev) => {
      const updated = { ...prev, name: nameVal };
      if (!codeManuallyEdited) {
        updated.code = generateCollegeCode(nameVal);
      }
      return updated;
    });
  };

  const handleAutoGenerateCode = () => {
    const generated = generateCollegeCode(formData.name);
    setFormData((prev) => ({ ...prev, code: generated }));
    setCodeManuallyEdited(false);
  };

  const handleChange = (field: keyof NewCollegeData, value: string | number) => {
    if (field === 'code') {
      setCodeManuallyEdited(true);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;
    onSubmit(formData);
    onClose();
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#F8FAFC',
      borderRadius: '10px',
      color: '#0F172A',
      fontSize: '0.88rem',
      '& fieldset': { borderColor: '#E2E8F0' },
      '&:hover fieldset': { borderColor: '#CBD5E1' },
      '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px' },
    },
    '& .MuiInputLabel-root': {
      color: '#64748B',
      fontSize: '0.88rem',
      '&.Mui-focused': { color: '#2563EB', fontWeight: 600 },
    },
    '& .MuiFormHelperText-root': {
      fontSize: '0.74rem',
      color: '#64748B',
      mt: 0.5,
    },
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
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.2)',
            color: '#0F172A',
            p: 0.5,
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
              flexShrink: 0,
            }}
          >
            <AccountBalanceRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.22rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Onboard New College / Org
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              Create an isolated organization tenant with code-based student enrollment
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: '#64748B', '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, pt: 1, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {/* Institution Full Name */}
          <TextField
            fullWidth
            label="College / Institution Full Name *"
            placeholder="e.g. Swami Vivekanand Institute of Engineering (SVIET)"
            required
            value={formData.name}
            onChange={(e) => handleNameChange(e.target.value)}
            helperText="Official university or institute name"
            sx={inputStyle}
          />

          {/* Unique Join Code & Domain Whitelist */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Institution Unique Code *"
              placeholder="e.g. SVIET"
              required
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase().replace(/\s+/g, '-'))}
              helperText="Students use this code to join this college"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Auto-generate code from name" arrow>
                        <IconButton
                          size="small"
                          onClick={handleAutoGenerateCode}
                          disabled={!formData.name.trim()}
                          sx={{
                            color: '#2563EB',
                            p: 0.5,
                            bgcolor: '#EFF6FF',
                            '&:hover': { bgcolor: '#DBEAFE' },
                          }}
                        >
                          <AutoFixHighRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputStyle}
            />

            <TextField
              label="Email Domain (Optional)"
              placeholder="e.g. sviet.ac.in"
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value.toLowerCase().trim())}
              helperText="Optional: Leave blank for all emails (Gmail, etc.)"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputStyle}
            />
          </Box>

          {/* Region & Tier Selectors */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth sx={inputStyle}>
              <InputLabel id="region-select-label">Geographic Region</InputLabel>
              <Select
                labelId="region-select-label"
                label="Geographic Region"
                value={formData.region}
                onChange={(e) => handleChange('region', e.target.value)}
              >
                <MenuItem value="Asia-Pacific">Asia-Pacific (India / APAC)</MenuItem>
                <MenuItem value="North America">North America (US / Canada)</MenuItem>
                <MenuItem value="Europe">Europe (UK / EU)</MenuItem>
                <MenuItem value="Middle East & Africa">Middle East & Africa</MenuItem>
                <MenuItem value="Latin America">Latin America</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={inputStyle}>
              <InputLabel id="tier-select-label">Subscription Tier</InputLabel>
              <Select
                labelId="tier-select-label"
                label="Subscription Tier"
                value={formData.tier}
                onChange={(e) => handleChange('tier', e.target.value)}
              >
                <MenuItem value="Enterprise Tier">Enterprise Tier (Unlimited Contests)</MenuItem>
                <MenuItem value="Pro Academic">Pro Academic (100 Contests/mo)</MenuItem>
                <MenuItem value="Standard Academic">Standard Academic (Basic LMS)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Seat Quota & Admin Email */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Student Seat Quota"
              type="number"
              value={formData.quota}
              onChange={(e) => handleChange('quota', Number(e.target.value))}
              helperText="Maximum allowed concurrent student accounts"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputStyle}
            />

            <TextField
              label="Primary Admin / Dean Email"
              type="email"
              placeholder="dean.cs@institution.edu"
              value={formData.adminEmail}
              onChange={(e) => handleChange('adminEmail', e.target.value)}
              helperText="Official administrative contact email"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputStyle}
            />
          </Box>

          {/* Batch & Hierarchy Hint Callout */}
          <Box
            sx={{
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              p: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.25,
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#2563EB', mt: 0.15, flexShrink: 0 }} />
            <Typography sx={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45 }}>
              <strong>Hierarchical Batches:</strong> Once onboarded, you can create batches/cohorts (e.g., CSE-2026) under this college. Each batch receives a unique sub-code for automatic student grouping.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={onClose}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderRadius: '8px',
              px: 2,
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disableElevation
            sx={{
              bgcolor: '#2563EB',
              backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              borderRadius: '10px',
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                bgcolor: '#1D4ED8',
                boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            Create Organization Tenant
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
