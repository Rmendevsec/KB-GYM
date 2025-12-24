import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaEye, FaTimes, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import './AccessLogs.css';

const AccessLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    userId: '',
    status: 'all'
  });

  useEffect(() => {
    fetchAccessLogs();
  }, []);

  const fetchAccessLogs = async () => {
    try {
      const response = await api.get('/admin/access-logs');
      setLogs(response.data.data.logs);
    } catch (error) {
      toast.error('Failed to load access logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    // Filter logic would go here
    toast.info('Filter functionality coming soon');
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      userId: '',
      status: 'all'
    });
    fetchAccessLogs();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="access-logs-loading">
        <div className="spinner"></div>
        <p>Loading access logs...</p>
      </div>
    );
  }

  return (
    <div className="access-logs-container">
      <Helmet>
        <title>Access Logs - Gym Management System</title>
      </Helmet>
      
      <div className="access-logs-header">
        <div>
          <h1>Access Logs</h1>
          <p>View all gym access history and scans</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="all">All Status</option>
              <option value="valid">Valid</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>User ID</label>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="Enter user ID"
            />
          </div>
        </div>
        
        <div className="filter-buttons">
          <button onClick={applyFilters} className="btn-apply">
            <FaSearch /> Apply Filters
          </button>
          <button onClick={resetFilters} className="btn-reset">
            <FaFilter /> Reset Filters
          </button>
        </div>
      </div>
      
      {/* Logs Table */}
      <div className="logs-table-container">
        <div className="table-header">
          <h3>Recent Scans ({logs.length})</h3>
          <button className="btn-export">Export CSV</button>
        </div>
        
        <div className="logs-table">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Time</th>
                <th>Scanned By</th>
                <th>Package</th>
                <th>Status</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {log.user?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="user-name">{log.user?.full_name || 'Unknown'}</div>
                          <div className="user-email">{log.user?.email || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="time-cell">
                        {formatDate(log.scanned_at)}
                      </div>
                    </td>
                    <td>
                      {log.scanner?.full_name || 'System'}
                    </td>
                    <td>
                      {log.payment?.package?.name || 'N/A'}
                    </td>
                    <td>
                      <span className={`status-badge ${log.valid ? 'valid' : 'invalid'}`}>
                        {log.valid ? (
                          <>
                            <FaCheck /> Valid
                          </>
                        ) : (
                          <>
                            <FaTimes /> Invalid
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="note-cell">
                        {log.note || 'No note'}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    No access logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccessLogs;