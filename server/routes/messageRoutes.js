import express from 'express';
import {
  getConversations,
  getMessagesByRoom,
  sendMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All messaging routes require authentication

router.get('/conversations', getConversations);
router.get('/room/:roomId', getMessagesByRoom);
router.post('/', sendMessage);

export default router;
