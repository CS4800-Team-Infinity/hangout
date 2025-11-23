/**
 * Utility functions for sending server-side notifications
 */

const NOTIFICATIONS_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const SERVER_TOKEN = process.env.NOTIFICATIONS_SERVER_TOKEN;

export async function sendNotification(
  userId: string,
  title: string,
  body?: string
): Promise<boolean> {
  if (!SERVER_TOKEN) {
    console.warn('NOTIFICATIONS_SERVER_TOKEN not set, skipping notification');
    return false;
  }

  try {
    const res = await fetch(`${NOTIFICATIONS_API_URL}/api/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVER_TOKEN}`,
      },
      body: JSON.stringify({
        userId,
        title,
        body,
      }),
    });

    if (!res.ok) {
      console.error(`Failed to send notification: ${res.status} ${res.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

export async function sendNotificationToMultiple(
  userIds: string[],
  title: string,
  body?: string
): Promise<void> {
  const promises = userIds.map((userId) =>
    sendNotification(userId, title, body)
  );
  await Promise.all(promises);
}
