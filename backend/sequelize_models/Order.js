import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Order extends Model {}

  Order.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'delivered', 'cancelled', 'awaiting_payment', 'paid'),
      defaultValue: 'pending',
    },
    shippingAddress: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    trackingNumber: {
      type: DataTypes.STRING,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'Order',
    timestamps: true,
    hooks: {
      beforeCreate: (order) => {
        if (!order.trackingNumber) {
          const date = new Date();
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          const rand = Math.floor(100000 + Math.random() * 900000);
          order.trackingNumber = `BT-${y}${m}${d}-${rand}`;
        }
      }
    }
  });

  return Order;
};

// OrderItem model (should be in its own file, but included here for migration context)
export const OrderItem = (sequelize) => {
  class OrderItem extends Model {}
  OrderItem.init({
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
    timestamps: false
  });
  return OrderItem;
}; 