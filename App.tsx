import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { store } from './src/store/index';
import { Tasks } from './src/screens/Tasks';

const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#121212',
    surface: '#1e1e1e',
  },
};

export const App: React.FC = () => {
  return (
    <ReduxProvider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <StatusBar barStyle="light-content" />
          <SafeAreaView style={{ flex: 1 }}>
            <Tasks />
          </SafeAreaView>
        </SafeAreaProvider>
      </PaperProvider>
    </ReduxProvider>
  );
};

export default App;
