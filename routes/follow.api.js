const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

//NOTE - 유저 팔로우
router.post('/', authController.authenticate, userController.createFollow);

//NOTE - 유저 언팔로우
router.delete('/', authController.authenticate, userController.deleteFollow);

module.exports = router;
