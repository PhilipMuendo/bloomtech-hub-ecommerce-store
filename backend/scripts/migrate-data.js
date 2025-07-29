// Usage: node scripts/migrate-data.js
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import db, { sequelize } from '../sequelize_models/index.js';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB Models (for reading data)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  status: String,
  isAdmin: Boolean,
  verified: Boolean,
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  imageUrl: String,
  featured: Boolean,
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  items: [{
    productId: mongoose.Schema.Types.ObjectId,
    quantity: Number,
  }],
  total: Number,
  status: String,
  shippingAddress: String,
  trackingNumber: String,
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  author: String,
  slug: String,
  published: Boolean,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);
const Blog = mongoose.model('Blog', blogSchema);

async function migrateData() {
  let mongoConnection;
  
  try {
    console.log('🚀 Starting data migration from MongoDB to MySQL...');
    
    // Connect to MongoDB
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    mongoConnection = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Connect to MySQL
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');
    
    // Sync MySQL tables
    await sequelize.sync({ force: false });
    console.log('✅ MySQL tables synced');
    
    // Migrate Users
    console.log('\n👥 Migrating users...');
    const mongoUsers = await User.find({});
    console.log(`Found ${mongoUsers.length} users in MongoDB`);
    
    for (const mongoUser of mongoUsers) {
      const existingUser = await db.User.findOne({ where: { email: mongoUser.email } });
      if (!existingUser) {
        await db.User.create({
          name: mongoUser.name,
          email: mongoUser.email,
          password: mongoUser.password, // Already hashed
          role: mongoUser.role || 'user',
          status: mongoUser.status || 'active',
          isAdmin: mongoUser.isAdmin || false,
          verified: mongoUser.verified || false,
          verificationToken: mongoUser.verificationToken,
          verificationTokenExpires: mongoUser.verificationTokenExpires,
          resetPasswordToken: mongoUser.resetPasswordToken,
          resetPasswordExpires: mongoUser.resetPasswordExpires,
        });
        console.log(`✅ Migrated user: ${mongoUser.email}`);
      } else {
        console.log(`⏭️  User already exists: ${mongoUser.email}`);
      }
    }
    
    // Migrate Products
    console.log('\n🛍️ Migrating products...');
    const mongoProducts = await Product.find({});
    console.log(`Found ${mongoProducts.length} products in MongoDB`);
    
    for (const mongoProduct of mongoProducts) {
      const existingProduct = await db.Product.findOne({ where: { name: mongoProduct.name } });
      if (!existingProduct) {
        await db.Product.create({
          name: mongoProduct.name,
          description: mongoProduct.description,
          price: mongoProduct.price,
          category: mongoProduct.category,
          stock: mongoProduct.stock,
          imageUrl: mongoProduct.imageUrl,
          featured: mongoProduct.featured || false,
        });
        console.log(`✅ Migrated product: ${mongoProduct.name}`);
      } else {
        console.log(`⏭️  Product already exists: ${mongoProduct.name}`);
      }
    }
    
    // Migrate Blogs
    console.log('\n📝 Migrating blogs...');
    const mongoBlogs = await Blog.find({});
    console.log(`Found ${mongoBlogs.length} blogs in MongoDB`);
    
    for (const mongoBlog of mongoBlogs) {
      const existingBlog = await db.Blog.findOne({ where: { slug: mongoBlog.slug } });
      if (!existingBlog) {
        await db.Blog.create({
          title: mongoBlog.title,
          content: mongoBlog.content,
          image: mongoBlog.image,
          author: mongoBlog.author,
          slug: mongoBlog.slug,
          published: mongoBlog.published || false,
        });
        console.log(`✅ Migrated blog: ${mongoBlog.title}`);
      } else {
        console.log(`⏭️  Blog already exists: ${mongoBlog.title}`);
      }
    }
    
    // Migrate Orders (with items)
    console.log('\n📦 Migrating orders...');
    const mongoOrders = await Order.find({}).populate('userId');
    console.log(`Found ${mongoOrders.length} orders in MongoDB`);
    
    for (const mongoOrder of mongoOrders) {
      // Find the user in MySQL
      const mysqlUser = await db.User.findOne({ 
        where: { email: mongoOrder.userId?.email || 'unknown@example.com' } 
      });
      
      if (!mysqlUser) {
        console.log(`⚠️  Skipping order - user not found: ${mongoOrder.userId?.email}`);
        continue;
      }
      
      // Create order
      const mysqlOrder = await db.Order.create({
        userId: mysqlUser.id,
        total: mongoOrder.total,
        status: mongoOrder.status || 'pending',
        shippingAddress: mongoOrder.shippingAddress || '',
        trackingNumber: mongoOrder.trackingNumber || '',
      });
      
      // Create order items
      for (const item of mongoOrder.items) {
        const mysqlProduct = await db.Product.findOne({ 
          where: { name: item.productId?.name || 'Unknown Product' } 
        });
        
        if (mysqlProduct) {
          await db.OrderItem.create({
            orderId: mysqlOrder.id,
            productId: mysqlProduct.id,
            quantity: item.quantity,
          });
        }
      }
      
      console.log(`✅ Migrated order: ${mysqlOrder.id}`);
    }
    
    console.log('\n🎉 Data migration completed successfully!');
    console.log('\n📊 Migration Summary:');
    console.log(`- Users: ${mongoUsers.length}`);
    console.log(`- Products: ${mongoProducts.length}`);
    console.log(`- Blogs: ${mongoBlogs.length}`);
    console.log(`- Orders: ${mongoOrders.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (mongoConnection) {
      await mongoose.disconnect();
      console.log('🔌 MongoDB connection closed');
    }
    await sequelize.close();
    console.log('🔌 MySQL connection closed');
  }
}

migrateData(); 