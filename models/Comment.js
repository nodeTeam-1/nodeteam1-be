const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const replySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    likeCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    replies: [replySchema],
    likeCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

commentSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;

  return obj;
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;