import axios from "axios";
import { useState } from "react";

export default function CreateUser() {
const [form, setForm] = useState({
  full_name: "",
  email: "",
  password: "",
  role_id: 3,
  packageMonths: "1",
});
const packages = {
  "1": { months: 1, price: 2500 },
  "3": { months: 3, price: 2500 },
  "6": { months: 6, price: 2300 },
  "12": { months: 12, price: 2300 },
};
const selectedPackage = packages[form.packageMonths];
const totalAmount =selectedPackage.months * selectedPackage.price;



  const createUser = async () => {
    try {
await axios.post(
  "http://localhost:5000/api/auth/register",
  {
    ...form,
    amount: totalAmount,
  },
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

<input
  placeholder="Full Name"
  value={form.full_name}
  onChange={e => setForm({ ...form, full_name: e.target.value })}
/>

<input
  placeholder="Email"
  type="email"
  value={form.email}
  onChange={e => setForm({ ...form, email: e.target.value })}
/>

<input
  placeholder="Password"
  type="password"
  value={form.password}
  onChange={e => setForm({ ...form, password: e.target.value })}
/>



      <select onChange={e => setForm({ ...form, role_id: Number(e.target.value) })}>
        <option value="3">Member</option>
        <option value="2">Cashier</option>
        <option value="1">Admin</option>
      </select>
<select
  value={form.packageMonths}
  onChange={(e) =>
    setForm({ ...form, packageMonths: e.target.value })
  }
>
  <option value="1">1 Month</option>
  <option value="3">3 Months</option>
  <option value="6">6 Months</option>
  <option value="12">1 Year</option>
</select>

<p>
   Amount: <b>{totalAmount} ETB</b>
</p>

      <button onClick={createUser}>Create</button>
    </div>
  );
}
