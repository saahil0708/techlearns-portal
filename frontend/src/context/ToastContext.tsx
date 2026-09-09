'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Box, Typography, IconButton, Slide, SlideProps } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import InfoRoundedIcon from '@mui/icons-material/InfoRounded';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
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
          borderColor: 'rgba(34, 197, 94, 0.5)',
          iconColor: '#22C55E',
          bgGradient: 'linear-gradient(135deg, rgba(6, 78, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
          accentColor: '#4ADE80',
          icon: <CheckCircleRoundedIcon sx={{ color: '#22C55E', fontSize: '1.4rem' }} />,
          defaultTitle: 'Success',
        };
      case 'error':
        return {
          borderColor: 'rgba(239, 68, 68, 0.5)',
          iconColor: '#EF4444',
          bgGradient: 'linear-gradient(135deg, rgba(127, 29, 29, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
          accentColor: '#F87171',
          icon: <ErrorRoundedIcon sx={{ color: '#EF4444', fontSize: '1.4rem' }} />,
          defaultTitle: 'Error',
        };
      case 'warning':
        return {
          borderColor: 'rgba(245, 158, 11, 0.5)',
          iconColor: '#F59E0B',
          bgGradient: 'linear-gradient(135deg, rgba(120, 53, 15, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
          accentColor: '#FBBF24',
          icon: <WarningRoundedIcon sx={{ color: '#F59E0B', fontSize: '1.4rem' }} />,
          defaultTitle: 'Warning',
        };
      case 'info':
      default:
        return {
          borderColor: 'rgba(59, 130, 246, 0.5)',
          iconColor: '#3B82F6',
          bgGradient: 'linear-gradient(135deg, rgba(30, 58, 138, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
          accentColor: '#60A5FA',
          icon: <InfoRoundedIcon sx={{ color: '#3B82F6', fontSize: '1.4rem' }} />,
          defaultTitle: 'Information',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}

      {/* Floating Toast Notification Container */}
      <Box
        aria-live="polite"
        sx={{
          position: 'fixed',
          top: 24,
          right: 24,
          zIndex: 999999,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          pointerEvents: 'none',
          maxWidth: '440px',
          width: 'calc(100vw - 48px)',
        }}
      >
        {toasts.map((item) => {
          const style = getSeverityStyles(item.severity || 'success');
          return (
            <Box
              key={item.id}
              sx={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.75,
                p: '16px 20px',
                borderRadius: '16px',
                background: style.bgGradient,
                border: `1px solid ${style.borderColor}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 1px 1px rgba(255, 255, 255, 0.15) inset',
                backdropFilter: 'blur(24px)',
                color: '#F8FAFC',
                animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                '@keyframes slideInRight': {
                  '0%': { transform: 'translateX(40px) scale(0.95)', opacity: 0 },
                  '100%': { transform: 'translateX(0) scale(1)', opacity: 1 },
                },
              }}
            >
              <Box sx={{ mt: '2px', display: 'flex', alignItems: 'center' }}>
                {style.icon}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    color: style.accentColor,
                    lineHeight: 1.3,
                    mb: '2px',
                  }}
                >
                  {item.title || style.defaultTitle}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.84rem',
                    color: '#E2E8F0',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}
                >
                  {item.message}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => removeToast(item.id)}
                sx={{
                  color: '#94A3B8',
                  p: 0.5,
                  mt: '-2px',
                  mr: '-4px',
                  '&:hover': { color: '#FFFFFF', bgcolor: 'rgba(255, 255, 255, 0.1)' },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: '1.1rem' }} />
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
