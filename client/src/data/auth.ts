/**
 * Auth & Identity API Functions & Contracts (Axios)
 */

import { apiClient } from '@/lib/axios';

export interface UserAuthResponse {
  user: any;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
}

export async function loginApi(email: string, password: string): Promise<UserAuthResponse> {
  const res = await apiClient.post('/auth/login', { email, password });
  return res.data;
}

export async function registerApi(name: string, email: string, password: string): Promise<UserAuthResponse> {
  const res = await apiClient.post('/auth/register', { name, email, password });
  return res.data;
}

export async function getMeApi() {
  try {
    const res = await apiClient.get('/auth/me');
    return res.data?.data ?? res.data;
  } catch {
    return null;
  }
}

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  const res = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  return res.data?.data ?? res.data;
}

export async function acceptInvitationApi(token: string, password: string) {
  const res = await apiClient.post('/auth/accept-invitation', { token, password });
  return res.data?.data ?? res.data;
}

export async function generate2FASecretApi() {
  const res = await apiClient.post('/auth/2fa/generate');
  return res.data?.data ?? res.data;
}

export async function enable2FAApi(secret: string, token: string, recoveryCodes: string[]) {
  const res = await apiClient.post('/auth/2fa/enable', { secret, token, recoveryCodes });
  return res.data?.data ?? res.data;
}

export async function disable2FAApi(token: string) {
  const res = await apiClient.post('/auth/2fa/disable', { token });
  return res.data?.data ?? res.data;
}

export async function getPasskeysApi() {
  try {
    const res = await apiClient.get('/auth/passkeys');
    return res.data?.data ?? res.data ?? [];
  } catch {
    return [];
  }
}

export async function deletePasskeyApi(id: string) {
  try {
    await apiClient.delete(`/auth/passkeys/${id}`);
    return true;
  } catch {
    return false;
  }
}
