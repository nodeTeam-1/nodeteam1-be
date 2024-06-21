const Post = require('../models/Post');

const postController = {};

postController.getPosts = async (req, res) => {
  try {
    const { page, name, pageSize = 1 } = req.query;

    const condition = {
      ...(name && { name: { $regex: name, $options: 'i' } })
    };

    let query = Post.find(condition).populate('userId', 'name');
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

postController.getPostDetail = async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findOne({ _id: postId }).populate('userId', 'name');

    return res.status(200).json({ status: 'success', post });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

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

module.exports = postController;
