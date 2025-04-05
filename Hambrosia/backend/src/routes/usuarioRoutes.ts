import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController';

const router = Router();

// Rutas públicas para autenticación
router.post('/register', usuarioController.registerUsuario);
router.post('/login/intentoFallido', usuarioController.registrarIntentoFallido);
router.post('/login/resetearIntentos', usuarioController.resetearIntentosFallidos);

// Rutas que requieren autenticación
router.get('/restaurantes', usuarioController.getRestaurantes);
router.get('/:id', usuarioController.getUsuarioById);

// Rutas que requieren autenticación y rol de administrador
router.get('/',  usuarioController.getAllUsuarios);
router.post('/',  usuarioController.createUsuario);
router.put('/:id',  usuarioController.updateUsuario);
router.delete('/:id',  usuarioController.deleteUsuario);

// Ruta para manejo de strikes
router.post('/:id/incrementar-strike',  usuarioController.incrementarStrike);
router.post('')

export default router;