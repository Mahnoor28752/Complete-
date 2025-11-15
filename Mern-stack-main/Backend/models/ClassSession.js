const mongoose = require('mongoose');

const ClassSessionSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  teacherId: { type: String, required: true },
  teacherName: { type: String },
  timestamp: { type: Date, default: Date.now },
  expiry: { type: Number, required: true }, // epoch ms
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
