import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as StoreProvider } from 'react-redux';
import { store } from './src/store';
import Tasks from './src/screens/Tasks';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF',
    secondary: '#666666',
    error: '#FF3B30',
    outline: '#DDDDDD',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    onSurface: '#000000',
  },
  roundness: 8,
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={store}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'right', 'left']}>
              <Tasks />
            </SafeAreaView>
          </SafeAreaProvider>
        </PaperProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
};

export default App;
