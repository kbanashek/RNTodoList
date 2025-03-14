import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import Tasks from './src/screens/Tasks';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <Tasks />
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
}
