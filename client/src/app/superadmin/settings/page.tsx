import type { Metadata } from 'next';
import SettingsClient from '@/components/superadmin/settings/SettingsClient';
import type {
  GeneralSettings,
  CompilerConfig,
  SecuritySettings,
  ScoringEngineSettings,
  ApiWebhookEntity,
  AuditLogEntity,
} from '@/types/settings';

export const metadata: Metadata = {
  title: 'Platform Settings & Security Console | CodePlatform Admin',
  description: 'Manage compiler sandboxes, institutional SSO authentication, scoring engine parameters, and security audit logs.',
};

const INITIAL_GENERAL: GeneralSettings = {
  platformName: 'CodePlatform Academic Cloud',
  institutionTagline: 'Institute Competitive Programming & Placement Learning System',
  primaryDomain: 'https://codeplatform.edu',
  supportEmail: 'admin-support@codeplatform.edu',
  academicYear: '2026 - 2027',
  defaultTimezone: 'Asia/Kolkata (IST +5:30)',
  allowPublicRegistrations: true,
  maintenanceMode: false,
};

const INITIAL_COMPILERS: CompilerConfig[] = [
  {
    id: 'cmp-001',
    language: 'C++ (GCC 13.2)',
    version: 'C++20 ISO Standard',
    compilerCommand: 'g++ -O3 -std=c++20 -Wall solution.cpp -o solution',
    defaultTimeLimitSec: 2.0,
    defaultMemoryLimitMb: 256,
    activeWorkersCount: 16,
    status: 'Enabled',
  },
  {
    id: 'cmp-002',
    language: 'Python 3.12',
    version: 'CPython 3.12.3 & PyPy3',
    compilerCommand: 'python3 -O solution.py',
    defaultTimeLimitSec: 5.0,
    defaultMemoryLimitMb: 512,
    activeWorkersCount: 12,
    status: 'Enabled',
  },
  {
    id: 'cmp-003',
    language: 'Java 21',
    version: 'OpenJDK 21.0.2 HotSpot',
    compilerCommand: 'javac Solution.java && java -Xmx512M Solution',
    defaultTimeLimitSec: 4.0,
    defaultMemoryLimitMb: 512,
    activeWorkersCount: 10,
    status: 'Enabled',
  },
  {
    id: 'cmp-004',
    language: 'Rust 1.77',
    version: 'Cargo 1.77.2',
    compilerCommand: 'rustc -O solution.rs -o solution',
    defaultTimeLimitSec: 2.0,
    defaultMemoryLimitMb: 256,
    activeWorkersCount: 8,
    status: 'Enabled',
  },
  {
    id: 'cmp-005',
    language: 'Go 1.22',
    version: 'Go 1.22.4 Linux amd64',
    compilerCommand: 'go build -o solution solution.go',
    defaultTimeLimitSec: 2.0,
    defaultMemoryLimitMb: 256,
    activeWorkersCount: 8,
    status: 'Enabled',
  },
  {
    id: 'cmp-006',
    language: 'JavaScript / Node.js 20',
    version: 'Node.js v20.12.2 LTS',
    compilerCommand: 'node --max-old-space-size=512 solution.js',
    defaultTimeLimitSec: 4.0,
    defaultMemoryLimitMb: 512,
    activeWorkersCount: 6,
    status: 'Beta',
  },
];

const INITIAL_SECURITY: SecuritySettings = {
  requireTwoFactorForAdmins: true,
  sessionTimeoutMinutes: 120,
  passwordMinLength: 10,
  allowGoogleSSO: true,
  allowGithubSSO: true,
  allowSamlSSO: true,
  samlEntityId: 'https://codeplatform.edu/auth/saml/metadata',
  enforceInstituteDomainMatch: true,
};

const INITIAL_SCORING: ScoringEngineSettings = {
  defaultIcpcPenaltyMinutes: 20,
  freezeScoreboardMinutesBeforeEnd: 60,
  mossPlagiarismSensitivity: 75,
  allowPartialTestcaseScores: true,
  autoRejudgeOnTestcaseUpdate: true,
};

const INITIAL_WEBHOOKS: ApiWebhookEntity[] = [
  {
    id: 'wh-001',
    name: 'Cambridge ERP Placement Sync',
    targetUrl: 'https://api.cam.ac.uk/webhooks/placement-results',
    events: ['submission.verdict', 'contest.finished'],
    status: 'Active',
    createdDate: 'Aug 10, 2026',
    lastTriggered: '12 mins ago (HTTP 200 OK)',
    secretMasked: 'whsec_••••••••••••94f2',
  },
  {
    id: 'wh-002',
    name: 'Discord Competitive Alerts Bot',
    targetUrl: 'https://discord.com/api/webhooks/112984/live-contests',
    events: ['contest.started', 'contest.leaderboard_frozen'],
    status: 'Active',
    createdDate: 'Aug 18, 2026',
    lastTriggered: '1 hour ago (HTTP 200 OK)',
    secretMasked: 'whsec_••••••••••••881b',
  },
  {
    id: 'wh-003',
    name: 'MIT Canvas LMS Gradebook Passback',
    targetUrl: 'https://canvas.mit.edu/api/v1/lti/assignments/grades',
    events: ['course.lesson_completed', 'exam.score_submitted'],
    status: 'Active',
    createdDate: 'Aug 28, 2026',
    lastTriggered: '3 hours ago (HTTP 200 OK)',
    secretMasked: 'whsec_••••••••••••55cd',
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntity[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-07 12:45:10',
    adminName: 'Platform Administrator',
    adminEmail: 'admin@codeplatform.edu',
    action: 'Updated MOSS Plagiarism Sensitivity to 75%',
    targetEntity: 'System Scoring Config',
    ipAddress: '192.168.1.9',
    status: 'SUCCESS',
    details: 'Adjusted AST similarity matching threshold prior to ICPC regional qualifier.',
  },
  {
    id: 'log-002',
    timestamp: '2026-09-07 11:20:04',
    adminName: 'Sarah Jenkins (Faculty Admin)',
    adminEmail: 's.jenkins@mit.edu',
    action: 'Rejudged Problem #140 Test Cases',
    targetEntity: 'Problem: Matrix Chain DP',
    ipAddress: '18.18.24.110',
    status: 'SUCCESS',
    details: 'Dispatched 840 student submissions for batch re-evaluation with updated memory limit.',
  },
  {
    id: 'log-003',
    timestamp: '2026-09-07 09:14:32',
    adminName: 'System Security Engine',
    adminEmail: 'security-bot@codeplatform.edu',
    action: 'Blocked Failed SSO Attempt',
    targetEntity: 'Auth Gateway',
    ipAddress: '198.51.100.42',
    status: 'WARNING',
    details: 'Domain mismatch: user email domain @unverified.org does not match Cambridge SSO realm.',
  },
  {
    id: 'log-004',
    timestamp: '2026-09-06 18:30:19',
    adminName: 'David Chen (DevOps)',
    adminEmail: 'd.chen@codeplatform.edu',
    action: 'Scaled C++20 Sandbox Workers to 16 Pods',
    targetEntity: 'BullMQ Queue Cluster',
    ipAddress: '10.0.4.18',
    status: 'SUCCESS',
    details: 'Autoscaled worker replicas ahead of Biweekly Speed Sprint Round 88.',
  },
  {
    id: 'log-005',
    timestamp: '2026-09-06 14:05:00',
    adminName: 'Platform Administrator',
    adminEmail: 'admin@codeplatform.edu',
    action: 'Rotated Webhook Signing Secret',
    targetEntity: 'MIT Canvas LMS Webhook',
    ipAddress: '192.168.1.9',
    status: 'SUCCESS',
    details: 'Quarterly cryptographic key rotation executed.',
  },
];

export default function SettingsPage() {
  return (
    <SettingsClient
      initialGeneral={INITIAL_GENERAL}
      initialCompilers={INITIAL_COMPILERS}
      initialSecurity={INITIAL_SECURITY}
      initialScoring={INITIAL_SCORING}
      initialWebhooks={INITIAL_WEBHOOKS}
      initialAuditLogs={INITIAL_AUDIT_LOGS}
    />
  );
}
