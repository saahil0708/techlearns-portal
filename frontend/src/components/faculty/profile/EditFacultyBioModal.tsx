'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';

interface EditFacultyBioModalProps {
  open: boolean;
  onClose: () => void;
  initialBio: string;
  initialDepartment: string;
  initialSpecialization: string;
  initialOfficeHours: string;
  initialLocation: string;
  initialPhone: string;
  initialGithubUrl: string;
  initialLinkedinUrl: string;
  initialWebsiteUrl: string;
  onSave: (data: {
    bio: string;
    department: string;
    specialization: string;
    officeHours: string;
    location: string;
    phone: string;
    githubUrl: string;
    linkedinUrl: string;
    websiteUrl: string;
  }) => Promise<void>;
}

export default function EditFacultyBioModal({
  open,
  onClose,
  initialBio,
  initialDepartment,
  initialSpecialization,
  initialOfficeHours,
  initialLocation,
  initialPhone,
  initialGithubUrl,
  initialLinkedinUrl,
  initialWebsiteUrl,
  onSave,
}: EditFacultyBioModalProps) {
  const [bio, setBio] = useState(initialBio);
  const [department, setDepartment] = useState(initialDepartment);
  const [specialization, setSpecialization] = useState(initialSpecialization);
  const [officeHours, setOfficeHours] = useState(initialOfficeHours);
  const [location, setLocation] = useState(initialLocation);
  const [phone, setPhone] = useState(initialPhone);
  const [githubUrl, setGithubUrl] = useState(initialGithubUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(initialLinkedinUrl);
  const [websiteUrl, setWebsiteUrl] = useState(initialWebsiteUrl);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        bio: bio.trim(),
        department: department.trim(),
        specialization: specialization.trim(),
        officeHours: officeHours.trim(),
        location: location.trim(),
        phone: phone.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
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
      slotProps={{
        paper: {
          sx: { borderRadius: '20px', width: '100%', maxWidth: 540, p: 1 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', pb: 1 }}>
        Edit Academic Profile & Bio
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, pt: '16px !important', pb: 2 }}>
        <TextField
          label="Department / Academic Unit"
          fullWidth
          size="small"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <TextField
          label="Academic Bio & Research Statement"
          multiline
          rows={3}
          fullWidth
          size="small"
          placeholder="Brief description of teaching philosophy, algorithmic mentorship, and lab responsibilities..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <TextField
          label="Specialization / Topics (comma-separated)"
          fullWidth
          size="small"
          placeholder="e.g. Data Structures, Graph Algorithms, Web Development"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="Office / Mentorship Hours"
            fullWidth
            size="small"
            placeholder="Mon-Fri 2-5 PM"
            value={officeHours}
            onChange={(e) => setOfficeHours(e.target.value)}
          />
          <TextField
            label="Lab / Cabin Location"
            fullWidth
            size="small"
            placeholder="Room 304, CSE Block"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Box>

        <TextField
          label="Contact Number"
          fullWidth
          size="small"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#64748B', mt: 0.5 }}>
          Professional & Research Links
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="GitHub URL / Username"
            fullWidth
            size="small"
            placeholder="github.com/faculty"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
          />
          <TextField
            label="LinkedIn URL"
            fullWidth
            size="small"
            placeholder="linkedin.com/in/faculty"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
          />
        </Box>

        <TextField
          label="Personal Website / Scholar Link"
          fullWidth
          size="small"
          placeholder="https://scholar.google.com/..."
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={handleSave}
          sx={{ bgcolor: '#2563EB', textTransform: 'none', fontWeight: 700, borderRadius: '8px', px: 2.5, '&:hover': { bgcolor: '#1D4ED8' } }}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
