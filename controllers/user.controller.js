const User = require('../models/User');
const Post = require('../models/Post');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const userController = {};

// 유저 생성
userController.createUser = async (req, res) => {
  try {
    const { email, password, name, level } = req.body;

    // 이메일 중복 검사
    const user = await User.findOne({ email });
    if (user) {
      throw new Error('이미 가입된 사용자입니다.');
    }

    // 비밀번호 암호화
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // 인증 코드 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 이메일 전송을 위한 transporter 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'nodeteamprojectsns@gmail.com', // 발신자 이메일 주소
        pass: 'dbau kgsa gmie tpjx' // 발신자 이메일 비밀번호
      }
    });

    // 이메일 옵션 설정
    const mailOptions = {
      from: 'EMAIL', // 발신자 이메일 주소
      to: email, // 수신자 이메일 주소
      subject: '회원가입 인증 코드',
      text: `회원가입을 완료하려면 다음 인증 코드를 입력하세요: ${verificationCode}`
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);

    // 시간이 지난 후에 유저 정보 삭제를 위한 타이머 설정 (delete 기능 작동)
    const timerId = setTimeout(
      async () => {
        await User.deleteOne({ email });
        console.log(`${email} settimeout`);
      },
      3 * 60 * 1000 // 3분 후 삭제
    );

    // 새로운 유저 정보 객체 생성 및 저장
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

// 유저 인증
userController.verifyUser = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // 이메일로 유저 조회
    const user = await User.findOne({ email });

    // 유저가 존재하지 않으면 오류 발생
    if (!user) throw new Error('유효하지 않은 인증 코드입니다.');

    // 인증 코드 일치 여부 확인
    if (user.verificationCode !== verificationCode) throw new Error('인증 코드가 일치하지 않습니다.');

    // 타이머 아이디로 설정된 타이머 제거
    clearTimeout(user.timerId);

    // 유저의 인증 상태를 업데이트하고 데이터베이스에 저장
    await User.findByIdAndUpdate(
      { _id: user._id },
      { isVerify: true, verificationCode: '', timerId: '' }, // 인증 완료 후 필드 초기화
      { new: true }
    );

    return res.status(200).json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ status: 'fail', error: err, message: err.message });
  }
};

// 내 프로필 정보 조회
userController.getMyProfile = async (req, res) => {
  try {
    //.populate('commentLike')
    const { userId } = req; // 요청에서 사용자 ID 추출
    const user = await User.findById(userId) // 사용자 ID로 조회
      .populate('postLike') // 포스트 좋아요 필드 populate
      .populate('bookMark') // 북마크 필드 populate
      .populate({
        path: 'followers',
        select: 'name profileImage' // 팔로워 정보 필드 populate
      })
      .populate({
        path: 'followings',
        select: 'name profileImage' // 팔로잉 정보 필드 populate
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

// 아이디로 프로필 정보 조회
userController.getProfile = async (req, res) => {
  try {
    // URL 파라미터에서 userId 추출
    const userId = req.params.id;

    const user = await User.findById(userId) // 사용자 ID로 조회
      .populate('postLike') // 포스트 좋아요 필드 populate
      .populate('bookMark') // 북마크 필드 populate
      .populate({
        path: 'followers',
        select: 'name profileImage' // 팔로워 정보 필드 populate
      })
      .populate({
        path: 'followings',
        select: 'name profileImage' // 팔로잉 정보 필드 populate
      })
      .exec();

    if (user) {
      return res.status(200).json({ status: 'success', user });
    }

    // 사용자 정보가 없을 경우 에러 처리
    throw new Error('해당 사용자 정보를 찾을 수 없습니다.');
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 비밀번호 업데이트
userController.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { userId } = req;

    // 비밀번호 암호화
    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);

    // 사용자 ID로 유저 정보 업데이트
    await User.findByIdAndUpdate({ _id: userId }, { password: newPassword }, { new: true });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 프로필 업데이트
userController.updateProfile = async (req, res) => {
  try {
    const { profileImage, bio } = req.body;
    const { userId } = req;

    // 사용자 ID로 유저 정보 업데이트
    const user = await User.findByIdAndUpdate({ _id: userId }, { profileImage, bio }, { new: true });

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 팔로우 생성
userController.createFollow = async (req, res) => {
  try {
    const { followId } = req.body;
    const { userId } = req;

    // 팔로우할 유저 ID로 조회 후 팔로우 관계 설정
    const followedUser = await User.findByIdAndUpdate(
      { _id: followId },
      { $addToSet: { followers: userId } }, // followers 필드에 사용자 ID 추가
      { new: true }
    );

    // 팔로워로 사용자 ID 추가
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $addToSet: { followings: followedUser._id } }, // followings 필드에 팔로우 대상 ID 추가
      { new: true }
    );

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 팔로우 삭제
userController.deleteFollow = async (req, res) => {
  try {
    const { followId } = req.body;
    const { userId } = req;

    // 팔로우 취소할 유저 ID로 조회 후 팔로우 관계 제거
    const followedUser = await User.findByIdAndUpdate(
      { _id: followId },
      { $pull: { followers: userId } }, // followers 필드에서 사용자 ID 제거
      { new: true }
    );

    // 팔로워에서 사용자 ID 제거
    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $pull: { followings: followedUser._id } }, // followings 필드에서 팔로우 대상 ID 제거
      { new: true }
    );

    return res.status(200).json({ status: 'success', user });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 북마크 생성
userController.createBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req;

    // 사용자 ID로 유저 정보 조회
    const user = await User.findById({ _id: userId });

    // 이미 북마크된 포스트인지 확인
    if (user.bookMark.includes(postId)) throw new Error('이미 북마크된 포스트입니다.');

    // 북마크 추가
    await User.findByIdAndUpdate({ _id: userId }, { $addToSet: { bookMark: postId } }, { new: true });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

// 북마크 삭제
userController.deleteBookmark = async (req, res) => {
  try {
    const postId = req.params.id;
    const { userId } = req;

    // 사용자 ID로 유저 정보 조회
    const user = await User.findById({ _id: userId });

    // 북마크된 포스트인지 확인
    if (!user.bookMark.includes(postId)) throw new Error('북마크된 포스트가 아닙니다.');

    // 북마크 제거
    await User.findByIdAndUpdate({ _id: userId }, { $pull: { bookMark: postId } }, { new: true });

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = userController;
