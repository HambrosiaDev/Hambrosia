import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController';

const router = Router();

router.get('/', usuarioController.getAllUsuarios);
router.get('/tipo/restaurantes', usuarioController.getRestaurantes);
router.get('/:id', usuarioController.getUsuarioById);
router.post('/', usuarioController.createUsuario);
router.put('/:id', usuarioController.updateUsuario);
router.delete('/:id', usuarioController.deleteUsuario);

export default router;
