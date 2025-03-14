/**
 * Utility function to create a delay in async operations
 * @param ms - The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
