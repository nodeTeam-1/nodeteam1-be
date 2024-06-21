const User = require('../models/User');
const bcrypt = require('bcryptjs');

const userController = {};

// 유저생성
userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;

    // 이메일 중복 검사
    const user = await User.findOne({ email });
    if (user) {
      throw new Error('이미 가입이 된 유저입니다');
    }

    // 비밀번호 암호화
    const salt = bcrypt.genSaltSync(10);
    password = bcrypt.hashSync(password, salt);

    // 유저 정보 객체에 담아 저장
    const newUser = new User({ email, password, name, level: level ? level : 'public' }); // public || influencers
    await newUser.save();

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'fail', error: err, message: err.message });
  }
};

userController.getUser = async (req, res) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);
    if (user) {
      return res.status(200).json({ status: 'success', user });
    }
    throw new Error('토큰이 유효하지 않습니다.');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = userController;
