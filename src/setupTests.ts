import '@testing-library/jest-native/extend-expect';
import { cleanup } from '@testing-library/react-native';

// Mock Redux hooks for isolated component testing
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: jest.fn()
}));

// Mock Paper theme to match iOS design system colors
jest.mock('react-native-paper', () => ({
  useTheme: () => ({
    colors: {
      primary: '#007AFF',    // iOS primary blue
      secondary: '#666666',  // Consistent with design system
      surface: '#FFFFFF',
      outline: '#E5E5EA',
      background: '#F2F2F7',
      onBackground: '#000000',
      error: '#FF3B30'
    }
  })
}));

// Cleanup after each test
afterEach(cleanup);
