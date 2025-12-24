import React, { useEffect, useState } from "react";
import axios from "../api/api";

const PaymentsTable = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/admin/payments");
      setPayments(res.data.data);
    } catch (err) {
      console.error("Error fetching payments:", err);
    }
  };

  const confirmPayment = async (paymentId) => {
    try {
      await axios.post(`/admin/payments/confirm/${paymentId}`);
      alert("Payment confirmed!");
      fetchPayments(); // refresh list
    } catch (err) {
      console.error("Error confirming payment:", err);
      alert("Failed to confirm payment");
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return (
    <div>
      <h2>Payments</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Package</th>
            <th>Amount</th>
            <th>Paid At</th>
            <th>Expire At</th>
            <th>Confirmed</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.User?.full_name || "N/A"}</td>
              <td>{p.package_type}</td>
              <td>{p.amount}</td>
              <td>{new Date(p.paid_at).toLocaleDateString()}</td>
              <td>{new Date(p.expire_at).toLocaleDateString()}</td>
              <td>{p.confirmed ? "Yes" : "No"}</td>
              <td>
                {!p.confirmed && (
                  <button onClick={() => confirmPayment(p.id)}>
                    Confirm
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;
