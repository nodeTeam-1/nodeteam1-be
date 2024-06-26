const DM = require('../models/DM');

const dmController = {};

dmController.getDM = async (req, res) => {
  try {
    const reciveId = req.params.id;
    const { userId } = req;

    const dm = await DM.findOne({ users: { $all: [userId, reciveId] } })
      .populate('users', 'name profileImage bio')
      .populate('messages.userId', 'name');

    if (!dm) {
      dm = new DM({ users: [userId, reciveId], messages: [] });
    }

    return res.status(200).json({ status: 'success', dm });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

dmController.sendDM = async (req, res) => {
  try {
    const { reciveId, message } = req.body;
    const { userId } = req;

    let dm = await DM.findOne({ users: { $all: [userId, reciveId] } });

    if (!dm) {
      dm = new DM({ users: [userId, reciveId], messages: [] });
    }

    const newMessage = { userId, message };
    dm.messages.push(newMessage);
    await dm.save();

    if (global.clients[reciveId]) {
      await global.clients[reciveId].write(`data: ${JSON.stringify({ message, sendId: userId })}\n\n`);
      console.log(`reciveId: ${reciveId}\nmessage: ${message}`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

dmController.deleteDM = async (req, res) => {
  try {
    const { reciveId, messageId } = req.body;
    const { userId } = req;

    // 해당 DM 찾기
    let dm = await DM.findOne({ users: { $all: [userId, reciveId] } });

    if (!dm) {
      return res.status(404).json({ status: 'fail', error: 'DM not found' });
    }

    // 사용자가 자신의 메시지인지 확인 후 삭제
    const message = dm.messages.id(messageId);

    if (!message || message.userId.toString() !== userId.toString()) {
      return res.status(403).json({ status: 'fail', error: 'Unauthorized to delete this message' });
    }

    message.isDeleted = true;
    message.originMessage = message.message;
    message.message = '삭제되었습니다.';
    await dm.save();

    // 수신자에게 SSE로 알림
    if (global.clients[reciveId]) {
      global.clients[reciveId].write(`data: ${JSON.stringify({ messageId, isDeleted: true })}\n\n`);
    }

    return res.status(200).json({ status: 'success' });
  } catch (error) {
    res.status(400).json({ status: 'fail', error: error.message });
  }
};

module.exports = dmController;
