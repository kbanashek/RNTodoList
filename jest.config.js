module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/src/setupTests.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|react-redux|@react-native|react-native-paper)'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect']
};
