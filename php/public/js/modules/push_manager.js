const VAPID_PUBLIC_KEY = 'BEtPTqASpgCYJw9FbfVkzW-1OpUe_9Ptge2baMOjRZPTJawcVN_984u787ik1S55l-Whe-NjAaGNa3AYTydEvgU';
const SUBSCRIBE_API = 'api/node/notifications/subscribe';

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function ensurePushSubscription() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn("Push messaging is not supported");
        return false;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });
            
            await sendSubscriptionToServer(subscription);
            console.log("New Push Subscription created.");
        } else {
            await sendSubscriptionToServer(subscription); 
            console.log("Existing subscription confirmed.");
        }

        return true;

    } catch (error) {
        console.error("Push Error:", error);
        return false;
    }
}

async function sendSubscriptionToServer(subscription) {
    try {
        await fetch(SUBSCRIBE_API, {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });
    } catch (e) {
        console.error("Failed to sync subscription with server", e);
    }
}