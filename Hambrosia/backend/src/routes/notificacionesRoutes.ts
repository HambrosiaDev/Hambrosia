import { RequestHandler, Router } from 'express';
import * as notificacionesController from '../controllers/notificacionesController';

const router = Router();


router.post('/enviar-notificacion/:token', notificacionesController.enviarNotificacion );

export default router;
