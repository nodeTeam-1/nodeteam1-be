const express = require('express');
const router = express.Router();

const authApi = require('./auth.api');
const userApi = require('./user.api');
const followApi = require('./follow.api');
const postApi = require('./post.api');
const dmApi = require('./dm.api');

router.use('/auth', authApi);
router.use('/user', userApi);
router.use('/follow', followApi);
router.use('/post', postApi);
router.use('/dm', dmApi);

module.exports = router;
