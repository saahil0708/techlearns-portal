export function sanitizeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (/^(?:javascript|vbscript|data):/i.test(trimmed)) return false;
  if (/^(https?|mailto):/i.test(trimmed)) return true;
  if (/^(\/|\.\/|\.\.\/|[#?])/.test(trimmed)) return true;
  if (!/^[^/?#]+:/.test(trimmed)) return true;
  return false;
}

export function formatArticleMarkdown(raw: string): string {
  if (!raw) return '';

  const codeBlocks: string[] = [];
  const placeholderPrefix = `__CODE_BLOCK_${Date.now()}_`;

  // 1. Extract fenced code blocks first to preserve exact indentation & formatting
  const textWithoutCode = raw.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/gim, (_, lang, codeContent) => {
    const index = codeBlocks.length;
    const cleanCode = sanitizeHtml(codeContent.trim());
    const cleanLang = sanitizeHtml(lang || '');
    const languageBadge = cleanLang
      ? `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 16px;background:#1E293B;border-bottom:1px solid #334155;border-top-left-radius:12px;border-top-right-radius:12px;"><span style="color:#94A3B8;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">${cleanLang}</span></div>`
      : '';
    const blockHtml = `<div style="margin:24px 0;background:#0B1329;border-radius:12px;overflow:hidden;border:1px solid #1E293B;box-shadow:0 8px 24px rgba(0,0,0,0.2);">${languageBadge}<pre style="margin:0;padding:16px 20px;color:#F8FAFC;overflow-x:auto;font-family:Consolas,Monaco,'Courier New',monospace;font-size:14px;line-height:1.65;"><code>${cleanCode}</code></pre></div>`;
    codeBlocks.push(blockHtml);
    return `\n\n${placeholderPrefix}${index}__\n\n`;
  });

  // 2. Sanitize remaining text before formatting
  const sanitizedText = sanitizeHtml(textWithoutCode);

  // 3. Parse Markdown Tables
  const lines = sanitizedText.split('\n');
  const processedLines: string[] = [];
  let inTable = false;
  let tableRows: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const parsed = tableRows.map((r) =>
      r
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim()),
    );
    const header = parsed[0] || [];
    let body: string[][] = [];
    if (parsed.length > 1) {
      const isSeparator = parsed[1].every((c) => /^:?-+:?$/.test(c) && c.length > 0);
      body = isSeparator ? parsed.slice(2) : parsed.slice(1);
    }

    let tableHtml = `<div style="margin:24px 0;overflow-x:auto;border-radius:12px;border:1px solid #E2E8F0;"><table style="width:100%;border-collapse:collapse;text-align:left;font-size:14px;background:#FFFFFF;">`;
    tableHtml += `<thead style="background:#F8FAFC;border-bottom:2px solid #E2E8F0;"><tr>`;
    header.forEach((th) => {
      tableHtml += `<th style="padding:12px 16px;font-weight:700;color:#0F172A;">${th}</th>`;
    });
    tableHtml += `</tr></thead><tbody>`;
    body.forEach((row, i) => {
      const bg = i % 2 === 1 ? '#FAFAFA' : '#FFFFFF';
      tableHtml += `<tr style="background:${bg};border-bottom:1px solid #F1F5F9;">`;
      row.forEach((td) => {
        tableHtml += `<td style="padding:12px 16px;color:#334155;">${td}</td>`;
      });
      tableHtml += `</tr>`;
    });
    tableHtml += `</tbody></table></div>`;
    processedLines.push(tableHtml);
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line) => {
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isTableRow) {
      inTable = true;
      tableRows.push(line);
      return;
    } else if (inTable) {
      flushTable();
    }
    processedLines.push(line);
  });
  if (inTable) flushTable();

  let formatted = processedLines.join('\n');

  // 4. Headings
  formatted = formatted
    .replace(/^#### (.*$)/gim, '<h4 style="font-size: 1.0rem; font-weight: 700; margin: 12px 0 4px; color: #334155;">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight: 800; margin: 14px 0 6px; color: #0F172A; letter-spacing: -0.01em;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 8px; color: #0F172A; letter-spacing: -0.02em; border-left: 3.5px solid #2563EB; padding-left: 10px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.65rem; font-weight: 900; margin: 0 0 10px; color: #0F172A; letter-spacing: -0.02em;">$1</h1>');

  // 5. Horizontal Dividers
  formatted = formatted.replace(/^(\*{3,}|-{3,})$/gim, '<hr style="margin: 16px 0; border: none; border-top: 1px solid #E2E8F0;" />');

  // 6. Image Embeds: ![alt](url) with safe URL validation
  formatted = formatted.replace(/!\[(.*?)\]\((.*?)\)/gim, (_, alt, src) => {
    const cleanSrc = src.trim();
    if (!isSafeUrl(cleanSrc)) return '';
    return `<div style="margin: 16px 0; text-align: center;"><img src="${cleanSrc}" alt="${alt}" style="max-width: 100%; max-height: 480px; border-radius: 12px; border: 1px solid #E2E8F0; object-fit: cover;" /><div style="font-size: 12px; color: #64748B; font-style: italic; margin-top: 4px;">${alt}</div></div>`;
  });

  // 7. Callouts & Blockquotes
  formatted = formatted
    .replace(
      /^(&gt;|>)\s?\[!(NOTE|INFO)\]\s?(.*$)/gim,
      '<div style="margin: 12px 0; padding: 12px 16px; background: rgba(37,99,235,0.06); border-left: 3.5px solid #2563EB; border-radius: 0 8px 8px 0; color: #1E40AF; font-size: 14px; line-height: 1.5;"><strong style="display:block; margin-bottom: 2px; font-weight: 800;">Note</strong>$3</div>',
    )
    .replace(
      /^(&gt;|>)\s?\[!(TIP|SUCCESS)\]\s?(.*$)/gim,
      '<div style="margin: 12px 0; padding: 12px 16px; background: rgba(16,185,129,0.06); border-left: 3.5px solid #10B981; border-radius: 0 8px 8px 0; color: #065F46; font-size: 14px; line-height: 1.5;"><strong style="display:block; margin-bottom: 2px; font-weight: 800;">Tip & Best Practice</strong>$3</div>',
    )
    .replace(
      /^(&gt;|>)\s?\[!WARNING\]\s?(.*$)/gim,
      '<div style="margin: 12px 0; padding: 12px 16px; background: rgba(245,158,11,0.06); border-left: 3.5px solid #F59E0B; border-radius: 0 8px 8px 0; color: #92400E; font-size: 14px; line-height: 1.5;"><strong style="display:block; margin-bottom: 2px; font-weight: 800;">Warning</strong>$3</div>',
    )
    .replace(
      /^(&gt;|>)\s?\[!(IMPORTANT|CAUTION|ERROR)\]\s?(.*$)/gim,
      '<div style="margin: 12px 0; padding: 12px 16px; background: rgba(239,68,68,0.06); border-left: 3.5px solid #EF4444; border-radius: 0 8px 8px 0; color: #991B1B; font-size: 14px; line-height: 1.5;"><strong style="display:block; margin-bottom: 2px; font-weight: 800;">Important</strong>$3</div>',
    )
    .replace(
      /^(&gt;|>)\s?(.*$)/gim,
      '<blockquote style="border-left: 3.5px solid #2563EB; padding: 10px 14px; margin: 12px 0; background: rgba(37,99,235,0.03); border-radius: 0 8px 8px 0; color: #334155; font-style: italic; line-height: 1.55;">$2</blockquote>',
    );

  // 8. Lists (Numbered with circle badge & Bullets) - compact and clean
  formatted = formatted
    .replace(
      /^\s*(\d+)\.\s+(.*$)/gim,
      '<div style="display: flex; gap: 8px; margin: 4px 0; align-items: flex-start;"><span style="width: 18px; height: 18px; border-radius: 50%; background: #2563EB; color: #FFFFFF; font-size: 10px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;">$1</span><div style="flex: 1; color: #334155; line-height: 1.55;">$2</div></div>',
    )
    .replace(
      /^\s*[-*+]\s+(.*$)/gim,
      '<div style="display: flex; gap: 8px; margin: 3px 0; align-items: flex-start;"><span style="width: 5px; height: 5px; border-radius: 50%; background: #2563EB; flex-shrink: 0; margin-top: 7px;"></span><div style="flex: 1; color: #334155; line-height: 1.55;">$1</div></div>',
    );

  // 9. Inline Formats (Links with safe URL validation, Code, Bold, Italic, Underline, Strikethrough)
  formatted = formatted
    .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, (_, text, url) => {
      const cleanUrl = url.trim();
      const safeUrl = isSafeUrl(cleanUrl) ? cleanUrl : '#';
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" style="color: #2563EB; font-weight: 700; text-decoration: underline;">${text}</a>`;
    })
    .replace(
      /`([^`]+)`/gim,
      '<code style="background-color: #F1F5F9; color: #E11D48; padding: 2px 5px; border-radius: 5px; font-family: monospace; font-size: 0.88em; border: 1px solid #E2E8F0;">$1</code>',
    )
    .replace(/\*\*(.*?)\*\*/gim, '<strong style="font-weight: 800; color: #0F172A;">$1</strong>')
    .replace(/__([^_]+)__/gim, '<strong style="font-weight: 800; color: #0F172A;">$1</strong>')
    .replace(/(&lt;u&gt;(.*?)&lt;\/u&gt;|<u>(.*?)<\/u>)/gim, (_, __, t1, t2) => `<span style="text-decoration: underline; text-underline-offset: 3px;">${t1 || t2}</span>`)
    .replace(/\+\+(.*?)\+\+/gim, '<span style="text-decoration: underline; text-underline-offset: 3px;">$1</span>')
    .replace(/~~([^~]+)~~/gim, '<del style="color: #94A3B8;">$1</del>')
    .replace(/\*([^*]+)\*/gim, '<em style="font-style: italic; color: #334155;">$1</em>')
    .replace(/_([^_]+)_/gim, '<em style="font-style: italic; color: #334155;">$1</em>')
    .replace(/\n\n+/g, '\n')
    .replace(/\n/g, '<br />')
    .replace(/(<\/div>|<\/h[1-6]>|<\/hr>|<\/blockquote>)\s*<br \/>/gim, '$1')
    .replace(/<br \/>\s*(<div|<h[1-6]|<hr|<blockquote)/gim, '$1');

  // 10. Restore fenced code blocks
  codeBlocks.forEach((blockHtml, index) => {
    const placeholder = `${placeholderPrefix}${index}__`;
    formatted = formatted.replace(placeholder, blockHtml);
  });

  return formatted;
}
