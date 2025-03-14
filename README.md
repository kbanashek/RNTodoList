# RNTodoList - Offline-First Todo App

A React Native todo list application built with offline-first architecture, providing seamless task management regardless of network connectivity.

## Features

### Offline-First Architecture
- **Local Storage**: Tasks are saved locally using AsyncStorage
- **Background Sync**: Changes sync automatically when online
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Conflict Resolution**: Local changes take priority over server data
- **Data Flow**:
  1. Save changes to local storage first
  2. Update UI immediately
  3. Queue change for background sync
  4. Retry failed operations automatically
  5. Preserve local changes on conflicts

### Task Management
- **Create Tasks**: Add new tasks that appear at the top of the list
- **Edit Tasks**: Modify task titles and completion status
- **Delete Tasks**: Remove tasks with proper sync handling
- **Task Ordering**: Latest tasks appear first

### Network Status Detection
- **Connection Types**: Detects WiFi, cellular, or no connection
- **Internet Reachability**: Checks actual internet connectivity
- **Status Updates**: Real-time status changes using Expo Network API
- **Status Priority**:
  1. Task Errors: Shows sync failures first
  2. Pending Tasks: Shows active syncs
  3. Network State: Shows connection status
- **Visual Indicators**:
  - Red: Sync errors
  - Blue: Active syncing
  - Orange: Limited/No connectivity
  - Green: Fully online

### Task Sync Status
- **Real-Time Updates**: Immediate status feedback
- **Status Types**:
  - Online - All changes synced
  - Limited Connectivity - Changes saved locally
  - Offline Mode - Changes saved locally
  - Syncing - Number of tasks being synced
  - Sync Error - Number of failed tasks

### Error Handling & Recovery
- **Retry Logic**:
  - Exponential backoff (1s base delay)
  - Configurable max retries (default: 3)
  - Automatic retry on network recovery
- **Error States**:
  - Task-level error tracking
  - Detailed API error messages
  - Sync failure indicators
  - Network error detection
- **Recovery Features**:
  - Manual retry of failed operations
  - Automatic background retry
  - Error state preservation
  - Conflict resolution
- **Data Protection**:
  - No data loss during errors
  - Local changes preserved
  - Sync state persistence
  - Error message preservation

## Running the App

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on iOS:
   ```bash
   npm run ios
   ```

   Or Android:
   ```bash
   npm run android
   ```

## Testing Offline Functionality

1. **Add Tasks While Online**:
   - Add several tasks to see them sync
   - Notice the "Online - All changes synced" status

2. **Test Offline Mode**:
   - Enable Airplane Mode on your device
   - Add/edit/delete tasks
   - Notice "Offline Mode" status
   - Changes are saved locally

3. **Restore Connection**:
   - Disable Airplane Mode
   - Watch tasks sync automatically
   - Status changes to "Syncing" then "Online"

4. **Test Limited Connectivity**:
   - Connect to a network without internet
   - Notice "Limited Connectivity" status
   - Changes still save locally
   - Syncs when internet is available

5. **Error Handling**:
   - If sync fails, tasks show error state
   - Click to retry failed operations
   - Error details visible in status bar

## Technical Implementation

### Type System
- **Core Types**:
  - `Task`: Todo item with sync status
  - `NetworkStatus`: Enum for connection states
  - `PendingChange`: Offline change tracking
  - `NetworkState`: Connection state tracking
- **Type Safety**:
  - Full TypeScript coverage
  - Strict null checks
  - Enum-based status tracking
  - Interface-based contracts

### Architecture
- **React Native**: Cross-platform mobile support
- **Expo Network API**: Reliable network status detection
- **AsyncStorage**: Reliable local data persistence
- **Queue System**: Robust change tracking and sync

### Components
- **NetworkStatusBar**: 
  - Network and sync status display
  - Priority-based status messages
  - Visual state indicators
- **TaskList**: 
  - Ordered task display
  - Sync status integration
  - Error state handling
- **AddTaskForm**: 
  - Task creation
  - Offline support
  - Immediate feedback
- **TaskListItem**: 
  - Individual task display
  - Sync status indicators
  - Error state handling

### Data Synchronization
- **Change Queue**:
  - Ordered by timestamp
  - Preserves operation order
  - Handles conflicts
  - Retries failed changes
- **Merge Strategy**:
  1. Local changes take priority
  2. Server changes merge if no conflict
  3. Duplicates prevented by title
  4. Sync status preserved
- **Background Operations**:
  - Automatic sync on connection
  - Periodic sync attempts
  - Silent error recovery
  - State persistence
- **Conflict Resolution**:
  - Local changes never lost
  - Server changes merge when safe
  - Clear status indicators
  - Manual resolution options
