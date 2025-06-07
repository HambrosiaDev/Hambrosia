import { ReporteService } from '../../../../src/services/reporteService';
import { CompraService } from '../../../../src/services/compraService';
import { UsuarioService } from '../../../../src/services/usuarioService';
import { PaqueteService } from '../../../../src/services/paqueteService';
import { db } from '../../../../src/config/firebase';
import { sendEmail } from '../../../../src/config/emailConfig';
import { Firestore } from 'firebase-admin/firestore';

// Import mocks from setup
import {
  mockCollection,
  mockDoc,
  mockDocSet,
  mockDocGet,
  mockCollectionResult,
  mockDocResult
} from '../../setup';

// Setup service mocks
jest.mock('../../../../src/services/compraService');
jest.mock('../../../../src/services/usuarioService');
jest.mock('../../../../src/services/paqueteService');
jest.mock('../../../../src/config/emailConfig', () => ({
  sendEmail: jest.fn()
}));

// Create mock instances
const mockCompraService = {
  getCompraById: jest.fn()
} as unknown as jest.Mocked<CompraService>;

const mockUsuarioService = {
  getById: jest.fn()
} as unknown as jest.Mocked<UsuarioService>;

const mockPaqueteService = {
  obtenerPaquetePorId: jest.fn()
} as unknown as jest.Mocked<PaqueteService>;

const mockDb = db as jest.Mocked<typeof db>;
const mockSendEmail = sendEmail as jest.Mock;

describe('ReporteService', () => {
  let reporteService: ReporteService;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create a new instance with mocked dependencies
    reporteService = new ReporteService(
      mockCompraService,
      mockUsuarioService,
      mockPaqueteService
    );
  });

  describe('reporteClienteToRestaurante', () => {
    const compraId = 'compra123';
    const descripcion = 'Producto defectuoso';
    const mockCompra = {
      id: compraId,
      restauranteId: 'restaurante456',
      paqueteId: 'paquete789',
      valorComision: 10,
      fechaCompra: { toDate: () => new Date() },
    };
    const mockRestaurante = {
      id: 'restaurante456',
      nombre: 'El Restaurante',
      correo: 'restaurante@example.com',
      cedulaRUC: '1234567890',
    };
    const mockPaquete = {
      id: 'paquete789',
      precio: 50,
      precioDescuento: 40,
    };

    test('should create a client-to-restaurante report and send email on success', async () => {
      mockCompraService.getCompraById.mockResolvedValue(mockCompra as any);
      mockUsuarioService.getById.mockResolvedValue(mockRestaurante as any);
      mockPaqueteService.obtenerPaquetePorId.mockResolvedValue(mockPaquete as any);

      const result = await reporteService.reporteClienteToRestaurante(compraId, descripcion);

      expect(mockDb.collection).toHaveBeenCalledWith('reportes');
      expect(mockCollectionResult.withConverter).toHaveBeenCalled();
      expect(mockCollectionResult.doc).toHaveBeenCalledWith(compraId);
      expect(mockDocSet).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: compraId,
        compraId: compraId,
        descripcion,
        nombreRestaurante: mockRestaurante.nombre,
        precio: mockPaquete.precio,
        precioDescuento: mockPaquete.precioDescuento,
        comision: mockCompra.valorComision,
        correo: mockRestaurante.correo,
        cedulaRUC: mockRestaurante.cedulaRUC,
        tipoReporte: 'cliente_to_restaurante',
      }));
    });

    test('should throw error if compra is not found', async () => {
      mockCompraService.getCompraById.mockResolvedValue(null);

      await expect(reporteService.reporteClienteToRestaurante(compraId, descripcion)).rejects.toThrow('Compra no encontrada');
      expect(mockUsuarioService.getById).not.toHaveBeenCalled();
      expect(mockPaqueteService.obtenerPaquetePorId).not.toHaveBeenCalled();
      expect(mockCollectionResult.doc).not.toHaveBeenCalled();
      expect(mockDocSet).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test('should throw error if restaurante is not found', async () => {
      mockCompraService.getCompraById.mockResolvedValue(mockCompra as any);
      mockUsuarioService.getById.mockResolvedValue(null);

      await expect(reporteService.reporteClienteToRestaurante(compraId, descripcion)).rejects.toThrow('Restaurante no encontrado');
      expect(mockPaqueteService.obtenerPaquetePorId).not.toHaveBeenCalled();
      expect(mockCollectionResult.doc).not.toHaveBeenCalled();
      expect(mockDocSet).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test('should throw error if paquete is not found', async () => {
      mockCompraService.getCompraById.mockResolvedValue(mockCompra as any);
      mockUsuarioService.getById.mockResolvedValue(mockRestaurante as any);
      mockPaqueteService.obtenerPaquetePorId.mockResolvedValue(null);

      await expect(reporteService.reporteClienteToRestaurante(compraId, descripcion)).rejects.toThrow('Paquete no encontrado');
      expect(mockCollectionResult.doc).not.toHaveBeenCalled();
      expect(mockDocSet).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test('should handle general errors during creation', async () => {
      const errorMessage = 'Firebase error';
      mockCompraService.getCompraById.mockRejectedValue(new Error(errorMessage));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(reporteService.reporteClienteToRestaurante(compraId, descripcion)).rejects.toThrow(errorMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creando el reporte', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('reporteRestauranteToCliente', () => {
    const compraId = 'compra123';
    const descripcion = 'Cliente no se presentó';
    const mockCompra = {
      id: compraId,
      restauranteId: 'restaurante456',
      paqueteId: 'paquete789',
      valorComision: 10,
      fechaCompra: { toDate: () => new Date() },
    };
    const mockRestaurante = {
      id: 'restaurante456',
      nombre: 'El Restaurante',
      correo: 'restaurante@example.com',
      cedulaRUC: '1234567890',
    };
    const mockPaquete = {
      id: 'paquete789',
      precio: 50,
      precioDescuento: 40,
    };

    test('should create a restaurante-to-client report and send email on success', async () => {
      mockCompraService.getCompraById.mockResolvedValue(mockCompra as any);
      mockUsuarioService.getById.mockResolvedValue(mockRestaurante as any);
      mockPaqueteService.obtenerPaquetePorId.mockResolvedValue(mockPaquete as any);

      const result = await reporteService.reporteRestauranteToCliente(compraId, descripcion);

      expect(mockDb.collection).toHaveBeenCalledWith('reportes');
      expect(mockCollectionResult.withConverter).toHaveBeenCalled();
      expect(mockCollectionResult.doc).toHaveBeenCalledWith(compraId);
      expect(mockDocSet).toHaveBeenCalled();
      expect(mockSendEmail).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        id: compraId,
        compraId: compraId,
        descripcion,
        nombreRestaurante: mockRestaurante.nombre,
        precio: mockPaquete.precio,
        precioDescuento: mockPaquete.precioDescuento,
        comision: mockCompra.valorComision,
        correo: mockRestaurante.correo,
        cedulaRUC: mockRestaurante.cedulaRUC,
        tipoReporte: 'restaurante_to_cliente',
      }));
    });

    test('should throw error if compra is not found', async () => {
      mockCompraService.getCompraById.mockResolvedValue(null);

      await expect(reporteService.reporteRestauranteToCliente(compraId, descripcion)).rejects.toThrow('Compra no encontrada');
      expect(mockUsuarioService.getById).not.toHaveBeenCalled();
      expect(mockPaqueteService.obtenerPaquetePorId).not.toHaveBeenCalled();
      expect(mockCollectionResult.doc).not.toHaveBeenCalled();
      expect(mockDocSet).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test('should throw error if restaurante is not found', async () => {
      mockCompraService.getCompraById.mockResolvedValue(mockCompra as any);
      mockUsuarioService.getById.mockResolvedValue(null);

      await expect(reporteService.reporteRestauranteToCliente(compraId, descripcion)).rejects.toThrow('Restaurante no encontrado');
      expect(mockPaqueteService.obtenerPaquetePorId).not.toHaveBeenCalled();
      expect(mockCollectionResult.doc).not.toHaveBeenCalled();
      expect(mockDocSet).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test('should throw error if paquete is not found', async () => {
      mockCompraService.getCompraById.mockResolvedValue(mockCompra as any);
      mockUsuarioService.getById.mockResolvedValue(mockRestaurante as any);
      mockPaqueteService.obtenerPaquetePorId.mockResolvedValue(null);

      await expect(reporteService.reporteRestauranteToCliente(compraId, descripcion)).rejects.toThrow('Paquete no encontrado');
      expect(mockCollectionResult.doc).not.toHaveBeenCalled();
      expect(mockDocSet).not.toHaveBeenCalled();
      expect(mockSendEmail).not.toHaveBeenCalled();
    });

    test('should handle general errors during creation', async () => {
      const errorMessage = 'Database connection error';
      mockCompraService.getCompraById.mockRejectedValue(new Error(errorMessage));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(reporteService.reporteRestauranteToCliente(compraId, descripcion)).rejects.toThrow(errorMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creando el reporte', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getReporteById', () => {
    const reporteId = 'reporte789';
    const mockReporte = {
      id: reporteId,
      compraId: 'compra123',
      descripcion: 'Test Report',
      nombreRestaurante: 'Test Restaurant',
      precio: 100,
      precioDescuento: 80,
      comision: 10,
      fechaCompra: new Date(),
      correo: 'test@example.com',
      cedulaRUC: '9876543210',
      tipoReporte: 'cliente_to_restaurante',
    };

    test('should return the report if found', async () => {
      mockDocGet.mockResolvedValue({
        exists: true,
        id: reporteId,
        data: () => mockReporte,
      });

      const result = await reporteService.getReporteById(reporteId);

      expect(mockDb.collection).toHaveBeenCalledWith('reportes');
      expect(mockCollectionResult.withConverter).toHaveBeenCalled();
      expect(mockCollectionResult.doc).toHaveBeenCalledWith(reporteId);
      expect(mockDocGet).toHaveBeenCalled();
      expect(result).toEqual(mockReporte);
    });

    test('should return null if report is not found', async () => {
      mockDocGet.mockResolvedValue({ exists: false });

      const result = await reporteService.getReporteById(reporteId);

      expect(mockDb.collection).toHaveBeenCalledWith('reportes');
      expect(mockCollectionResult.withConverter).toHaveBeenCalled();
      expect(mockCollectionResult.doc).toHaveBeenCalledWith(reporteId);
      expect(mockDocGet).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should handle general errors during retrieval', async () => {
      const errorMessage = 'Firestore read error';
      mockDocGet.mockRejectedValue(new Error(errorMessage));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(reporteService.getReporteById(reporteId)).rejects.toThrow(errorMessage);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error obteniendo el reporte', expect.any(Error));
      consoleErrorSpy.mockRestore();
    });
  });
});