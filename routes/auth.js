import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: 'All fields are required' });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, password: hashedPassword, role });
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.status(201).json({ token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

router.get('/me', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;
