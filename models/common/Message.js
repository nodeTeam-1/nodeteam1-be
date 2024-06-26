const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    originMessage: { type: String, default: '' }
  },
  {
    timestamp: true
  }
);

messageSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.originMessage;
  delete obj.__v;

  return obj;
};

module.exports = messageSchema;
