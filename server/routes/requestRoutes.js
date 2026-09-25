import express from 'express';
import {
  createRequest,
  getRequests,
  getMyRequests,
  getRequestById,
  updateRequest
} from '../controllers/requestController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All request routes require authentication

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/my', getMyRequests);
router.get('/:id', getRequestById);
router.put('/:id', updateRequest);

export default router;
