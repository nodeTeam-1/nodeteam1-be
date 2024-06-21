const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

//NOTE - 회원가입
router.post('/register', userController.createUser);

//NOTE - 유저 정보
router.get('/info', authController.authenticate, userController.getUser);

//NOTE - 비밀번호 변경
router.put('/update/password', authController.authenticate, userController.updatePassword);

//NOTE - 프로필 변경
router.put('/update/profile', authController.authenticate, userController.updateProfile);

module.exports = router;
