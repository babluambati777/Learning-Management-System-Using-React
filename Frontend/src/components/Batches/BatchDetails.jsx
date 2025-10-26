import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { batchAPI } from '../../services/api';

const BatchDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatchDetails();
  }, [id]);

  const fetchBatchDetails = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getById(id);
      setBatch(response.data.data);
      setStudents(response.data.data.students || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch batch details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="alert alert-error">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/batches')}>
          Back to Batches
        </button>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="container" style={{ marginTop: '30px' }}>
        <div className="alert alert-error">Batch not found</div>
        <button className="btn btn-secondary" onClick={() => navigate('/batches')}>
          Back to Batches
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <button className="btn btn-secondary mb-2" onClick={() => navigate('/batches')}>
        ← Back to Batches
      </button>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1>{batch.batchName}</h1>
            <p style={{ color: '#6b7280', marginTop: '5px' }}>
              Code: <strong>{batch.batchCode}</strong>
            </p>
          </div>
          <span className={`badge ${batch.isActive ? 'badge-success' : 'badge-danger'}`}>
            {batch.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="grid grid-2" style={{ marginBottom: '30px' }}>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Start Date</p>
            <p style={{ fontWeight: '500' }}>{new Date(batch.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>End Date</p>
            <p style={{ fontWeight: '500' }}>{new Date(batch.endDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Total Students</p>
            <p style={{ fontWeight: '500', fontSize: '24px', color: '#4f46e5' }}>{batch.totalStudents}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Created On</p>
            <p style={{ fontWeight: '500' }}>{new Date(batch.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {batch.description && (
          <div style={{ marginBottom: '30px' }}>
            <p style={{ color: '#6b7280', marginBottom: '5px' }}>Description</p>
            <p>{batch.description}</p>
          </div>
        )}

        <hr style={{ margin: '30px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Students in this Batch</h2>
          <Link to={`/students?batch=${batch._id}`}>
            <button className="btn btn-primary">View All Students</button>
          </Link>
        </div>

        {students.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#6b7280' }}>
            <p>No students enrolled in this batch yet</p>
            <Link to="/students">
              <button className="btn btn-primary mt-2">Add Students</button>
            </Link>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Enrollment No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td><strong>{student.enrollmentNumber}</strong></td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>{student.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <Link to={`/students/${student._id}`}>
                        <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                          View Details
                        </button>
                      </Link>
                    </td>
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

export default BatchDetails;