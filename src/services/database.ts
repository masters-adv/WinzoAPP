import { MockDatabase } from '../config/database';
import * as Crypto from 'expo-crypto';
import { 
  Product, 
  User, 
  DatabaseUser, 
  AuthCredentials, 
  SignupData, 
  CoinPackage, 
  CoinTransaction, 
  PaymentMethod, 
  VodafoneCashPayment,
  Bid
} from '../types';

// Simple token generation for React Native (without Buffer)
const generateToken = async (userId: number, email: string, role: string): Promise<string> => {
  const tokenData = {
    userId,
    email,
    role,
    timestamp: Date.now(),
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  const tokenString = JSON.stringify(tokenData);
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    tokenString + 'winzo-secret-key'
  );
  
  // Use btoa for base64 encoding (React Native compatible)
  return btoa(tokenString) + '.' + hash;
};

// Verify token
const verifyToken = async (token: string): Promise<any> => {
  try {
    const [encodedData, hash] = token.split('.');
    // Use atob for base64 decoding (React Native compatible)
    const tokenString = atob(encodedData);
    const tokenData = JSON.parse(tokenString);
    
    // Check if token is expired
    if (Date.now() > tokenData.expiresAt) {
      throw new Error('Token expired');
    }
    
    // Verify hash
    const expectedHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      tokenString + 'winzo-secret-key'
    );
    
    if (hash !== expectedHash) {
      throw new Error('Invalid token');
    }
    
    return tokenData;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Password hashing utilities using expo-crypto
const hashPassword = async (password: string): Promise<string> => {
  // Use a consistent salt for new user registrations
  const salt = 'newsalt123';
  const hashedPassword = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return `${salt}:${hashedPassword}`;
};

// Helper function to hash passwords with fixed salt (for seeded users)
const hashPasswordWithFixedSalt = async (password: string, fixedSalt: string): Promise<string> => {
  const hashedPassword = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + fixedSalt
  );
  return `${fixedSalt}:${hashedPassword}`;
};

const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  const [salt, hash] = hashedPassword.split(':');
  const computedHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + salt
  );
  return computedHash === hash;
};

// Authentication Services
export class AuthService {
  static async loginUser(credentials: AuthCredentials): Promise<{ user: User; token: string }> {
    try {
      const users = await MockDatabase.getUsers();
      const user = users.find(u => u.email === credentials.email);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await comparePassword(credentials.password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate token
      const token = await generateToken(user.id, user.email, user.role);

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async signupUser(data: SignupData): Promise<{ user: User; token: string }> {
    try {
      const users = await MockDatabase.getUsers();
      
      // Check if email already exists
      const existingUser = users.find(u => u.email === data.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create new user
      const newUser: DatabaseUser = {
        id: Math.max(0, ...users.map(u => u.id)) + 1,
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'user',
        coins: 1000
      };

      // Save updated users list
      users.push(newUser);
      await MockDatabase.saveUsers(users);

      // Generate token
      const token = await generateToken(newUser.id, newUser.email, newUser.role);

      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  static async verifyToken(token: string): Promise<User | null> {
    try {
      const decoded = await verifyToken(token);
      const users = await MockDatabase.getUsers();
      
      const user = users.find(u => u.id === decoded.userId);
      if (!user) {
        return null;
      }

      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

// Product Services
export class ProductService {
  static async fetchProducts(): Promise<Product[]> {
    try {
      return await MockDatabase.getProducts();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static async addProduct(productData: Omit<Product, 'id'>): Promise<Product> {
    try {
      const products = await MockDatabase.getProducts();
      const newProduct: Product = {
        id: Math.max(0, ...products.map(p => p.id)) + 1,
        ...productData
      };
      
      products.push(newProduct);
      await MockDatabase.saveProducts(products);
      
      return newProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }
}

// User Services
export class UserService {
  static async fetchUsers(): Promise<User[]> {
    try {
      const users = await MockDatabase.getUsers();
      return users.map(({ password, ...user }) => user);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  static async grantCoinsToUser(userId: number, coins: number): Promise<User> {
    try {
      const users = await MockDatabase.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      users[userIndex].coins += coins;
      await MockDatabase.saveUsers(users);
      
      const { password, ...userWithoutPassword } = users[userIndex];
      return userWithoutPassword;
    } catch (error) {
      console.error('Error granting coins:', error);
      throw error;
    }
  }

  static async updateUserCoins(userId: number, newCoinAmount: number): Promise<void> {
    try {
      const users = await MockDatabase.getUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      users[userIndex].coins = newCoinAmount;
      await MockDatabase.saveUsers(users);
    } catch (error) {
      console.error('Error updating user coins:', error);
      throw error;
    }
  }
}

// Bid Services
export class BidService {
  static async getMockBids(products: Product[], userId: number): Promise<Bid[]> {
    try {
      // Fallback to mock data since we don't have a bids table in MockDatabase
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
    } catch (error) {
      console.error('Error fetching user bids:', error);
      return [];
    }
  }
}

// Coin Package Services
export class CoinPackageService {
  static async fetchCoinPackages(): Promise<CoinPackage[]> {
    try {
      const packages = await MockDatabase.getCoinPackages();
      return packages.filter(p => p.isActive).sort((a, b) => a.price - b.price);
    } catch (error) {
      console.error('Error fetching coin packages:', error);
      throw error;
    }
  }

  static async fetchAllCoinPackages(): Promise<CoinPackage[]> {
    try {
      const packages = await MockDatabase.getCoinPackages();
      return packages.sort((a, b) => a.price - b.price);
    } catch (error) {
      console.error('Error fetching all coin packages:', error);
      throw error;
    }
  }

  static async addCoinPackage(packageData: Omit<CoinPackage, 'id'>): Promise<CoinPackage> {
    try {
      const packages = await MockDatabase.getCoinPackages();
      const newPackage: CoinPackage = {
        id: Math.max(0, ...packages.map(p => p.id)) + 1,
        ...packageData
      };
      
      packages.push(newPackage);
      await MockDatabase.saveCoinPackages(packages);
      
      return newPackage;
    } catch (error) {
      console.error('Error adding coin package:', error);
      throw error;
    }
  }

  static async updateCoinPackage(id: number, updates: Partial<CoinPackage>): Promise<CoinPackage> {
    try {
      const packages = await MockDatabase.getCoinPackages();
      const packageIndex = packages.findIndex(p => p.id === id);
      
      if (packageIndex === -1) {
        throw new Error('Package not found');
      }
      
      packages[packageIndex] = {
        ...packages[packageIndex],
        ...updates
      };
      
      await MockDatabase.saveCoinPackages(packages);
      
      return packages[packageIndex];
    } catch (error) {
      console.error('Error updating coin package:', error);
      throw error;
    }
  }

  static async deleteCoinPackage(id: number): Promise<void> {
    try {
      const packages = await MockDatabase.getCoinPackages();
      const packageIndex = packages.findIndex(p => p.id === id);
      
      if (packageIndex === -1) {
        throw new Error('Package not found');
      }
      
      packages.splice(packageIndex, 1);
      await MockDatabase.saveCoinPackages(packages);
    } catch (error) {
      console.error('Error deleting coin package:', error);
      throw error;
    }
  }
}

// Transaction Services
export class TransactionService {
  static async createCoinTransaction(transaction: Omit<CoinTransaction, 'id' | 'createdAt'>): Promise<CoinTransaction> {
    try {
      const transactions = await MockDatabase.getTransactions();
      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newTransaction: CoinTransaction = {
        id: transactionId,
        ...transaction,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      transactions.push(newTransaction);
      await MockDatabase.saveTransactions(transactions);
      
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  static async submitVodafonePayment(payment: VodafoneCashPayment, transactionId: string): Promise<CoinTransaction> {
    try {
      const transactions = await MockDatabase.getTransactions();
      const transactionIndex = transactions.findIndex(t => t.id === transactionId);
      
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }
      
      transactions[transactionIndex] = {
        ...transactions[transactionIndex],
        vodafoneNumber: payment.senderNumber,
        paymentReference: payment.reference,
        paymentScreenshot: payment.paymentScreenshot,
        screenshotFileName: payment.screenshotFileName,
        status: 'pending'
      };
      
      await MockDatabase.saveTransactions(transactions);
      
      return transactions[transactionIndex];
    } catch (error) {
      console.error('Error submitting Vodafone payment:', error);
      throw error;
    }
  }

  static async fetchPendingTransactions(): Promise<CoinTransaction[]> {
    try {
      const transactions = await MockDatabase.getTransactions();
      return transactions
        .filter(t => t.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      throw error;
    }
  }

  static async fetchAllTransactions(): Promise<CoinTransaction[]> {
    try {
      const transactions = await MockDatabase.getTransactions();
      return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  static async verifyTransaction(transactionId: string, verified: boolean, adminId: number, notes?: string): Promise<CoinTransaction> {
    try {
      const transactions = await MockDatabase.getTransactions();
      const transactionIndex = transactions.findIndex(t => t.id === transactionId);
      
      if (transactionIndex === -1) {
        throw new Error('Transaction not found');
      }

      const transaction = transactions[transactionIndex];
      const newStatus = verified ? 'completed' : 'failed';
      const completedAt = new Date().toISOString();

      // Update transaction
      transactions[transactionIndex] = {
        ...transaction,
        status: newStatus,
        completedAt,
        adminNotes: notes
      };

      await MockDatabase.saveTransactions(transactions);

      // If verified, add coins to user
      if (verified) {
        await UserService.grantCoinsToUser(transaction.userId, transaction.coins);
      }

      return transactions[transactionIndex];
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw error;
    }
  }
}

// Payment Method Services
export class PaymentMethodService {
  static async fetchPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const methods = await MockDatabase.getPaymentMethods();
      return methods.filter(m => m.isActive);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }
}

// Settings Services
export class SettingsService {
  static async updateVodafoneNumbers(numbers: string[]): Promise<string[]> {
    try {
      const settings = await MockDatabase.getSettings();
      settings.vodafoneCashNumbers = numbers;
      await MockDatabase.saveSettings(settings);
      
      // Also update payment method
      const methods = await MockDatabase.getPaymentMethods();
      const vodafoneMethodIndex = methods.findIndex(m => m.type === 'vodafone_cash');
      if (vodafoneMethodIndex !== -1) {
        methods[vodafoneMethodIndex].accountNumbers = numbers;
        await MockDatabase.savePaymentMethods(methods);
      }
      
      return numbers;
    } catch (error) {
      console.error('Error updating Vodafone numbers:', error);
      throw error;
    }
  }

  static async fetchVodafoneNumbers(): Promise<string[]> {
    try {
      const settings = await MockDatabase.getSettings();
      return settings.vodafoneCashNumbers || ['01111111111', '01222222222'];
    } catch (error) {
      console.error('Error fetching Vodafone numbers:', error);
      return ['01111111111', '01222222222']; // Default fallback
    }
  }
}
