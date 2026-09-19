'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Card,
  Button,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  Divider,
  Menu,
  Switch,
  FormControlLabel,
} from '@mui/material';

// Icons
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';

import type { OnMount, BeforeMount } from '@monaco-editor/react';
import { useToast } from '@/context/ToastContext';
import { compilerService, SupportedCompilerLang } from '@/lib/compiler-service';

// Dynamic import for Monaco Editor
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: '100%',
        minHeight: 480,
        bgcolor: '#0B0F19',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: '#94A3B8',
      }}
    >
      <CircularProgress size={28} sx={{ color: '#38BDF8' }} />
      <Typography sx={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
        Loading Monaco Editor...
      </Typography>
    </Box>
  ),
});

export type SupportedLanguage = 'cpp' | 'python' | 'java' | 'c' | 'javascript' | 'typescript' | 'go' | 'rust';

interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  version: string;
  monacoLang: string;
  defaultCode: string;
}

const LANGUAGES: Record<SupportedLanguage, LanguageOption> = {
  cpp: {
    id: 'cpp',
    name: 'C++ (GCC 14.2)',
    version: 'C++20',
    monacoLang: 'cpp',
    defaultCode: `#include <iostream>
using namespace std;

int main() {
    // cook your dish here
    cout << "Hello World" << endl;
    return 0;
}`,
  },
  python: {
    id: 'python',
    name: 'Python 3.12',
    version: 'Python 3.12.3',
    monacoLang: 'python',
    defaultCode: `# cook your dish here
print("Hello World")`,
  },
  java: {
    id: 'java',
    name: 'Java (OpenJDK 21)',
    version: 'Java 21 LTS',
    monacoLang: 'java',
    defaultCode: `import java.util.*;
import java.lang.*;
import java.io.*;

class CodePlatform {
    public static void main (String[] args) throws java.lang.Exception {
        // cook your dish here
        System.out.println("Hello World");
    }
}`,
  },
  c: {
    id: 'c',
    name: 'C (GCC 14.2)',
    version: 'C17',
    monacoLang: 'c',
    defaultCode: `#include <stdio.h>

int main(void) {
    // cook your dish here
    printf("Hello World\\n");
    return 0;
}`,
  },
  javascript: {
    id: 'javascript',
    name: 'JavaScript (Node.js 20)',
    version: 'Node.js 20.x',
    monacoLang: 'javascript',
    defaultCode: `// cook your dish here
console.log("Hello World");`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript 5.4',
    version: 'TS 5.4',
    monacoLang: 'typescript',
    defaultCode: `// cook your dish here
console.log("Hello World");`,
  },
  go: {
    id: 'go',
    name: 'Go 1.22',
    version: 'Go 1.22.4',
    monacoLang: 'go',
    defaultCode: `package main
import "fmt"

func main() {
    // cook your dish here
    fmt.Println("Hello World")
}`,
  },
  rust: {
    id: 'rust',
    name: 'Rust 1.78',
    version: 'Rust 1.78.0',
    monacoLang: 'rust',
    defaultCode: `fn main() {
    // cook your dish here
    println!("Hello World");
}`,
  },
};

export interface CodeEditorWorkspaceProps {
  initialCode?: string;
  initialLanguage?: SupportedLanguage;
  problemTitle?: string;
  initialCustomInput?: string;
  sampleTestCases?: Array<{
    input: string;
    output?: string;
    explanation?: string;
  }>;
  onCodeChange?: (code: string) => void;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  onSubmit?: (code: string, lang: SupportedLanguage) => Promise<void> | void;
}

export default function CodeEditorWorkspace({
  initialCode,
  initialLanguage = 'python',
  problemTitle = 'Online Compiler & Execution Arena',
  initialCustomInput,
  sampleTestCases,
  onCodeChange,
  onLanguageChange,
  onSubmit,
}: CodeEditorWorkspaceProps) {
  const toast = useToast();

  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>(initialLanguage);
  const [code, setCode] = useState<string>(initialCode || LANGUAGES[initialLanguage].defaultCode);
  const [selectedCaseIdx, setSelectedCaseIdx] = useState<number>(0);
  const [customInput, setCustomInput] = useState<string>(() => {
    if (initialCustomInput !== undefined) return initialCustomInput;
    if (sampleTestCases && sampleTestCases.length > 0) return sampleTestCases[0].input;
    return '';
  });
  const [output, setOutput] = useState<string>('');
  const [stderr, setStderr] = useState<string>('');

  const prevSampleCasesRef = useRef<string | null>(
    sampleTestCases && sampleTestCases.length > 0 ? JSON.stringify(sampleTestCases) : null
  );

  // Sync testcases when sampleTestCases arrive or change meaningfully
  useEffect(() => {
    if (initialCustomInput !== undefined) return;
    if (!sampleTestCases || sampleTestCases.length === 0) return;

    const currentSig = JSON.stringify(sampleTestCases);
    if (prevSampleCasesRef.current !== currentSig) {
      prevSampleCasesRef.current = currentSig;
      setCustomInput(sampleTestCases[0].input);
      setSelectedCaseIdx(0);
    }
  }, [sampleTestCases, initialCustomInput]);

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);
  const [memoryUsedKb, setMemoryUsedKb] = useState<number | null>(null);
  const [statusVerdict, setStatusVerdict] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

  // Console Drawer Panel State (Bottom Panel)
  const [consoleOpen, setConsoleOpen] = useState<boolean>(true);
  const [consoleTab, setConsoleTab] = useState<'input' | 'output'>('input');

  // Editor Settings
  const [themeName, setThemeName] = useState<'deep-space' | 'vs-dark' | 'hc-black'>('deep-space');
  const [fontSize, setFontSize] = useState<number>(14);
  const [tabSize, setTabSize] = useState<number>(4);
  const [showMinimap, setShowMinimap] = useState<boolean>(false);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Before Mount (Themes)
  const handleEditorWillMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme('deep-space', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'keyword', foreground: '38BDF8', fontStyle: 'bold' },
        { token: 'string', foreground: '4ADE80' },
        { token: 'number', foreground: 'FBBF24' },
        { token: 'type', foreground: '818CF8' },
        { token: 'function', foreground: 'A78BFA' },
        { token: 'operator', foreground: 'F472B6' },
        { token: 'variable', foreground: 'F8FAFC' },
      ],
      colors: {
        'editor.background': '#0B0F19',
        'editor.foreground': '#F8FAFC',
        'editor.lineHighlightBackground': '#111827',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#38BDF8',
        'editorIndentGuide.background': '#1F2937',
        'editorIndentGuide.activeBackground': '#38BDF8',
        'editorCursor.foreground': '#38BDF8',
        'editor.selectionBackground': '#1E3A8A',
        'editor.inactiveSelectionBackground': '#1F2937',
      },
    });
  };

  // On Mount
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Shortcut Ctrl+Enter to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({
        line: e.position.lineNumber,
        col: e.position.column,
      });
    });

    // Ensure layout and cursor focus are primed immediately upon mount
    setTimeout(() => {
      editor.layout();
      editor.focus();
    }, 50);
  };

  // Re-layout Monaco whenever console drawer toggles or fullscreen changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [consoleOpen, isFullscreen]);

  const handleLanguageSelect = (newLang: SupportedLanguage) => {
    setSelectedLang(newLang);
    const newDefaultCode = LANGUAGES[newLang].defaultCode;
    setCode(newDefaultCode);
    setOutput('');
    setStderr('');
    setStatusVerdict('IDLE');
    setExecutionTimeMs(null);
    onLanguageChange?.(newLang);
    onCodeChange?.(newDefaultCode);
    toast.info(`Switched runtime environment to ${LANGUAGES[newLang].name}`, 'Language Changed');
  };

  const handleCodeChange = (val: string | undefined) => {
    const nextVal = val ?? '';
    setCode(nextVal);
    onCodeChange?.(nextVal);
  };

  const handleReset = () => {
    const defaultSnippet = LANGUAGES[selectedLang].defaultCode;
    setCode(defaultSnippet);
    toast.info(`Reset code editor to default ${LANGUAGES[selectedLang].name} template.`, 'Reset Complete');
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast.info('Document formatted cleanly.', 'Formatted');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard!', 'Copied');
  };

  const handleDownloadCode = () => {
    const ext = selectedLang === 'python' ? 'py' : selectedLang === 'java' ? 'java' : selectedLang === 'c' ? 'c' : selectedLang === 'go' ? 'go' : selectedLang === 'rust' ? 'rs' : selectedLang === 'javascript' ? 'js' : selectedLang === 'typescript' ? 'ts' : 'cpp';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded solution.${ext}`, 'Saved');
  };

  // Run Code Execution (Real-time Piston compiler sandbox)
  const handleRunCode = async () => {
    setIsRunning(true);
    setConsoleOpen(true);
    setConsoleTab('output');
    setOutput('');
    setStderr('');
    setStatusVerdict('IDLE');

    const effectiveInput =
      selectedCaseIdx === -1
        ? customInput
        : customInput.trim() !== ''
        ? customInput
        : sampleTestCases && sampleTestCases.length > 0
        ? sampleTestCases[selectedCaseIdx >= 0 ? selectedCaseIdx : 0]?.input || sampleTestCases[0].input
        : '';

    try {
      const result = await compilerService.executeCode(
        selectedLang as SupportedCompilerLang,
        code,
        effectiveInput
      );

      setExecutionTimeMs(result.executionTimeMs);
      setMemoryUsedKb(result.memoryUsedMb ? Math.round(result.memoryUsedMb * 1024) : 12400);

      if (result.success) {
        setStatusVerdict('SUCCESS');
        setOutput(result.stdout || 'Process finished with exit code 0.');
        if (result.stderr) {
          setStderr(result.stderr);
        }
        toast.success(`Executed in ${result.executionTimeMs}ms`, 'Run Finished');
      } else {
        setStatusVerdict('ERROR');
        if (result.stdout) {
          setOutput(result.stdout);
        }
        setStderr(result.stderr || result.compileOutput || `Process exited with code ${result.exitCode}`);
        toast.error(
          result.exitCode === 137
            ? 'Time Limit Exceeded (TLE)'
            : 'Execution / Compilation Error',
          'Execution Failed'
        );
      }
    } catch (err: any) {
      setStatusVerdict('ERROR');
      setStderr(err?.message || 'Compilation or runtime exception occurred.');
      toast.error('Execution encountered an unexpected issue', 'Runtime Error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      onSubmit?.(code, selectedLang);
    } catch (err: any) {
      toast.error('Submission failed', 'Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Listen for Escape key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  return (
    <Card
      sx={{
        borderRadius: isFullscreen ? 0 : '16px',
        bgcolor: '#0F172A',
        border: isFullscreen ? 'none' : '1px solid #1E293B',
        boxShadow: isFullscreen ? 'none' : '0 10px 30px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1400 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 680,
        minHeight: isFullscreen ? '100vh' : 680,
      }}
    >
      {/* ========================================================================= */}
      {/* 1. TOP UNIFIED TOOLBAR: Language + Action Buttons + Settings + Fullscreen */}
      {/* ========================================================================= */}
      <Box
        sx={{
          bgcolor: '#FFFFFF',
          px: 2,
          py: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E2E8F0',
          flexShrink: 0,
          flexWrap: 'wrap',
          gap: 1.5,
          minHeight: 52,
        }}
      >
        {/* Left Toolbar: Language Dropdown */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <Select
              value={selectedLang}
              onChange={(e) => handleLanguageSelect(e.target.value as SupportedLanguage)}
              MenuProps={{
                sx: { zIndex: 99999 },
                slotProps: {
                  paper: {
                    sx: {
                      zIndex: 99999,
                      bgcolor: '#0F172A',
                      color: '#F1F5F9',
                      border: '1px solid #1E293B',
                      borderRadius: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                      '& .MuiMenuItem-root': {
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        py: 0.8,
                        '&:hover': {
                          bgcolor: 'rgba(56, 189, 248, 0.12)',
                          color: '#38BDF8',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(56, 189, 248, 0.2)',
                          color: '#38BDF8',
                          fontWeight: 700,
                        },
                      },
                    },
                  },
                },
              }}
              sx={{
                bgcolor: '#FFFFFF',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#1E293B',
                height: 36,
                '& fieldset': { borderColor: '#CBD5E1' },
                '&:hover fieldset': { borderColor: '#94A3B8' },
                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
              }}
            >
              {Object.values(LANGUAGES).map((l) => (
                <MenuItem key={l.id} value={l.id}>
                  {l.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Right Toolbar: Run, Submit & Quick Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Prominent Run Button */}
          <Button
            variant="contained"
            disabled={isRunning}
            onClick={handleRunCode}
            startIcon={
              isRunning ? (
                <CircularProgress size={15} sx={{ color: '#FFFFFF' }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              px: 2.2,
              py: 0.65,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
              '&:hover': {
                background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
              },
            }}
          >
            {isRunning ? 'Running...' : 'Run'}
          </Button>

          {/* Submit Button (Only shown in problem/contest mode when onSubmit is passed) */}
          {Boolean(onSubmit) && (
            <Button
              variant="outlined"
              disabled={isSubmitting}
              onClick={handleSubmit}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={15} sx={{ color: '#2563EB' }} />
                ) : (
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                )
              }
              sx={{
                borderRadius: '8px',
                borderColor: '#CBD5E1',
                color: '#1E293B',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.86rem',
                px: 2,
                py: 0.65,
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              Submit
            </Button>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: '#E2E8F0' }} />

          {/* Editor Action Icons */}
          <Tooltip title="Format Code" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
            <IconButton size="small" onClick={handleFormat} sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}>
              <FormatAlignLeftRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Reset Code" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
            <IconButton size="small" onClick={handleReset} sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}>
              <RestartAltRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Copy Code" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
            <IconButton size="small" onClick={handleCopyCode} sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}>
              <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Code" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
            <IconButton size="small" onClick={handleDownloadCode} sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}>
              <DownloadRoundedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Editor Settings" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
            <IconButton
              size="small"
              onClick={(e) => setSettingsAnchor(e.currentTarget)}
              sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
            >
              <SettingsOutlinedIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>

          <Tooltip title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen'} arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen(!isFullscreen)}
              sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
            >
              {isFullscreen ? <FullscreenExitRoundedIcon sx={{ fontSize: 20 }} /> : <FullscreenRoundedIcon sx={{ fontSize: 20 }} />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. FULL-WIDTH MONACO CODE EDITOR CANVAS */}
      {/* ========================================================================= */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          minHeight: 0,
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#0B0F19',
        }}
      >
        <MonacoEditor
          height="100%"
          width="100%"
          language={LANGUAGES[selectedLang].monacoLang}
          value={code}
          theme={themeName}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={handleCodeChange}
          options={{
            fontSize: fontSize,
            tabSize: tabSize,
            insertSpaces: true,
            detectIndentation: false,
            fontFamily: 'var(--font-mono), "JetBrains Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
            fontLigatures: true,
            minimap: { enabled: showMinimap },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: wordWrap,
            bracketPairColorization: { enabled: true },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            renderLineHighlight: 'line',
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
          }}
        />
      </Box>

      {/* ========================================================================= */}
      {/* 3. EXPANDABLE BOTTOM CONSOLE DRAWER (Custom Input & Output Tabs) */}
      {/* ========================================================================= */}
      <Box
        sx={{
          bgcolor: '#111827',
          borderTop: '1px solid #1F2937',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          maxHeight: consoleOpen ? (isFullscreen ? '42vh' : 280) : 38,
          transition: 'max-height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Console Header Bar */}
        <Box
          sx={{
            px: 2,
            py: 0.6,
            bgcolor: '#0F172A',
            borderBottom: consoleOpen ? '1px solid #1E293B' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 38,
            cursor: 'pointer',
            userSelect: 'none',
          }}
          onClick={() => setConsoleOpen(!consoleOpen)}
        >
          {/* Tabs */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              onClick={() => {
                setConsoleTab('input');
                setConsoleOpen(true);
              }}
              sx={{
                textTransform: 'none',
                fontWeight: consoleTab === 'input' ? 800 : 600,
                fontSize: '0.78rem',
                px: 1.5,
                py: 0.3,
                borderRadius: '6px',
                bgcolor: consoleTab === 'input' && consoleOpen ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: consoleTab === 'input' && consoleOpen ? '#38BDF8' : '#94A3B8',
                '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' },
              }}
            >
              Testcase (stdin)
            </Button>

            <Button
              size="small"
              onClick={() => {
                setConsoleTab('output');
                setConsoleOpen(true);
              }}
              sx={{
                textTransform: 'none',
                fontWeight: consoleTab === 'output' ? 800 : 600,
                fontSize: '0.78rem',
                px: 1.5,
                py: 0.3,
                borderRadius: '6px',
                bgcolor: consoleTab === 'output' && consoleOpen ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                color: consoleTab === 'output' && consoleOpen ? '#38BDF8' : '#94A3B8',
                '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.1)', color: '#38BDF8' },
              }}
            >
              Console Output
              {statusVerdict !== 'IDLE' && (
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    bgcolor: statusVerdict === 'SUCCESS' ? '#4ADE80' : '#F87171',
                    display: 'inline-block',
                  }}
                />
              )}
            </Button>
          </Box>

          {/* Right Status & Expand Chevron */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {statusVerdict !== 'IDLE' && executionTimeMs !== null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                <span>Time: <strong style={{ color: '#F3F4F6' }}>{executionTimeMs}ms</strong></span>
                <span>RAM: <strong style={{ color: '#F3F4F6' }}>{(memoryUsedKb! / 1024).toFixed(1)}MB</strong></span>
              </Box>
            )}

            <Tooltip title="Clear Input & Output" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomInput('');
                  setOutput('');
                  setStderr('');
                  setStatusVerdict('IDLE');
                  setExecutionTimeMs(null);
                  toast.info('Cleared I/O panes.', 'Cleared');
                }}
                sx={{ color: '#64748B', p: 0.4, '&:hover': { color: '#EF4444' } }}
              >
                <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title={consoleOpen ? 'Collapse Console' : 'Expand Console'} arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
              <IconButton size="small" sx={{ color: '#94A3B8', p: 0.4 }}>
                {consoleOpen ? <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} /> : <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Console Body */}
        {consoleOpen && (
          <Box sx={{ p: 1.5, bgcolor: '#0B0F19', flex: 1, overflowY: 'auto' }}>
            {/* TAB 1: Custom Input (stdin) */}
            {consoleTab === 'input' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Testcase selector chips or presets */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                  {sampleTestCases && sampleTestCases.length > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      {sampleTestCases.map((tc, idx) => (
                        <Button
                          key={idx}
                          size="small"
                          onClick={() => {
                            setSelectedCaseIdx(idx);
                            setCustomInput(tc.input);
                          }}
                          sx={{
                            fontSize: '0.74rem',
                            fontWeight: selectedCaseIdx === idx ? 800 : 600,
                            textTransform: 'none',
                            borderRadius: '6px',
                            px: 1.4,
                            py: 0.2,
                            bgcolor: selectedCaseIdx === idx ? 'rgba(56, 189, 248, 0.2)' : '#1F2937',
                            color: selectedCaseIdx === idx ? '#38BDF8' : '#94A3B8',
                            border: selectedCaseIdx === idx ? '1px solid #38BDF8' : '1px solid #374151',
                            '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' },
                          }}
                        >
                          Case {idx + 1}
                        </Button>
                      ))}
                      <Button
                        size="small"
                        onClick={() => {
                          setSelectedCaseIdx(-1);
                        }}
                        sx={{
                          fontSize: '0.74rem',
                          fontWeight: selectedCaseIdx === -1 ? 800 : 600,
                          textTransform: 'none',
                          borderRadius: '6px',
                          px: 1.2,
                          py: 0.2,
                          bgcolor: selectedCaseIdx === -1 ? 'rgba(56, 189, 248, 0.2)' : '#1F2937',
                          color: selectedCaseIdx === -1 ? '#38BDF8' : '#94A3B8',
                          border: selectedCaseIdx === -1 ? '1px solid #38BDF8' : '1px solid #374151',
                          '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8' },
                        }}
                      >
                        + Custom
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        Standard Input (stdin):
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.8 }}>
                        <Button
                          size="small"
                          onClick={() => setCustomInput('5\n10 20 30 40 50')}
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: '#38BDF8',
                            bgcolor: 'rgba(56, 189, 248, 0.1)',
                            px: 1,
                            py: 0.2,
                            minWidth: 0,
                            borderRadius: '4px',
                            '&:hover': { bgcolor: 'rgba(56, 189, 248, 0.2)' },
                          }}
                        >
                          + Sample Array
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setCustomInput('4 9\n2 7 11 15')}
                          sx={{
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            textTransform: 'none',
                            color: '#A78BFA',
                            bgcolor: 'rgba(167, 139, 250, 0.1)',
                            px: 1,
                            py: 0.2,
                            minWidth: 0,
                            borderRadius: '4px',
                            '&:hover': { bgcolor: 'rgba(167, 139, 250, 0.2)' },
                          }}
                        >
                          + Target Pair
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                  {/* Input Box */}
                  <Box sx={{ flex: 1, minWidth: 240 }}>
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', mb: 0.4 }}>
                      INPUT (STDIN)
                    </Typography>
                    <textarea
                      className="code-editor-font"
                      rows={3}
                      value={customInput}
                      onChange={(e) => {
                        setCustomInput(e.target.value);
                      }}
                      placeholder="Enter stdin input here..."
                      style={{
                        width: '100%',
                        backgroundColor: '#111827',
                        color: '#38BDF8',
                        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                        fontSize: '13px',
                        lineHeight: '1.5',
                        border: '1px solid #1F2937',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        outline: 'none',
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                    />
                  </Box>

                  {/* Expected Output Box (if active case has output) */}
                  {sampleTestCases && selectedCaseIdx >= 0 && sampleTestCases[selectedCaseIdx]?.output && (
                    <Box sx={{ width: { xs: '100%', md: '35%' }, minWidth: 160 }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748B', mb: 0.4 }}>
                        EXPECTED OUTPUT
                      </Typography>
                      <Box
                        sx={{
                          p: '8px 12px',
                          bgcolor: '#111827',
                          border: '1px solid #1F2937',
                          borderRadius: '6px',
                          color: '#4ADE80',
                          fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                          fontSize: '13px',
                          lineHeight: '1.5',
                          minHeight: 70,
                          maxHeight: 110,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {sampleTestCases[selectedCaseIdx].output}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* TAB 2: Console Output */}
            {consoleTab === 'output' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                      Program Standard Output & Diagnostic Stream:
                    </Typography>
                    {statusVerdict !== 'IDLE' && (
                      <Chip
                        size="small"
                        icon={
                          statusVerdict === 'SUCCESS' ? (
                            <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
                          ) : (
                            <ErrorOutlineRoundedIcon sx={{ fontSize: 13 }} />
                          )
                        }
                        label={statusVerdict === 'SUCCESS' ? 'Success (0)' : 'Error'}
                        sx={{
                          bgcolor: statusVerdict === 'SUCCESS' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: statusVerdict === 'SUCCESS' ? '#4ADE80' : '#F87171',
                          fontWeight: 700,
                          fontSize: '0.68rem',
                          height: 20,
                        }}
                      />
                    )}
                  </Box>

                  {(output || stderr) && (
                    <Tooltip title="Copy Output" arrow slotProps={{ popper: { sx: { zIndex: 99999 } } }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          navigator.clipboard.writeText(output || stderr);
                          toast.success('Output copied to clipboard!', 'Copied');
                        }}
                        sx={{ color: '#64748B', p: 0.2, '&:hover': { color: '#38BDF8' } }}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Box
                  className="code-editor-font"
                  sx={{
                    p: 1.5,
                    bgcolor: '#111827',
                    border: '1px solid #1F2937',
                    borderRadius: '6px',
                    minHeight: 110,
                    maxHeight: 180,
                    overflowY: 'auto',
                    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                >
                  {isRunning ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2, justifyContent: 'center' }}>
                      <CircularProgress size={16} sx={{ color: '#38BDF8' }} />
                      <Typography sx={{ color: '#94A3B8', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                        Compiling & executing code...
                      </Typography>
                    </Box>
                  ) : output || stderr ? (
                    <Box sx={{ color: stderr ? '#F87171' : '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {stderr ? (
                        <pre style={{ margin: 0, color: '#F87171', fontFamily: 'inherit' }}>{stderr}</pre>
                      ) : (
                        output.split('\n').map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))
                      )}
                    </Box>
                  ) : (
                    <Typography sx={{ color: '#4B5563', fontSize: '0.78rem', fontFamily: 'monospace' }}>
                      Click &ldquo;Run&rdquo; to execute the code and view stdout/stderr output here.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ========================================================================= */}
      {/* 4. EDITOR FOOTER STATUS BAR */}
      {/* ========================================================================= */}
      <Box
        sx={{
          px: 2,
          py: 0.4,
          bgcolor: '#0B0F19',
          borderTop: '1px solid #1F2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: '#64748B',
          fontFamily: 'monospace',
          flexShrink: 0,
          height: 28,
        }}
      >
        <span>
          Ln {cursorPos.line}, Col {cursorPos.col}
        </span>
        <span>Spaces: {tabSize}</span>
        <span>UTF-8</span>
        <span style={{ color: '#38BDF8', fontWeight: 700 }}>{LANGUAGES[selectedLang].version}</span>
      </Box>

      {/* ========================================================================= */}
      {/* 5. PREFERENCES MENU */}
      {/* ========================================================================= */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
        slotProps={{
          paper: {
            sx: {
              zIndex: 99999,
              bgcolor: '#0F172A',
              border: '1px solid #1E293B',
              borderRadius: '12px',
              p: 1.5,
              minWidth: 240,
              color: '#F1F5F9',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            },
          },
        }}
      >
        <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
          EDITOR THEME
        </Typography>
        {(['deep-space', 'vs-dark', 'hc-black'] as const).map((t) => (
          <MenuItem
            key={t}
            onClick={() => setThemeName(t)}
            sx={{
              fontSize: '0.82rem',
              fontWeight: 600,
              borderRadius: '6px',
              bgcolor: themeName === t ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: themeName === t ? '#38BDF8' : '#F1F5F9',
            }}
          >
            {t === 'deep-space' ? 'Deep Space Dark' : t === 'vs-dark' ? 'VS Code Dark+' : 'High Contrast Black'}
          </MenuItem>
        ))}

        <Divider sx={{ my: 1, borderColor: '#1E293B' }} />

        <Typography sx={{ fontSize: '0.76rem', fontWeight: 800, color: '#94A3B8', mb: 1 }}>
          FONT SIZE
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
          {[12, 13, 14, 16].map((s) => (
            <Chip
              key={s}
              label={`${s}px`}
              size="small"
              onClick={() => setFontSize(s)}
              sx={{
                bgcolor: fontSize === s ? '#38BDF8' : '#1E293B',
                color: fontSize === s ? '#0B0F19' : '#F1F5F9',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            />
          ))}
        </Box>

        <Divider sx={{ my: 1, borderColor: '#1E293B' }} />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={showMinimap}
              onChange={(e) => setShowMinimap(e.target.checked)}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#38BDF8' } }}
            />
          }
          label={<Typography sx={{ fontSize: '0.8rem', color: '#E2E8F0' }}>Minimap</Typography>}
        />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={wordWrap === 'on'}
              onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
              sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#38BDF8' } }}
            />
          }
          label={<Typography sx={{ fontSize: '0.8rem', color: '#E2E8F0' }}>Word Wrap</Typography>}
        />
      </Menu>
    </Card>
  );
}
