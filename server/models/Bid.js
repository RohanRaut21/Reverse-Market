import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
    required: true,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bidAmount: {
    type: Number,
    required: [true, 'Please specify a bid amount'],
  },
  deliveryTime: {
    type: Number, // Number of days
    required: [true, 'Please specify delivery time in days'],
  },
  proposalMessage: {
    type: String,
    required: [true, 'Please add a proposal message'],
  },
  specsCompliance: [{
    spec: String,
    satisfied: {
      type: Boolean,
      default: false,
    }
  }],
  preferredOffered: [{
    spec: String,
    included: {
      type: Boolean,
      default: false,
    }
  }],
  qualityScore: {
    type: Number,
    default: 100,
  },
  status: {
    type: String,
    enum: ['Pending', 'Shortlisted', 'Outbid', 'Accepted', 'Withdrawn', 'Completed'],
    default: 'Pending',
  }
}, {
  timestamps: true,
});

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
