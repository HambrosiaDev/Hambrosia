import express from 'express';
import * as compraController from '../controllers/compraController';

const router = express.Router();

// Crear compra
router.post('/:paqueteId', compraController.crearCompra);

// Confirmar compra
router.post('/confirmar/:compraId', compraController.confirmarCompra);

// Cancelar compra
router.put('/cancelar/:compraId', compraController.cancelarCompra);


export default router;