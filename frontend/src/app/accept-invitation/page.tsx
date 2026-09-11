'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Button, Container, Paper, TextField, Typography } from '@mui/material';
import { apiService } from '@/lib/api-service';
import { extractRole, getRoleDefaultPath } from '@/utils/role-routing';

function AcceptInvitationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (!token) return setError('This invitation link is missing its activation token.');
    if (password.length < 8) return setError('Choose a password with at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const result = await apiService.acceptInvitation(token, password);
      const role = extractRole(result.tokens?.accessToken) || extractRole(result.user) || 'STUDENT';
      router.replace(getRoleDefaultPath(role));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to activate invitation.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', p: { xs: 3, sm: 5 }, borderRadius: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>Activate your account</Typography>
        <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
          Choose a password to finish setting up your CodePlatform account.
        </Typography>
        <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
          <TextField label="Confirm password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? 'Activating…' : 'Activate account'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={null}>
      <AcceptInvitationForm />
    </Suspense>
  );
}

