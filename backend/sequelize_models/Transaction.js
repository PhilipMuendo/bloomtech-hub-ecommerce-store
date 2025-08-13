import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Transaction extends Model {}

  Transaction.init({
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    transactionId: {
      type: DataTypes.STRING,
      unique: true,
    },
    checkoutRequestId: {
      type: DataTypes.STRING,
      unique: true,
    },
    merchantRequestId: {
      type: DataTypes.STRING,
    },
    resultCode: {
      type: DataTypes.STRING,
    },
    resultDesc: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
      defaultValue: 'pending',
    },
    mpesaReceiptNumber: {
      type: DataTypes.STRING,
    },
    transactionDate: {
      type: DataTypes.DATE,
    },
    rawCallback: {
      type: DataTypes.JSON,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Transaction',
    timestamps: true
  });

  return Transaction;
}; 