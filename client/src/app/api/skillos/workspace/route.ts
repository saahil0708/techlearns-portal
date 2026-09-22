import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Return structured SkillOS workspace specification data with icon identifiers (no emojis)
  const workspaceData = {
    success: true,
    workspace: {
      corporateId: 'TL-2026-DEV-8492',
      corporateEmail: 'ronit.j@techlearns.corp',
      track: 'Generative AI & Full Stack CEL Sprint',
      status: 'active',
      passportScore: 88,
      prsMerged: 14,
      jiraPointsBurned: 42,
      tools: [
        {
          name: 'GitHub Enterprise Team',
          iconType: 'github',
          url: 'https://github.com/techlearns-cel/genai-live-sprint',
          badge: '@techlearns-cel/sprint-alpha',
          status: 'active',
          description: 'Starter Repo + CI/CD + Mentor PR Reviews',
        },
        {
          name: 'Jira Agile Sprint Board',
          iconType: 'jira',
          url: 'https://jira.techlearns.in/secure/RapidBoard.jspa?rapidView=14',
          badge: 'Active Sprint 04',
          status: 'active',
          description: 'Live Backlog & Standup Epics',
        },
        {
          name: 'Cloud Web IDE Sandbox',
          iconType: 'ide',
          url: 'https://ide.techlearns.in/?workspace=TL-2026-DEV-8492',
          badge: 'VSCode Container Ready',
          status: 'ready',
          description: '1-Click Cloud Runtime with Docker & Node 20',
        },
        {
          name: 'Verified Skill Passport',
          iconType: 'passport',
          url: '/students/skill-passport',
          badge: 'Score: 88/100 · Verified',
          status: 'verified',
          description: 'Cryptographic Skill Verification Transcript',
        },
      ],
    },
  };

  return NextResponse.json(workspaceData, { status: 200 });
}
