import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI, batchAPI } from '../../services/api';
import StudentForm from './StudentForm';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentAPI.getAll();
      setStudents(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch students');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await batchAPI.getAll();
      setBatches(response.data.data);
    } catch (err) {
      console.error('Failed to fetch batches:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this student? This will also delete all their marks.')) {
      try {
        await studentAPI.delete(id);
        fetchStudents();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStudent(null);
  };

  const handleSuccess = () => {
    fetchStudents();
    handleCloseModal();
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatch = !filterBatch || student.batch._id === filterBatch;
    
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && student.isActive) ||
      (filterActive === 'inactive' && !student.isActive);

    return matchesSearch && matchesBatch && matchesActive;
  });

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: '30px' }}>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Students</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Student
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          />
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          >
            <option value="">All Batches</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName}
              </option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          >
            <option value="all">All Students</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#6b7280' }}>
            <p>No students found</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Enrollment No.</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Batch</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td><strong>{student.enrollmentNumber}</strong></td>
                    <td>{student.firstName} {student.lastName}</td>
                    <td>{student.email}</td>
                    <td>
                      <span className="badge badge-info">
                        {student.batch?.batchName || 'N/A'}
                      </span>
                    </td>
                    <td>{student.phone || 'N/A'}</td>
                    <td>
                      <span className={`badge ${student.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <Link to={`/students/${student._id}`}>
                          <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                            View
                          </button>
                        </Link>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingStudent ? 'Edit Student' : 'Add New Student'}</h2>
            <StudentForm
              student={editingStudent}
              batches={batches}
              onSuccess={handleSuccess}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentList;