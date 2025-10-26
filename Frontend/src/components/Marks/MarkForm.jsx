import React, { useState, useEffect } from 'react';
import { markAPI } from '../../services/api';

const MarkForm = ({ mark, students, batches, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    student: '',
    batch: '',
    subject: '',
    marksObtained: '',
    totalMarks: '',
    examType: 'Assignment',
    examDate: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    if (mark) {
      setFormData({
        student: mark.student._id || mark.student,
        batch: mark.batch._id || mark.batch,
        subject: mark.subject,
        marksObtained: mark.marksObtained,
        totalMarks: mark.totalMarks,
        examType: mark.examType,
        examDate: mark.examDate.split('T')[0],
        remarks: mark.remarks || '',
      });
    }
  }, [mark]);

  useEffect(() => {
    if (formData.batch) {
      const studentsInBatch = students.filter(s => s.batch._id === formData.batch);
      setFilteredStudents(studentsInBatch);
    } else {
      setFilteredStudents(students);
    }
  }, [formData.batch, students]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If batch changes, reset student selection
    if (name === 'batch') {
      setFormData({
        ...formData,
        [name]: value,
        student: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

const obtainedRaw = formData.marksObtained?.toString().trim();
const totalRaw = formData.totalMarks?.toString().trim();

const obtained = Number(obtainedRaw);
const total = Number(totalRaw);

// Skip validation if either value is missing or invalid
if (!obtainedRaw || !totalRaw || isNaN(obtained) || isNaN(total)) {
  setError('');
  return;
}

// Logical validation
if (obtained > total) {
  setError('Marks obtained cannot be greater than total marks');
  setLoading(false);
  return;
}

// Clear error if validation passes
setError('');
console.log('Obtained:', obtained, 'Total:', total);



    try {
      if (mark) {
        await markAPI.update(mark._id, formData);
      } else {
        await markAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save mark entry');
    } finally {
      setLoading(false);
    }
  };

  const percentage = formData.marksObtained && formData.totalMarks
    ? ((parseFloat(formData.marksObtained) / parseFloat(formData.totalMarks)) * 100).toFixed(2)
    : 0;

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-2">
        <div className="input-group">
          <label htmlFor="batch">Batch *</label>
          <select
            id="batch"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            required
            disabled={!!mark}
          >
            <option value="">Select Batch</option>
            {batches.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batchName} ({batch.batchCode})
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="student">Student *</label>
          <select
            id="student"
            name="student"
            value={formData.student}
            onChange={handleChange}
            required
            disabled={!!mark || !formData.batch}
          >
            <option value="">Select Student</option>
            {filteredStudents.map((student) => (
              <option key={student._id} value={student._id}>
                {student.firstName} {student.lastName} ({student.enrollmentNumber})
              </option>
            ))}
          </select>
          {!formData.batch && (
            <small style={{ color: '#6b7280' }}>Please select a batch first</small>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="input-group">
          <label htmlFor="subject">Subject *</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="examType">Exam Type *</label>
          <select
            id="examType"
            name="examType"
            value={formData.examType}
            onChange={handleChange}
            required
          >
            <option value="Quiz">Quiz</option>
            <option value="Assignment">Assignment</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
            <option value="Project">Project</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="input-group">
          <label htmlFor="marksObtained">Marks Obtained *</label>
          <input
            type="number"
            id="marksObtained"
            name="marksObtained"
            value={formData.marksObtained}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="totalMarks">Total Marks *</label>
          <input
            type="number"
            id="totalMarks"
            name="totalMarks"
            value={formData.totalMarks}
            onChange={handleChange}
            min="1"
            step="0.01"
            required
          />
        </div>
      </div>

      {formData.marksObtained && formData.totalMarks && (
        <div className="alert alert-info" style={{ marginBottom: '15px' }}>
          <strong>Calculated Percentage: {percentage}%</strong>
        </div>
      )}

      <div className="input-group">
        <label htmlFor="examDate">Exam Date *</label>
        <input
          type="date"
          id="examDate"
          name="examDate"
          value={formData.examDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="remarks">Remarks</label>
        <textarea
          id="remarks"
          name="remarks"
          value={formData.remarks}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Saving...' : mark ? 'Update Mark Entry' : 'Create Mark Entry'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default MarkForm;