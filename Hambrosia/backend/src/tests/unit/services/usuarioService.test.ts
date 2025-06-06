import * as admin from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { Alergeno, MetodoPago, Rol, Usuario } from '../../../models/interfaces';
import { UsuarioService } from '../../../services/usuarioService';
import { usuarioClienteFixture, usuarioRestauranteFixture } from '../../__fixtures__/usuario.fixture';
import {
    mockCollectionGet,
    mockDoc,
    mockDocGet,
    mockDocSet,
    mockDocUpdate,
    mockEncryptExpoPushToken,
    mockHashCedula,
    mockLimit,
    mockUpdateUser,
    mockWhere,
} from '../../setup';

describe('UsuarioService', () => {
  let usuarioService: UsuarioService;

  beforeEach(() => {
    jest.clearAllMocks();
    usuarioService = new UsuarioService();
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      const mockUsers = [usuarioClienteFixture, usuarioRestauranteFixture];
      const mockSnapshot = {
        docs: mockUsers.map(user => ({
          data: () => user,
          id: user.id,
        })),
      };
      mockCollectionGet.mockResolvedValue(mockSnapshot);

      const users = await usuarioService.getAll();
      expect(users).toEqual(mockUsers);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getById', () => {
    it('should return user if found by ID', async () => {
      const mockUser = { id: '1', nombre: 'User 1' } as Usuario;
      const mockDocSnapshot = {
        exists: true,
        data: () => mockUser,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const user = await usuarioService.getById('1');
      expect(user).toEqual(mockUser);
      expect(mockDoc).toHaveBeenCalledWith('1');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found by ID', async () => {
      const mockDocSnapshot = {
        exists: false,
        data: () => undefined,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      const user = await usuarioService.getById('non-existent-id');
      expect(user).toBeNull();
      expect(mockDoc).toHaveBeenCalledWith('non-existent-id');
      expect(mockDocGet).toHaveBeenCalledTimes(1);
    });
  });

  describe('getByEmail', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockCollectionGet.mockReset();
    });

    it('should return user if found by email', async () => {
      const mockSnapshot = {
        empty: false,
        docs: [{
          data: () => ({ ...usuarioClienteFixture }),
          id: usuarioClienteFixture.id,
        }],
      };
      mockCollectionGet.mockResolvedValueOnce(mockSnapshot);

      const user = await usuarioService.getByEmail(usuarioClienteFixture.correo);
      expect(user).toEqual(usuarioClienteFixture);
      expect(mockWhere).toHaveBeenCalledWith('correo', '==', usuarioClienteFixture.correo);
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found by email', async () => {
      const mockSnapshot = {
        empty: true,
        docs: [],
      };
      mockCollectionGet.mockResolvedValueOnce(mockSnapshot);

      const user = await usuarioService.getByEmail('non-existent@example.com');
      expect(user).toBeNull();
      expect(mockWhere).toHaveBeenCalledWith('correo', '==', 'non-existent@example.com');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error on getByEmail failure', async () => {
      const mockError = new Error('Firestore error');
      mockCollectionGet.mockRejectedValueOnce(mockError);

      await expect(usuarioService.getByEmail('test@example.com')).rejects.toThrow('Firestore error');
    });
  });

  describe('getByCedulaRUC', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockCollectionGet.mockReset();
    });

    it('should return user if found by cedulaRUC', async () => {
      const mockSnapshot = {
        empty: false,
        docs: [{
          data: () => ({ ...usuarioClienteFixture }),
          id: usuarioClienteFixture.id,
        }],
      };
      mockCollectionGet.mockResolvedValueOnce(mockSnapshot);

      const user = await usuarioService.getByCedulaRUC(usuarioClienteFixture.cedulaRUC);
      expect(user).toEqual(usuarioClienteFixture);
      expect(mockWhere).toHaveBeenCalledWith('cedulaRUC', '==', usuarioClienteFixture.cedulaRUC);
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found by cedulaRUC', async () => {
      const mockSnapshot = {
        empty: true,
        docs: [],
      };
      mockCollectionGet.mockResolvedValueOnce(mockSnapshot);

      const user = await usuarioService.getByCedulaRUC('non-existent-cedula');
      expect(user).toBeNull();
      expect(mockWhere).toHaveBeenCalledWith('cedulaRUC', '==', 'non-existent-cedula');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error on getByCedulaRUC failure', async () => {
      const mockError = new Error('Firestore error');
      mockCollectionGet.mockRejectedValueOnce(mockError);

      await expect(usuarioService.getByCedulaRUC('1234567890')).rejects.toThrow('Firestore error');
    });
  });

  describe('getByFirebaseUid', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockCollectionGet.mockReset();
    });

    it('should return user if found by firebaseUid', async () => {
      const mockSnapshot = {
        empty: false,
        docs: [{
          data: () => ({ ...usuarioClienteFixture }),
          id: usuarioClienteFixture.id,
        }],
      };
      mockCollectionGet.mockResolvedValueOnce(mockSnapshot);

      const user = await usuarioService.getByFirebaseUid(usuarioClienteFixture.firebaseUid);
      expect(user).toEqual(usuarioClienteFixture);
      expect(mockWhere).toHaveBeenCalledWith('firebaseUid', '==', usuarioClienteFixture.firebaseUid);
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found by firebaseUid', async () => {
      const mockSnapshot = {
        empty: true,
        docs: [],
      };
      mockCollectionGet.mockResolvedValueOnce(mockSnapshot);

      const user = await usuarioService.getByFirebaseUid('non-existent-firebase-uid');
      expect(user).toBeNull();
      expect(mockWhere).toHaveBeenCalledWith('firebaseUid', '==', 'non-existent-firebase-uid');
      expect(mockLimit).toHaveBeenCalledWith(1);
      expect(mockCollectionGet).toHaveBeenCalledTimes(1);
    });

    it('should throw error on getByFirebaseUid failure', async () => {
      const mockError = new Error('Firestore error');
      mockCollectionGet.mockRejectedValueOnce(mockError);

      await expect(usuarioService.getByFirebaseUid('firebase-uid-1')).rejects.toThrow('Firestore error');
    });
  });

  describe('register', () => {
    const baseUserData = {
      correo: 'newuser@example.com',
      cedulaRUC: '1234567890',
      nombre: 'New User',
      ciudad: 'City',
      rol: Rol.CLIENTE,
      firebaseUid: 'new-firebase-uid',
    };

    it('should register a new client user successfully', async () => {
      const expectedUserData = {
        ...baseUserData,
        id: '1234567890',
        intentosFallidos: 0,
        activo: true,
        strikes: 0,
        expoPushToken: undefined,
      };

      mockHashCedula.mockReturnValue('hashed_1234567890');
      mockDocSet.mockResolvedValue(undefined);

      const registeredUser = await usuarioService.register(
        baseUserData.correo,
        baseUserData.cedulaRUC,
        baseUserData.nombre,
        baseUserData.ciudad,
        baseUserData.rol,
        baseUserData.firebaseUid
      );

      expect(registeredUser).toEqual(expectedUserData);
      expect(mockHashCedula).toHaveBeenCalledWith(baseUserData.cedulaRUC);
      expect(mockDoc).toHaveBeenCalledWith('hashed_1234567890');
      expect(mockDocSet).toHaveBeenCalledWith(expectedUserData);
    });

    it('should register a new restaurant user successfully with optional fields', async () => {
      const restaurantUserData = {
        ...baseUserData,
        rol: Rol.RESTAURANTE,
        fechaNacimiento: '15-05-1990',
        alergenos: [Alergeno.LECHE, Alergeno.PESCADO],
        direccion: 'Restaurant Address',
        metodoPago: [MetodoPago.EFECTIVO],
        expoPushToken: 'some-expo-token'
      };

      const expectedUserData = {
        ...restaurantUserData,
        id: '1234567890',
        intentosFallidos: 0,
        activo: true,
        fechaNacimiento: new Date(1990, 4, 15),
        expoPushToken: 'encrypted_some-expo-token',
      };

      mockHashCedula.mockReturnValue('hashed_1234567890');
      mockEncryptExpoPushToken.mockReturnValue('encrypted_some-expo-token');
      mockDocSet.mockResolvedValue(undefined);

      const registeredUser = await usuarioService.register(
        restaurantUserData.correo,
        restaurantUserData.cedulaRUC,
        restaurantUserData.nombre,
        restaurantUserData.ciudad,
        restaurantUserData.rol,
        restaurantUserData.firebaseUid,
        restaurantUserData.fechaNacimiento,
        restaurantUserData.alergenos,
        restaurantUserData.direccion,
        restaurantUserData.metodoPago,
        restaurantUserData.expoPushToken
      );

      expect(registeredUser).toEqual(expectedUserData);
      expect(mockHashCedula).toHaveBeenCalledWith(restaurantUserData.cedulaRUC);
      expect(mockEncryptExpoPushToken).toHaveBeenCalledWith(restaurantUserData.expoPushToken);
      expect(mockDoc).toHaveBeenCalledWith('hashed_1234567890');
      expect(mockDocSet).toHaveBeenCalledWith(expectedUserData);
    });

    it('should throw an error for invalid date format', async () => {
        const invalidDateData = {
            ...baseUserData,
            fechaNacimiento: 'invalid-date',
        };

        await expect(usuarioService.register(
            invalidDateData.correo,
            invalidDateData.cedulaRUC,
            invalidDateData.nombre,
            invalidDateData.ciudad,
            invalidDateData.rol,
            invalidDateData.firebaseUid,
            invalidDateData.fechaNacimiento
        )).rejects.toThrow('Formato de fecha de nacimiento inválido. Debe ser DD-MM-YYYY.');
    });

    it('should throw an error for partially invalid date format', async () => {
      const invalidDateData = {
          ...baseUserData,
          fechaNacimiento: '01-01-invalid',
      };

      await expect(usuarioService.register(
          invalidDateData.correo,
          invalidDateData.cedulaRUC,
          invalidDateData.nombre,
          invalidDateData.ciudad,
          invalidDateData.rol,
          invalidDateData.firebaseUid,
          invalidDateData.fechaNacimiento
      )).rejects.toThrow('Formato de fecha de nacimiento inválido. Debe ser DD-MM-YYYY.');
  });


    it('should throw an error on Firestore set failure', async () => {
      const mockError = new Error('Firestore set error');
      mockHashCedula.mockReturnValue('hashed_1234567890');
      mockDocSet.mockRejectedValue(mockError);

      await expect(usuarioService.register(
        baseUserData.correo,
        baseUserData.cedulaRUC,
        baseUserData.nombre,
        baseUserData.ciudad,
        baseUserData.rol,
        baseUserData.firebaseUid
      )).rejects.toThrow('Firestore set error');
    });
  });

  describe('update', () => {
    it('should update user data successfully', async () => {
      const userId = 'user-to-update';
      const updateData = { nombre: 'Updated Name', ciudad: 'New City' };
      mockDocUpdate.mockResolvedValue(undefined);

      await usuarioService.update(userId, updateData);

      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith(updateData);
    });

    it('should throw error on update failure', async () => {
      const userId = 'user-to-update';
      const updateData = { nombre: 'Updated Name' };
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(usuarioService.update(userId, updateData)).rejects.toThrow('Firestore update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith(updateData);
    });
  });

  describe('getRestaurantes', () => {
    it('should return only restaurant users', async () => {
      const mockRestaurants = [
        { id: 'rest1', nombre: 'Restaurant 1', rol: Rol.RESTAURANTE } as Usuario,
        { id: 'rest2', nombre: 'Restaurant 2', rol: Rol.RESTAURANTE } as Usuario,
      ];
      const mockSnapshot = {
        docs: mockRestaurants.map(rest => ({ data: () => rest } as unknown as admin.firestore.QueryDocumentSnapshot)),
      } as unknown as admin.firestore.QuerySnapshot;

      const mockWhereResult = {
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const restaurants = await usuarioService.getRestaurantes();
      expect(restaurants).toEqual(mockRestaurants);
      expect(mockWhere).toHaveBeenCalledWith('rol', '==', Rol.RESTAURANTE);
      expect(mockWhereResult.get).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no restaurants are found', async () => {
      const mockSnapshot = {
        docs: [],
      } as unknown as admin.firestore.QuerySnapshot;
       const mockWhereResult = {
        get: jest.fn().mockResolvedValue(mockSnapshot),
      };
      mockWhere.mockReturnValue(mockWhereResult);

      const restaurants = await usuarioService.getRestaurantes();
      expect(restaurants).toEqual([]);
      expect(mockWhere).toHaveBeenCalledWith('rol', '==', Rol.RESTAURANTE);
      expect(mockWhereResult.get).toHaveBeenCalledTimes(1);
    });

    it('should throw error on getRestaurantes failure', async () => {
        const mockError = new Error('Firestore error');
         const mockWhereResult = {
            get: jest.fn().mockRejectedValue(mockError),
        };
        mockWhere.mockReturnValue(mockWhereResult);


        await expect(usuarioService.getRestaurantes()).rejects.toThrow('Firestore error');
    });
  });

  describe('registrarIntentoFallido', () => {
    it('should increment intentosFallidos and return the new count', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, intentosFallidos: 2 } as Usuario;
      const mockDocSnapshot = {
        exists: true,
        data: () => mockUser,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);
      mockDocUpdate.mockResolvedValue(undefined);

      const newIntentos = await usuarioService.registrarIntentoFallido(userId);
      expect(newIntentos).toBe(3);
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).toHaveBeenCalledWith({ intentosFallidos: 3 });
    });

    it('should initialize intentosFallidos to 1 if it does not exist', async () => {
        const userId = 'user-id';
        const mockUser = { id: userId } as Usuario; // intentosFallidos is undefined
        const mockDocSnapshot = {
          exists: true,
          data: () => mockUser,
        } as admin.firestore.DocumentSnapshot<Usuario>;
        mockDocGet.mockResolvedValue(mockDocSnapshot);
        mockDocUpdate.mockResolvedValue(undefined);

        const newIntentos = await usuarioService.registrarIntentoFallido(userId);
        expect(newIntentos).toBe(1);
        expect(mockDoc).toHaveBeenCalledWith(userId);
        expect(mockDocGet).toHaveBeenCalledTimes(1);
        expect(mockDocUpdate).toHaveBeenCalledWith({ intentosFallidos: 1 });
      });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-user';
      const mockDocSnapshot = {
        exists: false,
        data: () => undefined,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      await expect(usuarioService.registrarIntentoFallido(userId)).rejects.toThrow('Usuario no encontrado');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).not.toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, intentosFallidos: 2 } as Usuario;
      const mockDocSnapshot = {
        exists: true,
        data: () => mockUser,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(usuarioService.registrarIntentoFallido(userId)).rejects.toThrow('Firestore update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).toHaveBeenCalledWith({ intentosFallidos: 3 });
    });
  });

  describe('bloquearUsuario', () => {
    it('should block a user successfully', async () => {
      const userId = 'user-to-block';
      const durationMs = 60000; // 1 minute
      const motivo = 'Too many failed attempts';
      const firebaseUid = 'firebase-uid-to-block';
      const now = Date.now();
      jest.spyOn(global.Date, 'now').mockReturnValue(now);
      mockDocUpdate.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValue(undefined);

      await usuarioService.bloquearUsuario(userId, durationMs, motivo, firebaseUid);

      const expectedBlockedUntil = new Date(now + durationMs);

      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        activo: false,
        bloqueadoHasta: expectedBlockedUntil,
        motivoBloqueo: motivo,
      });
      expect(mockUpdateUser).toHaveBeenCalledWith(firebaseUid, { disabled: true });
    });

    it('should block a user without firebaseUid successfully', async () => {
      const userId = 'user-to-block';
      const durationMs = 60000; // 1 minute
      const motivo = 'Too many failed attempts';
      const now = Date.now();
      jest.spyOn(global.Date, 'now').mockReturnValue(now);
      mockDocUpdate.mockResolvedValue(undefined);
      mockUpdateUser.mockResolvedValue(undefined);

      await usuarioService.bloquearUsuario(userId, durationMs, motivo);

      const expectedBlockedUntil = new Date(now + durationMs);

      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        activo: false,
        bloqueadoHasta: expectedBlockedUntil,
        motivoBloqueo: motivo,
      });
      expect(mockUpdateUser).not.toHaveBeenCalled(); // auth().updateUser should not be called
    });

    it('should throw error on Firestore update failure', async () => {
      const userId = 'user-to-block';
      const durationMs = 60000;
      const motivo = 'Too many failed attempts';
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(usuarioService.bloquearUsuario(userId, durationMs, motivo)).rejects.toThrow('Firestore update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      // Expect update to be called before throwing
       const now = Date.now();
       jest.spyOn(global.Date, 'now').mockReturnValue(now);
       const expectedBlockedUntil = new Date(now + durationMs);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        activo: false,
        bloqueadoHasta: expectedBlockedUntil,
        motivoBloqueo: motivo,
      });
    });

    it('should throw error on Firebase Auth update failure', async () => {
      const userId = 'user-to-block';
      const durationMs = 60000;
      const motivo = 'Too many failed attempts';
      const firebaseUid = 'firebase-uid-to-block';
      const mockError = new Error('Auth update error');
      mockDocUpdate.mockResolvedValue(undefined); // Firestore update succeeds
      mockUpdateUser.mockRejectedValue(mockError); // Auth update fails

      await expect(usuarioService.bloquearUsuario(userId, durationMs, motivo, firebaseUid)).rejects.toThrow('Auth update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      const now = Date.now();
      jest.spyOn(global.Date, 'now').mockReturnValue(now);
      const expectedBlockedUntil = new Date(now + durationMs);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        activo: false,
        bloqueadoHasta: expectedBlockedUntil,
        motivoBloqueo: motivo,
      });
      expect(mockUpdateUser).toHaveBeenCalledWith(firebaseUid, { disabled: true });
    });
  });

  describe('resetearIntentosFallidos', () => {
    it('should reset intentosFallidos and activate user', async () => {
      const userId = 'user-to-reset';
      mockDocUpdate.mockResolvedValue(undefined);

      await usuarioService.resetearIntentosFallidos(userId);

      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        intentosFallidos: 0,
        activo: true,
        bloqueadoHasta: FieldValue.delete(),
        motivoBloqueo: FieldValue.delete(),
      });
    });

    it('should throw error on Firestore update failure', async () => {
      const userId = 'user-to-reset';
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(usuarioService.resetearIntentosFallidos(userId)).rejects.toThrow('Firestore update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        intentosFallidos: 0,
        activo: true,
        bloqueadoHasta: FieldValue.delete(),
        motivoBloqueo: FieldValue.delete(),
      });
    });
  });

  describe('desbloquearUsuario', () => {
    it('should unblock user, reset strikes and attempts', async () => {
      const userId = 'user-to-unblock';
      mockDocUpdate.mockResolvedValue(undefined);

      await usuarioService.desbloquearUsuario(userId);

      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        activo: true,
        bloqueadoHasta: FieldValue.delete(),
        motivoBloqueo: FieldValue.delete(),
        strikes: 0,
        intentosFallidos: 0,
      });
    });

    it('should throw error on Firestore update failure', async () => {
      const userId = 'user-to-unblock';
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(usuarioService.desbloquearUsuario(userId)).rejects.toThrow('Firestore update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocUpdate).toHaveBeenCalledWith({
        activo: true,
        bloqueadoHasta: FieldValue.delete(),
        motivoBloqueo: FieldValue.delete(),
        strikes: 0,
        intentosFallidos: 0,
      });
    });
  });

  describe('incrementarStrike', () => {
    it('should increment strikes and return the new count', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, strikes: 1 } as Usuario;
      const mockDocSnapshot = {
        exists: true,
        data: () => mockUser,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);
      mockDocUpdate.mockResolvedValue(undefined);

      const newStrikes = await usuarioService.incrementarStrike(userId);
      expect(newStrikes).toBe(2);
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).toHaveBeenCalledWith({ strikes: 2 });
    });

    it('should initialize strikes to 1 if it does not exist', async () => {
        const userId = 'user-id';
        const mockUser = { id: userId } as Usuario; // strikes is undefined
        const mockDocSnapshot = {
          exists: true,
          data: () => mockUser,
        } as admin.firestore.DocumentSnapshot<Usuario>;
        mockDocGet.mockResolvedValue(mockDocSnapshot);
        mockDocUpdate.mockResolvedValue(undefined);

        const newStrikes = await usuarioService.incrementarStrike(userId);
        expect(newStrikes).toBe(1);
        expect(mockDoc).toHaveBeenCalledWith(userId);
        expect(mockDocGet).toHaveBeenCalledTimes(1);
        expect(mockDocUpdate).toHaveBeenCalledWith({ strikes: 1 });
      });

    it('should throw error if user not found', async () => {
      const userId = 'non-existent-user';
      const mockDocSnapshot = {
        exists: false,
        data: () => undefined,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);

      await expect(usuarioService.incrementarStrike(userId)).rejects.toThrow('Usuario no encontrado');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).not.toHaveBeenCalled();
    });

    it('should throw error on update failure', async () => {
      const userId = 'user-id';
      const mockUser = { id: userId, strikes: 1 } as Usuario;
      const mockDocSnapshot = {
        exists: true,
        data: () => mockUser,
      } as admin.firestore.DocumentSnapshot<Usuario>;
      mockDocGet.mockResolvedValue(mockDocSnapshot);
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);

      await expect(usuarioService.incrementarStrike(userId)).rejects.toThrow('Firestore update error');
      expect(mockDoc).toHaveBeenCalledWith(userId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).toHaveBeenCalledWith({ strikes: 2 });
    });
  });

  describe('resetearStrikes', () => {
    const mockUser = { id: 'user-id', correo: 'test@example.com' } as Usuario;
    const mockSnapshot = {
      empty: false,
      docs: [{ data: () => ({ ...mockUser }) } as unknown as admin.firestore.QueryDocumentSnapshot],
    } as admin.firestore.QuerySnapshot;
  
    beforeEach(() => {
      const mockWhereResult = {
        limit: jest.fn(() => ({
          get: jest.fn().mockResolvedValue(mockSnapshot),
        })),
      };
      mockWhere.mockReturnValue(mockWhereResult);
      mockDocUpdate.mockResolvedValue(undefined);
    });
  
    it('should reset strikes to 0 for a user', async () => {
        // Simulamos un usuario NO BLOQUEADO
        const unblockedUser = {
          id: 'user-id',
          correo: 'test@example.com',
          strikes: 3,
          activo: true,
          bloqueadoHasta: undefined,
          motivoBloqueo: undefined
        } as Usuario;
      
        // Mockeamos que el snapshot devuelve ese usuario
        const mockSnapshot = {
          empty: false,
          docs: [{ data: () => unblockedUser }],
        };
        const mockWhereResult = {
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(mockSnapshot),
          })),
        };
        mockWhere.mockReturnValue(mockWhereResult);
      
        await usuarioService.resetearStrikes('test@example.com');
      
        expect(mockWhere).toHaveBeenCalledWith('correo', '==', 'test@example.com');
        expect(mockDoc).toHaveBeenCalledWith(unblockedUser.id);
        expect(mockDocUpdate).toHaveBeenCalledWith({ strikes: 0 });
      });
  
    it('should reset strikes and unblock user if blocked and has 5 or more strikes', async () => {
        const blockedUser = {
          id: 'user-id',
          correo: 'test@example.com',
          strikes: 5,
          activo: false,
          bloqueadoHasta: new Date(),
          motivoBloqueo: 'Strikes'
        } as Usuario;
      
        const mockSnapshot = {
          empty: false,
          docs: [{ data: () => blockedUser }],
        };
        const mockWhereResult = {
          limit: jest.fn(() => ({
            get: jest.fn().mockResolvedValue(mockSnapshot),
          })),
        };
        mockWhere.mockReturnValue(mockWhereResult);
      
        await usuarioService.resetearStrikes('test@example.com');
      
        expect(mockWhere).toHaveBeenCalledWith('correo', '==', 'test@example.com');
        expect(mockDoc).toHaveBeenCalledWith(blockedUser.id);
        expect(mockDocUpdate).toHaveBeenCalledWith({
          strikes: 0,
          activo: true,
          bloqueadoHasta: 'FieldValue.delete()',
          motivoBloqueo: 'FieldValue.delete()',
      });
    });
  });

  describe('updateExpoPushToken', () => {
    const cedulaRUC = '1727332247';
    const nuevoToken = 'nuevo_token_expo';
    const hashedId = `hashed_${cedulaRUC}`;
    const mockUser = {
      id: hashedId,
      cedulaRUC,
      expoPushToken: 'old_token'
    } as Usuario;
  
    beforeEach(() => {
      jest.clearAllMocks();
      // Garantizar que encrypt devuelve el formato correcto
      mockEncryptExpoPushToken.mockImplementation((token) => `encrypted_${token}`);
    });
  
    it('should update expo push token for existing user', async () => {
      mockHashCedula.mockReturnValue(hashedId);
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => mockUser,
        id: hashedId
      });
      mockDocUpdate.mockResolvedValue(undefined);
  
      await usuarioService.updateExpoPushToken(cedulaRUC, nuevoToken);
  
      expect(mockHashCedula).toHaveBeenCalledWith(cedulaRUC);
      expect(mockDoc).toHaveBeenCalledWith(hashedId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockEncryptExpoPushToken).toHaveBeenCalledWith(nuevoToken); // Opcional pero útil
      expect(mockDocUpdate).toHaveBeenCalledWith({
        expoPushToken: `encrypted_${nuevoToken}`
      });
    });
  
    it('should throw error if user not found', async () => {
      mockHashCedula.mockReturnValue(hashedId);
      mockDocGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
        id: hashedId
      });
  
      await expect(usuarioService.updateExpoPushToken(cedulaRUC, nuevoToken))
        .rejects
        .toThrow('Usuario no encontrado');
  
      expect(mockHashCedula).toHaveBeenCalledWith(cedulaRUC);
      expect(mockDoc).toHaveBeenCalledWith(hashedId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockDocUpdate).not.toHaveBeenCalled();
    });
  
    it('should throw error on update failure', async () => {
      mockHashCedula.mockReturnValue(hashedId);
      mockDocGet.mockResolvedValue({
        exists: true,
        data: () => mockUser,
        id: hashedId
      });
      const mockError = new Error('Firestore update error');
      mockDocUpdate.mockRejectedValue(mockError);
  
      await expect(usuarioService.updateExpoPushToken(cedulaRUC, nuevoToken))
        .rejects
        .toThrow('Firestore update error');
  
      expect(mockHashCedula).toHaveBeenCalledWith(cedulaRUC);
      expect(mockDoc).toHaveBeenCalledWith(hashedId);
      expect(mockDocGet).toHaveBeenCalledTimes(1);
      expect(mockEncryptExpoPushToken).toHaveBeenCalledWith(nuevoToken); // Opcional
      expect(mockDocUpdate).toHaveBeenCalledWith({
        expoPushToken: `encrypted_${nuevoToken}`
      });
    });
  });
});
