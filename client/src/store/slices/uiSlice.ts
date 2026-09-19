import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  activeAuthTab: 'signin' | 'signup';
  notifications: ToastNotification[];
}

const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: true,
  activeAuthTab: 'signin',
  notifications: [],
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setActiveAuthTab: (state, action: PayloadAction<'signin' | 'signup'>) => {
      state.activeAuthTab = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<ToastNotification, 'id'> & { id?: string }>) => {
      const id = action.payload.id || Math.random().toString(36).substring(2, 9);
      state.notifications.push({ ...action.payload, id });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setActiveAuthTab,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
