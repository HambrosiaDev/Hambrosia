import express from 'express';
import * as compraController from '../controllers/compraController';

const router = express.Router();

// Crear compra
router.post('/:paqueteId/:clienteId/:restauranteId', compraController.crearCompra);

// Confirmar compra
router.post('/confirmar/:compraId', compraController.confirmarCompra);


export default router;