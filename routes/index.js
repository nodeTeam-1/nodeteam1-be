const express = require('express');
const router = express.Router();

const authApi = require('./auth.api');
const userApi = require('./user.api');
const followApi = require('./follow.api');

router.use('/auth', authApi);
router.use('/user', userApi);
router.use('/follow', followApi);

module.exports = router;
