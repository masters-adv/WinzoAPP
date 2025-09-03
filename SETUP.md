# WinZO React Native App - Setup Guide

This guide will help you set up and run the WinZO React Native application.

## 📋 Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Expo CLI** - Install globally: `npm install -g expo-cli`
- **MySQL Server** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Git** for version control

### Development Tools
- **VS Code** (recommended) with React Native extensions
- **Expo Go** app on your mobile device:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

### Optional (for native builds)
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)

## 🚀 Quick Start

### 1. Clone and Navigate
```bash
# Navigate to the React Native app directory
cd winzo-app
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# OR using yarn
yarn install
```

### 3. Setup MySQL Database

#### Install MySQL Server
Follow the installation guide for your platform:
- **Windows**: Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
- **macOS**: `brew install mysql && brew services start mysql`
- **Linux**: `sudo apt install mysql-server`

#### Configure Database
1. Create a `.env` file in the project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=winzo_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

2. Run the database setup script:
```bash
npm run setup-db
```

This will create the database, tables, and seed initial data.

### 4. Download Required Assets

#### Fonts (Required)
Download these fonts from Google Fonts and place them in `assets/fonts/`:

1. **Roboto Family**:
   - `Roboto-Regular.ttf`
   - `Roboto-Medium.ttf` 
   - `Roboto-Bold.ttf`
   
2. **Oleo Script Family**:
   - `OleoScript-Regular.ttf`
   - `OleoScript-Bold.ttf`

**Quick Download Links**:
- [Roboto](https://fonts.google.com/specimen/Roboto) - Download all weights
- [Oleo Script](https://fonts.google.com/specimen/Oleo+Script) - Download all weights

#### App Icons (Optional for development)
Replace placeholder files in `assets/` with actual images:
- `icon.png` - App icon (1024x1024 PNG)
- `splash.png` - Splash screen image
- `adaptive-icon.png` - Android adaptive icon
- `favicon.png` - Web favicon

### 5. Start Development Server
```bash
# Start Expo development server
npm start

# OR
expo start
```

### 6. Run on Device/Simulator

#### Mobile Device (Recommended for testing)
1. Install **Expo Go** app on your phone
2. Scan the QR code displayed in terminal/browser
3. App will load on your device

#### iOS Simulator (macOS only)
```bash
# Press 'i' in the terminal or
expo start --ios
```

#### Android Emulator
```bash
# Press 'a' in the terminal or  
expo start --android
```

#### Web Browser
```bash
# Press 'w' in the terminal or
expo start --web
```

## 🔧 Configuration

### Environment Setup
The app uses mock data and doesn't require external APIs for development. All configuration is handled through:

- `app.json` - Expo configuration
- `babel.config.js` - Babel configuration with path aliases
- `tsconfig.json` - TypeScript configuration

### Database Configuration
Test accounts are pre-configured in the MySQL database:
- **Admin**: admin@winzo.com / admin123
- **User**: user@winzo.com / user123
- **Quick Test**: 1 / 1

The database contains:
- Sample auction products
- Coin packages for virtual currency
- Payment methods (Vodafone Cash)
- App settings and configuration

## 📱 Testing

### Device Testing Checklist
- [ ] Splash screen displays correctly
- [ ] Authentication flow works (login/signup)
- [ ] Navigation between tabs functions
- [ ] Product cards render with images
- [ ] Countdown timers update in real-time
- [ ] Admin dashboard shows mock data
- [ ] Responsive design works on different screen sizes

### Common Issues and Solutions

#### 1. Font Loading Issues
**Problem**: Fonts not displaying correctly
**Solution**: 
- Ensure actual TTF files are in `assets/fonts/`
- Replace placeholder files with real font files
- Clear Expo cache: `expo start -c`

#### 2. Navigation Errors
**Problem**: Navigation between screens doesn't work
**Solution**:
- Check React Navigation is properly installed
- Restart development server
- Clear Metro cache

#### 3. AsyncStorage Warnings
**Problem**: AsyncStorage deprecation warnings
**Solution**: 
- Ensure using `@react-native-async-storage/async-storage`
- Update to latest version if needed

#### 4. Metro Bundler Issues
**Problem**: Bundle compilation errors
**Solution**:
```bash
# Clear Metro cache
npx expo start --clear

# OR reset project
rm -rf node_modules
npm install
```

## 🏗️ Building for Production

### Expo Managed Workflow

#### Android APK
```bash
expo build:android -t apk
```

#### iOS IPA (requires Apple Developer account)
```bash
expo build:ios -t archive
```

#### Web Bundle
```bash
expo build:web
```

### Publishing to Expo
```bash
expo publish
```

## 🔄 Development Workflow

### Recommended Development Process
1. **Start with Expo Go** for quick testing
2. **Use web version** for UI development
3. **Test on real devices** for performance
4. **Use simulators** for specific platform testing

### Hot Reloading
- **File changes** automatically trigger reloads
- **Shake device** or press `R` to manually reload
- **Press `D`** to open developer menu

### Debugging
- **Console.log** appears in terminal and browser
- **React DevTools** available in browser
- **Flipper** for advanced debugging (ejected apps)

## 📂 Project Structure Overview

```
winzo-app/
├── src/                    # Source code
│   ├── components/         # Reusable components
│   ├── screens/           # Screen components  
│   ├── navigation/        # Navigation setup
│   ├── styles/           # Styling and themes
│   ├── utils/            # Utilities and helpers
│   └── types/            # TypeScript definitions
├── assets/               # Static assets
├── App.tsx              # Main app component
├── app.json            # Expo configuration
└── package.json        # Dependencies
```

## 🎯 Next Steps

After successful setup:

1. **Explore the codebase** - Understand component structure
2. **Modify styles** - Customize colors and typography
3. **Add features** - Implement additional functionality
4. **Test thoroughly** - Ensure compatibility across devices
5. **Deploy** - Build and publish your app

## 🆘 Need Help?

### Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [React Navigation Docs](https://reactnavigation.org/)

### Common Commands Reference
```bash
# Install dependencies
npm install

# Start development server
expo start

# Clear cache and restart
expo start -c

# Check Expo CLI version
expo --version

# Login to Expo account
expo login

# Check project status
expo doctor
```

### Support
For issues specific to this WinZO conversion:
1. Check this README and SETUP guide
2. Review the original Next.js project structure
3. Compare component implementations
4. Test on different platforms to isolate issues

Happy coding! 🎉

