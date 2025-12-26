import axios from "axios";
import { useState, useEffect } from "react";

export default function CreateUser() {
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    password: "",
    role_id: 3,
    package_id: ""
  });

  const [packages, setPackages] = useState([]);


  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/packages");
        // console.log("PACKAGES ", res.data);
        setPackages(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load packages");
      }
    };

    fetchPackages();
  }, []);

  
  const selectedPackage = packages.find(
    (p) => p.id === Number(form.package_id)
  );
  const totalAmount = selectedPackage ? selectedPackage.price : 0;

  const handleCreateUser = async () => {
    if (!form.package_id) {
      alert("Please select a package");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("User created successfully");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  return (
    <div>
      <h2>Create Member</h2>

      <input
        placeholder="Full Name"
        value={form.full_name}
        onChange={(e) =>
          setForm({ ...form, full_name: e.target.value })
        }
      />

      <input
        placeholder="Phone Number"
        value={form.phone_number}
        onChange={(e) =>
          setForm({ ...form, phone_number: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <select
        value={form.role_id}
        onChange={(e) =>
          setForm({ ...form, role_id: Number(e.target.value) })
        }
      >
        <option value={3}>Member</option>
        <option value={2}>Cashier</option>
        <option value={1}>Admin</option>
      </select>

      <select
        value={form.package_id}
        onChange={(e) =>
          setForm({ ...form, package_id: e.target.value })
        }
        required
      >
        <option value="">Select Package</option>
        {packages.map((pkg) => (
          <option key={pkg.id} value={pkg.id}>
            {pkg.name} ({pkg.duration_days} days) – {pkg.price} ETB
          </option>
        ))}
      </select>

      <p>
        Amount: <b>{totalAmount} ETB</b>
      </p>

      <button onClick={handleCreateUser}>Create</button>
    </div>
  );
}
