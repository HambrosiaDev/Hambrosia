import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController';

const router = Router();

// Rutas públicas para autenticación
router.post('/register', usuarioController.registerUsuario);
router.post('/login/intentoFallido', usuarioController.registrarIntentoFallido);
router.post('/login/resetearIntentos', usuarioController.resetearIntentosFallidos);
router.post('/login/resetearStrikes', usuarioController.resetearStrikes);

// Rutas que requieren autenticación
router.get('/restaurantes', usuarioController.getRestaurantes);
router.get('/:id', usuarioController.getUsuarioById);

// Ruta para manejo de strikes
router.post('/:id/incrementar-strike',  usuarioController.incrementarStrike);
router.get('/:id/Verificar-bloqueo',  usuarioController.verificarBloqueo);

router.post('/desbloquear',  usuarioController.desbloquearUsuario);
router.put('/update-expo-push-token/:cedulaRUC',  usuarioController.updateExpoPushToken);

export default router;