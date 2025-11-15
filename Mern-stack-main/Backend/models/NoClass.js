const mongoose = require('mongoose');

const NoClassSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  teacherId: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound unique index to prevent duplicates
NoClassSchema.index({ courseId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('NoClass', NoClassSchema);