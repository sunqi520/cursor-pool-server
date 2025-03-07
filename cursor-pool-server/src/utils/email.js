const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * 发送验证码邮件
 * @param {string} to 收件人邮箱
 * @param {string} code 验证码
 * @param {string} type 验证码类型 (login | reset_password)
 * @returns {Promise<boolean>} 是否发送成功
 */
exports.sendVerificationCode = async (to, code, type = 'login') => {
  try {
    // 根据类型选择邮件主题
    let subject = '';
    let content = '';
    
    if (type === 'login') {
      subject = 'Cursor Pool 登录验证码';
      content = `<p>您的登录验证码是: <strong>${code}</strong></p><p>该验证码将在10分钟后失效。</p>`;
    } else if (type === 'reset_password') {
      subject = 'Cursor Pool 重置密码验证码';
      content = `<p>您的重置密码验证码是: <strong>${code}</strong></p><p>该验证码将在10分钟后失效。</p>`;
    }

    const mailOptions = {
      from: `"Cursor Pool" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: `
        <div style="background-color: #f5f5f5; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">Cursor Pool 验证码</h2>
            ${content}
            <p style="margin-top: 30px; font-size: 12px; color: #999;">
              本邮件由系统自动发送，请勿回复。如非您本人操作，请忽略此邮件。
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
}; 