'use client';

import React from 'react';
import { Box, Typography, Card, Avatar, AvatarGroup, Button } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import { FluidArrowRight } from '@/utils/fluid_arrow';
import Link from 'next/link';

interface CommunityBannerWidgetProps {
  activeCoders?: number;
  contestsCount?: number;
}

export default function CommunityBannerWidget({
  activeCoders = 2340,
  contestsCount = 18,
}: CommunityBannerWidgetProps) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        borderRadius: '24px',
        bgcolor: '#064E3B',
        backgroundImage: 'linear-gradient(135deg, #064E3B 0%, #047857 50%, #059669 100%)',
        color: '#FFFFFF',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 12px 30px rgba(4, 120, 87, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 2.5,
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Rings */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          bgcolor: 'rgba(255, 255, 255, 0.03)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: 60,
          width: 100,
          height: 100,
          borderRadius: '50%',
          bgcolor: 'rgba(52, 211, 153, 0.12)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      {/* Top Strip: Brand / Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsRoundedIcon sx={{ fontSize: 20, color: '#A7F3D0' }} />
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#A7F3D0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Campus Competitive League
          </Typography>
        </Box>

        <Button
          component={Link}
          href="/superadmin/contests"
          aria-label="View contests"
          sx={{
            minWidth: 32,
            width: 32,
            height: 32,
            borderRadius: '50%',
            bgcolor: 'rgba(255, 255, 255, 0.16)',
            color: '#FFFFFF',
            p: 0,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.28)',
              transform: 'translateX(2px)',
            },
          }}
        >
          <FluidArrowRight size={16} />
        </Button>
      </Box>

      {/* Middle: Headline */}
      <Box sx={{ zIndex: 1 }}>
        <Typography sx={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Inter-College Autumn Code Cup
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', mt: 0.5 }}>
          {contestsCount > 0 ? `${contestsCount} active competitive tournaments` : '18 affiliated engineering campuses'} in live rated rounds
        </Typography>
      </Box>

      {/* Bottom: Avatar Stack + Stats */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          pt: 1,
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.72rem', border: '2px solid #064E3B' } }}>
            <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" />
            <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" />
            <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" />
            <Avatar src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" />
          </AvatarGroup>
          <Typography sx={{ fontSize: '0.76rem', color: '#E2E8F0', fontWeight: 600 }}>
            <strong>{activeCoders.toLocaleString()}+</strong> coders active
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Box
            sx={{
              px: 1.2,
              py: 0.35,
              borderRadius: '9999px',
              bgcolor: 'rgba(255, 255, 255, 0.16)',
              color: '#FFFFFF',
              fontSize: '0.7rem',
              fontWeight: 700,
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}
          >
            Algorithms Track
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
