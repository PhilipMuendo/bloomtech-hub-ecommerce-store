// Usage: node scripts/add-users.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function addUsers() {
  try {
    console.log('👥 Adding Users to Database\n');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sample users data
    const users = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: 'AlicePass123!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        password: 'BobPass456!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@example.com',
        password: 'CarolPass789!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'David Miller',
        email: 'david.miller@example.com',
        password: 'DavidPass321!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Emma Taylor',
        email: 'emma.taylor@example.com',
        password: 'EmmaPass654!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Frank Anderson',
        email: 'frank.anderson@example.com',
        password: 'FrankPass987!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Grace Martinez',
        email: 'grace.martinez@example.com',
        password: 'GracePass147!',
        role: 'user',
        status: 'active',
        verified: true
      },
      {
        name: 'Henry Garcia',
        email: 'henry.garcia@example.com',
        password: 'HenryPass258!',
        role: 'user',
        status: 'active',
        verified: true
      }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await db.User.findOne({ where: { email: userData.email } });
        
        if (!existingUser) {
          // Hash password
          const hashedPassword = await bcrypt.hash(userData.password, 10);
          
          // Create user
          const user = await db.User.create({
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role,
            status: userData.status,
            verified: userData.verified,
            verificationToken: null,
            verificationTokenExpires: null
          });
          
          console.log(`✅ User created: ${userData.name} (${userData.email})`);
          addedCount++;
        } else {
          console.log(`⏭️ User already exists: ${userData.email}`);
          skippedCount++;
        }
      } catch (error) {
        console.log(`❌ Error creating user ${userData.email}:`, error.message);
      }
    }

    console.log('\n📊 User Addition Summary:');
    console.log(`- Users added: ${addedCount}`);
    console.log(`- Users skipped (already exist): ${skippedCount}`);
    console.log(`- Total processed: ${users.length}`);

  } catch (error) {
    console.error('❌ User addition failed:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

addUsers(); 