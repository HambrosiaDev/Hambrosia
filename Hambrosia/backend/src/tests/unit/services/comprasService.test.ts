import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Compra, MetodoPago } from '../../../models/interfaces';
import { CompraService } from '../../../services/compraService';
import { paqueteService } from '../../../services/paqueteService';
import { usuarioService } from '../../../services/usuarioService';
import {
  mockCollection,
  mockCollectionAdd,
  mockCollectionGet,
  mockDoc,
  mockDocGet,
  mockDocUpdate,
  mockLimit,
  mockOrderBy,
  mockSelect,
  mockStartAfter,
  mockWhere,
} from '../../setup';
import * as helpers from '../../../utils/HELPER';

// Mocking dependencies
jest.mock('../../../services/paqueteService', () => ({
  paqueteService: {
    restarUnidadesPaquete: jest.fn(),
  },
}));

jest.mock('../../../services/usuarioService', () => ({
  usuarioService: {
    getById: jest.fn(),
  },
}));

// Mocking helper functions
jest.mock('../../../utils/HELPER', () => ({
  getEcuadorDayRangeFromDate: jest.fn((date) => {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5, 0, 0, 0); // 00:00:00 UTC-5
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 4, 59, 59, 999); // 23:59:59 UTC-5
    return { start: Timestamp.fromDate(start), end: Timestamp.fromDate(end) };
  }),
}));

describe('CompraService', () => {
  let compraService: CompraService;
  const mockCompra: Compra = {
    id: 'compra-id-1',
    paqueteId: 'paquete-id-1',
    clienteId: 'cliente-id-1',
    restauranteId: 'restaurante-id-1',
    cantidadComprada: 2,
    precioApagar: 20,
    valorComision: 2,
    metodoElegido: MetodoPago.EFECTIVO,
    fechaCompra: Timestamp.fromDate(new Date()),
    codigo: '12345',
    pagado: false,
    retirado: false,
    cancelado: false,
    confirmacionCodigo: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    compraService = new CompraService();

    // Reset mocks for Firestore methods used by compraService
    mockCollectionAdd.mockReset();
    mockCollectionGet.mockReset();
    mockDoc.mockReset();
    mockDocGet.mockReset();
    mockDocUpdate.mockReset();
    mockWhere.mockReset();
    mockSelect.mockReset();
    mockOrderBy.mockReset();
    mockLimit.mockReset();
    mockStartAfter.mockReset();

    // Mock the chainable Firestore methods
    const mockWhereReturn = {
      get: mockCollectionGet,
      select: mockSelect,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
    };
    const mockSelectReturn = {
      get: mockCollectionGet,
      where: mockWhere,
      orderBy: mockOrderBy,
      limit: mockLimit,
      startAfter: mockStartAfter,
    };
    const mockOrderByReturn = {
      get: mockCollectionGet,
      where: mockWhere,
      select: mockSelect,
      limit: mockLimit,
      startAfter: mockStartAfter,
    };
    const mockLimitReturn = {
      get: mockCollectionGet,
      where: mockWhere,
      select: mockSelect,
      orderBy: mockOrderBy,
      startAfter: mockStartAfter,
    };
    const mockStartAfterReturn = {
      get: mockCollectionGet,
      where: mockWhere,
      select: mockSelect,
      orderBy: mockOrderBy,
      limit: mockLimit,
    };

    mockCollection.mockReturnValue({
      add: mockCollectionAdd,
      doc: mockDoc,
      where: mockWhere.mockReturnValue(mockWhereReturn),
      select: mockSelect.mockReturnValue(mockSelectReturn),
      orderBy: mockOrderBy.mockReturnValue(mockOrderByReturn),
      limit: mockLimit.mockReturnValue(mockLimitReturn),
      startAfter: mockStartAfter.mockReturnValue(mockStartAfterReturn),
      get: mockCollectionGet,
      withConverter: jest.fn().mockReturnThis(), // Mock withConverter
    });

    const mockDocReturn = {
      get: mockDocGet,
      update: mockDocUpdate,
    };
    mockDoc.mockReturnValue(mockDocReturn);
  });

  describe('crearCompra', () => {
    it('should create a purchase and decrement package units successfully', async () => {
      const docRefMock = { id: 'new-compra-id' };
      mockCollectionAdd.mockResolvedValue(docRefMock);
      (paqueteService.restarUnidadesPaquete as jest.Mock).mockResolvedValue(undefined);

      const newCompraData: Omit<Compra, 'id' | 'fechaCompra'> = {
        paqueteId: 'paquete-id-1',
        clienteId: 'cliente-id-1',
        restauranteId: 'restaurante-id-1',
        cantidadComprada: 1,
        precioApagar: 15,
        valorComision: 1.5,
        metodoElegido: MetodoPago.TARJETA_CREDITO,
        codigo: 'abcde',
        pagado: true,
        retirado: false,
        cancelado: false,
        confirmacionCodigo: false,
      };

      const result = await compraService.crearCompra('paquete-id-1', newCompraData as Compra);

      expect(mockCollectionAdd).toHaveBeenCalledWith(expect.objectContaining(newCompraData));
      expect(paqueteService.restarUnidadesPaquete).toHaveBeenCalledWith('paquete-id-1', newCompraData.cantidadComprada);
      expect(result).toMatchObject({
        ...newCompraData,
        id: docRefMock.id,
        fechaCompra: expect.any(Object)
      });
    });

    it('should throw an error if Firestore add fails', async () => {
      const mockError = new Error('Firestore add failed');
      mockCollectionAdd.mockRejectedValue(mockError);

      const newCompraData: Omit<Compra, 'id' | 'fechaCompra'> = {
        paqueteId: 'paquete-id-1',
        clienteId: 'cliente-id-1',
        restauranteId: 'restaurante-id-1',
        cantidadComprada: 1,
        precioApagar: 15,
        valorComision: 1.5,
        metodoElegido: MetodoPago.TARJETA_CREDITO,
        codigo: 'abcde',
        pagado: true,
        retirado: false,
        cancelado: false,
        confirmacionCodigo: false,
      };

      await expect(compraService.crearCompra('paquete-id-1', newCompraData as Compra)).rejects.toThrow(
        'Error creando la compra',
      );
      expect(mockCollectionAdd).toHaveBeenCalledWith(expect.objectContaining(newCompraData));
      expect(paqueteService.restarUnidadesPaquete).not.toHaveBeenCalled();
    });

    it('should throw an error if restarUnidadesPaquete fails', async () => {
      const docRefMock = { id: 'new-compra-id' };
      mockCollectionAdd.mockResolvedValue(docRefMock);
      const mockError = new Error('Decrement units failed');
      (paqueteService.restarUnidadesPaquete as jest.Mock).mockRejectedValue(mockError);

      const newCompraData: Omit<Compra, 'id' | 'fechaCompra'> = {
        paqueteId: 'paquete-id-1',
        clienteId: 'cliente-id-1',
        restauranteId: 'restaurante-id-1',
        cantidadComprada: 1,
        precioApagar: 15,
        valorComision: 1.5,
        metodoElegido: MetodoPago.TARJETA_CREDITO,
        codigo: 'abcde',
        pagado: true,
        retirado: false,
        cancelado: false,
        confirmacionCodigo: false,
      };

      await expect(compraService.crearCompra('paquete-id-1', newCompraData as Compra)).rejects.toThrow(
        'Error creando la compra',
      );
      expect(mockCollectionAdd).toHaveBeenCalledWith(expect.objectContaining(newCompraData));
      expect(paqueteService.restarUnidadesPaquete).toHaveBeenCalledWith('paquete-id-1', newCompraData.cantidadComprada);
    });
  });

  describe('getCompraById', () => {
    it('should return the purchase if found', async () => {
      const mockDocSnapshot = {
        exists: true,
        data: () => mockCompra,
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const result = await compraService.getCompraById('compra-id-1');

      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'compra-id-1', ...mockCompra });
    });

    it('should return null if the purchase is not found', async () => {
      const mockDocSnapshot = {
        exists: false,
        data: () => undefined,
        id: 'non-existent-id',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const result = await compraService.getCompraById('non-existent-id');

      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should throw an error if Firestore get fails', async () => {
      const mockError = new Error('Firestore get failed');
      mockDocGet.mockRejectedValue(mockError);

      await expect(compraService.getCompraById('some-id')).rejects.toThrow('Error obteniendo la compra');
      expect(mockDoc).toHaveBeenCalledWith('some-id');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('confirmarCompra', () => {
    it('should confirm the purchase and return the updated purchase', async () => {
      const updatedData = { pagado: true, confirmado: true };
      const updatedCompra = { ...mockCompra, ...updatedData };

      const mockDocSnapshotAfterUpdate = {
        exists: true,
        data: () => updatedCompra,
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;

      mockDocUpdate.mockResolvedValue(undefined);
      mockDocGet.mockResolvedValue(mockDocSnapshotAfterUpdate);

      const result = await compraService.confirmarCompra('compra-id-1', updatedData);

      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(updatedData);
      expect(mockDocGet).toHaveBeenCalledTimes(2);
      expect(result).toMatchObject({ id: 'compra-id-1', ...updatedCompra });
    });

    it('should throw an error if the purchase is not found after update', async () => {
      const updatedData = { pagado: true };
      const mockDocSnapshotAfterUpdate = {
        exists: false,
        data: () => undefined,
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;

      mockDocUpdate.mockResolvedValue(undefined);
      mockDocGet.mockResolvedValue(mockDocSnapshotAfterUpdate);

      await expect(compraService.confirmarCompra('compra-id-1', updatedData)).rejects.toThrow('Compra no encontrada');
      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(updatedData);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
    });

    it('should throw the update error if Firestore update fails', async () => {
      const updatedData = { pagado: true };
      const mockError = new Error('Firestore update failed');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(compraService.confirmarCompra('compra-id-1', updatedData)).rejects.toThrow('Firestore update failed');
      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(updatedData);
      expect(mockDocGet).not.toHaveBeenCalled();
    });
  });

  describe('actualizarCompra', () => {
    it('should update the purchase and return the updated purchase', async () => {
      const updatedData = { retirado: true };
      const updatedCompra = { ...mockCompra, ...updatedData };

      const mockDocSnapshotAfterUpdate = {
        exists: true,
        data: () => updatedCompra,
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;

      mockDocUpdate.mockResolvedValue(undefined);
      mockDocGet.mockResolvedValue(mockDocSnapshotAfterUpdate);

      const result = await compraService.actualizarCompra('compra-id-1', updatedData);

      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(updatedData);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'compra-id-1', ...updatedCompra });
    });

    it('should throw an error if the purchase is not found after update', async () => {
      const updatedData = { retirado: true };
      const mockDocSnapshotAfterUpdate = {
        exists: false,
        data: () => undefined,
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;

      mockDocUpdate.mockResolvedValue(undefined);
      mockDocGet.mockResolvedValue(mockDocSnapshotAfterUpdate);

      await expect(compraService.actualizarCompra('compra-id-1', updatedData)).rejects.toThrow('Compra no encontrada');
      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(updatedData);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
    });

    it('should throw the update error if Firestore update fails', async () => {
      const updatedData = { retirado: true };
      const mockError = new Error('Firestore update failed');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(compraService.actualizarCompra('compra-id-1', updatedData)).rejects.toThrow('Firestore update failed');
      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocUpdate).toHaveBeenCalledWith(updatedData);
      expect(mockDocGet).not.toHaveBeenCalled();
    });
  });

  describe('getComisionMensualByRestauranteId', () => {
    it('should return the total commission for a given month and restaurant', async () => {
      const restauranteId = 'restaurante-id-1';
      const mes = 'junio';

      // Create dates in the correct timezone
      const date1 = new Date('2023-06-10T00:00:00.000Z');
      const date2 = new Date('2023-06-20T00:00:00.000Z');
      const date3 = new Date('2023-07-01T00:00:00.000Z');
      const date4 = new Date('2023-06-25T00:00:00.000Z');
      const date5 = new Date('2023-06-15T00:00:00.000Z');

      const mockCompras: Compra[] = [
        { ...mockCompra, id: 'c1', restauranteId, fechaCompra: Timestamp.fromDate(date1), pagado: true, valorComision: 5 },
        { ...mockCompra, id: 'c2', restauranteId, fechaCompra: Timestamp.fromDate(date2), pagado: true, valorComision: 10 },
        { ...mockCompra, id: 'c3', restauranteId, fechaCompra: Timestamp.fromDate(date3), pagado: true, valorComision: 7 },
        { ...mockCompra, id: 'c4', restauranteId, fechaCompra: Timestamp.fromDate(date4), pagado: false, valorComision: 8 },
        { ...mockCompra, id: 'c5', restauranteId, fechaCompra: Timestamp.fromDate(date5), pagado: true, valorComision: 12 },
      ];

      const mockSnapshot = {
        docs: mockCompras.map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      // Mock Timestamp.fromDate to return a proper Timestamp object
      jest.spyOn(Timestamp, 'fromDate').mockImplementation((date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
        toDate: () => date,
        toMillis: () => date.getTime(),
        isEqual: () => false,
      } as unknown as Timestamp));

      // Mock Date.prototype.toLocaleString to return the correct month
      const toLocaleStringSpy = jest.spyOn(Date.prototype, 'toLocaleString');
      toLocaleStringSpy.mockImplementation(function(this: Date, locale, options) {
        if (locale === 'es' && options?.month === 'long') {
          const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          return monthNames[this.getMonth()];
        }
        return this.toString();
      });

      const result = await compraService.getComisionMensualByRestauranteId(mes, restauranteId);

      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', restauranteId);
      expect(mockWhereResult.get).toHaveBeenCalledTimes(1);
      expect(result).toBe(27); // 5 + 10 + 12 (only June purchases that are paid)

      toLocaleStringSpy.mockRestore();
      jest.restoreAllMocks();
    });

    it('should return 0 if no purchases are found for the restaurant', async () => {
      const restauranteId = 'restaurante-id-2';
      const mes = 'julio';

      const mockSnapshot = {
        docs: [],
        query: {} as admin.firestore.Query,
        size: 0,
        empty: true,
        readTime: {} as admin.firestore.Timestamp,
        metadata: { fromCache: false, hasPendingWrites: false },
        forEach: jest.fn(),
        docChanges: jest.fn(),
      } as unknown as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const result = await compraService.getComisionMensualByRestauranteId(mes, restauranteId);

      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', restauranteId);
      expect(mockWhereResult.get).toHaveBeenCalledTimes(1);
      expect(result).toBe(0);
    });

    it('should return 0 if no paid purchases are found for the given month', async () => {
      const restauranteId = 'restaurante-id-1';
      const mes = 'agosto';

      const mockCompras: Compra[] = [
        { ...mockCompra, id: 'c1', restauranteId, fechaCompra: Timestamp.fromDate(new Date('2023-06-10')), pagado: true, valorComision: 5 },
        { ...mockCompra, id: 'c2', restauranteId, fechaCompra: Timestamp.fromDate(new Date('2023-07-20')), pagado: true, valorComision: 10 },
      ];

      const mockSnapshot = {
        docs: mockCompras.map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const toLocaleStringSpy = jest.spyOn(Date.prototype, 'toLocaleString');
      toLocaleStringSpy.mockImplementation(function(this: Date, locale, options) {
        if (locale === 'es' && options?.month === 'long') {
          const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
          return monthNames[this.getMonth()];
        }
        return this.toString();
      });

      const result = await compraService.getComisionMensualByRestauranteId(mes, restauranteId);

      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', restauranteId);
      expect(mockWhereResult.get).toHaveBeenCalledTimes(1);
      expect(result).toBe(0);

      toLocaleStringSpy.mockRestore();
    });

    it('should throw an error if Firestore get fails', async () => {
      const mockError = new Error('Firestore get failed');
      const mockWhereResult = {
        get: mockCollectionGet.mockRejectedValue(mockError),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      await expect(compraService.getComisionMensualByRestauranteId('septiembre', 'some-restaurante-id')).rejects.toThrow('Error obteniendo la compra');
      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', 'some-restaurante-id');
      expect(mockWhereResult.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCodigoConfirmacion', () => {
    it('should return the confirmation code if the purchase is found and has a code', async () => {
      const mockDocSnapshot = {
        exists: true,
        data: () => ({ ...mockCompra, codigo: '67890' }),
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const result = await compraService.getCodigoConfirmacion('compra-id-1');

      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(result).toBe('67890');
    });

    it('should return null if the purchase is found but has no code', async () => {
      const mockDocSnapshot = {
        exists: true,
        data: () => ({ ...mockCompra, codigo: null }),
        id: 'compra-id-1',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const result = await compraService.getCodigoConfirmacion('compra-id-1');

      expect(mockDoc).toHaveBeenCalledWith('compra-id-1');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should return null if the purchase is not found', async () => {
      const mockDocSnapshot = {
        exists: false,
        data: () => undefined,
        id: 'non-existent-id',
        ref: {} as admin.firestore.DocumentReference,
        readTime: {} as admin.firestore.Timestamp,
        get: jest.fn(),
        isEqual: jest.fn(),
      } as unknown as admin.firestore.DocumentSnapshot<Compra>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const result = await compraService.getCodigoConfirmacion('non-existent-id');

      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it('should throw an error if Firestore get fails', async () => {
      const mockError = new Error('Firestore get failed');
      mockDocGet.mockRejectedValue(mockError);

      await expect(compraService.getCodigoConfirmacion('some-id')).rejects.toThrow('Error obteniendo la compra');
      expect(mockDoc).toHaveBeenCalledWith('some-id');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getComprasByRestauranteId', () => {
    it('should return purchases for a restaurant within the specified date range', async () => {
      const restauranteId = 'restaurante-id-1';
      const fechaCompraTemp = new Date('2023-10-26T05:00:00.000Z');

      const mockCompras = [
        {
          precioApagar: 15,
          metodoElegido: MetodoPago.EFECTIVO,
          fechaCompra: Timestamp.fromDate(new Date('2023-10-26T12:00:00.000Z')),
          clienteId: 'cliente-id-1',
          cantidadComprada: 1,
          pagado: true,
          id: 'compra-1',
          cancelado: false
        },
        {
          precioApagar: 20,
          metodoElegido: MetodoPago.TARJETA_CREDITO,
          fechaCompra: Timestamp.fromDate(new Date('2023-10-26T15:00:00.000Z')),
          clienteId: 'cliente-id-2',
          cantidadComprada: 2,
          pagado: true,
          id: 'compra-2',
          cancelado: false
        }
      ];

      const mockSnapshot = {
        docs: mockCompras.map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as unknown as admin.firestore.QuerySnapshot<Compra>;

      // Mock usuarioService.getById
      (usuarioService.getById as jest.Mock).mockImplementation((id) => {
        if (id === 'cliente-id-1') return { nombre: 'Cliente A' };
        if (id === 'cliente-id-2') return { nombre: 'Cliente B' };
        return null;
      });

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);
      mockSelect.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasByRestauranteId(restauranteId, fechaCompraTemp);

      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', restauranteId);
      expect(mockWhere).toHaveBeenCalledWith('fechaCompra', '>=', expect.any(Object));
      expect(mockWhere).toHaveBeenCalledWith('fechaCompra', '<', expect.any(Object));
      expect(mockSelect).toHaveBeenCalledWith(
        'precioApagar',
        'metodoElegido',
        'fechaCompra',
        'clienteId',
        'cantidadComprada',
        'pagado',
        'id',
        'cancelado'
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        precioApagar: 15,
        metodoElegido: MetodoPago.EFECTIVO,
        clienteId: 'cliente-id-1',
        nombreCliente: 'Cliente A'
      });
      expect(result[1]).toMatchObject({
        precioApagar: 20,
        metodoElegido: MetodoPago.TARJETA_CREDITO,
        clienteId: 'cliente-id-2',
        nombreCliente: 'Cliente B'
      });
    });

    it('should return an empty array if no purchases are found for the restaurant on the date', async () => {
      const restauranteId = 'restaurante-id-2';
      const fechaCompraTemp = new Date('2023-10-26T05:00:00.000Z');

      const mockSnapshot = {
        docs: [],
      } as unknown as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);
      mockSelect.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasByRestauranteId(restauranteId, fechaCompraTemp);

      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', restauranteId);
      expect(mockWhere).toHaveBeenCalledWith('fechaCompra', '>=', expect.any(Object));
      expect(mockWhere).toHaveBeenCalledWith('fechaCompra', '<', expect.any(Object));
      expect(mockSelect).toHaveBeenCalledWith(
        'precioApagar',
        'metodoElegido',
        'fechaCompra',
        'clienteId',
        'cantidadComprada',
        'pagado',
        'id',
        'cancelado'
      );
      expect(result).toEqual([]);
    });

    it('should handle client not found by returning "Cliente no encontrado"', async () => {
      const restauranteId = 'restaurante-id-1';
      const fechaCompraTemp = new Date('2023-10-26T05:00:00.000Z');

      const mockCompras = [
        {
          precioApagar: 15,
          metodoElegido: MetodoPago.EFECTIVO,
          fechaCompra: Timestamp.fromDate(new Date('2023-10-26T12:00:00.000Z')),
          clienteId: 'cliente-id-1',
          cantidadComprada: 1,
          pagado: true,
          id: 'compra-1',
          cancelado: false
        },
        {
          precioApagar: 20,
          metodoElegido: MetodoPago.TARJETA_CREDITO,
          fechaCompra: Timestamp.fromDate(new Date('2023-10-26T15:00:00.000Z')),
          clienteId: 'non-existent-client',
          cantidadComprada: 2,
          pagado: true,
          id: 'compra-2',
          cancelado: false
        }
      ];

      const mockSnapshot = {
        docs: mockCompras.map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as unknown as admin.firestore.QuerySnapshot<Compra>;

      // Mock usuarioService.getById
      (usuarioService.getById as jest.Mock).mockImplementation((id) => {
        if (id === 'cliente-id-1') return { nombre: 'Cliente A' };
        return null;
      });

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);
      mockSelect.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasByRestauranteId(restauranteId, fechaCompraTemp);

      expect(mockWhere).toHaveBeenCalledWith('restauranteId', '==', restauranteId);
      expect(mockWhere).toHaveBeenCalledWith('fechaCompra', '>=', expect.any(Object));
      expect(mockWhere).toHaveBeenCalledWith('fechaCompra', '<', expect.any(Object));
      expect(mockSelect).toHaveBeenCalledWith(
        'precioApagar',
        'metodoElegido',
        'fechaCompra',
        'clienteId',
        'cantidadComprada',
        'pagado',
        'id',
        'cancelado'
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        precioApagar: 15,
        metodoElegido: MetodoPago.EFECTIVO,
        clienteId: 'cliente-id-1',
        nombreCliente: 'Cliente A'
      });
      expect(result[1]).toMatchObject({
        precioApagar: 20,
        metodoElegido: MetodoPago.TARJETA_CREDITO,
        clienteId: 'non-existent-client',
        nombreCliente: 'Cliente no encontrado'
      });
    });

    it('should throw an error if Firestore get fails', async () => {
      const mockError = new Error('Firestore get failed');
      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        get: mockCollectionGet.mockRejectedValue(mockError),
      };
      mockWhere.mockReturnValue(mockWhereResult);
      mockSelect.mockReturnValue(mockWhereResult);

      await expect(compraService.getComprasByRestauranteId('some-restaurante-id', new Date())).rejects.toThrow('Error al obtener las compras del restaurante');
      expect(mockWhere).toHaveBeenCalled(); // Check that where was called at least once
      expect(mockSelect).toHaveBeenCalled(); // Check that select was called
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getComprasActivasByClienteId', () => {
    it('should return active purchases for a client within the date range', async () => {
      const clienteId = 'cliente-id-1';
      const fecha = new Date('2023-06-10T00:00:00.000Z');
      const fechaFin = new Date('2023-06-11T00:00:00.000Z');

      // Create dates in the correct timezone
      const date1 = new Date('2023-06-10T10:00:00.000Z');
      const date2 = new Date('2023-06-10T11:00:00.000Z');
      const date3 = new Date('2023-06-10T12:00:00.000Z');
      const date4 = new Date('2023-06-10T13:00:00.000Z');
      const date5 = new Date('2023-06-11T00:00:00.000Z');

      const mockCompras: Compra[] = [
        { ...mockCompra, id: 'c1', clienteId, fechaCompra: Timestamp.fromDate(date1), confirmacionCodigo: false, pagado: false, cancelado: false, retirado: false },
        { ...mockCompra, id: 'c2', clienteId, fechaCompra: Timestamp.fromDate(date2), confirmacionCodigo: false, pagado: false, cancelado: false, retirado: false },
        { ...mockCompra, id: 'c3', clienteId, fechaCompra: Timestamp.fromDate(date3), confirmacionCodigo: false, pagado: false, cancelado: false, retirado: false },
        { ...mockCompra, id: 'c4', clienteId, fechaCompra: Timestamp.fromDate(date4), confirmacionCodigo: false, pagado: false, cancelado: false, retirado: false },
        { ...mockCompra, id: 'c5', clienteId, fechaCompra: Timestamp.fromDate(date5), confirmacionCodigo: false, pagado: false, cancelado: false, retirado: false },
      ];

      // Filter purchases within the date range
      const filteredCompras = mockCompras.filter(compra => {
        const compraDate = compra.fechaCompra?.toDate();
        return compraDate && compraDate >= fecha && compraDate < fechaFin;
      });

      const mockSnapshot = {
        docs: filteredCompras.map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        orderBy: mockOrderBy.mockReturnThis(),
        limit: mockLimit.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      // Mock getEcuadorDayRangeFromDate helper
      jest.spyOn(helpers, 'getEcuadorDayRangeFromDate').mockReturnValue({
        start: Timestamp.fromDate(fecha),
        end: Timestamp.fromDate(fechaFin),
      });

      // Mock Timestamp.fromDate
      jest.spyOn(Timestamp, 'fromDate').mockImplementation((date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
        toDate: () => date,
        toMillis: () => date.getTime(),
        isEqual: () => false,
      } as unknown as Timestamp));

      // Mock environment variable
      process.env.DEV_DAY_COMPRASACTIVAS = '0';

      const result = await compraService.getComprasActivasByClienteId(clienteId);

      expect(mockWhere).toHaveBeenCalledWith('clienteId', '==', clienteId);
      expect(mockWhere).toHaveBeenCalledWith('confirmacionCodigo', '==', false);
      expect(mockWhere).toHaveBeenCalledWith('pagado', '==', false);
      expect(mockWhere).toHaveBeenCalledWith('cancelado', '==', false);
      expect(mockWhere).toHaveBeenCalledWith('retirado', '==', false);
      expect(mockSelect).toHaveBeenCalledWith('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'id');
      expect(mockOrderBy).toHaveBeenCalledWith('fechaCompra');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result.compras).toHaveLength(4);
      expect(result.nextCursor).toBe('c4');

      // Clean up
      delete process.env.DEV_DAY_COMPRASACTIVAS;
      jest.restoreAllMocks();
    });

    it('should return empty array if no active purchases are found', async () => {
      const clienteId = 'cliente-id-2';
      const mockSnapshot = {
        docs: [],
        query: {} as admin.firestore.Query,
        size: 0,
        empty: true,
        readTime: {} as admin.firestore.Timestamp,
        metadata: { fromCache: false, hasPendingWrites: false },
        forEach: jest.fn(),
        docChanges: jest.fn(),
      } as unknown as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        orderBy: mockOrderBy.mockReturnThis(),
        limit: mockLimit.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasActivasByClienteId(clienteId);

      expect(result.compras).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });

    it('should handle cursor pagination correctly', async () => {
      const clienteId = 'cliente-id-1';
      const cursor = 'c3';
      const mockSnapshot = {
        docs: [
          { ...mockCompra, id: 'c4' },
          { ...mockCompra, id: 'c5' },
        ].map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        orderBy: mockOrderBy.mockReturnThis(),
        limit: mockLimit.mockReturnThis(),
        startAfter: mockStartAfter.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasActivasByClienteId(clienteId, cursor);

      expect(mockStartAfter).toHaveBeenCalledWith(cursor);
      expect(result.compras).toHaveLength(2);
      expect(result.nextCursor).toBe('c5');
    });
  });

  describe('getComprasCompletadasByClienteId', () => {
    it('should return completed purchases for a client', async () => {
      const clienteId = 'cliente-id-1';
      const mockCompras: Compra[] = [
        { ...mockCompra, id: 'c1', clienteId, confirmacionCodigo: true, pagado: true, retirado: true },
        { ...mockCompra, id: 'c2', clienteId, confirmacionCodigo: true, pagado: true, retirado: true },
        { ...mockCompra, id: 'c3', clienteId, confirmacionCodigo: false, pagado: true, retirado: true }, // Not confirmed
        { ...mockCompra, id: 'c4', clienteId, confirmacionCodigo: true, pagado: false, retirado: true }, // Not paid
      ];

      const mockSnapshot = {
        docs: mockCompras.filter(c => c.confirmacionCodigo && c.pagado && c.retirado).map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        orderBy: mockOrderBy.mockReturnThis(),
        limit: mockLimit.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasCompletadasByClienteId(clienteId);

      expect(mockWhere).toHaveBeenCalledWith('clienteId', '==', clienteId);
      expect(mockWhere).toHaveBeenCalledWith('confirmacionCodigo', '==', true);
      expect(mockWhere).toHaveBeenCalledWith('pagado', '==', true);
      expect(mockWhere).toHaveBeenCalledWith('retirado', '==', true);
      expect(mockSelect).toHaveBeenCalledWith('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'cancelado');
      expect(mockOrderBy).toHaveBeenCalledWith('fechaCompra', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result.compras).toHaveLength(2);
      expect(result.nextCursor).toBe('c2');
    });
  });

  describe('getComprasCanceladasByClienteId', () => {
    it('should return cancelled purchases for a client', async () => {
      const clienteId = 'cliente-id-1';
      const mockCompras: Compra[] = [
        { ...mockCompra, id: 'c1', clienteId, cancelado: true },
        { ...mockCompra, id: 'c2', clienteId, cancelado: true },
        { ...mockCompra, id: 'c3', clienteId, cancelado: false }, // Not cancelled
      ];

      const mockSnapshot = {
        docs: mockCompras.filter(c => c.cancelado).map(compra => ({
          data: () => compra,
          id: compra.id,
        })),
      } as admin.firestore.QuerySnapshot<Compra>;

      const mockWhereResult = {
        where: mockWhere.mockReturnThis(),
        select: mockSelect.mockReturnThis(),
        orderBy: mockOrderBy.mockReturnThis(),
        limit: mockLimit.mockReturnThis(),
        get: mockCollectionGet.mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const result = await compraService.getComprasCanceladasByClienteId(clienteId);

      expect(mockWhere).toHaveBeenCalledWith('clienteId', '==', clienteId);
      expect(mockWhere).toHaveBeenCalledWith('cancelado', '==', true);
      expect(mockSelect).toHaveBeenCalledWith('codigo', 'fechaCompra', 'precioApagar', 'paqueteId', 'metodoElegido', 'cancelado');
      expect(mockOrderBy).toHaveBeenCalledWith('fechaCompra', 'desc');
      expect(mockLimit).toHaveBeenCalledWith(3);
      expect(result.compras).toHaveLength(2);
      expect(result.nextCursor).toBe('c2');
    });
  });
});