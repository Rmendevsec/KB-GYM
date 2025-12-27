import { useEffect, useState } from "react";
import axios from "axios";

export default function QRPage() {
  const [qr, setQr] = useState("");
  const [user, setUser] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const qrRes = await axios.get("http://localhost:5000/api/qr/current", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQr(qrRes.data.qrCode);
      setPackageInfo(qrRes.data.package); 

      const userRes = await axios.get("http://localhost:5000/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    const interval = setInterval(() => {
      axios.get("http://localhost:5000/api/qr/current", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }).then(res => setQr(res.data.qrCode));
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const getRemainingDays = (expireDate) => {
    if (!expireDate) return "N/A";
    const now = new Date();
    const expire = new Date(expireDate);
    const diffTime = expire - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days` : "Expired";
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Your QR Code</h2>
      
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {qr && (
          <>
            <img 
              src={qr} 
              alt="QR Code" 
              style={{ 
                width: "250px", 
                height: "250px", 
                border: "2px solid #333",
                borderRadius: "10px",
                padding: "10px",
                backgroundColor: "white"
              }} 
            />
            <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
              QR refreshes automatically every 10 minutes
            </p>
          </>
        )}
      </div>

      <div style={{ 
        backgroundColor: "#f5f5f5", 
        padding: "20px", 
        borderRadius: "10px",
        marginBottom: "20px"
      }}>
        <h3>User Information</h3>
        {user && (
          <>
            <p><strong>Name:</strong> {user.full_name || "N/A"}</p>
            <p><strong>Phone:</strong> {user.phone_number || "N/A"}</p>
            <p><strong>Registered:</strong> {user.registered_at 
              ? new Date(user.registered_at).toLocaleDateString() 
              : "N/A"}</p>
            <p><strong>Account Status:</strong> {user.is_active ? "Active" : "Inactive"}</p>
          </>
        )}
      </div>

      <div style={{ 
        backgroundColor: "#e8f4fd", 
        padding: "20px", 
        borderRadius: "10px"
      }}>
        <h3>Membership Information</h3>
        {packageInfo ? (
          <>
            <p><strong>Package:</strong> {packageInfo.name || "N/A"}</p>
            <p><strong>Max Scans:</strong> {packageInfo.max_scans || "Unlimited"}</p>
            <p><strong>Registered Date:</strong> {user?.registered_at 
              ? new Date(user.registered_at).toLocaleDateString() 
              : "N/A"}</p>
            <p><strong>Expiry Date:</strong> {packageInfo.expire_at 
              ? new Date(packageInfo.expire_at).toLocaleDateString() 
              : "N/A"}</p>
            <p><strong>Days Remaining:</strong> {getRemainingDays(packageInfo.expire_at)}</p>
            
            {user && typeof user.used_scans !== 'undefined' && (
              <>
                <p><strong>Scans Used:</strong> {user.used_scans}</p>
                <p><strong>Remaining Scans:</strong> {
                  packageInfo.max_scans !== null 
                    ? Math.max(packageInfo.max_scans - user.used_scans, 0)
                    : "Unlimited"
                }</p>
              </>
            )}
          </>
        ) : (
          <p>No active package found.</p>
        )}
      </div>

  
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          onClick={fetchAllData}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Refresh Information
        </button>
      </div>
    </div>
  );
}