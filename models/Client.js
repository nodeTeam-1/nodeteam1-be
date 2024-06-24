const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    connectionId: { type: String, required: true }
  },
  { timestamps: true }
);

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
