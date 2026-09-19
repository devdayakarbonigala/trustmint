import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyDocument } from '../../config/api';
import VerificationResult from './VerificationResult';
import {
  Search,
  QrCode,
  AlertCircle,
  Camera,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  X,
  ExternalLink,
  Upload,
} from 'lucide-react';

export default function VerifyDocument({ initialHash, onClearInitialHash, onNavigateDashboard }) {
  const [qrHash, setQrHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [verificationData, setVerificationData] = useState(null);
  const [lastVerifiedHash, setLastVerifiedHash] = useState('');

  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState('');
  const qrScannerRef = useRef(null);

  // Automatically pre-populate hash when navigated with initialHash
  useEffect(() => {
    if (initialHash) {
      setQrHash(initialHash);
      setErrorMessage('');
      setVerificationData(null);
    }
  }, [initialHash]);

  // Listen for postMessage from web/scan.html if opened as popup or iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'TRUSTMINT_QR_SCANNED' && event.data.hash) {
        setQrHash(event.data.hash);
        setSuccessNotice('QR hash captured from camera scanner!');
        setErrorMessage('');
        stopCameraScanner();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Cleanup scanner on unmount
  useEffect(() => {
    return () => {
      stopCameraScanner();
    };
  }, []);

  const startCameraScanner = async () => {
    setIsScanning(true);
    setScannerError('');
    setSuccessNotice('');

    // Small timeout to ensure container DOM element exists
    setTimeout(async () => {
      try {
        if (qrScannerRef.current) {
          try {
            await qrScannerRef.current.stop();
          } catch {
            // Ignore if already stopped
          }
        }

        const scanner = new Html5Qrcode('qr-reader-container');
        qrScannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Clean up 64-char hex hash
            const match = decodedText.match(/[a-f0-9]{64}/i);
            const capturedHash = match ? match[0] : decodedText.trim();

            setQrHash(capturedHash);
            setSuccessNotice('QR Code Scanned Successfully!');
            stopCameraScanner();
          },
          (scanError) => {
            // Continuous scanning frames, ignore frame errors
          }
        );
      } catch (err) {
        console.warn('Camera scanner initialization error:', err);
        setScannerError(
          'Could not access device camera. Please check browser permissions, or upload a QR image below.'
        );
      }
    }, 150);
  };

  const stopCameraScanner = async () => {
    if (qrScannerRef.current) {
      try {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop();
        }
        qrScannerRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('file-scanner-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      const match = decodedText.match(/[a-f0-9]{64}/i);
      const capturedHash = match ? match[0] : decodedText.trim();

      setQrHash(capturedHash);
      setSuccessNotice('QR Hash Extracted from Image!');
      setErrorMessage('');
      stopCameraScanner();
      html5QrCode.clear();
    } catch (err) {
      setScannerError('Could not find a valid QR code in the uploaded image.');
    }
  };

  const openStandaloneScanner = () => {
    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    window.open(
      '/scan.html',
      'TrustMintScanner',
      `width=${width},height=${height},top=${top},left=${left},toolbar=no,menubar=no,scrollbars=yes`
    );
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setSuccessNotice('');
    setVerificationData(null);

    const cleanHash = (qrHash || '').trim();
    if (!cleanHash) {
      setErrorMessage('Please enter or scan a cryptographic QR hash to verify.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await verifyDocument(cleanHash);
      setVerificationData(data);
      setLastVerifiedHash(cleanHash);
    } catch (err) {
      setErrorMessage(err.message || 'Verification failed. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQrHash('');
    setVerificationData(null);
    setErrorMessage('');
    setSuccessNotice('');
    setLastVerifiedHash('');
    stopCameraScanner();
    if (onClearInitialHash) onClearInitialHash();
  };

  return (
    <div className="verify-page-container">
      {/* Invisible element for file QR scanner */}
      <div id="file-scanner-temp" style={{ display: 'none' }} />

      {/* Top Navigation Bar with Back Button */}
      {onNavigateDashboard && !verificationData && (
        <div className="section-top-nav-bar">
          <button
            type="button"
            id="btn-back-to-dashboard-verify"
            className="btn-link-back"
            onClick={onNavigateDashboard}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      {!verificationData ? (
        <div className="panel-card verify-panel-card">
          <div className="panel-header">
            <div>
              <div className="panel-badge">
                <CheckCircle2 size={14} />
                <span>Verification Engine</span>
              </div>
              <h2 className="panel-title">Verify Document</h2>
              <p className="panel-subtitle">
                Check whether a TrustMint document is genuine, active, and tamper-free.
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successNotice && (
            <div className="success-banner" role="alert">
              <CheckCircle2 size={18} />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Interactive QR Scanner Section */}
          {!isScanning ? (
            <div className="qr-scanner-placeholder-box">
              <div className="qr-scanner-visual-frame">
                <div className="scanner-target-reticle">
                  <QrCode size={48} className="scanner-icon" />
                </div>
                <span className="scanner-title">Scan QR code to verify</span>
                <p className="scanner-desc">
                  Point your device camera at a TrustMint document QR code, or paste the cryptographic hash below.
                </p>

                <div className="scanner-trigger-buttons">
                  <button
                    type="button"
                    id="btn-open-camera-scanner"
                    className="btn-primary"
                    onClick={startCameraScanner}
                  >
                    <Camera size={18} />
                    <span>Open Camera Scanner</span>
                  </button>

                  <button
                    type="button"
                    id="btn-open-popup-scanner"
                    className="btn-secondary"
                    onClick={openStandaloneScanner}
                    title="Open standalone scanner in dedicated window"
                  >
                    <ExternalLink size={16} />
                    <span>Standalone Window</span>
                  </button>

                  <label className="btn-secondary file-upload-label" htmlFor="qr-file-upload">
                    <Upload size={16} />
                    <span>Upload QR Image</span>
                    <input
                      id="qr-file-upload"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="live-camera-scanner-wrapper">
              <div className="camera-header-row">
                <div className="camera-title-box">
                  <Camera size={18} />
                  <span className="camera-title-text">Live Camera Feed</span>
                </div>
                <button
                  type="button"
                  id="btn-stop-camera"
                  className="btn-secondary btn-sm"
                  onClick={stopCameraScanner}
                >
                  <X size={16} />
                  <span>Close Camera</span>
                </button>
              </div>

              {scannerError && (
                <div className="error-banner" style={{ margin: '12px 0' }} role="alert">
                  <AlertCircle size={16} />
                  <span>{scannerError}</span>
                </div>
              )}

              <div id="qr-reader-container" className="qr-reader-view" />

              <div className="camera-footer-controls">
                <label className="btn-secondary btn-sm file-upload-label" htmlFor="qr-file-upload-live">
                  <Upload size={14} />
                  <span>Upload QR Image Instead</span>
                  <input
                    id="qr-file-upload-live"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                </label>
                <span className="camera-status-hint">Center the QR code within the view frame</span>
              </div>
            </div>
          )}

          <div className="or-divider">
            <span>OR ENTER HASH MANUALLY</span>
          </div>

          {/* Hash Input Form */}
          <form onSubmit={handleVerify} className="verify-form">
            <div className="form-group">
              <label className="form-label" htmlFor="input-verify-hash">
                Cryptographic Document Hash (SHA-256)
                <span className="required-badge">* Required</span>
              </label>
              <div className="hash-input-wrapper">
                <input
                  id="input-verify-hash"
                  className="form-input mono"
                  type="text"
                  placeholder="Paste 64-character SHA-256 hash or scan QR"
                  value={qrHash}
                  onChange={(e) => {
                    setQrHash(e.target.value);
                    if (errorMessage) setErrorMessage('');
                    if (successNotice) setSuccessNotice('');
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="verify-actions-row">
              <button
                type="submit"
                id="btn-verify-document"
                className="btn-primary"
                disabled={isLoading || !qrHash.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Verifying Against Ledger...</span>
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    <span>Verify Document</span>
                  </>
                )}
              </button>

              {qrHash && (
                <button
                  type="button"
                  id="btn-clear-verify"
                  className="btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  <RefreshCw size={14} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        /* Result Screen */
        <VerificationResult
          resultData={verificationData}
          verifiedHash={lastVerifiedHash}
          onBack={handleReset}
        />
      )}
    </div>
  );
}
