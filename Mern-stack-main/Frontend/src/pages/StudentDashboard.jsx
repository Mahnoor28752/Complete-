import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { system } from '../system'; 
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [activeSection, setActiveSection] = useState('scan');
  const [classStatus, setClassStatus] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [monthlyReport, setMonthlyReport] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [reportMonth, setReportMonth] = useState('');
  const [manualQR, setManualQR] = useState('');
  const [courses, setCourses] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const qrCheckIntervalRef = useRef(null);
  const scannerRef = useRef(null);

  // Current user state (refreshable from server)
  const [currentUser, setCurrentUser] = useState(system.getCurrentUser() || {});

  useEffect(() => {
    // Require real login for student portal. If no token present, redirect to /login.
    (async () => {
      const token = system.getToken();
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Set default month for report
      const now = new Date();
      setReportMonth(now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0'));

      // Load initial section
      showSection('scan');

      // Refresh current user from server so assignments updated by admin are reflected
      try {
        const user = await system.refreshCurrentUser();
        if (user) setCurrentUser(user);
      } catch (e) {
        console.error('Failed to refresh current user', e);
      }

      // Load courses from backend (public endpoint)
      try {
        const resp = await fetch('http://localhost:5000/api/courses');
        if (resp.ok) {
          const data = await resp.json();
          setCourses(data && data.courses ? data.courses : []);
        } else {
          console.warn('Failed to fetch courses', resp.status);
          setCourses([]);
        }
      } catch (e) {
        console.error('Failed to load courses', e);
        setCourses([]);
      }

      // Cleanup will be handled below by returning a function from outer effect
    })();

    return () => {
      // Cleanup intervals and camera
      clearInterval(qrCheckIntervalRef.current);
      stopCamera();
    };
  }, []);

  const showSection = (section) => {
    setActiveSection(section);
    
    if (section === 'scan') {
      checkClassStatus();
      startQRCheckInterval();
      initializeCamera();
    } else if (section === 'today') {
      loadTodayAttendance();
    } else {
      clearInterval(qrCheckIntervalRef.current);
      stopCamera();
    }
  };

  const startQRCheckInterval = () => {
    clearInterval(qrCheckIntervalRef.current);
    qrCheckIntervalRef.current = setInterval(() => {
      checkClassStatus();
    }, 3000);
  };

  const initializeCamera = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showCameraError('Camera not supported in this browser. Please use manual entry.');
      return;
    }
    startCamera();
  };

  const startCamera = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      video.srcObject = stream;
      await video.play();
      startQRScanning(video);
    } catch (error) {
      console.error('Camera error:', error);
      showCameraError('Unable to access camera. Please use manual entry below.');
    }
  };

  const stopCamera = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
    
    if (scannerRef.current) {
      scannerRef.current = null;
    }
  };

  const startQRScanning = (video) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    
    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          handleScannedQR(code.data);
          return;
        }
      }
      
      if (scannerRef.current !== null) {
        requestAnimationFrame(scanFrame);
      }
    };
    
    scannerRef.current = { stop: () => { scannerRef.current = null; } };
    scanFrame();
  };

  const handleScannedQR = (qrData) => {
    stopCamera();
    setScanResult('<div class="alert alert-info"><span class="loading"></span> Processing QR code...</div>');

    setTimeout(async () => {
      try {
        const resp = await system.markAttendance(qrData);
        if (resp && resp.ok) {
          setScanResult(`<div class="alert alert-success">✅ Attendance marked</div>`);
        } else {
          const msg = (resp && resp.message) ? resp.message : 'Failed to mark attendance';
          setScanResult(`<div class="alert alert-error">❌ ${msg}</div>`);
        }

        setTimeout(() => {
          loadTodayAttendance();
          checkClassStatus();
          setTimeout(() => {
            startCamera();
          }, 3000);
        }, 1000);
      } catch (err) {
        setScanResult(`<div class="alert alert-error">❌ ${err.message || 'Failed to mark attendance'}</div>`);
        setTimeout(() => {
          startCamera();
        }, 3000);
      }
    }, 1000);
  };

  const showCameraError = (message) => {
    setClassStatus(prev => prev + `
      <div class="camera-error">
        <div class="error-icon">📷</div>
        <h3>Camera Unavailable</h3>
        <p>${message}</p>
      </div>
    `);
  };

  const checkClassStatus = async () => {
    const coursesList = courses || [];
    const today = new Date().toISOString().split('T')[0];
    
    let statusHTML = '';
    const enrolledCourses = coursesList.filter(course => 
      currentUser.courses && currentUser.courses.includes(course.code)
    );
    
    if (enrolledCourses.length === 0) {
      statusHTML = `<div class="alert alert-warning">You are not enrolled in any courses. Please contact admin.</div>`;
      setClassStatus(statusHTML);
      return;
    }

    let hasActiveClass = false;
    const currentQRResp = await system.getCurrentQR();
    const currentQR = currentQRResp && currentQRResp.qrString ? currentQRResp.qrString : null;
    
    enrolledCourses.forEach(course => {
      const noClassToday = false; // noClass flags are handled server-side; default to false here
      
      if (noClassToday) {
        statusHTML += `<div class="alert alert-warning"><strong>${course.name}:</strong> 🚫 No Class Today</div>`;
      } else if (currentQR) {
        try {
          const qrData = JSON.parse(currentQR);
          
          if (qrData.courseId === course.code) {
            if (Date.now() < qrData.expiry) {
              statusHTML += `<div class="alert alert-success"><strong>${course.name}:</strong> ✅ QR Code is active! Use camera to scan.</div>`;
              hasActiveClass = true;
            } else {
              statusHTML += `<div class="alert alert-warning"><strong>${course.name}:</strong> ⏰ QR Code expired. Please ask teacher to generate new one.</div>`;
            }
          }
        } catch (error) {
          statusHTML += `<div class="alert alert-error"><strong>${course.name}:</strong> ❌ Invalid QR code. Please ask teacher to generate new one.</div>`;
        }
      } else {
        statusHTML += `<div class="alert alert-info"><strong>${course.name}:</strong> ⏳ Waiting for teacher to generate QR code.</div>`;
      }
    });
    
    if (!hasActiveClass && statusHTML === '') {
      statusHTML = `<div class="alert alert-error">📚 No active classes at the moment. Please check back later or ask teacher to generate QR code.</div>`;
    }
    
    setClassStatus(statusHTML);
  };

  const submitQRCode = async () => {
    if (!manualQR.trim()) {
      alert('Please enter QR code data');
      return;
    }

    try {
      JSON.parse(manualQR);
    } catch (error) {
      setScanResult('<div class="alert alert-error">❌ Invalid QR code format. Please check and try again.</div>');
      return;
    }

    try {
      const resp = await system.markAttendance(manualQR);
      if (resp && resp.ok) {
        setScanResult(`<div class="alert alert-success">✅ Attendance marked</div>`);
      } else {
        const msg = (resp && resp.message) ? resp.message : 'Failed to mark attendance';
        setScanResult(`<div class="alert alert-error">❌ ${msg}</div>`);
      }
      setManualQR('');
      
      setTimeout(() => {
        loadTodayAttendance();
        checkClassStatus();
      }, 1000);
    } catch (err) {
      setScanResult(`<div class="alert alert-error">❌ ${err.message || 'Failed to submit QR'}</div>`);
    }
  };

  const loadMonthlyReport = async () => {
    if (!reportMonth) {
      alert('Please select a month');
      return;
    }
    const [year, month] = reportMonth.split('-').map(Number);
    const attendanceResp = await system.getAttendanceMonth(month-1, year);
    const attendance = attendanceResp && attendanceResp.records ? attendanceResp.records : [];
    const userAttendance = attendance.filter(record => record.studentId === currentUser.username);
    
    if (userAttendance.length === 0) {
      setMonthlyReport([{
        isPlaceholder: true,
        message: `📊 No attendance records found for ${reportMonth}`
      }]);
      return;
    }

    const reportData = userAttendance
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(record => {
        const course = courses.find(c => c.code === record.courseId);
        const time = new Date(record.timestamp).toLocaleTimeString();
        return {
          date: record.date,
          course: course ? course.name : record.courseId,
          status: record.status,
          time: time
        };
      });

    setMonthlyReport(reportData);
  };

  const loadTodayAttendance = async () => {
    const today = new Date().toISOString().split('T')[0];
    const attendanceResp = await system.getAttendanceToday();
    const attendance = attendanceResp && attendanceResp.records ? attendanceResp.records : [];
    
    const enrolledCourses = courses.filter(course => 
      currentUser.courses && currentUser.courses.includes(course.code)
    );
    
    const todayAttendance = attendance.filter(record => 
      record.studentId === currentUser.username && record.date === today
    );

    if (enrolledCourses.length === 0) {
      setTodayAttendance([{
        isPlaceholder: true,
        message: 'You are not enrolled in any courses'
      }]);
      return;
    }

    const attendanceData = enrolledCourses.map(course => {
      const attended = todayAttendance.find(record => record.courseId === course.code);
      return {
        course: course.name,
        status: attended ? 'Present' : 'Absent',
        time: attended ? new Date(attended.timestamp).toLocaleTimeString() : '-'
      };
    });

    setTodayAttendance(attendanceData);
  };

  const handleLogout = () => {
    system.logout();
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Student Dashboard</h1>
            <div className="welcome-message">
              Welcome, {currentUser.name} ({currentUser.rollNo})
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="nav-menu">
          <button 
            className={`nav-btn ${activeSection === 'scan' ? 'active' : ''}`}
            onClick={() => showSection('scan')}
          >
            Scan QR Code
          </button>
          <button 
            className={`nav-btn ${activeSection === 'report' ? 'active' : ''}`}
            onClick={() => showSection('report')}
          >
            View Monthly Report
          </button>
          <button 
            className={`nav-btn ${activeSection === 'today' ? 'active' : ''}`}
            onClick={() => showSection('today')}
          >
            Today's Attendance
          </button>
        </div>

        {/* Content Area */}
        <div className="content">
          {/* Scan QR Section */}
          {activeSection === 'scan' && (
            <div className="section">
              <h2>Scan QR Code for Attendance</h2>
              
              {/* Class Status */}
              <div dangerouslySetInnerHTML={{ __html: classStatus }} />
              
              {/* Camera Scanner */}
              <div className="scanner-container">
                <div className="scanner-header">
                  <h3>📷 Camera Scanner</h3>
                  <p>Point your camera at the QR code shown by your teacher</p>
                </div>
                
                <div className="camera-placeholder">
                  <div className="camera-frame">
                    <video 
                      ref={videoRef} 
                      id="cameraPreview" 
                      playsInline
                    />
                    <div className="scan-overlay">
                      <div className="scan-frame"></div>
                      <div className="scan-line"></div>
                    </div>
                  </div>
                  <div className="camera-instructions">
                    <p>🔍 Position QR code within the frame to scan automatically</p>
                    <p>💡 Ensure good lighting for better detection</p>
                  </div>
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              {/* Manual Entry */}
              <div className="manual-entry">
                <h4>Or enter QR code manually:</h4>
                <div className="form-group">
                  <input 
                    type="text" 
                    value={manualQR}
                    onChange={(e) => setManualQR(e.target.value)}
                    placeholder="Paste QR code data here" 
                  />
                  <button className="btn success" onClick={submitQRCode}>
                    Submit Attendance
                  </button>
                </div>
              </div>
              
              {/* Scan Result */}
              <div dangerouslySetInnerHTML={{ __html: scanResult }} />
            </div>
          )}

          {/* Monthly Report Section */}
          {activeSection === 'report' && (
            <div className="section">
              <h2>Monthly Attendance Report</h2>
              <div className="form-group">
                <input 
                  type="month" 
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                />
                <button className="btn primary" onClick={loadMonthlyReport}>
                  Load Report
                </button>
              </div>
              
              <div className="table-container">
                <table id="monthlyReportTable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyReport.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="no-data">
                          Select a month to view your attendance report
                        </td>
                      </tr>
                    ) : monthlyReport[0]?.isPlaceholder ? (
                      <tr>
                        <td colSpan="4" className="no-data">
                          {monthlyReport[0].message}
                        </td>
                      </tr>
                    ) : (
                      monthlyReport.map((record, index) => (
                        <tr key={index}>
                          <td>{record.date}</td>
                          <td>{record.course}</td>
                          <td className={`status-${record.status}`}>
                            {record.status.toUpperCase()}
                          </td>
                          <td>{record.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Today's Attendance Section */}
          {activeSection === 'today' && (
            <div className="section">
              <h2>Today's Attendance</h2>
              
              <div className="table-container">
                <table id="todayAttendanceTable">
                  <thead>
                    <tr>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="no-data">
                          Loading today's attendance...
                        </td>
                      </tr>
                    ) : todayAttendance[0]?.isPlaceholder ? (
                      <tr>
                        <td colSpan="3" className="no-data">
                          {todayAttendance[0].message}
                        </td>
                      </tr>
                    ) : (
                      todayAttendance.map((item, index) => (
                        <tr key={index}>
                          <td>{item.course}</td>
                          <td>
                            <span style={{ 
                              color: item.status === 'Present' ? '#22C55E' : '#EF4444', 
                              fontWeight: 'bold' 
                            }}>
                              {item.status === 'Present' ? '✅ Present' : '❌ Absent'}
                            </span>
                          </td>
                          <td>{item.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;