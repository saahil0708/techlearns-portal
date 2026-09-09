'use client';

import React, { useState, useEffect } from 'react';
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
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import type { CollegeEntity } from './CollegesDirectoryClient';

export interface UpdateCollegeData {
  id: string;
  name: string;
  code: string;
  domain?: string;
  region?: string;
  quota?: number;
  tier?: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface EditCollegeModalProps {
  open: boolean;
  college: CollegeEntity | null;
  onClose: () => void;
  onSubmit: (data: UpdateCollegeData) => Promise<void> | void;
}

export default function EditCollegeModal({ open, college, onClose, onSubmit }: EditCollegeModalProps) {
  const [formData, setFormData] = useState<UpdateCollegeData>({
    id: '',
    name: '',
    code: '',
    domain: '',
    region: 'Asia-Pacific',
    quota: 5000,
    tier: 'Enterprise Tier',
    email: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (college) {
      setFormData({
        id: college.id,
        name: college.name || '',
        code: college.code || '',
        domain: college.domain || '',
        region: college.region || 'Global',
        quota: college.maxQuota || 5000,
        tier: college.tier || 'Enterprise Tier',
        email: '',
        phone: '',
        status: college.status === 'Active' ? 'ACTIVE' : college.status === 'Suspended' ? 'SUSPENDED' : 'ACTIVE',
      });
      setErrorMessage(null);
    }
  }, [college, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Institution name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update college details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!college) return null;

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            p: 1,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          },
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <AccountBalanceRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
              Edit College / Tenant Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Update institution configuration, quota allocation, and status
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: '#94A3B8',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {errorMessage && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '10px',
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              {errorMessage}
            </Box>
          )}

          {/* Institution Name */}
          <TextField
            label="Institution Name"
            placeholder="e.g. Stanford University - Dept of CS"
            fullWidth
            required
            size="small"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Code and Status Row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Tenant Code"
              placeholder="e.g. STAN-CS"
              fullWidth
              size="small"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="PROVISIONING">Provisioning</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Domain & Contact Email */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Domain Identifier"
              placeholder="e.g. sviet.edu"
              fullWidth
              size="small"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Admin / Contact Email"
              type="email"
              placeholder="e.g. admin@sviet.edu"
              fullWidth
              size="small"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Region / Address & Phone */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Region / Location"
              placeholder="e.g. North America or Global"
              fullWidth
              size="small"
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Phone Number"
              placeholder="e.g. +1-555-0199"
              fullWidth
              size="small"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          {/* Subscription Tier & Quota */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Subscription Tier</InputLabel>
              <Select
                value={formData.tier}
                label="Subscription Tier"
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
              >
                <MenuItem value="Enterprise Tier">Enterprise Tier</MenuItem>
                <MenuItem value="Pro Academic">Pro Academic</MenuItem>
                <MenuItem value="Standard Academic">Standard Academic</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Seat Quota"
              type="number"
              fullWidth
              size="small"
              value={formData.quota}
              onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1.5 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#64748B',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '10px',
              px: 2.5,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '10px',
              px: 3,
              py: 1,
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            {isSubmitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Saving...</span>
              </Box>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
