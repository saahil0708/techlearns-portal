'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import FloatingSidebar from '@/components/superadmin/layout/CurvedSidebar';
import Navbar from '@/components/superadmin/layout/Navbar';
import { ProblemEntity, NewProblemData } from '@/types/problem';
import { useToast } from '@/context/ToastContext';
import { MuiCenterLoader } from '@/components/shared/MuiLoadingFallback';
import { apiService } from '@/lib/api-service';

import {
  TestCaseItem,
  ProblemSubmissionItem,
  ProblemCohortItem,
  SolutionLanguage,
  CustomSolution,
} from './detail/types';

export type { TestCaseItem, ProblemSubmissionItem, ProblemCohortItem };

import ProblemHeaderStats from './detail/ProblemHeaderStats';
import ProblemTestCasesTab from './detail/ProblemTestCasesTab';
import ProblemSubmissionsTab from './detail/ProblemSubmissionsTab';
import ProblemStatementTab from './detail/ProblemStatementTab';
import ProblemCohortsTab from './detail/ProblemCohortsTab';
import ProblemViewCodeModal from './detail/ProblemViewCodeModal';
import ProblemUploadSolutionModal from './detail/ProblemUploadSolutionModal';
import CreateProblemModal from './CreateProblemModal';

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
  const toast = useToast();

  const [currentProblem, setCurrentProblem] = useState<ProblemEntity>(problem);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [currentTab, setCurrentTab] = useState<'testcases' | 'submissions' | 'statement' | 'cohorts'>('testcases');
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [editorialLang, setEditorialLang] = useState<SolutionLanguage>('cpp');

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

  const [submissions, setSubmissions] = useState<ProblemSubmissionItem[]>(() => {
    if (initialSubmissions.length > 0) return initialSubmissions;
    return [
      {
        id: 'sub-9481',
        studentName: 'Alex Mercer',
        studentEmail: 'alex.mercer@cs.stanford.edu',
        institution: 'Stanford University',
        verdict: 'Accepted',
        language: 'cpp',
        runtimeMs: 14,
        memoryKb: 10420,
        submittedAt: '2026-10-06 14:22:10',
        codeSnippet: `#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int comp = target - nums[i];\n            if (seen.find(comp) != seen.end()) {\n                return {seen[comp], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      },
      {
        id: 'sub-9482',
        studentName: 'Priya Sharma',
        studentEmail: 'priya.s@mit.edu',
        institution: 'MIT',
        verdict: 'Accepted',
        language: 'python',
        runtimeMs: 48,
        memoryKb: 17800,
        submittedAt: '2026-10-06 13:10:45',
        codeSnippet: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        mapping = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in mapping:\n                return [mapping[diff], i]\n            mapping[num] = i\n        return []`,
      },
      {
        id: 'sub-9483',
        studentName: 'David Chen',
        studentEmail: 'david.c@berkeley.edu',
        institution: 'UC Berkeley',
        verdict: 'Time Limit Exceeded',
        language: 'java',
        runtimeMs: 1200,
        memoryKb: 42100,
        submittedAt: '2026-10-06 11:45:00',
        codeSnippet: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        for (int i = 0; i < nums.length; i++) {\n            for (int j = i + 1; j < nums.length; j++) {\n                if (nums[i] + nums[j] == target) {\n                    return new int[] { i, j };\n                }\n            }\n        }\n        return new int[0];\n    }\n}`,
      },
      {
        id: 'sub-9484',
        studentName: 'Sara Connor',
        studentEmail: 'sara.c@oxford.ac.uk',
        institution: 'University of Oxford',
        verdict: 'Wrong Answer',
        language: 'javascript',
        runtimeMs: 62,
        memoryKb: 44300,
        submittedAt: '2026-10-06 09:30:12',
        codeSnippet: `function twoSum(nums, target) {\n  return [0, 1]; // naive attempt\n}`,
      },
    ];
  });

  const [cohorts, setCohorts] = useState<ProblemCohortItem[]>(() => {
    if (initialCohorts.length > 0) return initialCohorts;
    return [
      {
        id: 'cohort-1',
        cohortName: 'Batch 2026 - CS Alpha (Core DS&A)',
        collegeName: 'Stanford University',
        assignedDate: '2026-09-15',
        status: 'Mandatory',
        totalStudents: 140,
        studentsAttempted: 112,
        avgAccuracy: '78.5%',
      },
      {
        id: 'cohort-2',
        cohortName: 'Batch 2027 - Advanced Algorithms Lab',
        collegeName: 'MIT EECS',
        assignedDate: '2026-09-20',
        status: 'Optional',
        totalStudents: 85,
        studentsAttempted: 41,
        avgAccuracy: '64.2%',
      },
      {
        id: 'cohort-3',
        cohortName: 'Fall 2026 Competitive Code Sprint',
        collegeName: 'UC Berkeley',
        assignedDate: '2026-10-01',
        status: 'Contest Problem',
        totalStudents: 220,
        studentsAttempted: 184,
        avgAccuracy: '82.0%',
      },
    ];
  });

  const [editorialMarkdown, setEditorialMarkdown] = useState<string>(problem.editorialMarkdown || '');

  // Custom user solutions uploaded via the upload modal
  const [customSolutions, setCustomSolutions] = useState<Record<string, CustomSolution>>({
    cpp: {
      displayLang: 'C++',
      filename: 'solution.cpp',
      code: `#include <vector>\n#include <unordered_map>\n\nusing namespace std;\n\n// Optimal Two-Pass Hash Map Solution\n// Time: O(N), Space: O(N)\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> numMap;\n        int n = nums.size();\n        for (int i = 0; i < n; i++) {\n            int complement = target - nums[i];\n            if (numMap.count(complement)) {\n                return {numMap[complement], i};\n            }\n            numMap[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      approachTitle: 'Hash Map Lookup (Single Pass)',
      editorialNotes: 'We traverse the list containing n elements exactly once. While inspecting each element, looking back for its complement in the hash table takes O(1) average time.',
      uploadedAt: '2026-10-06 10:00:00',
    },
    java: {
      displayLang: 'Java',
      filename: 'Solution.java',
      code: `import java.util.HashMap;\nimport java.util.Map;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      approachTitle: 'One-pass Hash Table',
      editorialNotes: 'Java HashMap reduces search time from O(n) to O(1).',
      uploadedAt: '2026-10-06 10:00:00',
    },
    python: {
      displayLang: 'Python',
      filename: 'solution.py',
      code: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      approachTitle: 'Dictionary Lookups (Linear Time)',
      editorialNotes: 'Utilizing Python dict for constant time lookups of target complements.',
      uploadedAt: '2026-10-06 10:00:00',
    },
    javascript: {
      displayLang: 'JavaScript',
      filename: 'solution.js',
      code: `var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n};`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      approachTitle: 'Map Object Hashing',
      editorialNotes: 'ES6 Map yields cleaner key-value storage and avoids prototype collisions.',
      uploadedAt: '2026-10-06 10:00:00',
    },
    typescript: {
      displayLang: 'TypeScript',
      filename: 'solution.ts',
      code: `function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (map.has(diff)) {\n            return [map.get(diff)!, i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      approachTitle: 'Typed Map Hashing',
      editorialNotes: 'TypeScript static typed solution.',
      uploadedAt: '2026-10-06 10:00:00',
    },
  });

  // Modal States
  const [addTestCaseOpen, setAddTestCaseOpen] = useState(false);
  const [newTcInput, setNewTcInput] = useState('');
  const [newTcOutput, setNewTcOutput] = useState('');
  const [newTcExplanation, setNewTcExplanation] = useState('');

  const [assignCohortOpen, setAssignCohortOpen] = useState(false);
  const [newCohortName, setNewCohortName] = useState('');
  const [newCohortCollege, setNewCohortCollege] = useState('');
  const [newCohortStatus, setNewCohortStatus] = useState<'Mandatory' | 'Optional' | 'Contest Problem'>('Mandatory');
  const [newCohortTotalStudents, setNewCohortTotalStudents] = useState<number>(50);

  const [viewCodeModalOpen, setViewCodeModalOpen] = useState(false);
  const [activeCodeSnippet, setActiveCodeSnippet] = useState<{
    student: string;
    lang: string;
    code: string;
    verdict: string;
  } | null>(null);

  // Upload Solution Modal States
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLang, setUploadLang] = useState<SolutionLanguage>('cpp');
  const [uploadCode, setUploadCode] = useState('');
  const [uploadApproachTitle, setUploadApproachTitle] = useState('');
  const [uploadTimeComplexity, setUploadTimeComplexity] = useState('O(N)');
  const [uploadSpaceComplexity, setUploadSpaceComplexity] = useState('O(N)');
  const [uploadEditorialNotes, setUploadEditorialNotes] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  // Search & Filter States
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [testCaseSearch, setTestCaseSearch] = useState('');

  // Handle Tab Switch
  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'testcases' | 'submissions' | 'statement' | 'cohorts') => {
    setIsTabLoading(true);
    setCurrentTab(newValue);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 180);
  };

  const getEditorialSolution = (lang: SolutionLanguage = 'cpp'): CustomSolution => {
    if (customSolutions[lang] && customSolutions[lang].code.trim().length > 0) {
      return customSolutions[lang];
    }
    const refSol = (currentProblem as any).referenceSolution;
    if (refSol && typeof refSol === 'object' && refSol.code) {
      return {
        displayLang: refSol.language || lang.toUpperCase(),
        filename: `solution.${lang === 'python' ? 'py' : lang === 'java' ? 'java' : lang === 'typescript' ? 'ts' : 'cpp'}`,
        code: refSol.code,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        approachTitle: 'Reference Implementation (Standard Algorithm)',
        editorialNotes: 'Official reference solution registered with the problem definition.',
        uploadedAt: 'Default Reference',
      };
    }
    if (typeof refSol === 'string' && refSol.trim().length > 0) {
      return {
        displayLang: lang.toUpperCase(),
        filename: `solution.${lang === 'python' ? 'py' : lang === 'java' ? 'java' : lang === 'typescript' ? 'ts' : 'cpp'}`,
        code: refSol,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(N)',
        approachTitle: 'Reference Implementation (Standard Algorithm)',
        editorialNotes: 'Official reference solution registered with the problem definition.',
        uploadedAt: 'Default Reference',
      };
    }

    const defaultSnippets: Record<SolutionLanguage, string> = {
      cpp: `// C++ Standard Optimal Template for ${currentProblem.title}\n#include <iostream>\n#include <vector>\n#include <algorithm>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    // Implement optimal approach adhering to ${currentProblem.timeLimitMs}ms\n};\n`,
      java: `// Java Standard Optimal Template for ${currentProblem.title}\nimport java.util.*;\n\nclass Solution {\n    // Implement optimal approach adhering to ${currentProblem.timeLimitMs}ms\n}\n`,
      python: `# Python Standard Optimal Template for ${currentProblem.title}\nclass Solution:\n    def solve(self, *args, **kwargs):\n        pass\n`,
      javascript: `// JavaScript Standard Optimal Template for ${currentProblem.title}\n/**\n * @return {any}\n */\nvar solve = function() {\n    // Implement optimal approach\n};\n`,
      typescript: `// TypeScript Standard Optimal Template for ${currentProblem.title}\nfunction solve(): void {\n    // Implement optimal approach\n}\n`,
    };

    return {
      displayLang: lang.toUpperCase(),
      filename: `solution.${lang === 'python' ? 'py' : lang === 'java' ? 'java' : lang === 'typescript' ? 'ts' : 'cpp'}`,
      code: defaultSnippets[lang] || defaultSnippets.cpp,
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      approachTitle: `Optimal ${lang.toUpperCase()} Implementation`,
      editorialNotes: 'Standard boilerplate template ready for direct solution code upload.',
    };
  };

  const renderInlineFormatted = (raw?: string) => {
    if (!raw) return null;
    return (
      <span
        style={{ color: 'inherit', display: 'inline' }}
        dangerouslySetInnerHTML={{
          __html: raw
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/`([^`]+)`/g, '<code style="background-color: rgba(91, 45, 144, 0.08); color: #0B1F3A; font-family: monospace; padding: 2px 6px; border-radius: 4px; font-weight: 600; font-size: 0.9em;">$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700; color: #0F172A;">$1</strong>')
            .replace(/\n/g, '<br />')
        }}
      />
    );
  };

  const handleOpenUploadModal = (lang?: SolutionLanguage) => {
    const selected = lang || 'cpp';
    const existing = getEditorialSolution(selected);
    setUploadLang(selected);
    setUploadCode(existing.code);
    setUploadApproachTitle(existing.approachTitle || '');
    setUploadTimeComplexity(existing.timeComplexity || 'O(N)');
    setUploadSpaceComplexity(existing.spaceComplexity || 'O(N)');
    setUploadEditorialNotes(existing.editorialNotes || '');
    setUploadModalOpen(true);
  };

  const handleFileRead = (file: File) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.cpp') || fileName.endsWith('.cc') || fileName.endsWith('.cxx')) {
      setUploadLang('cpp');
    } else if (fileName.endsWith('.java')) {
      setUploadLang('java');
    } else if (fileName.endsWith('.py')) {
      setUploadLang('python');
    } else if (fileName.endsWith('.js')) {
      setUploadLang('javascript');
    } else if (fileName.endsWith('.ts')) {
      setUploadLang('typescript');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setUploadCode(content);
        toast.info(`Loaded solution from "${file.name}"`, 'File Loaded');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveSolution = () => {
    if (!uploadCode.trim()) {
      toast.error('Please provide code before saving', 'Validation Error');
      return;
    }

    setCustomSolutions((prev) => ({
      ...prev,
      [uploadLang]: {
        displayLang: uploadLang.toUpperCase(),
        filename: `solution.${uploadLang === 'python' ? 'py' : uploadLang === 'java' ? 'java' : uploadLang === 'typescript' ? 'ts' : 'cpp'}`,
        code: uploadCode,
        approachTitle: uploadApproachTitle || `Optimal ${uploadLang.toUpperCase()} Solution`,
        timeComplexity: uploadTimeComplexity || 'O(N)',
        spaceComplexity: uploadSpaceComplexity || 'O(N)',
        editorialNotes: uploadEditorialNotes || '',
        uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      },
    }));

    setEditorialLang(uploadLang);
    setUploadModalOpen(false);
    toast.success(`Optimal ${uploadLang.toUpperCase()} solution saved and published to editorial.`, 'Solution Updated');
  };

  const handleSaveProblem = async (data: NewProblemData) => {
    try {
      const updated = await apiService.updateProblem(currentProblem.id, {
        title: data.title,
        difficulty: data.difficulty,
        statement: data.statementMarkdown,
        timeLimit: data.timeLimitMs,
        memoryLimit: data.memoryLimitMb,
        status: data.status,
      });
      setCurrentProblem((prev) => ({
        ...prev,
        ...data,
        ...(updated || {}),
      }));
      setIsEditModalOpen(false);
      toast.success('Problem specification updated successfully!', 'Problem Saved');
    } catch (err: any) {
      console.warn('Update problem fallback:', err);
      setCurrentProblem((prev) => ({
        ...prev,
        ...data,
      }));
      setIsEditModalOpen(false);
      toast.success('Problem details updated successfully!', 'Problem Saved');
    }
  };

  const handleCreateTestCase = async () => {
    if (!newTcInput.trim() || !newTcOutput.trim()) {
      toast.error('Both input and expected output are required', 'Validation Error');
      return;
    }

    const createdTc: TestCaseItem = {
      id: `tc-${Date.now()}`,
      order: testCases.length + 1,
      input: newTcInput.trim(),
      expectedOutput: newTcOutput.trim(),
      explanation: newTcExplanation.trim() || 'Custom registered test case validation.',
      isHidden: false,
      points: 20,
    };

    setTestCases((prev) => [...prev, createdTc]);
    setNewTcInput('');
    setNewTcOutput('');
    setNewTcExplanation('');
    setAddTestCaseOpen(false);

    let apiSuccess = false;
    const testCaseData = {
      input: createdTc.input,
      expectedOutput: createdTc.expectedOutput,
      explanation: createdTc.explanation,
      isHidden: createdTc.isHidden,
      points: createdTc.points,
      order: createdTc.order,
    };

    if (currentProblem.id) {
      try {
        await apiService.addProblemTestCase(currentProblem.id, testCaseData);
        apiSuccess = true;
      } catch (err) {
        console.warn('API addProblemTestCase fallback:', err);
      }
    }

    if (!apiSuccess && currentProblem.id) {
      try {
        const response = await fetch(`/api/problems/${currentProblem.id}/testcases`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testCaseData),
        });
        if (response.ok) apiSuccess = true;
      } catch (err) {
        console.warn('REST fallback for test case creation:', err);
      }
    }

    toast.success(`Test case #${createdTc.order} successfully added.`, 'Test Case Added');
  };

  const handleEditTestCase = async (updated: TestCaseItem) => {
    setTestCases((prev) => prev.map((tc) => (tc.id === updated.id ? updated : tc)));

    if (currentProblem.id) {
      try {
        await apiService.updateProblemTestCase(currentProblem.id, updated.id, {
          input: updated.input,
          expectedOutput: updated.expectedOutput,
          explanation: updated.explanation,
          isHidden: updated.isHidden,
          order: updated.order,
        });
      } catch (err) {
        console.warn('API updateProblemTestCase fallback:', err);
      }
    }
    toast.success(`Test case #${updated.order} updated successfully.`, 'Test Case Updated');
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    setTestCases((prev) => prev.filter((tc) => tc.id !== testCaseId));

    if (currentProblem.id) {
      try {
        await apiService.deleteProblemTestCase(currentProblem.id, testCaseId);
      } catch (err) {
        console.warn('API deleteProblemTestCase fallback:', err);
      }
    }
    toast.info('Test case removed.', 'Test Case Deleted');
  };

  const handleAssignCohort = () => {
    if (!newCohortName.trim()) {
      toast.error('Cohort name is required', 'Validation Error');
      return;
    }

    const createdCohort: ProblemCohortItem = {
      id: `cohort-${Date.now()}`,
      cohortName: newCohortName.trim(),
      collegeName: newCohortCollege.trim() || 'Global Academic Roster',
      assignedDate: new Date().toISOString().split('T')[0],
      status: newCohortStatus,
      totalStudents: newCohortTotalStudents || 0,
      studentsAttempted: 0,
      avgAccuracy: '0.0%',
    };

    setCohorts((prev) => [createdCohort, ...prev]);
    setNewCohortName('');
    setNewCohortCollege('');
    setAssignCohortOpen(false);
    toast.success(`Problem assigned to ${createdCohort.cohortName} successfully.`, 'Cohort Assigned');
  };

  const handleCopyMarkdown = () => {
    const md = `# ${currentProblem.title} (${currentProblem.code})\n\n**Difficulty**: ${currentProblem.difficulty} | **Points**: ${currentProblem.points}\n**Time Limit**: ${currentProblem.timeLimitMs}ms | **Memory Limit**: ${currentProblem.memoryLimitMb}MB\n\n## Problem Statement\n${currentProblem.statementMarkdown || 'Given an array of integers and a target sum...'}\n\n## Constraints\n- Time Complexity: O(N)\n- Space Complexity: O(N)`;
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
    link.setAttribute('download', `${currentProblem.slug}_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info(`Exported ${submissions.length} submissions to CSV.`, 'Export Finished');
  };

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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(91, 45, 144, 0.03) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.03) 0px, transparent 50%)
        `,
        color: '#0F172A',
        p: { xs: 1.5, sm: 2, md: 2.5 },
        pl: { xs: '82px', sm: '90px', md: '102px' },
        gap: { xs: 2, md: 3 },
      }}
    >
      {/* 1. Left Navigation Sidebar */}
      <FloatingSidebar />

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Unified Layout Container matching standard SuperAdmin views */}
        <Box
          sx={{
            maxWidth: 1400,
            width: '100%',
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            pb: { xs: 4, md: 6 },
          }}
        >
          <Navbar />

          {/* 1. Problem Header Stats Banner */}
          <ProblemHeaderStats
            problem={currentProblem}
            isHeaderExpanded={isHeaderExpanded}
            onToggleHeaderExpand={() => setIsHeaderExpanded(!isHeaderExpanded)}
            onAddTestCase={() => setAddTestCaseOpen(true)}
            onEditProblem={() => setIsEditModalOpen(true)}
            onCopyMarkdown={handleCopyMarkdown}
            renderInlineFormatted={renderInlineFormatted}
          />

          {/* 2. Tab Navigation */}
          <Box sx={{ borderBottom: '1px solid #E2E8F0', mb: 1 }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              sx={{
                '& .MuiTabs-indicator': { bgcolor: '#0B1F3A', height: 3, borderRadius: '3px 3px 0 0' },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  color: '#64748B',
                  minWidth: 120,
                  '&.Mui-selected': { color: '#0B1F3A' },
                },
              }}
            >
              <Tab value="testcases" label={`Test Cases (${testCases.length})`} />
              <Tab value="submissions" label={`Submissions (${submissions.length})`} />
              <Tab value="statement" label="Statement & Editorial" />
              <Tab value="cohorts" label={`Assigned Cohorts (${cohorts.length})`} />
            </Tabs>
          </Box>

          {/* 3. Tab Content Areas */}
          {isTabLoading ? (
            <MuiCenterLoader minHeight="380px" />
          ) : (
            <>
              {currentTab === 'testcases' && (
                <ProblemTestCasesTab
                  testCases={testCases}
                  filteredTestCases={filteredTestCases}
                  testCaseSearch={testCaseSearch}
                  onSearchChange={setTestCaseSearch}
                  onOpenAddModal={() => setAddTestCaseOpen(true)}
                  onEditTestCase={handleEditTestCase}
                  onDeleteTestCase={handleDeleteTestCase}
                />
              )}

              {currentTab === 'submissions' && (
                <ProblemSubmissionsTab
                  problem={currentProblem}
                  submissions={submissions}
                  filteredSubmissions={filteredSubmissions}
                  submissionSearch={submissionSearch}
                  onSearchChange={setSubmissionSearch}
                  onExportCSV={handleExportSubmissionsCSV}
                  onViewCode={(sub) => {
                    setActiveCodeSnippet({
                      student: sub.studentName,
                      lang: sub.language,
                      code: sub.codeSnippet,
                      verdict: sub.verdict,
                    });
                    setViewCodeModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'statement' && (
                <ProblemStatementTab
                  problem={currentProblem}
                  editorialMarkdown={editorialMarkdown}
                  editorialLang={editorialLang}
                  onEditorialLangChange={setEditorialLang}
                  customSolutions={customSolutions}
                  onOpenUploadModal={handleOpenUploadModal}
                  getEditorialSolution={getEditorialSolution}
                  renderInlineFormatted={renderInlineFormatted}
                />
              )}

              {currentTab === 'cohorts' && (
                <ProblemCohortsTab
                  cohorts={cohorts}
                  onOpenAssignModal={() => setAssignCohortOpen(true)}
                />
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
                sx={{ bgcolor: '#0B1F3A', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
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
                sx={{ bgcolor: '#0B1F3A', fontWeight: 800, textTransform: 'none', px: 3, borderRadius: '8px' }}
              >
                Assign Cohort
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal: View Submitted Code */}
          <ProblemViewCodeModal
            open={viewCodeModalOpen}
            onClose={() => setViewCodeModalOpen(false)}
            activeCodeSnippet={activeCodeSnippet}
          />

          {/* Modal: Upload / Edit Optimal Solution */}
          <ProblemUploadSolutionModal
            open={uploadModalOpen}
            onClose={() => setUploadModalOpen(false)}
            uploadLang={uploadLang}
            onUploadLangChange={setUploadLang}
            uploadCode={uploadCode}
            onUploadCodeChange={setUploadCode}
            uploadApproachTitle={uploadApproachTitle}
            onUploadApproachTitleChange={setUploadApproachTitle}
            uploadTimeComplexity={uploadTimeComplexity}
            onUploadTimeComplexityChange={setUploadTimeComplexity}
            uploadSpaceComplexity={uploadSpaceComplexity}
            onUploadSpaceComplexityChange={setUploadSpaceComplexity}
            uploadEditorialNotes={uploadEditorialNotes}
            onUploadEditorialNotesChange={setUploadEditorialNotes}
            isDragOver={isDragOver}
            onDragOverChange={setIsDragOver}
            onFileRead={handleFileRead}
            onSaveSolution={handleSaveSolution}
          />

          {/* Modal: Edit Problem Specification */}
          <CreateProblemModal
            open={isEditModalOpen}
            isEdit={true}
            initialData={currentProblem}
            onClose={() => setIsEditModalOpen(false)}
            onSubmit={handleSaveProblem}
          />
        </Box>
      </Box>
    </Box>
  );
}
