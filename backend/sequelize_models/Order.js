import { DataTypes, Model } from 'sequelize';
import { generateTrackingNumber } from '../utils/idUtils.js';

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
      type: DataTypes.ENUM('pending', 'processing', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shippingAddress: {
      type: DataTypes.STRING,
      defaultValue: ''
    },
    trackingNumber: {
      type: DataTypes.STRING,
      unique: true
    },
    // Audit fields
    createdBy: {
      type: DataTypes.INTEGER, // User ID who created the order
      allowNull: true,
    },
    processedBy: {
      type: DataTypes.INTEGER, // User ID who processed the order
      allowNull: true,
    },
    deliveredBy: {
      type: DataTypes.INTEGER, // User ID who delivered the order
      allowNull: true,
    },
    processedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    adminViewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    userViewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    hooks: {
      beforeCreate: (order) => {
        if (!order.trackingNumber) {
          order.trackingNumber = generateTrackingNumber();
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
    tableName: 'orderitems',
    timestamps: false
  });
  return OrderItem;
}; 