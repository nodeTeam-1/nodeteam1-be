const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const dmController = require('../controllers/dm.controller');

//NOTE - DM 보내기
router.post('/', authController.authenticate, dmController.sendDM);

module.exports = router;
