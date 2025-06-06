
export const mockEncryptExpoPushToken = jest.fn();
export const mockHashCedula = jest.fn();

jest.mock('../../utils/HELPER', () => ({
  encryptExpoPushToken: mockEncryptExpoPushToken,
  hashCedula: mockHashCedula,
})); 