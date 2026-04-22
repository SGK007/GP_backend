import { Router, Request, Response } from 'express';
import { signup, login } from '../services/authService';
import { getProfile, updateProfile } from '../controllers/user.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

interface SignupRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'LAWYER';
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

router.post('/signup', async (req: SignupRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    if (!['USER', 'LAWYER'].includes(role)) {
      res.status(400).json({ error: 'Invalid role. Must be USER or LAWYER' });
      return;
    }

    const result = await signup({ name, email, password, role });
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Email already exists') {
        res.status(409).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.post('/login', async (req: LoginRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const result = await login({ email, password });
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Invalid email or password') {
        res.status(401).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

export default router;
