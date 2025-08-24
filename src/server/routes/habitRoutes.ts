// src/routes/habitRoutes.ts
import * as express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getHabits, updateHabit, initializeHabits } from '../controllers/habitController.js';

const router = express.Router();

router.get('/', authMiddleware, getHabits);
router.post('/initialize', authMiddleware, initializeHabits);
router.put('/:habitId', authMiddleware, updateHabit);

export default router;
