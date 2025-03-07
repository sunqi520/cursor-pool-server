const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * 生成JWT令牌
 * @param {string} id 用户ID
 * @returns {string} JWT令牌
 */
exports.generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

/**
 * 验证JWT令牌
 * @param {string} token JWT令牌
 * @returns {Object|null} 解码后的令牌负载或null
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}; 