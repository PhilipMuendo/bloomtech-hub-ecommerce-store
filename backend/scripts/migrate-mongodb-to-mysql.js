import mongoose from 'mongoose';
import db, { sequelize } from '../sequelize_models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const {
  User, Product, Order, OrderItem, CartItem, Wishlist, Review,
  Quote, QuoteItem, Message, Campaign, Transaction,
  BackInStockAlert, Newsletter
} = db;

// MongoDB Models (for reading)
import UserMongo from '../legacy_models/User.js';
import ProductMongo from '../legacy_models/Product.js';
import OrderMongo from '../legacy_models/Order.js';
import CartItemMongo from '../legacy_models/CartItem.js';
import WishlistMongo from '../legacy_models/Wishlist.js';
import ReviewMongo from '../legacy_models/Review.js';
import QuoteMongo from '../legacy_models/Quote.js';

import CampaignMongo from '../legacy_models/Campaign.js';
import TransactionMongo from '../legacy_models/Transaction.js';
import BackInStockAlertMongo from '../legacy_models/BackInStockAlert.js';
import NewsletterMongo from '../legacy_models/Newsletter.js';

const migrateData = async () => {
  try {
    console.log('Starting MongoDB to MySQL migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Sync Sequelize models (create tables)
    await sequelize.sync({ force: true });
    console.log('MySQL tables created');
    
    // Migration mapping to track old IDs to new IDs
    const idMapping = {
      users: {},
      products: {},
      orders: {},
      quotes: {},
    
      campaigns: {},
      transactions: {}
    };
    
    // 1. Migrate Users
    console.log('Migrating Users...');
    const users = await UserMongo.find({});
    for (const user of users) {
      const newUser = await User.create({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        status: user.status,
        isAdmin: user.isAdmin,
        verified: user.verified,
        verificationToken: user.verificationToken,
        verificationTokenExpires: user.verificationTokenExpires,
        resetPasswordToken: user.resetPasswordToken,
        resetPasswordExpires: user.resetPasswordExpires,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
      idMapping.users[user._id.toString()] = newUser.id;
    }
    console.log(`Migrated ${users.length} users`);
    
    // 2. Migrate Products
    console.log('Migrating Products...');
    const products = await ProductMongo.find({});
    for (const product of products) {
      const newProduct = await Product.create({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        stock: product.stock,
        imageUrl: product.imageUrl,
        featured: product.featured,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
      idMapping.products[product._id.toString()] = newProduct.id;
    }
    console.log(`Migrated ${products.length} products`);
    
    // 3. Migrate Orders and OrderItems
    console.log('Migrating Orders...');
    const orders = await OrderMongo.find({});
    for (const order of orders) {
      const newOrder = await Order.create({
        userId: idMapping.users[order.userId.toString()],
        total: order.total,
        status: order.status,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      });
      idMapping.orders[order._id.toString()] = newOrder.id;
      
      // Migrate order items
      if (order.items && order.items.length > 0) {
        const orderItems = order.items.map(item => ({
          orderId: newOrder.id,
          productId: idMapping.products[item.productId.toString()],
          quantity: item.quantity
        }));
        await OrderItem.bulkCreate(orderItems);
      }
    }
    console.log(`Migrated ${orders.length} orders`);
    
    // 4. Migrate CartItems
    console.log('Migrating CartItems...');
    const cartItems = await CartItemMongo.find({});
    for (const item of cartItems) {
      await CartItem.create({
        userId: idMapping.users[item.userId.toString()],
        productId: idMapping.products[item.productId.toString()],
        quantity: item.quantity,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }
    console.log(`Migrated ${cartItems.length} cart items`);
    
    // 5. Migrate Wishlists
    console.log('Migrating Wishlists...');
    const wishlists = await WishlistMongo.find({});
    for (const item of wishlists) {
      await Wishlist.create({
        userId: idMapping.users[item.userId.toString()],
        productId: idMapping.products[item.productId.toString()],
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      });
    }
    console.log(`Migrated ${wishlists.length} wishlist items`);
    
    // 6. Migrate Reviews
    console.log('Migrating Reviews...');
    const reviews = await ReviewMongo.find({});
    for (const review of reviews) {
      await Review.create({
        productId: idMapping.products[review.productId.toString()],
        userId: idMapping.users[review.userId.toString()],
        comment: review.comment,
        rating: review.rating,
        status: review.status,
        helpful: review.helpful,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      });
    }
    console.log(`Migrated ${reviews.length} reviews`);
    
    // 7. Migrate Quotes, QuoteItems, and Messages
    console.log('Migrating Quotes...');
    const quotes = await QuoteMongo.find({});
    for (const quote of quotes) {
      const newQuote = await Quote.create({
        userId: quote.userId ? idMapping.users[quote.userId.toString()] : null,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        status: quote.status,
        userSeen: quote.userSeen,
        adminSeen: quote.adminSeen,
        createdAt: quote.createdAt,
        updatedAt: quote.updatedAt
      });
      idMapping.quotes[quote._id.toString()] = newQuote.id;
      
      // Migrate quote items
      if (quote.items && quote.items.length > 0) {
        const quoteItems = quote.items.map(item => ({
          quoteId: newQuote.id,
          productId: idMapping.products[item.productId.toString()],
          quantity: item.quantity
        }));
        await QuoteItem.bulkCreate(quoteItems);
      }
      
      // Migrate messages
      if (quote.messages && quote.messages.length > 0) {
        const messages = quote.messages.map(msg => ({
          quoteId: newQuote.id,
          sender: msg.sender,
          text: msg.text,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt
        }));
        await Message.bulkCreate(messages);
      }
    }
    console.log(`Migrated ${quotes.length} quotes`);
    
    
    
    // 9. Migrate Campaigns
    console.log('Migrating Campaigns...');
    const campaigns = await CampaignMongo.find({});
    for (const campaign of campaigns) {
      const newCampaign = await Campaign.create({
        subject: campaign.subject,
        content: campaign.content,
        sentDate: campaign.sentDate,
        recipients: campaign.recipients,
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt
      });
      idMapping.campaigns[campaign._id.toString()] = newCampaign.id;
    }
    console.log(`Migrated ${campaigns.length} campaigns`);
    
    // 10. Migrate Transactions
    console.log('Migrating Transactions...');
    const transactions = await TransactionMongo.find({});
    for (const transaction of transactions) {
      const newTransaction = await Transaction.create({
        orderId: idMapping.orders[transaction.orderId.toString()],
        userId: transaction.userId ? idMapping.users[transaction.userId.toString()] : null,
        phoneNumber: transaction.phoneNumber,
        amount: transaction.amount,
        transactionId: transaction.transactionId,
        checkoutRequestId: transaction.checkoutRequestId,
        merchantRequestId: transaction.merchantRequestId,
        resultCode: transaction.resultCode,
        resultDesc: transaction.resultDesc,
        status: transaction.status,
        mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        transactionDate: transaction.transactionDate,
        rawCallback: transaction.rawCallback,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt
      });
      idMapping.transactions[transaction._id.toString()] = newTransaction.id;
    }
    console.log(`Migrated ${transactions.length} transactions`);
    
    // 11. Migrate BackInStockAlerts
    console.log('Migrating BackInStockAlerts...');
    const alerts = await BackInStockAlertMongo.find({});
    for (const alert of alerts) {
      await BackInStockAlert.create({
        email: alert.email,
        productId: idMapping.products[alert.productId.toString()],
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt
      });
    }
    console.log(`Migrated ${alerts.length} back-in-stock alerts`);
    
    // 12. Migrate Newsletters
    console.log('Migrating Newsletters...');
    const newsletters = await NewsletterMongo.find({});
    for (const newsletter of newsletters) {
      await Newsletter.create({
        email: newsletter.email,
        createdAt: newsletter.createdAt,
        updatedAt: newsletter.updatedAt
      });
    }
    console.log(`Migrated ${newsletters.length} newsletter subscriptions`);
    
    console.log('Migration completed successfully!');
    console.log('ID Mapping summary:', {
      users: Object.keys(idMapping.users).length,
      products: Object.keys(idMapping.products).length,
      orders: Object.keys(idMapping.orders).length,
      quotes: Object.keys(idMapping.quotes).length,
  
      campaigns: Object.keys(idMapping.campaigns).length,
      transactions: Object.keys(idMapping.transactions).length
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    // Close connections
    await mongoose.disconnect();
    await sequelize.close();
    console.log('Connections closed');
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateData()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

export default migrateData; 