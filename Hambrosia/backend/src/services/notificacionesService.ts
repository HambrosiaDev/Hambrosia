import { sendPushNotification } from '../config/notificacionConfig';

export class NotificacionService {
  async enviarNotificacion(
    token: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ) {
    try {
      const response = await sendPushNotification({
        token,
        title,
        body,
        data
      });
      return response;
    } catch (error) {
      console.error('Error en NotificacionService:', error);
      throw error;
    }
  }
}
