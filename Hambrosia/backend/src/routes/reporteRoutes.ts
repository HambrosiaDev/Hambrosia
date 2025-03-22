import { Router } from 'express';
import * as reporteController from '../controllers/reporteController';

const router = Router();

// Get all reportes
router.get('/', reporteController.getAllReportes);

// Get reportes by tipo
router.get('/tipo/:tipo', reporteController.getReportesByTipo);

// Create reporte
router.post('/', reporteController.createReporte);

// Get reporte by ID
router.get('/:id', reporteController.getReporteById);

// Update reporte
router.put('/:id', reporteController.updateReporte);

// Delete reporte
router.delete('/:id', reporteController.deleteReporte);

export default router;
