import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Tasks } from './src/screens/Tasks';
import { store } from './src/store';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121212',
    surface: '#1e1e1e',
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ReduxProvider store={store}>
          <PaperProvider theme={theme}>
            <Tasks />
          </PaperProvider>
        </ReduxProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
