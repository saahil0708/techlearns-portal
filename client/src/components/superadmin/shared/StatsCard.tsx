'use client';

import React, { useId } from 'react';
import { Box, Typography, Card, SxProps, Theme } from '@mui/material';

export type StatsCardVariant = 'blue' | 'black';
export type StatsCardShape =
  | 'orbital'
  | 'topography'
  | 'hex-grid'
  | 'aurora-waves'
  | 'mountains'
  | 'curves'
  | 'waves'
  | 'peaks';

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

// Background SVGs: Concentric Orbital Rings, Flowing Topographic Contours, Hexagonal Cyber Mesh, Fluid Aurora Waves
const BackgroundShape: React.FC<{ shape: StatsCardShape; variant: StatsCardVariant }> = ({ shape, variant }) => {
  const uniqueId = useId().replace(/:/g, '_');
  const isBlue = variant === 'blue';

  const strokePrimary = isBlue ? 'rgba(147, 197, 253, 0.35)' : 'rgba(255, 255, 255, 0.18)';
  const strokeSecondary = isBlue ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.08)';
  const fillGlow = isBlue ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.06)';
  const fillDeep = isBlue ? 'rgba(30, 58, 138, 0.35)' : 'rgba(255, 255, 255, 0.03)';
  const accentDot = isBlue ? '#93C5FD' : '#FFFFFF';

  switch (shape) {
    case 'orbital':
    case 'peaks': // backward compatibility mapping
      return (
        <Box
          component="svg"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            position: 'absolute',
            right: -20,
            bottom: -25,
            width: '210px',
            height: '115px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <defs>
            <radialGradient id={`orb_glow_${uniqueId}`} cx="85%" cy="85%" r="80%">
              <stop offset="0%" stopColor={fillGlow} stopOpacity="1" />
              <stop offset="60%" stopColor={fillDeep} stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          {/* Ambient Radial Aura */}
          <circle cx="210" cy="100" r="110" fill={`url(#orb_glow_${uniqueId})`} />

          {/* Concentric Orbital Rings */}
          <circle cx="210" cy="100" r="120" stroke={strokeSecondary} strokeWidth="1" strokeDasharray="5 5" />
          <circle cx="210" cy="100" r="95" stroke={strokePrimary} strokeWidth="1.25" />
          <circle cx="210" cy="100" r="70" stroke={strokeSecondary} strokeWidth="1" strokeDasharray="3 4" />
          <circle cx="210" cy="100" r="45" stroke={strokePrimary} strokeWidth="1.5" />
          <circle cx="210" cy="100" r="24" stroke={strokePrimary} strokeWidth="1.75" />

          {/* Orbital Orbiters & Pulse Nodes */}
          <circle cx="165" cy="55" r="3.5" fill={accentDot} opacity={0.85} />
          <circle cx="165" cy="55" r="7" stroke={strokePrimary} strokeWidth="1" opacity={0.5} />
          <circle cx="140" cy="100" r="2.5" fill={accentDot} opacity={0.7} />
          <circle cx="185" cy="16" r="3" fill={accentDot} opacity={0.9} />
          <path d="M210,100 L165,55" stroke={strokeSecondary} strokeWidth="1" strokeDasharray="2 2" />
        </Box>
      );

    case 'topography':
    case 'curves': // backward compatibility mapping
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
            width: '220px',
            height: '110px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <defs>
            <linearGradient id={`topo_grad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fillGlow} stopOpacity="0.8" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* Layered Smooth Isobar Curves */}
          <path
            d="M20,120 C70,60 140,110 240,40 L240,120 Z"
            fill={`url(#topo_grad_${uniqueId})`}
          />
          <path
            d="M0,110 C60,50 130,95 240,30"
            stroke={strokePrimary}
            strokeWidth="1.75"
          />
          <path
            d="M15,120 C85,70 155,105 240,50"
            stroke={strokeSecondary}
            strokeWidth="1.25"
            strokeDasharray="4 3"
          />
          <path
            d="M40,120 C110,85 180,115 240,70"
            stroke={strokePrimary}
            strokeWidth="1.25"
          />
          <path
            d="M0,80 C70,25 150,80 240,15"
            stroke={strokeSecondary}
            strokeWidth="1"
            strokeDasharray="2 3"
            opacity={0.6}
          />
          {/* Topographic elevation mark */}
          <circle cx="180" cy="45" r="3" fill={accentDot} opacity={0.75} />
        </Box>
      );

    case 'hex-grid':
    case 'mountains': // backward compatibility mapping
      return (
        <Box
          component="svg"
          viewBox="0 0 240 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          sx={{
            position: 'absolute',
            right: -5,
            bottom: -5,
            width: '200px',
            height: '105px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          {/* Futuristic Hexagonal Honeycomb & Isometric Wireframe Grid */}
          <defs>
            <linearGradient id={`hex_fill_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={fillGlow} stopOpacity="0.9" />
              <stop offset="100%" stopColor={fillDeep} stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Hex 1 - Center Right */}
          <polygon points="175,30 205,47 205,82 175,100 145,82 145,47" fill={`url(#hex_fill_${uniqueId})`} stroke={strokePrimary} strokeWidth="1.5" />
          
          {/* Hex 2 - Top Right Offset */}
          <polygon points="215,5 240,20 240,50 215,65 190,50 190,20" fill="none" stroke={strokeSecondary} strokeWidth="1.25" strokeDasharray="3 3" />

          {/* Hex 3 - Bottom Right */}
          <polygon points="215,75 240,90 240,120 215,135 190,120 190,90" fill={fillDeep} stroke={strokeSecondary} strokeWidth="1" />

          {/* Hex 4 - Left Middle */}
          <polygon points="135,75 160,90 160,120 135,135 110,120 110,90" fill="none" stroke={strokePrimary} strokeWidth="1.25" />

          {/* Hex 5 - Top Left Accent */}
          <polygon points="135,5 160,20 160,50 135,65 110,50 110,20" fill="none" stroke={strokeSecondary} strokeWidth="1" strokeDasharray="2 2" opacity={0.6} />

          {/* Glowing Vertex Nodes */}
          <circle cx="175" cy="30" r="3" fill={accentDot} opacity={0.8} />
          <circle cx="205" cy="82" r="3" fill={accentDot} opacity={0.8} />
          <circle cx="145" cy="47" r="2.5" fill={accentDot} opacity={0.6} />
        </Box>
      );

    case 'aurora-waves':
    case 'waves':
    default:
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
            width: '220px',
            height: '105px',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'transform 0.4s ease',
          }}
        >
          <defs>
            <linearGradient id={`aurora_ribbon_${uniqueId}`} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <stop offset="50%" stopColor={fillGlow} stopOpacity="1" />
              <stop offset="100%" stopColor={fillDeep} stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Ambient Wave Sweep 1 */}
          <path
            d="M0,100 Q60,35 130,75 T240,30 L240,120 L0,120 Z"
            fill={`url(#aurora_ribbon_${uniqueId})`}
          />

          {/* Sine Wave Flow Lines */}
          <path
            d="M0,90 Q65,25 135,65 T240,20"
            stroke={strokePrimary}
            strokeWidth="1.75"
          />
          <path
            d="M0,105 Q70,45 140,85 T240,40"
            stroke={strokeSecondary}
            strokeWidth="1.25"
            strokeDasharray="4 3"
          />
          <path
            d="M10,120 Q80,65 150,100 T240,65"
            stroke={strokePrimary}
            strokeWidth="1.25"
          />

          {/* Luminous Glow Points */}
          <circle cx="135" cy="65" r="3.5" fill={accentDot} opacity={0.8} />
          <circle cx="210" cy="25" r="2.5" fill={accentDot} opacity={0.6} />
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

  // Default rotation across 4 modern tech shape styles
  const defaultShapes: StatsCardShape[] = ['orbital', 'topography', 'hex-grid', 'aurora-waves'];
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
      {/* Background Graphic: Orbital Rings / Topography / Hex Grid / Aurora Waves */}
      <BackgroundShape shape={effectiveShape} variant={effectiveVariant} />

      {/* Top Header: Title and Icon badge */}
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

        {/* Icon badge chip */}
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
