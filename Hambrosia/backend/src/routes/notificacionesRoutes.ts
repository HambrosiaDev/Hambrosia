import { Router } from 'express';
import * as notificacionesController from '../controllers/notificacionesController';

const router = Router();


router.post('/enviar-notificacion/:token', notificacionesController.enviarNotificacion );
router.post('/enviar-notificacion-reserva-compra/:token', notificacionesController.enviarNotificacionReservaCompra);
router.post('/enviar-notificacion-compra-cancelada/:token', notificacionesController.enviarNotificacionCompraCancelada);

export default router;
