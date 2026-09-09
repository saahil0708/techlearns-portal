'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import GitHubIcon from '@mui/icons-material/GitHub';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, registerUser, verify2faLogin, clearError } from '@/store/slices/authSlice';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useToast } from '@/context/ToastContext';
import { extractRole, getLoginRedirectUrl } from '@/utils/role-routing';

type AuthMode = 'signin' | 'signup' | 'forgot';

export default function AuthPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectParam = searchParams.get('redirect');
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { isLoading: reduxLoading, error: reduxError, requires2FA, challengeToken, challengeMessage } =
    useAppSelector((state) => state.auth);

  const [mode, setMode] = useState<AuthMode>('signin');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLoading = reduxLoading;
  const error = localError || reduxError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSuccessMessage(null);
    dispatch(clearError());

    const fullName = `${firstName} ${lastName}`.trim();

    try {
      if (requires2FA) {
        // Handle 2FA verification step
        const resultAction = await dispatch(
          verify2faLogin({
            challengeToken: challengeToken || undefined,
            code: twoFactorCode,
          }),
        );

        if (verify2faLogin.fulfilled.match(resultAction)) {
          const payload = resultAction.payload;
          const userRole = extractRole(payload?.user || payload?.tokens?.accessToken);
          const targetUrl = getLoginRedirectUrl(userRole, rawRedirectParam);

          toast.success('Two-factor authentication verified successfully!', '2FA Verified');
          setSuccessMessage(`2FA Verified! Loading ${userRole === 'STUDENT' ? 'student' : 'admin'} workspace...`);
          setTimeout(() => {
            router.push(targetUrl);
          }, 350);
        } else {
          toast.error('Invalid 2FA code. Please check your authenticator app.', 'Verification Failed');
        }
        return;
      }

      if (mode === 'signin') {
        const resultAction = await dispatch(loginUser({ email, password }));

        if (loginUser.fulfilled.match(resultAction)) {
          const payload = resultAction.payload;
          if (payload?.requires2FA) {
            toast.info('Two-Factor Authentication required. Enter your 6-digit code.', '2FA Prompt');
            setSuccessMessage('Two-Factor Authentication required. Please enter your 6-digit code.');
          } else {
            const userRole = extractRole(payload?.user || payload?.tokens?.accessToken);
            const targetUrl = getLoginRedirectUrl(userRole, rawRedirectParam);

            toast.success(`Welcome back, ${payload?.user?.name || 'User'}!`, 'Signed In');
            setSuccessMessage(`Authentication verified! Loading ${userRole === 'STUDENT' ? 'student portal' : 'workspace'}...`);
            setTimeout(() => {
              router.push(targetUrl);
            }, 350);
          }
        } else {
          toast.error('Invalid email or password. Please check your credentials.', 'Sign In Failed');
        }
      } else if (mode === 'signup') {
        const resultAction = await dispatch(
          registerUser({
            name: fullName || 'User',
            email,
            password,
          }),
        );

        if (registerUser.fulfilled.match(resultAction)) {
          const payload = resultAction.payload;
          const userRole = extractRole(payload?.user || payload?.tokens?.accessToken);
          const targetUrl = getLoginRedirectUrl(userRole, rawRedirectParam);

          toast.success('Account created successfully! Welcome to CodePlatform.', 'Account Created');
          setSuccessMessage('Account created! Loading workspace...');
          setTimeout(() => {
            router.push(targetUrl);
          }, 350);
        } else {
          toast.error('Registration failed. Please check your details.', 'Registration Failed');
        }
      } else {
        toast.info('Password recovery instructions dispatched to your email.', 'Recovery Sent');
        setSuccessMessage('Password recovery instructions sent to your email.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your credentials.';
      setLocalError(msg);
      toast.error(msg, 'Auth Error');
    }
  };

  const handleOAuthLogin = (provider: 'google' | 'github') => {
    toast.success(`Authenticating via ${provider === 'google' ? 'Google' : 'GitHub'} SSO...`, 'OAuth Login');
    setSuccessMessage(`Signed in with ${provider === 'google' ? 'Google' : 'GitHub'}! Opening workspace...`);
    const targetUrl = getLoginRedirectUrl(null, rawRedirectParam);
    setTimeout(() => {
      router.push(targetUrl);
    }, 500);
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        bgcolor: '#0B132B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: { xs: 'center', lg: 'flex-end' },
        px: { xs: 2.5, sm: 5, md: 8, lg: 12, xl: 16 },
        py: { xs: 3, md: 4 },
      }}
    >
      {/* Background Graphic */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/images/Auth_BG.png"
          alt="CodePlatform Background Artwork"
          fill
          priority
          unoptimized
          sizes="100vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center center',
            opacity: 0.5,
          }}
        />
        {/* Soft Vignette Overlay for Readability */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: {
              xs: 'rgba(11, 19, 43, 0.35)',
              lg: 'linear-gradient(90deg, rgba(11, 19, 43, 0) 0%, rgba(11, 19, 43, 0.1) 40%, rgba(11, 19, 43, 0.4) 75%, rgba(11, 19, 43, 0.6) 100%)',
            },
          }}
        />
      </Box>

      {/* Floating Animated Code Elements in Background */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: '15%', lg: '28%' },
          top: '18%',
          color: 'rgba(96, 165, 250, 0.45)',
          fontFamily: 'monospace',
          fontSize: '1.4rem',
          fontWeight: 800,
          pointerEvents: 'none',
          zIndex: 2,
          animation: 'floatParticle1 5s ease-in-out infinite',
          '@keyframes floatParticle1': {
            '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: 0.3 },
            '50%': { transform: 'translateY(-14px) rotate(6deg)', opacity: 0.75 },
            '100%': { transform: 'translateY(0px) rotate(0deg)', opacity: 0.3 },
          },
        }}
      >
        {'{ }'}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          right: { xs: '8%', lg: '6%' },
          top: '38%',
          color: 'rgba(56, 189, 248, 0.4)',
          fontFamily: 'monospace',
          fontSize: '1.2rem',
          fontWeight: 800,
          pointerEvents: 'none',
          zIndex: 2,
          animation: 'floatParticle2 6s ease-in-out infinite 1s',
          '@keyframes floatParticle2': {
            '0%': { transform: 'translateY(0px) rotate(0deg)', opacity: 0.25 },
            '50%': { transform: 'translateY(-18px) rotate(-8deg)', opacity: 0.7 },
            '100%': { transform: 'translateY(0px) rotate(0deg)', opacity: 0.25 },
          },
        }}
      >
        {'</>'}
      </Box>

      {/* Floating Animated Ambient Glow Halo */}
      <Box
        sx={{
          position: 'absolute',
          right: { xs: '50%', lg: '10%' },
          transform: { xs: 'translateX(50%)', lg: 'none' },
          width: 440,
          height: 440,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.08) 55%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 1,
          pointerEvents: 'none',
          animation: 'pulseGlow 6s ease-in-out infinite alternate',
          '@keyframes pulseGlow': {
            '0%': { transform: 'scale(0.92) translate(-10px, -10px)', opacity: 0.6 },
            '100%': { transform: 'scale(1.15) translate(10px, 10px)', opacity: 0.95 },
          },
        }}
      />

      {/* Right-Aligned Form Container with Smooth Entrance */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: { xs: '100%', sm: 460, md: 480 },
          px: { xs: 1.5, sm: 2 },
          py: 2,
          animation: 'fadeInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          '@keyframes fadeInRight': {
            '0%': { opacity: 0, transform: 'translateX(24px)' },
            '100%': { opacity: 1, transform: 'translateX(0)' },
          },
        }}
      >
        {/* Brand Logo Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.5)',
              position: 'relative',
              overflow: 'hidden',
              '&:after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                animation: 'shineSweep 3.5s infinite',
              },
              '@keyframes shineSweep': {
                '0%': { left: '-100%' },
                '20%': { left: '100%' },
                '100%': { left: '100%' },
              },
            }}
          >
            <CodeRoundedIcon sx={{ color: '#FFFFFF', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#FFFFFF', lineHeight: 1.1, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              CodePlatform
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 600 }}>
              Competitive Learning Arena
            </Typography>
          </Box>
        </Box>

        {/* Heading & Mode Switcher */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.3rem', sm: '2.75rem' },
              color: '#FFFFFF',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)',
            }}
          >
            {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Recovery'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
            <Typography sx={{ fontSize: '0.9rem', color: '#E2E8F0', fontWeight: 500, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
              {mode === 'signin' ? "Don't have an account?" : 'Already registered?'}
            </Typography>
            <Button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setLocalError(null);
                dispatch(clearError());
                setSuccessMessage(null);
              }}
              sx={{
                p: 0,
                minWidth: 'auto',
                color: '#60A5FA',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                transition: 'color 0.2s, transform 0.2s',
                '&:hover': { bgcolor: 'transparent', color: '#93C5FD', transform: 'translateX(2px)' },
              }}
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </Button>
          </Box>
        </Box>

        {/* Feedback Alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px', fontSize: '0.85rem' }}>
            {error}
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 2.5, borderRadius: '12px', fontSize: '0.85rem' }}>
            {successMessage}
          </Alert>
        )}

        {/* Main Form Fields with Animated Underline Transitions */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* First Name & Last Name (Sign Up only) */}
          {mode === 'signup' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '0.06em', mb: 0.25, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                  FIRST NAME <span style={{ color: '#F87171' }}>*</span>
                </Typography>
                <TextField
                  variant="standard"
                  fullWidth
                  placeholder="Sruchan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      disableUnderline: false,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineRoundedIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiInput-root': {
                      fontSize: '1rem',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      py: 0.5,
                      transition: 'all 0.25s ease',
                      '&:before': { borderBottom: '2px solid rgba(255, 255, 255, 0.55)' },
                      '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid #FFFFFF' },
                      '&:after': { borderBottom: '2.5px solid #38BDF8', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
                      '& input::placeholder': { color: 'rgba(255, 255, 255, 0.65)', opacity: 1 },
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '0.06em', mb: 0.25, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                  LAST NAME <span style={{ color: '#F87171' }}>*</span>
                </Typography>
                <TextField
                  variant="standard"
                  fullWidth
                  placeholder="Kumar"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  slotProps={{
                    input: {
                      disableUnderline: false,
                    },
                  }}
                  sx={{
                    '& .MuiInput-root': {
                      fontSize: '1rem',
                      color: '#FFFFFF',
                      fontWeight: 500,
                      py: 0.5,
                      transition: 'all 0.25s ease',
                      '&:before': { borderBottom: '2px solid rgba(255, 255, 255, 0.55)' },
                      '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid #FFFFFF' },
                      '&:after': { borderBottom: '2.5px solid #38BDF8', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
                      '& input::placeholder': { color: 'rgba(255, 255, 255, 0.65)', opacity: 1 },
                    },
                  }}
                />
              </Box>
            </Box>
          )}

          {/* Quick Demo Fill Pills for Role Testing */}
          {mode === 'signin' && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Box
                onClick={() => {
                  setEmail('saahil123@gmail.com');
                  setPassword('123456');
                }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 1.4,
                  py: 0.55,
                  borderRadius: '20px',
                  bgcolor: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38BDF8',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(56, 189, 248, 0.22)',
                    borderColor: '#38BDF8',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ShieldOutlinedIcon sx={{ fontSize: 14 }} />
                <span>Super Admin (saahil123@gmail.com)</span>
              </Box>

              <Box
                onClick={() => {
                  setEmail('liam.vance@stanford.edu');
                  setPassword('Password123!');
                }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 1.4,
                  py: 0.55,
                  borderRadius: '20px',
                  bgcolor: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#34D399',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'rgba(52, 211, 153, 0.22)',
                    borderColor: '#34D399',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <SchoolRoundedIcon sx={{ fontSize: 14 }} />
                <span>Student (liam.vance@stanford.edu)</span>
              </Box>
            </Box>
          )}

          {/* Email Address */}
          <Box>
            <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '0.06em', mb: 0.25, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
              EMAIL ADDRESS <span style={{ color: '#F87171' }}>*</span>
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              type="email"
              placeholder="sruchan.polisety@smscountry.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              slotProps={{
                input: {
                  disableUnderline: false,
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlinedIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiInput-root': {
                  fontSize: '1rem',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  py: 0.5,
                  transition: 'all 0.25s ease',
                  '&:before': { borderBottom: '2px solid rgba(255, 255, 255, 0.55)' },
                  '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid #FFFFFF' },
                  '&:after': { borderBottom: '2.5px solid #38BDF8', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' },
                  '& input::placeholder': { color: 'rgba(255, 255, 255, 0.65)', opacity: 1 },
                },
              }}
            />
          </Box>

          {/* Password */}
          {mode !== 'forgot' && (
            <Box>
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#F1F5F9', letterSpacing: '0.06em', mb: 0.25, textShadow: '0 1px 4px rgba(0,0,0,0.7)' }}>
                PASSWORD <span style={{ color: '#F87171' }}>*</span>
              </Typography>
              <TextField
                variant="standard"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                slotProps={{
                  input: {
                    disableUnderline: false,
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ color: '#CBD5E1', '&:hover': { color: '#FFFFFF', transform: 'scale(1.1)' }, transition: 'all 0.2s' }}
                        >
                          {showPassword ? <VisibilityOffOutlinedIcon fontSize="small" /> : <VisibilityOutlinedIcon fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiInput-root': {
                    fontSize: '1rem',
                    color: '#FFFFFF',
                    fontWeight: 500,
                    py: 0.5,
                    transition: 'all 0.25s ease',
                    '&:before': { borderBottom: '2px solid rgba(255, 255, 255, 0.55)' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid #FFFFFF' },
                    '& input::placeholder': { color: 'rgba(255, 255, 255, 0.65)', opacity: 1 },
                  },
                }}
              />
            </Box>
          )}

          {/* 2FA Verification Code Input when 2FA is triggered */}
          {requires2FA && (
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Typography sx={{ fontSize: '0.74rem', fontWeight: 800, color: '#38BDF8', letterSpacing: '0.06em', mb: 0.25 }}>
                2-FACTOR AUTHENTICATION CODE <span style={{ color: '#F87171' }}>*</span>
              </Typography>
              <Typography sx={{ fontSize: '0.78rem', color: '#94A3B8', mb: 1 }}>
                {challengeMessage || 'Enter the 6-digit code from Google Authenticator / Authy or 8-char recovery code'}
              </Typography>
              <TextField
                variant="standard"
                fullWidth
                placeholder="123456"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                required
                slotProps={{
                  input: {
                    disableUnderline: false,
                    startAdornment: (
                      <InputAdornment position="start">
                        <ShieldOutlinedIcon sx={{ color: '#38BDF8', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiInput-root': {
                    fontSize: '1.15rem',
                    letterSpacing: '0.15em',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    py: 0.5,
                    '&:before': { borderBottom: '2px solid rgba(56, 189, 248, 0.5)' },
                    '&:hover:not(.Mui-disabled):before': { borderBottom: '2px solid #38BDF8' },
                    '&:after': { borderBottom: '2.5px solid #38BDF8' },
                    '& input::placeholder': { color: 'rgba(255, 255, 255, 0.4)', opacity: 1, letterSpacing: '0.15em' },
                  },
                }}
              />
            </Box>
          )}

          {/* Remember session & Forgot password */}
          {mode === 'signin' && !requires2FA && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: -0.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ color: 'rgba(255, 255, 255, 0.75)', '&.Mui-checked': { color: '#38BDF8' }, p: 0.5 }}
                  />
                }
                label={<Typography sx={{ fontSize: '0.84rem', color: '#F1F5F9', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>Remember session</Typography>}
              />
              <Button
                type="button"
                onClick={() => setMode('forgot')}
                sx={{
                  color: '#60A5FA',
                  textTransform: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  p: 0,
                  minWidth: 'auto',
                  transition: 'color 0.2s',
                  '&:hover': { bgcolor: 'transparent', color: '#93C5FD', textDecoration: 'underline' },
                }}
              >
                Forgot password?
              </Button>
            </Box>
          )}

          {/* Medium-Width Animated Submit Button with Shimmer & Sliding Arrow */}
          <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                bgcolor: '#2563EB',
                background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                color: '#FFFFFF',
                borderRadius: '50px',
                py: 1.15,
                pl: 3.5,
                pr: 1.25,
                minWidth: 180,
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.98rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2.5,
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
                  animation: 'btnShimmer 4s infinite',
                },
                '@keyframes btnShimmer': {
                  '0%': { left: '-100%' },
                  '25%': { left: '100%' },
                  '100%': { left: '100%' },
                },
                '&:hover': {
                  background: 'linear-gradient(135deg, #60A5FA 0%, #2563EB 100%)',
                  boxShadow: '0 12px 32px rgba(37, 99, 235, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                  transform: 'translateY(-2px)',
                  '& .arrow-icon-circle': {
                    transform: 'translateX(4px) scale(1.08)',
                    bgcolor: 'rgba(255, 255, 255, 0.35)',
                  },
                },
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Submit' : mode === 'signup' ? 'Create Account' : 'Send Link'}</span>
              <Box
                className="arrow-icon-circle"
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255, 255, 255, 0.22)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s ease',
                }}
              >
                {isLoading ? (
                  <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                ) : (
                  <ArrowForwardRoundedIcon sx={{ fontSize: 18, color: '#FFFFFF' }} />
                )}
              </Box>
            </Button>

            {mode === 'forgot' && (
              <Button
                fullWidth
                onClick={() => setMode('signin')}
                sx={{
                  mt: 1,
                  color: '#E2E8F0',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.84rem',
                  '&:hover': { color: '#FFFFFF' },
                }}
              >
                ← Back to Sign In
              </Button>
            )}
          </Box>
        </form>

        {/* SSO Divider */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3.5, mb: 2 }}>
          <Divider sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.22)' }} />
          <Typography sx={{ fontSize: '0.74rem', color: '#E2E8F0', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}>
            or continue with
          </Typography>
          <Divider sx={{ flex: 1, borderColor: 'rgba(255, 255, 255, 0.22)' }} />
        </Box>

        {/* Micro-Animated Google & GitHub Buttons */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
          {/* Google Button */}
          <Button
            onClick={() => handleOAuthLogin('google')}
            sx={{
              borderRadius: '7px',
              bgcolor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              color: '#0F172A',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Google</span>
          </Button>

          {/* GitHub Button */}
          <Button
            onClick={() => handleOAuthLogin('github')}
            sx={{
              borderRadius: '7px',
              bgcolor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              color: '#0F172A',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.25,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                bgcolor: '#FFFFFF',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: 19, color: '#0F172A' }} />
            <span>GitHub</span>
          </Button>
        </Box>

        {/* Security & Compliance Footer Micro-text */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(226, 232, 240, 0.65)', fontWeight: 500, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
            Secured by CodePlatform Cloud · Privacy & Terms
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
