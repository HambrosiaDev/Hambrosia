import express from 'express';
import * as compraController from '../controllers/compraController';

const router = express.Router();

// Crear compra
router.post('/:paqueteId', compraController.crearCompra);

export default router;