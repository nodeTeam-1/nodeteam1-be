const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Message = require('./common/messageSchema');

const commentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    content: { type: String, required: true },
    replies: [Message],
    likeCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
