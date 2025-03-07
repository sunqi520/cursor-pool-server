const mongoose = require('mongoose');

const SystemConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 预定义的系统配置键
SystemConfigSchema.statics.KEYS = {
  VERSION: 'version',
  PUBLIC_INFO: 'publicInfo'
};

// 更新文档时更新updatedAt字段
SystemConfigSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

module.exports = mongoose.model('SystemConfig', SystemConfigSchema); 