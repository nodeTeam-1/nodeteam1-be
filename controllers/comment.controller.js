const Comment = require('../models/Comment');
const Post = require('../models/Post');

const commentController = {};

// 댓글 생성
commentController.createComment = async (req, res) => {
  try {
    // 요청 본문에서 포스트 ID와 댓글 내용을 추출
    const { postId, content } = req.body;
    const { userId } = req; // 인증된 사용자 ID

    // 포스트가 존재하는지 확인
    const post = await Post.findById(postId);
    if (!post) throw new Error('포스트를 찾을 수 없습니다.');

    // 새로운 댓글 생성 및 저장
    const comment = new Comment({ postId, userId, content });
    await comment.save();

    return res.status(200).json({ status: 'success', comment });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 특정 포스트의 댓글 목록 조회
commentController.getCommentsByPost = async (req, res) => {
  try {
    // 요청 경로에서 포스트 ID 추출
    const postId = req.params.postId;

    // 해당 포스트의 모든 댓글을 조회 및 사용자 이름 포함
    const comments = await Comment.find({ postId }).populate('userId', 'name');

    return res.status(200).json({ status: 'success', comments });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 댓글 수정
commentController.updateComment = async (req, res) => {
  try {
    // 요청 경로에서 포스트 ID와 댓글 ID 추출
    const { postId, id: commentId } = req.params;
    const { content } = req.body; // 요청 본문에서 새로운 댓글 내용 추출
    const { userId } = req; // 인증된 사용자 ID

    // 댓글과 해당 포스트가 일치하는지 확인
    const comment = await Comment.findOne({ _id: commentId, postId });
    if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

    // 댓글 작성자가 요청한 사용자와 일치하는지 확인
    if (!comment.userId.equals(userId)) throw new Error('권한 없음: 자신의 댓글만 수정할 수 있습니다.');

    // 댓글 내용 업데이트 및 저장
    comment.content = content;
    await comment.save();

    return res.status(200).json({ status: 'success', comment });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 댓글 삭제
commentController.deleteComment = async (req, res) => {
  try {
    // 요청 경로에서 포스트 ID와 댓글 ID 추출
    const { postId, id: commentId } = req.params;
    const { userId } = req; // 인증된 사용자 ID

    // 댓글과 해당 포스트가 일치하는지 확인
    const comment = await Comment.findOne({ _id: commentId, postId });
    if (!comment) throw new Error('댓글을 찾을 수 없습니다.');

    // 댓글 작성자가 요청한 사용자와 일치하는지 확인
    if (!comment.userId.equals(userId)) throw new Error('권한 없음: 자신의 댓글만 삭제할 수 있습니다.');

    // 댓글 삭제
    await Comment.deleteOne({ _id: commentId });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = commentController;
