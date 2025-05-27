import { Expo } from 'expo-server-sdk';
import { Request, Response } from 'express';
import { CompraService } from '../services/compraService';
import { NotificacionService } from '../services/notificacionesService';
import { PaqueteService } from '../services/paqueteService';
import { UsuarioService } from '../services/usuarioService';

const notificacionService = new NotificacionService();
const usuarioService = new UsuarioService();
const paqueteService = new PaqueteService();
const compraService = new CompraService();

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

export const enviarNotificacionReservaPaquete = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paqueteId } = req.params;
    const { data } = req.body;

    if (!paqueteId) {
      res.status(400).json({
        success: false,
        message: 'El ID del paquete es requerido'
      });
      return;
    }

    // Obtener el paquete y su restaurante asociado
    const paquete = await paqueteService.obtenerPaquetePorId(paqueteId);
    const restauranteId = paquete?.restauranteId;

    // Obtener el usuario (restaurante) y su token
    const restaurante = await usuarioService.getById(restauranteId || '');
    if (!restaurante || !restaurante.expoPushToken) {
      res.status(404).json({
        success: false,
        message: 'No se encontró el restaurante o no tiene un token de notificación configurado'
      });
      return;
    }

    const response = await notificacionService.enviarNotificacionReservaPaquete(
      restaurante.expoPushToken,
      "¡Nuevo pedido confirmado!",
      "Un cliente ha reservado uno de tus paquetes. ¡Prepáralo a tiempo para la entrega!",
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
    const { compraId } = req.params;
    const { data } = req.body;

    if (!compraId) {
      res.status(400).json({
        success: false,
        message: 'El ID de la compra es requerido'
      });
      return;
    }

    // Obtener la compra y su restaurante asociado
    const compra = await compraService.getCompraById(compraId);
    const restauranteId = compra?.restauranteId;

    // Obtener el usuario (restaurante) y su token
    const restaurante = await usuarioService.getById(restauranteId || '');
    if (!restaurante || !restaurante.expoPushToken) {
      res.status(404).json({
        success: false,
        message: 'No se encontró el restaurante o no tiene un token de notificación configurado'
      });
      return;
    }

    const response = await notificacionService.enviarNotificacionCompraCancelada(
      restaurante.expoPushToken,
      "¡Pedido cancelado!",
      "Un cliente canceló su reserva. Entra a la app para conocer más información.",
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
