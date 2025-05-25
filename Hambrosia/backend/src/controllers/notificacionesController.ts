import { Expo } from 'expo-server-sdk';
import { Request, Response } from 'express';
import { NotificacionService } from '../services/notificacionesService';

const notificacionService = new NotificacionService();

export const enviarNotificacion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { title, body, data } = req.body;

    if (!token || !title || !body) {
      res.status(400).json({
        success: false,
        message: 'Token, título y cuerpo son requeridos'
      });
      return;
    }

    // Validar que el token sea un token de Expo
    if (!Expo.isExpoPushToken(token)) {
      res.status(400).json({
        success: false,
        message: 'Token inválido de Expo'
      });
      return;
    }

    const response = await notificacionService.enviarNotificacion(
      token,
      title,
      body,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: response
    });
  } catch (error) {
    console.error('Error en NotificacionesController:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la notificación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const enviarNotificacionReservaCompra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { title, body, data } = req.body;

    const response = await notificacionService.enviarNotificacionReservaCompra(
      token,
      title,
      body,
      data
    );

    res.status(200).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: response
    });

  } catch (error) {
    console.error('Error en NotificacionesController:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la notificación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

export const enviarNotificacionCompraCancelada = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { title, body, data } = req.body;

    const response = await notificacionService.enviarNotificacionCompraCancelada(
      token,
      title,
      body,
      data
    );  

    res.status(200).json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: response
    });

  } catch (error) {
    console.error('Error en NotificacionesController:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar la notificación',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};
