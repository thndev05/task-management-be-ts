import { Request, Response } from 'express';
import md5 from 'md5';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

export const register = async (req: Request, res: Response) => {
  req.body.password = md5(req.body.password);
  const existEmail = await User.findOne({ 
    email: req.body.email,
    deleted: false 
  }); 

  if(existEmail) {
    res.json({
      code: 400,
      message: 'Email already exists'
    });

    return;
  } else {

    const user = new User({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });
    await user.save();

    res.json({
      code: 200,
      message: 'Register successfully',
    })
  }
}

export const login = async (req: Request, res: Response) => {
  const email: string = req.body.email;
  const password: string = req.body.password;

  const user = await User.findOne({ 
    email: email,
    deleted: false, 
  });

  if(!user) {
    res.json({
      code: 400,
      message: 'Invalid email'
    });

    return;
  }

  if(md5(password) !== user.password) {
    res.json({
      code: 400,
      message: 'Invalid password'
    });

    return;
  }

  const jwtScretKey: string | undefined = process.env.JWT_SECRET_KEY;
  if (!jwtScretKey) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables');
  }

  const token = jwt.sign(
    { userId: user._id },
    jwtScretKey, 
    { expiresIn: "7d" }
  );

  res.cookie("token", token);

  res.json({
    code: 200,
    message: 'Login successfully',
    token: token
  })
}

export const detail = async (req: Request, res: Response) => {
  try {
    res.json({
      code: 200,
      message: 'Detail user successfully',
      info: req.user
    });
    
  } catch (err) { 
    res.json({
      code: 400,
      message: err
    });
  }
}