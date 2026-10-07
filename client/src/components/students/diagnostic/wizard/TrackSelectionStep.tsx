'use client';

import React from 'react';
import { Box, Typography, Card, Chip } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { CAREER_TRACKS } from './types';

interface TrackSelectionStepProps {
  selectedTrack: string;
  onSelectTrack: (trackId: string) => void;
}

export function TrackSelectionStep({
  selectedTrack,
  onSelectTrack,
}: TrackSelectionStepProps) {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
          Select Your Target Engineering Track
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Your baseline diagnostic quiz, recommended curriculum, and weekly goals will calibrate directly to this discipline.
        </Typography>
      </Box>

      <Box
        role="radiogroup"
        aria-label="Select Career Track"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {CAREER_TRACKS.map((track) => {
          const isSelected = selectedTrack === track.id;
          return (
            <Card
              key={track.id}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onSelectTrack(track.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectTrack(track.id);
                }
              }}
              sx={{
                p: 2.5,
                cursor: 'pointer',
                borderRadius: '16px',
                position: 'relative',
                outline: 'none',
                border: isSelected
                  ? `2px solid ${track.color}`
                  : '1.5px solid #E2E8F0',
                background: isSelected ? track.bgGradientSelected : track.bgGradient,
                boxShadow: isSelected
                  ? `0 10px 28px -4px ${track.color}35, 0 0 0 1px ${track.color}`
                  : '0 2px 8px 0 rgba(15, 23, 42, 0.04)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:focus-visible': {
                  boxShadow: `0 0 0 3px ${track.color}60`,
                },
                '&:hover': {
                  borderColor: track.color,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 28px -4px ${track.color}25, 0 2px 6px rgba(0,0,0,0.04)`,
                },
              }}
            >
              <Box>
                {/* Card Header with Icon, Badge & Radio/Check Indicator */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius: '14px',
                        bgcolor: '#FFFFFF',
                        color: track.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1.5px solid ${isSelected ? track.color : track.borderLight}`,
                        boxShadow: isSelected
                          ? `0 4px 12px ${track.color}30`
                          : `0 2px 6px rgba(0,0,0,0.04)`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {track.icon}
                    </Box>
                    <Chip
                      label={track.badge}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor: isSelected ? '#FFFFFF' : `${track.color}12`,
                        color: track.color,
                        border: `1px solid ${track.borderLight}`,
                        borderRadius: '6px',
                      }}
                    />
                  </Box>

                  {/* Interactive Selected Circle */}
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      border: isSelected ? `2px solid ${track.color}` : '2px solid #CBD5E1',
                      bgcolor: isSelected ? track.color : '#FFFFFF',
                      boxShadow: isSelected ? `0 0 0 4px ${track.color}25` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isSelected && <CheckCircleRoundedIcon sx={{ color: '#FFFFFF', fontSize: 18 }} />}
                  </Box>
                </Box>

                {/* Title & Subtitle */}
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: '#0F172A',
                    mb: 0.7,
                    fontSize: '1.02rem',
                    lineHeight: 1.3,
                  }}
                >
                  {track.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    fontSize: '0.82rem',
                    mb: 2,
                    minHeight: 38,
                    lineHeight: 1.45,
                  }}
                >
                  {track.subtitle}
                </Typography>

                {/* Quick Meta Row: Benchmark & Duration */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: '#FFFFFF',
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <InsightsRoundedIcon sx={{ fontSize: 14, color: track.color }} />
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, fontSize: '0.72rem' }}>
                      Index: {track.benchmarkScore} pts
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      bgcolor: '#FFFFFF',
                      px: 1,
                      py: 0.3,
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600, fontSize: '0.72rem' }}>
                      {track.duration}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Roles Footer with Executive Pills */}
              <Box
                sx={{
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: isSelected ? track.borderLight : '#E2E8F0',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: '#64748B',
                    fontWeight: 800,
                    display: 'block',
                    mb: 0.8,
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Target Career Roles
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                  {track.popularRoles.map((role) => (
                    <Chip
                      key={role}
                      label={role}
                      size="small"
                      sx={{
                        fontSize: '0.72rem',
                        height: 24,
                        bgcolor: '#FFFFFF',
                        color: isSelected ? '#0F172A' : '#334155',
                        border: isSelected
                          ? `1.5px solid ${track.borderLight}`
                          : '1px solid #E2E8F0',
                        fontWeight: isSelected ? 700 : 600,
                        boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.05)' : 'none',
                        borderRadius: '6px',
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
