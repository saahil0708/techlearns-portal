'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Select,
  MenuItem,
} from '@mui/material';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { TestCaseItem } from './types';

interface CodingLabTabProps {
  codeTitle: string;
  setCodeTitle: (t: string) => void;
  codeLanguage: string;
  setCodeLanguage: (l: string) => void;
  codeStatement: string;
  setCodeStatement: (s: string) => void;
  starterCode: string;
  setStarterCode: (c: string) => void;
  sampleInput: string;
  setSampleInput: (i: string) => void;
  sampleOutput: string;
  setSampleOutput: (o: string) => void;
  testCases: TestCaseItem[];
  setTestCases: (tc: TestCaseItem[]) => void;
  borderColor: string;
}

export function CodingLabTab({
  codeTitle,
  setCodeTitle,
  codeLanguage,
  setCodeLanguage,
  codeStatement,
  setCodeStatement,
  starterCode,
  setStarterCode,
  sampleInput,
  setSampleInput,
  sampleOutput,
  setSampleOutput,
  testCases,
  setTestCases,
  borderColor,
}: CodingLabTabProps) {
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Problem Statement & Language */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Challenge Title
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Reverse Words in a String"
            value={codeTitle}
            onChange={(e) => setCodeTitle(e.target.value)}
            slotProps={{
              input: {
                sx: {
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  bgcolor: '#F8FAFC',
                },
              },
            }}
          />
        </Box>

        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Default Language
          </Typography>
          <Select
            fullWidth
            size="small"
            value={codeLanguage}
            onChange={(e) => setCodeLanguage(e.target.value)}
            sx={{
              borderRadius: '10px',
              fontSize: '0.88rem',
              bgcolor: '#F8FAFC',
            }}
          >
            <MenuItem value="python">Python 3 (CPython)</MenuItem>
            <MenuItem value="cpp">C++ (GCC 12)</MenuItem>
            <MenuItem value="java">Java (OpenJDK 17)</MenuItem>
            <MenuItem value="javascript">JavaScript (Node.js)</MenuItem>
            <MenuItem value="typescript">TypeScript</MenuItem>
            <MenuItem value="go">Go 1.21</MenuItem>
            <MenuItem value="rust">Rust</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Problem Description */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
          Problem Statement & Specifications
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="Implement an algorithm that receives input data and returns the expected result..."
          value={codeStatement}
          onChange={(e) => setCodeStatement(e.target.value)}
          slotProps={{
            input: {
              sx: {
                borderRadius: '10px',
                fontSize: '0.88rem',
                bgcolor: '#F8FAFC',
              },
            },
          }}
        />
      </Box>

      {/* Starter Code Template */}
      <Box>
        <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
          Starter Code Boilerplate Template
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={5}
          value={starterCode}
          onChange={(e) => setStarterCode(e.target.value)}
          slotProps={{
            input: {
              sx: {
                borderRadius: '10px',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                bgcolor: '#0F172A',
                color: '#38BDF8',
                '& textarea': { color: '#F1F5F9' },
              },
            },
          }}
        />
      </Box>

      {/* Sample I/O */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Sample Input
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.85rem', bgcolor: '#F8FAFC' } } }}
          />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
            Sample Output
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={sampleOutput}
            onChange={(e) => setSampleOutput(e.target.value)}
            slotProps={{ input: { sx: { borderRadius: '10px', fontSize: '0.85rem', bgcolor: '#F8FAFC' } } }}
          />
        </Box>
      </Box>

      {/* Test Cases Suite */}
      <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
            Automated Test Cases Suite
          </Typography>
          <Button
            size="small"
            onClick={handleAddTestCase}
            startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#2563EB' }}
          >
            Add Test Case
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {testCases.map((tc, tIdx) => (
            <Box
              key={tIdx}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '2fr 2fr auto auto' },
                gap: 1.5,
                alignItems: 'center',
                bgcolor: '#FFFFFF',
                p: 1.25,
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
              }}
            >
              <TextField
                size="small"
                placeholder="Test Input..."
                value={tc.input}
                onChange={(e) => {
                  const next = [...testCases];
                  next[tIdx].input = e.target.value;
                  setTestCases(next);
                }}
                slotProps={{ input: { sx: { borderRadius: '8px', fontSize: '0.84rem' } } }}
              />
              <TextField
                size="small"
                placeholder="Expected Output..."
                value={tc.expectedOutput}
                onChange={(e) => {
                  const next = [...testCases];
                  next[tIdx].expectedOutput = e.target.value;
                  setTestCases(next);
                }}
                slotProps={{ input: { sx: { borderRadius: '8px', fontSize: '0.84rem' } } }}
              />
              <Chip
                label={tc.isHidden ? 'Hidden' : 'Public'}
                size="small"
                onClick={() => {
                  const next = [...testCases];
                  next[tIdx].isHidden = !next[tIdx].isHidden;
                  setTestCases(next);
                }}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.74rem',
                  bgcolor: tc.isHidden ? '#FEF3C7' : '#EFF6FF',
                  color: tc.isHidden ? '#B45309' : '#2563EB',
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleRemoveTestCase(tIdx)}
                disabled={testCases.length <= 1}
                sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
