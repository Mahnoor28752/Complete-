const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  name: { type: String },
  rollNo: { type: String },
  courses: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
