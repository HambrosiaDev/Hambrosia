import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController';
import { authMiddleware, requireRoles } from '../middlewares/authMiddleware';
import { Rol } from '../models/interfaces';

const router = Router();

// Rutas públicas para autenticación
router.post('/register', usuarioController.registerUsuario);
router.post('/verificar-credenciales', usuarioController.verificarCredenciales);

// Obtener perfil de usuario actual (requiere autenticación)
router.get('/perfil', authMiddleware, usuarioController.getPerfilUsuario);

// Rutas que requieren autenticación
router.get('/tipo/restaurantes', authMiddleware, usuarioController.getRestaurantes);
router.get('/:id', authMiddleware, usuarioController.getUsuarioById);

// Rutas que requieren autenticación y rol de administrador
router.get('/', authMiddleware, requireRoles([Rol.ADMIN]), usuarioController.getAllUsuarios);
router.post('/', authMiddleware, requireRoles([Rol.ADMIN]), usuarioController.createUsuario);
router.put('/:id', authMiddleware, requireRoles([Rol.ADMIN]), usuarioController.updateUsuario);
router.delete('/:id', authMiddleware, requireRoles([Rol.ADMIN]), usuarioController.deleteUsuario);

export default router;