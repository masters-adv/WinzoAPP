export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  endTime: Date | string;
  lowestBid: number;
  lowestBidder: string;
  aiHint: string;
}

export interface Bid extends Product {
  userBid: number;
  status: 'Lowest Bidder' | 'Outbid';
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  coins: number;
}

export interface DatabaseUser extends User {
  password: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  name: string;
}

// Coin Store Types
export interface CoinPackage {
  id: number;
  name: string;
  coins: number;
  price: number; // in EGP
  originalPrice?: number; // for discount display
  popular?: boolean;
  bonus?: number; // extra coins
  description?: string;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'vodafone_cash' | 'bank_transfer' | 'credit_card';
  isActive: boolean;
  instructions: string[];
  accountNumbers?: string[];
}

export interface CoinTransaction {
  id: string;
  userId: number;
  packageId: number;
  amount: number; // EGP
  coins: number;
  paymentMethod: string;
  paymentReference: string;
  vodafoneNumber?: string;
  paymentScreenshot?: string; // Base64 encoded image or file URI
  screenshotFileName?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date | string;
  completedAt?: Date | string;
  adminNotes?: string;
}

export interface VodafoneCashPayment {
  senderNumber: string;
  receiverNumber: string;
  amount: number;
  reference: string;
  transactionId?: string;
  paymentScreenshot?: string; // Base64 encoded image
  screenshotFileName?: string;
}

export interface PaymentVerification {
  transactionId: string;
  verified: boolean;
  verifiedBy: number; // admin user id
  verifiedAt: Date | string;
  notes?: string;
}

export interface DatabaseSchema {
  products: Product[];
  users: DatabaseUser[];
  coinPackages: CoinPackage[];
  coinTransactions: CoinTransaction[];
  paymentMethods: PaymentMethod[];
  settings: {
    vodafoneCashNumbers: string[];
    storeSettings: {
      isStoreEnabled: boolean;
      maintenanceMessage?: string;
      supportContact: string;
    };
  };
}
