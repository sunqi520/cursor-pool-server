const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

// 公开路由
router.post('/check', userController.checkUser);
router.post('/send_code', userController.sendCode);
router.post('/login', userController.login);
router.post('/reset_password', userController.resetPassword);

// 需要认证的路由
router.use(protect);
router.get('/info', userController.getUserInfo);
router.get('/account', userController.getAccount);
router.post('/change_password', userController.changePassword);

module.exports = router; 