const Device = require('../models/Device');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

/**
 * 注册新设备
 * @route POST /api/device/register
 */
exports.registerDevice = async (req, res) => {
  try {
    const { machineId, machineCode } = req.body;
    const user = req.user;

    if (!machineId || !machineCode) {
      return res.status(400).json({
        status: 'error',
        message: '设备ID和机器码是必须的'
      });
    }

    // 检查是否已有相同machineId的设备
    const existingDevice = await Device.findOne({
      userId: user._id,
      machineId
    });

    // 生成Cursor令牌
    const tokenBase = `${user._id}:${machineId}:${Date.now()}`;
    const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET);
    hmac.update(tokenBase);
    const cursorToken = hmac.digest('hex');

    let device;

    if (existingDevice) {
      // 更新现有设备
      device = await Device.findByIdAndUpdate(
        existingDevice._id,
        {
          machineCode,
          cursorToken,
          isActive: true,
          lastUsed: Date.now()
        },
        { new: true }
      );
    } else {
      // 创建新设备
      device = await Device.create({
        userId: user._id,
        email: user.email,
        machineId,
        machineCode,
        cursorToken,
        isActive: true
      });
    }

    return res.status(200).json({
      status: 'success',
      message: '设备注册成功',
      data: {
        machineId: device.machineId,
        machineCode: device.machineCode,
        cursorToken: device.cursorToken,
        currentAccount: device.email
      }
    });
  } catch (error) {
    console.error('注册设备错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取设备信息
 * @route GET /api/device/info
 */
exports.getDeviceInfo = async (req, res) => {
  try {
    const user = req.user;
    const { machineId } = req.query;

    if (!machineId) {
      return res.status(400).json({
        status: 'error',
        message: '设备ID是必须的'
      });
    }

    // 查找设备
    const device = await Device.findOne({
      userId: user._id,
      machineId
    });

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: '设备不存在'
      });
    }

    // 更新最后使用时间
    device.lastUsed = Date.now();
    await device.save();

    return res.status(200).json({
      status: 'success',
      message: '获取设备信息成功',
      data: {
        machineId: device.machineId,
        machineCode: device.machineCode,
        cursorToken: device.cursorToken,
        currentAccount: device.email,
        isActive: device.isActive,
        lastUsed: device.lastUsed
      }
    });
  } catch (error) {
    console.error('获取设备信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取用户的所有设备
 * @route GET /api/device/list
 */
exports.getUserDevices = async (req, res) => {
  try {
    const user = req.user;

    // 查找用户的所有设备
    const devices = await Device.find({ userId: user._id });

    return res.status(200).json({
      status: 'success',
      message: '获取设备列表成功',
      data: devices.map(device => ({
        id: device._id,
        machineId: device.machineId,
        machineCode: device.machineCode,
        isActive: device.isActive,
        lastUsed: device.lastUsed,
        createdAt: device.createdAt
      }))
    });
  } catch (error) {
    console.error('获取设备列表错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 停用设备
 * @route PUT /api/device/deactivate
 */
exports.deactivateDevice = async (req, res) => {
  try {
    const user = req.user;
    const { machineId } = req.body;

    if (!machineId) {
      return res.status(400).json({
        status: 'error',
        message: '设备ID是必须的'
      });
    }

    // 查找设备
    const device = await Device.findOne({
      userId: user._id,
      machineId
    });

    if (!device) {
      return res.status(404).json({
        status: 'error',
        message: '设备不存在'
      });
    }

    // 停用设备
    device.isActive = false;
    await device.save();

    return res.status(200).json({
      status: 'success',
      message: '设备已停用',
      data: { machineId: device.machineId }
    });
  } catch (error) {
    console.error('停用设备错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 重置机器ID
 * @route POST /api/device/reset_machine_id
 */
exports.resetMachineId = async (req, res) => {
  try {
    const user = req.user;
    const { forceKill, machineId } = req.body;

    // 生成新的machineId
    const newMachineId = machineId || uuidv4();
    
    // 生成新的machineCode
    const randomBytes = crypto.randomBytes(16);
    const newMachineCode = randomBytes.toString('hex');

    // 生成新的Cursor令牌
    const tokenBase = `${user._id}:${newMachineId}:${Date.now()}`;
    const hmac = crypto.createHmac('sha256', process.env.JWT_SECRET);
    hmac.update(tokenBase);
    const cursorToken = hmac.digest('hex');

    return res.status(200).json({
      status: 'success',
      message: '重置机器ID成功',
      data: {
        machineId: newMachineId,
        machineCode: newMachineCode,
        cursorToken,
        currentAccount: user.email
      }
    });
  } catch (error) {
    console.error('重置机器ID错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
}; 