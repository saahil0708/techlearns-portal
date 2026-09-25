// Firebase Cloud Messaging Service Worker for background push notifications

// 1. Register custom notification click listener before Firebase imports to ensure click routing
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }

  const rootUrl = new URL('/', self.location.origin).href;

  const rawUrl =
    event.notification.data?.actionUrl ||
    event.notification.data?.url ||
    event.notification.data?.FCM_MSG?.data?.actionUrl ||
    event.notification.data?.FCM_MSG?.data?.url ||
    event.notification.data?.FCM_MSG?.notification?.click_action ||
    event.notification.data?.FCM_MSG?.fcmOptions?.link ||
    '/';

  let clickUrl;
  try {
    const resolvedUrl = new URL(rawUrl, self.location.origin);
    if (resolvedUrl.origin === self.location.origin) {
      clickUrl = resolvedUrl.href;
    } else {
      clickUrl = rootUrl;
    }
  } catch (e) {
    clickUrl = rootUrl;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // 1. Exact match check
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === clickUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // 2. If target resolved to '/', update same-origin client to rootUrl before focusing it; open rootUrl if navigation unavailable or fails
      if (clickUrl === rootUrl) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          try {
            if (new URL(client.url).origin === self.location.origin) {
              if ('navigate' in client) {
                return client
                  .navigate(rootUrl)
                  .then(function (navigatedClient) {
                    return navigatedClient ? navigatedClient.focus() : client.focus();
                  })
                  .catch(function () {
                    if (clients.openWindow) {
                      return clients.openWindow(rootUrl);
                    }
                  });
              }
              if (clients.openWindow) {
                return clients.openWindow(rootUrl);
              }
              if ('focus' in client) {
                return client.focus();
              }
            }
          } catch (e) {}
        }
      }

      // 3. Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});

// 2. Import Firebase Scripts
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// 3. Initialize the Firebase app in the service worker by passing in the messagingSenderId
const firebaseConfig = {
  apiKey: "AIzaSyBFRj_9qjfrHdm28q-YB6xW2MnScL3uVOg",
  authDomain: "techlearns-portal-22ff4.firebaseapp.com",
  projectId: "techlearns-portal-22ff4",
  storageBucket: "techlearns-portal-22ff4.firebasestorage.app",
  messagingSenderId: "1069154861661",
  appId: "1:1069154861661:web:ef2a1136595763aeafc3b4",
  measurementId: "G-W0VB2L52RD"
};

if (firebase.apps.length === 0) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (e) {
    // Standalone / Worker fallback
  }
}

let messaging = null;
try {
  messaging = firebase.messaging();
} catch (e) {}

if (messaging) {
  messaging.onBackgroundMessage(function (payload) {
    if (payload.notification) {
      return;
    }

    const notificationTitle = payload.data?.title || 'CodePlatform Alert';
    const rawActionUrl =
      payload.data?.actionUrl ||
      payload.data?.url ||
      payload.fcmOptions?.link ||
      '/';

    const notificationOptions = {
      body: payload.data?.body || 'You have a new update.',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        ...(payload.data || {}),
        actionUrl: rawActionUrl,
      },
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
