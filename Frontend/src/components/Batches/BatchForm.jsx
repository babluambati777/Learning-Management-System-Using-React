import React, { useState, useEffect } from 'react';
import { batchAPI } from '../../services/api';

const BatchForm = ({ batch, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    batchName: '',
    batchCode: '',
    startDate: '',
    endDate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (batch) {
      setFormData({
        batchName: batch.batchName,
        batchCode: batch.batchCode,
        startDate: batch.startDate.split('T')[0],
        endDate: batch.endDate.split('T')[0],
        description: batch.description || '',
      });
    }
  }, [batch]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (batch) {
        await batchAPI.update(batch._id, formData);
      } else {
        await batchAPI.create(formData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="input-group">
        <label htmlFor="batchName">Batch Name *</label>
        <input
          type="text"
          id="batchName"
          name="batchName"
          value={formData.batchName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="input-group">
        <label htmlFor="batchCode">Batch Code *</label>
        <input
          type="text"
          id="batchCode"
          name="batchCode"
          value={formData.batchCode}
          onChange={handleChange}
          required
          style={{ textTransform: 'uppercase' }}
        />
      </div>

      <div className="grid grid-2">
        <div className="input-group">
          <label htmlFor="startDate">Start Date *</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="endDate">End Date *</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
        ></textarea>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex: 1 }}>
          {loading ? 'Saving...' : batch ? 'Update Batch' : 'Create Batch'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1 }}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BatchForm;