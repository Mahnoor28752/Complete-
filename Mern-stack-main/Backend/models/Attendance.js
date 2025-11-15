const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  studentName: { type: String },
  rollNo: { type: String },
  courseId: { type: String, required: true },
  courseName: { type: String },
  teacherId: { type: String },
  teacherName: { type: String },
  date: { type: String }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['present', 'absent'], default: 'present' }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
