const express = require('express');
const router = express.Router();
const { authMiddleware, permit } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ClassSession = require('../models/ClassSession');
const Course = require('../models/Course');
const PDFDocument = require('pdfkit');

// Students and teachers and admins need access, we'll check permissions per endpoint

// POST /api/attendance/scan { qrString }
router.post('/scan', authMiddleware, async (req, res) => {
  const { qrString } = req.body;
  if (!qrString) return res.status(400).json({ message: 'qrString required' });

  let qr;
  try {
    qr = JSON.parse(qrString);
  } catch (e) {
    return res.status(400).json({ message: 'Invalid QR payload' });
  }

  if (Date.now() > qr.expiry) return res.status(400).json({ message: 'QR expired' });

  const student = await User.findOne({ username: req.user.username });
  if (!student) return res.status(404).json({ message: 'User not found' });

  if (!student.courses || !student.courses.includes(qr.courseId)) return res.status(403).json({ message: 'Not enrolled in this course' });

  const today = new Date().toISOString().split('T')[0];
  const existing = await Attendance.findOne({ studentId: student.username, courseId: qr.courseId, date: today });
  if (existing) return res.status(400).json({ message: 'Attendance already marked' });

  const course = await Course.findOne({ code: qr.courseId });

  const record = new Attendance({ studentId: student.username, studentName: student.name, rollNo: student.rollNo, courseId: qr.courseId, courseName: course ? course.name : qr.courseId, teacherId: qr.teacherId, teacherName: qr.teacherName, date: today, timestamp: new Date(), status: 'present' });
  await record.save();

  res.json({ ok: true, record });
});

// GET /api/attendance/today - get current user's today attendance
router.get('/today', authMiddleware, async (req, res) => {
  const user = req.user;
  const today = new Date().toISOString().split('T')[0];
  const records = await Attendance.find({ studentId: user.username, date: today });
  res.json({ records });
});

// GET /api/attendance/month?month=MM&year=YYYY (student)
router.get('/month', authMiddleware, async (req, res) => {
  const user = req.user;
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  if (Number.isNaN(month) || Number.isNaN(year)) return res.status(400).json({ message: 'month and year required' });

  const all = await Attendance.find({ studentId: user.username });
  const filtered = all.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  res.json({ records: filtered });
});

// Admin/teacher: get attendance for course or student
router.get('/', authMiddleware, async (req, res) => {
  const { courseId, studentId, month, year } = req.query;
  let q = {};
  if (courseId) q.courseId = courseId;
  if (studentId) q.studentId = studentId;

  let records = await Attendance.find(q).sort({ date: -1 });
  if (month !== undefined && year !== undefined) {
    const m = Number(month);
    const y = Number(year);
    records = records.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }

  res.json({ records });
});

// GET /api/attendance/report/pdf?studentId=...&month=..&year=..
router.get('/report/pdf', authMiddleware, async (req, res) => {
  const { studentId, month, year } = req.query;
  if (!studentId || !month || !year) return res.status(400).json({ message: 'studentId, month, year required' });

  const m = Number(month);
  const y = Number(year);
  const all = await Attendance.find({ studentId });
  const filtered = all.filter(r => {
    const d = new Date(r.date);
    return d.getMonth() === m && d.getFullYear() === y;
  });

  // Generate PDF
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="attendance_${studentId}_${year}_${month}.pdf"`);
  doc.fontSize(18).text('Attendance Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Student: ${studentId}`);
  doc.text(`Month: ${month}/${year}`);
  doc.moveDown();

  filtered.forEach(r => {
    doc.text(`${r.date} - ${r.courseId} - ${r.status} - ${new Date(r.timestamp).toLocaleTimeString()}`);
  });

  doc.pipe(res);
  doc.end();
});

module.exports = router;
