#!/usr/bin/env node

/**
 * WinZO Database Setup Script
 * 
 * This script helps set up the MySQL database for the WinZO app.
 * Run this script before starting the app for the first time.
 * 
 * Usage: node scripts/setup-database.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const databaseName = process.env.DB_NAME || 'winzo_db';

async function setupDatabase() {
  console.log('🚀 Setting up WinZO MySQL Database...');
  
  try {
    // Connect to MySQL server (without database)
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    console.log(`✅ Database '${databaseName}' created/verified`);

    // Switch to the database
    await connection.execute(`USE \`${databaseName}\``);
    console.log(`✅ Using database '${databaseName}'`);

    // Create tables
    console.log('📝 Creating tables...');

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        coins INT DEFAULT 1000,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image VARCHAR(500),
        end_time DATETIME NOT NULL,
        lowest_bid DECIMAL(10, 2) DEFAULT 0,
        lowest_bidder VARCHAR(255),
        ai_hint VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Bids table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS bids (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        bid_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('active', 'outbid', 'winner') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      )
    `);

    // Coin packages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coin_packages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        coins INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        popular BOOLEAN DEFAULT FALSE,
        bonus INT DEFAULT 0,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Coin transactions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS coin_transactions (
        id VARCHAR(100) PRIMARY KEY,
        user_id INT NOT NULL,
        package_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        coins INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_reference VARCHAR(255),
        vodafone_number VARCHAR(20),
        payment_screenshot LONGTEXT,
        screenshot_filename VARCHAR(255),
        status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
        admin_notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (package_id) REFERENCES coin_packages(id) ON DELETE CASCADE
      )
    `);

    // Payment methods table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type ENUM('vodafone_cash', 'bank_transfer', 'credit_card') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        instructions JSON,
        account_numbers JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // App settings table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS app_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ All tables created successfully');

    // Check if data already exists
    const [userRows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const userCount = userRows[0].count;

    if (userCount === 0) {
      console.log('📊 Seeding database with initial data...');

      // Hash passwords
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const hashedUserPassword = await bcrypt.hash('user123', 10);
      const hashedSimplePassword = await bcrypt.hash('1', 10);

      // Insert default users
      await connection.execute(`
        INSERT INTO users (name, email, password, role, coins) VALUES
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?)
      `, [
        'Admin', 'admin@winzo.com', hashedPassword, 'admin', 0,
        'Test User', 'user@winzo.com', hashedUserPassword, 'user', 5500,
        'User', '1', hashedSimplePassword, 'user', 2000
      ]);

      // Insert default products
      await connection.execute(`
        INSERT INTO products (name, description, image, end_time, lowest_bid, lowest_bidder, ai_hint) VALUES
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?)
      `, [
        'Luxury Chronograph Watch', 'A masterpiece of Swiss engineering. Features a stainless steel case, sapphire crystal, and automatic movement.', 'https://placehold.co/600x600.png', '2024-12-25 12:00:00', 15.52, 'UserA', 'luxury watch',
        'Designer Leather Handbag', 'Crafted from the finest Italian leather, this handbag is a symbol of elegance and style. Perfect for any occasion.', 'https://placehold.co/600x600.png', '2024-12-24 21:00:00', 8.75, 'UserB', 'leather handbag',
        '4K Ultra HD Drone', 'Capture breathtaking aerial footage with this professional-grade drone. Features a 3-axis gimbal and 30-minute flight time.', 'https://placehold.co/600x600.png', '2024-12-23 14:00:00', 22.03, 'UserC', 'camera drone',
        'Vintage Electric Guitar', 'A rare vintage guitar with a unique sound. A true collector\'s item for musicians and enthusiasts.', 'https://placehold.co/600x600.png', '2024-12-26 09:00:00', 5.41, 'UserD', 'electric guitar'
      ]);

      // Insert default coin packages
      await connection.execute(`
        INSERT INTO coin_packages (name, coins, price, original_price, popular, bonus, description, is_active) VALUES
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?),
        (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Starter Pack', 30, 30.00, null, false, 0, 'Perfect for beginners', true,
        'Popular Pack', 90, 90.00, 100.00, true, 10, 'Most popular choice - 10 bonus coins!', true,
        'Power Pack', 200, 200.00, 220.00, false, 20, 'Great value with 20 bonus coins', true,
        'Ultimate Pack', 500, 500.00, 550.00, false, 50, 'Maximum value - 50 bonus coins!', true
      ]);

      // Insert default payment methods
      await connection.execute(`
        INSERT INTO payment_methods (id, name, type, is_active, instructions, account_numbers) VALUES
        (?, ?, ?, ?, ?, ?)
      `, [
        'vodafone_cash', 'Vodafone Cash', 'vodafone_cash', true,
        JSON.stringify([
          "Open your Vodafone Cash app",
          "Select Send Money",
          "Enter the Vodafone Cash number provided",
          "Enter the exact amount shown",
          "Add the reference number in the message",
          "Complete the payment",
          "Take a screenshot of the confirmation",
          "Submit the payment details below"
        ]),
        JSON.stringify(["01111111111", "01222222222"])
      ]);

      // Insert default settings
      await connection.execute(`
        INSERT INTO app_settings (setting_key, setting_value) VALUES
        (?, ?),
        (?, ?)
      `, [
        'vodafone_cash_numbers', JSON.stringify(["01111111111", "01222222222"]),
        'store_settings', JSON.stringify({"isStoreEnabled": true, "supportContact": "support@winzo.com"})
      ]);

      console.log('✅ Database seeded with initial data');
    } else {
      console.log('📊 Database already contains data, skipping seed');
    }

    await connection.end();
    console.log('🎉 Database setup completed successfully!');
    
    console.log('\n📋 Setup Summary:');
    console.log(`   Database: ${databaseName}`);
    console.log('   Tables: users, products, bids, coin_packages, coin_transactions, payment_methods, app_settings');
    console.log('\n🔐 Test Accounts:');
    console.log('   Admin: admin@winzo.com / admin123');
    console.log('   User:  user@winzo.com / user123');
    console.log('   Quick: 1 / 1');
    console.log('\n🚀 You can now start the WinZO app!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
