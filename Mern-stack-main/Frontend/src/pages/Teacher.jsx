import React, { useState, useEffect } from 'react';
import './Teacher.css';
import { system } from '../system';

const Teacher = () => {
    const [activeSection, setActiveSection] = useState('qr');
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);
    const [coursesMessage, setCoursesMessage] = useState('');
    const [attendance, setAttendance] = useState([]);
    const [currentQR, setCurrentQR] = useState(null);
    const [qrTimer, setQrTimer] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [reportCourse, setReportCourse] = useState('');
    const [attendanceMonth, setAttendanceMonth] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [noClassFlags, setNoClassFlags] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // Initialize system data — require real teacher login; do not auto-login with dummy credentials
    useEffect(() => {
        (async () => {
            const token = system.getToken();
            // If no token, send user to login page
            if (!token) {
                window.location.href = '/login';
                return;
            }

            // Refresh current user from server and set state
            try {
                const user = await system.refreshCurrentUser();
                setCurrentUser(user || system.getCurrentUser());
            } catch (e) {
                console.error('Failed to refresh current user', e);
            }

            // Load courses/attendance and check for existing QR after auth is available
            try {
                await loadInitialData();
            } catch (e) {
                console.error('loadInitialData failed', e);
            }

            try {
                await checkExistingQR();
            } catch (e) {
                console.error('checkExistingQR failed', e);
            }

            // Set current month as default
            const now = new Date();
            setAttendanceMonth(now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));
        })();
    }, []);

    const initializeSystem = () => {
        // seeding moved to backend; no localStorage usage in frontend
    };

    const loadInitialData = async () => {
        try {
            const token = system.getToken();
            if (token) {
                // Fetch courses assigned to this teacher
                try {
                    setLoadingCourses(true);
                    setCoursesMessage('Loading courses...');
                    const coursesResp = await fetch('http://localhost:5000/api/teacher/courses', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const coursesData = await coursesResp.json();
                    if (coursesResp.ok && coursesData && coursesData.courses) {
                        setCourses(coursesData.courses);
                        if (!coursesData.courses.length) setCoursesMessage('No courses assigned to this teacher');
                        else setCoursesMessage('');
                    } else {
                        console.warn('Failed to load teacher courses', coursesResp.status, coursesData);
                        setCoursesMessage('Failed to load courses from server');
                    }
                } catch (e) {
                    console.error('Error fetching teacher courses', e);
                    setCoursesMessage('Failed to load courses');
                } finally {
                    setLoadingCourses(false);
                }

                // Try fetch attendance (teacher can access attendance endpoints)
                try {
                    const attendanceResp = await fetch('http://localhost:5000/api/attendance', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const attendanceData = await attendanceResp.json();
                    if (attendanceData && attendanceData.records) setAttendance(attendanceData.records);
                } catch (e) { }
            }

            // No local fallback course data: if backend didn't return courses, keep the empty list
            // Admin should create courses via the Admin UI.
        } catch (err) {
            console.error('Error loading initial data', err);
        }
    };

    const checkExistingQR = async () => {
        try {
            const resp = await system.getCurrentQR();
            if (resp && resp.qrString) {
                setCurrentQR(resp.qrString);
                try {
                    const qrData = JSON.parse(resp.qrString);
                    setSelectedCourse(qrData.courseId);
                    if (qrData.expiry) startQRTimer(qrData.expiry);
                } catch (e) { }
            } else {
                setCurrentQR(null);
            }
        } catch (err) {
            console.error('Error checking current QR', err);
        }
    };

    const generateQRCode = async () => {
        if (!selectedCourse) {
            alert('Please select a course');
            return;
        }

        if (!currentUser) {
            alert('User not logged in');
            return;
        }

        // Verify assignment using the courses fetched for this teacher
        const assigned = courses.some(c => c.code === selectedCourse);
        if (!assigned) {
            alert(`You are not assigned to teach ${getCourseName(selectedCourse)}. Please contact admin.`);
            return;
        }

        if (hasNoClassToday(selectedCourse)) {
            alert(`❌ Cannot generate QR code. ${getCourseName(selectedCourse)} is marked as "No Class" today.`);
            return;
        }

        // Use API-backed system to create session
        const result = await system.generateQRCode(selectedCourse, 15);
        if (result && result.ok) {
            setCurrentQR(result.qrString);
            if (result.session && result.session.expiry) startQRTimer(result.session.expiry);
            alert('✅ QR Code generated successfully! Students can now scan it.');
        } else {
            alert(result.message || 'Failed to generate QR');
        }
    };

    const startQRTimer = (expiryTime) => {
        const updateTimer = () => {
            const now = Date.now();
            const remaining = expiryTime - now;
            
            if (remaining <= 0) {
                setQrTimer('QR Code Expired');
                setCurrentQR(null);
                return;
            }

            const minutes = Math.floor(remaining / 60000);
            const seconds = Math.floor((remaining % 60000) / 1000);
            setQrTimer(`Expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const timerInterval = setInterval(updateTimer, 1000);
        
        // Cleanup interval on component unmount or QR expiry
        return () => clearInterval(timerInterval);
    };

    const displayQRCode = () => {
        if (!currentQR) {
            alert('Please generate QR code first');
            return;
        }

        const qrData = JSON.parse(currentQR);
        const course = courses.find(c => c.code === qrData.courseId);
        
        const displayWindow = window.open('', 'QR Display', 'width=500,height=600');
        displayWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code Display</title>
                <style>
                    body { 
                        text-align: center; 
                        padding: 40px; 
                        font-family: Arial, sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        height: 100vh;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                    }
                    .container { 
                        background: white; 
                        padding: 30px; 
                        border-radius: 15px;
                        color: #333;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    h2 { color: #333; margin-bottom: 20px; }
                    #displayQR { margin: 20px 0; }
                    button { 
                        padding: 10px 20px; 
                        margin: 10px; 
                        cursor: pointer; 
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    button:hover { background: #5a6fd8; }
                    .info { margin: 15px 0; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>📱 Scan QR Code for Attendance</h2>
                    <div class="info">
                        <strong>Course:</strong> ${course ? course.name : qrData.courseId}<br>
                        <strong>Teacher:</strong> ${qrData.teacherName}<br>
                        <strong>Time:</strong> ${new Date().toLocaleTimeString()}
                    </div>
                    <div id="displayQR"></div>
                    <p>Students should scan this QR code with their phones</p>
                    <div>
                        <button onclick="window.print()">🖨️ Print</button>
                        <button onclick="window.close()">❌ Close</button>
                    </div>
                </div>
                <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
                <script>
                    new QRCode(document.getElementById('displayQR'), {
                        text: '${currentQR}',
                        width: 250,
                        height: 250,
                        colorDark: "#000000",
                        colorLight: "#ffffff"
                    });
                </script>
            </body>
            </html>
        `);
    };

    const printQRCode = () => {
        if (!currentQR) {
            alert('Please generate QR code first');
            return;
        }

        const qrData = JSON.parse(currentQR);
        const course = courses.find(c => c.code === qrData.courseId);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print QR Code</title>
                <style>
                    body { text-align: center; font-family: Arial; padding: 40px; }
                    .qr-container { margin: 30px 0; }
                    h2 { color: #333; }
                    .course-info { margin: 20px 0; font-size: 18px; }
                    .timestamp { color: #666; margin: 10px 0; }
                </style>
            </head>
            <body>
                <h2>🎓 Attendance QR Code</h2>
                <div class="course-info">
                    <strong>Course:</strong> ${course ? course.name : qrData.courseId}<br>
                    <strong>Teacher:</strong> ${qrData.teacherName}<br>
                    <strong>Date:</strong> ${new Date().toLocaleDateString()}
                </div>
                <div class="qr-container">
                    <div id="printQR"></div>
                </div>
                <div class="timestamp">
                    Generated: ${new Date().toLocaleTimeString()}<br>
                    Valid for 15 minutes
                </div>
                <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
                <script>
                    new QRCode(document.getElementById('printQR'), {
                        text: '${currentQR}',
                        width: 200,
                        height: 200
                    });
                    window.onload = function() {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    }
                </script>
            </body>
            </html>
        `);
    };

    const markNoClass = () => {
        if (!selectedCourse) {
            alert('Please select a course first');
            return;
        }

        // Ensure selected course is in the fetched teacher courses list
        const assigned = courses.some(c => c.code === selectedCourse);
        if (!assigned) {
            alert(`You are not assigned to teach ${getCourseName(selectedCourse)}`);
            return;
        }

        if (confirm(`Mark "No Class" for ${getCourseName(selectedCourse)} today? This will show "No Class Today" to students.`)) {
            const today = new Date().toISOString().split('T')[0];
            const flag = {
                courseId: selectedCourse,
                date: today,
                timestamp: new Date().toISOString(),
                teacherId: currentUser.username
            };

            const updatedFlags = [...noClassFlags, flag];
            setNoClassFlags(updatedFlags);
            // Persist no-class flag to backend if possible
            (async () => {
                try {
                    const token = system.getToken();
                    if (token) {
                        await fetch('http://localhost:5000/api/teacher/no-class', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ courseId: selectedCourse })
                        });
                    }
                } catch (e) { console.error('Failed to persist no-class flag', e); }
            })();
            
            // Clear QR code for this course
            if (currentQR) {
                const qrData = JSON.parse(currentQR);
                if (qrData.courseId === selectedCourse) {
                    setCurrentQR(null);
                    setQrTimer('');
                }
            }
            
            alert(`✅ ${getCourseName(selectedCourse)} marked as "No Class" for today. Students will see "No Class Today" message.`);
        }
    };

    const removeNoClassFlag = (courseId) => {
        if (confirm('Remove "No Class" status for this course?')) {
            const today = new Date().toISOString().split('T')[0];
            const updatedFlags = noClassFlags.filter(flag => 
                !(flag.courseId === courseId && flag.date === today)
            );
            setNoClassFlags(updatedFlags);
            alert('"No Class" status removed successfully!');
        }
    };

    const loadAttendanceReport = () => {
        if (!reportCourse || !attendanceMonth) {
            const emptyData = [{
                date: '',
                studentName: 'Please select a course and month',
                rollNo: '',
                status: '',
                time: ''
            }];
            setAttendanceData(emptyData);
            return;
        }

        const [year, month] = attendanceMonth.split('-').map(Number);
        const filteredAttendance = attendance.filter(record => {
            if (record.courseId !== reportCourse) return false;
            
            const recordDate = new Date(record.date);
            return recordDate.getMonth() === month - 1 && recordDate.getFullYear() === year;
        });

        if (filteredAttendance.length === 0) {
            const emptyData = [{
                date: '',
                studentName: 'No attendance records found',
                rollNo: '',
                status: '',
                time: ''
            }];
            setAttendanceData(emptyData);
        } else {
            // Sort by date and time (newest first)
            filteredAttendance.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setAttendanceData(filteredAttendance);
        }
    };

    const downloadPDF = () => {
        if (attendanceData.length === 0 || attendanceData[0].studentName.includes('No attendance')) {
            alert('No data available to download');
            return;
        }

        const course = courses.find(c => c.code === reportCourse);
        const courseName = course ? course.name : reportCourse;
        
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Attendance Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h2 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #f2f2f2; font-weight: bold; }
                    .present { color: #4caf50; font-weight: bold; }
                    .absent { color: #f44336; font-weight: bold; }
                </style>
            </head>
            <body>
                <h2>📊 Attendance Report</h2>
                <div class="summary">
                    <p><strong>Course:</strong> ${courseName}</p>
                    <p><strong>Month:</strong> ${attendanceMonth}</p>
                    <p><strong>Total Records:</strong> ${attendanceData.length}</p>
                    <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Generated by:</strong> ${currentUser?.name}</p>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Student Name</th>
                            <th>Roll No</th>
                            <th>Status</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${attendanceData.map(record => `
                            <tr>
                                <td>${record.date}</td>
                                <td>${record.studentName}</td>
                                <td>${record.rollNo}</td>
                                <td class="${record.status === 'present' ? 'present' : 'absent'}">${record.status.toUpperCase()}</td>
                                <td>${new Date(record.timestamp).toLocaleTimeString()}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance-${courseName}-${attendanceMonth}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const logout = () => {
        system.logout();
    };

    // Get course name helper
    const getCourseName = (courseCode) => {
        const course = courses.find(c => c.code === courseCode);
        return course ? course.name : courseCode;
    };

    // Get QR data for display
    const getQRData = () => {
        if (!currentQR) return null;
        try {
            return JSON.parse(currentQR);
        } catch {
            return null;
        }
    };

    // Get teacher's assigned courses
    const getTeacherCourses = () => {
        // The backend endpoint /api/teacher/courses returns the course documents
        // (or placeholders) for the logged-in teacher. Use that list directly
        // to populate the dropdown so UI matches DB assignments.
        return courses || [];
    };

    // Check if course has "No Class" today
    const hasNoClassToday = (courseCode) => {
        const today = new Date().toISOString().split('T')[0];
        return noClassFlags.some(flag => flag.courseId === courseCode && flag.date === today);
    };

    const qrData = getQRData();
    const teacherCourses = getTeacherCourses();

    return (
        <div className="teacher-dashboard">
            <div className="dashboard-container">
                <div className="header">
                    <div>
                        <h1>Teacher Dashboard</h1>
                        {currentUser && (
                            <p className="welcome-message">Welcome, {currentUser.name}!</p>
                        )}
                    </div>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
                
                <div className="nav-menu">
                    <button 
                        onClick={() => setActiveSection('qr')} 
                        className={activeSection === 'qr' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Generate QR Code
                    </button>
                    <button 
                        onClick={() => setActiveSection('attendance')} 
                        className={activeSection === 'attendance' ? 'nav-btn active' : 'nav-btn'}
                    >
                        View Attendance
                    </button>
                    <button 
                        onClick={() => setActiveSection('no-class')} 
                        className={activeSection === 'no-class' ? 'nav-btn active' : 'nav-btn'}
                    >
                        No Class Management
                    </button>
                </div>

                <div className="content">
                    {/* QR Code Section */}
                    {activeSection === 'qr' && (
                        <div className="section">
                            <h2>Generate QR Code for Class</h2>
                            
                            {currentUser ? (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Select Course:</label>
                                            <select 
                                                value={selectedCourse}
                                                onChange={(e) => setSelectedCourse(e.target.value)}
                                            >
                                                <option value="">-- Select Course --</option>
                                                    {teacherCourses.map(course => (
                                                        <option key={course.code} value={course.code}>
                                                            {course.name} ({course.code})
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>

                                        <div style={{ marginTop: 8 }}>
                                            <button className="btn small" onClick={async () => { await loadInitialData(); }} type="button">Refresh Courses</button>
                                            <span style={{ marginLeft: 12, color: '#666' }}>{loadingCourses ? 'Loading...' : coursesMessage}</span>
                                        </div>
                                        
                                        <div className="form-group" style={{alignSelf: 'flex-end'}}>
                                            <button 
                                                className="btn success" 
                                                onClick={generateQRCode}
                                                disabled={!selectedCourse || hasNoClassToday(selectedCourse)}
                                            >
                                                Generate QR Code
                                            </button>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <button className="btn" onClick={displayQRCode} disabled={!currentQR}>
                                            Display on Screen
                                        </button>
                                        <button className="btn" onClick={printQRCode} disabled={!currentQR}>
                                            Print QR Code
                                        </button>
                                        <button className="btn warning" onClick={markNoClass} disabled={!selectedCourse}>
                                            No Class Today
                                        </button>
                                    </div>
                                    
                                   

                                    {!currentQR && (
                                        <div className="info-message">
                                            💡 Select a course from your assigned courses and generate QR code to start attendance session.
                                            The QR code will be valid for 15 minutes.
                                        </div>
                                    )}

                                    {/* Show teacher's assigned courses */}
                                    <div className="teacher-courses-info">
                                        <h3>Your Assigned Courses</h3>
                                        <div className="courses-list">
                                            {teacherCourses.length > 0 ? (
                                                teacherCourses.map(course => (
                                                    <div key={course.code} className="course-item">
                                                        <span className="course-name">{course.name} ({course.code})</span>
                                                        {hasNoClassToday(course.code) && (
                                                            <span className="no-class-badge">No Class Today</span>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-courses">No courses assigned. Please contact admin.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="error-message">
                                    ❌ User not logged in. Please login to access teacher features.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Attendance Section */}
                    {activeSection === 'attendance' && (
                        <div className="section">
                            <h2>Attendance Records</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Course:</label>
                                    <select 
                                        value={reportCourse}
                                        onChange={(e) => setReportCourse(e.target.value)}
                                    >
                                        <option value="">-- Select Course --</option>
                                        {teacherCourses.map(course => (
                                            <option key={course.code} value={course.code}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Select Month:</label>
                                    <input 
                                        type="month" 
                                        value={attendanceMonth}
                                        onChange={(e) => setAttendanceMonth(e.target.value)}
                                    />
                                </div>
                                
                                <div className="form-group" style={{alignSelf: 'flex-end'}}>
                                    <button className="btn success" onClick={loadAttendanceReport}>
                                        Load Report
                                    </button>
                                </div>
                            </div>

                            <div className="action-buttons">
                                <button className="btn" onClick={downloadPDF} disabled={!reportCourse}>
                                    Download Report
                                </button>
                            </div>

                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Student Name</th>
                                            <th>Roll No</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="no-data">
                                                    Select a course and month to view attendance records
                                                </td>
                                            </tr>
                                        ) : (
                                            attendanceData.map(record => (
                                                <tr key={record.id}>
                                                    <td>{record.date}</td>
                                                    <td>{record.studentName}</td>
                                                    <td>{record.rollNo}</td>
                                                    <td className={`status-${record.status}`}>
                                                        {record.status.toUpperCase()}
                                                    </td>
                                                    <td>{new Date(record.timestamp).toLocaleTimeString()}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* No Class Management Section */}
                    {activeSection === 'no-class' && (
                        <div className="section">
                            <h2>No Class Management</h2>
                            
                            <div className="info-message">
                                💡 Manage "No Class" status for your courses. When marked as "No Class", 
                                students will see a "No Class Today" message instead of the QR code.
                            </div>

                            <div className="no-class-management">
                                <h3>Mark No Class for Today</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Select Course:</label>
                                        <select 
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                        >
                                            <option value="">-- Select Course --</option>
                                            {teacherCourses.map(course => (
                                                <option key={course.code} value={course.code}>
                                                    {course.name} ({course.code})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="form-group" style={{alignSelf: 'flex-end'}}>
                                        <button className="btn warning" onClick={markNoClass} disabled={!selectedCourse}>
                                            Mark No Class
                                        </button>
                                    </div>
                                </div>

                                <h3>Today's No Class Status</h3>
                                <div className="no-class-list">
                                    {teacherCourses.length === 0 ? (
                                        <p className="no-data">No courses assigned</p>
                                    ) : (
                                        teacherCourses.map(course => {
                                            const isNoClass = hasNoClassToday(course.code);
                                            return (
                                                <div key={course.code} className="no-class-item">
                                                    <div className="course-info">
                                                        <strong>{course.name}</strong> ({course.code})
                                                    </div>
                                                    <div className="status-info">
                                                        {isNoClass ? (
                                                            <>
                                                                <span className="no-class-status">🚫 No Class Today</span>
                                                                <button 
                                                                    className="btn danger"
                                                                    onClick={() => removeNoClassFlag(course.code)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="class-status">✅ Class Scheduled</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Load QRCode library */}
            <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
        </div>
    );
};

export default Teacher;