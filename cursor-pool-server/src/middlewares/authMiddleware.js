const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * 保护路由，需要JWT令牌认证
 */
exports.protect = async (req, res, next) => {
  let token;

  // 从请求头或请求参数中获取令牌
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  } else if (req.body.apiKey) {
    token = req.body.apiKey;
  }

  // 检查令牌是否存在
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: '未授权，需要登录'
    });
  }

  try {
    // 验证令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 根据令牌中的ID查找用户
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 将用户附加到请求对象
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: '令牌无效或已过期'
    });
  }
};

/**
 * 限制只有管理员可以访问的路由
 */
exports.admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return res.status(403).json({
      status: 'error',
      message: '访问被拒绝，需要管理员权限'
    });
  }
}; 