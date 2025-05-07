import User from '../models/user.model';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader: string | undefined = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.json({ 
      code: 400,
      message: 'Authentication required' 
    });
    return;
  }
    
  const token:string = authHeader.split(' ')[1];

  try {
    const jwtScretKey: string | undefined = process.env.JWT_SECRET_KEY;
    if (!jwtScretKey) {
      throw new Error('JWT_SECRET_KEY is not defined in environment variables');
    }

    const decoded = jwt.verify(token, jwtScretKey);

    const { userId }: any = decoded;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
}