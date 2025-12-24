import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Scan.css';

const Scan = () => {
  const [qrData, setQrData] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async () => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    setScanning(true);
    try {
      const response = await api.post('/qr/scan', { qrData });
      const result = response.data.data;
      
      setScanResult(result);
      toast.success('Scan successful!');
      
      // Clear input after successful scan
      setQrData('');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Scan failed');
      setScanResult({
        success: false,
        error: error.response?.data?.error
      });
    } finally {
      setScanning(false);
    }
  };

  const simulateScan = () => {
    // This would be replaced with actual camera scanning
    const simulatedQR = 'eyJ1c2VySWQiOiIxMjM0NTYiLCJwYXltZW50SWQiOiI3ODkwMTIiLCJ0aW1lc3RhbXAiOjE2ODkzNzEyMDAwMDAsInNpZ25hdHVyZSI6IjEyMzQ1Njc4OTAifQ==';
    setQrData(simulatedQR);
  };

  return (
    <div className="scan-container">
      <div className="scan-header">
        <h1>QR Code Scanner</h1>
        <p>Scan member QR codes for gym access</p>
      </div>

      <div className="scan-main">
        <div className="scan-input-section">
          <div className="scan-input-group">
            <label htmlFor="qrData">QR Code Data</label>
            <textarea
              id="qrData"
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Paste QR code data here or use camera"
              rows={4}
            />
          </div>

          <div className="scan-buttons">
            <button 
              onClick={handleScan}
              disabled={scanning}
              className="btn-scan"
            >
              {scanning ? 'Scanning...' : 'Scan QR Code'}
            </button>
            
            <button 
              onClick={simulateScan}
              className="btn-simulate"
            >
              Simulate Scan
            </button>
          </div>
        </div>

        {scanResult && (
          <div className={`scan-result ${scanResult.success ? 'success' : 'error'}`}>
            <h3>Scan Result</h3>
            {scanResult.success ? (
              <>
                <div className="result-success">
                  <p>✅ Access Granted</p>
                  <p>Member: {scanResult.accessLog?.user?.full_name}</p>
                  <p>Remaining Scans: {scanResult.remainingScans}</p>
                  <p>Weekly Scans: {scanResult.weeklyScans}/3</p>
                  {scanResult.packageExhausted && (
                    <p className="warning">⚠️ Package Exhausted!</p>
                  )}
                </div>
              </>
            ) : (
              <div className="result-error">
                <p>❌ Access Denied</p>
                <p>Reason: {scanResult.error}</p>
              </div>
            )}
            
            <div className="scan-details">
              <p>Time: {new Date().toLocaleTimeString()}</p>
              <p>Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}

        <div className="scan-instructions">
          <h3>Instructions:</h3>
          <ul>
            <li>Use camera to scan QR code or manually input data</li>
            <li>QR codes expire after 10 minutes</li>
            <li>Members can scan only once per day</li>
            <li>Maximum 3 scans per week (Sunday bonus for some packages)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Scan;