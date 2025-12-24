import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaSearch, 
  FaFilter, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import api from '../../services/api';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filters, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/admin/users?page=${pagination.page}&limit=${pagination.limit}`);
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => 
        filters.status === 'active' ? user.is_active : !user.is_active
      );
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      // This would be an API call to update user status
      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      // This would be an API call to delete user
      toast.success('User deleted successfully');
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: 'Admin', class: 'badge-admin' },
      cashier: { label: 'Cashier', class: 'badge-cashier' },
      user: { label: 'Member', class: 'badge-member' }
    };
    
    const roleInfo = roles[role] || { label: role, class: 'badge-default' };
    
    return <span className={`role-badge ${roleInfo.class}`}>{roleInfo.label}</span>;
  };

  if (loading) {
    return (
      <div className="users-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-container">
      <Helmet>
        <title>Users - Gym Management System</title>
      </Helmet>
      
      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage all gym members and staff accounts</p>
        </div>
        <Link to="/admin/users/create" className="btn-primary">
          <FaUserPlus /> Add New User
        </Link>
      </div>
      
      {/* Filters */}
      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <label>Role:</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="user">Member</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Package</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="user-name">{user.full_name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {getRoleBadge(user.role)}
                  </td>
                  <td>
                    <div className="package-info">
                      {user.payments?.[0]?.package?.name || 'No Package'}
                      {user.payments?.[0] && (
                        <small>
                          {user.payments[0].used_scans}/{user.payments[0].package.max_scans} scans
                        </small>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? (
                        <>
                          <FaUserCheck /> Active
                        </>
                      ) : (
                        <>
                          <FaUserTimes /> Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-action view"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="btn-action edit"
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn-action toggle-status"
                        title={user.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                      >
                        {user.is_active ? <FaUserTimes /> : <FaUserCheck />}
                      </button>
                      <button
                        className="btn-action delete"
                        title="Delete User"
                        onClick={() => deleteUser(user.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="pagination">
        <button
          className="pagination-btn"
          disabled={pagination.page === 1}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
        >
          Previous
        </button>
        
        <div className="page-info">
          Page {pagination.page} of {pagination.pages}
        </div>
        
        <button
          className="pagination-btn"
          disabled={pagination.page === pagination.pages}
          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;