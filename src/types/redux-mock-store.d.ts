declare module 'redux-mock-store' {
  import { AnyAction, Store } from 'redux';
  
  type MockStoreCreator<T> = (state?: T) => MockStore<T>;
  
  interface MockStore<T = any> extends Store<T> {
    getActions(): AnyAction[];
    clearActions(): void;
  }
  
  export default function configureStore<T = any>(middlewares?: any[]): MockStoreCreator<T>;
}
