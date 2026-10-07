'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  TextField,
  Button,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

interface InstitutionSettingsTabProps {
  name: string;
  onNameChange: (val: string) => void;
  address: string;
  onAddressChange: (val: string) => void;
  tier: string;
  onTierChange: (val: string) => void;
  quota: number;
  onQuotaChange: (val: number) => void;
  email: string;
  onEmailChange: (val: string) => void;
  phone: string;
  onPhoneChange: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export default function InstitutionSettingsTab({
  name,
  onNameChange,
  address,
  onAddressChange,
  tier,
  onTierChange,
  quota,
  onQuotaChange,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  onSave,
  isSaving,
}: InstitutionSettingsTabProps) {
  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, fontSize: '1.05rem' }}>
        Institution Profile & Subscription Settings
      </Typography>
      <Typography sx={{ color: '#64748B', fontSize: '0.84rem', mb: 3 }}>
        Configure organization information, student seat quota allocation, and licensing tier.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
        <TextField
          label="Institution Name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          fullWidth
          size="small"
        />

        <TextField
          label="Campus Location / Address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          fullWidth
          size="small"
        />

        <Box>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', mb: 0.5 }}>
            Licensing Tier
          </Typography>
          <Select
            size="small"
            fullWidth
            value={tier}
            onChange={(e) => onTierChange(e.target.value)}
          >
            <MenuItem value="Standard Academic">Standard Academic</MenuItem>
            <MenuItem value="Enterprise University">Enterprise University</MenuItem>
            <MenuItem value="Global Research Partner">Global Research Partner</MenuItem>
          </Select>
        </Box>

        <TextField
          label="Student License Seat Quota"
          type="number"
          value={quota}
          onChange={(e) => onQuotaChange(Number(e.target.value))}
          fullWidth
          size="small"
        />

        <TextField
          label="Official Contact Email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          fullWidth
          size="small"
        />

        <TextField
          label="Helpline / Phone Number"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          fullWidth
          size="small"
        />
      </Box>

      <Box sx={{ mt: 3.5, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <SaveRoundedIcon />}
          sx={{
            bgcolor: '#2563EB',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 700,
            px: 3.5,
            py: 0.85,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {isSaving ? 'Saving Changes...' : 'Save Institution Profile'}
        </Button>
      </Box>
    </Card>
  );
}
