'use client';

import { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './index';
import { checkCurrentUser } from './slices/authSlice';

import { ToastProvider } from '@/context/ToastContext';
import { NotificationProvider } from '@/context/NotificationContext';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    // Perform initial session recovery check via httpOnly cookies on app mount
    store.dispatch(checkCurrentUser());
  }, [store]);

  return (
    <Provider store={store}>
      <ToastProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </ToastProvider>
    </Provider>
  );
}
