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
import type { InstitutionEntity } from './InstitutionsDirectoryClient';

export interface UpdateInstitutionData {
  id: string;
  name: string;
  code: string;
  domain?: string;
  region?: string;
  quota?: number;
  email?: string;
  phone?: string;
  status?: string;
}

export type UpdateCollegeData = UpdateInstitutionData;

interface EditInstitutionModalProps {
  open: boolean;
  institution: InstitutionEntity | null;
  onClose: () => void;
  onSubmit: (data: UpdateInstitutionData) => Promise<void> | void;
}

export default function EditInstitutionModal({ open, institution, onClose, onSubmit }: EditInstitutionModalProps) {
  const [formData, setFormData] = useState<UpdateInstitutionData>({
    id: '',
    name: '',
    code: '',
    domain: '',
    region: 'Asia-Pacific',
    quota: 5000,
    email: '',
    phone: '',
    status: 'ACTIVE',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (institution) {
      setFormData({
        id: institution.id,
        name: institution.name || '',
        code: institution.code || '',
        domain: institution.domain || '',
        region: institution.region || 'Global',
        quota: institution.maxQuota || 5000,
        email: '',
        phone: '',
        status: institution.status === 'Active' ? 'ACTIVE' : institution.status === 'Suspended' ? 'SUSPENDED' : 'ACTIVE',
      });
      setErrorMessage(null);
    }
  }, [institution, open]);

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
      setErrorMessage(err?.message || 'Failed to update institution details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!institution) return null;

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
              Edit Institution Details
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
            color: '#64748B',
            '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2.5 }}>
        {errorMessage && (
          <Box
            sx={{
              bgcolor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              p: 1.5,
              borderRadius: '10px',
              fontSize: '0.85rem',
              mb: 2,
            }}
          >
            {errorMessage}
          </Box>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Institution Name"
            fullWidth
            required
            size="small"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Unique Code"
              size="small"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '-') })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <CodeRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              label="Domain"
              size="small"
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase().trim() })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>

            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
              <InputLabel id="edit-region-label">Region / Location</InputLabel>
              <Select
                labelId="edit-region-label"
                label="Region / Location"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              >
                <MenuItem value="Asia-Pacific">Asia-Pacific</MenuItem>
                <MenuItem value="North America">North America</MenuItem>
                <MenuItem value="Europe">Europe</MenuItem>
                <MenuItem value="Middle East & Africa">Middle East & Africa</MenuItem>
                <MenuItem value="Latin America">Latin America</MenuItem>
                <MenuItem value="Global">Global</MenuItem>
              </Select>
            </FormControl>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Seat Quota"
              type="number"
              size="small"
              value={formData.quota}
              onChange={(e) => setFormData({ ...formData, quota: Number(e.target.value) })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <FormControl size="small" fullWidth sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
              <InputLabel id="edit-status-label">Status</InputLabel>
              <Select
                labelId="edit-status-label"
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="Contact Email"
              type="email"
              size="small"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />

            <TextField
              label="Contact Phone"
              size="small"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneRoundedIcon sx={{ color: '#64748B', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{
            color: '#64748B',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '10px',
            '&:hover': { bgcolor: '#F1F5F9' },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            px: 3,
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
