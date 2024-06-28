const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Message = require('./common/Message');

const dmSchema = new Schema(
  {
    users: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    messages: [Message]
  },
  {
    timestamps: true,
    // _id: false
  }
);

dmSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;

  return obj;
};

const DM = mongoose.model('DM', dmSchema);

module.exports = DM;
