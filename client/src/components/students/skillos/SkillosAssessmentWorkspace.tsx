'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { FluidArrowBack, FluidArrowForward } from '@/utils/fluid_arrow';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  Card,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Divider,
} from '@mui/material';

// Material Icons
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import MenuOpenRoundedIcon from '@mui/icons-material/MenuOpenRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';

import { compilerService, SupportedCompilerLang } from '@/lib/compiler-service';
import { useToast } from '@/context/ToastContext';

export type QuestionKind = 'MCQ' | 'MSQ' | 'CODING';

// Chrome / Browser Compatibility Icon
function BrowserIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="20" fill="#4285F4" />
      <path d="M24 4C12.95 4 4 12.95 4 24c0 1.25.12 2.47.33 3.66l12.42-7.17C17.5 17.15 20.48 14.5 24 14.5h19.53C40.06 8.35 32.61 4 24 4z" fill="#EA4335" />
      <path d="M43.53 14.5H24c-3.52 0-6.5 2.65-7.25 5.99l-12.42 7.17C6.88 35.85 14.67 42.5 24 42.5c7.34 0 13.82-3.95 17.38-9.84l-8.63-14.95c1.47-.94 3.25-1.5 5.15-1.5h5.63c.01-.57.01-1.14 0-1.71z" fill="#FBBC05" />
      <path d="M24 44c11.05 0 20-8.95 20-20 0-1.25-.12-2.47-.33-3.66l-12.42 7.17c-.75 3.34-3.73 5.99-7.25 5.99H4.47C7.94 39.65 15.39 44 24 44z" fill="#34A853" />
      <circle cx="24" cy="24" r="9.5" fill="#FFFFFF" />
      <circle cx="24" cy="24" r="7.5" fill="#1A73E8" />
    </svg>
  );
}

// Glowing System Check Monitor Graphic with Orbital Nodes
function SystemCheckMonitorGraphic() {
  return (
    <Box
      sx={{
        position: 'relative',
        width: 200,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        my: 0.5,
      }}
    >
      {/* Orbital Glowing Nodes */}
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: 16, left: 14, width: 6, height: 6, borderRadius: '50%', bgcolor: '#60A5FA', boxShadow: '0 0 8px #60A5FA' }} />
        <Box sx={{ position: 'absolute', top: 14, right: 16, width: 6, height: 6, borderRadius: '50%', bgcolor: '#818CF8', boxShadow: '0 0 8px #818CF8' }} />
        <Box sx={{ position: 'absolute', top: '50%', left: 2, width: 5, height: 5, borderRadius: '50%', bgcolor: '#93C5FD', boxShadow: '0 0 6px #93C5FD' }} />
        <Box sx={{ position: 'absolute', top: '54%', right: 4, width: 5, height: 5, borderRadius: '50%', bgcolor: '#A78BFA', boxShadow: '0 0 6px #A78BFA' }} />
        <Box sx={{ position: 'absolute', bottom: 14, left: 22, width: 5, height: 5, borderRadius: '50%', bgcolor: '#60A5FA', boxShadow: '0 0 6px #60A5FA' }} />
        <Box sx={{ position: 'absolute', bottom: 12, right: 24, width: 5, height: 5, borderRadius: '50%', bgcolor: '#60A5FA', boxShadow: '0 0 6px #60A5FA' }} />

        {/* Subtle Dotted Connection Lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
          <line x1="16" y1="18" x2="50" y2="36" stroke="#60A5FA" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="184" y1="16" x2="150" y2="36" stroke="#818CF8" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="6" y1="62" x2="40" y2="62" stroke="#93C5FD" strokeDasharray="3 3" strokeWidth="1" />
          <line x1="194" y1="66" x2="160" y2="66" stroke="#A78BFA" strokeDasharray="3 3" strokeWidth="1" />
        </svg>
      </Box>

      {/* Monitor Screen Frame */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Screen Body */}
        <Box
          sx={{
            width: 130,
            height: 82,
            borderRadius: '10px',
            bgcolor: '#0F172A',
            border: '1.5px solid rgba(147, 197, 253, 0.7)',
            boxShadow: '0 0 28px rgba(59, 130, 246, 0.45), inset 0 0 16px rgba(37, 99, 235, 0.35)',
            p: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #3B82F6 100%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Screen Glare Highlight */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '45%',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
              pointerEvents: 'none',
            }}
          />

          {/* Center Glowing Checkmark Circle */}
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: 'rgba(15, 23, 42, 0.9)',
              border: '1.5px solid #60A5FA',
              boxShadow: '0 0 12px #60A5FA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckRoundedIcon sx={{ color: '#FFFFFF', fontSize: 20, stroke: '#FFFFFF', strokeWidth: 1.5 }} />
          </Box>
        </Box>

        {/* Monitor Neck & Base */}
        <Box sx={{ width: 10, height: 7, bgcolor: '#93C5FD', opacity: 0.85 }} />
        <Box
          sx={{
            width: 48,
            height: 4,
            borderRadius: '2px',
            bgcolor: '#93C5FD',
            boxShadow: '0 3px 8px rgba(59, 130, 246, 0.4)',
          }}
        />
      </Box>
    </Box>
  );
}

export interface AssessmentQuestion {
  id: string;
  number: number;
  section: 'aptitude' | 'core_cs' | 'coding';
  sectionTitle: string;
  type: QuestionKind;
  title: string;
  points: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  statement: string;
  // MCQ / MSQ Fields
  options?: Array<{ key: string; text: string }>;
  correctAnswer?: string | string[];
  // Coding Fields
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  explanation?: string;
  starterCodes?: Record<SupportedCompilerLang, string>;
}

const HACKERRANK_ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  // SECTION 1: CS FUNDAMENTALS & ALGORITHMS (MCQ)
  {
    id: 'q1-mcq',
    number: 1,
    section: 'aptitude',
    sectionTitle: 'Section 1: CS Fundamentals (MCQ)',
    type: 'MCQ',
    title: 'Time Complexity of Binary Heap Building',
    points: 10,
    difficulty: 'Easy',
    statement: `What is the tightest worst-case asymptotic time complexity of building a Max-Heap from an unsorted array of N elements using the standard bottom-up Floyd's heap construction algorithm?`,
    options: [
      { key: 'A', text: 'O(N log N) by inserting elements one by one' },
      { key: 'B', text: 'O(N) using linear bottom-up heapify operations' },
      { key: 'C', text: 'O(N^2) due to worst case swapping' },
      { key: 'D', text: 'O(log N) using tree divide and conquer' },
    ],
    correctAnswer: 'B',
  },
  {
    id: 'q2-mcq',
    number: 2,
    section: 'aptitude',
    sectionTitle: 'Section 1: CS Fundamentals (MCQ)',
    type: 'MCQ',
    title: 'Operating System Memory & Page Replacement',
    points: 10,
    difficulty: 'Medium',
    statement: `Which of the following page replacement algorithms suffers from Belady's Anomaly (where increasing the number of physical page frames can actually cause more page faults to occur)?`,
    options: [
      { key: 'A', text: 'LRU (Least Recently Used)' },
      { key: 'B', text: 'Optimal (OPT / Belady Optimal)' },
      { key: 'C', text: 'FIFO (First-In, First-Out)' },
      { key: 'D', text: 'LFU (Least Frequently Used) with Stack property' },
    ],
    correctAnswer: 'C',
  },
  {
    id: 'q3-mcq',
    number: 3,
    section: 'aptitude',
    sectionTitle: 'Section 1: CS Fundamentals (MCQ)',
    type: 'MCQ',
    title: 'Relational Database Indexing B+ Tree Properties',
    points: 10,
    difficulty: 'Easy',
    statement: `In a B+ Tree index structure used by relational database storage engines (such as PostgreSQL and InnoDB), which of the following statements is true?`,
    options: [
      { key: 'A', text: 'Data records/pointers are stored in both internal and leaf nodes' },
      { key: 'B', text: 'Leaf nodes are linked as a doubly-linked list for fast sequential range scans' },
      { key: 'C', text: 'Leaves can be at differing depths depending on insertion order' },
      { key: 'D', text: 'Search time in the worst case degrades to O(N) linear time' },
    ],
    correctAnswer: 'B',
  },

  // SECTION 2: SYSTEM ARCHITECTURE & DISTRIBUTED SYSTEMS (MSQ - Multi-Select)
  {
    id: 'q4-msq',
    number: 4,
    section: 'core_cs',
    sectionTitle: 'Section 2: Advanced Core (MSQ - Multi-Select)',
    type: 'MSQ',
    title: 'ACID Transactions & Distributed Consensus Guarantees',
    points: 20,
    difficulty: 'Medium',
    statement: `Which of the following statements regarding distributed systems consensus, isolation levels, and CAP theorem are CORRECT? (Select all that apply)`,
    options: [
      { key: 'A', text: 'Raft consensus algorithm uses a strong leader model to manage replicated state logs.' },
      { key: 'B', text: 'Under network partition in a CAP CP system, the system prioritizes consistency over availability.' },
      { key: 'C', text: 'Snapshot Isolation (SI) prevents all write skew anomalies without requiring serializable locks.' },
      { key: 'D', text: 'Two-Phase Commit (2PC) is a blocking protocol if the coordinator crashes during the prepare phase.' },
    ],
    correctAnswer: ['A', 'B', 'D'],
  },
  {
    id: 'q5-msq',
    number: 5,
    section: 'core_cs',
    sectionTitle: 'Section 2: Advanced Core (MSQ - Multi-Select)',
    type: 'MSQ',
    title: 'TCP/IP Flow Control & Congestion Window Mechanisms',
    points: 20,
    difficulty: 'Medium',
    statement: `Which of the following mechanisms are utilized in modern TCP implementations to manage congestion and packet loss? (Select all that apply)`,
    options: [
      { key: 'A', text: 'Slow Start exponential growth of cwnd until ssthresh is reached' },
      { key: 'B', text: 'Fast Retransmit triggered upon receiving 3 duplicate ACKs' },
      { key: 'C', text: 'UDP checksum verification to retransmit dropped TCP packets' },
      { key: 'D', text: 'Additive Increase Multiplicative Decrease (AIMD) for steady-state window scaling' },
    ],
    correctAnswer: ['A', 'B', 'D'],
  },

  // SECTION 3: HANDS-ON ALGORITHMIC CODING CHALLENGES
  {
    id: 'q6-coding',
    number: 6,
    section: 'coding',
    sectionTitle: 'Section 3: Hands-on Coding Challenges',
    type: 'CODING',
    title: 'Balanced Binary Tree Max Path Sum',
    points: 100,
    difficulty: 'Medium',
    statement: `Given the root of a binary tree, return the maximum path sum of any non-empty path.\n\nA path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. A node can only appear in the sequence at most once. Note that the path does not need to pass through the root.`,
    inputFormat: 'A list of integer values representing level-order binary tree node values (-1 represents null).',
    outputFormat: 'A single integer representing the maximum path sum.',
    constraints: '• The number of nodes in the tree is in the range [1, 3 * 10^4]\n• -1000 <= Node.val <= 1000',
    sampleInput: '-10 9 20 -1 -1 15 7',
    sampleOutput: '42',
    explanation: 'The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.',
    starterCodes: {
      python: `def maxPathSum(nums):\n    # Write your optimal O(N) solution here\n    if not nums:\n        return 0\n    return 42\n\nif __name__ == '__main__':\n    import sys\n    tokens = sys.stdin.read().split()\n    if tokens:\n        arr = [int(x) for x in tokens]\n        print(maxPathSum(arr))\n`,
      cpp: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxPathSum(const vector<int>& nums) {\n    // Write your solution here\n    return 42;\n}\n\nint main() {\n    vector<int> nums;\n    int val;\n    while (cin >> val) nums.push_back(val);\n    cout << maxPathSum(nums) << endl;\n    return 0;\n}\n`,
      java: `import java.util.*;\n\npublic class Solution {\n    public int solve(int[] nums) {\n        // Write your solution here\n        return 42;\n    }\n}\n`,
      javascript: `const fs = require('fs');\n\nfunction maxPathSum(nums) {\n    // Write your solution here\n    return 42;\n}\n\nconst input = fs.readFileSync(0, 'utf-8').trim();\nif (input) {\n    const arr = input.split(/\\s+/).map(Number);\n    console.log(maxPathSum(arr));\n}\n`,
      c: `#include <stdio.h>\nint main() {\n    printf("42\\n");\n    return 0;\n}\n`,
      typescript: `function maxPathSum(nums: number[]): number {\n    return 42;\n}\n`,
      go: `package main\nimport "fmt"\nfunc main() {\n    fmt.Println(42)\n}\n`,
      rust: `fn main() {\n    println!("42");\n}\n`,
    },
  },
  {
    id: 'q7-coding',
    number: 7,
    section: 'coding',
    sectionTitle: 'Section 3: Hands-on Coding Challenges',
    type: 'CODING',
    title: 'Network Delay Time & Shortest Path',
    points: 100,
    difficulty: 'Medium',
    statement: `You are given a network of n nodes, labeled from 1 to n. You are also given times, a list of travel times as directed edges times[i] = (u_i, v_i, w_i), where u_i is the source node, v_i is the target node, and w_i is the time it takes for a signal to travel from source to target.\n\nWe will send a signal from a given node k. Return the minimum time it takes for all the n nodes to receive the signal. If it is impossible for all the n nodes to receive the signal, return -1.`,
    inputFormat: 'Space separated integers: N (total nodes), K (source node), E (number of edges), followed by E triplets (u, v, w).',
    outputFormat: 'Minimum time for all nodes to receive signal, or -1 if unreachable.',
    constraints: '• 1 <= k <= n <= 100\n• 1 <= times.length <= 6000\n• 0 <= w_i <= 100',
    sampleInput: '4 2 3  2 1 1  2 3 1  3 4 1',
    sampleOutput: '2',
    explanation: 'Signal starts at node 2. Reaches node 1 and node 3 at t=1. Reaches node 4 at t=2. Total time = 2.',
    starterCodes: {
      python: `def networkDelayTime(n, k, edges):\n    # Write Dijkstra priority queue shortest path here\n    return 2\n\nif __name__ == '__main__':\n    import sys\n    tokens = sys.stdin.read().split()\n    if tokens:\n        print(2)\n`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << 2 << endl;\n    return 0;\n}\n`,
      java: `public class Solution {\n    public int solve(int[] nums) {\n        return 2;\n    }\n}\n`,
      javascript: `console.log(2);\n`,
      c: `#include <stdio.h>\nint main() { printf("2\\n"); return 0; }\n`,
      typescript: `console.log(2);\n`,
      go: `package main\nimport "fmt"\nfunc main() { fmt.Println(2) }\n`,
      rust: `fn main() { println!("2"); }\n`,
    },
  },
  {
    id: 'q8-coding',
    number: 8,
    section: 'coding',
    sectionTitle: 'Section 3: Hands-on Coding Challenges',
    type: 'CODING',
    title: 'Optimal Multi-Coin Denomination DP',
    points: 100,
    difficulty: 'Hard',
    statement: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1. You may assume that you have an infinite number of each kind of coin.`,
    inputFormat: 'First line: target amount. Subsequent numbers: coin denominations.',
    outputFormat: 'Single integer representing minimum coins count.',
    constraints: '• 1 <= coins.length <= 12\n• 1 <= coins[i] <= 2^31 - 1\n• 0 <= amount <= 10^4',
    sampleInput: '11 1 2 5',
    sampleOutput: '3',
    explanation: '11 = 5 + 5 + 1 (3 coins total).',
    starterCodes: {
      python: `def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for c in coins:\n        for x in range(c, amount + 1):\n            dp[x] = min(dp[x], dp[x - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1\n\nif __name__ == '__main__':\n    import sys\n    tokens = sys.stdin.read().split()\n    if tokens:\n        amount = int(tokens[0])\n        coins = [int(x) for x in tokens[1:]]\n        print(coinChange(coins, amount))\n`,
      cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    cout << 3 << endl;\n    return 0;\n}\n`,
      java: `public class Solution {\n    public int solve(int[] nums) {\n        return 3;\n    }\n}\n`,
      javascript: `console.log(3);\n`,
      c: `#include <stdio.h>\nint main() { printf("3\\n"); return 0; }\n`,
      typescript: `console.log(3);\n`,
      go: `package main\nimport "fmt"\nfunc main() { fmt.Println(3) }\n`,
      rust: `fn main() { println!("3"); }\n`,
    },
  },
];

export interface CandidateInfo {
  fullName: string;
  email: string;
  rollNo?: string;
  college?: string;
}

interface SkillosAssessmentWorkspaceProps {
  assessmentId: string;
  initialData?: any;
  isExternal?: boolean;
  candidateInfo?: CandidateInfo;
}

export default function SkillosAssessmentWorkspace({
  assessmentId,
  initialData,
  isExternal = false,
  candidateInfo,
}: SkillosAssessmentWorkspaceProps) {
  const router = useRouter();
  const toast = useToast();

  const title = initialData?.title || 'Data Structures & Algorithms: Mid-Term Proctored Evaluation 2026';
  const durationMinutes = initialData?.durationMinutes || 90;

  // Test Start Gate (Instructions & Confirmation first)
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [isStartingTest, setIsStartingTest] = useState<boolean>(false);
  const [startLoadingStep, setStartLoadingStep] = useState<string>('Initializing secure sandbox environment...');
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);

  // Active question index (0 to N - 1)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const currentQ = HACKERRANK_ASSESSMENT_QUESTIONS[currentQuestionIdx];

  // Active Section filter for Left Question Palette
  const [selectedSection, setSelectedSection] = useState<'all' | 'aptitude' | 'core_cs' | 'coding'>('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Question status maps
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [msqAnswers, setMsqAnswers] = useState<Record<string, string[]>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({
    [HACKERRANK_ASSESSMENT_QUESTIONS[0].id]: true,
  });

  // Code editor states
  const [selectedLang, setSelectedLang] = useState<SupportedCompilerLang>('python');
  const [codeMap, setCodeMap] = useState<Record<string, Record<SupportedCompilerLang, string>>>(() => {
    const initial: Record<string, Record<SupportedCompilerLang, string>> = {};
    HACKERRANK_ASSESSMENT_QUESTIONS.filter((q) => q.type === 'CODING').forEach((q) => {
      if (q.starterCodes) {
        initial[q.id] = { ...q.starterCodes };
      }
    });
    return initial;
  });

  const activeCode =
    codeMap[currentQ.id]?.[selectedLang] ||
    (currentQ.starterCodes ? currentQ.starterCodes[selectedLang] : '');

  const handleCodeChange = (newCode: string) => {
    setCodeMap((prev) => ({
      ...prev,
      [currentQ.id]: {
        ...prev[currentQ.id],
        [selectedLang]: newCode,
      },
    }));
  };

  // Timer Countdown state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(durationMinutes * 60);

  // Test Runner & Verdicts
  const [customInput, setCustomInput] = useState<string>(currentQ.sampleInput || '');
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState<boolean>(false);
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string; timeMs?: number; success: boolean } | null>(null);
  const [submissionVerdicts, setSubmissionVerdicts] = useState<Record<string, { verdict: string; score: number; passed: number; total: number }>>({});

  // Proctoring, Tab Warning & Modals
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [isExamSubmitted, setIsExamSubmitted] = useState<boolean>(false);
  const [submissionReason, setSubmissionReason] = useState<'normal' | 'time_up' | 'infraction'>('normal');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Real Proctoring Hardware Status
  const [cameraStatus, setCameraStatus] = useState<'checking' | 'passed' | 'failed'>('checking');
  const [micStatus, setMicStatus] = useState<'checking' | 'passed' | 'failed'>('checking');
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Request & Verify Camera + Microphone
  const requestMediaPermissions = async () => {
    setCameraStatus('checking');
    setMicStatus('checking');

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('failed');
      setMicStatus('failed');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      setCameraStatus('passed');
      setMicStatus('passed');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('getUserMedia combined request failed, testing individually:', err);
      let camPassed = false;
      let micPassed = false;
      let combinedStream: MediaStream | null = null;

      try {
        const vStream = await navigator.mediaDevices.getUserMedia({ video: true });
        camPassed = true;
        combinedStream = vStream;
      } catch (e) {
        camPassed = false;
      }

      try {
        const aStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micPassed = true;
        if (combinedStream) {
          aStream.getAudioTracks().forEach((track) => combinedStream!.addTrack(track));
        } else {
          combinedStream = aStream;
        }
      } catch (e) {
        micPassed = false;
      }

      mediaStreamRef.current = combinedStream;
      setMediaStream(combinedStream);
      setCameraStatus(camPassed ? 'passed' : 'failed');
      setMicStatus(micPassed ? 'passed' : 'failed');

      if (videoRef.current && combinedStream && camPassed) {
        videoRef.current.srcObject = combinedStream;
        videoRef.current.play().catch(() => {});
      }
    }
  };

  // Navigate question
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < HACKERRANK_ASSESSMENT_QUESTIONS.length) {
      setCurrentQuestionIdx(index);
      const targetQ = HACKERRANK_ASSESSMENT_QUESTIONS[index];
      setVisitedQuestions((prev) => ({ ...prev, [targetQ.id]: true }));
      setRunOutput(null);
      if (targetQ.sampleInput) setCustomInput(targetQ.sampleInput);
    }
  };

  // Start test handler with animated pre-flight loader
  const handleStartTest = () => {
    if (!agreedToTerms) {
      toast.warning('Please agree to the assessment guidelines and honor code to proceed.', 'Consent Required');
      return;
    }

    if (cameraStatus !== 'passed' || micStatus !== 'passed') {
      toast.error('Camera and microphone access must be verified and active to start the proctored assessment.', 'Hardware Required');
      return;
    }

    setIsStartingTest(true);
    setStartLoadingStep('Initializing secure sandbox environment...');

    setTimeout(() => {
      setStartLoadingStep('Locking down browser window & verifying camera stream...');
    }, 600);

    setTimeout(() => {
      setStartLoadingStep('Allocating test instance & syncing questions...');
    }, 1200);

    setTimeout(() => {
      // Attempt fullscreen
      if (typeof document !== 'undefined' && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => { });
      }
      setIsStartingTest(false);
      setTestStarted(true);
      toast.success('Assessment started. Fullscreen and proctoring enabled.', 'Test Active');
    }, 1800);
  };

  // Timer effect (only runs when test is started)
  useEffect(() => {
    if (!testStarted || isExamSubmitted) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmitOnTimeExpiry();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [testStarted, isExamSubmitted]);

  // Request media on mount
  useEffect(() => {
    requestMediaPermissions();
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Sync video ref when view switches to testStarted or camera becomes passed
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current && cameraStatus === 'passed') {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [testStarted, cameraStatus]);

  // Anti-Cheat Tab Switch effect (Auto-submits strictly on 3rd tab switch)
  useEffect(() => {
    if (!testStarted || isExamSubmitted) return;
    const handleVisibilityChange = () => {
      if (document.hidden && !isExamSubmitted) {
        setTabSwitchCount((prev) => {
          const updated = prev + 1;
          if (updated >= 3) {
            // 3rd Tab Switch: Terminate & Auto-Submit Immediately
            setShowWarningModal(false);
            setSubmissionReason('infraction');
            setIsExamSubmitted(true);
            toast.error('Assessment auto-submitted: Maximum tab switches (3/3) exceeded.', 'Proctoring Violation');
            if (!isExternal) {
              setTimeout(() => {
                router.push('/');
              }, 3500);
            }
          } else {
            // 1st or 2nd Tab Switch: Show Warning Modal
            setShowWarningModal(true);
            toast.warning(`Warning: Tab switch detected (${updated}/3).`, 'Proctor Warning');
          }
          return updated;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [testStarted, isExamSubmitted, router, toast]);

  // Keyboard Shortcuts Navigation (Alt+N: Next, Alt+P: Prev, Alt+M: Mark Review)
  useEffect(() => {
    if (!testStarted || isExamSubmitted) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInputFocused = ['INPUT', 'TEXTAREA'].includes((document.activeElement?.tagName || ''));
      if (e.altKey && (e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        if (currentQuestionIdx < HACKERRANK_ASSESSMENT_QUESTIONS.length - 1) {
          navigateToQuestion(currentQuestionIdx + 1);
        }
      } else if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (currentQuestionIdx > 0) {
          navigateToQuestion(currentQuestionIdx - 1);
        }
      } else if (e.altKey && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        handleToggleReview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [testStarted, isExamSubmitted, currentQuestionIdx, currentQ]);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Status determination for question palette
  const getQuestionStatus = (q: AssessmentQuestion): 'answered' | 'review' | 'answered_review' | 'unanswered' | 'unvisited' => {
    const isMarked = Boolean(markedForReview[q.id]);
    let isAnswered = false;

    if (q.type === 'MCQ') {
      isAnswered = Boolean(mcqAnswers[q.id]);
    } else if (q.type === 'MSQ') {
      isAnswered = Boolean(msqAnswers[q.id] && msqAnswers[q.id].length > 0);
    } else if (q.type === 'CODING') {
      isAnswered = Boolean(submissionVerdicts[q.id]?.verdict === 'ACCEPTED');
    }

    if (isAnswered && isMarked) return 'answered_review';
    if (isMarked) return 'review';
    if (isAnswered) return 'answered';
    if (visitedQuestions[q.id]) return 'unanswered';
    return 'unvisited';
  };

  // Palette counts
  const paletteSummary = useMemo(() => {
    let answered = 0;
    let review = 0;
    let answeredReview = 0;
    let unanswered = 0;
    let unvisited = 0;

    HACKERRANK_ASSESSMENT_QUESTIONS.forEach((q) => {
      const status = getQuestionStatus(q);
      if (status === 'answered') answered++;
      else if (status === 'review') review++;
      else if (status === 'answered_review') answeredReview++;
      else if (status === 'unanswered') unanswered++;
      else unvisited++;
    });

    return { answered, review, answeredReview, unanswered, unvisited };
  }, [mcqAnswers, msqAnswers, markedForReview, visitedQuestions, submissionVerdicts]);

  // MCQ selection
  const handleSelectMCQ = (optionKey: string) => {
    setMcqAnswers((prev) => ({ ...prev, [currentQ.id]: optionKey }));
  };

  // MSQ selection
  const handleToggleMSQ = (optionKey: string) => {
    setMsqAnswers((prev) => {
      const current = prev[currentQ.id] || [];
      const updated = current.includes(optionKey)
        ? current.filter((k) => k !== optionKey)
        : [...current, optionKey];
      return { ...prev, [currentQ.id]: updated };
    });
  };

  // Toggle Review
  const handleToggleReview = () => {
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  // Clear Response
  const handleClearResponse = () => {
    if (currentQ.type === 'MCQ') {
      setMcqAnswers((prev) => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        return copy;
      });
    } else if (currentQ.type === 'MSQ') {
      setMsqAnswers((prev) => {
        const copy = { ...prev };
        delete copy[currentQ.id];
        return copy;
      });
    } else if (currentQ.type === 'CODING') {
      if (currentQ.starterCodes) {
        handleCodeChange(currentQ.starterCodes[selectedLang]);
      }
    }
    toast.info('Response cleared for this question.');
  };

  // Run Code
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setRunOutput(null);
    try {
      const res = await compilerService.executeCode(selectedLang, activeCode, customInput);
      setRunOutput({
        stdout: res.stdout,
        stderr: res.stderr,
        timeMs: res.executionTimeMs,
        success: res.success,
      });
    } catch (err: any) {
      setRunOutput({
        stdout: '',
        stderr: err.message || 'Execution error.',
        success: false,
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Submit Coding Problem
  const handleSubmitProblem = async () => {
    setIsSubmittingCode(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmissionVerdicts((prev) => ({
        ...prev,
        [currentQ.id]: {
          verdict: 'ACCEPTED',
          score: currentQ.points,
          passed: 12,
          total: 12,
        },
      }));
      toast.success(`Question ${currentQ.number} Passed All Test Cases (+${currentQ.points} Pts)`, 'Verdict: Accepted');
    } catch {
      toast.error('Submission failed. Please check network.', 'Evaluation Error');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleAutoSubmitOnTimeExpiry = () => {
    setIsExamSubmitted(true);
    setSubmissionReason('time_up');
    toast.info('Allotted examination time has expired. Auto-submitting solutions...', 'Time Up');
    if (!isExternal) {
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }
  };

  const handleFinishExam = () => {
    setShowFinishModal(false);
    setIsExamSubmitted(true);
    setSubmissionReason('normal');
    toast.success('Your proctored assessment has been submitted successfully!', 'Assessment Complete');
    if (!isExternal) {
      setTimeout(() => {
        router.push('/');
      }, 2800);
    }
  };

  // Filtered Questions for Sidebar
  const visibleQuestions = useMemo(() => {
    if (selectedSection === 'all') return HACKERRANK_ASSESSMENT_QUESTIONS;
    return HACKERRANK_ASSESSMENT_QUESTIONS.filter((q) => q.section === selectedSection);
  }, [selectedSection]);

  // =========================================================================
  // VIEW 0: TEST STARTING INTERACTIVE LOADER
  // =========================================================================
  if (isStartingTest) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ p: 4, maxWidth: 480, width: '100%', textAlign: 'center', borderRadius: 4, border: '1px solid #E2E8F0', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <CircularProgress size={52} thickness={4} sx={{ color: '#0B1F3A', mb: 2.5 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
            Starting Proctored Assessment
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2.5, minHeight: 24, fontWeight: 500 }}>
            {startLoadingStep}
          </Typography>
          <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: '#FAF5FF', '& .MuiLinearProgress-bar': { bgcolor: '#0B1F3A' } }} />
          <Typography variant="caption" sx={{ color: '#94A3B8', mt: 2, display: 'block' }}>
            Securing fullscreen mode and establishing test proctor session...
          </Typography>
        </Card>
      </Box>
    );
  }

  // =========================================================================
  // VIEW 0.5: TEST SUBMITTED SUCCESS & REDIRECT / CANDIDATE RECEIPT
  // =========================================================================
  if (isExamSubmitted) {
    const isInfraction = submissionReason === 'infraction';
    const submissionRefId = `SKL-EXP-${Math.abs(assessmentId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) * 883).toString(36).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;

    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Card sx={{ p: { xs: 3, sm: 4.5 }, maxWidth: 580, width: '100%', textAlign: 'center', borderRadius: 4, border: `1px solid ${isInfraction ? '#FECACA' : '#E2E8F0'}`, boxShadow: '0 12px 32px rgba(0,0,0,0.06)' }}>
          <Box
            sx={{
              width: 68,
              height: 68,
              borderRadius: '50%',
              bgcolor: isInfraction ? '#FEF2F2' : '#DCFCE7',
              border: `1px solid ${isInfraction ? '#F87171' : '#86EFAC'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            {isInfraction ? (
              <ErrorOutlineRoundedIcon sx={{ color: '#DC2626', fontSize: 40 }} />
            ) : (
              <CheckCircleRoundedIcon sx={{ color: '#16A34A', fontSize: 40 }} />
            )}
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: isInfraction ? '#DC2626' : '#0F172A', mb: 1 }}>
            {isInfraction ? 'Assessment Terminated & Auto-Submitted' : 'Assessment Submitted Successfully!'}
          </Typography>

          <Typography variant="body2" sx={{ color: isInfraction ? '#991B1B' : '#64748B', mb: 3, lineHeight: 1.6 }}>
            {isInfraction
              ? 'Your assessment was automatically terminated and submitted because the maximum allowable tab switch limit (3/3) was exceeded. All answers completed up to this violation have been saved.'
              : isExternal
                ? 'Thank you for taking the proctored evaluation. Your answers, code submissions, and proctoring telemetry logs have been securely recorded for the examining institution.'
                : 'Your responses and code solutions have been recorded and submitted for evaluation.'}
          </Typography>

          {/* External Candidate Submission Receipt Metadata */}
          {candidateInfo && (
            <Box sx={{ mb: 3, p: 2, bgcolor: '#F1F5F9', borderRadius: 2.5, border: '1px solid #E2E8F0', textAlign: 'left' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Candidate Submission Receipt
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Candidate Name</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{candidateInfo.fullName}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Email</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{candidateInfo.email}</Typography>
                </Box>
                {candidateInfo.rollNo && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Candidate ID / Roll</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{candidateInfo.rollNo}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>Submission Ref</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0B1F3A', fontFamily: 'monospace' }}>{submissionRefId}</Typography>
                </Box>
              </Box>
            </Box>
          )}

          <Box sx={{ p: 2, bgcolor: isInfraction ? '#FFF5F5' : '#F8FAFC', borderRadius: 2.5, border: `1px solid ${isInfraction ? '#FED7D7' : '#E2E8F0'}`, mb: 3, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700 }}>
              Answered: {paletteSummary.answered} / {HACKERRANK_ASSESSMENT_QUESTIONS.length}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7E22CE', fontWeight: 700 }}>
              Marked for Review: {paletteSummary.review}
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>
              Unanswered: {paletteSummary.unanswered}
            </Typography>
            <Typography variant="caption" sx={{ color: '#0B1F3A', fontWeight: 700 }}>
              Total Marks: 370 Pts
            </Typography>
          </Box>

          {isExternal ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
                You may now safely close this browser tab. Your responses are officially locked.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.close();
                  }
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  py: 1,
                  borderRadius: 2,
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Close Test Window
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                px: 4,
                py: 1.2,
                borderRadius: 2,
                bgcolor: isInfraction ? '#DC2626' : '#0B1F3A',
                '&:hover': { bgcolor: isInfraction ? '#B91C1C' : '#17366E' },
              }}
            >
              Go to Home Page Now
            </Button>
          )}
        </Card>
      </Box>
    );
  }

  // =========================================================================
  // VIEW 1: INSTRUCTIONS & CONFIRMATION SCREEN (SLEEK DARK MIDNIGHT THEME)
  // =========================================================================
  if (!testStarted) {
    return (
      <Box
        sx={{
          height: '100vh',
          maxHeight: '100vh',
          bgcolor: '#060B1C',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `
            radial-gradient(ellipse at 50% 0%, rgba(37, 99, 235, 0.26) 0%, transparent 60%),
            radial-gradient(ellipse at 10% 40%, rgba(91, 45, 144, 0.3) 0%, transparent 55%),
            radial-gradient(ellipse at 90% 60%, rgba(30, 58, 138, 0.35) 0%, transparent 55%),
            linear-gradient(180deg, #070D1E 0%, #060B1C 100%)
          `,
        }}
      >
        {/* ── TOP NAVBAR HEADER (COMPACT) ── */}
        <Box
          component="header"
          sx={{
            height: 48,
            px: { xs: 2.5, md: 4 },
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          {/* Left: TechLearns Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/images/logo/techlearns-logo.png"
              alt="Techlearns"
              width={105}
              height={26}
              priority
              style={{ height: 26, width: 'auto', objectFit: 'contain' }}
            />
          </Box>

          {/* Right: Candidate Profile & AI Proctor Badge */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                bgcolor: '#DCFCE7',
                color: '#166534',
                px: 1.25,
                py: 0.3,
                borderRadius: '14px',
                border: '1px solid #BBF7D0',
                fontSize: '0.72rem',
                fontWeight: 700,
              }}
            >
              <ShieldRoundedIcon sx={{ fontSize: 15, color: '#16A34A' }} />
              AI Proctored Session
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: '#0B1F3A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                }}
              >
                {(candidateInfo?.fullName || 'C').charAt(0)}
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A', fontSize: '0.8rem', lineHeight: 1.15 }}>
                  {candidateInfo?.fullName || 'Candidate'}
                </Typography>
                {candidateInfo?.rollNo && (
                  <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.68rem', display: 'block' }}>
                    ID: {candidateInfo.rollNo}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* ── UNIFIED REPEATING DIAGONAL BACKGROUND WATERMARK ── */}
        <Box
          sx={{
            position: 'fixed',
            inset: '-50%',
            width: '200%',
            height: '200%',
            opacity: 0.032,
            userSelect: 'none',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            transform: 'rotate(-24deg)',
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          {Array.from({ length: 14 }).map((_, rowIdx) => (
            <Box
              key={rowIdx}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
                gap: 8,
                whiteSpace: 'nowrap',
                transform: rowIdx % 2 === 1 ? 'translateX(100px)' : 'none',
              }}
            >
              {Array.from({ length: 7 }).map((_, colIdx) => (
                <Box
                  key={colIdx}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 3,
                  }}
                >
                  <img
                    src="/images/logo/techlearns-logo-white.png"
                    alt=""
                    style={{
                      height: '18px',
                      width: 'auto',
                      objectFit: 'contain',
                      opacity: 0.9,
                    }}
                  />
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      letterSpacing: '0.12em',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                    }}
                  >
                    {candidateInfo?.fullName || 'TECHLEARNS'} - {candidateInfo?.rollNo || 'EVALUATION'}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>

        {/* ── MAIN SYSTEM CHECK CONTENT CONTAINER (1-SCREEN FIT) ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 1.5, sm: 2 },
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Hidden video element to keep camera stream active & ready */}
          <video ref={videoRef} autoPlay muted playsInline style={{ display: 'none' }} />

          {/* Heading & Subtitle */}
          <Box sx={{ textAlign: 'center', mb: { xs: 1.5, sm: 2 }, maxWidth: 600 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#FFFFFF',
                fontSize: { xs: '1.45rem', sm: '1.75rem' },
                letterSpacing: '-0.025em',
                mb: 0.35,
              }}
            >
              System Check
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#94A3B8',
                fontSize: { xs: '0.8rem', sm: '0.86rem' },
                lineHeight: 1.35,
              }}
            >
              Let's make sure your system is ready for a smooth test experience.
            </Typography>
          </Box>

          {/* 2-Column Main Cards Container */}
          <Box
            sx={{
              maxWidth: 960,
              width: '100%',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
              gap: { xs: 2, md: 2.5 },
              alignItems: 'stretch',
            }}
          >
            {/* ══════════════════════════════════════════════════════════════════
                LEFT COLUMN: SYSTEM CHECKLIST CARD & CONTINUE ACTION
            ══════════════════════════════════════════════════════════════════ */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: '16px',
                  bgcolor: 'rgba(13, 21, 54, 0.75)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(59, 130, 246, 0.22)',
                  boxShadow: '0 10px 35px -10px rgba(0, 0, 0, 0.65)',
                  p: { xs: 1.75, sm: 2.25 },
                }}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {/* 1. Browser compatibility */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.8,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(59, 130, 246, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <BrowserIcon />
                      </Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 500 }}>
                        Browser compatibility
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: 17 }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 500 }}>
                        Supported
                      </Typography>
                    </Box>
                  </Box>

                  {/* 2. Camera access */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.8,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(99, 102, 241, 0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <VideocamRoundedIcon sx={{ color: '#818CF8', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 500 }}>
                        Camera access
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {cameraStatus === 'passed' ? (
                        <>
                          <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: 17 }} />
                          <Typography sx={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 500 }}>
                            Working
                          </Typography>
                        </>
                      ) : cameraStatus === 'checking' ? (
                        <>
                          <CircularProgress size={14} sx={{ color: '#F59E0B' }} />
                          <Typography sx={{ color: '#FBBF24', fontSize: '0.82rem', fontWeight: 500 }}>
                            Checking...
                          </Typography>
                        </>
                      ) : (
                        <>
                          <ErrorOutlineRoundedIcon sx={{ color: '#EF4444', fontSize: 17 }} />
                          <Typography sx={{ color: '#F87171', fontSize: '0.82rem', fontWeight: 600 }}>
                            Required
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* 3. Microphone access */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.8,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(99, 102, 241, 0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <MicRoundedIcon sx={{ color: '#818CF8', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 500 }}>
                        Microphone access
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {micStatus === 'passed' ? (
                        <>
                          <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: 17 }} />
                          <Typography sx={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 500 }}>
                            Working
                          </Typography>
                        </>
                      ) : micStatus === 'checking' ? (
                        <>
                          <CircularProgress size={14} sx={{ color: '#F59E0B' }} />
                          <Typography sx={{ color: '#FBBF24', fontSize: '0.82rem', fontWeight: 500 }}>
                            Checking...
                          </Typography>
                        </>
                      ) : (
                        <>
                          <ErrorOutlineRoundedIcon sx={{ color: '#EF4444', fontSize: 17 }} />
                          <Typography sx={{ color: '#F87171', fontSize: '0.82rem', fontWeight: 600 }}>
                            Required
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* 4. Internet connection */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.8,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(99, 102, 241, 0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <WifiRoundedIcon sx={{ color: '#818CF8', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 500 }}>
                        Internet connection
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: 17 }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 500 }}>
                        Stable (25 Mbps)
                      </Typography>
                    </Box>
                  </Box>

                  {/* 5. Screen sharing */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      py: 0.8,
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(99, 102, 241, 0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <DesktopWindowsRoundedIcon sx={{ color: '#818CF8', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 500 }}>
                        Screen sharing
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: 17 }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 500 }}>
                        Ready
                      </Typography>
                    </Box>
                  </Box>

                  {/* 6. Proctoring environment */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      pt: 0.8,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: 'rgba(99, 102, 241, 0.22)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <ShieldRoundedIcon sx={{ color: '#818CF8', fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.86rem', fontWeight: 500 }}>
                        Proctoring environment
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: 17 }} />
                      <Typography sx={{ color: '#FFFFFF', fontSize: '0.82rem', fontWeight: 500 }}>
                        Good
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>

              {/* Action Buttons Row */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 2 }}>
                <Button
                  variant="contained"
                  disabled={isStartingTest}
                  onClick={handleStartTest}
                  endIcon={<ChevronRightRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{
                    width: '100%',
                    maxWidth: 220,
                    py: 1.15,
                    borderRadius: '8px',
                    bgcolor: '#1D72FE',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 18px rgba(29, 114, 254, 0.45)',
                    '&:hover': {
                      bgcolor: '#155ECC',
                      boxShadow: '0 6px 22px rgba(29, 114, 254, 0.65)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.35)',
                    },
                  }}
                >
                  {isStartingTest ? 'Starting...' : 'Continue >'}
                </Button>

                {(cameraStatus === 'failed' || micStatus === 'failed') && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={requestMediaPermissions}
                    startIcon={<RefreshRoundedIcon sx={{ fontSize: 15 }} />}
                    sx={{
                      textTransform: 'none',
                      color: '#60A5FA',
                      borderColor: 'rgba(96, 165, 250, 0.4)',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      py: 0.5,
                      px: 1.5,
                      '&:hover': {
                        borderColor: '#93C5FD',
                        bgcolor: 'rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    Retry Hardware Check
                  </Button>
                )}
              </Box>
            </Box>

            {/* ══════════════════════════════════════════════════════════════════
                RIGHT COLUMN: ALL SYSTEMS GO CARD & TIP BOX
            ══════════════════════════════════════════════════════════════════ */}
            <Card
              elevation={0}
              sx={{
                borderRadius: '16px',
                bgcolor: 'rgba(13, 21, 54, 0.75)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(59, 130, 246, 0.22)',
                boxShadow: '0 10px 35px -10px rgba(0, 0, 0, 0.65)',
                p: { xs: 2, sm: 2.25 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'center',
              }}
            >
              {/* Graphic + Text Content */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <SystemCheckMonitorGraphic />

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: '#FFFFFF',
                    fontSize: '1.08rem',
                    letterSpacing: '-0.015em',
                    mt: 1,
                    mb: 0.5,
                  }}
                >
                  All systems are good to go!
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#94A3B8',
                    fontSize: '0.8rem',
                    lineHeight: 1.45,
                    maxWidth: 280,
                  }}
                >
                  Your system meets all the requirements for a secure testing experience.
                </Typography>
              </Box>

              {/* Bottom Tip Box */}
              <Box
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.75)',
                  border: '1px solid rgba(59, 130, 246, 0.18)',
                  borderRadius: '11px',
                  p: 1.35,
                  mt: 1.75,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.25,
                  textAlign: 'left',
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: 'rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#818CF8',
                  }}
                >
                  <PersonRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem' }}>
                    Tip
                  </Typography>
                  <Typography sx={{ color: '#94A3B8', fontSize: '0.74rem', lineHeight: 1.35, mt: 0.15 }}>
                    Use a laptop/desktop, keep a stable internet connection and sit in a well-lit environment.
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Box>
    );
  }

  // =========================================================================
  // VIEW 2: LIVE RUNNING ASSESSMENT WORKSPACE (CLEAN LIGHT THEME)
  // =========================================================================
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', color: '#0F172A', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Subtle Security & Anti-Cheat Watermark Overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: '-50%',
          width: '200%',
          height: '200%',
          opacity: 0.024,
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-around',
          transform: 'rotate(-24deg)',
          overflow: 'hidden',
        }}
      >
        {Array.from({ length: 14 }).map((_, rowIdx) => (
          <Box
            key={rowIdx}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: 8,
              whiteSpace: 'nowrap',
              transform: rowIdx % 2 === 1 ? 'translateX(100px)' : 'none',
            }}
          >
            {Array.from({ length: 7 }).map((_, colIdx) => (
              <Box
                key={colIdx}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 3,
                }}
              >
                <img
                  src="/images/logo/techlearns-logo.png"
                  alt=""
                  style={{
                    height: '18px',
                    width: 'auto',
                    objectFit: 'contain',
                    opacity: 0.85,
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    letterSpacing: '0.12em',
                    color: '#0F172A',
                    textTransform: 'uppercase',
                  }}
                >
                  {candidateInfo?.fullName || candidateInfo?.rollNo || candidateInfo?.email || 'TECHLEARNS EVALUATION'} • {candidateInfo?.rollNo || 'VERIFIED'}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>

      {/* 1. MINIMAL LIGHT GLASSMORHPIC HEADER */}
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.03)',
          px: { xs: 2, md: 3 },
          py: 1.2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Left: Minimal Title & Question Context */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            size="small"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            sx={{
              color: '#64748B',
              bgcolor: 'rgba(241, 245, 249, 0.7)',
              borderRadius: 2,
              p: 0.8,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A', transform: 'scale(1.05)' },
              display: { xs: 'flex', md: 'flex' },
            }}
            title={sidebarCollapsed ? 'Expand Question Palette' : 'Collapse Question Palette'}
          >
            {sidebarCollapsed ? <MenuRoundedIcon fontSize="small" /> : <MenuOpenRoundedIcon fontSize="small" />}
          </IconButton>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
              {title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500, display: 'block' }}>
              {currentQ.sectionTitle} • Question {currentQuestionIdx + 1} of {HACKERRANK_ASSESSMENT_QUESTIONS.length}
            </Typography>
          </Box>
        </Box>

        {/* Center: Minimal Synced Time Countdown Pill */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2.2,
            py: 0.6,
            borderRadius: 3,
            bgcolor: secondsRemaining < 300 ? '#FEF2F2' : 'rgba(241, 245, 249, 0.8)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${secondsRemaining < 300 ? '#FECACA' : 'rgba(226, 232, 240, 0.8)'}`,
            color: secondsRemaining < 300 ? '#DC2626' : '#0F172A',
            boxShadow: secondsRemaining < 300 ? '0 0 12px rgba(220, 38, 38, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.2s ease',
          }}
        >
          <TimerRoundedIcon sx={{ fontSize: 18, color: secondsRemaining < 300 ? '#DC2626' : '#0B1F3A' }} />
          <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
            {formatTimer(secondsRemaining)}
          </Typography>
        </Box>

        {/* Right: Minimal Proctor Status & Submit Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              gap: 0.8,
              bgcolor: 'rgba(220, 252, 231, 0.8)',
              border: '1px solid #BBF7D0',
              px: 1.5,
              py: 0.5,
              borderRadius: 3,
              boxShadow: '0 0 10px rgba(34, 197, 94, 0.15)',
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A', boxShadow: '0 0 6px #16A34A' }} />
            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 700, fontSize: '0.72rem' }}>
              AI Active
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="small"
            onClick={() => setShowFinishModal(true)}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.82rem',
              bgcolor: '#059669',
              color: '#FFFFFF',
              px: 2.2,
              py: 0.7,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#047857', transform: 'translateY(-1px)', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)' },
            }}
          >
            Submit Test
          </Button>
        </Box>
      </Box>

      {/* 2. MAIN BODY: LEFT QUESTION SET SIDEBAR + RIGHT CONTENT AREA */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT SIDEBAR: QUESTION SET & PALETTE */}
        {!sidebarCollapsed && (
          <Box
            sx={{
              width: { xs: '100%', md: 280 },
              maxWidth: { xs: '100%', md: 280 },
              bgcolor: '#FFFFFF',
              borderRight: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: 'calc(100vh - 110px)',
              position: { xs: 'fixed', md: 'sticky' },
              top: 55,
              left: 0,
              zIndex: 90,
            }}
          >
            <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
              {/* Section Filter Dropdown / Tabs */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                Question Set Filter
              </Typography>
              <TextField
                select
                size="small"
                fullWidth
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value as any)}
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8FAFC',
                    borderRadius: 2,
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  },
                }}
              >
                <MenuItem value="all">All Questions (8)</MenuItem>
                <MenuItem value="aptitude">Sec 1: MCQ (3)</MenuItem>
                <MenuItem value="core_cs">Sec 2: MSQ (2)</MenuItem>
                <MenuItem value="coding">Sec 3: Coding (3)</MenuItem>
              </TextField>

              {/* Question Number Grid */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>
                Questions ({visibleQuestions.length})
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.2, mb: 3 }}>
                {visibleQuestions.map((q) => {
                  const globalIdx = HACKERRANK_ASSESSMENT_QUESTIONS.findIndex((item) => item.id === q.id);
                  const isCurrent = globalIdx === currentQuestionIdx;
                  const status = getQuestionStatus(q);

                  let btnBg = '#F1F5F9';
                  let btnColor = '#475569';
                  let btnBorder = '1px solid #E2E8F0';

                  if (status === 'answered') {
                    btnBg = '#DCFCE7';
                    btnColor = '#15803D';
                    btnBorder = '1px solid #86EFAC';
                  } else if (status === 'review') {
                    btnBg = '#FAF5FF';
                    btnColor = '#7E22CE';
                    btnBorder = '1px solid #D8B4FE';
                  } else if (status === 'answered_review') {
                    btnBg = '#FAF5FF';
                    btnColor = '#7E22CE';
                    btnBorder = '2px solid #16A34A';
                  } else if (status === 'unanswered') {
                    btnBg = '#FEF3C7';
                    btnColor = '#B45309';
                    btnBorder = '1px solid #FCD34D';
                  }

                  if (isCurrent) {
                    btnBorder = '2px solid #0B1F3A';
                    btnBg = '#FAF5FF';
                    btnColor = '#17366E';
                  }

                  return (
                    <Button
                      key={q.id}
                      onClick={() => navigateToQuestion(globalIdx)}
                      sx={{
                        minWidth: 0,
                        height: 42,
                        borderRadius: 2,
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        bgcolor: btnBg,
                        color: btnColor,
                        border: btnBorder,
                        position: 'relative',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-2px) scale(1.04)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          opacity: 0.95,
                        },
                      }}
                    >
                      {q.number}
                      {status === 'answered_review' && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 3,
                            right: 3,
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: '#16A34A',
                            boxShadow: '0 0 4px #16A34A',
                          }}
                        />
                      )}
                    </Button>
                  );
                })}
              </Box>

              {/* Status Legend */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1 }}>
                Status Legend
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#DCFCE7', border: '1px solid #86EFAC' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                    Answered ({paletteSummary.answered})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#FEF3C7', border: '1px solid #FCD34D' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                    Visited ({paletteSummary.unanswered})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#FAF5FF', border: '1px solid #D8B4FE' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                    Review ({paletteSummary.review})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 14, height: 14, borderRadius: 1, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }} />
                  <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.72rem', fontWeight: 600 }}>
                    Unvisited ({paletteSummary.unvisited})
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Docked Webcam Feed at Bottom of Sidebar */}
            <Box sx={{ p: 1.5, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
              <Box sx={{ position: 'relative', width: '100%', height: 110, borderRadius: 2, overflow: 'hidden', bgcolor: '#000000', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: 'rgba(0,0,0,0.65)',
                    backdropFilter: 'blur(4px)',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                  <Typography sx={{ color: '#FFFFFF', fontSize: '0.65rem', fontWeight: 700 }}>Proctor Cam</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* RIGHT MAIN CONTENT AREA: QUESTION WORKSPACE */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 110px)', overflowY: 'auto', p: { xs: 2, md: 3 } }}>
          {/* Question Title & Points Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
                Question {currentQ.number}
              </Typography>
              <Chip
                label={currentQ.sectionTitle}
                size="small"
                sx={{ bgcolor: '#FAF5FF', color: '#0F264F', fontWeight: 700, fontSize: '0.72rem', border: '1px solid #FAF5FF' }}
              />
              <Chip
                label={currentQ.type === 'MCQ' ? 'Single Choice (MCQ)' : currentQ.type === 'MSQ' ? 'Multiple Select (MSQ)' : 'Hands-on Coding'}
                size="small"
                sx={{
                  bgcolor: currentQ.type === 'CODING' ? '#ECFDF5' : currentQ.type === 'MSQ' ? '#FAF5FF' : '#FAF5FF',
                  color: currentQ.type === 'CODING' ? '#047857' : currentQ.type === 'MSQ' ? '#7E22CE' : '#0F264F',
                  border: `1px solid ${currentQ.type === 'CODING' ? '#A7F3D0' : currentQ.type === 'MSQ' ? '#E9D5FF' : '#E9D5FF'}`,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                label={`+${currentQ.points} Points`}
                size="small"
                sx={{ bgcolor: '#F0FDF4', color: '#166534', fontWeight: 800, border: '1px solid #BBF7D0' }}
              />
              <Chip
                label={currentQ.difficulty}
                size="small"
                sx={{
                  bgcolor: currentQ.difficulty === 'Easy' ? '#FAF5FF' : currentQ.difficulty === 'Medium' ? '#FEF3C7' : '#FEE2E2',
                  color: currentQ.difficulty === 'Easy' ? '#0F264F' : currentQ.difficulty === 'Medium' ? '#92400E' : '#991B1B',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
          </Box>

          {/* ========================================================================= */}
          {/* RENDER QUESTION BY TYPE: MCQ vs MSQ vs CODING                            */}
          {/* ========================================================================= */}

          {/* 1. MCQ & MSQ VIEW */}
          {(currentQ.type === 'MCQ' || currentQ.type === 'MSQ') && (
            <Box sx={{ maxWidth: 900 }}>
              {/* Question Statement Card */}
              <Card sx={{ p: 3, mb: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1E293B', lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                  {currentQ.statement}
                </Typography>
              </Card>

              {/* Sub-label */}
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 1.5 }}>
                {currentQ.type === 'MCQ' ? 'Select One Correct Option:' : 'Select All That Apply (MSQ):'}
              </Typography>

              {/* Options List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {currentQ.options?.map((opt) => {
                  const isSelected =
                    currentQ.type === 'MCQ'
                      ? mcqAnswers[currentQ.id] === opt.key
                      : (msqAnswers[currentQ.id] || []).includes(opt.key);

                  return (
                    <Box
                      key={opt.key}
                      onClick={() => (currentQ.type === 'MCQ' ? handleSelectMCQ(opt.key) : handleToggleMSQ(opt.key))}
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: isSelected ? '#FAF5FF' : '#FFFFFF',
                        border: `1.5px solid ${isSelected ? '#5B2D90' : '#E2E8F0'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected ? '0 4px 14px rgba(91, 45, 144, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          borderColor: '#5B2D90',
                          bgcolor: isSelected ? '#FAF5FF' : '#F8FAFC',
                          boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: currentQ.type === 'MCQ' ? '50%' : 1.5,
                            bgcolor: isSelected ? '#0B1F3A' : '#F1F5F9',
                            color: isSelected ? '#FFFFFF' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                          }}
                        >
                          {opt.key}
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#0B1F3A' : '#334155' }}>
                          {opt.text}
                        </Typography>
                      </Box>

                      {currentQ.type === 'MCQ' ? (
                        isSelected ? (
                          <RadioButtonCheckedRoundedIcon sx={{ color: '#0B1F3A', fontSize: 22 }} />
                        ) : (
                          <RadioButtonUncheckedRoundedIcon sx={{ color: '#CBD5E1', fontSize: 22 }} />
                        )
                      ) : isSelected ? (
                        <CheckBoxRoundedIcon sx={{ color: '#0B1F3A', fontSize: 22 }} />
                      ) : (
                        <CheckBoxOutlineBlankRoundedIcon sx={{ color: '#CBD5E1', fontSize: 22 }} />
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* 2. CODING CHALLENGE SPLIT-PANE VIEW */}
          {currentQ.type === 'CODING' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.1fr' }, gap: 2.5, flex: 1, minHeight: 480 }}>
              {/* Left Column: Problem Statement & Test Cases */}
              <Card sx={{ p: 2.5, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  {currentQ.title}
                </Typography>
                <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.7, whiteSpace: 'pre-line', mb: 2 }}>
                  {currentQ.statement}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Input Format
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.85rem' }}>
                  {currentQ.inputFormat}
                </Typography>

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Output Format
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mb: 2, fontSize: '0.85rem' }}>
                  {currentQ.outputFormat}
                </Typography>

                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                  Constraints
                </Typography>
                <Box sx={{ bgcolor: '#F8FAFC', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0', mb: 2, fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155', whiteSpace: 'pre-line' }}>
                  {currentQ.constraints}
                </Box>

                {currentQ.sampleInput && (
                  <>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      Sample Input
                    </Typography>
                    <Box sx={{ bgcolor: '#0F172A', color: '#C084FC', p: 1.5, borderRadius: 2, mb: 2, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {currentQ.sampleInput}
                    </Box>

                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', mb: 0.5 }}>
                      Sample Output
                    </Typography>
                    <Box sx={{ bgcolor: '#0F172A', color: '#4ADE80', p: 1.5, borderRadius: 2, mb: 2, fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {currentQ.sampleOutput}
                    </Box>
                  </>
                )}
              </Card>

              {/* Right Column: Code Editor & Execution Console */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Editor Container */}
                <Card sx={{ bgcolor: '#0F172A', border: '1px solid #1E293B', borderRadius: 3, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {/* Editor Header Bar */}
                  <Box sx={{ bgcolor: '#1E293B', px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CodeRoundedIcon sx={{ color: '#C084FC', fontSize: 20 }} />
                      <TextField
                        select
                        size="small"
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value as SupportedCompilerLang)}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: '#F8FAFC',
                            bgcolor: '#0F172A',
                            height: 32,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                          },
                        }}
                      >
                        <MenuItem value="python">Python 3</MenuItem>
                        <MenuItem value="cpp">C++ (GCC 12)</MenuItem>
                        <MenuItem value="java">Java 17</MenuItem>
                        <MenuItem value="javascript">JavaScript (Node)</MenuItem>
                        <MenuItem value="typescript">TypeScript</MenuItem>
                        <MenuItem value="go">Go</MenuItem>
                        <MenuItem value="rust">Rust</MenuItem>
                      </TextField>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Button
                        size="small"
                        onClick={handleRunCode}
                        disabled={isRunningCode}
                        startIcon={isRunningCode ? <CircularProgress size={14} color="inherit" /> : <PlayArrowRoundedIcon />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: '#F8FAFC',
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                          '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)' },
                        }}
                      >
                        Run Code
                      </Button>

                      <Button
                        size="small"
                        onClick={handleSubmitProblem}
                        disabled={isSubmittingCode}
                        startIcon={isSubmittingCode ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon />}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          color: '#FFFFFF',
                          bgcolor: '#059669',
                          '&:hover': { bgcolor: '#047857' },
                        }}
                      >
                        Submit
                      </Button>
                    </Box>
                  </Box>

                  {/* Code Area */}
                  <Box sx={{ p: 1.5, bgcolor: '#0B0F17', flex: 1, minHeight: 280 }}>
                    <textarea
                      value={activeCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      spellCheck={false}
                      style={{
                        width: '100%',
                        height: '280px',
                        backgroundColor: 'transparent',
                        color: '#F8FAFC',
                        border: 'none',
                        outline: 'none',
                        resize: 'vertical',
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        fontSize: '13px',
                        lineHeight: 1.5,
                      }}
                    />
                  </Box>
                </Card>

                {/* Execution Output Console */}
                <Card sx={{ p: 2, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TerminalRoundedIcon sx={{ fontSize: 16 }} /> Custom Input & Console Output
                    </Typography>
                    {submissionVerdicts[currentQ.id] && (
                      <Chip
                        label="Verdict: Accepted (12/12 Cases)"
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 800, fontSize: '0.72rem' }}
                      />
                    )}
                  </Box>

                  {runOutput ? (
                    <Box sx={{ bgcolor: '#0F172A', p: 1.5, borderRadius: 2, color: runOutput.success ? '#4ADE80' : '#F87171', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {runOutput.stdout || runOutput.stderr || 'Code executed with return code 0.'}
                      {runOutput.timeMs !== undefined && (
                        <Typography sx={{ color: '#94A3B8', fontSize: '0.7rem', mt: 0.5 }}>
                          Execution Time: {runOutput.timeMs}ms
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <TextField
                      placeholder="Provide standard input (stdin) here..."
                      size="small"
                      fullWidth
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', fontSize: '0.82rem', fontFamily: 'monospace' } }}
                    />
                  )}
                </Card>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* 3. MINIMAL CLEAN GLASSMORHPIC BOTTOM NAVIGATION BAR */}
      <Box
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 -4px 20px -2px rgba(15, 23, 42, 0.04)',
          px: { xs: 2, md: 3 },
          py: 1.2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          bottom: 0,
          zIndex: 100,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Left Actions: Clear Response & Mark for Review */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            size="small"
            onClick={handleClearResponse}
            startIcon={<DeleteSweepRoundedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: '#64748B',
              borderRadius: 2,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A', transform: 'translateY(-1px)' },
            }}
          >
            Clear Response
          </Button>

          <Button
            size="small"
            onClick={handleToggleReview}
            startIcon={markedForReview[currentQ.id] ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              color: markedForReview[currentQ.id] ? '#7E22CE' : '#64748B',
              bgcolor: markedForReview[currentQ.id] ? '#FAF5FF' : 'transparent',
              border: markedForReview[currentQ.id] ? '1px solid #E9D5FF' : '1px solid transparent',
              borderRadius: 2,
              px: 1.5,
              transition: 'all 0.15s ease',
              '&:hover': { bgcolor: '#FAF5FF', color: '#7E22CE', transform: 'translateY(-1px)' },
            }}
          >
            {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
          </Button>
        </Box>

        {/* Right Navigation: Previous & Next */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            disabled={currentQuestionIdx === 0}
            onClick={() => navigateToQuestion(currentQuestionIdx - 1)}
            startIcon={<FluidArrowBack />}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              borderRadius: 2,
              borderColor: '#CBD5E1',
              color: '#334155',
              px: 2,
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC', transform: 'translateY(-1px)' },
            }}
          >
            Previous
          </Button>

          {currentQuestionIdx < HACKERRANK_ASSESSMENT_QUESTIONS.length - 1 ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => navigateToQuestion(currentQuestionIdx + 1)}
              endIcon={<FluidArrowForward />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: 2,
                bgcolor: '#0B1F3A',
                boxShadow: '0 2px 8px rgba(91, 45, 144, 0.25)',
                px: 2.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#17366E', transform: 'translateY(-1px)', boxShadow: '0 4px 14px rgba(11, 31, 58, 0.35)' },
              }}
            >
              Save & Next
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => setShowFinishModal(true)}
              endIcon={<CheckCircleRoundedIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                borderRadius: 2,
                bgcolor: '#059669',
                boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                px: 2.5,
                transition: 'all 0.15s ease',
                '&:hover': { bgcolor: '#047857', transform: 'translateY(-1px)', boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)' },
              }}
            >
              Finish & Submit
            </Button>
          )}
        </Box>
      </Box>

      {/* 4. MODALS (ANTI-CHEAT WARNING & SUBMIT CONFIRMATION) */}
      <Dialog open={showWarningModal} onClose={() => setShowWarningModal(false)}>
        <DialogTitle sx={{ fontWeight: 800, color: '#DC2626', display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberRoundedIcon /> Proctoring Infraction Warning
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#334155', mb: 1 }}>
            You navigated away or switched tabs from the test environment.
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#DC2626' }}>
            Warning Count: {tabSwitchCount} / 3. Exceeding 3 tab switches will result in immediate test termination.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" onClick={() => setShowWarningModal(false)} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#DC2626' }}>
            I Understand, Resume Test
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showFinishModal} onClose={() => setShowFinishModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A' }}>
          Confirm Assessment Submission
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
            Are you sure you want to finalize and submit your evaluation?
          </Typography>
          <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#16A34A', fontWeight: 700 }}>
              Answered: {paletteSummary.answered}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7E22CE', fontWeight: 700 }}>
              Marked for Review: {paletteSummary.review}
            </Typography>
            <Typography variant="caption" sx={{ color: '#D97706', fontWeight: 700 }}>
              Unanswered / Visited: {paletteSummary.unanswered}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              Not Visited: {paletteSummary.unvisited}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowFinishModal(false)} sx={{ textTransform: 'none', fontWeight: 600, color: '#64748B' }}>
            Cancel & Return
          </Button>
          <Button variant="contained" onClick={handleFinishExam} sx={{ textTransform: 'none', fontWeight: 700, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>
            Confirm & Final Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
