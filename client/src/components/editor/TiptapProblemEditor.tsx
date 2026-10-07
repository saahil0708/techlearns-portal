'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Typography,
} from '@mui/material';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FormatUnderlinedRoundedIcon from '@mui/icons-material/FormatUnderlinedRounded';
import StrikethroughSRoundedIcon from '@mui/icons-material/StrikethroughSRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import IntegrationInstructionsRoundedIcon from '@mui/icons-material/IntegrationInstructionsRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';

interface TiptapProblemEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  minHeight?: number | string;
}

export default function TiptapProblemEditor({
  content,
  onChange,
  placeholder = 'Write problem statement, narrative, background, and input/output descriptions...',
  minHeight = 260,
}: TiptapProblemEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  // Sync external content changes if editor is ready and content differs
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      // Avoid resetting cursor if editor is focused
      if (!editor.isFocused) {
        editor.commands.setContent(content || '', { emitUpdate: false });
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <Box
        sx={{
          minHeight,
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          bgcolor: '#FFFFFF',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography sx={{ color: '#94A3B8', fontSize: '0.85rem' }}>Loading Rich Text Editor...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid #E2E8F0',
        borderRadius: '10px',
        bgcolor: '#FFFFFF',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease',
        '&:focus-within': {
          borderColor: '#2563EB',
          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.12)',
        },
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 0.5,
          p: 1,
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        {/* Headings */}
        <Tooltip title="Heading 2">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('heading', { level: 2 }) ? '#E2E8F0' : 'transparent',
              color: editor.isActive('heading', { level: 2 }) ? '#0F172A' : '#475569',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          >
            H2
          </IconButton>
        </Tooltip>

        <Tooltip title="Heading 3">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('heading', { level: 3 }) ? '#E2E8F0' : 'transparent',
              color: editor.isActive('heading', { level: 3 }) ? '#0F172A' : '#475569',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          >
            H3
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Text Formats */}
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('bold') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('bold') ? '#0F172A' : '#475569',
            }}
          >
            <FormatBoldRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('italic') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('italic') ? '#0F172A' : '#475569',
            }}
          >
            <FormatItalicRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('underline') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('underline') ? '#0F172A' : '#475569',
            }}
          >
            <FormatUnderlinedRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Strikethrough">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('strike') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('strike') ? '#0F172A' : '#475569',
            }}
          >
            <StrikethroughSRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Inline Code & Code Block */}
        <Tooltip title="Inline Code">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCode().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('code') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('code') ? '#0F172A' : '#475569',
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Code Block">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('codeBlock') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('codeBlock') ? '#0F172A' : '#475569',
            }}
          >
            <IntegrationInstructionsRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Lists */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('bulletList') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('bulletList') ? '#0F172A' : '#475569',
            }}
          >
            <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('orderedList') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('orderedList') ? '#0F172A' : '#475569',
            }}
          >
            <FormatListNumberedRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Blockquote">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('blockquote') ? '#E2E8F0' : 'transparent',
              color: editor.isActive('blockquote') ? '#0F172A' : '#475569',
            }}
          >
            <FormatQuoteRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Horizontal Line">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            sx={{ p: 0.6, borderRadius: '6px', color: '#475569' }}
          >
            <HorizontalRuleRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Table (3x3)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            sx={{ p: 0.6, borderRadius: '6px', color: '#475569' }}
          >
            <TableChartRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ flex: 1 }} />

        {/* History */}
        <Tooltip title="Undo">
          <span>
            <IconButton
              size="small"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
              sx={{ p: 0.6, borderRadius: '6px', color: '#475569' }}
            >
              <UndoRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Redo">
          <span>
            <IconButton
              size="small"
              disabled={!editor.can().redo()}
              onClick={() => editor.chain().focus().redo().run()}
              sx={{ p: 0.6, borderRadius: '6px', color: '#475569' }}
            >
              <RedoRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Editor Content Area */}
      <Box
        sx={{
          p: 2,
          minHeight,
          cursor: 'text',
          '& .tiptap': {
            outline: 'none',
            minHeight,
            fontSize: '0.92rem',
            lineHeight: 1.65,
            color: '#0F172A',
            '& p': {
              mb: 1.5,
            },
            '& h2': {
              fontSize: '1.25rem',
              fontWeight: 800,
              color: '#0F172A',
              mt: 2,
              mb: 1,
            },
            '& h3': {
              fontSize: '1.05rem',
              fontWeight: 700,
              color: '#1E293B',
              mt: 1.5,
              mb: 0.75,
            },
            '& ul, & ol': {
              pl: 3,
              mb: 1.5,
            },
            '& li': {
              mb: 0.5,
            },
            '& code': {
              fontFamily: 'monospace',
              bgcolor: '#F1F5F9',
              color: '#0F172A',
              px: 0.75,
              py: 0.25,
              borderRadius: '4px',
              fontSize: '0.85em',
            },
            '& pre': {
              bgcolor: '#0F172A',
              color: '#E2E8F0',
              fontFamily: 'monospace',
              p: 1.75,
              borderRadius: '8px',
              overflowX: 'auto',
              mb: 1.5,
              '& code': {
                bgcolor: 'transparent',
                color: 'inherit',
                p: 0,
              },
            },
            '& blockquote': {
              borderLeft: '4px solid #3B82F6',
              pl: 2,
              my: 1.5,
              color: '#475569',
              fontStyle: 'italic',
            },
            '& table': {
              width: '100%',
              borderCollapse: 'collapse',
              my: 1.5,
              '& th, & td': {
                border: '1px solid #CBD5E1',
                p: 1,
                textAlign: 'left',
              },
              '& th': {
                bgcolor: '#F8FAFC',
                fontWeight: 700,
              },
            },
            '&.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              float: 'left',
              color: '#94A3B8',
              pointerEvents: 'none',
              height: 0,
            },
          },
        }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
