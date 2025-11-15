const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Better error logging
mongoose.set('debug', true);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr_attendance';

// Import routes
const authRoutes = require('./routes/auth');

// Connect to MongoDB with better error handling
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const attendanceRoutes = require('./routes/attendance');
const coursesRoutes = require('./routes/courses');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/courses', coursesRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'QR Attendance Backend' }));

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    // Seed minimal data if missing
    const User = require('./models/User');
    const Course = require('./models/Course');
    const bcrypt = require('bcryptjs');

    (async () => {
      const admin = await User.findOne({ username: 'admin' });
      if (!admin) {
        await new User({ username: 'admin', password: bcrypt.hashSync('admin123', 8), role: 'admin', name: 'System Administrator' }).save();
        console.log('Seeded admin user (admin/admin123)');
      }

      // Teacher seeding intentionally omitted to avoid demo identity leakage

      // No demo student/course seeding. All data must be created via Admin UI or external migration.

      app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    })();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });