import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    index: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messageText: {
    type: String,
    required: [true, 'Message text cannot be empty'],
  }
}, {
  timestamps: true,
});

const Message = mongoose.model('Message', messageSchema);
export default Message;
