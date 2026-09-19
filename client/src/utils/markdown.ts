export function sanitizeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatArticleMarkdown(raw: string): string {
  if (!raw) return '';
  const clean = sanitizeHtml(raw);

  const codeBlocks: string[] = [];
  const placeholderPrefix = `__CODE_BLOCK_${Date.now()}_`;

  // 1. Extract fenced code blocks into unique placeholders
  const textWithoutCode = clean.replace(/```([\s\S]*?)```/gim, (_, codeContent) => {
    const index = codeBlocks.length;
    codeBlocks.push(codeContent);
    return `${placeholderPrefix}${index}__`;
  });

  // 2. Apply typography & inline markdown rules to the rest of the text
  let formatted = textWithoutCode
    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.15rem; font-weight: 700; margin: 16px 0 8px; color: #0F172A;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.3rem; font-weight: 800; margin: 20px 0 10px; color: #0F172A;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.5rem; font-weight: 800; margin: 24px 0 12px; color: #0F172A;">$1</h1>')
    .replace(/^(&gt;|>)\s?(.*$)/gim, '<blockquote style="border-left: 3px solid #2563EB; padding-left: 12px; margin: 12px 0; color: #475569; font-style: italic;">$2</blockquote>')
    .replace(/`([^`]+)`/gim, '<code style="background-color: #F1F5F9; color: #2563EB; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.85em;">$1</code>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n$/gim, '<br />')
    .replace(/\n/g, '<br />');

  // 3. Restore literal escaped code blocks
  codeBlocks.forEach((codeContent, index) => {
    const placeholder = `${placeholderPrefix}${index}__`;
    const formattedCode = `<pre style="background-color: #0F172A; color: #F8FAFC; padding: 14px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 0.85rem; margin: 14px 0; line-height: 1.5;"><code>${codeContent}</code></pre>`;
    formatted = formatted.replace(placeholder, formattedCode);
  });

  return formatted;
}
