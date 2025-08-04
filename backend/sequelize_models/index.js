import { Sequelize } from 'sequelize';
import config from './config.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

const db = {};
const modelsDir = path.resolve(__dirname);

const modelFiles = fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js') && file !== 'index.js' && file !== 'config.js');

for (const file of modelFiles) {
  const filePath = path.join(modelsDir, file);
  const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
  const modelDef = await import(fileUrl);
  // Support both default export (function) and named exports (for submodels)
  if (typeof modelDef.default === 'function') {
    const model = modelDef.default(sequelize);
    db[model.name] = model;
  }
  // Register any named exports (e.g., submodels)
  Object.keys(modelDef).forEach(key => {
    if (key !== 'default' && typeof modelDef[key] === 'function') {
      const subModel = modelDef[key](sequelize);
      db[subModel.name] = subModel;
    }
  });
}

// Define associations (example, update as needed)
if (db.User && db.Order) {
  db.User.hasMany(db.Order, { foreignKey: 'userId' });
  db.Order.belongsTo(db.User, { foreignKey: 'userId' });
}
if (db.Order && db.OrderItem) {
  db.Order.hasMany(db.OrderItem, { foreignKey: 'orderId' });
  db.OrderItem.belongsTo(db.Order, { foreignKey: 'orderId' });
}
if (db.Product && db.OrderItem) {
  db.Product.hasMany(db.OrderItem, { foreignKey: 'productId' });
  db.OrderItem.belongsTo(db.Product, { foreignKey: 'productId' });
}
if (db.User && db.CartItem) {
  db.User.hasMany(db.CartItem, { foreignKey: 'userId' });
  db.CartItem.belongsTo(db.User, { foreignKey: 'userId' });
}
if (db.Product && db.CartItem) {
  db.Product.hasMany(db.CartItem, { foreignKey: 'productId' });
  db.CartItem.belongsTo(db.Product, { foreignKey: 'productId' });
}
if (db.User && db.Wishlist) {
  db.User.hasMany(db.Wishlist, { foreignKey: 'userId' });
  db.Wishlist.belongsTo(db.User, { foreignKey: 'userId' });
}
if (db.Product && db.Wishlist) {
  db.Product.hasMany(db.Wishlist, { foreignKey: 'productId' });
  db.Wishlist.belongsTo(db.Product, { foreignKey: 'productId' });
}
if (db.Product && db.Review) {
  db.Product.hasMany(db.Review, { foreignKey: 'productId' });
  db.Review.belongsTo(db.Product, { foreignKey: 'productId' });
}
if (db.User && db.Review) {
  db.User.hasMany(db.Review, { foreignKey: 'userId' });
  db.Review.belongsTo(db.User, { foreignKey: 'userId' });
}
if (db.Quote && db.QuoteItem) {
  db.Quote.hasMany(db.QuoteItem, { foreignKey: 'quoteId' });
  db.QuoteItem.belongsTo(db.Quote, { foreignKey: 'quoteId' });
}
if (db.Product && db.QuoteItem) {
  db.Product.hasMany(db.QuoteItem, { foreignKey: 'productId' });
  db.QuoteItem.belongsTo(db.Product, { foreignKey: 'productId' });
}
if (db.Quote && db.Message) {
  db.Quote.hasMany(db.Message, { foreignKey: 'quoteId' });
  db.Message.belongsTo(db.Quote, { foreignKey: 'quoteId' });
}
if (db.Product && db.BackInStockAlert) {
  db.Product.hasMany(db.BackInStockAlert, { foreignKey: 'productId' });
  db.BackInStockAlert.belongsTo(db.Product, { foreignKey: 'productId' });
}
if (db.User && db.Transaction) {
  db.User.hasMany(db.Transaction, { foreignKey: 'userId' });
  db.Transaction.belongsTo(db.User, { foreignKey: 'userId' });
}
if (db.Order && db.Transaction) {
  db.Order.hasMany(db.Transaction, { foreignKey: 'orderId' });
  db.Transaction.belongsTo(db.Order, { foreignKey: 'orderId' });
}
if (db.User && db.Audit) {
  db.User.hasMany(db.Audit, { foreignKey: 'performedBy', as: 'performer' });
  db.Audit.belongsTo(db.User, { foreignKey: 'performedBy', as: 'performer' });
}

// Export
export { sequelize };
export default db; 