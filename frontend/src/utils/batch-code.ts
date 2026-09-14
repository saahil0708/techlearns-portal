/**
 * Intelligently generates meaningful, readable cohort codes from batch names
 * Examples:
 * - "S60" -> "S60"
 * - "Uniques 3.0" -> "UNIQ-3.0"
 * - "Batch 2026 CS-Alpha" -> "CS-2026-ALPHA"
 * - "Section A" -> "SEC-A"
 * - "CSE 2027" -> "CSE-2027"
 */
export function generateBatchCode(name?: string, fallbackId?: string): string {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return fallbackId ? `BAT-${fallbackId.slice(-4).toUpperCase()}` : 'BAT-01';
  }

  const cleanName = name.trim();

  // 1. If the name is already short and code-like (e.g. "S60", "CS-1", "B2026", "SEC-A", "CS60")
  if (/^[A-Za-z0-9._-]{2,8}$/.test(cleanName)) {
    return cleanName.toUpperCase();
  }

  // 2. Tokenize by spaces and punctuation
  const rawTokens = cleanName.split(/[\s,_\-—/]+/).filter(Boolean);
  if (rawTokens.length === 0) {
    return fallbackId ? `BAT-${fallbackId.slice(-4).toUpperCase()}` : 'BAT-01';
  }

  // 3. If only 1 token (e.g. "SuperCoders")
  if (rawTokens.length === 1) {
    const single = rawTokens[0];
    if (single.length <= 8) return single.toUpperCase();
    return single.slice(0, 6).toUpperCase();
  }

  // 4. Filter out noisy filler words like "Batch", "Cohort", "Class", "Group", "Students" if there are other tokens
  const filteredTokens = rawTokens.filter(
    (t) => !/^(batch|cohort|class|group|students|roster)$/i.test(t)
  );

  const tokensToUse = filteredTokens.length > 0 ? filteredTokens : rawTokens;

  // 5. Map each token into a clean uppercase code piece
  const codeParts = tokensToUse.map((t) => {
    // If it's a version or number (e.g. "3.0", "2026", "60", "v2", "1")
    if (/^v?\d+(\.\d+)?$/i.test(t)) {
      return t.toUpperCase();
    }
    // If it's single letter or Greek (e.g. "A", "Alpha", "Beta")
    if (/^(alpha|beta|gamma|delta|omega)$/i.test(t)) {
      return t.toUpperCase();
    }
    if (t.length <= 4) {
      return t.toUpperCase();
    }
    // Semantic abbreviations
    if (/^unique/i.test(t)) return 'UNIQ';
    if (/^section/i.test(t)) return 'SEC';
    if (/^computer/i.test(t)) return 'CS';
    if (/^science/i.test(t)) return 'SCI';
    if (/^engineering/i.test(t)) return 'ENG';
    if (/^software/i.test(t)) return 'SW';
    if (/^development/i.test(t)) return 'DEV';
    if (/^advanced/i.test(t)) return 'ADV';
    if (/^foundation/i.test(t)) return 'FND';
    if (/^fundamental/i.test(t)) return 'FND';

    return t.slice(0, 4).toUpperCase();
  });

  const generated = codeParts.slice(0, 3).join('-');
  return generated || (fallbackId ? `BAT-${fallbackId.slice(-4).toUpperCase()}` : 'BAT-01');
}
