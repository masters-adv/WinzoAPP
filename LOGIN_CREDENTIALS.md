# WinZO App - Login Credentials

## 🔐 Test Accounts

The app now has proper authentication with different credentials for each user type.

### Admin Account
- **Email:** `admin@winzo.com`
- **Password:** `admin123`
- **Role:** Administrator
- **Features:** Access to admin dashboard, manage products, view payments

### Regular User Account #1
- **Email:** `user@winzo.com`
- **Password:** `user123`
- **Role:** User
- **Features:** Browse auctions, place bids, view personal bids
- **Starting Coins:** 5,500

### Regular User Account #2
- **Email:** `1`
- **Password:** `1`
- **Role:** User
- **Features:** Browse auctions, place bids, view personal bids
- **Starting Coins:** 2,000

## ✅ What Was Fixed

### Previous Issue
- All accounts used the same hardcoded password: `'password'`
- Any other password would show "Invalid email or password"

### Current Solution
1. **Individual Passwords:** Each user now has their own unique password
2. **Proper Validation:** Password is checked against the user's stored password
3. **Security:** Passwords are not returned in API responses
4. **Type Safety:** Added proper TypeScript types for database users vs public users

## 🚀 How to Use

1. **Login:** Use one of the credential sets above
2. **Sign Up:** Create a new account with any email/password combination
3. **Testing:** Both accounts work with their respective passwords

## 🔧 For Developers

- Passwords are stored in the mock database (`mockDatabase.users`)
- New users created via signup will have their passwords stored
- API responses exclude password fields for security
- TypeScript types separate `DatabaseUser` (with password) from `User` (public data)

## 📝 Notes

- This is a mock authentication system for development
- In production, passwords should be hashed and salted
- Consider implementing password reset functionality
- Add password strength requirements for better security
