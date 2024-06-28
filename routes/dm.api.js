const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const dmController = require('../controllers/dm.controller');

//NOTE - DM 조회
router.get('/:id', authController.authenticate, dmController.getDM);

//NOTE - DM 전송
router.post('/', authController.authenticate, dmController.sendDM);

//NOTE - DM 삭제 - 숨기기
router.put('/', authController.authenticate, dmController.deleteDM);

module.exports = router;
