import Bid from '../models/Bid.js';
import Request from '../models/Request.js';

// @desc    Place a bid on a request
// @route   POST /api/bids
// @access  Private (Seller)
export const placeBid = async (req, res) => {
  try {
    const { requestId, bidAmount, deliveryTime, proposalMessage } = req.body;

    // Check if request exists
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Bidding is closed for this request' });
    }

    // Check if seller is the buyer of the request
    if (request.buyer.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot place a bid on your own request' });
    }

    // Check if seller already bid
    const existingBid = await Bid.findOne({ request: requestId, seller: req.user.id });
    if (existingBid) {
      return res.status(400).json({ success: false, message: 'You have already placed a bid on this request' });
    }

    const bid = await Bid.create({
      request: requestId,
      seller: req.user.id,
      bidAmount,
      deliveryTime,
      proposalMessage,
    });

    // Automatically update status of other bids to 'Outbid' if needed?
    // No, standard flow allows multiple bids to remain 'Pending' until accepted/shortlisted.
    // However, if we want to show outbid status, we could do it dynamically or when bid amount is higher than lowest.
    // For simplicity, we keep status as Pending.

    res.status(201).json({
      success: true,
      data: bid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bids for a request (Buyer compares bids, Seller checks their own)
// @route   GET /api/bids/request/:requestId
// @access  Private
export const getBidsForRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    let bids;
    // If user is the buyer who posted the request, they can see all bids from other sellers
    if (request.buyer.toString() === req.user.id) {
      bids = await Bid.find({ request: req.params.requestId, seller: { $ne: req.user.id } })
        .populate('seller', 'name email rating profileImage businessName phone')
        .sort({ bidAmount: 1 }); // Sort by lowest bid amount first
    } else {
      // Sellers can only see their own bid for this request
      bids = await Bid.find({ request: req.params.requestId, seller: req.user.id })
        .populate('seller', 'name email rating profileImage businessName phone');
    }

    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in seller's bids
// @route   GET /api/bids/my
// @access  Private (Seller)
export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ seller: req.user.id })
      .populate({
        path: 'request',
        populate: {
          path: 'buyer',
          select: 'name email rating profileImage'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update bid status (Accept, Shortlist, Withdraw)
// @route   PUT /api/bids/:id
// @access  Private
export const updateBidStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const bid = await Bid.findById(req.params.id).populate('request');

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }

    const request = bid.request;

    // Buyer actions: Shortlist or Accept
    if (['Shortlisted', 'Accepted'].includes(status)) {
      if (request.buyer.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized to update this bid status' });
      }

      bid.status = status;
      await bid.save();

      // If accepted, mark other bids as Outbid/Rejected, and mark Request as In Progress
      if (status === 'Accepted') {
        request.status = 'In Progress';
        await request.save();

        // Mark all other bids for this request as Outbid if they are not shortlisted
        await Bid.updateMany(
          { request: request._id, _id: { $ne: bid._id } },
          { status: 'Outbid' }
        );
      }
    } 
    // Seller actions: Withdraw
    else if (status === 'Withdrawn') {
      if (bid.seller.toString() !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized to withdraw this bid' });
      }

      bid.status = 'Withdrawn';
      await bid.save();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid status update request' });
    }

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
