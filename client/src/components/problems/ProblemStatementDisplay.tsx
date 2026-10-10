'use client';

import React, { useMemo } from 'react';
import { Box, Typography, Divider } from '@mui/material';

interface ProblemStatementDisplayProps {
  content: string;
  className?: string;
}

function unescapeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * Checks if the content string contains HTML tags
 */
function isHtmlContent(content: string): boolean {
  if (!content) return false;
  const unescaped = unescapeHtmlEntities(content).trim();
  // Check for common HTML opening tags
  return /<(p|div|h[1-6]|ul|ol|li|table|blockquote|pre|code|span|strong|em|b|i|br|hr)[\s>/]/i.test(unescaped);
}

/**
 * Parses inline markdown tokens: `code` and **bold**
 */
function renderInlineMarkdown(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <Box
          component="span"
          key={idx}
          sx={{
            bgcolor: '#F1F5F9',
            color: '#0F172A',
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontSize: '0.85em',
            px: 0.7,
            py: 0.15,
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            fontWeight: 600,
          }}
        >
          {part.slice(1, -1)}
        </Box>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} style={{ color: '#0F172A', fontWeight: 700 }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Clean block markdown renderer for non-HTML fallback
 */
function RenderMarkdownBlocks({ content }: { content: string }) {
  const blocks = useMemo(() => content.split(/\n\s*\n/), [content]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
      {blocks.map((block, bIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed === '---' || trimmed === '***') {
          return <Divider key={bIdx} sx={{ my: 0.5, borderColor: '#F1F5F9' }} />;
        }

        if (trimmed.startsWith('### ')) {
          return (
            <Typography
              key={bIdx}
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: '1rem',
                letterSpacing: '-0.01em',
                mt: bIdx > 0 ? 1 : 0,
                borderLeft: '3px solid #0B1F3A',
                pl: 1.2,
              }}
            >
              {trimmed.replace(/^###\s+/, '')}
            </Typography>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <Typography
              key={bIdx}
              sx={{
                fontWeight: 800,
                color: '#0F172A',
                fontSize: '1.1rem',
                letterSpacing: '-0.01em',
                mt: bIdx > 0 ? 1.5 : 0,
              }}
            >
              {trimmed.replace(/^##\s+/, '')}
            </Typography>
          );
        }

        if (trimmed.includes('\n- ') || trimmed.startsWith('- ') || trimmed.includes('\n* ') || trimmed.startsWith('* ')) {
          const allLines = trimmed.split('\n');
          const nonBulletLines: string[] = [];
          const bulletLines: string[] = [];

          let hasStartedBullets = false;
          for (const line of allLines) {
            const lineTrim = line.trim();
            if (lineTrim.startsWith('- ') || lineTrim.startsWith('* ')) {
              hasStartedBullets = true;
              bulletLines.push(lineTrim);
            } else if (!hasStartedBullets && lineTrim.length > 0) {
              nonBulletLines.push(lineTrim);
            } else if (hasStartedBullets && lineTrim.length > 0) {
              bulletLines.push(lineTrim);
            }
          }

          return (
            <Box key={bIdx} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {nonBulletLines.length > 0 && (
                <Typography sx={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.75 }}>
                  {renderInlineMarkdown(nonBulletLines.join(' '))}
                </Typography>
              )}
              {bulletLines.length > 0 && (
                <Box
                  component="ul"
                  sx={{
                    pl: 2.5,
                    m: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.6,
                    color: '#334155',
                    fontSize: '0.9rem',
                  }}
                >
                  {bulletLines.map((line, lIdx) => (
                    <li key={lIdx}>
                      <Typography component="span" sx={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.65 }}>
                        {renderInlineMarkdown(line.replace(/^[-*]\s+/, ''))}
                      </Typography>
                    </li>
                  ))}
                </Box>
              )}
            </Box>
          );
        }

        return (
          <Typography
            key={bIdx}
            sx={{
              fontSize: '0.92rem',
              color: '#334155',
              lineHeight: 1.75,
            }}
          >
            {renderInlineMarkdown(trimmed)}
          </Typography>
        );
      })}
    </Box>
  );
}

export default function ProblemStatementDisplay({ content, className }: ProblemStatementDisplayProps) {
  if (!content) {
    return (
      <Typography sx={{ color: '#64748B', fontSize: '0.9rem', fontStyle: 'italic' }}>
        No detailed statement authored for this problem.
      </Typography>
    );
  }

  const isHtml = isHtmlContent(content);

  if (isHtml) {
    return (
      <Box
        className={className}
        sx={{
          color: '#334155',
          fontSize: '0.92rem',
          lineHeight: 1.75,
          '& p': {
            m: 0,
            mb: 1.5,
            lineHeight: 1.75,
            '&:last-child': { mb: 0 },
          },
          '& code': {
            fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace',
            bgcolor: '#F1F5F9',
            color: '#0F172A',
            fontSize: '0.85em',
            px: 0.7,
            py: 0.2,
            borderRadius: '4px',
            border: '1px solid #E2E8F0',
            fontWeight: 600,
          },
          '& pre': {
            m: 0,
            my: 1.5,
            p: 2,
            bgcolor: '#0B0F19',
            color: '#C084FC',
            borderRadius: '8px',
            fontSize: '0.82rem',
            fontFamily: 'Menlo, Monaco, Consolas, monospace',
            overflowX: 'auto',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '& code': {
              bgcolor: 'transparent',
              color: 'inherit',
              p: 0,
              border: 'none',
              fontSize: 'inherit',
            },
          },
          '& strong, & b': {
            color: '#0F172A',
            fontWeight: 700,
          },
          '& em, & i': {
            fontStyle: 'italic',
          },
          '& h1': {
            fontSize: '1.4rem',
            fontWeight: 800,
            color: '#0F172A',
            m: '1.2rem 0 0.6rem 0',
            letterSpacing: '-0.02em',
          },
          '& h2': {
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0F172A',
            m: '1.2rem 0 0.5rem 0',
            letterSpacing: '-0.01em',
          },
          '& h3': {
            fontSize: '1.02rem',
            fontWeight: 800,
            color: '#0F172A',
            m: '1rem 0 0.4rem 0',
          },
          '& ul, & ol': {
            pl: 2.5,
            m: '0.5rem 0 1rem 0',
            color: '#334155',
          },
          '& li': {
            mb: 0.5,
            lineHeight: 1.65,
          },
          '& blockquote': {
            borderLeft: '3px solid #0B1F3A',
            bgcolor: '#F8FAFC',
            m: '1rem 0',
            p: '0.6rem 1rem',
            borderRadius: '0 8px 8px 0',
            color: '#475569',
            fontStyle: 'italic',
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            my: 1.5,
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            overflow: 'hidden',
          },
          '& th': {
            bgcolor: '#F8FAFC',
            fontWeight: 700,
            p: 1.2,
            border: '1px solid #E2E8F0',
            textAlign: 'left',
            color: '#0F172A',
            fontSize: '0.84rem',
          },
          '& td': {
            p: 1.2,
            border: '1px solid #E2E8F0',
            color: '#334155',
            fontSize: '0.84rem',
          },
          '& hr': {
            border: 'none',
            borderTop: '1px solid #E2E8F0',
            my: 2,
          },
        }}
        dangerouslySetInnerHTML={{ __html: unescapeHtmlEntities(content) }}
      />
    );
  }

  return <RenderMarkdownBlocks content={content} />;
}
