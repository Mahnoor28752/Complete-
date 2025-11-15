import React from 'react';

const StudentsTable = ({ users, removeStudent, getCourseName }) => {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>ROLL NO</th>
                        <th>NAME</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>COURSES</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {users.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="no-data">No students found</td>
                        </tr>
                    ) : (
                        users.filter(user => user.role === 'student').map(student => (
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
    );
};

export default StudentsTable;