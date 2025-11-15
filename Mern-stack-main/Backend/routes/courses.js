const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Public endpoint: GET /api/courses - list all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
