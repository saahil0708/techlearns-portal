import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { parseCsvText } from '@/utils/csv';

export interface BulkImportStudentsModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
  institutionId?: string;
  institutionName?: string;
  defaultBatchId?: string;
  batches?: Array<{ id: string; name: string; code?: string }>;
}

export default function BulkImportStudentsModal({
  open,
  onClose,
  onImportSuccess,
  institutionId,
  institutionName,
  defaultBatchId,
  batches = [],
}: BulkImportStudentsModalProps) {
  const toast = useToast();
  const [availableInstitutions, setAvailableInstitutions] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>(institutionId || '');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(defaultBatchId || '');
  const [fileName, setFileName] = useState<string | null>(null);
  const [rowCount, setRowCount] = useState<number>(0);
  const [parsedStudents, setParsedStudents] = useState<Array<{ name: string; email: string; rollNo?: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const borderColor = '#E2E8F0';

  useEffect(() => {
    if (!institutionId && open) {
      apiService.getColleges({ limit: 50 }).then((res) => {
        if (res?.items && Array.isArray(res.items)) {
          const mapped = res.items.map((c: any) => ({ id: c.id, name: c.name }));
          setAvailableInstitutions(mapped);
          if (mapped.length > 0) {
            setSelectedInstitutionId((prev) => prev || mapped[0].id);
          }
        }
      }).catch(() => {});
    }
  }, [open, institutionId]);

  useEffect(() => {
    if (defaultBatchId) {
      setSelectedBatchId(defaultBatchId);
    } else if (batches.length > 0) {
      setSelectedBatchId(batches[0].id);
    } else {
      setSelectedBatchId('');
    }
  }, [defaultBatchId, batches]);

  useEffect(() => {
    if (institutionId) {
      setSelectedInstitutionId(institutionId);
    } else {
      setSelectedInstitutionId('');
    }
  }, [institutionId]);

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setFileName(null);
        setRowCount(0);
        setParsedStudents([]);
        toast.error('Please upload a valid .csv file.', 'Invalid File Format');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text) {
          const rows = parseCsvText(text);
          if (rows.length === 0) {
            setParsedStudents([]);
            setRowCount(0);
            return;
          }

          const headerRow = rows[0].map((h) => h.trim().toLowerCase());
          const hasHeader = headerRow.some((h) => h.includes('email') || h.includes('name'));
          const startIndex = hasHeader ? 1 : 0;

          let nameIdx = -1;
          let emailIdx = -1;
          let rollNoIdx = -1;

          if (hasHeader) {
            nameIdx = headerRow.findIndex((h) => ['student name', 'full name', 'name'].includes(h));
            emailIdx = headerRow.findIndex((h) => ['email', 'e-mail', 'email address'].includes(h));
            rollNoIdx = headerRow.findIndex((h) =>
              ['student id', 'roll no', 'roll number', 'roll_no', 'student_id', 'rollno', 'roll'].includes(h)
            );
          }

          const entries: Array<{ name: string; email: string; rollNo?: string }> = [];
          for (let i = startIndex; i < rows.length; i++) {
            const parts = rows[i];
            if (parts.length >= 2) {
              const name = (nameIdx >= 0 && parts[nameIdx] ? parts[nameIdx] : parts[0]) || 'Student Candidate';
              const email = (emailIdx >= 0 && parts[emailIdx] ? parts[emailIdx] : parts.find((p) => p.includes('@'))) || parts[1] || '';
              const rollNo = rollNoIdx >= 0 && parts[rollNoIdx] ? parts[rollNoIdx] : undefined;
              if (email) {
                entries.push({ name, email, ...(rollNo ? { rollNo } : {}) });
              }
            }
          }
          setParsedStudents(entries);
          setRowCount(entries.length);
          if (entries.length === 0) {
            toast.error('No valid student records found in the uploaded file.', 'Parse Error');
          } else {
            toast.success(`Parsed ${entries.length} student records from ${file.name}`, 'CSV Loaded');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSample = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Student Name,Handle,Email,Student ID,Cohort,Institution\n' +
      'Maya Lin,mayalin_cs,m.lin@iitb.ac.in,IITB-2026-014,Batch 2026 CS,IIT Bombay\n' +
      'Liam Vance,liam_vance,l.vance@stanford.edu,STAN-2026-088,Batch 2026 Alpha,Stanford CS\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'student_roster_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Sample student roster template downloaded (.csv)', 'Template Downloaded');
  };

  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) return;
    const effectiveInstitutionId = institutionId || selectedInstitutionId || undefined;
    if (!effectiveInstitutionId) {
      toast.error('Please select an institution before importing students.', 'Institution Required');
      return;
    }
    setIsProcessing(true);
    try {
      const targetBatchId =
        selectedBatchId && selectedBatchId !== 'ALL' && selectedBatchId !== 'Unassigned'
          ? selectedBatchId
          : undefined;

      await apiService.bulkInviteUsers({
        users: parsedStudents.map((s) => ({
          name: s.name,
          email: s.email,
          role: 'STUDENT',
          ...(effectiveInstitutionId ? { institutionId: effectiveInstitutionId } : {}),
          ...(targetBatchId ? { batchId: targetBatchId } : {}),
          ...(s.rollNo ? { rollNo: s.rollNo } : {}),
        })),
      });
      onImportSuccess(parsedStudents.length);
      onClose();
      setFileName(null);
      setRowCount(0);
      setParsedStudents([]);
    } catch (err: any) {
      console.error('Failed to bulk import students:', err);
      toast.error(err?.message || 'Failed to import student roster', 'Import Failed');
    } finally {
      setIsProcessing(false);
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
            <TableChartRoundedIcon sx={{ color: '#2563EB', fontSize: '1.3rem' }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.1rem' }}>
              Bulk Roster Import (CSV)
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.8rem' }}>
              Upload and provision student coder accounts into cohorts
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
        {/* Step 1: Destination Institution & Batch */}
        <Box sx={{ display: 'grid', gridTemplateColumns: batches.length > 0 ? { xs: '1fr', sm: '1.2fr 1fr' } : '1fr', gap: 1.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.72rem' }}>
              TARGET INSTITUTION
            </Typography>
            {institutionName ? (
              <Box
                sx={{
                  p: 1.25,
                  px: 1.75,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <SchoolRoundedIcon sx={{ color: '#2563EB', fontSize: 18 }} />
                <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {institutionName}
                </Typography>
              </Box>
            ) : (
              <Select
                size="small"
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#0F172A',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '& .MuiSvgIcon-root': { color: '#64748B' },
                }}
              >
                {availableInstitutions.length > 0 ? (
                  availableInstitutions.map((inst) => (
                    <MenuItem key={inst.id} value={inst.id}>
                      {inst.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value=""><em>No institutions found</em></MenuItem>
                )}
              </Select>
            )}
          </Box>

          {batches.length > 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.72rem' }}>
                TARGET BATCH / COHORT
              </Typography>
              <Select
                size="small"
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#0F172A',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  '& .MuiSvgIcon-root': { color: '#64748B' },
                }}
              >
                <MenuItem value=""><em>Unassigned / From CSV</em></MenuItem>
                {batches.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.name} {b.code ? `(${b.code})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}
        </Box>

        {/* Step 2: Upload Dropzone */}
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
          <input type="file" accept=".csv" hidden onChange={handleSimulateFileSelect} />
          <CloudUploadRoundedIcon sx={{ fontSize: '2.8rem', color: '#2563EB' }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
              {fileName ? fileName : 'Click to select or drag CSV file'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
              Supported format: .CSV (Up to 5,000 students per batch)
            </Typography>
          </Box>
          {fileName && (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ color: '#16A34A !important', fontSize: '0.9rem !important' }} />}
              label={`${rowCount} student coders detected in file`}
              size="small"
              sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 700, borderRadius: '9999px', border: '1px solid #BBF7D0' }}
            />
          )}
        </Box>

        {/* Template download link */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Need the official column format?
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
          disabled={
            !fileName ||
            isProcessing ||
            parsedStudents.length === 0 ||
            (!institutionId && !selectedInstitutionId)
          }
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
          {isProcessing ? 'Processing Roster...' : `Import ${rowCount || ''} Students`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
