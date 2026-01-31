const publicVapidKey = 'BFOSCSgV2v4UBBMmaji0CeZ1SR__yfyvG_4a3M5QiRGDAjg6xi0xsMzsVQC9YGRnBx3W9aGsAXy0AHUNb5AJfF4';

// Check for service worker
if ('serviceWorker' in navigator) {
    send().catch(err => console.error(err));
}

// Register SW, Register Push, Send Push
async function send() {
    console.log('Registering service worker...');
    const register = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
    });
    console.log('Service Worker Registered...');

    // Wait for user interaction to subscribe? 
    // For this demo we'll hook it to the button, but we can also check permission on load if granted
    const subscribeBtn = document.getElementById('subscribe-btn');
    const triggerBtn = document.getElementById('trigger-btn');

    subscribeBtn.addEventListener('click', async () => {
        console.log('Registering Push...');

        // We need to convert the VAPID key to Uint8Array
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        console.log('Push Registered...');

        // Send Push Notification
        console.log('Sending Push...');
        await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'content-type': 'application/json'
            }
        });
        console.log('Push Sent...');
        alert('Subscribed successfully!');
    });

    triggerBtn.addEventListener('click', async () => {
        await fetch('/send-notification', {
            method: 'POST'
        });
        console.log('Trigger request sent.');
    });
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
