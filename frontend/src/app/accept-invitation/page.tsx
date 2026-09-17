'use client';

import React, { FormEvent, Suspense, useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import { apiService } from '@/lib/api-service';
import { extractRole, getRoleDefaultPath } from '@/utils/role-routing';
import { useAppDispatch } from '@/store/hooks';
import { setUser, setClientAuthCookie, checkCurrentUser } from '@/store/slices/authSlice';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

function getPasswordStrength(pwd: string): {
  score: number;
  label: string;
  color: string;
  hasLength: boolean;
  hasUpper: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
} {
  const hasLength = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);

  if (!pwd) {
    return { score: 0, label: 'Enter password', color: '#94A3B8', hasLength, hasUpper, hasNumber, hasSpecial };
  }

  let rawScore = 0;
  if (hasLength) rawScore += 30;
  if (pwd.length >= 12) rawScore += 15;
  if (hasUpper) rawScore += 20;
  if (hasNumber) rawScore += 20;
  if (hasSpecial) rawScore += 15;

  if (rawScore < 40) return { score: Math.min(rawScore, 30), label: 'Weak', color: '#EF4444', hasLength, hasUpper, hasNumber, hasSpecial };
  if (rawScore < 70) return { score: rawScore, label: 'Moderate', color: '#F59E0B', hasLength, hasUpper, hasNumber, hasSpecial };
  if (rawScore < 90) return { score: rawScore, label: 'Strong', color: '#3B82F6', hasLength, hasUpper, hasNumber, hasSpecial };
  return { score: 100, label: 'Very Strong', color: '#10B981', hasLength, hasUpper, hasNumber, hasSpecial };
}

function AcceptInvitationForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');

    if (!token) {
      setError('This invitation link is missing its activation token. Please request a new invite link.');
      return;
    }
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await apiService.acceptInvitation(token, password);
      const { tokens, accessToken: rawAccessToken, refreshToken: _refreshToken, user: rawUser, ...userFields } = result || {};
      const user = rawUser || (Object.keys(userFields).length > 0 ? userFields : null);
      const accessToken = tokens?.accessToken || rawAccessToken;

      // 1. Establish auth cookies
      if (accessToken) {
        setClientAuthCookie(accessToken);
      }

      // 2. Hydrate local storage and Redux user store immediately
      if (user) {
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('codeplatform_user', JSON.stringify(user));
          } catch {}
        }
        dispatch(setUser(user));
        // Refresh session in background to pull active batch & profile metrics
        dispatch(checkCurrentUser());
      }

      toast.success(
        `Welcome to CodePlatform, ${user?.name || 'Coder'}! Your account is activated.`,
        'Account Activated'
      );

      const role = extractRole(accessToken) || extractRole(user) || 'STUDENT';
      const targetPath = getRoleDefaultPath(role);

      // Replace route seamlessly
      router.replace(targetPath);
    } catch (cause: any) {
      const msg = cause instanceof Error ? cause.message : 'Unable to activate invitation.';
      setError(msg);
      toast.error(msg, 'Activation Error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        bgcolor: '#F8FAFC',
        backgroundImage: `
          radial-gradient(at 10% 10%, rgba(37, 99, 235, 0.07) 0px, transparent 45%),
          radial-gradient(at 90% 90%, rgba(99, 102, 241, 0.05) 0px, transparent 45%),
          radial-gradient(at 50% 50%, rgba(14, 165, 233, 0.03) 0px, transparent 50%)
        `,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Grid Lines */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(15, 23, 42, 0.035) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.035) 1px, transparent 1px)
          `,
          backgroundSize: '36px 36px',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: { xs: 2, sm: 4 } }}>
        {/* Brand Header */}
        <Box sx={{ textAlign: 'center', mb: 3.5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              width: 54,
              height: 54,
              borderRadius: '16px',
              bgcolor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.18)',
            }}
          >
            <CodeRoundedIcon sx={{ color: '#2563EB', fontSize: 28 }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.65rem', sm: '2rem' },
              color: '#0F172A',
              letterSpacing: '-0.025em',
            }}
          >
            Activate Your Account
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748B',
              mt: 1,
              fontSize: '0.92rem',
              maxWidth: 420,
              lineHeight: 1.55,
            }}
          >
            Set up a secure password to finalize your profile and access your coding courses, contests, and benchmarks.
          </Typography>
        </Box>

        {/* Card Form */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: '24px',
            bgcolor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.07), 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Missing Token Warning */}
          {!token && (
            <Alert
              severity="warning"
              icon={<ErrorOutlineRoundedIcon sx={{ color: '#D97706' }} />}
              sx={{
                mb: 3,
                bgcolor: '#FFFBEB',
                color: '#92400E',
                border: '1px solid #FDE68A',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 500,
              }}
            >
              Missing activation token in the URL. If you received an invitation email, make sure you clicked the full link.
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: '#FEF2F2',
                color: '#991B1B',
                border: '1px solid #FECACA',
                borderRadius: '12px',
                fontSize: '0.84rem',
                fontWeight: 500,
              }}
            >
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={submit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Password Input */}
            <Box>
              <Typography sx={{ color: '#334155', fontSize: '0.84rem', fontWeight: 700, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span>Create Password</span>
                {password && (
                  <span style={{ color: strength.color, fontWeight: 700 }}>
                    {strength.label}
                  </span>
                )}
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter at least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={submitting || !token}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockRoundedIcon sx={{ color: '#64748B', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
                        >
                          {showPassword ? <VisibilityOffRoundedIcon sx={{ fontSize: 20 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    color: '#0F172A',
                    fontSize: '0.92rem',
                    transition: 'all 0.15s ease',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px', bgcolor: '#FFFFFF' },
                  },
                }}
              />

              {/* Password Strength Progress */}
              {password && (
                <Box sx={{ mt: 1.25 }}>
                  <LinearProgress
                    variant="determinate"
                    value={strength.score}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: '#E2E8F0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: strength.color,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                      },
                    }}
                  />
                  {/* Requirements Pills */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
                    <Chip
                      size="small"
                      label="8+ chars"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: strength.hasLength ? '#ECFDF5' : '#F1F5F9',
                        color: strength.hasLength ? '#059669' : '#64748B',
                        border: `1px solid ${strength.hasLength ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    />
                    <Chip
                      size="small"
                      label="Uppercase"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: strength.hasUpper ? '#ECFDF5' : '#F1F5F9',
                        color: strength.hasUpper ? '#059669' : '#64748B',
                        border: `1px solid ${strength.hasUpper ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    />
                    <Chip
                      size="small"
                      label="Number"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: strength.hasNumber ? '#ECFDF5' : '#F1F5F9',
                        color: strength.hasNumber ? '#059669' : '#64748B',
                        border: `1px solid ${strength.hasNumber ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    />
                    <Chip
                      size="small"
                      label="Symbol"
                      sx={{
                        height: 22,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        bgcolor: strength.hasSpecial ? '#ECFDF5' : '#F1F5F9',
                        color: strength.hasSpecial ? '#059669' : '#64748B',
                        border: `1px solid ${strength.hasSpecial ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    />
                  </Box>
                </Box>
              )}
            </Box>

            {/* Confirm Password Input */}
            <Box>
              <Typography sx={{ color: '#334155', fontSize: '0.84rem', fontWeight: 700, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                <span>Confirm Password</span>
                {passwordsMatch && (
                  <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> Match
                  </span>
                )}
              </Typography>
              <TextField
                fullWidth
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-type your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={submitting || !token}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyRoundedIcon sx={{ color: '#64748B', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#64748B', '&:hover': { color: '#0F172A' } }}
                        >
                          {showConfirmPassword ? <VisibilityOffRoundedIcon sx={{ fontSize: 20 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    color: '#0F172A',
                    fontSize: '0.92rem',
                    transition: 'all 0.15s ease',
                    '& fieldset': {
                      borderColor: passwordsMatch ? '#059669' : '#E2E8F0',
                    },
                    '&:hover fieldset': { borderColor: '#CBD5E1' },
                    '&.Mui-focused fieldset': { borderColor: '#2563EB', borderWidth: '1.5px', bgcolor: '#FFFFFF' },
                  },
                }}
              />
            </Box>

            {/* Submit CTA */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting || !token || password.length < 8 || password !== confirmPassword}
              endIcon={!submitting && <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: '12px',
                bgcolor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#1D4ED8',
                  boxShadow: '0 6px 20px rgba(37, 99, 235, 0.4)',
                  transform: 'translateY(-1px)',
                },
                '&.Mui-disabled': {
                  bgcolor: '#F1F5F9',
                  color: '#94A3B8',
                  boxShadow: 'none',
                },
              }}
            >
              {submitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={18} sx={{ color: '#FFFFFF' }} />
                  <span>Activating Account...</span>
                </Box>
              ) : (
                'Activate Account & Launch'
              )}
            </Button>
          </Box>

          {/* Footer Security Badge */}
          <Box
            sx={{
              mt: 3.5,
              pt: 2.5,
              borderTop: '1px solid #F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <ShieldRoundedIcon sx={{ color: '#059669', fontSize: 16 }} />
              <Typography sx={{ color: '#64748B', fontSize: '0.78rem', fontWeight: 600 }}>
                256-bit TLS Encrypted
              </Typography>
            </Box>
            <Link
              href="/login"
              style={{
                color: '#2563EB',
                fontSize: '0.8rem',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Already activated? Sign in &rarr;
            </Link>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress sx={{ color: '#2563EB' }} />
        </Box>
      }
    >
      <AcceptInvitationForm />
    </Suspense>
  );
}

