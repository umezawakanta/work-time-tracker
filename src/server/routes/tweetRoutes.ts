import express from 'express';
import { createTweet, getTweets } from '../controllers/tweetController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createTweet);
router.get('/', authMiddleware, getTweets);

export default router;