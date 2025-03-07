const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { protect, admin } = require('../middlewares/authMiddleware');

// 公开路由
router.get('/version', systemController.getVersion);
router.get('/public_info', systemController.getPublicInfo);

// 管理员路由
router.use(protect, admin);
router.put('/version', systemController.updateVersion);
router.put('/public_info', systemController.updatePublicInfo);

module.exports = router; 