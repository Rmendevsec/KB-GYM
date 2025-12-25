import { useEffect, useState } from "react";
import axios from "axios";

export default function QRPage() {
  const [qr, setQr] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Fetch QR code
    axios.get("http://localhost:5000/api/qr/current", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setQr(res.data.qrCode));

    // Fetch user & package info
    axios.get("http://localhost:5000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setUser(res.data.data));

  }, []);

  const renderPackageInfo = () => {
    if (!user?.package) return null;
    const { name, price, duration_days, remaining_scans } = user.package;

    return (
      <div>
        <p>Package: {name}</p>
        <p>Price per month: {price} birr</p>
        <p>Duration (days): {duration_days}</p>
        <p>Remaining scans: {remaining_scans}</p>
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
