import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const login = async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/auth/login",
      { email, password }
    );

    const token = res.data.data.token;
    const role = res.data.data.user.role;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    if (role === "admin") {
      window.location.href = "/admin/dashboard";
    } else if (role === "cashier") {
      window.location.href = "/scan";
    } else {
      window.location.href = "/qr";
    }
  } catch (err) {
    console.error("Login failed", err);
    alert("Login failed: check your email/password");
  }
};

  return (
    <div>
      <h2>KB-GYM Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}
