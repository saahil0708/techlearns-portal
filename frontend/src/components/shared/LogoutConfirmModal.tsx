'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

export interface LogoutConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isLoggingOut?: boolean;
}

/**
 * Compact Vector SVG Illustration:
 * Sad anime developer at desk with laptop ("</>"), "Good Code Today!" mug, and speech bubble.
 */
function ProgrammerLeavingIllustration({ width = 175, height = 140 }: { width?: number; height?: number }) {
  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 300 240"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft Organic Blue Backdrop Shape */}
        <path
          d="M 60 130 C 40 80 80 30 140 32 C 200 34 240 75 230 130 C 225 155 200 180 150 185 C 80 190 65 160 60 130 Z"
          fill="#EBF3FE"
        />

        {/* Ambient floating speckles */}
        <circle cx="52" cy="70" r="3" fill="#93C5FD" />
        <circle cx="235" cy="55" r="2.5" fill="#93C5FD" />
        <circle cx="245" cy="110" r="3" fill="#BFDBFE" />
        <path d="M 40 100 Q 42 110 38 120" stroke="#93C5FD" strokeWidth="2.5" strokeLinecap="round" />

        {/* "Already leaving?" Speech Bubble */}
        <g>
          <path
            d="M 188 88 C 188 88 184 76 195 72"
            stroke="#1E293B"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <text
            x="195"
            y="42"
            fill="#1E293B"
            fontSize="14"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.3px"
          >
            Already
          </text>
          <text
            x="192"
            y="58"
            fill="#1E293B"
            fontSize="14"
            fontWeight="800"
            fontFamily="system-ui, -apple-system, sans-serif"
            letterSpacing="-0.3px"
          >
            leaving?
          </text>
        </g>

        {/* Desk Line */}
        <path
          d="M 25 185 L 280 185"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Desk Shadow */}
        <ellipse cx="140" cy="190" rx="110" ry="6" fill="#DBEAFE" fillOpacity="0.8" />

        {/* Programmer Body - Blue Hoodie Back & Shoulders */}
        <path
          d="M 50 185 C 48 150 68 122 110 120 C 135 119 148 124 165 145 C 168 155 170 172 170 185"
          fill="#3B82F6"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Hoodie arm resting on desk */}
        <path
          d="M 50 185 C 48 165 62 145 85 145 C 105 145 125 168 135 185"
          fill="#2563EB"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Head / Face */}
        <path
          d="M 75 145 C 75 110 88 92 120 92 C 150 92 160 115 158 145 C 156 160 142 168 120 168 C 95 168 75 160 75 145 Z"
          fill="#FDDEC7"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cute Sad Face Features */}
        {/* Slanted Sad Eyebrows */}
        <path d="M 92 122 Q 99 117 106 120" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M 125 120 Q 132 117 139 122" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />

        {/* Sad Droopy Eyes */}
        <ellipse cx="100" cy="132" rx="5" ry="6" fill="#1E293B" />
        <circle cx="98.5" cy="130" r="1.8" fill="#FFFFFF" />
        <ellipse cx="131" cy="132" rx="5" ry="6" fill="#1E293B" />
        <circle cx="129.5" cy="130" r="1.8" fill="#FFFFFF" />

        {/* Rosy Cheeks */}
        <ellipse cx="90" cy="142" rx="5" ry="3" fill="#FCA5A5" fillOpacity="0.8" />
        <ellipse cx="140" cy="142" rx="5" ry="3" fill="#FCA5A5" fillOpacity="0.8" />

        {/* Little Sad Mouth */}
        <path d="M 112 147 Q 116 144 120 147" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Messy Anime Dark Hair */}
        <path
          d="M 75 130 C 65 115 65 95 80 80 C 75 75 78 68 88 72 C 88 62 98 58 108 65 C 115 55 130 54 138 64 C 146 58 158 65 158 75 C 168 80 172 95 165 115 C 160 102 152 98 145 105 C 140 92 128 92 120 102 C 112 90 98 92 90 106 C 85 96 78 110 75 130 Z"
          fill="#1E293B"
          stroke="#1E293B"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hands */}
        <path
          d="M 108 175 C 108 168 116 166 125 166 C 132 166 138 170 138 175"
          fill="#FDDEC7"
          stroke="#1E293B"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Laptop Lid Screen */}
        <path
          d="M 95 190 L 115 155 L 180 152 L 165 192 Z"
          fill="#94A3B8"
          stroke="#1E293B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 100 188 L 117 157 L 176 154 L 162 190 Z"
          fill="#CBD5E1"
        />
        {/* "</>" Code Logo */}
        <text
          x="132"
          y="178"
          fill="#1E293B"
          fontSize="15"
          fontWeight="900"
          fontFamily="monospace, sans-serif"
          textAnchor="middle"
        >
          &lt;/&gt;
        </text>

        {/* Laptop Base */}
        <path
          d="M 90 192 L 168 192 L 160 197 L 85 197 Z"
          fill="#64748B"
          stroke="#1E293B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Coffee Mug ("Good Code Today!") */}
        <g>
          <rect
            x="178"
            y="158"
            width="28"
            height="32"
            rx="5"
            fill="#FFFFFF"
            stroke="#1E293B"
            strokeWidth="3"
          />
          <path
            d="M 206 164 C 215 164 216 182 206 184"
            fill="none"
            stroke="#1E293B"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <text
            x="192"
            y="169"
            fill="#1E293B"
            fontSize="5.2"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            Good
          </text>
          <text
            x="192"
            y="176"
            fill="#1E293B"
            fontSize="5.2"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            Code
          </text>
          <text
            x="192"
            y="183"
            fill="#1E293B"
            fontSize="4.8"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            textAnchor="middle"
          >
            Today!
          </text>
        </g>
      </svg>
    </Box>
  );
}

export default function LogoutConfirmModal({
  open,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={isLoggingOut ? undefined : onClose}
      slotProps={{
        backdrop: {
          sx: {
            bgcolor: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(5px)',
          },
        },
        paper: {
          sx: {
            borderRadius: '22px',
            p: 0,
            maxWidth: { xs: '92vw', sm: 490 },
            width: '100%',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 48px -12px rgba(15, 23, 42, 0.22)',
            border: '1px solid #E2E8F0',
            position: 'relative',
            overflow: 'hidden',
          },
        },
      }}
    >
      {/* Top-Right Close Button */}
      <IconButton
        onClick={onClose}
        disabled={isLoggingOut}
        size="small"
        aria-label="Close"
        sx={{
          position: 'absolute',
          right: 14,
          top: 14,
          color: '#64748B',
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          p: 0.5,
          borderRadius: '50%',
          transition: 'all 0.2s ease',
          zIndex: 10,
          '&:hover': {
            bgcolor: '#F1F5F9',
            color: '#0F172A',
            transform: 'scale(1.06)',
          },
        }}
      >
        <CloseRoundedIcon sx={{ fontSize: 16, fontWeight: 700 }} />
      </IconButton>

      <DialogContent sx={{ p: { xs: 2.25, sm: 2.75 }, pb: { xs: 2, sm: 2.25 } }}>
        {/* Main Content Area: Left Illustration + Right Details */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: { xs: 1.5, sm: 2.25 },
            mb: 2.25,
          }}
        >
          {/* Left: Programmer Illustration */}
          <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
            <ProgrammerLeavingIllustration width={175} height={140} />
          </Box>

          {/* Right: Text Information */}
          <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
            {/* Playful Header with accent spark dashes */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'flex-start',
                position: 'relative',
                mb: 0.75,
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.55rem', sm: '1.8rem' },
                  color: '#0F172A',
                  letterSpacing: '-0.03em',
                  lineHeight: 1.1,
                }}
              >
                Log out?
              </Typography>
              {/* Playful Blue Accent Dashes */}
              <Box
                sx={{
                  position: 'absolute',
                  right: -14,
                  top: -4,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.4,
                  transform: 'rotate(20deg)',
                }}
              >
                <Box sx={{ width: 10, height: 2.8, bgcolor: '#2563EB', borderRadius: 2 }} />
                <Box sx={{ width: 6, height: 2.8, bgcolor: '#3B82F6', borderRadius: 2, ml: 0.4 }} />
              </Box>
            </Box>

            {/* Subtitles */}
            <Typography
              sx={{
                fontSize: '0.86rem',
                color: '#475569',
                fontWeight: 500,
                lineHeight: 1.4,
                mb: 0.5,
              }}
            >
              Are you sure you want to log out?
            </Typography>

            <Typography
              sx={{
                fontSize: '0.86rem',
                color: '#475569',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: { xs: 'center', sm: 'flex-start' },
                gap: 0.5,
              }}
            >
              <span>We&apos;ll miss you!</span>
              <span role="img" aria-label="blue-heart" style={{ fontSize: '0.95rem' }}>
                💙
              </span>
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons Row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 1.5,
            mb: 2,
          }}
        >
          {/* Cancel Button */}
          <Button
            onClick={onClose}
            disabled={isLoggingOut}
            variant="outlined"
            disableElevation
            sx={{
              borderRadius: '7px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: '#0F172A',
              borderColor: '#CBD5E1',
              borderWidth: '1.5px',
              py: 0.95,
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#F8FAFC',
                borderColor: '#94A3B8',
                borderWidth: '1.5px',
              },
            }}
          >
            Cancel
          </Button>

          {/* Log Out Button */}
          <Button
            onClick={onConfirm}
            disabled={isLoggingOut}
            variant="contained"
            disableElevation
            endIcon={
              !isLoggingOut ? <LogoutRoundedIcon sx={{ fontSize: 18 }} /> : undefined
            }
            sx={{
              borderRadius: '7px',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              bgcolor: '#2563EB',
              backgroundImage: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: '#FFFFFF',
              py: 0.95,
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#1D4ED8',
                backgroundImage: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
              },
            }}
          >
            {isLoggingOut ? (
              <CircularProgress size={18} sx={{ color: '#FFFFFF' }} />
            ) : (
              'Log out'
            )}
          </Button>
        </Box>

        {/* Bottom Cloud Footer Note with Lightbulb Icon */}
        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            pt: 1.25,
            borderTop: '1px dashed #E2E8F0',
            color: '#64748B',
          }}
        >
          <LightbulbOutlinedIcon sx={{ fontSize: 16, color: '#3B82F6' }} />
          <Typography
            sx={{
              fontSize: '0.78rem',
              fontWeight: 500,
              color: '#64748B',
            }}
          >
            You can always come back and keep coding!
          </Typography>
        </Box> */}
      </DialogContent>
    </Dialog>
  );
}
