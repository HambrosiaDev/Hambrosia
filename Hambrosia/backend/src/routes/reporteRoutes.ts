import express from 'express';
import { reporteController } from '../controllers/reporteController';

const router = express.Router();

// Route to create a new report
router.post('/crearReporte/:compraId', reporteController.crearReporte);

// Route to get a report by ID
router.get('/:reporteId', reporteController.getReporteById);

export default router;