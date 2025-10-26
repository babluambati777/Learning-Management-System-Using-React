import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { studentAPI, markAPI } from '../../services/api';

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudentDetails();
    fetchMarks();
    fetchStatistics();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getById(id);
      setStudent(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch student details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async () => {
    try {
      const response = await markAPI.getByStudent(id);
      setMarks(response.data.data);
    } catch (err) {
      console.error('Failed to fetch marks:', err);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await markAPI.getStatistics(id);
      setStatistics(response.data.data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="alert alert-error">{error || 'Student not found'}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/students')}>
          Back to Students
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/students')}>
        ← Back to Students
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1>{student.firstName} {student.lastName}</h1>
            <p style={{ color: '#6b7280', marginTop: '5px' }}>
              Enrollment: <strong>{student.enrollmentNumber}</strong>
            </p>
          </div>
          <span className={`badge ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
            {student.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-2" style={{ marginBottom: '30px' }}>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Email</p>
            <p style={{ fontWeight: '500' }}>{student.email}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Phone</p>
            <p style={{ fontWeight: '500' }}>{student.phone || 'N/A'}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Batch</p>
            <Link to={`/batches/${student.batch._id}`}>
              <span className="badge badge-info" style={{ cursor: 'pointer' }}>
                {student.batch.batchName}
              </span>
            </Link>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Date of Birth</p>
            <p style={{ fontWeight: '500' }}>
              {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {student.address && (
          <div style={{ marginBottom: '30px' }}>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Address</p>
            <p>{student.address}</p>
          </div>
        )}

        {statistics && (
          <>
            <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <h2 style={{ marginBottom: '20px' }}>Academic Performance</h2>
            <div className="grid grid-3" style={{ marginBottom: '30px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                <p style={{ marginBottom: '5px', opacity: 0.9 }}>Total Exams</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{statistics.totalExams}</p>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                <p style={{ marginBottom: '5px', opacity: 0.9 }}>Average</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{statistics.averagePercentage}%</p>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                <p style={{ marginBottom: '5px', opacity: 0.9 }}>Highest Score</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{statistics.highestScore}%</p>
              </div>
            </div>

            {statistics.subjectWisePerformance.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px' }}>Subject-wise Performance</h3>
                <div className="grid grid-2">
                  {statistics.subjectWisePerformance.map((subject, index) => (
                    <div key={index} className="card" style={{ background: '#f9fafb' }}>
                      <h4 style={{ marginBottom: '10px' }}>{subject.subject}</h4>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: '#6b7280' }}>Exams Taken:</span>
                        <strong>{subject.examCount}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ color: '#6b7280' }}>Marks Obtained:</span>
                        <strong>{subject.totalMarksObtained} / {subject.totalMaxMarks}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Percentage:</span>
                        <strong style={{ color: '#4f46e5' }}>{subject.percentage}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Marks History</h2>
          <Link to={`/marks?student=${student._id}`}>
            <button className="btn btn-primary">View All Marks</button>
          </Link>
        </div>

        {marks.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#6b7280' }}>
            <p>No marks recorded yet</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {marks.map((mark) => (
                  <tr key={mark._id}>
                    <td><strong>{mark.subject}</strong></td>
                    <td><span className="badge badge-info">{mark.examType}</span></td>
                    <td>{mark.marksObtained} / {mark.totalMarks}</td>
                    <td><strong>{mark.percentage}%</strong></td>
                    <td>
                      <span className={`badge ${
                        mark.grade === 'A+' || mark.grade === 'A' ? 'badge-success' :
                        mark.grade === 'B' || mark.grade === 'C' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {mark.grade}
                      </span>
                    </td>
                    <td>{new Date(mark.examDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;