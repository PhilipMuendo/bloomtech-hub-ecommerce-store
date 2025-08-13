import db from '../sequelize_models/index.js';

const { User, Transaction } = db;

async function fixInvalidPhoneNumbers() {
  try {
    console.log('🔧 Fixing invalid phone numbers...');
    
    // Find users with invalid phone numbers
    const usersWithInvalidPhones = await User.findAll({
      where: {
        phone: '254700000000'
      }
    });
    
    console.log(`Found ${usersWithInvalidPhones.length} users with invalid phone numbers`);
    
    if (usersWithInvalidPhones.length > 0) {
      // Update users to have null phone numbers instead of invalid ones
      await User.update(
        { phone: null },
        { where: { phone: '254700000000' } }
      );
      
      console.log(`✅ Updated ${usersWithInvalidPhones.length} users to have null phone numbers`);
      
      // Log the user IDs that were updated
      const userIds = usersWithInvalidPhones.map(user => user.id);
      console.log('Updated user IDs:', userIds);
    } else {
      console.log('✅ No users with invalid phone numbers found');
    }
    
    // Also check transactions table for invalid phone numbers
    const transactionsWithInvalidPhones = await Transaction.findAll({
      where: {
        phoneNumber: '254700000000'
      }
    });
    
    console.log(`Found ${transactionsWithInvalidPhones.length} transactions with invalid phone numbers`);
    
    if (transactionsWithInvalidPhones.length > 0) {
      // Update transactions to have null phone numbers instead of invalid ones
      await Transaction.update(
        { phoneNumber: null },
        { where: { phoneNumber: '254700000000' } }
      );
      
      console.log(`✅ Updated ${transactionsWithInvalidPhones.length} transactions to have null phone numbers`);
      
      // Log the transaction IDs that were updated
      const transactionIds = transactionsWithInvalidPhones.map(transaction => transaction.id);
      console.log('Updated transaction IDs:', transactionIds);
    } else {
      console.log('✅ No transactions with invalid phone numbers found');
    }
    
    console.log('✅ Phone number cleanup completed');
    
  } catch (error) {
    console.error('❌ Error fixing phone numbers:', error);
  } finally {
    process.exit(0);
  }
}

fixInvalidPhoneNumbers();
