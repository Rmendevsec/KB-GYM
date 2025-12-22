import axios from "axios";
import { useState } from "react";

export default function CreateUser() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: 3,
  });

  const createUser = async () => {
    try {
      await axios.post(
      "http://localhost:5000/api/auth/register",
      form,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("User created successfully");
  } catch (error) {
    console.error(error.response?.data || error.message);
    alert("failed to create user")
  }
}
  return (
    <div>
      <h2>Create Member</h2>

      <input placeholder="Full Name"
        onChange={e => setForm({ ...form, full_name: e.target.value })} />

      <input placeholder="Email" type="email"
        onChange={e => setForm({ ...form, email: e.target.value })} />

      <input placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}  type="password"/>

      <select onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}>
        <option value="3">Member</option>
        <option value="2">Cashier</option>
        <option value="1">Admin</option>
      </select>

      <button onClick={createUser}>Create</button>
    </div>
  );
}
