# RNTodoList - Offline-First Todo App

A React Native todo list application built with offline-first architecture, providing seamless task management regardless of network connectivity.

![alt text](image-1.png)

## Features

### Offline-First Architecture

- **Local Storage**: Tasks are saved locally using AsyncStorage
- **Initial Data**: Tasks initially fetched from DummyJSON API
- **Local Operations**: All add/edit/delete operations handled locally
- **Network Status**: Real-time connection monitoring
- **Data Flow**:
  1. Save changes to local storage
  2. Update UI immediately
  3. Maintain offline functionality
  4. Show network status clearly

### Task Management

- **Create Tasks**: Add new tasks that appear at the top of the list
- **Edit Tasks**: Modify task titles with save/cancel options
- **Delete Tasks**: Remove tasks immediately
- **Complete Tasks**: Toggle task completion with visual feedback
- **Task Ordering**: Latest tasks appear first

### Network Status Detection

- **Connection Types**: Detects online/offline state
- **Status Updates**: Adaptive polling (30s online, 5s offline)
- **Visual Indicators**:
  - Clear offline status message
  - Consistent dark theme styling
  - Border indicators for status

### UI/UX Features

- **Dark Theme**: Modern dark color scheme
- **Responsive Design**: Proper safe area handling
- **Visual Feedback**:
  - Task completion indicators
  - Edit mode with save/cancel
  - Network status updates
- **Smooth Interactions**:
  - Immediate local updates
  - Clean checkbox animations
  - Proper touch targets

## Technical Implementation

### Core Libraries

- **React Native**: Cross-platform mobile framework
- **React Native Paper**: Material Design components
- **AsyncStorage**: Local data persistence
- **Redux**: State management
- **TypeScript**: Type safety

### Components

- **Tasks**: Main screen with task management
- **TaskList**: Renders tasks with loading states
- **TaskListItem**: Individual task with edit/delete
- **AddTaskForm**: New task creation
- **NetworkStatusBar**: Connection status display

### Architecture

- **Offline-First**: All operations work without network
- **Local State**: Redux + AsyncStorage for persistence
- **Type Safety**: Full TypeScript implementation
- **Component Structure**: Clean separation of concerns

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

   - Enable Airplane Mode
   - Add/edit/delete tasks
   - Verify local persistence
   - Check network status updates

2. **UI Testing**:

   - Verify safe areas on iOS/Android
   - Check dark theme consistency
   - Test task interactions
   - Monitor network status changes

3. **Data Management**:
   - Changes persist in AsyncStorage
   - Initial data from DummyJSON
   - Local operations only
   - Clear network status indication
