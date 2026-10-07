'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Avatar,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { BlogPost } from '@/types/blog';
import MarkdownViewer from '@/components/shared/MarkdownViewer';

interface BlogReaderModalProps {
  selectedBlog: BlogPost | null;
  onClose: () => void;
  onToggleClap: (id: string, e?: React.MouseEvent) => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onShare: (post: BlogPost, e?: React.MouseEvent) => void;
  commentText: string;
  onCommentChange: (text: string) => void;
  onAddComment: () => void;
  isAddingComment?: boolean;
}

export default function BlogReaderModal({
  selectedBlog,
  onClose,
  onToggleClap,
  onToggleBookmark,
  onShare,
  commentText,
  onCommentChange,
  onAddComment,
  isAddingComment = false,
}: BlogReaderModalProps) {
  if (!selectedBlog) return null;

  return (
    <Dialog
      open={Boolean(selectedBlog)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: '24px',
            maxHeight: '92vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header / Cover Banner with Image */}
      <Box
        sx={{
          height: { xs: 200, md: 280 },
          position: 'relative',
          overflow: 'hidden',
          color: '#FFFFFF',
        }}
      >
        <Box
          component="img"
          src={selectedBlog.coverImage}
          alt={selectedBlog.title}
          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15,23,42,0.6) 100%)',
          }}
        />

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            color: '#FFFFFF',
            bgcolor: 'rgba(0,0,0,0.4)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.65)' },
          }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <Box sx={{ position: 'absolute', bottom: 20, left: { xs: 20, md: 32 }, right: { xs: 20, md: 32 } }}>
          <Chip
            label={selectedBlog.category}
            size="small"
            sx={{
              bgcolor: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '0.74rem',
              mb: 1,
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.25rem', md: '1.55rem' },
              lineHeight: 1.3,
              mb: 1,
            }}
          >
            {selectedBlog.title}
          </Typography>

          {/* Author Strip */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              src={selectedBlog.author.avatarImg}
              sx={{ width: 34, height: 34, bgcolor: selectedBlog.author.avatarBg, fontWeight: 700 }}
            >
              {selectedBlog.author.name[0]}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.86rem', color: '#FFFFFF' }}>
                {selectedBlog.author.name}
              </Typography>
              <Typography sx={{ fontSize: '0.74rem', color: '#CBD5E1' }}>
                {selectedBlog.author.role} • {selectedBlog.author.college} • {selectedBlog.readTime}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Article Body Content */}
      <DialogContent
        sx={{
          p: { xs: 3, md: 4 },
          overflowY: 'auto',
          fontSize: '0.96rem',
          color: '#1E293B',
          lineHeight: 1.7,
        }}
      >
        {/* Formatted Markdown Display */}
        <Box sx={{ mt: 1 }}>
          <MarkdownViewer content={selectedBlog.content} />
        </Box>

        {/* Tags inside reader */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', my: 3, pt: 2, borderTop: '1px solid #E2E8F0' }}>
          {selectedBlog.tags.map((tag) => (
            <Chip
              key={tag}
              label={`#${tag}`}
              sx={{ bgcolor: '#F1F5F9', color: '#334155', fontWeight: 600, fontSize: '0.78rem' }}
            />
          ))}
        </Box>

        {/* Social Reaction Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bgcolor: '#F8FAFC',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant={selectedBlog.hasLiked ? 'contained' : 'outlined'}
              onClick={(e) => onToggleClap(selectedBlog.id, e)}
              startIcon={selectedBlog.hasLiked ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: selectedBlog.hasLiked ? '#EF4444' : 'transparent',
                color: selectedBlog.hasLiked ? '#FFFFFF' : '#EF4444',
                borderColor: '#FCA5A5',
                '&:hover': { bgcolor: selectedBlog.hasLiked ? '#DC2626' : '#FEF2F2' },
              }}
            >
              {selectedBlog.claps} Claps
            </Button>

            <Button
              variant="outlined"
              startIcon={<ShareRoundedIcon />}
              onClick={(e) => onShare(selectedBlog, e)}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 700,
                color: '#475569',
                borderColor: '#CBD5E1',
                '&:hover': { borderColor: '#94A3B8', bgcolor: '#F1F5F9' },
              }}
            >
              Share Article
            </Button>
          </Box>

          <IconButton
            aria-label={selectedBlog.isBookmarked ? 'Remove from bookmarks' : 'Save bookmark'}
            onClick={(e) => onToggleBookmark(selectedBlog.id, e)}
            sx={{ color: selectedBlog.isBookmarked ? '#2563EB' : '#94A3B8' }}
          >
            {selectedBlog.isBookmarked ? <BookmarkRoundedIcon /> : <BookmarkBorderRoundedIcon />}
          </IconButton>
        </Box>

        {/* Comments / Discussion Thread */}
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 800, color: '#0F172A', fontSize: '1.05rem', mb: 1.5 }}>
            Discussion & Responses ({selectedBlog.commentsCount})
          </Typography>

          {/* Comment Input */}
          <Box sx={{ display: 'flex', gap: 1.5, mb: 3 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Write a thoughtful response or ask a question..."
              value={commentText}
              onChange={(e) => onCommentChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  fontSize: '0.86rem',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={onAddComment}
              disabled={!commentText.trim() || isAddingComment}
              sx={{
                bgcolor: '#2563EB',
                borderRadius: '12px',
                px: 2.5,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              <SendRoundedIcon fontSize="small" />
            </Button>
          </Box>

          {/* Comments List */}
          {selectedBlog.comments && selectedBlog.comments.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {selectedBlog.comments.map((comm) => (
                <Box
                  key={comm.id}
                  sx={{
                    p: 2,
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: comm.avatarBg, fontSize: '0.72rem', fontWeight: 700 }}>
                        {comm.author[0]}
                      </Avatar>
                      <Typography sx={{ fontWeight: 700, fontSize: '0.82rem', color: '#0F172A' }}>
                        {comm.author}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {comm.time}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.84rem', color: '#334155', pl: 4.2 }}>
                    {comm.text}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '0.84rem', color: '#94A3B8', fontStyle: 'italic' }}>
              No responses yet. Be the first to share your thoughts!
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
