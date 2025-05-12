import express from 'express';
import request from 'supertest';
import * as usuarioController from '../controllers/usuarioController';
import { Rol } from '../models/interfaces';
import usuarioRoutes from '../routes/usuarioRoutes';

// Mock del controlador
jest.mock('../controllers/usuarioController', () => ({
  registerUsuario: jest.fn(),
  getRestaurantes: jest.fn(),
  getUsuarioById: jest.fn(),
  registrarIntentoFallido: jest.fn(),
  resetearIntentosFallidos: jest.fn(),
  resetearStrikes: jest.fn(),
  incrementarStrike: jest.fn(),
  verificarBloqueo: jest.fn(),
  desbloquearUsuario: jest.fn()
}));

describe('Usuario Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    // Configurar el timeout global para las pruebas
    jest.setTimeout(10000);
  });

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/usuarios', usuarioRoutes);
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Limpiar todos los timers pendientes
    jest.clearAllTimers();
    // Limpiar todos los mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Limpiar cualquier timer o proceso pendiente
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  describe('POST /api/usuarios/register', () => {
    const mockUsuario = {
      correo: 'test@example.com',
      cedulaRUC: '1723920832001',
      nombre: 'Test User',
      ciudad: 'Quito',
      rol: Rol.CLIENTE,
      firebaseUid: 'mockFirebaseUid'
    };

    it('should register a new user successfully', async () => {
      (usuarioController.registerUsuario as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json({ success: true, data: mockUsuario });
      });

      const response = await request(app)
        .post('/api/usuarios/register')
        .send(mockUsuario);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({ success: true, data: mockUsuario });
      expect(usuarioController.registerUsuario).toHaveBeenCalledTimes(1);
    });

    it('should handle validation errors', async () => {
      (usuarioController.registerUsuario as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ success: false, error: 'Todos los campos son obligatorios' });
      });

      const response = await request(app)
        .post('/api/usuarios/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ success: false, error: 'Todos los campos son obligatorios' });
      expect(usuarioController.registerUsuario).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/usuarios/restaurantes', () => {
    const mockRestaurantes = [
      {
        id: '1',
        nombre: 'Restaurante 1',
        rol: Rol.RESTAURANTE
      },
      {
        id: '2',
        nombre: 'Restaurante 2',
        rol: Rol.RESTAURANTE
      }
    ];

    it('should get all restaurants successfully', async () => {
      (usuarioController.getRestaurantes as jest.Mock).mockImplementation((req, res) => {
        res.json({ success: true, data: mockRestaurantes });
      });

      const response = await request(app)
        .get('/api/usuarios/restaurantes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockRestaurantes });
      expect(usuarioController.getRestaurantes).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/usuarios/:id', () => {
    const mockUsuario = {
      id: '1723920832001',
      nombre: 'Test User',
      rol: Rol.CLIENTE
    };

    it('should get user by ID successfully', async () => {
      (usuarioController.getUsuarioById as jest.Mock).mockImplementation((req, res) => {
        res.json({ success: true, data: mockUsuario });
      });

      const response = await request(app)
        .get('/api/usuarios/1723920832001');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: mockUsuario });
      expect(usuarioController.getUsuarioById).toHaveBeenCalledTimes(1);
    });

    it('should handle user not found', async () => {
      (usuarioController.getUsuarioById as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      });

      const response = await request(app)
        .get('/api/usuarios/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ success: false, error: 'Usuario no encontrado' });
      expect(usuarioController.getUsuarioById).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/usuarios/login/intentoFallido', () => {
    it('should register failed login attempt successfully', async () => {
      (usuarioController.registrarIntentoFallido as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json({ success: true, error: 'Intento Fallido Registrado' });
      });

      const response = await request(app)
        .post('/api/usuarios/login/intentoFallido')
        .send({ correo: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, error: 'Intento Fallido Registrado' });
      expect(usuarioController.registrarIntentoFallido).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/usuarios/login/resetearIntentos', () => {
    it('should reset failed attempts successfully', async () => {
      (usuarioController.resetearIntentosFallidos as jest.Mock).mockImplementation((req, res) => {
        res.json({
          success: true,
          data: { intentosFallidos: 0, activo: true },
          message: 'Intentos fallidos reseteados exitosamente'
        });
      });

      const response = await request(app)
        .post('/api/usuarios/login/resetearIntentos')
        .send({ correo: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: { intentosFallidos: 0, activo: true },
        message: 'Intentos fallidos reseteados exitosamente'
      });
      expect(usuarioController.resetearIntentosFallidos).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/usuarios/:id/incrementar-strike', () => {
    it('should increment strike successfully', async () => {
      (usuarioController.incrementarStrike as jest.Mock).mockImplementation((req, res) => {
        res.json({
          success: true,
          data: {
            userId: '1723920832001',
            strikes: 1,
            activo: true,
            mensaje: 'Se ha incrementado el número de strikes para el usuario. Total: 1'
          }
        });
      });

      const response = await request(app)
        .post('/api/usuarios/1723920832001/incrementar-strike');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          userId: '1723920832001',
          strikes: 1,
          activo: true,
          mensaje: 'Se ha incrementado el número de strikes para el usuario. Total: 1'
        }
      });
      expect(usuarioController.incrementarStrike).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/usuarios/:id/Verificar-bloqueo', () => {
    it('should check user block status successfully', async () => {
      (usuarioController.verificarBloqueo as jest.Mock).mockImplementation((req, res) => {
        res.json({ success: true, data: { bloqueado: false } });
      });

      const response = await request(app)
        .get('/api/usuarios/1723920832001/Verificar-bloqueo');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: { bloqueado: false } });
      expect(usuarioController.verificarBloqueo).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/usuarios/desbloquear', () => {
    it('should unlock user successfully', async () => {
      (usuarioController.desbloquearUsuario as jest.Mock).mockImplementation((req, res) => {
        res.json({
          success: true,
          data: {
            intentosFallidos: 0,
            strikes: 0,
            activo: true
          },
          message: 'Usuario desbloqueado exitosamente'
        });
      });

      const response = await request(app)
        .post('/api/usuarios/desbloquear')
        .send({ correo: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          intentosFallidos: 0,
          strikes: 0,
          activo: true
        },
        message: 'Usuario desbloqueado exitosamente'
      });
      expect(usuarioController.desbloquearUsuario).toHaveBeenCalledTimes(1);
    });
  });
}); 