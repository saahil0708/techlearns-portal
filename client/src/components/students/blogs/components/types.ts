export const CATEGORIES = [
  'All Stories',
  'System Architecture',
  'DSA & Algorithms',
  'AI & Machine Learning',
  'Frontend & React',
  'Backend & DevOps',
  'Interview Experiences',
  'Cloud & Distributed',
];

export const DEFAULT_COVER_OPTIONS = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1516116211227-bbc03a089025?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
];

export function parseBlogDateToTime(dateStr?: string): number {
  if (!dateStr) return 0;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;

  const lower = dateStr.toLowerCase();
  const now = Date.now();
  if (lower.includes('just now')) return now;
  if (/(?:min|mins|minute|minutes)\s+ago/.test(lower)) {
    const mins = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - mins * 60 * 1000;
  }
  if (lower.includes('hour ago') || lower.includes('hours ago')) {
    const hours = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - hours * 3600 * 1000;
  }
  if (lower.includes('yesterday')) return now - 24 * 3600 * 1000;
  if (lower.includes('day ago') || lower.includes('days ago')) {
    const days = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - days * 24 * 3600 * 1000;
  }
  if (lower.includes('week ago') || lower.includes('weeks ago')) {
    const weeks = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - weeks * 7 * 24 * 3600 * 1000;
  }
  if (lower.includes('month ago') || lower.includes('months ago')) {
    const months = parseInt(lower.match(/\d+/)?.[0] || '1', 10);
    return now - months * 30 * 24 * 3600 * 1000;
  }
  return 0;
}

export function getBlogThemeConfig(category: string = '') {
  const c = category.toLowerCase();

  // AI / ML
  if (/\b(ai|llm|ml|machine learning|deep learning)\b/i.test(c)) {
    return {
      accentColor: '#D97706',
      tagBg: 'rgba(217, 119, 6, 0.08)',
      tagText: '#D97706',
      btnBg: '#D97706',
      btnHover: '#B45309',
      badgeBg: 'linear-gradient(135deg, rgba(120, 53, 15, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(251, 191, 36, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(245, 158, 11, 0.25)',
      badgeText: '#FFFBEB',
      badgeIconColor: '#FBBF24',
      badgeLabel: 'AI & ML STORY',
    };
  }

  // System Architecture / Backend / Cloud
  if (/\b(system|architecture|backend|distributed|cloud|devops)\b/i.test(c)) {
    return {
      accentColor: '#0284C7',
      tagBg: 'rgba(2, 132, 199, 0.08)',
      tagText: '#0284C7',
      btnBg: '#0284C7',
      btnHover: '#0369A1',
      badgeBg: 'linear-gradient(135deg, rgba(12, 74, 110, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(56, 189, 248, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(56, 189, 248, 0.25)',
      badgeText: '#F0F9FF',
      badgeIconColor: '#38BDF8',
      badgeLabel: 'ARCHITECTURE POST',
    };
  }

  // DSA & Competitive Programming
  if (/\b(dsa|algo|algorithm|competitive)\b/i.test(c)) {
    return {
      accentColor: '#059669',
      tagBg: 'rgba(5, 150, 105, 0.08)',
      tagText: '#059669',
      btnBg: '#059669',
      btnHover: '#047857',
      badgeBg: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(52, 211, 153, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(16, 185, 129, 0.25)',
      badgeText: '#ECFDF5',
      badgeIconColor: '#34D399',
      badgeLabel: 'ALGORITHM DEEP-DIVE',
    };
  }

  // Interview Experiences
  if (/\b(interview|career|faang|google)\b/i.test(c)) {
    return {
      accentColor: '#7C3AED',
      tagBg: 'rgba(124, 58, 237, 0.08)',
      tagText: '#7C3AED',
      btnBg: '#7C3AED',
      btnHover: '#6D28D9',
      badgeBg: 'linear-gradient(135deg, rgba(76, 29, 149, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
      badgeBorder: '1px solid rgba(192, 132, 252, 0.45)',
      badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(124, 58, 237, 0.25)',
      badgeText: '#FAF5FF',
      badgeIconColor: '#C084FC',
      badgeLabel: 'INTERVIEW DEBRIEF',
    };
  }

  // Default / Web / Frontend
  return {
    accentColor: '#2563EB',
    tagBg: 'rgba(37, 99, 235, 0.08)',
    tagText: '#2563EB',
    btnBg: '#2563EB',
    btnHover: '#1D4ED8',
    badgeBg: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
    badgeBorder: '1px solid rgba(96, 165, 250, 0.45)',
    badgeShadow: '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(37, 99, 235, 0.25)',
    badgeText: '#EFF6FF',
    badgeIconColor: '#60A5FA',
    badgeLabel: 'ENGINEERING POST',
  };
}
