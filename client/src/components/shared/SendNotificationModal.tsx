'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { apiService } from '@/lib/api-service';
import { useToast } from '@/context/ToastContext';

interface SendNotificationModalProps {
  open: boolean;
  onClose: () => void;
  defaultInstitutionId?: string;
  defaultBatchId?: string;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { key: 'system', label: 'System Alert', color: '#2563EB', bg: '#EFF6FF' },
  { key: 'contests', label: 'Contest / Arena', color: '#CA8A04', bg: '#FEFCE8' },
  { key: 'courses', label: 'Course / Lab', color: '#0284C7', bg: '#F0F9FF' },
  { key: 'submissions', label: 'Evaluation / Test', color: '#16A34A', bg: '#F0FDF4' },
  { key: 'cel', label: 'Proof of Skill / CEL', color: '#9333EA', bg: '#FAF5FF' },
];

const PRESETS = [
  {
    title: 'Weekly Grand Arena #109 Starting Soon',
    body: 'Contest starts in 45 minutes. Ranked competitive programming sprint.',
    category: 'contests',
    actionUrl: '/contests',
  },
  {
    title: 'New Masterclass: RocksDB Storage Internals',
    body: 'Module 4 (LSM-Trees vs B-Trees) has been unlocked in Distributed Systems.',
    category: 'courses',
    actionUrl: '/courses',
  },
  {
    title: 'Important Lab Assessment Tomorrow',
    body: 'Please ensure all pre-lab tasks are committed before 09:00 AM.',
    category: 'system',
    actionUrl: '/students/projects',
  },
];

export default function SendNotificationModal({
  open,
  onClose,
  defaultInstitutionId,
  defaultBatchId,
  onSuccess,
}: SendNotificationModalProps) {
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'system' | 'contests' | 'courses' | 'submissions' | 'cel'>('system');
  const [actionUrl, setActionUrl] = useState('/students');
  const [targetRole, setTargetRole] = useState<'STUDENT' | 'FACULTY' | 'ALL'>('STUDENT');
  const [loading, setLoading] = useState(false);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setBody(preset.body);
    setCategory(preset.category as any);
    setActionUrl(preset.actionUrl);
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Please enter both title and notification body.', 'Missing Fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        category,
        actionUrl: actionUrl.trim() || '/students',
        target: {
          institutionId: defaultInstitutionId,
          batchId: defaultBatchId,
          targetRole: targetRole === 'ALL' ? undefined : targetRole,
        },
      };

      const res = await apiService.sendNotification(payload);
      const recipientCount = res?.recipientCount ?? 'all active';
      toast.success(
        `Push alert broadcasted successfully to ${recipientCount} recipients!`,
        'Notification Dispatched',
      );

      // Reset form
      setTitle('');
      setBody('');
      setActionUrl('/students');
      setTargetRole('STUDENT');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Send notification error:', err);
      toast.error(
        err?.response?.data?.message || 'Failed to dispatch notification. Please verify permissions.',
        'Dispatch Failed',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            p: 1,
            boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.25)',
            border: '1px solid #E2E8F0',
          },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
            }}
          >
            <CampaignRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', lineHeight: 1.2 }}>
              Broadcast Notification
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.74rem' }}>
              Send in-app alerts and browser web push notifications
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.25, pt: '8px !important' }}>
        {/* Quick Presets */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75, display: 'block' }}>
            Quick Templates
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {PRESETS.map((p, idx) => (
              <Chip
                key={idx}
                label={p.title.length > 28 ? p.title.slice(0, 28) + '...' : p.title}
                size="small"
                onClick={() => handleApplyPreset(p)}
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 13 }} />}
                sx={{
                  borderRadius: '8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  color: '#334155',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Title */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
            Notification Title *
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="e.g. Weekly Contest Starting in 30 Mins"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontSize: '0.86rem',
              },
            }}
          />
        </Box>

        {/* Body Message */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
            Message Content *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Write announcement details, deadline instructions, or important announcements..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontSize: '0.84rem',
              },
            }}
          />
        </Box>

        {/* Category & Target Audience Row */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
              Category
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                sx={{ borderRadius: '12px', fontSize: '0.84rem' }}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c.key} value={c.key} sx={{ fontSize: '0.82rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color }} />
                      <span>{c.label}</span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
              Target Audience
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                sx={{ borderRadius: '12px', fontSize: '0.84rem' }}
              >
                <MenuItem value="STUDENT" sx={{ fontSize: '0.82rem' }}>Students Only</MenuItem>
                <MenuItem value="FACULTY" sx={{ fontSize: '0.82rem' }}>Faculty Mentors</MenuItem>
                <MenuItem value="ALL" sx={{ fontSize: '0.82rem' }}>All Campus Members</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Action / Target URL */}
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
            Action Target Link (Optional)
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="/problems, /courses, /contests, or /students"
            value={actionUrl}
            onChange={(e) => setActionUrl(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <LinkRoundedIcon sx={{ color: '#94A3B8', fontSize: 18, mr: 0.75 }} />,
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                fontSize: '0.84rem',
              },
            }}
          />
        </Box>

        {/* Live Preview Card */}
        {title && (
          <Box
            sx={{
              p: 1.5,
              borderRadius: '14px',
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 0.75, display: 'block' }}>
              Live Student Alert Preview
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '8px',
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  flexShrink: 0,
                }}
              >
                <NotificationsActiveRoundedIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem', lineHeight: 1.2 }}>
                  {title}
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '0.76rem', mt: 0.25, lineHeight: 1.35 }}>
                  {body || 'Announcement content will appear here...'}
                </Typography>
                <Typography sx={{ color: '#2563EB', fontSize: '0.7rem', fontWeight: 700, mt: 0.5 }}>
                  Click to open: {actionUrl || '/students'}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, borderTop: '1px solid #F1F5F9' }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600, borderRadius: '10px' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={loading || !title.trim() || !body.trim()}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon sx={{ fontSize: 16 }} />}
          sx={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.84rem',
            borderRadius: '12px',
            px: 2.5,
            py: 0.75,
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
            },
          }}
        >
          {loading ? 'Broadcasting...' : 'Send Broadcast'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
