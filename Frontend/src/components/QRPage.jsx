import { useEffect, useState } from "react";
import axios from "axios";

export default function QRPage() {
  const [qr, setQr] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/qr/current", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(res => setQr(res.data.qrCode));
  }, []);

  return (
    <div>
      <h2>Your QR Code</h2>
      {qr && <img src={qr} alt="QR Code" />}
    </div>
  );
}
