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
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';
import { parseCsvText } from '@/utils/csv';
import { ProblemCategory, ProblemDifficulty, ProblemEntity } from '@/types/problem';

export interface ParsedProblemRow {
  title: string;
  code: string;
  category: ProblemCategory;
  difficulty: ProblemDifficulty;
  points: number;
  timeLimitMs: number;
  memoryLimitMb: number;
  tags: string[];
  statement: string;
  sampleInput: string;
  sampleOutput: string;
}

export interface BulkImportProblemsModalProps {
  open: boolean;
  onClose: () => void;
  onImportSuccess: (importedProblems: ProblemEntity[]) => void;
}

export default function BulkImportProblemsModal({
  open,
  onClose,
  onImportSuccess,
}: BulkImportProblemsModalProps) {
  const toast = useToast();
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsedProblems, setParsedProblems] = useState<ParsedProblemRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const borderColor = '#E2E8F0';

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setFileName(null);
        setParsedProblems([]);
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
            setParsedProblems([]);
            toast.error('The uploaded CSV file is empty.', 'Empty File');
            return;
          }

          const headerRow = rows[0].map((h) => h.trim().toLowerCase());
          const startIndex = 1;

          const titleIdx = headerRow.findIndex((h) => ['title', 'problem title', 'problem_title', 'name'].includes(h));
          const codeIdx = headerRow.findIndex((h) => ['code', 'problem code', 'problem_code', 'id'].includes(h));
          const catIdx = headerRow.findIndex((h) => ['category', 'topic', 'topic category', 'category_name'].includes(h));
          const diffIdx = headerRow.findIndex((h) => ['difficulty', 'diff', 'tier', 'level'].includes(h));
          const pointsIdx = headerRow.findIndex((h) => ['points', 'score', 'pts', 'point_value'].includes(h));
          const timeIdx = headerRow.findIndex((h) => ['timelimit', 'timelimitms', 'time limit', 'time_limit_ms', 'time_limit'].includes(h));
          const memIdx = headerRow.findIndex((h) => ['memorylimit', 'memorylimitmb', 'memory limit', 'memory_limit_mb', 'memory_limit'].includes(h));
          const tagsIdx = headerRow.findIndex((h) => ['tags', 'keywords', 'patterns'].includes(h));
          const stmtIdx = headerRow.findIndex((h) => ['statement', 'problem statement', 'statementmarkdown', 'description', 'problem_statement'].includes(h));
          const sampleInIdx = headerRow.findIndex((h) => ['sampleinput', 'sample input', 'sample_input', 'input'].includes(h));
          const sampleOutIdx = headerRow.findIndex((h) => ['sampleoutput', 'sample output', 'sample_output', 'output'].includes(h));

          if (titleIdx === -1 || stmtIdx === -1) {
            toast.error(
              'Missing required columns. CSV must contain at least "Title" and "Statement" header columns.',
              'Invalid CSV Header'
            );
            return;
          }

          const entries: ParsedProblemRow[] = [];
          for (let i = startIndex; i < rows.length; i++) {
            const parts = rows[i];
            if (!parts || parts.length === 0 || !parts[titleIdx]?.trim()) continue;

            const title = parts[titleIdx].trim();
            const statement = (stmtIdx >= 0 && parts[stmtIdx] ? parts[stmtIdx] : `Solve the problem ${title}.`).trim();
            const rawDiff = (diffIdx >= 0 && parts[diffIdx] ? parts[diffIdx] : 'Medium').trim().toLowerCase();
            const difficulty: ProblemDifficulty =
              rawDiff.startsWith('h') ? 'Hard' : rawDiff.startsWith('e') ? 'Easy' : 'Medium';

            const rawCat = (catIdx >= 0 && parts[catIdx] ? parts[catIdx] : '').trim();
            let category: ProblemCategory = 'Arrays & Two Pointers';
            if (rawCat.toLowerCase().includes('math') || title.toLowerCase().includes('even') || title.toLowerCase().includes('odd') || title.toLowerCase().includes('prime')) {
              category = 'Math & Number Theory';
            } else if (rawCat.toLowerCase().includes('dp') || rawCat.toLowerCase().includes('dynamic') || title.toLowerCase().includes('coin') || title.toLowerCase().includes('knapsack')) {
              category = 'Dynamic Programming';
            } else if (rawCat.toLowerCase().includes('tree') || rawCat.toLowerCase().includes('bst')) {
              category = 'Trees & Binary Search Trees';
            } else if (rawCat.toLowerCase().includes('graph') || rawCat.toLowerCase().includes('bfs') || rawCat.toLowerCase().includes('dfs')) {
              category = 'Graph Theory & BFS/DFS';
            } else if (rawCat.toLowerCase().includes('string') || rawCat.toLowerCase().includes('trie')) {
              category = 'Strings & Tries';
            } else if (rawCat.toLowerCase().includes('greedy')) {
              category = 'Greedy & Heuristics';
            } else if (rawCat) {
              category = rawCat as ProblemCategory;
            }

            const code = (codeIdx >= 0 && parts[codeIdx] ? parts[codeIdx] : `PROB-${Math.random().toString(36).substring(2, 6).toUpperCase()}`).trim();
            const points = pointsIdx >= 0 && !isNaN(parseInt(parts[pointsIdx], 10))
              ? parseInt(parts[pointsIdx], 10)
              : difficulty === 'Hard' ? 120 : difficulty === 'Medium' ? 80 : 20;

            const timeLimitMs = timeIdx >= 0 && !isNaN(parseInt(parts[timeIdx], 10)) ? parseInt(parts[timeIdx], 10) : 1000;
            const memoryLimitMb = memIdx >= 0 && !isNaN(parseInt(parts[memIdx], 10)) ? parseInt(parts[memIdx], 10) : 256;
            
            const rawTags = tagsIdx >= 0 && parts[tagsIdx] ? parts[tagsIdx] : '';
            const tags = rawTags
              ? rawTags.split(/[;,]/).map((t) => t.trim()).filter(Boolean)
              : [category, difficulty];

            const sampleInput = (sampleInIdx >= 0 && parts[sampleInIdx] ? parts[sampleInIdx] : '').trim();
            const sampleOutput = (sampleOutIdx >= 0 && parts[sampleOutIdx] ? parts[sampleOutIdx] : '').trim();

            entries.push({
              title,
              code,
              category,
              difficulty,
              points,
              timeLimitMs,
              memoryLimitMb,
              tags,
              statement,
              sampleInput,
              sampleOutput,
            });
          }

          setParsedProblems(entries);
          if (entries.length === 0) {
            toast.error('No valid problem records found in CSV file.', 'Parse Error');
          } else {
            toast.success(`Successfully parsed ${entries.length} coding problems from ${file.name}`, 'CSV Loaded');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSampleTemplate = () => {
    const csvContent =
      'Title,Code,Category,Difficulty,Points,TimeLimitMs,MemoryLimitMb,Tags,Statement,SampleInput,SampleOutput\n' +
      '"Check Even or Odd",EVEN-ODD,"Math & Number Theory",Easy,20,1000,256,"Math; Number Theory; Conditionals","### Problem Statement\\nGiven an integer n, determine if it is Even or Odd.\\n- Print Even if divisible by 2.\\n- Print Odd otherwise.",4,Even\n' +
      '"Two Sum Lookups",TWO-SUM,"Arrays & Two Pointers",Easy,80,1000,256,"Arrays; Hash Map; Two Pointers","### Problem Statement\\nGiven an array nums and integer target, return indices of two numbers that add up to target.","nums = [2,7,11,15], target = 9","[0,1]"\n' +
      '"Coin Change: Minimum Coins",COIN-CHANGE,"Dynamic Programming",Medium,100,1000,256,"Dynamic Programming; Knapsack; Arrays","### Problem Statement\\nFind minimum number of coins needed to make up amount.","coins = [1,2,5], amount = 11",3\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'problems_bulk_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.info('Sample coding problem template downloaded (.csv)', 'Template Downloaded');
  };

  const handleExecuteImport = async () => {
    if (parsedProblems.length === 0) return;
    setIsProcessing(true);

    const createdEntities: ProblemEntity[] = [];
    const failedRows: { title: string; reason: string }[] = [];

    try {
      for (const p of parsedProblems) {
        try {
          const apiRes = await apiService.createProblem({
            title: p.title,
            statement: p.statement,
            difficulty: p.difficulty.toUpperCase(),
            timeLimit: p.timeLimitMs,
            memoryLimit: p.memoryLimitMb,
            inputFormat: 'Standard Input',
            outputFormat: 'Standard Output',
            status: 'PUBLISHED',
            code: p.code,
            category: p.category,
            tags: p.tags,
            points: p.points,
          });

          const createdId = apiRes?.id || `prob-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

          createdEntities.push({
            id: createdId,
            code: p.code,
            slug: apiRes?.slug || p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            title: p.title,
            category: p.category,
            difficulty: p.difficulty,
            acceptanceRate: 65.0,
            totalSubmissions: 0,
            acceptedSubmissions: 0,
            testCasesCount: p.sampleInput ? 2 : 1,
            authorName: 'Faculty Admin',
            tags: p.tags,
            status: 'Published',
            points: p.points,
            timeLimitMs: p.timeLimitMs,
            memoryLimitMb: p.memoryLimitMb,
            likes: 0,
            dislikes: 0,
            premium: false,
            companies: [],
            statementMarkdown: p.statement,
            sampleTestCases: p.sampleInput
              ? [{ input: p.sampleInput, output: p.sampleOutput, explanation: 'Sample test case.' }]
              : [],
          });
        } catch (apiErr: any) {
          console.warn(`Failed to import problem row "${p.title}":`, apiErr);
          failedRows.push({ title: p.title, reason: apiErr?.message || 'Creation error' });
        }
      }

      if (createdEntities.length > 0) {
        if (failedRows.length === 0) {
          toast.success(`Successfully imported all ${createdEntities.length} coding problems!`, 'Bulk Import Complete 🎉');
        } else {
          toast.warning(
            `Imported ${createdEntities.length} problems (${failedRows.length} failed: ${failedRows.map((f) => f.title).join(', ')})`,
            'Partial Import Complete'
          );
        }
        onImportSuccess(createdEntities);
        onClose();
        setFileName(null);
        setParsedProblems([]);
      } else {
        toast.error(
          `Failed to import problems (${failedRows.length} rows failed). Please verify data format and try again.`,
          'Import Failed'
        );
      }
    } catch (err: any) {
      console.error('Failed bulk problem import:', err);
      toast.error(err?.message || 'Failed to import problems.', 'Import Failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isProcessing ? undefined : onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '20px',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            bgcolor: '#FFFFFF',
            overflow: 'hidden',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 2.5,
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              bgcolor: 'rgba(37, 99, 235, 0.1)',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CloudUploadRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A' }}>
              Bulk Import Coding Problems (.CSV)
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B' }}>
              Upload and provision problems, constraints, sample cases, and tags in batch.
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose} disabled={isProcessing}>
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {/* Required Fields Guide Banner */}
        <Box
          sx={{
            p: 2,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.25,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#0F172A' }}>
              CSV Column Specification & Guidelines
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#DC2626' }}>
              Mandatory Fields:
            </Typography>
            <Chip size="small" label="Title *" sx={{ fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#DC2626' }} />
            <Chip size="small" label="Statement / Markdown *" sx={{ fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#DC2626' }} />
            <Chip size="small" label="Difficulty (Easy | Medium | Hard) *" sx={{ fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#DC2626' }} />
            <Chip size="small" label="SampleInput *" sx={{ fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#DC2626' }} />
            <Chip size="small" label="SampleOutput *" sx={{ fontSize: '0.72rem', fontWeight: 700, bgcolor: '#FEE2E2', color: '#DC2626' }} />
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
            <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563EB' }}>
              Optional Fields:
            </Typography>
            <Chip size="small" label="Code (e.g. EVEN-ODD)" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
            <Chip size="small" label="Category (e.g. Math & Number Theory)" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
            <Chip size="small" label="Points (e.g. 20, 80, 120)" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
            <Chip size="small" label="TimeLimitMs (default: 1000)" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
            <Chip size="small" label="MemoryLimitMb (default: 256)" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
            <Chip size="small" label="Tags (separated by semicolon)" sx={{ fontSize: '0.72rem', fontWeight: 600, bgcolor: '#DBEAFE', color: '#1E40AF' }} />
          </Box>
        </Box>

        {/* Upload Box */}
        <Box
          component="label"
          sx={{
            border: '2px dashed #93C5FD',
            borderRadius: '16px',
            bgcolor: '#EFF6FF',
            p: 3.5,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.25,
            '&:hover': {
              bgcolor: '#DBEAFE',
              borderColor: '#3B82F6',
            },
          }}
        >
          <input type="file" accept=".csv" onChange={handleFileSelect} hidden />
          <CloudUploadRoundedIcon sx={{ fontSize: 44, color: '#2563EB' }} />
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E40AF' }}>
            {fileName ? fileName : 'Click or Drag & Drop .CSV Problem Batch File'}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
            Standard comma-separated format (.csv), UTF-8 encoded
          </Typography>
        </Box>

        {/* Download Sample Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleDownloadSampleTemplate}
            sx={{
              borderColor: '#CBD5E1',
              color: '#334155',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: '8px',
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Download Sample CSV Template
          </Button>
          {parsedProblems.length > 0 && (
            <Chip
              icon={<CheckCircleRoundedIcon sx={{ fontSize: 16 }} />}
              label={`${parsedProblems.length} Problems Ready to Import`}
              color="success"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Box>

        {/* Parsed Preview Table */}
        {parsedProblems.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '0.85rem', color: '#0F172A' }}>
              Preview Parsed Problems ({parsedProblems.length})
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: '10px', maxHeight: 240 }}>
              <Table size="small" stickyHeader>
                <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>CODE</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>TITLE</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>CATEGORY</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>DIFFICULTY</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>POINTS</TableCell>
                    <TableCell sx={{ fontWeight: 800, fontSize: '0.74rem' }}>SAMPLE IN/OUT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedProblems.slice(0, 10).map((row, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: '#2563EB' }}>
                        {row.code}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#0F172A' }}>
                        {row.title}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', color: '#475569' }}>
                        {row.category}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.difficulty}
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            height: 20,
                            bgcolor: row.difficulty === 'Hard' ? '#FEF2F2' : row.difficulty === 'Medium' ? '#FFFBEB' : '#F0FDF4',
                            color: row.difficulty === 'Hard' ? '#DC2626' : row.difficulty === 'Medium' ? '#D97706' : '#16A34A',
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                        {row.points} pts
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#64748B' }}>
                        {row.sampleInput || '—'} ➔ {row.sampleOutput || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${borderColor}`, gap: 1 }}>
        <Button onClick={onClose} disabled={isProcessing} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={parsedProblems.length === 0 || isProcessing}
          onClick={handleExecuteImport}
          startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />}
          sx={{
            bgcolor: '#2563EB',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            px: 2.5,
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          {isProcessing ? 'Importing Problems...' : `Import ${parsedProblems.length} Problems`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
