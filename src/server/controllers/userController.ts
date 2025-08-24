import { Request, Response } from 'express';
import { User } from '../models/User.js';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    const { name: displayName, email }: { name?: string; email?: string } = req.body;
    if (displayName && typeof displayName === 'string') user.displayName = displayName;
    if (email && typeof email === 'string') user.email = email;

    await user.save();
    res.json({ displayName: user.displayName, email: user.email });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
