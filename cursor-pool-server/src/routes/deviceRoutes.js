const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect } = require('../middlewares/authMiddleware');

// 所有路由需要认证
router.use(protect);

router.post('/register', deviceController.registerDevice);
router.get('/info', deviceController.getDeviceInfo);
router.get('/list', deviceController.getUserDevices);
router.put('/deactivate', deviceController.deactivateDevice);
router.post('/reset_machine_id', deviceController.resetMachineId);

module.exports = router; 