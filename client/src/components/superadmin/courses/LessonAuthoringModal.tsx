'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Radio,
  Checkbox,
  Chip,
  MenuItem,
  Select,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

import TipTapEditor from '@/components/shared/TipTapEditor';
import { formatArticleMarkdown } from '@/utils/markdown';
import { robustParseJson } from '@/lib/curriculum-import-parser';

export type LessonModality = 'reading' | 'quiz' | 'msq' | 'code';

export interface LessonAuthoringPayload {
  title: string;
  type: LessonModality;
  durationMinutes: number;
  content: string;
  importantNotes?: string[];
  quizMCQ?: {
    question: string;
    options: string[];
    correctIndex?: number;
    correctIndices?: number[];
    isMSQ?: boolean;
    explanation?: string;
    hint?: string;
    points?: number;
  };
  codingProblem?: {
    title?: string;
    statement?: string;
    description?: string;
    language?: string;
    starterCode?: string;
    sampleInput?: string;
    sampleOutput?: string;
    testCases?: Array<{ input: string; expectedOutput: string; isHidden?: boolean }>;
  };
}

interface LessonAuthoringModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: LessonAuthoringPayload) => Promise<void> | void;
  initialData?: any;
  isEditing?: boolean;
  moduleTitle?: string;
}

export default function LessonAuthoringModal({
  open,
  onClose,
  onSave,
  initialData,
  isEditing = false,
  moduleTitle,
}: LessonAuthoringModalProps) {
  const [modality, setModality] = useState<LessonModality>('reading');
  const [title, setTitle] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modality 1: Reading / Theory Notes
  const [readingContent, setReadingContent] = useState('');
  const [editorMode, setEditorMode] = useState<'tiptap' | 'markdown'>('tiptap');
  const [previewMarkdown, setPreviewMarkdown] = useState(false);
  const [keyTakeaways, setKeyTakeaways] = useState<string[]>(['']);

  // Modality 2 & 3: MCQ / MSQ Quizzes
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '']);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0);
  const [msqCorrectIndices, setMsqCorrectIndices] = useState<number[]>([0]);
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizHint, setQuizHint] = useState('');
  const [quizPoints, setQuizPoints] = useState<number>(10);

  // Modality 4: Coding Lab / Sandbox Challenge
  const [codeTitle, setCodeTitle] = useState('');
  const [codeStatement, setCodeStatement] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [starterCode, setStarterCode] = useState(
    '# Write your solution below\ndef solve(data):\n    return data\n\n# Test execution\nprint(solve("Hello World"))'
  );
  const [sampleInput, setSampleInput] = useState('Input: [1, 2, 3]');
  const [sampleOutput, setSampleOutput] = useState('Output: [1, 2, 3]');
  const [testCases, setTestCases] = useState<Array<{ input: string; expectedOutput: string; isHidden: boolean }>>([
    { input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]', isHidden: false },
    { input: '[10, 20]', expectedOutput: '[10, 20]', isHidden: true },
  ]);

  // Bulk Import In-Modal Assistant State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportFormat, setBulkImportFormat] = useState<'text' | 'csv' | 'json'>('text');
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportSuccessMsg, setBulkImportSuccessMsg] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const borderColor = '#E2E8F0';

  useEffect(() => {
    if (open) {
      if (initialData) {
        setTitle(initialData.title || '');
        setDurationMinutes(initialData.durationMinutes || 15);

        const initialType = (initialData.type || 'reading').toLowerCase();
        if (initialType === 'quiz') {
          if (
            initialData.quizMCQ?.isMSQ ||
            (Array.isArray(initialData.quizMCQ?.correctIndices) && initialData.quizMCQ.correctIndices.length > 1)
          ) {
            setModality('msq');
          } else {
            setModality('quiz');
          }
        } else if (initialType === 'code' || initialType === 'lab') {
          setModality('code');
        } else {
          setModality('reading');
        }

        // Reading state
        setReadingContent(initialData.content || '');
        setKeyTakeaways(
          Array.isArray(initialData.importantNotes) && initialData.importantNotes.length > 0
            ? initialData.importantNotes
            : ['']
        );

        // Quiz state
        if (initialData.quizMCQ) {
          setQuizQuestion(initialData.quizMCQ.question || '');
          setQuizOptions(
            Array.isArray(initialData.quizMCQ.options) && initialData.quizMCQ.options.length >= 2
              ? initialData.quizMCQ.options
              : ['', '']
          );
          setMcqCorrectIndex(initialData.quizMCQ.correctIndex ?? 0);
          setMsqCorrectIndices(
            Array.isArray(initialData.quizMCQ.correctIndices)
              ? initialData.quizMCQ.correctIndices
              : [initialData.quizMCQ.correctIndex ?? 0]
          );
          setQuizExplanation(initialData.quizMCQ.explanation || '');
          setQuizHint(initialData.quizMCQ.hint || '');
          setQuizPoints(initialData.quizMCQ.points ?? (initialData.quizMCQ?.isMSQ ? 20 : 10));
        } else {
          setQuizQuestion('');
          setQuizOptions(['', '']);
          setMcqCorrectIndex(0);
          setMsqCorrectIndices([0]);
          setQuizExplanation('');
          setQuizHint('');
          setQuizPoints(10);
        }

        // Code state
        if (initialData.codingProblem) {
          setCodeTitle(initialData.codingProblem.title || initialData.title || '');
          setCodeStatement(initialData.codingProblem.description || initialData.codingProblem.statement || '');
          setCodeLanguage(initialData.codingProblem.language || 'python');
          setStarterCode(
            typeof initialData.codingProblem.starterCode === 'string'
              ? initialData.codingProblem.starterCode
              : typeof initialData.codingProblem.starterCode === 'object' && initialData.codingProblem.starterCode?.python
              ? initialData.codingProblem.starterCode.python
              : '# Write your solution below\ndef solve(data):\n    return data'
          );
          setSampleInput(initialData.codingProblem.sampleInput || '');
          setSampleOutput(initialData.codingProblem.sampleOutput || '');
          if (Array.isArray(initialData.codingProblem.testCases) && initialData.codingProblem.testCases.length > 0) {
            setTestCases(
              initialData.codingProblem.testCases.map((tc: any) => ({
                input: tc.input || '',
                expectedOutput: tc.expectedOutput || '',
                isHidden: !!tc.isHidden,
              }))
            );
          } else {
            setTestCases([
              { input: '42', expectedOutput: '42', isHidden: false },
              { input: '100', expectedOutput: '100', isHidden: true },
            ]);
          }
        } else {
          setCodeTitle('');
          setCodeStatement('Write a program to solve the algorithmic problem efficiently.');
          setCodeLanguage('python');
          setStarterCode('# Challenge: Solution\ndef solve(data):\n    # Write your logic here\n    return data\n\nprint(solve("Optimal"))');
          setSampleInput('Input: 42');
          setSampleOutput('Output: 42');
          setTestCases([
            { input: '42', expectedOutput: '42', isHidden: false },
            { input: '100', expectedOutput: '100', isHidden: true },
          ]);
        }
      } else {
        // Fresh submodule state
        setTitle('');
        setDurationMinutes(15);
        setModality('reading');
        setReadingContent(
          '<h2>Topic Overview</h2><p>Explain core theoretical concepts with rich text, formatted callouts, and code snippets.</p><pre><code># Example snippet\nprint("Hello, Antigravity!")</code></pre>'
        );
        setKeyTakeaways(['']);
        setQuizQuestion('');
        setQuizOptions(['', '']);
        setMcqCorrectIndex(0);
        setMsqCorrectIndices([0]);
        setQuizExplanation('');
        setQuizHint('');
        setQuizPoints(10);
        setCodeTitle('');
        setCodeStatement('Write a program to solve the algorithmic problem efficiently.');
        setCodeLanguage('python');
        setStarterCode('# Challenge: Solution\ndef solve(data):\n    # Write your logic here\n    return data\n\nprint(solve("Optimal"))');
        setSampleInput('Input: 42');
        setSampleOutput('Output: 42');
        setTestCases([
          { input: '42', expectedOutput: '42', isHidden: false },
          { input: '100', expectedOutput: '100', isHidden: true },
        ]);
      }
      setIsSubmitting(false);
      setPreviewMarkdown(false);
      setIsBulkImportOpen(false);
      setBulkImportText('');
      setBulkImportError(null);
      setBulkImportSuccessMsg(null);
    }
  }, [open, initialData]);

  // Quiz Option Handlers
  const handleAddQuizOption = () => {
    setQuizOptions([...quizOptions, '']);
  };

  const handleRemoveQuizOption = (index: number) => {
    if (quizOptions.length <= 2) return;
    const next = quizOptions.filter((_, i) => i !== index);
    setQuizOptions(next);
    if (mcqCorrectIndex >= next.length) {
      setMcqCorrectIndex(0);
    }
    setMsqCorrectIndices((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)));
  };

  const handleToggleMsqIndex = (index: number) => {
    setMsqCorrectIndices((prev) => {
      if (prev.includes(index)) {
        if (prev.length === 1) return prev; // Keep at least one selected
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index].sort((a, b) => a - b);
      }
    });
  };

  // Takeaway Handlers
  const handleAddTakeaway = () => {
    setKeyTakeaways([...keyTakeaways, '']);
  };

  const handleRemoveTakeaway = (index: number) => {
    setKeyTakeaways(keyTakeaways.filter((_, i) => i !== index));
  };

  // Test Case Handlers
  const handleAddTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '', isHidden: false }]);
  };

  const handleRemoveTestCase = (index: number) => {
    if (testCases.length <= 1) return;
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  // =========================================================================
  // BULK IMPORT PARSER LOGIC FOR ALL 4 MODALITIES
  // =========================================================================
  const getBulkTemplate = () => {
    if (modality === 'reading') {
      if (bulkImportFormat === 'json') {
        return JSON.stringify(
          {
            title: 'Memory References & Pointer Mechanics',
            durationMinutes: 20,
            content: '<h2>Memory Layout</h2><p>Variables reference heap memory objects in Python.</p>',
            takeaways: [
              'Immutable objects create new allocations on modification.',
              'is compares memory identity while == compares value equality.',
            ],
          },
          null,
          2
        );
      }
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
      if (bulkImportFormat === 'json') {
        return JSON.stringify(
          {
            title: 'Hash Collision Complexity Quiz',
            question: 'What is the average time complexity of searching a key in an optimal hash table?',
            options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
            correctIndex: 0,
            explanation: 'Hash tables calculate array bucket indices in direct O(1) time using deterministic hash functions.',
            hint: 'Think about direct address indexing.',
            points: 10,
          },
          null,
          2
        );
      }
      if (bulkImportFormat === 'csv') {
        return `Question,Option A,Option B,Option C,Option D,Correct,Explanation,Hint,Points\nWhat is the average lookup complexity in a Hash Table?,O(1),O(log N),O(N),O(N log N),A,Hash tables calculate array bucket indices in O(1) time.,Think about direct address indexing.,10`;
      }
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
      if (bulkImportFormat === 'json') {
        return JSON.stringify(
          {
            title: 'Python Immutable Types MSQ',
            question: 'Which of the following built-in data types in Python are immutable?',
            options: ['int', 'list', 'tuple', 'str'],
            correctIndices: [0, 2, 3],
            explanation: 'int, tuple, and str are immutable; lists and dictionaries are mutable.',
            hint: 'Try mutating an element in place.',
            points: 20,
          },
          null,
          2
        );
      }
      if (bulkImportFormat === 'csv') {
        return `Question,Option A,Option B,Option C,Option D,Correct,Explanation,Hint,Points\nWhich types in Python are immutable?,int,list,tuple,str,"A, C, D",int tuple and str cannot be mutated in place.,Think about tuple assignment.,20`;
      }
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

    // Coding Lab Template
    if (bulkImportFormat === 'json') {
      return JSON.stringify(
        {
          title: 'Two Sum Problem',
          language: 'python',
          durationMinutes: 25,
          statement: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          starterCode: 'def two_sum(nums, target):\n    # Write optimal hash map solution\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
          sampleInput: 'nums = [2,7,11,15], target = 9',
          sampleOutput: '[0, 1]',
          testCases: [
            { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isHidden: false },
            { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', isHidden: false },
            { input: '[3, 3], 6', expectedOutput: '[0, 1]', isHidden: true },
          ],
        },
        null,
        2
      );
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
      // 1. JSON Format Parser
      if (raw.startsWith('{') || raw.startsWith('[')) {
        const data = robustParseJson(raw);
        if (data.title && typeof data.title === 'string') {
          setTitle(data.title.trim());
        }
        if (data.durationMinutes && Number(data.durationMinutes)) {
          setDurationMinutes(Number(data.durationMinutes));
        }

        if (modality === 'reading') {
          if (data.content) setReadingContent(data.content);
          if (Array.isArray(data.takeaways) && data.takeaways.length > 0) {
            setKeyTakeaways(data.takeaways.map((t: any) => String(t).trim()));
          }
          setBulkImportSuccessMsg('Successfully parsed and imported Reading Notes & Takeaways!');
        } else if (modality === 'quiz' || modality === 'msq') {
          if (data.question) setQuizQuestion(data.question);
          if (Array.isArray(data.options) && data.options.length >= 2) {
            setQuizOptions(data.options.map((o: any) => String(o).trim()));
          }
          if (data.correctIndex !== undefined) setMcqCorrectIndex(Number(data.correctIndex));
          if (Array.isArray(data.correctIndices)) setMsqCorrectIndices(data.correctIndices.map(Number));
          if (data.explanation) setQuizExplanation(data.explanation);
          if (data.hint) setQuizHint(data.hint);
          if (data.points) setQuizPoints(Number(data.points));
          setBulkImportSuccessMsg(`Successfully parsed and imported ${modality === 'quiz' ? 'Single MCQ' : 'Multi MSQ'} question!`);
        } else if (modality === 'code') {
          if (data.title) setCodeTitle(data.title);
          if (data.statement || data.description) setCodeStatement(data.statement || data.description);
          if (data.language) setCodeLanguage(data.language);
          if (data.starterCode) setStarterCode(data.starterCode);
          if (data.sampleInput) setSampleInput(data.sampleInput);
          if (data.sampleOutput) setSampleOutput(data.sampleOutput);
          if (Array.isArray(data.testCases) && data.testCases.length > 0) {
            setTestCases(
              data.testCases.map((tc: any) => ({
                input: tc.input || '',
                expectedOutput: tc.expectedOutput || '',
                isHidden: !!tc.isHidden,
              }))
            );
          }
          setBulkImportSuccessMsg('Successfully parsed and imported Coding Sandbox Challenge!');
        }
        return;
      }

      // 2. Modality-specific Text / CSV Parser
      if (modality === 'reading') {
        const lines = raw.split('\n');
        let parsedTitle = '';
        let takeawaysList: string[] = [];
        let bodyLines: string[] = [];
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
        // CSV or Key-Value Formats
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

        // Standard Text Parser
        const lines = raw.split('\n');
        let parsedQuestion = '';
        const parsedOpts: string[] = [];
        let parsedCorrectStr = '';
        let parsedExplanation = '';
        let parsedHint = '';
        let parsedPoints = 10;

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
        if (parsedPoints) setQuizPoints(parsedPoints);

        setBulkImportSuccessMsg(`Imported ${modality === 'quiz' ? 'MCQ' : 'MSQ'} question successfully!`);
      } else if (modality === 'code') {
        const lines = raw.split('\n');
        let parsedTitle = '';
        let parsedLang = 'python';
        let parsedStatement = '';
        let parsedStarterCode: string[] = [];
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

        if (parsedTitle) {
          setCodeTitle(parsedTitle);
          if (!title.trim()) setTitle(parsedTitle);
        }
        if (parsedLang) setCodeLanguage(parsedLang);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const cleanedTakeaways = keyTakeaways.map((t) => t.trim()).filter(Boolean);

    const payload: LessonAuthoringPayload = {
      title: title.trim(),
      type: modality === 'msq' ? 'quiz' : modality,
      durationMinutes: Number(durationMinutes) || 15,
      content: modality === 'reading' ? readingContent : modality === 'code' ? codeStatement : quizQuestion,
      importantNotes: cleanedTakeaways.length > 0 ? cleanedTakeaways : undefined,
    };

    if (modality === 'quiz') {
      const filteredOptionEntries = quizOptions
        .map((opt, origIdx) => ({ text: opt.trim(), origIdx }))
        .filter((entry) => entry.text.length > 0);

      const finalOptions = filteredOptionEntries.map((e) => e.text);
      const newMcqIndex = filteredOptionEntries.findIndex((e) => e.origIdx === mcqCorrectIndex);
      const safeMcqIndex = newMcqIndex >= 0 ? newMcqIndex : 0;

      payload.quizMCQ = {
        question: quizQuestion.trim() || title.trim(),
        options: finalOptions,
        correctIndex: safeMcqIndex,
        isMSQ: false,
        explanation: quizExplanation.trim() || undefined,
        hint: quizHint.trim() || undefined,
        points: Number(quizPoints) || 10,
      };
    } else if (modality === 'msq') {
      const filteredOptionEntries = quizOptions
        .map((opt, origIdx) => ({ text: opt.trim(), origIdx }))
        .filter((entry) => entry.text.length > 0);

      const finalOptions = filteredOptionEntries.map((e) => e.text);
      const newMsqIndices = msqCorrectIndices
        .map((origIdx) => filteredOptionEntries.findIndex((e) => e.origIdx === origIdx))
        .filter((idx) => idx >= 0);
      const safeMsqIndices = newMsqIndices.length > 0 ? newMsqIndices : [0];

      payload.quizMCQ = {
        question: quizQuestion.trim() || title.trim(),
        options: finalOptions,
        correctIndices: safeMsqIndices,
        correctIndex: safeMsqIndices[0] ?? 0,
        isMSQ: true,
        explanation: quizExplanation.trim() || undefined,
        hint: quizHint.trim() || undefined,
        points: Number(quizPoints) || 20,
      };
    } else if (modality === 'code') {
      payload.codingProblem = {
        title: codeTitle.trim() || title.trim(),
        statement: codeStatement.trim(),
        description: codeStatement.trim(),
        language: codeLanguage,
        starterCode: starterCode.trim(),
        sampleInput: sampleInput.trim(),
        sampleOutput: sampleOutput.trim(),
        testCases: testCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim()),
      };
    }

    try {
      setIsSubmitting(true);
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save submodule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: { xs: 2.5, md: 3 },
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.16)',
            border: `1px solid ${borderColor}`,
            bgcolor: '#FFFFFF',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              bgcolor:
                modality === 'reading'
                  ? '#EFF6FF'
                  : modality === 'quiz' || modality === 'msq'
                  ? '#FEF3C7'
                  : '#ECFDF5',
              color:
                modality === 'reading'
                  ? '#2563EB'
                  : modality === 'quiz' || modality === 'msq'
                  ? '#D97706'
                  : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid currentColor',
              borderColor: 'inherit',
            }}
          >
            {modality === 'reading' && <MenuBookRoundedIcon sx={{ fontSize: 22 }} />}
            {modality === 'quiz' && <QuizRoundedIcon sx={{ fontSize: 22 }} />}
            {modality === 'msq' && <CheckBoxRoundedIcon sx={{ fontSize: 22 }} />}
            {modality === 'code' && <CodeRoundedIcon sx={{ fontSize: 22 }} />}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
              {isEditing ? 'Edit Submodule / Lesson' : 'Author New Submodule / Lesson'}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 500 }}>
              {moduleTitle ? `Inside ${moduleTitle}` : 'Configure rich notes, single/multi choice quizzes, or coding sandbox.'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            onClick={() => setIsBulkImportOpen(!isBulkImportOpen)}
            startIcon={<FlashOnRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: isBulkImportOpen ? '#2563EB' : '#F1F5F9',
              color: isBulkImportOpen ? '#FFFFFF' : '#334155',
              fontWeight: 700,
              fontSize: '0.78rem',
              textTransform: 'none',
              borderRadius: '8px',
              px: 1.5,
              py: 0.6,
              '&:hover': {
                bgcolor: isBulkImportOpen ? '#1D4ED8' : '#E2E8F0',
              },
            }}
          >
            {isBulkImportOpen ? 'Close Importer' : '⚡ Bulk Import'}
          </Button>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#94A3B8',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            <CloseRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Main Form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
        <DialogContent
          sx={{
            px: 0,
            py: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {/* BULK IMPORT EXPANDABLE ASSISTANT PANEL */}
          {isBulkImportOpen && (
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
          )}

          {/* Top Meta: Submodule Title & Duration */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2.5fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Submodule Title <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Memory References & Pointer Mechanics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: borderColor },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                    },
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Estimated Duration
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, Number(e.target.value)))}
                slotProps={{
                  input: {
                    endAdornment: <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', ml: 0.5 }}>mins</Typography>,
                    startAdornment: <AccessTimeRoundedIcon sx={{ fontSize: 17, color: '#94A3B8', mr: 0.75 }} />,
                    sx: {
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      bgcolor: '#F8FAFC',
                      '& fieldset': { borderColor: borderColor },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* Modality Segment Tabs */}
          <Box sx={{ bgcolor: '#F1F5F9', p: 0.5, borderRadius: '14px' }}>
            <Tabs
              value={modality}
              onChange={(_, val) => setModality(val)}
              variant="fullWidth"
              sx={{
                minHeight: 42,
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': {
                  minHeight: 40,
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  textTransform: 'none',
                  color: '#64748B',
                  transition: 'all 0.15s ease',
                  '&.Mui-selected': {
                    bgcolor: '#FFFFFF',
                    color: '#0F172A',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  },
                },
              }}
            >
              <Tab
                value="reading"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <MenuBookRoundedIcon sx={{ fontSize: 17, color: modality === 'reading' ? '#2563EB' : '#94A3B8' }} />
                    <span>Notes / Theory</span>
                  </Box>
                }
              />
              <Tab
                value="quiz"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <QuizRoundedIcon sx={{ fontSize: 17, color: modality === 'quiz' ? '#D97706' : '#94A3B8' }} />
                    <span>Single MCQ</span>
                  </Box>
                }
              />
              <Tab
                value="msq"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CheckBoxRoundedIcon sx={{ fontSize: 17, color: modality === 'msq' ? '#D97706' : '#94A3B8' }} />
                    <span>Multi MSQ</span>
                  </Box>
                }
              />
              <Tab
                value="code"
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CodeRoundedIcon sx={{ fontSize: 17, color: modality === 'code' ? '#059669' : '#94A3B8' }} />
                    <span>Coding Lab</span>
                  </Box>
                }
              />
            </Tabs>
          </Box>

          {/* TAB 1: Theory / Reading Notes (TipTap Rich Editor + Special Callouts) */}
          {modality === 'reading' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Technical Lesson Notes & Special Callouts
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button
                    size="small"
                    onClick={() => setEditorMode(editorMode === 'tiptap' ? 'markdown' : 'tiptap')}
                    startIcon={<EditNoteRoundedIcon />}
                    sx={{
                      fontSize: '0.78rem',
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#475569',
                      bgcolor: '#F1F5F9',
                      borderRadius: '8px',
                      px: 1.2,
                      '&:hover': { bgcolor: '#E2E8F0' },
                    }}
                  >
                    {editorMode === 'tiptap' ? 'Switch to Raw Markdown' : 'Switch to TipTap Visual Editor'}
                  </Button>

                  <Button
                    size="small"
                    onClick={() => setPreviewMarkdown(!previewMarkdown)}
                    startIcon={previewMarkdown ? <EditNoteRoundedIcon /> : <VisibilityRoundedIcon />}
                    sx={{
                      fontSize: '0.78rem',
                      textTransform: 'none',
                      fontWeight: 700,
                      color: '#2563EB',
                      bgcolor: '#EFF6FF',
                      borderRadius: '8px',
                      px: 1.2,
                    }}
                  >
                    {previewMarkdown ? 'Edit Content' : 'Live Preview'}
                  </Button>
                </Box>
              </Box>

              {previewMarkdown ? (
                <Box
                  sx={{
                    minHeight: 280,
                    maxHeight: 460,
                    overflowY: 'auto',
                    p: 2.5,
                    borderRadius: '12px',
                    bgcolor: '#FFFFFF',
                    border: `1px solid ${borderColor}`,
                    color: '#0F172A',
                    fontSize: '0.94rem',
                    lineHeight: 1.7,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatArticleMarkdown(readingContent) || '<em>(No content written yet)</em>',
                  }}
                />
              ) : editorMode === 'tiptap' ? (
                <TipTapEditor
                  content={readingContent}
                  onChange={(html) => setReadingContent(html)}
                  minHeight={260}
                  maxHeight={440}
                  placeholder="Start typing your technical lesson notes... Use 'Insert Special Note' for callouts with custom backgrounds."
                />
              ) : (
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  placeholder="## Technical Guide Title&#10;&#10;Write comprehensive lecture notes with markdown headings, lists, and code blocks...&#10;&#10;> [!NOTE]&#10;> Custom note background&#10;&#10;```python&#10;# Example&#10;def solution(): pass&#10;```"
                  value={readingContent}
                  onChange={(e) => setReadingContent(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        fontFamily: 'monospace',
                        bgcolor: '#F8FAFC',
                        '& fieldset': { borderColor: borderColor },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                      },
                    },
                  }}
                />
              )}

              {/* Key Takeaways Section */}
              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    Key Takeaways & High-Yield Bullet Highlights
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleAddTakeaway}
                    startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#2563EB' }}
                  >
                    Add Takeaway
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {keyTakeaways.map((note, nIdx) => (
                    <Box key={nIdx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`Takeaway bullet ${nIdx + 1}...`}
                        value={note}
                        onChange={(e) => {
                          const next = [...keyTakeaways];
                          next[nIdx] = e.target.value;
                          setKeyTakeaways(next);
                        }}
                        slotProps={{
                          input: {
                            sx: {
                              borderRadius: '8px',
                              fontSize: '0.84rem',
                              bgcolor: '#FFFFFF',
                            },
                          },
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveTakeaway(nIdx)}
                        disabled={keyTakeaways.length <= 1}
                        sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          )}

          {/* TAB 2 & 3: MCQ / MSQ Quiz Builder */}
          {(modality === 'quiz' || modality === 'msq') && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Question Statement */}
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Quiz Question Statement <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="e.g. Which of the following data structures provides O(1) average lookup time?"
                  value={quizQuestion}
                  onChange={(e) => setQuizQuestion(e.target.value)}
                  slotProps={{
                    input: {
                      sx: {
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        bgcolor: '#F8FAFC',
                        '& fieldset': { borderColor: borderColor },
                        '&:hover fieldset': { borderColor: '#CBD5E1' },
                        '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                      },
                    },
                  }}
                />
              </Box>

              {/* Options Builder */}
              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                    Answer Options ({modality === 'quiz' ? 'Select single correct radio' : 'Select all correct checkboxes'})
                  </Typography>
                  <Button
                    size="small"
                    onClick={handleAddQuizOption}
                    startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', color: '#2563EB' }}
                  >
                    Add Option
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {quizOptions.map((opt, oIdx) => {
                    const isCorrect =
                      modality === 'quiz' ? mcqCorrectIndex === oIdx : msqCorrectIndices.includes(oIdx);

                    return (
                      <Box
                        key={oIdx}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: isCorrect ? '#F0FDF4' : '#FFFFFF',
                          border: isCorrect ? '1px solid #86EFAC' : `1px solid ${borderColor}`,
                          borderRadius: '10px',
                          p: 0.75,
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {modality === 'quiz' ? (
                          <Radio
                            checked={mcqCorrectIndex === oIdx}
                            onChange={() => setMcqCorrectIndex(oIdx)}
                            sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#16A34A' } }}
                          />
                        ) : (
                          <Checkbox
                            checked={msqCorrectIndices.includes(oIdx)}
                            onChange={() => handleToggleMsqIndex(oIdx)}
                            sx={{ color: '#94A3B8', '&.Mui-checked': { color: '#16A34A' } }}
                          />
                        )}

                        <TextField
                          fullWidth
                          size="small"
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}...`}
                          value={opt}
                          onChange={(e) => {
                            const next = [...quizOptions];
                            next[oIdx] = e.target.value;
                            setQuizOptions(next);
                          }}
                          slotProps={{
                            input: {
                              sx: {
                                borderRadius: '8px',
                                fontSize: '0.86rem',
                                bgcolor: 'transparent',
                              },
                            },
                          }}
                        />

                        <IconButton
                          size="small"
                          onClick={() => handleRemoveQuizOption(oIdx)}
                          disabled={quizOptions.length <= 2}
                          sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Solution Explanation & Hints */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Detailed Solution Explanation
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Provide a step-by-step reason why the selected choice is correct..."
                    value={quizExplanation}
                    onChange={(e) => setQuizExplanation(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                          bgcolor: '#F8FAFC',
                        },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                    Student Hint (Optional)
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Think about hash collision mechanics and bucket indices..."
                    value={quizHint}
                    onChange={(e) => setQuizHint(e.target.value)}
                    slotProps={{
                      input: {
                        sx: {
                          borderRadius: '10px',
                          fontSize: '0.85rem',
                          bgcolor: '#F8FAFC',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}

          {/* TAB 4: Coding Lab / Sandbox Challenge */}
          {modality === 'code' && (
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
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions
          sx={{
            px: 0,
            pt: 2,
            borderTop: `1px solid ${borderColor}`,
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#64748B',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              px: 2.2,
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!title.trim() || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : null}
            sx={{
              borderRadius: '10px',
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 3,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1D4ED8', boxShadow: '0 4px 14px rgba(37,99,235,0.25)' },
            }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Submodule'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
