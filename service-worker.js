self.addEventListener('install', event => {
    console.log('Service Worker installé');
});

self.addEventListener('activate', event => {
    console.log('Service Worker activé');
});

self.addEventListener('message', event => {
    if (event.data && event.data.type === 'REGISTER_RADARS') {
        const radars = event.data.radars;

        radars.forEach(radar => {
            self.registration.showNotification('Radar proche !', {
                body: `Un radar proche de votre itinéraire a été détecté près de (${radar.lat}, ${radar.lng}).`,
                tag: `radar-notification-${radar.id}`,
                icon: 'img/Unknown.png',
                badge: 'img/Unknown.png',
                requireInteraction: true,
                vibrate: [100, 200, 100]
            });
        });
    }
});
