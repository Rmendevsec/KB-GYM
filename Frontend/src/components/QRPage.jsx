import { useEffect, useState } from "react";
import axios from "axios";

export default function QRPage() {
  const [qr, setQr] = useState("");
  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch QR code
      const qrRes = await axios.get("http://localhost:5000/api/qr/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQr(qrRes.data.qrCode);

      // Fetch user & package info
      const userRes = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data.data);
    } catch (err) {
      console.error("Error fetching QR/user:", err);
    }
  };

useEffect(() => {
  const token = localStorage.getItem("token");

  const fetchQR = async () => {
    const res = await axios.get("http://localhost:5000/api/qr/current", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setQr(res.data.qrCode);
  };

  fetchQR(); // initial

  const interval = setInterval(fetchQR, 10 * 60 * 1000); 
  return () => clearInterval(interval);
}, []);

  const renderPackageInfo = () => {
    if (!user?.Payments?.length) return null;

    const payment = user.Payments[0]; // latest payment
    const { Package, allowed_scans, used_scans, paid_at, expire_at } = payment;

    return (
      <div>
        <h3>Membership Info</h3>
        <p>Package: {Package.name}</p>
        <p>Registered: {new Date(paid_at).toLocaleDateString()}</p>
        <p>Expires: {new Date(expire_at).toLocaleDateString()}</p>
        <p>Scans Used: {used_scans}</p>
        <p>Remaining Scans: {allowed_scans}</p>
      </div>
    );
  };

  return (
    <div>
      <h2>Your QR Code</h2>
      {qr && <img src={qr} alt="QR Code" width={300} height={300} />}
      {renderPackageInfo()}
    </div>
  );
}
