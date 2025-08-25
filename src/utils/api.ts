import { Product, User, DatabaseUser, AuthCredentials, SignupData, DatabaseSchema, CoinPackage, CoinTransaction, PaymentMethod, VodafoneCashPayment } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock database - in a real app, this would be stored in a proper database
const mockDatabase: DatabaseSchema = {
  products: [
    {
      id: 1,
      name: "Luxury Chronograph Watch",
      description: "A masterpiece of Swiss engineering. Features a stainless steel case, sapphire crystal, and automatic movement.",
      image: "https://placehold.co/600x600.png",
      endTime: "2024-08-25T12:00:00.000Z",
      lowestBid: 15.52,
      lowestBidder: "UserA",
      aiHint: "luxury watch"
    },
    {
      id: 2,
      name: "Designer Leather Handbag",
      description: "Crafted from the finest Italian leather, this handbag is a symbol of elegance and style. Perfect for any occasion.",
      image: "https://placehold.co/600x600.png",
      endTime: "2024-08-24T21:00:00.000Z",
      lowestBid: 8.75,
      lowestBidder: "UserB",
      aiHint: "leather handbag"
    },
    {
      id: 3,
      name: "4K Ultra HD Drone",
      description: "Capture breathtaking aerial footage with this professional-grade drone. Features a 3-axis gimbal and 30-minute flight time.",
      image: "https://placehold.co/600x600.png",
      endTime: "2024-08-23T14:00:00.000Z",
      lowestBid: 22.03,
      lowestBidder: "UserC",
      aiHint: "camera drone"
    },
    {
      id: 4,
      name: "Vintage Electric Guitar",
      description: "A rare vintage guitar with a unique sound. A true collector's item for musicians and enthusiasts.",
      image: "https://placehold.co/600x600.png",
      endTime: "2024-08-26T09:00:00.000Z",
      lowestBid: 5.41,
      lowestBidder: "UserD",
      aiHint: "electric guitar"
    }
  ],
  users: [
    {
      id: 1,
      name: "Admin",
      email: "admin@winzo.com",
      password: "admin123",
      role: "admin",
      coins: 0
    },
    {
      id: 2,
      name: "Test User",
      email: "user@winzo.com",
      password: "user123",
      role: "user",
      coins: 5500
    },
    {
      id: 3,
      name: "User",
      email: "1",
      password: "1",
      role: "user",
      coins: 2000
    }
  ],
  coinPackages: [
    {
      id: 1,
      name: "Starter Pack",
      coins: 30,
      price: 30,
      isActive: true,
      description: "Perfect for beginners"
    },
    {
      id: 2,
      name: "Popular Pack",
      coins: 90,
      price: 90,
      originalPrice: 100,
      popular: true,
      bonus: 10,
      isActive: true,
      description: "Most popular choice - 10 bonus coins!"
    },
    {
      id: 3,
      name: "Power Pack",
      coins: 200,
      price: 200,
      originalPrice: 220,
      bonus: 20,
      isActive: true,
      description: "Great value with 20 bonus coins"
    },
    {
      id: 4,
      name: "Ultimate Pack",
      coins: 500,
      price: 500,
      originalPrice: 550,
      bonus: 50,
      isActive: true,
      description: "Maximum value - 50 bonus coins!"
    }
  ],
  coinTransactions: [
    // Test transaction to verify admin dashboard display
    {
      id: 'test-transaction-1',
      userId: 3, // User with email "1"
      packageId: 1,
      amount: 30,
      coins: 30,
      paymentMethod: 'vodafone_cash',
      paymentReference: 'WZ12345TEST',
      vodafoneNumber: '01000000000',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }
  ],
  paymentMethods: [
    {
      id: "vodafone_cash",
      name: "Vodafone Cash",
      type: "vodafone_cash",
      isActive: true,
      instructions: [
        "Open your Vodafone Cash app",
        "Select 'Send Money'",
        "Enter the Vodafone Cash number provided",
        "Enter the exact amount shown",
        "Add the reference number in the message",
        "Complete the payment",
        "Take a screenshot of the confirmation",
        "Submit the payment details below"
      ],
      accountNumbers: ["01111111111", "01222222222"]
    }
  ],
  settings: {
    vodafoneCashNumbers: [
      "01111111111",
      "01222222222"
    ],
    storeSettings: {
      isStoreEnabled: true,
      supportContact: "support@winzo.com"
    }
  }
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// AsyncStorage keys for persistence
const STORAGE_KEYS = {
  COIN_TRANSACTIONS: '@winzo_coin_transactions',
  PRODUCTS: '@winzo_products',
  COIN_PACKAGES: '@winzo_coin_packages',
  USERS: '@winzo_users',
  SETTINGS: '@winzo_settings',
  CLOUD_SYNC_TIMESTAMP: '@winzo_last_sync',
  CLOUD_DATABASE: '@winzo_cloud_database',
};

// Simulated cloud database - in a real app, this would be a remote server
// For now, we'll use a shared storage approach that syncs across all instances
let cloudDatabase: DatabaseSchema | null = null;

// Cloud database functions
const saveToCloudDatabase = async (database: DatabaseSchema): Promise<void> => {
  try {
    const cloudData = {
      ...database,
      lastUpdated: new Date().toISOString(),
      syncId: Date.now()
    };
    
    await AsyncStorage.setItem(STORAGE_KEYS.CLOUD_DATABASE, JSON.stringify(cloudData));
    await AsyncStorage.setItem(STORAGE_KEYS.CLOUD_SYNC_TIMESTAMP, cloudData.lastUpdated);
    
    cloudDatabase = database;
    console.log('🌐 Data saved to cloud database');
  } catch (error) {
    console.error('❌ Error saving to cloud database:', error);
  }
};

const loadFromCloudDatabase = async (): Promise<DatabaseSchema | null> => {
  try {
    const cloudData = await AsyncStorage.getItem(STORAGE_KEYS.CLOUD_DATABASE);
    if (cloudData) {
      const parsed = JSON.parse(cloudData);
      console.log('🌐 Data loaded from cloud database');
      return {
        products: parsed.products || [],
        users: parsed.users || [],
        coinPackages: parsed.coinPackages || [],
        coinTransactions: parsed.coinTransactions || [],
        paymentMethods: parsed.paymentMethods || [],
        settings: parsed.settings || {}
      };
    }
  } catch (error) {
    console.error('❌ Error loading from cloud database:', error);
  }
  return null;
};

const getLastSyncTimestamp = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.CLOUD_SYNC_TIMESTAMP);
  } catch (error) {
    console.error('❌ Error getting sync timestamp:', error);
    return null;
  }
};

// Sync local database with cloud database
const syncWithCloudDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Syncing with cloud database...');
    
    const cloudData = await loadFromCloudDatabase();
    if (cloudData) {
      // Update local database with cloud data
      mockDatabase.products = cloudData.products;
      mockDatabase.users = cloudData.users;
      mockDatabase.coinPackages = cloudData.coinPackages;
      mockDatabase.coinTransactions = cloudData.coinTransactions;
      mockDatabase.paymentMethods = cloudData.paymentMethods;
      mockDatabase.settings = cloudData.settings;
      
      console.log('✅ Local database synced with cloud');
      console.log('📊 Synced data:', {
        products: mockDatabase.products.length,
        users: mockDatabase.users.length,
        coinPackages: mockDatabase.coinPackages.length,
        coinTransactions: mockDatabase.coinTransactions.length
      });
    } else {
      // No cloud data exists, save current local data to cloud
      console.log('🆕 No cloud data found, initializing cloud database');
      await saveToCloudDatabase(mockDatabase);
    }
  } catch (error) {
    console.error('❌ Error syncing with cloud database:', error);
  }
};

// Database persistence functions
const saveTransactionsToStorage = async (transactions: CoinTransaction[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.COIN_TRANSACTIONS, JSON.stringify(transactions));
    console.log('Transactions saved to storage:', transactions.length);
  } catch (error) {
    console.error('Error saving transactions to storage:', error);
  }
};

const loadTransactionsFromStorage = async (): Promise<CoinTransaction[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.COIN_TRANSACTIONS);
    if (stored) {
      const transactions = JSON.parse(stored);
      console.log('Transactions loaded from storage:', transactions.length);
      return transactions;
    }
  } catch (error) {
    console.error('Error loading transactions from storage:', error);
  }
  return [];
};

// Products persistence
const saveProductsToStorage = async (products: Product[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    console.log('Products saved to storage:', products.length);
  } catch (error) {
    console.error('Error saving products to storage:', error);
  }
};

const loadProductsFromStorage = async (): Promise<Product[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (stored) {
      const products = JSON.parse(stored);
      console.log('Products loaded from storage:', products.length);
      return products;
    }
  } catch (error) {
    console.error('Error loading products from storage:', error);
  }
  return [];
};

// Coin packages persistence
const savePackagesToStorage = async (packages: CoinPackage[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.COIN_PACKAGES, JSON.stringify(packages));
    console.log('Coin packages saved to storage:', packages.length);
  } catch (error) {
    console.error('Error saving coin packages to storage:', error);
  }
};

const loadPackagesFromStorage = async (): Promise<CoinPackage[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.COIN_PACKAGES);
    if (stored) {
      const packages = JSON.parse(stored);
      console.log('Coin packages loaded from storage:', packages.length);
      return packages;
    }
  } catch (error) {
    console.error('Error loading coin packages from storage:', error);
  }
  return [];
};

// Users persistence
const saveUsersToStorage = async (users: DatabaseUser[]) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    console.log('Users saved to storage:', users.length);
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
};

const loadUsersFromStorage = async (): Promise<DatabaseUser[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    if (stored) {
      const users = JSON.parse(stored);
      console.log('Users loaded from storage:', users.length);
      return users;
    }
  } catch (error) {
    console.error('Error loading users from storage:', error);
  }
  return [];
};

// Settings persistence
const saveSettingsToStorage = async (settings: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    console.log('Settings saved to storage');
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

const loadSettingsFromStorage = async (): Promise<any> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      const settings = JSON.parse(stored);
      console.log('Settings loaded from storage');
      return settings;
    }
  } catch (error) {
    console.error('Error loading settings from storage:', error);
  }
  return null;
};

// Track initialization to prevent multiple calls
let isInitializing = false;
let isInitialized = false;

// Initialize all data from storage with cloud sync
const initializeDatabase = async () => {
  if (isInitializing || isInitialized) {
    console.log('Database already initializing or initialized, skipping...');
    return;
  }
  
  isInitializing = true;
  console.log('🚀 Initializing database with cloud sync...');
  
  try {
    // First, try to sync with cloud database
    await syncWithCloudDatabase();
    
    console.log('✅ Database initialization complete with cloud sync');
    console.log('📊 Final data counts:', {
      products: mockDatabase.products.length,
      users: mockDatabase.users.length,
      coinPackages: mockDatabase.coinPackages.length,
      coinTransactions: mockDatabase.coinTransactions.length
    });
    console.log('💰 Transaction statuses:', mockDatabase.coinTransactions.map(t => ({ id: t.id, status: t.status })));
    
    isInitialized = true;
  } catch (error) {
    console.error('❌ Error during database initialization:', error);
    // Fallback to local storage if cloud sync fails
    console.log('🔄 Falling back to local storage...');
    await initializeDatabaseLocal();
  } finally {
    isInitializing = false;
  }
};

// Fallback local initialization
const initializeDatabaseLocal = async () => {
  try {
    const storedTransactions = await loadTransactionsFromStorage();
    if (storedTransactions.length > 0) {
      mockDatabase.coinTransactions = storedTransactions;
      console.log('📱 Initialized with local transactions:', storedTransactions.length);
    } else {
      await saveTransactionsToStorage(mockDatabase.coinTransactions);
    }
    
    const storedProducts = await loadProductsFromStorage();
    if (storedProducts.length > 0) {
      mockDatabase.products = storedProducts;
    } else {
      await saveProductsToStorage(mockDatabase.products);
    }
    
    const storedPackages = await loadPackagesFromStorage();
    if (storedPackages.length > 0) {
      mockDatabase.coinPackages = storedPackages;
    } else {
      await savePackagesToStorage(mockDatabase.coinPackages);
    }
    
    const storedUsers = await loadUsersFromStorage();
    if (storedUsers.length > 0) {
      mockDatabase.users = storedUsers;
    } else {
      await saveUsersToStorage(mockDatabase.users);
    }
    
    const storedSettings = await loadSettingsFromStorage();
    if (storedSettings) {
      mockDatabase.settings = storedSettings;
    } else {
      await saveSettingsToStorage(mockDatabase.settings);
    }
    
    console.log('📱 Local database initialization complete');
  } catch (error) {
    console.error('❌ Error in local database initialization:', error);
  }
};

// Initialize on module load
initializeDatabase();

// API functions
export const fetchProducts = async (): Promise<Product[]> => {
  await delay(500); // Simulate network delay
  
  // Sync with cloud database first to get latest data
  await syncWithCloudDatabase();
  
  return mockDatabase.products.map(p => ({
    ...p,
    endTime: new Date(p.endTime)
  }));
};

export const fetchUsers = async (): Promise<User[]> => {
  await delay(300);
  
  // Sync with cloud database first to get latest data
  await syncWithCloudDatabase();
  
  // Return users without password fields for security
  return mockDatabase.users.map(({ password, ...user }) => user);
};

export const loginUser = async (credentials: AuthCredentials): Promise<User> => {
  await delay(800);
  
  const user = mockDatabase.users.find(u => u.email === credentials.email);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  if (credentials.password !== user.password) {
    throw new Error('Invalid email or password');
  }
  
  // Return user without password field for security
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const signupUser = async (data: SignupData): Promise<User> => {
  await delay(1000);
  
  // Check if email already exists
  const existingUser = mockDatabase.users.find(u => u.email === data.email);
  if (existingUser) {
    throw new Error('Email already exists');
  }
  
  const newUserWithPassword: DatabaseUser = {
    id: Date.now(),
    name: data.name,
    email: data.email,
    password: data.password,
    role: 'user',
    coins: 1000 // Starting coins
  };
  
  mockDatabase.users.push(newUserWithPassword);
  
  // Save to persistent storage and cloud
  await saveUsersToStorage(mockDatabase.users);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 New user created and saved to storage and cloud:', newUserWithPassword.name);
  
  // Return user without password field for security
  const { password, ...newUser } = newUserWithPassword;
  return newUser;
};

export const addProduct = async (productData: Omit<Product, 'id'>): Promise<Product> => {
  await delay(600);
  
  const newProduct: Product = {
    ...productData,
    id: Date.now(),
    endTime: new Date(productData.endTime)
  };
  
  mockDatabase.products.push(newProduct);
  
  // Save to persistent storage and cloud
  await saveProductsToStorage(mockDatabase.products);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 New product added and saved to storage and cloud:', newProduct.name);
  
  return newProduct;
};

export const grantCoinsToUser = async (userId: number, coins: number): Promise<User> => {
  await delay(400);
  
  const user = mockDatabase.users.find(u => u.id === userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  user.coins += coins;
  return user;
};

// Mock bid functions - in a real app, this would handle actual bidding logic
export const getMockBids = (products: Product[], userId: number) => {
  if (products.length < 2) return [];
  
  return [
    {
      ...products[0],
      userBid: 1.25,
      status: 'Outbid' as const,
    },
    {
      ...products[1],
      userBid: 0.99,
      status: 'Lowest Bidder' as const,
    },
  ];
};

// Coin Store API Functions
export const fetchCoinPackages = async (): Promise<CoinPackage[]> => {
  await delay(300);
  return mockDatabase.coinPackages.filter(pkg => pkg.isActive);
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  await delay(200);
  return mockDatabase.paymentMethods.filter(method => method.isActive);
};

export const createCoinTransaction = async (transaction: Omit<CoinTransaction, 'id' | 'createdAt'>): Promise<CoinTransaction> => {
  await delay(500);
  
  const newTransaction: CoinTransaction = {
    ...transaction,
    id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'pending'
  };
  
  console.log('=== CREATING NEW TRANSACTION ===');
  console.log('Transaction data:', newTransaction);
  console.log('Status set to:', newTransaction.status, '(type:', typeof newTransaction.status, ')');
  
  mockDatabase.coinTransactions.push(newTransaction);
  console.log('Created new transaction:', newTransaction.id, 'for user:', newTransaction.userId);
  console.log('Total transactions now:', mockDatabase.coinTransactions.length);
  console.log('All transaction statuses after creation:', mockDatabase.coinTransactions.map(t => ({ id: t.id, status: t.status })));
  
  // Save to persistent storage and cloud
  await saveTransactionsToStorage(mockDatabase.coinTransactions);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 Transaction saved to storage and cloud');
  console.log('=== END TRANSACTION CREATION ===');
  
  return newTransaction;
};

export const submitVodafonePayment = async (payment: VodafoneCashPayment, transactionId: string): Promise<CoinTransaction> => {
  await delay(800);
  
  const transaction = mockDatabase.coinTransactions.find(t => t.id === transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  // Update transaction with payment details
  transaction.vodafoneNumber = payment.senderNumber;
  transaction.paymentReference = payment.reference;
  transaction.paymentScreenshot = payment.paymentScreenshot;
  transaction.screenshotFileName = payment.screenshotFileName;
  transaction.status = 'pending'; // Waiting for admin verification
  
  console.log('Updated transaction with payment details:', transaction.id, 'status:', transaction.status);
  console.log('Transaction after update:', { id: transaction.id, status: transaction.status, userId: transaction.userId });
  
  // Save to persistent storage and cloud
  await saveTransactionsToStorage(mockDatabase.coinTransactions);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 Payment details saved to storage and cloud');
  
  return transaction;
};

// Admin Store Management API Functions
export const fetchAllCoinPackages = async (): Promise<CoinPackage[]> => {
  await delay(300);
  
  // Sync with cloud database first to get latest data
  await syncWithCloudDatabase();
  
  return mockDatabase.coinPackages;
};

export const addCoinPackage = async (packageData: Omit<CoinPackage, 'id'>): Promise<CoinPackage> => {
  await delay(400);
  
  const newPackage: CoinPackage = {
    ...packageData,
    id: Date.now() // Simple ID generation
  };
  
  mockDatabase.coinPackages.push(newPackage);
  
  // Save to persistent storage and cloud
  await savePackagesToStorage(mockDatabase.coinPackages);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 New coin package added and saved to storage and cloud:', newPackage.name);
  
  return newPackage;
};

// Alias for addCoinPackage to maintain backward compatibility
export const createCoinPackage = async (packageData: Omit<CoinPackage, 'id'>): Promise<CoinPackage> => {
  return await addCoinPackage(packageData);
};

export const updateCoinPackage = async (id: number, updates: Partial<CoinPackage>): Promise<CoinPackage> => {
  await delay(400);
  
  const packageIndex = mockDatabase.coinPackages.findIndex(pkg => pkg.id === id);
  if (packageIndex === -1) {
    throw new Error('Package not found');
  }
  
  mockDatabase.coinPackages[packageIndex] = {
    ...mockDatabase.coinPackages[packageIndex],
    ...updates
  };
  
  // Save to persistent storage and cloud
  await savePackagesToStorage(mockDatabase.coinPackages);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 Coin package updated and saved to storage and cloud:', mockDatabase.coinPackages[packageIndex].name);
  
  return mockDatabase.coinPackages[packageIndex];
};

export const deleteCoinPackage = async (id: number): Promise<void> => {
  await delay(300);
  
  const packageIndex = mockDatabase.coinPackages.findIndex(pkg => pkg.id === id);
  if (packageIndex === -1) {
    throw new Error('Package not found');
  }
  
  const deletedPackage = mockDatabase.coinPackages[packageIndex];
  mockDatabase.coinPackages.splice(packageIndex, 1);
  
  // Save to persistent storage and cloud
  await savePackagesToStorage(mockDatabase.coinPackages);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 Coin package deleted and saved to storage and cloud:', deletedPackage.name);
};

// Admin Payment Management API Functions
export const fetchPendingTransactions = async (): Promise<CoinTransaction[]> => {
  await delay(400);
  
  // Sync with cloud database first to get latest data
  await syncWithCloudDatabase();
  
  console.log('=== FETCH PENDING TRANSACTIONS DEBUG ===');
  console.log('All transactions in DB:', mockDatabase.coinTransactions.length);
  console.log('Full transaction details:', mockDatabase.coinTransactions.map(t => ({ 
    id: t.id, 
    status: t.status, 
    userId: t.userId,
    amount: t.amount,
    paymentMethod: t.paymentMethod,
    createdAt: t.createdAt
  })));
  
  const pendingTransactions = mockDatabase.coinTransactions.filter(t => {
    console.log(`Transaction ${t.id}: status="${t.status}" (type: ${typeof t.status})`);
    return t.status === 'pending';
  });
  
  console.log('🔍 Pending transactions found:', pendingTransactions.length);
  console.log('📋 Pending transaction IDs:', pendingTransactions.map(t => t.id));
  console.log('=== END DEBUG ===');
  
  return pendingTransactions;
};

export const fetchAllTransactions = async (): Promise<CoinTransaction[]> => {
  await delay(500);
  
  // Sync with cloud database first to get latest data
  await syncWithCloudDatabase();
  
  const allTransactions = mockDatabase.coinTransactions.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  console.log('🌐 Fetching all transactions from cloud:', allTransactions.length, 'found');
  return allTransactions;
};

export const verifyTransaction = async (
  transactionId: string, 
  verified: boolean, 
  adminId: number, 
  notes?: string
): Promise<CoinTransaction> => {
  await delay(600);
  
  const transaction = mockDatabase.coinTransactions.find(t => t.id === transactionId);
  if (!transaction) {
    throw new Error('Transaction not found');
  }
  
  transaction.status = verified ? 'completed' : 'failed';
  transaction.completedAt = new Date().toISOString();
  transaction.adminNotes = notes;
  
  // If verified, add coins to user
  if (verified) {
    const user = mockDatabase.users.find(u => u.id === transaction.userId);
    if (user) {
      user.coins += transaction.coins;
      console.log('💰 Updated user coins:', user.coins);
    }
  }
  
  // Save to persistent storage and cloud
  await saveTransactionsToStorage(mockDatabase.coinTransactions);
  await saveUsersToStorage(mockDatabase.users);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 Transaction verification saved to storage and cloud');
  
  return transaction;
};

export const updateVodafoneNumbers = async (numbers: string[]): Promise<string[]> => {
  await delay(300);
  
  mockDatabase.settings.vodafoneCashNumbers = numbers;
  mockDatabase.paymentMethods[0].accountNumbers = numbers; // Update payment method too
  
  // Save to persistent storage and cloud
  await saveSettingsToStorage(mockDatabase.settings);
  await saveToCloudDatabase(mockDatabase);
  console.log('💾 Vodafone numbers updated and saved to storage and cloud');
  
  return numbers;
};

export const fetchVodafoneNumbers = async (): Promise<string[]> => {
  await delay(200);
  
  // Ensure we have the latest settings from storage
  const storedSettings = await loadSettingsFromStorage();
  if (storedSettings) {
    mockDatabase.settings = storedSettings;
  }
  
  return mockDatabase.settings.vodafoneCashNumbers;
};

// Development/Testing function to clear all stored data
export const clearAllStoredData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.COIN_TRANSACTIONS,
      STORAGE_KEYS.PRODUCTS,
      STORAGE_KEYS.COIN_PACKAGES,
      STORAGE_KEYS.USERS,
      STORAGE_KEYS.SETTINGS,
    ]);
    console.log('All stored data cleared');
  } catch (error) {
    console.error('Error clearing stored data:', error);
  }
};

// Development/Testing function to check what's in storage
export const debugStorageContents = async (): Promise<void> => {
  try {
    console.log('=== STORAGE DEBUG ===');
    const transactions = await AsyncStorage.getItem(STORAGE_KEYS.COIN_TRANSACTIONS);
    console.log('Raw transactions in storage:', transactions);
    if (transactions) {
      const parsed = JSON.parse(transactions);
      console.log('Parsed transactions:', parsed);
      console.log('Transaction count in storage:', parsed.length);
      console.log('Transaction statuses in storage:', parsed.map((t: any) => ({ id: t.id, status: t.status })));
    }
    console.log('Current mockDatabase transactions:', mockDatabase.coinTransactions.length);
    console.log('=== END STORAGE DEBUG ===');
  } catch (error) {
    console.error('Error checking storage:', error);
  }
};

// Development/Testing function to create a test transaction
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

// Manual sync function for testing/debugging
export const forceCloudSync = async (): Promise<void> => {
  console.log('🔄 Forcing cloud sync...');
  await syncWithCloudDatabase();
  console.log('✅ Cloud sync completed');
};
