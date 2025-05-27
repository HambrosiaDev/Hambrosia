import { Router } from 'express';
import * as notificacionesController from '../controllers/notificacionesController';

const router = Router();


router.post('/enviar-notificacion/:token', notificacionesController.enviarNotificacion );
router.post('/enviar-notificacion-reserva-paquete/:paqueteId', notificacionesController.enviarNotificacionReservaPaquete);
router.post('/enviar-notificacion-compra-cancelada/:compraId', notificacionesController.enviarNotificacionCompraCancelada);

export default router;
