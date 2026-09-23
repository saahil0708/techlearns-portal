import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';

export interface JiraProvisionResult {
  success: boolean;
  accountId: string;
  boardUrl: string;
  activeSprint: string;
  error?: string;
}

@Injectable()
export class JiraProvisioningService {
  private readonly logger = new Logger(JiraProvisioningService.name);
  private readonly jiraToken: string | null;
  private readonly jiraDomain: string;

  constructor(private configService: ConfigService) {
    this.jiraToken = this.configService.get<string>('JIRA_API_TOKEN') || null;
    this.jiraDomain = this.configService.get<string>('JIRA_DOMAIN') || 'jira.techlearns.in';
  }

  /**
   * Provision Atlassian Jira Cloud user and agile sprint board allocation
   */
  async provisionUser(corporateEmail: string, studentName?: string): Promise<JiraProvisionResult> {
    const defaultBoard = `https://${this.jiraDomain}/secure/RapidBoard.jspa?rapidView=14`;
    const defaultSprint = 'Active Sprint 04';
    const emailHash = createHash('sha256').update(corporateEmail.toLowerCase().trim()).digest('hex').slice(0, 16);
    const simulatedAccountId = `jira-${emailHash}`;

    if (!this.jiraToken) {
      this.logger.log(
        `[Dev/Simulated] Jira API token not set. Mock provisioning for "${studentName || corporateEmail}" on ${defaultBoard}`,
      );
      return {
        success: true,
        accountId: simulatedAccountId,
        boardUrl: defaultBoard,
        activeSprint: defaultSprint,
      };
    }

    try {
      // Real Atlassian Jira User Creation Request
      const response = await fetch(`https://${this.jiraDomain}/rest/api/3/user`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.jiraToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailAddress: corporateEmail,
          displayName: studentName || 'TechLearns Associate',
          products: ['jira-software'],
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data?.accountId) {
          return {
            success: true,
            accountId: data.accountId,
            boardUrl: defaultBoard,
            activeSprint: defaultSprint,
          };
        }
        return {
          success: false,
          accountId: simulatedAccountId,
          boardUrl: defaultBoard,
          activeSprint: defaultSprint,
          error: 'Jira API did not return an accountId',
        };
      }

      // Handle 409 Conflict: User already exists in Jira, look up by email
      if (response.status === 409) {
        try {
          const searchRes = await fetch(
            `https://${this.jiraDomain}/rest/api/3/user/search?query=${encodeURIComponent(corporateEmail)}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Basic ${this.jiraToken}`,
                Accept: 'application/json',
              },
              signal: AbortSignal.timeout(5000),
            },
          );
          if (searchRes.ok) {
            const users = await searchRes.json().catch(() => []);
            const matchedUser = Array.isArray(users)
              ? users.find((u: any) => u.emailAddress?.toLowerCase() === corporateEmail.toLowerCase())
              : null;
            if (matchedUser?.accountId) {
              return {
                success: true,
                accountId: matchedUser.accountId,
                boardUrl: defaultBoard,
                activeSprint: defaultSprint,
              };
            }
          }
        } catch (lookupErr: any) {
          this.logger.warn(`Failed to lookup existing Jira user: ${lookupErr.message}`);
        }
        return {
          success: false,
          accountId: simulatedAccountId,
          boardUrl: defaultBoard,
          activeSprint: defaultSprint,
          error: 'User already exists in Jira, but accountId lookup failed',
        };
      }

      const errText = await response.text();
      this.logger.warn(`Jira API provisioning failed (${response.status}): ${errText}`);
      return {
        success: false,
        accountId: simulatedAccountId,
        boardUrl: defaultBoard,
        activeSprint: defaultSprint,
        error: `Jira API error (${response.status}): ${errText}`,
      };
    } catch (err: any) {
      this.logger.warn(`Jira provisioning network error: ${err.message}`);
      return {
        success: false,
        accountId: simulatedAccountId,
        boardUrl: defaultBoard,
        activeSprint: defaultSprint,
        error: err.message || 'Jira network timeout or error',
      };
    }
  }
}
