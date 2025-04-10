import { Router } from 'express';
import * as paqueteController from '../controllers/paqueteController';

const router = Router();

router.post('/:cedRuc/crearPaquete', paqueteController.publicarPaquete);
router.get('/:ciudad', paqueteController.getPaqueteByCiudad);

export default router;
