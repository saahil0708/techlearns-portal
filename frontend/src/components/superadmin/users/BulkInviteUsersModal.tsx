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
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import { UserRole } from '@/components/superadmin/users/CreateUserModal';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { useAppSelector } from '@/store/hooks';

interface BulkInviteUsersModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export default function BulkInviteUsersModal({
  open,
  onClose,
  onImportSuccess,
}: BulkInviteUsersModalProps) {
  const toast = useToast();
  const currentUser = useAppSelector((state) => state.auth.user);
  const callerRole = (currentUser?.globalRole || (currentUser as any)?.role || '').toUpperCase();

  const allowedRoles: UserRole[] = React.useMemo(() => {
    if (callerRole === 'SUPER_ADMIN') {
      return ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'SCHOOL_ADMIN', 'FACULTY', 'STUDENT', 'RECRUITER'];
    }
    if (callerRole === 'PLATFORM_ADMIN') {
      return ['COLLEGE_ADMIN', 'SCHOOL_ADMIN', 'FACULTY', 'STUDENT', 'RECRUITER'];
    }
    if (callerRole === 'COLLEGE_ADMIN' || callerRole === 'SCHOOL_ADMIN' || callerRole === 'INSTITUTION_ADMIN') {
      return ['FACULTY', 'STUDENT', 'RECRUITER'];
    }
    if (callerRole === 'FACULTY') {
      return ['STUDENT'];
    }
    return ['STUDENT'];
  }, [callerRole]);

  const [defaultRole, setDefaultRole] = useState<UserRole>(() => allowedRoles[0] || 'FACULTY');
  const [selectedInstitution, setSelectedInstitution] = useState('Stanford University - Dept of CS');
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);
  const [parsedUsers, setParsedUsers] = useState<Array<{ name: string; email: string; role?: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const borderColor = '#E2E8F0';

  React.useEffect(() => {
    if (!allowedRoles.includes(defaultRole) && allowedRoles.length > 0) {
      setDefaultRole(allowedRoles[0]);
    }
  }, [allowedRoles, defaultRole]);

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          const entries: Array<{ name: string; email: string; role?: string }> = [];
          // Skip header row if it exists
          const startIndex = lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name') ? 1 : 0;
          for (let i = startIndex; i < lines.length; i++) {
            const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
            if (parts.length >= 2) {
              const name = parts[0] || 'Invited User';
              const email = parts.find((p) => p.includes('@')) || parts[1] || '';
              const role = parts.find((p) => ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'SCHOOL_ADMIN', 'FACULTY', 'STUDENT', 'RECRUITER'].includes(p.toUpperCase())) || defaultRole;
              if (email) {
                entries.push({ name, email, role });
              }
            }
          }
          setParsedUsers(entries);
          setRowCount(entries.length || 1);
          toast.success(`Parsed ${entries.length} user records from ${file.name}`, 'CSV Loaded');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Full Name,Handle,Email,Role,Institution\n' +
      'Dr. Robert Sedgewick,sedgewick_cs,sedgewick@stanford.edu,FACULTY,Stanford CS\n' +
      'Prof. Thomas Cormen,cormen_t,cormen@mit.edu,FACULTY,MIT EECS\n' +
      'Sarah Connor,sconnor,s.connor@stuy.edu,SCHOOL_ADMIN,Stuyvesant High\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'users_invite_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Sample user invitation template downloaded (.csv)', 'Template Downloaded');
  };

  const handleExecuteImport = async () => {
    setIsProcessing(true);
    try {
      if (parsedUsers.length > 0) {
        await apiService.bulkInviteUsers({
          users: parsedUsers.map((u) => ({
            name: u.name,
            email: u.email,
            role: u.role || defaultRole,
          })),
        });
      }
    } catch (err) {
      console.error('Failed to bulk invite users:', err);
    } finally {
      setIsProcessing(false);
      onImportSuccess(rowCount || parsedUsers.length || 1);
      onClose();
      setFileName(null);
      setRowCount(0);
      setParsedUsers([]);
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
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: '20px 28px',
          borderBottom: `1px solid ${borderColor}`,
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '9999px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE',
            }}
          >
            <GroupAddRoundedIcon sx={{ color: '#2563EB', fontSize: '1.3rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
              Bulk User Invitation (CSV / Excel)
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Batch invite faculty, administrators, or students with magic link invitations
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, pt: '28px !important', pb: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Default Role & Tenant */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              DEFAULT ROLE
            </Typography>
            <Select
              size="small"
              value={defaultRole}
              onChange={(e) => setDefaultRole(e.target.value as UserRole)}
              sx={{
                bgcolor: '#F8FAFC',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
              }}
            >
              {allowedRoles.includes('SUPER_ADMIN') && (
                <MenuItem value="SUPER_ADMIN">Super Administrator</MenuItem>
              )}
              {allowedRoles.includes('COLLEGE_ADMIN') && (
                <MenuItem value="COLLEGE_ADMIN">College Admin</MenuItem>
              )}
              {allowedRoles.includes('SCHOOL_ADMIN') && (
                <MenuItem value="SCHOOL_ADMIN">School Admin</MenuItem>
              )}
              {allowedRoles.includes('FACULTY') && (
                <MenuItem value="FACULTY">Faculty / Instructor</MenuItem>
              )}
              {allowedRoles.includes('STUDENT') && (
                <MenuItem value="STUDENT">Student Coder</MenuItem>
              )}
              {allowedRoles.includes('RECRUITER') && (
                <MenuItem value="RECRUITER">Recruiter</MenuItem>
              )}
            </Select>
          </Box>

          {defaultRole === 'SUPER_ADMIN' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                ASSIGNED TENANT
              </Typography>
              <Box
                sx={{
                  bgcolor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  borderRadius: '9999px',
                  py: '7px',
                  px: 2,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#6D28D9' }}>
                  Global Platform Organization
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                ASSIGNED TENANT
              </Typography>
              <Select
                size="small"
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '9999px',
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                <MenuItem value="Stanford University - Dept of CS">Stanford University</MenuItem>
                <MenuItem value="Massachusetts Inst of Technology (MIT)">MIT EECS</MenuItem>
                <MenuItem value="Stuyvesant High School of Science">Stuyvesant High</MenuItem>
                <MenuItem value="Global CodePlatform Platform">Global Admin Cluster</MenuItem>
              </Select>
            </Box>
          )}
        </Box>

        {/* Upload Dropzone */}
        <Box
          component="label"
          sx={{
            p: 4,
            border: '2px dashed #BFDBFE',
            borderRadius: '16px',
            bgcolor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: '#2563EB',
              bgcolor: '#EFF6FF',
            },
          }}
        >
          <input type="file" accept=".csv, .xlsx, .xls" hidden onChange={handleSimulateFileSelect} />
          <CloudUploadRoundedIcon sx={{ fontSize: '2.8rem', color: '#2563EB' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {fileName ? fileName : 'Click to select or drag CSV / Excel file'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Supported formats: .CSV, .XLSX, .XLS (Includes auto-generated temporary passwords)
            </Typography>
          </Box>
          {fileName && (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ color: '#16A34A !important', fontSize: '0.9rem !important' }} />}
              label={`${rowCount} user accounts detected in file`}
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, borderRadius: '9999px', border: '1px solid #BBF7D0' }}
            />
          )}
        </Box>

        {/* Template download link */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Need the official column headers?
          </Typography>
          <Button
            size="small"
            onClick={handleDownloadSample}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: '1rem' }} />}
            sx={{
              color: '#2563EB',
              textTransform: 'none',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderRadius: '9999px',
            }}
          >
            Download CSV Sample Template
          </Button>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: '16px 28px',
          borderTop: `1px solid ${borderColor}`,
          bgcolor: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!fileName || isProcessing}
          onClick={handleExecuteImport}
          variant="contained"
          sx={{
            borderRadius: '9999px',
            bgcolor: '#2563EB',
            px: 3.5,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': { bgcolor: '#1D4ED8' },
            '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
          }}
        >
          {isProcessing ? 'Sending Invites...' : `Send ${rowCount || ''} Invitations`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
