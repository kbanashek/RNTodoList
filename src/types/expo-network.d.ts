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
    isChecking?: boolean;
  }

  export function getNetworkStateAsync(): Promise<NetworkState>;
  export function getIpAddressAsync(): Promise<string>;
  export function getMacAddressAsync(): Promise<string>;
  export function isAirplaneModeEnabledAsync(): Promise<boolean>;
}
