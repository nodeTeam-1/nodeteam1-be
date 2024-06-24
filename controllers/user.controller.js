const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');

const userController = {};

// 유저생성
userController.createUser = async (req, res) => {
  try {
    const { email, password, name, level } = req.body;

    // 이메일 중복 검사
    const user = await User.findOne({ email });
    if (user) {
      throw new Error('이미 가입이 된 유저입니다');
    }

    // 비밀번호 암호화
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // 유저 정보 객체에 담아 저장
    const newUser = new User({ email, password: hashedPassword, name, level: level ? level : 'public' }); // public || influencers
    await newUser.save();

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'fail', error: err, message: err.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId)
      .populate('postLike')
      //.populate('commentLike')
      .populate('bookMark')
      .populate({
        path: 'followers',
        select: 'name profileImage'
      })
      .populate({
        path: 'followings',
        select: 'name profileImage'
      })
      .exec();

    if (user) {
      return res.status(200).json({ status: 'success', user });
    }

    throw new Error('토큰이 유효하지 않습니다.');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req;

    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);

    await User.findByIdAndUpdate({ _id: userId }, { password: newPassword }, { new: true });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.updateProfile = async (req, res) => {
  try {
    const { profileImage, bio } = req.body;
    const { userId } = req;

    const user = await User.findByIdAndUpdate({ _id: userId }, { profileImage, bio }, { new: true });

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.createFollow = async (req, res) => {
  try {
    const { followId } = req.body;
    const { userId } = req;

    const followedUser = await User.findByIdAndUpdate(
      { _id: followId },
      { $addToSet: { followers: userId } },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $addToSet: { followings: followedUser._id } },
      { new: true }
    );

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.deleteFollow = async (req, res) => {
  try {
    const { followId } = req.body;
    const { userId } = req;

    const followedUser = await User.findByIdAndUpdate(
      { _id: followId },
      { $pull: { followers: userId } },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { followings: followedUser._id } },
      { new: true }
    );

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.createBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req;

    const user = await User.findById({ _id: userId });

    if (user.bookMark.includes(postId)) throw new Error('Post already bookmark by user');

    await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { bookMark: postId } }, { new: true });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

userController.deleteBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req;

    const user = await User.findById({ _id: userId });

    if (!user.bookMark.includes(postId)) throw new Error('Post not bookmark by user');

    await User.findByIdAndUpdate({ _id: userId }, { $pull: { bookMark: postId } }, { new: true });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = userController;
