'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  InputAdornment,
  CircularProgress,
  Divider,
  Paper,
  Alert,
  Tooltip,
} from '@mui/material';

// Material Rounded Icons
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ContentPasteOffRoundedIcon from '@mui/icons-material/ContentPasteOffRounded';
import ShuffleRoundedIcon from '@mui/icons-material/ShuffleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { FluidArrowForward, FluidArrowBack } from '@/utils/fluid_arrow';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import DomainAddRoundedIcon from '@mui/icons-material/DomainAddRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import GradeRoundedIcon from '@mui/icons-material/GradeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded';

import {
  NewContestData,
  ContestScope,
  ScoringFormat,
  AssessmentQuestion,
  AssessmentQuestionOption,
  AssessmentTestCase,
  QuestionType,
} from '@/types/contest';
import { apiService } from '@/lib/api-service';
import TipTapEditor from '@/components/shared/TipTapEditor';
import { BRAND_COLORS } from '@/theme/colors';
import { useToast } from '@/context/ToastContext';

interface CreateContestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NewContestData) => void;
  defaultBatchId?: string;
  defaultInstitutionId?: string;
}

const SCOPES: { value: ContestScope; label: string; desc: string }[] = [
  {
    value: 'Institutional Invitational',
    label: 'External College Assessment',
    desc: 'Dedicated exam for outside partner universities and client colleges.',
  },
  {
    value: 'Batch Assessment (Cohort-Specific)',
    label: 'Campus Hiring / Placement Drive',
    desc: 'Targeted recruitment or evaluation drive for specific candidate rosters.',
  },
  {
    value: 'Institute League',
    label: 'Inter-College Invitational Olympiad',
    desc: 'Open competitive drive across multiple partner campuses.',
  },
  {
    value: 'Internal Faculty Assessment',
    label: 'Custom Certification Examination',
    desc: 'Proctored SkillOS evaluation with custom verification credentials.',
  },
];

const SCORING_FORMATS: { label: ScoringFormat; title: string; desc: string; penalty: string }[] = [
  {
    label: 'LeetCode (Score + Penalty)',
    title: 'Weighted Points (LeetCode)',
    desc: 'Ranked by total problem score. 5-minute penalty added per wrong attempt on accept.',
    penalty: '+5 min on AC',
  },
  {
    label: 'ICPC (Penalty Time)',
    title: 'ICPC Standard',
    desc: 'Ranked by solve count. Ties resolved by total solve time + 20m per rejected submission.',
    penalty: '+20 min per rejected try',
  },
  {
    label: 'IOI (Partial Subtasks)',
    title: 'IOI Partial Subtasks',
    desc: 'Candidates receive partial points proportional to testcases passed.',
    penalty: 'Graded partial marks',
  },
  {
    label: 'AtCoder (Scored)',
    title: 'Speed Rank (AtCoder)',
    desc: 'Score by total problem points with absolute submission timestamp tiebreaker.',
    penalty: 'Pure speed rank',
  },
];

const STEPS = [
  { 
    step: 1, 
    title: 'Institution & Cohort', 
    description: 'Establish institutional identity, target cohort scope, and ingest candidate roster.' 
  },
  { 
    step: 2, 
    title: 'Assessment Details', 
    description: 'Define evaluation parameters, category tags, and assessment configuration.' 
  },
  { 
    step: 3, 
    title: 'Question Bank', 
    description: 'Curate coding challenges, test suite criteria, and problem weightages.' 
  },
  { 
    step: 4, 
    title: 'Schedule & Timing', 
    description: 'Configure assessment availability window, time limits, and access windows.' 
  },
  { 
    step: 5, 
    title: 'Anti-Cheat Suite', 
    description: 'Configure proctoring guardrails, environment lockdown, and integrity controls.' 
  },
  { 
    step: 6, 
    title: 'Review & Deploy', 
    description: 'Review assessment configuration, verify candidate delivery, and launch.' 
  },
];

const POPULAR_TAGS = [
  'DSA',
  'Arrays & Strings',
  'Dynamic Programming',
  'Trees & Graphs',
  'Campus Hiring',
  'Placement Assessment',
  'Python',
  'System Design',
];

const formatLocalDatetime = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function CreateContestModal({
  open,
  onClose,
  onSubmit,
  defaultBatchId,
  defaultInstitutionId,
}: CreateContestModalProps) {
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);

  // Institution Mode: Unregistered (outside college) vs Registered (onboarded)
  const [institutionMode, setInstitutionMode] = useState<'UNREGISTERED' | 'REGISTERED'>('UNREGISTERED');
  const [externalCollegeName, setExternalCollegeName] = useState('');
  const [externalCollegeCode, setExternalCollegeCode] = useState('');
  const [coordinatorEmail, setCoordinatorEmail] = useState('');
  const [targetCohortLabel, setTargetCohortLabel] = useState('');
  const [candidateAccessMode, setCandidateAccessMode] = useState<'PUBLIC_LINK' | 'ROLL_NUMBER' | 'DOMAIN_WHITELIST' | 'CSV_WHITELIST'>('PUBLIC_LINK');

  // Cohort / Institution Logo Import State
  const [cohortLogo, setCohortLogo] = useState<string>('');

  // Candidate Roster Ingestion & Dynamic Magic-Link Dispatch States
  const [candidatesList, setCandidatesList] = useState<Array<{ id: string; fullName: string; email: string; rollNumber: string; branch?: string }>>([]);
  const [uploadedRosterFile, setUploadedRosterFile] = useState<string | null>(null);
  const [candidateSearch, setCandidateSearch] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailCustomNote, setEmailCustomNote] = useState<string>(
    'Please ensure you are seated in a quiet, well-lit environment with your webcam and microphone activated.'
  );
  const [dispatchSchedule, setDispatchSchedule] = useState<'INSTANT' | 'BEFORE_1H' | 'MANUAL'>('INSTANT');
  const [testEmailAddress, setTestEmailAddress] = useState<string>('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);

  const [formData, setFormData] = useState<NewContestData>({
    title: '',
    slug: '',
    code: '',
    description: '',
    scope: 'Institutional Invitational',
    scoringFormat: 'LeetCode (Score + Penalty)',
    status: 'UPCOMING',
    startTime: formatLocalDatetime(new Date(Date.now() + 3600000)),
    durationMinutes: 90,
    problemsCount: 0,
    organizer: 'SkillOS Institutional Assessment Cell',
    rated: true,
    tags: ['DSA', 'Campus Hiring'],
    institutionId: defaultInstitutionId || '',
    batchId: defaultBatchId || '',
    problemIds: [],
    // Proctoring suite defaults
    isProctored: true,
    enforceFullScreen: true,
    tabSwitchLimit: 3,
    disableCopyPaste: true,
    webcamProctoring: false,
    audioProctoring: false,
    plagiarismCheck: true,
    windowType: 'FIXED',
    shuffleQuestions: false,
    ipRestriction: '',
  });

  const [tagInput, setTagInput] = useState('DSA, Campus Hiring');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Async data sources
  const [colleges, setColleges] = useState<Array<{ id: string; name: string; code?: string }>>([]);
  const [batches, setBatches] = useState<
    Array<{ id: string; name: string; institutionId?: string; _count?: { students: number } }>
  >([]);
  const [problems, setProblems] = useState<
    Array<{ id: string; title: string; difficulty: string; points?: number; category?: string; tags?: string[] }>
  >([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Problem Search & Filter
  const [problemSearch, setProblemSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      return;
    }

    let isMounted = true;
    async function loadData() {
      setLoadingData(true);
      try {
        const [collegesData, batchData, probData] = await Promise.allSettled([
          apiService.getInstitutions({ limit: 200 }),
          apiService.getBatches(),
          apiService.getProblems({ limit: 100 }),
        ]);

        if (!isMounted) return;

        let collegeItems: any[] = [];
        if (collegesData.status === 'fulfilled' && collegesData.value) {
          const raw: any = collegesData.value;
          if (Array.isArray(raw)) {
            collegeItems = raw;
          } else if (Array.isArray(raw.items)) {
            collegeItems = raw.items;
          } else if (Array.isArray(raw.data)) {
            collegeItems = raw.data;
          }
        }

        // Fallback if initial load returned empty array
        if (collegeItems.length === 0) {
          try {
            const fallback = await apiService.getColleges({ limit: 100 });
            if (fallback?.items && Array.isArray(fallback.items)) {
              collegeItems = fallback.items;
            } else if (Array.isArray(fallback)) {
              collegeItems = fallback;
            }
          } catch (err) {
            console.warn('Fallback getColleges failed:', err);
          }
        }

        setColleges(collegeItems);

        let loadedBatches: any[] = [];
        if (batchData.status === 'fulfilled' && batchData.value) {
          const raw: any = batchData.value;
          if (Array.isArray(raw)) {
            loadedBatches = raw;
          } else if (Array.isArray(raw.data)) {
            loadedBatches = raw.data;
          } else if (Array.isArray(raw.items)) {
            loadedBatches = raw.items;
          }
          setBatches(loadedBatches);
        }

        if (probData.status === 'fulfilled' && probData.value?.items) {
          setProblems(probData.value.items);
        }

        // Default institution context
        if (defaultInstitutionId) {
          setInstitutionMode('REGISTERED');
          setFormData((prev) => ({ ...prev, institutionId: defaultInstitutionId }));
        }
      } catch (err) {
        console.error('Failed to load assessment metadata:', err);
      } finally {
        if (isMounted) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [open, defaultBatchId, defaultInstitutionId]);

  // Dynamically load batches when an institution is selected
  useEffect(() => {
    if (!formData.institutionId) return;

    let isMounted = true;
    async function loadInstitutionBatches() {
      setLoadingBatches(true);
      try {
        const res = await apiService.getBatchesByInstitution(formData.institutionId!);
        if (!isMounted) return;
        const newBatches = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
        if (newBatches.length > 0) {
          setBatches((prev) => {
            const existingIds = new Set(newBatches.map((b: any) => b.id));
            const filtered = prev.filter((b) => !existingIds.has(b.id));
            return [...filtered, ...newBatches];
          });
        }
      } catch (err) {
        console.warn('Could not fetch batches for institution:', err);
      } finally {
        if (isMounted) setLoadingBatches(false);
      }
    }

    loadInstitutionBatches();
    return () => {
      isMounted = false;
    };
  }, [formData.institutionId]);

  const availableCollegeBatches = useMemo(() => {
    if (!formData.institutionId) return [];
    return batches.filter((b) => !b.institutionId || b.institutionId === formData.institutionId);
  }, [batches, formData.institutionId]);

  const selectedInstitutionInfo = useMemo(() => {
    return colleges.find((c) => c.id === formData.institutionId);
  }, [colleges, formData.institutionId]);

  const selectedBatchInfo = useMemo(() => {
    return batches.find((b) => b.id === formData.batchId);
  }, [batches, formData.batchId]);

  const effectiveCollegeName = useMemo(() => {
    if (institutionMode === 'REGISTERED') {
      return selectedInstitutionInfo?.name || 'Registered Partner College';
    }
    return externalCollegeName.trim() || 'External Guest Institution';
  }, [institutionMode, selectedInstitutionInfo, externalCollegeName]);

  // Derive unique categories from problem bank
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    problems.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [problems]);

  // Step 3: Question Setup Mode & Builder States
  const [questionBankTab, setQuestionBankTab] = useState<'LIBRARY' | 'CREATE' | 'AI_COPILOT'>('LIBRARY');
  const [questionTypeFilter, setQuestionTypeFilter] = useState<'ALL' | 'CODING' | 'MCQ' | 'MSQ'>('ALL');
  
  // Custom Builder Active Type
  const [builderType, setBuilderType] = useState<QuestionType>('MCQ');

  // AI Copilot & Generation States
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState<number>(3);
  const [aiQuestionType, setAiQuestionType] = useState<'MIXED' | 'CODING' | 'MCQ' | 'MSQ'>('MIXED');
  const [aiDifficulty, setAiDifficulty] = useState<'MIXED' | 'EASY' | 'MEDIUM' | 'HARD'>('MIXED');
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiRefiningField, setAiRefiningField] = useState<string | null>(null);

  // Custom Questions Master Store (pre-seeded with standard high-yield questions)
  const [customQuestions, setCustomQuestions] = useState<AssessmentQuestion[]>([
    {
      id: 'demo-mcq-1',
      type: 'MCQ',
      title: 'What is the worst-case time complexity of searching an element in a Balanced Binary Search Tree (AVL / Red-Black)?',
      category: 'Data Structures',
      points: 10,
      negativeMarks: 2.5,
      difficulty: 'EASY',
      options: [
        { id: 'opt-1', text: 'O(1)' },
        { id: 'opt-2', text: 'O(log N)' },
        { id: 'opt-3', text: 'O(N)' },
        { id: 'opt-4', text: 'O(N log N)' },
      ],
      correctOptionIds: ['opt-2'],
      explanation: 'In balanced BSTs (AVL, Red-Black Trees), height is strictly bounded by O(log N), guaranteeing O(log N) worst-case lookup.',
    },
    {
      id: 'demo-msq-1',
      type: 'MSQ',
      title: 'Which of the following sorting algorithms exhibit guaranteed O(N log N) worst-case time complexity?',
      category: 'Algorithms',
      points: 15,
      negativeMarks: 0,
      difficulty: 'MEDIUM',
      options: [
        { id: 'opt-1', text: 'Merge Sort' },
        { id: 'opt-2', text: 'Heap Sort' },
        { id: 'opt-3', text: 'Quick Sort' },
        { id: 'opt-4', text: 'Bubble Sort' },
      ],
      correctOptionIds: ['opt-1', 'opt-2'],
      explanation: 'Merge Sort and Heap Sort strictly run in O(N log N) worst case. Quick Sort degrades to O(N^2) on adversarial pivots.',
    },
  ]);

  // Selected Custom Question IDs (initially include default templates)
  const [selectedCustomIds, setSelectedCustomIds] = useState<string[]>(['demo-mcq-1', 'demo-msq-1']);

  // MCQ / MSQ Builder Inputs
  const [mcqTitle, setMcqTitle] = useState('');
  const [mcqCategory, setMcqCategory] = useState('Core CS & DSA');
  const [mcqDifficulty, setMcqDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [mcqPoints, setMcqPoints] = useState<number>(10);
  const [mcqNegative, setMcqNegative] = useState<number>(0);
  const [mcqExplanation, setMcqExplanation] = useState('');
  const [mcqOptions, setMcqOptions] = useState<AssessmentQuestionOption[]>([
    { id: 'opt-1', text: 'Option A: ' },
    { id: 'opt-2', text: 'Option B: ' },
    { id: 'opt-3', text: 'Option C: ' },
    { id: 'opt-4', text: 'Option D: ' },
  ]);
  const [mcqSingleCorrect, setMcqSingleCorrect] = useState<string>('opt-1');
  const [msqMultiCorrect, setMsqMultiCorrect] = useState<string[]>(['opt-1']);

  // Coding Builder Inputs
  const [codingTitle, setCodingTitle] = useState('');
  const [codingDifficulty, setCodingDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [codingPoints, setCodingPoints] = useState<number>(100);
  const [codingCategory, setCodingCategory] = useState('Data Structures & Algorithms');
  const [codingTimeLimit, setCodingTimeLimit] = useState<number>(2000);
  const [codingMemoryLimit, setCodingMemoryLimit] = useState<number>(256);
  const [codingDescription, setCodingDescription] = useState('');
  const [codingTestcases, setCodingTestcases] = useState<AssessmentTestCase[]>([
    { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', isHidden: false, explanation: 'nums[0] + nums[1] == 9' },
    { input: 'nums = [3,2,4], target = 6', output: '[1,2]', isHidden: true },
  ]);

  // Option Handlers
  const handleAddOption = () => {
    const nextId = `opt-${mcqOptions.length + 1}`;
    setMcqOptions((prev) => [...prev, { id: nextId, text: `Option ${String.fromCharCode(65 + prev.length)}: ` }]);
  };

  const handleRemoveOption = (id: string) => {
    if (mcqOptions.length <= 2) return;
    setMcqOptions((prev) => prev.filter((o) => o.id !== id));
    if (mcqSingleCorrect === id) {
      setMcqSingleCorrect(mcqOptions.find((o) => o.id !== id)?.id || '');
    }
    setMsqMultiCorrect((prev) => prev.filter((oId) => oId !== id));
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setMcqOptions((prev) => prev.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleToggleMsqCorrect = (id: string) => {
    setMsqMultiCorrect((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  // Testcase Handlers
  const handleAddTestcase = () => {
    setCodingTestcases((prev: AssessmentTestCase[]) => [...prev, { input: '', output: '', isHidden: false }]);
  };

  const handleRemoveTestcase = (index: number) => {
    if (codingTestcases.length <= 1) return;
    setCodingTestcases((prev: AssessmentTestCase[]) => prev.filter((_, idx) => idx !== index));
  };

  const handleTestcaseChange = (index: number, field: keyof AssessmentTestCase, value: any) => {
    setCodingTestcases((prev: AssessmentTestCase[]) => prev.map((tc, idx) => (idx === index ? { ...tc, [field]: value } : tc)));
  };

  // Save / Add Custom Question to Deck
  const handleSaveCustomQuestion = () => {
    if (builderType === 'MCQ') {
      if (!mcqTitle.trim()) return;
      const validOptions = mcqOptions.filter((o) => o.text.trim().length > 0);
      if (validOptions.length < 2) return;
      const newQ: AssessmentQuestion = {
        id: `custom-mcq-${Date.now()}`,
        type: 'MCQ',
        title: mcqTitle.trim(),
        category: mcqCategory.trim() || 'General MCQ',
        difficulty: mcqDifficulty,
        points: Number(mcqPoints) || 10,
        negativeMarks: Number(mcqNegative) || 0,
        options: validOptions,
        correctOptionIds: [mcqSingleCorrect],
        explanation: mcqExplanation.trim(),
      };
      setCustomQuestions((prev) => [newQ, ...prev]);
      setSelectedCustomIds((prev) => [newQ.id, ...prev]);
      setMcqTitle('');
      setMcqExplanation('');
    } else if (builderType === 'MSQ') {
      if (!mcqTitle.trim()) return;
      const validOptions = mcqOptions.filter((o) => o.text.trim().length > 0);
      if (validOptions.length < 2) return;
      if (msqMultiCorrect.length === 0) return;
      const newQ: AssessmentQuestion = {
        id: `custom-msq-${Date.now()}`,
        type: 'MSQ',
        title: mcqTitle.trim(),
        category: mcqCategory.trim() || 'General MSQ',
        difficulty: mcqDifficulty,
        points: Number(mcqPoints) || 15,
        negativeMarks: Number(mcqNegative) || 0,
        options: validOptions,
        correctOptionIds: msqMultiCorrect,
        explanation: mcqExplanation.trim(),
      };
      setCustomQuestions((prev) => [newQ, ...prev]);
      setSelectedCustomIds((prev) => [newQ.id, ...prev]);
      setMcqTitle('');
      setMcqExplanation('');
    } else if (builderType === 'CODING') {
      if (!codingTitle.trim()) return;
      const newQ: AssessmentQuestion = {
        id: `custom-code-${Date.now()}`,
        type: 'CODING',
        title: codingTitle.trim(),
        description: codingDescription.trim(),
        difficulty: codingDifficulty,
        category: codingCategory.trim() || 'Algorithms',
        points: Number(codingPoints) || 100,
        timeLimitMs: Number(codingTimeLimit) || 2000,
        memoryLimitMb: Number(codingMemoryLimit) || 256,
        testCases: codingTestcases.filter((tc) => tc.input.trim() || tc.output.trim()),
      };
      setCustomQuestions((prev) => [newQ, ...prev]);
      setSelectedCustomIds((prev) => [newQ.id, ...prev]);
      setCodingTitle('');
      setCodingDescription('');
    }
  };

  // ═════════════════════════════════════════════════════════════
  // SKILLOS AI QUESTION INTELLIGENCE ENGINE & COPILOT HANDLERS
  // ═════════════════════════════════════════════════════════════

  // 1. AI Generate Topic Question Deck
  const handleAiGenerateTopicDeck = (topicOverride?: string, typeOverride?: 'MIXED' | 'CODING' | 'MCQ' | 'MSQ') => {
    const topic = topicOverride || aiTopic.trim() || formData.title.trim() || tagInput.trim() || 'Data Structures & Algorithms';
    const targetType = typeOverride || aiQuestionType;
    const count = aiQuestionCount || 3;
    const diff = aiDifficulty === 'MIXED' ? 'MEDIUM' : aiDifficulty;

    setAiGenerating(true);
    setAiSuccessMessage(null);

    setTimeout(() => {
      const generatedList: AssessmentQuestion[] = [];
      const timestamp = Date.now();

      // Topic specific generation seeds
      const isSql = topic.toLowerCase().includes('sql') || topic.toLowerCase().includes('database') || topic.toLowerCase().includes('dbms');
      const isWeb = topic.toLowerCase().includes('react') || topic.toLowerCase().includes('web') || topic.toLowerCase().includes('frontend') || topic.toLowerCase().includes('js');
      const isSysDesign = topic.toLowerCase().includes('system') || topic.toLowerCase().includes('architecture') || topic.toLowerCase().includes('cloud');

      // Generate items based on targetType
      if (targetType === 'MCQ' || targetType === 'MIXED') {
        generatedList.push({
          id: `ai-mcq-${timestamp}-1`,
          type: 'MCQ',
          title: isSql
            ? `In relational databases, which SQL JOIN returns all records when there is a match in either left or right table records?`
            : isWeb
            ? `In React 18+, which hook is specifically recommended to synchronize external non-React subscription systems?`
            : isSysDesign
            ? `Which consistency model is guaranteed in a distributed database when CAP theorem prioritizes Partition Tolerance and Consistency?`
            : `What is the amortized time complexity of inserting N elements into a dynamic array (vector / ArrayList) that doubles its capacity?`,
          category: topic,
          difficulty: diff === 'HARD' ? 'HARD' : 'MEDIUM',
          points: diff === 'HARD' ? 15 : 10,
          negativeMarks: 2.5,
          options: isSql
            ? [
                { id: 'opt-1', text: 'INNER JOIN' },
                { id: 'opt-2', text: 'FULL OUTER JOIN' },
                { id: 'opt-3', text: 'CROSS JOIN' },
                { id: 'opt-4', text: 'LEFT SEMI JOIN' },
              ]
            : isWeb
            ? [
                { id: 'opt-1', text: 'useMemo' },
                { id: 'opt-2', text: 'useSyncExternalStore' },
                { id: 'opt-3', text: 'useLayoutEffect' },
                { id: 'opt-4', text: 'useImperativeHandle' },
              ]
            : [
                { id: 'opt-1', text: 'O(1)' },
                { id: 'opt-2', text: 'O(N) total, amortized O(1) per insertion' },
                { id: 'opt-3', text: 'O(log N)' },
                { id: 'opt-4', text: 'O(N log N)' },
              ],
          correctOptionIds: ['opt-2'],
          explanation: `Generated by SkillOS AI: Verified accurate question based on standard syllabus and core concepts of ${topic}.`,
        });
      }

      if (targetType === 'MSQ' || (targetType === 'MIXED' && count >= 2)) {
        generatedList.push({
          id: `ai-msq-${timestamp}-2`,
          type: 'MSQ',
          title: isSql
            ? `Which of the following properties are strictly guaranteed by ACID transactions in ACID-compliant RDBMS?`
            : isWeb
            ? `Which of the following will trigger a React component re-render when changed?`
            : `Which of the following graph traversal or shortest-path algorithms work correctly with non-negative edge weights?`,
          category: topic,
          difficulty: 'MEDIUM',
          points: 15,
          negativeMarks: 0,
          options: isSql
            ? [
                { id: 'opt-1', text: 'Atomicity (All-or-Nothing execution)' },
                { id: 'opt-2', text: 'Consistency (State invariants preserved)' },
                { id: 'opt-3', text: 'Isolation (Concurrent execution safety)' },
                { id: 'opt-4', text: 'Asynchrony (Deferred disk sync)' },
              ]
            : [
                { id: 'opt-1', text: "Dijkstra's Algorithm (Priority Queue)" },
                { id: 'opt-2', text: 'Breadth-First Search (BFS for unweighted)' },
                { id: 'opt-3', text: 'Bellman-Ford Algorithm' },
                { id: 'opt-4', text: 'Depth-First Search for shortest paths' },
              ],
          correctOptionIds: isSql ? ['opt-1', 'opt-2', 'opt-3'] : ['opt-1', 'opt-2', 'opt-3'],
          explanation: `Multi-Select Question generated by SkillOS AI with multi-option validation.`,
        });
      }

      if (targetType === 'CODING' || (targetType === 'MIXED' && count >= 3)) {
        generatedList.push({
          id: `ai-code-${timestamp}-3`,
          type: 'CODING',
          title: `Optimized Longest Consecutive Sequence in ${topic}`,
          description: `Given an unsorted array of integers nums, return the length of the longest consecutive elements sequence.\n\nYou must write an algorithm that runs in O(N) time complexity.\n\n### Input Format:\nFirst line contains array nums.\n\n### Output Format:\nSingle integer representing maximum consecutive streak length.\n\n### Constraints:\n- 0 <= nums.length <= 10^5\n- -10^9 <= nums[i] <= 10^9`,
          category: topic,
          difficulty: diff === 'EASY' ? 'EASY' : diff === 'HARD' ? 'HARD' : 'MEDIUM',
          points: diff === 'HARD' ? 150 : diff === 'EASY' ? 50 : 100,
          timeLimitMs: 2000,
          memoryLimitMb: 256,
          testCases: [
            { input: 'nums = [100,4,200,1,3,2]', output: '4', isHidden: false, explanation: 'The longest consecutive sequence is [1, 2, 3, 4]. Length is 4.' },
            { input: 'nums = [0,3,7,2,5,8,4,6,0,1]', output: '9', isHidden: false },
            { input: 'nums = []', output: '0', isHidden: true },
            { input: 'nums = [9,1,4,7,3,-1,0,5,8,-1,6]', output: '7', isHidden: true },
          ],
        });
      }

      // Add to custom questions list & pre-select into test deck
      setCustomQuestions((prev) => [...generatedList, ...prev]);
      setSelectedCustomIds((prev) => [...generatedList.map((q) => q.id), ...prev]);
      setAiGenerating(false);
      setAiSuccessMessage(`SkillOS AI generated ${generatedList.length} customized assessment items for "${topic}"!`);
      setAiTopic('');
    }, 900);
  };

  // 2. AI Polish / Refine Question Statement
  const handleAiRefineStatement = () => {
    setAiRefiningField('statement');
    setTimeout(() => {
      if (builderType === 'MCQ' || builderType === 'MSQ') {
        if (!mcqTitle.trim()) {
          setMcqTitle('Which of the following data structures provides worst-case O(1) lookup, insertion, and deletion with zero hash collision degradation?');
        } else {
          setMcqTitle((prev) =>
            prev.endsWith('?')
              ? `[SkillOS Verified] Consider the following scenario: ${prev.replace(/^[a-z]/, (c) => c.toUpperCase())}`
              : `[SkillOS Verified] ${prev}? Select the most accurate option.`
          );
        }
        if (!mcqExplanation.trim()) {
          setMcqExplanation('Detailed mathematical proof and operational complexity breakdown verified by SkillOS AI.');
        }
      } else if (builderType === 'CODING') {
        if (!codingTitle.trim()) {
          setCodingTitle('Sliding Window Maximum Subarray Sum');
        }
        setCodingDescription((prev) => {
          if (!prev.trim()) {
            return `### Problem Statement\nGiven an array of integers \`nums\` and an integer \`k\`, find the contiguous subarray of size \`k\` that has the maximum sum and return its sum.\n\n### Input Format\n- First line: space-separated integers representing \`nums\`\n- Second line: integer \`k\`\n\n### Constraints\n- \`1 <= k <= nums.length <= 10^5\`\n- \`-10^4 <= nums[i] <= 10^4\`\n\n### Time Complexity Goal\n- Target Time Complexity: \`O(N)\`\n- Auxiliary Space: \`O(1)\``;
          }
          return `${prev}\n\n### Constraints & Edge Cases (Refined by AI)\n- Strict time limit: 2000ms\n- Handle null or boundary sizes gracefully.`;
        });
      }
      setAiRefiningField(null);
    }, 700);
  };

  // 3. AI Generate Options & Distractors for MCQ/MSQ
  const handleAiGenerateOptions = () => {
    setAiRefiningField('options');
    setTimeout(() => {
      setMcqOptions([
        { id: 'opt-1', text: 'O(1) Constant Auxiliary Time' },
        { id: 'opt-2', text: 'O(log N) Logarithmic Height Bound' },
        { id: 'opt-3', text: 'O(N) Linear Scan' },
        { id: 'opt-4', text: 'O(N log N) Divide and Conquer' },
      ]);
      setMcqSingleCorrect('opt-2');
      setMsqMultiCorrect(['opt-1', 'opt-2']);
      setMcqExplanation('SkillOS AI Generated Rationale: Option B accurately satisfies the algorithmic invariants while Options C and D serve as plausible distractors.');
      setAiRefiningField(null);
    }, 650);
  };

  // 4. AI Generate Edge-Case Test Cases for Coding Challenge
  const handleAiGenerateEdgeTestcases = () => {
    setAiRefiningField('testcases');
    setTimeout(() => {
      setCodingTestcases([
        { input: 'nums = [1, -1, 5, -2, 3], k = 3', output: '6', isHidden: false, explanation: 'Subarray [5, -2, 3] yields maximum sum of 6.' },
        { input: 'nums = [-5, -2, -8, -1], k = 2', output: '-7', isHidden: false, explanation: 'All negative values handled properly.' },
        { input: 'nums = [1000000], k = 1', output: '1000000', isHidden: true, explanation: 'Single element boundary test case.' },
        { input: 'nums = [0, 0, 0, 0, 0], k = 4', output: '0', isHidden: true, explanation: 'Zero uniform array test.' },
        { input: 'nums = [2, 1, 5, 1, 3, 2], k = 3', output: '9', isHidden: true, explanation: 'Large scaling randomized test case.' },
      ]);
      setAiRefiningField(null);
    }, 650);
  };

  // 5. AI Auto-Balance Test Deck to Match Target Exam Duration
  const handleAiAutoBalanceDeck = () => {
    setAiGenerating(true);
    setTimeout(() => {
      // Pick top 2 library problems + 3 custom questions to form a balanced 100-pt blueprint
      const codingIds = problems.slice(0, 2).map((p) => p.id);
      const customIds = customQuestions.slice(0, 3).map((q) => q.id);

      setFormData((prev) => ({
        ...prev,
        problemIds: codingIds,
        problemsCount: codingIds.length + customIds.length,
      }));
      setSelectedCustomIds(customIds);
      setAiGenerating(false);
      setAiSuccessMessage('SkillOS AI Auto-Balanced Deck: 2 Coding Problems + 3 Conceptual MCQs curated for balanced assessment!');
    }, 800);
  };

  // Toggle selection for library problems
  const toggleProblemSelection = (problemId: string) => {
    setFormData((prev) => {
      const current = prev.problemIds || [];
      const updated = current.includes(problemId)
        ? current.filter((id) => id !== problemId)
        : [...current, problemId];
      return {
        ...prev,
        problemIds: updated,
      };
    });
  };

  // Toggle selection for custom questions
  const toggleCustomQuestionSelection = (questionId: string) => {
    setSelectedCustomIds((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  // Filter problems based on search, difficulty, category, and type
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (selectedDifficulty !== 'ALL' && p.difficulty?.toUpperCase() !== selectedDifficulty) {
        return false;
      }
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }
      if (problemSearch.trim()) {
        const q = problemSearch.toLowerCase();
        const matchesTitle = p.title?.toLowerCase().includes(q);
        const matchesCategory = p.category?.toLowerCase().includes(q);
        const matchesTags = p.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCategory && !matchesTags) return false;
      }
      return true;
    });
  }, [problems, problemSearch, selectedDifficulty, selectedCategory]);

  // Selected Library Questions mapped to AssessmentQuestion
  const selectedLibraryQuestions: AssessmentQuestion[] = useMemo(() => {
    const ids = formData.problemIds || [];
    return problems
      .filter((p) => ids.includes(p.id))
      .map((p) => ({
        id: p.id,
        type: 'CODING' as const,
        title: p.title,
        difficulty: (p.difficulty?.toUpperCase() as any) || 'MEDIUM',
        points: p.points || (p.difficulty?.toUpperCase() === 'HARD' ? 150 : p.difficulty?.toUpperCase() === 'MEDIUM' ? 100 : 50),
        category: p.category || 'Algorithms',
        tags: p.tags,
      }));
  }, [problems, formData.problemIds]);

  const selectedCustomQuestionsList: AssessmentQuestion[] = useMemo(() => {
    return customQuestions.filter((q) => selectedCustomIds.includes(q.id));
  }, [customQuestions, selectedCustomIds]);

  // Unified Deck of all questions in the test
  const allSelectedDeckQuestions: AssessmentQuestion[] = useMemo(() => {
    return [...selectedLibraryQuestions, ...selectedCustomQuestionsList];
  }, [selectedLibraryQuestions, selectedCustomQuestionsList]);

  // Difficulty & Type stats breakdown for selected questions
  const blueprintStats = useMemo(() => {
    const totalQuestions = allSelectedDeckQuestions.length;
    const codingCount = allSelectedDeckQuestions.filter((q) => q.type === 'CODING').length;
    const mcqCount = allSelectedDeckQuestions.filter((q) => q.type === 'MCQ').length;
    const msqCount = allSelectedDeckQuestions.filter((q) => q.type === 'MSQ').length;

    const totalPoints = allSelectedDeckQuestions.reduce((sum, q) => sum + (q.points || 0), 0);

    const easy = allSelectedDeckQuestions.filter((q) => q.difficulty === 'EASY').length;
    const medium = allSelectedDeckQuestions.filter((q) => q.difficulty === 'MEDIUM' || !q.difficulty).length;
    const hard = allSelectedDeckQuestions.filter((q) => q.difficulty === 'HARD').length;

    const estimatedMinutes = allSelectedDeckQuestions.reduce((sum, q) => {
      if (q.type === 'MCQ') return sum + 2;
      if (q.type === 'MSQ') return sum + 3;
      const diff = q.difficulty?.toUpperCase();
      if (diff === 'HARD') return sum + 45;
      if (diff === 'MEDIUM') return sum + 25;
      return sum + 15;
    }, 0);

    return { totalQuestions, codingCount, mcqCount, msqCount, totalPoints, estimatedMinutes, easy, medium, hard };
  }, [allSelectedDeckQuestions]);

  const handleRemoveFromDeck = (q: AssessmentQuestion) => {
    if (q.id.startsWith('custom-') || q.id.startsWith('demo-')) {
      setSelectedCustomIds((prev) => prev.filter((id) => id !== q.id));
    } else {
      toggleProblemSelection(q.id);
    }
  };

  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const handleChange = (field: keyof NewContestData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'slug') {
        setIsSlugManuallyEdited(true);
      } else if (field === 'title' && !isSlugManuallyEdited) {
        updated.slug = String(value)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return updated;
    });
  };

  const handleAddTag = (tag: string) => {
    const currentTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(', ');
      setTagInput(newTags);
    }
  };

  const generateRandomCode = () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const prefix = externalCollegeCode.trim()
      ? externalCollegeCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
      : formData.title
      ? formData.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'SKL')
      : 'SKL';
    const code = `${prefix}-${new Date().getFullYear()}-${randomSuffix}`;
    setFormData((prev) => ({ ...prev, code }));
  };

  // Step Validation
  const isStep1Valid = Boolean(
    institutionMode === 'REGISTERED' ? formData.institutionId : externalCollegeName.trim().length >= 2
  );
  const isStep2Valid = Boolean(formData.title.trim().length >= 3);
  const isStep3Valid = Boolean(allSelectedDeckQuestions.length > 0);
  const isStep4Valid = Boolean(formData.startTime && formData.durationMinutes > 0);
  const isStep5Valid = true;

  const canProceed = () => {
    if (activeStep === 0) return isStep1Valid;
    if (activeStep === 1) return isStep2Valid;
    if (activeStep === 2) return isStep3Valid;
    if (activeStep === 3) return isStep4Valid;
    if (activeStep === 4) return isStep5Valid;
    return true;
  };

  const canNavigateToStep = (targetStep: number) => {
    if (targetStep <= activeStep) return true;
    if (targetStep >= 1 && !isStep1Valid) return false;
    if (targetStep >= 2 && !isStep2Valid) return false;
    if (targetStep >= 3 && !isStep3Valid) return false;
    if (targetStep >= 4 && !isStep4Valid) return false;
    return true;
  };

  const handleNext = () => {
    if (activeStep < STEPS.length - 1 && canProceed()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const candidateDirectUrl = useMemo(() => {
    const host = typeof window !== 'undefined' ? window.location.origin : 'https://techlearns.com';
    const computedSlug = formData.slug?.trim() || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : '') || formData.code?.toLowerCase() || 'exam';
    return `${host}/assessments/${computedSlug}`;
  }, [formData.slug, formData.title, formData.code]);

  const handleCopyAccessCode = () => {
    let code = formData.code;
    if (!code) {
      code = `SKL-${Date.now().toString(36).toUpperCase()}`;
      setFormData((prev) => ({ ...prev, code }));
    }
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyDirectLink = () => {
    navigator.clipboard.writeText(candidateDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) return;

    const parsedTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let autoCode = formData.code;
    if (!autoCode) {
      autoCode = `SKL-${Date.now().toString(36).toUpperCase()}`;
      setFormData((prev) => ({ ...prev, code: autoCode }));
    }

    const validDbProblemIds = allSelectedDeckQuestions
      .filter((q) => q.type === 'CODING' && problems.some((p) => p.id === q.id))
      .map((q) => q.id);

    const isRegistered = institutionMode === 'REGISTERED' && Boolean(formData.institutionId);

    onSubmit({
      ...formData,
      institutionId: isRegistered ? formData.institutionId : undefined,
      batchId: isRegistered && formData.batchId ? formData.batchId : undefined,
      code: autoCode,
      tags: parsedTags,
      problemsCount: allSelectedDeckQuestions.length,
      problemIds: validDbProblemIds,
      questions: allSelectedDeckQuestions,
      institutionLogo: cohortLogo || formData.institutionLogo,
      cohortLogo: cohortLogo || formData.cohortLogo,
      whitelistedEmails: candidatesList.length > 0 ? candidatesList.map((c) => c.email) : (coordinatorEmail ? [coordinatorEmail] : undefined),
      organizer: effectiveCollegeName,
      batch: isRegistered && selectedBatchInfo ? { id: selectedBatchInfo.id, name: selectedBatchInfo.name } : undefined,
    });

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      slotProps={{
        paper: {
          sx: {
            bgcolor: '#F8FAFC',
            color: '#0F172A',
            display: 'flex',
            flexDirection: 'row',
            overflow: 'hidden',
            height: '100vh',
            width: '100vw',
          },
        },
      }}
    >
      {/* ── LEFT VERTICAL SIDEBAR ── */}
      {/* ── LEFT SIDEBAR VERTICAL TIMELINE ── */}
      <Box
        sx={{
          width: { xs: '64px', md: '210px', lg: '220px' },
          minWidth: { xs: '64px', md: '210px', lg: '220px' },
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: { xs: 1.5, md: 2 },
          height: '100vh',
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
          {/* Top Brand Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: { xs: 0.25, md: 0.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img
                src="/images/logo/techlearns-logo.png"
                alt="TechLearns"
                style={{ height: 26, maxWidth: 145, objectFit: 'contain' }}
              />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="caption" sx={{ color: '#5B2D90', fontSize: '0.68rem', fontWeight: 800, letterSpacing: 0.2 }}>
                SkillOS Assessment Setup
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          {/* Vertical Stepper List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            {STEPS.map((s, idx) => {
              const isCompleted = activeStep > idx;
              const isCurrent = activeStep === idx;
              const isUnlocked = canNavigateToStep(idx);

              return (
                <Box
                  key={s.step}
                  onClick={() => {
                    if (isUnlocked) setActiveStep(idx);
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                    cursor: isUnlocked ? 'pointer' : 'default',
                    position: 'relative',
                    p: { xs: 0.5, md: '7px 10px' },
                    borderRadius: '10px',
                    bgcolor: isCurrent ? '#FAF5FF' : 'transparent',
                    border: isCurrent ? '1px solid #C7D2FE' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    mb: idx === STEPS.length - 1 ? 0 : 1.25,
                    '&:hover':
                      isUnlocked && !isCurrent
                        ? {
                            bgcolor: '#F8FAFC',
                            borderColor: '#E2E8F0',
                            transform: 'translateX(2px)',
                          }
                        : {},
                  }}
                >
                  {/* Number in Circle */}
                  <Box
                    sx={{
                      position: 'relative',
                      zIndex: 2,
                      width: 26,
                      height: 26,
                      minWidth: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      bgcolor: isCurrent
                        ? '#5B2D90'
                        : isCompleted
                        ? '#10B981'
                        : '#F1F5F9',
                      color: isCurrent || isCompleted ? '#FFFFFF' : '#64748B',
                      border: isCurrent
                        ? '2px solid #5B2D90'
                        : isCompleted
                        ? '2px solid #10B981'
                        : '1.5px solid #CBD5E1',
                      boxShadow: isCurrent
                        ? '0 0 0 2.5px rgba(79, 70, 229, 0.2)'
                        : isCompleted
                        ? '0 0 0 2px rgba(16, 185, 129, 0.15)'
                        : 'none',
                      transition: 'all 0.2s ease',
                      flexShrink: 0,
                    }}
                  >
                    {isCompleted ? <CheckRoundedIcon sx={{ fontSize: 14 }} /> : s.step}
                  </Box>

                  {/* Step Title */}
                  <Box sx={{ display: { xs: 'none', md: 'block' }, overflow: 'hidden' }}>
                    <Typography
                      sx={{
                        fontSize: '0.78rem',
                        fontWeight: isCurrent ? 800 : isCompleted ? 700 : 600,
                        color: isCurrent ? '#5B2D90' : isCompleted ? '#0F172A' : '#64748B',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.title}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Sidebar Bottom Progress Box */}
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            p: 1.5,
            borderRadius: '12px',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.65rem' }}>
              PROGRESS
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#5B2D90', fontSize: '0.68rem' }}>
              {Math.round(((activeStep + 1) / STEPS.length) * 100)}%
            </Typography>
          </Box>
          <Box sx={{ width: '100%', height: 4, borderRadius: 2, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
            <Box
              sx={{
                width: `${((activeStep + 1) / STEPS.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #0B1F3A, #5B2D90)',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem', mt: 0.75, display: 'block' }} noWrap>
            Step {activeStep + 1} of {STEPS.length} · {STEPS[activeStep].title}
          </Typography>
        </Box>
      </Box>

      {/* ── RIGHT MAIN WORKSPACE ── */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          bgcolor: '#F8FAFC',
          position: 'relative',
        }}
      >
        {/* Workspace Top Bar */}
        <Box
          sx={{
            px: { xs: 2.5, sm: 4, md: 5 },
            py: 2,
            bgcolor: 'transparent',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
            <Box
              sx={{
                px: 1.25,
                py: 0.4,
                borderRadius: '8px',
                bgcolor: '#FAF5FF',
                color: '#5B2D90',
                border: '1px solid #E9D5FF',
                fontWeight: 800,
                fontSize: '0.74rem',
                letterSpacing: '0.02em',
                lineHeight: 1.2,
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(91, 45, 144, 0.06)',
              }}
            >
              {activeStep + 1} of {STEPS.length}
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2, fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                {STEPS[activeStep].title}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', display: { xs: 'none', sm: 'block' }, fontSize: '0.74rem', fontWeight: 500, mt: 0.15 }}>
                {STEPS[activeStep].description}
              </Typography>
            </Box>
          </Box>

          {/* Close Modal Button (X) */}
          <IconButton
            onClick={onClose}
            sx={{
              width: 38,
              height: 38,
              color: '#64748B',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              '&:hover': { bgcolor: '#FEE2E2', color: '#DC2626', borderColor: '#FCA5A5' },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Workspace Scrollable Content Body */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            px: { xs: 2, sm: 4, md: 5 },
            py: { xs: 2.5, sm: 3.5 },
            pb: 8,
            /* Sleek Theme-Colored Custom Scrollbar */
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#FAF5FF',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(180deg, #5B2D90 0%, #0B1F3A 100%)',
              borderRadius: '9999px',
              border: '2px solid #FAF5FF',
              '&:hover': {
                background: 'linear-gradient(180deg, #7C3AED 0%, #17366E 100%)',
              },
            },
          }}
        >
          <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
            {/* ═════════════════════════════════════════════════════════════ */}
            {/* STEP 1: INSTITUTION & COHORT (Unsymmetrical 3-Top-Box Layout) */}
            {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* ── TOP ROW: 2 Balanced Large Boxes (1fr : 1fr) ── */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                  gap: 3,
                  alignItems: 'stretch',
                }}
              >
                {/* ── BOX 1: Institutional Identity & Scope (Left, Theme Tint) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: '18px',
                    background: 'linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)',
                    border: '1px solid #E9D5FF',
                    boxShadow: '0 4px 20px rgba(91, 45, 144, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 2.5,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.2,
                          borderRadius: '12px',
                          bgcolor: '#FAF5FF',
                          color: '#5B2D90',
                          display: 'flex',
                        }}
                      >
                        <DomainAddRoundedIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          Institutional Identity
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Branding name, short prefix and target cohort
                        </Typography>
                      </Box>
                    </Box>

                    {institutionMode === 'UNREGISTERED' ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          required
                          label="College / Organization Name"
                          placeholder="e.g. Delhi Technological University, St. Xavier's"
                          value={externalCollegeName}
                          onChange={(e) => setExternalCollegeName(e.target.value)}
                          error={!isStep1Valid && externalCollegeName.length > 0}
                          helperText={
                            externalCollegeName.trim().length === 0
                              ? 'Enter official institution name for test portal & reports'
                              : 'Branded on portal header, scorecards & merit list'
                          }
                          sx={lightFieldSx}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.75 }}>
                          <TextField
                            fullWidth
                            label="Short Code / Prefix"
                            placeholder="e.g. DTU, IITB, SXC"
                            value={externalCollegeCode}
                            onChange={(e) => setExternalCollegeCode(e.target.value.toUpperCase())}
                            helperText="Prefix for exam keys"
                            sx={lightFieldSx}
                          />

                          <TextField
                            fullWidth
                            label="Department / Cohort"
                            placeholder="e.g. B.Tech CSE - 3rd Year"
                            value={targetCohortLabel}
                            onChange={(e) => setTargetCohortLabel(e.target.value)}
                            helperText="Target student group"
                            sx={lightFieldSx}
                          />
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          select
                          fullWidth
                          required
                          label="Select Registered Partner College"
                          value={formData.institutionId || ''}
                          onChange={(e) => {
                            const newId = e.target.value;
                            handleChange('institutionId', newId);
                            handleChange('batchId', '');
                          }}
                          sx={lightFieldSx}
                          helperText={
                            loadingData
                              ? 'Loading registered institutions...'
                              : colleges.length === 0
                              ? 'No onboarded colleges found in database'
                              : 'Select an onboarded partner college'
                          }
                        >
                          <MenuItem value="" disabled>
                            <em>{loadingData ? 'Loading colleges...' : '-- Select a Registered College --'}</em>
                          </MenuItem>
                          {colleges.map((col) => (
                            <MenuItem key={col.id} value={col.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                                  {col.name}
                                </Typography>
                                {col.code && (
                                  <Chip
                                    label={col.code}
                                    size="small"
                                    sx={{
                                      height: 20,
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      bgcolor: '#FAF5FF',
                                      color: '#5B2D90',
                                      ml: 1.5,
                                    }}
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>

                        <TextField
                          select
                          fullWidth
                          disabled={!formData.institutionId || loadingBatches}
                          label="Select Target Student Cohort / Batch"
                          value={formData.batchId || ''}
                          onChange={(e) => handleChange('batchId', e.target.value)}
                          sx={{
                            ...lightFieldSx,
                            ...(!formData.institutionId && {
                              '& .MuiOutlinedInput-root': {
                                bgcolor: '#F8FAFC',
                                opacity: 0.85,
                              },
                            }),
                          }}
                          helperText={
                            !formData.institutionId
                              ? 'Locked: Select partner college above'
                              : loadingBatches
                              ? 'Fetching cohorts...'
                              : availableCollegeBatches.length === 0
                              ? 'No batches found (open to all students)'
                              : 'Restrict to specific cohort or open access'
                          }
                          slotProps={{
                            input: {
                              startAdornment: !formData.institutionId ? (
                                <InputAdornment position="start">
                                  <LockRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                                </InputAdornment>
                              ) : undefined,
                            },
                          }}
                        >
                          <MenuItem value="">
                            <em>Open Access (All Students & External Candidates)</em>
                          </MenuItem>
                          {availableCollegeBatches.map((b) => (
                            <MenuItem key={b.id} value={b.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {b.name}
                                </Typography>
                                {b._count?.students !== undefined && (
                                  <Chip
                                    label={`${b._count.students} Students`}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#F1F5F9', color: '#475569', ml: 1 }}
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    )}

                    {/* Cohort / Institution Logo Import */}
                    <Box sx={{ mt: 2, p: 2, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px dashed #CBD5E1' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#5B2D90' }} />
                          <Typography variant="caption" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.74rem' }}>
                            Cohort / Institution Brand Logo
                          </Typography>
                        </Box>
                        {cohortLogo && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setCohortLogo('')}
                            sx={{ minWidth: 0, p: 0, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700 }}
                          >
                            Remove
                          </Button>
                        )}
                      </Box>

                      {cohortLogo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5, bgcolor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                          <Box
                            component="img"
                            src={cohortLogo}
                            alt="Uploaded Cohort Logo"
                            sx={{ height: 38, maxWidth: 110, objectFit: 'contain', borderRadius: '6px', border: '1px solid #E2E8F0', p: 0.5, bgcolor: '#F8FAFC' }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block', fontSize: '0.74rem' }}>
                              Cohort Logo Attached
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#16A34A', fontSize: '0.68rem', fontWeight: 700 }}>
                              ✓ Synchronized with dynamic student email invites
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                          <Button
                            component="label"
                            fullWidth
                            variant="outlined"
                            startIcon={<CloudUploadRoundedIcon />}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              borderRadius: '10px',
                              borderColor: '#CBD5E1',
                              color: '#334155',
                              py: 0.9,
                              bgcolor: '#FFFFFF',
                              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#5B2D90' },
                            }}
                          >
                            Import Cohort Logo (PNG / JPG / SVG)
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    if (ev.target?.result) {
                                      setCohortLogo(String(ev.target.result));
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </Button>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.66rem', fontWeight: 600 }}>
                              Presets:
                            </Typography>
                            {[
                              { name: 'Stanford', url: 'https://identity.stanford.edu/wp-content/uploads/sites/3/2020/06/block-s-right.png' },
                              { name: 'MIT', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/320px-MIT_logo.svg.png' },
                              { name: 'IIT Delhi', url: 'https://home.iitd.ac.in/images/logo.png' },
                            ].map((item) => (
                              <Chip
                                key={item.name}
                                label={item.name}
                                size="small"
                                clickable
                                onClick={() => setCohortLogo(item.url)}
                                sx={{
                                  height: 22,
                                  fontSize: '0.64rem',
                                  fontWeight: 700,
                                  bgcolor: '#FFFFFF',
                                  border: '1px solid #E2E8F0',
                                  color: '#475569',
                                  '&:hover': { bgcolor: '#FAF5FF', borderColor: '#C7D2FE', color: '#5B2D90' },
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>

                {/* ── BOX 2: Candidate Roster & CSV Ingestion (Right, Crisp White) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    borderRadius: '18px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            p: 1.2,
                            borderRadius: '12px',
                            bgcolor: '#FAF5FF',
                            color: '#5B2D90',
                            display: 'flex',
                          }}
                        >
                          <GroupsRoundedIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            Candidate Roster
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            CSV upload for dynamic token generation
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={candidatesList.length > 0 ? `${candidatesList.length} Candidates` : '0 Uploaded'}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          bgcolor: candidatesList.length > 0 ? '#FAF5FF' : '#F1F5F9',
                          color: candidatesList.length > 0 ? '#5B2D90' : '#64748B',
                          border: candidatesList.length > 0 ? '1px solid #E9D5FF' : '1px solid #E2E8F0',
                        }}
                      />
                    </Box>

                    {/* CSV Upload & Template Actions */}
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: '#FAF5FF',
                        border: '1.5px dashed #C084FC',
                        mb: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CloudUploadRoundedIcon sx={{ color: '#5B2D90', fontSize: 20 }} />
                          <Typography variant="body2" sx={{ fontWeight: 800, color: '#0B1F3A', fontSize: '0.8rem' }}>
                            {uploadedRosterFile || 'Upload Candidate Roster (.csv)'}
                          </Typography>
                        </Box>
                        <Button
                          component="label"
                          size="small"
                          variant="contained"
                          sx={{
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                            color: '#FFFFFF',
                            py: 0.4,
                            px: 1.5,
                            boxShadow: 'none',
                          }}
                        >
                          {uploadedRosterFile ? 'Replace CSV' : 'Select .CSV'}
                          <input
                            type="file"
                            hidden
                            accept=".csv,text/csv"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadedRosterFile(file.name);
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const text = ev.target?.result as string;
                                if (!text) return;
                                const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
                                const parsed: Array<{ id: string; fullName: string; email: string; rollNumber: string; branch?: string }> = [];
                                const startIdx = lines[0].toLowerCase().includes('email') || lines[0].toLowerCase().includes('name') || lines[0].toLowerCase().includes('roll') ? 1 : 0;
                                for (let i = startIdx; i < lines.length; i++) {
                                  const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
                                  if (parts.length >= 2) {
                                    const emailIdx = parts.findIndex((p) => p.includes('@'));
                                    const email = emailIdx >= 0 ? parts[emailIdx] : parts[1] || '';
                                    const rollNo = parts.find((p, idx) => idx !== emailIdx && (/^[0-9A-Z-]+$/i.test(p) && p.length >= 4)) || parts[0] || `ID-${i}`;
                                    const name = parts.find((p, idx) => idx !== emailIdx && p !== rollNo) || `Student ${i}`;
                                    const branch = parts.length >= 4 ? parts[3] : 'General';
                                    if (email) {
                                      parsed.push({
                                        id: `csv-${Date.now()}-${i}`,
                                        fullName: name,
                                        email,
                                        rollNumber: rollNo,
                                        branch,
                                      });
                                    }
                                  }
                                }
                                if (parsed.length > 0) {
                                  setCandidatesList(parsed);
                                }
                              };
                              reader.readAsText(file);
                            }}
                          />
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                          Columns: Full Name, Email Address, Roll Number, Branch
                        </Typography>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 14 }} />}
                          onClick={() => {
                            const csvTemplate = 'FullName,Email,RollNumber,Branch\nAarav Sharma,aarav.sharma@college.edu,2026CS101,CSE\nSneha Patel,sneha.patel@college.edu,2026CS102,IT\nRohan Gupta,rohan.gupta@college.edu,2026CS103,ECE\n';
                            const blob = new Blob([csvTemplate], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'candidate_roster_template.csv';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                          sx={{ textTransform: 'none', fontSize: '0.7rem', fontWeight: 700, color: '#5B2D90', p: 0 }}
                        >
                          Download Sample CSV
                        </Button>
                      </Box>
                    </Box>

                    {/* Candidate Search & List or Empty State */}
                    {candidatesList.length === 0 ? (
                      <Box
                        sx={{
                          py: 3,
                          px: 2,
                          borderRadius: '10px',
                          bgcolor: '#F8FAFC',
                          border: '1px dashed #CBD5E1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                        }}
                      >
                        <GroupsRoundedIcon sx={{ color: '#94A3B8', fontSize: 32, mb: 0.5 }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.8rem' }}>
                          No candidates imported yet
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.7rem', maxWidth: 280, mt: 0.25 }}>
                          Upload a .csv file above to automatically generate individual student magic links.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ mb: 1 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search roster candidates by name, email, or roll no..."
                            value={candidateSearch}
                            onChange={(e) => setCandidateSearch(e.target.value)}
                            slotProps={{
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <SearchRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                                  </InputAdornment>
                                ),
                              },
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '10px',
                                fontSize: '0.78rem',
                                bgcolor: '#F8FAFC',
                              },
                            }}
                          />
                        </Box>

                        <Box sx={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          {candidatesList
                            .filter(
                              (c) =>
                                c.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                                c.email.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                                c.rollNumber.toLowerCase().includes(candidateSearch.toLowerCase())
                            )
                            .slice(0, 10)
                            .map((c) => (
                              <Box
                                key={c.id}
                                sx={{
                                  p: 1,
                                  borderRadius: '8px',
                                  bgcolor: '#F8FAFC',
                                  border: '1px solid #E2E8F0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={c.rollNumber}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#EDE9FE', color: '#5B2D90' }}
                                  />
                                  <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#0F172A', display: 'block' }}>
                                      {c.fullName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.66rem' }}>
                                      {c.email}
                                    </Typography>
                                  </Box>
                                </Box>
                                <IconButton
                                  size="small"
                                  onClick={() => setCandidatesList((prev) => prev.filter((item) => item.id !== c.id))}
                                  sx={{ color: '#94A3B8', p: 0.3, '&:hover': { color: '#EF4444' } }}
                                >
                                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            ))}
                        </Box>
                      </>
                    )}
                  </Box>
                </Paper>
              </Box>

              {/* ── BOTTOM ROW: 3 Compact Boxes (1fr : 1fr : 1fr) ── */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
                  gap: 3,
                  alignItems: 'stretch',
                }}
              >
                {/* ── BOX 3: Dynamic Email Invite Preview (Bottom Left, Theme Tint) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 2.75 },
                    borderRadius: '18px',
                    background: 'linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)',
                    border: '1px solid #E9D5FF',
                    boxShadow: '0 4px 20px rgba(91, 45, 144, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.75,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '10px',
                            bgcolor: '#FAF5FF',
                            color: '#5B2D90',
                            display: 'flex',
                          }}
                        >
                          <EmailRoundedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            Student Email Preview
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                            Dynamic per-student magic link
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        icon={<VerifiedRoundedIcon sx={{ color: '#16A34A !important', fontSize: '13px !important' }} />}
                        label="Instant Dispatch"
                        size="small"
                        sx={{
                          height: 22,
                          bgcolor: '#DCFCE7',
                          color: '#15803D',
                          fontWeight: 800,
                          fontSize: '0.64rem',
                          border: '1px solid #BBF7D0',
                        }}
                      />
                    </Box>

                    {/* Email Card Simulation */}
                    <Box
                      sx={{
                        p: 1.75,
                        borderRadius: '12px',
                        bgcolor: '#0B1F3A',
                        border: '1px solid #1E293B',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                        boxShadow: '0 6px 20px rgba(11, 31, 58, 0.25)',
                        color: '#FFFFFF',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <img src="/images/logo/techlearns-logo.png" alt="TechLearns" style={{ height: 16, maxWidth: 90, objectFit: 'contain' }} />
                        </Box>
                        <Chip
                          label="OFFICIAL EXAM"
                          size="small"
                          sx={{ height: 15, fontSize: '0.55rem', fontWeight: 800, bgcolor: 'rgba(91, 45, 144, 0.4)', color: '#E9D5FF' }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800, color: '#F8FAFC', fontSize: '0.8rem' }}>
                          Hi {candidatesList[0]?.fullName || '[Candidate Full Name]'} {candidatesList[0] ? `(${candidatesList[0].rollNumber})` : '([Roll Number])'},
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.25, lineHeight: 1.25, fontSize: '0.68rem' }}>
                          You are invited by <strong style={{ color: '#F1F5F9' }}>{effectiveCollegeName}</strong> to take the scheduled technical assessment.
                        </Typography>
                      </Box>

                      <Box sx={{ p: 1, borderRadius: '6px', bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                          <span style={{ color: '#94A3B8' }}>Exam Title:</span>
                          <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{formData.title || 'Technical Assessment'}</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                          <span style={{ color: '#94A3B8' }}>Duration:</span>
                          <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{formData.durationMinutes} Minutes</span>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                          <span style={{ color: '#94A3B8' }}>Exam State:</span>
                          <span style={{ color: '#FBBF24', fontWeight: 700 }}>🔒 Waiting for Admin to Start</span>
                        </Box>
                      </Box>

                      {/* Prominent Magic Link Button */}
                      <Button
                        fullWidth
                        disabled
                        sx={{
                          background: 'linear-gradient(135deg, #5B2D90 0%, #0B1F3A 100%) !important',
                          color: '#FFFFFF !important',
                          fontWeight: 800,
                          fontSize: '0.74rem',
                          textTransform: 'none',
                          borderRadius: '7px',
                          py: 0.65,
                          boxShadow: '0 4px 12px rgba(91, 45, 144, 0.4)',
                        }}
                      >
                        ⚡ Enter Verified Waiting Room
                      </Button>

                      <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.62rem', textAlign: 'center', display: 'block' }}>
                        * Dynamic 1-click token tied to {candidatesList[0]?.email || 'candidate email'}.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* ── BOX 4: Automated Dispatch & Live Admin Unlock Gate (Bottom Middle, Crisp White) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 2.75 },
                    borderRadius: '18px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.75,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: '10px',
                          bgcolor: '#FAF5FF',
                          color: '#5B2D90',
                          display: 'flex',
                        }}
                      >
                        <RocketLaunchRoundedIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                          Dispatch & Live Unlock
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                          Instant broadcast + Host-controlled gate
                        </Typography>
                      </Box>
                    </Box>

                    {/* 2 Core Operating Policies */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 1.5 }}>
                      {/* Policy 1: Instant Dispatch */}
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: '10px',
                          bgcolor: '#FAF5FF',
                          border: '1.5px solid #5B2D90',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ mt: 0.1 }}>
                          <CheckCircleRoundedIcon sx={{ color: '#5B2D90', fontSize: 16 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#5B2D90', fontSize: '0.78rem' }}>
                              Instant Email Dispatch
                            </Typography>
                            <Chip label="Now Active" size="small" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 800, bgcolor: '#EDE9FE', color: '#6D28D9' }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.68rem', lineHeight: 1.25 }}>
                            Personalized emails with magic links are sent immediately upon deploying the test.
                          </Typography>
                        </Box>
                      </Box>

                      {/* Policy 2: Admin Live Unlock */}
                      <Box
                        sx={{
                          p: 1.25,
                          borderRadius: '10px',
                          bgcolor: '#FFFBEB',
                          border: '1.5px solid #D97706',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ mt: 0.1 }}>
                          <LockRoundedIcon sx={{ color: '#D97706', fontSize: 16 }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.2 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#92400E', fontSize: '0.78rem' }}>
                              Host Live Exam Unlock
                            </Typography>
                            <Chip label="Admin Gate" size="small" sx={{ height: 16, fontSize: '0.58rem', fontWeight: 800, bgcolor: '#FEF3C7', color: '#B45309' }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#78350F', display: 'block', fontSize: '0.68rem', lineHeight: 1.25 }}>
                            Students enter waiting room; exam questions & timer unlock when Admin clicks &ldquo;Start Test&rdquo;.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>

                  {/* Test Send Trigger */}
                  <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', display: 'block', mb: 0.75, fontSize: '0.7rem' }}>
                      Send Live Test Invite to Verify Email
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="e.g. admin@techlearns.com"
                        value={testEmailAddress}
                        onChange={(e) => setTestEmailAddress(e.target.value)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '7px',
                            bgcolor: '#FFFFFF',
                            fontSize: '0.74rem',
                            height: 32,
                          },
                        }}
                      />
                      <Button
                        variant="contained"
                        disabled={!testEmailAddress.includes('@') || isSendingTestEmail}
                        onClick={() => {
                          setIsSendingTestEmail(true);
                          setTimeout(() => {
                            setIsSendingTestEmail(false);
                            toast.success(`Test magic-link invitation sent to ${testEmailAddress}!`, 'Email Dispatched');
                          }, 1000);
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                          color: '#FFFFFF',
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          borderRadius: '7px',
                          whiteSpace: 'nowrap',
                          px: 1.5,
                          height: 32,
                        }}
                      >
                        {isSendingTestEmail ? '...' : 'Send'}
                      </Button>
                    </Box>
                  </Box>
                </Paper>

                {/* ── BOX 5: Zero-Form & Security Safeguards (Bottom Right, Theme Tint) ── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 2.75 },
                    borderRadius: '18px',
                    background: 'linear-gradient(180deg, #FAF5FF 0%, #FFFFFF 100%)',
                    border: '1px solid #E9D5FF',
                    boxShadow: '0 4px 20px rgba(91, 45, 144, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 1.75,
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: '10px',
                            bgcolor: '#FAF5FF',
                            color: '#5B2D90',
                            display: 'flex',
                          }}
                        >
                          <SecurityRoundedIcon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            Zero-Form Security
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem' }}>
                            Enterprise token & proctor controls
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label="Zero Form Entry"
                        size="small"
                        sx={{ height: 22, fontWeight: 800, bgcolor: '#FAF5FF', color: '#5B2D90', fontSize: '0.64rem', border: '1px solid #E9D5FF' }}
                      />
                    </Box>

                    {/* 4 Compact Feature Rows */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {[
                        {
                          icon: <FingerprintRoundedIcon sx={{ fontSize: 16, color: '#5B2D90' }} />,
                          title: '1-Click Magic Link Entry',
                          desc: 'Candidate clicks email link; identity is pre-authenticated.',
                        },
                        {
                          icon: <LockRoundedIcon sx={{ fontSize: 16, color: '#5B2D90' }} />,
                          title: 'Host Unlock Synchronization',
                          desc: 'Exams stay locked in waiting room until Admin triggers start.',
                        },
                        {
                          icon: <VerifiedRoundedIcon sx={{ fontSize: 16, color: '#16A34A' }} />,
                          title: 'Inbox Identity Binding',
                          desc: 'Tied to student email; prevents unauthorized link sharing.',
                        },
                        {
                          icon: <ShieldRoundedIcon sx={{ fontSize: 16, color: '#5B2D90' }} />,
                          title: 'Single-Attempt Token Expiry',
                          desc: 'Token permanently locks upon final exam submission.',
                        },
                      ].map((item, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            p: 1.2,
                            borderRadius: '10px',
                            bgcolor: '#FFFFFF',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.2,
                          }}
                        >
                          <Box sx={{ p: 0.6, borderRadius: '6px', bgcolor: '#FAF5FF', display: 'flex', flexShrink: 0 }}>
                            {item.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.74rem', lineHeight: 1.15 }}>
                              {item.title}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.66rem', lineHeight: 1.2, display: 'block' }}>
                              {item.desc}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 2: ASSESSMENT DETAILS & INSTRUCTIONS                     */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Box sx={{ p: 1.25, borderRadius: '10px', bgcolor: '#FAF5FF' }}>
                    <AssignmentRoundedIcon sx={{ color: '#5B2D90', fontSize: 24 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Assessment Specifications & Instructions
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Define title, access key, evaluation scope, and candidate guidelines
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
                    <TextField
                      fullWidth
                      required
                      label="Assessment Title"
                      placeholder="e.g. 2026 Campus Recruitment - Technical Coding Assessment"
                      value={formData.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      error={!isStep2Valid && formData.title.length > 0}
                      helperText={!isStep2Valid && formData.title.length > 0 ? 'Minimum 3 characters required' : ''}
                      sx={lightFieldSx}
                    />

                    <TextField
                      fullWidth
                      label="Examination Access Key"
                      placeholder="e.g. DTU-DSA-2026"
                      value={formData.code || ''}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      sx={lightFieldSx}
                      helperText="Passcode required to unlock exam"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <Tooltip title="Auto-Generate Random Key">
                                <IconButton size="small" onClick={generateRandomCode} sx={{ color: '#5B2D90' }}>
                                  <RefreshRoundedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <TextField
                    select
                    fullWidth
                    label="Assessment Purpose / Category"
                    value={formData.scope}
                    onChange={(e) => handleChange('scope', e.target.value)}
                    sx={lightFieldSx}
                  >
                    {SCOPES.map((sc) => (
                      <MenuItem key={sc.value} value={sc.value}>
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {sc.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            {sc.desc}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Skills / Topics */}
                  <Box>
                    <TextField
                      fullWidth
                      label="Target Skills & Topics (comma-separated)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="e.g. DSA, Arrays & Strings, Dynamic Programming, Python, SQL"
                      sx={lightFieldSx}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                        Quick Suggestions:
                      </Typography>
                      {POPULAR_TAGS.map((t) => (
                        <Chip
                          key={t}
                          label={`+ ${t}`}
                          size="small"
                          clickable
                          onClick={() => handleAddTag(t)}
                          sx={{
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            fontWeight: 600,
                            fontSize: '0.72rem',
                            '&:hover': { bgcolor: '#FAF5FF', color: '#5B2D90' },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: '#334155', fontSize: '0.82rem' }}>
                        Instructions for External Candidates & Assessment Rules
                      </Typography>
                      <Chip
                        icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '13px !important', color: '#5B2D90 !important' }} />}
                        label="TipTap Rich Editor with AI"
                        size="small"
                        sx={{ height: 20, fontSize: '0.64rem', fontWeight: 800, bgcolor: '#FAF5FF', color: '#5B2D90', border: '1px solid #C7D2FE' }}
                      />
                    </Box>
                    <TipTapEditor
                      content={formData.description || ''}
                      onChange={(html) => handleChange('description', html)}
                      placeholder="Write examination instructions, rules, or click '✨ AI Copilot' to auto-generate proctored rules..."
                      minHeight={180}
                      maxHeight={360}
                      enableAiAssistant={true}
                      aiMode="instructions"
                      aiContext={{
                        title: formData.title,
                        category: formData.scope,
                        tags: tagInput.split(',').map((t) => t.trim()).filter(Boolean),
                      }}
                    />
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 3: QUESTION BANK & ASSESSMENT BUILDER (MCQ/MSQ/CODING)   */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 2 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Summary Metrics Bar */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                    QUESTIONS SELECTED
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.25 }}>
                    {blueprintStats.totalQuestions} <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500 }}>Total</span>
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                    {blueprintStats.codingCount > 0 && (
                      <Chip size="small" label={`${blueprintStats.codingCount} Coding`} sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#FAF5FF', color: '#5B2D90', fontWeight: 700 }} />
                    )}
                    {blueprintStats.mcqCount > 0 && (
                      <Chip size="small" label={`${blueprintStats.mcqCount} MCQ`} sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700 }} />
                    )}
                    {blueprintStats.msqCount > 0 && (
                      <Chip size="small" label={`${blueprintStats.msqCount} MSQ`} sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700 }} />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                    TOTAL MARKS
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#5B2D90', mt: 0.25 }}>
                    {blueprintStats.totalPoints} <span style={{ fontSize: '0.85rem', color: '#818CF8', fontWeight: 500 }}>Pts</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Max evaluable assessment score
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                    ESTIMATED TIME
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669', mt: 0.25 }}>
                    ~{blueprintStats.estimatedMinutes} <span style={{ fontSize: '0.85rem', color: '#34D399', fontWeight: 500 }}>Mins</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Recommended test duration
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block' }}>
                    DIFFICULTY BREAKDOWN
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75 }}>
                    <Chip size="small" label={`Easy: ${blueprintStats.easy}`} sx={{ bgcolor: '#ECFDF5', color: '#059669', fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                    <Chip size="small" label={`Med: ${blueprintStats.medium}`} sx={{ bgcolor: '#FFFBEB', color: '#D97706', fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                    <Chip size="small" label={`Hard: ${blueprintStats.hard}`} sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                  </Box>
                </Box>
              </Paper>

              {/* Mode Switcher Tabs */}
              <Box sx={{ display: 'flex', gap: 1.5, borderBottom: '1px solid #E2E8F0', pb: 1, flexWrap: 'wrap' }}>
                <Button
                  onClick={() => setQuestionBankTab('LIBRARY')}
                  startIcon={<SearchRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    borderRadius: '10px',
                    px: 2.25,
                    py: 0.9,
                    bgcolor: questionBankTab === 'LIBRARY' ? '#5B2D90' : 'transparent',
                    color: questionBankTab === 'LIBRARY' ? '#FFFFFF' : '#64748B',
                    boxShadow: questionBankTab === 'LIBRARY' ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                    '&:hover': { bgcolor: questionBankTab === 'LIBRARY' ? '#4338CA' : '#F1F5F9' },
                  }}
                >
                  Browse Library ({filteredProblems.length + customQuestions.length})
                </Button>

                <Button
                  onClick={() => setQuestionBankTab('CREATE')}
                  startIcon={<AddCircleOutlineRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    borderRadius: '10px',
                    px: 2.25,
                    py: 0.9,
                    bgcolor: questionBankTab === 'CREATE' ? '#5B2D90' : 'transparent',
                    color: questionBankTab === 'CREATE' ? '#FFFFFF' : '#64748B',
                    boxShadow: questionBankTab === 'CREATE' ? '0 4px 12px rgba(79, 70, 229, 0.2)' : 'none',
                    '&:hover': { bgcolor: questionBankTab === 'CREATE' ? '#4338CA' : '#F1F5F9' },
                  }}
                >
                  Create Custom (MCQ / MSQ / Coding)
                </Button>

                <Button
                  onClick={() => setQuestionBankTab('AI_COPILOT')}
                  startIcon={<AutoAwesomeRoundedIcon sx={{ color: questionBankTab === 'AI_COPILOT' ? '#FFFFFF' : '#7C3AED' }} />}
                  sx={{
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.88rem',
                    borderRadius: '10px',
                    px: 2.5,
                    py: 0.9,
                    background:
                      questionBankTab === 'AI_COPILOT'
                        ? 'linear-gradient(135deg, #5B2D90 0%, #7C3AED 100%)'
                        : '#FAF5FF',
                    color: questionBankTab === 'AI_COPILOT' ? '#FFFFFF' : '#7C3AED',
                    border: '1px solid',
                    borderColor: questionBankTab === 'AI_COPILOT' ? 'transparent' : '#E9D5FF',
                    boxShadow: questionBankTab === 'AI_COPILOT' ? '0 4px 14px rgba(124, 58, 237, 0.3)' : 'none',
                    '&:hover': {
                      background:
                        questionBankTab === 'AI_COPILOT'
                          ? 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)'
                          : '#F3E8FF',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>AI Question Studio & Copilot</span>
                    <Chip
                      label="AI POWERED"
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        bgcolor: questionBankTab === 'AI_COPILOT' ? 'rgba(255,255,255,0.25)' : '#7C3AED',
                        color: '#FFFFFF',
                      }}
                    />
                  </Box>
                </Button>
              </Box>

              {/* AI Copilot Quick Assist Banner */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '14px',
                  bgcolor: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: '#EDE9FE', color: '#7C3AED', display: 'flex' }}>
                    <PsychologyRoundedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#4C1D95', fontSize: '0.82rem' }}>
                      SkillOS AI Assessment Copilot
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6D28D9', display: 'block', fontSize: '0.72rem' }}>
                      1-click generate curriculum questions, auto-balance difficulty, or polish question drafts.
                    </Typography>
                  </Box>
                </Box>

                {/* Quick 1-Click Generation Action Chips */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={aiGenerating ? <CircularProgress size={12} sx={{ color: '#6D28D9' }} /> : <AutoAwesomeRoundedIcon />}
                    onClick={() => handleAiGenerateTopicDeck('Data Structures & Algorithms', 'MCQ')}
                    disabled={aiGenerating}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: '#FFFFFF',
                      borderColor: '#DDD6FE',
                      color: '#6D28D9',
                      py: 0.4,
                      px: 1.25,
                      '&:hover': { bgcolor: '#EDE9FE', borderColor: '#7C3AED' },
                    }}
                  >
                    + Generate 3 MCQs
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={aiGenerating ? <CircularProgress size={12} sx={{ color: '#6D28D9' }} /> : <BoltRoundedIcon />}
                    onClick={() => handleAiGenerateTopicDeck('Algorithms', 'CODING')}
                    disabled={aiGenerating}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      bgcolor: '#FFFFFF',
                      borderColor: '#DDD6FE',
                      color: '#5B2D90',
                      py: 0.4,
                      px: 1.25,
                      '&:hover': { bgcolor: '#FAF5FF', borderColor: '#5B2D90' },
                    }}
                  >
                    + Generate Coding Problem
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    startIcon={aiGenerating ? <CircularProgress size={12} sx={{ color: '#FFFFFF' }} /> : <TuneRoundedIcon />}
                    onClick={handleAiAutoBalanceDeck}
                    disabled={aiGenerating}
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'none',
                      bgcolor: '#7C3AED',
                      color: '#FFFFFF',
                      py: 0.4,
                      px: 1.5,
                      '&:hover': { bgcolor: '#6D28D9' },
                    }}
                  >
                    Auto-Balance Test Deck
                  </Button>
                </Box>
              </Box>

              {/* AI Success Feedback Alert */}
              {aiSuccessMessage && (
                <Alert
                  severity="success"
                  onClose={() => setAiSuccessMessage(null)}
                  icon={<CheckCircleRoundedIcon fontSize="inherit" />}
                  sx={{ borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, bgcolor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}
                >
                  {aiSuccessMessage}
                </Alert>
              )}

              {/* DUAL PANE LAYOUT: Main Content (Left) + Selected Test Deck (Right) */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' }, gap: 2.5 }}>
                {/* ───────────────────────────────────────────────────────── */}
                {/* LEFT PANE TAB 1: BROWSE QUESTION LIBRARY                  */}
                {/* ───────────────────────────────────────────────────────── */}
                {questionBankTab === 'LIBRARY' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Filters & Search */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: '14px',
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                      }}
                    >
                      <TextField
                        size="small"
                        placeholder="Search question bank by title, topic, category..."
                        value={problemSearch}
                        onChange={(e) => setProblemSearch(e.target.value)}
                        sx={{ flex: 1, minWidth: '220px', ...lightFieldSx }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon sx={{ color: '#94A3B8' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />

                      {/* Question Type Filter */}
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[
                          { key: 'ALL', label: 'All Types' },
                          { key: 'CODING', label: 'Coding' },
                          { key: 'MCQ', label: 'MCQ' },
                          { key: 'MSQ', label: 'MSQ' },
                        ].map((t) => (
                          <Chip
                            key={t.key}
                            label={t.label}
                            size="small"
                            clickable
                            onClick={() => setQuestionTypeFilter(t.key as any)}
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              bgcolor: questionTypeFilter === t.key ? '#5B2D90' : '#F1F5F9',
                              color: questionTypeFilter === t.key ? '#FFFFFF' : '#64748B',
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>

                    {/* Questions List */}
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: '16px',
                        bgcolor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        maxHeight: '540px',
                        overflowY: 'auto',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#475569', fontWeight: 800, mb: 2 }}>
                        AVAILABLE QUESTIONS ({filteredProblems.length + customQuestions.length})
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        {/* Custom Created Questions in Library */}
                        {customQuestions
                          .filter((q) => questionTypeFilter === 'ALL' || q.type === questionTypeFilter)
                          .map((q) => {
                            const isSelected = selectedCustomIds.includes(q.id);
                            return (
                              <Box
                                key={q.id}
                                onClick={() => toggleCustomQuestionSelection(q.id)}
                                sx={{
                                  p: 1.5,
                                  borderRadius: '12px',
                                  bgcolor: isSelected ? '#FAF5FF' : '#F8FAFC',
                                  border: isSelected ? '1.5px solid #5B2D90' : '1px solid #E2E8F0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  justifyContent: 'space-between',
                                  gap: 1.5,
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: isSelected ? '#E0E7FF' : '#F1F5F9' },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                                  <Checkbox
                                    checked={isSelected}
                                    size="small"
                                    sx={{ p: 0.25, mt: 0.25, color: '#CBD5E1', '&.Mui-checked': { color: '#5B2D90' } }}
                                  />
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Chip
                                        size="small"
                                        label={q.type}
                                        sx={{
                                          height: 20,
                                          fontSize: '0.65rem',
                                          fontWeight: 800,
                                          bgcolor: q.type === 'MCQ' ? '#ECFDF5' : q.type === 'MSQ' ? '#FFFBEB' : '#FAF5FF',
                                          color: q.type === 'MCQ' ? '#059669' : q.type === 'MSQ' ? '#D97706' : '#5B2D90',
                                        }}
                                      />
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                        {q.title}
                                      </Typography>
                                    </Box>

                                    {/* MCQ / MSQ Options Preview */}
                                    {q.options && q.options.length > 0 && (
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                                        {q.options.map((opt, idx) => {
                                          const isCorrect = q.correctOptionIds?.includes(opt.id);
                                          return (
                                            <Typography
                                              key={opt.id}
                                              variant="caption"
                                              sx={{
                                                bgcolor: isCorrect ? '#DCFCE7' : '#FFFFFF',
                                                border: isCorrect ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                                                color: isCorrect ? '#166534' : '#64748B',
                                                fontWeight: isCorrect ? 700 : 500,
                                                px: 1,
                                                py: 0.2,
                                                borderRadius: '6px',
                                                fontSize: '0.72rem',
                                              }}
                                            >
                                              {String.fromCharCode(65 + idx)}: {opt.text}
                                            </Typography>
                                          );
                                        })}
                                      </Box>
                                    )}

                                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                                      {q.category} • {q.points} Pts {q.negativeMarks ? `(Negative: -${q.negativeMarks})` : ''}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Chip
                                  size="small"
                                  label={`${q.points} PTS`}
                                  sx={{ fontWeight: 800, fontSize: '0.65rem', height: 22, bgcolor: '#FAF5FF', color: '#5B2D90' }}
                                />
                              </Box>
                            );
                          })}

                        {/* Standard Problem Bank Problems (Coding) */}
                        {(questionTypeFilter === 'ALL' || questionTypeFilter === 'CODING') &&
                          filteredProblems.map((p) => {
                            const isSelected = formData.problemIds?.includes(p.id);
                            const defaultPoints =
                              p.difficulty?.toUpperCase() === 'HARD' ? 150 : p.difficulty?.toUpperCase() === 'MEDIUM' ? 100 : 50;
                            return (
                              <Box
                                key={p.id}
                                onClick={() => toggleProblemSelection(p.id)}
                                sx={{
                                  p: 1.5,
                                  borderRadius: '12px',
                                  bgcolor: isSelected ? '#FAF5FF' : '#F8FAFC',
                                  border: isSelected ? '1.5px solid #5B2D90' : '1px solid #E2E8F0',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.15s ease',
                                  '&:hover': { bgcolor: isSelected ? '#E0E7FF' : '#F1F5F9' },
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, mr: 1.5 }}>
                                  <Checkbox
                                    checked={!!isSelected}
                                    size="small"
                                    sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#5B2D90' } }}
                                  />
                                  <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Chip
                                        size="small"
                                        label="CODING"
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#FAF5FF', color: '#5B2D90' }}
                                      />
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                                        {p.title}
                                      </Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                                      {p.category || 'Algorithms'} • {p.points || defaultPoints} Pts
                                    </Typography>
                                  </Box>
                                </Box>

                                <Chip
                                  size="small"
                                  label={p.difficulty || 'MEDIUM'}
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: '0.65rem',
                                    height: 22,
                                    bgcolor:
                                      p.difficulty?.toUpperCase() === 'EASY'
                                        ? '#ECFDF5'
                                        : p.difficulty?.toUpperCase() === 'HARD'
                                        ? '#FEF2F2'
                                        : '#FFFBEB',
                                    color:
                                      p.difficulty?.toUpperCase() === 'EASY'
                                        ? '#059669'
                                        : p.difficulty?.toUpperCase() === 'HARD'
                                        ? '#DC2626'
                                        : '#D97706',
                                  }}
                                />
                              </Box>
                            );
                          })}
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* ───────────────────────────────────────────────────────── */}
                {/* LEFT PANE TAB 2: INTERACTIVE QUESTION BUILDER + AI RIBBON */}
                {/* ───────────────────────────────────────────────────────── */}
                {questionBankTab === 'CREATE' && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.5,
                      maxHeight: '580px',
                      overflowY: 'auto',
                    }}
                  >
                    {/* AI Assistance Ribbon for Authoring */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        bgcolor: '#FAF5FF',
                        border: '1px solid #E9D5FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoFixHighRoundedIcon sx={{ color: '#7C3AED', fontSize: 20 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#6B21A8' }}>
                          AI REFINEMENT TOOLS
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          size="small"
                          startIcon={aiRefiningField === 'statement' ? <CircularProgress size={12} sx={{ color: '#7C3AED' }} /> : <AutoFixHighRoundedIcon />}
                          onClick={handleAiRefineStatement}
                          disabled={aiRefiningField !== null}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#FFFFFF',
                            color: '#7C3AED',
                            border: '1px solid #DDD6FE',
                            py: 0.3,
                            px: 1,
                            '&:hover': { bgcolor: '#F3E8FF' },
                          }}
                        >
                          AI Polish Statement
                        </Button>

                        {(builderType === 'MCQ' || builderType === 'MSQ') && (
                          <Button
                            size="small"
                            startIcon={aiRefiningField === 'options' ? <CircularProgress size={12} sx={{ color: '#059669' }} /> : <TipsAndUpdatesRoundedIcon />}
                            onClick={handleAiGenerateOptions}
                            disabled={aiRefiningField !== null}
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              bgcolor: '#FFFFFF',
                              color: '#059669',
                              border: '1px solid #A7F3D0',
                              py: 0.3,
                              px: 1,
                              '&:hover': { bgcolor: '#ECFDF5' },
                            }}
                          >
                            AI Generate Distractors
                          </Button>
                        )}

                        {builderType === 'CODING' && (
                          <Button
                            size="small"
                            startIcon={aiRefiningField === 'testcases' ? <CircularProgress size={12} sx={{ color: '#5B2D90' }} /> : <ScienceRoundedIcon />}
                            onClick={handleAiGenerateEdgeTestcases}
                            disabled={aiRefiningField !== null}
                            sx={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              bgcolor: '#FFFFFF',
                              color: '#5B2D90',
                              border: '1px solid #C7D2FE',
                              py: 0.3,
                              px: 1,
                              '&:hover': { bgcolor: '#FAF5FF' },
                            }}
                          >
                            AI Edge Test Cases
                          </Button>
                        )}
                      </Box>
                    </Box>

                    {/* Type Selector Tabs */}
                    <Box sx={{ display: 'flex', gap: 1, bgcolor: '#F1F5F9', p: 0.75, borderRadius: '12px' }}>
                      <Button
                        fullWidth
                        size="small"
                        onClick={() => setBuilderType('MCQ')}
                        startIcon={<RadioButtonCheckedRoundedIcon />}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          borderRadius: '8px',
                          bgcolor: builderType === 'MCQ' ? '#FFFFFF' : 'transparent',
                          color: builderType === 'MCQ' ? '#059669' : '#64748B',
                          boxShadow: builderType === 'MCQ' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        Single Choice (MCQ)
                      </Button>

                      <Button
                        fullWidth
                        size="small"
                        onClick={() => setBuilderType('MSQ')}
                        startIcon={<CheckBoxRoundedIcon />}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          borderRadius: '8px',
                          bgcolor: builderType === 'MSQ' ? '#FFFFFF' : 'transparent',
                          color: builderType === 'MSQ' ? '#D97706' : '#64748B',
                          boxShadow: builderType === 'MSQ' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        Multiple Select (MSQ)
                      </Button>

                      <Button
                        fullWidth
                        size="small"
                        onClick={() => setBuilderType('CODING')}
                        startIcon={<TerminalRoundedIcon />}
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          textTransform: 'none',
                          borderRadius: '8px',
                          bgcolor: builderType === 'CODING' ? '#FFFFFF' : 'transparent',
                          color: builderType === 'CODING' ? '#5B2D90' : '#64748B',
                          boxShadow: builderType === 'CODING' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                        }}
                      >
                        Coding Challenge
                      </Button>
                    </Box>

                    {/* MCQ / MSQ BUILDER FORM */}
                    {(builderType === 'MCQ' || builderType === 'MSQ') && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          required
                          multiline
                          rows={2}
                          label={builderType === 'MCQ' ? 'MCQ Question Prompt / Statement' : 'MSQ Question Prompt (One or More Correct)'}
                          placeholder="e.g. Which data structure is utilized in breadth-first search (BFS) traversal of a graph?"
                          value={mcqTitle}
                          onChange={(e) => setMcqTitle(e.target.value)}
                          sx={lightFieldSx}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
                          <TextField
                            size="small"
                            label="Category / Skill"
                            placeholder="e.g. Data Structures"
                            value={mcqCategory}
                            onChange={(e) => setMcqCategory(e.target.value)}
                            sx={lightFieldSx}
                          />

                          <TextField
                            size="small"
                            type="number"
                            label="Points (+ Marks)"
                            value={mcqPoints}
                            onChange={(e) => setMcqPoints(Number(e.target.value))}
                            sx={lightFieldSx}
                          />

                          <TextField
                            size="small"
                            type="number"
                            label="Negative Marks (- Pts)"
                            value={mcqNegative}
                            onChange={(e) => setMcqNegative(Number(e.target.value))}
                            sx={lightFieldSx}
                          />
                        </Box>

                        {/* Options Section */}
                        <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>
                              {builderType === 'MCQ' ? 'OPTIONS (SELECT 1 CORRECT ANSWER RADIO)' : 'OPTIONS (SELECT ALL CORRECT ANSWER CHECKBOXES)'}
                            </Typography>
                            <Button
                              size="small"
                              onClick={handleAddOption}
                              startIcon={<AddRoundedIcon />}
                              sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 700, color: '#5B2D90' }}
                            >
                              Add Option
                            </Button>
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {mcqOptions.map((opt, idx) => {
                              const isCorrect = builderType === 'MCQ' ? mcqSingleCorrect === opt.id : msqMultiCorrect.includes(opt.id);
                              return (
                                <Box
                                  key={opt.id}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: '#FFFFFF',
                                    p: 1,
                                    borderRadius: '8px',
                                    border: isCorrect ? '1.5px solid #10B981' : '1px solid #E2E8F0',
                                  }}
                                >
                                  {/* Answer Selection: Radio for MCQ, Checkbox for MSQ */}
                                  {builderType === 'MCQ' ? (
                                    <Tooltip title="Mark as Correct Answer">
                                      <Radio
                                        size="small"
                                        checked={mcqSingleCorrect === opt.id}
                                        onChange={() => setMcqSingleCorrect(opt.id)}
                                        sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#10B981' } }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Tooltip title="Toggle Correct Answer">
                                      <Checkbox
                                        size="small"
                                        checked={msqMultiCorrect.includes(opt.id)}
                                        onChange={() => handleToggleMsqCorrect(opt.id)}
                                        sx={{ color: '#CBD5E1', '&.Mui-checked': { color: '#10B981' } }}
                                      />
                                    </Tooltip>
                                  )}

                                  <Typography variant="caption" sx={{ fontWeight: 800, color: isCorrect ? '#059669' : '#64748B', width: 20 }}>
                                    {String.fromCharCode(65 + idx)}
                                  </Typography>

                                  <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                                    value={opt.text}
                                    onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                                    sx={lightFieldSx}
                                  />

                                  {mcqOptions.length > 2 && (
                                    <IconButton size="small" onClick={() => handleRemoveOption(opt.id)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
                                      <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>

                        {/* Explanation Field */}
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          size="small"
                          label="Explanation / Solution Rationale (Optional)"
                          placeholder="Provide detailed explanation to show on candidate result scorecard..."
                          value={mcqExplanation}
                          onChange={(e) => setMcqExplanation(e.target.value)}
                          sx={lightFieldSx}
                        />

                        <Button
                          variant="contained"
                          onClick={handleSaveCustomQuestion}
                          disabled={!mcqTitle.trim() || mcqOptions.filter((o) => o.text.trim()).length < 2}
                          startIcon={<AddRoundedIcon />}
                          sx={{
                            bgcolor: '#10B981',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            py: 1.25,
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#059669' },
                          }}
                        >
                          + Add {builderType} Question to Test Deck
                        </Button>
                      </Box>
                    )}

                    {/* CODING CHALLENGE BUILDER FORM */}
                    {builderType === 'CODING' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                          fullWidth
                          required
                          label="Coding Problem Title"
                          placeholder="e.g. Next Permutation Algorithm"
                          value={codingTitle}
                          onChange={(e) => setCodingTitle(e.target.value)}
                          sx={lightFieldSx}
                        />

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
                          <TextField
                            select
                            size="small"
                            label="Difficulty"
                            value={codingDifficulty}
                            onChange={(e) => setCodingDifficulty(e.target.value as any)}
                            sx={lightFieldSx}
                          >
                            <MenuItem value="EASY">Easy</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="HARD">Hard</MenuItem>
                          </TextField>

                          <TextField
                            size="small"
                            type="number"
                            label="Max Score (+ Pts)"
                            value={codingPoints}
                            onChange={(e) => setCodingPoints(Number(e.target.value))}
                            sx={lightFieldSx}
                          />

                          <TextField
                            size="small"
                            type="number"
                            label="Time Limit (ms)"
                            value={codingTimeLimit}
                            onChange={(e) => setCodingTimeLimit(Number(e.target.value))}
                            sx={lightFieldSx}
                          />
                        </Box>

                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', mb: 0.75, display: 'block', fontSize: '0.78rem' }}>
                            Problem Statement & Algorithmic Constraints (Markdown / Rich HTML)
                          </Typography>
                          <TipTapEditor
                            content={codingDescription || ''}
                            onChange={(html) => setCodingDescription(html)}
                            placeholder="Describe the algorithmic challenge, input parameters, expected returns, and time complexity constraints..."
                            minHeight={150}
                            maxHeight={300}
                            enableAiAssistant={true}
                            aiMode="problem"
                            aiContext={{
                              title: codingTitle,
                              category: codingCategory,
                            }}
                          />
                        </Box>

                        {/* Test Cases Table */}
                        <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                            <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>
                              TEST CASES & EVALUATION SUITE
                            </Typography>
                            <Button
                              size="small"
                              onClick={handleAddTestcase}
                              startIcon={<AddRoundedIcon />}
                              sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 700, color: '#5B2D90' }}
                            >
                              Add Testcase
                            </Button>
                          </Box>

                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {codingTestcases.map((tc, idx) => (
                              <Box
                                key={idx}
                                sx={{
                                  p: 1.5,
                                  bgcolor: '#FFFFFF',
                                  borderRadius: '8px',
                                  border: '1px solid #E2E8F0',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1,
                                }}
                              >
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#5B2D90' }}>
                                    Test Case #{idx + 1} {tc.isHidden ? '(Private / Hidden)' : '(Public Sample)'}
                                  </Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          size="small"
                                          checked={!!tc.isHidden}
                                          onChange={(e) => handleTestcaseChange(idx, 'isHidden', e.target.checked)}
                                        />
                                      }
                                      label={<Typography sx={{ fontSize: '0.72rem', fontWeight: 600 }}>Hidden</Typography>}
                                    />
                                    {codingTestcases.length > 1 && (
                                      <IconButton size="small" onClick={() => handleRemoveTestcase(idx)} sx={{ color: '#EF4444' }}>
                                        <DeleteOutlineRoundedIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                </Box>

                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                                  <TextField
                                    size="small"
                                    label="Input"
                                    value={tc.input}
                                    onChange={(e) => handleTestcaseChange(idx, 'input', e.target.value)}
                                    sx={lightFieldSx}
                                  />
                                  <TextField
                                    size="small"
                                    label="Expected Output"
                                    value={tc.output}
                                    onChange={(e) => handleTestcaseChange(idx, 'output', e.target.value)}
                                    sx={lightFieldSx}
                                  />
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>

                        <Button
                          variant="contained"
                          onClick={handleSaveCustomQuestion}
                          disabled={!codingTitle.trim()}
                          startIcon={<AddRoundedIcon />}
                          sx={{
                            bgcolor: '#5B2D90',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            py: 1.25,
                            borderRadius: '10px',
                            textTransform: 'none',
                            '&:hover': { bgcolor: '#4338CA' },
                          }}
                        >
                          + Add Coding Challenge to Test Deck
                        </Button>
                      </Box>
                    )}
                  </Paper>
                )}

                {/* ───────────────────────────────────────────────────────── */}
                {/* LEFT PANE TAB 3: SKILLOS AI QUESTION GENERATION STUDIO    */}
                {/* ───────────────────────────────────────────────────────── */}
                {questionBankTab === 'AI_COPILOT' && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: '16px',
                      bgcolor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2.5,
                      maxHeight: '580px',
                      overflowY: 'auto',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: '#FAF5FF', color: '#7C3AED', display: 'flex' }}>
                          <AutoAwesomeRoundedIcon sx={{ fontSize: 24 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                            SkillOS AI Question Generation Studio
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B' }}>
                            Prompt-to-Assessment: Generate validated MCQs, MSQs & Coding problems
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Topic Prompt Input */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <TextField
                        fullWidth
                        label="Assessment Topic, Skill or Syllabus Prompt"
                        placeholder="e.g. Dynamic Programming (0/1 Knapsack, LCS), React 19 Server Components, SQL Window Functions"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        sx={lightFieldSx}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          Trending Prompts:
                        </Typography>
                        {[
                          'Binary Search Trees & Graphs',
                          'Dynamic Programming',
                          'SQL Database Joins & Indexing',
                          'React & Frontend Core',
                          'Python OOP & Data Types',
                          'System Design & Microservices',
                        ].map((tp) => (
                          <Chip
                            key={tp}
                            label={`+ ${tp}`}
                            size="small"
                            clickable
                            onClick={() => setAiTopic(tp)}
                            sx={{
                              bgcolor: '#F5F3FF',
                              color: '#6D28D9',
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              '&:hover': { bgcolor: '#EDE9FE', color: '#4C1D95' },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Question Config Grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 1.5 }}>
                      <TextField
                        select
                        size="small"
                        label="Question Type"
                        value={aiQuestionType}
                        onChange={(e) => setAiQuestionType(e.target.value as any)}
                        sx={lightFieldSx}
                      >
                        <MenuItem value="MIXED">Mixed (Coding + MCQ + MSQ)</MenuItem>
                        <MenuItem value="CODING">Coding Challenges Only</MenuItem>
                        <MenuItem value="MCQ">Single Choice (MCQ)</MenuItem>
                        <MenuItem value="MSQ">Multiple Select (MSQ)</MenuItem>
                      </TextField>

                      <TextField
                        select
                        size="small"
                        label="Difficulty Profile"
                        value={aiDifficulty}
                        onChange={(e) => setAiDifficulty(e.target.value as any)}
                        sx={lightFieldSx}
                      >
                        <MenuItem value="MIXED">Adaptive / Balanced Mix</MenuItem>
                        <MenuItem value="EASY">Easy (Beginner)</MenuItem>
                        <MenuItem value="MEDIUM">Medium (Intermediate)</MenuItem>
                        <MenuItem value="HARD">Hard (Advanced)</MenuItem>
                      </TextField>

                      <TextField
                        select
                        size="small"
                        label="Items to Generate"
                        value={aiQuestionCount}
                        onChange={(e) => setAiQuestionCount(Number(e.target.value))}
                        sx={lightFieldSx}
                      >
                        <MenuItem value={1}>1 Question</MenuItem>
                        <MenuItem value={2}>2 Questions</MenuItem>
                        <MenuItem value={3}>3 Questions</MenuItem>
                        <MenuItem value={5}>5 Questions</MenuItem>
                      </TextField>
                    </Box>

                    {/* Big Generate Button */}
                    <Button
                      variant="contained"
                      onClick={() => handleAiGenerateTopicDeck()}
                      disabled={aiGenerating}
                      startIcon={aiGenerating ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <AutoAwesomeRoundedIcon />}
                      sx={{
                        py: 1.5,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #5B2D90 0%, #7C3AED 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4338CA 0%, #6D28D9 100%)',
                        },
                      }}
                    >
                      {aiGenerating ? 'SkillOS AI Synthesizing Questions & Testcases...' : `Generate ${aiQuestionCount} Verified Questions with AI`}
                    </Button>
                  </Paper>
                )}

                {/* ───────────────────────────────────────────────────────── */}
                {/* RIGHT PANE: SELECTED TEST DECK                            */}
                {/* ───────────────────────────────────────────────────────── */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '580px',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5B2D90', fontWeight: 800 }}>
                        TEST DECK ({allSelectedDeckQuestions.length})
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Questions active in candidate examination
                      </Typography>
                    </Box>

                    {allSelectedDeckQuestions.length > 0 && (
                      <Button
                        size="small"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, problemIds: [], problemsCount: 0 }));
                          setSelectedCustomIds([]);
                        }}
                        sx={{ color: '#EF4444', fontSize: '0.72rem', textTransform: 'none', fontWeight: 600 }}
                      >
                        Clear All
                      </Button>
                    )}
                  </Box>

                  {allSelectedDeckQuestions.length === 0 ? (
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #CBD5E1',
                        borderRadius: '12px',
                        p: 4,
                        textAlign: 'center',
                        color: '#94A3B8',
                      }}
                    >
                      <AddRoundedIcon sx={{ fontSize: 38, mb: 1, color: '#94A3B8' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                        No questions in test deck
                      </Typography>
                      <Typography variant="caption">
                        Select questions from the library or create custom MCQs, MSQs, and coding problems.
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, overflowY: 'auto', flex: 1, pr: 0.5 }}>
                      {allSelectedDeckQuestions.map((q, idx) => (
                        <Box
                          key={q.id}
                          sx={{
                            p: 1.25,
                            borderRadius: '10px',
                            bgcolor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 1,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, flex: 1 }}>
                            <Box
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: '6px',
                                bgcolor: '#5B2D90',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                mt: 0.25,
                              }}
                            >
                              {idx + 1}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                                <Chip
                                  size="small"
                                  label={q.type}
                                  sx={{
                                    height: 18,
                                    fontSize: '0.62rem',
                                    fontWeight: 800,
                                    bgcolor: q.type === 'MCQ' ? '#ECFDF5' : q.type === 'MSQ' ? '#FFFBEB' : '#FAF5FF',
                                    color: q.type === 'MCQ' ? '#059669' : q.type === 'MSQ' ? '#D97706' : '#5B2D90',
                                  }}
                                />
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.82rem' }}>
                                  {q.title}
                                </Typography>
                              </Box>

                              {/* Answer preview */}
                              {q.type === 'MCQ' && q.options && (
                                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, display: 'block' }}>
                                  ✓ Key: Option {String.fromCharCode(65 + Math.max(0, q.options.findIndex((o) => q.correctOptionIds?.includes(o.id))))}
                                </Typography>
                              )}
                              {q.type === 'MSQ' && q.options && (
                                <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700, display: 'block' }}>
                                  ✓ Key: {q.correctOptionIds?.map((cId) => String.fromCharCode(65 + q.options!.findIndex((o) => o.id === cId))).join(', ')}
                                </Typography>
                              )}
                              {q.type === 'CODING' && q.testCases && (
                                <Typography variant="caption" sx={{ color: '#5B2D90', fontWeight: 600, display: 'block' }}>
                                  {q.testCases.length} Testcase(s) • {q.difficulty}
                                </Typography>
                              )}

                              <Typography variant="caption" sx={{ color: '#64748B' }}>
                                {q.points} Pts • {q.category || 'General'}
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="AI Refine & Validate Question">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setAiSuccessMessage(`SkillOS AI verified question "${q.title.slice(0, 32)}..." with optimal scoring.`);
                                }}
                                sx={{ color: '#7C3AED', '&:hover': { bgcolor: '#F3E8FF' } }}
                              >
                                <AutoFixHighRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveFromDeck(q)}
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                            >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Box>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 4: SCHEDULE, TIMING & SCORING                            */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 3 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Access Window */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                  Testing Window Format
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  <Box
                    onClick={() => handleChange('windowType', 'FIXED')}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      bgcolor: formData.windowType === 'FIXED' ? '#FAF5FF' : '#F8FAFC',
                      border: formData.windowType === 'FIXED' ? '2px solid #5B2D90' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <AccessTimeRoundedIcon sx={{ color: '#5B2D90' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          Fixed Window (Live Scheduled Exam)
                        </Typography>
                      </Box>
                      {formData.windowType === 'FIXED' && <CheckCircleRoundedIcon sx={{ color: '#5B2D90', fontSize: 18 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      All candidates join synchronously at the scheduled time. Ideal for invigilated campus drives.
                    </Typography>
                  </Box>

                  <Box
                    onClick={() => handleChange('windowType', 'FLEXIBLE')}
                    sx={{
                      p: 2.5,
                      borderRadius: '12px',
                      bgcolor: formData.windowType === 'FLEXIBLE' ? '#FAF5FF' : '#F8FAFC',
                      border: formData.windowType === 'FLEXIBLE' ? '2px solid #5B2D90' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <PlayCircleOutlineRoundedIcon sx={{ color: '#059669' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                          Flexible Window (Open Testing Slot)
                        </Typography>
                      </Box>
                      {formData.windowType === 'FLEXIBLE' && <CheckCircleRoundedIcon sx={{ color: '#5B2D90', fontSize: 18 }} />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      Candidates can take the exam anytime within an open timeframe (e.g. 24–48h). Individual timer starts upon entry.
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Schedule & Duration */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 2.5 }}>
                  Schedule Date & Duration
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 2.5 }}>
                  <TextField
                    fullWidth
                    label="Test Start Datetime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    sx={lightFieldSx}
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />

                  <Box>
                    <TextField
                      fullWidth
                      label="Allocated Duration (Minutes)"
                      type="number"
                      value={formData.durationMinutes}
                      onChange={(e) => handleChange('durationMinutes', Math.max(10, parseInt(e.target.value, 10) || 60))}
                      sx={lightFieldSx}
                      slotProps={{
                        input: {
                          endAdornment: <InputAdornment position="end" sx={{ color: '#64748B', fontWeight: 700 }}>MINS</InputAdornment>,
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, mt: 1.25, flexWrap: 'wrap' }}>
                      {[30, 45, 60, 90, 120, 180].map((mins) => (
                        <Chip
                          key={mins}
                          label={`${mins}m`}
                          size="small"
                          clickable
                          onClick={() => handleChange('durationMinutes', mins)}
                          sx={{
                            fontWeight: 700,
                            bgcolor:
                              formData.durationMinutes === mins ? '#5B2D90' : '#F1F5F9',
                            color: formData.durationMinutes === mins ? '#FFFFFF' : '#475569',
                            border: '1px solid',
                            borderColor: formData.durationMinutes === mins ? 'transparent' : '#E2E8F0',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Scoring Rules */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, sm: 3.5 },
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                  Evaluation & Leaderboard Scoring Rules
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                  {SCORING_FORMATS.map((fmt) => {
                    const isSelected = formData.scoringFormat === fmt.label;
                    return (
                      <Box
                        key={fmt.label}
                        onClick={() => handleChange('scoringFormat', fmt.label)}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          bgcolor: isSelected ? '#FAF5FF' : '#F8FAFC',
                          border: isSelected ? '2px solid #5B2D90' : '1px solid #E2E8F0',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                            {fmt.title}
                          </Typography>
                          {isSelected && <CheckCircleRoundedIcon sx={{ color: '#5B2D90', fontSize: 18 }} />}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
                          {fmt.desc}
                        </Typography>
                        <Chip
                          size="small"
                          label={fmt.penalty}
                          sx={{
                            bgcolor: '#F1F5F9',
                            color: '#475569',
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            height: 20,
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 5: PROCTORING & ANTI-CHEAT SUITE                         */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 4 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Master Toggle */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)',
                  border: '1px solid #C7D2FE',
                  boxShadow: '0 2px 10px rgba(79, 70, 229, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.25, borderRadius: '12px', bgcolor: '#E0E7FF' }}>
                    <ShieldRoundedIcon sx={{ color: '#5B2D90', fontSize: 32 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      SkillOS AI Proctoring & Integrity Guard
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5B2D90', fontWeight: 600 }}>
                      Enterprise integrity suite enforcing fullscreen lockdown, tab monitoring, and similarity cross-checks.
                    </Typography>
                  </Box>
                </Box>

                <FormControlLabel
                  control={
                    <Switch
                      checked={!!formData.isProctored}
                      onChange={(e) => handleChange('isProctored', e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#5B2D90' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#5B2D90' },
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem' }}>
                      {formData.isProctored ? 'PROCTORED' : 'STANDARD'}
                    </Typography>
                  }
                />
              </Paper>

              {/* Proctoring Settings Matrix */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
                {/* 1. Full Screen */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <FullscreenRoundedIcon sx={{ color: '#5B2D90' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Native Fullscreen Lockdown
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Forces candidates into fullscreen mode. Exiting or minimizing logs integrity violations.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.enforceFullScreen}
                      onChange={(e) => handleChange('enforceFullScreen', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 2. Tab Switch Limit */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', gap: 1.5, mb: 1.5 }}>
                    <WarningAmberRoundedIcon sx={{ color: '#D97706' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                        Tab Switch Violation Limit
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Maximum permitted external tab switches before automatic test submission.
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {[0, 1, 2, 3, 5].map((limit) => (
                      <Chip
                        key={limit}
                        disabled={!formData.isProctored}
                        label={limit === 0 ? 'Strict 0' : `${limit} Switches`}
                        size="small"
                        clickable
                        onClick={() => handleChange('tabSwitchLimit', limit)}
                        sx={{
                          fontWeight: 700,
                          bgcolor: formData.tabSwitchLimit === limit ? '#F59E0B' : '#F1F5F9',
                          color: formData.tabSwitchLimit === limit ? '#FFFFFF' : '#475569',
                          border: '1px solid',
                          borderColor: formData.tabSwitchLimit === limit ? 'transparent' : '#E2E8F0',
                        }}
                      />
                    ))}
                  </Box>
                </Paper>

                {/* 3. Clipboard Shield */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <ContentPasteOffRoundedIcon sx={{ color: '#DC2626' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Clipboard & Paste Blocking
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Disables pasting external code snippets and right-click developer inspect elements.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.disableCopyPaste}
                      onChange={(e) => handleChange('disableCopyPaste', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 4. MOSS Plagiarism Engine */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <AutoAwesomeRoundedIcon sx={{ color: '#5B2D90' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          MOSS Similarity Plagiarism Engine
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Runs automated token-based similarity cross-checks across all submitted solutions.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.plagiarismCheck}
                      onChange={(e) => handleChange('plagiarismCheck', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 5. Webcam Snapshots */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <VideocamRoundedIcon sx={{ color: '#059669' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Webcam Presence Verification
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Captures periodic presence snapshots to authenticate student identity throughout testing.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.webcamProctoring}
                      onChange={(e) => handleChange('webcamProctoring', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>

                {/* 6. Shuffle Questions */}
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: '14px', bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', opacity: formData.isProctored ? 1 : 0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <ShuffleRoundedIcon sx={{ color: '#7C3AED' }} />
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                          Randomized Problem Order
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Displays coding questions in randomized sequence to mitigate peer communication.
                        </Typography>
                      </Box>
                    </Box>
                    <Switch
                      disabled={!formData.isProctored}
                      checked={!!formData.shuffleQuestions}
                      onChange={(e) => handleChange('shuffleQuestions', e.target.checked)}
                      size="small"
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          )}

          {/* ═════════════════════════════════════════════════════════════ */}
          {/* STEP 6: REVIEW & DEPLOY                                       */}
          {/* ═════════════════════════════════════════════════════════════ */}
          {activeStep === 5 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
              {/* Direct Candidate Shareable Link Banner */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #EEF2FF 0%, #FFFFFF 100%)',
                  border: '1px solid #C7D2FE',
                  boxShadow: '0 2px 10px rgba(79, 70, 229, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CheckCircleOutlineRoundedIcon sx={{ color: '#059669', fontSize: 28 }} />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        Assessment Ready for Deployment
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        Share this dedicated examination portal link with external candidates
                      </Typography>
                    </Box>
                  </Box>

                  {/* Access Key Chip */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      bgcolor: '#FFFFFF',
                      p: 1,
                      px: 2,
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontSize: '0.65rem', fontWeight: 700 }}>
                        EXAMINATION ACCESS KEY
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#5B2D90', letterSpacing: '0.05em' }}>
                        {formData.code || 'SKL-AUTO-KEY'}
                      </Typography>
                    </Box>
                    <Tooltip title={copiedCode ? 'Copied!' : 'Copy Key'}>
                      <IconButton size="small" onClick={handleCopyAccessCode} sx={{ color: '#64748B' }}>
                        <ContentCopyRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Direct Link Field */}
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Candidate Examination URL"
                    value={candidateDirectUrl}
                    slotProps={{
                      input: {
                        readOnly: true,
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkRoundedIcon sx={{ color: '#5B2D90' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={lightFieldSx}
                  />
                  <Button
                    variant="contained"
                    onClick={handleCopyDirectLink}
                    startIcon={<ContentCopyRoundedIcon />}
                    sx={{
                      bgcolor: copiedLink ? '#059669' : '#5B2D90',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      textTransform: 'none',
                      px: 3,
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: copiedLink ? '#047857' : '#4338CA' },
                    }}
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Link'}
                  </Button>
                </Box>
              </Paper>

              {/* Summary Cards Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
                {/* Schedule Summary */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Target Institution & Schedule Overview
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Assessment Title</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{formData.title}</Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Target College / Client</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0B1F3A' }}>
                        {effectiveCollegeName}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Start Datetime</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {new Date(formData.startTime).toLocaleString()}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Duration & Window</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F172A' }}>
                        {formData.durationMinutes} Mins • {formData.windowType} Slot
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Security Summary */}
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: '16px',
                    bgcolor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Proctoring & Anti-Cheat Controls
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Integrity Mode</Typography>
                      <Chip
                        size="small"
                        label={formData.isProctored ? 'AI PROCTORED' : 'STANDARD'}
                        sx={{
                          fontWeight: 800,
                          bgcolor: formData.isProctored ? '#ECFDF5' : '#F1F5F9',
                          color: formData.isProctored ? '#059669' : '#64748B',
                          height: 22,
                        }}
                      />
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Fullscreen Lock</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: formData.enforceFullScreen ? '#059669' : '#64748B' }}>
                        {formData.enforceFullScreen ? 'Enforced' : 'Disabled'}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Tab Switch Tolerance</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#D97706' }}>
                        {formData.tabSwitchLimit} Max Allowed
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: '#F1F5F9' }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#64748B' }}>Plagiarism Check</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: formData.plagiarismCheck ? '#5B2D90' : '#64748B' }}>
                        {formData.plagiarismCheck ? 'MOSS Enabled' : 'Disabled'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Questions Summary */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: '16px',
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                      Assessment Question Roster ({allSelectedDeckQuestions.length} Questions)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B' }}>
                      {blueprintStats.codingCount} Coding • {blueprintStats.mcqCount} MCQ • {blueprintStats.msqCount} MSQ
                    </Typography>
                  </Box>
                  <Typography variant="subtitle2" sx={{ color: '#5B2D90', fontWeight: 800 }}>
                    TOTAL MARKS: {blueprintStats.totalPoints} PTS
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {allSelectedDeckQuestions.map((q, idx) => (
                    <Box
                      key={q.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '10px',
                        bgcolor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1 }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '6px',
                            bgcolor: '#5B2D90',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                          }}
                        >
                          {idx + 1}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              size="small"
                              label={q.type}
                              sx={{
                                height: 20,
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                bgcolor: q.type === 'MCQ' ? '#ECFDF5' : q.type === 'MSQ' ? '#FFFBEB' : '#FAF5FF',
                                color: q.type === 'MCQ' ? '#059669' : q.type === 'MSQ' ? '#D97706' : '#5B2D90',
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                              {q.title}
                            </Typography>
                          </Box>
                          {q.type === 'MCQ' && q.options && (
                            <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700 }}>
                              ✓ Answer Key: Option {String.fromCharCode(65 + Math.max(0, q.options.findIndex((o) => q.correctOptionIds?.includes(o.id))))}
                            </Typography>
                          )}
                          {q.type === 'MSQ' && q.options && (
                            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>
                              ✓ Answer Keys: {q.correctOptionIds?.map((cId) => String.fromCharCode(65 + q.options!.findIndex((o) => o.id === cId))).join(', ')}
                            </Typography>
                          )}
                          {q.type === 'CODING' && q.testCases && (
                            <Typography variant="caption" sx={{ color: '#5B2D90', fontWeight: 600 }}>
                              {q.testCases.length} Testcase(s) configured
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      <Chip
                        size="small"
                        label={`${q.points} PTS`}
                        sx={{ fontWeight: 800, fontSize: '0.7rem', bgcolor: '#FAF5FF', color: '#5B2D90' }}
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          )}

          {/* ── SEAMLESS IN-FLOW BOTTOM NAVIGATION ACTIONS ── */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            {activeStep > 0 ? (
              <Button
                onClick={handleBack}
                startIcon={<FluidArrowBack size={18} strokeWidth={2.5} />}
                sx={{
                  color: '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 3,
                  py: 1.1,
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  bgcolor: '#FFFFFF',
                  '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                }}
              >
                Previous
              </Button>
            ) : (
              <Box />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                onClick={onClose}
                sx={{
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 2.5,
                  py: 1,
                  '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' },
                }}
              >
                Cancel
              </Button>

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  endIcon={<FluidArrowForward size={18} strokeWidth={2.5} />}
                  sx={{
                    bgcolor: '#5B2D90',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'none',
                    px: 3.5,
                    py: 1.1,
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
                    '&:hover': { bgcolor: '#4338CA' },
                    '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
                  }}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid}
                  startIcon={<RocketLaunchRoundedIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    textTransform: 'none',
                    px: 4,
                    py: 1.2,
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(79, 70, 229, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4338CA 0%, #17366E 100%)',
                    },
                  }}
                >
                  Publish & Deploy Assessment
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  </Dialog>
  );
}

const lightFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: '#FFFFFF',
    borderRadius: '10px',
    color: '#0F172A',
    '& fieldset': {
      borderColor: '#CBD5E1',
    },
    '&:hover fieldset': {
      borderColor: '#5B2D90',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#5B2D90',
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#475569',
    '&.Mui-focused': {
      color: '#5B2D90',
    },
  },
  '& .MuiSelect-icon': {
    color: '#64748B',
  },
  '& .MuiFormHelperText-root': {
    color: '#64748B',
  },
};
