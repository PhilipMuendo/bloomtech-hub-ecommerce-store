import { DataTypes, Model } from 'sequelize';

export default (sequelize) => {
  class ContactMessage extends Model {}

  ContactMessage.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'read'),
      defaultValue: 'new',
      allowNull: false,
    },

    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    respondedBy: {
      type: DataTypes.INTEGER, // User ID who responded
      allowNull: true,
    },
    respondedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'ContactMessage',
    tableName: 'contactmessages',
    timestamps: true
  });

  return ContactMessage;
};
