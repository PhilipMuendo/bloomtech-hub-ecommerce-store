import db, { sequelize } from '../sequelize_models/index.js';

const { Quote, QuoteItem, Product, Order, OrderItem, User } = db;

async function testOrderCreation() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Find a quote to test with
    const quote = await Quote.findOne({
      include: [{ model: QuoteItem, include: [{ model: Product }] }]
    });

    if (!quote) {
      console.log('No quotes found in database');
      return;
    }

    console.log('Found quote:', {
      id: quote.id,
      name: quote.name,
      email: quote.email,
      status: quote.status,
      userId: quote.userId,
      items: quote.QuoteItems?.length || 0
    });

    // Test creating an order
    const finalPrice = 499.99;
    
    console.log('Attempting to create order...');
    
    // For guest quotes (no userId), we need to handle this differently
    let orderUserId = quote.userId;
    
    if (!orderUserId) {
      console.log('Quote has no userId, looking for default user...');
      const defaultUser = await User.findOne({ where: { role: 'user' } });
      if (defaultUser) {
        orderUserId = defaultUser.id;
        console.log('Using default user ID:', orderUserId);
      } else {
        console.log('No default user found, creating one...');
        const newUser = await User.create({
          name: 'Guest User',
          email: 'guest@example.com',
          password: 'GuestPassword123',
          role: 'user',
          verified: true,
          status: 'active'
        });
        orderUserId = newUser.id;
        console.log('Created guest user with ID:', orderUserId);
      }
    }
    
    const result = await sequelize.transaction(async (t) => {
      const order = await Order.create({
        userId: orderUserId,
        total: finalPrice,
        status: 'pending',
      }, { transaction: t });
      
      console.log('Order created:', {
        id: order.id,
        userId: order.userId,
        total: order.total,
        status: order.status
      });
      
      // Create order items
      const orderItems = quote.QuoteItems.map(item => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      }));
      
      console.log('Order items to create:', orderItems);
      
      const createdOrderItems = await OrderItem.bulkCreate(orderItems, { transaction: t });
      console.log('Order items created:', createdOrderItems.length);
      
      // Close quote
      await quote.update({ status: 'closed' }, { transaction: t });
      console.log('Quote status updated to closed');
      
      return order;
    });
    
    console.log('✅ Order creation successful!');
    console.log('Final order:', {
      id: result.id,
      userId: result.userId,
      total: result.total,
      status: result.status,
      trackingNumber: result.trackingNumber
    });
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

testOrderCreation(); 