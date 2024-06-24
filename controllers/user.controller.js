const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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

    // 인증번호 설정
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nodeteamprojectsns@gmail.com', // 당신의 이메일 주소
        pass: 'dbau kgsa gmie tpjx' // 당신의 이메일 비밀번호
      }
    });

    const mailOptions = {
      from: 'EMAIL',
      to: email,
      subject: '회원가입 인증 코드',
      text: `회원가입을 완료하려면 다음 인증 코드를 입력하세요: ${verificationCode}`
    };

    await transporter.sendMail(mailOptions);

    // 시간후에 delete 기능 작동
    const timerId = setTimeout(
      async () => {
        await User.deleteOne({ email });
        console.log(`${email} settimeout`);
      },
      3 * 60 * 1000
    );

    // 유저 정보 객체에 담아 저장
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      level: level ? level : 'public',
      verificationCode,
      timerId: `${timerId}`
    }); // public || influencers
    await newUser.save();

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'fail', error: err, message: err.message });
  }
};

userController.verifyUser = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    const user = await User.findOne({ email });

    if (!user) new Error('인증 코드가 유효 시간이 지났습니다.');

    if (user.verificationCode !== verificationCode) new Error('인증 코드가 일치 하지 않습니다.');

    clearTimeout(user.timerId);

    await User.findByIdAndUpdate(
      { _id: user._id },
      { isVerify: true, verificationCode: '', timerId: '' },
      { new: true }
    );

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
