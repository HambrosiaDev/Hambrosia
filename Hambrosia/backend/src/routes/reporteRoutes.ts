import express from 'express';
import { reporteController } from '../controllers/reporteController';

const router = express.Router();

// Ruta para crear un reporte de cliente a restaurante
router.post('/cliente-to-restaurante/:compraId', reporteController.reporteClienteToRestaurante);

// Ruta para crear un reporte de restaurante a cliente
router.post('/restaurante-to-cliente/:compraId', reporteController.reporteRestauranteToCliente);

// Ruta para obtener un reporte por ID
router.get('/:reporteId', reporteController.getReporteById);

export default router;