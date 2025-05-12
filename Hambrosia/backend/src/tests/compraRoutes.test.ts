import express from 'express';
import request from 'supertest';
import * as compraController from '../controllers/compraController';
import compraRoutes from '../routes/compraRoutes';

// Mock del controlador
jest.mock('../controllers/compraController', () => ({
  crearCompra: jest.fn(),
  confirmarCompra: jest.fn(),
  cancelarCompra: jest.fn(),
  getNotificacionByCompraId: jest.fn(),
  getComisionMensualByRestauranteId: jest.fn(),
  getCodigoByCompraId: jest.fn(),
  getComprasActivasByClienteId: jest.fn(),
  getComprasCompletadasByClienteId: jest.fn(),
  getComprasCanceladasByClienteId: jest.fn(),
  getComprasByRestauranteId: jest.fn(),
}));

describe('Compra Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/compras', compraRoutes);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('POST /api/compras/:paqueteId', () => {
    it('should create a new compra successfully', async () => {
      (compraController.crearCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ 
          success: true, 
          message: 'Compra creada exitosamente', 
          data: { 
            id: 'compra1',
            paqueteId: 'paquete1',
            clienteId: 'cliente1',
            restauranteId: 'rest1',
            cantidadComprada: 2,
            metodoElegido: 'DeUna',
            estado: 'pendiente',
            fechaCompra: new Date().toISOString()
          } 
        });
      });

      const response = await request(app)
        .post('/api/compras/paquete1')
        .send({ 
          clienteId: 'cliente1', 
          restauranteId: 'rest1', 
          cantidadComprada: 2, 
          metodoElegido: 'DeUna' 
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('compra1');
      expect(compraController.crearCompra).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when required fields are missing', async () => {
      (compraController.crearCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'Faltan campos requeridos' 
        });
      });

      const response = await request(app)
        .post('/api/compras/paquete1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(compraController.crearCompra).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when paquete is not found', async () => {
      (compraController.crearCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Paquete no encontrado' 
        });
      });

      const response = await request(app)
        .post('/api/compras/paqueteNoExistente')
        .send({ 
          clienteId: 'cliente1', 
          restauranteId: 'rest1', 
          cantidadComprada: 2, 
          metodoElegido: 'DeUna' 
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.crearCompra).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/compras/confirmar/:compraId', () => {
    it('should confirm a compra successfully', async () => {
      (compraController.confirmarCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          message: 'Compra confirmada exitosamente', 
          data: { 
            id: 'compra1',
            estado: 'confirmada',
            codigoConfirmacion: '123456'
          } 
        });
      });

      const response = await request(app)
        .post('/api/compras/confirmar/compra1')
        .send({ codigo: '123456' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(compraController.confirmarCompra).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when codigo is missing', async () => {
      (compraController.confirmarCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'Código de confirmación es requerido' 
        });
      });

      const response = await request(app)
        .post('/api/compras/confirmar/compra1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(compraController.confirmarCompra).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when compra is not found', async () => {
      (compraController.confirmarCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Compra no encontrada' 
        });
      });

      const response = await request(app)
        .post('/api/compras/confirmar/compraNoExistente')
        .send({ codigo: '123456' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.confirmarCompra).toHaveBeenCalledTimes(1);
    });
  });

  describe('PUT /api/compras/cancelar/:compraId', () => {
    it('should cancel a compra successfully', async () => {
      (compraController.cancelarCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          message: 'Compra cancelada exitosamente', 
          data: { 
            id: 'compra1',
            estado: 'cancelada'
          } 
        });
      });

      const response = await request(app)
        .put('/api/compras/cancelar/compra1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(compraController.cancelarCompra).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when compra is not found', async () => {
      (compraController.cancelarCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Compra no encontrada' 
        });
      });

      const response = await request(app)
        .put('/api/compras/cancelar/compraNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.cancelarCompra).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when compra cannot be cancelled', async () => {
      (compraController.cancelarCompra as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'La compra no puede ser cancelada en su estado actual' 
        });
      });

      const response = await request(app)
        .put('/api/compras/cancelar/compra1');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(compraController.cancelarCompra).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/notificacion/:compraId', () => {
    it('should get notificacion successfully', async () => {
      (compraController.getNotificacionByCompraId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: { 
            id: 'noti1',
            compraId: 'compra1',
            mensaje: 'Su compra ha sido confirmada',
            fecha: new Date().toISOString()
          } 
        });
      });

      const response = await request(app)
        .get('/api/compras/notificacion/compra1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(compraController.getNotificacionByCompraId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when notificacion is not found', async () => {
      (compraController.getNotificacionByCompraId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Notificación no encontrada' 
        });
      });

      const response = await request(app)
        .get('/api/compras/notificacion/compraNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getNotificacionByCompraId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/comisionMensual/:mes/:restauranteId', () => {
    it('should get comision mensual successfully', async () => {
      (compraController.getComisionMensualByRestauranteId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: {
            mes: 'junio',
            restauranteId: 'rest1',
            comision: 100,
            totalVentas: 1000
          } 
        });
      });

      const response = await request(app)
        .get('/api/compras/comisionMensual/junio/rest1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(compraController.getComisionMensualByRestauranteId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when restaurante is not found', async () => {
      (compraController.getComisionMensualByRestauranteId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Restaurante no encontrado' 
        });
      });

      const response = await request(app)
        .get('/api/compras/comisionMensual/junio/restNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getComisionMensualByRestauranteId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/codigoConf/:compraId', () => {
    it('should get codigo successfully', async () => {
      (compraController.getCodigoByCompraId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: {
            codigo: '123456',
            expiracion: new Date(Date.now() + 3600000).toISOString()
          } 
        });
      });

      const response = await request(app)
        .get('/api/compras/codigoConf/compra1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(compraController.getCodigoByCompraId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when codigo is not found', async () => {
      (compraController.getCodigoByCompraId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Código no encontrado' 
        });
      });

      const response = await request(app)
        .get('/api/compras/codigoConf/compraNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getCodigoByCompraId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/activas/:clienteId', () => {
    it('should get active compras successfully', async () => {
      (compraController.getComprasActivasByClienteId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            {
              id: 'compra1',
              estado: 'pendiente',
              fechaCompra: new Date().toISOString()
            }
          ] 
        });
      });

      const response = await request(app)
        .get('/api/compras/activas/cliente1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(compraController.getComprasActivasByClienteId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when cliente is not found', async () => {
      (compraController.getComprasActivasByClienteId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      });

      const response = await request(app)
        .get('/api/compras/activas/clienteNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getComprasActivasByClienteId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/completadas/:clienteId', () => {
    it('should get completed compras successfully', async () => {
      (compraController.getComprasCompletadasByClienteId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            {
              id: 'compra1',
              estado: 'completada',
              fechaCompra: new Date().toISOString()
            }
          ] 
        });
      });

      const response = await request(app)
        .get('/api/compras/completadas/cliente1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(compraController.getComprasCompletadasByClienteId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when cliente is not found', async () => {
      (compraController.getComprasCompletadasByClienteId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      });

      const response = await request(app)
        .get('/api/compras/completadas/clienteNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getComprasCompletadasByClienteId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/canceladas/:clienteId', () => {
    it('should get cancelled compras successfully', async () => {
      (compraController.getComprasCanceladasByClienteId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            {
              id: 'compra1',
              estado: 'cancelada',
              fechaCompra: new Date().toISOString()
            }
          ] 
        });
      });

      const response = await request(app)
        .get('/api/compras/canceladas/cliente1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(compraController.getComprasCanceladasByClienteId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when cliente is not found', async () => {
      (compraController.getComprasCanceladasByClienteId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Cliente no encontrado' 
        });
      });

      const response = await request(app)
        .get('/api/compras/canceladas/clienteNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getComprasCanceladasByClienteId).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/compras/getCompras/:restauranteId/:fechaCompra', () => {
    it('should get compras by restaurante and date successfully', async () => {
      (compraController.getComprasByRestauranteId as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            {
              id: 'compra1',
              restauranteId: 'rest1',
              fechaCompra: '2024-06-01'
            }
          ] 
        });
      });

      const response = await request(app)
        .get('/api/compras/getCompras/rest1/2024-06-01');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(compraController.getComprasByRestauranteId).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when restaurante is not found', async () => {
      (compraController.getComprasByRestauranteId as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          error: 'Restaurante no encontrado' 
        });
      });

      const response = await request(app)
        .get('/api/compras/getCompras/restNoExistente/2024-06-01');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(compraController.getComprasByRestauranteId).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when fechaCompra is invalid', async () => {
      (compraController.getComprasByRestauranteId as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'Formato de fecha inválido' 
        });
      });

      const response = await request(app)
        .get('/api/compras/getCompras/rest1/fechaInvalida');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(compraController.getComprasByRestauranteId).toHaveBeenCalledTimes(1);
    });
  });
}); 