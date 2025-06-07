// src/tests/setup.ts

import { mockEncryptExpoPushToken, mockHashCedula } from './mocks/HELPER.mock';
import { Firestore } from 'firebase-admin/firestore';

// Mock implementations for Firestore
const mockWhere = jest.fn();
const mockLimit = jest.fn();
const mockCollectionGet = jest.fn();
const mockDoc = jest.fn();
const mockDocGet = jest.fn();
const mockDocSet = jest.fn();
const mockDocUpdate = jest.fn();
const mockUpdateUser = jest.fn();
const mockCollection = jest.fn();
const mockCollectionAdd = jest.fn();
const mockOrderBy = jest.fn();
const mockSelect = jest.fn();
const mockStartAfter = jest.fn();

// Setup the mock chain
mockWhere.mockReturnValue({
  limit: mockLimit,
  orderBy: mockOrderBy,
  select: mockSelect,
  startAfter: mockStartAfter,
  get: mockCollectionGet,
});

mockLimit.mockReturnValue({
  get: mockCollectionGet,
  where: mockWhere,
  orderBy: mockOrderBy,
  select: mockSelect,
  startAfter: mockStartAfter,
});

mockOrderBy.mockReturnValue({
  get: mockCollectionGet,
  where: mockWhere,
  select: mockSelect,
  limit: mockLimit,
  startAfter: mockStartAfter,
});

mockSelect.mockReturnValue({
  get: mockCollectionGet,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  startAfter: mockStartAfter,
});

mockStartAfter.mockReturnValue({
  get: mockCollectionGet,
  where: mockWhere,
  select: mockSelect,
  orderBy: mockOrderBy,
  limit: mockLimit,
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
  add: mockCollectionAdd,
  orderBy: mockOrderBy,
  select: mockSelect,
  startAfter: mockStartAfter,
  withConverter: jest.fn().mockReturnThis(),
};

// Mock firebase-admin
jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  firestore: () => ({
    collection: mockCollection,
    FieldValue: {
      delete: jest.fn(() => 'FieldValue.delete()'),
    },
  }),
  auth: () => ({
    updateUser: mockUpdateUser,
  }),
}));

// Mock firebase-admin/firestore
jest.mock('firebase-admin/firestore', () => {
  const mockTimestamp = {
    now: jest.fn().mockReturnValue({ seconds: 1234567890, nanoseconds: 0 }),
    fromDate: jest.fn().mockImplementation((date) => ({
      seconds: Math.floor(date.getTime() / 1000),
      nanoseconds: (date.getTime() % 1000) * 1000000,
      toDate: () => date,
    })),
  };

  return {
    FieldValue: {
      delete: jest.fn(() => 'FieldValue.delete()'),
    },
    Timestamp: mockTimestamp,
  };
});

// Mock the firebase config
jest.mock('../config/firebase', () => ({
  db: {
    collection: jest.fn().mockReturnValue(mockCollectionObject),
  } as unknown as Firestore,
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
  mockCollection.mockClear();
  mockCollectionAdd.mockClear();
  mockOrderBy.mockClear();
  mockSelect.mockClear();
  mockStartAfter.mockClear();
});

// Export mocks for use in tests
export {
  mockCollection,
  mockCollectionAdd,
  mockCollectionGet,
  mockDoc,
  mockDocGet,
  mockDocSet,
  mockDocUpdate,
  mockEncryptExpoPushToken,
  mockHashCedula,
  mockLimit,
  mockOrderBy,
  mockSelect,
  mockStartAfter,
  mockUpdateUser,
  mockWhere,
  mockCollectionObject as mockCollectionResult,
  mockDoc as mockDocResult
};

