import { NotificacionService } from '../../../../src/services/notificacionesService';
import { Expo } from 'expo-server-sdk';

// Mock the Expo SDK
jest.mock('expo-server-sdk', () => ({
  Expo: {
    isExpoPushToken: jest.fn((token: string) => token.startsWith('ExponentPushToken[')),
  },
}));

// Mock the sendPushNotification function from notificacionConfig
jest.mock('../../../../src/config/notificacionConfig', () => ({
  sendPushNotification: jest.fn((message) => {
    // Simulate a successful response for valid tokens
    if (Expo.isExpoPushToken(message.token)) {
      return Promise.resolve({ data: { status: 'ok', id: 'test-id' } });
    }
    // Simulate an error for invalid tokens
    return Promise.reject(new Error('Invalid token'));
  }),
}));

describe('NotificacionService', () => {
  let notificacionService: NotificacionService;
  let mockSendPushNotification: jest.Mock;

  beforeEach(() => {
    notificacionService = new NotificacionService();
    // Get the mocked function after each test
    mockSendPushNotification = require('../../../../src/config/notificacionConfig').sendPushNotification as jest.Mock;
    mockSendPushNotification.mockClear(); // Clear mock calls before each test
  });

  describe('enviarNotificacion', () => {
    it('should send a notification successfully with a valid token', async () => {
      const validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Test Title';
      const body = 'Test Body';
      const data = { key: 'value' };

      const response = await notificacionService.enviarNotificacion(validToken, title, body, data);

      expect(mockSendPushNotification).toHaveBeenCalledWith({ token: validToken, title, body, data });
      expect(response).toEqual({ data: { status: 'ok', id: 'test-id' } });
    });

    it('should throw an error for an invalid token', async () => {
      const invalidToken = 'invalid-token';
      const title = 'Test Title';
      const body = 'Test Body';

      await expect(notificacionService.enviarNotificacion(invalidToken, title, body)).rejects.toThrow('Token inválido de Expo');
      expect(mockSendPushNotification).not.toHaveBeenCalled();
    });

    it('should handle errors from sendPushNotification', async () => {
      const validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Test Title';
      const body = 'Test Body';
      const error = new Error('Send notification failed');

      mockSendPushNotification.mockRejectedValueOnce(error);

      await expect(notificacionService.enviarNotificacion(validToken, title, body)).rejects.toThrow('Send notification failed');
      expect(mockSendPushNotification).toHaveBeenCalledWith({ token: validToken, title, body, data: undefined });
    });
  });

  describe('enviarNotificacionReservaPaquete', () => {
    it('should send a package reservation notification successfully with a valid token', async () => {
      const validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Reservation Title';
      const body = 'Reservation Body';
      const data = { packageId: '123' };

      const response = await notificacionService.enviarNotificacionReservaPaquete(validToken, title, body, data);

      expect(mockSendPushNotification).toHaveBeenCalledWith({ token: validToken, title, body, data });
      expect(response).toEqual({ data: { status: 'ok', id: 'test-id' } });
    });

    it('should throw an error for an invalid token when sending package reservation notification', async () => {
      const invalidToken = 'invalid-token';
      const title = 'Reservation Title';
      const body = 'Reservation Body';

      await expect(notificacionService.enviarNotificacionReservaPaquete(invalidToken, title, body)).rejects.toThrow('Token inválido de Expo');
      expect(mockSendPushNotification).not.toHaveBeenCalled();
    });

    it('should handle errors from sendPushNotification when sending package reservation notification', async () => {
      const validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Reservation Title';
      const body = 'Reservation Body';
      const error = new Error('Send reservation notification failed');

      mockSendPushNotification.mockRejectedValueOnce(error);

      await expect(notificacionService.enviarNotificacionReservaPaquete(validToken, title, body)).rejects.toThrow('Send reservation notification failed');
      expect(mockSendPushNotification).toHaveBeenCalledWith({ token: validToken, title, body, data: undefined });
    });
  });

  describe('enviarNotificacionCompraCancelada', () => {
    it('should send a purchase cancelled notification successfully with a valid token', async () => {
      const validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Purchase Cancelled Title';
      const body = 'Purchase Cancelled Body';
      const data = { purchaseId: '456' };

      const response = await notificacionService.enviarNotificacionCompraCancelada(validToken, title, body, data);

      expect(mockSendPushNotification).toHaveBeenCalledWith({ token: validToken, title, body, data });
      expect(response).toEqual({ data: { status: 'ok', id: 'test-id' } });
    });

    it('should throw an error for an invalid token when sending purchase cancelled notification', async () => {
      const invalidToken = 'invalid-token';
      const title = 'Purchase Cancelled Title';
      const body = 'Purchase Cancelled Body';

      await expect(notificacionService.enviarNotificacionCompraCancelada(invalidToken, title, body)).rejects.toThrow('Token inválido de Expo');
      expect(mockSendPushNotification).not.toHaveBeenCalled();
    });

    it('should handle errors from sendPushNotification when sending purchase cancelled notification', async () => {
      const validToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
      const title = 'Purchase Cancelled Title';
      const body = 'Purchase Cancelled Body';
      const error = new Error('Send purchase cancelled notification failed');

      mockSendPushNotification.mockRejectedValueOnce(error);

      await expect(notificacionService.enviarNotificacionCompraCancelada(validToken, title, body)).rejects.toThrow('Send purchase cancelled notification failed');
      expect(mockSendPushNotification).toHaveBeenCalledWith({ token: validToken, title, body, data: undefined });
    });
  });
});