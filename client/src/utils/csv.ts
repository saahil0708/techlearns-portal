/**
 * Shared safe CSV serialization and download utilities
 */

/**
 * Escapes a cell value for CSV output:
 * - Neutralizes formula injection characters (=, +, -, @, \t, \r)
 * - Escapes double quotes with ""
 * - Wraps all values in double quotes
 */
export function safeCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // Neutralize spreadsheet formula prefixes
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape quotes
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Generates a full CSV string with properly sanitized header and row cells
 */
export function generateSafeCsv(
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
): string {
  const headerRow = headers.map(safeCsvCell).join(',');
  const dataRows = rows.map((row) => row.map(safeCsvCell).join(','));
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escapes HTML characters to prevent XSS / markup alteration in HTML exports
 */
export function escapeHtml(val: any): string {
  if (val === null || val === undefined) return '';
  return String(val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parses multi-line CSV text into an array of string tuples, properly
 * handling quoted fields that span multiple lines, embedded quotes, and commas.
 */
export function parseCsvText(text: string): string[][] {
  const records: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let hasRowSyntax = false;
  let isFieldQuoted = false;
  let i = 0;

  const pushCurrentField = () => {
    currentRow.push(isFieldQuoted ? currentField : currentField.trim());
    currentField = '';
    isFieldQuoted = false;
  };

  const pushCurrentRow = () => {
    pushCurrentField();
    const shouldKeep =
      hasRowSyntax ||
      currentRow.length > 1 ||
      currentRow.some((field) => field.length > 0);
    if (shouldKeep) {
      records.push(currentRow);
    }
    currentRow = [];
    hasRowSyntax = false;
  };

  while (i < text.length) {
    const char = text[i];

    if (char === '"') {
      hasRowSyntax = true;
      isFieldQuoted = true;
      if (inQuotes && text[i + 1] === '"') {
        currentField += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      hasRowSyntax = true;
      pushCurrentField();
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && text[i + 1] === '\n') {
        i++;
      }
      pushCurrentRow();
    } else {
      if (char !== ' ' && char !== '\t') {
        hasRowSyntax = true;
      }
      currentField += char;
    }
    i++;
  }

  if (hasRowSyntax || currentField.length > 0 || currentRow.length > 0 || isFieldQuoted) {
    pushCurrentRow();
  }

  return records;
}

/**
 * Parses a single CSV line with support for quoted strings and embedded commas
 */
export function parseCsvLine(line: string): string[] {
  const parsed = parseCsvText(line);
  return parsed.length > 0 ? parsed[0] : [];
}

/**
 * Triggers a client-side CSV download using a text/csv Blob and object URL
 */
export function downloadCsvBlob(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
