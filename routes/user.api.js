const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

// 회원가입
router.post('/register', userController.createUser);

// 유저 정보
router.get('/info', authController.authenticate, userController.getUser);

//TODO - 비밀번호 변경

//TODO - 유저 정보 변경 (프로필, 인사말)

module.exports = router;
