'use client';

import React, { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import {
  Box,
  Typography,
  Divider,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Tooltip,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';

export interface MarkdownViewerProps {
  content: string;
  accentColor?: string;
  className?: string;
  sx?: any;
}

/**
 * Validates URLs allowing http, https, mailto, root/relative paths, queries, and anchors,
 * while strictly rejecting unsafe schemes like javascript:, vbscript:, and data:.
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (/^(?:javascript|vbscript|data):/i.test(trimmed)) return false;
  if (/^(https?|mailto):/i.test(trimmed)) return true;
  if (/^(\/|\.\/|\.\.\/|[#?])/.test(trimmed)) return true;
  if (!/^[^/?#]+:/.test(trimmed)) return true;
  return false;
}

/**
 * Sanitizes rich HTML via DOMPurify, permitting only approved TipTap rich-text tags
 * and attributes with strict safe URI scheme restrictions.
 */
export function sanitizeRichHtml(html: string): string {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'h1',
      'h2',
      'h3',
      'h4',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'del',
      'code',
      'pre',
      'blockquote',
      'ul',
      'ol',
      'li',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'a',
      'img',
      'hr',
      'span',
      'div',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'target',
      'rel',
      'class',
      'colspan',
      'rowspan',
      'colwidth',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|(?:\/|\.\/|\.\.\/|[#?])|[^:]+$)/i,
    ADD_ATTR: ['target'],
  });
}

/**
 * Parses and renders inline markdown elements:
 * - Links: [Text](https://...)
 * - Bold: **Text** or __Text__
 * - Italic: *Text* or _Text_
 * - Inline Code: `code`
 * - Underline: <u>Text</u> or ++Text++
 * - Strikethrough: ~~Text~~
 */
export function renderInlineContent(text: string): React.ReactNode {
  if (!text) return null;

  const regex = /(\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|(?<!\*)\*([^*]+)\*(?!\*)|(?<!_)_([^_]+)_(?!_)|`([^`]+)`|<u>(.*?)<\/u>|\+\+(.*?)\+\+|~~([^~]+)~~)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2] && match[3]) {
      // [text](url)
      const rawUrl = match[3].trim();
      const safeUrl = isSafeUrl(rawUrl) ? rawUrl : '#';
      parts.push(
        <a
          key={`link-${match.index}`}
          href={safeUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#2563EB',
            fontWeight: 700,
            textDecoration: 'underline',
            wordBreak: 'break-word',
          }}
        >
          {match[2]}
        </a>,
      );
    } else if (match[4] || match[5]) {
      // **bold** or __bold__
      parts.push(
        <strong key={`bold-${match.index}`} style={{ fontWeight: 800, color: '#0F172A' }}>
          {match[4] || match[5]}
        </strong>,
      );
    } else if (match[6] || match[7]) {
      // *italic* or _italic_
      parts.push(
        <em key={`italic-${match.index}`} style={{ fontStyle: 'italic', color: '#1E293B' }}>
          {match[6] || match[7]}
        </em>,
      );
    } else if (match[8]) {
      // `code`
      parts.push(
        <Box
          key={`code-${match.index}`}
          component="code"
          sx={{
            bgcolor: '#F1F5F9',
            color: '#E11D48',
            px: 0.8,
            py: 0.25,
            mx: 0.2,
            borderRadius: '6px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.88em',
            fontWeight: 600,
            border: '1px solid #E2E8F0',
          }}
        >
          {match[8]}
        </Box>,
      );
    } else if (match[9] || match[10]) {
      // <u>underline</u> or ++underline++
      parts.push(
        <span
          key={`u-${match.index}`}
          style={{
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            textDecorationThickness: '1.5px',
          }}
        >
          {match[9] || match[10]}
        </span>,
      );
    } else if (match[11]) {
      // ~~strikethrough~~
      parts.push(
        <del key={`del-${match.index}`} style={{ color: '#94A3B8' }}>
          {match[11]}
        </del>,
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

/**
 * Copyable Code Block with language tag and Mac-style indicator dots
 */
function CodeBlock({
  language,
  code,
  index,
}: {
  language: string;
  code: string;
  index: number;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box
      key={`code-${index}`}
      sx={{
        my: 3.5,
        p: { xs: 2, sm: 3 },
        bgcolor: '#0B1329',
        borderRadius: '16px',
        border: '1px solid #1E293B',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.8,
          pb: 1.2,
          borderBottom: '1px solid #1E293B',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.7 }}>
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#EF4444' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#F59E0B' }} />
            <Box sx={{ width: 11, height: 11, borderRadius: '50%', bgcolor: '#10B981' }} />
          </Box>
          <Typography
            sx={{
              color: '#94A3B8',
              fontSize: '0.76rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              ml: 1,
            }}
          >
            {language || 'code'}
          </Typography>
        </Box>
        <Tooltip title={copied ? 'Copied!' : 'Copy snippet'}>
          <Button
            size="small"
            startIcon={
              copied ? (
                <CheckRoundedIcon sx={{ fontSize: 14, color: '#10B981' }} />
              ) : (
                <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
              )
            }
            onClick={handleCopy}
            sx={{
              color: copied ? '#10B981' : '#94A3B8',
              textTransform: 'none',
              fontSize: '0.74rem',
              fontWeight: 700,
              px: 1.4,
              py: 0.4,
              borderRadius: '8px',
              bgcolor: 'rgba(255,255,255,0.06)',
              '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.16)' },
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Tooltip>
      </Box>
      <Typography
        component="pre"
        sx={{
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          fontSize: { xs: '0.84rem', sm: '0.9rem' },
          lineHeight: 1.7,
          color: '#E2E8F0',
          overflowX: 'auto',
          margin: 0,
          whiteSpace: 'pre-wrap',
        }}
      >
        {code}
      </Typography>
    </Box>
  );
}

/**
 * Universal Markdown Viewer component supporting rich block & inline features
 * across all profiles (Students, Superadmin, Faculty, Institution Admin).
 */
export default function MarkdownViewer({
  content,
  accentColor = '#2563EB',
  className,
  sx,
}: MarkdownViewerProps) {
  if (!content) return null;

  // If content is HTML from TipTap, render in styled typography container after sanitization
  const isHtml = /<([a-z0-9]+)[\s>]/i.test(content);
  if (isHtml) {
    const safeHtml = sanitizeRichHtml(content);
    return (
      <Box
        className={className}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
        sx={{
          color: '#1E293B',
          fontSize: { xs: '1rem', md: '1.05rem' },
          lineHeight: 1.85,
          '& p': { my: 1.8 },
          '& h1': {
            fontSize: { xs: '1.6rem', sm: '2.1rem' },
            fontWeight: 900,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            mt: 4,
            mb: 2,
          },
          '& h2': {
            fontSize: { xs: '1.4rem', sm: '1.75rem' },
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.02em',
            borderLeft: `4px solid ${accentColor}`,
            pl: 1.5,
            mt: 3.5,
            mb: 1.5,
          },
          '& h3': {
            fontSize: { xs: '1.15rem', sm: '1.35rem' },
            fontWeight: 800,
            color: '#1E293B',
            letterSpacing: '-0.01em',
            mt: 3,
            mb: 1.2,
          },
          '& ul': { pl: 3.5, my: 1.5, listStyleType: 'disc', listStyle: 'disc' },
          '& ol': { pl: 3.5, my: 1.5, listStyleType: 'decimal', listStyle: 'decimal' },
          '& li': { my: 0.6, color: '#334155', display: 'list-item' },
          '& blockquote': {
            borderLeft: `4px solid ${accentColor}`,
            bgcolor: 'rgba(37, 99, 235, 0.05)',
            p: 2.5,
            borderRadius: '0 10px 10px 0',
            my: 2.5,
            fontStyle: 'italic',
            color: '#1E3A8A',
          },
          '& code': {
            bgcolor: '#F1F5F9',
            color: '#E11D48',
            px: 0.8,
            py: 0.25,
            borderRadius: '6px',
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.88em',
            border: '1px solid #E2E8F0',
          },
          '& pre': {
            bgcolor: '#0B1329',
            color: '#F8FAFC',
            p: 2.5,
            borderRadius: '12px',
            my: 3,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
            overflowX: 'auto',
            lineHeight: 1.65,
            border: '1px solid #1E293B',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            my: 3,
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            overflow: 'hidden',
          },
          '& th': {
            bgcolor: '#F8FAFC',
            p: 1.5,
            fontWeight: 800,
            textAlign: 'left',
            color: '#0F172A',
            borderBottom: '2px solid #E2E8F0',
            borderRight: '1px solid #E2E8F0',
          },
          '& td': {
            p: 1.5,
            color: '#334155',
            borderBottom: '1px solid #F1F5F9',
            borderRight: '1px solid #E2E8F0',
          },
          '& img': {
            maxWidth: '100%',
            maxHeight: 520,
            borderRadius: '12px',
            my: 3,
            border: '1px solid #E2E8F0',
            objectFit: 'cover',
          },
          '& hr': {
            border: 'none',
            borderTop: '1px solid #E2E8F0',
            my: 3.5,
          },
          '& a': {
            color: '#2563EB',
            textDecoration: 'underline',
            fontWeight: 700,
          },
          ...sx,
        }}
      />
    );
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLanguage = '';
  let codeLines: string[] = [];

  let tableLines: string[] = [];
  let inTable = false;

  const flushTable = (keyIndex: number) => {
    if (tableLines.length === 0) return;
    const parsedRows = tableLines.map((row) =>
      row
        .trim()
        .replace(/^\|/, '')
        .replace(/\|$/, '')
        .split('|')
        .map((c) => c.trim()),
    );

    const headerRow = parsedRows[0] || [];
    let bodyRows: string[][] = [];
    if (parsedRows.length > 1) {
      const isSeparator = parsedRows[1].every((c) => /^:?-+:?$/.test(c) && c.length > 0);
      bodyRows = isSeparator ? parsedRows.slice(2) : parsedRows.slice(1);
    }

    elements.push(
      <TableContainer
        key={`table-${keyIndex}`}
        component={Paper}
        elevation={0}
        sx={{
          my: 3.5,
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        <Table size="small">
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              {headerRow.map((col, idx) => (
                <TableCell key={`th-${idx}`} sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.88rem', py: 1.5 }}>
                  {renderInlineContent(col)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {bodyRows.map((row, rIdx) => (
              <TableRow
                key={`tr-${rIdx}`}
                sx={{ '&:nth-of-type(even)': { bgcolor: '#FAFAFA' }, '&:hover': { bgcolor: '#F1F5F9' } }}
              >
                {row.map((cell, cIdx) => (
                  <TableCell key={`td-${cIdx}`} sx={{ color: '#334155', fontSize: '0.86rem', py: 1.2 }}>
                    {renderInlineContent(cell)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>,
    );
    tableLines = [];
    inTable = false;
  };

  lines.forEach((line, index) => {
    // 1. Table Detection
    const isTableRow = line.trim().startsWith('|') && line.trim().endsWith('|');
    if (isTableRow) {
      inTable = true;
      tableLines.push(line);
      return;
    } else if (inTable) {
      flushTable(index);
    }

    // 2. Fenced Code Block Detection
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.trim().replace('```', '') || 'code';
        codeLines = [];
      } else {
        inCodeBlock = false;
        const codeString = codeLines.join('\n');
        elements.push(
          <CodeBlock
            key={`code-block-${index}`}
            language={codeLanguage}
            code={codeString}
            index={index}
          />,
        );
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // 3. Horizontal Divider
    if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
      elements.push(<Divider key={`divider-${index}`} sx={{ my: 4, borderColor: '#E2E8F0' }} />);
      return;
    }

    // 4. Image Embed: ![alt](url)
    const imageMatch = line.trim().match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      const altText = imageMatch[1];
      const rawImageUrl = imageMatch[2].trim();
      if (!isSafeUrl(rawImageUrl)) return;
      elements.push(
        <Box key={`img-${index}`} sx={{ my: 4, textAlign: 'center' }}>
          <Box
            component="img"
            src={rawImageUrl}
            alt={altText}
            sx={{
              width: '100%',
              maxHeight: 520,
              objectFit: 'cover',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          />
          {altText && (
            <Typography sx={{ fontSize: '0.82rem', color: '#64748B', fontStyle: 'italic', mt: 1 }}>
              {altText}
            </Typography>
          )}
        </Box>,
      );
      return;
    }

    // 5. Heading 1: # Title
    if (line.startsWith('# ')) {
      const title = line.replace('# ', '').trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      elements.push(
        <Typography
          key={`h1-${index}`}
          id={id}
          variant="h3"
          sx={{
            fontWeight: 900,
            color: '#0F172A',
            fontSize: { xs: '1.6rem', sm: '2.1rem' },
            letterSpacing: '-0.025em',
            mt: 5,
            mb: 2,
          }}
        >
          {renderInlineContent(title)}
        </Typography>,
      );
      return;
    }

    // 6. Heading 2: ## Title
    if (line.startsWith('## ')) {
      const title = line.replace('## ', '').trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      elements.push(
        <Box key={`h2-${index}`} id={id} sx={{ mt: 5.5, mb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 5, height: 26, bgcolor: accentColor, borderRadius: '4px' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: '#0F172A',
              fontSize: { xs: '1.4rem', sm: '1.75rem', md: '1.9rem' },
              letterSpacing: '-0.02em',
            }}
          >
            {renderInlineContent(title)}
          </Typography>
        </Box>,
      );
      return;
    }

    // 7. Heading 3: ### Title
    if (line.startsWith('### ')) {
      const title = line.replace('### ', '').trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      elements.push(
        <Typography
          key={`h3-${index}`}
          id={id}
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#1E293B',
            fontSize: { xs: '1.15rem', sm: '1.35rem' },
            mt: 4,
            mb: 1.5,
            letterSpacing: '-0.01em',
          }}
        >
          {renderInlineContent(title)}
        </Typography>,
      );
      return;
    }

    // 8. Heading 4: #### Title
    if (line.startsWith('#### ')) {
      const title = line.replace('#### ', '').trim();
      elements.push(
        <Typography
          key={`h4-${index}`}
          variant="h6"
          sx={{
            fontWeight: 800,
            color: '#334155',
            fontSize: '1.05rem',
            mt: 3,
            mb: 1.2,
          }}
        >
          {renderInlineContent(title)}
        </Typography>,
      );
      return;
    }

    // 9. Callout Notes & Alerts (> [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > Quote)
    if (line.startsWith('> ')) {
      const rawQuote = line.replace('> ', '').trim();
      let calloutType: 'note' | 'tip' | 'warning' | 'important' | 'quote' = 'quote';
      let calloutText = rawQuote;

      if (/^\[!(NOTE|INFO)\]/i.test(rawQuote) || /^(\*\*|__)?(Note|Info):/i.test(rawQuote)) {
        calloutType = 'note';
        calloutText = rawQuote.replace(/^\[!(NOTE|INFO)\]/i, '').replace(/^(\*\*|__)?(Note|Info):(\*\*|__)?/i, '').trim();
      } else if (/^\[!(TIP|SUCCESS)\]/i.test(rawQuote) || /^(\*\*|__)?(Tip|Best Practice):/i.test(rawQuote)) {
        calloutType = 'tip';
        calloutText = rawQuote.replace(/^\[!(TIP|SUCCESS)\]/i, '').replace(/^(\*\*|__)?(Tip|Best Practice):(\*\*|__)?/i, '').trim();
      } else if (/^\[!(WARNING)\]/i.test(rawQuote) || /^(\*\*|__)?(Warning|Caution):/i.test(rawQuote)) {
        calloutType = 'warning';
        calloutText = rawQuote.replace(/^\[!(WARNING)\]/i, '').replace(/^(\*\*|__)?(Warning|Caution):(\*\*|__)?/i, '').trim();
      } else if (/^\[!(IMPORTANT|CAUTION|ERROR)\]/i.test(rawQuote) || /^(\*\*|__)?(Important|Crucial):/i.test(rawQuote)) {
        calloutType = 'important';
        calloutText = rawQuote.replace(/^\[!(IMPORTANT|CAUTION|ERROR)\]/i, '').replace(/^(\*\*|__)?(Important|Crucial):(\*\*|__)?/i, '').trim();
      }

      const calloutConfig = {
        note: {
          bg: 'rgba(37, 99, 235, 0.05)',
          border: '#2563EB',
          icon: <InfoOutlinedIcon sx={{ color: '#2563EB', fontSize: 22 }} />,
          title: 'Note',
          color: '#1E40AF',
        },
        tip: {
          bg: 'rgba(16, 185, 129, 0.06)',
          border: '#10B981',
          icon: <LightbulbOutlinedIcon sx={{ color: '#10B981', fontSize: 22 }} />,
          title: 'Tip & Best Practice',
          color: '#065F46',
        },
        warning: {
          bg: 'rgba(245, 158, 11, 0.06)',
          border: '#F59E0B',
          icon: <WarningAmberRoundedIcon sx={{ color: '#F59E0B', fontSize: 22 }} />,
          title: 'Warning',
          color: '#92400E',
        },
        important: {
          bg: 'rgba(239, 68, 68, 0.06)',
          border: '#EF4444',
          icon: <ErrorOutlineRoundedIcon sx={{ color: '#EF4444', fontSize: 22 }} />,
          title: 'Important',
          color: '#991B1B',
        },
        quote: {
          bg: 'rgba(37, 99, 235, 0.04)',
          border: accentColor,
          icon: <FormatQuoteRoundedIcon sx={{ color: accentColor, fontSize: 24, opacity: 0.6 }} />,
          title: null,
          color: '#1E3A8A',
        },
      }[calloutType];

      elements.push(
        <Box
          key={`callout-${index}`}
          sx={{
            my: 3,
            p: 2.5,
            pl: 3,
            borderLeft: `5px solid ${calloutConfig.border}`,
            bgcolor: calloutConfig.bg,
            borderRadius: '0 14px 14px 0',
            display: 'flex',
            gap: 1.8,
          }}
        >
          <Box sx={{ flexShrink: 0, mt: '2px' }}>{calloutConfig.icon}</Box>
          <Box sx={{ flex: 1 }}>
            {calloutConfig.title && (
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: calloutConfig.color, mb: 0.5 }}>
                {calloutConfig.title}
              </Typography>
            )}
            <Typography
              sx={{
                color: calloutConfig.color,
                fontSize: '0.98rem',
                fontWeight: calloutType === 'quote' ? 500 : 400,
                fontStyle: calloutType === 'quote' ? 'italic' : 'normal',
                lineHeight: 1.7,
              }}
            >
              {renderInlineContent(calloutText)}
            </Typography>
          </Box>
        </Box>,
      );
      return;
    }

    // 10. Numbered Step List: 1. Item
    const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const itemNumber = numberedMatch[1];
      const itemText = numberedMatch[2];
      elements.push(
        <Box key={`num-list-${index}`} sx={{ display: 'flex', gap: 1.8, my: 1.2, pl: 0.5, alignItems: 'flex-start' }}>
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              bgcolor: accentColor,
              color: '#FFFFFF',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              mt: '3px',
              boxShadow: `0 2px 6px rgba(37,99,235,0.25)`,
            }}
          >
            {itemNumber}
          </Box>
          <Typography sx={{ color: '#334155', fontSize: { xs: '0.98rem', md: '1.04rem' }, lineHeight: 1.8, flex: 1 }}>
            {renderInlineContent(itemText)}
          </Typography>
        </Box>,
      );
      return;
    }

    // 11. Bullet List: - Item or * Item or + Item
    const bulletMatch = line.match(/^\s*[-*+]\s+(.+)$/);
    if (bulletMatch) {
      const itemText = bulletMatch[1];
      elements.push(
        <Box key={`list-${index}`} sx={{ display: 'flex', gap: 1.6, my: 1, pl: 1, alignItems: 'flex-start' }}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: accentColor, mt: '10px', flexShrink: 0 }} />
          <Typography sx={{ color: '#334155', fontSize: { xs: '0.98rem', md: '1.04rem' }, lineHeight: 1.8, flex: 1 }}>
            {renderInlineContent(itemText)}
          </Typography>
        </Box>,
      );
      return;
    }

    // 12. Standard Paragraph
    if (line.trim().length > 0) {
      elements.push(
        <Typography
          key={`p-${index}`}
          sx={{
            color: '#334155',
            fontSize: { xs: '1rem', md: '1.05rem' },
            lineHeight: 1.85,
            mb: 2.2,
            letterSpacing: '0.005em',
          }}
        >
          {renderInlineContent(line)}
        </Typography>,
      );
    }
  });

  // Flush any remaining table at the end
  if (inTable) {
    flushTable(lines.length);
  }

  return (
    <Box className={className} sx={{ color: '#1E293B', ...sx }}>
      {elements}
    </Box>
  );
}
