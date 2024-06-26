const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Message = require('./common/messageSchema');

// 지도위치기반 채팅 기능
const blindDateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: [String],
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }], // 방에 있는 사용자
    messages: [Message],
    isDelete: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

blindDateSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;

  return obj;
};

// 사용자는 한개의 blindDate 를 가질수있다
blindDateSchema.pre('save', async function (next) {
  const blindDate = this;

  if (!blindDate.isDelete) {
    const existingBlindDate = await mongoose.models.BlindDate.findOne({ userId: blindDate.userId, isDelete: false });

    if (existingBlindDate) {
      const error = new Error('Users can only open one blind date.');
      return next(error);
    }
  }

  next();
});

const BlindDate = mongoose.model('BlindDate', blindDateSchema);

module.exports = BlindDate;
