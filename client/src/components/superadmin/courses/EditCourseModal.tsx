'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CollectionsRoundedIcon from '@mui/icons-material/CollectionsRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { apiService } from '@/lib/api-service';
import { uploadFileToAzureBlob } from '@/lib/storage';
import { useToast } from '@/context/ToastContext';
import { CURATED_COURSE_COVERS } from './CreateCourseModal';
import type { CourseDirectoryEntity, CourseCategory, CourseLevel } from '@/types/course';

interface EditCourseModalProps {
  open: boolean;
  onClose: () => void;
  course: CourseDirectoryEntity;
  onUpdated?: (updatedCourse: any) => void;
}

interface InstitutionOption {
  id: string;
  name: string;
  code?: string;
}

export default function EditCourseModal({
  open,
  onClose,
  course,
  onUpdated,
}: EditCourseModalProps) {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<CourseCategory>('Computer Science & DSA');
  const [level, setLevel] = useState<CourseLevel>('Intermediate');
  const [status, setStatus] = useState<'Published' | 'Draft'>('Published');
  const [durationHours, setDurationHours] = useState<number>(40);
  const [description, setDescription] = useState('');

  // Cover Image States
  const [coverImage, setCoverImage] = useState<string>('');
  const [coverSelectionMode, setCoverSelectionMode] = useState<'upload' | 'preset' | 'url'>('preset');
  const [presetCovers] = useState(CURATED_COURSE_COVERS);
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Institution state
  const [institutions, setInstitutions] = useState<InstitutionOption[]>([]);
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string>('none');

  // Tags State
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);

  // Load institutions on modal open
  useEffect(() => {
    if (!open) return;
    async function loadInstitutions() {
      try {
        const res = await apiService.getColleges({ limit: 100 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        setInstitutions(
          items.map((i: any) => ({
            id: i.id,
            name: i.name,
            code: i.code,
          }))
        );
      } catch (err) {
        console.warn('Could not load institutions list:', err);
      }
    }
    loadInstitutions();
  }, [open]);

  // Prepopulate form state whenever course or open changes
  useEffect(() => {
    if (course && open) {
      setTitle(course.title || '');
      setCode(course.code || '');
      setSlug(course.slug || '');
      setCategory((course.category as CourseCategory) || 'Computer Science & DSA');
      setLevel((course.level as CourseLevel) || 'Intermediate');
      setStatus(course.status === 'Published' || (course.status as string) === 'PUBLISHED' ? 'Published' : 'Draft');
      setDurationHours(course.durationHours || 40);
      setDescription(course.description || '');
      setCoverImage(course.thumbnailUrl || '');
      setTags(Array.isArray(course.tags) ? [...course.tags] : []);
      setSelectedInstitutionId((course as any).institutionId || (course as any).institution?.id || 'none');
      setCoverSelectionMode(
        course.thumbnailUrl?.startsWith('http') && !course.thumbnailUrl.includes('blob.core.windows.net')
          ? 'url'
          : course.thumbnailUrl?.includes('blob.core.windows.net')
          ? 'upload'
          : 'preset'
      );
    }
  }, [course, open]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPEG, WebP, or SVG).', 'Invalid File Format');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('File size exceeds 8MB. Please upload a smaller image.', 'File Size Exceeded');
      return;
    }

    setIsUploadingCover(true);
    setUploadProgress(15);
    try {
      const res = await uploadFileToAzureBlob(file, {
        folder: 'courses',
        onProgress: (progress: number) => {
          setUploadProgress(Math.min(95, Math.max(15, progress)));
        },
      });
      setCoverImage(res.blobUrl);
      toast.success('Cover image uploaded successfully to cloud storage!', 'Upload Succeeded');
    } catch (err: any) {
      console.error('Cloud storage upload error:', err);
      toast.error(err?.message || 'Failed to upload cover image.', 'Upload Failed');
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      toast.warning('Please enter a course title and course code.', 'Validation');
      return;
    }

    setIsSaving(true);
    try {
      const targetInstitutionId = selectedInstitutionId !== 'none' ? selectedInstitutionId : null;
      const payload: any = {
        title: title.trim(),
        code: code.trim().toUpperCase(),
        slug: slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        category,
        level,
        thumbnailUrl: coverImage.trim() || null,
        durationWeeks: Math.max(1, Math.round(Number(durationHours) / 4)) || 8,
        description: description.trim() || null,
        tags,
        status: status === 'Published' ? 'PUBLISHED' : 'DRAFT',
        institutionId: targetInstitutionId,
      };

      await apiService.updateCourse(course.id, payload);

      toast.success(`Course "${title}" updated successfully!`, 'Course Updated');
      if (onUpdated) {
        onUpdated({
          ...course,
          ...payload,
          id: course.id,
          durationHours: Number(durationHours) || 40,
          status,
        });
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update course details.', 'Update Failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            p: { xs: 2.5, sm: 3.5 },
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.25)',
          },
        },
      }}
    >
      {/* Modal Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              bgcolor: '#FAF5FF',
              color: '#0B1F3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <EditRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.2rem', lineHeight: 1.2 }}>
              Edit Course Details
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: '0.82rem', mt: 0.2 }}>
              Update title, code, domain category, cover image, and metadata
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8', '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: '#F1F5F9', mb: 3 }} />

      <form onSubmit={handleSave}>
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Section 1: Core Information */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Course Title <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Advanced Data Structures & Algorithms"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <MenuBookRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Course Code <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <TextField
                fullWidth
                size="small"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS-301"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                  },
                }}
              />
            </Box>
          </Box>

          {/* Section 2: Slug & Category */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                URL Slug
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="e.g. advanced-dsa-cpp"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Category
              </Typography>
              <Select
                fullWidth
                size="small"
                value={category}
                onChange={(e) => setCategory(e.target.value as CourseCategory)}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                <MenuItem value="Computer Science & DSA">Computer Science & DSA</MenuItem>
                <MenuItem value="System Design & Architecture">System Design & Architecture</MenuItem>
                <MenuItem value="Web & Full-Stack Development">Web & Full-Stack Development</MenuItem>
                <MenuItem value="AI, ML & Data Science">AI, ML & Data Science</MenuItem>
                <MenuItem value="Competitive Programming">Competitive Programming</MenuItem>
                <MenuItem value="UI/UX & Product Design">UI/UX & Product Design</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Section 3: Skill Level, Duration, Status & Institution */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Skill Level
              </Typography>
              <Select
                fullWidth
                size="small"
                value={level}
                onChange={(e) => setLevel(e.target.value as CourseLevel)}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                }}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Estimated Duration
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={durationHours}
                onChange={(e) => setDurationHours(Math.max(1, Number(e.target.value)))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeRoundedIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">Hours</InputAdornment>,
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#F8FAFC',
                    fontSize: '0.88rem',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Status
              </Typography>
              <Select
                fullWidth
                size="small"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Published' | 'Draft')}
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: status === 'Published' ? '#16A34A' : '#D97706',
                }}
              >
                <MenuItem value="Published" sx={{ color: '#16A34A', fontWeight: 700 }}>
                  Published (Live)
                </MenuItem>
                <MenuItem value="Draft" sx={{ color: '#D97706', fontWeight: 700 }}>
                  Draft (Private)
                </MenuItem>
              </Select>
            </Box>
          </Box>

          {/* Section 4: Institution Assignment */}
          {institutions.length > 0 && (
            <Box>
              <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
                Institution / College
              </Typography>
              <Select
                fullWidth
                size="small"
                value={selectedInstitutionId}
                onChange={(e) => setSelectedInstitutionId(e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <SchoolRoundedIcon sx={{ color: '#94A3B8', fontSize: 18, mr: 0.5 }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                }}
              >
                <MenuItem value="none">Platform Global (All Students)</MenuItem>
                {institutions.map((inst) => (
                  <MenuItem key={inst.id} value={inst.id}>
                    {inst.name} {inst.code ? `(${inst.code})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* Section 5: Cover Image / Thumbnail */}
          <Box sx={{ border: '1px solid #E2E8F0', borderRadius: '16px', p: 2.5, bgcolor: '#F8FAFC' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ImageRoundedIcon sx={{ color: '#0B1F3A', fontSize: 20 }} />
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  Course Cover Thumbnail
                </Typography>
              </Box>

              {/* Mode Toggle Buttons */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={coverSelectionMode === 'preset' ? 'contained' : 'outlined'}
                  onClick={() => setCoverSelectionMode('preset')}
                  startIcon={<CollectionsRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.4,
                    boxShadow: 'none',
                  }}
                >
                  Curated Presets
                </Button>
                <Button
                  size="small"
                  variant={coverSelectionMode === 'upload' ? 'contained' : 'outlined'}
                  onClick={() => setCoverSelectionMode('upload')}
                  startIcon={<CloudUploadRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.4,
                    boxShadow: 'none',
                  }}
                >
                  Cloud Upload
                </Button>
                <Button
                  size="small"
                  variant={coverSelectionMode === 'url' ? 'contained' : 'outlined'}
                  onClick={() => setCoverSelectionMode('url')}
                  startIcon={<LinkRoundedIcon sx={{ fontSize: 15 }} />}
                  sx={{
                    textTransform: 'none',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    px: 1.5,
                    py: 0.4,
                    boxShadow: 'none',
                  }}
                >
                  Image URL
                </Button>
              </Box>
            </Box>

            {/* Presets Grid */}
            {coverSelectionMode === 'preset' && (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                {presetCovers.map((preset, idx) => {
                  const isSelected = coverImage === preset.url;
                  return (
                    <Box
                      key={`preset-${idx}`}
                      onClick={() => setCoverImage(preset.url)}
                      sx={{
                        position: 'relative',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: 72,
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #0B1F3A' : '1px solid #E2E8F0',
                        boxShadow: isSelected ? '0 4px 12px rgba(91, 45, 144, 0.3)' : 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': { transform: 'scale(1.02)' },
                      }}
                    >
                      <Box
                        component="img"
                        src={preset.url}
                        alt={preset.label}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: isSelected ? 'rgba(91, 45, 144, 0.3)' : 'rgba(0,0,0,0.35)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          p: 0.75,
                        }}
                      >
                        <Typography sx={{ color: '#FFFFFF', fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.1 }}>
                          {preset.label}
                        </Typography>
                      </Box>
                      {isSelected && (
                        <Box sx={{ position: 'absolute', top: 4, right: 4, color: '#FFFFFF' }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Cloud Upload */}
            {coverSelectionMode === 'upload' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp, image/svg+xml"
                  style={{ display: 'none' }}
                />
                <Box
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    border: '2px dashed #E9D5FF',
                    borderRadius: '14px',
                    p: 3,
                    textAlign: 'center',
                    bgcolor: '#FAF5FF',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: '#E9D5FF', borderColor: '#5B2D90' },
                  }}
                >
                  {isUploadingCover ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={28} sx={{ color: '#0B1F3A' }} />
                      <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F264F' }}>
                        Uploading cover to Azure Blob Storage...
                      </Typography>
                      <Box sx={{ width: '60%', mt: 1 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: '4px' }} />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
                      <CloudUploadRoundedIcon sx={{ fontSize: 32, color: '#0B1F3A' }} />
                      <Typography sx={{ fontSize: '0.86rem', fontWeight: 700, color: '#0F172A' }}>
                        Click to browse or drop course cover image
                      </Typography>
                      <Typography sx={{ fontSize: '0.74rem', color: '#64748B' }}>
                        Supports PNG, JPG, WebP up to 8MB
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Direct URL Input */}
            {coverSelectionMode === 'url' && (
              <TextField
                fullWidth
                size="small"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://example.com/cover.png"
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
                    bgcolor: '#FFFFFF',
                    fontSize: '0.86rem',
                  },
                }}
              />
            )}

            {/* Live Selected Cover Preview */}
            {coverImage && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, pt: 1.5, borderTop: '1px solid #E2E8F0' }}>
                <Box
                  component="img"
                  src={coverImage}
                  alt="Cover Preview"
                  sx={{
                    width: 60,
                    height: 40,
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #CBD5E1',
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = '/images/courses/dsa.jpg';
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Active Thumbnail Selected
                  </Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {coverImage}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={() => setCoverImage('')} sx={{ color: '#EF4444' }}>
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Section 6: Description */}
          <Box>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
              Description & Overview
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a comprehensive summary of what this course offers..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                      <DescriptionRoundedIcon sx={{ color: '#94A3B8', fontSize: 19 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                },
              }}
            />
          </Box>

          {/* Section 7: Tags */}
          <Box>
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700, color: '#1E293B', mb: 0.8 }}>
              Search & Topic Tags
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag name and press Enter (e.g. Dynamic Programming, Trees)..."
              slotProps={{
                input: {
                  endAdornment: (
                    <Button
                      size="small"
                      onClick={() => {
                        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                          setTags([...tags, tagInput.trim()]);
                          setTagInput('');
                        }
                      }}
                      disabled={!tagInput.trim()}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                    >
                      Add Tag
                    </Button>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  bgcolor: '#F8FAFC',
                  fontSize: '0.88rem',
                },
              }}
            />

            {tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.25 }}>
                {tags.map((tag) => (
                  <Chip
                    key={`tag-${tag}`}
                    label={tag}
                    size="small"
                    onDelete={() => handleRemoveTag(tag)}
                    sx={{
                      bgcolor: '#FAF5FF',
                      color: '#0B1F3A',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      border: '1px solid #F3E8FF',
                      '& .MuiChip-deleteIcon': { color: '#5B2D90', '&:hover': { color: '#17366E' } },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        {/* Modal Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3.5, pt: 2.5, borderTop: '1px solid #F1F5F9' }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSaving}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              color: '#64748B',
              borderColor: '#CBD5E1',
              px: 2.5,
              py: 0.8,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
            }}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSaving || isUploadingCover || !title.trim() || !code.trim()}
            startIcon={isSaving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <CheckCircleRoundedIcon />}
            sx={{
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0B1F3A 0%, #5B2D90 100%)',
              color: '#FFFFFF',
              textTransform: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              px: 3.5,
              py: 0.8,
              boxShadow: '0 4px 14px rgba(91, 45, 144, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5B2D90 0%, #0B1F3A 100%)',
                boxShadow: '0 6px 20px rgba(91, 45, 144, 0.4)',
              },
            }}
          >
            {isSaving ? 'Saving Changes...' : 'Save Course Details'}
          </Button>
        </Box>
      </form>
    </Dialog>
  );
}
