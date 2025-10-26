import React, { useState, useEffect } from 'react';
import { markAPI, studentAPI, batchAPI } from '../../services/api';
import MarkForm from './MarkForm';

const MarkList = () => {
  const [marks, setMarks] = useState([]);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterExamType, setFilterExamType] = useState('');

  useEffect(() => {
    fetchMarks();
    fetchStudents();
    fetchBatches();
  }, []);

  const fetchMarks = async () => {
    try {
      setLoading(true);
      const response = await markAPI.getAll();
      setMarks(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch marks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getAll();
      setStudents(response.data.data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
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
    if (window.confirm('Are you sure you want to delete this mark entry?')) {
      try {
        await markAPI.delete(id);
        fetchMarks();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete mark');
      }
    }
  };

  const handleEdit = (mark) => {
    setEditingMark(mark);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMark(null);
  };

  const handleSuccess = () => {
    fetchMarks();
    handleCloseModal();
  };

  const filteredMarks = marks.filter((mark) => {
    const matchesStudent = !filterStudent || mark.student._id === filterStudent;
    const matchesBatch = !filterBatch || mark.batch._id === filterBatch;
    const matchesSubject = !filterSubject || mark.subject.toLowerCase().includes(filterSubject.toLowerCase());
    const matchesExamType = !filterExamType || mark.examType === filterExamType;

    return matchesStudent && matchesBatch && matchesSubject && matchesExamType;
  });

  // Get unique subjects and exam types for filters
  const uniqueSubjects = [...new Set(marks.map(m => m.subject))];
  const examTypes = ['Quiz', 'Assignment', 'Midterm', 'Final', 'Project', 'Other'];

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
          <h1>Marks Management</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Marks
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '20px' }}>
          <select
            value={filterStudent}
            onChange={(e) => setFilterStudent(e.target.value)}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          >
            <option value="">All Students</option>
            {students.map((student) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.enrollmentNumber})
              </option>
            ))}
          </select>

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

          <input
            type="text"
            placeholder="Search subject..."
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          />

          <select
            value={filterExamType}
            onChange={(e) => setFilterExamType(e.target.value)}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          >
            <option value="">All Exam Types</option>
            {examTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {filteredMarks.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#6b7280' }}>
            <p>No marks found</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Batch</th>
                  <th>Subject</th>
                  <th>Exam Type</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Exam Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarks.map((mark) => (
                  <tr key={mark._id}>
                    <td>
                      {mark.student.firstName} {mark.student.lastName}
                      <br />
                      <small style={{ color: '#6b7280' }}>{mark.student.enrollmentNumber}</small>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {mark.batch.batchName}
                      </span>
                    </td>
                    <td><strong>{mark.subject}</strong></td>
                    <td>
                      <span className="badge badge-warning">
                        {mark.examType}
                      </span>
                    </td>
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
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleEdit(mark)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleDelete(mark._id)}
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

        <div style={{ marginTop: '20px', padding: '15px', background: '#f9fafb', borderRadius: '5px' }}>
          <strong>Total Records: {filteredMarks.length}</strong>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingMark ? 'Edit Mark Entry' : 'Add New Mark Entry'}</h2>
            <MarkForm
              mark={editingMark}
              students={students}
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

export default MarkList;