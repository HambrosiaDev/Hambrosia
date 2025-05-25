import express from 'express';
import * as compraController from '../controllers/compraController';

const router = express.Router();

// Crear compra
router.post('/:paqueteId', compraController.crearCompra);

// Confirmar compra
router.post('/confirmar/:compraId', compraController.confirmarCompra);

// Cancelar compra
router.put('/cancelar/:compraId', compraController.cancelarCompra);

router.get('/comisionMensual/:mes/:restauranteId', compraController.getComisionMensualByRestauranteId);

router.get('/codigoConf/:compraId', compraController.getCodigoByCompraId);

router.get('/activas/:clienteId', compraController.getComprasActivasByClienteId);

router.get('/completadas/:clienteId', compraController.getComprasCompletadasByClienteId);

router.get('/canceladas/:clienteId', compraController.getComprasCanceladasByClienteId);

router.get('/getCompras/:restauranteId/:fechaCompra', compraController.getComprasByRestauranteId);


export default router;