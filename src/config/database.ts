import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseUser, Product, CoinPackage, CoinTransaction, PaymentMethod } from '../types';

// Mock database using AsyncStorage for React Native compatibility
export class MockDatabase {
  private static readonly KEYS = {
    USERS: 'winzo_users',
    PRODUCTS: 'winzo_products',
    COIN_PACKAGES: 'winzo_coin_packages',
    TRANSACTIONS: 'winzo_transactions',
    PAYMENT_METHODS: 'winzo_payment_methods',
    SETTINGS: 'winzo_settings',
    INITIALIZED: 'winzo_initialized'
  };

  static async getUsers(): Promise<DatabaseUser[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  }

  static async saveUsers(users: DatabaseUser[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  static async getProducts(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PRODUCTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  static async saveProducts(products: Product[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    } catch (error) {
      console.error('Error saving products:', error);
    }
  }

  static async getCoinPackages(): Promise<CoinPackage[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.COIN_PACKAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting coin packages:', error);
      return [];
    }
  }

  static async saveCoinPackages(packages: CoinPackage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.COIN_PACKAGES, JSON.stringify(packages));
    } catch (error) {
      console.error('Error saving coin packages:', error);
    }
  }

  static async getTransactions(): Promise<CoinTransaction[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  static async saveTransactions(transactions: CoinTransaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  }

  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.PAYMENT_METHODS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting payment methods:', error);
      return [];
    }
  }

  static async savePaymentMethods(methods: PaymentMethod[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.PAYMENT_METHODS, JSON.stringify(methods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  }

  static async getSettings(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  static async saveSettings(settings: any): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  static async isInitialized(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.INITIALIZED);
      return data === 'true';
    } catch (error) {
      return false;
    }
  }

  static async setInitialized(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.INITIALIZED, 'true');
    } catch (error) {
      console.error('Error setting initialized flag:', error);
    }
  }

  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.KEYS));
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  }
}

// Test database connection (mock)
export const testConnection = async (): Promise<boolean> => {
  try {
    // Test AsyncStorage availability
    await AsyncStorage.setItem('test_key', 'test_value');
    await AsyncStorage.removeItem('test_key');
    console.log('✅ AsyncStorage connected successfully');
    return true;
  } catch (error) {
    console.error('❌ AsyncStorage connection failed:', error);
    return false;
  }
};

// Initialize database with sample data
export const initializeDatabase = async (): Promise<void> => {
  try {
    const isInitialized = await MockDatabase.isInitialized();
    if (isInitialized) {
      console.log('📱 Database already initialized');
      return;
    }

    console.log('🚀 Initializing mock database...');
    await seedDatabase();
    await MockDatabase.setInitialized();
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Temporary function to force re-initialization with fixed passwords
export const forceReinitializeDatabase = async (): Promise<void> => {
  try {
    console.log('🚀 Force re-initializing mock database with fixed passwords...');
    await MockDatabase.clearAll();
    await seedDatabase();
    await MockDatabase.setInitialized();
    console.log('✅ Database re-initialized successfully with fixed passwords');
  } catch (error) {
    console.error('❌ Database re-initialization failed:', error);
    throw error;
  }
};

// Seed database with sample data
export const seedDatabase = async (): Promise<void> => {
  try {
    // Import crypto for password hashing
    const Crypto = require('expo-crypto');
    
    // Helper function to hash passwords with fixed salt for consistency
    const hashPasswordWithFixedSalt = async (password: string, fixedSalt: string): Promise<string> => {
      const hashedPassword = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password + fixedSalt
      );
      return `${fixedSalt}:${hashedPassword}`;
    };

    // Sample users with consistently hashed passwords using fixed salts
    const users: DatabaseUser[] = [
      {
        id: 1,
        name: 'Admin User',
        email: 'admin@winzo.com',
        password: await hashPasswordWithFixedSalt('admin123', 'adminsalt123'),
        role: 'admin',
        coins: 10000
      },
      {
        id: 2,
        name: 'Test User',
        email: 'user@winzo.com',
        password: await hashPasswordWithFixedSalt('user123', 'usersalt123'),
        role: 'user',
        coins: 5500
      },
      {
        id: 3,
        name: 'Quick User',
        email: '1',
        password: await hashPasswordWithFixedSalt('1', 'quicksalt123'),
        role: 'user',
        coins: 2000
      }
    ];

    // Sample products with diverse auction items
    const products: Product[] = [
      {
        id: 1,
        name: 'iPhone 15 Pro Max',
        description: 'Latest iPhone with 256GB storage, Titanium finish',
        image: 'https://via.placeholder.com/300x200/1a1a1a/FFD700?text=iPhone+15+Pro+Max',
        endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now - LIVE
        lowestBid: 45,
        lowestBidder: 'user@test.com',
        aiHint: 'Hot item! Consider bidding between 40-50 coins for optimal chances'
      },
      {
        id: 2,
        name: 'MacBook Pro M3',
        description: 'MacBook Pro with M3 chip, 16GB RAM, 512GB SSD',
        image: 'https://via.placeholder.com/300x200/2c2c2c/FFD700?text=MacBook+Pro+M3',
        endTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
        lowestBid: 120,
        lowestBidder: 'admin@winzo.com',
        aiHint: 'Premium item, consider strategic bidding around 115-125 coins'
      },
      {
        id: 3,
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Latest Samsung flagship with S Pen, 256GB',
        image: 'https://via.placeholder.com/300x200/1e3a8a/FFD700?text=Galaxy+S24+Ultra',
        endTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now - ENDING SOON
        lowestBid: 38,
        lowestBidder: 'quickuser@test.com',
        aiHint: 'Ending soon! Last chance to bid around 35-40 coins'
      },
      {
        id: 4,
        name: 'PlayStation 5',
        description: 'Sony PS5 Console with DualSense controller',
        image: 'https://via.placeholder.com/300x200/003087/FFD700?text=PlayStation+5',
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
        lowestBid: 75,
        lowestBidder: 'gamer@test.com',
        aiHint: 'Gaming console in high demand, bid around 70-80 coins'
      },
      {
        id: 5,
        name: 'Apple Watch Series 9',
        description: 'Apple Watch Series 9, 45mm, GPS + Cellular',
        image: 'https://via.placeholder.com/300x200/000000/FFD700?text=Apple+Watch+S9',
        endTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
        lowestBid: 25,
        lowestBidder: 'watchlover@test.com',
        aiHint: 'Smart watch deal, consider bidding 22-28 coins'
      },
      {
        id: 6,
        name: 'Nintendo Switch OLED',
        description: 'Nintendo Switch OLED model with enhanced display',
        image: 'https://via.placeholder.com/300x200/e60012/FFD700?text=Switch+OLED',
        endTime: new Date(Date.now() + 72 * 60 * 60 * 1000), // 3 days from now
        lowestBid: 55,
        lowestBidder: 'nintendo@test.com',
        aiHint: 'Popular gaming device, bid between 50-60 coins'
      },
      {
        id: 7,
        name: 'AirPods Pro 2nd Gen',
        description: 'Apple AirPods Pro with USB-C, Active Noise Cancellation',
        image: 'https://via.placeholder.com/300x200/f5f5f7/000000?text=AirPods+Pro+2',
        endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
        lowestBid: 18,
        lowestBidder: 'music@test.com',
        aiHint: 'Premium earbuds, good value at 15-20 coins'
      },
      {
        id: 8,
        name: 'iPad Air M2',
        description: 'iPad Air with M2 chip, 11-inch display, 256GB',
        image: 'https://via.placeholder.com/300x200/4a90e2/FFD700?text=iPad+Air+M2',
        endTime: new Date(Date.now() + 96 * 60 * 60 * 1000), // 4 days from now
        lowestBid: 85,
        lowestBidder: 'tablet@test.com',
        aiHint: 'Versatile tablet, consider bidding 80-90 coins'
      },
      {
        id: 9,
        name: 'Samsung 65" QLED TV',
        description: '65-inch 4K QLED Smart TV with HDR10+',
        image: 'https://via.placeholder.com/300x200/1f1f23/FFD700?text=Samsung+QLED+TV',
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago - ENDED
        lowestBid: 150,
        lowestBidder: 'tvlover@test.com',
        aiHint: 'Auction ended - this was a premium TV deal'
      },
      {
        id: 10,
        name: 'MacBook Air M2',
        description: 'MacBook Air with M2 chip, 13-inch, 512GB SSD',
        image: 'https://via.placeholder.com/300x200/silver/000000?text=MacBook+Air+M2',
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago - ENDED
        lowestBid: 95,
        lowestBidder: 'laptop@test.com',
        aiHint: 'Auction ended - this was a great laptop deal'
      }
    ];

    // Sample coin packages
    const coinPackages: CoinPackage[] = [
      {
        id: 1,
        name: 'Starter Pack',
        coins: 100,
        price: 10,
        popular: false,
        isActive: true
      },
      {
        id: 2,
        name: 'Popular Pack',
        coins: 500,
        price: 45,
        originalPrice: 50,
        popular: true,
        bonus: 50,
        isActive: true
      },
      {
        id: 3,
        name: 'Premium Pack',
        coins: 1000,
        price: 80,
        originalPrice: 100,
        bonus: 200,
        isActive: true
      }
    ];

    // Sample payment methods
    const paymentMethods: PaymentMethod[] = [
      {
        id: 'vodafone_cash',
        name: 'Vodafone Cash',
        type: 'vodafone_cash',
        isActive: true,
        instructions: [
          'Send payment to one of our Vodafone Cash numbers',
          'Take a screenshot of the transaction',
          'Upload the screenshot in the payment form'
        ],
        accountNumbers: ['01234567890', '01987654321']
      }
    ];

    // Save all data
    await MockDatabase.saveUsers(users);
    await MockDatabase.saveProducts(products);
    await MockDatabase.saveCoinPackages(coinPackages);
    await MockDatabase.saveTransactions([]);
    await MockDatabase.savePaymentMethods(paymentMethods);
    await MockDatabase.saveSettings({
      vodafoneCashNumbers: ['01234567890', '01987654321'],
      storeSettings: {
        isStoreEnabled: true,
        supportContact: 'support@winzo.com'
      }
    });

    console.log('✅ Sample data seeded successfully');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Legacy exports for compatibility
export const pool = null; // Not used in React Native version
export const dbConfig = null; // Not used in React Native version
