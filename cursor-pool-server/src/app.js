const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const User = require('./models/User');
const SystemConfig = require('./models/SystemConfig');

// 加载环境变量
require('dotenv').config();

// 连接数据库
connectDB();

// 初始化Express应用
const app = express();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

// 路由
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/system', require('./routes/systemRoutes'));
app.use('/api/device', require('./routes/deviceRoutes'));
app.use('/api/cursor', require('./routes/cursorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// 首页路由
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用Cursor Pool API服务',
    version: '1.0.0'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || '服务器内部错误'
  });
});

// 初始化数据库
const initDatabase = async () => {
  try {
    // 检查是否已有管理员用户
    const adminExists = await User.findOne({ isAdmin: true });
    
    if (!adminExists) {
      // 创建默认管理员用户
      await User.create({
        username: process.env.ADMIN_EMAIL,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        level: 999,
        totalCount: 9999,
        isAdmin: true,
        expireTime: Date.now() + 365 * 24 * 60 * 60 * 1000 // 一年后过期
      });
      console.log('创建默认管理员账户成功');
    }
    
    // 检查系统配置
    const versionExists = await SystemConfig.findOne({ key: SystemConfig.KEYS.VERSION });
    if (!versionExists) {
      await SystemConfig.create({
        key: SystemConfig.KEYS.VERSION,
        value: {
          version: '1.0.0',
          forceUpdate: false,
          downloadUrl: 'https://example.com/download',
          changeLog: '初始版本'
        },
        description: '应用版本信息'
      });
      console.log('创建默认版本配置成功');
    }
    
    const publicInfoExists = await SystemConfig.findOne({ key: SystemConfig.KEYS.PUBLIC_INFO });
    if (!publicInfoExists) {
      await SystemConfig.create({
        key: SystemConfig.KEYS.PUBLIC_INFO,
        value: {
          type: 'info',
          closeable: true,
          props: {
            title: '欢迎使用',
            description: '欢迎使用Cursor Pool系统'
          },
          actions: [
            {
              type: 'primary',
              text: '了解更多',
              url: 'https://example.com'
            }
          ]
        },
        description: '系统公告信息'
      });
      console.log('创建默认公告配置成功');
    }
  } catch (error) {
    console.error('初始化数据库错误:', error);
  }
};

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`服务器运行在端口: ${PORT}`);
  await initDatabase();
});

module.exports = app; 