QR Attendance Backend

Setup

1. Install dependencies:

   npm install

2. Create .env file (or copy .env.example) and set:

   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/qr_attendance
   JWT_SECRET=your_jwt_secret

3. Start MongoDB (local or Atlas). Then run:

   npm run dev

What this provides

- Authentication: /api/auth/login
- Admin endpoints: /api/admin/students, /api/admin/courses
- Teacher endpoints: /api/teacher/generate, /api/teacher/current
- Attendance endpoints: /api/attendance/scan, /api/attendance/today, /api/attendance/month
- PDF export: /api/attendance/report/pdf?studentId=...&month=..&year=..

Notes

- The backend seeds a default admin (admin/admin123), teacher (teacher1/teacher123), student (student1/student123) and course CS101 on first run if missing.
- Frontend expects the API on http://localhost:5000/api by default. You can change by setting REACT_APP_API_BASE when building the frontend.
