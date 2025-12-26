import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateUser from './CreateUser';

function AdminDashboard() {
  const [tab, setTab] = useState('create');
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
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
          <table border="1" cellPadding="10">
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
  {users.map((u) => {
    const pkg = u.package; // directly get the package
    const remainingScans =
      pkg?.max_scans != null
        ? Math.max((pkg.max_scans || 0) - (u.used_scans || 0), 0)
        : "Unlimited";

    return (
      <tr key={u.id}>
        <td>{u.id}</td>
        <td>{u.full_name}</td>
        <td>{u.phone_number}</td>
        <td>
          {u.role_id === 1
            ? "Admin"
            : u.role_id === 2
            ? "Cashier"
            : "Member"}
        </td>
        <td>{u.is_active ? "Yes" : "No"}</td>
        <td>{pkg?.name || "N/A"}</td>
        <td>
          {u.created_at
            ? new Date(u.created_at).toLocaleDateString()
            : "N/A"}
        </td>
        <td>
          {u.expire_at
            ? new Date(u.expire_at).toLocaleDateString()
            : "N/A"}
        </td>
        <td>{remainingScans}</td>
      </tr>
    );
  })}
</tbody>

          </table>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
