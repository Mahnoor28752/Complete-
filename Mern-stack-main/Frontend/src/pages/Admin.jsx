import React, { useState, useEffect } from 'react';
import './Admin.css';
import StudentsTable from '../components/StudentsTable';
import TeachersTable from '../components/TeachersTable';
import { system } from '../system';

const Admin = () => {
    const [activeSection, setActiveSection] = useState('students');
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [attendance, setAttendance] = useState([]);
    
    // Student Management States
    const [studentName, setStudentName] = useState('');
    const [studentRollNo, setStudentRollNo] = useState('');
    
    // Course Management States
    const [courseCode, setCourseCode] = useState('');
    const [courseName, setCourseName] = useState('');
    
    // Teacher Management States
    const [teacherName, setTeacherName] = useState('');
    const [teacherUsername, setTeacherUsername] = useState('');
    
    // Teacher Course Assignment States
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [teacherCourses, setTeacherCourses] = useState([]);
    
    // Course-Student Management States
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchRollNo, setSearchRollNo] = useState('');
    const [searchResult, setSearchResult] = useState(null);

    // Initialize system data
    useEffect(() => {
        // Only load data if we have a token
        const token = system.getToken();
        if (!token) {
            alert('Please login first');
            window.location.href = '/login';
            return;
        }
        loadInitialData();

        // Set up an interval to refresh data periodically
        const intervalId = setInterval(loadInitialData, 30000); // Refresh every 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    // initializeSystem previously seeded localStorage; seeding is now handled on backend if needed.
    const initializeSystem = () => {
        // no-op: removed localStorage seeding. Backend should provide initial data.
    };

    const loadInitialData = async () => {
        try {
            const token = system.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            // Load teachers from the database
            const teachersResponse = await fetch('http://localhost:5000/api/admin/teachers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!teachersResponse.ok) {
                if (teachersResponse.status === 401) {
                    throw new Error('Please login again');
                }
                throw new Error('Failed to fetch teachers');
            }

            const teachersData = await teachersResponse.json();
            
            if (teachersData.success) {
                // Update users with teachers
                setUsers(prevUsers => {
                    // Filter out any existing teachers
                    const nonTeachers = prevUsers.filter(u => u.role !== 'teacher');
                    // Add new teachers from the database
                    return [...nonTeachers, ...teachersData.teachers];
                });
            }

            // Load students, teachers, courses and attendance from backend
            // Fetch students
            const studentsResp = await fetch('http://localhost:5000/api/admin/students', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const studentsData = await studentsResp.json();
            const students = studentsData && studentsData.students ? studentsData.students : [];

            // Fetch teachers
            const teachersResp = await fetch('http://localhost:5000/api/admin/teachers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const teachersData2 = await teachersResp.json();
            const teachersArr = teachersData2 && teachersData2.teachers ? teachersData2.teachers : [];

            // Set users to students + teachers
            setUsers([...students, ...teachersArr]);

            // Fetch courses
            const coursesResp = await fetch('http://localhost:5000/api/admin/courses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const coursesData = await coursesResp.json();
            const coursesList = coursesData && coursesData.courses ? coursesData.courses : [];
            setCourses(coursesList);

            // Fetch attendance (admin view)
            const attendanceResp = await fetch('http://localhost:5000/api/attendance', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const attendanceData = await attendanceResp.json();
            const attendanceList = attendanceData && attendanceData.records ? attendanceData.records : [];
            setAttendance(attendanceList);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert(error.message);
        }
    };

    // Student Management Functions
    const addStudent = async () => {
        if (!studentName || !studentRollNo) {
            alert('Please fill all fields');
            return;
        }

        try {
            const token = system.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:5000/api/admin/students', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: studentName,
                    rollNo: studentRollNo
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add student');
            }

            setUsers(prevUsers => [...prevUsers, data.user]);
            setStudentName('');
            setStudentRollNo('');
            
            alert(`Student added successfully!\nUsername: ${data.user.username}\nPassword: student123`);
        } catch (error) {
            alert(error.message);
        }
    };

    const removeStudent = async (username) => {
        if (confirm('Are you sure you want to remove this student?')) {
            try {
                const token = system.getToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`http://localhost:5000/api/admin/students/${username}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to remove student');
                }

                setUsers(prevUsers => prevUsers.filter(u => u.username !== username));
                alert('Student removed successfully');
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Course Management Functions
    const addCourse = async () => {
        if (!courseCode || !courseName) {
            alert('Please fill all fields');
            return;
        }

        const existingCourse = courses.find(c => c.code === courseCode);
        if (existingCourse) {
            alert('Course with this code already exists!');
            return;
        }

        const newCourse = { code: courseCode, name: courseName };
        try {
            const token = system.getToken();
            if (!token) throw new Error('No authentication token found');

            const resp = await system.addCourse(courseCode, courseName);
            // backend returns { ok: true, course }
            const added = resp && resp.course ? resp.course : newCourse;
            setCourses(prev => [...prev, added]);
            setCourseCode('');
            setCourseName('');
            alert(`Course ${courseName} added successfully!`);
        } catch (e) {
            alert(e.message || 'Failed to add course');
        }
    };

    const removeCourse = async (code) => {
        if (!confirm('Are you sure you want to remove this course?')) return;
        try {
            const token = system.getToken();
            if (!token) throw new Error('No authentication token found');

            const resp = await fetch(`http://localhost:5000/api/admin/courses/${code}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed to delete course');

            // Refresh data from server
            await loadInitialData();
            alert('Course removed successfully!');
        } catch (err) {
            alert(err.message || 'Failed to remove course');
        }
    };

    // Teacher Management Functions
    const addTeacher = async () => {
        if (!teacherName || !teacherUsername) {
            alert('Please fill all fields');
            return;
        }

        try {
            const token = system.getToken();
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch('http://localhost:5000/api/admin/teachers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: teacherName,
                    username: teacherUsername
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to add teacher');
            }

            setUsers(prevUsers => [...prevUsers, data.teacher]);
            setTeacherName('');
            setTeacherUsername('');
            
            alert(`Teacher ${teacherName} added successfully!\nUsername: ${data.teacher.username}`);
        } catch (error) {
            alert(error.message);
        }
    };

    const removeTeacher = async (username) => {
        if (confirm('Are you sure you want to remove this teacher?')) {
            try {
                const token = system.getToken();
                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await fetch(`http://localhost:5000/api/admin/teachers/${username}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to remove teacher');
                }

                setUsers(prevUsers => prevUsers.filter(u => u.username !== username));
                alert('Teacher removed successfully');
            } catch (error) {
                alert(error.message);
            }
        }
    };

    // Teacher Course Assignment Functions
    const assignCoursesToTeacher = async () => {
        if (!selectedTeacher || teacherCourses.length === 0) {
            alert('Please select both teacher and at least one course');
            return;
        }

        try {
            const token = system.getToken();
            if (!token) throw new Error('No authentication token found');

            const resp = await fetch(`http://localhost:5000/api/admin/users/${selectedTeacher}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ courses: teacherCourses })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed to assign courses');

            // update local state for this user
            setUsers(prev => prev.map(u => u.username === selectedTeacher ? data.user : u));
            setTeacherCourses([]);
            const teacherName = data.user?.name || selectedTeacher;
            alert(`Courses assigned successfully to ${teacherName}!`);
        } catch (err) {
            alert(err.message || 'Failed to assign courses');
        }
    };

    const removeCourseFromTeacher = async (teacherUsername, courseCode) => {
        if (!confirm('Are you sure you want to remove this course from the teacher?')) return;
        try {
            const token = system.getToken();
            if (!token) throw new Error('No authentication token found');

            const teacher = users.find(u => u.username === teacherUsername);
            const newCourses = (teacher.courses || []).filter(c => c !== courseCode);

            const resp = await fetch(`http://localhost:5000/api/admin/users/${teacherUsername}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ courses: newCourses })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed to remove course from teacher');

            setUsers(prev => prev.map(u => u.username === teacherUsername ? data.user : u));
            alert('Course removed from teacher successfully!');
        } catch (err) {
            alert(err.message || 'Failed to remove course from teacher');
        }
    };

    // Helper functions for user filtering
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');

    const addStudentsToCourse = async () => {
        if (!selectedCourse || selectedStudents.length === 0) {
            alert('Please select both course and at least one student');
            return;
        }

            try {
                const token = system.getToken();
                if (!token) throw new Error('No authentication token found');

                const resp = await fetch(`http://localhost:5000/api/admin/courses/${selectedCourse}/students`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ usernames: selectedStudents })
                });
                const data = await resp.json();
                if (!resp.ok) throw new Error(data.message || 'Failed to add students to course');

                // Refresh students and teachers from server to keep state consistent
                await loadInitialData();
                setSelectedStudents([]);
                alert(`${selectedStudents.length} student(s) added to course successfully!`);
            } catch (err) {
                alert(err.message || 'Failed to add students to course');
            }
    };

    const removeStudentFromCourse = async (studentUsername, courseCode) => {
        if (!confirm('Are you sure you want to remove this student from the course?')) return;
        try {
            const token = system.getToken();
            if (!token) throw new Error('No authentication token found');

            const student = users.find(u => u.username === studentUsername);
            const newCourses = (student.courses || []).filter(c => c !== courseCode);

            const resp = await fetch(`http://localhost:5000/api/admin/users/${studentUsername}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ courses: newCourses })
            });
            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message || 'Failed to remove student from course');

            setUsers(prev => prev.map(u => u.username === studentUsername ? data.user : u));
            alert('Student removed from course successfully!');
        } catch (err) {
            alert(err.message || 'Failed to remove student from course');
        }
    };

    // Search student courses
    const searchStudentCourses = () => {
        if (!searchRollNo.trim()) {
            alert('Please enter a roll number');
            return;
        }

        const student = students.find(s => s.rollNo === searchRollNo.trim());
        if (student) {
            setSearchResult(student);
        } else {
            setSearchResult(null);
            alert('Student not found!');
        }
    };

    // Utility Functions
    const getCourseName = (courseCode) => {
        const course = courses.find(c => c.code === courseCode);
        return course ? course.name : courseCode;
    };

    const logout = () => {
        system.logout();
    };

    // Get students in selected course
    const studentsInCourse = students.filter(student => 
        student.courses && student.courses.includes(selectedCourse)
    );

    // Get the currently selected teacher's courses
    const selectedTeacherData = teachers.find(t => t.username === selectedTeacher);

    // Get courses assigned to selected teacher
    const teacherAssignedCourses = selectedTeacherData?.courses || [];    return (
        <div className="admin-dashboard">
            <div className="dashboard-container">
                <div className="header">
                    <h1>Admin Dashboard</h1>
                    <button className="logout-btn" onClick={logout}>Logout</button>
                </div>
                
                {/* Updated Navigation with Teacher Management */}
                <div className="nav-menu">
                    <button 
                        onClick={() => setActiveSection('students')} 
                        className={activeSection === 'students' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Manage Students
                    </button>
                    <button 
                        onClick={() => setActiveSection('teachers')} 
                        className={activeSection === 'teachers' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Manage Teachers
                    </button>
                    <button 
                        onClick={() => setActiveSection('teacher-courses')} 
                        className={activeSection === 'teacher-courses' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Teacher Courses
                    </button>
                    <button 
                        onClick={() => setActiveSection('courses')} 
                        className={activeSection === 'courses' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Manage Courses
                    </button>
                    <button 
                        onClick={() => setActiveSection('course-students')} 
                        className={activeSection === 'course-students' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Course Students
                    </button>
                    <button 
                        onClick={() => setActiveSection('search-courses')} 
                        className={activeSection === 'search-courses' ? 'nav-btn active' : 'nav-btn'}
                    >
                        Search Courses
                    </button>
                    <button 
                        onClick={() => setActiveSection('reports')} 
                        className={activeSection === 'reports' ? 'nav-btn active' : 'nav-btn'}
                    >
                        View Reports
                    </button>
                </div>

                <div className="content">
                    {/* Manage Students Section */}
                    {activeSection === 'students' && (
                        <div className="section">
                            <h2>Manage Students</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Student Name"
                                        value={studentName}
                                        onChange={(e) => setStudentName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Roll Number"
                                        value={studentRollNo}
                                        onChange={(e) => setStudentRollNo(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <button className="btn success" onClick={addStudent}>Add Student</button>
                                </div>
                            </div>
                            
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Roll No</th>
                                            <th>Name</th>
                                            <th>Username</th>
                                            <th>Email</th>
                                            <th>Courses</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="no-data">No students found</td>
                                            </tr>
                                        ) : (
                                            students.map(student => (
                                                <tr key={student.username}>
                                                    <td>{student.rollNo}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.username}</td>
                                                    <td>{student.email}</td>
                                                    <td>
                                                        {student.courses && student.courses.length > 0 
                                                            ? student.courses.map(course => getCourseName(course)).join(', ')
                                                            : 'No courses'
                                                        }
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn danger"
                                                            onClick={() => removeStudent(student.username)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Manage Teachers Section */}
                    {activeSection === 'teachers' && (
                        <div className="section">
                            <h2>Manage Teachers</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Teacher Name"
                                        value={teacherName}
                                        onChange={(e) => setTeacherName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Username"
                                        value={teacherUsername}
                                        onChange={(e) => setTeacherUsername(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <button className="btn success" onClick={addTeacher}>
                                        Add Teacher
                                    </button>
                                </div>
                            </div>
                            
                            <TeachersTable 
                                teachers={users.filter(u => u.role === 'teacher')}
                                removeTeacher={removeTeacher}
                                getAssignedCourses={(courses) => 
                                    courses.map(course => getCourseName(course)).join(', ')
                                }
                            />
                        </div>
                    )}

                    {/* Teacher Course Assignment Section */}
                    {activeSection === 'teacher-courses' && (
                        <div className="section">
                            <h2>Assign Courses to Teachers</h2>
                            
                            <div className="info-message">
                                💡 Select a teacher and assign courses they will be responsible for.
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Teacher:</label>
                                    <select 
                                        value={selectedTeacher}
                                        onChange={(e) => setSelectedTeacher(e.target.value)}
                                    >
                                        <option value="">-- Select Teacher --</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher.username} value={teacher.username}>
                                                {teacher.name} ({teacher.username})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Select Courses (Multiple):</label>
                                    <select 
                                        multiple
                                        className="multi-select"
                                        value={teacherCourses}
                                        onChange={(e) => setTeacherCourses(
                                            Array.from(e.target.selectedOptions, option => option.value)
                                        )}
                                    >
                                        {courses.map(course => (
                                            <option key={course.code} value={course.code}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                    <small>Hold Ctrl/Cmd to select multiple courses</small>
                                </div>
                                
                                <div className="form-group" style={{alignSelf: 'flex-end'}}>
                                    <button className="btn success" onClick={assignCoursesToTeacher}>
                                        Assign Courses
                                    </button>
                                </div>
                            </div>

                            {/* Show currently assigned courses */}
                            {selectedTeacher && (
                                <div className="student-courses-list">
                                    <h3>Currently Assigned Courses</h3>
                                    <p><strong>Teacher:</strong> {users.find(u => u.username === selectedTeacher)?.name}</p>
                                    
                                    <div style={{marginTop: '1rem'}}>
                                        <strong>Assigned Courses:</strong>
                                        {teacherAssignedCourses.length > 0 ? (
                                            <div style={{marginTop: '0.5rem'}}>
                                                {teacherAssignedCourses.map(course => (
                                                    <span key={course} className="course-badge badge-orange">
                                                        {getCourseName(course)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{color: 'var(--gray)', fontStyle: 'italic'}}>
                                                No courses assigned
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <h3>All Teachers with Their Courses</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Teacher Name</th>
                                            <th>Username</th>
                                            <th>Assigned Courses</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachers.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="no-data">
                                                    No teachers found
                                                </td>
                                            </tr>
                                        ) : (
                                            teachers.map(teacher => (
                                                <tr key={teacher.username}>
                                                    <td>{teacher.name}</td>
                                                    <td>{teacher.username}</td>
                                                    <td>
                                                        {teacher.courses && teacher.courses.length > 0 ? (
                                                            <div>
                                                                {teacher.courses.map(course => (
                                                                    <div key={course} style={{marginBottom: '0.3rem'}}>
                                                                        <span className="course-badge">
                                                                            {getCourseName(course)}
                                                                        </span>
                                                                        <button 
                                                                            className="btn danger"
                                                                            style={{
                                                                                padding: '0.2rem 0.5rem',
                                                                                fontSize: '0.8rem',
                                                                                marginLeft: '0.5rem'
                                                                            }}
                                                                            onClick={() => removeCourseFromTeacher(teacher.username, course)}
                                                                        >
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            'No courses assigned'
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn warning"
                                                            onClick={() => {
                                                                setSelectedTeacher(teacher.username);
                                                                setTeacherCourses(teacher.courses || []);
                                                            }}
                                                        >
                                                            Edit Courses
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Rest of the sections remain the same */}
                    {/* Manage Courses Section */}
                    {activeSection === 'courses' && (
                        <div className="section">
                            <h2>Manage Courses</h2>
                            <div className="form-row">
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Course Code"
                                        value={courseCode}
                                        onChange={(e) => setCourseCode(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        placeholder="Course Name"
                                        value={courseName}
                                        onChange={(e) => setCourseName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <button className="btn success" onClick={addCourse}>Add Course</button>
                                </div>
                            </div>
                            
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Course Code</th>
                                            <th>Course Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="no-data">No courses found</td>
                                            </tr>
                                        ) : (
                                            courses.map(course => (
                                                <tr key={course.code}>
                                                    <td>{course.code}</td>
                                                    <td>{course.name}</td>
                                                    <td>
                                                        <button 
                                                            className="btn danger"
                                                            onClick={() => removeCourse(course.code)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Course Students Section */}
                    {activeSection === 'course-students' && (
                        <div className="section">
                            <h2>Manage Course Students</h2>
                            
                            <div className="info-message">
                                💡 You can select multiple students and assign them to a course at once.
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Select Course:</label>
                                    <select 
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        <option value="">-- Select Course --</option>
                                        {courses.map(course => (
                                            <option key={course.code} value={course.code}>
                                                {course.name} ({course.code})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Select Students (Multiple):</label>
                                    <select 
                                        multiple
                                        className="multi-select"
                                        value={selectedStudents}
                                        onChange={(e) => setSelectedStudents(
                                            Array.from(e.target.selectedOptions, option => option.value)
                                        )}
                                    >
                                        {students.map(student => (
                                            <option key={student.username} value={student.username}>
                                                {student.name} ({student.rollNo})
                                            </option>
                                        ))}
                                    </select>
                                    <small>Hold Ctrl/Cmd to select multiple students</small>
                                </div>
                                
                                <div className="form-group" style={{alignSelf: 'flex-end'}}>
                                    <button className="btn success" onClick={addStudentsToCourse}>
                                        Add Selected Students
                                    </button>
                                </div>
                            </div>

                            <h3>Students in Selected Course</h3>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ROLL NO</th>
                                            <th>NAME</th>
                                            <th>USERNAME</th>
                                            <th>REGISTERED COURSES</th>
                                            <th>ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentsInCourse.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="no-data">
                                                    {selectedCourse ? 'No students enrolled in this course' : 'Please select a course'}
                                                </td>
                                            </tr>
                                        ) : (
                                            studentsInCourse.map(student => (
                                                <tr key={student.username}>
                                                    <td>{student.rollNo}</td>
                                                    <td>{student.name}</td>
                                                    <td>{student.username}</td>
                                                    <td>
                                                        {student.courses && student.courses.map(course => (
                                                            <span key={course} className="course-badge">
                                                                {getCourseName(course)}
                                                            </span>
                                                        ))}
                                                    </td>
                                                    <td>
                                                        <button 
                                                            className="btn danger"
                                                            onClick={() => removeStudentFromCourse(student.username, selectedCourse)}
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Search Courses Section */}
                    {activeSection === 'search-courses' && (
                        <div className="section">
                            <h2>Search Student Courses</h2>
                            
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Enter Student Roll Number:</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., 23021519-084"
                                        value={searchRollNo}
                                        onChange={(e) => setSearchRollNo(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" style={{alignSelf: 'flex-end'}}>
                                    <button className="btn" onClick={searchStudentCourses}>
                                        Search Courses
                                    </button>
                                </div>
                            </div>

                            {searchResult && (
                                <div className="student-courses-list">
                                    <h3>Courses Registered by {searchResult.name}</h3>
                                    <p><strong>Roll No:</strong> {searchResult.rollNo}</p>
                                    <p><strong>Username:</strong> {searchResult.username}</p>
                                    
                                    <div style={{marginTop: '1rem'}}>
                                        <strong>Registered Courses:</strong>
                                        {searchResult.courses && searchResult.courses.length > 0 ? (
                                            <div style={{marginTop: '0.5rem'}}>
                                                {searchResult.courses.map(course => (
                                                    <span key={course} className="course-badge">
                                                        {getCourseName(course)}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{color: 'var(--gray)', fontStyle: 'italic'}}>
                                                No courses registered
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reports Section */}
                    {activeSection === 'reports' && (
                        <div className="section">
                            <h2>Attendance Reports</h2>
                            
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-number">{attendance.length}</div>
                                    <div className="stat-label">Total Records</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{students.length}</div>
                                    <div className="stat-label">Total Students</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{courses.length}</div>
                                    <div className="stat-label">Total Courses</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-number">{teachers.length}</div>
                                    <div className="stat-label">Total Teachers</div>
                                </div>
                            </div>
                            
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Student</th>
                                            <th>Course</th>
                                            <th>Status</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="no-data">
                                                    No attendance records found
                                                </td>
                                            </tr>
                                        ) : (
                                            attendance.map(record => {
                                                const student = users.find(u => u.username === record.studentId);
                                                const course = courses.find(c => c.code === record.courseId);
                                                const time = new Date(record.timestamp).toLocaleTimeString();
                                                
                                                return (
                                                    <tr key={record.id}>
                                                        <td>{record.date}</td>
                                                        <td>{student ? student.name : record.studentId}</td>
                                                        <td>{course ? course.name : record.courseId}</td>
                                                        <td className={`status-${record.status}`}>
                                                            {record.status.toUpperCase()}
                                                        </td>
                                                        <td>{time}</td>
                                                    </tr>
                                                );
                                            })
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

export default Admin;