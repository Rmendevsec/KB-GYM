import React, { useEffect, useState } from "react";
import axios from "../api/api";

const UsersTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get("/admin/users")
      .then(res => setUsers(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.role_id}</td>
              <td>{u.is_active ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
