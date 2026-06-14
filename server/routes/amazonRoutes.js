import express from 'express';
import { searchAmazonProducts, getProductDetails } from '../controllers/amazonController.js';

const router = express.Router();

// Public search route for real-time Amazon products
router.get('/search', searchAmazonProducts);

// Public route to fetch specific product specifications/images via SerpApi
router.get('/product/:asin', getProductDetails);

export default router;
