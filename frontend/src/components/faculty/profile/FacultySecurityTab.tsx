'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';

interface FacultySecurityTabProps {
  twoFactorEnabled: boolean;
}

export default function FacultySecurityTab({ twoFactorEnabled }: FacultySecurityTabProps) {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // 2FA State
  const [is2FA, setIs2FA] = useState(twoFactorEnabled);
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [isEnabling2FA, setIsEnabling2FA] = useState(false);
  const [isDisabling2FA, setIsDisabling2FA] = useState(false);

  // Setup Modal State
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<'verify' | 'recovery'>('verify');
  const [secretData, setSecretData] = useState<{
    secret: string;
    otpauthUrl?: string;
    qrCodeUrl?: string;
    recoveryCodes: string[];
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [setupError, setSetupError] = useState<string | null>(null);

  // Disable Modal State
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState<string | null>(null);

  const borderColor = '#E2E8F0';

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long.', 'Password Error');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.', 'Password Error');
      return;
    }

    setIsChangingPass(true);
    try {
      await apiService.changePassword(currentPassword, newPassword);
      toast.success('Your password has been changed successfully.', 'Password Changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to change password.', 'Error');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleToggle2FA = async (enable: boolean) => {
    if (enable) {
      // Initiate 2FA Enable Workflow
      setIsGeneratingSecret(true);
      setSetupError(null);
      setVerificationCode('');
      setSetupStep('verify');
      try {
        const data = await apiService.generate2FASecret();
        setSecretData(data);
        setSetupModalOpen(true);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to initiate 2FA setup.', '2FA Setup Error');
      } finally {
        setIsGeneratingSecret(false);
      }
    } else {
      // Initiate 2FA Disable Workflow
      setDisableError(null);
      setDisableCode('');
      setDisableModalOpen(true);
    }
  };

  const handleConfirmEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretData || !verificationCode.trim()) return;

    setIsEnabling2FA(true);
    setSetupError(null);
    try {
      await apiService.enable2FA(
        secretData.secret,
        verificationCode.trim(),
        secretData.recoveryCodes || []
      );
      setIs2FA(true);
      setSetupStep('recovery');
      toast.success('Verification successful. Please store your backup recovery codes.', '2FA Verified');
    } catch (err: any) {
      setSetupError(err?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsEnabling2FA(false);
    }
  };

  const handleCopyRecoveryCodes = () => {
    if (!secretData?.recoveryCodes) return;
    navigator.clipboard.writeText(secretData.recoveryCodes.join('\n'));
    toast.success('Backup recovery codes copied to clipboard.', 'Copied');
  };

  const handleDownloadRecoveryCodes = () => {
    if (!secretData?.recoveryCodes) return;
    const element = document.createElement('a');
    const file = new Blob([secretData.recoveryCodes.join('\n')], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = '2fa-recovery-codes.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Recovery codes downloaded as text file.', 'Downloaded');
  };

  const handleFinishSetup = () => {
    setSetupModalOpen(false);
    setSecretData(null);
    setVerificationCode('');
    setSetupStep('verify');
    toast.success('Two-Factor Authentication is fully active.', 'Setup Complete');
  };

  const handleConfirmDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode.trim()) return;

    setIsDisabling2FA(true);
    setDisableError(null);
    try {
      await apiService.disable2FA(disableCode.trim());
      setIs2FA(false);
      setDisableModalOpen(false);
      setDisableCode('');
      toast.success('Two-Factor Authentication has been disabled.', '2FA Disabled');
    } catch (err: any) {
      setDisableError(err?.message || 'Invalid verification code. Failed to disable 2FA.');
    } finally {
      setIsDisabling2FA(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800 }}>
      {/* Password Management */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockResetRoundedIcon sx={{ color: '#2563EB', fontSize: 24 }} />
          Change Account Password
        </Typography>
        <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5, mb: 2.5 }}>
          Update your login password with standard complexity requirements (minimum 8 characters).
        </Typography>

        <Box component="form" onSubmit={handleChangePasswordSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            size="small"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="New Password"
              type="password"
              fullWidth
              size="small"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <TextField
              label="Confirm New Password"
              type="password"
              fullWidth
              size="small"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isChangingPass}
              sx={{
                bgcolor: '#2563EB',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 3,
                py: 1,
                '&:hover': { bgcolor: '#1D4ED8' },
              }}
            >
              {isChangingPass ? 'Updating Password...' : 'Save New Password'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Two-Factor Authentication & Session Security */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '20px',
          bgcolor: '#FFFFFF',
          border: `1px solid ${borderColor}`,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: '1.15rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
          <SecurityRoundedIcon sx={{ color: '#7C3AED', fontSize: 24 }} />
          Two-Factor Authentication & Verification
        </Typography>
        <Typography sx={{ fontSize: '0.84rem', color: '#64748B', mt: 0.5, mb: 2 }}>
          Enforce institutional login security using TOTP Authenticator apps (Google Authenticator, Authy).
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
          <Box>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
              Authenticator App (TOTP)
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#64748B' }}>
              {is2FA ? 'Two-Factor Authentication is currently active.' : 'Protect your faculty account with a one-time verification code.'}
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={is2FA}
                disabled={isGeneratingSecret}
                onChange={(e) => handleToggle2FA(e.target.checked)}
                color="primary"
              />
            }
            label=""
          />
        </Box>
      </Card>

      {/* 2FA Setup Modal */}
      <Dialog
        open={setupModalOpen}
        onClose={() => {
          if (setupStep === 'recovery') {
            handleFinishSetup();
          } else if (!isEnabling2FA) {
            setSetupModalOpen(false);
          }
        }}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            {setupStep === 'recovery' ? (
              <>
                <CheckCircleRoundedIcon sx={{ color: '#059669' }} />
                Backup Recovery Codes
              </>
            ) : (
              <>
                <QrCode2RoundedIcon sx={{ color: '#2563EB' }} />
                Set Up Two-Factor Authentication
              </>
            )}
          </Typography>
          <IconButton
            size="small"
            onClick={() => (setupStep === 'recovery' ? handleFinishSetup() : setSetupModalOpen(false))}
            disabled={isEnabling2FA}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        {setupStep === 'verify' ? (
          <Box component="form" onSubmit={handleConfirmEnable2FA}>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              {setupError && (
                <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.84rem' }}>
                  {setupError}
                </Alert>
              )}

              <Typography sx={{ fontSize: '0.86rem', color: '#475569' }}>
                Scan the QR code with your authenticator app (e.g. Google Authenticator, Authy, 1Password), or enter the secret key manually.
              </Typography>

              {secretData && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', border: `1px solid ${borderColor}` }}>
                  {secretData.qrCodeUrl ? (
                    <Box
                      component="img"
                      src={secretData.qrCodeUrl}
                      alt="2FA QR Code"
                      sx={{ width: 170, height: 170, borderRadius: '8px', bgcolor: '#FFFFFF', p: 1, border: `1px solid ${borderColor}`, mb: 1.5 }}
                    />
                  ) : secretData.otpauthUrl ? (
                    <Box
                      component="img"
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(secretData.otpauthUrl)}&size=170x170`}
                      alt="2FA QR Code"
                      sx={{ width: 170, height: 170, borderRadius: '8px', bgcolor: '#FFFFFF', p: 1, border: `1px solid ${borderColor}`, mb: 1.5 }}
                    />
                  ) : null}

                  <Box sx={{ width: '100%', textAlign: 'center' }}>
                    <Typography sx={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', mb: 0.5 }}>
                      Manual Secret Key
                    </Typography>
                    <Typography sx={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.92rem', color: '#2563EB', wordBreak: 'break-all', bgcolor: '#FFFFFF', p: 1, borderRadius: '6px', border: `1px solid ${borderColor}`, letterSpacing: '0.04em' }}>
                      {secretData.secret}
                    </Typography>
                  </Box>
                </Box>
              )}

              <TextField
                label="6-Digit Verification Code"
                placeholder="123456"
                fullWidth
                size="small"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
                helperText="Enter the 6-digit code shown in your authenticator app"
              />
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button onClick={() => setSetupModalOpen(false)} disabled={isEnabling2FA} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isEnabling2FA || verificationCode.length < 6}
                sx={{
                  bgcolor: '#2563EB',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  px: 3,
                  '&:hover': { bgcolor: '#1D4ED8' },
                }}
              >
                {isEnabling2FA ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Verify & Continue'}
              </Button>
            </DialogActions>
          </Box>
        ) : (
          <Box>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Alert severity="success" sx={{ borderRadius: '8px', fontSize: '0.84rem' }}>
                Two-Factor Authentication is now enabled for your account.
              </Alert>

              <Typography sx={{ fontSize: '0.86rem', color: '#475569' }}>
                Please save these one-time recovery codes in a secure location. If you lose access to your authenticator app, these codes are the only way to recover account access.
              </Typography>

              {secretData?.recoveryCodes && (
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: '10px', border: `1px solid ${borderColor}` }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
                    {secretData.recoveryCodes.map((code, idx) => (
                      <Chip
                        key={idx}
                        label={code}
                        size="small"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          bgcolor: '#FFFFFF',
                          border: `1px solid ${borderColor}`,
                          py: 1,
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ContentCopyRoundedIcon />}
                      onClick={handleCopyRecoveryCodes}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px' }}
                    >
                      Copy Codes
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleDownloadRecoveryCodes}
                      sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.8rem', borderRadius: '8px' }}
                    >
                      Download .txt
                    </Button>
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
              <Button
                variant="contained"
                onClick={handleFinishSetup}
                sx={{
                  bgcolor: '#059669',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '8px',
                  px: 3,
                  '&:hover': { bgcolor: '#047857' },
                }}
              >
                I Have Saved My Recovery Codes
              </Button>
            </DialogActions>
          </Box>
        )}
      </Dialog>

      {/* 2FA Disable Modal */}
      <Dialog
        open={disableModalOpen}
        onClose={() => !isDisabling2FA && setDisableModalOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: '16px', p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyRoundedIcon sx={{ color: '#EF4444' }} />
            Disable Two-Factor Authentication
          </Typography>
          <IconButton size="small" onClick={() => setDisableModalOpen(false)} disabled={isDisabling2FA}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleConfirmDisable2FA}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            {disableError && (
              <Alert severity="error" sx={{ borderRadius: '8px', fontSize: '0.84rem' }}>
                {disableError}
              </Alert>
            )}

            <Typography sx={{ fontSize: '0.86rem', color: '#475569' }}>
              Please enter the 6-digit code from your authenticator app to verify your identity and disable 2FA.
            </Typography>

            <TextField
              label="6-Digit Verification Code"
              placeholder="123456"
              fullWidth
              size="small"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDisableModalOpen(false)} disabled={isDisabling2FA} sx={{ textTransform: 'none', color: '#64748B', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="error"
              disabled={isDisabling2FA || disableCode.length < 6}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '8px',
                px: 3,
              }}
            >
              {isDisabling2FA ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Confirm Disable'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

