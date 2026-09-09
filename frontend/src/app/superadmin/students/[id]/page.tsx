import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StudentDetailClient, {
  StudentSubmissionItem,
  StudentCourseItem,
  StudentContestItem,
  StudentTopicItem,
  StudentBadgeItem,
} from '@/components/superadmin/students/StudentDetailClient';
import { StudentDirectoryEntity } from '@/components/superadmin/students/StudentsDirectoryClient';

// Seed Students Master Directory
const MASTER_STUDENTS: StudentDirectoryEntity[] = [
  {
    id: 'stu-1',
    name: 'Maya Lin',
    handle: 'mayalin_cs',
    email: 'm.lin@stuy.edu',
    studentId: 'STUY-2027-014',
    institutionType: 'School',
    institutionName: 'Stuyvesant High School of Science',
    cohort: 'Grade 11 - USACO Gold Track',
    problemsSolved: 680,
    solvedEasy: 240,
    solvedMedium: 310,
    solvedHard: 130,
    contestRating: 2380,
    ratingTier: 'Master',
    globalRank: 1,
    accuracy: '96.4%',
    streakDays: 48,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#2563EB',
  },
  {
    id: 'stu-2',
    name: 'Liam Vance',
    handle: 'liam_vance',
    email: 'l.vance@stanford.edu',
    studentId: 'STAN-2026-088',
    institutionType: 'College',
    institutionName: 'Stanford University - Dept of CS',
    cohort: 'Batch 2026 - CS Alpha',
    problemsSolved: 650,
    solvedEasy: 210,
    solvedMedium: 320,
    solvedHard: 120,
    contestRating: 2310,
    ratingTier: 'Master',
    globalRank: 2,
    accuracy: '94.8%',
    streakDays: 42,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#3B82F6',
  },
  {
    id: 'stu-3',
    name: 'Alex Mercer',
    handle: 'mercer_code',
    email: 'alex.m@mit.edu',
    studentId: 'MIT-2026-012',
    institutionType: 'College',
    institutionName: 'Massachusetts Inst of Technology (MIT)',
    cohort: 'Batch 2026 - EECS Systems',
    problemsSolved: 620,
    solvedEasy: 190,
    solvedMedium: 310,
    solvedHard: 120,
    contestRating: 2240,
    ratingTier: 'Master',
    globalRank: 3,
    accuracy: '92.1%',
    streakDays: 36,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#10B981',
  },
  {
    id: 'stu-4',
    name: 'Elena Rostova',
    handle: 'elena_r',
    email: 'elena.rostova@dev.community',
    studentId: 'IND-89412',
    institutionType: 'Independent',
    institutionName: 'Self-Paced Community Learner',
    cohort: 'Global Competitive Track',
    problemsSolved: 590,
    solvedEasy: 200,
    solvedMedium: 270,
    solvedHard: 120,
    contestRating: 2180,
    ratingTier: 'Candidate Master',
    globalRank: 4,
    accuracy: '91.0%',
    streakDays: 31,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#7C3AED',
  },
  {
    id: 'stu-5',
    name: 'Devin Sharma',
    handle: 'devin_sharma',
    email: 'devin.s@iitd.ac.in',
    studentId: 'IITD-2027-045',
    institutionType: 'College',
    institutionName: 'IIT Delhi - Dept of Comp Science',
    cohort: 'Batch 2027 - CS Advanced',
    problemsSolved: 550,
    solvedEasy: 180,
    solvedMedium: 260,
    solvedHard: 110,
    contestRating: 2090,
    ratingTier: 'Candidate Master',
    globalRank: 5,
    accuracy: '89.6%',
    streakDays: 27,
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#DC2626',
  },
  {
    id: 'stu-6',
    name: 'Ethan Zhang',
    handle: 'ezhang_tj',
    email: 'e.zhang@tjhsst.edu',
    studentId: 'TJHSST-2028-005',
    institutionType: 'School',
    institutionName: 'Thomas Jefferson High School for Science & Tech',
    cohort: 'Grade 10 - AP CS A Alpha',
    problemsSolved: 480,
    solvedEasy: 170,
    solvedMedium: 220,
    solvedHard: 90,
    contestRating: 1940,
    ratingTier: 'Candidate Master',
    globalRank: 6,
    accuracy: '93.2%',
    streakDays: 39,
    status: 'Active',
    avatarColor: '#059669',
  },
  {
    id: 'stu-7',
    name: 'Sophia Williams',
    handle: 'sophia_code',
    email: 'sophia.w@ox.ac.uk',
    studentId: 'OXF-2027-033',
    institutionType: 'College',
    institutionName: 'Oxford Computing Faculty',
    cohort: 'Batch 2027 - Algorithms',
    problemsSolved: 460,
    solvedEasy: 150,
    solvedMedium: 230,
    solvedHard: 80,
    contestRating: 1910,
    ratingTier: 'Expert',
    globalRank: 7,
    accuracy: '88.4%',
    streakDays: 22,
    status: 'Active',
    avatarColor: '#4F46E5',
  },
  {
    id: 'stu-8',
    name: 'Kavita Patel',
    handle: 'kavita_p',
    email: 'kavita.p@iitb.ac.in',
    studentId: 'IITB-2026-104',
    institutionType: 'College',
    institutionName: 'IIT Bombay - CS Engineering',
    cohort: 'Batch 2026 - AI / ML Track',
    problemsSolved: 430,
    solvedEasy: 140,
    solvedMedium: 210,
    solvedHard: 80,
    contestRating: 1870,
    ratingTier: 'Expert',
    globalRank: 8,
    accuracy: '87.5%',
    streakDays: 19,
    status: 'Active',
    avatarColor: '#0891B2',
  },
  {
    id: 'stu-9',
    name: 'Lucas Dupont',
    handle: 'ldupont_paris',
    email: 'l.dupont@polytechnique.fr',
    studentId: 'EP-2026-059',
    institutionType: 'College',
    institutionName: 'École Polytechnique',
    cohort: 'Batch 2026 - Mathematics & CS',
    problemsSolved: 410,
    solvedEasy: 130,
    solvedMedium: 200,
    solvedHard: 80,
    contestRating: 1820,
    ratingTier: 'Expert',
    globalRank: 9,
    accuracy: '86.9%',
    streakDays: 15,
    status: 'Active',
    avatarColor: '#D97706',
  },
  {
    id: 'stu-10',
    name: 'Chloe Tremblay',
    handle: 'chloe_bx',
    email: 'c.tremblay@bxscience.edu',
    studentId: 'BXSCI-2027-029',
    institutionType: 'School',
    institutionName: 'Bronx High School of Science',
    cohort: 'Grade 11 - Cybernetics Lab',
    problemsSolved: 390,
    solvedEasy: 140,
    solvedMedium: 190,
    solvedHard: 60,
    contestRating: 1780,
    ratingTier: 'Specialist',
    globalRank: 10,
    accuracy: '90.5%',
    streakDays: 25,
    status: 'Active',
    avatarColor: '#9333EA',
  },
  {
    id: 'stu-11',
    name: 'Arjun Rao',
    handle: 'arjun_r',
    email: 'arjun.rao@stanford.edu',
    studentId: 'STAN-2027-042',
    institutionType: 'College',
    institutionName: 'Stanford University - Dept of CS',
    cohort: 'Batch 2027 - Distributed Systems',
    problemsSolved: 360,
    solvedEasy: 120,
    solvedMedium: 180,
    solvedHard: 60,
    contestRating: 1720,
    ratingTier: 'Specialist',
    globalRank: 11,
    accuracy: '85.2%',
    streakDays: 14,
    status: 'Active',
    avatarColor: '#2563EB',
  },
  {
    id: 'stu-12',
    name: 'Zackary Bell',
    handle: 'zack_exeter',
    email: 'z.bell@exeter.edu',
    studentId: 'PEA-2028-011',
    institutionType: 'School',
    institutionName: 'Phillips Exeter Academy',
    cohort: 'Grade 10 - Intro to Algorithms',
    problemsSolved: 280,
    solvedEasy: 120,
    solvedMedium: 130,
    solvedHard: 30,
    contestRating: 1590,
    ratingTier: 'Specialist',
    globalRank: 12,
    accuracy: '84.0%',
    streakDays: 12,
    status: 'Active',
    avatarColor: '#EA580C',
  },
];

// Seed Submissions History
const MOCK_SUBMISSIONS: StudentSubmissionItem[] = [
  {
    id: 'sub-8901',
    problemTitle: 'Trapping Rain Water II (3D Grid)',
    problemCode: 'PROB-407',
    difficulty: 'Hard',
    language: 'C++20',
    verdict: 'Accepted',
    runtimeMs: 18,
    memoryKb: 14200,
    submittedAt: 'Today, 09:14 AM',
    codeSnippet: `#include <vector>
#include <queue>
using namespace std;

struct Cell {
    int r, c, h;
    bool operator>(const Cell& other) const { return h > other.h; }
};

int trapRainWater(vector<vector<int>>& heightMap) {
    if (heightMap.empty() || heightMap[0].empty()) return 0;
    int m = heightMap.size(), n = heightMap[0].size();
    priority_queue<Cell, vector<Cell>, greater<Cell>> pq;
    vector<vector<bool>> visited(m, vector<bool>(n, false));

    for (int i = 0; i < m; ++i) {
        pq.push({i, 0, heightMap[i][0]}); visited[i][0] = true;
        pq.push({i, n - 1, heightMap[i][n - 1]}); visited[i][n - 1] = true;
    }
    for (int j = 1; j < n - 1; ++j) {
        pq.push({0, j, heightMap[0][j]}); visited[0][j] = true;
        pq.push({m - 1, j, heightMap[m - 1][j]}); visited[m - 1][j] = true;
    }

    int water = 0;
    int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};
    while (!pq.empty()) {
        auto [r, c, h] = pq.top(); pq.pop();
        for (auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && !visited[nr][nc]) {
                visited[nr][nc] = true;
                water += max(0, h - heightMap[nr][nc]);
                pq.push({nr, nc, max(h, heightMap[nr][nc])});
            }
        }
    }
    return water;
}`,
  },
  {
    id: 'sub-8894',
    problemTitle: 'Serialize and Deserialize Binary Tree',
    problemCode: 'PROB-297',
    difficulty: 'Hard',
    language: 'Python 3',
    verdict: 'Accepted',
    runtimeMs: 64,
    memoryKb: 21800,
    submittedAt: 'Yesterday, 10:45 PM',
    codeSnippet: `class Codec:
    def serialize(self, root):
        def rserialize(node):
            if not node:
                vals.append('#')
            else:
                vals.append(str(node.val))
                rserialize(node.left)
                rserialize(node.right)
        vals = []
        rserialize(root)
        return ','.join(vals)

    def deserialize(self, data):
        def rdeserialize():
            val = next(nodes)
            if val == '#':
                return None
            node = TreeNode(int(val))
            node.left = rdeserialize()
            node.right = rdeserialize()
            return node
        nodes = iter(data.split(','))
        return rdeserialize()`,
  },
  {
    id: 'sub-8840',
    problemTitle: 'Median of Two Sorted Arrays',
    problemCode: 'PROB-004',
    difficulty: 'Hard',
    language: 'C++20',
    verdict: 'Accepted',
    runtimeMs: 12,
    memoryKb: 8900,
    submittedAt: '2 days ago, 04:20 PM',
    codeSnippet: `double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    if (nums1.size() > nums2.size()) swap(nums1, nums2);
    int m = nums1.size(), n = nums2.size();
    int low = 0, high = m;
    while (low <= high) {
        int partitionX = (low + high) / 2;
        int partitionY = (m + n + 1) / 2 - partitionX;
        int maxLeftX = (partitionX == 0) ? INT_MIN : nums1[partitionX - 1];
        int minRightX = (partitionX == m) ? INT_MAX : nums1[partitionX];
        int maxLeftY = (partitionY == 0) ? INT_MIN : nums2[partitionY - 1];
        int minRightY = (partitionY == n) ? INT_MAX : nums2[partitionY];
        if (maxLeftX <= minRightY && maxLeftY <= minRightX) {
            if ((m + n) % 2 == 0)
                return (max(maxLeftX, maxLeftY) + min(minRightX, minRightY)) / 2.0;
            else
                return max(maxLeftX, maxLeftY);
        } else if (maxLeftX > minRightY) high = partitionX - 1;
        else low = partitionX + 1;
    }
    return 0.0;
}`,
  },
  {
    id: 'sub-8792',
    problemTitle: 'Longest Palindromic Substring',
    problemCode: 'PROB-005',
    difficulty: 'Medium',
    language: 'TypeScript',
    verdict: 'Accepted',
    runtimeMs: 48,
    memoryKb: 18400,
    submittedAt: '3 days ago, 01:10 PM',
    codeSnippet: `function longestPalindrome(s: string): string {
  if (!s || s.length <= 1) return s;
  let start = 0, maxLen = 0;
  function expand(l: number, r: number) {
    while (l >= 0 && r < s.length && s[l] === s[r]) {
      l--; r++;
    }
    const len = r - l - 1;
    if (len > maxLen) {
      maxLen = len;
      start = l + 1;
    }
  }
  for (let i = 0; i < s.length; i++) {
    expand(i, i);
    expand(i, i + 1);
  }
  return s.substring(start, start + maxLen);
}`,
  },
  {
    id: 'sub-8711',
    problemTitle: 'LRU Cache Design & Concurrent Access',
    problemCode: 'PROB-146',
    difficulty: 'Medium',
    language: 'Java 21',
    verdict: 'Accepted',
    runtimeMs: 38,
    memoryKb: 45600,
    submittedAt: '4 days ago, 08:30 PM',
    codeSnippet: `class LRUCache {
    class Node {
        int key, val;
        Node prev, next;
        Node(int k, int v) { key = k; val = v; }
    }
    private Map<Integer, Node> map = new HashMap<>();
    private int capacity;
    private Node head, tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail; tail.prev = head;
    }
    // O(1) get & put implementation...
}`,
  },
  {
    id: 'sub-8650',
    problemTitle: 'Word Break II (All Reconstructions)',
    problemCode: 'PROB-140',
    difficulty: 'Hard',
    language: 'C++20',
    verdict: 'Accepted',
    runtimeMs: 4,
    memoryKb: 7800,
    submittedAt: '5 days ago, 11:20 AM',
    codeSnippet: `// Backtracking with memoization...`,
  },
  {
    id: 'sub-8599',
    problemTitle: 'Course Schedule IV (Prerequisites Graph)',
    problemCode: 'PROB-1462',
    difficulty: 'Medium',
    language: 'Python 3',
    verdict: 'Time Limit Exceeded',
    runtimeMs: 2100,
    memoryKb: 34000,
    submittedAt: '6 days ago, 07:15 PM',
    codeSnippet: `// Naive BFS per query leading to TLE; optimized via Floyd-Warshall reachability matrix next run.`,
  },
  {
    id: 'sub-8520',
    problemTitle: 'Minimum Window Substring',
    problemCode: 'PROB-076',
    difficulty: 'Hard',
    language: 'C++20',
    verdict: 'Accepted',
    runtimeMs: 8,
    memoryKb: 9200,
    submittedAt: '1 week ago',
    codeSnippet: `// Sliding window with character frequency hash map...`,
  },
  {
    id: 'sub-8472',
    problemTitle: 'Merge k Sorted Lists',
    problemCode: 'PROB-023',
    difficulty: 'Hard',
    language: 'Java 21',
    verdict: 'Accepted',
    runtimeMs: 5,
    memoryKb: 43200,
    submittedAt: '1 week ago',
    codeSnippet: `// PriorityQueue min-heap merge algorithm...`,
  },
  {
    id: 'sub-8410',
    problemTitle: 'Alien Dictionary (Topological Sort)',
    problemCode: 'PROB-269',
    difficulty: 'Hard',
    language: 'Python 3',
    verdict: 'Accepted',
    runtimeMs: 32,
    memoryKb: 16800,
    submittedAt: '10 days ago',
    codeSnippet: `// Directed graph topological order with cycle detection...`,
  },
  {
    id: 'sub-8350',
    problemTitle: 'Kth Smallest Element in a BST',
    problemCode: 'PROB-230',
    difficulty: 'Medium',
    language: 'TypeScript',
    verdict: 'Accepted',
    runtimeMs: 56,
    memoryKb: 20100,
    submittedAt: '12 days ago',
    codeSnippet: `// In-order traversal with early exit...`,
  },
  {
    id: 'sub-8290',
    problemTitle: 'Valid Parentheses & Custom Brackets',
    problemCode: 'PROB-020',
    difficulty: 'Easy',
    language: 'C++20',
    verdict: 'Accepted',
    runtimeMs: 0,
    memoryKb: 6300,
    submittedAt: '2 weeks ago',
    codeSnippet: `// Stack-based bracket matching...`,
  },
];

// Seed Enrolled Courses
const MOCK_COURSES: StudentCourseItem[] = [
  {
    id: 'crs-1',
    title: 'Advanced Graph Algorithms & Network Flow',
    code: 'CS-401',
    level: 'Advanced',
    instructor: 'Prof. Thomas Cormen',
    modulesCompleted: 12,
    totalModules: 12,
    progressPct: 100,
    status: 'Completed',
  },
  {
    id: 'crs-2',
    title: 'Dynamic Programming Mastery: From Tabulation to SOS DP',
    code: 'CS-302',
    level: 'Advanced',
    instructor: 'Dr. Sarah Connor',
    modulesCompleted: 14,
    totalModules: 16,
    progressPct: 88,
    status: 'In Progress',
  },
  {
    id: 'crs-3',
    title: 'Distributed Systems Architecture & Paxos Consensus',
    code: 'CS-504',
    level: 'Advanced',
    instructor: 'Prof. Leslie Lamport',
    modulesCompleted: 7,
    totalModules: 10,
    progressPct: 70,
    status: 'In Progress',
  },
  {
    id: 'crs-4',
    title: 'Data Structures & Algorithmic Analysis (Honors)',
    code: 'CS-201',
    level: 'Intermediate',
    instructor: 'Dr. Robert Sedgewick',
    modulesCompleted: 18,
    totalModules: 18,
    progressPct: 100,
    status: 'Completed',
  },
  {
    id: 'crs-5',
    title: 'High-Performance Systems Programming in Modern C++20',
    code: 'CS-380',
    level: 'Intermediate',
    instructor: 'Bjarne S.',
    modulesCompleted: 10,
    totalModules: 14,
    progressPct: 71,
    status: 'In Progress',
  },
  {
    id: 'crs-6',
    title: 'Competitive Programming Olympiad Bootcamp (ICPC/USACO)',
    code: 'CP-101',
    level: 'Advanced',
    instructor: 'Coach Gennady K.',
    modulesCompleted: 24,
    totalModules: 24,
    progressPct: 100,
    status: 'Completed',
  },
];

// Seed Contest Participation History
const MOCK_CONTESTS: StudentContestItem[] = [
  {
    id: 'cnt-1',
    contestName: 'Weekly Competitive Grand Prix #142',
    contestDate: 'Mar 01, 2026',
    rank: 3,
    totalParticipants: 4820,
    problemsSolved: 4,
    penaltyTime: '01:14:22',
    ratingDelta: +48,
    newRating: 2380,
  },
  {
    id: 'cnt-2',
    contestName: 'Global Biweekly Clash #88',
    contestDate: 'Feb 15, 2026',
    rank: 8,
    totalParticipants: 5120,
    problemsSolved: 4,
    penaltyTime: '01:28:10',
    ratingDelta: +32,
    newRating: 2332,
  },
  {
    id: 'cnt-3',
    contestName: 'Collegiate Invitational Cup 2026',
    contestDate: 'Feb 02, 2026',
    rank: 12,
    totalParticipants: 2400,
    problemsSolved: 5,
    penaltyTime: '02:05:40',
    ratingDelta: +25,
    newRating: 2300,
  },
  {
    id: 'cnt-4',
    contestName: 'Weekly Competitive Grand Prix #140',
    contestDate: 'Jan 18, 2026',
    rank: 19,
    totalParticipants: 4600,
    problemsSolved: 4,
    penaltyTime: '01:42:15',
    ratingDelta: +18,
    newRating: 2275,
  },
  {
    id: 'cnt-5',
    contestName: 'Winter Algorithms Sprint 2026',
    contestDate: 'Jan 04, 2026',
    rank: 42,
    totalParticipants: 3900,
    problemsSolved: 3,
    penaltyTime: '01:18:00',
    ratingDelta: -15,
    newRating: 2257,
  },
  {
    id: 'cnt-6',
    contestName: 'Weekly Competitive Grand Prix #138',
    contestDate: 'Dec 21, 2025',
    rank: 14,
    totalParticipants: 4200,
    problemsSolved: 4,
    penaltyTime: '01:30:50',
    ratingDelta: +35,
    newRating: 2272,
  },
  {
    id: 'cnt-7',
    contestName: 'Global End-of-Year Championship',
    contestDate: 'Dec 07, 2025',
    rank: 22,
    totalParticipants: 6200,
    problemsSolved: 4,
    penaltyTime: '01:55:10',
    ratingDelta: +28,
    newRating: 2237,
  },
];

// Seed Topic Mastery
const MOCK_TOPICS: StudentTopicItem[] = [
  {
    id: 'top-1',
    topicName: 'Dynamic Programming & Optimization',
    solvedCount: 142,
    totalAvailable: 160,
    accuracy: '94.2%',
    levelMastery: 'Master',
  },
  {
    id: 'top-2',
    topicName: 'Graph Theory & Network Flows',
    solvedCount: 118,
    totalAvailable: 130,
    accuracy: '96.5%',
    levelMastery: 'Master',
  },
  {
    id: 'top-3',
    topicName: 'Trees, Segment Trees & Fenwick',
    solvedCount: 95,
    totalAvailable: 110,
    accuracy: '93.8%',
    levelMastery: 'Master',
  },
  {
    id: 'top-4',
    topicName: 'Binary Search & Monotonic Queues',
    solvedCount: 88,
    totalAvailable: 95,
    accuracy: '98.1%',
    levelMastery: 'Master',
  },
  {
    id: 'top-5',
    topicName: 'String Algorithms (KMP, Z-Algo, Aho-Corasick)',
    solvedCount: 64,
    totalAvailable: 80,
    accuracy: '91.0%',
    levelMastery: 'Proficient',
  },
  {
    id: 'top-6',
    topicName: 'Combinatorics & Number Theory',
    solvedCount: 58,
    totalAvailable: 75,
    accuracy: '89.4%',
    levelMastery: 'Proficient',
  },
  {
    id: 'top-7',
    topicName: 'Greedy Algorithms & Heuristics',
    solvedCount: 72,
    totalAvailable: 85,
    accuracy: '92.6%',
    levelMastery: 'Proficient',
  },
  {
    id: 'top-8',
    topicName: 'Bit Manipulation & Bitmask DP',
    solvedCount: 43,
    totalAvailable: 60,
    accuracy: '86.0%',
    levelMastery: 'Intermediate',
  },
];

// Seed Badges & Honors
const MOCK_BADGES: StudentBadgeItem[] = [
  {
    id: 'bdg-1',
    title: 'Grandmaster Division 1 Gold Medalist',
    category: 'Contest Medal',
    issuer: 'CodePlatform Global League',
    issueDate: 'Feb 2026',
    credentialId: 'CP-MEDAL-2026-9812',
  },
  {
    id: 'bdg-2',
    title: 'Top 0.1% Global Rating Tier (Master)',
    category: 'Milestone',
    issuer: 'International Competitive Board',
    issueDate: 'Jan 2026',
    credentialId: 'CP-TIER-M-0089',
  },
  {
    id: 'bdg-3',
    title: 'Advanced Graph Algorithms Honors Diploma',
    category: 'Course Certificate',
    issuer: 'Stanford Online / CodePlatform',
    issueDate: 'Jan 2026',
    credentialId: 'CP-CERT-CS401-449',
  },
  {
    id: 'bdg-4',
    title: '50-Day Unbroken Problem-Solving Streak',
    category: 'Milestone',
    issuer: 'CodePlatform Daily Challenge',
    issueDate: 'Dec 2025',
    credentialId: 'CP-STRK-50-3321',
  },
  {
    id: 'bdg-5',
    title: 'Collegiate Invitational Top 10 Finisher',
    category: 'Contest Medal',
    issuer: 'ACM-ICPC Regional Committee',
    issueDate: 'Nov 2025',
    credentialId: 'CP-ACM-REG-109',
  },
  {
    id: 'bdg-6',
    title: 'Data Structures & Algorithmic Analysis Distinction',
    category: 'Course Certificate',
    issuer: 'MIT Open Learning Faculty',
    issueDate: 'Oct 2025',
    credentialId: 'CP-CERT-CS201-102',
  },
];

import { apiService } from '@/lib/api-service';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  let studentName = 'Student Coder';
  let studentHandle = 'student';
  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    const match = liveData?.items?.find((u: any) => u.id === id);
    if (match) {
      studentName = match.name || match.email;
      studentHandle = match.email ? match.email.split('@')[0] : 'student';
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${studentName} (@${studentHandle}) | Student Profile & Coding Portfolio`,
    description: `Performance metrics, contest rating progression, and solved challenges for ${studentName}.`,
  };
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params;

  let student: StudentDirectoryEntity | undefined;

  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    const match = liveData?.items?.find((u: any) => u.id === id);
    if (match) {
      student = {
        id: match.id,
        name: match.name || 'Student Developer',
        handle: match.email ? match.email.split('@')[0] : 'coder',
        email: match.email,
        studentId: `STU-2026-${match.id.slice(0, 4).toUpperCase()}`,
        institutionType: 'College',
        institutionName: match.memberships?.[0]?.college?.name || 'Academic Campus',
        cohort: 'Batch 2026 - CS Alpha',
        problemsSolved: 0,
        solvedEasy: 0,
        solvedMedium: 0,
        solvedHard: 0,
        contestRating: 1200,
        ratingTier: 'Newbie',
        globalRank: 0,
        accuracy: '0%',
        streakDays: 0,
        status: match.status === 'ACTIVE' ? 'Active' : 'Inactive',
        avatarColor: '#2563EB',
      };
    }
  } catch (err) {
    console.warn('Live student detail fetch fallback:', err);
  }

  if (!student) {
    student = MASTER_STUDENTS.find((s) => s.id === id);
  }

  if (!student) {
    student = MASTER_STUDENTS[0];
  }

  return (
    <StudentDetailClient
      student={student}
      initialSubmissions={MOCK_SUBMISSIONS}
      initialCourses={MOCK_COURSES}
      initialContests={MOCK_CONTESTS}
      initialTopics={MOCK_TOPICS}
      initialBadges={MOCK_BADGES}
    />
  );
}
