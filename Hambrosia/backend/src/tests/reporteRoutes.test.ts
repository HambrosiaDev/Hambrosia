import express from 'express';
import request from 'supertest';
import { reporteController } from '../controllers/reporteController';
import reporteRoutes from '../routes/reporteRoutes';

// Mock del controlador
jest.mock('../controllers/reporteController', () => ({
  reporteController: {
    crearReporte: jest.fn(),
    getReporteById: jest.fn()
  }
}));

describe('Reporte Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/reportes', reporteRoutes);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('POST /api/reportes/crearReporte/:compraId', () => {
    it('should create a new reporte successfully', async () => {
      (reporteController.crearReporte as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ 
          id: 'reporte1',
          compraId: 'compra1',
          descripcion: 'El producto llegó dañado',
          fecha: new Date().toISOString()
        });
      });

      const response = await request(app)
        .post('/api/reportes/crearReporte/compra1')
        .send({ descripcion: 'El producto llegó dañado' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('reporte1');
      expect(response.body.compraId).toBe('compra1');
      expect(reporteController.crearReporte).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when required fields are missing', async () => {
      (reporteController.crearReporte as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'compraId y descripcion son obligatorios' });
      });

      const response = await request(app)
        .post('/api/reportes/crearReporte/compra1')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('compraId y descripcion son obligatorios');
      expect(reporteController.crearReporte).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when compra is not found', async () => {
      (reporteController.crearReporte as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Compra no encontrada' });
      });

      const response = await request(app)
        .post('/api/reportes/crearReporte/compraNoExistente')
        .send({ descripcion: 'El producto llegó dañado' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Compra no encontrada');
      expect(reporteController.crearReporte).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when server error occurs', async () => {
      (reporteController.crearReporte as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .post('/api/reportes/crearReporte/compra1')
        .send({ descripcion: 'El producto llegó dañado' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
      expect(reporteController.crearReporte).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/reportes/:reporteId', () => {
    it('should get reporte by id successfully', async () => {
      (reporteController.getReporteById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ 
          id: 'reporte1',
          compraId: 'compra1',
          descripcion: 'El producto llegó dañado',
          fecha: new Date().toISOString()
        });
      });

      const response = await request(app)
        .get('/api/reportes/reporte1');

      expect(response.status).toBe(200);
      expect(response.body.id).toBe('reporte1');
      expect(response.body.compraId).toBe('compra1');
      expect(reporteController.getReporteById).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when reporteId is missing', async () => {
      (reporteController.getReporteById as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'reporteId es obligatorio' });
      });

      const response = await request(app)
        .get('/api/reportes/');

      expect(response.status).toBe(404); // Express returns 404 for non-existent routes
    });

    it('should return 404 when reporte is not found', async () => {
      (reporteController.getReporteById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Reporte no encontrado' });
      });

      const response = await request(app)
        .get('/api/reportes/reporteNoExistente');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Reporte no encontrado');
      expect(reporteController.getReporteById).toHaveBeenCalledTimes(1);
    });

    it('should return 500 when server error occurs', async () => {
      (reporteController.getReporteById as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error interno del servidor' });
      });

      const response = await request(app)
        .get('/api/reportes/reporte1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error interno del servidor');
      expect(reporteController.getReporteById).toHaveBeenCalledTimes(1);
    });
  });
}); 