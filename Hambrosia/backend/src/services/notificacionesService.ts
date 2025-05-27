import { Expo } from 'expo-server-sdk';
import { sendPushNotification } from '../config/notificacionConfig';

export class NotificacionService {
  async enviarNotificacion(
    token: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ) {
    try {
      // Validar que el token sea un token de Expo
      if (!Expo.isExpoPushToken(token)) {
        throw new Error('Token inválido de Expo');
      }

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

  async enviarNotificacionReservaPaquete(
    token: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ) {
    try {
      // Validar que el token sea un token de Expo
      if (!Expo.isExpoPushToken(token)) {
        throw new Error('Token inválido de Expo');
      }

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

  async enviarNotificacionCompraCancelada(
    token: string,
    title: string,
    body: string,
    data?: { [key: string]: string }
  ) {
    try {
      // Validar que el token sea un token de Expo
      if (!Expo.isExpoPushToken(token)) {
        throw new Error('Token inválido de Expo');
      }

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
