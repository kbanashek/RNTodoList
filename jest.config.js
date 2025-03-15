module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/src/test/setup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-redux|@react-native|react-native-paper|@expo|@testing-library)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@env$': '<rootDir>/src/env.d.ts'
  }
};
