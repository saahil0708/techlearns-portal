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
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import GroupAddRoundedIcon from '@mui/icons-material/GroupAddRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { generateSafeCsv, downloadCsvBlob } from '@/utils/csv';
import type { FacultyBatchItem } from '@/data';

interface FacultyInviteStudentsModalProps {
  open: boolean;
  onClose: () => void;
  collegeId?: string;
  collegeName?: string;
  batches?: FacultyBatchItem[];
  preSelectedBatchId?: string;
  onInviteSuccess?: (count: number) => void;
}

export default function FacultyInviteStudentsModal({
  open,
  onClose,
  collegeId,
  collegeName = 'Academic Department',
  batches = [],
  preSelectedBatchId,
  onInviteSuccess,
}: FacultyInviteStudentsModalProps) {
  const toast = useToast();

  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    preSelectedBatchId || (batches.length > 0 ? batches[0].id : '')
  );

  // Bulk Upload State
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);
  const [parsedStudents, setParsedStudents] = useState<Array<{ name: string; email: string; rollNo?: string }>>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Execution State
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasBatchEnrollment, setHasBatchEnrollment] = useState(false);
  const [invitationResults, setInvitationResults] = useState<Array<{ email: string; activationUrl: string }> | null>(null);

  const borderColor = '#E2E8F0';

  // Sync pre-selected batch when modal opens
  React.useEffect(() => {
    if (preSelectedBatchId) {
      setSelectedBatchId(preSelectedBatchId);
    } else if (batches.length > 0 && !selectedBatchId) {
      setSelectedBatchId(batches[0].id);
    }
  }, [preSelectedBatchId, batches]);

  // Reset state upon closing
  const handleDialogClose = () => {
    onClose();
    setTimeout(() => {
      setFileName(null);
      setRowCount(0);
      setParsedStudents([]);
      setIsParsing(false);
      setHasBatchEnrollment(false);
      setInvitationResults(null);
      setIsProcessing(false);
    }, 200);
  };

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      setFileName(file.name);
      setParsedStudents([]);
      setRowCount(0);
      setIsParsing(true);

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const text = evt.target?.result as string;
          if (text) {
            const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
            const entries: Array<{ name: string; email: string; rollNo?: string }> = [];
            const startIndex =
              lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name') ? 1 : 0;
            for (let i = startIndex; i < lines.length; i++) {
              const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
              if (parts.length >= 2) {
                const name = parts[0] || 'Student Coder';
                const email = parts.find((p) => p.includes('@')) || parts[1] || '';
                const rollNo = parts.length >= 3 ? parts[2] : undefined;
                if (email) {
                  entries.push({ name, email, rollNo });
                }
              }
            }
            setParsedStudents(entries);
            setRowCount(entries.length);
            if (entries.length > 0) {
              toast.success(`Loaded ${entries.length} student records from ${file.name}`, 'CSV Parsed');
            } else {
              toast.error('No valid student records found in CSV file.', 'Empty File');
            }
          } else {
            setParsedStudents([]);
            setRowCount(0);
          }
        } finally {
          setIsParsing(false);
        }
      };
      reader.onerror = () => {
        setIsParsing(false);
        toast.error('Failed to read CSV file.', 'Read Error');
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const headers = ['Full Name', 'Email', 'Student ID'];
    const rows = [
      ['Alex Johnson', 'alex.johnson@campus.edu', 'STU-2026-001'],
      ['Samantha Reed', 'samantha.reed@campus.edu', 'STU-2026-002'],
      ['Devon Patel', 'devon.patel@campus.edu', 'STU-2026-003'],
    ];
    const csvData = generateSafeCsv(headers, rows);
    downloadCsvBlob('student_roster_template.csv', csvData);
    toast.info('Student roster CSV template downloaded.', 'Template Downloaded');
  };

  const handleSendBulkInvites = async () => {
    if (parsedStudents.length === 0) {
      toast.error('Please upload a valid CSV file containing student records.', 'No Data');
      return;
    }

    const targetBatchId = selectedBatchId && selectedBatchId.trim().length > 0 ? selectedBatchId.trim() : undefined;
    const targetCollegeId = collegeId && collegeId.trim().length > 0 ? collegeId.trim() : undefined;
    const resolvedPayload = parsedStudents.map((s) => ({
      name: s.name,
      email: s.email.toLowerCase().trim(),
      role: 'STUDENT',
      ...(s.rollNo ? { rollNo: s.rollNo } : {}),
      ...(targetCollegeId ? { collegeId: targetCollegeId } : {}),
      ...(targetBatchId ? { batchId: targetBatchId } : {}),
    }));

    setHasBatchEnrollment(Boolean(targetBatchId));
    setIsProcessing(true);
    try {
      const result = await apiService.bulkInviteUsers({
        users: resolvedPayload,
      });

      if (result?.invitationLinks && result.invitationLinks.length > 0) {
        setInvitationResults(result.invitationLinks);
      }

      toast.success(
        `Successfully queued ${parsedStudents.length} student invitations!`,
        targetBatchId ? 'Roster Invitations Sent' : 'Student Invitations Sent'
      );
      onInviteSuccess?.(parsedStudents.length);
      if (!result?.invitationLinks || result.invitationLinks.length === 0) {
        handleDialogClose();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to dispatch bulk invitations.', 'Import Error');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.info('Invitation link copied to clipboard!', 'Link Copied');
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Header */}
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
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #BFDBFE',
            }}
          >
            <GroupAddRoundedIcon sx={{ color: '#2563EB', fontSize: '1.4rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
              Invite Students via Roster
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              {collegeName} • Instant activation links{selectedBatchId ? ' & batch enrollment' : ' for student accounts'}
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={handleDialogClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3.5, py: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {invitationResults ? (
          /* Result view after successful creation */
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert
              severity="success"
              icon={<CheckCircleRoundedIcon fontSize="inherit" />}
              sx={{ borderRadius: '12px', fontWeight: 600, fontSize: '0.88rem' }}
            >
              Generated {invitationResults.length} invitation link{invitationResults.length > 1 ? 's' : ''}!{' '}
              {hasBatchEnrollment
                ? 'Students can click to activate their accounts and enroll in the batch.'
                : 'Students can click to activate their accounts.'}
            </Alert>

            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', mt: 0.5 }}>
              ACTIVATION LINKS:
            </Typography>

            <Box
              sx={{
                maxHeight: 220,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                bgcolor: '#F8FAFC',
                borderRadius: '12px',
                border: `1px solid ${borderColor}`,
              }}
            >
              {invitationResults.map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1,
                    px: 1.5,
                    bgcolor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ minWidth: 0, mr: 1 }}>
                    <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.email}
                    </Typography>
                    <Typography sx={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'monospace' }}>
                      {item.activationUrl}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                    onClick={() => copyToClipboard(item.activationUrl)}
                    sx={{
                      textTransform: 'none',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '8px',
                      flexShrink: 0,
                    }}
                  >
                    Copy Link
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>
        ) : (
          /* Bulk CSV Upload Form */
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                ASSIGNED BATCH (FOR ENROLLMENT)
              </Typography>
              <Select
                size="small"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                }}
              >
                {batches.length === 0 ? (
                  <MenuItem value="">General Academic Roster</MenuItem>
                ) : (
                  batches.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </MenuItem>
                  ))
                )}
              </Select>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                {selectedBatchId
                  ? 'All uploaded students will be invited and automatically enrolled into the selected batch.'
                  : 'Without a batch selected, invitations will create active student accounts without batch enrollment.'}
              </Typography>
            </Box>

            {/* Dropzone */}
            <Box
              component="label"
              sx={{
                p: 3.5,
                border: '2px dashed #BFDBFE',
                borderRadius: '16px',
                bgcolor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.25,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: '#2563EB',
                  bgcolor: '#EFF6FF',
                },
              }}
            >
              <input type="file" accept=".csv" hidden onChange={handleSimulateFileSelect} />
              <CloudUploadRoundedIcon sx={{ fontSize: '2.5rem', color: '#2563EB' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                  {fileName ? fileName : 'Click to upload or drag & drop CSV roster'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                  Columns: Full Name, Email, Student ID
                </Typography>
              </Box>
              {isParsing ? (
                <Chip
                  icon={<CircularProgress size={14} color="inherit" sx={{ color: '#2563EB !important' }} />}
                  label="Parsing CSV roster..."
                  size="small"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    border: '1px solid #BFDBFE',
                  }}
                />
              ) : fileName && (
                <Chip
                  icon={<CheckCircleRoundedIcon sx={{ color: '#16A34A !important', fontSize: '0.9rem !important' }} />}
                  label={`${rowCount} student candidates parsed`}
                  size="small"
                  sx={{
                    bgcolor: '#F0FDF4',
                    color: '#16A34A',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    border: '1px solid #BBF7D0',
                  }}
                />
              )}
            </Box>

            {/* Download sample */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Need the standard roster template?
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
                Download CSV Sample
              </Button>
            </Box>
          </>
        )}
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
          onClick={handleDialogClose}
          sx={{
            color: '#64748B',
            borderRadius: '9999px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {invitationResults ? 'Done' : 'Cancel'}
        </Button>

        {!invitationResults && (
          <Button
            disabled={isProcessing || isParsing || !fileName || parsedStudents.length === 0}
            onClick={handleSendBulkInvites}
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
            {isProcessing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>Dispatching Invites...</span>
              </Box>
            ) : isParsing ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} color="inherit" />
                <span>Parsing CSV...</span>
              </Box>
            ) : (
              `Send ${rowCount ? `${rowCount} ` : ''}Invitations`
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
