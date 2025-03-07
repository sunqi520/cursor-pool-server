const mongoose = require('mongoose');

const VerificationCodeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['login', 'reset_password'],
    default: 'login'
  },
  expireAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10分钟后过期
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建TTL索引，到期自动删除
VerificationCodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VerificationCode', VerificationCodeSchema); 