import express from 'express';
import {
  placeBid,
  getBidsForRequest,
  getMyBids,
  updateBidStatus
} from '../controllers/bidController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All bid routes require authentication

router.post('/', placeBid);
router.get('/request/:requestId', getBidsForRequest);
router.get('/my', getMyBids);
router.put('/:id', updateBidStatus);

export default router;
