import AsyncStorage from '@react-native-async-storage/async-storage';
import { CoinTransaction } from '../types';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  coins: number;
}

// Storage keys
const STORAGE_KEYS = {
  USER_ID: '@winzo:userId',
  USER_ROLE: '@winzo:userRole',
  USER_NAME: '@winzo:userName',
  USER_COINS: '@winzo:userCoins',
  USER_EMAIL: '@winzo:userEmail',
  PENDING_TRANSACTIONS: '@winzo:pendingTransactions',
  TRANSACTION_HISTORY: '@winzo:transactionHistory',
};

// User storage functions
export const storeUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.USER_ID, user.id.toString()],
      [STORAGE_KEYS.USER_ROLE, user.role],
      [STORAGE_KEYS.USER_NAME, user.name],
      [STORAGE_KEYS.USER_COINS, user.coins.toString()],
      [STORAGE_KEYS.USER_EMAIL, user.email],
    ]);
  } catch (error) {
    console.error('Error storing user data:', error);
  }
};

export const getUserRole = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

export const getUserId = async (): Promise<number | null> => {
  try {
    const id = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    return id ? parseInt(id, 10) : null;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const getUserName = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_NAME);
  } catch (error) {
    console.error('Error getting user name:', error);
    return null;
  }
};

export const getUserCoins = async (): Promise<number> => {
  try {
    const coins = await AsyncStorage.getItem(STORAGE_KEYS.USER_COINS);
    return coins ? parseInt(coins, 10) : 0;
  } catch (error) {
    console.error('Error getting user coins:', error);
    return 0;
  }
};

export const updateUserCoins = async (newCoins: number): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_COINS, newCoins.toString());
  } catch (error) {
    console.error('Error updating user coins:', error);
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error('Error clearing user data:', error);
  }
};

export const getFullUserData = async (): Promise<Partial<User> | null> => {
  try {
    const keys = Object.values(STORAGE_KEYS).filter(key => !key.includes('TRANSACTIONS'));
    const values = await AsyncStorage.multiGet(keys);
    
    const userData: any = {};
    values.forEach(([key, value]) => {
      if (value) {
        switch (key) {
          case STORAGE_KEYS.USER_ID:
            userData.id = parseInt(value, 10);
            break;
          case STORAGE_KEYS.USER_ROLE:
            userData.role = value;
            break;
          case STORAGE_KEYS.USER_NAME:
            userData.name = value;
            break;
          case STORAGE_KEYS.USER_COINS:
            userData.coins = parseInt(value, 10);
            break;
          case STORAGE_KEYS.USER_EMAIL:
            userData.email = value;
            break;
        }
      }
    });

    return Object.keys(userData).length > 0 ? userData : null;
  } catch (error) {
    console.error('Error getting full user data:', error);
    return null;
  }
};

// Coin transaction storage functions
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

