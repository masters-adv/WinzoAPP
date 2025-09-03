# WinZO MySQL Database Setup Guide

This guide will help you set up MySQL database for the WinZO React Native application.

## 📋 Prerequisites

### Required Software
- **MySQL Server** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **Node.js** (v16 or higher) - Already installed for the app
- **MySQL Workbench** (optional, for database management) - [Download](https://dev.mysql.com/downloads/workbench/)

## 🚀 Quick Setup

### 1. Install MySQL Server

#### Windows
1. Download MySQL Installer from [MySQL Downloads](https://dev.mysql.com/downloads/installer/)
2. Run the installer and choose "Developer Default"
3. Set a root password (remember this!)
4. Complete the installation

#### macOS
```bash
# Using Homebrew
brew install mysql
brew services start mysql

# Set root password
mysql_secure_installation
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 2. Configure Database Connection

Create a `.env` file in the project root with your MySQL credentials:

```env
# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=winzo_db
DB_USER=root
DB_PASSWORD=your_mysql_password_here

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
JWT_EXPIRES_IN=7d

# App Configuration
NODE_ENV=development
API_BASE_URL=http://localhost:3000
```

**Important:** 
- Replace `your_mysql_password_here` with your actual MySQL root password
- Generate a secure JWT secret (at least 32 characters)
- Never commit the `.env` file to version control

### 3. Run Database Setup Script

```bash
# Navigate to the app directory
cd winzo-app

# Install dependencies (if not already done)
npm install

# Run the database setup script
npm run setup-db
# OR
npm run db:setup
```

The script will:
- Create the `winzo_db` database
- Create all necessary tables
- Seed initial data (users, products, packages, etc.)

## 📊 Database Schema

### Tables Created

1. **users** - User accounts and authentication
2. **products** - Auction items
3. **bids** - User bids on products
4. **coin_packages** - Virtual currency packages
5. **coin_transactions** - Payment transactions
6. **payment_methods** - Available payment options
7. **app_settings** - Application configuration

### Default Data

#### Test Accounts
- **Admin**: `admin@winzo.com` / `admin123`
- **User**: `user@winzo.com` / `user123`
- **Quick Test**: `1` / `1`

#### Sample Products
- Luxury Chronograph Watch
- Designer Leather Handbag
- 4K Ultra HD Drone
- Vintage Electric Guitar

#### Coin Packages
- Starter Pack (30 coins - $30)
- Popular Pack (90+10 coins - $90)
- Power Pack (200+20 coins - $200)
- Ultimate Pack (500+50 coins - $500)

## 🔧 Manual Database Setup (Alternative)

If the automatic script doesn't work, you can set up manually:

### 1. Connect to MySQL
```bash
mysql -u root -p
```

### 2. Create Database
```sql
CREATE DATABASE winzo_db;
USE winzo_db;
```

### 3. Run the SQL commands from the setup script manually

## 🛠️ Troubleshooting

### Common Issues

#### 1. Connection Refused
**Error**: `ECONNREFUSED 127.0.0.1:3306`

**Solutions**:
- Ensure MySQL server is running
- Check if port 3306 is available
- Verify credentials in `.env` file

```bash
# Check if MySQL is running
# Windows
net start mysql

# macOS/Linux
brew services start mysql
# OR
sudo service mysql start
```

#### 2. Authentication Failed
**Error**: `Access denied for user 'root'@'localhost'`

**Solutions**:
- Verify password in `.env` file
- Reset MySQL root password if forgotten

```bash
# Reset root password (macOS/Linux)
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;
exit;
```

#### 3. Database Already Exists
**Error**: Database creation warnings

**Solution**: This is normal if you've run the setup before. The script will skip existing data.

#### 4. Permission Issues
**Error**: `CREATE command denied to user`

**Solutions**:
- Ensure user has CREATE privileges
- Use root user for initial setup
- Grant necessary permissions

```sql
GRANT ALL PRIVILEGES ON winzo_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Port Already in Use
**Error**: `Port 3306 is already in use`

**Solutions**:
- Change port in `.env` file
- Stop other MySQL instances
- Use different port (e.g., 3307)

## 🔐 Security Considerations

### Production Setup
1. **Create dedicated database user**:
```sql
CREATE USER 'winzo_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON winzo_db.* TO 'winzo_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Use strong JWT secret**:
Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

3. **Enable SSL/TLS** for database connections

4. **Regular backups**:
```bash
mysqldump -u root -p winzo_db > winzo_backup.sql
```

## 📱 Integration with React Native App

### Environment Variables
The app automatically loads configuration from `.env` file using the database services.

### Database Services
- **AuthService**: User authentication with JWT
- **ProductService**: Auction product management
- **UserService**: User data and coin management
- **TransactionService**: Payment processing
- **CoinPackageService**: Virtual currency packages

### Real-time Data
- All data is stored in MySQL
- No more AsyncStorage for persistent data
- JWT tokens for secure authentication
- Real database transactions

## 🔄 Migration from Mock Data

The new system:
- ✅ **Replaces** all AsyncStorage mock data
- ✅ **Maintains** the same API interface
- ✅ **Adds** proper authentication with JWT
- ✅ **Provides** real database persistence
- ✅ **Supports** multiple users simultaneously

## 📈 Performance Tips

1. **Connection Pooling**: Already configured (max 10 connections)
2. **Indexes**: Add indexes for frequently queried columns
3. **Query Optimization**: Use prepared statements (already implemented)
4. **Caching**: Consider Redis for session management in production

## 🆘 Need Help?

### Resources
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Node.js MySQL2 Guide](https://github.com/sidorares/node-mysql2)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

### Support Commands
```bash
# Check database connection
npm run setup-db

# View database structure
mysql -u root -p -e "USE winzo_db; SHOW TABLES;"

# Check app logs for database errors
npm start
```

---

🎉 **Congratulations!** Your WinZO app now uses a real MySQL database with proper authentication and data persistence!
