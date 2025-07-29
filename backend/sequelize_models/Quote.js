import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Quote extends Model {}

  Quote.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'responded', 'closed', 'declined'),
      defaultValue: 'pending',
    },
    userSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    adminSeen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    orderCreated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'Quote',
    timestamps: true
  });

  return Quote;
};

// QuoteItem model
export const QuoteItem = (sequelize) => {
  class QuoteItem extends Model {}
  QuoteItem.init({
    quoteId: {
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
      validate: { min: 1 }
    }
  }, {
    sequelize,
    modelName: 'QuoteItem',
    timestamps: false
  });
  return QuoteItem;
};

// Message model
export const Message = (sequelize) => {
  class Message extends Model {}
  Message.init({
    quoteId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'Message',
    timestamps: true
  });
  return Message;
}; 