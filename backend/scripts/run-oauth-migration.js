import { sequelize } from '../sequelize_models/index.js';
import { up } from '../migrations/add-oauth-fields.js';

async function runMigration() {
  try {
    console.log('Running OAuth migration...');
    await up(sequelize.getQueryInterface(), sequelize);
    console.log('OAuth migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration(); 