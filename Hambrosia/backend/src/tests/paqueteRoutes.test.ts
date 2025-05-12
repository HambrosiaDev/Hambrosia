import express from 'express';
import request from 'supertest';
import * as paqueteController from '../controllers/paqueteController';
import paqueteRoutes from '../routes/paqueteRoutes';

// Mock del controlador
jest.mock('../controllers/paqueteController', () => ({
  publicarPaquete: jest.fn(),
  getPaqueteByCiudad: jest.fn()
}));

describe('Paquete Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/paquetes', paqueteRoutes);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('POST /api/paquetes/:cedRuc/crearPaquete', () => {
    it('should create a new paquete successfully', async () => {
      (paqueteController.publicarPaquete as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ 
          success: true, 
          message: 'Paquete publicado exitosamente', 
          data: { 
            id: 'paquete1',
            descripcion: 'Paquete Familiar',
            precio: 29.99,
            precioDescuento: 24.99,
            unidades: 10,
            horaRetiro: new Date().toISOString(),
            imagenURL: 'https://example.com/image.jpg',
            restauranteId: 'rest1'
          } 
        });
      });

      const response = await request(app)
        .post('/api/paquetes/rest1/crearPaquete')
        .send({ 
          descripcion: 'Paquete Familiar',
          precio: 29.99,
          precioDescuento: 24.99,
          unidades: 10,
          horaRetiro: '21:00',
          imagenURL: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('paquete1');
      expect(paqueteController.publicarPaquete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when required fields are missing', async () => {
      (paqueteController.publicarPaquete as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'Todos los campos obligatorios deben ser proporcionados' 
        });
      });

      const response = await request(app)
        .post('/api/paquetes/rest1/crearPaquete')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(paqueteController.publicarPaquete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when unidades is less than 1', async () => {
      (paqueteController.publicarPaquete as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'El número de unidades debe ser al menos 1' 
        });
      });

      const response = await request(app)
        .post('/api/paquetes/rest1/crearPaquete')
        .send({ 
          descripcion: 'Paquete Familiar',
          precio: 29.99,
          precioDescuento: 24.99,
          unidades: 0,
          horaRetiro: '21:00',
          imagenURL: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(paqueteController.publicarPaquete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when horaRetiro is invalid', async () => {
      (paqueteController.publicarPaquete as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'Formato de hora inválido. Debe ser HH:MM (ej: 21:00)' 
        });
      });

      const response = await request(app)
        .post('/api/paquetes/rest1/crearPaquete')
        .send({ 
          descripcion: 'Paquete Familiar',
          precio: 29.99,
          precioDescuento: 24.99,
          unidades: 10,
          horaRetiro: '25:00',
          imagenURL: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(paqueteController.publicarPaquete).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when horaRetiro is in the past', async () => {
      (paqueteController.publicarPaquete as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ 
          success: false, 
          error: 'La hora de retiro no puede ser en el pasado' 
        });
      });

      const response = await request(app)
        .post('/api/paquetes/rest1/crearPaquete')
        .send({ 
          descripcion: 'Paquete Familiar',
          precio: 29.99,
          precioDescuento: 24.99,
          unidades: 10,
          horaRetiro: '00:00',
          imagenURL: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(paqueteController.publicarPaquete).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when server error occurs', async () => {
      (paqueteController.publicarPaquete as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ 
          success: false, 
          error: 'Error al publicar el paquete' 
        });
      });

      const response = await request(app)
        .post('/api/paquetes/rest1/crearPaquete')
        .send({ 
          descripcion: 'Paquete Familiar',
          precio: 29.99,
          precioDescuento: 24.99,
          unidades: 10,
          horaRetiro: '21:00',
          imagenURL: 'https://example.com/image.jpg'
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(paqueteController.publicarPaquete).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/paquetes/:ciudad', () => {
    it('should get paquetes by ciudad successfully', async () => {
      (paqueteController.getPaqueteByCiudad as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          success: true, 
          data: [
            {
              id: 'paquete1',
              descripcion: 'Paquete Familiar',
              precio: 29.99,
              precioDescuento: 24.99,
              unidades: 10,
              horaRetiro: new Date().toISOString(),
              imagenURL: 'https://example.com/image.jpg',
              restauranteId: 'rest1'
            }
          ] 
        });
      });

      const response = await request(app)
        .get('/api/paquetes/Quito');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(paqueteController.getPaqueteByCiudad).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when no paquetes found in ciudad', async () => {
      (paqueteController.getPaqueteByCiudad as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ 
          success: false, 
          message: 'No se encontraron paquetes para esta ciudad' 
        });
      });

      const response = await request(app)
        .get('/api/paquetes/CiudadNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(paqueteController.getPaqueteByCiudad).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when server error occurs', async () => {
      (paqueteController.getPaqueteByCiudad as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ 
          success: false, 
          error: 'Error al obtener paquetes por ciudad' 
        });
      });

      const response = await request(app)
        .get('/api/paquetes/Quito');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(paqueteController.getPaqueteByCiudad).toHaveBeenCalledTimes(1);
    });
  });
}); 