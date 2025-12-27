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
          setScannedUser(res.data); 
        } catch (err) {
          const msg = err.response?.data?.message || "QR scan failed";
          alert(`${msg}`);
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
              <p>Name: {scannedUser.user.full_name || "N/A"}</p>
              <p>Phone: {scannedUser.user.phone_number || "N/A"}</p>
              <p>
                Registered:{" "}
                {scannedUser.user.registered_at
                  ? new Date(
                      scannedUser.user.registered_at
                    ).toLocaleDateString()
                  : "N/A"}
              </p>
            </>
          )}

          <p>Package: {scannedUser.package?.name || "N/A"}</p>

          <p>
            Expires:{" "}
            {scannedUser.package?.expire_at
              ? new Date(scannedUser.package.expire_at).toLocaleDateString()
              : "N/A"}
          </p>

          <p>
            Remaining scans:{" "}
            {scannedUser.package?.remaining_scans != null
              ? scannedUser.package.remaining_scans
              : 0}
          </p>

          {!scannedUser.valid && (
            <p style={{ color: "red" }}> {scannedUser.message}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default QRScanner;
