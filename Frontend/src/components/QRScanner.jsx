import { useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/api";

function QRScanner() {
  const qrRegionRef = useRef(null);

  const startScanner = () => {
    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      async (decodedText) => {
        console.log("QR Scanned:", decodedText);
        try {
          const res = await api.post("/qr/scan", { qrData: decodedText });
          alert(`User scanned: ${res.data.user.full_name}`);
        } catch (err) {
          alert("Invalid QR code", err);
        }
        html5QrCode.stop();
      },
      (errorMessage) => {
        console.warn(errorMessage);
      }
    );
  };

  return (
    <div>
      <div id="reader" ref={qrRegionRef} style={{ width: "500px" }}></div>
      <button onClick={startScanner}>Start Scanner</button>
    </div>
  );
}

export default QRScanner;
