import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface UserMembership {
  collegeId: string;
  role: string;
  college?: {
    id: string;
    name: string;
    code: string;
    email?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  globalRole: string;
  status: string;
  twoFactorEnabled?: boolean;
  rollNo?: string;
  handle?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  phone?: string;
  institution?: string;
  department?: string;
  specialization?: string;
  officeHours?: string;
  location?: string;
  birthDate?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  contestRating?: number;
  ratingTier?: string;
  memberships: UserMembership[];
  batchEnrollments?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isCheckingSession: boolean;
  error: string | null;
  // 2FA Challenge state
  requires2FA: boolean;
  challengeToken: string | null;
  challengeUserId: string | null;
  challengeMessage: string | null;
}

const getInitialUser = (): UserProfile | null => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem('codeplatform_user');
      if (item) return JSON.parse(item);
    } catch {}
  }
  return null;
};

const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!initialUser,
  isLoading: false,
  isCheckingSession: true,
  error: null,
  requires2FA: false,
  challengeToken: null,
  challengeUserId: null,
  challengeMessage: null,
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const setClientAuthCookie = (token?: string) => {
  if (typeof document !== 'undefined') {
    if (token) {
      document.cookie = `access_token=${encodeURIComponent(token)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    } else {
      document.cookie = `access_token=; path=/; max-age=0; SameSite=Lax`;
    }
  }
};

/**
 * Async thunk for email/password login
 */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Sends & sets httpOnly cookies
        body: JSON.stringify(credentials),
      });

      const responseData = await res.json();
      if (!res.ok) {
        return rejectWithValue(responseData?.message || 'Invalid email or password');
      }

      // Handle standard response envelope
      const data = responseData.data || responseData;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error occurred during login');
    }
  },
);

/**
 * Async thunk for user registration
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData: { email: string; name: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Sends & sets httpOnly cookies
        body: JSON.stringify(formData),
      });

      const responseData = await res.json();
      if (!res.ok) {
        return rejectWithValue(responseData?.message || 'Registration failed');
      }

      const data = responseData.data || responseData;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Network error occurred during registration');
    }
  },
);

/**
 * Async thunk for verifying 2FA login challenge code
 */
export const verify2faLogin = createAsyncThunk(
  'auth/verify2fa',
  async (
    payload: { challengeToken?: string; userId?: string; code: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      if (!res.ok) {
        return rejectWithValue(responseData?.message || 'Invalid 2FA verification code');
      }

      const data = responseData.data || responseData;
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Verification failed');
    }
  },
);

/**
 * Async thunk to restore session & fetch profile via httpOnly cookie on boot with automatic silent refresh
 */
export const checkCurrentUser = createAsyncThunk(
  'auth/checkSession',
  async (_, { rejectWithValue }) => {
    try {
      const getAuthHeaders = () => {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (typeof document !== 'undefined') {
          const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]*)/);
          if (match) {
            headers['Authorization'] = `Bearer ${decodeURIComponent(match[1])}`;
          }
        }
        return headers;
      };

      let res = await fetch(`${BACKEND_URL}/auth/me`, {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include',
      });

      // If unauthorized / token expired, attempt silent token refresh rotation
      if (!res.ok) {
        try {
          const refreshRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({}),
          });

          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const token = refreshData?.accessToken || refreshData?.data?.accessToken;
            if (token) {
              setClientAuthCookie(token);
              // Retry fetching /auth/me with newly rotated access token
              res = await fetch(`${BACKEND_URL}/auth/me`, {
                method: 'GET',
                headers: getAuthHeaders(),
                credentials: 'include',
              });
            }
          }
        } catch {
          // Silent refresh failed
        }
      }

      if (!res.ok) {
        return rejectWithValue('No active session');
      }

      const responseData = await res.json();
      const user = responseData.data || responseData;
      if (typeof window !== 'undefined' && user) {
        try {
          localStorage.setItem('codeplatform_user', JSON.stringify(user));
        } catch {
          // Ignore quota/storage errors
        }
      }
      return user;
    } catch {
      return rejectWithValue('Failed to check session');
    }
  },
);

/**
 * Async thunk to log out and clear cookies
 */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({}),
      });
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Logout failed');
    }
  },
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isCheckingSession = false;
      if (typeof window !== 'undefined') {
        try {
          if (action.payload) {
            localStorage.setItem('codeplatform_user', JSON.stringify(action.payload));
          } else {
            localStorage.removeItem('codeplatform_user');
          }
        } catch {}
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    reset2faState: (state) => {
      state.requires2FA = false;
      state.challengeToken = null;
      state.challengeUserId = null;
      state.challengeMessage = null;
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isCheckingSession = false;
        if (action.payload?.requires2FA) {
          state.requires2FA = true;
          state.challengeToken = action.payload.challengeToken || null;
          state.challengeUserId = action.payload.userId || null;
          state.challengeMessage = action.payload.message || '2FA code required';
          state.isAuthenticated = false;
          state.user = null;
        } else {
          state.user = action.payload?.user || action.payload;
          state.isAuthenticated = true;
          state.requires2FA = false;
          state.challengeToken = null;
          state.challengeUserId = null;
          if (action.payload?.tokens?.accessToken) {
            setClientAuthCookie(action.payload.tokens.accessToken);
          }
          if (typeof window !== 'undefined' && state.user) {
            try {
              localStorage.setItem('codeplatform_user', JSON.stringify(state.user));
            } catch {}
          }
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isCheckingSession = false;
        state.error = (action.payload as string) || 'Login failed';
      });

    // REGISTER
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isCheckingSession = false;
        state.user = action.payload?.user || action.payload;
        state.isAuthenticated = true;
        if (action.payload?.tokens?.accessToken) {
          setClientAuthCookie(action.payload.tokens.accessToken);
        }
        if (typeof window !== 'undefined' && state.user) {
          try {
            localStorage.setItem('codeplatform_user', JSON.stringify(state.user));
          } catch {}
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isCheckingSession = false;
        state.error = (action.payload as string) || 'Registration failed';
      });

    // 2FA VERIFY
    builder
      .addCase(verify2faLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verify2faLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isCheckingSession = false;
        state.user = action.payload?.user || action.payload;
        state.isAuthenticated = true;
        state.requires2FA = false;
        state.challengeToken = null;
        state.challengeUserId = null;
        if (action.payload?.tokens?.accessToken) {
          setClientAuthCookie(action.payload.tokens.accessToken);
        }
        if (typeof window !== 'undefined' && state.user) {
          try {
            localStorage.setItem('codeplatform_user', JSON.stringify(state.user));
          } catch {}
        }
      })
      .addCase(verify2faLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.isCheckingSession = false;
        state.error = (action.payload as string) || 'Invalid 2FA code';
      });

    // CHECK SESSION
    builder
      .addCase(checkCurrentUser.pending, (state) => {
        state.isCheckingSession = true;
      })
      .addCase(checkCurrentUser.fulfilled, (state, action) => {
        state.isCheckingSession = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        if (typeof window !== 'undefined' && action.payload) {
          try {
            localStorage.setItem('codeplatform_user', JSON.stringify(action.payload));
          } catch {}
        }
      })
      .addCase(checkCurrentUser.rejected, (state) => {
        state.isCheckingSession = false;
        // Keep stored user if exists in localStorage
        if (typeof window !== 'undefined') {
          try {
            const stored = localStorage.getItem('codeplatform_user');
            if (stored) {
              state.user = JSON.parse(stored);
              state.isAuthenticated = true;
              return;
            }
          } catch {}
        }
      });

    // LOGOUT
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.requires2FA = false;
      state.challengeToken = null;
      state.challengeUserId = null;
      setClientAuthCookie();
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('codeplatform_user');
        } catch {}
      }
    });
  },
});

export const { setUser, clearError, reset2faState } = authSlice.actions;
export default authSlice.reducer;
