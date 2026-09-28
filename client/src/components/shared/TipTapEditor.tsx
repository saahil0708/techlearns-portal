'use client';

import React, { useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table as TiptapTable } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';

import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  Button,
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
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkOffRoundedIcon from '@mui/icons-material/LinkOffRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';

export interface TipTapEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing your technical article... Use the toolbar for headings, code blocks, tables, and formatting.',
  minHeight = 280,
  maxHeight = 520,
}: TipTapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'tiptap-link',
        },
      }),
      ImageExtension.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'tiptap-image',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TiptapTable.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.isEmpty ? '' : ed.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-canvas',
      },
    },
  });

  // Sync external content changes if editor content is empty or reset
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (!content) {
        editor.commands.setContent('');
      } else if (editor.isEmpty) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter target URL (e.g. https://...):', previousUrl || 'https://');

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Enter Image URL (e.g. https://images.unsplash.com/...):');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const insertTable = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  // Heading dropdown value helper
  const getHeadingLevel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'p';
  };

  const handleHeadingChange = (val: string) => {
    if (val === 'p') {
      editor.chain().focus().setParagraph().run();
    } else if (val === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  return (
    <Box
      sx={{
        border: '1px solid #CBD5E1',
        borderRadius: '12px',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        '&:focus-within': {
          borderColor: '#2563EB',
          boxShadow: '0 0 0 3px rgba(37,99,235,0.12)',
        },
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP FORMATTING TOOLBAR                                                 */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          flexWrap: 'wrap',
          p: 1,
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        {/* Paragraph / Headings Select */}
        <Select
          size="small"
          value={getHeadingLevel()}
          onChange={(e) => handleHeadingChange(e.target.value)}
          sx={{
            height: 32,
            fontSize: '0.82rem',
            fontWeight: 700,
            bgcolor: '#FFFFFF',
            minWidth: 105,
            borderRadius: '8px',
            '& .MuiSelect-select': { py: 0.5, px: 1.2 },
          }}
        >
          <MenuItem value="p" sx={{ fontSize: '0.85rem' }}>Paragraph</MenuItem>
          <MenuItem value="h1" sx={{ fontSize: '0.85rem', fontWeight: 800 }}>Heading 1</MenuItem>
          <MenuItem value="h2" sx={{ fontSize: '0.85rem', fontWeight: 800 }}>Heading 2</MenuItem>
          <MenuItem value="h3" sx={{ fontSize: '0.85rem', fontWeight: 700 }}>Heading 3</MenuItem>
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Text Formats: Bold, Italic, Underline, Strike, Inline Code */}
        <Tooltip title="Bold (Ctrl+B)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('bold') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('bold') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <FormatBoldRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic (Ctrl+I)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('italic') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('italic') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <FormatItalicRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline (Ctrl+U)">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('underline') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('underline') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
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
              bgcolor: editor.isActive('strike') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('strike') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <StrikethroughSRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Inline Code">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCode().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('code') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('code') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <CodeRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Lists & Quotes */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('bulletList') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('bulletList') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <FormatListBulletedRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Numbered Step List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('orderedList') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('orderedList') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <FormatListNumberedRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Quote / Callout">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('blockquote') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('blockquote') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <FormatQuoteRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Code Block Snippet">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('codeBlock') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('codeBlock') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <IntegrationInstructionsRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Links, Images, Table, Divider */}
        <Tooltip title="Insert / Edit Link">
          <IconButton
            size="small"
            onClick={setLink}
            sx={{
              p: 0.6,
              borderRadius: '6px',
              bgcolor: editor.isActive('link') ? '#E0E7FF' : 'transparent',
              color: editor.isActive('link') ? '#2563EB' : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <LinkRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {editor.isActive('link') && (
          <Tooltip title="Remove Link">
            <IconButton
              size="small"
              onClick={() => editor.chain().focus().unsetLink().run()}
              sx={{ p: 0.6, borderRadius: '6px', color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
            >
              <LinkOffRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Insert Image from URL">
          <IconButton
            size="small"
            onClick={addImage}
            sx={{ p: 0.6, borderRadius: '6px', color: '#475569', '&:hover': { bgcolor: '#F1F5F9' } }}
          >
            <ImageRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Table">
          <IconButton
            size="small"
            onClick={insertTable}
            sx={{ p: 0.6, borderRadius: '6px', color: '#475569', '&:hover': { bgcolor: '#F1F5F9' } }}
          >
            <TableChartRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Horizontal Divider Line">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            sx={{ p: 0.6, borderRadius: '6px', color: '#475569', '&:hover': { bgcolor: '#F1F5F9' } }}
          >
            <HorizontalRuleRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                sx={{ p: 0.6, borderRadius: '6px', color: '#64748B' }}
              >
                <UndoRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Y)">
            <span>
              <IconButton
                size="small"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                sx={{ p: 0.6, borderRadius: '6px', color: '#64748B' }}
              >
                <RedoRoundedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. TIPTAP EDITABLE CANVAS                                                 */}
      {/* ========================================================================= */}
      <Box
        sx={{
          p: 2.5,
          minHeight,
          maxHeight,
          overflowY: 'auto',
          cursor: 'text',
          fontSize: '0.98rem',
          lineHeight: 1.8,
          color: '#0F172A',
          '& .tiptap-editor-canvas': {
            outline: 'none',
            minHeight,
          },
          '& p': {
            my: 1.2,
          },
          '& h1': {
            fontSize: '1.75rem',
            fontWeight: 900,
            color: '#0F172A',
            mt: 3,
            mb: 1.5,
            letterSpacing: '-0.025em',
          },
          '& h2': {
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0F172A',
            mt: 2.5,
            mb: 1.2,
            borderLeft: '4px solid #2563EB',
            pl: 1.5,
          },
          '& h3': {
            fontSize: '1.2rem',
            fontWeight: 800,
            color: '#1E293B',
            mt: 2,
            mb: 1,
          },
          '& ul': {
            pl: 3.5,
            my: 1.5,
            listStyleType: 'disc',
            listStyle: 'disc',
          },
          '& ol': {
            pl: 3.5,
            my: 1.5,
            listStyleType: 'decimal',
            listStyle: 'decimal',
          },
          '& li': {
            my: 0.5,
            display: 'list-item',
          },
          '& blockquote': {
            borderLeft: '4px solid #2563EB',
            bgcolor: 'rgba(37, 99, 235, 0.05)',
            p: 2,
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
            my: 2.5,
            fontFamily: 'Consolas, Monaco, monospace',
            fontSize: '0.9rem',
            overflowX: 'auto',
            lineHeight: 1.6,
            border: '1px solid #1E293B',
            boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            my: 2.5,
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            overflow: 'hidden',
          },
          '& th': {
            bgcolor: '#F8FAFC',
            p: 1.5,
            fontWeight: 800,
            textAlign: 'left',
            borderBottom: '2px solid #E2E8F0',
            borderRight: '1px solid #E2E8F0',
          },
          '& td': {
            p: 1.5,
            borderBottom: '1px solid #F1F5F9',
            borderRight: '1px solid #E2E8F0',
          },
          '& img': {
            maxWidth: '100%',
            maxHeight: 480,
            borderRadius: '12px',
            my: 2.5,
            border: '1px solid #E2E8F0',
            objectFit: 'cover',
          },
          '& hr': {
            border: 'none',
            borderTop: '1px solid #E2E8F0',
            my: 3,
          },
          '& a': {
            color: '#2563EB',
            textDecoration: 'underline',
            fontWeight: 700,
          },
          '& p.is-editor-empty:first-child::before': {
            color: '#94A3B8',
            content: 'attr(data-placeholder)',
            float: 'left',
            height: 0,
            pointerEvents: 'none',
          },
        }}
        onClick={() => editor.chain().focus().run()}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
}
