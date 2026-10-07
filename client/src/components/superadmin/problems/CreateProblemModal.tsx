'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Chip,
  Tooltip,
  Paper,
  Divider,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { NewProblemData, ProblemCategory, ProblemDifficulty, ProblemStatus, ProblemTestCaseItem, ProblemEntity } from '@/types/problem';
import TiptapProblemEditor from '@/components/editor/TiptapProblemEditor';

interface CreateProblemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewProblemData) => Promise<void> | void;
  initialData?: Partial<NewProblemData> | ProblemEntity | null;
  isEdit?: boolean;
}

const CATEGORIES: ProblemCategory[] = [
  'Dynamic Programming',
  'Graph Theory & BFS/DFS',
  'Trees & Binary Search Trees',
  'Arrays & Two Pointers',
  'Strings & Tries',
  'Math & Number Theory',
  'Greedy & Heuristics',
];

const DIFFICULTIES: ProblemDifficulty[] = ['Easy', 'Medium', 'Hard'];

interface LocalTestCase {
  id: string;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden: boolean;
}

export default function CreateProblemModal({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
}: CreateProblemModalProps) {
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiBar, setShowAiBar] = useState(true);

  const [formData, setFormData] = useState<NewProblemData>({
    title: '',
    slug: '',
    code: '',
    category: 'Dynamic Programming',
    difficulty: 'Medium',
    status: 'Published',
    points: 200,
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    testCasesCount: 20,
    tags: ['Dynamic Programming', 'Algorithms'],
    statementMarkdown: '',
    sampleInput: '',
    sampleOutput: '',
    sampleExplanation: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
  });

  const [testCaseTab, setTestCaseTab] = useState<'sample' | 'hidden'>('sample');
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string }>>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; institutionId?: string }>>([]);

  const [publicTestCases, setPublicTestCases] = useState<LocalTestCase[]>([
    {
      id: 'tc-pub-1',
      input: '',
      expectedOutput: '',
      explanation: '',
      isHidden: false,
    },
  ]);

  const [hiddenTestCases, setHiddenTestCases] = useState<LocalTestCase[]>([
    {
      id: 'tc-hidden-1',
      input: '',
      expectedOutput: '',
      explanation: '',
      isHidden: true,
    },
  ]);

  const [tagInput, setTagInput] = useState('Dynamic Programming, Algorithms');

  useEffect(() => {
    if (open) {
      if (initialData) {
        const sampleTc = (initialData as any).sampleTestCases?.[0];
        setFormData({
          title: initialData.title || '',
          slug: initialData.slug || '',
          code: initialData.code || '',
          category: (initialData.category as ProblemCategory) || 'Dynamic Programming',
          difficulty: (initialData.difficulty as ProblemDifficulty) || 'Medium',
          status: (initialData.status as ProblemStatus) || 'Published',
          points: initialData.points || (initialData.difficulty === 'Easy' ? 100 : initialData.difficulty === 'Hard' ? 350 : 200),
          timeLimitMs: initialData.timeLimitMs || 1000,
          memoryLimitMb: initialData.memoryLimitMb || 256,
          testCasesCount: initialData.testCasesCount || 20,
          tags: Array.isArray(initialData.tags) && initialData.tags.length > 0 ? initialData.tags : ['Algorithms'],
          statementMarkdown: initialData.statementMarkdown || (initialData as any).statement || '',
          sampleInput: sampleTc?.input || (initialData as any).sampleInput || '',
          sampleOutput: sampleTc?.output || (initialData as any).sampleOutput || '',
          sampleExplanation: sampleTc?.explanation || (initialData as any).sampleExplanation || '',
          inputFormat: (initialData as any).inputFormat || '',
          outputFormat: (initialData as any).outputFormat || '',
          constraints: (initialData as any).constraints || '',
          institutionId: (initialData as any).institutionId || undefined,
          courseId: (initialData as any).courseId || undefined,
        });
        setTagInput((initialData.tags || ['Algorithms']).join(', '));

        const initialPublics = (initialData as any).sampleTestCases?.map((stc: any, i: number) => ({
          id: `tc-pub-${i + 1}`,
          input: stc.input || '',
          expectedOutput: stc.output || stc.expectedOutput || '',
          explanation: stc.explanation || '',
          isHidden: false,
        })) || ((initialData as any).testCases?.filter((tc: any) => !tc.isHidden).map((tc: any, i: number) => ({
          id: tc.id || `tc-pub-${i + 1}`,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || tc.output || '',
          explanation: tc.explanation || '',
          isHidden: false,
        })));

        if (initialPublics && initialPublics.length > 0) {
          setPublicTestCases(initialPublics);
        } else if (sampleTc?.input || (initialData as any).sampleInput) {
          setPublicTestCases([
            {
              id: 'tc-pub-1',
              input: sampleTc?.input || (initialData as any).sampleInput || '',
              expectedOutput: sampleTc?.output || (initialData as any).sampleOutput || '',
              explanation: sampleTc?.explanation || (initialData as any).sampleExplanation || '',
              isHidden: false,
            },
          ]);
        }

        const initialHiddens = (initialData as any).testCases?.filter((tc: any) => tc.isHidden).map((tc: any, i: number) => ({
          id: tc.id || `tc-hidden-${i + 1}`,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || tc.output || '',
          explanation: tc.explanation || '',
          isHidden: true,
        }));
        if (initialHiddens && initialHiddens.length > 0) {
          setHiddenTestCases(initialHiddens);
        }
      } else {
        resetForm();
      }

      Promise.all([
        apiService.getInstitutions({ limit: 100 }).catch(() => null),
        apiService.getCourses({ limit: 100 }).catch(() => null),
      ]).then(([instRes, courseRes]) => {
        if (instRes) {
          const instList = Array.isArray(instRes) ? instRes : instRes.items || [];
          setInstitutions(instList);
        }
        if (courseRes) {
          const courseList = Array.isArray(courseRes) ? courseRes : courseRes.items || [];
          setCourses(courseList);
        }
      });
    }
  }, [open, initialData]);

  const filteredCourses = useMemo(() => {
    if (!formData.institutionId) {
      return courses.filter((c) => !c.institutionId);
    }
    return courses.filter((c) => !c.institutionId || c.institutionId === formData.institutionId);
  }, [courses, formData.institutionId]);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      code: '',
      category: 'Dynamic Programming',
      difficulty: 'Medium',
      status: 'Published',
      points: 100,
      timeLimitMs: 1000,
      memoryLimitMb: 256,
      testCasesCount: 20,
      tags: ['Dynamic Programming', 'Algorithms'],
      statementMarkdown: '',
      sampleInput: '',
      sampleOutput: '',
      sampleExplanation: '',
      inputFormat: '',
      outputFormat: '',
      constraints: '',
    });
    setTagInput('Dynamic Programming, Algorithms');
    setAiPrompt('');
    setTestCaseTab('sample');
    setPublicTestCases([
      {
        id: 'tc-pub-1',
        input: '',
        expectedOutput: '',
        explanation: '',
        isHidden: false,
      },
    ]);
    setHiddenTestCases([
      {
        id: 'tc-hidden-1',
        input: '',
        expectedOutput: '',
        explanation: '',
        isHidden: true,
      },
    ]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleChange = (field: keyof NewProblemData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Public Test Case Management
  const addPublicTestCase = () => {
    setPublicTestCases((prev) => [
      ...prev,
      {
        id: `tc-pub-${Date.now()}-${prev.length + 1}`,
        input: '',
        expectedOutput: '',
        explanation: `Example #${prev.length + 1}`,
        isHidden: false,
      },
    ]);
  };

  const updatePublicTestCase = (id: string, field: keyof LocalTestCase, val: string) => {
    setPublicTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: val } : tc)));
  };

  const removePublicTestCase = (id: string) => {
    setPublicTestCases((prev) => {
      if (prev.length <= 1) {
        return [{ id: 'tc-pub-1', input: '', expectedOutput: '', explanation: '', isHidden: false }];
      }
      return prev.filter((tc) => tc.id !== id);
    });
  };

  // Generate auto-slug from title
  const handleTitleChange = (val: string) => {
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === prev.code ? slug : prev.slug,
      code: prev.code === '' || prev.code === prev.slug ? slug : prev.code,
    }));
  };

  // AI Problem Generation
  const handleAIGenerateFullProblem = async () => {
    if (!aiPrompt.trim() && !formData.title.trim()) {
      toast.error('Please enter an AI prompt or problem title.', 'AI Generation Error');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await apiService.generateProblemAI({
        prompt: aiPrompt || formData.title,
        title: formData.title,
        category: formData.category,
        difficulty: formData.difficulty,
        taskType: 'full_problem',
      });

      const generated = res?.data || res;
      if (!generated) {
        throw new Error('No problem data returned from AI service');
      }

      setFormData((prev) => ({
        ...prev,
        title: generated.title || prev.title,
        slug: generated.slug || prev.slug || (generated.title ? generated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug),
        code: generated.code || prev.code || (generated.title ? generated.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.code),
        category: (generated.category as ProblemCategory) || prev.category,
        difficulty: (generated.difficulty as ProblemDifficulty) || prev.difficulty,
        statementMarkdown: generated.statementHtml || generated.statementMarkdown || prev.statementMarkdown,
        inputFormat: generated.inputFormat || prev.inputFormat,
        outputFormat: generated.outputFormat || prev.outputFormat,
        constraints: generated.constraints || prev.constraints,
        sampleInput: generated.sampleInput || prev.sampleInput,
        sampleOutput: generated.sampleOutput || prev.sampleOutput,
        sampleExplanation: generated.sampleExplanation || prev.sampleExplanation,
        tags: Array.isArray(generated.tags) && generated.tags.length > 0 ? generated.tags : prev.tags,
      }));

      if (Array.isArray(generated.tags) && generated.tags.length > 0) {
        setTagInput(generated.tags.join(', '));
      }

      // Populate Public Sample Test Cases (3 distinct examples)
      if (Array.isArray(generated.publicTestCases) && generated.publicTestCases.length > 0) {
        const newPublics: LocalTestCase[] = generated.publicTestCases.map((tc: any, idx: number) => ({
          id: `tc-pub-ai-${Date.now()}-${idx}`,
          input: String(tc.input || ''),
          expectedOutput: String(tc.expectedOutput || tc.output || ''),
          explanation: tc.explanation ? String(tc.explanation) : `Example #${idx + 1}`,
          isHidden: false,
        }));
        setPublicTestCases(newPublics);
      } else if (generated.sampleInput && generated.sampleOutput) {
        setPublicTestCases([
          {
            id: `tc-pub-ai-${Date.now()}-0`,
            input: String(generated.sampleInput),
            expectedOutput: String(generated.sampleOutput),
            explanation: generated.sampleExplanation ? String(generated.sampleExplanation) : 'Example 1',
            isHidden: false,
          },
        ]);
      }

      // Populate Hidden Test Cases
      if (Array.isArray(generated.hiddenTestCases) && generated.hiddenTestCases.length > 0) {
        const newCases: LocalTestCase[] = generated.hiddenTestCases.map((tc: any, idx: number) => ({
          id: `tc-ai-${Date.now()}-${idx}`,
          input: String(tc.input || ''),
          expectedOutput: String(tc.expectedOutput || ''),
          explanation: tc.explanation ? String(tc.explanation) : `AI Edge case #${idx + 1}`,
          isHidden: true,
        }));
        setHiddenTestCases(newCases);
      }

      toast.success('Problem specifications and test cases synthesized with 3 public examples.', 'AI Problem Created');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate problem via AI', 'AI Generation Error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAIGenerateTestCases = async (targetType: 'all' | 'public' | 'hidden' = 'all') => {
    if (!formData.statementMarkdown && !formData.title) {
      toast.error('Add a problem title or statement first.', 'AI Test Case Generator');
      return;
    }

    setAiGenerating(true);
    try {
      const res = await apiService.generateProblemAI({
        title: formData.title,
        category: formData.category,
        difficulty: formData.difficulty,
        statement: formData.statementMarkdown,
        prompt: aiPrompt || formData.statementMarkdown,
        taskType: 'test_cases',
      });

      const generated = res?.data || res;
      let addedPublicCount = 0;
      let addedHiddenCount = 0;

      // Update public sample cases (up to 3 examples)
      if (targetType === 'all' || targetType === 'public') {
        if (Array.isArray(generated?.publicTestCases) && generated.publicTestCases.length > 0) {
          const newPublics: LocalTestCase[] = generated.publicTestCases.map((tc: any, idx: number) => ({
            id: `tc-pub-ai-${Date.now()}-${idx}`,
            input: String(tc.input || ''),
            expectedOutput: String(tc.expectedOutput || tc.output || ''),
            explanation: tc.explanation ? String(tc.explanation) : `Example #${idx + 1}`,
            isHidden: false,
          }));
          setPublicTestCases(newPublics);
          addedPublicCount = newPublics.length;
        } else if (generated?.sampleInput && generated?.sampleOutput) {
          setPublicTestCases([
            {
              id: `tc-pub-ai-${Date.now()}-0`,
              input: generated.sampleInput,
              expectedOutput: generated.sampleOutput,
              explanation: generated.sampleExplanation || 'Example 1',
              isHidden: false,
            },
          ]);
          addedPublicCount = 1;
        }
      }

      // Update hidden cases
      if (targetType === 'all' || targetType === 'hidden') {
        if (Array.isArray(generated?.hiddenTestCases) && generated.hiddenTestCases.length > 0) {
          const newCases: LocalTestCase[] = generated.hiddenTestCases.map((tc: any, idx: number) => ({
            id: `tc-ai-${Date.now()}-${idx}`,
            input: String(tc.input || ''),
            expectedOutput: String(tc.expectedOutput || ''),
            explanation: tc.explanation ? String(tc.explanation) : `AI Edge case #${idx + 1}`,
            isHidden: true,
          }));

          setHiddenTestCases((prev) => [...prev.filter((p) => p.input.trim() || p.expectedOutput.trim()), ...newCases]);
          addedHiddenCount = newCases.length;
        }
      }

      if (targetType === 'public' && addedPublicCount > 0) {
        setTestCaseTab('sample');
        toast.success(`Generated ${addedPublicCount} public sample test cases.`, 'Sample Cases Added');
      } else if (targetType === 'hidden' && addedHiddenCount > 0) {
        setTestCaseTab('hidden');
        toast.success(`Generated ${addedHiddenCount} hidden edge test cases.`, 'Test Cases Added');
      } else if (addedPublicCount > 0 || addedHiddenCount > 0) {
        setTestCaseTab('sample');
        toast.success(`Generated ${addedPublicCount} public samples and ${addedHiddenCount} evaluation test cases.`, 'Test Suite Added');
      } else {
        toast.error('Could not generate additional test cases.', 'AI Error');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to generate test cases via AI', 'AI Error');
    } finally {
      setAiGenerating(false);
    }
  };

  // Test Case Management
  const addHiddenTestCase = () => {
    setHiddenTestCases((prev) => [
      ...prev,
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tc-${Date.now()}`,
        input: '',
        expectedOutput: '',
        isHidden: true,
      },
    ]);
  };

  const updateHiddenTestCase = (id: string, field: keyof LocalTestCase, val: string) => {
    setHiddenTestCases((prev) => prev.map((tc) => (tc.id === id ? { ...tc, [field]: val } : tc)));
  };

  const addPresetEdgeCase = (preset: 'zero' | 'large' | 'negative' | 'duplicate') => {
    let input = '';
    let expectedOutput = '';
    let explanation = '';
    if (preset === 'zero') {
      input = '0\n';
      expectedOutput = '0';
      explanation = 'Zero / empty boundary test case';
    } else if (preset === 'large') {
      input = '100000\n' + Array(8).fill('999999').join(' ');
      expectedOutput = '999999';
      explanation = 'Large input / Time Limit stress test (N = 10^5)';
    } else if (preset === 'negative') {
      input = '5\n-10 -20 -30 -40 -50';
      expectedOutput = '-10';
      explanation = 'All negative integers';
    } else if (preset === 'duplicate') {
      input = '6\n7 7 7 7 7 7';
      expectedOutput = '7';
      explanation = 'Identical elements / duplicate values';
    }
    setHiddenTestCases((prev) => [
      ...prev,
      {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `tc-${Date.now()}`,
        input,
        expectedOutput,
        explanation,
        isHidden: true,
      },
    ]);
    setTestCaseTab('hidden');
    toast.success(`Added preset edge case: ${explanation}`, 'Edge Case Added');
  };

  const removeHiddenTestCase = (id: string) => {
    setHiddenTestCases((prev) => {
      if (prev.length === 1) {
        return [{ id: 'tc-hidden-1', input: '', expectedOutput: '', isHidden: true }];
      }
      return prev.filter((tc) => tc.id !== id);
    });
  };

  const handleSubmit = async (publishStatus: ProblemStatus = 'Published') => {
    if (!formData.title.trim()) {
      toast.error('Problem Title is required.', 'Validation Error');
      return;
    }

    if (!formData.statementMarkdown.trim()) {
      toast.error('Problem Statement is required.', 'Validation Error');
      return;
    }

    const validPublics = publicTestCases.filter((tc) => tc.input.trim() || tc.expectedOutput.trim());
    if (validPublics.length === 0 && !formData.sampleInput.trim() && !formData.sampleOutput.trim()) {
      toast.error('At least one Public Sample Test Case is required.', 'Validation Error');
      setTestCaseTab('sample');
      return;
    }

    setSubmitting(true);
    try {
      const parsedTags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const assembledPublics: ProblemTestCaseItem[] = validPublics.length > 0
        ? validPublics.map((tc, idx) => ({
            input: tc.input,
            expectedOutput: tc.expectedOutput,
            explanation: tc.explanation,
            isHidden: false,
            order: idx,
          }))
        : [
            {
              input: formData.sampleInput,
              expectedOutput: formData.sampleOutput,
              explanation: formData.sampleExplanation,
              isHidden: false,
              order: 0,
            },
          ];

      const assembledHiddens: ProblemTestCaseItem[] = hiddenTestCases
        .filter((tc) => tc.input.trim() || tc.expectedOutput.trim())
        .map((tc, index) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
          isHidden: true,
          order: assembledPublics.length + index,
        }));

      const assembledTestCases: ProblemTestCaseItem[] = [...assembledPublics, ...assembledHiddens];

      const payload: NewProblemData = {
        ...formData,
        sampleInput: assembledPublics[0]?.input || formData.sampleInput,
        sampleOutput: assembledPublics[0]?.expectedOutput || formData.sampleOutput,
        sampleExplanation: assembledPublics[0]?.explanation || formData.sampleExplanation,
        status: publishStatus,
        tags: parsedTags.length > 0 ? parsedTags : [formData.category, 'Algorithms'],
        testCases: assembledTestCases,
        testCasesCount: assembledTestCases.length,
      };

      await onSubmit(payload);
      toast.success(
        `Problem "${formData.title}" created successfully as ${publishStatus} with ${assembledPublics.length} public sample(s) and ${assembledHiddens.length} hidden testcase(s).`,
        'Problem Created'
      );
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create problem', 'Server Error');
    } finally {
      setSubmitting(false);
    }
  };

  const validPublicCount = publicTestCases.filter((tc) => tc.input.trim() && tc.expectedOutput.trim()).length;
  const validHiddenCount = hiddenTestCases.filter((tc) => tc.input.trim() && tc.expectedOutput.trim()).length;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#F8FAFC',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            maxHeight: '100vh',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER APP BAR (PERMANENTLY FIXED AT TOP) */}
      {/* ========================================================================= */}
      <DialogTitle
        sx={{
          p: 0,
          bgcolor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
          zIndex: 30,
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2.5, sm: 3.5, md: 5, xl: 6 },
            py: 1.4,
          }}
        >
          {/* Left: Back & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.6 }}>
            <Tooltip title="Back to Problem Directory" arrow>
              <IconButton
                onClick={handleClose}
                sx={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  color: '#475569',
                  p: 0.8,
                  bgcolor: '#F8FAFC',
                  '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A', borderColor: '#CBD5E1' },
                }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem', letterSpacing: '-0.02em' }}>
                  {isEdit ? 'Edit Problem Specification' : 'Author Coding Challenge'}
                </Typography>
                <Chip
                  label={isEdit ? 'Edit Mode' : 'Studio Editor'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                    color: '#4F46E5',
                    borderRadius: '6px',
                  }}
                />
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: '0.74rem', mt: 0.2 }}>
                {isEdit ? 'Update problem details, statement, test cases, and execution constraints' : 'Full-page problem architect with WYSIWYG editor, AI synthesis, and evaluation sandbox'}
              </Typography>
            </Box>
          </Box>

          {/* Right: Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowAiBar(!showAiBar)}
              startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 15, color: '#6366F1' }} />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '9px',
                borderColor: showAiBar ? '#6366F1' : '#E2E8F0',
                bgcolor: showAiBar ? 'rgba(99, 102, 241, 0.06)' : '#FFFFFF',
                color: '#4F46E5',
                fontSize: '0.82rem',
                py: 0.6,
                px: 1.4,
                '&:hover': { bgcolor: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366F1' },
              }}
            >
              {showAiBar ? 'AI Assistant (Active)' : 'Open AI Assistant'}
            </Button>

            <Button
              variant="outlined"
              size="small"
              disabled={submitting || aiGenerating}
              onClick={() => handleSubmit('Draft')}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '9px',
                borderColor: '#CBD5E1',
                color: '#475569',
                fontSize: '0.82rem',
                py: 0.6,
                px: 1.4,
                bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
              }}
            >
              Save as Draft
            </Button>

            <Button
              variant="contained"
              size="small"
              disabled={submitting || aiGenerating}
              onClick={() => handleSubmit('Published')}
              startIcon={
                submitting ? (
                  <CircularProgress size={13} sx={{ color: '#FFFFFF' }} />
                ) : (
                  <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '9px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                fontSize: '0.82rem',
                px: 2.2,
                py: 0.65,
                boxShadow: '0 3px 12px rgba(99, 102, 241, 0.3)',
                '&:hover': { background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' },
              }}
            >
              {submitting ? (isEdit ? 'Updating...' : 'Publishing...') : (isEdit ? 'Update Challenge' : 'Publish Challenge')}
            </Button>
          </Box>
        </Box>
      </DialogTitle>

      {/* ========================================================================= */}
      {/* 2. MAIN STUDIO WORKSPACE (SCROLLABLE CONTAINER) */}
      {/* ========================================================================= */}
      <DialogContent
        sx={{
          '&.MuiDialogContent-root': {
            pt: { xs: '18px !important', sm: '22px !important', md: '24px !important' },
            pb: { xs: '32px !important', md: '48px !important' },
            px: { xs: 2.5, sm: 3.5, md: 5, xl: 6 },
          },
          flex: 1,
          overflowY: 'auto',
          bgcolor: '#F8FAFC',
        }}
      >
        <Box sx={{ width: '100%', mt: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* AI ARCHITECT TOOLBAR (CLEAN INLINE ROW WITHOUT SURROUNDING CARD BOX) */}
          {showAiBar && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                width: '100%',
              }}
            >
              {/* Pill Badge */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.9,
                  bgcolor: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '24px',
                  px: 1.6,
                  py: 0.6,
                  flexShrink: 0,
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 17, color: '#6366F1' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#4F46E5' }}>
                  AI Problem Architect
                </Typography>
              </Box>

              {/* Prompt Input */}
              <TextField
                size="small"
                placeholder="e.g. Dynamic Programming on 2D Grid with Obstacles and K teleports..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                disabled={aiGenerating}
                sx={{
                  flex: 1,
                  minWidth: 280,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                    fontSize: '0.86rem',
                    pr: 1.2,
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                    '& fieldset': { borderColor: '#CBD5E1' },
                    '&:hover fieldset': { borderColor: '#94A3B8' },
                    '&.Mui-focused fieldset': { borderColor: '#6366F1' },
                  },
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAIGenerateFullProblem();
                  }
                }}
              />

              {/* AI Action Buttons */}
              <Box sx={{ display: 'flex', gap: 1.2, flexShrink: 0 }}>
                <Button
                  variant="contained"
                  size="small"
                  disabled={aiGenerating}
                  onClick={handleAIGenerateFullProblem}
                  startIcon={aiGenerating ? <CircularProgress size={14} sx={{ color: '#FFFFFF' }} /> : <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    borderRadius: '24px',
                    px: 2.2,
                    py: 0.75,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 3px 10px rgba(99, 102, 241, 0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)' },
                  }}
                >
                  {aiGenerating ? 'Synthesizing...' : 'Generate Full Problem'}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  disabled={aiGenerating}
                  onClick={() => handleAIGenerateTestCases('all')}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    borderRadius: '24px',
                    bgcolor: '#FFFFFF',
                    borderColor: '#CBD5E1',
                    color: '#334155',
                    px: 1.8,
                    py: 0.75,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                  }}
                >
                  + AI Generate Test Suite
                </Button>
              </Box>
            </Box>
          )}

          {/* TWO-COLUMN BALANCED FULL-WIDTH RESPONSIVE LAYOUT */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: 'minmax(0, 1.28fr) minmax(0, 1fr)',
                xl: 'minmax(0, 1.25fr) minmax(0, 1fr)',
              },
              gap: 3.5,
              alignItems: 'start',
              width: '100%',
            }}
          >
            {/* ========================================================================= */}
            {/* LEFT COLUMN: METADATA & TIPTAP PROBLEM STATEMENT */}
            {/* ========================================================================= */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%' }}>
              {/* Card 1: Problem Specifications */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 20, color: '#6366F1' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                      Problem Specifications
                    </Typography>
                  </Box>
                  <Chip
                    label="Required"
                    size="small"
                    sx={{ height: 22, fontSize: '0.68rem', fontWeight: 800, bgcolor: 'rgba(239, 68, 68, 0.08)', color: '#DC2626', borderRadius: '6px' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.6 }}>
                  {/* Row 1: Title & Slug Code */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                    <TextField
                      label="Problem Title"
                      placeholder="e.g. Longest Palindromic Subsequence"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    />

                    <TextField
                      label="Problem Code / Slug"
                      placeholder="e.g. longest-palindromic-subsequence"
                      value={formData.code}
                      onChange={(e) => {
                        handleChange('code', e.target.value);
                        handleChange('slug', e.target.value);
                      }}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem', fontFamily: 'monospace' } },
                      }}
                    />
                  </Box>

                  {/* Row 2: Category, Difficulty & Points */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.3fr 1fr 1fr' }, gap: 2 }}>
                    <TextField
                      select
                      label="Topic Category"
                      value={formData.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    >
                      {CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat} sx={{ fontSize: '0.84rem' }}>
                          {cat}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Difficulty Tier"
                      value={formData.difficulty}
                      onChange={(e) => handleChange('difficulty', e.target.value)}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    >
                      {DIFFICULTIES.map((d) => (
                        <MenuItem key={d} value={d} sx={{ fontSize: '0.84rem' }}>
                          {d}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      type="number"
                      label="Points Value"
                      value={formData.points}
                      onChange={(e) => handleChange('points', Number(e.target.value))}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    />
                  </Box>

                  {/* Row 3: College Scope & Target Course */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      select
                      label="College / Institute Scope"
                      value={formData.institutionId || ''}
                      onChange={(e) => handleChange('institutionId', e.target.value || undefined)}
                      size="small"
                      fullWidth
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: '0.84rem' }}>Global Platform Bank (Public)</MenuItem>
                      {institutions.map((inst) => (
                        <MenuItem key={inst.id} value={inst.id} sx={{ fontSize: '0.84rem' }}>
                          {inst.name}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Target Course (Optional)"
                      value={formData.courseId || ''}
                      onChange={(e) => handleChange('courseId', e.target.value || undefined)}
                      size="small"
                      fullWidth
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: '0.84rem' }}>Standalone Problem (No Course)</MenuItem>
                      {filteredCourses.map((crs) => (
                        <MenuItem key={crs.id} value={crs.id} sx={{ fontSize: '0.84rem' }}>
                          {crs.title}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>

                  {/* Row 4: Runtime Constraints & Tags */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 2fr' }, gap: 2 }}>
                    <TextField
                      type="number"
                      label="Time Limit (ms)"
                      value={formData.timeLimitMs}
                      onChange={(e) => handleChange('timeLimitMs', Number(e.target.value))}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: {
                          sx: { borderRadius: '10px', fontSize: '0.86rem' },
                          startAdornment: (
                            <InputAdornment position="start">
                              <TimerRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <TextField
                      type="number"
                      label="Memory Limit (MB)"
                      value={formData.memoryLimitMb}
                      onChange={(e) => handleChange('memoryLimitMb', Number(e.target.value))}
                      size="small"
                      fullWidth
                      required
                      slotProps={{
                        input: {
                          sx: { borderRadius: '10px', fontSize: '0.86rem' },
                          startAdornment: (
                            <InputAdornment position="start">
                              <MemoryRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <TextField
                      label="Tags (comma-separated)"
                      placeholder="e.g. DP, Array, Binary Search"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      size="small"
                      fullWidth
                      slotProps={{
                        input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                      }}
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Card 2: Rich Tiptap Problem Statement */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                      Problem Statement *
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.78rem', mt: 0.3 }}>
                      Format problem descriptions with headings, tables, monospace code blocks, and mathematical constraints
                    </Typography>
                  </Box>
                </Box>

                <TiptapProblemEditor
                  content={formData.statementMarkdown}
                  onChange={(html) => handleChange('statementMarkdown', html)}
                  minHeight={280}
                  placeholder="Describe the problem narrative, task description, and examples..."
                />
              </Paper>

              {/* Card 3: I/O Specifications & Constraints */}
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2.2 }}>
                  <LayersOutlinedIcon sx={{ fontSize: 20, color: '#6366F1' }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                    I/O Specifications & Computational Bounds
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                  <TextField
                    label="Input Format Description"
                    placeholder="e.g. The first line contains an integer N. The second line contains N integers."
                    value={formData.inputFormat || ''}
                    onChange={(e) => handleChange('inputFormat', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    slotProps={{
                      input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                    }}
                  />

                  <TextField
                    label="Output Format Description"
                    placeholder="e.g. Output a single integer representing the optimal answer."
                    value={formData.outputFormat || ''}
                    onChange={(e) => handleChange('outputFormat', e.target.value)}
                    multiline
                    rows={2}
                    fullWidth
                    slotProps={{
                      input: { sx: { borderRadius: '10px', fontSize: '0.86rem' } },
                    }}
                  />

                  <TextField
                    label="Constraints & Computational Bounds"
                    placeholder="e.g. 1 <= N <= 10^5, -10^9 <= A[i] <= 10^9, Time Limit: 1.0s"
                    value={formData.constraints || ''}
                    onChange={(e) => handleChange('constraints', e.target.value)}
                    multiline
                    rows={3}
                    fullWidth
                    slotProps={{
                      input: { sx: { borderRadius: '10px', fontSize: '0.86rem', fontFamily: 'monospace' } },
                    }}
                  />
                </Box>
              </Paper>
            </Box>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: EVALUATION & TEST CASES STUDIO */}
            {/* ========================================================================= */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, position: { lg: 'sticky' }, top: 0, width: '100%' }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3.5,
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                }}
              >
                {/* Card Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <ShieldRoundedIcon sx={{ fontSize: 20, color: '#6366F1' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                      Test Cases & Evaluation
                    </Typography>
                  </Box>
                  <Chip
                    label={`${validPublicCount + validHiddenCount} Cases Total`}
                    size="small"
                    sx={{ bgcolor: '#F1F5F9', color: '#475569', fontWeight: 800, fontSize: '0.74rem', borderRadius: '6px' }}
                  />
                </Box>

                {/* Segmented Tab Navigation */}
                <Box sx={{ bgcolor: '#F8FAFC', p: 0.6, borderRadius: '12px', border: '1px solid #E2E8F0', mb: 2.4 }}>
                  <Tabs
                    value={testCaseTab}
                    onChange={(_, v) => setTestCaseTab(v)}
                    variant="fullWidth"
                    sx={{
                      minHeight: 38,
                      '& .MuiTabs-indicator': { display: 'none' },
                      '& .MuiTab-root': {
                        minHeight: 36,
                        py: 0.5,
                        px: 1.4,
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        color: '#64748B',
                        transition: 'all 0.15s ease',
                        '&.Mui-selected': {
                          color: '#4F46E5',
                          bgcolor: '#FFFFFF',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        },
                      },
                    }}
                  >
                    <Tab
                      icon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                      label={`Public Samples (${publicTestCases.length})`}
                      value="sample"
                    />
                    <Tab
                      icon={<VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />}
                      iconPosition="start"
                      label={`Hidden Cases (${hiddenTestCases.length})`}
                      value="hidden"
                    />
                  </Tabs>
                </Box>

                {/* TAB 1: SAMPLE TEST CASES (PUBLIC) */}
                {testCaseTab === 'sample' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.45 }}>
                        Visible in problem statement and student test runner.
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={aiGenerating}
                          onClick={() => handleAIGenerateTestCases('public')}
                          startIcon={aiGenerating ? <CircularProgress size={12} /> : <AutoAwesomeRoundedIcon sx={{ fontSize: 14, color: '#6366F1' }} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            borderRadius: '8px',
                            borderColor: '#CBD5E1',
                            color: '#4F46E5',
                            py: 0.35,
                            px: 1.2,
                            whiteSpace: 'nowrap',
                            '&:hover': { borderColor: '#6366F1', bgcolor: 'rgba(99, 102, 241, 0.04)' },
                          }}
                        >
                          AI Generate 3 Samples
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={addPublicTestCase}
                          startIcon={<AddRoundedIcon sx={{ fontSize: 15 }} />}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            borderRadius: '8px',
                            borderColor: '#CBD5E1',
                            color: '#059669',
                            py: 0.35,
                            px: 1.2,
                            whiteSpace: 'nowrap',
                            '&:hover': { borderColor: '#10B981', bgcolor: 'rgba(16, 185, 129, 0.04)' },
                          }}
                        >
                          Add Sample
                        </Button>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxHeight: 460,
                        overflowY: 'auto',
                        pr: 0.5,
                      }}
                    >
                      {publicTestCases.map((tc, index) => (
                        <Paper
                          key={tc.id}
                          elevation={0}
                          sx={{
                            p: 2.2,
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            bgcolor: '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.6,
                            transition: 'all 0.15s ease',
                            '&:hover': { borderColor: '#CBD5E1' },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={`Example #${index + 1}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                bgcolor: 'rgba(16, 185, 129, 0.1)',
                                color: '#059669',
                                borderRadius: '6px',
                              }}
                            />
                            {publicTestCases.length > 1 && (
                              <IconButton
                                size="small"
                                onClick={() => removePublicTestCase(tc.id)}
                                sx={{ color: '#94A3B8', p: 0.4, '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                              >
                                <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                              </IconButton>
                            )}
                          </Box>

                          <TextField
                            label="Sample Input"
                            placeholder="Enter sample input data..."
                            value={tc.input}
                            onChange={(e) => updatePublicTestCase(tc.id, 'input', e.target.value)}
                            multiline
                            rows={3}
                            fullWidth
                            required={index === 0}
                            slotProps={{
                              input: {
                                sx: { fontFamily: 'monospace', fontSize: '0.84rem', borderRadius: '8px', bgcolor: '#FFFFFF' },
                              },
                            }}
                          />

                          <TextField
                            label="Sample Expected Output"
                            placeholder="Enter sample expected output..."
                            value={tc.expectedOutput}
                            onChange={(e) => updatePublicTestCase(tc.id, 'expectedOutput', e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            required={index === 0}
                            slotProps={{
                              input: {
                                sx: { fontFamily: 'monospace', fontSize: '0.84rem', borderRadius: '8px', bgcolor: '#FFFFFF' },
                              },
                            }}
                          />

                          <TextField
                            label="Step Explanation (Optional)"
                            placeholder="Explain why the sample input produces this output..."
                            value={tc.explanation || ''}
                            onChange={(e) => updatePublicTestCase(tc.id, 'explanation', e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            slotProps={{
                              input: {
                                sx: { fontSize: '0.84rem', borderRadius: '8px', bgcolor: '#FFFFFF' },
                              },
                            }}
                          />
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* TAB 2: HIDDEN TEST CASES (PRIVATE) */}
                {testCaseTab === 'hidden' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                        Secret evaluation test cases executed inside the Docker judge sandbox.
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={addHiddenTestCase}
                        startIcon={<AddRoundedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          borderRadius: '8px',
                          borderColor: '#CBD5E1',
                          color: '#4F46E5',
                          py: 0.45,
                          px: 1.4,
                          whiteSpace: 'nowrap',
                          '&:hover': { borderColor: '#6366F1', bgcolor: 'rgba(99, 102, 241, 0.04)' },
                        }}
                      >
                        Add Case
                      </Button>
                    </Box>

                    {/* Edge Case Generator Quick Pills */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, alignItems: 'center' }}>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                        Quick Presets:
                      </Typography>
                      <Chip
                        label="+ Zero / Boundary"
                        size="small"
                        onClick={() => addPresetEdgeCase('zero')}
                        sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F1F5F9', cursor: 'pointer', '&:hover': { bgcolor: '#E2E8F0' } }}
                      />
                      <Chip
                        label="+ Large N (10^5)"
                        size="small"
                        onClick={() => addPresetEdgeCase('large')}
                        sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F1F5F9', cursor: 'pointer', '&:hover': { bgcolor: '#E2E8F0' } }}
                      />
                      <Chip
                        label="+ Negative Values"
                        size="small"
                        onClick={() => addPresetEdgeCase('negative')}
                        sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F1F5F9', cursor: 'pointer', '&:hover': { bgcolor: '#E2E8F0' } }}
                      />
                      <Chip
                        label="+ Duplicates"
                        size="small"
                        onClick={() => addPresetEdgeCase('duplicate')}
                        sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F1F5F9', cursor: 'pointer', '&:hover': { bgcolor: '#E2E8F0' } }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        maxHeight: 460,
                        overflowY: 'auto',
                        pr: 0.5,
                      }}
                    >
                      {hiddenTestCases.map((tc, index) => (
                        <Paper
                          key={tc.id}
                          elevation={0}
                          sx={{
                            p: 2.2,
                            border: '1px solid #E2E8F0',
                            borderRadius: '12px',
                            bgcolor: '#F8FAFC',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.6,
                            transition: 'all 0.15s ease',
                            '&:hover': { borderColor: '#CBD5E1' },
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip
                              label={`Hidden Case #${index + 1}`}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                bgcolor: 'rgba(99, 102, 241, 0.1)',
                                color: '#4F46E5',
                                borderRadius: '6px',
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => removeHiddenTestCase(tc.id)}
                              sx={{ color: '#94A3B8', p: 0.4, '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                            >
                              <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                            </IconButton>
                          </Box>

                          <TextField
                            label="Evaluation Input"
                            placeholder="Input passed to stdin..."
                            value={tc.input}
                            onChange={(e) => updateHiddenTestCase(tc.id, 'input', e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            slotProps={{
                              input: {
                                sx: { fontFamily: 'monospace', fontSize: '0.82rem', borderRadius: '8px', bgcolor: '#FFFFFF' },
                              },
                            }}
                          />

                          <TextField
                            label="Expected Output"
                            placeholder="Expected stdout string..."
                            value={tc.expectedOutput}
                            onChange={(e) => updateHiddenTestCase(tc.id, 'expectedOutput', e.target.value)}
                            multiline
                            rows={2}
                            fullWidth
                            slotProps={{
                              input: {
                                sx: { fontFamily: 'monospace', fontSize: '0.82rem', borderRadius: '8px', bgcolor: '#FFFFFF' },
                              },
                            }}
                          />

                          <TextField
                            label="Edge Case Note (Optional)"
                            placeholder="e.g. Single element, all negative numbers, boundary constraints"
                            value={tc.explanation || ''}
                            onChange={(e) => updateHiddenTestCase(tc.id, 'explanation', e.target.value)}
                            size="small"
                            fullWidth
                            slotProps={{
                              input: {
                                sx: { fontSize: '0.8rem', borderRadius: '8px', bgcolor: '#FFFFFF' },
                              },
                            }}
                          />
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>

              {/* Card 2: Quality Checklist & Judge Sandbox Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PlaylistAddCheckRoundedIcon sx={{ fontSize: 20, color: '#6366F1' }} />
                    <Typography sx={{ fontWeight: 800, fontSize: '0.94rem', color: '#0F172A', letterSpacing: '-0.01em' }}>
                      Problem Readiness Checklist
                    </Typography>
                  </Box>
                  <Chip
                    label={formData.title && formData.statementMarkdown && formData.sampleInput && validHiddenCount >= 1 ? 'Ready to Publish' : 'Draft In Progress'}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      bgcolor: formData.title && formData.statementMarkdown && formData.sampleInput && validHiddenCount >= 1 ? 'rgba(34, 197, 94, 0.1)' : '#F1F5F9',
                      color: formData.title && formData.statementMarkdown && formData.sampleInput && validHiddenCount >= 1 ? '#16A34A' : '#64748B',
                      borderRadius: '6px',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                  {[
                    { label: 'Problem Title & Slug Code', passed: Boolean(formData.title.trim() && formData.code.trim()) },
                    { label: 'WYSIWYG Problem Statement', passed: Boolean(formData.statementMarkdown.trim() && formData.statementMarkdown.length > 20) },
                    { label: 'Public Sample Test Case (I/O)', passed: Boolean(formData.sampleInput.trim() && formData.sampleOutput.trim()) },
                    { label: 'Hidden Judge Sandbox Cases (≥ 1)', passed: validHiddenCount >= 1 },
                    { label: 'Input/Output Format & Constraints', passed: Boolean(formData.inputFormat || formData.constraints) },
                  ].map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.4 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.passed ? (
                          <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />
                        ) : (
                          <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
                        )}
                        <Typography sx={{ fontSize: '0.8rem', color: item.passed ? '#1E293B' : '#64748B', fontWeight: item.passed ? 600 : 400 }}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: item.passed ? '#16A34A' : '#94A3B8' }}>
                        {item.passed ? 'Complete' : 'Pending'}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <TerminalRoundedIcon sx={{ fontSize: 16, color: '#6366F1' }} />
                    <Typography sx={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569' }}>
                      Execution Sandbox:
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                    {formData.timeLimitMs}ms / {formData.memoryLimitMb}MB (BullMQ & Docker)
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
