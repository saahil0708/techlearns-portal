'use client';

import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  CircularProgress,
  Avatar,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccountBalanceRoundedIcon from '@mui/icons-material/AccountBalanceRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import type { UserDirectoryEntity } from './UsersDirectoryClient';

interface InstitutionOption {
  id: string;
  name: string;
  code: string;
  status: string;
}

interface AssignInstitutionModalProps {
  open: boolean;
  onClose: () => void;
  user: UserDirectoryEntity | null;
  onAssignSuccess: (updatedUser: Partial<UserDirectoryEntity> & { id: string }) => void;
}

export default function AssignInstitutionModal({
  open,
  onClose,
  user,
  onAssignSuccess,
}: AssignInstitutionModalProps) {
  const toast = useToast();
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState('');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'FACULTY' | 'INSTITUTION_ADMIN'>('FACULTY');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadActiveInstitutions();
      if (user) {
        if (user.role === 'STUDENT') {
          setTargetRole('STUDENT');
        } else if (user.role === 'COLLEGE_ADMIN') {
          setTargetRole('INSTITUTION_ADMIN');
        } else {
          setTargetRole('FACULTY');
        }
      }
      setSelectedInstitutionId('');
      setInstitutionSearch('');
    }
  }, [open, user]);

  const loadActiveInstitutions = async () => {
    try {
      setLoadingInstitutions(true);
      const res = await apiService.getInstitutions({ limit: 200, status: 'ACTIVE' });
      const list = res?.items || [];
      const mapped: InstitutionOption[] = list
        .filter((inst: any) => inst.status === 'ACTIVE')
        .map((inst: any) => ({
          id: inst.id,
          name: inst.name,
          code: inst.code,
          status: inst.status || 'ACTIVE',
        }));
      setInstitutions(mapped);
      if (mapped.length > 0) {
        setSelectedInstitutionId(mapped[0].id);
      }
    } catch (err) {
      console.error('Failed to load institutions:', err);
      toast.error('Could not fetch active institutions list.', 'Fetch Error');
    } finally {
      setLoadingInstitutions(false);
    }
  };

  const filteredInstitutions = React.useMemo(() => {
    if (!institutionSearch.trim()) return institutions;
    const q = institutionSearch.toLowerCase().trim();
    return institutions.filter(
      (inst) =>
        inst.name.toLowerCase().includes(q) ||
        (inst.code && inst.code.toLowerCase().includes(q))
    );
  }, [institutions, institutionSearch]);

  const selectedInstitution = React.useMemo(() => {
    return institutions.find((i) => i.id === selectedInstitutionId);
  }, [institutions, selectedInstitutionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!selectedInstitutionId) {
      toast.error('Please select an active institute / institution.', 'Selection Required');
      return;
    }

    try {
      setSubmitting(true);

      // 1. Add/Update membership in the target institution
      await apiService.addInstitutionMember(selectedInstitutionId, {
        userId: user.id,
        role: targetRole,
      });

      // 2. Also update user institution name affiliation
      const instName = selectedInstitution?.name || 'Assigned Institution';

      toast.success(
        `Assigned ${user.name} to ${instName} with role ${targetRole.replace('_', ' ')}.`,
        'Institution Assigned'
      );

      onAssignSuccess({
        id: user.id,
        institutionName: instName,
        institutionType: 'Institute',
      });

      onClose();
    } catch (err: any) {
      console.error('Failed to assign institution:', err);
      toast.error(err.message || 'Failed to assign institution membership.', 'Assignment Error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!user) return;
    try {
      setSubmitting(true);
      await apiService.unassignUserFromInstitutions(user.id);
      toast.success(
        `Unassigned ${user.name} from ${user.institutionName || 'institution'} (now Independent).`,
        'Affiliation Removed'
      );
      onAssignSuccess({
        id: user.id,
        institutionName: 'Independent',
        institutionType: 'Independent',
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to unassign user:', err);
      toast.error(err?.message || 'Failed to unassign user from institution.', 'Unassign Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const borderColor = '#E2E8F0';

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            p: 1,
            overflow: 'hidden',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1.5,
            pt: 2,
            px: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                bgcolor: '#F0FDF4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16A34A',
                border: '1px solid #DCFCE7',
              }}
            >
              <AccountBalanceRoundedIcon />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.2 }}>
                Assign Active Institute
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                Link user to an institutional campus tenant with designated role
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            disabled={submitting}
            size="small"
            sx={{
              color: '#94A3B8',
              borderRadius: '9999px',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Target User Card Preview */}
            <Box
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: '#F8FAFC',
                border: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Avatar
                src={user.avatarUrl}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: user.avatarColor,
                  fontWeight: 800,
                  fontSize: '1rem',
                  border: '2px solid #E2E8F0',
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.95rem' }}>
                    {user.name}
                  </Typography>
                  <Typography sx={{ color: '#2563EB', fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 600 }}>
                    @{user.handle}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                  {user.email}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                    Current Affiliation:
                  </Typography>
                  <Chip
                    label={user.institutionName || 'Independent'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      bgcolor: user.institutionName && user.institutionName !== 'Independent' ? '#EFF6FF' : '#F1F5F9',
                      color: user.institutionName && user.institutionName !== 'Independent' ? '#2563EB' : '#64748B',
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Explanatory Info Alert */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                bgcolor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.2,
              }}
            >
              <InfoOutlinedIcon sx={{ color: '#2563EB', fontSize: 20, mt: 0.2 }} />
              <Typography variant="caption" sx={{ color: '#1E40AF', lineHeight: 1.5 }}>
                Assigning this user will link their account to the selected institution workspace, granting them tenant course access, roster inclusion, and institutional badges.
              </Typography>
            </Box>

            {/* Institution Search & Selection */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                SELECT ACTIVE INSTITUTE / INSTITUTION *
              </Typography>

              {loadingInstitutions ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
                  <CircularProgress size={20} sx={{ color: '#2563EB' }} />
                  <Typography variant="body2" sx={{ color: '#64748B' }}>
                    Loading active institutes...
                  </Typography>
                </Box>
              ) : (
                <>
                  {/* Quick Filter Search inside select list */}
                  {institutions.length > 6 && (
                    <TextField
                      fullWidth
                      size="small"
                      value={institutionSearch}
                      onChange={(e) => setInstitutionSearch(e.target.value)}
                      placeholder="Filter institutions by name or code..."
                      disabled={submitting}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{
                        mb: 1.2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '10px',
                          bgcolor: '#F8FAFC',
                          fontSize: '0.82rem',
                          '& fieldset': { borderColor },
                        },
                      }}
                    />
                  )}

                  <Select
                    fullWidth
                    size="small"
                    value={selectedInstitutionId}
                    onChange={(e) => setSelectedInstitutionId(e.target.value)}
                    disabled={submitting || institutions.length === 0}
                    startAdornment={
                      <InputAdornment position="start">
                        <AccountBalanceRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      '& .MuiOutlinedInput-notchedOutline': { borderColor },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                    }}
                  >
                    {filteredInstitutions.length === 0 ? (
                      <MenuItem disabled value="">
                        No matching institutions found
                      </MenuItem>
                    ) : (
                      filteredInstitutions.map((inst) => (
                        <MenuItem key={inst.id} value={inst.id} sx={{ fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, color: '#0F172A' }}>
                              {inst.name}
                            </Typography>
                            {inst.code && (
                              <Chip
                                label={inst.code}
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  fontWeight: 700,
                                  bgcolor: '#EFF6FF',
                                  color: '#2563EB',
                                }}
                              />
                            )}
                          </Box>
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </>
              )}
            </Box>

            {/* Target Role in Institution */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.8, display: 'block' }}>
                ASSIGNED INSTITUTIONAL ROLE *
              </Typography>
              <Select
                fullWidth
                size="small"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                disabled={submitting}
                startAdornment={
                  <InputAdornment position="start">
                    <AdminPanelSettingsRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563EB' },
                }}
              >
                <MenuItem value="FACULTY" sx={{ fontSize: '0.85rem' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                      FACULTY / INSTRUCTOR
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Can create courses, manage student batches, and grade submissions.
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="STUDENT" sx={{ fontSize: '0.85rem' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                      STUDENT
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Enrolled student with batch assignment and contest participation rights.
                    </Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="INSTITUTION_ADMIN" sx={{ fontSize: '0.85rem' }}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.85rem' }}>
                      INSTITUTE ADMIN
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Full administrative control over campus settings, batches, and faculty.
                    </Typography>
                  </Box>
                </MenuItem>
              </Select>
            </Box>
          </Box>
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${borderColor}`,
            bgcolor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              onClick={onClose}
              disabled={submitting}
              variant="outlined"
              sx={{
                borderRadius: '9999px',
                borderColor: '#CBD5E1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                px: 2.5,
                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F1F5F9' },
              }}
            >
              Cancel
            </Button>

            {user.institutionName && user.institutionName !== 'Independent' && (
              <Button
                onClick={handleUnassign}
                disabled={submitting}
                variant="outlined"
                startIcon={<LinkOffRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  borderRadius: '9999px',
                  borderColor: '#FECACA',
                  bgcolor: '#FEF2F2',
                  color: '#DC2626',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  px: 2,
                  '&:hover': { borderColor: '#DC2626', bgcolor: '#FEE2E2' },
                }}
              >
                Unassign from Institute
              </Button>
            )}
          </Box>

          <Button
            type="submit"
            disabled={submitting || !selectedInstitutionId}
            variant="contained"
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleOutlineRoundedIcon />}
            sx={{
              borderRadius: '9999px',
              bgcolor: '#16A34A',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 3,
              boxShadow: '0 4px 14px rgba(22,163,74,0.25)',
              '&:hover': { bgcolor: '#15803D' },
            }}
          >
            {submitting ? 'Assigning...' : 'Assign Institute'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
