export async function sendPushNotification(userId: string | 'all', title: string, message: string) {
  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, message })
    });
    return response.ok;
  } catch (error) {
    console.error('Push notification failed:', error);
    return false;
  }
}
