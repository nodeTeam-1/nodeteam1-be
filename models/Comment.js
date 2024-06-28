const mongoose = require('mongoose');
const { Schema } = mongoose;
const messageSchemaFields = require('./common/Message').obj;

// 대댓글
const replySchema = new Schema(
  {
    ...messageSchemaFields,
    likeCount: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// 댓글
const commentSchema = new Schema(
  {
    ...messageSchemaFields,
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
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
