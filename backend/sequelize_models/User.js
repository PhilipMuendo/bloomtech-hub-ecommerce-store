import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';

export default (sequelize) => {
  class User extends Model {
    async matchPassword(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
  }

  User.init({
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [2, 50],
        is: {
          args: /[a-zA-Z]{2,}/,
          msg: 'Name must contain at least 2 letters.'
        },
        notNumeric(value) {
          if (/^\d+$/.test(value)) {
            throw new Error('Name must not be only digits.');
          }
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isValidPhone(value) {
          if (value && value !== '254700000000') {
            // Allow various Kenyan phone number formats
            const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/;
            if (!phoneRegex.test(value)) {
              throw new Error('Please enter a valid Kenyan phone number.');
            }
          }
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for OAuth users
      validate: {
        len: [6, 100],
        notSimple(value) {
          if (value && ["123456", "password", "qwerty"].includes(value)) {
            throw new Error('Password is too simple.');
          }
        }
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'superadmin', 'warehouse'),
      defaultValue: 'user',
    },
    status: {
      type: DataTypes.ENUM('active', 'suspended'),
      defaultValue: 'active',
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
    },
    // OAuth fields
    googleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    googleEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    googlePicture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google'),
      defaultValue: 'local',
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
}; 