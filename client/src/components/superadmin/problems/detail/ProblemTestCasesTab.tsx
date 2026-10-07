'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import { useToast } from '@/context/ToastContext';
import { TestCaseItem } from './types';

interface ProblemTestCasesTabProps {
  testCases: TestCaseItem[];
  filteredTestCases: TestCaseItem[];
  testCaseSearch: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onEditTestCase?: (updated: TestCaseItem) => void;
  onDeleteTestCase?: (testCaseId: string) => void;
}

export default function ProblemTestCasesTab({
  filteredTestCases,
  testCaseSearch,
  onSearchChange,
  onOpenAddModal,
  onEditTestCase,
  onDeleteTestCase,
}: ProblemTestCasesTabProps) {
  const toast = useToast();

  // Edit Test Case Modal State
  const [editingTc, setEditingTc] = useState<TestCaseItem | null>(null);
  const [editInput, setEditInput] = useState('');
  const [editOutput, setEditOutput] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [editIsHidden, setEditIsHidden] = useState(false);
  const [editPoints, setEditPoints] = useState(20);

  // Delete Confirmation State
  const [deletingTcId, setDeletingTcId] = useState<string | null>(null);

  const handleOpenEdit = (tc: TestCaseItem) => {
    setEditingTc(tc);
    setEditInput(tc.input);
    setEditOutput(tc.expectedOutput);
    setEditExplanation(tc.explanation || '');
    setEditIsHidden(tc.isHidden);
    setEditPoints(tc.points || 20);
  };

  const handleSaveEdit = () => {
    if (!editingTc) return;
    if (!editInput.trim() || !editOutput.trim()) {
      toast.error('Input and Expected Output cannot be empty.', 'Validation Error');
      return;
    }

    const updated: TestCaseItem = {
      ...editingTc,
      input: editInput.trim(),
      expectedOutput: editOutput.trim(),
      explanation: editExplanation.trim(),
      isHidden: editIsHidden,
      points: editPoints,
    };

    if (onEditTestCase) {
      onEditTestCase(updated);
    }
    setEditingTc(null);
  };

  const handleConfirmDelete = () => {
    if (deletingTcId && onDeleteTestCase) {
      onDeleteTestCase(deletingTcId);
    }
    setDeletingTcId(null);
  };

  return (
    <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
          Evaluation Test Cases Matrix
        </Typography>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <TextField
            placeholder="Search test cases..."
            size="small"
            value={testCaseSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={onOpenAddModal}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#2563EB',
              '&:hover': { bgcolor: '#1D4ED8' },
            }}
          >
            New Case
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>ORDER</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>VISIBILITY</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>SAMPLE INPUT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>EXPECTED OUTPUT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>WEIGHT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTestCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 5, color: '#94A3B8' }}>
                  No test cases found matching criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredTestCases.map((tc) => (
                <TableRow key={tc.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 800, color: '#0F172A', fontFamily: 'monospace' }}>
                    #{tc.order}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tc.isHidden ? 'Hidden Case' : 'Public Sample'}
                      size="small"
                      sx={{
                        bgcolor: tc.isHidden ? '#FEF2F2' : '#EFF6FF',
                        color: tc.isHidden ? '#DC2626' : '#2563EB',
                        border: `1px solid ${tc.isHidden ? '#FECACA' : '#DBEAFE'}`,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                        borderRadius: '6px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.84rem', color: '#1E293B', maxWidth: 220 }}>
                    <Box sx={{ bgcolor: '#F8FAFC', p: 0.8, borderRadius: '6px', border: '1px solid #E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tc.input}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.84rem', color: '#16A34A', maxWidth: 180 }}>
                    <Box sx={{ bgcolor: '#F0FDF4', p: 0.8, borderRadius: '6px', border: '1px solid #BBF7D0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tc.expectedOutput}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                    {tc.points} pts
                  </TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, alignItems: 'center' }}>
                      <Tooltip title="Copy Input / Output" arrow>
                        <IconButton
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(`Input: ${tc.input}\nOutput: ${tc.expectedOutput}`);
                            toast.info(`Test case #${tc.order} copied to clipboard`, 'Copied');
                          }}
                          sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                        >
                          <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Edit Test Case" arrow>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(tc)}
                          sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                        >
                          <EditRoundedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete Test Case" arrow>
                        <IconButton
                          size="small"
                          onClick={() => setDeletingTcId(tc.id)}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Test Case Dialog */}
      <Dialog
        open={Boolean(editingTc)}
        onClose={() => setEditingTc(null)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '20px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Edit Test Case #{editingTc?.order}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Sample Input (stdin)"
            multiline
            rows={3}
            fullWidth
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.86rem' } } }}
          />
          <TextField
            label="Expected Output (stdout)"
            multiline
            rows={2}
            fullWidth
            value={editOutput}
            onChange={(e) => setEditOutput(e.target.value)}
            slotProps={{ input: { sx: { fontFamily: 'monospace', fontSize: '0.86rem' } } }}
          />
          <TextField
            label="Explanation (optional)"
            fullWidth
            size="small"
            value={editExplanation}
            onChange={(e) => setEditExplanation(e.target.value)}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <TextField
              label="Weight (Points)"
              type="number"
              size="small"
              sx={{ width: 140 }}
              value={editPoints}
              onChange={(e) => setEditPoints(Number(e.target.value))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editIsHidden}
                  onChange={(e) => setEditIsHidden(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
                  Hidden Evaluation Case
                </Typography>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditingTc(null)} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            sx={{ textTransform: 'none', bgcolor: '#2563EB', fontWeight: 700, borderRadius: '8px' }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Test Case Confirmation Dialog */}
      <Dialog
        open={Boolean(deletingTcId)}
        onClose={() => setDeletingTcId(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Delete Test Case?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
            Are you sure you want to delete this testcase? This will remove it from judge evaluation.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setDeletingTcId(null)} sx={{ textTransform: 'none', color: '#64748B' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
