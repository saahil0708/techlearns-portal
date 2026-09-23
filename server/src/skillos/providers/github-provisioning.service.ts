import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GitHubProvisionResult {
  success: boolean;
  teamName: string;
  assignedRepo: string;
  inviteStatus: 'invited' | 'accepted' | 'simulated';
  error?: string;
}

@Injectable()
export class GitHubProvisioningService {
  private readonly logger = new Logger(GitHubProvisioningService.name);
  private readonly orgToken: string | null;
  private readonly orgName: string;

  constructor(private configService: ConfigService) {
    this.orgToken = this.configService.get<string>('GITHUB_ORG_TOKEN') || null;
    this.orgName = this.configService.get<string>('GITHUB_ORG_NAME') || 'techlearns-cel';
  }

  /**
   * Provision GitHub organization team membership and starter repository
   */
  async provisionUser(githubUsername?: string, trackCode = 'DEV'): Promise<GitHubProvisionResult> {
    const teamSlug = `sprint-alpha-${trackCode.toLowerCase()}`;
    const defaultTeam = `@${this.orgName}/${teamSlug}`;
    const defaultRepo = `https://github.com/${this.orgName}/genai-live-sprint`;

    if (!githubUsername) {
      return {
        success: true,
        teamName: defaultTeam,
        assignedRepo: defaultRepo,
        inviteStatus: 'invited',
      };
    }

    const cleanUsername = githubUsername.trim().replace(/^@/, '');

    if (!this.orgToken) {
      this.logger.log(
        `[Dev/Simulated] GitHub Org token not set. Mock provisioning for user "${cleanUsername}" into ${defaultTeam}`,
      );
      return {
        success: true,
        teamName: defaultTeam,
        assignedRepo: defaultRepo,
        inviteStatus: 'simulated',
      };
    }

    try {
      // Real GitHub Org Team Membership PUT Request
      const response = await fetch(
        `https://api.github.com/orgs/${this.orgName}/teams/${teamSlug}/memberships/${encodeURIComponent(cleanUsername)}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.orgToken}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ role: 'member' }),
          signal: AbortSignal.timeout(5000),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        this.logger.warn(`GitHub API invitation failed (${response.status}): ${errText}`);
        return {
          success: false,
          teamName: defaultTeam,
          assignedRepo: defaultRepo,
          inviteStatus: 'invited',
          error: `GitHub API error (${response.status}): ${errText}`,
        };
      }

      const data = await response.json().catch(() => ({}));
      const state = data?.state === 'active' ? 'accepted' : 'invited';

      return {
        success: true,
        teamName: defaultTeam,
        assignedRepo: defaultRepo,
        inviteStatus: state,
      };
    } catch (err: any) {
      this.logger.warn(`GitHub provisioning network error: ${err.message}`);
      return {
        success: false,
        teamName: defaultTeam,
        assignedRepo: defaultRepo,
        inviteStatus: 'invited',
        error: err.message || 'GitHub network timeout or error',
      };
    }
  }
}
