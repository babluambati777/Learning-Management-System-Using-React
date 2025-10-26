import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { batchAPI } from '../../services/api';
import BatchForm from './BatchForm';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await batchAPI.getAll();
      setBatches(response.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch batches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        await batchAPI.delete(id);
        fetchBatches();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete batch');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await batchAPI.toggleStatus(id);
      fetchBatches();
    } catch (err) {
      alert('Failed to update batch status');
    }
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBatch(null);
  };

  const handleSuccess = () => {
    fetchBatches();
    handleCloseModal();
  };

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.batchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && batch.isActive) ||
      (filterActive === 'inactive' && !batch.isActive);

    return matchesSearch && matchesFilter;
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
          <h1>Batches</h1>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            + Add Batch
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          />
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            style={{ padding: '10px', border: '1px solid #d1d5db', borderRadius: '5px' }}
          >
            <option value="all">All Batches</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {filteredBatches.length === 0 ? (
          <div className="text-center" style={{ padding: '40px', color: '#6b7280' }}>
            <p>No batches found</p>
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Batch Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch._id}>
                    <td><strong>{batch.batchCode}</strong></td>
                    <td>{batch.batchName}</td>
                    <td>{new Date(batch.startDate).toLocaleDateString()}</td>
                    <td>{new Date(batch.endDate).toLocaleDateString()}</td>
                    <td>{batch.totalStudents}</td>
                    <td>
                      <span className={`badge ${batch.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {batch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <Link to={`/batches/${batch._id}`}>
                          <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '5px 10px' }}>
                            View
                          </button>
                        </Link>
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleEdit(batch)}
                        >
                          Edit
                        </button>
                        <button
                          className={`btn ${batch.isActive ? 'btn-secondary' : 'btn-success'}`}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleToggleStatus(batch._id)}
                        >
                          {batch.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                          onClick={() => handleDelete(batch._id)}
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
            <h2>{editingBatch ? 'Edit Batch' : 'Add New Batch'}</h2>
            <BatchForm
              batch={editingBatch}
              onSuccess={handleSuccess}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchList;