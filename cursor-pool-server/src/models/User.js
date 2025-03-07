const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  level: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 100
  },
  usedCount: {
    type: Number,
    default: 0
  },
  expireTime: {
    type: Number,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天后过期
  },
  isExpired: {
    type: Boolean,
    default: false
  },
  credits: {
    type: Number,
    default: 0
  },
  usage: {
    'gpt-4': {
      numRequests: {
        type: Number,
        default: 0
      }
    },
    'gpt-3.5-turbo': {
      numRequests: {
        type: Number,
        default: 0
      }
    }
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 创建用户前加密密码
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 自定义方法比对密码
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 虚拟属性，计算是否过期
UserSchema.virtual('isExpiredCalculated').get(function() {
  return Date.now() > this.expireTime;
});

// 更新文档时更新updatedAt字段
UserSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('User', UserSchema); 