const Post = require('../models/Post');
const User = require('../models/User');

const postController = {};

// 포스트 전체 가져오기
postController.getPosts = async (req, res) => {
  try {
    const { page, name, pageSize = 1 } = req.query;
    const condition = {
      ...(name && { name: { $regex: name, $options: 'i' } })
    };

    let query = Post.find(condition).populate('userId', 'name').sort({ createdAt: -1 });
    let response = { status: 'success' };

    if (page) {
      // limit 몇개를 보낼지
      // skip 몇개를 건더뛰고 보여줄건지
      query.skip((page - 1) * pageSize).limit(pageSize);

      // 최종 몇개 페이지인지
      const totalItemNum = await Post.find(condition).count();
      const totalPageNum = Math.ceil(totalItemNum / pageSize);
      response.totalPageNum = totalPageNum;
    }

    const postList = await query.exec();
    response.data = postList;

    return res.status(200).json(response);
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 ID별 가져오기
postController.getPostsId = async (req, res) => {
  try {
    const postId = req.params.id; // 파라미터에서 postId 가져옴
    const post = await Post.findById(postId).populate('userId', 'name'); // postId로 포스트 조회

    if (!post) {
      return res.status(404).json({ status: 'fail', message: 'Post not found' });
    }

    return res.status(200).json({ status: 'success', data: post });
  } catch (error) {
    return res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 상세 가져오기
postController.getPostDetail = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findOne({ _id: postId }).populate('userId', 'name profileImage bio');

    return res.status(200).json({ status: 'success', post });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 생성
postController.createPost = async (req, res) => {
  try {
    const { userId } = req;
    const { title, content, images, category, tags } = req.body;
    const post = new Post({ userId, title, content, images, category, tags });
    await post.save();
    return res.status(200).json({ status: 'success', post });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 업데이트
postController.updatePost = async (req, res) => {
  try {
    const { userId } = req;
    const { postId, title, content, images, category, tags } = req.body;
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    if (!post.userId.equals(userId)) throw new Error('Unauthorized: You can only edit your own posts');
    Object.assign(post, { title, content, images, category, tags });
    await post.save();
    return res.status(200).json({ status: 'success', post });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 삭제
postController.deletePost = async (req, res) => {
  try {
    const { userId } = req;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) throw new Error('Post not found');
    if (!post.userId.equals(userId)) throw new Error('Unauthorized: You can only edit your own posts');
    await Post.deleteOne({ _id: postId });
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 좋아요 생성
postController.createPostLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req;
    const user = await User.findById({ _id: userId });
    if (user.postLike.includes(postId)) throw new Error('Post already liked by user');
    await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { postLike: postId } }, { new: true });
    await Post.findOneAndUpdate({ _id: postId }, { $inc: { likeCount: 1 } }, { new: true });
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 포스트 좋아요 삭제
postController.deletePostLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req;
    const user = await User.findById({ _id: userId });
    if (!user.postLike.includes(postId)) throw new Error('Post not liked by user');
    await User.findByIdAndUpdate({ _id: userId }, { $pull: { postLike: postId } }, { new: true });
    await Post.findOneAndUpdate({ _id: postId }, { $inc: { likeCount: -1 } }, { new: true });
    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = postController;
