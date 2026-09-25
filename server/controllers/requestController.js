import Request from '../models/Request.js';
import Bid from '../models/Bid.js';

// @desc    Create new request
// @route   POST /api/requests
// @access  Private (Buyer)
export const createRequest = async (req, res) => {
  try {
    const { title, description, category, budget, deadline, images, tags, mandatorySpecs, preferredSpecs } = req.body;

    const request = await Request.create({
      buyer: req.user.id,
      title,
      description,
      category,
      budget,
      deadline,
      images: images || [],
      tags: tags || [],
      mandatorySpecs: Array.isArray(mandatorySpecs) ? mandatorySpecs.filter(s => typeof s === 'string' && s.trim().length > 0) : [],
      preferredSpecs: Array.isArray(preferredSpecs) ? preferredSpecs.filter(s => typeof s === 'string' && s.trim().length > 0) : [],
    });

    res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all requests (Sellers browse requests)
// @route   GET /api/requests
// @access  Private
export const getRequests = async (req, res) => {
  try {
    const { category, search, status } = req.query;
    const userId = req.user?._id || req.user?.id;
    
    // Sellers should only see requests posted by other users, strictly excluding their own requests
    let query = userId ? { buyer: { $ne: userId } } : {};

    // Filter by category
    if (category && category !== 'All' && category !== 'All Requests') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    // Filter by status (default to Active if not specified for listing)
    if (status) {
      query.status = status;
    }

    // Search keyword in title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $in: [searchRegex] } }
      ];
    }

    const requests = await Request.find(query)
      .populate('buyer', 'name email rating profileImage')
      .sort({ createdAt: -1 });

    // Fetch bid counts for each request
    const requestsWithBidCount = await Promise.all(
      requests.map(async (request) => {
        const bidCount = await Bid.countDocuments({ request: request._id });
        return {
          ...request.toObject(),
          bidCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: requestsWithBidCount.length,
      data: requestsWithBidCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in buyer's requests
// @route   GET /api/requests/my
// @access  Private (Buyer)
export const getMyRequests = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const requests = await Request.find({ buyer: userId }).sort({ createdAt: -1 });

    // Populate bid count for each
    const requestsWithBidCount = await Promise.all(
      requests.map(async (request) => {
        const bidCount = await Bid.countDocuments({ request: request._id, seller: { $ne: userId } }); // Only count bids from other sellers
        return {
          ...request.toObject(),
          bidCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: requestsWithBidCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get request by ID
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('buyer', 'name email rating profileImage');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const bidsCount = await Bid.countDocuments({ request: request._id, seller: { $ne: req.user.id } }); // Only count bids from other sellers

    res.status(200).json({
      success: true,
      data: {
        ...request.toObject(),
        bidCount: bidsCount
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update request status/details
// @route   PUT /api/requests/:id
// @access  Private (Buyer)
export const updateRequest = async (req, res) => {
  try {
    let request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Make sure user is request owner
    if (request.buyer.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized to update this request' });
    }

    request = await Request.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
