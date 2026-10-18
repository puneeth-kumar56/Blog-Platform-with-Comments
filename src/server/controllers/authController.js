import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'devscribe_super_secret_jwt_key_2026_change_in_production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

export const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    if (!name || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        message: 'Name is required and must be at least 2 characters long.',
      });
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    const existing = await db.users.findOne({ email });
    if (existing) {
      res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in or use a different email.',
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.users.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      bio: bio ? bio.trim() : 'Blogger and technology enthusiast',
    });

    const token = generateToken(newUser._id);
    const { password: _, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[AuthController.register] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
      return;
    }

    const user = await db.users.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      token,
      user: safeUser,
    });
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Not authorized.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    user: req.user,
  });
};
