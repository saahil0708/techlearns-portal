'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestFCMToken, onForegroundMessage } from '@/lib/firebase';
import { useToast } from '@/context/ToastContext';
import { apiService } from '@/lib/api-service';
import { useAppSelector } from '@/store/hooks';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  timestamp: number;
  unread: boolean;
  category: 'contests' | 'submissions' | 'courses' | 'cel' | 'system';
  actionUrl?: string;
  badge?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  fcmToken: string | null;
  permissionStatus: NotificationPermission | 'unsupported';
  requestPushPermission: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const user = useAppSelector((state) => state.auth.user);
  const userId = user?.id;
  const userIdRef = React.useRef(userId);
  const fetchSequenceRef = React.useRef(0);
  const globalMutationSeqRef = React.useRef(0);
  const lastMarkAllMutationSeqRef = React.useRef(0);
  const readMutationSeqRef = React.useRef<Map<string, number>>(new Map());
  const pendingReadIdsRef = React.useRef<Set<string>>(new Set());
  const dismissedIdsRef = React.useRef<Set<string>>(new Set());
  const clearAllGenerationRef = React.useRef(0);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    const targetUserId = userId;
    const currentSeq = ++fetchSequenceRef.current;
    const fetchStartMutationSeq = globalMutationSeqRef.current;
    try {
      const res = await apiService.getNotifications();
      if (userIdRef.current !== targetUserId || fetchSequenceRef.current !== currentSeq) return;
      const list = Array.isArray(res) ? res : res?.data || [];
      const mapped: AppNotification[] = list
        .filter((item: any) => !dismissedIdsRef.current.has(item.id))
        .map((item: any) => ({
          id: item.id || `notif-${Date.now()}`,
          title: item.title || 'Notification',
          desc: item.desc || item.body || '',
          time: item.time || 'Recently',
          timestamp: item.timestamp || Date.now(),
          unread: Boolean(item.unread),
          category: (item.category?.toLowerCase() as any) || 'system',
          actionUrl: item.actionUrl || '/students',
          badge: item.senderRole ? item.senderRole.replace('_', ' ') : undefined,
        }));
      setNotifications(() => {
        return mapped.map((item) => {
          const itemMutationSeq = readMutationSeqRef.current.get(item.id) ?? 0;
          // Preserve unread: false if the notification has an active in-flight read operation
          // or was marked as read during/after this fetch was dispatched
          if (itemMutationSeq > fetchStartMutationSeq || pendingReadIdsRef.current.has(item.id)) {
            return { ...item, unread: false };
          }
          return item;
        });
      });
    } catch (err) {
      if (userIdRef.current === targetUserId && fetchSequenceRef.current === currentSeq) {
        throw err;
      }
    }
  }, [userId]);

  // Fetch notifications whenever authenticated user changes
  useEffect(() => {
    pendingReadIdsRef.current.clear();
    readMutationSeqRef.current.clear();
    dismissedIdsRef.current.clear();
    clearAllGenerationRef.current = 0;
    lastMarkAllMutationSeqRef.current = 0;
    globalMutationSeqRef.current = 0;
    setNotifications([]);
    if (!userId) {
      setFcmToken(null);
      return;
    }
    fetchNotifications().catch(() => {
      toast.error('Failed to load notifications. Please check your connection.', 'Load Error');
    });
  }, [userId, fetchNotifications, toast]);

  // Handle FCM push token registration when user is signed in
  useEffect(() => {
    if (!userId) return;
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermissionStatus(Notification.permission);
      if (Notification.permission === 'granted') {
        requestFCMToken()
          .then((token) => {
            if (token) {
              setFcmToken(token);
              apiService.registerFcmToken(token).catch(() => {});
            }
          })
          .catch(() => {});
      }
    } else {
      setPermissionStatus('unsupported');
    }
  }, [userId]);

  // Listen to live foreground messages from Firebase
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || payload.data?.title || 'New Notification';
      const body = payload.notification?.body || payload.data?.body || '';
      const category = (payload.data?.category as any) || 'system';
      const actionUrl = payload.data?.actionUrl || '/students';
      const notificationId =
        payload.data?.notificationId ||
        payload.data?.id ||
        payload.messageId ||
        (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : 'notif-' + Date.now());

      const newNotif: AppNotification = {
        id: notificationId,
        title,
        desc: body,
        time: 'Just now',
        timestamp: Date.now(),
        unread: true,
        category,
        actionUrl,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      toast.info(body, title);
    });

    return () => {
      unsubscribe?.();
    };
  }, [toast]);

  const requestPushPermission = async () => {
    try {
      const token = await requestFCMToken();
      if (token) {
        setFcmToken(token);
        setPermissionStatus('granted');
        if (userId) {
          await apiService.registerFcmToken(token);
        }
        toast.success('Firebase Push Notifications enabled! You will receive live alerts.', 'Push Enabled');
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          setPermissionStatus(Notification.permission);
        }
      }
    } catch {
      toast.error('Failed to enable push notifications', 'Error');
    }
  };

  const markAsRead = async (id: string) => {
    const target = notifications.find((n) => n.id === id);
    const wasUnread = target ? target.unread : true;
    pendingReadIdsRef.current.add(id);
    const mutationSeq = ++globalMutationSeqRef.current;
    readMutationSeqRef.current.set(id, mutationSeq);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    try {
      await apiService.markNotificationRead(id);
    } catch {
      // Only remove mutation and roll back if mutation sequence is still current for this ID
      if (readMutationSeqRef.current.get(id) === mutationSeq) {
        readMutationSeqRef.current.delete(id);
        if (lastMarkAllMutationSeqRef.current <= mutationSeq) {
          setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: wasUnread } : n)),
          );
        }
      }
      toast.error('Failed to mark notification as read.', 'Error');
    } finally {
      pendingReadIdsRef.current.delete(id);
    }
  };

  const markAllAsRead = async () => {
    const previousUnreadMap = new Map(notifications.map((n) => [n.id, n.unread]));
    const targetIds = new Set(notifications.map((n) => n.id));
    const mutationSeq = ++globalMutationSeqRef.current;
    lastMarkAllMutationSeqRef.current = mutationSeq;
    for (const id of targetIds) {
      readMutationSeqRef.current.set(id, mutationSeq);
    }
    setNotifications((prev) =>
      prev.map((n) => (targetIds.has(n.id) ? { ...n, unread: false } : n)),
    );

    try {
      await apiService.markAllNotificationsRead();
      setNotifications((prev) => {
        for (const n of prev) {
          if (targetIds.has(n.id)) {
            readMutationSeqRef.current.set(n.id, mutationSeq);
          }
        }
        return prev;
      });
      toast.success('All notifications marked as read.', 'Updated');
    } catch {
      if (lastMarkAllMutationSeqRef.current === mutationSeq) {
        lastMarkAllMutationSeqRef.current = 0;
        for (const [id, seq] of readMutationSeqRef.current.entries()) {
          if (seq === mutationSeq) {
            readMutationSeqRef.current.delete(id);
          }
        }
      }
      try {
        await fetchNotifications();
      } catch {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            unread: previousUnreadMap.has(n.id) ? (previousUnreadMap.get(n.id) as boolean) : n.unread,
          })),
        );
      }
      toast.error('Failed to mark all notifications as read.', 'Error');
    }
  };

  const deleteNotification = async (id: string) => {
    const initiatingUserId = userIdRef.current;
    const clearAllGenAtStart = clearAllGenerationRef.current;
    const deletedItem = notifications.find((n) => n.id === id);
    dismissedIdsRef.current.add(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiService.deleteNotification(id);
    } catch {
      if (userIdRef.current === initiatingUserId && clearAllGenerationRef.current === clearAllGenAtStart) {
        dismissedIdsRef.current.delete(id);
        if (deletedItem) {
          setNotifications((prev) => (prev.some((n) => n.id === id) ? prev : [deletedItem, ...prev]));
        }
      }
      toast.error('Failed to delete notification.', 'Error');
    }
  };

  const clearAll = async () => {
    const initiatingUserId = userIdRef.current;
    const previous = [...notifications];
    const clearedIds = previous.map((n) => n.id);
    for (const id of clearedIds) {
      dismissedIdsRef.current.add(id);
    }
    setNotifications([]);
    try {
      await apiService.clearAllNotifications();
      clearAllGenerationRef.current++;
      toast.info('Notification ledger cleared.', 'Cleared');
    } catch {
      if (userIdRef.current === initiatingUserId) {
        for (const id of clearedIds) {
          dismissedIdsRef.current.delete(id);
        }
        setNotifications((prev) => {
          const prevIdSet = new Set(prev.map((n) => n.id));
          const toRestore = previous.filter((n) => !prevIdSet.has(n.id));
          return [...prev, ...toRestore];
        });
      }
      toast.error('Failed to clear notifications.', 'Error');
    }
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fcmToken,
        permissionStatus,
        requestPushPermission,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        refreshNotifications: fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

