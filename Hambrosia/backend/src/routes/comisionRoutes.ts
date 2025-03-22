import { Router } from 'express';
import * as comisionController from '../controllers/comisionController';

const router = Router();

// Get all comisiones
router.get('/', comisionController.getAllComisiones);

// Get comisiones by restaurante
router.get('/restaurante/:id', comisionController.getComisionesByRestaurante);

// Get comision by ID
router.get('/:id', comisionController.getComisionById);

// Create comision
router.post('/', comisionController.createComision);

// Update comision
router.put('/:id', comisionController.updateComision);

// Delete comision
router.delete('/:id', comisionController.deleteComision);

export default router;