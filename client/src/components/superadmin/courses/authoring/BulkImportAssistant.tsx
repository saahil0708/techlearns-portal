'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { LessonModality, TestCaseItem } from './types';
import { robustParseJson } from '@/lib/curriculum-import-parser';

interface BulkImportAssistantProps {
  modality: LessonModality;
  bulkImportText: string;
  setBulkImportText: (text: string) => void;
  bulkImportError: string | null;
  setBulkImportError: (err: string | null) => void;
  bulkImportSuccessMsg: string | null;
  setBulkImportSuccessMsg: (msg: string | null) => void;
  setTitle: (t: string) => void;
  title: string;
  setDurationMinutes: (d: number) => void;
  setReadingContent: (c: string) => void;
  setKeyTakeaways: (t: string[]) => void;
  setQuizQuestion: (q: string) => void;
  setQuizOptions: (opts: string[]) => void;
  quizOptions: string[];
  setMcqCorrectIndex: (idx: number) => void;
  setMsqCorrectIndices: (idxs: number[]) => void;
  setQuizExplanation: (exp: string) => void;
  setQuizHint: (h: string) => void;
  setQuizPoints: (pts: number) => void;
  setCodeTitle: (t: string) => void;
  setCodeStatement: (s: string) => void;
  setCodeLanguage: (l: string) => void;
  setStarterCode: (c: string) => void;
  setSampleInput: (i: string) => void;
  setSampleOutput: (o: string) => void;
  setTestCases: (tc: TestCaseItem[]) => void;
}

const normalizeImportedLanguage = (langStr: string): string | null => {
  const l = langStr.toLowerCase().trim();
  if (l === 'python' || l === 'py' || l === 'python3' || l === 'cpython') return 'python';
  if (l === 'cpp' || l === 'c++' || l === 'c' || l === 'g++' || l === 'gcc') return 'cpp';
  if (l === 'java' || l === 'openjdk') return 'java';
  if (l === 'javascript' || l === 'js' || l === 'node' || l === 'nodejs') return 'javascript';
  if (l === 'typescript' || l === 'ts') return 'typescript';
  if (l === 'go' || l === 'golang') return 'go';
  if (l === 'rust' || l === 'rs') return 'rust';
  return null;
};

export function BulkImportAssistant({
  modality,
  bulkImportText,
  setBulkImportText,
  bulkImportError,
  setBulkImportError,
  bulkImportSuccessMsg,
  setBulkImportSuccessMsg,
  setTitle,
  title,
  setDurationMinutes,
  setReadingContent,
  setKeyTakeaways,
  setQuizQuestion,
  setQuizOptions,
  quizOptions,
  setMcqCorrectIndex,
  setMsqCorrectIndices,
  setQuizExplanation,
  setQuizHint,
  setQuizPoints,
  setCodeTitle,
  setCodeStatement,
  setCodeLanguage,
  setStarterCode,
  setSampleInput,
  setSampleOutput,
  setTestCases,
}: BulkImportAssistantProps) {
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const getBulkTemplate = () => {
    if (modality === 'reading') {
      return `# Submodule Title: Memory References & Pointer Mechanics
Duration: 20

## Technical Lecture Notes
Variables in Python act as typed reference pointers to runtime heap objects.

> [!NOTE]
> All variable names live in local or global namespaces pointing to PyObject instances.

> [!TIP]
> Use sys.getrefcount(obj) to inspect live reference counts.

## Key Takeaways
- Immutable objects create new allocations on modification.
- The 'is' keyword compares object memory IDs, whereas '==' compares equality.`;
    }

    if (modality === 'quiz') {
      return `Question: What is the average lookup complexity of searching a key in a Hash Table?
Option A: O(1)
Option B: O(log N)
Option C: O(N)
Option D: O(N log N)
Correct: A
Explanation: Hash tables compute array bucket indices in direct O(1) time via hash codes.
Hint: Think about direct address indexing.
Points: 10`;
    }

    if (modality === 'msq') {
      return `Question: Which of the following built-in data types in Python are immutable?
Option A: int
Option B: list
Option C: tuple
Option D: str
Correct: A, C, D
Explanation: int, tuple, and str cannot be mutated in place; lists and dictionaries are mutable.
Hint: Think about modifying an element via indexing.
Points: 20`;
    }

    return `Title: Two Sum Problem
Language: python
Duration: 25
Statement: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

StarterCode:
def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

SampleInput: nums = [2,7,11,15], target = 9
SampleOutput: [0, 1]

TestCases:
[2, 7, 11, 15], 9 | [0, 1] | public
[3, 2, 4], 6 | [1, 2] | public
[3, 3], 6 | [0, 1] | hidden`;
  };

  const handleCopyTemplate = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(getBulkTemplate());
      setCopiedTemplate(true);
      setTimeout(() => setCopiedTemplate(false), 2000);
    }
  };

  const handleApplyBulkImport = () => {
    setBulkImportError(null);
    setBulkImportSuccessMsg(null);

    const raw = bulkImportText.trim();
    if (!raw) {
      setBulkImportError('Please paste content into the bulk import area before applying.');
      return;
    }

    try {
      if (raw.startsWith('{') || raw.startsWith('[')) {
        const data = robustParseJson(raw);

        if (modality === 'reading') {
          if (data.title && typeof data.title === 'string') {
            setTitle(data.title.trim());
          }
          if (data.durationMinutes && Number(data.durationMinutes)) {
            setDurationMinutes(Number(data.durationMinutes));
          }
          if (data.content !== undefined) setReadingContent(String(data.content));
          if (Array.isArray(data.takeaways) && data.takeaways.length > 0) {
            setKeyTakeaways(data.takeaways.map((t: any) => String(t).trim()));
          }
          setBulkImportSuccessMsg('Successfully parsed and imported Reading Notes & Takeaways!');
        } else if (modality === 'quiz' || modality === 'msq') {
          const effectiveOptions = Array.isArray(data.options) && data.options.length >= 2
            ? data.options.map((o: any) => String(o).trim())
            : quizOptions;
          const maxIdx = Math.max(0, effectiveOptions.length - 1);

          if (modality === 'quiz' && data.correctIndex !== undefined) {
            const rawVal = data.correctIndex;
            const num = Number(rawVal);
            if (typeof rawVal === 'boolean' || !Number.isInteger(num) || num < 0 || num > maxIdx) {
              setBulkImportError(`Invalid correctIndex: "${rawVal}". Must be an integer between 0 and ${maxIdx}.`);
              return;
            }
          }

          if (modality === 'msq' && data.correctIndices !== undefined) {
            if (!Array.isArray(data.correctIndices) || data.correctIndices.some((idx: any) => typeof idx === 'boolean' || !Number.isInteger(Number(idx)) || Number(idx) < 0 || Number(idx) > maxIdx)) {
              setBulkImportError(`Invalid correctIndices. All indices must be integers between 0 and ${maxIdx}.`);
              return;
            }
          }

          if (data.title && typeof data.title === 'string') {
            setTitle(data.title.trim());
          }
          if (data.durationMinutes && Number(data.durationMinutes)) {
            setDurationMinutes(Number(data.durationMinutes));
          }
          if (data.question !== undefined) setQuizQuestion(String(data.question));
          if (Array.isArray(data.options) && data.options.length >= 2) {
            setQuizOptions(effectiveOptions);
          }
          if (data.correctIndex !== undefined) setMcqCorrectIndex(Number(data.correctIndex));
          if (Array.isArray(data.correctIndices)) setMsqCorrectIndices(data.correctIndices.map(Number));
          if (data.explanation !== undefined) setQuizExplanation(String(data.explanation));
          if (data.hint !== undefined) setQuizHint(String(data.hint));
          if (data.points !== undefined) setQuizPoints(Number(data.points));
          setBulkImportSuccessMsg(`Successfully parsed and imported ${modality === 'quiz' ? 'Single MCQ' : 'Multi MSQ'} question!`);
        } else if (modality === 'code') {
          let normalizedLang: string | null = null;
          if (data.language !== undefined) {
            normalizedLang = normalizeImportedLanguage(String(data.language));
            if (!normalizedLang) {
              setBulkImportError(`Unsupported programming language: "${data.language}". Supported languages are Python, C++, Java, JavaScript, TypeScript, Go, Rust.`);
              return;
            }
          }

          if (data.title && typeof data.title === 'string') {
            setTitle(data.title.trim());
          }
          if (data.durationMinutes && Number(data.durationMinutes)) {
            setDurationMinutes(Number(data.durationMinutes));
          }
          if (data.title !== undefined) setCodeTitle(String(data.title));
          const stmt = data.statement ?? data.description;
          if (stmt !== undefined) setCodeStatement(String(stmt));
          if (normalizedLang) {
            setCodeLanguage(normalizedLang);
          }
          if (data.starterCode !== undefined) {
            let sc = '';
            if (typeof data.starterCode === 'object' && data.starterCode !== null) {
              sc = String(data.starterCode.python || data.starterCode[Object.keys(data.starterCode)[0]] || '');
            } else {
              sc = String(data.starterCode);
            }
            setStarterCode(sc);
          }
          if (data.sampleInput !== undefined) setSampleInput(String(data.sampleInput));
          if (data.sampleOutput !== undefined) setSampleOutput(String(data.sampleOutput));
          if (Array.isArray(data.testCases) && data.testCases.length > 0) {
            setTestCases(
              data.testCases.map((tc: any) => ({
                input: tc.input !== undefined && tc.input !== null ? String(tc.input) : '',
                expectedOutput: tc.expectedOutput !== undefined && tc.expectedOutput !== null ? String(tc.expectedOutput) : '',
                isHidden: !!tc.isHidden,
              }))
            );
          }
          setBulkImportSuccessMsg('Successfully parsed and imported Coding Sandbox Challenge!');
        }
        return;
      }

      if (modality === 'reading') {
        const lines = raw.split('\n');
        let parsedTitle = '';
        const takeawaysList: string[] = [];
        const bodyLines: string[] = [];
        let inTakeawaysSection = false;

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (/^#\s+(?:Submodule Title:\s*)?(.*)$/i.test(trimmed) && !parsedTitle) {
            parsedTitle = trimmed.replace(/^#\s+(?:Submodule Title:\s*)?/i, '').trim();
            return;
          }
          if (/^Duration:\s*(\d+)/i.test(trimmed)) {
            const match = trimmed.match(/^Duration:\s*(\d+)/i);
            if (match) setDurationMinutes(Number(match[1]));
            return;
          }
          if (/^##?\s*(?:Key\s*)?Takeaways/i.test(trimmed)) {
            inTakeawaysSection = true;
            return;
          }
          if (inTakeawaysSection) {
            if (/^[-*+]\s+(.*)$/.test(trimmed)) {
              takeawaysList.push(trimmed.replace(/^[-*+]\s+/, '').trim());
            } else if (trimmed) {
              takeawaysList.push(trimmed);
            }
          } else {
            bodyLines.push(line);
          }
        });

        if (parsedTitle) setTitle(parsedTitle);
        if (bodyLines.length > 0) setReadingContent(bodyLines.join('\n').trim());
        if (takeawaysList.length > 0) setKeyTakeaways(takeawaysList);

        setBulkImportSuccessMsg('Imported Notes and Key Takeaways successfully!');
      } else if (modality === 'quiz' || modality === 'msq') {
        const isCsv = raw.includes(',') && (raw.toLowerCase().includes('option') || raw.toLowerCase().includes('question'));
        if (isCsv) {
          const rows = raw.split('\n').filter((r) => r.trim());
          const dataRow = rows.length > 1 && rows[0].toLowerCase().includes('question') ? rows[1] : rows[0];
          const cols = dataRow.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));

          if (cols.length >= 5) {
            setQuizQuestion(cols[0] || '');
            const parsedOpts = [cols[1], cols[2], cols[3], cols[4]].filter(Boolean);
            if (parsedOpts.length >= 2) setQuizOptions(parsedOpts);

            const correctCol = cols[5] || 'A';
            if (modality === 'quiz') {
              const charIdx = correctCol.trim().toUpperCase().charCodeAt(0) - 65;
              setMcqCorrectIndex(charIdx >= 0 && charIdx < parsedOpts.length ? charIdx : 0);
            } else {
              const letters = correctCol.toUpperCase().split(/[\s,]+/);
              const indices = letters
                .map((l) => l.charCodeAt(0) - 65)
                .filter((idx) => idx >= 0 && idx < parsedOpts.length);
              setMsqCorrectIndices(indices.length > 0 ? indices : [0]);
            }

            if (cols[6]) setQuizExplanation(cols[6]);
            if (cols[7]) setQuizHint(cols[7]);
            if (cols[8] && Number(cols[8])) setQuizPoints(Number(cols[8]));

            setBulkImportSuccessMsg('Imported Quiz CSV successfully!');
            return;
          }
        }

        const lines = raw.split('\n');
        let parsedQuestion = '';
        const parsedOpts: string[] = [];
        let parsedCorrectStr = '';
        let parsedExplanation = '';
        let parsedHint = '';
        let parsedPoints: number | undefined = undefined;

        lines.forEach((line) => {
          const t = line.trim();
          if (/^Question:\s*(.*)$/i.test(t)) {
            parsedQuestion = t.replace(/^Question:\s*/i, '').trim();
          } else if (/^(?:Option\s*)?[A-D][):.]\s*(.*)$/i.test(t)) {
            parsedOpts.push(t.replace(/^(?:Option\s*)?[A-D][):.]\s*/i, '').trim());
          } else if (/^(?:Correct|Answer):\s*(.*)$/i.test(t)) {
            parsedCorrectStr = t.replace(/^(?:Correct|Answer):\s*/i, '').trim();
          } else if (/^Explanation:\s*(.*)$/i.test(t)) {
            parsedExplanation = t.replace(/^Explanation:\s*/i, '').trim();
          } else if (/^Hint:\s*(.*)$/i.test(t)) {
            parsedHint = t.replace(/^Hint:\s*/i, '').trim();
          } else if (/^Points:\s*(\d+)$/i.test(t)) {
            parsedPoints = Number(t.replace(/^Points:\s*/i, ''));
          }
        });

        if (parsedQuestion) setQuizQuestion(parsedQuestion);
        if (!title.trim() && parsedQuestion) setTitle(parsedQuestion.slice(0, 60));
        if (parsedOpts.length >= 2) setQuizOptions(parsedOpts);

        if (parsedCorrectStr) {
          if (modality === 'quiz') {
            const charIdx = parsedCorrectStr.toUpperCase().charCodeAt(0) - 65;
            if (charIdx >= 0 && charIdx < (parsedOpts.length || quizOptions.length)) {
              setMcqCorrectIndex(charIdx);
            }
          } else {
            const letters = parsedCorrectStr.toUpperCase().split(/[\s,]+/);
            const indices = letters
              .map((l) => l.charCodeAt(0) - 65)
              .filter((idx) => idx >= 0 && idx < (parsedOpts.length || quizOptions.length));
            if (indices.length > 0) setMsqCorrectIndices(indices);
          }
        }

        if (parsedExplanation) setQuizExplanation(parsedExplanation);
        if (parsedHint) setQuizHint(parsedHint);
        if (parsedPoints !== undefined) setQuizPoints(parsedPoints);

        setBulkImportSuccessMsg(`Imported ${modality === 'quiz' ? 'MCQ' : 'MSQ'} question successfully!`);
      } else if (modality === 'code') {
        const lines = raw.split('\n');
        let parsedTitle = '';
        let parsedLang = '';
        let parsedDuration: number | null = null;
        let parsedStatement = '';
        const parsedStarterCode: string[] = [];
        let parsedSampleInput = '';
        let parsedSampleOutput = '';
        const parsedTestCases: Array<{ input: string; expectedOutput: string; isHidden: boolean }> = [];

        let currentSection: 'statement' | 'starter' | 'testcases' | 'none' = 'none';

        lines.forEach((line) => {
          const t = line.trim();
          if (/^Title:\s*(.*)$/i.test(t)) {
            parsedTitle = t.replace(/^Title:\s*/i, '').trim();
            currentSection = 'none';
          } else if (/^Language:\s*(.*)$/i.test(t)) {
            parsedLang = t.replace(/^Language:\s*/i, '').trim().toLowerCase();
            currentSection = 'none';
          } else if (/^Duration:\s*(\d+)/i.test(t)) {
            const match = t.match(/^Duration:\s*(\d+)/i);
            if (match) parsedDuration = Number(match[1]);
            currentSection = 'none';
          } else if (/^Statement:\s*(.*)$/i.test(t)) {
            parsedStatement = t.replace(/^Statement:\s*/i, '').trim();
            currentSection = 'statement';
          } else if (/^StarterCode:\s*$/i.test(t)) {
            currentSection = 'starter';
          } else if (/^SampleInput:\s*(.*)$/i.test(t)) {
            parsedSampleInput = t.replace(/^SampleInput:\s*/i, '').trim();
            currentSection = 'none';
          } else if (/^SampleOutput:\s*(.*)$/i.test(t)) {
            parsedSampleOutput = t.replace(/^SampleOutput:\s*/i, '').trim();
            currentSection = 'none';
          } else if (/^TestCases:\s*$/i.test(t)) {
            currentSection = 'testcases';
          } else {
            if (currentSection === 'starter') {
              parsedStarterCode.push(line);
            } else if (currentSection === 'statement') {
              parsedStatement += '\n' + line;
            } else if (currentSection === 'testcases' && t.includes('|')) {
              const parts = t.split('|').map((p) => p.trim());
              if (parts.length >= 2) {
                parsedTestCases.push({
                  input: parts[0],
                  expectedOutput: parts[1],
                  isHidden: parts[2] ? /hidden|true|private/i.test(parts[2]) : false,
                });
              }
            }
          }
        });

        let normalizedLang: string | null = null;
        if (parsedLang) {
          normalizedLang = normalizeImportedLanguage(parsedLang);
          if (!normalizedLang) {
            setBulkImportError(`Unsupported programming language: "${parsedLang}". Supported languages are Python, C++, Java, JavaScript, TypeScript, Go, Rust.`);
            return;
          }
        }

        if (parsedDuration !== null) setDurationMinutes(parsedDuration);
        if (parsedTitle) {
          setCodeTitle(parsedTitle);
          if (!title.trim()) setTitle(parsedTitle);
        }
        if (normalizedLang) {
          setCodeLanguage(normalizedLang);
        }
        if (parsedStatement) setCodeStatement(parsedStatement.trim());
        if (parsedStarterCode.length > 0) setStarterCode(parsedStarterCode.join('\n').trim());
        if (parsedSampleInput) setSampleInput(parsedSampleInput);
        if (parsedSampleOutput) setSampleOutput(parsedSampleOutput);
        if (parsedTestCases.length > 0) setTestCases(parsedTestCases);

        setBulkImportSuccessMsg('Imported Coding Challenge and Test Cases suite successfully!');
      }
    } catch (err: any) {
      console.error('Bulk parse error:', err);
      setBulkImportError('Failed to parse input: ' + (err?.message || 'Invalid format'));
    }
  };

  return (
    <Box
      sx={{
        bgcolor: '#F8FAFC',
        border: '1.5px dashed #3B82F6',
        borderRadius: '16px',
        p: 2.5,
        boxShadow: '0 4px 20px rgba(59,130,246,0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon sx={{ fontSize: 20, color: '#2563EB' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>
            Bulk Import & Format Assistant ({modality.toUpperCase()})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={handleCopyTemplate}
            startIcon={copiedTemplate ? <CheckRoundedIcon sx={{ color: '#16A34A' }} /> : <ContentCopyRoundedIcon />}
            sx={{
              fontSize: '0.76rem',
              fontWeight: 700,
              textTransform: 'none',
              color: copiedTemplate ? '#16A34A' : '#2563EB',
              bgcolor: '#EFF6FF',
              borderRadius: '8px',
              px: 1.2,
            }}
          >
            {copiedTemplate ? 'Copied Template!' : 'Copy Sample Template'}
          </Button>
        </Box>
      </Box>

      <Typography sx={{ fontSize: '0.8rem', color: '#64748B', lineHeight: 1.5 }}>
        Paste structured markdown, CSV, or JSON for{' '}
        <strong>
          {modality === 'reading'
            ? 'Technical Lecture Notes & Key Takeaways'
            : modality === 'quiz'
            ? 'Single-Choice MCQ'
            : modality === 'msq'
            ? 'Multi-Choice MSQ'
            : 'Coding Lab Challenge & Test Suite'}
        </strong>
        . Click Apply to auto-populate all fields instantly.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={5}
        placeholder={getBulkTemplate()}
        value={bulkImportText}
        onChange={(e) => setBulkImportText(e.target.value)}
        slotProps={{
          input: {
            sx: {
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.84rem',
              bgcolor: '#FFFFFF',
              borderRadius: '10px',
            },
          },
        }}
      />

      {bulkImportError && (
        <Alert severity="error" sx={{ fontSize: '0.82rem', py: 0.5, borderRadius: '8px' }}>
          {bulkImportError}
        </Alert>
      )}

      {bulkImportSuccessMsg && (
        <Alert severity="success" sx={{ fontSize: '0.82rem', py: 0.5, borderRadius: '8px' }}>
          {bulkImportSuccessMsg}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          size="small"
          onClick={() => setBulkImportText('')}
          sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: '#64748B' }}
        >
          Clear
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={handleApplyBulkImport}
          startIcon={<ContentPasteRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            bgcolor: '#2563EB',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.82rem',
            borderRadius: '8px',
            px: 2,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#1D4ED8' },
          }}
        >
          Parse & Apply to Submodule
        </Button>
      </Box>
    </Box>
  );
}
