export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, unknown>;
  }>;
}

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8000/graphql';

export async function fetchGraphQL<T = any>(
  query: string,
  variables: Record<string, any> = {},
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  let resolvedToken = token;

  // 1. In browser environment -> read from document.cookie
  if (!resolvedToken && typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (match) {
      resolvedToken = decodeURIComponent(match[1]);
    }
  }

  // 2. In Next.js SSR Server Component environment -> read from next/headers
  if (!resolvedToken && typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      resolvedToken = cookieStore.get('access_token')?.value;
    } catch {
      // Called outside incoming request context
    }
  }

  if (resolvedToken) {
    headers['Authorization'] = `Bearer ${resolvedToken}`;
  }

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers,
    credentials: 'include', // Sends httpOnly secure cookie automatically
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`GraphQL HTTP error: ${response.status} ${response.statusText}`);
  }

  const result: GraphQLResponse<T> = await response.json();

  if (result.errors && result.errors.length > 0) {
    const errorMessages = result.errors.map((e) => e.message).join(', ');
    throw new Error(`GraphQL error: ${errorMessages}`);
  }

  return result.data as T;
}

// ----------------------------------------------------
// GRAPHQL DOCUMENT QUERIES & MUTATIONS
// ----------------------------------------------------

export const USERS_QUERY = `
  query GetUsers($page: Int, $limit: Int, $search: String, $role: Role, $status: UserStatus) {
    users(page: $page, limit: $limit, search: $search, role: $role, status: $status) {
      items {
        id
        name
        email
        globalRole
        status
        createdAt
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      globalRole
      status
    }
  }
`;

export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      globalRole
      status
      avatarUrl
      bannerUrl
      bio
      phone
      institution
      department
      location
      birthDate
      githubUrl
      linkedinUrl
      websiteUrl
      resumeUrl
      resumeFileName
      contestRating
      ratingTier
      createdAt
      updatedAt
    }
  }
`;

export const COLLEGES_QUERY = `
  query GetColleges($page: Int, $limit: Int, $search: String, $status: CollegeStatus) {
    colleges(page: $page, limit: $limit, search: $search, status: $status) {
      items {
        id
        name
        code
        email
        phone
        address
        status
        createdAt
        _count {
          memberships
          batches
          courses
          problems
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const CREATE_COLLEGE_MUTATION = `
  mutation CreateCollege($input: CreateCollegeInput!) {
    createCollege(input: $input) {
      id
      name
      code
      status
    }
  }
`;

export const PROBLEMS_QUERY = `
  query GetProblems($page: Int, $limit: Int, $search: String, $difficulty: ProblemDifficulty, $status: ProblemStatus) {
    problems(page: $page, limit: $limit, search: $search, difficulty: $difficulty, status: $status) {
      items {
        id
        title
        slug
        difficulty
        status
        timeLimit
        memoryLimit
        createdAt
        _count {
          submissions
          testCases
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const CREATE_PROBLEM_MUTATION = `
  mutation CreateProblem($input: CreateProblemInput!) {
    createProblem(input: $input) {
      id
      title
      slug
      difficulty
      status
    }
  }
`;

export const CONTESTS_QUERY = `
  query GetContests($page: Int, $limit: Int, $search: String, $status: ContestStatus) {
    contests(page: $page, limit: $limit, search: $search, status: $status) {
      items {
        id
        title
        description
        startTime
        endTime
        status
        _count {
          problems
          registrations
          submissions
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const CREATE_CONTEST_MUTATION = `
  mutation CreateContest($input: CreateContestInput!) {
    createContest(input: $input) {
      id
      title
      startTime
      endTime
      status
    }
  }
`;

export const LIVE_SUBMISSIONS_QUERY = `
  query GetLiveSubmissions($limit: Int) {
    liveSubmissions(limit: $limit) {
      id
      language
      status
      verdict
      runtime
      memory
      passedTestCases
      totalTestCases
      createdAt
      user {
        name
        email
      }
      problem {
        title
        slug
      }
    }
  }
`;

export const SUBMIT_CODE_MUTATION = `
  mutation SubmitCode($input: CreateSubmissionInput!) {
    submitCode(input: $input) {
      id
      status
      language
      problemId
      createdAt
    }
  }
`;

export const COURSES_QUERY = `
  query GetCourses($page: Int, $limit: Int, $search: String, $status: CourseStatus) {
    courses(page: $page, limit: $limit, search: $search, status: $status) {
      items {
        id
        title
        description
        status
        createdAt
        college {
          name
        }
        createdBy {
          name
        }
        modules {
          id
          title
          order
          lessons {
            id
            title
            order
          }
        }
        _count {
          modules
          enrollments
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const DELETE_COURSE_MUTATION = `
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const DELETE_PROBLEM_MUTATION = `
  mutation DeleteProblem($id: ID!) {
    deleteProblem(id: $id)
  }
`;

export const DELETE_COLLEGE_MUTATION = `
  mutation DeleteCollege($id: ID!) {
    deleteCollege(id: $id)
  }
`;

export const CREATE_COURSE_MUTATION = `
  mutation CreateCourse($input: CreateCourseInput!) {
    createCourse(input: $input) {
      id
      title
      description
      status
      createdAt
    }
  }
`;

export const DELETE_CONTEST_MUTATION = `
  mutation DeleteContest($id: ID!) {
    deleteContest(id: $id)
  }
`;

// ----------------------------------------------------
// UPDATE MUTATIONS
// ----------------------------------------------------

export const UPDATE_COLLEGE_MUTATION = `
  mutation UpdateCollege($id: ID!, $input: UpdateCollegeInput!) {
    updateCollege(id: $id, input: $input) {
      id
      name
      code
      email
      phone
      address
      status
      updatedAt
    }
  }
`;

export const UPDATE_PROBLEM_MUTATION = `
  mutation UpdateProblem($id: ID!, $input: UpdateProblemInput!) {
    updateProblem(id: $id, input: $input) {
      id
      title
      slug
      statement
      inputFormat
      outputFormat
      constraints
      difficulty
      timeLimit
      memoryLimit
      status
      updatedAt
    }
  }
`;

export const UPDATE_COURSE_MUTATION = `
  mutation UpdateCourse($id: ID!, $input: UpdateCourseInput!) {
    updateCourse(id: $id, input: $input) {
      id
      title
      description
      status
      updatedAt
    }
  }
`;

export const UPDATE_CONTEST_MUTATION = `
  mutation UpdateContest($id: ID!, $input: UpdateContestInput!) {
    updateContest(id: $id, input: $input) {
      id
      title
      description
      startTime
      endTime
      status
      updatedAt
    }
  }
`;

// ----------------------------------------------------
// BULK & RELATION MUTATIONS
// ----------------------------------------------------

export const BULK_INVITE_USERS_MUTATION = `
  mutation BulkInviteUsers($input: BulkInviteUsersInput!) {
    bulkInviteUsers(input: $input) {
      invited
      expiresInHours
    }
  }
`;

export const ADD_COLLEGE_MEMBER_MUTATION = `
  mutation AddCollegeMember($collegeId: ID!, $input: AddCollegeMemberInput!) {
    addCollegeMember(collegeId: $collegeId, input: $input)
  }
`;

export const REMOVE_COLLEGE_MEMBER_MUTATION = `
  mutation RemoveCollegeMember($collegeId: ID!, $userId: ID!) {
    removeCollegeMember(collegeId: $collegeId, userId: $userId)
  }
`;

export const ADD_PROBLEM_TEST_CASE_MUTATION = `
  mutation AddProblemTestCase($problemId: ID!, $input: CreateTestCaseInput!) {
    addProblemTestCase(problemId: $problemId, input: $input) {
      id
      input
      expectedOutput
      isHidden
      order
    }
  }
`;

export const ADD_CONTEST_PROBLEM_MUTATION = `
  mutation AddContestProblem($contestId: ID!, $input: AddContestProblemInput!) {
    addContestProblem(contestId: $contestId, input: $input) {
      id
      contestId
      problemId
      points
      order
    }
  }
`;

export const REGISTER_FOR_CONTEST_MUTATION = `
  mutation RegisterForContest($contestId: ID!) {
    registerForContest(contestId: $contestId) {
      id
      contestId
      userId
      registeredAt
    }
  }
`;

// ----------------------------------------------------
// SINGLE ENTITY & DETAIL QUERIES
// ----------------------------------------------------

export const USER_BY_ID_QUERY = `
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      name
      email
      globalRole
      status
      createdAt
      updatedAt
    }
  }
`;

export const COLLEGE_BY_ID_QUERY = `
  query GetCollegeById($id: ID!) {
    college(id: $id) {
      id
      name
      code
      email
      phone
      address
      status
      createdAt
      updatedAt
      _count {
        memberships
        batches
        courses
        problems
      }
    }
  }
`;

export const PROBLEM_BY_ID_OR_SLUG_QUERY = `
  query GetProblemByIdOrSlug($idOrSlug: String!) {
    problem(idOrSlug: $idOrSlug) {
      id
      title
      slug
      statement
      inputFormat
      outputFormat
      constraints
      difficulty
      timeLimit
      memoryLimit
      status
      createdAt
      updatedAt
      testCases {
        id
        input
        expectedOutput
        explanation
        isHidden
        order
      }
      _count {
        submissions
        testCases
      }
    }
  }
`;

export const PROBLEM_TEST_CASES_QUERY = `
  query GetProblemTestCases($problemId: ID!) {
    problemTestCases(problemId: $problemId) {
      id
      input
      expectedOutput
      explanation
      isHidden
      order
    }
  }
`;

export const COURSE_BY_ID_QUERY = `
  query GetCourseById($id: ID!) {
    course(id: $id) {
      id
      title
      description
      status
      createdAt
      updatedAt
      modules {
        id
        title
        description
        order
        lessons {
          id
          title
          content
          order
        }
      }
      _count {
        modules
        enrollments
      }
    }
  }
`;

export const CONTEST_BY_ID_QUERY = `
  query GetContestById($id: ID!) {
    contest(id: $id) {
      id
      title
      description
      startTime
      endTime
      status
      createdAt
      updatedAt
      problems {
        id
        problemId
        points
        order
        problem {
          id
          title
          slug
          difficulty
        }
      }
      registrations {
        id
        userId
        registeredAt
        user {
          id
          name
          email
        }
      }
      _count {
        problems
        registrations
        submissions
      }
    }
  }
`;

export const SUBMISSIONS_LIST_QUERY = `
  query GetSubmissions($page: Int, $limit: Int, $problemId: String, $userId: String, $contestId: String, $verdict: SubmissionVerdict, $language: ProgrammingLanguage) {
    submissions(page: $page, limit: $limit, problemId: $problemId, userId: $userId, contestId: $contestId, verdict: $verdict, language: $language) {
      items {
        id
        problemId
        userId
        contestId
        language
        sourceCode
        status
        verdict
        runtime
        memory
        passedTestCases
        totalTestCases
        errorMessage
        createdAt
        updatedAt
        user {
          id
          name
          email
        }
        problem {
          id
          title
          slug
          difficulty
        }
      }
      meta {
        total
        page
        limit
        totalPages
      }
    }
  }
`;

export const SUBMISSION_BY_ID_QUERY = `
  query GetSubmissionById($id: ID!) {
    submission(id: $id) {
      id
      problemId
      userId
      contestId
      language
      sourceCode
      status
      verdict
      runtime
      memory
      passedTestCases
      totalTestCases
      errorMessage
      createdAt
      updatedAt
      user {
        id
        name
        email
      }
      problem {
        id
        title
        slug
        difficulty
      }
    }
  }
`;

export const STUDENT_PROFILE_QUERY = `
  query GetStudentProfile($handleOrId: String!) {
    studentProfile(handleOrId: $handleOrId) {
      id
      name
      handle
      email
      role
      avatarUrl
      bannerUrl
      bio
      institution
      department
      location
      phone
      joinedDate
      githubUrl
      linkedinUrl
      websiteUrl
      resumeUrl
      resumeFileName
      contestRating
      ratingTier
      globalRank
      solvedTotal
      solvedEasy
      solvedMedium
      solvedHard
      totalSubmissions
      accuracyRate
      currentStreakDays
      maxStreakDays
      topics {
        name
        solved
        total
        pct
      }
      submissions {
        id
        problemTitle
        problemSlug
        problemCode
        difficulty
        language
        verdict
        runtimeMs
        memoryKb
        submittedAt
        codeSnippet
      }
      contests {
        id
        contestName
        contestDate
        rank
        totalParticipants
        score
        penaltyTime
        ratingDelta
        newRating
      }
      courses {
        id
        title
        slug
        instructor
        modulesCompleted
        totalModules
        progressPct
        status
      }
    }
  }
`;

export const ADMIN_METRICS_QUERY = `
  query GetAdminMetrics {
    adminMetrics {
      collegesCount
      studentsCount
      facultyCount
      adminsCount
      totalUsersCount
      problemsCount
      contestsCount
      submissionsCount
      systemStatus
      uptimePercentage
    }
  }
`;

export const ADMIN_AUDIT_LOGS_QUERY = `
  query GetAdminAuditLogs {
    adminAuditLogs {
      id
      action
      detail
      ipAddress
      status
      createdAt
    }
  }
`;



