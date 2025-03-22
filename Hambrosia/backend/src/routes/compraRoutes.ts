import express from 'express';
import * as compraController from '../controllers/compraController';

const router = express.Router();

// Get all compras
router.get('/', compraController.getAllCompras);

// Get compra by código
router.get('/codigo/:codigo', compraController.getCompraByCodigo);

// Get compras by usuario
router.get('/usuario/:id', compraController.getComprasByUsuario);

// Get compras by paquete
router.get('/paquete/:id', compraController.getComprasByPaquete);

// Get compra by ID - después de las rutas específicas para evitar conflictos
router.get('/:id', compraController.getCompraById);

// Create compra
router.post('/', compraController.createCompra);

// Delete compra
router.delete('/:id', compraController.deleteCompra);

export default router;