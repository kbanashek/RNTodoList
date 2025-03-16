export const NETWORK_CONFIG = {
  POLLING_INTERVALS: {
    ONLINE: 30000,
    OFFLINE: 5000
  },
  RETRY: {
    MAX_ATTEMPTS: 3,
    BASE_DELAY: 1000
  }
} as const;
