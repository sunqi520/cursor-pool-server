const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const { generateToken } = require('../utils/jwt');
const { sendVerificationCode } = require('../utils/email');
const crypto = require('crypto');

/**
 * 检查用户是否存在
 * @route POST /api/user/check
 */
exports.checkUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: '用户名是必须的'
      });
    }

    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username }
      ]
    });

    // 返回用户是否存在和是否需要验证码
    return res.status(200).json({
      status: 'success',
      message: '检查用户成功',
      data: {
        exists: !!user,
        needCode: user ? true : false
      }
    });
  } catch (error) {
    console.error('检查用户错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 发送验证码
 * @route POST /api/user/send_code
 */
exports.sendCode = async (req, res) => {
  try {
    const { username, isResetPassword } = req.body;

    if (!username) {
      return res.status(400).json({
        status: 'error',
        message: '用户名是必须的'
      });
    }

    // 查找用户
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 生成6位随机验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 计算过期时间（10分钟后）
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    // 存储验证码
    await VerificationCode.create({
      username: user.username,
      code,
      type: isResetPassword ? 'reset_password' : 'login',
      expireAt
    });

    // 发送验证码邮件
    const success = await sendVerificationCode(
      user.email,
      code,
      isResetPassword ? 'reset_password' : 'login'
    );

    if (!success) {
      return res.status(500).json({
        status: 'error',
        message: '发送验证码失败'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: '验证码已发送',
      data: {
        expireIn: 10 * 60 // 10分钟，单位：秒
      }
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 用户登录
 * @route POST /api/user/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password, deviceId, smsCode } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: '用户名和密码是必须的'
      });
    }

    // 查找用户
    const user = await User.findOne({ 
      $or: [
        { username },
        { email: username }
      ]
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 检查是否需要验证码
    if (user.level > 0) {
      if (!smsCode) {
        return res.status(400).json({
          status: 'error',
          message: '验证码是必须的'
        });
      }

      // 验证验证码
      const verificationCode = await VerificationCode.findOne({
        username: user.username,
        code: smsCode,
        type: 'login'
      });

      if (!verificationCode) {
        return res.status(400).json({
          status: 'error',
          message: '验证码无效或已过期'
        });
      }

      // 验证码使用后删除
      await VerificationCode.deleteOne({ _id: verificationCode._id });
    }

    // 验证密码
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: '密码错误'
      });
    }

    // 生成令牌
    const token = generateToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: '登录成功',
      data: {
        apiKey: token
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取用户信息
 * @route GET /api/user/info
 */
exports.getUserInfo = async (req, res) => {
  try {
    const user = req.user;

    // 检查用户是否已过期
    const isExpired = Date.now() > user.expireTime;

    return res.status(200).json({
      status: 'success',
      message: '获取用户信息成功',
      data: {
        totalCount: user.totalCount,
        usedCount: user.usedCount,
        expireTime: user.expireTime,
        level: user.level,
        isExpired,
        username: user.username,
        email: user.email,
        credits: user.credits,
        usage: user.usage
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取账户详情
 * @route GET /api/user/account
 */
exports.getAccount = async (req, res) => {
  try {
    const user = req.user;

    // 生成或获取Cursor令牌（这里使用一个固定格式的示例）
    const userId = user._id.toString();
    // 使用用户ID和一个秘钥生成一个模拟的Cursor令牌
    const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET);
    hmac.update(userId);
    const cursorToken = hmac.digest('hex');

    return res.status(200).json({
      status: 'success',
      message: '获取账户信息成功',
      data: {
        email: user.email,
        userId: userId,
        token: cursorToken
      }
    });
  } catch (error) {
    console.error('获取账户详情错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 修改密码
 * @route POST /api/user/change_password
 */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '旧密码和新密码是必须的'
      });
    }

    // 验证旧密码
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: '旧密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 生成新令牌
    const token = generateToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: '密码修改成功',
      data: {
        apiKey: token
      }
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 重置密码
 * @route POST /api/user/reset_password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, smsCode, newPassword } = req.body;

    if (!email || !smsCode || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '邮箱、验证码和新密码是必须的'
      });
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 验证验证码
    const verificationCode = await VerificationCode.findOne({
      username: user.username,
      code: smsCode,
      type: 'reset_password'
    });

    if (!verificationCode) {
      return res.status(400).json({
        status: 'error',
        message: '验证码无效或已过期'
      });
    }

    // 验证码使用后删除
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    // 更新密码
    user.password = newPassword;
    await user.save();

    // 生成新令牌
    const token = generateToken(user._id);

    return res.status(200).json({
      status: 'success',
      message: '密码重置成功',
      data: {
        apiKey: token
      }
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
}; 