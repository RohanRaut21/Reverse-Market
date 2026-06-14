import Message from '../models/Message.js';
import User from '../models/User.js';

// Helper to generate consistent roomId from sender and receiver IDs
export const getRoomId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('-');
};

// @desc    Get all conversations/contacts for the logged-in user
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all messages involving this user
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const rooms = {};

    for (const msg of messages) {
      if (!rooms[msg.roomId]) {
        const otherUserId = msg.sender.toString() === userId ? msg.receiver : msg.sender;
        rooms[msg.roomId] = {
          roomId: msg.roomId,
          lastMessage: msg.messageText,
          lastMessageTime: msg.createdAt,
          otherUserId,
        };
      }
    }

    // Populate other user details
    const conversations = await Promise.all(
      Object.values(rooms).map(async (conv) => {
        const otherUser = await User.findById(conv.otherUserId).select('name email role rating profileImage businessName');
        return {
          roomId: conv.roomId,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
          otherUser,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get message history for a room
// @route   GET /api/messages/room/:roomId
// @access  Private
export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Check if user belongs to this room
    const ids = roomId.split('-');
    if (!ids.includes(req.user.id)) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this chat history' });
    }

    const messages = await Message.find({ roomId })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, messageText } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !messageText) {
      return res.status(400).json({ success: false, message: 'Receiver and message text are required' });
    }

    const roomId = getRoomId(senderId, receiverId);

    const message = await Message.create({
      roomId,
      sender: senderId,
      receiver: receiverId,
      messageText,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
