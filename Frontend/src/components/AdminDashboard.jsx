import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateUser from './CreateUser';

function AdminDashboard() {
  const [tab, setTab] = useState('create');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      console.log('API Response:', res.data); 
      
      if (res.data.success && res.data.data) {
        setUsers(res.data.data);
      } else {
        console.error('Unexpected response format:', res.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'users') fetchUsers();
  }, [tab]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div>
        <button onClick={() => setTab('create')}>Create User</button>
        <button onClick={() => setTab('users')}>All Users</button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {tab === 'create' && <CreateUser />}
        {tab === 'users' && (
          <>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <table border="1" cellPadding="10" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Active</th>
                    <th>Package</th>
                    <th>Created At</th>
                    <th>Expire At</th>
                    <th>Remaining Scans</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center' }}>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.name}</td>
                        <td>{u.phone}</td>
                        <td>{u.role}</td>
                        <td>{u.active}</td>
                        <td>{u.package || 'N/A'}</td>
                        <td>
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>
                          {u.expireAt
                            ? new Date(u.expireAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td>{u.remainingScans}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;