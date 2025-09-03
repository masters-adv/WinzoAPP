import { 
  Product, 
  User, 
  AuthCredentials, 
  SignupData, 
  CoinPackage, 
  CoinTransaction, 
  PaymentMethod, 
  VodafoneCashPayment,
  Bid
} from '../types';

import {
  AuthService,
  ProductService,
  UserService,
  BidService,
  CoinPackageService,
  TransactionService,
  PaymentMethodService,
  SettingsService
} from '../services/database';

import { initializeDatabase, testConnection, forceReinitializeDatabase } from '../config/database';

// Initialize database on module load
let isInitialized = false;

const initializeApp = async () => {
  if (isInitialized) return;
  
  try {
    console.log('🚀 Initializing WinZO database...');
    
    // Test AsyncStorage connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to AsyncStorage');
    }

    // Initialize database (preserves existing data)
    await initializeDatabase();
    
    isInitialized = true;
    console.log('✅ WinZO database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Initialize on module load
initializeApp().catch(console.error);

// Simulate API delay for consistency with original app behavior
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication API Functions
export const loginUser = async (credentials: AuthCredentials): Promise<User> => {
  await delay(800);
  try {
    const { user, token } = await AuthService.loginUser(credentials);
    
    // Store the JWT token for future requests
    const { storeAuthToken } = await import('./storage');
    await storeAuthToken(token);
    
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signupUser = async (data: SignupData): Promise<User> => {
  await delay(1000);
  try {
    const { user, token } = await AuthService.signupUser(data);
    
    // Store the JWT token for future requests
    const { storeAuthToken } = await import('./storage');
    await storeAuthToken(token);
    
    return user;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// Product API Functions
export const fetchProducts = async (): Promise<Product[]> => {
  await delay(500);
  return await ProductService.fetchProducts();
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  await delay(600);
  return await ProductService.addProduct(productData);
};

// User API Functions
export const fetchUsers = async (): Promise<User[]> => {
  await delay(300);
  return await UserService.fetchUsers();
};

export const grantCoinsToUser = async (userId: number, coins: number): Promise<User> => {
  await delay(400);
  return await UserService.grantCoinsToUser(userId, coins);
};

// Bid API Functions
export const getMockBids = async (products: Product[], userId: number): Promise<Bid[]> => {
  await delay(300);
  return await BidService.getMockBids(products, userId);
};

// Coin Store API Functions
export const fetchCoinPackages = async (): Promise<CoinPackage[]> => {
  await delay(300);
  return await CoinPackageService.fetchCoinPackages();
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  await delay(200);
  return await PaymentMethodService.fetchPaymentMethods();
};

export const createCoinTransaction = async (transaction: Omit<CoinTransaction, 'id' | 'createdAt'>): Promise<CoinTransaction> => {
  await delay(500);
  return await TransactionService.createCoinTransaction(transaction);
};

export const submitVodafonePayment = async (payment: VodafoneCashPayment, transactionId: string): Promise<CoinTransaction> => {
  await delay(800);
  return await TransactionService.submitVodafonePayment(payment, transactionId);
};

// Admin Store Management API Functions
export const fetchAllCoinPackages = async (): Promise<CoinPackage[]> => {
  await delay(300);
  return await CoinPackageService.fetchAllCoinPackages();
};

export const addCoinPackage = async (packageData: Omit<CoinPackage, 'id'>): Promise<CoinPackage> => {
  await delay(400);
  return await CoinPackageService.addCoinPackage(packageData);
};

// Alias for addCoinPackage to maintain backward compatibility
export const createCoinPackage = async (packageData: Omit<CoinPackage, 'id'>): Promise<CoinPackage> => {
  return await addCoinPackage(packageData);
};

export const updateCoinPackage = async (id: number, updates: Partial<CoinPackage>): Promise<CoinPackage> => {
  await delay(400);
  return await CoinPackageService.updateCoinPackage(id, updates);
};

export const deleteCoinPackage = async (id: number): Promise<void> => {
  await delay(300);
  return await CoinPackageService.deleteCoinPackage(id);
};

// Admin Payment Management API Functions
export const fetchPendingTransactions = async (): Promise<CoinTransaction[]> => {
  await delay(400);
  return await TransactionService.fetchPendingTransactions();
};

export const fetchAllTransactions = async (): Promise<CoinTransaction[]> => {
  await delay(500);
  return await TransactionService.fetchAllTransactions();
};

export const verifyTransaction = async (
  transactionId: string, 
  verified: boolean, 
  adminId: number, 
  notes?: string
): Promise<CoinTransaction> => {
  await delay(600);
  return await TransactionService.verifyTransaction(transactionId, verified, adminId, notes);
};

// Settings API Functions
export const updateVodafoneNumbers = async (numbers: string[]): Promise<string[]> => {
  await delay(300);
  return await SettingsService.updateVodafoneNumbers(numbers);
};

export const fetchVodafoneNumbers = async (): Promise<string[]> => {
  await delay(200);
  return await SettingsService.fetchVodafoneNumbers();
};

// Development/Testing functions (kept for backward compatibility but now work with AsyncStorage)
export const clearAllStoredData = async (): Promise<void> => {
  console.warn('clearAllStoredData: This function is deprecated with AsyncStorage integration');
  // Could implement database reset functionality here if needed
};

export const debugStorageContents = async (): Promise<void> => {
  console.log('=== ASYNCSTORAGE DATABASE DEBUG ===');
  try {
    const products = await fetchProducts();
    const users = await fetchUsers();
    const transactions = await fetchAllTransactions();
    const packages = await fetchAllCoinPackages();
    
    console.log('Products:', products.length);
    console.log('Users:', users.length);
    console.log('Transactions:', transactions.length);
    console.log('Packages:', packages.length);
    console.log('Transaction statuses:', transactions.map(t => ({ id: t.id, status: t.status })));
  } catch (error) {
    console.error('Error debugging database:', error);
  }
  console.log('=== END DATABASE DEBUG ===');
};

export const createTestTransaction = async (): Promise<CoinTransaction> => {
  console.log('Creating test transaction...');
  
  const testTransaction = await createCoinTransaction({
    userId: 3, // User "1"
    packageId: 1,
    amount: 30,
    coins: 30,
    paymentMethod: 'vodafone_cash',
    paymentReference: `TEST_${Date.now()}`,
    status: 'pending' as const
  });
  
  console.log('Test transaction created:', testTransaction.id);
  await debugStorageContents();
  
  return testTransaction;
};

// Manual sync function (kept for backward compatibility)
export const forceCloudSync = async (): Promise<void> => {
  console.log('🔄 AsyncStorage database is always in sync...');
  console.log('✅ Sync completed (no action needed with AsyncStorage)');
};

// Export database initialization function for manual use
export const initializeDatabaseManually = initializeApp;