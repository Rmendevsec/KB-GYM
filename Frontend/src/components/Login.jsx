import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault(); // prevent page refresh
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // read correctly from response
      const token = res.data.token;
const roleMap = {
  1: "admin",
  2: "cashier",
  3: "user",
};

const role = roleMap[res.data.user.role_id];

localStorage.setItem("token", res.data.token);
localStorage.setItem("role", role);

// redirect
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
      <form onSubmit={login}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
