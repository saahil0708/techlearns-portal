'use client';

import React from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { getRatingTier } from '@/utils/codechefRating';

interface StarRatingBadgeProps {
  rating?: number;
  showStars?: boolean;
  showRatingNumber?: boolean;
  showDivision?: boolean;
  size?: 'small' | 'medium' | 'large';
  compact?: boolean;
}

export default function StarRatingBadge({
  rating = 1500,
  showStars = true,
  showRatingNumber = true,
  showDivision = true,
  size = 'small',
  compact = false,
}: StarRatingBadgeProps) {
  const tier = getRatingTier(rating);

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const tooltipTitle = `${tier.tierName} • ${tier.division} (Rating: ${rating})`;

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: isSmall ? 0.75 : 1,
          px: isSmall ? 1 : isLarge ? 1.75 : 1.25,
          py: isSmall ? 0.35 : isLarge ? 0.75 : 0.5,
          borderRadius: '9999px',
          bgcolor: tier.bgColor,
          border: `1px solid ${tier.borderColor}`,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: `0 3px 10px ${tier.borderColor}`,
          },
        }}
      >
        {/* Star glyphs */}
        {showStars && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
            {Array.from({ length: tier.stars }).map((_, i) => (
              <Typography
                key={i}
                component="span"
                sx={{
                  color: tier.color,
                  fontSize: isSmall ? '0.75rem' : isLarge ? '1.05rem' : '0.88rem',
                  lineHeight: 1,
                  fontWeight: 900,
                  textShadow: `0 1px 2px ${tier.borderColor}`,
                }}
              >
                ★
              </Typography>
            ))}
          </Box>
        )}

        {/* Rating Number */}
        {showRatingNumber && (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: isSmall ? '0.76rem' : isLarge ? '0.95rem' : '0.84rem',
              color: tier.textColor,
              letterSpacing: '-0.01em',
            }}
          >
            {rating}
          </Typography>
        )}

        {/* Division Pill */}
        {showDivision && !compact && (
          <Box
            sx={{
              px: 0.75,
              py: '1px',
              borderRadius: '6px',
              bgcolor: '#FFFFFF',
              border: `1px solid ${tier.borderColor}`,
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontSize: isSmall ? '0.68rem' : '0.74rem',
                fontWeight: 800,
                color: tier.color,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
              }}
            >
              {tier.division}
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  );
}
