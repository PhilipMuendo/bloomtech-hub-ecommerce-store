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
        len: [8, 100],
        isStrongPassword(value) {
          if (!value) return; // Allow null for OAuth users

          // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
          const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          if (!strongPasswordRegex.test(value)) {
            throw new Error('Password must be at least 8 characters and contain uppercase, lowercase, and numbers');
          }

          // Check for common weak passwords
          const weakPasswords = ['12345678', 'password', 'qwerty123', 'admin123', 'password123'];
          if (weakPasswords.includes(value.toLowerCase())) {
            throw new Error('Password is too common. Please choose a stronger password.');
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
    // Account lockout fields
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    lastFailedLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLogout: {
      type: DataTypes.DATE,
      allowNull: true,
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