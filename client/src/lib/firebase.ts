import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, Messaging, MessagePayload } from 'firebase/messaging';
import { getAnalytics, isSupported as isAnalyticsSupported, Analytics } from 'firebase/analytics';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBFRj_9qjfrHdm28q-YB6xW2MnScL3uVOg',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'techlearns-portal-22ff4.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'techlearns-portal-22ff4',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'techlearns-portal-22ff4.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '1069154861661',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:1069154861661:web:ef2a1136595763aeafc3b4',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-W0VB2L52RD',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;

export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined') return null;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;

  if (!analytics && (await isAnalyticsSupported())) {
    try {
      analytics = getAnalytics(currentApp);
    } catch {
      // Ignore if analytics blocked by browser extension
    }
  }
  return analytics;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') return null;

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    // Config not yet provided
    return null;
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  const currentApp = getFirebaseApp();
  if (!currentApp) return null;
  if (!auth) {
    auth = getAuth(currentApp);
  }
  return auth;
}

export async function signInWithOAuthPopup(
  providerType: 'google' | 'github',
): Promise<{ idToken: string; email?: string | null; name?: string | null; photoURL?: string | null }> {
  const currentAuth = getFirebaseAuth();
  if (!currentAuth) {
    throw new Error('Firebase Authentication is not configured or available in this environment.');
  }

  const provider =
    providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

  if (providerType === 'google') {
    provider.addScope('email');
    provider.addScope('profile');
  } else if (providerType === 'github') {
    provider.addScope('user:email');
  }

  const credential = await signInWithPopup(currentAuth, provider);
  const idToken = await credential.user.getIdToken();

  return {
    idToken,
    email: credential.user.email,
    name: credential.user.displayName,
    photoURL: credential.user.photoURL,
  };
}

export function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') return null;

  const currentApp = getFirebaseApp();
  if (!currentApp) return null;

  if (!messaging) {
    try {
      messaging = getMessaging(currentApp);
    } catch (err) {
      console.warn('Firebase messaging is not supported in this browser environment:', err);
      return null;
    }
  }

  return messaging;
}

/**
 * Requests browser notification permission and retrieves the FCM device token.
 */
export async function requestFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications.');
    return null;
  }

  try {
    const messagingSupported = await isSupported();
    if (!messagingSupported) {
      console.warn('Firebase Messaging is not supported in this browser environment.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission was not granted.');
      return null;
    }

    const msg = getFirebaseMessaging();
    if (!msg) {
      return null;
    }

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || '';
    const currentToken = await getToken(msg, vapidKey ? { vapidKey } : undefined);

    if (currentToken) {
      return currentToken;
    } else {
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error) {
    console.warn('An error occurred while retrieving token:', error);
    return null;
  }
}

/**
 * Listens for incoming push messages while the app is in the foreground.
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void): () => void {
  const msg = getFirebaseMessaging();
  if (!msg) return () => {};

  return onMessage(msg, (payload) => {
    callback(payload);
  });
}
