'use client';

import React from 'react';
import { Box, Typography, Card, Chip, IconButton } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import { BlogPost, formatBlogDate } from '@/types/blog';
import { DEFAULT_COVER_OPTIONS, getBlogThemeConfig } from './types';

interface BlogsGridViewProps {
  posts: BlogPost[];
  page: number;
  rowsPerPage: number;
  activeTab: 'trending' | 'latest' | 'bookmarks';
  onOpenBlog: (post: BlogPost) => void;
  onToggleClap: (id: string, e?: React.MouseEvent) => void;
  onToggleBookmark: (id: string, e?: React.MouseEvent) => void;
  onShare: (post: BlogPost, e?: React.MouseEvent) => void;
}

export default function BlogsGridView({
  posts,
  page,
  rowsPerPage,
  activeTab,
  onOpenBlog,
  onToggleClap,
  onToggleBookmark,
  onShare,
}: BlogsGridViewProps) {
  const currentSlice = posts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        bgcolor: '#F8FAFC',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(auto-fill, minmax(260px, 1fr))',
          md: 'repeat(auto-fill, minmax(280px, 1fr))',
          lg: 'repeat(auto-fill, minmax(285px, 1fr))',
        },
        columnGap: { xs: 1.5, sm: 2, md: 2 },
        rowGap: { xs: 4, sm: 5, md: 5 },
      }}
    >
      {currentSlice.map((post, idx) => {
        const isTopTrending = activeTab === 'trending' && idx === 0 && page === 0;
        const theme = getBlogThemeConfig(post.category);
        return (
          <Card
            key={post.id}
            role="button"
            tabIndex={0}
            aria-label={`Read story: ${post.title}`}
            onClick={() => onOpenBlog(post)}
            onKeyDown={(e) => {
              if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onOpenBlog(post);
              }
            }}
            sx={{
              width: '100%',
              borderRadius: '18px',
              bgcolor: '#FFFFFF',
              border: 'none',
              boxShadow: 'none',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 'none',
              },
            }}
          >
            {/* TOP 3D ARTWORK BANNER WITH SIGNATURE SLANT CLIPPED CUTOUT */}
            <Box
              sx={{
                height: 200,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: theme.tagBg,
              }}
            >
              <Box
                component="img"
                className="card-cover-img"
                src={post.coverImage || DEFAULT_COVER_OPTIONS[0]}
                alt={post.title}
                onError={(e: any) => {
                  e.currentTarget.src = DEFAULT_COVER_OPTIONS[0];
                }}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.04)',
                  },
                }}
              />

              {/* Status Pill Badge Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  zIndex: 3,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  background: isTopTrending
                    ? 'linear-gradient(135deg, rgba(120, 53, 15, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
                    : theme.badgeBg,
                  backdropFilter: 'blur(12px)',
                  px: 1.3,
                  py: 0.5,
                  borderRadius: '9999px',
                  border: isTopTrending
                    ? '1px solid rgba(251, 191, 36, 0.45)'
                    : theme.badgeBorder,
                  boxShadow: isTopTrending
                    ? '0 4px 16px rgba(0, 0, 0, 0.35), 0 0 12px rgba(245, 158, 11, 0.25)'
                    : theme.badgeShadow,
                }}
              >
                {isTopTrending ? (
                  <LocalFireDepartmentRoundedIcon
                    sx={{
                      fontSize: 14,
                      color: '#FBBF24',
                      filter: 'drop-shadow(0 0 4px rgba(251, 191, 36, 0.9))',
                    }}
                  />
                ) : (
                  <RocketLaunchRoundedIcon
                    sx={{
                      fontSize: 13,
                      color: theme.badgeIconColor,
                      filter: `drop-shadow(0 0 4px ${theme.badgeIconColor})`,
                    }}
                  />
                )}

                <Typography
                  sx={{
                    color: isTopTrending ? '#FFFBEB' : theme.badgeText,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                  }}
                >
                  {isTopTrending ? 'TRENDING STORY' : theme.badgeLabel}
                </Typography>
              </Box>

              {/* Sharp Slant Clipped Shape Transition at Top (Fills with Pure White) */}
              <svg
                viewBox="0 0 320 38"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  width: '100%',
                  height: '38px',
                  zIndex: 5,
                  pointerEvents: 'none',
                }}
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 38 L 0 26 L 85 26 L 118 0 L 320 0 L 320 38 Z"
                  fill="#FFFFFF"
                />
              </svg>
            </Box>

            {/* CARD CONTENT BODY */}
            <Box
              sx={{
                px: 2.5,
                pt: 1.4,
                pb: 1.4,
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                bgcolor: '#FFFFFF',
              }}
            >
              {/* Track / Category Badge & Readers Count */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Chip
                  label={post.category}
                  size="small"
                  sx={{
                    bgcolor: theme.tagBg,
                    color: theme.tagText,
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    height: 22,
                    borderRadius: '6px',
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PeopleAltRoundedIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                  <Typography sx={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748B' }}>
                    {post.views ?? 0} readers
                  </Typography>
                </Box>
              </Box>

              {/* Blog Story Title */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  fontSize: '1.08rem',
                  lineHeight: 1.34,
                  color: '#0F172A',
                  mb: 0.8,
                  letterSpacing: '-0.015em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: '2.7em',
                }}
              >
                {post.title}
              </Typography>

              {/* Author Line */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.6 }}>
                <SchoolRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                <Typography
                  sx={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#475569',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {post.author.name}
                </Typography>
              </Box>

              {/* Tags */}
              <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', mb: 2 }}>
                {post.tags.slice(0, 3).map((tag) => (
                  <Chip
                    key={tag}
                    label={`#${tag}`}
                    size="small"
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      bgcolor: '#F1F5F9',
                      color: '#475569',
                      fontWeight: 600,
                      borderRadius: '4px',
                    }}
                  />
                ))}
              </Box>

              {/* Footer Meta & Quick Actions */}
              <Box
                sx={{
                  mt: 'auto',
                  pt: 1.5,
                  borderTop: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <CalendarTodayRoundedIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                  <Typography sx={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
                    {formatBlogDate(post.publishedAt)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    aria-label={`Clap for ${post.title}`}
                    onClick={(e) => onToggleClap(post.id, e)}
                    sx={{
                      color: post.hasLiked ? '#EF4444' : '#94A3B8',
                      '&:hover': { color: '#EF4444' },
                    }}
                  >
                    {post.hasLiked ? (
                      <FavoriteRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <FavoriteBorderRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                  <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B' }}>
                    {post.claps || 0}
                  </Typography>

                  <IconButton
                    size="small"
                    aria-label={`Share ${post.title}`}
                    onClick={(e) => onShare(post, e)}
                    sx={{ color: '#94A3B8', ml: 0.5 }}
                  >
                    <ShareRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>

                  <IconButton
                    size="small"
                    aria-label={`Bookmark ${post.title}`}
                    onClick={(e) => onToggleBookmark(post.id, e)}
                    sx={{ color: post.isBookmarked ? '#2563EB' : '#94A3B8' }}
                  >
                    {post.isBookmarked ? (
                      <BookmarkRoundedIcon sx={{ fontSize: 16 }} />
                    ) : (
                      <BookmarkBorderRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
