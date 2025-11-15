const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Course = require('../models/Course');
const { authMiddleware, permit } = require('../middleware/auth');

// All admin routes require admin role
router.use(authMiddleware, permit('admin'));

// POST /api/admin/students - add student
router.post('/students', async (req, res) => {
  try {
    const { name, rollNo } = req.body;
    if (!rollNo || !name) return res.status(400).json({ message: 'name and rollNo required' });

    // Create username as lowercase version of name
    const username = name.toLowerCase().replace(/\s+/g, '');
    // Generate email based on roll number
    const email = `${username}${rollNo.replace(/[^0-9]/g, '')}@students.example.com`;

    const user = new User({ 
      username: username,
      email: email,
      password: 'student123',
      role: 'student', 
      name, 
      rollNo, 
      courses: [] 
    });
    
    const savedUser = await user.save();
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;
    
    res.json({ 
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.code === 11000 ? 'User already exists' : error.message 
    });
  }
});

// GET /api/admin/students - list students
router.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .lean();
    res.json({ 
      success: true,
      students 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// DELETE /api/admin/students/:username
router.delete('/students/:username', async (req, res) => {
  const { username } = req.params;
  await User.deleteOne({ username });
  res.json({ ok: true });
});

// Teacher Management Routes
router.post('/teachers', async (req, res) => {
  try {
    const { name, username, password } = req.body;
    if (!name || !username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and username are required' 
      });
    }

    const email = `${username}@gmail.com`;
    const teacher = new User({
      username,
      email,
      password: password || 'teacher123',
      role: 'teacher',
      name,
      courses: []
    });

    const savedTeacher = await teacher.save();
    const teacherWithoutPassword = savedTeacher.toObject();
    delete teacherWithoutPassword.password;

    res.json({
      success: true,
      teacher: teacherWithoutPassword
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.code === 11000 ? 'Username already exists' : error.message
    });
  }
});

router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .select('-password')
      .lean();
    res.json({
      success: true,
      teachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.delete('/teachers/:username', async (req, res) => {
  try {
    const { username } = req.params;
    await User.deleteOne({ username, role: 'teacher' });
    res.json({
      success: true,
      message: 'Teacher removed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Courses
router.post('/courses', async (req, res) => {
  const { code, name } = req.body;
  if (!code || !name) return res.status(400).json({ message: 'code and name required' });
  const c = new Course({ code, name });
  await c.save();
  res.json({ ok: true, course: c });
});

router.get('/courses', async (req, res) => {
  const courses = await Course.find();
  res.json({ courses });
});

// DELETE /api/admin/courses/:code - remove course and unlink from users
router.delete('/courses/:code', async (req, res) => {
  try {
    const { code } = req.params;
    await Course.deleteOne({ code });
    // remove this course from all users' course lists
    await User.updateMany({ courses: code }, { $pull: { courses: code } });
    res.json({ success: true, message: 'Course deleted and users updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/users/:username - update user fields (e.g., courses)
router.patch('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const updates = req.body || {};
    // Only allow certain fields to be updated via this endpoint
    const allowed = ['courses', 'name', 'email', 'rollNo'];
    const set = {};
    for (const k of allowed) {
      if (updates[k] !== undefined) set[k] = updates[k];
    }

    const updated = await User.findOneAndUpdate({ username }, { $set: set }, { new: true }).select('-password').lean();
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/courses/:code/students - add multiple students to a course
router.post('/courses/:code/students', async (req, res) => {
  try {
    const { code } = req.params;
    const { usernames } = req.body;
    if (!Array.isArray(usernames) || usernames.length === 0) return res.status(400).json({ success: false, message: 'usernames array required' });

    // Ensure course exists
    const course = await Course.findOne({ code });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Add course to each user (use addToSet to avoid duplicates)
    const result = await User.updateMany(
      { username: { $in: usernames }, role: 'student' },
      { $addToSet: { courses: code } }
    );

    res.json({ success: true, modifiedCount: result.nModified || result.modifiedCount || 0 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
