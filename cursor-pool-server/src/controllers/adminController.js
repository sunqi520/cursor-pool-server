const User = require('../models/User');
const Device = require('../models/Device');
const bcrypt = require('bcryptjs');

/**
 * 获取所有用户
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    
    // 构建查询条件
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // 计算跳过的文档数
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 查询用户和总数
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    return res.status(200).json({
      status: 'success',
      message: '获取用户列表成功',
      data: {
        users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 创建用户
 * @route POST /api/admin/users
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, level, totalCount } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: '用户名、邮箱和密码是必须的'
      });
    }
    
    // 检查用户名和邮箱是否已存在
    const existingUser = await User.findOne({
      $or: [
        { username },
        { email }
      ]
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: '用户名或邮箱已存在'
      });
    }
    
    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      level: level || 0,
      totalCount: totalCount || 100,
      expireTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后过期
      isAdmin: false
    });
    
    // 去除密码后返回用户信息
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(201).json({
      status: 'success',
      message: '用户创建成功',
      data: userResponse
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 更新用户
 * @route PUT /api/admin/users/:id
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, level, totalCount, isAdmin, expireTime } = req.body;
    
    // 查找用户
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 更新用户信息
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = password;
    if (level !== undefined) user.level = level;
    if (totalCount !== undefined) user.totalCount = totalCount;
    if (isAdmin !== undefined) user.isAdmin = isAdmin;
    if (expireTime !== undefined) user.expireTime = expireTime;
    
    // 如果修改了密码，需要重新保存以触发密码哈希
    const needsRehash = !!password;
    
    if (needsRehash) {
      await user.save();
    } else {
      await User.updateOne({ _id: id }, user);
    }
    
    // 去除密码后返回用户信息
    const userResponse = user.toObject();
    delete userResponse.password;
    
    return res.status(200).json({
      status: 'success',
      message: '用户更新成功',
      data: userResponse
    });
  } catch (error) {
    console.error('更新用户错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 删除用户
 * @route DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找并删除用户
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 删除用户的所有设备
    await Device.deleteMany({ userId: id });
    
    return res.status(200).json({
      status: 'success',
      message: '用户删除成功',
      data: null
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取用户详情
 * @route GET /api/admin/users/:id
 */
exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 查找用户
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 查找用户的设备
    const devices = await Device.find({ userId: id });
    
    return res.status(200).json({
      status: 'success',
      message: '获取用户详情成功',
      data: {
        user,
        devices
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 重置用户密码
 * @route POST /api/admin/users/:id/reset-password
 */
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '新密码是必须的'
      });
    }
    
    // 查找用户
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    return res.status(200).json({
      status: 'success',
      message: '密码重置成功',
      data: null
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
}; 