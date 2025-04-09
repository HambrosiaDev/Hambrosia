import express from 'express';
import * as compraController from '../controllers/compraController';

const router = express.Router();


// Create compra
router.post('/', compraController.crearCompra);

//Confirmar compra
//router.post('/confirmarCompra/:id', compraController.confirmarCompra);

// Eliminar compra
//router.delete('/eliminarCompra/:id', compraController.eliminarCompra);

export default router;