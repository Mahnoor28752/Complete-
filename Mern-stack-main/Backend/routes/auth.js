const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();
const jwtSecret = process.env.JWT_SECRET || 'secret_dev_key';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  console.log('Login request body:', req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    console.log('Login validation failed:', { username, password });
    return res.status(400).json({ message: 'username and password required' });
  }

  // Accept login by username OR rollNo OR email
  const identifier = username;
  let user = await User.findOne({ $or: [ { username: identifier }, { rollNo: identifier }, { email: identifier } ] });

  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Passwords may be stored plain (for compatibility with existing frontend); support both
  const passwordMatches = (user.password === password) || bcrypt.compareSync(password, user.password);
  console.log('Found user. username:', user.username, 'passwordMatches:', passwordMatches);
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user._id, username: user.username, role: user.role, name: user.name }, jwtSecret, { expiresIn: '12h' });

  res.json({ token, user: { username: user.username, role: user.role, name: user.name, rollNo: user.rollNo, courses: user.courses } });
});

// GET /api/auth/me - return current user based on token
router.get('/me', require('../middleware/auth').authMiddleware, async (req, res) => {
  try {
    const User = require('../models/User');
    const username = req.user.username;
    const user = await User.findOne({ username }).select('-password').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Optional: signup
router.post('/signup', async (req, res) => {
  console.log('Signup request received:', req.body);
  let { username, password, role, name, rollNo, email } = req.body;
  if ((!username && !email) || !password || !role) {
    console.log('Validation failed:', { username, email, password, role });
    return res.status(400).json({ message: 'username/email, password and role required' });
  }

  // If username not provided, derive from email
  if (!username && email) {
    username = email.split('@')[0];
  }

  // Check uniqueness by username or email
  try {
    const exists = await User.findOne({ $or: [ { username }, { email } ] });
    if (exists) {
      console.log('User exists:', exists);
      return res.status(400).json({ message: 'User with same username or email exists' });
    }

    const hashed = bcrypt.hashSync(password, 8);
    const user = new User({ username, email, password: hashed, role, name, rollNo, courses: [] });
    console.log('Trying to save user:', user);
      await user.save(); // Fixed syntax error
    console.log('User saved successfully:', user._id);
    res.json({ ok: true, user });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: error.message || 'Failed to create user' });
  }
});

module.exports = router;
