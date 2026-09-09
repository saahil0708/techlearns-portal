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
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

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

export default function CreateCollegeModal({ open, onClose, onSubmit }: CreateCollegeModalProps) {
  const [formData, setFormData] = useState<NewCollegeData>({
    name: '',
    code: '',
    domain: '',
    region: 'North America',
    quota: 2500,
    tier: 'Enterprise Tier',
    adminEmail: '',
  });

  const handleChange = (field: keyof NewCollegeData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;
    onSubmit(formData);
    onClose();
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      bgcolor: '#F8FAFC',
      borderRadius: '8px',
      color: '#0F172A',
      fontSize: '0.85rem',
      '& fieldset': { borderColor: '#E2E8F0' },
      '&:hover fieldset': { borderColor: '#CBD5E1' },
      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
    },
    '& .MuiInputLabel-root': {
      color: '#64748B',
      fontSize: '0.85rem',
      '&.Mui-focused': { color: '#2563EB' },
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
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            color: '#0F172A',
            p: 1,
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <AccountBalanceRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
              Onboard New College / Org
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              Create an isolated tenant with custom seat quotas & department roles
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
        <DialogContent sx={{ px: 3.5, pt: '28px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Institution Name */}
          <TextField
            fullWidth
            label="College / Institution Full Name"
            placeholder="e.g. Stanford University - Dept of Computing"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            sx={inputStyle}
          />

          {/* Code & Domain Whitelist */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Tenant Code / Slug"
              placeholder="e.g. STAN-CS"
              required
              value={formData.code}
              onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={inputStyle}
            />

            <TextField
              label="Email Domain Whitelist"
              placeholder="e.g. stanford.edu"
              value={formData.domain}
              onChange={(e) => handleChange('domain', e.target.value)}
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
                <MenuItem value="North America">North America</MenuItem>
                <MenuItem value="Asia-Pacific">Asia-Pacific</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
                <MenuItem value="Latin America">Latin America</MenuItem>
                <MenuItem value="Middle East & Africa">Middle East & Africa</MenuItem>
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
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 1.5, display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            onClick={onClose}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              borderRadius: '8px',
              px: 3,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              '&:hover': {
                bgcolor: '#1D4ED8',
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

