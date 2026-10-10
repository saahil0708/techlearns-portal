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
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import {
  LessonModality,
  LessonAuthoringPayload,
  LessonAuthoringModalProps,
  TestCaseItem,
} from './authoring/types';
import { AuthoringModalHeader } from './authoring/AuthoringModalHeader';
import { BulkImportAssistant } from './authoring/BulkImportAssistant';
import { ReadingTheoryTab } from './authoring/ReadingTheoryTab';
import { QuizBuilderTab } from './authoring/QuizBuilderTab';
import { CodingLabTab } from './authoring/CodingLabTab';

// Re-export types for backward compatibility
export type { LessonModality, LessonAuthoringPayload, LessonAuthoringModalProps };

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
  const [testCases, setTestCases] = useState<TestCaseItem[]>([
    { input: '[1, 2, 3]', expectedOutput: '[1, 2, 3]', isHidden: false },
    { input: '[10, 20]', expectedOutput: '[10, 20]', isHidden: true },
  ]);

  // Bulk Import Assistant State
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkImportError, setBulkImportError] = useState<string | null>(null);
  const [bulkImportSuccessMsg, setBulkImportSuccessMsg] = useState<string | null>(null);

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
      {/* 1. Modal Header */}
      <AuthoringModalHeader
        modality={modality}
        isEditing={isEditing}
        moduleTitle={moduleTitle}
        isBulkImportOpen={isBulkImportOpen}
        onToggleBulkImport={() => setIsBulkImportOpen(!isBulkImportOpen)}
        onClose={onClose}
      />

      {/* 2. Main Form */}
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
          {/* 3. Bulk Import Assistant (Expandable) */}
          {isBulkImportOpen && (
            <BulkImportAssistant
              modality={modality}
              bulkImportText={bulkImportText}
              setBulkImportText={setBulkImportText}
              bulkImportError={bulkImportError}
              setBulkImportError={setBulkImportError}
              bulkImportSuccessMsg={bulkImportSuccessMsg}
              setBulkImportSuccessMsg={setBulkImportSuccessMsg}
              setTitle={setTitle}
              title={title}
              setDurationMinutes={setDurationMinutes}
              setReadingContent={setReadingContent}
              setKeyTakeaways={setKeyTakeaways}
              setQuizQuestion={setQuizQuestion}
              setQuizOptions={setQuizOptions}
              quizOptions={quizOptions}
              setMcqCorrectIndex={setMcqCorrectIndex}
              setMsqCorrectIndices={setMsqCorrectIndices}
              setQuizExplanation={setQuizExplanation}
              setQuizHint={setQuizHint}
              setQuizPoints={setQuizPoints}
              setCodeTitle={setCodeTitle}
              setCodeStatement={setCodeStatement}
              setCodeLanguage={setCodeLanguage}
              setStarterCode={setStarterCode}
              setSampleInput={setSampleInput}
              setSampleOutput={setSampleOutput}
              setTestCases={setTestCases}
            />
          )}

          {/* 4. Top Meta: Title & Duration */}
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
                      '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
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
                      '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                    },
                  },
                }}
              />
            </Box>
          </Box>

          {/* 5. Modality Segment Tabs */}
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
                    <MenuBookRoundedIcon sx={{ fontSize: 17, color: modality === 'reading' ? '#0B1F3A' : '#94A3B8' }} />
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

          {/* 6. Modality Active Tab Content */}
          {modality === 'reading' && (
            <ReadingTheoryTab
              readingContent={readingContent}
              setReadingContent={setReadingContent}
              editorMode={editorMode}
              setEditorMode={setEditorMode}
              previewMarkdown={previewMarkdown}
              setPreviewMarkdown={setPreviewMarkdown}
              keyTakeaways={keyTakeaways}
              setKeyTakeaways={setKeyTakeaways}
              borderColor={borderColor}
            />
          )}

          {(modality === 'quiz' || modality === 'msq') && (
            <QuizBuilderTab
              modality={modality}
              quizQuestion={quizQuestion}
              setQuizQuestion={setQuizQuestion}
              quizOptions={quizOptions}
              setQuizOptions={setQuizOptions}
              mcqCorrectIndex={mcqCorrectIndex}
              setMcqCorrectIndex={setMcqCorrectIndex}
              msqCorrectIndices={msqCorrectIndices}
              setMsqCorrectIndices={setMsqCorrectIndices}
              quizExplanation={quizExplanation}
              setQuizExplanation={setQuizExplanation}
              quizHint={quizHint}
              setQuizHint={setQuizHint}
              quizPoints={quizPoints}
              setQuizPoints={setQuizPoints}
              borderColor={borderColor}
            />
          )}

          {modality === 'code' && (
            <CodingLabTab
              codeTitle={codeTitle}
              setCodeTitle={setCodeTitle}
              codeLanguage={codeLanguage}
              setCodeLanguage={setCodeLanguage}
              codeStatement={codeStatement}
              setCodeStatement={setCodeStatement}
              starterCode={starterCode}
              setStarterCode={setStarterCode}
              sampleInput={sampleInput}
              setSampleInput={setSampleInput}
              sampleOutput={sampleOutput}
              setSampleOutput={setSampleOutput}
              testCases={testCases}
              setTestCases={setTestCases}
              borderColor={borderColor}
            />
          )}
        </DialogContent>

        {/* 7. Footer Actions */}
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
              bgcolor: '#0B1F3A',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 3,
              py: 0.8,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#17366E', boxShadow: '0 4px 14px rgba(91, 45, 144, 0.25)' },
            }}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Submodule'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
