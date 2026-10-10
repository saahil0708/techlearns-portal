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
  Typography,
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

import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import { BRAND_COLORS } from '@/theme/colors';

import { formatArticleMarkdown } from '@/utils/markdown';

function normalizeEditorContent(raw?: string): string {
  if (!raw) return '';
  const isHtml = /^\s*<(?:p|h[1-6]|blockquote|pre|ul|ol|table|div|article|section|img|hr)[\s>/]/i.test(raw);
  if (isHtml) return raw;
  return formatArticleMarkdown(raw);
}

export interface TipTapEditorProps {
  content: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  minHeight?: number | string;
  maxHeight?: number | string;
  enableAiAssistant?: boolean;
  aiMode?: 'instructions' | 'problem' | 'article' | 'course' | 'general';
  aiContext?: {
    title?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = 'Start writing your technical article... Use the toolbar for headings, code blocks, tables, and formatting.',
  minHeight = 280,
  maxHeight = 520,
  enableAiAssistant = true,
  aiMode = 'general',
  aiContext,
}: TipTapEditorProps) {
  const [calloutAnchorEl, setCalloutAnchorEl] = React.useState<null | HTMLElement>(null);
  const isCalloutMenuOpen = Boolean(calloutAnchorEl);

  const [aiAnchorEl, setAiAnchorEl] = React.useState<null | HTMLElement>(null);
  const isAiMenuOpen = Boolean(aiAnchorEl);

  const [aiPromptOpen, setAiPromptOpen] = React.useState(false);
  const [customPromptText, setCustomPromptText] = React.useState('');
  const [isAiGenerating, setIsAiGenerating] = React.useState(false);

  const handleCalloutMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCalloutAnchorEl(event.currentTarget);
  };

  const handleCalloutMenuClose = () => {
    setCalloutAnchorEl(null);
  };

  const handleAiMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAiAnchorEl(event.currentTarget);
  };

  const handleAiMenuClose = () => {
    setAiAnchorEl(null);
  };

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
    content: normalizeEditorContent(content),
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
        editor.commands.setContent(normalizeEditorContent(content));
      }
    }
  }, [content, editor]);

  // ═══════════════════════════════════════════════════════════════════
  // SMART AI ASSISTANT CONTENT GENERATORS & INSERTERS
  // ═══════════════════════════════════════════════════════════════════

  const handleAiAction = (actionType: 'instructions' | 'anticheat' | 'polish' | 'expand' | 'honorcode' | 'problem_template') => {
    if (!editor) return;
    handleAiMenuClose();
    setIsAiGenerating(true);

    const title = aiContext?.title?.trim() || 'Technical Assessment';
    const topics = aiContext?.tags?.length ? aiContext.tags.join(', ') : 'Data Structures, Algorithms & System Design';

    setTimeout(() => {
      let generatedHtml = '';

      if (actionType === 'instructions') {
        generatedHtml = `
          <h2>📌 Examination Guidelines & Overview</h2>
          <p>Welcome to the <strong>${title}</strong>. Please carefully review the following examination protocols before commencing your assessment:</p>
          <ul>
            <li><strong>Assessment Scope & Focus:</strong> Covers core competencies in <em>${topics}</em>.</li>
            <li><strong>Duration & Timer:</strong> The examination timer runs continuously once launched. Ensure an uninterrupted high-speed internet connection.</li>
            <li><strong>Permitted Environments:</strong> Use a supported desktop browser (Google Chrome / Brave / Edge). Mobile devices and tablets are strictly prohibited.</li>
          </ul>

          <h2>🛡️ Anti-Cheat & Lockdown Protocols</h2>
          <div style="margin: 14px 0; padding: 14px 18px; background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 8px; color: #991B1B;">
            <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #B91C1C;">🚨 Strict Lockdown Enforcement Active</p>
            <ul style="margin: 0; padding-left: 20px; color: #7F1D1D; font-size: 0.88rem;">
              <li><strong>Native Fullscreen:</strong> Exiting or minimizing fullscreen will trigger integrity violations and may terminate your test session.</li>
              <li><strong>Tab Switching:</strong> External application or tab switches are strictly monitored and bounded by automated submission limits.</li>
              <li><strong>Clipboard Disabled:</strong> External code pasting and browser developer inspect elements are blocked.</li>
            </ul>
          </div>

          <h2>💯 Evaluation & Scoring Policy</h2>
          <p>Submissions are evaluated in real-time against isolated test sandbox clusters. Partial marks are awarded proportional to passed test cases and strict time/memory complexity boundaries.</p>
        `;
      } else if (actionType === 'anticheat') {
        generatedHtml = `
          <div style="margin: 16px 0; padding: 16px 20px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 10px; color: #92400E;">
            <p style="margin: 0 0 8px 0; font-weight: 800; font-size: 0.95rem; color: #B45309;">🛡️ Proctoring & Integrity Regulations</p>
            <ul style="margin: 0; padding-left: 20px; color: #78350F; font-size: 0.88rem; line-height: 1.6;">
              <li><strong>Webcam Presence:</strong> Keep your camera enabled with clear lighting and continuous single-face visibility throughout the test.</li>
              <li><strong>Zero Plagiarism Policy:</strong> All submitted source code undergoes token-based MOSS/Winnowing algorithmic similarity cross-checks.</li>
              <li><strong>Device Isolation:</strong> Secondary screens, earphones, and virtual machines are forbidden.</li>
            </ul>
          </div>
        `;
      } else if (actionType === 'honorcode') {
        generatedHtml = `
          <div style="margin: 16px 0; padding: 14px 18px; background: #FAF5FF; border-left: 4px solid #0B1F3A; border-radius: 8px; color: #0F264F;">
            <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #17366E;">📜 Candidate Honor Code & Declaration</p>
            <p style="margin: 0; color: #0B1F3A; font-size: 0.88rem; line-height: 1.5;">
              "I hereby declare that I will solve all problems independently without external assistance, generative AI bots, peer communication, or unauthorized materials. I agree to abide by all proctoring regulations."
            </p>
          </div>
        `;
      } else if (actionType === 'polish') {
        const currentText = editor.getText();
        if (currentText.trim()) {
          generatedHtml = `
            <h2>📌 Structured Instructions & Instructions</h2>
            <p>${currentText.trim()}</p>
            <ul>
              <li><strong>Technical Environment:</strong> Ensure stable connectivity and desktop fullscreen lockdown.</li>
              <li><strong>Evaluation:</strong> Solutions must pass all hidden constraints within allocated time limits.</li>
            </ul>
          `;
        } else {
          generatedHtml = `
            <h2>📌 Examination Guidelines</h2>
            <p>Candidates must solve all questions independently within the designated duration. Ensure your webcam and microphone pass hardware pre-checks prior to starting.</p>
          `;
        }
      } else if (actionType === 'problem_template') {
        generatedHtml = `
          <h2>Problem Statement</h2>
          <p>Given an input array and constraints, design an optimal algorithm to compute the required output under strict time and memory complexity bounds.</p>
          
          <h3>Input Format</h3>
          <ul>
            <li>The first line contains an integer <code>T</code> representing number of testcases.</li>
            <li>Each testcase contains space-separated integers.</li>
          </ul>

          <h3>Output Format</h3>
          <p>Print the computed optimal result on a new line.</p>

          <h3>Constraints</h3>
          <ul>
            <li><code>1 &le; N &le; 2 &times; 10<sup>5</sup></code></li>
            <li><code>-10<sup>9</sup> &le; A[i] &le; 10<sup>9</sup></code></li>
          </ul>
        `;
      }

      if (actionType === 'polish' || actionType === 'instructions') {
        editor.commands.setContent(generatedHtml);
      } else {
        editor.chain().focus().insertContent(generatedHtml).run();
      }

      setIsAiGenerating(false);
    }, 600);
  };

  const handleCustomAiPromptSubmit = () => {
    if (!editor || !customPromptText.trim()) return;
    setIsAiGenerating(true);
    setAiPromptOpen(false);

    setTimeout(() => {
      const prompt = customPromptText.trim();
      const generatedHtml = `
        <div style="margin: 14px 0; padding: 14px 18px; background: #F8FAFC; border-left: 4px solid #5B2D90; border-radius: 8px;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #4338CA;">✨ AI Assistant Draft: ${prompt}</p>
          <p style="margin: 0; color: #334155; font-size: 0.9rem; line-height: 1.6;">
            Here is the customized content generated for your request:
          </p>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #475569; font-size: 0.88rem;">
            <li>Comprehensive guidelines aligned with standard testing protocols.</li>
            <li>Adherence to platform scoring formats and automated integrity checks.</li>
          </ul>
        </div>
      `;
      editor.chain().focus().insertContent(generatedHtml).run();
      setCustomPromptText('');
      setIsAiGenerating(false);
    }, 700);
  };

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

  // Special Callout Insertion with distinct backgrounds
  const insertSpecialCallout = (type: 'note' | 'tip' | 'warning' | 'important' | 'deepdive' | 'code') => {
    if (!editor) return;
    handleCalloutMenuClose();

    const calloutTemplates = {
      note: `
        <div style="margin: 16px 0; padding: 14px 18px; background: #FAF5FF; border-left: 4px solid #0B1F3A; border-radius: 8px; color: #0F264F;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #17366E;">📘 Note & Key Concept</p>
          <p style="margin: 0; color: #0B1F3A; font-size: 0.9rem;">Add your technical note, explanation, or key theoretical highlight here...</p>
        </div>
      `,
      tip: `
        <div style="margin: 16px 0; padding: 14px 18px; background: #ECFDF5; border-left: 4px solid #10B981; border-radius: 8px; color: #065F46;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #047857;">💡 Pro Tip & Best Practice</p>
          <p style="margin: 0; color: #064E3B; font-size: 0.9rem;">Share a performance optimization, shortcut, or clean coding recommendation...</p>
        </div>
      `,
      warning: `
        <div style="margin: 16px 0; padding: 14px 18px; background: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 8px; color: #92400E;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #B45309;">⚠️ Warning & Common Pitfalls</p>
          <p style="margin: 0; color: #78350F; font-size: 0.9rem;">Detail common bugs, edge-case failures, or memory pitfalls students often encounter...</p>
        </div>
      `,
      important: `
        <div style="margin: 16px 0; padding: 14px 18px; background: #FEF2F2; border-left: 4px solid #EF4444; border-radius: 8px; color: #991B1B;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #B91C1C;">🚨 Important & Critical Rule</p>
          <p style="margin: 0; color: #7F1D1D; font-size: 0.9rem;">Crucial requirement or non-negotiable principle to remember for exams and interviews...</p>
        </div>
      `,
      deepdive: `
        <div style="margin: 16px 0; padding: 14px 18px; background: #FAF5FF; border-left: 4px solid #8B5CF6; border-radius: 8px; color: #5B21B6;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #6D28D9;">🔮 Deep Dive & Architecture</p>
          <p style="margin: 0; color: #4C1D95; font-size: 0.9rem;">Explain low-level runtime internals, virtual machines, or memory layouts...</p>
        </div>
      `,
      code: `
        <div style="margin: 16px 0; padding: 14px 18px; background: #0F172A; border-left: 4px solid #C084FC; border-radius: 8px; color: #F8FAFC;">
          <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 0.92rem; color: #C084FC;">💻 Execution Mechanics & Code Walkthrough</p>
          <p style="margin: 0; color: #E2E8F0; font-size: 0.9rem; font-family: monospace;">Trace step-by-step variable mutation and stack frame allocation...</p>
        </div>
      `,
    };

    editor.chain().focus().insertContent(calloutTemplates[type]).run();
  };

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
          borderColor: '#0B1F3A',
          boxShadow: '0 0 0 3px rgba(91, 45, 144, 0.12)',
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
              bgcolor: editor.isActive('bold') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('bold') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('italic') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('italic') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('underline') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('underline') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('strike') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('strike') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('code') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('code') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('bulletList') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('bulletList') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('orderedList') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('orderedList') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('blockquote') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('blockquote') ? BRAND_COLORS.secondary : '#475569',
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
              bgcolor: editor.isActive('codeBlock') ? BRAND_COLORS.purple[50] : 'transparent',
              color: editor.isActive('codeBlock') ? BRAND_COLORS.secondary : '#475569',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            <IntegrationInstructionsRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* ── AI COPILOT ASSISTANT BUTTON ── */}
        {enableAiAssistant && (
          <>
            <Button
              size="small"
              onClick={handleAiMenuOpen}
              endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
              startIcon={
                isAiGenerating ? (
                  <CircularProgress size={14} sx={{ color: '#FFFFFF' }} />
                ) : (
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#FDE047' }} />
                )
              }
              disabled={isAiGenerating}
              sx={{
                height: 30,
                fontSize: '0.78rem',
                fontWeight: 800,
                textTransform: 'none',
                color: '#FFFFFF',
                background: BRAND_COLORS.gradients.brand,
                boxShadow: `0 2px 8px ${BRAND_COLORS.alpha.purple20}`,
                borderRadius: '8px',
                px: 1.3,
                '&:hover': {
                  background: BRAND_COLORS.gradients.brandReverse,
                  boxShadow: `0 4px 12px ${BRAND_COLORS.alpha.purple20}`,
                },
              }}
            >
              {isAiGenerating ? 'AI Drafting...' : '✨ AI Copilot'}
            </Button>

            {/* AI Assistant Actions Menu */}
            <Menu
              anchorEl={aiAnchorEl}
              open={isAiMenuOpen}
              onClose={handleAiMenuClose}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '14px',
                    minWidth: 290,
                    boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
                    border: '1px solid #E2E8F0',
                    p: 0.75,
                  },
                },
              }}
            >
              <Box sx={{ px: 1.5, py: 1, borderBottom: '1px solid #F1F5F9', mb: 0.5 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: BRAND_COLORS.secondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚡ AI Content Intelligence
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                  Generate and refine structured guidelines instantly
                </Typography>
              </Box>

              <MenuItem
                onClick={() => handleAiAction('instructions')}
                sx={{ borderRadius: '8px', my: 0.25, py: 0.8, '&:hover': { bgcolor: BRAND_COLORS.purple[50] } }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: BRAND_COLORS.secondary }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    🪄 Generate Assessment Instructions
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Standard rules, timing, and scoring protocols
                  </Typography>
                </Box>
              </MenuItem>

              <MenuItem
                onClick={() => handleAiAction('anticheat')}
                sx={{ borderRadius: '8px', my: 0.25, py: 0.8, '&:hover': { bgcolor: '#FEF2F2' } }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <BoltRoundedIcon sx={{ fontSize: 18, color: '#EF4444' }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    🛡️ Insert Anti-Cheat Protocol
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Webcam, fullscreen lockdown & plagiarism rules
                  </Typography>
                </Box>
              </MenuItem>

              <MenuItem
                onClick={() => handleAiAction('honorcode')}
                sx={{ borderRadius: '8px', my: 0.25, py: 0.8, '&:hover': { bgcolor: BRAND_COLORS.purple[50] } }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18, color: BRAND_COLORS.primary }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    📜 Add Candidate Honor Code
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Student integrity & non-collaboration agreement
                  </Typography>
                </Box>
              </MenuItem>

              <MenuItem
                onClick={() => handleAiAction('polish')}
                sx={{ borderRadius: '8px', my: 0.25, py: 0.8, '&:hover': { bgcolor: '#F0FDF4' } }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <PsychologyRoundedIcon sx={{ fontSize: 18, color: '#16A34A' }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    ✨ Polish & Fix Grammar
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Refine text into professional formal tone
                  </Typography>
                </Box>
              </MenuItem>

              <MenuItem
                onClick={() => {
                  handleAiMenuClose();
                  setAiPromptOpen(true);
                }}
                sx={{ borderRadius: '8px', my: 0.25, py: 0.8, '&:hover': { bgcolor: BRAND_COLORS.purple[50] } }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: BRAND_COLORS.secondary }} />
                </ListItemIcon>
                <Box>
                  <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                    💬 Custom AI Prompt...
                  </Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: '#64748B' }}>
                    Ask AI to draft or customize anything
                  </Typography>
                </Box>
              </MenuItem>
            </Menu>

            {/* Custom AI Prompt Dialog */}
            <Dialog
              open={aiPromptOpen}
              onClose={() => setAiPromptOpen(false)}
              maxWidth="sm"
              fullWidth
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: '16px',
                    p: 1,
                  },
                },
              }}
            >
              <DialogTitle sx={{ fontWeight: 800, fontSize: '1.1rem', color: BRAND_COLORS.primary, pb: 1 }}>
                ✨ Ask AI Assistant
              </DialogTitle>
              <DialogContent>
                <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
                  Describe the instructions, problem statements, rules, or formatting you want AI to generate.
                </Typography>
                <TextField
                  autoFocus
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="e.g. Write 4 strict rules regarding Python environment, memory limit of 256MB, and partial scoring..."
                  value={customPromptText}
                  onChange={(e) => setCustomPromptText(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                  onClick={() => setAiPromptOpen(false)}
                  sx={{ textTransform: 'none', color: '#64748B', fontWeight: 700 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCustomAiPromptSubmit}
                  disabled={!customPromptText.trim()}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '8px',
                    background: BRAND_COLORS.gradients.brand,
                    boxShadow: `0 4px 12px ${BRAND_COLORS.alpha.purple20}`,
                    px: 2.5,
                  }}
                >
                  Generate Content
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}

        <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />

        {/* Special Styled Note / Callout Box Button */}
        <Button
          size="small"
          onClick={handleCalloutMenuOpen}
          endIcon={<KeyboardArrowDownRoundedIcon sx={{ fontSize: 16 }} />}
          startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />}
          sx={{
            height: 30,
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'none',
            color: '#475569',
            bgcolor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            px: 1.2,
            '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
          }}
        >
          Insert Special Note
        </Button>

        {/* Callout Selection Menu */}
        <Menu
          anchorEl={calloutAnchorEl}
          open={isCalloutMenuOpen}
          onClose={handleCalloutMenuClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: '12px',
                minWidth: 260,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid #E2E8F0',
                p: 0.5,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => insertSpecialCallout('note')}
            sx={{ borderRadius: '8px', my: 0.25, py: 0.75, '&:hover': { bgcolor: '#FAF5FF' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <MenuBookRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F264F', display: 'block' }}>
                📘 Note / Key Concept
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                Sky blue callout background
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => insertSpecialCallout('tip')}
            sx={{ borderRadius: '8px', my: 0.25, py: 0.75, '&:hover': { bgcolor: '#ECFDF5' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <LightbulbRoundedIcon sx={{ fontSize: 18, color: '#10B981' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#065F46', display: 'block' }}>
                💡 Pro Tip & Best Practice
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                Emerald green callout background
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => insertSpecialCallout('warning')}
            sx={{ borderRadius: '8px', my: 0.25, py: 0.75, '&:hover': { bgcolor: '#FFFBEB' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#92400E', display: 'block' }}>
                ⚠️ Warning & Pitfalls
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                Warm amber callout background
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => insertSpecialCallout('important')}
            sx={{ borderRadius: '8px', my: 0.25, py: 0.75, '&:hover': { bgcolor: '#FEF2F2' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <ErrorOutlineRoundedIcon sx={{ fontSize: 18, color: '#EF4444' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#991B1B', display: 'block' }}>
                🚨 Important Notice
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                Rose red callout background
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => insertSpecialCallout('deepdive')}
            sx={{ borderRadius: '8px', my: 0.25, py: 0.75, '&:hover': { bgcolor: '#FAF5FF' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#5B21B6', display: 'block' }}>
                🔮 Deep Dive / Architecture
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                Indigo purple callout background
              </Typography>
            </Box>
          </MenuItem>

          <MenuItem
            onClick={() => insertSpecialCallout('code')}
            sx={{ borderRadius: '8px', my: 0.25, py: 0.75, '&:hover': { bgcolor: '#0F172A' } }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <TerminalRoundedIcon sx={{ fontSize: 18, color: '#C084FC' }} />
            </ListItemIcon>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#C084FC', display: 'block' }}>
                💻 Execution Mechanics
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block' }}>
                Dark navy slate callout background
              </Typography>
            </Box>
          </MenuItem>
        </Menu>

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
              color: editor.isActive('link') ? '#0B1F3A' : '#475569',
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
            borderLeft: '4px solid #0B1F3A',
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
            borderLeft: '4px solid #0B1F3A',
            bgcolor: 'rgba(91, 45, 144, 0.05)',
            p: 2,
            borderRadius: '0 10px 10px 0',
            my: 2.5,
            fontStyle: 'italic',
            color: '#0B1F3A',
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
            color: '#0B1F3A',
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
