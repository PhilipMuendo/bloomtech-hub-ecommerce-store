// Usage: node scripts/setup-database.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔧 Setting up MySQL database...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'bloomtech_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Database '${dbName}' created/verified`);
    
    // Use the database
    await connection.execute(`USE \`${dbName}\``);
    console.log(`✅ Using database '${dbName}'`);
    
    // Check if tables exist
    try {
      const [tables] = await connection.execute('SHOW TABLES');
      console.log(`📊 Found ${tables.length} existing tables`);
      
      if (tables.length > 0) {
        console.log('📋 Existing tables:');
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`   - ${tableName}`);
        });
      }
    } catch (error) {
      console.log('📊 No existing tables found (this is normal for a new database)');
    }
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Run migrations: npm run migrate');
    console.log('2. Start the server: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Ensure MySQL server is running');
    console.log('2. Check your database credentials in .env file');
    console.log('3. Ensure you have CREATE DATABASE privileges');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

setupDatabase(); 