import express from 'express';
import { Request, Response } from 'express';
import { login, register, checkAuth, updateProfile, getUserData } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/check', authMiddleware, checkAuth);
router.get('/profile', authMiddleware, (req: Request, res: Response) => res.json({ user: req.user }));
router.put('/profile', authMiddleware, updateProfile);
router.get('/user', authMiddleware, getUserData);

export default router;