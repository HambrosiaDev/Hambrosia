// src/tests/setup.ts

import { mockEncryptExpoPushToken, mockHashCedula } from './mocks/HELPER.mock';

// Mock implementations for Firestore
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockCollectionGet = jest.fn();
const mockDoc = jest.fn();
const mockDocGet = jest.fn();
const mockDocSet = jest.fn();
const mockDocUpdate = jest.fn();
const mockUpdateUser = jest.fn();

// Setup the mock chain
mockWhere.mockReturnValue({
  limit: mockLimit,
});

mockLimit.mockReturnValue({
  get: mockCollectionGet,
});

mockDoc.mockReturnValue({
  get: mockDocGet,
  set: mockDocSet,
  update: mockDocUpdate,
});

// Create a mock collection object
const mockCollectionObject = {
  where: mockWhere,
  limit: mockLimit,
  get: mockCollectionGet,
  doc: mockDoc,
};

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: jest.fn(() => ({
      withConverter: jest.fn(() => mockCollectionObject),
    })),
    FieldValue: {
      delete: jest.fn(() => 'FieldValue.delete()'),
    },
  }),
  auth: () => ({
    updateUser: mockUpdateUser,
  }),
}));

// Mock firebase-admin/firestore
jest.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    delete: jest.fn(() => 'FieldValue.delete()'),
  },
}));

// Mock the firebase config
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn(() => ({
      withConverter: jest.fn(() => mockCollectionObject),
    })),
  },
}));



// Reset all mocks before each test
beforeEach(() => {
  mockWhere.mockClear();
  mockLimit.mockClear();
  mockCollectionGet.mockClear();
  mockDoc.mockClear();
  mockDocGet.mockClear();
  mockDocSet.mockClear();
  mockDocUpdate.mockClear();
  mockUpdateUser.mockClear();
  mockEncryptExpoPushToken.mockClear();
  mockHashCedula.mockClear();
});

// Export mocks for use in tests
export {
    mockCollectionGet,
    mockDoc,
    mockDocGet,
    mockDocSet,
    mockDocUpdate,
    mockEncryptExpoPushToken,
    mockHashCedula,
    mockLimit,
    mockUpdateUser,
    mockWhere
};

