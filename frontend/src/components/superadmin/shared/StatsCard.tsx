'use client';

import React, { useId } from 'react';
import { Box, Typography, Card, SxProps, Theme } from '@mui/material';

export type StatsCardVariant = 'blue' | 'black';
export type StatsCardShape = 'mountains' | 'curves' | 'waves' | 'peaks';

export interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  emoji?: string;
  variant?: StatsCardVariant;
  index?: number;
  shape?: StatsCardShape;
  sx?: SxProps<Theme>;
  rightSlot?: React.ReactNode;
  trendBadge?: {
    text: string;
    type?: 'positive' | 'neutral' | 'speed' | 'warning';
  };
}

// SVG Backgrounds: Mountains, Curves, Waves, Geometric Peaks
const BackgroundShape: React.FC<{ shape: StatsCardShape; variant: StatsCardVariant }> = ({ shape, variant }) => {
  const uniqueId = useId().replace(/:/g, '_');
  const fillColor = variant === 'blue' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)';
  const strokeColor = variant === 'blue' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.12)';
  const glowColor = variant === 'blue' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(148, 163, 184, 0.1)';

  switch (shape) {
    case 'mountains':
      return (
        <Box
          component="svg"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            position: 'absolute',
            right: -10,
            bottom: -5,
            width: '180px',
            height: '95px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <defs>
            <linearGradient id={`grad_mtn_back_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={glowColor} stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={`grad_mtn_front_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fillColor} stopOpacity="1" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Distant Mountain Peak */}
          <polygon points="70,120 140,25 210,120" fill={`url(#grad_mtn_back_${uniqueId})`} />
          <path d="M140,25 L120,60 L140,75 L155,50 Z" fill="rgba(255,255,255,0.06)" />
          {/* Foreground Mountain Peak */}
          <polygon points="120,120 180,45 240,120" fill={`url(#grad_mtn_front_${uniqueId})`} />
          <polygon points="10,120 75,55 140,120" fill={`url(#grad_mtn_back_${uniqueId})`} />
          {/* Mountain Contour Ridge lines */}
          <path d="M10,120 L75,55 L140,25 L180,45 L240,120" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
        </Box>
      );

    case 'curves':
      return (
        <Box
          component="svg"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '200px',
            height: '100px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <defs>
            <linearGradient id={`grad_curve_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.9" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C60,40 140,110 240,30 L240,120 L0,120 Z"
            fill={`url(#grad_curve_${uniqueId})`}
          />
          <path
            d="M0,115 C80,70 160,105 240,55"
            stroke={strokeColor}
            strokeWidth="2"
          />
          <path
            d="M20,120 C100,50 170,85 240,15"
            stroke={strokeColor}
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </Box>
      );

    case 'waves':
      return (
        <Box
          component="svg"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: '210px',
            height: '90px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <path
            d="M0,80 Q60,30 120,70 T240,40 L240,120 L0,120 Z"
            fill={fillColor}
          />
          <path
            d="M0,95 Q70,55 140,85 T240,65"
            stroke={strokeColor}
            strokeWidth="1.5"
          />
          <circle cx="190" cy="30" r="18" fill="rgba(255,255,255,0.04)" stroke={strokeColor} strokeWidth="1" />
        </Box>
      );

    case 'peaks':
    default:
      return (
        <Box
          component="svg"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            position: 'absolute',
            right: -15,
            bottom: -5,
            width: '190px',
            height: '95px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <polygon points="30,120 90,40 150,120" fill={fillColor} />
          <polygon points="110,120 170,20 230,120" fill={fillColor} />
          <path d="M90,40 L170,20" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="170" cy="20" r="4" fill="rgba(255,255,255,0.4)" />
        </Box>
      );
  }
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  emoji,
  variant,
  index = 0,
  shape,
  sx,
  rightSlot,
  trendBadge,
}: StatsCardProps) {
  // Determine alternating blue or black if not explicitly set
  const effectiveVariant: StatsCardVariant =
    variant || (index % 2 === 0 ? 'blue' : 'black');

  // Determine shape based on index if not set
  const defaultShapes: StatsCardShape[] = ['mountains', 'curves', 'peaks', 'waves'];
  const effectiveShape: StatsCardShape = shape || defaultShapes[index % defaultShapes.length];

  const isBlue = effectiveVariant === 'blue';

  const backgroundGradient = isBlue
    ? 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 50%, #0F172A 100%)'
    : 'linear-gradient(135deg, #18181B 0%, #111827 60%, #030712 100%)';

  const borderColor = isBlue
    ? 'rgba(147, 197, 253, 0.28)'
    : 'rgba(255, 255, 255, 0.12)';

  const shadowColor = isBlue
    ? '0 10px 25px -5px rgba(30, 58, 138, 0.35), 0 4px 10px -2px rgba(30, 58, 138, 0.2)'
    : '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 4px 10px -2px rgba(0, 0, 0, 0.3)';

  const iconBg = isBlue
    ? 'rgba(255, 255, 255, 0.16)'
    : 'rgba(255, 255, 255, 0.09)';

  const iconBorder = isBlue
    ? 'rgba(255, 255, 255, 0.28)'
    : 'rgba(255, 255, 255, 0.15)';

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: '16px',
        background: backgroundGradient,
        border: `1px solid ${borderColor}`,
        boxShadow: shadowColor,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: isBlue
            ? '0 16px 32px -4px rgba(30, 58, 138, 0.45), 0 6px 16px -2px rgba(30, 58, 138, 0.3)'
            : '0 16px 32px -4px rgba(0, 0, 0, 0.65), 0 6px 16px -2px rgba(0, 0, 0, 0.45)',
          borderColor: isBlue ? 'rgba(191, 219, 254, 0.45)' : 'rgba(255, 255, 255, 0.25)',
          '& svg': {
            transform: 'scale(1.05) translateY(-2px)',
          },
        },
        ...sx,
      }}
    >
      {/* Background Graphic: Mountains / Curves / Waves */}
      <BackgroundShape shape={effectiveShape} variant={effectiveVariant} />

      {/* Top Header: Title and Icon/Emoji badge */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1.5,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: 'rgba(255, 255, 255, 0.75)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            lineHeight: 1.3,
          }}
        >
          {title}
        </Typography>

        {/* Icon / Emoji badge chip */}
        {(icon || emoji) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              minWidth: 36,
              borderRadius: '10px',
              bgcolor: iconBg,
              border: `1px solid ${iconBorder}`,
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#FFFFFF',
              fontSize: '1.15rem',
              flexShrink: 0,
            }}
          >
            {emoji ? (
              <span role="img" aria-label={title} style={{ lineHeight: 1 }}>
                {emoji}
              </span>
            ) : (
              icon
            )}
          </Box>
        )}
      </Box>

      {/* Value & Optional Right Slot */}
      <Box
        sx={{
          my: 0.75,
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography
          component="div"
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-0.025em',
            lineHeight: 1.15,
            textShadow: '0 2px 10px rgba(0,0,0,0.25)',
          }}
        >
          {value}
        </Typography>

        {rightSlot && (
          <Box sx={{ flexShrink: 0, mb: 0.25 }}>
            {rightSlot}
          </Box>
        )}
      </Box>

      {/* Subtitle / Trend footer */}
      {(subtitle || trendBadge) && (
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 0.75,
          }}
        >
          {trendBadge && (
            <Box
              sx={{
                px: 1,
                py: 0.2,
                borderRadius: '6px',
                fontSize: '0.7rem',
                fontWeight: 700,
                bgcolor:
                  trendBadge.type === 'positive'
                    ? 'rgba(16, 185, 129, 0.2)'
                    : trendBadge.type === 'speed'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : 'rgba(255, 255, 255, 0.12)',
                color:
                  trendBadge.type === 'positive'
                    ? '#34D399'
                    : trendBadge.type === 'speed'
                    ? '#FBBF24'
                    : '#FFFFFF',
                border:
                  trendBadge.type === 'positive'
                    ? '1px solid rgba(52, 211, 153, 0.3)'
                    : trendBadge.type === 'speed'
                    ? '1px solid rgba(251, 191, 36, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.15)',
              }}
            >
              {trendBadge.text}
            </Box>
          )}

          {typeof subtitle === 'string' ? (
            <Typography
              sx={{
                fontSize: '0.73rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              {subtitle}
            </Typography>
          ) : (
            subtitle
          )}
        </Box>
      )}
    </Card>
  );
}
