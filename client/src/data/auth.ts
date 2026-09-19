/**
 * Auth & Identity API Functions & Contracts
 */

import { API_URL, getAuthHeaders, deduplicatedQuery } from './client';
import { fetchGraphQL } from '@/lib/graphql';

export interface UserAuthResponse {
  user: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function loginApi(email: string, password: string): Promise<UserAuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Invalid credentials' }));
    throw new Error(err.message || 'Login failed');
  }
  return res.json();
}

export async function registerApi(name: string, email: string, password: string): Promise<UserAuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error(err.message || 'Registration failed');
  }
  return res.json();
}

export async function getMeApi() {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });
    if (res.ok) {
      const json = await res.json();
      return json.data ?? json;
    }
    return null;
  } catch {
    return null;
  }
}

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Password change failed' }));
    throw new Error(err.message || 'Password change failed');
  }
  return res.json();
}

export async function acceptInvitationApi(token: string, password: string) {
  const res = await fetch(`${API_URL}/auth/accept-invitation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Invitation activation failed' }));
    throw new Error(err.message || 'Invitation activation failed');
  }
  return res.json();
}

export async function generate2FASecretApi() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/2fa/generate`, {
    method: 'POST',
    headers,
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to generate 2FA secret');
  return res.json();
}

export async function enable2FAApi(secret: string, token: string, recoveryCodes: string[]) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/2fa/enable`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ secret, token, recoveryCodes }),
  });
  if (!res.ok) throw new Error('Failed to enable 2FA');
  return res.json();
}

export async function disable2FAApi(token: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/2fa/disable`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Failed to disable 2FA');
  return res.json();
}

export async function getPasskeysApi() {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/passkeys`, {
    method: 'GET',
    headers,
    credentials: 'include',
  });
  if (!res.ok) return [];
  return res.json();
}

export async function deletePasskeyApi(id: string) {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_URL}/auth/passkeys/${id}`, {
    method: 'DELETE',
    headers,
    credentials: 'include',
  });
  return res.ok;
}
