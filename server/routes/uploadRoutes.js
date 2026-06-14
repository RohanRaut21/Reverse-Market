import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload base64 image to Cloudinary
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { image } = req.body; // Expecting data URI base64 string
    if (!image) {
      return res.status(400).json({ success: false, message: 'Please provide an image' });
    }

    // Configure Cloudinary explicitly (it also auto-picks process.env.CLOUDINARY_URL)
    cloudinary.config();

    // Limit base64 input length or type if needed, but Cloudinary handles it
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'reverse_market_requests',
      resource_type: 'auto'
    });

    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
});

export default router;
