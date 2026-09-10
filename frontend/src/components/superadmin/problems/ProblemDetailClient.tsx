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
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
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

  // Data states
  const [testCases, setTestCases] = useState<TestCaseItem[]>(
    initialTestCases.length > 0
      ? initialTestCases
      : [
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
        ]
  );

  const [submissions, setSubmissions] = useState<ProblemSubmissionItem[]>(
    initialSubmissions.length > 0
      ? initialSubmissions
      : [
          {
            id: 'sub-9812',
            studentName: 'Maya Lin',
            studentEmail: 'm.lin@stuy.edu',
            institution: 'Stuyvesant High School',
            verdict: 'Accepted',
            language: 'C++20',
            runtimeMs: 4,
            memoryKb: 10400,
            submittedAt: 'Today, 11:20 AM',
            codeSnippet: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> mp;\n    for (int i = 0; i < nums.size(); ++i) {\n        int comp = target - nums[i];\n        if (mp.count(comp)) return {mp[comp], i};\n        mp[nums[i]] = i;\n    }\n    return {};\n}`,
          },
          {
            id: 'sub-9804',
            studentName: 'Liam Vance',
            studentEmail: 'l.vance@stanford.edu',
            institution: 'Stanford University',
            verdict: 'Accepted',
            language: 'Python 3',
            runtimeMs: 48,
            memoryKb: 18200,
            submittedAt: 'Today, 10:15 AM',
            codeSnippet: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        seen = {}\n        for i, val in enumerate(nums):\n            rem = target - val\n            if rem in seen:\n                return [seen[rem], i]\n            seen[val] = i\n        return []`,
          },
          {
            id: 'sub-9780',
            studentName: 'Alex Rivera',
            studentEmail: 'arivera@mit.edu',
            institution: 'MIT',
            verdict: 'Time Limit Exceeded',
            language: 'Java 21',
            runtimeMs: 2050,
            memoryKb: 42000,
            submittedAt: 'Yesterday, 04:30 PM',
            codeSnippet: `// Brute force O(N^2) submission resulting in TLE on large hidden test cases`,
          },
          {
            id: 'sub-9755',
            studentName: 'Devin Sharma',
            studentEmail: 'devin.s@iitd.ac.in',
            institution: 'IIT Delhi',
            verdict: 'Wrong Answer',
            language: 'TypeScript',
            runtimeMs: 62,
            memoryKb: 24100,
            submittedAt: '2 days ago',
            codeSnippet: `function twoSum(nums: number[], target: number): number[] {\n  return [0, 1]; // Incorrect static assumption\n}`,
          },
        ]
  );

  const [cohorts, setCohorts] = useState<ProblemCohortItem[]>(
    initialCohorts.length > 0
      ? initialCohorts
      : [
          {
            id: 'coh-1',
            cohortName: 'Batch 2026 - CS Alpha (Core DS&A)',
            collegeName: 'Stanford University',
            assignedDate: 'Feb 10, 2026',
            studentsAttempted: 142,
            totalStudents: 148,
            avgAccuracy: '88.4%',
            status: 'Mandatory',
          },
          {
            id: 'coh-2',
            cohortName: 'Batch 2026 - EECS Systems',
            collegeName: 'MIT',
            assignedDate: 'Feb 12, 2026',
            studentsAttempted: 120,
            totalStudents: 132,
            avgAccuracy: '82.0%',
            status: 'Mandatory',
          },
          {
            id: 'coh-3',
            cohortName: 'USACO Gold Competitive Group',
            collegeName: 'Stuyvesant High School',
            assignedDate: 'Feb 15, 2026',
            studentsAttempted: 35,
            totalStudents: 35,
            avgAccuracy: '96.2%',
            status: 'Contest Problem',
          },
        ]
  );

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

  const [viewCodeModalOpen, setViewCodeModalOpen] = useState(false);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<{ student: string; lang: string; code: string; verdict: string } | null>(null);

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
            startIcon={<ArrowBackRoundedIcon />}
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
                  sx={{
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    fontWeight: 800,
                    fontFamily: 'monospace',
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

              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.4rem', sm: '1.75rem' }, mb: 1 }}>
                {problem.title}
              </Typography>

              <Typography sx={{ color: '#64748B', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: 840, mb: 2.5 }}>
                {problem.statementMarkdown
                  ? problem.statementMarkdown.slice(0, 180) + '...'
                  : 'Design an optimal algorithm to evaluate the given inputs and return results adhering to the specified time and memory complexity bounds.'}
              </Typography>

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
                              <TableCell sx={{ fontWeight: 800, color: '#2563EB', fontFamily: 'monospace' }}>
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
              </Card>
            )}

            {/* TAB 3: STATEMENT & EDITORIAL */}
            {currentTab === 'statement' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Problem Statement
                  </Typography>
                  <Box
                    sx={{
                      p: 2.5,
                      bgcolor: '#F8FAFC',
                      borderRadius: '14px',
                      border: '1px solid #F1F5F9',
                      fontSize: '0.92rem',
                      lineHeight: 1.7,
                      color: '#334155',
                      mb: 3,
                    }}
                  >
                    {problem.statementMarkdown || (
                      <p>
                        Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                        <br /><br />
                        You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.
                      </p>
                    )}
                  </Box>

                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                    Constraints & Complexity Specifications
                  </Typography>
                  <Box component="ul" sx={{ pl: 2.5, color: '#475569', fontSize: '0.88rem', lineHeight: 1.8 }}>
                    <li><code>2 &le; nums.length &le; 10^5</code></li>
                    <li><code>-10^9 &le; nums[i] &le; 10^9</code></li>
                    <li><code>-10^9 &le; target &le; 10^9</code></li>
                    <li>Only one valid answer exists.</li>
                    <li>Target Time Complexity: <strong>O(N)</strong></li>
                    <li>Target Space Complexity: <strong>O(N)</strong></li>
                  </Box>
                </Card>

                <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 2 }}>
                    Editorial & Reference Solution
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: '0.85rem', mb: 2 }}>
                    Using a Hash Map (O(N) time, O(N) space):
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: '#0F172A',
                      color: '#38BDF8',
                      fontFamily: 'monospace',
                      fontSize: '0.82rem',
                      borderRadius: '12px',
                      overflowX: 'auto',
                    }}
                  >
                    {`// Optimal Hash Map Look-up\nvector<int> twoSum(vector<int>& nums, int target) {\n  unordered_map<int, int> mp;\n  for (int i = 0; i < nums.size(); ++i) {\n    int comp = target - nums[i];\n    if (mp.count(comp)) return {mp[comp], i};\n    mp[nums[i]] = i;\n  }\n  return {};\n}`}
                  </Box>
                </Card>
              </Box>
            )}

            {/* TAB 4: ASSIGNED COHORTS */}
            {currentTab === 'cohorts' && (
              <Card elevation={0} sx={{ borderRadius: '20px', border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem' }}>
                    Assigned Academic Cohorts & Roster Progress
                  </Typography>
                </Box>

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
                            {coh.studentsAttempted} / {coh.totalStudents} ({Math.round((coh.studentsAttempted / coh.totalStudents) * 100)}%)
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
              placeholder="e.g. nums = [2,7,11,15], target = 9"
            />
            <TextField
              label="Expected Output (Stdout)"
              multiline
              rows={2}
              fullWidth
              value={newTcOutput}
              onChange={(e) => setNewTcOutput(e.target.value)}
              placeholder="e.g. [0,1]"
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
          <DialogContent sx={{ pt: '16px !important' }}>
            <Box
              sx={{
                p: 2.5,
                bgcolor: '#0B0F19',
                color: '#38BDF8',
                borderRadius: '12px',
                fontFamily: 'monospace',
                fontSize: '0.86rem',
                maxHeight: '60vh',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}
            >
              {activeCodeSnippet?.code}
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
      </Box>
    </Box>
  );
}
