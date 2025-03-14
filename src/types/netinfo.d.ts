declare module '@react-native-community/netinfo' {
  export interface NetInfoState {
    isConnected: boolean | null;
    isInternetReachable: boolean | null;
    type: string;
    [key: string]: any;
  }

  export interface NetInfo {
    fetch(): Promise<NetInfoState>;
    addEventListener(callback: (state: NetInfoState) => void): () => void;
  }

  const NetInfo: NetInfo;
  export default NetInfo;
}
