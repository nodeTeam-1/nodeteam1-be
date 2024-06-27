const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const commentController = require('../controllers/comment.controller');

// 댓글 생성
router.post('/', authController.authenticate, commentController.createComment);

// 특정 포스트의 댓글 목록 조회
router.get('/:postId', commentController.getCommentsByPost);

// 댓글 수정
router.put('/:postId/:id', authController.authenticate, commentController.updateComment);

// 댓글 삭제
router.delete('/:postId/:id', authController.authenticate, commentController.deleteComment);

module.exports = router;
