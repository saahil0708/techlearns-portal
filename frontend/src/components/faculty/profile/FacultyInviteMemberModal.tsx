'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  CircularProgress,
  InputAdornment,
  Alert,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

interface FacultyInviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  collegeId?: string;
  collegeName?: string;
  onSuccess?: () => void;
}

export default function FacultyInviteMemberModal({
  open,
  onClose,
  collegeId,
  collegeName = 'Academic Department',
  onSuccess,
}: FacultyInviteMemberModalProps) {
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [specialization, setSpecialization] = useState('Data Structures, Algorithms & Web Architecture');
  const [officeHours, setOfficeHours] = useState('Mon, Wed, Fri (10:00 - 12:00)');
  const [submitting, setSubmitting] = useState(false);

  const borderColor = '#E2E8F0';

  const handleReset = () => {
    setName('');
    setEmail('');
    setDepartment('Computer Science & Engineering');
    setSpecialization('Data Structures, Algorithms & Web Architecture');
    setOfficeHours('Mon, Wed, Fri (10:00 - 12:00)');
    setSubmitting(false);
  };

  const handleClose = () => {
    onClose();
    setTimeout(handleReset, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeId) {
      toast.error('College institution ID is required to onboard faculty members.', 'Missing College ID');
      return;
    }

    if (!name.trim() || !email.trim()) {
      toast.error('Please provide both the faculty member name and institutional email.', 'Validation Error');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Dispatch secure, server-generated invitation token with expiration
      const inviteResult = await apiService.bulkInviteUsers({
        users: [
          {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            role: 'FACULTY',
            institutionId: collegeId,
            collegeId,
          },
        ],
      });

      if (!inviteResult || inviteResult.invited <= 0) {
        toast.error(
          (inviteResult as any)?.message || `Failed to dispatch invitation to ${email}. The user may already exist or be pending activation.`,
          'Invitation Failed'
        );
        return;
      }

      // 2. Synchronize faculty academic profile metadata
      const userLookup = await apiService.getUsers({ search: email.trim().toLowerCase(), limit: 5 });
      const createdUser = userLookup?.items?.find((u: any) => u.email?.toLowerCase() === email.trim().toLowerCase());
      if (createdUser && createdUser.id) {
        await apiService.updateUser(createdUser.id, {
          department: department.trim(),
          specialization: specialization.trim(),
          officeHours: officeHours.trim(),
          institution: collegeName,
        });
        await apiService.addCollegeMember(collegeId, {
          userId: createdUser.id,
          role: 'FACULTY',
        });
      }

      toast.success(
        `Invitation dispatched to ${email}. An activation token has been generated for password setup.`,
        'Invitation Sent'
      );
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch faculty invitation. Please verify permissions.', 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = submitting || !collegeId || !name.trim() || !email.trim();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle
          sx={{
            p: 3,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAddAlt1RoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.2rem', color: '#0F172A', lineHeight: 1.2 }}>
                Invite Faculty Mentor
              </Typography>
              <Typography sx={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, mt: 0.25 }}>
                {collegeName} • Institutional Faculty Roster
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small" sx={{ color: '#94A3B8' }}>
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {!collegeId && (
            <Alert severity="warning" sx={{ borderRadius: '12px' }}>
              College institution ID is required. Please ensure you are managing an active college workspace.
            </Alert>
          )}

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Full Name"
              required
              fullWidth
              placeholder="Dr. Alan Turing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Institutional Email"
              type="email"
              required
              fullWidth
              placeholder="alan.turing@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Department"
              fullWidth
              placeholder="Computer Science & Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              label="Office Hours"
              fullWidth
              placeholder="Mon, Wed, Fri (10:00 - 12:00)"
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccessTimeRoundedIcon sx={{ fontSize: 20, color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>

          <TextField
            label="Specialization & Research Focus"
            fullWidth
            placeholder="Data Structures, Algorithms, Distributed Systems"
            value={specialization}
            onChange={(e) => setSpecialization(e.target.value)}
          />

          <Box
            sx={{
              p: 2,
              borderRadius: '12px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1.5,
            }}
          >
            <MarkEmailReadRoundedIcon sx={{ color: '#2563EB', fontSize: 22, mt: 0.25 }} />
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B' }}>
                Expiring Activation Token Flow
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B', mt: 0.25 }}>
                An invitation token will be generated and dispatched to the faculty member. The recipient will securely set their own password upon accepting the invitation.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, borderTop: `1px solid ${borderColor}`, gap: 1.5 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: '#64748B',
              borderRadius: '10px',
              px: 2.5,
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitDisabled}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' },
              borderRadius: '10px',
              px: 3,
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Dispatching Invite...</span>
              </Box>
            ) : (
              'Send Faculty Invitation'
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
