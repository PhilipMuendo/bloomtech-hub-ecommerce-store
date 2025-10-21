import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class Audit extends Model {}

  Audit.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    // Who performed the action
    performedBy: {
      type: DataTypes.INTEGER, // User ID
      allowNull: false,
    },
    performedByRole: {
      type: DataTypes.ENUM('user', 'admin', 'superadmin', 'warehouse'),
      allowNull: false,
    },
    performedByName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // What action was performed
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // What entity was affected
    entityType: {
      type: DataTypes.ENUM('order', 'quote', 'product', 'user', 'review', 'transaction'),
      allowNull: false,
    },
    entityId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Details about the action
    details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Previous and new values for changes
    previousValues: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    newValues: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    // IP address and user agent for security
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Status of the action
    status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      defaultValue: 'success',
    },
    // Additional context
    context: {
      type: DataTypes.JSON,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'Audit',
    tableName: 'audits',
    timestamps: true,
    indexes: [
      {
        fields: ['performedBy']
      },
      {
        fields: ['entityType', 'entityId']
      },
      {
        fields: ['action']
      },
      {
        fields: ['createdAt']
      }
    ]
  });

  return Audit;
}; 