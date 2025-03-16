# RNTodoList - Offline-First Todo App

A React Native todo list application built with offline-first architecture, providing seamless task management regardless of network connectivity.

![alt text](image-1.png)

## Features

### Offline-First Architecture

- **Local Storage**: Tasks are saved locally using AsyncStorage
- **Initial Data**: Tasks initially fetched from DummyJSON API
- **Local Operations**: All add/edit/delete operations handled locally
- **Network Status**: Real-time connection monitoring with adaptive polling
- **Data Flow**:
  1. Save changes to local storage immediately
  2. Update UI for instant feedback
  3. Maintain offline functionality with proper state handling
  4. Show clear network status indicators

### Task Management

- **Create Tasks**: Add new tasks with loading state feedback
- **Edit Tasks**: Modify task titles with optimistic updates
- **Delete Tasks**: Remove tasks with immediate local reflection
- **Complete Tasks**: Toggle task completion with visual feedback
- **Task Ordering**: Latest tasks appear first
- **Input Validation**: Proper whitespace handling and empty input prevention

### Network Status Detection

- **Connection Types**: Detects online/offline state with expo-network
- **Status Updates**: Smart polling intervals (30s online, 5s offline)
- **Visual Indicators**:
  - Clear offline status message
  - Loading states during operations
  - Consistent dark theme styling
  - Border indicators for network status

### UI/UX Features

- **Dark Theme**: Modern dark color scheme
- **Responsive Design**: Proper safe area handling
- **Visual Feedback**:
  - Task completion indicators
  - Loading states during operations
  - Network status updates
  - Form submission feedback
- **Smooth Interactions**:
  - Immediate local updates
  - Clean checkbox animations
  - Proper touch targets
  - Disabled states during loading

## Technical Implementation

### Core Libraries

- [React Native](https://reactnative.dev/): Cross-platform mobile framework
- [React Native Paper](https://callstack.github.io/react-native-paper/): Material Design components
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/): Local data persistence
- [Redux](https://redux.js.org/): State management
- [TypeScript](https://www.typescriptlang.org/): Type safety and developer experience
- [Expo](https://expo.dev/): Development and build tools
- [Jest](https://jestjs.io/): Unit testing with proper async support
- [Testing Library](https://testing-library.com/): Component testing best practices

### Components

- **Tasks**: Main screen with task management
- **TaskList**: Renders tasks with loading states
- **TaskListItem**: Individual task with edit/delete
- **AddTodoForm**: New task creation with loading states
- **NetworkStatusBar**: Real-time connection status display

### Testing Strategy

- **Unit Tests**: Core component functionality testing
  - Form validation and submission flows
  - Loading and disabled states
  - Offline-first behavior validation
  - Proper async operation testing with act()
  - Immediate local updates verification
  - Network status handling
- **Component Mocks**: Type-safe mock implementations
  - react-native-paper components with proper types
  - Network status hooks with offline states
  - AsyncStorage operations for local persistence
  - Loading and disabled state handling
- **Test Coverage**: Key user interactions
  - Task creation with validation
  - Loading state feedback
  - Offline operation handling
  - Network status changes
  - Error state management
  - Whitespace handling
  - Empty submission prevention
- **Test Organization**:
  - `__tests__` directory structure
  - Co-located test files
  - Shared test utilities
  - Type-safe mocks and fixtures

### Offline-First Testing Strategy

Our testing approach emphasizes the app's offline-first architecture:

#### Component Tests
- **AddTodoForm**:
  - Validates immediate local updates
  - Tests loading states during submissions
  - Verifies proper disabled states
  - Ensures form validation with whitespace handling
  - Confirms offline-safe submission behavior

#### Network Status Tests
- **Adaptive Polling**:
  - 30-second intervals when online
  - 5-second intervals when offline
  - Proper cleanup on unmount
  - Connection type detection

#### Local Storage Tests
- **AsyncStorage Operations**:
  - Immediate local persistence
  - Optimistic UI updates
  - Error state handling
  - Data integrity checks

#### Mock Implementation
- **Type-Safe Mocks**:
  - react-native-paper components
  - Network status hooks
  - AsyncStorage operations
  - Loading state handlers

#### Test Organization
- **Directory Structure**:
  ```
  src/
  ├── components/
  │   ├── __tests__/
  │   │   └── AddTodoForm.test.tsx
  │   └── AddTodoForm.tsx
  ├── hooks/
  │   └── __tests__/
  └── utils/
      └── __tests__/
  ```

#### Test Commands
```bash
# Run all tests
npm test

# Run specific component tests
npm test -- src/components/__tests__/AddTodoForm.test.tsx

# Watch mode for development
npm test -- --watch
```

## Future Improvements

### Testing & Code Quality
- ✅ Implemented Jest unit tests for core components:
  - AddTodoForm: Form validation, loading states, offline submission
  - Proper mocking of react-native-paper components
  - Type-safe test implementations
  - Async operation testing with act()
- Add more component tests with React Native Testing Library
- Implement Detox E2E tests
- Set up Expo EAS workflow for CI/CD
- Add test coverage reporting with Jest Coverage
- Configure Husky pre-commit hooks:
  - Run unit tests
  - ESLint checks
  - Prettier formatting
  - TypeScript type checking

### Features
- Task categories/tags
- Due dates and reminders
- Task priority levels
- Sorting and filtering options
- Task search functionality
- Batch task operations

### UI/UX
- Task animations (swipe, completion)
- Drag and drop reordering
- Pull to refresh
- Custom themes support
- Accessibility improvements
- Haptic feedback

### Performance
- Task list virtualization
- Network request caching
- Bundle size optimization

### Architecture
- Enhanced error handling and monitoring:
  - [Sentry](https://docs.sentry.io/platforms/react-native/): Real-time error tracking with offline support
  - Custom error boundaries with offline fallbacks
  - Structured error logging with AsyncStorage queue
  - Network error recovery with retry logic
  - Offline-first error tracking strategy
- Performance monitoring:
  - [DataDog RUM](https://docs.datadoghq.com/real_user_monitoring/reactnative/): User experience analytics
  - Offline-capable network request tracking
  - Performance metrics with local buffering
  - Crash reporting with offline storage
  - Custom event tracking for task operations
- Better TypeScript types
- Code splitting and lazy loading
- Bundle size optimization
- Over-the-Air Updates:
  - [Expo Updates](https://docs.expo.dev/versions/latest/sdk/updates/): Automatic app updates
  - Phased rollout strategy
  - Offline fallback for failed updates
  - Update download on WiFi only
  - Background update checks
  - Update notifications

### Documentation
- API documentation
- Component storybook
- Contributing guidelines
- Code style guide
- Architecture diagrams

## Running the App

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npx expo start
   ```

3. Run on iOS/Android:
   - Use Expo Go app
   - Or run in simulator/emulator

## Development Notes

1. **Testing Offline Mode**:
   - Enable Airplane Mode to simulate offline state
   - Add/edit/delete tasks to verify local operations
   - Verify immediate local persistence with AsyncStorage
   - Check adaptive polling intervals (30s online, 5s offline)
   - Monitor loading states during operations
   - Test form validation and disabled states
   - Verify proper error handling

2. **Running Tests**:
   ```bash
   # Run all tests
   npm test

   # Run specific component tests
   npm test -- src/components/__tests__/AddTodoForm.test.tsx
   ```

3. **Test Development**:
   - Place tests in `__tests__` directories
   - Use proper async testing with act()
   - Implement type-safe component mocks
   - Test loading and disabled states
   - Verify offline-first behavior
   - Check form validation
   - Test network status handling

4. **UI Testing**:
   - Verify safe areas on iOS/Android
   - Check dark theme consistency
   - Test all task interactions
   - Monitor network status changes
   - Verify loading state indicators
   - Test disabled state styling
   - Check form validation feedback

5. **Data Management**:
   - Changes persist immediately in AsyncStorage
   - Initial data loaded from DummyJSON
   - All operations handled locally
   - Clear network status indication
   - Loading states during operations
   - Proper error handling
   - Form validation with whitespace handling
