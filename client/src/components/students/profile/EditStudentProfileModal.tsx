'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { StudentProfileData } from '@/types/student-profile';

interface EditStudentProfileModalProps {
  open: boolean;
  profile: StudentProfileData;
  onClose: () => void;
  onSave: (updated: Partial<StudentProfileData>) => Promise<void>;
}

export default function EditStudentProfileModal({
  open,
  profile,
  onClose,
  onSave,
}: EditStudentProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone || '+91-9474156798');
  const [bio, setBio] = useState(profile.bio);
  const [institution, setInstitution] = useState(profile.institution);
  const [location, setLocation] = useState(profile.location || 'India');
  const [githubUrl, setGithubUrl] = useState(profile.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile.websiteUrl || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setPhone(profile.phone || '+91-9474156798');
      setBio(profile.bio);
      setInstitution(profile.institution);
      setLocation(profile.location || 'India');
      setGithubUrl(profile.githubUrl || '');
      setLinkedinUrl(profile.linkedinUrl || '');
      setWebsiteUrl(profile.websiteUrl || '');
    }
  }, [open, profile]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSave({
        name,
        phone,
        bio,
        institution,
        location,
        githubUrl,
        linkedinUrl,
        websiteUrl,
      });
      onClose();
    } finally {
      setSaving(false);
    }
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
            p: 1,
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.16)',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem', pb: 1, pt: 2, px: 3 }}>
        Edit Personal & Profile Details
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: '16px !important', px: 3 }}>
        <TextField
          label="Full Name"
          fullWidth
          size="small"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Phone Number"
          fullWidth
          size="small"
          placeholder="+91-9474156798"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <TextField
          label="Location (City, Country)"
          fullWidth
          size="small"
          placeholder="Durgapur, India"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <TextField
          label="College / Institution"
          fullWidth
          size="small"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
        />
        <TextField
          label="Professional Bio"
          multiline
          rows={3}
          fullWidth
          size="small"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <TextField
          label="GitHub URL"
          fullWidth
          size="small"
          value={githubUrl}
          onChange={(e) => setGithubUrl(e.target.value)}
          placeholder="https://github.com/yourhandle"
        />
        <TextField
          label="LinkedIn URL"
          fullWidth
          size="small"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/yourhandle"
        />
        <TextField
          label="Portfolio / Website URL"
          fullWidth
          size="small"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, px: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: '#64748B', fontWeight: 700, borderRadius: '10px' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            bgcolor: '#2563EB',
            fontWeight: 800,
            textTransform: 'none',
            px: 3,
            py: 0.9,
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.28)',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {saving ? 'Saving...' : 'Save Details'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
