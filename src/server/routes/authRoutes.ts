import express from 'express';
import { login, register, checkAuth } from '../controllers/authController.js';
import { getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/check', authMiddleware, checkAuth);
router.get('/profile', authMiddleware, getUserProfile);
router.put('/profile', authMiddleware, updateUserProfile);

export default router;