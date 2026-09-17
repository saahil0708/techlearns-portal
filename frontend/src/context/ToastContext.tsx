'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Box, Typography, IconButton, Slide, SlideProps } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  message: string;
  title?: string;
  severity?: ToastSeverity;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  timestamp: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions | string, severity?: ToastSeverity) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global dispatcher reference for non-React context calls
let globalToastEmitter: ((options: ToastOptions | string, severity?: ToastSeverity) => void) | null = null;

export const toast = {
  success: (message: string, title?: string) => globalToastEmitter?.({ message, title, severity: 'success' }, 'success'),
  error: (message: string, title?: string) => globalToastEmitter?.({ message, title, severity: 'error' }, 'error'),
  info: (message: string, title?: string) => globalToastEmitter?.({ message, title, severity: 'info' }, 'info'),
  warning: (message: string, title?: string) => globalToastEmitter?.({ message, title, severity: 'warning' }, 'warning'),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions | string, severity: ToastSeverity = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const toastConfig: ToastItem =
        typeof options === 'string'
          ? { id, message: options, severity, duration: 4500, timestamp: Date.now() }
          : {
              id,
              message: options.message,
              title: options.title,
              severity: options.severity || severity || 'success',
              duration: options.duration ?? 4500,
              timestamp: Date.now(),
            };

      setToasts((prev) => [toastConfig, ...prev.slice(0, 4)]);

      if (toastConfig.duration && toastConfig.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, toastConfig.duration);
      }
    },
    [removeToast]
  );

  React.useEffect(() => {
    globalToastEmitter = showToast;
    return () => {
      globalToastEmitter = null;
    };
  }, [showToast]);

  const success = useCallback((message: string, title?: string) => {
    showToast({ message, title, severity: 'success' });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast({ message, title, severity: 'error' });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast({ message, title, severity: 'info' });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast({ message, title, severity: 'warning' });
  }, [showToast]);

  const getSeverityStyles = (severity: ToastSeverity) => {
    switch (severity) {
      case 'success':
        return {
          ringColor: '#10B981',
          ringBg: 'rgba(16, 185, 129, 0.16)',
          ringBorder: 'rgba(16, 185, 129, 0.4)',
          glowColor: 'rgba(16, 185, 129, 0.35)',
          icon: <CheckRoundedIcon sx={{ color: '#10B981', fontSize: '1rem', fontWeight: 800 }} />,
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          ringColor: '#EF4444',
          ringBg: 'rgba(239, 68, 68, 0.16)',
          ringBorder: 'rgba(239, 68, 68, 0.4)',
          glowColor: 'rgba(239, 68, 68, 0.35)',
          icon: <CloseRoundedIcon sx={{ color: '#EF4444', fontSize: '1rem', fontWeight: 800 }} />,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          ringColor: '#F59E0B',
          ringBg: 'rgba(245, 158, 11, 0.16)',
          ringBorder: 'rgba(245, 158, 11, 0.4)',
          glowColor: 'rgba(245, 158, 11, 0.35)',
          icon: <PriorityHighRoundedIcon sx={{ color: '#F59E0B', fontSize: '0.95rem', fontWeight: 800 }} />,
          defaultTitle: 'Warning',
        };
      case 'info':
      default:
        return {
          ringColor: '#3B82F6',
          ringBg: 'rgba(59, 130, 246, 0.16)',
          ringBorder: 'rgba(59, 130, 246, 0.4)',
          glowColor: 'rgba(59, 130, 246, 0.35)',
          icon: <InfoRoundedIcon sx={{ color: '#3B82F6', fontSize: '1rem', fontWeight: 800 }} />,
          defaultTitle: 'Notice',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Apple Dynamic Island Floating Notification Container */}
      <Box
        aria-live="polite"
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.25,
          pointerEvents: 'none',
          maxWidth: '560px',
          width: 'calc(100vw - 32px)',
        }}
      >
        {toasts.map((item) => {
          const style = getSeverityStyles(item.severity || 'success');
          return (
            <Box
              key={item.id}
              sx={{
                pointerEvents: 'auto',
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2.25,
                py: 1.2,
                borderRadius: '16px',
                bgcolor: '#090D14',
                background: 'linear-gradient(180deg, #111827 0%, #030712 100%)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.06), 0 0 24px -4px ${style.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                color: '#FFFFFF',
                maxWidth: 'min(92vw, 560px)',
                animation: 'dynamicIslandDrop 0.42s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '@keyframes dynamicIslandDrop': {
                  '0%': { transform: 'scale(0.65) translateY(-24px)', opacity: 0 },
                  '60%': { transform: 'scale(1.03) translateY(3px)', opacity: 1 },
                  '100%': { transform: 'scale(1) translateY(0)', opacity: 1 },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  transition: 'none',
                },
                transition: 'all 0.25s ease',
                '&:hover': {
                  boxShadow: `0 24px 48px -10px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.14), 0 0 30px -2px ${style.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.3)`,
                },
              }}
            >
              {/* Glowing Dynamic Ring Icon */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: style.ringBg,
                  border: `1.5px solid ${style.ringBorder}`,
                  boxShadow: `0 0 12px ${style.glowColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  animation: 'islandPulse 2s infinite ease-in-out',
                  '@keyframes islandPulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.08)', opacity: 0.85 },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                  },
                }}
              >
                {style.icon}
              </Box>

              {/* Text content with flexible, readable layout */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: { xs: 0.25, sm: 1 }, minWidth: 0, flex: 1 }}>
                <Typography
                  component="span"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {item.title || style.defaultTitle}
                </Typography>

                {item.message && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8rem',
                      color: '#94A3B8',
                      fontWeight: 450,
                      lineHeight: 1.35,
                      wordBreak: 'break-word',
                    }}
                  >
                    {item.message}
                  </Typography>
                )}
              </Box>

              {/* Subtle Dismiss Button */}
              <IconButton
                size="small"
                onClick={() => removeToast(item.id)}
                sx={{
                  color: 'rgba(255, 255, 255, 0.4)',
                  p: 0.35,
                  ml: 0.5,
                  borderRadius: '50%',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    color: '#FFFFFF',
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                  },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: '0.9rem' }} />
              </IconButton>
            </Box>
          );
        })}
      </Box>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
