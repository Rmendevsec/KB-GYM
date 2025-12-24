import React, { useEffect, useState } from "react";
import UsersTable from "./UsersTable";
import PaymentsTable from "./PaymentsTable";
import AccessLogsTable from "./AccessLogsTable";
import { Link } from "react-router-dom";
const AdminDashboard = () => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <UsersTable />
      <PaymentsTable />
      <AccessLogsTable />
       <ul>
        <li><Link to="/admin/users">Users</Link></li>
        <li><Link to="/admin/payments">Payments</Link></li>
        <li><Link to="/admin/access-logs">Access Logs</Link></li>
      </ul>
    </div>
  );
};

export default AdminDashboard;
