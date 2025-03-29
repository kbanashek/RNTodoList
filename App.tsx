import React from 'react';
import { StatusBar } from 'react-native';
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Todos } from './src/screens/Todos';
import { NetworkStatusBar } from './src/components/NetworkStatusBar';
import { store } from './src/store';
import { en, registerTranslation } from 'react-native-paper-dates';

// Register translations for react-native-paper-dates
registerTranslation('en', en);

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
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#121212' }}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <ReduxProvider store={store}>
          <PaperProvider theme={theme}>
            <NetworkStatusBar />
            <Todos />
          </PaperProvider>
        </ReduxProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
