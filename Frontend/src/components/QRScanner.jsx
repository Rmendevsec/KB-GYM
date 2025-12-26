import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import api from "../api/api";

function QRScanner() {
  const qrRegionRef = useRef(null);
  const [scannedUser, setScannedUser] = useState(null);
  const [scannerRunning, setScannerRunning] = useState(false);
  const html5QrCodeRef = useRef(null);

  const startScanner = () => {
    if (scannerRunning) return;

    const qrCodeRegionId = "reader";
    const html5QrCode = new Html5Qrcode(qrCodeRegionId);
    html5QrCodeRef.current = html5QrCode;

    setScannerRunning(true);

    html5QrCode.start(
      { facingMode: "environment" },
      { fps: 5, qrbox: 300 },
      async (decodedText) => {
        await html5QrCode.stop();
        setScannerRunning(false);

        try {
          const res = await api.post("/qr/scan", { qrData: decodedText });
          setScannedUser(res.data); // store full response, not just user
        } catch (err) {
          const msg = err.response?.data?.message || "QR scan failed";
          alert(`❌ ${msg}`);
        }
      },
      (errorMessage) => {
        if (!errorMessage.includes("NotFoundException")) {
          console.warn("QR Scanner:", errorMessage);
        }
      }
    );
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && scannerRunning) {
      await html5QrCodeRef.current.stop();
      setScannerRunning(false);
    }
  };

  return (
    <div>
      <div
        id="reader"
        ref={qrRegionRef}
        style={{ width: "400px", height: "400px", marginBottom: "10px" }}
      />
      <button onClick={startScanner} disabled={scannerRunning}>
        {scannerRunning ? "Scanning..." : "Start Scanner"}
      </button>
      <button
        onClick={stopScanner}
        disabled={!scannerRunning}
        style={{ marginLeft: "10px" }}
      >
        Stop Scanner
      </button>

  {scannedUser && (
  <div style={{ marginTop: "20px" }}>
    <h3>Scan Result</h3>

    <p>Status: {scannedUser.valid ? "Valid" : "Invalid / Expired"}</p>

    {scannedUser.user && (
      <>
        <p>Name: {scannedUser.user.full_name}</p>
        <p>Phone: {scannedUser.user.phone_number}</p>
      </>
    )}

    {scannedUser.package && (
      <>
        <p>Package: {scannedUser.package.name}</p>

        {scannedUser.package.paid_at && (
          <p>
            Registered:{" "}
            {new Date(scannedUser.package.paid_at).toLocaleDateString()}
          </p>
        )}

        <p>
          Expires:{" "}
          {new Date(scannedUser.package.expire_at).toLocaleDateString()}
        </p>

        {scannedUser.package.remaining_scans !== null && (
          <p>Remaining scans: {scannedUser.package.remaining_scans}</p>
        )}
      </>
    )}

    {!scannedUser.valid && (
      <p style={{ color: "red" }}>
        ❌ {scannedUser.message}
      </p>
    )}
  </div>
)}

    </div>
  );
}

export default QRScanner;
