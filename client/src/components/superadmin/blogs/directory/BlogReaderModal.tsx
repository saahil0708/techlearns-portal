'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import Link from 'next/link';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import MarkdownViewer from '@/components/shared/MarkdownViewer';
import { BlogPost, formatBlogDate } from '@/types/blog';

interface BlogReaderModalProps {
  blog: BlogPost | null;
  onClose: () => void;
  onEdit: (b: BlogPost) => void;
}

export default function BlogReaderModal({
  blog,
  onClose,
  onEdit,
}: BlogReaderModalProps) {
  if (!blog) return null;

  return (
    <Dialog
      open={Boolean(blog)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: '16px', p: 1 } } }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1.5 }}>
        <Box sx={{ flex: 1, pr: 2 }}>
          <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1.3, mb: 1 }}>
            {blog.title}
          </Typography>
          <Divider sx={{ borderColor: '#00000015', mb: 1.5 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip size="small" label={blog.category} sx={{ bgcolor: '#EFF6FF', color: '#2563EB', fontWeight: 700 }} />
            {blog.tags && blog.tags.map((tag) => (
              <Chip key={tag} size="small" label={`#${tag}`} sx={{ bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', color: '#64748B', fontWeight: 600, fontSize: '0.74rem' }} />
            ))}
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ py: 3 }}>
        {/* Cover Banner */}
        <Box
          component="img"
          src={blog.coverImage}
          alt={blog.title}
          sx={{ width: '100%', height: 240, borderRadius: '12px', objectFit: 'cover', mb: 3 }}
        />

        {/* Author Row */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: '1px solid #E2E8F0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={blog.author.avatarImg} sx={{ width: 42, height: 42, bgcolor: blog.author.avatarBg }}>
              {blog.author.name[0]}
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: '#0F172A' }}>
                {blog.author.name}
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
                {blog.author.role} • {blog.author.college}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
              {blog.readTime}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              {formatBlogDate(blog.publishedAt)}
            </Typography>
          </Box>
        </Box>

        {/* Article Content */}
        <MarkdownViewer content={blog.content} />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between', borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748B' }}>
            <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>{blog.views.toLocaleString()} Views</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#DC2626' }}>
            <FavoriteRoundedIcon sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.84rem', fontWeight: 700 }}>{blog.claps} Claps</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            component={Link}
            href={`/superadmin/blogs/${blog.id}`}
            variant="outlined"
            startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.84rem' }}
          >
            Full Page View
          </Button>
          <Button
            variant="contained"
            startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              const target = blog;
              onClose();
              onEdit(target);
            }}
            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 700, fontSize: '0.84rem', bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
          >
            Edit Article
          </Button>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600, color: '#64748B', borderColor: '#CBD5E1' }}>
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
