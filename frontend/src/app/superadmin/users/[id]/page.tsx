import type { Metadata } from 'next';
import UserDetailClient, {
  UserSecurityLogItem,
  UserTenantMembershipItem,
  UserActiveSessionItem,
  UserPreferenceItem,
} from '@/components/superadmin/users/UserDetailClient';
import { UserDirectoryEntity } from '@/components/superadmin/users/UsersDirectoryClient';

// Master users seed database
const MASTER_USERS: UserDirectoryEntity[] = [
  {
    id: 'usr-001',
    name: 'Alexander Vance',
    handle: 'alex_vance',
    email: 'alex.vance@codeplatform.io',
    role: 'SUPER_ADMIN',
    institutionType: 'Independent',
    institutionName: 'Global CodePlatform Platform',
    twoFactorEnabled: true,
    lastLoginAt: 'Just now',
    lastLoginIp: '192.168.1.10 (US East)',
    createdAt: 'Jan 10, 2025',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#7C3AED',
  },
  {
    id: 'usr-002',
    name: 'Prof. Thomas Cormen',
    handle: 'cormen_mit',
    email: 't.cormen@mit.edu',
    role: 'COLLEGE_ADMIN',
    institutionType: 'College',
    institutionName: 'Massachusetts Inst of Technology (MIT)',
    twoFactorEnabled: true,
    lastLoginAt: '2 hours ago',
    lastLoginIp: '18.12.0.44 (Cambridge, MA)',
    createdAt: 'Feb 01, 2025',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#2563EB',
  },
  {
    id: 'usr-003',
    name: 'Dr. Sarah Connor',
    handle: 'sconnor_stuy',
    email: 's.connor@stuy.edu',
    role: 'SCHOOL_ADMIN',
    institutionType: 'School',
    institutionName: 'Stuyvesant High School of Science',
    twoFactorEnabled: true,
    lastLoginAt: 'Today, 08:30 AM',
    lastLoginIp: '142.250.190.46 (New York, NY)',
    createdAt: 'Feb 15, 2025',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    avatarColor: '#059669',
  },
  {
    id: 'usr-004',
    name: 'Dr. Robert Sedgewick',
    handle: 'sedgewick_cs',
    email: 'sedgewick@stanford.edu',
    role: 'FACULTY',
    institutionType: 'College',
    institutionName: 'Stanford University - Dept of CS',
    twoFactorEnabled: true,
    lastLoginAt: 'Yesterday, 04:15 PM',
    lastLoginIp: '171.64.68.22 (Palo Alto, CA)',
    createdAt: 'Mar 01, 2025',
    status: 'Active',
    avatarColor: '#0891B2',
  },
  {
    id: 'usr-005',
    name: 'Prof. Leslie Lamport',
    handle: 'lamport_paxos',
    email: 'lamport@iitd.ac.in',
    role: 'FACULTY',
    institutionType: 'College',
    institutionName: 'IIT Delhi - Dept of Comp Science',
    twoFactorEnabled: false,
    lastLoginAt: '3 days ago',
    lastLoginIp: '103.27.9.1 (New Delhi, IN)',
    createdAt: 'Mar 10, 2025',
    status: 'Active',
    avatarColor: '#0891B2',
  },
];

// Seed Security & Audit Logs
const MOCK_SECURITY_LOGS: UserSecurityLogItem[] = [
  {
    id: 'log-901',
    event: 'Interactive Sign-in Success',
    category: 'Auth',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/122.0.0.0',
    status: 'Success',
    timestamp: 'Today, 09:14 AM',
  },
  {
    id: 'log-902',
    event: 'TOTP 2FA Verification Passed',
    category: 'Security',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    userAgent: 'Authenticator App TOTP v2.1',
    status: 'Success',
    timestamp: 'Today, 09:14 AM',
  },
  {
    id: 'log-903',
    event: 'OAuth Token Refresh Granted',
    category: 'Auth',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    userAgent: 'Next.js API Client (Node fetch)',
    status: 'Success',
    timestamp: 'Yesterday, 11:20 PM',
  },
  {
    id: 'log-904',
    event: 'Role Elevation / Scope Modification',
    category: 'Audit',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    userAgent: 'Admin Portal Console',
    status: 'Success',
    timestamp: 'Feb 28, 2026',
  },
  {
    id: 'log-905',
    event: 'API Key Created (judge-runner-v2)',
    category: 'Security',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    userAgent: 'Admin Portal Console',
    status: 'Success',
    timestamp: 'Feb 15, 2026',
  },
  {
    id: 'log-906',
    event: 'Failed Sign-in Attempt (Invalid Password)',
    category: 'Auth',
    ipAddress: '45.130.82.11',
    location: 'Frankfurt, DE',
    userAgent: 'curl/7.68.0',
    status: 'Failed',
    timestamp: 'Jan 22, 2026',
  },
];

// Seed Tenant Memberships
const MOCK_MEMBERSHIPS: UserTenantMembershipItem[] = [
  {
    id: 'mem-01',
    tenantName: 'Stanford University - Dept of CS',
    tenantType: 'College',
    roleInTenant: 'Faculty / Department Instructor',
    permissionsScope: 'Full Course, Module & Problem Editing',
    assignedAt: 'Jan 15, 2025',
    status: 'Active',
  },
  {
    id: 'mem-02',
    tenantName: 'ACM-ICPC Collegiate Regional League',
    tenantType: 'Independent',
    roleInTenant: 'Contest Jury & Coordinator',
    permissionsScope: 'Contest Problem Sets, Timers & Scoring',
    assignedAt: 'Feb 01, 2025',
    status: 'Active',
  },
  {
    id: 'mem-03',
    tenantName: 'Global CodePlatform Admin Cluster',
    tenantType: 'Independent',
    roleInTenant: 'Curriculum Reviewer',
    permissionsScope: 'System Problem Approval & Tagging',
    assignedAt: 'Mar 10, 2025',
    status: 'Active',
  },
];

// Seed Active Sessions
const MOCK_SESSIONS: UserActiveSessionItem[] = [
  {
    id: 'sess-01',
    deviceInfo: 'Chrome 122 on macOS Sonoma (Apple Silicon)',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    issuedAt: 'Mar 01, 2026',
    lastActive: 'Active Now',
    isCurrent: true,
  },
  {
    id: 'sess-02',
    deviceInfo: 'Safari Mobile on iPhone 15 Pro (iOS 17.4)',
    ipAddress: '172.56.21.9',
    location: 'Boston, MA (US)',
    issuedAt: 'Feb 28, 2026',
    lastActive: '3 hours ago',
    isCurrent: false,
  },
  {
    id: 'sess-03',
    deviceInfo: 'VS Code Extension / Antigravity IDE CLI',
    ipAddress: '192.168.1.10',
    location: 'Boston, MA (US)',
    issuedAt: 'Feb 20, 2026',
    lastActive: 'Yesterday',
    isCurrent: false,
  },
];

// Seed Account Preferences
const MOCK_PREFERENCES: UserPreferenceItem[] = [
  {
    id: 'pref-01',
    settingName: 'Two-Factor Authentication Requirement',
    category: 'Security',
    currentValue: 'Enforced (TOTP App)',
    description: 'Require 6-digit authenticator code on every new device login.',
  },
  {
    id: 'pref-02',
    settingName: 'Email Notification on Submission Verdicts',
    category: 'Notifications',
    currentValue: 'Daily Digest',
    description: 'Consolidated report of student submissions and evaluation errors.',
  },
  {
    id: 'pref-03',
    settingName: 'Code Editor Theme & Typography',
    category: 'Display',
    currentValue: 'Monokai Pro / Fira Code (Ligatures Enabled)',
    description: 'Default styling for coding workspaces and problem playgrounds.',
  },
  {
    id: 'pref-04',
    settingName: 'Single Sign-On (SAML / Google Workspace)',
    category: 'SSO',
    currentValue: 'Linked (stanford.edu Google SSO)',
    description: 'Primary institutional single sign-on provider.',
  },
];

import { apiService } from '@/lib/api-service';

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  let userName = 'User Profile';
  let userHandle = 'user';
  try {
    const liveData = await apiService.getUsers({ limit: 50 });
    const match = liveData?.items?.find((u: any) => u.id === id);
    if (match) {
      userName = match.name || match.email;
      userHandle = match.email ? match.email.split('@')[0] : 'user';
    }
  } catch (e) {
    // fallback
  }

  return {
    title: `${userName} (@${userHandle}) | User & Security Settings`,
    description: `Account details, RBAC permissions, and active sessions for ${userName}.`,
  };
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;

  let user: UserDirectoryEntity | undefined;

  try {
    const liveUser = await apiService.getUserById(id);
    if (liveUser?.id) {
      user = {
        id: liveUser.id,
        name: liveUser.name || 'Platform User',
        handle: liveUser.email ? liveUser.email.split('@')[0] : 'user',
        email: liveUser.email,
        role: liveUser.globalRole || 'STUDENT',
        institutionType: 'College',
        institutionName: liveUser.memberships?.[0]?.college?.name || 'Global Platform',
        twoFactorEnabled: liveUser.twoFactorEnabled || false,
        lastLoginAt: 'Recently',
        lastLoginIp: '127.0.0.1',
        createdAt: liveUser.createdAt ? new Date(liveUser.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Recently',
        status: liveUser.status === 'ACTIVE' ? 'Active' : 'Suspended',
        avatarColor: '#7C3AED',
      };
    }
  } catch (err) {
    console.warn('Live user profile fetch fallback:', err);
  }

  if (!user) {
    user = MASTER_USERS.find((u) => u.id === id);
  }

  if (!user) {
    user = {
      id,
      name: `User ${id.toUpperCase()}`,
      handle: `user_${id.toLowerCase()}`,
      email: `${id.toLowerCase()}@platform.io`,
      role: 'STUDENT',
      institutionType: 'College',
      institutionName: 'Collegiate Computer Science Faculty',
      twoFactorEnabled: true,
      lastLoginAt: 'Recently',
      lastLoginIp: '192.168.1.1',
      createdAt: 'Jan 2025',
      status: 'Active',
      avatarColor: '#2563EB',
    };
  }

  return (
    <UserDetailClient
      user={user}
      initialSecurityLogs={MOCK_SECURITY_LOGS}
      initialMemberships={MOCK_MEMBERSHIPS}
      initialSessions={MOCK_SESSIONS}
      initialPreferences={MOCK_PREFERENCES}
    />
  );
}
