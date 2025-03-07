const express = require('express');
const router = express.Router();
const cursorController = require('../controllers/cursorController');
const { protect } = require('../middlewares/authMiddleware');

// 所有路由需要认证
router.use(protect);

router.get('/user_info', cursorController.getUserInfoCursor);
router.get('/usage', cursorController.getUsage);
router.post('/update_usage', cursorController.updateUsage);

module.exports = router; 