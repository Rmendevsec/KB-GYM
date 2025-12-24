import { useEffect, useState } from "react";
import axios from "axios";

export default function CreateUser() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role_id: 3,
    package_id: 1, // default
  });

  const [packages, setPackages] = useState([]);

useEffect(() => {
  const fetchPackages = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/packages", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setPackages(res.data);
      setForm(prev => ({ ...prev, package_id: res.data[0].id }));
    } catch (err) {
      console.error("Failed to fetch packages:", err);
    }
  };
  fetchPackages();
}, []);

console.log(form);

  const createUser = async () => {
    try {
await axios.post("http://localhost:5000/api/auth/register", form, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`
  }
});
;
      alert("User created successfully");
    } catch (error) {
      console.error(error.response?.data || error.message);
      alert(error.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="form-container">
      <h2>Create Member</h2>
      <input placeholder="Full Name" onChange={e => setForm({ ...form, full_name: e.target.value })} />
      <input placeholder="Email" type="email" onChange={e => setForm({ ...form, email: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />

      <select onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}>
        <option value="3">Member</option>
        <option value="2">Cashier</option>
        <option value="1">Admin</option>
      </select>

<select
  value={form.package_id}
  onChange={e => setForm({ ...form, package_id: Number(e.target.value) })}
>
  {packages.map(pkg => (
    <option key={pkg.id} value={pkg.id}>
      {pkg.name}
    </option>
  ))}
</select>


      <button onClick={createUser}>Create</button>
    </div>
  );
}
