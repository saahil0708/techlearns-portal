'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  Paper,
  Divider,
} from '@mui/material';

// Icons
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';

import InstitutionAdminSidebar from '@/components/institution-admin/layout/InstitutionAdminSidebar';
import InstitutionAdminNavbar from '@/components/institution-admin/layout/InstitutionAdminNavbar';
import { useAppSelector } from '@/store/hooks';
import { useToast } from '@/context/ToastContext';

export default function InstitutionSettingsClient() {
  const user = useAppSelector((state) => state.auth.user);
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const activeMemberships = Array.isArray(user?.memberships) ? user.memberships : [];
  const primaryMembership =
    activeMemberships.find(
      (m: any) =>
        m?.role === 'INSTITUTION_ADMIN' ||
        m?.role === 'COLLEGE_ADMIN' ||
        m?.role === 'FACULTY'
    ) || activeMemberships[0];

  const collegeName =
    primaryMembership?.institution?.name ||
    primaryMembership?.college?.name ||
    (user as any)?.institution ||
    'Academic Institution';

  const collegeCode =
    primaryMembership?.institution?.code ||
    primaryMembership?.college?.code ||
    'CAMPUS';

  const [name, setName] = useState(collegeName);
  const [code, setCode] = useState(collegeCode);
  const [domainWhitelist, setDomainWhitelist] = useState('campus.edu, college.ac.in');
  const [contactEmail, setContactEmail] = useState(user?.email || 'admin@campus.edu');
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Institutional campus profile updated successfully.', 'Settings Saved');
    }, 500);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(30, 64, 175, 0.05) 0%, transparent 45%),
          radial-gradient(ellipse at 85% 20%, rgba(14, 165, 233, 0.04) 0%, transparent 45%),
          radial-gradient(ellipse at 50% 90%, rgba(5, 150, 105, 0.03) 0%, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      <InstitutionAdminSidebar />

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Box
          sx={{
            maxWidth: 1000,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3.5,
            pb: 6,
          }}
        >
          <InstitutionAdminNavbar
            collegeName={collegeName}
            collegeCode={collegeCode}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Header */}
          <Box
            sx={{
              bgcolor: '#FFFFFF',
              borderRadius: '16px',
              p: 3,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: '#0F172A' }}>
                Campus Configuration & Settings
              </Typography>
              <Chip
                label="ADMIN CONTROLS"
                size="small"
                sx={{ fontWeight: 700, bgcolor: 'rgba(30, 64, 175, 0.1)', color: '#1E40AF', borderRadius: '6px' }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', mt: 0.5 }}>
              Configure institutional security policies, authorized domain whitelists, and campus details.
            </Typography>
          </Box>

          {/* Form */}
          <Paper
            elevation={0}
            component="form"
            onSubmit={handleSave}
            sx={{
              p: 3.5,
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              bgcolor: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AdminPanelSettingsRoundedIcon sx={{ color: '#1E40AF', fontSize: 24 }} />
              <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }}>
                Institutional Profile
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2.5 }}>
              <TextField
                label="Campus / Institution Name"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: '10px' } } }}
              />
              <TextField
                label="Institutional Code"
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: '10px' } } }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
              <TextField
                label="Primary Contact Email"
                type="email"
                fullWidth
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: '10px' } } }}
              />
              <TextField
                label="Domain Whitelist (comma-separated)"
                fullWidth
                value={domainWhitelist}
                helperText="Auto-approve registrations from these email domains"
                onChange={(e) => setDomainWhitelist(e.target.value)}
                slotProps={{ input: { sx: { borderRadius: '10px' } } }}
              />
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={<SaveRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#1E40AF',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  borderRadius: '10px',
                  px: 3,
                  py: 1,
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
