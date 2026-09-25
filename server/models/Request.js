import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a request title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    trim: true,
  },
  budget: {
    type: Number,
    required: [true, 'Please add a budget'],
  },
  deadline: {
    type: Date,
    required: [true, 'Please set a deadline'],
  },
  status: {
    type: String,
    enum: ['Active', 'Bidding Closed', 'In Progress', 'Completed'],
    default: 'Active',
  },
  images: [{
    type: String,
  }],
  tags: [{
    type: String,
  }],
  mandatorySpecs: [{
    type: String,
    trim: true,
  }],
  preferredSpecs: [{
    type: String,
    trim: true,
  }],
  featured: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Request = mongoose.model('Request', requestSchema);
export default Request;
