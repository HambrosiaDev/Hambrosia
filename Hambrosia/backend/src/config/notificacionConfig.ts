import { Expo } from 'expo-server-sdk';

const expo = new Expo();

interface NotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: { [key: string]: string };
}

export const sendPushNotification = async ({
  token,
  title,
  body,
  data,
}: NotificationPayload) => {
  try {
    // Validar que el token sea un token de Expo
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Token inválido de Expo');
    }

    const message = {
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
      // Configuración específica para Android
      android: {
        priority: 'high',
        channelId: 'default',
      },
      // Configuración específica para iOS
      ios: {
        sound: true,
      },
    };

    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error al enviar chunk de notificaciones:', error);
      }
    }

    console.log('✅ Notificación enviada con éxito:', tickets);
    return tickets;
  } catch (error) {
    console.error('❌ Error al enviar notificación:', error);
    throw error;
  }
};
