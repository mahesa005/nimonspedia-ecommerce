import webpush from 'web-push';
import { NotificationRepository } from '../repositories/notificationRepository';
import { PushSubscriptionData } from '../models/notificationModel';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:test@test.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const NotificationService = {
  async subscribeUser(userId: number, subscription: PushSubscriptionData) {
    await NotificationRepository.saveSubscription(userId, subscription);
  },

  async sendToUser(userId: number, payload: { title: string; body: string; url?: string }) {
    const subscriptions = await NotificationRepository.getSubscriptionsByUser(userId);

    const notifications = subscriptions.map(async (sub) => {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
      };

      try {
        await webpush.sendNotification(pushConfig, JSON.stringify(payload));
      } catch (error: any) {
        if (error.statusCode === 410) {
          await NotificationRepository.deleteSubscription(sub.endpoint);
        } else {
            console.error('Push Error:', error);
        }
      }
    });

    await Promise.all(notifications);
  }
};