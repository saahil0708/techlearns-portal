'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  CircularProgress,
  Collapse,
  Paper,
  Divider,
  TextField,
  MenuItem,
  Select,
  Tabs,
  Tab,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import FormatListBulletedRoundedIcon from '@mui/icons-material/FormatListBulletedRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import {
  parseCurriculumCsv,
  parseCurriculumJson,
  parseCurriculumMarkdown,
  generateCurriculumCsvTemplate,
  generateCurriculumJsonTemplate,
  generateCurriculumMdTemplate,
  ParseResult,
  ParsedModuleImport,
} from '@/lib/curriculum-import-parser';

interface BulkImportCurriculumModalProps {
  open: boolean;
  onClose: () => void;
  courseId?: string;
  courseTitle?: string;
  onImportSuccess: () => void;
}

export default function BulkImportCurriculumModal({
  open,
  onClose,
  courseId,
  courseTitle,
  onImportSuccess,
}: BulkImportCurriculumModalProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCreatingNewCourse = !courseId;

  const [inputTab, setInputTab] = useState<'upload' | 'paste'>('upload');
  const [pasteText, setPasteText] = useState<string>('');
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [expandedModuleIdx, setExpandedModuleIdx] = useState<number | null>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // New Course metadata fields when importing a brand new course from directory
  const [newCourseTitle, setNewCourseTitle] = useState<string>('');
  const [newCourseCode, setNewCourseCode] = useState<string>('');
  const [newCourseLevel, setNewCourseLevel] = useState<string>('Beginner');
  const [newCourseCategory, setNewCourseCategory] = useState<string>('Programming Languages');
  const [newCourseDescription, setNewCourseDescription] = useState<string>('');

  const borderColor = '#E2E8F0';

  useEffect(() => {
    if (open) {
      if (parseResult?.courseMetadata) {
        if (parseResult.courseMetadata.title) setNewCourseTitle(parseResult.courseMetadata.title);
        if (parseResult.courseMetadata.code) setNewCourseCode(parseResult.courseMetadata.code);
        if (parseResult.courseMetadata.level) {
          const l = parseResult.courseMetadata.level.toUpperCase();
          setNewCourseLevel(l === 'ADVANCED' ? 'Advanced' : l === 'INTERMEDIATE' ? 'Intermediate' : 'Beginner');
        }
        if (parseResult.courseMetadata.category) setNewCourseCategory(parseResult.courseMetadata.category);
        if (parseResult.courseMetadata.description) setNewCourseDescription(parseResult.courseMetadata.description);
      }
    }
  }, [open, parseResult]);

  const handleReset = () => {
    setSelectedFile(null);
    setPasteText('');
    setParseResult(null);
    setIsParsing(false);
    setIsSubmitting(false);
    setExpandedModuleIdx(0);
    setNewCourseTitle('');
    setNewCourseCode('');
    setNewCourseLevel('Beginner');
    setNewCourseCategory('Programming Languages');
    setNewCourseDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleReset();
    onClose();
  };

  const processContent = (text: string, fileNameHint: string = '') => {
    setIsParsing(true);
    setParseResult(null);

    try {
      const hint = fileNameHint.toLowerCase();
      let result: ParseResult;

      if (hint.endsWith('.json') || (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        result = parseCurriculumJson(text);
      } else if (hint.endsWith('.csv') || hint.endsWith('.tsv') || text.includes(',') && text.toLowerCase().includes('module')) {
        result = parseCurriculumCsv(text);
      } else if (hint.endsWith('.md') || hint.endsWith('.markdown') || text.includes('# Module')) {
        result = parseCurriculumMarkdown(text);
      } else {
        // Fallback: try parsing JSON first, then CSV, then Markdown
        try {
          result = parseCurriculumJson(text);
        } catch {
          result = parseCurriculumCsv(text);
        }
      }

      setParseResult(result);
      if (result.success) {
        if (result.courseMetadata) {
          if (result.courseMetadata.title) setNewCourseTitle(result.courseMetadata.title);
          if (result.courseMetadata.code) setNewCourseCode(result.courseMetadata.code);
          if (result.courseMetadata.level) setNewCourseLevel(result.courseMetadata.level.toUpperCase());
          if (result.courseMetadata.category) setNewCourseCategory(result.courseMetadata.category);
          if (result.courseMetadata.description) setNewCourseDescription(result.courseMetadata.description);
        } else if (!newCourseTitle) {
          setNewCourseTitle('Imported Course Syllabus');
        }

        toast.success(
          `Parsed ${result.stats.totalModules} module(s) and ${result.stats.totalLessons} lesson(s) successfully!`,
          'Curriculum Ready',
        );
      } else if (result.errors.length > 0) {
        toast.error(result.errors[0], 'Parsing Error');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to read content.', 'Parse Error');
      setParseResult({
        success: false,
        modules: [],
        stats: { totalModules: 0, totalLessons: 0, totalQuizzes: 0, totalCodingProblems: 0, totalNotes: 0 },
        errors: [err?.message || 'Failed to read contents.'],
        warnings: [],
      });
    } finally {
      setIsParsing(false);
    }
  };

  const processFile = async (file: File) => {
    setSelectedFile(file);
    try {
      const text = await file.text();
      processContent(text, file.name);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to read uploaded file.', 'File Read Error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleParsePastedText = () => {
    if (!pasteText.trim()) {
      toast.error('Please paste JSON, CSV, or Markdown text before parsing.', 'Empty Input');
      return;
    }
    processContent(pasteText.trim());
  };

  const downloadTemplate = (format: 'csv' | 'json' | 'md') => {
    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (format === 'csv') {
      content = generateCurriculumCsvTemplate();
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    } else if (format === 'json') {
      content = generateCurriculumJsonTemplate();
      mimeType = 'application/json;charset=utf-8;';
      ext = 'json';
    } else if (format === 'md') {
      content = generateCurriculumMdTemplate();
      mimeType = 'text/markdown;charset=utf-8;';
      ext = 'md';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Curriculum_Import_Template.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.info(`Downloaded Curriculum ${format.toUpperCase()} Template`, 'Template Download');
  };

  const handleCommitImport = async () => {
    if (!parseResult?.success || !parseResult.modules || parseResult.modules.length === 0) {
      toast.error('No valid modules parsed to import.', 'Import Error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isCreatingNewCourse) {
        // Creating a brand new composite course from directory
        const finalTitle = newCourseTitle.trim() || parseResult.courseMetadata?.title || 'Imported Course';
        const finalCode = newCourseCode.trim() || parseResult.courseMetadata?.code || undefined;
        const finalCategory = newCourseCategory || parseResult.courseMetadata?.category || 'Programming Languages';
        const rawLevel = (newCourseLevel || parseResult.courseMetadata?.level || 'Beginner').toUpperCase();
        const finalLevel = rawLevel === 'ADVANCED' ? 'Advanced' : rawLevel === 'INTERMEDIATE' ? 'Intermediate' : 'Beginner';
        const finalDesc = newCourseDescription.trim() || parseResult.courseMetadata?.description || undefined;

        await apiService.createCompositeCourse({
          title: finalTitle,
          code: finalCode,
          category: finalCategory,
          level: finalLevel,
          description: finalDesc,
          status: 'PUBLISHED',
          modules: parseResult.modules.map((m, mIdx) => ({
            title: m.title,
            description: m.description,
            order: m.order ?? mIdx,
            lessons: m.lessons.map((l, lIdx) => ({
              title: l.title,
              content: l.content,
              type: l.type,
              durationMinutes: l.durationMinutes,
              importantNotes: l.importantNotes,
              quizMCQ: l.quizMCQ,
              codingProblem: l.codingProblem,
              order: l.order ?? lIdx,
            })),
          })),
        });

        toast.success(
          `Successfully created course "${finalTitle}" with ${parseResult.stats.totalModules} modules and ${parseResult.stats.totalLessons} lessons!`,
          'Course Created',
        );
      } else {
        // Appending / replacing curriculum in existing course
        await apiService.bulkImportCurriculum(courseId!, {
          mode: importMode,
          modules: parseResult.modules,
        });

        toast.success(
          `Successfully imported ${parseResult.stats.totalModules} modules and ${parseResult.stats.totalLessons} lessons into "${courseTitle}"!`,
          'Curriculum Imported',
        );
      }

      onImportSuccess();
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to import onto server.', 'Import Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          p: { xs: 2.5, sm: 3 },
          pb: 2,
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#FAFAFA',
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: '10px',
                bgcolor: '#FAF5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B1F3A',
              }}
            >
              <CloudUploadRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.15rem' }}>
              {isCreatingNewCourse ? 'Bulk Import Course & Curriculum' : 'Bulk Import Curriculum'}
            </Typography>
            <Chip
              label="CSV • JSON • Markdown"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.72rem',
                fontWeight: 700,
                bgcolor: '#FAF5FF',
                color: '#0B1F3A',
                border: '1px solid #FAF5FF',
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748B', mt: 0.5 }}>
            {isCreatingNewCourse
              ? 'Upload or paste a syllabus file to create a brand new course with all modules, submodules, notes, quizzes, and coding labs.'
              : `Upload syllabus modules, submodules, notes, quizzes, and coding challenges into "${courseTitle}".`}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={isSubmitting} sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5, overflowY: 'auto' }}>
        {/* Template Downloads Action Bar */}
        <Box
          sx={{
            p: 2,
            borderRadius: '16px',
            bgcolor: '#F8FAFC',
            border: `1px dashed ${borderColor}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#0F172A' }}>
              Download Sample Curriculum Templates
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
              Use our standardized format to format notes, MCQs, MSQs, and coding challenges.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => downloadTemplate('json')}
              sx={{
                borderRadius: '8px',
                borderColor: '#CBD5E1',
                color: '#334155',
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#FFFFFF',
              }}
            >
              JSON Template
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => downloadTemplate('csv')}
              sx={{
                borderRadius: '8px',
                borderColor: '#CBD5E1',
                color: '#334155',
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#FFFFFF',
              }}
            >
              CSV Template
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => downloadTemplate('md')}
              sx={{
                borderRadius: '8px',
                borderColor: '#CBD5E1',
                color: '#334155',
                fontSize: '0.76rem',
                fontWeight: 700,
                textTransform: 'none',
                bgcolor: '#FFFFFF',
              }}
            >
              Markdown Template
            </Button>
          </Box>
        </Box>

        {/* Input Mode Tabs: Upload vs Paste */}
        <Box sx={{ borderBottom: `1px solid ${borderColor}` }}>
          <Tabs
            value={inputTab}
            onChange={(_, val) => setInputTab(val)}
            sx={{
              minHeight: 38,
              '& .MuiTab-root': {
                minHeight: 38,
                fontSize: '0.84rem',
                fontWeight: 700,
                textTransform: 'none',
                px: 2,
              },
            }}
          >
            <Tab value="upload" label="Upload File (.json, .csv, .md)" icon={<CloudUploadRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            <Tab value="paste" label="Paste Raw Content" icon={<ContentPasteRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab 1: Upload File Drag & Drop */}
        {inputTab === 'upload' && !selectedFile && (
          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${isDragOver ? '#0B1F3A' : '#CBD5E1'}`,
              borderRadius: '16px',
              p: { xs: 3, sm: 4 },
              textAlign: 'center',
              bgcolor: isDragOver ? '#FAF5FF' : '#FAFAFA',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: '#0B1F3A',
                bgcolor: '#F8FAFC',
              },
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.json,.md,.txt,.markdown"
              style={{ display: 'none' }}
            />
            <CloudUploadRoundedIcon sx={{ fontSize: 44, color: '#5B2D90', mb: 1 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '0.96rem', color: '#0F172A' }}>
              Choose a file or drag & drop it here
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#64748B', mt: 0.5 }}>
              Supports JSON (`.json`), Excel/CSV (`.csv`), or Markdown (`.md`) up to 10MB
            </Typography>
            <Button
              variant="contained"
              size="small"
              sx={{
                mt: 2,
                borderRadius: '8px',
                bgcolor: '#0B1F3A',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                px: 2.5,
              }}
            >
              Browse Files
            </Button>
          </Box>
        )}

        {/* Tab 2: Paste Raw Content */}
        {inputTab === 'paste' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>
              Paste JSON, CSV, or Structured Markdown:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder="Paste course JSON (e.g. { course: { title: '...' }, modules: [...] }) or CSV rows here..."
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              slotProps={{
                input: {
                  sx: {
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.84rem',
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                  },
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={handleParsePastedText}
                disabled={!pasteText.trim()}
                startIcon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#0B1F3A',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  px: 2,
                }}
              >
                Parse & Preview
              </Button>
            </Box>
          </Box>
        )}

        {/* File Selected Badge */}
        {selectedFile && inputTab === 'upload' && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: '14px',
              bgcolor: '#F8FAFC',
              border: `1px solid ${borderColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <InsertDriveFileRoundedIcon sx={{ fontSize: 28, color: '#0B1F3A' }} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                  {selectedFile.name}
                </Typography>
                <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'text/plain'}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleReset} size="small" sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444' } }}>
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </Paper>
        )}

        {/* Parsing Loading Indicator */}
        {isParsing && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 3 }}>
            <CircularProgress size={22} sx={{ color: '#0B1F3A' }} />
            <Typography sx={{ fontSize: '0.88rem', fontWeight: 600, color: '#475569' }}>
              Parsing curriculum structure and validating data...
            </Typography>
          </Box>
        )}

        {/* Parsed Result & Course Metadata Form */}
        {parseResult && parseResult.success && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* New Course Metadata Review Form (When creating a brand new course from directory) */}
            {isCreatingNewCourse && (
              <Box sx={{ bgcolor: '#F8FAFC', p: 2.5, borderRadius: '16px', border: `1px solid ${borderColor}` }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', mb: 1.5 }}>
                  Course Identification & Classification
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2, mb: 1.5 }}>
                  <TextField
                    size="small"
                    label="Course Title"
                    required
                    value={newCourseTitle}
                    onChange={(e) => setNewCourseTitle(e.target.value)}
                    slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '0.88rem' } } }}
                  />
                  <TextField
                    size="small"
                    label="Course Code (Unique)"
                    placeholder="e.g. PY-101"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '0.88rem' } } }}
                  />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 1.5 }}>
                  <Select
                    size="small"
                    value={newCourseCategory}
                    onChange={(e) => setNewCourseCategory(e.target.value)}
                    sx={{ borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '0.88rem' }}
                  >
                    <MenuItem value="Programming Languages">Programming Languages</MenuItem>
                    <MenuItem value="Computer Science & Core DSA">Computer Science & Core DSA</MenuItem>
                    <MenuItem value="System Design & Architecture">System Design & Architecture</MenuItem>
                    <MenuItem value="Full-Stack Web Development">Full-Stack Web Development</MenuItem>
                    <MenuItem value="AI, ML & Data Science">AI, ML & Data Science</MenuItem>
                    <MenuItem value="Competitive Programming">Competitive Programming</MenuItem>
                  </Select>

                  <Select
                    size="small"
                    value={newCourseLevel}
                    onChange={(e) => setNewCourseLevel(e.target.value)}
                    sx={{ borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '0.88rem' }}
                  >
                    <MenuItem value="Beginner">Beginner Level</MenuItem>
                    <MenuItem value="Intermediate">Intermediate Level</MenuItem>
                    <MenuItem value="Advanced">Advanced Level</MenuItem>
                  </Select>
                </Box>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  label="Course Description"
                  value={newCourseDescription}
                  onChange={(e) => setNewCourseDescription(e.target.value)}
                  slotProps={{ input: { sx: { borderRadius: '10px', bgcolor: '#FFFFFF', fontSize: '0.86rem' } } }}
                />
              </Box>
            )}

            {/* Existing Course Import Mode Selection (Append vs Replace) */}
            {!isCreatingNewCourse && (
              <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '14px', border: `1px solid ${borderColor}` }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.84rem', color: '#0F172A', mb: 0.5 }}>
                  Import Strategy for Existing Course:
                </Typography>
                <RadioGroup
                  row
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'append' | 'replace')}
                >
                  <FormControlLabel
                    value="append"
                    control={<Radio size="small" sx={{ color: '#0B1F3A', '&.Mui-checked': { color: '#0B1F3A' } }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                          Append to Existing
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          Add new modules without modifying current syllabus
                        </Typography>
                      </Box>
                    }
                    sx={{ mr: 4 }}
                  />
                  <FormControlLabel
                    value="replace"
                    control={<Radio size="small" sx={{ color: '#EF4444', '&.Mui-checked': { color: '#EF4444' } }} />}
                    label={
                      <Box>
                        <Typography sx={{ fontSize: '0.84rem', fontWeight: 600, color: '#DC2626' }}>
                          Replace Entire Curriculum
                        </Typography>
                        <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                          Overwrite all existing modules and submodules
                        </Typography>
                      </Box>
                    }
                  />
                </RadioGroup>
              </Box>
            )}

            {/* Parsing Stats Card */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#FAF5FF', border: '1px solid #F3E8FF' }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#17366E', fontWeight: 700, textTransform: 'uppercase' }}>
                  Modules
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F264F', mt: 0.25 }}>
                  {parseResult.stats.totalModules}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#15803D', fontWeight: 700, textTransform: 'uppercase' }}>
                  Total Lessons
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', mt: 0.25 }}>
                  {parseResult.stats.totalLessons}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#FAF5FF', border: '1px solid #E9D5FF' }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#7E22CE', fontWeight: 700, textTransform: 'uppercase' }}>
                  MCQ / MSQ Quizzes
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#6B21A8', mt: 0.25 }}>
                  {parseResult.stats.totalQuizzes}
                </Typography>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', bgcolor: '#FFF7ED', border: '1px solid #FED7AA' }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#C2410C', fontWeight: 700, textTransform: 'uppercase' }}>
                  Coding Labs
                </Typography>
                <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#9A3412', mt: 0.25 }}>
                  {parseResult.stats.totalCodingProblems}
                </Typography>
              </Paper>
            </Box>

            {/* Interactive Module & Lesson List Preview */}
            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#0F172A', mb: 1 }}>
                Parsed Curriculum Hierarchy
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {parseResult.modules.map((mod, mIdx) => {
                  const isExpanded = expandedModuleIdx === mIdx;
                  return (
                    <Paper
                      key={mIdx}
                      elevation={0}
                      sx={{
                        borderRadius: '14px',
                        border: `1px solid ${borderColor}`,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        onClick={() => setExpandedModuleIdx(isExpanded ? null : mIdx)}
                        sx={{
                          p: 1.75,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: '#F8FAFC',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: '#F1F5F9' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                          <LayersRoundedIcon sx={{ fontSize: 20, color: '#0B1F3A' }} />
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0F172A' }}>
                            {mod.title}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={`${mod.lessons.length} lessons`}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              bgcolor: '#F1F5F9',
                              color: '#475569',
                            }}
                          />
                          {isExpanded ? <ExpandLessRoundedIcon sx={{ color: '#64748B' }} /> : <ExpandMoreRoundedIcon sx={{ color: '#64748B' }} />}
                        </Box>
                      </Box>

                      <Collapse in={isExpanded}>
                        <Divider />
                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.25, bgcolor: '#FAFAFA' }}>
                          {mod.lessons.map((lesson, lIdx) => (
                            <Box
                              key={lIdx}
                              sx={{
                                p: 1.5,
                                borderRadius: '10px',
                                bgcolor: '#FFFFFF',
                                border: `1px solid ${borderColor}`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 2,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Typography sx={{ color: '#94A3B8', fontWeight: 700, fontSize: '0.78rem', minWidth: 20 }}>
                                  {mIdx + 1}.{lIdx + 1}
                                </Typography>
                                <Box>
                                  <Typography sx={{ fontWeight: 600, color: '#0F172A', fontSize: '0.86rem' }}>
                                    {lesson.title}
                                  </Typography>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 0.25, flexWrap: 'wrap' }}>
                                    {lesson.importantNotes && lesson.importantNotes.length > 0 && (
                                      <Chip
                                        icon={<FormatListBulletedRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                        label={`${lesson.importantNotes.length} notes`}
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600, bgcolor: '#F8FAFC' }}
                                      />
                                    )}
                                    {lesson.quizMCQ && (
                                      <Chip
                                        icon={<QuizRoundedIcon sx={{ fontSize: '13px !important', color: '#7C3AED !important' }} />}
                                        label="MCQ Quiz"
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600, bgcolor: '#F5F3FF', color: '#7C3AED' }}
                                      />
                                    )}
                                    {lesson.codingProblem && (
                                      <Chip
                                        icon={<CodeRoundedIcon sx={{ fontSize: '13px !important', color: '#EA580C !important' }} />}
                                        label="Coding Lab"
                                        size="small"
                                        sx={{ height: 18, fontSize: '0.66rem', fontWeight: 600, bgcolor: '#FFF7ED', color: '#EA580C' }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                                {lesson.durationMinutes || 15} min
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      {/* Footer Actions */}
      <DialogActions
        sx={{
          p: { xs: 2, sm: 2.5 },
          px: { xs: 2.5, sm: 3 },
          borderTop: `1px solid ${borderColor}`,
          bgcolor: '#FAFAFA',
          justifyContent: 'space-between',
        }}
      >
        <Button onClick={handleClose} disabled={isSubmitting} sx={{ color: '#64748B', textTransform: 'none', fontWeight: 600 }}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="contained"
            disabled={!parseResult?.success || isSubmitting || (isCreatingNewCourse && !newCourseTitle.trim())}
            onClick={handleCommitImport}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
              ) : (
                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              bgcolor: isCreatingNewCourse ? '#0B1F3A' : importMode === 'replace' ? '#DC2626' : '#0B1F3A',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.88rem',
              px: 3,
              py: 0.85,
              '&:hover': {
                bgcolor: isCreatingNewCourse ? '#17366E' : importMode === 'replace' ? '#B91C1C' : '#17366E',
              },
            }}
          >
            {isSubmitting
              ? isCreatingNewCourse
                ? 'Creating Course & Curriculum...'
                : 'Importing Curriculum...'
              : isCreatingNewCourse
              ? `Create & Import Course (${parseResult?.stats.totalModules || 0} Modules)`
              : importMode === 'replace'
              ? `Replace & Import ${parseResult?.stats.totalModules || 0} Modules`
              : `Append ${parseResult?.stats.totalModules || 0} Modules`}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
