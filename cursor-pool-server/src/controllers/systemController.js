const SystemConfig = require('../models/SystemConfig');

/**
 * 获取版本信息
 * @route GET /api/system/version
 */
exports.getVersion = async (req, res) => {
  try {
    const versionConfig = await SystemConfig.findOne({ key: SystemConfig.KEYS.VERSION });
    
    if (!versionConfig) {
      return res.status(404).json({
        status: 'error',
        message: '版本信息未配置'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: '获取版本信息成功',
      data: versionConfig.value
    });
  } catch (error) {
    console.error('获取版本信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 更新版本信息（仅管理员）
 * @route PUT /api/system/version
 */
exports.updateVersion = async (req, res) => {
  try {
    const { version, forceUpdate, downloadUrl, changeLog } = req.body;

    if (!version || !downloadUrl) {
      return res.status(400).json({
        status: 'error',
        message: '版本号和下载地址是必须的'
      });
    }

    // 更新或创建版本配置
    const versionConfig = await SystemConfig.findOneAndUpdate(
      { key: SystemConfig.KEYS.VERSION },
      {
        value: {
          version,
          forceUpdate: !!forceUpdate,
          downloadUrl,
          changeLog: changeLog || ''
        },
        description: '应用版本信息'
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      status: 'success',
      message: '版本信息更新成功',
      data: versionConfig.value
    });
  } catch (error) {
    console.error('更新版本信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 获取公告信息
 * @route GET /api/system/public_info
 */
exports.getPublicInfo = async (req, res) => {
  try {
    const publicInfoConfig = await SystemConfig.findOne({ key: SystemConfig.KEYS.PUBLIC_INFO });
    
    if (!publicInfoConfig) {
      return res.status(404).json({
        status: 'error',
        message: '公告信息未配置'
      });
    }
    
    return res.status(200).json({
      status: 'success',
      message: '获取公告信息成功',
      data: publicInfoConfig.value
    });
  } catch (error) {
    console.error('获取公告信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};

/**
 * 更新公告信息（仅管理员）
 * @route PUT /api/system/public_info
 */
exports.updatePublicInfo = async (req, res) => {
  try {
    const { type, closeable, props, actions } = req.body;

    if (!type || !props) {
      return res.status(400).json({
        status: 'error',
        message: '公告类型和属性是必须的'
      });
    }

    // 更新或创建公告配置
    const publicInfoConfig = await SystemConfig.findOneAndUpdate(
      { key: SystemConfig.KEYS.PUBLIC_INFO },
      {
        value: {
          type,
          closeable: !!closeable,
          props,
          actions: actions || []
        },
        description: '系统公告信息'
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      status: 'success',
      message: '公告信息更新成功',
      data: publicInfoConfig.value
    });
  } catch (error) {
    console.error('更新公告信息错误:', error);
    return res.status(500).json({
      status: 'error',
      message: '服务器错误'
    });
  }
};