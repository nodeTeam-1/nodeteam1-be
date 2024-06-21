const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const postController = require('../controllers/post.controller');

//NOTE - Post 전체
router.get('/', postController.getPosts);

//NOTE - Post 상세
router.get('/:id', postController.getPostDetail);

//NOTE - Post 등록
router.post('/', authController.authenticate, postController.createPost);

//NOTE - Post 업데이트
router.put('/', authController.authenticate, postController.updatePost);

//NOTE - Post 삭제
router.delete('/:id', authController.authenticate, postController.deletePost);

module.exports = router;
