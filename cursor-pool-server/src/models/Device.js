const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  machineId: {
    type: String,
    required: true
  },
  machineCode: {
    type: String,
    required: true
  },
  cursorToken: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
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

// 创建复合索引，确保每个用户的设备唯一性
DeviceSchema.index({ userId: 1, machineId: 1 }, { unique: true });

// 更新文档时更新updatedAt字段
DeviceSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('Device', DeviceSchema); 