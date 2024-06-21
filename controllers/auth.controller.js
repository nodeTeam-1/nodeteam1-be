const bycript = require('bcryptjs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { GoogleAuth, OAuth2Client } = require('google-auth-library');

const authController = {};

authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      const isMatch = await bycript.compare(password, user.password);
      if (isMatch) {
        // token
        const token = await user.generateToken();

        return res.status(200).json({ status: 'success', user, token });
      } else {
        throw new Error('비밀번호와 이메일이 유효하지 않습니다.');
      }
    } else {
      throw new Error('비밀번호와 이메일이 유효하지 않습니다.');
    }
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.loginWithGoogle = async (req, res) => {
  try {
    // 구글 정보 가져오기
    const { token } = req.body;
    const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = '' + Math.floor(Math.random() * 10000000);
      const salt = await bycript.genSalt(10);
      const newPassword = await bycript.hash(randomPassword, salt);
      user = new User({
        name,
        email,
        password: newPassword
      });
      await user.save();
    }

    const sessionToken = await user.generateToken();

    return res.status(200).json({ status: 'success', user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;

    if (!tokenString) throw new Error('토큰이 없습니다.');
    const token = tokenString.replace('Bearer ', '');

    jwt.verify(token, process.env.JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error('토큰이 유효하지 않습니다.');
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

authController.checkAdminPermission = async (req, res, next) => {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (user.level !== 'admin') throw new Error('권한이 없습니다.');

    next();
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = authController;
