// Mock for Firebase modules
export const initializeApp = jest.fn(() => ({
  name: '[DEFAULT]',
  options: {},
}));

export const getFirestore = jest.fn(() => ({
  type: 'firestore',
  app: {},
}));

export const getAuth = jest.fn(() => ({
  app: {},
  currentUser: null,
}));

export const getStorage = jest.fn(() => ({
  app: {},
}));

export const getAnalytics = jest.fn(() => ({
  app: {},
}));

export const isSupported = jest.fn(() => Promise.resolve(true));

export const getFunctions = jest.fn(() => ({
  app: {},
}));

export const getDatabase = jest.fn(() => ({
  app: {},
}));

export const collection = jest.fn();
export const doc = jest.fn();
export const getDoc = jest.fn();
export const getDocs = jest.fn();
export const addDoc = jest.fn();
export const updateDoc = jest.fn();
export const deleteDoc = jest.fn();
export const query = jest.fn();
export const where = jest.fn();
export const orderBy = jest.fn();
export const limit = jest.fn();
export const onSnapshot = jest.fn();

export default {
  initializeApp,
  getFirestore,
  getAuth,
  getStorage,
  getAnalytics,
  isSupported,
  getFunctions,
  getDatabase,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
};
