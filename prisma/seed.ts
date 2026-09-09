import {
  PrismaClient,
  Role,
  UserStatus,
  CollegeStatus,
  ProblemDifficulty,
  ProblemStatus,
  ContestStatus,
  SubmissionVerdict,
  SubmissionStatus,
  ProgrammingLanguage,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  const defaultPassword = 'Password123!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  const superAdminPasswordHash = await bcrypt.hash('123456', 12);

  // 1. Create Super Admin User
  const superAdmin = await prisma.user.upsert({
    where: { email: 'saahil123@gmail.com' },
    update: {
      passwordHash: superAdminPasswordHash,
      globalRole: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
    create: {
      email: 'saahil123@gmail.com',
      name: 'Saahil',
      passwordHash: superAdminPasswordHash,
      globalRole: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // Additional Super Admin
  const alexAdmin = await prisma.user.upsert({
    where: { email: 'alex.vance@codeplatform.io' },
    update: { passwordHash, globalRole: Role.SUPER_ADMIN, status: UserStatus.ACTIVE },
    create: {
      email: 'alex.vance@codeplatform.io',
      name: 'Alexander Vance',
      passwordHash,
      globalRole: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  // 2. Create Colleges
  const collegesData = [
    {
      name: 'Stanford University - Dept of CS',
      code: 'STAN-CS',
      email: 'cs-dept@stanford.edu',
      phone: '+1-650-723-2300',
      address: 'Gates Computer Science Building, 353 Jane Stanford Way, Stanford, CA',
      status: CollegeStatus.ACTIVE,
    },
    {
      name: 'Massachusetts Inst of Technology (MIT)',
      code: 'MIT-EECS',
      email: 'eecs-admin@mit.edu',
      phone: '+1-617-253-1000',
      address: '77 Massachusetts Avenue, Cambridge, MA',
      status: CollegeStatus.ACTIVE,
    },
    {
      name: 'IIT Delhi - Dept of Comp Science',
      code: 'IITD-CS',
      email: 'office@cse.iitd.ac.in',
      phone: '+91-11-2659-1000',
      address: 'Hauz Khas, New Delhi, Delhi 110016',
      status: CollegeStatus.ACTIVE,
    },
    {
      name: 'Oxford Computing Faculty',
      code: 'OXF-CS',
      email: 'admin@cs.ox.ac.uk',
      phone: '+44-1865-273838',
      address: 'Wolfson Building, Parks Road, Oxford OX1 3QD',
      status: CollegeStatus.ACTIVE,
    },
    {
      name: 'Carnegie Mellon University - SCS',
      code: 'CMU-SCS',
      email: 'scs-dean@cmu.edu',
      phone: '+1-412-268-2000',
      address: '5000 Forbes Avenue, Pittsburgh, PA',
      status: CollegeStatus.ACTIVE,
    },
  ];

  const colleges: Record<string, any> = {};
  for (const c of collegesData) {
    colleges[c.code] = await prisma.college.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  // 3. Create Faculty & College Admins
  const facultyTuring = await prisma.user.upsert({
    where: { email: 'turing@stanford.edu' },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: 'turing@stanford.edu',
      name: 'Prof. Alan Turing',
      passwordHash,
      globalRole: Role.FACULTY,
      status: UserStatus.ACTIVE,
      memberships: {
        create: {
          collegeId: colleges['STAN-CS'].id,
          role: Role.FACULTY,
        },
      },
    },
  });

  const facultyCormen = await prisma.user.upsert({
    where: { email: 't.cormen@mit.edu' },
    update: { passwordHash, status: UserStatus.ACTIVE },
    create: {
      email: 't.cormen@mit.edu',
      name: 'Prof. Thomas Cormen',
      passwordHash,
      globalRole: Role.COLLEGE_ADMIN,
      status: UserStatus.ACTIVE,
      memberships: {
        create: {
          collegeId: colleges['MIT-EECS'].id,
          role: Role.COLLEGE_ADMIN,
        },
      },
    },
  });

  // 4. Create Students
  const studentsData = [
    { email: 'liam.vance@stanford.edu', name: 'Liam Vance', collegeCode: 'STAN-CS' },
    { email: 'maya.lin@mit.edu', name: 'Maya Lin', collegeCode: 'MIT-EECS' },
    { email: 'priya.sharma@iitd.ac.in', name: 'Priya Sharma', collegeCode: 'IITD-CS' },
    { email: 'aarav.patel@iitd.ac.in', name: 'Aarav Patel', collegeCode: 'IITD-CS' },
    { email: 'alex.rivera@cmu.edu', name: 'Alex Rivera', collegeCode: 'CMU-SCS' },
  ];

  const students: any[] = [];
  for (const s of studentsData) {
    const studentUser = await prisma.user.upsert({
      where: { email: s.email },
      update: { passwordHash, status: UserStatus.ACTIVE },
      create: {
        email: s.email,
        name: s.name,
        passwordHash,
        globalRole: Role.STUDENT,
        status: UserStatus.ACTIVE,
        memberships: {
          create: {
            collegeId: colleges[s.collegeCode].id,
            role: Role.STUDENT,
          },
        },
      },
    });
    students.push(studentUser);
  }

  // 5. Create Problems & Testcases
  const problemsData = [
    {
      title: 'Two Sum',
      slug: 'two-sum',
      statement:
        'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      inputFormat: 'The first line contains N and target. The second line contains N integers.',
      outputFormat: 'Print the two zero-based indices separated by space.',
      constraints: '2 <= N <= 10^4, -10^9 <= nums[i] <= 10^9, -10^9 <= target <= 10^9',
      difficulty: ProblemDifficulty.EASY,
      timeLimit: 1000,
      memoryLimit: 128,
      createdById: facultyTuring.id,
      collegeId: colleges['STAN-CS'].id,
      status: ProblemStatus.PUBLISHED,
      testCases: [
        { input: '4 9\n2 7 11 15', expectedOutput: '0 1', isHidden: false, explanation: 'nums[0] + nums[1] == 9 (2 + 7 = 9)', order: 1 },
        { input: '3 6\n3 2 4', expectedOutput: '1 2', isHidden: false, explanation: 'nums[1] + nums[2] == 6 (2 + 4 = 6)', order: 2 },
        { input: '2 6\n3 3', expectedOutput: '0 1', isHidden: true, explanation: '', order: 3 },
      ],
    },
    {
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      statement:
        'Given a string `s`, find the length of the longest substring without repeating characters.',
      inputFormat: 'A single string s.',
      outputFormat: 'An integer representing the length of the longest unique character substring.',
      constraints: '0 <= s.length <= 5 * 10^4, s consists of English letters, digits, symbols and spaces.',
      difficulty: ProblemDifficulty.MEDIUM,
      timeLimit: 1000,
      memoryLimit: 256,
      createdById: facultyCormen.id,
      collegeId: colleges['MIT-EECS'].id,
      status: ProblemStatus.PUBLISHED,
      testCases: [
        { input: 'abcabcbb', expectedOutput: '3', isHidden: false, explanation: 'The answer is "abc", with the length of 3.', order: 1 },
        { input: 'bbbbb', expectedOutput: '1', isHidden: false, explanation: 'The answer is "b", with the length of 1.', order: 2 },
        { input: 'pwwkew', expectedOutput: '3', isHidden: true, explanation: 'The answer is "wke", with the length of 3.', order: 3 },
      ],
    },
    {
      title: 'Median of Two Sorted Arrays',
      slug: 'median-of-two-sorted-arrays',
      statement:
        'Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.\n\nThe overall run time complexity should be `O(log (m+n))`.',
      inputFormat: 'First line contains m and n. Second line contains nums1. Third line contains nums2.',
      outputFormat: 'Print the median as a floating-point value formatted to 5 decimal places.',
      constraints: '0 <= m <= 1000, 0 <= n <= 1000, 1 <= m + n <= 2000',
      difficulty: ProblemDifficulty.HARD,
      timeLimit: 1500,
      memoryLimit: 256,
      createdById: facultyTuring.id,
      collegeId: colleges['STAN-CS'].id,
      status: ProblemStatus.PUBLISHED,
      testCases: [
        { input: '2 1\n1 3\n2', expectedOutput: '2.00000', isHidden: false, explanation: 'merged array = [1,2,3] and median is 2.', order: 1 },
        { input: '2 2\n1 2\n3 4', expectedOutput: '2.50000', isHidden: false, explanation: 'merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.', order: 2 },
      ],
    },
    {
      title: 'LRU Cache Implementation',
      slug: 'lru-cache-implementation',
      statement:
        'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the `LRUCache` class:\n- `LRUCache(int capacity)` Initialize the LRU cache with positive size capacity.\n- `int get(int key)` Return the value of the key if the key exists, otherwise return -1.\n- `void put(int key, int value)` Update the value of the key if the key exists. Otherwise, add the key-value pair to the cache. If the number of keys exceeds the capacity from this operation, evict the least recently used key.',
      inputFormat: 'List of operations and values.',
      outputFormat: 'Outputs produced by get queries.',
      constraints: '1 <= capacity <= 3000, 0 <= key <= 10^4, 0 <= value <= 10^5',
      difficulty: ProblemDifficulty.MEDIUM,
      timeLimit: 1000,
      memoryLimit: 256,
      createdById: facultyCormen.id,
      collegeId: colleges['MIT-EECS'].id,
      status: ProblemStatus.PUBLISHED,
      testCases: [
        { input: '2\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nput 4 4\nget 1\nget 3\nget 4', expectedOutput: '1 -1 -1 3 4', isHidden: false, explanation: 'LRU Cache operations simulation.', order: 1 },
      ],
    },
    {
      title: 'Trapping Rain Water',
      slug: 'trapping-rain-water',
      statement:
        'Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.',
      inputFormat: 'First line contains integer n. Second line contains n integers denoting heights.',
      outputFormat: 'Single integer indicating total trapped rainwater units.',
      constraints: 'n == height.length, 1 <= n <= 2 * 10^4, 0 <= height[i] <= 10^5',
      difficulty: ProblemDifficulty.HARD,
      timeLimit: 1000,
      memoryLimit: 256,
      createdById: facultyTuring.id,
      collegeId: colleges['STAN-CS'].id,
      status: ProblemStatus.PUBLISHED,
      testCases: [
        { input: '12\n0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', isHidden: false, explanation: '6 units of rain water are being trapped.', order: 1 },
        { input: '6\n4 2 0 3 2 5', expectedOutput: '9', isHidden: false, explanation: '9 units of rain water trapped.', order: 2 },
      ],
    },
    {
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      statement:
        'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.',
      inputFormat: 'A single string s.',
      outputFormat: 'true or false',
      constraints: '1 <= s.length <= 10^4',
      difficulty: ProblemDifficulty.EASY,
      timeLimit: 1000,
      memoryLimit: 128,
      createdById: facultyTuring.id,
      collegeId: colleges['STAN-CS'].id,
      status: ProblemStatus.PUBLISHED,
      testCases: [
        { input: '()[]{}', expectedOutput: 'true', isHidden: false, explanation: '', order: 1 },
        { input: '(]', expectedOutput: 'false', isHidden: false, explanation: '', order: 2 },
      ],
    },
  ];

  const createdProblems: any[] = [];
  for (const p of problemsData) {
    const { testCases, ...problemInput } = p;
    const prob = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: problemInput,
      create: {
        ...problemInput,
        testCases: {
          create: testCases,
        },
      },
    });
    createdProblems.push(prob);
  }

  // 6. Create Contests
  const contest1 = await prisma.contest.upsert({
    where: { id: 'cnt-live-01' },
    update: {},
    create: {
      id: 'cnt-live-01',
      title: 'Bi-Weekly Global Algorithmic Showdown',
      description: 'Global competitive programming challenge featuring dynamic programming, graphs, and greedy algorithms.',
      startTime: new Date(Date.now() - 3600000), // 1h ago
      endTime: new Date(Date.now() + 7200000), // 2h from now
      status: ContestStatus.ONGOING,
      createdById: superAdmin.id,
      collegeId: colleges['STAN-CS'].id,
      problems: {
        create: [
          { problemId: createdProblems[0].id, order: 1, points: 100 },
          { problemId: createdProblems[1].id, order: 2, points: 200 },
          { problemId: createdProblems[4].id, order: 3, points: 300 },
        ],
      },
    },
  });

  const contest2 = await prisma.contest.upsert({
    where: { id: 'cnt-upcoming-01' },
    update: {},
    create: {
      id: 'cnt-upcoming-01',
      title: 'Inter-University ICPC Spring Invitational',
      description: 'Official collegiate programming contest with ACM-ICPC scoring format and strict time limits.',
      startTime: new Date(Date.now() + 86400000 * 3), // in 3 days
      endTime: new Date(Date.now() + 86400000 * 3 + 18000000),
      status: ContestStatus.UPCOMING,
      createdById: superAdmin.id,
      collegeId: colleges['MIT-EECS'].id,
      problems: {
        create: [
          { problemId: createdProblems[1].id, order: 1, points: 100 },
          { problemId: createdProblems[2].id, order: 2, points: 250 },
          { problemId: createdProblems[3].id, order: 3, points: 300 },
        ],
      },
    },
  });

  // 7. Create Submissions
  await prisma.submission.createMany({
    data: [
      {
        problemId: createdProblems[0].id,
        userId: students[0].id,
        contestId: contest1.id,
        language: ProgrammingLanguage.CPP,
        sourceCode: '#include <iostream>\nint main() { return 0; }',
        status: SubmissionStatus.COMPLETED,
        verdict: SubmissionVerdict.ACCEPTED,
        runtime: 12,
        memory: 14.2,
        passedTestCases: 3,
        totalTestCases: 3,
      },
      {
        problemId: createdProblems[4].id,
        userId: students[1].id,
        contestId: contest1.id,
        language: ProgrammingLanguage.PYTHON,
        sourceCode: 'def trap(height):\n    return 6',
        status: SubmissionStatus.COMPLETED,
        verdict: SubmissionVerdict.ACCEPTED,
        runtime: 34,
        memory: 21.0,
        passedTestCases: 2,
        totalTestCases: 2,
      },
      {
        problemId: createdProblems[3].id,
        userId: students[2].id,
        language: ProgrammingLanguage.JAVA,
        sourceCode: 'class LRUCache {}',
        status: SubmissionStatus.COMPLETED,
        verdict: SubmissionVerdict.ACCEPTED,
        runtime: 58,
        memory: 42.1,
        passedTestCases: 1,
        totalTestCases: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Database seeded successfully with real-world entities:');
  console.log(` - Super Admin: ${superAdmin.email}`);
  console.log(` - Colleges: ${Object.keys(colleges).join(', ')}`);
  console.log(` - Problems: ${createdProblems.map((p) => p.title).join(', ')}`);
  console.log(` - Contests: ${contest1.title}, ${contest2.title}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
