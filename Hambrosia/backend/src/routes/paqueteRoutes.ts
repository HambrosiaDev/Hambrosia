import { Router } from 'express';
import * as paqueteController from '../controllers/paqueteController';

const router = Router();

router.post("/:cedRuc/crearPaquete", paqueteController.publicarPaquete);

// // Get all paquetes
// router.get('/', paqueteController.getAllPaquetes);

// // Get visible paquetes
// router.get('/visibles', paqueteController.getVisiblePaquetes);

// // Get paquetes by restaurante
// router.get('/restaurante/:id', paqueteController.getPaquetesByRestaurante);

// // Get paquete by ID
// router.get('/:id', paqueteController.getPaqueteById);

// // Create paquete
// router.post('/', paqueteController.createPaquete);

// // Update paquete
// router.put('/:id', paqueteController.updatePaquete);

// // Delete paquete
// router.delete('/:id', paqueteController.deletePaquete);

export default router;