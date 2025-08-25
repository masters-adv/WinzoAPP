# WinZO Mobile App

A React Native version of the WinZO reverse auction platform. This app maintains the same functionality and UI design as the Next.js web version while being optimized for mobile devices.

## 📱 Features

### 🎯 Core Functionality
- **Reverse Auction System**: Bid on luxury items where lowest unique bid wins
- **Real-time Countdown Timers**: Live countdown for each auction
- **User Bidding Interface**: Track active bids and bid status
- **Admin Dashboard**: Comprehensive admin panel for managing auctions

### 👤 User Features
- **Authentication**: Login/Signup with role-based access
- **Auction Browsing**: Browse live auctions with search and filters
- **Bid Management**: View and track all user bids
- **Coin System**: Virtual currency for bidding
- **Store**: Coin purchasing and exclusive items (coming soon)

### 🔧 Admin Features  
- **Dashboard**: Analytics and key metrics overview
- **Product Management**: Add, edit, and manage auction items
- **User Management**: View users and grant coins
- **Payment Tracking**: Transaction monitoring (coming soon)

## 🏗️ Technical Stack

### **Frontend**
- **React Native** with Expo
- **TypeScript** for type safety
- **React Navigation** for navigation
- **Expo Linear Gradient** for gold gradient effects
- **AsyncStorage** for local data persistence
- **Expo Vector Icons** for iconography

### **Design System**
- **Dark Theme** with luxury gold accents (#FFD700 to #B8860B)
- **Egyptian/Pharaoh Aesthetic** with premium typography
- **Responsive Design** optimized for mobile screens
- **Custom Typography** using Roboto and Oleo Script fonts

### **State Management**
- **React Hooks** for component state
- **AsyncStorage** for user session persistence
- **Context API** for global state (if needed)

## 📁 Project Structure

```
winzo-app/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.tsx       # Navigation header with coins display
│   │   ├── ProductCard.tsx  # Auction item card component
│   │   ├── CountdownTimer.tsx # Real-time countdown timer
│   │   └── Badge.tsx        # Status badges for bids
│   ├── screens/             # Screen components
│   │   ├── SplashScreen.tsx # App splash screen
│   │   ├── AuthScreen.tsx   # Login/Signup screen
│   │   ├── AuctionsScreen.tsx # Main auction listing
│   │   ├── MyBidsScreen.tsx # User's bid tracking
│   │   ├── StoreScreen.tsx  # Store (coming soon)
│   │   └── Admin*.tsx       # Admin screens
│   ├── navigation/          # Navigation configuration
│   │   ├── MainNavigator.tsx # User tab navigation
│   │   └── AdminNavigator.tsx # Admin tab navigation
│   ├── styles/              # Styling and theme
│   │   ├── colors.ts        # Color palette
│   │   ├── typography.ts    # Font and text styles
│   │   └── common.ts        # Common styles
│   ├── utils/               # Utility functions
│   │   ├── storage.ts       # AsyncStorage helpers
│   │   └── api.ts           # API functions (mock data)
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Type definitions
├── assets/                  # Static assets
│   ├── fonts/               # Custom font files
│   ├── icon.png            # App icon
│   └── splash.png          # Splash screen image
├── App.tsx                  # Main app component
└── package.json            # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device

### Installation

1. **Navigate to the app directory:**
   ```bash
   cd winzo-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install font assets:**
   - Download actual font files from Google Fonts
   - Place them in `assets/fonts/` directory
   - Replace placeholder files with actual TTF files

4. **Replace placeholder assets:**
   - Add actual app icon (1024x1024) as `assets/icon.png`
   - Add splash screen image as `assets/splash.png`
   - Add favicon for web as `assets/favicon.png`

### Running the App

1. **Start the Expo development server:**
   ```bash
   npm start
   # or
   expo start
   ```

2. **Run on device/simulator:**
   - **iOS**: Press `i` in terminal or scan QR code with Camera app
   - **Android**: Press `a` in terminal or scan QR code with Expo Go
   - **Web**: Press `w` in terminal

### Building for Production

1. **Build for Android:**
   ```bash
   expo build:android
   ```

2. **Build for iOS:**
   ```bash
   expo build:ios
   ```

3. **Build for Web:**
   ```bash
   expo build:web
   ```

## 🎨 Design Guidelines

### Color Scheme
- **Primary Gold**: #FFD700 to #B8860B gradient
- **Background**: #000000 (Black)
- **Surface**: #1A1A1A (Dark gray)
- **Text**: #FFFFFF (White)
- **Accent**: #FFECB3 (Light gold)

### Typography
- **Headlines**: Oleo Script (Egyptian-inspired)
- **Body Text**: Roboto (Clean and readable)
- **Sizes**: 12px to 48px scale

### UI Principles
- **Dark luxury theme** with gold accents
- **Card-based layouts** for content organization
- **Smooth animations** and micro-interactions
- **Touch-friendly controls** with adequate spacing
- **Consistent iconography** using Expo Vector Icons

## 🔐 Authentication Flow

1. **Splash Screen** → Check stored user session
2. **Auth Screen** → Login/Signup with mock authentication
3. **Role-based Routing**:
   - **Users** → Main tab navigator (Auctions, My Bids, Store)
   - **Admins** → Admin tab navigator (Dashboard, Products, Payments)

### Test Accounts
- **Admin**: admin@winzo.com / password
- **User**: user@winzo.com / password

## 🛠️ Development Features

### Mock Data System
- **Local API simulation** for development
- **AsyncStorage** for user persistence
- **Realistic auction data** with countdown timers
- **Bidding simulation** with status tracking

### Performance Optimizations
- **Lazy loading** for screens and components
- **Image optimization** with placeholder images
- **Efficient list rendering** with FlatList
- **Memory management** for timers and animations

## 🔄 State Management

### User Session
- **AsyncStorage** for persistent login state
- **Role-based navigation** and UI rendering
- **Coin balance** updates with real-time sync

### Data Flow
- **API calls** simulated with mock functions
- **Local state** managed with React hooks
- **Cross-component communication** via props and context

## 📱 Platform Compatibility

- **iOS**: 11.0+
- **Android**: API level 21+
- **Web**: Modern browsers with ES6 support

## 🚧 Future Enhancements

1. **Real Backend Integration**
   - Replace mock API with actual backend
   - Implement real authentication (Firebase Auth)
   - Add WebSocket for real-time bidding

2. **Enhanced Features**
   - Push notifications for bid updates
   - Biometric authentication
   - Offline mode support
   - Advanced search and filtering

3. **Performance Improvements**
   - Image caching and optimization
   - Background task management
   - Code splitting and lazy loading

4. **Additional Platforms**
   - Desktop app with Electron
   - Progressive Web App (PWA)
   - Apple Watch and Android Wear support

## 📄 License

This project is part of the WinZO platform demonstration and is intended for educational and portfolio purposes.

## 🤝 Contributing

This is a demonstration project converted from Next.js to React Native. The structure and functionality mirror the original web application while being optimized for mobile platforms.

