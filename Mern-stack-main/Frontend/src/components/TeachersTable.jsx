import React from 'react';

const TeachersTable = ({ teachers, removeTeacher, getAssignedCourses }) => {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>NAME</th>
                        <th>USERNAME</th>
                        <th>EMAIL</th>
                        <th>ASSIGNED COURSES</th>
                        <th>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="no-data">No teachers found</td>
                        </tr>
                    ) : (
                        teachers.map(teacher => (
                            <tr key={teacher.username}>
                                <td>{teacher.name}</td>
                                <td>{teacher.username}</td>
                                <td>{teacher.email}</td>
                                <td>
                                    {teacher.courses && teacher.courses.length > 0 
                                        ? getAssignedCourses(teacher.courses)
                                        : 'No courses assigned'
                                    }
                                </td>
                                <td>
                                    <button 
                                        className="btn danger"
                                        onClick={() => removeTeacher(teacher.username)}
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

export default TeachersTable;