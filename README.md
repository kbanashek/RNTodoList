# RNTodoList

A React Native todo app with robust offline support and sync capabilities. Built with Expo, TypeScript, and Redux Toolkit.

![
  App Screenshot
](image-2.png)

## Core Features

- **State Management**

  - Redux Toolkit for state updates
  - Optimistic UI updates
  - Memoized selectors

- **Offline-First Architecture**

  - Local storage with AsyncStorage
  - Initial data from DummyJSON API
  - Local-first operations
  - Background sync on reconnect
  - Optimistic UI updates

- **Task Management**

  - Create, edit, and delete tasks
  - Local operations with sync
  - Loading states per task ID
  - Newest tasks first
  - Offline data persistence

- **Network Handling**
  - Real-time connection monitoring
  - Internet reachability checks
  - Clear offline indicators
  - Automatic data sync
  - Error recovery

## Tech Stack

- React Native + Expo
- TypeScript for type safety
- Redux Toolkit with Immer
- AsyncStorage for offline data
- React Native Paper UI
- Jest + React Testing Library
- Husky for Git hooks

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Start the Expo server:

```bash
npm start
```

3. Run on device:

- Install Expo Go on your iOS/Android device
- Scan the QR code from terminal
- Or press 'i' for iOS simulator / 'a' for Android

## Development

### Test Suite

```bash
npm test           # Run Jest tests
npm run lint       # Run ESLint
npm run format     # Run Prettier
```

### Git Hooks

```bash
pre-commit:        # Run before each commit
  - TypeScript check
  - ESLint
  - Prettier
  - Jest tests

pre-push:          # Run before each push
  - Full test suite
  - Build check
```

### Project Structure

```
src/
├── components/    # UI components
├── hooks/        # Redux-integrated hooks for todos and network
├── services/     # TodoService with offline-first operations
├── storage/      # Task storage and offline persistence
├── store/        # Redux store and slices
└── types/        # TypeScript definitions
```

### Key Implementation Details

- **Redux Integration**

  - Migrated from React state
  - Immer for immutability
  - Set middleware for loading
  - Memoized selectors
  - Optimistic updates
  - Efficient state updates

- **Task Interface**

  - Unique task ID
  - Title and completion status
  - Creation timestamp
  - Update timestamp
  - Sync status tracking

- **Offline Support**

  - AsyncStorage persistence
  - Immediate UI updates
  - Background sync queue
  - Network error recovery
  - Local state priority
  - Sync status tracking

- **Storage Architecture**

  - AsyncStorage for persistence
  - JSON serialization
  - Optimized batch operations
  - Error handling with fallbacks

- **Network State**

  - Connection type detection
  - Internet reachability
  - Last check timestamp
  - Status monitoring
  - Auto-reconnect handling

- **Type Safety**
  - Full TypeScript coverage
  - Redux state typing
  - Network state interface
  - Task type definitions
  - Strict null checks

## Planned Features

- [ ] Enhanced conflict resolution
- [ ] E2E tests with Detox
- [ ] Support for expo updates (OTA)

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Run tests and lint checks
5. Submit a PR

## License

MIT
