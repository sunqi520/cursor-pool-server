# Cursor Pool 服务端

这是Cursor Pool的后台服务端，提供API接口和管理功能。

## 功能特性

- 用户认证和授权系统
- 设备管理和机器码控制
- Cursor Token 生成和管理
- 使用情况统计和限制
- 后台管理界面

## 技术栈

- Node.js + Express
- MongoDB + Mongoose
- JWT认证
- 邮件验证系统

## 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd cursor-pool-server
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制`.env.example`文件为`.env`，并根据实际情况修改配置：
```bash
cp .env.example .env
```

4. 启动MongoDB数据库
确保MongoDB服务已启动并运行

5. 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API文档

### 用户相关

- `POST /api/user/check` - 检查用户是否存在
- `POST /api/user/send_code` - 发送验证码
- `POST /api/user/login` - 用户登录
- `GET /api/user/info` - 获取用户信息
- `GET /api/user/account` - 获取账户详情
- `POST /api/user/change_password` - 修改密码
- `POST /api/user/reset_password` - 重置密码

### 设备相关

- `POST /api/device/register` - 注册设备
- `GET /api/device/info` - 获取设备信息
- `GET /api/device/list` - 获取用户的所有设备
- `PUT /api/device/deactivate` - 停用设备
- `POST /api/device/reset_machine_id` - 重置机器ID

### Cursor API

- `GET /api/cursor/user_info` - 获取Cursor用户信息
- `GET /api/cursor/usage` - 获取使用情况
- `POST /api/cursor/update_usage` - 更新使用情况

### 系统设置

- `GET /api/system/version` - 获取版本信息
- `GET /api/system/public_info` - 获取公告信息
- `PUT /api/system/version` - 更新版本信息（管理员）
- `PUT /api/system/public_info` - 更新公告信息（管理员）

### 管理员功能

- `GET /api/admin/users` - 获取所有用户
- `POST /api/admin/users` - 创建用户
- `GET /api/admin/users/:id` - 获取用户详情
- `PUT /api/admin/users/:id` - 更新用户
- `DELETE /api/admin/users/:id` - 删除用户
- `POST /api/admin/users/:id/reset-password` - 重置用户密码

## 许可证

[MIT](LICENSE) 