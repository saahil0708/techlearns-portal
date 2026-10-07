'use client';

import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Avatar,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  IconButton,
} from '@mui/material';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { BlogPost, formatBlogDate } from '@/types/blog';
import { getBlogThemeConfig } from './types';

interface BlogsDataTableProps {
  posts: BlogPost[];
  page: number;
  rowsPerPage: number;
  onOpenBlog: (post: BlogPost) => void;
  onToggleClap: (id: string, e?: React.MouseEvent) => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onShare: (post: BlogPost, e?: React.MouseEvent) => void;
}

export default function BlogsDataTable({
  posts,
  page,
  rowsPerPage,
  onOpenBlog,
  onToggleClap,
  onToggleBookmark,
  onShare,
}: BlogsDataTableProps) {
  const currentSlice = posts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <TableContainer sx={{ maxHeight: 720 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ '& th': { bgcolor: '#F8FAFC', fontWeight: 800, color: '#475569', fontSize: '0.78rem' } }}>
            <TableCell sx={{ minWidth: 260 }}>Story & Topic</TableCell>
            <TableCell sx={{ minWidth: 150 }}>Category</TableCell>
            <TableCell sx={{ minWidth: 160 }}>Author</TableCell>
            <TableCell sx={{ minWidth: 120 }}>Published</TableCell>
            <TableCell sx={{ minWidth: 100 }}>Read Time</TableCell>
            <TableCell sx={{ minWidth: 100, textAlign: 'center' }}>Claps</TableCell>
            <TableCell sx={{ minWidth: 140, textAlign: 'right' }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {currentSlice.map((post) => {
            const theme = getBlogThemeConfig(post.category);
            return (
              <TableRow
                key={post.id}
                hover
                sx={{
                  cursor: 'pointer',
                  '&:last-child td, &:last-child th': { border: 0 },
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => onOpenBlog(post)}
              >
                {/* Story & Topic */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={post.coverImage}
                      alt={post.title}
                      sx={{
                        width: 48,
                        height: 36,
                        borderRadius: '6px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: '1px solid #E2E8F0',
                      }}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.86rem',
                          color: '#0F172A',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {post.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                        {post.tags.slice(0, 2).map((tag) => (
                          <Chip
                            key={tag}
                            label={`#${tag}`}
                            size="small"
                            sx={{ fontSize: '0.65rem', height: 16, bgcolor: '#F1F5F9', color: '#64748B' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Chip
                    label={post.category}
                    size="small"
                    sx={{
                      bgcolor: theme.tagBg,
                      color: theme.tagText,
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      height: 22,
                    }}
                  />
                </TableCell>

                {/* Author */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar
                      src={post.author.avatarImg}
                      sx={{ width: 26, height: 26, bgcolor: post.author.avatarBg, fontSize: '0.72rem', fontWeight: 700 }}
                    >
                      {post.author.name[0]}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.82rem', color: '#1E293B', whiteSpace: 'nowrap' }}>
                        {post.author.name}
                      </Typography>
                      <Typography sx={{ fontSize: '0.7rem', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {post.author.college || post.author.institute || 'SkillOS'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Published Date */}
                <TableCell>
                  <Typography sx={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>
                    {formatBlogDate(post.publishedAt)}
                  </Typography>
                </TableCell>

                {/* Read Time */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeRoundedIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                    <Typography sx={{ fontSize: '0.76rem', color: '#64748B' }}>
                      {post.readTime}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Claps */}
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip
                    icon={
                      post.hasLiked ? (
                        <FavoriteRoundedIcon sx={{ fontSize: 13, color: '#EF4444 !important' }} />
                      ) : (
                        <FavoriteBorderRoundedIcon sx={{ fontSize: 13, color: '#94A3B8 !important' }} />
                      )
                    }
                    label={post.claps || 0}
                    size="small"
                    onClick={(e) => onToggleClap(post.id, e)}
                    sx={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      bgcolor: post.hasLiked ? '#FEF2F2' : '#F8FAFC',
                      color: post.hasLiked ? '#DC2626' : '#64748B',
                      border: '1px solid',
                      borderColor: post.hasLiked ? '#FCA5A5' : '#E2E8F0',
                      '&:hover': { bgcolor: '#FEE2E2' },
                    }}
                  />
                </TableCell>

                {/* Actions */}
                <TableCell sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      aria-label="Share article"
                      onClick={(e) => onShare(post, e)}
                      sx={{ color: '#94A3B8', '&:hover': { color: '#2563EB' } }}
                    >
                      <ShareRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      aria-label="Bookmark article"
                      onClick={(e) => onToggleBookmark(post.id, e)}
                      sx={{ color: post.isBookmarked ? '#2563EB' : '#94A3B8' }}
                    >
                      {post.isBookmarked ? (
                        <BookmarkRoundedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <BookmarkBorderRoundedIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>

                    <Button
                      size="small"
                      variant="outlined"
                      endIcon={<OpenInNewRoundedIcon sx={{ fontSize: 12 }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBlog(post);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        borderRadius: '6px',
                        py: 0.3,
                        px: 1,
                        minWidth: 0,
                      }}
                    >
                      Read
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
