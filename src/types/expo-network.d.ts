declare module 'expo-network' {
  export enum NetworkStateType {
    NONE = 'NONE',
    WIFI = 'WIFI',
    CELLULAR = 'CELLULAR',
    BLUETOOTH = 'BLUETOOTH',
    ETHERNET = 'ETHERNET',
    VPN = 'VPN',
    OTHER = 'OTHER',
    UNKNOWN = 'UNKNOWN'
  }

  export interface NetworkState {
    type: NetworkStateType;
    isConnected: boolean;
    isInternetReachable: boolean;
  }

  export function getNetworkStateAsync(): Promise<NetworkState>;
}
