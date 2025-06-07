import { Timestamp } from 'firebase-admin/firestore';
import { db } from '../../../../src/config/firebase';
import { Rol } from '../../../../src/models/interfaces';
import { PaqueteService } from '../../../../src/services/paqueteService';
import { hashCedula } from '../../../../src/utils/HELPER';

// Mock Timestamp
jest.mock('firebase-admin/firestore', () => ({
  Timestamp: {
    fromDate: jest.fn((date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: 0,
      toDate: () => date,
    })),
  },
}));

jest.mock('../../../../src/config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
        update: jest.fn(),
      }),
      withConverter: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn(),
          update: jest.fn(),
        }),
        add: jest.fn().mockReturnValue({
          id: 'new_paquete_id'
        }),
        where: jest.fn().mockReturnThis(),
        get: jest.fn(),
      }),
    }),
  },
}));

jest.mock('../../../../src/utils/converterFactory', () => ({
  converterFactory: jest.fn(() => ({
    toFirestore: (data: any) => data,
    fromFirestore: (snapshot: any, options: any) => snapshot.data(),
  })),
}));

jest.mock('../../../../src/utils/HELPER', () => ({
  hashCedula: jest.fn((cedula: string) => `hashed_${cedula}`),
  getEcuadorDayRangeFromDate: jest.fn(() => ({
    start: { seconds: 1698278400, nanoseconds: 0 }, // 2023-10-26T00:00:00.000Z
    end: { seconds: 1698364799, nanoseconds: 0 },   // 2023-10-26T23:59:59.999Z
  })),
}));

describe('PaqueteService', () => {
  let paqueteService: PaqueteService;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockAdd: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockWhere: jest.Mock;
  let mockWithConverter: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGet = jest.fn();
    mockAdd = jest.fn().mockReturnValue({ id: 'new_paquete_id' });
    mockUpdate = jest.fn();
    mockWhere = jest.fn().mockReturnThis();
    mockDoc = jest.fn().mockReturnValue({
      get: mockGet,
      update: mockUpdate,
    });

    mockWithConverter = jest.fn().mockReturnValue({
      doc: mockDoc,
      add: mockAdd,
      where: mockWhere,
      get: mockGet,
    });

    mockCollection = db.collection as jest.Mock;
    mockCollection.mockReturnValue({
      doc: mockDoc,
      withConverter: mockWithConverter,
    });

    paqueteService = new PaqueteService();
  });

  describe('obtenerPaquetePorId', () => {
    it('should return the package if found', async () => {
      const mockPaquete = {
        id: 'paquete1',
        descripcion: 'Delicioso',
        precio: 10,
        precioDescuento: 5,
        unidades: 10,
        horaRetiro: Timestamp.fromDate(new Date()),
        agotado: false,
        restauranteId: 'hashed_123',
        nombreRestaurante: 'Restaurante A',
        ciudad: 'Quito',
        fechaPublicacion: Timestamp.fromDate(new Date()),
        metodoPago: [],
        alergenos: [],
        direccion: 'Calle Falsa 123'
      };

      const mockSnapshot = {
        exists: true,
        id: 'paquete1',
        data: () => mockPaquete,
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const result = await paqueteService.obtenerPaquetePorId('paquete1');

      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual(mockPaquete);
    });

    it('should return null if the package is not found', async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await paqueteService.obtenerPaquetePorId('nonexistent_paquete');

      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('nonexistent_paquete');
      expect(mockGet).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should throw an error if fetching the package fails', async () => {
      const error = new Error('Firestore error');
      mockGet.mockRejectedValue(error);

      await expect(paqueteService.obtenerPaquetePorId('paquete1')).rejects.toThrow('Firestore error');
      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('publicarPaquete', () => {
    const mockUserData = {
      rol: Rol.RESTAURANTE,
      nombre: 'Restaurante Test',
      ciudad: 'Quito',
      direccion: 'Av. Principal',
      metodoPago: ['efectivo'],
      alergenos: ['gluten'],
    };
    const mockPaqueteData = {
      descripcion: 'Paquete de prueba',
      precio: 20,
      precioDescuento: 15,
      unidades: 5,
      horaRetiro: '23:00',
      imagenURL: 'http://example.com/image.png',
      metodoPago: ['tarjeta'],
    };

    beforeEach(() => {
      const mockUserSnapshot = {
        exists: true,
        data: () => mockUserData,
      };
      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserSnapshot),
      });

      // Mock Timestamp.fromDate to return different values for different calls
      let callCount = 0;
      (Timestamp.fromDate as jest.Mock).mockImplementation((date) => {
        callCount++;
        // First call is for fechaPublicacion, second is for horaRetiro
        if (callCount === 1) {
          return {
            seconds: 1698314400, // 2023-10-26T10:00:00.000Z
            nanoseconds: 0,
            toDate: () => new Date('2023-10-26T10:00:00.000Z'),
          };
        } else {
          return {
            seconds: 1698314400 + 3600, // 2023-10-26T11:00:00.000Z (1 hour later)
            nanoseconds: 0,
            toDate: () => new Date('2023-10-26T11:00:00.000Z'),
          };
        }
      });

      // Mock the collection to return different objects based on collection name
      mockCollection.mockImplementation((collectionName) => {
        if (collectionName === 'usuarios') {
          return {
            doc: mockDoc,
          };
        }
        return {
          withConverter: mockWithConverter,
        };
      });
    });

    it('should publish a package successfully for a restaurant', async () => {
      const result = await paqueteService.publicarPaquete('1234567890', mockPaqueteData);

      expect(hashCedula).toHaveBeenCalledWith('1234567890');
      expect(db.collection).toHaveBeenCalledWith('usuarios');
      expect(mockDoc).toHaveBeenCalledWith('hashed_1234567890');
      expect(mockAdd).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 'new_paquete_id');
      expect(result).toHaveProperty('restauranteId', 'hashed_1234567890');
      expect(result).toHaveProperty('nombreRestaurante', 'Restaurante Test');
      expect(result).toHaveProperty('descripcion', 'Paquete de prueba');
      expect(result).toHaveProperty('precio', 20);
      expect(result).toHaveProperty('precioDescuento', 15);
      expect(result).toHaveProperty('unidades', 5);
      expect(result).toHaveProperty('agotado', false);
      expect(result).toHaveProperty('ciudad', 'Quito');
      expect(result).toHaveProperty('metodoPago', ['efectivo']);
      expect(result).toHaveProperty('alergenos', ['gluten']);
      expect(result).toHaveProperty('direccion', 'Av. Principal');
      expect(result).toHaveProperty('fechaPublicacion');
      expect(result).toHaveProperty('horaRetiro');
    });

    it('should throw 404 if the restaurant is not found', async () => {
      const mockUserSnapshot = {
        exists: false,
      };
      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserSnapshot),
      });

      await expect(paqueteService.publicarPaquete('nonexistent_cedula', mockPaqueteData)).rejects.toEqual({
        statusCode: 404,
        message: 'Restaurante no encontrado',
      });
    });

    it('should throw 404 if restaurant data is not found', async () => {
      const mockUserSnapshot = {
        exists: true,
        data: () => null,
      };
      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserSnapshot),
      });

      await expect(paqueteService.publicarPaquete('1234567890', mockPaqueteData)).rejects.toEqual({
        statusCode: 404,
        message: 'Datos del restaurante no encontrados',
      });
    });

    it('should throw 403 if the user is not a restaurant', async () => {
      const mockUserSnapshot = {
        exists: true,
        data: () => ({ rol: Rol.CLIENTE }),
      };
      mockDoc.mockReturnValue({
        get: jest.fn().mockResolvedValue(mockUserSnapshot),
      });

      await expect(paqueteService.publicarPaquete('1234567890', mockPaqueteData)).rejects.toEqual({
        statusCode: 403,
        message: 'Solo los restaurantes pueden publicar paquetes',
      });
    });

    it('should throw 400 if horaRetiro format is invalid', async () => {
      const invalidPaqueteData = { ...mockPaqueteData, horaRetiro: '25:00' }; // Invalid hour

      await expect(paqueteService.publicarPaquete('1234567890', invalidPaqueteData)).rejects.toEqual({
        statusCode: 400,
        message: 'Formato de hora inválido. Debe ser HH:mm (ej: 23:00)',
      });

      const invalidPaqueteData2 = { ...mockPaqueteData, horaRetiro: '12:65' }; // Invalid minute
      await expect(paqueteService.publicarPaquete('1234567890', invalidPaqueteData2)).rejects.toEqual({
        statusCode: 400,
        message: 'Formato de hora inválido. Debe ser HH:mm (ej: 23:00)',
      });
    });

    it('should throw 400 if horaRetiro is not posterior to fechaPublicacion', async () => {
      const earlyHoraRetiroData = { ...mockPaqueteData, horaRetiro: '08:00' };

      // Mocking Date to control the 'now' time for this specific test
      const mockDate = new Date('2023-10-26T10:00:00.000Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      // Mock Timestamp.fromDate to return specific values
      const mockTimestamp = {
        seconds: 1698314400, // 2023-10-26T10:00:00.000Z
        nanoseconds: 0,
        toDate: () => mockDate,
      };
      (Timestamp.fromDate as jest.Mock).mockReturnValue(mockTimestamp);

      await expect(paqueteService.publicarPaquete('1234567890', earlyHoraRetiroData)).rejects.toEqual({
        statusCode: 400,
        message: 'La hora de retiro debe ser posterior a la hora de publicación',
      });

      // Restore Date mock
      jest.spyOn(global, 'Date').mockRestore();
    });

    it('should handle error during package publication', async () => {
      const error = new Error('Firestore add error');
      mockAdd.mockRejectedValue(error);

      // Reset the mock implementation for this specific test
      mockCollection.mockImplementation((collectionName) => {
        if (collectionName === 'usuarios') {
          return {
            doc: mockDoc,
          };
        }
        return {
          withConverter: jest.fn().mockReturnValue({
            doc: mockDoc,
            add: jest.fn().mockRejectedValue(error),
            where: mockWhere,
            get: mockGet,
          }),
        };
      });

      await expect(paqueteService.publicarPaquete('1234567890', mockPaqueteData)).rejects.toThrow('Firestore add error');
    });

    it('should use default values for optional fields if not provided', async () => {
      const mockPaqueteDataWithoutOptional = {
        descripcion: 'Paquete de prueba',
        precio: 20,
        precioDescuento: 15,
        unidades: 5,
        horaRetiro: '23:00',
      };

      const result = await paqueteService.publicarPaquete('1234567890', mockPaqueteDataWithoutOptional);

      expect(mockAdd).toHaveBeenCalled();
      expect(result).toHaveProperty('imagenURL', null);
      expect(result).toHaveProperty('metodoPago', ['efectivo']); // Should inherit from user data
      expect(result).toHaveProperty('alergenos', ['gluten']); // Should inherit from user data
      expect(result).toHaveProperty('direccion', 'Av. Principal'); // Should inherit from user data
    });
  });

  describe('getPaqueteByCiudad', () => {
    it('should return packages for a given city, with agotado packages first', async () => {
      const mockPaquetes = [
        {
          id: 'paquete1',
          ciudad: 'Quito',
          agotado: true,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Agotado 1'
        },
        {
          id: 'paquete2',
          ciudad: 'Quito',
          agotado: false,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Disponible 1'
        },
        {
          id: 'paquete3',
          ciudad: 'Quito',
          agotado: true,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Agotado 2'
        },
        {
          id: 'paquete4',
          ciudad: 'Quito',
          agotado: false,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Disponible 2'
        },
        {
          id: 'paquete5',
          ciudad: 'Guayaquil',
          agotado: false,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Guayaquil'
        },
      ];

      const mockSnapshot = {
        forEach: (callback: (doc: any) => void) => {
          mockPaquetes.filter(p => p.ciudad === 'Quito').forEach(paquete => {
            callback({
              id: paquete.id,
              data: () => paquete,
            });
          });
        },
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const result = await paqueteService.getPaqueteByCiudad('Quito');

      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('ciudad', '==', 'Quito');
      expect(mockWhere).toHaveBeenCalledWith('fechaPublicacion', '>=', expect.any(Object));
      expect(mockWhere).toHaveBeenCalledWith('fechaPublicacion', '<=', expect.any(Object));
      expect(mockGet).toHaveBeenCalled();
      expect(result.length).toBe(4); // Expecting only packages from Quito
      expect(result[0]).toHaveProperty('id', 'paquete1'); // Agotado
      expect(result[1]).toHaveProperty('id', 'paquete3'); // Agotado
      expect(result[2]).toHaveProperty('id', 'paquete2'); // Disponible
      expect(result[3]).toHaveProperty('id', 'paquete4'); // Disponible
    });

    it('should return an empty array if no packages are found for the city', async () => {
      const mockSnapshot = {
        forEach: (callback: (doc: any) => void) => { },
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const result = await paqueteService.getPaqueteByCiudad('Cuenca');

      expect(mockWhere).toHaveBeenCalledWith('ciudad', '==', 'Cuenca');
      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle error during fetching packages by city', async () => {
      const error = new Error('Firestore query error');
      mockGet.mockRejectedValue(error);

      await expect(paqueteService.getPaqueteByCiudad('Quito')).rejects.toThrow('Firestore query error');
      expect(mockWhere).toHaveBeenCalledWith('ciudad', '==', 'Quito');
      expect(mockGet).toHaveBeenCalled();
    });
  });

  describe('restarUnidadesPaquete', () => {
    const mockPaquete = {
      id: 'paquete1',
      unidades: 10,
    };

    beforeEach(() => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue(mockPaquete);
    });

    it('should subtract units from a package successfully', async () => {
      await paqueteService.restarUnidadesPaquete('paquete1', 3);

      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).toHaveBeenCalledWith({ unidades: 7, agotado: false });
    });

    it('should set agotado to true if units become 0', async () => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue({ id: 'paquete1', unidades: 5 });
      await paqueteService.restarUnidadesPaquete('paquete1', 5);

      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).toHaveBeenCalledWith({ unidades: 0, agotado: true });
    });

    it('should throw 400 if there are insufficient units', async () => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue({ id: 'paquete1', unidades: 5 });

      await expect(paqueteService.restarUnidadesPaquete('paquete1', 10)).rejects.toEqual({
        statusCode: 400,
        message: 'No hay suficientes unidades disponibles. Actual: 5, Solicitado: 10',
      });
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle error during updating package units', async () => {
      const error = new Error('Firestore update error');
      mockUpdate.mockRejectedValue(error);

      await expect(paqueteService.restarUnidadesPaquete('paquete1', 1)).rejects.toThrow('Firestore update error');
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).toHaveBeenCalledWith({ unidades: 9, agotado: false });
    });
  });

  describe('aumentarUnidadesPaquete', () => {
    const mockPaquete = {
      id: 'paquete1',
      unidades: 10,
    };

    beforeEach(() => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue(mockPaquete);
    });

    it('should add units to a package successfully', async () => {
      await paqueteService.aumentarUnidadesPaquete('paquete1', 5);

      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).toHaveBeenCalledWith({ unidades: 15 });
    });

    it('should throw 404 if the package is not found', async () => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue(null);

      await expect(paqueteService.aumentarUnidadesPaquete('nonexistent_paquete', 1)).rejects.toEqual({
        statusCode: 404,
        message: 'Paquete no encontrado',
      });
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('nonexistent_paquete');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should throw 500 if package units data is missing or invalid', async () => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue({ id: 'paquete1', unidades: undefined });

      await expect(paqueteService.aumentarUnidadesPaquete('paquete1', 1)).rejects.toEqual({
        statusCode: 500,
        message: "Datos del paquete inválidos o campo 'unidades' no encontrado",
      });
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).not.toHaveBeenCalled();
    });

    it('should handle error during updating package units', async () => {
      const error = new Error('Firestore update error');
      mockUpdate.mockRejectedValue(error);

      await expect(paqueteService.aumentarUnidadesPaquete('paquete1', 1)).rejects.toThrow('Firestore update error');
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockDoc).toHaveBeenCalledWith('paquete1');
      expect(mockUpdate).toHaveBeenCalledWith({ unidades: 11 });
    });
  });

  describe('calcularComision', () => {
    it('should calculate the commission correctly', async () => {
      const mockPaquete = {
        id: 'paquete1',
        precioDescuento: 15,
      };
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue(mockPaquete);

      const result = await paqueteService.calcularComision('paquete1', 2); // 2 units bought

      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(result).toBe(2 * 15 * 0.1); // 10% of total discounted price
    });

    it('should calculate commission as 0 if precioDescuento is 0', async () => {
      const mockPaquete = {
        id: 'paquete1',
        precioDescuento: 0,
      };
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue(mockPaquete);

      const result = await paqueteService.calcularComision('paquete1', 2);

      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
      expect(result).toBe(0);
    });

    it('should throw 404 if the package is not found', async () => {
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockResolvedValue(null);

      await expect(paqueteService.calcularComision('nonexistent_paquete', 1)).rejects.toEqual({
        statusCode: 404,
        message: 'Paquete no encontrado',
      });
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('nonexistent_paquete');
    });

    it('should handle error during getting package for commission calculation', async () => {
      const error = new Error('Firestore error');
      jest.spyOn(paqueteService, 'obtenerPaquetePorId' as any).mockRejectedValue(error);

      await expect(paqueteService.calcularComision('paquete1', 1)).rejects.toThrow('Firestore error');
      expect(paqueteService.obtenerPaquetePorId).toHaveBeenCalledWith('paquete1');
    });
  });

  describe('getPaquetesByURL', () => {
    it('should return packages matching the image URL and city, with agotado packages first', async () => {
      const mockPaquetes = [
        {
          id: 'paquete1',
          ciudad: 'Quito',
          imagenURL: 'http://example.com/image.png',
          agotado: true,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Agotado URL 1'
        },
        {
          id: 'paquete2',
          ciudad: 'Quito',
          imagenURL: 'http://example.com/image.png',
          agotado: false,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Disponible URL 1'
        },
        {
          id: 'paquete3',
          ciudad: 'Quito',
          imagenURL: 'http://example.com/image.png',
          agotado: true,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Agotado URL 2'
        },
        {
          id: 'paquete4',
          ciudad: 'Quito',
          imagenURL: 'http://example.com/image.png',
          agotado: false,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Disponible URL 2'
        },
        {
          id: 'paquete5',
          ciudad: 'Guayaquil',
          imagenURL: 'http://example.com/image.png',
          agotado: false,
          fechaPublicacion: Timestamp.fromDate(new Date()),
          descripcion: 'Guayaquil URL'
        },
      ];

      const mockSnapshot = {
        forEach: (callback: (doc: any) => void) => {
          mockPaquetes.filter(p => p.ciudad === 'Quito' && p.imagenURL === 'http://example.com/image.png').forEach(paquete => {
            callback({
              id: paquete.id,
              data: () => paquete,
            });
          });
        },
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const result = await paqueteService.getPaquetesByURL('http://example.com/image.png', 'Quito');

      expect(mockWithConverter).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalledWith('imagenURL', '==', 'http://example.com/image.png');
      expect(mockWhere).toHaveBeenCalledWith('ciudad', '==', 'Quito');
      expect(mockWhere).toHaveBeenCalledWith('fechaPublicacion', '>=', expect.any(Object));
      expect(mockWhere).toHaveBeenCalledWith('fechaPublicacion', '<=', expect.any(Object));
      expect(mockGet).toHaveBeenCalled();
      expect(result.length).toBe(4); // Expecting only packages from Quito with the matching URL
      expect(result[0]).toHaveProperty('id', 'paquete1'); // Agotado
      expect(result[1]).toHaveProperty('id', 'paquete3'); // Agotado
      expect(result[2]).toHaveProperty('id', 'paquete2'); // Disponible
      expect(result[3]).toHaveProperty('id', 'paquete4'); // Disponible
    });

    it('should return an empty array if no packages match the URL and city', async () => {
      const mockSnapshot = {
        forEach: (callback: (doc: any) => void) => { },
      };
      mockGet.mockResolvedValue(mockSnapshot);

      const result = await paqueteService.getPaquetesByURL('http://example.com/other_image.png', 'Quito');

      expect(mockWhere).toHaveBeenCalledWith('imagenURL', '==', 'http://example.com/other_image.png');
      expect(mockWhere).toHaveBeenCalledWith('ciudad', '==', 'Quito');
      expect(mockGet).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle error during fetching packages by URL', async () => {
      const error = new Error('Firestore query error');
      mockGet.mockRejectedValue(error);

      await expect(paqueteService.getPaquetesByURL('http://example.com/image.png', 'Quito')).rejects.toThrow('Firestore query error');
      expect(mockWhere).toHaveBeenCalledWith('imagenURL', '==', 'http://example.com/image.png');
      expect(mockWhere).toHaveBeenCalledWith('ciudad', '==', 'Quito');
      expect(mockGet).toHaveBeenCalled();
    });
  });
});