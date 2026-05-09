importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyDXgnCdX-rbhhuZS4LkadsarF_rmzPzpDs",
  authDomain: "sakinah-streams.firebaseapp.com",
  projectId: "sakinah-streams",
  storageBucket: "sakinah-streams.firebasestorage.app",
  messagingSenderId: "204985007950",
  appId: "1:204985007950:web:3f974dc207f042ffcc281f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icons/icon-192x192.png",
    data: {
      url: payload.data?.url || "/",
      surahId: payload.data?.surahId,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const rawUrl = event.notification.data?.url || "/";

      const targetUrl = new URL(rawUrl, self.location.origin).href;

      const clientList = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      let matchedClient = null;

      for (const client of clientList) {
        const clientUrl = new URL(client.url).href;

        if (clientUrl.startsWith(self.location.origin)) {
          matchedClient = client;
          break;
        }
      }

      if (matchedClient) {
        await matchedClient.focus();

        if ("navigate" in matchedClient) {
          await matchedClient.navigate(targetUrl);
        }

        return;
      }

      return clients.openWindow(targetUrl);
    })(),
  );
  
});
