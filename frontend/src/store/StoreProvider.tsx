'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, type AppStore } from './index';
import { checkCurrentUser } from './slices/authSlice';

import { ToastProvider } from '@/context/ToastContext';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(null);

  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  useEffect(() => {
    // Perform initial session recovery check via httpOnly cookies on app mount
    if (storeRef.current) {
      storeRef.current.dispatch(checkCurrentUser());
    }
  }, []);

  return (
    <Provider store={storeRef.current}>
      <ToastProvider>{children}</ToastProvider>
    </Provider>
  );
}
