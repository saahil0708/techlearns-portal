export interface GeneralSettings {
  platformName: string;
  institutionTagline: string;
  primaryDomain: string;
  supportEmail: string;
  academicYear: string;
  defaultTimezone: string;
  allowPublicRegistrations: boolean;
  maintenanceMode: boolean;
}

export interface CompilerConfig {
  id: string;
  language: string;
  version: string;
  compilerCommand: string;
  defaultTimeLimitSec: number;
  defaultMemoryLimitMb: number;
  activeWorkersCount: number;
  status: 'Enabled' | 'Beta' | 'Disabled';
}

export interface SecuritySettings {
  requireTwoFactorForAdmins: boolean;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  allowGoogleSSO: boolean;
  allowGithubSSO: boolean;
  allowSamlSSO: boolean;
  samlEntityId: string;
  enforceInstituteDomainMatch: boolean;
}

export interface ScoringEngineSettings {
  defaultIcpcPenaltyMinutes: number;
  freezeScoreboardMinutesBeforeEnd: number;
  mossPlagiarismSensitivity: number; // percentage threshold e.g. 75%
  allowPartialTestcaseScores: boolean;
  autoRejudgeOnTestcaseUpdate: boolean;
}

export interface ApiWebhookEntity {
  id: string;
  name: string;
  targetUrl: string;
  events: string[];
  status: 'Active' | 'Paused' | 'Failed';
  createdDate: string;
  lastTriggered: string;
  secretMasked: string;
}

export interface AuditLogEntity {
  id: string;
  timestamp: string;
  adminName: string;
  adminEmail: string;
  action: string;
  targetEntity: string;
  ipAddress: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  details: string;
}
