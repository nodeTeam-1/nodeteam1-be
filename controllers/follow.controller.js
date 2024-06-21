const User = require('../models/User');

const followController = {};

followController.createFollow = async (req, res) => {
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

followController.deleteFollow = async (req, res) => {
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

module.exports = followController;
