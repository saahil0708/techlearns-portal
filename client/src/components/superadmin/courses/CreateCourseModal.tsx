'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Box,
  Typography,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';
import { apiService } from '@/lib/api-service';
import { uploadFileToAzureBlob } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';
import type { CourseLevel, CourseCategory, NewCourseData } from '@/types/course';
export type { CourseLevel, CourseCategory, NewCourseData };

export const DEFAULT_LEARNING_OUTCOMES: Record<CourseCategory, string[]> = {
  'Computer Science & DSA': [
    'Master Complexity Analysis & Asymptotic Big-O Notation',
    'Build & Traverse Advanced Tree and Graph Data Structures',
    'Solve Dynamic Programming & Greedy Algorithmic Challenges',
    'Implement Production-Grade Sorting and Search Algorithms',
  ],
  'System Design & Architecture': [
    'Architect Distributed Microservices & High-Throughput APIs',
    'Implement Caching, Message Queues & Load Balancing Strategies',
    'Design Fault-Tolerant, Highly Available Database Architectures',
    'Handle Data Sharding, Replication & Concurrency Bottlenecks',
  ],
  'Web & Full-Stack Development': [
    'Build End-to-End Modern Full-Stack Web Applications',
    'Implement Robust Authentication, RBAC & Secure REST/GraphQL APIs',
    'Master Server-Side Rendering (SSR) & React Server Components',
    'Deploy Scalable Cloud Deployments with CI/CD Pipelines',
  ],
  'Competitive Programming': [
    'Master Fast I/O, Bit Manipulation & Number Theory',
    'Implement Range Queries with Segment Trees & Fenwick Trees',
    'Solve Hard Contest Problems with String Matching & Hashing',
    'Optimize Solutions for Strict Sub-Second Time Limits',
  ],
  'AI, ML & Data Science': [
    'Train and Evaluate Machine Learning & Deep Learning Models',
    'Build Feature Engineering & Data Preprocessing Pipelines',
    'Deploy Large Language Model (LLM) Applications & Embeddings',
    'Implement Supervised, Unsupervised & Reinforcement Learning',
  ],
  'UI/UX & Product Design': [
    'Design High-Fidelity Interactive Prototypes & Design Systems',
    'Master Responsive Layouts, Typography & Accessibility Standards',
    'Conduct User Research, Wireframing & Usability Testing',
    'Bridge Design-to-Code Workflow with Modern Component Libraries',
  ],
};

export const CURATED_COURSE_COVERS = [
  {
    url: '/images/courses/dsa.jpg',
    label: 'Data Structures & Algorithms',
    category: 'Computer Science & DSA',
  },
  {
    url: '/images/courses/system.jpg',
    label: 'System Design & Arch',
    category: 'System Design & Architecture',
  },
  {
    url: '/images/courses/web.jpg',
    label: 'Web & Full-Stack Dev',
    category: 'Web & Full-Stack Development',
  },
  {
    url: '/images/courses/ai.jpg',
    label: 'AI & Machine Learning',
    category: 'AI, ML & Data Science',
  },
  {
    url: '/images/courses/cp.jpg',
    label: 'Competitive Programming',
    category: 'Competitive Programming',
  },
  {
    url: '/images/courses/uiux.jpg',
    label: 'UI/UX & Product Design',
    category: 'UI/UX & Product Design',
  },
  {
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
    label: 'Algorithms & Code (Photo)',
    category: 'Computer Science & DSA',
  },
  {
    url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    label: 'Python & Backend (Photo)',
    category: 'Web & Full-Stack Development',
  },
];

interface CreateCourseModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: NewCourseData & { institutionId?: string }) => void;
}

interface InstitutionOption {
  id: string;
  name: string;
  code?: string;
}

export default function CreateCourseModal({ open, onClose, onCreate }: CreateCourseModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Computer Science & DSA');
  const [level, setLevel] = useState<CourseLevel>('Intermediate');

  // Cover Image States
  const [coverImage, setCoverImage] = useState<string>('');
  const [coverSelectionMode, setCoverSelectionMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [presetCovers, setPresetCovers] = useState(CURATED_COURSE_COVERS);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePresetError = (index: number, failedUrl: string) => {
    const fallback = '/images/courses/dsa.jpg';
    setPresetCovers((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], url: fallback };
      }
      return updated;
    });
    setCoverImage((current) => (current === failedUrl ? fallback : current));
  };

  // Institution & Trainer states
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('none');
  const [selectedTrainer, setSelectedTrainer] = useState<string>('assign_later');

  const [durationHours, setDurationHours] = useState<number>(36);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Algorithms', 'Data Structures', 'Python']);

  // Learning Outcomes State
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(
    DEFAULT_LEARNING_OUTCOMES['Computer Science & DSA']
  );
  const [newOutcomeInput, setNewOutcomeInput] = useState<string>('');

  const borderColor = '#E2E8F0';

  // Load live registered institutions from the server
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    async function loadRegisteredInstitutions() {
      try {
        const instRes = await apiService.getInstitutions({ limit: 100 });
        const liveInstItems = instRes?.items || (Array.isArray(instRes) ? instRes : []);
        if (isMounted) {
          const mappedInst: InstitutionOption[] = liveInstItems.map((inst: any) => ({
            id: inst.id,
            name: inst.name,
            code: inst.code,
          }));
          setInstitutions(mappedInst);
          setSelectedInstitutionId((current) => {
            if (current !== 'none' && !mappedInst.some((inst) => inst.id === current)) {
              return 'none';
            }
            return current;
          });
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to load registered institutions from server.', 'Institutions Error');
      }
    }

    loadRegisteredInstitutions();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Cover image must be under 10MB.', 'File Too Large');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP, SVG).', 'Invalid File');
      return;
    }

    setIsUploadingCover(true);
    setUploadProgress(15);

    try {
      const res = await uploadFileToAzureBlob(file, {
        folder: 'courses',
        onProgress: (pct) => setUploadProgress(pct),
      });
      setCoverImage(res.blobUrl);
      toast.success('Cover image uploaded successfully to cloud storage!', 'Upload Succeeded');
    } catch (err: any) {
      console.error('Cloud storage upload encountered an error:', err);
      toast.error(err?.message || 'Failed to upload cover image to cloud storage.', 'Upload Failed');
    } finally {
      setIsUploadingCover(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim();
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddOutcome = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    const clean = newOutcomeInput.trim();
    if (clean) {
      if (!learningOutcomes.includes(clean)) {
        setLearningOutcomes([...learningOutcomes, clean]);
      }
      setNewOutcomeInput('');
    }
  };

  const handleRemoveOutcome = (index: number) => {
    setLearningOutcomes(learningOutcomes.filter((_, idx) => idx !== index));
  };

  const handleResetOutcomes = () => {
    const defaults = DEFAULT_LEARNING_OUTCOMES[category] || DEFAULT_LEARNING_OUTCOMES['Computer Science & DSA'];
    setLearningOutcomes([...defaults]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    // Resolve Trainer / Instructor
    let resolvedInstructorName = 'Unassigned';
    let resolvedInstructorTitle = 'Course Staff';
    if (selectedTrainer === 'course_staff') {
      resolvedInstructorName = 'Course Staff';
      resolvedInstructorTitle = 'Teaching Faculty';
    } else if (selectedTrainer === 'platform_admin') {
      resolvedInstructorName = 'Platform Admin';
      resolvedInstructorTitle = 'Administrator';
    }

    // Resolve Institution
    let resolvedInstitutionName = 'Global Campus';
    let resolvedInstitutionId: string | undefined = undefined;
    if (selectedInstitutionId !== 'none') {
      const matchOrg = institutions.find((inst) => inst.id === selectedInstitutionId);
      if (matchOrg) {
        resolvedInstitutionName = matchOrg.name;
        resolvedInstitutionId = matchOrg.id;
      }
    }

    onCreate({
      title: title.trim(),
      code: code.trim().toUpperCase(),
      slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      category,
      level,
      instructorName: resolvedInstructorName,
      instructorTitle: resolvedInstructorTitle,
      institutionName: resolvedInstitutionName,
      institutionId: resolvedInstitutionId,
      durationHours: Number(durationHours) || 36,
      modulesCount: 0,
      lessonsCount: 0,
      description: description.trim() || 'Comprehensive mastery curriculum with interactive coding challenges.',
      status,
      tags,
      learningOutcomes: learningOutcomes.filter((item) => Boolean(item.trim())),
      thumbnailUrl: coverImage.trim() || undefined,
    });

    // Reset Form
    setTitle('');
    setCode('');
    setSlug('');
    setSelectedTrainer('assign_later');
    setSelectedInstitutionId('none');
    setDescription('');
    setCoverImage('');
    setCoverSelectionMode('upload');
    setLearningOutcomes(DEFAULT_LEARNING_OUTCOMES['Computer Science & DSA']);
    setNewOutcomeInput('');
    onClose();
  };

  const menuProps = {
    disableAutoFocusItem: true,
    autoFocus: false,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    slotProps: {
      paper: {
        sx: {
          maxHeight: 280,
          borderRadius: '12px',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16)',
          border: '1px solid #E2E8F0',
          mt: 0.5,
        },
      },
      list: {
        autoFocusItem: false,
        autoFocus: false,
      },
    },
  } as any;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            maxWidth: 860,
            width: '100%',
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: `1px solid ${borderColor}`,
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            overflow: 'hidden',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <Box
          sx={{
            px: 4,
            py: 3,
            bgcolor: '#FAFAFC',
            borderBottom: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '16px',
                bgcolor: '#FAF5FF',
                border: '1px solid #FAF5FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B1F3A',
                boxShadow: '0 2px 8px rgba(91, 45, 144, 0.12)',
              }}
            >
              <MenuBookRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.25rem', lineHeight: 1.2 }}>
                Create New Course
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', mt: 0.35, fontSize: '0.84rem' }}>
                Set up course details and publish into the catalog. You will author unit modules & coding labs in Curriculum Studio.
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              color: '#94A3B8',
              borderRadius: '9999px',
              p: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              '&:hover': { bgcolor: '#F1F5F9', color: '#0F172A' },
            }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Content Body */}
        <DialogContent
          sx={{
            px: 4,
            py: 3.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            maxHeight: 'calc(85vh - 160px)',
            overflowY: 'auto',
          }}
        >
          {/* Section 1: Course Identity */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Course Identity & Nomenclature
              </Typography>
            </Box>

            {/* Course Title */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                COURSE TITLE <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                placeholder="e.g. Advanced Data Structures & Algorithm Design in Python"
                value={title}
                onChange={handleTitleChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MenuBookRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: '#0F172A',
                    '& input': {
                      color: '#0F172A',
                      fontWeight: 500,
                    },
                    '& input::placeholder': {
                      color: '#94A3B8',
                      opacity: 1,
                    },
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused': { bgcolor: '#FFFFFF' },
                    '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                  },
                }}
              />
            </Box>

            {/* 2-col: Code & Slug */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  COURSE CODE (UNIQUE) <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. CS-301"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <CodeRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      '& input': {
                        color: '#0F172A',
                        fontWeight: 500,
                      },
                      '& input::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused': { bgcolor: '#FFFFFF' },
                      '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  URL SLUG <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  placeholder="e.g. advanced-dsa-301"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      '& input': {
                        color: '#0F172A',
                        fontWeight: 500,
                      },
                      '& input::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused': { bgcolor: '#FFFFFF' },
                      '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* 2-col: Category & Level */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.2fr 0.8fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  CATEGORY / DOMAIN <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as CourseCategory;
                    setCategory(newCat);
                    const rec = DEFAULT_LEARNING_OUTCOMES[newCat];
                    if (rec && (learningOutcomes.length === 0 || learningOutcomes.every((o) => Object.values(DEFAULT_LEARNING_OUTCOMES).some((arr) => arr.includes(o))))) {
                      setLearningOutcomes([...rec]);
                    }
                  }}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  }}
                >
                  <MenuItem value="Computer Science & DSA">Computer Science & DSA</MenuItem>
                  <MenuItem value="System Design & Architecture">System Design & Architecture</MenuItem>
                  <MenuItem value="Web & Full-Stack Development">Web & Full-Stack Development</MenuItem>
                  <MenuItem value="Competitive Programming">Competitive Programming</MenuItem>
                  <MenuItem value="AI, ML & Data Science">AI, ML & Data Science</MenuItem>
                  <MenuItem value="UI/UX & Product Design">UI/UX & Product Design</MenuItem>
                </Select>
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  DIFFICULTY LEVEL <span style={{ color: '#EF4444' }}>*</span>
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={level}
                  onChange={(e) => setLevel(e.target.value as CourseLevel)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  }}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          {/* Section: Course Cover & Visual Artwork */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Course Cover Artwork
                </Typography>
              </Box>

              {/* Cover Mode Selector */}
              <Box sx={{ display: 'flex', gap: 0.5, bgcolor: '#F1F5F9', p: 0.4, borderRadius: '10px' }}>
                <Button
                  size="small"
                  type="button"
                  onClick={() => setCoverSelectionMode('upload')}
                  startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.4,
                    minHeight: 28,
                    ...(coverSelectionMode === 'upload'
                      ? { bgcolor: '#FFFFFF', color: '#0B1F3A', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                      : { color: '#64748B', bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }),
                  }}
                >
                  Upload Image
                </Button>
                <Button
                  size="small"
                  type="button"
                  onClick={() => setCoverSelectionMode('preset')}
                  startIcon={<CollectionsRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.4,
                    minHeight: 28,
                    ...(coverSelectionMode === 'preset'
                      ? { bgcolor: '#FFFFFF', color: '#0B1F3A', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                      : { color: '#64748B', bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }),
                  }}
                >
                  Dummy Presets
                </Button>
                <Button
                  size="small"
                  type="button"
                  onClick={() => setCoverSelectionMode('url')}
                  startIcon={<LinkRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.4,
                    minHeight: 28,
                    ...(coverSelectionMode === 'url'
                      ? { bgcolor: '#FFFFFF', color: '#0B1F3A', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                      : { color: '#64748B', bgcolor: 'transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.5)' } }),
                  }}
                >
                  Custom URL
                </Button>
              </Box>
            </Box>

            {/* Mode 1: Device File Upload */}
            {coverSelectionMode === 'upload' && (
              <Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleCoverUpload}
                />
                <Box
                  role="button"
                  tabIndex={isUploadingCover ? -1 : 0}
                  onClick={() => !isUploadingCover && fileInputRef.current?.click()}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isUploadingCover) {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  sx={{
                    border: '2px dashed #CBD5E1',
                    borderRadius: '14px',
                    p: 2.5,
                    textAlign: 'center',
                    bgcolor: '#F8FAFC',
                    cursor: isUploadingCover ? 'wait' : 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    '&:hover, &:focus-visible': {
                      borderColor: '#0B1F3A',
                      bgcolor: '#F0F7FF',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  {isUploadingCover ? (
                    <>
                      <CircularProgress size={28} sx={{ color: '#0B1F3A' }} />
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0B1F3A' }}>
                        Uploading course cover picture...
                      </Typography>
                      {uploadProgress > 0 && (
                        <Box sx={{ width: '60%', mt: 0.5 }}>
                          <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0B1F3A' }}>
                        <CloudUploadRoundedIcon sx={{ fontSize: 24 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: '0.88rem', fontWeight: 700, color: '#0F172A' }}>
                          Click to browse or drop cover image
                        </Typography>
                        <Typography sx={{ fontSize: '0.75rem', color: '#64748B', mt: 0.25 }}>
                          High-res PNG, JPG, WebP or SVG (Recommended 16:9 ratio, max 10MB)
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
              </Box>
            )}

            {/* Mode 2: Curated Dummy Presets */}
            {coverSelectionMode === 'preset' && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                {presetCovers.map((preset, i) => {
                  const isSelected = coverImage === preset.url;
                  return (
                    <Box
                      key={i}
                      component="button"
                      type="button"
                      onClick={() => setCoverImage(preset.url)}
                      sx={{
                        position: 'relative',
                        height: 78,
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: isSelected ? '2.5px solid #0B1F3A' : '1px solid #CBD5E1',
                        p: 0,
                        background: 'none',
                        textAlign: 'left',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        boxShadow: isSelected ? '0 4px 12px rgba(91, 45, 144, 0.25)' : 'none',
                        '&:hover': {
                          borderColor: '#0B1F3A',
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={preset.url}
                        alt={preset.label}
                        onError={(e: any) => {
                          e.currentTarget.src = '/images/courses/dsa.jpg';
                          handlePresetError(i, preset.url);
                        }}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 100%)',
                          p: 0.75,
                          pt: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {preset.label}
                        </Typography>
                        {isSelected && (
                          <CheckCircleRoundedIcon sx={{ fontSize: 14, color: '#A855F7', flexShrink: 0 }} />
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Mode 3: Direct URL */}
            {coverSelectionMode === 'url' && (
              <TextField
                size="small"
                fullWidth
                placeholder="https://images.unsplash.com/photo-..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    '& input': { color: '#0F172A' },
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused': { bgcolor: '#FFFFFF' },
                    '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                  },
                }}
              />
            )}

            {/* Live Cover Preview */}
            {coverImage && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Box
                  component="img"
                  src={coverImage}
                  alt="Course Cover Preview"
                  onError={(e: any) => {
                    const fallback = '/images/courses/dsa.jpg';
                    e.currentTarget.src = fallback;
                    setCoverImage(fallback);
                  }}
                  sx={{
                    width: 100,
                    height: 56,
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> Active Cover Selected
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', mt: 0.25 }}>
                    {coverImage}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => setCoverImage('')}
                  title="Remove cover"
                  sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          {/* Section 2: Instruction & Campus Delivery */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SchoolRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Instruction & Academic Affiliation
              </Typography>
            </Box>

            {/* 2-col: Trainer & Institution Dropdowns */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              {/* Dropdown 1: Trainer / Lead Instructor */}
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  TRAINER / LEAD INSTRUCTOR
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={selectedTrainer}
                  onChange={(e) => setSelectedTrainer(e.target.value)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  }}
                >
                  <MenuItem value="assign_later">Assign Later (Unassigned)</MenuItem>
                  <MenuItem value="course_staff">Course Staff</MenuItem>
                  <MenuItem value="platform_admin">Platform Admin</MenuItem>
                </Select>
              </Box>

              {/* Dropdown 2: Registered Institution */}
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  INSTITUTION / DEPARTMENT
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={selectedInstitutionId}
                  onChange={(e) => setSelectedInstitutionId(e.target.value)}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  }}
                >
                  <MenuItem value="none">None (Global / Platform-wide)</MenuItem>
                  {institutions.map((inst) => (
                    <MenuItem key={inst.id} value={inst.id}>
                      {inst.name} {inst.code ? `(${inst.code})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </Box>

            {/* 2-col: Duration & Initial Publishing Status */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  ESTIMATED DURATION (HOURS)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value)))}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccessTimeRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                      bgcolor: '#F8FAFC',
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      '& input': {
                        color: '#0F172A',
                        fontWeight: 500,
                      },
                      '& input::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#CBD5E1' },
                      '&.Mui-focused': { bgcolor: '#FFFFFF' },
                      '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                  PUBLISHING STATUS
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
                  MenuProps={menuProps}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    color: '#0F172A',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
                  }}
                >
                  <MenuItem value="Published">Published (Visible in Catalog)</MenuItem>
                  <MenuItem value="Draft">Draft (Authoring Mode Only)</MenuItem>
                </Select>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          {/* Section 3: Summary & Tags */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DescriptionRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
              <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Course Summary & Taxonomy Tags
              </Typography>
            </Box>

            {/* Course Summary */}
            <Box>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, mb: 0.75, display: 'block' }}>
                COURSE SUMMARY & OBJECTIVES
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Brief summary of syllabus objectives, prerequisite expectations, and hands-on coding modules..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    lineHeight: 1.5,
                    p: 1.5,
                    color: '#0F172A',
                    '& textarea': {
                      color: '#0F172A',
                      fontWeight: 500,
                    },
                    '& textarea::placeholder': {
                      color: '#94A3B8',
                      opacity: 1,
                    },
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused': { bgcolor: '#FFFFFF' },
                    '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                  },
                }}
              />
            </Box>

            {/* Tags */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                COURSE TAGS & TOPICS (Type and press Enter to add)
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '14px',
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  gap: 1,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      borderRadius: '8px',
                      bgcolor: '#FAF5FF',
                      color: '#0B1F3A',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      border: '1px solid #FAF5FF',
                      height: 28,
                      '& .MuiChip-deleteIcon': {
                        color: '#C084FC',
                        fontSize: 16,
                        '&:hover': { color: '#17366E' },
                      },
                    }}
                  />
                ))}
                <TextField
                  size="small"
                  placeholder="+ Add topic tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  sx={{
                    width: 150,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      height: 30,
                      fontSize: '0.78rem',
                      bgcolor: '#FFFFFF',
                      color: '#0F172A',
                      '& input': {
                        color: '#0F172A',
                      },
                      '& input::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                      '& fieldset': { borderColor: '#CBD5E1' },
                    },
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#F1F5F9' }} />

          {/* Section 4: What You'll Learn (Key Outcomes) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LightbulbRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A' }} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 800, color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  What You'll Learn (Key Takeaways & Points)
                </Typography>
              </Box>
              <Button
                type="button"
                size="small"
                variant="text"
                onClick={handleResetOutcomes}
                startIcon={<RestartAltRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#0B1F3A',
                  py: 0.25,
                  px: 1,
                  borderRadius: '8px',
                  '&:hover': { bgcolor: '#FAF5FF' },
                }}
              >
                Reset to Category Defaults
              </Button>
            </Box>

            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#64748B' }}>
              Define the key skills, competencies, and conceptual takeaways displayed to students on the course landing card.
            </Typography>

            {/* Input to add new bullet point */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Master Asymptotic Complexity & Algorithmic Design..."
                value={newOutcomeInput}
                onChange={(e) => setNewOutcomeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddOutcome();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused': { bgcolor: '#FFFFFF' },
                    '&.Mui-focused fieldset': { borderColor: '#0B1F3A' },
                  },
                }}
              />
              <Button
                type="button"
                variant="contained"
                onClick={() => handleAddOutcome()}
                disabled={!newOutcomeInput.trim()}
                startIcon={<AddRoundedIcon />}
                sx={{
                  bgcolor: '#0B1F3A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  px: 2.5,
                  py: 0.9,
                  whiteSpace: 'nowrap',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#17366E' },
                }}
              >
                Add Point
              </Button>
            </Box>

            {/* List of Outcomes */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                p: 1.5,
                bgcolor: '#F8FAFC',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                maxHeight: 220,
                overflowY: 'auto',
              }}
            >
              {learningOutcomes.length === 0 ? (
                <Typography sx={{ fontSize: '0.82rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                  No learning points added yet. Type a takeaway above or click "Reset to Category Defaults".
                </Typography>
              ) : (
                learningOutcomes.map((item, idx) => (
                  <Box
                    key={`outcome-${idx}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.5,
                      p: 1.25,
                      bgcolor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flex: 1, minWidth: 0 }}>
                      <CheckRoundedIcon sx={{ fontSize: 18, color: '#0B1F3A', flexShrink: 0 }} />
                      <Typography sx={{ fontSize: '0.84rem', color: '#1E293B', fontWeight: 600 }}>
                        {item}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveOutcome(idx)}
                      title="Remove point"
                      sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: '#FEE2E2' } }}
                    >
                      <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Actions */}
        <Box
          sx={{
            px: 4,
            py: 2.5,
            bgcolor: '#FAFAFC',
            borderTop: `1px solid ${borderColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            * Required fields. Curriculum starts with 0 modules ready for authoring.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              sx={{
                height: 42,
                px: 3,
                borderRadius: '9999px',
                borderColor: '#CBD5E1',
                color: '#475569',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                bgcolor: '#FFFFFF',
                '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!title.trim() || !code.trim()}
              startIcon={<AddRoundedIcon />}
              sx={{
                height: 42,
                px: 3.5,
                borderRadius: '9999px',
                bgcolor: '#0B1F3A',
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                boxShadow: '0 4px 14px rgba(91, 45, 144, 0.25)',
                '&:hover': { bgcolor: '#17366E' },
                '&.Mui-disabled': { bgcolor: '#E2E8F0', color: '#94A3B8' },
              }}
            >
              Create Course
            </Button>
          </Box>
        </Box>
      </form>
    </Dialog>
  );
}
