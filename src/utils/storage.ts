import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, UserService } from '../services/database';
import { CoinTransaction } from '../types';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  coins: number;
}

// Storage keys (now primarily used for JWT token and temporary data)
const STORAGE_KEYS = {
  AUTH_TOKEN: '@winzo:authToken',
  PENDING_TRANSACTIONS: '@winzo:pendingTransactions',
  TRANSACTION_HISTORY: '@winzo:transactionHistory',
};

// Authentication token management
export const storeAuthToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  } catch (error) {
    console.error('Error storing auth token:', error);
  }
};

export const getAuthToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const clearAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch (error) {
    console.error('Error clearing auth token:', error);
  }
};

// User data functions (now fetched from AsyncStorage-based mock database)
export const storeUser = async (user: User): Promise<void> => {
  // This function is kept for backward compatibility
  // User data is now managed in AsyncStorage mock database
  console.log('User stored in database:', user.name);
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return null;
    }

    return await AuthService.verifyToken(token);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const getUserRole = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.role || null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const getUserId = async (): Promise<number | null> => {
  try {
    const user = await getCurrentUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const getUserName = async (): Promise<string | null> => {
  try {
    const user = await getCurrentUser();
    return user?.name || null;
  } catch (error) {
    console.error('Error getting user name:', error);
    return null;
  }
};

export const getUserCoins = async (): Promise<number> => {
  try {
    const user = await getCurrentUser();
    return user?.coins || 0;
  } catch (error) {
    console.error('Error getting user coins:', error);
    return 0;
  }
};

export const updateUserCoins = async (newCoins: number): Promise<void> => {
  try {
    const user = await getCurrentUser();
    if (user) {
      await UserService.updateUserCoins(user.id, newCoins);
    }
  } catch (error) {
    console.error('Error updating user coins:', error);
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await clearAuthToken();
    await clearTransactionData();
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export const getFullUserData = async (): Promise<Partial<User> | null> => {
  try {
    return await getCurrentUser();
  } catch (error) {
    console.error('Error getting full user data:', error);
    return null;
  }
};

// Transaction storage functions (kept for offline functionality)
export const storePendingTransaction = async (transaction: CoinTransaction): Promise<void> => {
  try {
    const existingTransactions = await getPendingTransactions();
    const updatedTransactions = [...existingTransactions, transaction];
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error storing pending transaction:', error);
  }
};

export const getPendingTransactions = async (): Promise<CoinTransaction[]> => {
  try {
    const transactions = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
  } catch (error) {
    console.error('Error getting pending transactions:', error);
    return [];
  }
};

export const removePendingTransaction = async (transactionId: string): Promise<void> => {
  try {
    const existingTransactions = await getPendingTransactions();
    const updatedTransactions = existingTransactions.filter(t => t.id !== transactionId);
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_TRANSACTIONS, JSON.stringify(updatedTransactions));
  } catch (error) {
    console.error('Error removing pending transaction:', error);
  }
};

export const storeTransactionHistory = async (transaction: CoinTransaction): Promise<void> => {
  try {
    const existingHistory = await getTransactionHistory();
    const updatedHistory = [transaction, ...existingHistory].slice(0, 50); // Keep last 50 transactions
    await AsyncStorage.setItem(STORAGE_KEYS.TRANSACTION_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Error storing transaction history:', error);
  }
};

export const getTransactionHistory = async (): Promise<CoinTransaction[]> => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.TRANSACTION_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting transaction history:', error);
    return [];
  }
};

export const clearTransactionData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PENDING_TRANSACTIONS,
      STORAGE_KEYS.TRANSACTION_HISTORY,
    ]);
  } catch (error) {
    console.error('Error clearing transaction data:', error);
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Utility function to check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};