const axios = require('axios');
const User = require('../models/User');

/**
 * 获取Cursor用户信息
 * @route GET /api/cursor/user_info
 */
exports.getUserInfoCursor = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token是必须的'
      });
    }

    // 这里模拟返回Cursor用户信息
    // 实际应用中，你可能需要调用Cursor的API
    const cursorUser = {
      email: req.user.email,
      email_verified: true,
      name: req.user.username,
      sub: `user_${req.user._id.toString().substring(0, 24)}`,
      updatedAt: new Date().toISOString(),
      picture: null
    };

    return res.status(200).json({
      status: 'success',
      message: '获取Cursor用户信息成功',
      data: cursorUser
    });
  } catch (error) {
    console.error('获取Cursor用户信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取Cursor使用情况
 * @route GET /api/cursor/usage
 */
exports.getUsage = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        message: 'Token是必须的'
      });
    }

    // 查找用户（通过token可能需要额外的逻辑）
    const user = req.user;

    // 这里返回模拟的使用情况数据
    // 实际应用中，你需要从数据库获取真实数据
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usage = {
      'gpt-4': {
        numRequests: user.usage['gpt-4']?.numRequests || 0,
        numRequestsTotal: 100,
        numTokens: user.usage['gpt-4']?.numRequests * 100 || 0,
        maxRequestUsage: 200,
        maxTokenUsage: 20000
      },
      'gpt-3.5-turbo': {
        numRequests: user.usage['gpt-3.5-turbo']?.numRequests || 0,
        numRequestsTotal: 200,
        numTokens: user.usage['gpt-3.5-turbo']?.numRequests * 100 || 0,
        maxRequestUsage: 500,
        maxTokenUsage: 50000
      },
      'gpt-4-32k': {
        numRequests: 0,
        numRequestsTotal: 50,
        numTokens: 0,
        maxRequestUsage: 100,
        maxTokenUsage: 100000
      },
      startOfMonth: startOfMonth.toISOString()
    };

    return res.status(200).json({
      status: 'success',
      message: '获取使用情况成功',
      data: usage
    });
  } catch (error) {
    console.error('获取使用情况错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 更新使用情况
 * @route POST /api/cursor/update_usage
 */
exports.updateUsage = async (req, res) => {
  try {
    const { modelType, increment } = req.body;
    const user = req.user;

    if (!modelType || increment === undefined) {
      return res.status(400).json({
        status: 'error',
        message: '模型类型和增量值是必须的'
      });
    }

    // 确保使用情况字段存在
    if (!user.usage[modelType]) {
      user.usage[modelType] = { numRequests: 0 };
    }

    // 增加使用次数
    user.usage[modelType].numRequests += increment;
    
    // 更新总使用次数
    user.usedCount += increment;

    // 保存用户
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: '使用情况更新成功',
      data: user.usage
    });
  } catch (error) {
    console.error('更新使用情况错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
}; 