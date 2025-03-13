import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import {
  Provider as PaperProvider,
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";
import { Provider as StoreProvider } from "react-redux";
import { store } from "./src/store/store";
import Tasks from "./src/screens/Tasks";

const theme = {
  ...MD3DarkTheme,
  roundness: 8,
};

const App = () => {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaView style={styles.container}>
          <Tasks />
        </SafeAreaView>
      </PaperProvider>
    </StoreProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default App;
