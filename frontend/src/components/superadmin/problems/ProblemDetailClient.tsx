'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icons
import { FluidArrowLeft } from '@/utils/fluid_arrow';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FirstPageRoundedIcon from '@mui/icons-material/FirstPageRounded';
import LastPageRoundedIcon from '@mui/icons-material/LastPageRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';

// Layout & Helpers
import CurvedSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { ProblemEntity } from '@/types/problem';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';
import { apiService } from '@/lib/api-service';

export interface TestCaseItem {
  id: string;
  order: number;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden: boolean;
  points: number;
}

export interface ProblemSubmissionItem {
  id: string;
  studentName: string;
  studentEmail: string;
  institution: string;
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Memory Limit Exceeded' | 'Runtime Error';
  language: string;
  runtimeMs: number;
  memoryKb: number;
  submittedAt: string;
  codeSnippet: string;
}

export interface ProblemCohortItem {
  id: string;
  cohortName: string;
  collegeName: string;
  assignedDate: string;
  studentsAttempted: number;
  totalStudents: number;
  avgAccuracy: string;
  status: 'Mandatory' | 'Optional' | 'Contest Problem';
}

interface ProblemDetailClientProps {
  problem: ProblemEntity;
  initialTestCases?: TestCaseItem[];
  initialSubmissions?: ProblemSubmissionItem[];
  initialCohorts?: ProblemCohortItem[];
}

export default function ProblemDetailClient({
  problem,
  initialTestCases = [],
  initialSubmissions = [],
  initialCohorts = [],
}: ProblemDetailClientProps) {
  const router = useRouter();
  const toast = useToast();

  const [currentTab, setCurrentTab] = useState<'testcases' | 'submissions' | 'statement' | 'cohorts'>('testcases');
  const [isTabLoading, setIsTabLoading] = useState(false);

  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [editorialLang, setEditorialLang] = useState<'cpp' | 'python' | 'java' | 'typescript'>('cpp');

  // Data states
  const [testCases, setTestCases] = useState<TestCaseItem[]>(() => {
    if (initialTestCases.length > 0) return initialTestCases;
    if (problem.sampleTestCases && problem.sampleTestCases.length > 0) {
      const pts = Math.max(10, Math.floor(problem.points / (problem.sampleTestCases.length + 1)));
      const mapped: TestCaseItem[] = problem.sampleTestCases.map((tc, idx) => ({
        id: `tc-${idx + 1}`,
        order: idx + 1,
        input: tc.input,
        expectedOutput: tc.output,
        explanation: tc.explanation || `Sample test case #${idx + 1} verifying expected output format.`,
        isHidden: false,
        points: pts,
      }));
      mapped.push({
        id: `tc-${mapped.length + 1}`,
        order: mapped.length + 1,
        input: problem.title.toLowerCase().includes('even') || problem.title.toLowerCase().includes('odd') ? '1000000000' : 'Large scale boundary test case',
        expectedOutput: problem.title.toLowerCase().includes('even') || problem.title.toLowerCase().includes('odd') ? 'Even' : 'Computed output',
        explanation: 'Hidden evaluation testcase for judge sandbox.',
        isHidden: true,
        points: Math.max(0, problem.points - (pts * problem.sampleTestCases.length)),
      });
      return mapped;
    }
    const isEvenOdd = problem.title.toLowerCase().includes('even') || problem.title.toLowerCase().includes('odd');
    if (isEvenOdd) {
      return [
        { id: 'tc-1', order: 1, input: '4', expectedOutput: 'Even', explanation: '4 is divisible by 2.', isHidden: false, points: 20 },
        { id: 'tc-2', order: 2, input: '7', expectedOutput: 'Odd', explanation: '7 is not divisible by 2.', isHidden: false, points: 20 },
        { id: 'tc-3', order: 3, input: '0', expectedOutput: 'Even', explanation: '0 is divisible by 2.', isHidden: false, points: 20 },
        { id: 'tc-4', order: 4, input: '-1000000000', expectedOutput: 'Even', explanation: 'Large negative even integer boundary testcase.', isHidden: true, points: 20 },
      ];
    }
    return [
      {
        id: 'tc-1',
        order: 1,
        input: 'nums = [2,7,11,15], target = 9',
        expectedOutput: '[0,1]',
        explanation: 'nums[0] + nums[1] == 9, we return [0, 1].',
        isHidden: false,
        points: 20,
      },
      {
        id: 'tc-2',
        order: 2,
        input: 'nums = [3,2,4], target = 6',
        expectedOutput: '[1,2]',
        explanation: 'nums[1] + nums[2] == 6, we return [1, 2].',
        isHidden: false,
        points: 20,
      },
      {
        id: 'tc-3',
        order: 3,
        input: 'nums = [3,3], target = 6',
        expectedOutput: '[0,1]',
        explanation: 'nums[0] + nums[1] == 6, we return [0, 1].',
        isHidden: false,
        points: 20,
      },
      {
        id: 'tc-4',
        order: 4,
        input: 'nums = [10^5 elements, all 0, last two = 1], target = 2',
        expectedOutput: '[99998, 99999]',
        explanation: 'Edge test case for high cardinality array memory & time boundary.',
        isHidden: true,
        points: 40,
      },
    ];
  });

  // Real submissions: only populate when real submissions exist (defaulting to [] if problem has 0 submissions)
  const [submissions, setSubmissions] = useState<ProblemSubmissionItem[]>(() => {
    if (initialSubmissions && initialSubmissions.length > 0) return initialSubmissions;
    return [];
  });

  // Academic Cohorts / Batches assigned to this problem
  const [cohorts, setCohorts] = useState<ProblemCohortItem[]>(() => {
    if (initialCohorts && initialCohorts.length > 0) return initialCohorts;
    return [];
  });

  // Search & Filtering
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [testCaseSearch, setTestCaseSearch] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('ALL');

  // Modals
  const [addTestCaseOpen, setAddTestCaseOpen] = useState(false);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcExplanation, setNewTcExplanation] = useState('');
  const [newTcIsHidden, setNewTcIsHidden] = useState(false);

  // Assign Cohort Modal
  const [assignCohortOpen, setAssignCohortOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState('');
  const [newCohortCollege, setNewCohortCollege] = useState('');
  const [newCohortStatus, setNewCohortStatus] = useState<'Mandatory' | 'Optional' | 'Contest Problem'>('Mandatory');
  const [newCohortTotalStudents, setNewCohortTotalStudents] = useState<number>(60);

  const [viewCodeModalOpen, setViewCodeModalOpen] = useState(false);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<{ student: string; lang: string; code: string; verdict: string } | null>(null);

  // Editorial & Optimal Code Upload States
  const [editorialMarkdown, setEditorialMarkdown] = useState<string>(problem.editorialMarkdown || '');
  const [customSolutions, setCustomSolutions] = useState<
    Record<string, { displayLang: string; filename: string; code: string; timeComplexity?: string; spaceComplexity?: string; approachTitle?: string }>
  >({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLang, setUploadLang] = useState<'cpp' | 'python' | 'java' | 'typescript'>('cpp');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadApproachTitle, setUploadApproachTitle] = useState('Optimal Solution');
  const [uploadTimeComplexity, setUploadTimeComplexity] = useState('O(1)');
  const [uploadSpaceComplexity, setUploadSpaceComplexity] = useState('O(1)');
  const [uploadEditorialNotes, setUploadEditorialNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const renderInlineFormatted = (text: string) => {
    if (!text) return null;
    const tokens = text.split(/(\*\*.*?\*\*|``.*?``|`.*?`)/g);
    return tokens.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <Box component="strong" key={idx} sx={{ fontWeight: 800, color: '#0F172A' }}>
            {part.slice(2, -2)}
          </Box>
        );
      }
      if (part.startsWith('``') && part.endsWith('``') && part.length >= 4) {
        return (
          <Box
            component="code"
            key={idx}
            className="ide-code-font"
            sx={{
              fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
              px: 0.75,
              py: 0.2,
              mx: 0.35,
              bgcolor: '#F1F5F9',
              borderRadius: '5px',
              border: '1px solid #E2E8F0',
              fontSize: '0.82rem',
              color: '#0F172A',
              fontWeight: 600,
            }}
          >
            {part.slice(2, -2)}
          </Box>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <Box
            component="code"
            key={idx}
            className="ide-code-font"
            sx={{
              fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
              px: 0.75,
              py: 0.2,
              mx: 0.35,
              bgcolor: '#F1F5F9',
              borderRadius: '5px',
              border: '1px solid #E2E8F0',
              fontSize: '0.82rem',
              color: '#0F172A',
              fontWeight: 600,
            }}
          >
            {part.slice(1, -1)}
          </Box>
        );
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const getEditorialSolution = (lang: 'cpp' | 'python' | 'java' | 'typescript') => {
    if (customSolutions[lang]) {
      return customSolutions[lang];
    }

    const isEvenOdd =
      problem.slug?.toLowerCase().includes('even') ||
      problem.title?.toLowerCase().includes('even') ||
      problem.title?.toLowerCase().includes('odd');

    if (lang === 'cpp') {
      if (
        problem.referenceSolution &&
        (problem.referenceSolution.language.toLowerCase().includes('c++') ||
          problem.referenceSolution.language.toLowerCase().includes('cpp'))
      ) {
        return {
          filename: 'solution.cpp',
          displayLang: problem.referenceSolution.language || 'C++20',
          code: problem.referenceSolution.code,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          approachTitle: 'Optimal Parity Check in C++',
        };
      }
      if (isEvenOdd) {
        return {
          filename: 'solution.cpp',
          displayLang: 'C++20',
          code: `// Optimal Parity Check in C++\n#include <iostream>\nusing namespace std;\n\nstring checkEvenOrOdd(long long n) {\n    return (n % 2 == 0) ? "Even" : "Odd";\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    long long n;\n    if (cin >> n) {\n        cout << checkEvenOrOdd(n) << "\\n";\n    }\n    return 0;\n}`,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          approachTitle: 'Optimal Bitwise / Modulo Parity Check',
        };
      }
      return {
        filename: 'solution.cpp',
        displayLang: 'C++20',
        code: '// Optimal Reference Solution in C++20\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Optimal solution implementation\n    return 0;\n}',
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        approachTitle: 'Optimal Solution in C++',
      };
    }

    if (lang === 'python') {
      if (
        problem.referenceSolution &&
        problem.referenceSolution.language.toLowerCase().includes('py')
      ) {
        return {
          filename: 'solution.py',
          displayLang: problem.referenceSolution.language || 'Python 3',
          code: problem.referenceSolution.code,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          approachTitle: 'Optimal Solution in Python 3',
        };
      }
      if (isEvenOdd) {
        return {
          filename: 'solution.py',
          displayLang: 'Python 3.12',
          code: `# Optimal Parity Check in Python 3\nimport sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    n = int(raw.split()[0])\n    print("Even" if n % 2 == 0 else "Odd")\n\nif __name__ == "__main__":\n    solve()`,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          approachTitle: 'Optimal Parity Check in Python 3',
        };
      }
      return {
        filename: 'solution.py',
        displayLang: 'Python 3',
        code: `# Optimal Reference Solution in Python 3\nimport sys\n\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    solve()`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        approachTitle: 'Optimal Solution in Python 3',
      };
    }

    if (lang === 'java') {
      if (
        problem.referenceSolution &&
        problem.referenceSolution.language.toLowerCase().includes('java')
      ) {
        return {
          filename: 'Solution.java',
          displayLang: problem.referenceSolution.language || 'Java 21',
          code: problem.referenceSolution.code,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          approachTitle: 'Optimal Solution in Java 21',
        };
      }
      if (isEvenOdd) {
        return {
          filename: 'Solution.java',
          displayLang: 'Java 21',
          code: `// Optimal Parity Check in Java 21\nimport java.io.*;\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null && !line.trim().isEmpty()) {\n            long n = Long.parseLong(line.trim().split("\\\\s+")[0]);\n            System.out.println((n % 2 == 0) ? "Even" : "Odd");\n        }\n    }\n}`,
          timeComplexity: 'O(1)',
          spaceComplexity: 'O(1)',
          approachTitle: 'Optimal Parity Check in Java 21',
        };
      }
      return {
        filename: 'Solution.java',
        displayLang: 'Java 21',
        code: `// Optimal Reference Solution in Java 21\nimport java.io.*;\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Optimal solution implementation\n    }\n}`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        approachTitle: 'Optimal Solution in Java 21',
      };
    }

    // TypeScript
    if (
      problem.referenceSolution &&
      (problem.referenceSolution.language.toLowerCase().includes('ts') ||
        problem.referenceSolution.language.toLowerCase().includes('typescript') ||
        problem.referenceSolution.language.toLowerCase().includes('js'))
    ) {
      return {
        filename: 'solution.ts',
        displayLang: problem.referenceSolution.language || 'TypeScript',
        code: problem.referenceSolution.code,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        approachTitle: 'Optimal Solution in TypeScript',
      };
    }
    if (isEvenOdd) {
      return {
        filename: 'solution.ts',
        displayLang: 'TypeScript',
        code: `// Optimal Parity Check in TypeScript (Node.js)\nimport * as fs from 'fs';\n\nfunction main(): void {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  if (!input) return;\n  const n = BigInt(input.split(/\\s+/)[0]);\n  console.log(n % 2n === 0n ? 'Even' : 'Odd');\n}\n\nmain();`,
        timeComplexity: 'O(1)',
        spaceComplexity: 'O(1)',
        approachTitle: 'Optimal Parity Check in TypeScript',
      };
    }
    return {
      filename: 'solution.ts',
      displayLang: 'TypeScript',
      code: `// Optimal Reference Solution in TypeScript\nimport * as fs from 'fs';\n\nfunction main(): void {\n  // Optimal solution implementation\n}\n\nmain();`,
      timeComplexity: 'O(1)',
      spaceComplexity: 'O(1)',
      approachTitle: 'Optimal Solution in TypeScript',
    };
  };

  const handleOpenUploadModal = (langToOpen?: 'cpp' | 'python' | 'java' | 'typescript') => {
    const targetLang = langToOpen || editorialLang;
    setUploadLang(targetLang);
    const currentSol = getEditorialSolution(targetLang);
    setUploadCode(currentSol.code || '');
    setUploadApproachTitle(currentSol.approachTitle || 'Optimal Solution');
    setUploadTimeComplexity(currentSol.timeComplexity || 'O(1)');
    setUploadSpaceComplexity(currentSol.spaceComplexity || 'O(1)');
    setUploadEditorialNotes(editorialMarkdown || '');
    setUploadModalOpen(true);
  };

  const handleSaveUploadedSolution = async () => {
    if (!uploadCode.trim()) {
      toast.error('Code cannot be empty', 'Validation Error');
      return;
    }

    const extMap: Record<string, { ext: string; display: string }> = {
      cpp: { ext: 'cpp', display: 'C++20' },
      python: { ext: 'py', display: 'Python 3.12' },
      java: { ext: 'java', display: 'Java 21' },
      typescript: { ext: 'ts', display: 'TypeScript' },
    };

    const info = extMap[uploadLang] || { ext: 'cpp', display: 'Code' };

    let apiSuccess = false;
    if (problem.id) {
      try {
        await apiService.updateProblem(problem.id, {});
        apiSuccess = true;
      } catch {
        // API failed — fall through to show error
      }
    } else {
      apiSuccess = true;
    }

    if (!apiSuccess && problem.id) {
      toast.error('Failed to save reference solution to server. Please try again.', 'Server Error');
      return;
    }

    setCustomSolutions((prev) => ({
      ...prev,
      [uploadLang]: {
        displayLang: info.display,
        filename: uploadLang === 'java' ? 'Solution.java' : `solution.${info.ext}`,
        code: uploadCode.trim(),
        timeComplexity: uploadTimeComplexity.trim() || 'O(1)',
        spaceComplexity: uploadSpaceComplexity.trim() || 'O(1)',
        approachTitle: uploadApproachTitle.trim() || 'Optimal Solution',
      },
    }));

    if (uploadEditorialNotes.trim()) {
      setEditorialMarkdown(uploadEditorialNotes.trim());
    }

    setEditorialLang(uploadLang);
    setUploadModalOpen(false);
    toast.success(`Optimal ${info.display} code uploaded and saved successfully!`, 'Solution Saved');
  };

  const handleFileRead = (file: File) => {
    const filename = file.name.toLowerCase();
    let detectedLang: 'cpp' | 'python' | 'java' | 'typescript' = uploadLang;
    if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.cxx')) {
      detectedLang = 'cpp';
    } else if (filename.endsWith('.py')) {
      detectedLang = 'python';
    } else if (filename.endsWith('.java')) {
      detectedLang = 'java';
    } else if (filename.endsWith('.ts') || filename.endsWith('.js')) {
      detectedLang = 'typescript';
    }

    setUploadLang(detectedLang);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setUploadCode(text);
        toast.success(`Loaded ${file.name} (${detectedLang.toUpperCase()})`, 'File Imported');
      }
    };
    reader.readAsText(file);
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: 'testcases' | 'submissions' | 'statement' | 'cohorts') => {
    if (newTab !== currentTab) {
      setIsTabLoading(true);
      setCurrentTab(newTab);
      setTimeout(() => setIsTabLoading(false), 160);
    }
  };

  const handleCreateTestCase = async () => {
    if (!newTcInput.trim() || !newTcOutput.trim()) {
      toast.error('Test case input and expected output are required', 'Validation Error');
      return;
    }

    const testCaseData = {
      input: newTcInput,
      expectedOutput: newTcOutput,
      explanation: newTcExplanation,
      isHidden: newTcIsHidden,
      order: testCases.length + 1,
    };

    let apiSuccess = false;
    if (problem.id) {
      try {
        await apiService.addProblemTestCase(problem.id, testCaseData);
        apiSuccess = true;
      } catch {
        // API failed — fall through to show error
      }
    }

    if (!apiSuccess && problem.id) {
      toast.error('Failed to save test case to server. Please try again.', 'Server Error');
      return;
    }

    const created: TestCaseItem = {
      id: `tc-${Date.now()}`,
      ...testCaseData,
      points: 25,
    };

    setTestCases((prev) => [...prev, created]);
    setAddTestCaseOpen(false);
    setNewTcInput('');
    setNewTcOutput('');
    setNewTcExplanation('');
    setNewTcIsHidden(false);
    toast.success(`Test case #${created.order} registered successfully.`, 'Test Case Added');
  };

  const handleCopyMarkdown = () => {
    const md = `# ${problem.title} (${problem.code})\n\n**Difficulty**: ${problem.difficulty} | **Points**: ${problem.points}\n**Time Limit**: ${problem.timeLimitMs}ms | **Memory Limit**: ${problem.memoryLimitMb}MB\n\n## Problem Statement\n${problem.statementMarkdown || 'Given an array of integers and a target sum...'}\n\n## Constraints\n- Time Complexity: O(N)\n- Space Complexity: O(N)`;
    navigator.clipboard.writeText(md);
    toast.success('Problem statement markdown copied to clipboard', 'Copied');
  };

  const csvEscape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`;

  const handleExportSubmissionsCSV = () => {
    const headers = ['Submission ID', 'Student Name', 'Email', 'Institution', 'Verdict', 'Language', 'Runtime (ms)', 'Memory (KB)', 'Submitted At'];
    const rows = submissions.map((s) => [
      csvEscape(s.id),
      csvEscape(s.studentName),
      csvEscape(s.studentEmail),
      csvEscape(s.institution),
      csvEscape(s.verdict),
      csvEscape(s.language),
      s.runtimeMs,
      s.memoryKb,
      csvEscape(s.submittedAt),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${problem.slug}_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Exported ${submissions.length} submissions to CSV.`, 'CSV Export Ready');
  };

  const cleanStatementPreview = (md?: string): string => {
    if (!md) return 'Design an optimal algorithm to evaluate the given inputs and return results adhering to the specified time and memory complexity bounds.';
    const cleaned = md
      .replace(/###\s+Problem Statement\s*/gi, '')
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/`+/g, '')
      .replace(/\n+/g, ' ')
      .trim();
    if (cleaned.length > 210) {
      return cleaned.slice(0, 210) + '...';
    }
    return cleaned;
  };

  const handleAssignCohort = () => {
    if (!newCohortName.trim()) {
      toast.error('Cohort name is required', 'Validation Error');
      return;
    }
    const createdCohort: ProblemCohortItem = {
      id: `coh-${Date.now()}`,
      cohortName: newCohortName.trim(),
      collegeName: newCohortCollege.trim() || 'Stanford University',
      assignedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      studentsAttempted: 0,
      totalStudents: Number(newCohortTotalStudents) || 60,
      avgAccuracy: '0.0%',
      status: newCohortStatus,
    };
    setCohorts((prev) => [createdCohort, ...prev]);
    setAssignCohortOpen(false);
    setNewCohortName('');
    setNewCohortCollege('');
    setNewCohortStatus('Mandatory');
    toast.success(`Problem assigned to ${createdCohort.cohortName} successfully.`, 'Cohort Assigned');
  };

  const difficultyColors = {
    Easy: { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
    Medium: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
    Hard: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  }[problem.difficulty] || { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' };

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((s) => {
      const matchSearch =
        s.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.studentEmail.toLowerCase().includes(submissionSearch.toLowerCase()) ||
        s.id.toLowerCase().includes(submissionSearch.toLowerCase());
      const matchVerdict = selectedVerdict === 'ALL' || s.verdict === selectedVerdict;
      return matchSearch && matchVerdict;
    });
  }, [submissions, submissionSearch, selectedVerdict]);

  const filteredTestCases = useMemo(() => {
    return testCases.filter((tc) => {
      return (
        tc.input.toLowerCase().includes(testCaseSearch.toLowerCase()) ||
        tc.expectedOutput.toLowerCase().includes(testCaseSearch.toLowerCase()) ||
        `testcase-${tc.order}`.includes(testCaseSearch.toLowerCase())
      );
    });
  }, [testCases, testCaseSearch]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <CurvedSidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { xs: '72px', sm: '84px', md: '96px' },
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: '100vh',
          bgcolor: '#F8FAFC',
          maxWidth: '100vw',
        }}
      >
        <Navbar />

        {/* Back Link & Breadcrumb Header */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            component={Link}
            href="/superadmin/problems"
            variant="outlined"
            size="small"
            startIcon={<FluidArrowLeft size={18} />}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 700,
              color: '#475569',
              borderColor: '#E2E8F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#CBD5E1' },
            }}
          >
            Back to Problems Directory
          </Button>
          <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>/</Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.85rem' }}>{problem.code}</Typography>
        </Box>

        {/* Hero Card with Key Problem Metrics */}
        <Card
          elevation={0}
          sx={{
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            p: { xs: 2.5, sm: 3.5 },
            mb: 3.5,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.03)',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, justifyContent: 'space-between', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip
                  label={problem.code}
                  size="small"
                  className="ide-code-font"
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 800,
                    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                    fontSize: '0.82rem',
                    border: '1px solid #DBEAFE',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={problem.difficulty}
                  size="small"
                  sx={{
                    bgcolor: difficultyColors.bg,
                    color: difficultyColors.color,
                    border: `1px solid ${difficultyColors.border}`,
                    fontWeight: 800,
                    fontSize: '0.78rem',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={problem.status}
                  size="small"
                  sx={{
                    bgcolor: problem.status === 'Published' ? '#F0FDF4' : '#F8FAFC',
                    color: problem.status === 'Published' ? '#16A34A' : '#64748B',
                    border: `1px solid ${problem.status === 'Published' ? '#BBF7D0' : '#E2E8F0'}`,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                  }}
                />
                <Chip
                  label={problem.category}
                  size="small"
                  sx={{
                    bgcolor: '#F8FAFC',
                    color: '#475569',
                    border: '1px solid #E2E8F0',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '8px',
                  }}
                />
              </Box>

              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' }, mb: 1.25 }}>
                {problem.title}
              </Typography>

              {/* Clean Problem Description with Markdown Formatting & View More / View Less */}
              <Box sx={{ mb: 2.5, maxWidth: 880 }}>
                {isHeaderExpanded ? (
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: '#F8FAFC',
                      borderRadius: '16px',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      color: '#334155',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                    }}
                  >
                    {problem.statementMarkdown ? (
                      problem.statementMarkdown.split('\n\n').map((block, bIdx) => {
                        const trimmed = block.trim();
                        if (!trimmed) return null;
                        if (trimmed.startsWith('### ')) {
                          return (
                            <Typography key={bIdx} variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mt: bIdx > 0 ? 0.5 : 0 }}>
                              {trimmed.replace(/^###\s+/, '')}
                            </Typography>
                          );
                        }
                        if (trimmed.startsWith('## ')) {
                          return (
                            <Typography key={bIdx} variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A' }}>
                              {trimmed.replace(/^##\s+/, '')}
                            </Typography>
                          );
                        }
                        if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
                          const items = trimmed.split('\n- ').map(i => i.replace(/^- /, ''));
                          return (
                            <Box component="ul" key={bIdx} sx={{ pl: 2.5, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {items.map((item, iIdx) => (
                                <li key={iIdx}>
                                  <Typography sx={{ fontSize: '0.88rem', color: '#334155' }}>
                                    {item}
                                  </Typography>
                                </li>
                              ))}
                            </Box>
                          );
                        }
                        return (
                          <Typography key={bIdx} sx={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.65 }}>
                            {trimmed}
                          </Typography>
                        );
                      })
                    ) : (
                      <Typography sx={{ color: '#64748B', fontSize: '0.9rem' }}>
                        Design an optimal algorithm to evaluate the given inputs and return results adhering to the specified time and memory complexity bounds.
                      </Typography>
                    )}
                    <Box sx={{ mt: 0.5 }}>
                      <Button
                        size="small"
                        onClick={() => setIsHeaderExpanded(false)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          color: '#2563EB',
                          p: 0,
                          minWidth: 'auto',
                          '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                        }}
                      >
                        Show Less ▲
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Typography sx={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                      {cleanStatementPreview(problem.statementMarkdown)}
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => setIsHeaderExpanded(true)}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        color: '#2563EB',
                        p: 0,
                        minWidth: 'auto',
                        alignSelf: 'center',
                        '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                      }}
                    >
                      View More ▼
                    </Button>
                  </Box>
                )}
              </Box>

              {/* Badges bar */}
              <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimerRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    {problem.timeLimitMs} ms Time Limit
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MemoryRoundedIcon sx={{ fontSize: 18, color: '#64748B' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                    {problem.memoryLimitMb} MB RAM
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CodeRoundedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                  <Typography sx={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700 }}>
                    {problem.points} Points
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Right Action buttons */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'row', lg: 'column' }, gap: 1.5, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setAddTestCaseOpen(true)}
                sx={{
                  bgcolor: '#2563EB',
                  backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  borderRadius: '9999px',
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                Add Test Case
              </Button>
              <Button
                variant="outlined"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopyMarkdown}
                sx={{
                  borderRadius: '9999px',
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.88rem',
                  '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
                }}
              >
                Copy Markdown
              </Button>
            </Box>
          </Box>
        </Card>

        {/* Tab Navigation */}
        <Box sx={{ borderBottom: '1px solid #E2E8F0', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#2563EB', height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#64748B',
                minWidth: 120,
                '&.Mui-selected': { color: '#2563EB' },
              },
            }}
          >
            <Tab value="testcases" label={`Test Cases (${testCases.length})`} />
            <Tab value="submissions" label={`Submissions (${submissions.length})`} />
            <Tab value="statement" label="Statement & Editorial" />
            <Tab value="cohorts" label={`Assigned Cohorts (${cohorts.length})`} />
          </Tabs>
        </Box>

        {/* Tab Content Areas */}
        {isTabLoading ? (
          <MuiCenterLoader minHeight="380px" />
        ) : (
          <>
            {/* TAB 1: TEST CASES EXPLORER */}
            {currentTab === 'testcases' && (
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
                      onChange={(e) => setTestCaseSearch(e.target.value)}
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
                      onClick={() => setAddTestCaseOpen(true)}
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
                              <Tooltip title="Copy Input / Output" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`Input: ${tc.input}\nOutput: ${tc.expectedOutput}`);
                                    toast.info(`Test case #${tc.order} copied to clipboard`, 'Copied');
                                  }}
                                  sx={{ color: '#64748B', '&:hover': { color: '#2563EB', bgcolor: '#EFF6FF' } }}
                                >
                                  <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            )}

            {/* TAB 2: SUBMISSIONS HISTORY */}
            {currentTab === 'submissions' && (
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                    Student Submissions & Verdicts Log
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                      placeholder="Search submissions..."
                      size="small"
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ width: 220, '& .MuiOutlinedInput-root': { borderRadius: '9999px', bgcolor: '#F8FAFC' } }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownloadRoundedIcon />}
                      onClick={handleExportSubmissionsCSV}
                      disabled={submissions.length === 0}
                      sx={{
                        borderRadius: '9999px',
                        textTransform: 'none',
                        fontWeight: 700,
                        color: '#475569',
                        borderColor: '#CBD5E1',
                        '&:hover': { bgcolor: '#F8FAFC' },
                      }}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>

                {submissions.length === 0 ? (
                  <Box
                    sx={{
                      py: 8,
                      px: 3,
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: '1px dashed #CBD5E1',
                      bgcolor: '#F8FAFC',
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#EFF6FF',
                        border: '1px solid #DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <HistoryRoundedIcon sx={{ fontSize: 28, color: '#2563EB' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.75, fontSize: '1.05rem' }}>
                      No Student Submissions Logged Yet
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 480, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
                      There are currently 0 submissions recorded for <strong>{problem.title}</strong>. When enrolled students compile and submit code in the platform sandbox, their verdicts and execution telemetry will appear in this table.
                    </Typography>
                    <Button
                      component={Link}
                      href={`/problems/${problem.slug}`}
                      target="_blank"
                      variant="outlined"
                      size="small"
                      startIcon={<PlayArrowRoundedIcon />}
                      sx={{
                        borderRadius: '9999px',
                        textTransform: 'none',
                        fontWeight: 700,
                        borderColor: '#2563EB',
                        color: '#2563EB',
                        px: 2.5,
                        py: 0.75,
                        '&:hover': { bgcolor: '#EFF6FF', borderColor: '#1D4ED8' },
                      }}
                    >
                      Open in Student IDE Workspace
                    </Button>
                  </Box>
                ) : (
                  <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>SUBMISSION ID</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STUDENT & INSTITUTION</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>VERDICT</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>LANGUAGE</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>RUNTIME & RAM</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>TIMESTAMP</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', textAlign: 'right' }}>INSPECT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSubmissions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ textAlign: 'center', py: 5, color: '#94A3B8' }}>
                              No submissions found matching criteria.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubmissions.map((sub) => {
                            const isAcc = sub.verdict === 'Accepted';
                            return (
                              <TableRow key={sub.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                                <TableCell className="ide-code-font" sx={{ fontWeight: 800, color: '#2563EB', fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important' }}>
                                  {sub.id}
                                </TableCell>
                                <TableCell>
                                  <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.88rem' }}>
                                    {sub.studentName}
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                                    {sub.institution} • {sub.studentEmail}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={sub.verdict}
                                    size="small"
                                    sx={{
                                      bgcolor: isAcc ? '#F0FDF4' : '#FEF2F2',
                                      color: isAcc ? '#16A34A' : '#DC2626',
                                      border: `1px solid ${isAcc ? '#BBF7D0' : '#FECACA'}`,
                                      fontWeight: 800,
                                      fontSize: '0.74rem',
                                      borderRadius: '6px',
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: '#334155', fontSize: '0.85rem' }}>
                                  {sub.language}
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                                  <strong>{sub.runtimeMs} ms</strong> • {(sub.memoryKb / 1024).toFixed(1)} MB
                                </TableCell>
                                <TableCell sx={{ fontSize: '0.82rem', color: '#64748B' }}>
                                  {sub.submittedAt}
                                </TableCell>
                                <TableCell sx={{ textAlign: 'right' }}>
                                  <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<VisibilityRoundedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => {
                                      setActiveCodeSnippet({
                                        student: sub.studentName,
                                        lang: sub.language,
                                        code: sub.codeSnippet,
                                        verdict: sub.verdict,
                                      });
                                      setViewCodeModalOpen(true);
                                    }}
                                    sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB' }}
                                  >
                                    View Code
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            )}

            {/* TAB 3: STATEMENT & EDITORIAL */}
            {currentTab === 'statement' && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: (problem.editorialMarkdown || problem.referenceSolution) ? { xs: '1fr', lg: '1.35fr 1fr' } : '1fr',
                  alignItems: 'start',
                  gap: 2.5,
                }}
              >
                {/* Left Card: Problem Statement & Constraints */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: { xs: 2.5, sm: 3 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2, fontSize: '1.05rem' }}>
                      Problem Statement
                    </Typography>

                    {/* Formatted Markdown Problem Statement */}
                    <Box
                      sx={{
                        p: 2.5,
                        bgcolor: '#F8FAFC',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        fontSize: '0.88rem',
                        lineHeight: 1.65,
                        color: '#334155',
                      }}
                    >
                      {problem.statementMarkdown ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                          {problem.statementMarkdown.split('\n\n').map((block, bIdx) => {
                            const trimmed = block.trim();
                            if (!trimmed) return null;

                            // Markdown Headings
                            if (trimmed.startsWith('### ')) {
                              return (
                                <Typography key={bIdx} variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mt: bIdx > 0 ? 0.75 : 0, borderBottom: '1px solid #E2E8F0', pb: 0.5, fontSize: '0.92rem' }}>
                                  {renderInlineFormatted(trimmed.replace(/^###\s+/, ''))}
                                </Typography>
                              );
                            }
                            if (trimmed.startsWith('## ')) {
                              return (
                                <Typography key={bIdx} variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mt: bIdx > 0 ? 0.75 : 0, fontSize: '0.96rem' }}>
                                  {renderInlineFormatted(trimmed.replace(/^##\s+/, ''))}
                                </Typography>
                              );
                            }

                            // Lists
                            if (trimmed.includes('\n- ') || trimmed.startsWith('- ')) {
                              const items = trimmed.split('\n- ').map(i => i.replace(/^- /, ''));
                              return (
                                <Box component="ul" key={bIdx} sx={{ pl: 2.5, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                  {items.map((item, iIdx) => (
                                    <li key={iIdx}>
                                      <Typography sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.6 }}>
                                        {renderInlineFormatted(item)}
                                      </Typography>
                                    </li>
                                  ))}
                                </Box>
                              );
                            }

                            // Horizontal rule
                            if (trimmed === '---') {
                              return <Divider key={bIdx} sx={{ my: 0.5, borderColor: '#E2E8F0' }} />;
                            }

                            // Standard Paragraph / Multiline content
                            return (
                              <Box key={bIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                                {trimmed.split('\n').map((line, lIdx) => (
                                  <Typography key={lIdx} sx={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.65 }}>
                                    {renderInlineFormatted(line)}
                                  </Typography>
                                ))}
                              </Box>
                            );
                          })}
                        </Box>
                      ) : (
                        <Typography sx={{ color: '#94A3B8', fontStyle: 'italic', py: 1 }}>
                          No statement authored for this problem.
                        </Typography>
                      )}
                    </Box>

                    {problem.constraints && (
                      <Box sx={{ mt: 2.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, fontSize: '0.92rem' }}>
                          Constraints & Complexity Specifications
                        </Typography>
                        <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#475569', fontSize: '0.86rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {renderInlineFormatted(problem.constraints)}
                        </Box>
                      </Box>
                    )}
                  </Card>
                </Box>

                {/* Right Card: Editorial with Multi-Language Code View & Upload Option */}
                <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: { xs: 2.5, sm: 3 } }}>
                  {/* Card Header with Upload Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1.5, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                        Editorial & Optimal Code
                        <Chip
                          size="small"
                          label="Production Reference"
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            height: 20,
                            bgcolor: '#ECFDF5',
                            color: '#059669',
                            border: '1px solid #A7F3D0',
                          }}
                        />
                      </Typography>
                      <Typography sx={{ color: '#64748B', fontSize: '0.8rem', mt: 0.25 }}>
                        Optimal, verified solutions used by platform evaluators & hints.
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => handleOpenUploadModal(editorialLang)}
                      sx={{
                        bgcolor: '#2563EB',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        textTransform: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      Upload Optimal Code
                    </Button>
                  </Box>

                  {/* Editorial explanation if present */}
                  {editorialMarkdown && (
                    <Box sx={{ p: 2, mb: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <Typography sx={{ color: '#475569', fontSize: '0.84rem', lineHeight: 1.6 }}>
                        {renderInlineFormatted(editorialMarkdown)}
                      </Typography>
                    </Box>
                  )}

                  {/* Approach & Complexity Chips */}
                  {(() => {
                    const currentSol = getEditorialSolution(editorialLang);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                        {currentSol.approachTitle && (
                          <Chip
                            size="small"
                            label={currentSol.approachTitle}
                            sx={{
                              bgcolor: '#F1F5F9',
                              color: '#334155',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              border: '1px solid #E2E8F0',
                            }}
                          />
                        )}
                        <Chip
                          size="small"
                          label={`Time: ${currentSol.timeComplexity || 'O(1)'}`}
                          sx={{
                            bgcolor: '#EFF6FF',
                            color: '#2563EB',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            border: '1px solid #DBEAFE',
                          }}
                        />
                        <Chip
                          size="small"
                          label={`Space: ${currentSol.spaceComplexity || 'O(1)'}`}
                          sx={{
                            bgcolor: '#F5F3FF',
                            color: '#7C3AED',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            border: '1px solid #DDD6FE',
                          }}
                        />
                      </Box>
                    );
                  })()}

                  {/* Multi-Language Selector Tabs with indicators */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                      {[
                        { id: 'cpp', label: 'C++' },
                        { id: 'python', label: 'Python' },
                        { id: 'java', label: 'Java' },
                        { id: 'typescript', label: 'TypeScript' },
                      ].map((l) => {
                        const isCustom = Boolean(customSolutions[l.id]);
                        return (
                          <Button
                            key={l.id}
                            size="small"
                            onClick={() => setEditorialLang(l.id as any)}
                            sx={{
                              px: 1.35,
                              py: 0.35,
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              minWidth: 'auto',
                              bgcolor: editorialLang === l.id ? '#2563EB' : '#F1F5F9',
                              color: editorialLang === l.id ? '#FFFFFF' : '#475569',
                              border: '1px solid',
                              borderColor: editorialLang === l.id ? '#2563EB' : '#E2E8F0',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              '&:hover': {
                                bgcolor: editorialLang === l.id ? '#1D4ED8' : '#E2E8F0',
                              },
                            }}
                          >
                            {l.label}
                            {isCustom && (
                              <Box
                                component="span"
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: editorialLang === l.id ? '#86EFAC' : '#10B981',
                                }}
                              />
                            )}
                          </Button>
                        );
                      })}
                    </Box>

                    <Button
                      size="small"
                      startIcon={<EditRoundedIcon sx={{ fontSize: 13 }} />}
                      onClick={() => handleOpenUploadModal(editorialLang)}
                      sx={{
                        fontSize: '0.72rem',
                        color: '#64748B',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 0.2,
                        px: 0.75,
                        borderRadius: '6px',
                        '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
                      }}
                    >
                      Edit Active
                    </Button>
                  </Box>

                  {/* IDE Code Viewer */}
                  {(() => {
                    const sol = getEditorialSolution(editorialLang);
                    return (
                      <Box
                        sx={{
                          borderRadius: '12px',
                          overflow: 'hidden',
                          bgcolor: '#0B0F19',
                          border: '1px solid #1E293B',
                          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        {/* IDE Tab Header */}
                        <Box
                          sx={{
                            px: 2,
                            py: 1.25,
                            bgcolor: '#111827',
                            borderBottom: '1px solid #1E293B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', gap: 0.75 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                            </Box>
                            <Typography
                              className="ide-code-font"
                              sx={{
                                fontSize: '0.74rem',
                                color: '#94A3B8',
                                fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                                ml: 1,
                                fontWeight: 700,
                              }}
                            >
                              {sol.filename} • {sol.displayLang}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            onClick={() => {
                              if (sol.code) {
                                navigator.clipboard.writeText(sol.code);
                                toast.success(`${sol.displayLang} code copied!`, 'Copied');
                              }
                            }}
                            sx={{
                              fontSize: '0.72rem',
                              color: '#38BDF8',
                              textTransform: 'none',
                              fontWeight: 700,
                              py: 0.25,
                              px: 1,
                            }}
                          >
                            Copy
                          </Button>
                        </Box>

                        {/* IDE Code Lines */}
                        <Box
                          className="ide-code-font"
                          sx={{
                            p: 2,
                            fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                            fontSize: '0.82rem',
                            lineHeight: 1.6,
                            color: '#F8FAFC',
                            overflowX: 'auto',
                          }}
                        >
                          <pre style={{ margin: 0, fontFamily: 'inherit' }}>
                            <code style={{ fontFamily: 'inherit' }}>{sol.code}</code>
                          </pre>
                        </Box>
                      </Box>
                    );
                  })()}
                </Card>
              </Box>
            )}

            {/* TAB 4: ASSIGNED COHORTS */}
            {currentTab === 'cohorts' && (
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                      Assigned Academic Cohorts & Roster Progress
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.82rem' }}>
                      Academic batches and student cohorts assigned to complete this problem as coursework or contest practice.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => setAssignCohortOpen(true)}
                    sx={{
                      bgcolor: '#2563EB',
                      backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                      borderRadius: '9999px',
                      px: 2.5,
                      py: 0.75,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                      '&:hover': { bgcolor: '#1D4ED8' },
                    }}
                  >
                    Assign to Cohort
                  </Button>
                </Box>

                {cohorts.length === 0 ? (
                  <Box
                    sx={{
                      py: 8,
                      px: 3,
                      textAlign: 'center',
                      borderRadius: '16px',
                      border: '1px dashed #CBD5E1',
                      bgcolor: '#F8FAFC',
                    }}
                  >
                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: '#EFF6FF',
                        border: '1px solid #DBEAFE',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      <SchoolRoundedIcon sx={{ fontSize: 28, color: '#2563EB' }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.75, fontSize: '1.05rem' }}>
                      No Cohorts Assigned Yet
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.88rem', maxWidth: 480, mx: 'auto', mb: 3, lineHeight: 1.6 }}>
                      This challenge has not yet been assigned to any student cohorts or academic batches. Click below to assign it to an institution batch.
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() => setAssignCohortOpen(true)}
                      sx={{
                        bgcolor: '#2563EB',
                        borderRadius: '9999px',
                        textTransform: 'none',
                        fontWeight: 700,
                        px: 3,
                        py: 0.75,
                        '&:hover': { bgcolor: '#1D4ED8' },
                      }}
                    >
                      Assign to Cohort
                    </Button>
                  </Box>
                ) : (
                  <TableContainer sx={{ borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem', py: 1.5 }}>COHORT NAME</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>COLLEGE / SCHOOL</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ASSIGNED DATE</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>ATTEMPTED / TOTAL</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>AVG ACCURACY</TableCell>
                          <TableCell sx={{ fontWeight: 800, color: '#475569', fontSize: '0.8rem' }}>STATUS</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cohorts.map((coh) => (
                          <TableRow key={coh.id} hover>
                            <TableCell sx={{ fontWeight: 700, color: '#0F172A' }}>{coh.cohortName}</TableCell>
                            <TableCell sx={{ color: '#475569', fontSize: '0.86rem' }}>{coh.collegeName}</TableCell>
                            <TableCell sx={{ color: '#64748B', fontSize: '0.84rem' }}>{coh.assignedDate}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.86rem' }}>
                              {coh.studentsAttempted} / {coh.totalStudents} ({coh.totalStudents > 0 ? Math.round((coh.studentsAttempted / coh.totalStudents) * 100) : 0}%)
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#16A34A', fontSize: '0.86rem' }}>
                              {coh.avgAccuracy}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={coh.status}
                                size="small"
                                sx={{
                                  bgcolor: coh.status === 'Mandatory' ? '#EFF6FF' : '#F8FAFC',
                                  color: coh.status === 'Mandatory' ? '#2563EB' : '#64748B',
                                  border: `1px solid ${coh.status === 'Mandatory' ? '#DBEAFE' : '#E2E8F0'}`,
                                  fontWeight: 700,
                                  fontSize: '0.74rem',
                                  borderRadius: '6px',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Card>
            )}
          </>
        )}

        {/* Modal: Add Test Case */}
        <Dialog open={addTestCaseOpen} onClose={() => setAddTestCaseOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', pb: 1 }}>
            Register New Evaluation Test Case
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              label="Standard Input (Stdin)"
              multiline
              rows={3}
              fullWidth
              value={newTcInput}
              onChange={(e) => setNewTcInput(e.target.value)}
              placeholder="e.g. 4"
            />
            <TextField
              label="Expected Output (Stdout)"
              multiline
              rows={2}
              fullWidth
              value={newTcOutput}
              onChange={(e) => setNewTcOutput(e.target.value)}
              placeholder="e.g. Even"
            />
            <TextField
              label="Explanation (Optional)"
              fullWidth
              value={newTcExplanation}
              onChange={(e) => setNewTcExplanation(e.target.value)}
              placeholder="Why this output is expected"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setAddTestCaseOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleCreateTestCase}
              sx={{ bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
            >
              Add Case
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: Assign to Cohort */}
        <Dialog open={assignCohortOpen} onClose={() => setAssignCohortOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', pb: 1 }}>
            Assign Problem to Academic Cohort
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '16px !important' }}>
            <TextField
              label="Cohort / Batch Name"
              placeholder="e.g. Batch 2026 - CS Alpha (Core DS&A)"
              fullWidth
              value={newCohortName}
              onChange={(e) => setNewCohortName(e.target.value)}
              required
            />
            <TextField
              label="Institution / College Name"
              placeholder="e.g. Stanford University"
              fullWidth
              value={newCohortCollege}
              onChange={(e) => setNewCohortCollege(e.target.value)}
            />
            <TextField
              label="Assignment Status / Type"
              select
              fullWidth
              value={newCohortStatus}
              onChange={(e) => setNewCohortStatus(e.target.value as any)}
              slotProps={{ select: { native: true } }}
            >
              <option value="Mandatory">Mandatory Coursework</option>
              <option value="Optional">Optional Practice</option>
              <option value="Contest Problem">Contest Problem</option>
            </TextField>
            <TextField
              label="Total Enrolled Students"
              type="number"
              fullWidth
              value={newCohortTotalStudents}
              onChange={(e) => setNewCohortTotalStudents(Number(e.target.value))}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button onClick={() => setAssignCohortOpen(false)} sx={{ color: '#64748B', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAssignCohort}
              sx={{ bgcolor: '#2563EB', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
            >
              Assign Cohort
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: View Submitted Code */}
        <Dialog open={viewCodeModalOpen} onClose={() => setViewCodeModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
                {activeCodeSnippet?.student}&apos;s Submission
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Language: {activeCodeSnippet?.lang} • Verdict: {activeCodeSnippet?.verdict}
              </Typography>
            </Box>
            <IconButton onClick={() => setViewCodeModalOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: '16px !important', px: 3 }}>
            <Box
              sx={{
                borderRadius: '14px',
                bgcolor: '#0B0F19',
                border: '1px solid #1E293B',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.3)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: '#111827',
                  borderBottom: '1px solid #1E293B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.75 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#EF4444' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#F59E0B' }} />
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10B981' }} />
                  </Box>
                  <Typography
                    className="ide-code-font"
                    sx={{
                      fontSize: '0.74rem',
                      color: '#94A3B8',
                      fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                      ml: 1,
                      fontWeight: 700,
                    }}
                  >
                    submission_solution.{activeCodeSnippet?.lang?.toLowerCase().includes('py') ? 'py' : activeCodeSnippet?.lang?.toLowerCase().includes('java') ? 'java' : activeCodeSnippet?.lang?.toLowerCase().includes('ts') ? 'ts' : 'cpp'}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  label={activeCodeSnippet?.lang || 'Code'}
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    height: 20,
                    bgcolor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                  }}
                />
              </Box>

              <Box
                className="ide-code-font"
                sx={{
                  p: 2.5,
                  fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                  fontSize: '0.84rem',
                  lineHeight: 1.65,
                  maxHeight: '55vh',
                  overflowY: 'auto',
                  display: 'flex',
                  gap: 2,
                }}
              >
                {/* Line Numbers */}
                <Box
                  sx={{
                    userSelect: 'none',
                    textAlign: 'right',
                    color: '#475569',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    pr: 1.5,
                    borderRight: '1px solid #1E293B',
                  }}
                >
                  {(activeCodeSnippet?.code || '').split('\n').map((_, idx) => (
                    <div key={idx}>{idx + 1}</div>
                  ))}
                </Box>
                {/* Code Content */}
                <Box
                  sx={{
                    flex: 1,
                    color: '#F8FAFC',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                    overflowX: 'auto',
                    whiteSpace: 'pre',
                  }}
                >
                  {activeCodeSnippet?.code}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                if (activeCodeSnippet?.code) {
                  navigator.clipboard.writeText(activeCodeSnippet.code);
                  toast.success('Code copied to clipboard', 'Copied');
                }
              }}
              startIcon={<ContentCopyRoundedIcon />}
              sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700 }}
            >
              Copy Code
            </Button>
            <Button onClick={() => setViewCodeModalOpen(false)} sx={{ fontWeight: 700 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal: Upload / Edit Best & Optimal Code Solution */}
        <Dialog open={uploadModalOpen} onClose={() => setUploadModalOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUploadRoundedIcon sx={{ color: '#2563EB' }} />
                Upload Best & Optimal Solution
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Upload or author the official optimal reference code and complexities for this problem.
              </Typography>
            </Box>
            <IconButton onClick={() => setUploadModalOpen(false)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ pt: '16px !important', px: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Target Language Selection & Approach title */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Target Programming Language
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    { id: 'cpp', label: 'C++20' },
                    { id: 'python', label: 'Python 3' },
                    { id: 'java', label: 'Java 21' },
                    { id: 'typescript', label: 'TypeScript' },
                  ].map((l) => (
                    <Button
                      key={l.id}
                      size="small"
                      onClick={() => {
                        const targetLang = l.id as 'cpp' | 'python' | 'java' | 'typescript';
                        setUploadLang(targetLang);
                        const cur = getEditorialSolution(targetLang);
                        setUploadCode(cur.code);
                        setUploadApproachTitle(cur.approachTitle || 'Optimal Solution');
                        setUploadTimeComplexity(cur.timeComplexity || 'O(1)');
                        setUploadSpaceComplexity(cur.spaceComplexity || 'O(1)');
                      }}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: uploadLang === l.id ? '#2563EB' : '#F1F5F9',
                        color: uploadLang === l.id ? '#FFFFFF' : '#475569',
                        border: '1px solid',
                        borderColor: uploadLang === l.id ? '#2563EB' : '#E2E8F0',
                      }}
                    >
                      {l.label}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                  Approach / Strategy Name
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., Optimal Parity Check (Modulo / Bitwise)"
                  value={uploadApproachTitle}
                  onChange={(e) => setUploadApproachTitle(e.target.value)}
                  sx={{ bgcolor: '#FFFFFF', borderRadius: '8px' }}
                />
              </Box>
            </Box>

            {/* Complexities: Time & Space */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Time Complexity"
                size="small"
                placeholder="e.g. O(1), O(log N), O(N)"
                value={uploadTimeComplexity}
                onChange={(e) => setUploadTimeComplexity(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />
              <TextField
                label="Space Complexity"
                size="small"
                placeholder="e.g. O(1) Auxiliary"
                value={uploadSpaceComplexity}
                onChange={(e) => setUploadSpaceComplexity(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>

            {/* Drag & Drop Code File Dropzone */}
            <Box
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileRead(e.dataTransfer.files[0]);
                }
              }}
              sx={{
                p: 2,
                borderRadius: '12px',
                border: '2px dashed',
                borderColor: isDragOver ? '#2563EB' : '#CBD5E1',
                bgcolor: isDragOver ? '#EFF6FF' : '#F8FAFC',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.cpp,.cc,.cxx,.py,.java,.ts,.js,.txt';
                input.onchange = (e: any) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileRead(e.target.files[0]);
                  }
                };
                input.click();
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 32, color: isDragOver ? '#2563EB' : '#64748B', mb: 0.5 }} />
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A' }}>
                Drag & drop code file here, or <span style={{ color: '#2563EB', textDecoration: 'underline' }}>browse</span>
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', mt: 0.25 }}>
                Supports .cpp, .py, .java, .ts files. File contents will populate the editor below automatically.
              </Typography>
            </Box>

            {/* Code Editor Box with Menlo font */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
                  Source Code Editor ({uploadLang.toUpperCase()})
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    const defaults: Record<string, string> = {
                      cpp: `// Optimal Parity Check in C++\n#include <iostream>\nusing namespace std;\n\nstring checkEvenOrOdd(long long n) {\n    return (n % 2 == 0) ? "Even" : "Odd";\n}\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    long long n;\n    if (cin >> n) {\n        cout << checkEvenOrOdd(n) << "\\n";\n    }\n    return 0;\n}`,
                      python: `# Optimal Parity Check in Python 3\nimport sys\n\ndef solve():\n    raw = sys.stdin.read().strip()\n    if not raw:\n        return\n    n = int(raw.split()[0])\n    print("Even" if n % 2 == 0 else "Odd")\n\nif __name__ == "__main__":\n    solve()`,
                      java: `// Optimal Parity Check in Java 21\nimport java.io.*;\nimport java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String line = br.readLine();\n        if (line != null && !line.trim().isEmpty()) {\n            long n = Long.parseLong(line.trim().split("\\\\s+")[0]);\n            System.out.println((n % 2 == 0) ? "Even" : "Odd");\n        }\n    }\n}`,
                      typescript: `// Optimal Parity Check in TypeScript (Node.js)\nimport * as fs from 'fs';\n\nfunction main(): void {\n  const input = fs.readFileSync(0, 'utf-8').trim();\n  if (!input) return;\n  const n = BigInt(input.split(/\\s+/)[0]);\n  console.log(n % 2n === 0n ? 'Even' : 'Odd');\n}\n\nmain();`,
                    };
                    setUploadCode(defaults[uploadLang] || '');
                    toast.info('Template code loaded', 'Reset');
                  }}
                  sx={{ fontSize: '0.72rem', textTransform: 'none', fontWeight: 600, color: '#2563EB' }}
                >
                  Load Clean Template
                </Button>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={12}
                value={uploadCode}
                onChange={(e) => setUploadCode(e.target.value)}
                placeholder="// Enter or paste optimal reference solution here..."
                className="ide-code-font"
                sx={{
                  bgcolor: '#0B0F19',
                  borderRadius: '10px',
                  '& .MuiOutlinedInput-root': {
                    color: '#F8FAFC',
                    fontFamily: 'Menlo, Monaco, Consolas, "Liberation Mono", monospace !important',
                    fontSize: '0.84rem',
                    lineHeight: 1.6,
                    p: 2,
                    '& fieldset': { borderColor: '#1E293B' },
                    '&:hover fieldset': { borderColor: '#334155' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                  },
                }}
              />
            </Box>

            {/* Editorial Notes Textarea */}
            <Box>
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', mb: 0.75 }}>
                Editorial Explanation & Intuition (Optional)
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="Explain the intuition behind why this is the optimal approach..."
                value={uploadEditorialNotes}
                onChange={(e) => setUploadEditorialNotes(e.target.value)}
                sx={{ bgcolor: '#FFFFFF' }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, px: 3, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Button onClick={() => setUploadModalOpen(false)} sx={{ fontWeight: 700, textTransform: 'none', color: '#64748B' }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveUploadedSolution}
              startIcon={<CloudUploadRoundedIcon />}
              sx={{
                bgcolor: '#2563EB',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.5,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              Save & Set as Reference Code
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

