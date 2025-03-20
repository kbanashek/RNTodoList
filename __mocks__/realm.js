// Mock implementation for Realm
const mockRealmInstance = {
  write: jest.fn(callback => callback()),
  objects: jest.fn().mockReturnValue([]),
  objectForPrimaryKey: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  close: jest.fn(),
  isClosed: false,
};

// Create a proper Object class that can be extended
class RealmObject {
  static schema = {};
  static extend() {
    return RealmObject;
  }
}

// Export the mock Realm module
const Realm = jest.fn().mockImplementation(() => mockRealmInstance);

// Add static methods and properties
Realm.Object = RealmObject;

// Add open method that returns our mockRealmInstance
Realm.open = jest.fn().mockResolvedValue(mockRealmInstance);

// Expose the mockRealmInstance for tests
Realm._mockRealmInstance = mockRealmInstance;

module.exports = Realm;
