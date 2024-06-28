const DM = require('../models/DM');
const User = require('../models/User');

const dmController = {};

dmController.getDM = async (req, res) => {
  try {
    const reciveId = req.params.id;
    const { userId } = req;

    let dm = await DM.findOne({ users: { $all: [userId, reciveId] } })
      .populate('users', 'name profileImage bio')
      .populate('messages.userId', 'name');

    if (!dm) {
      dm = new DM({ users: [userId, reciveId], messages: [] });
    }

    console.log('getDM Success');
    return res.status(200).json({ status: 'success', dm });
  } catch (error) {
    console.log('getDM Fail');
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

dmController.sendDM = async (req, res) => {
  try {
    const { reciveId, message, messageIndex } = req.body;
    const { userId } = req;

    console.log('send@! ',reciveId, userId, message, messageIndex);
    let dm = await DM.findOne({ users: { $all: [userId, reciveId] } });

    if (!dm) {
      dm = new DM({ users: [userId, reciveId], messages: [] });
    }

    const newMessage = { userId, message, messageIndex };
    dm.messages.push(newMessage);
    await dm.save();

    const user = await User.findById(userId);

    if (global.clients[reciveId]) {
      const event = {
        type: 'send',
        message,
        messageIndex,
        userId: { _id: user._id, name: user.name }
      };
      await global.clients[reciveId].write(`data: ${JSON.stringify(event)}\n\n`);
      console.log(`reciveId: ${reciveId}\nmessage: ${message}\nmessageIndex: ${messageIndex}`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

dmController.deleteDM = async (req, res) => {
  try {
    const { reciveId, messageIndex } = req.body;
    const { userId } = req;

    console.log('delete@! ',reciveId, userId ,messageIndex);
    // 해당 DM 찾기
    let dm = await DM.findOne({ users: { $all: [userId, reciveId] } });

    if (!dm) {
      return res.status(404).json({ status: 'fail', error: 'DM not found' });
    }

    const message = dm.messages.find(msg => msg.messageIndex === messageIndex);
    // 사용자가 자신의 메시지인지 확인 후 삭제
    if (!message || message.userId.toString() !== userId.toString()) {
      return res.status(403).json({ status: 'fail', error: 'Unauthorized to delete this message' });
    }

    message.isDeleted = true;
    message.originMessage = message.message;
    message.message = '삭제되었습니다.';
    await dm.save();

    // 수신자에게 SSE로 알림
    if (global.clients[reciveId]) {
      const event = {
        type: 'delete',
        messageIndex,
        isDeleted: true
      };
      global.clients[reciveId].write(`data: ${JSON.stringify(event)}\n\n`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
    console.log(`message: ${message.message}\nmessageIndex: ${messageIndex}`);
  }
};

module.exports = dmController;
