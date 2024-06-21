const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    timestamp: { type: Date, default: Date.now },
    sendUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true }
  },
  {
    _id: false
  }
);

module.exports = messageSchema;
