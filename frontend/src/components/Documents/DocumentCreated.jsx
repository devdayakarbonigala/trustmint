import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { downloadDocumentPdf } from '../../config/api';
import {
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  PlusCircle,
  Download,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';

export default function DocumentCreated({
  createdData,
  payloadData,
  documentType,
  user,
  onNavigateVerify,
  onResetIssue,
  onNavigateDashboard,
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const qrHash = createdData?.qr_hash || '';
  const docId = createdData?.doc_id || '';
  const warnings = createdData?.warnings || [];

  const handleCopyHash = async () => {
    if (!qrHash) return;
    try {
      await navigator.clipboard.writeText(qrHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!docId) return;
    setPdfError('');
    setIsDownloadingPdf(true);
    try {
      await downloadDocumentPdf(docId, documentType);
    } catch (err) {
      setPdfError(err.message || 'PDF generation failed. Please try again.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Helper to format payload rows based on document type
  const renderPayloadRows = () => {
    if (!payloadData) return null;

    if (documentType === 'prescription') {
      return (
        <>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Patient Name</span>
            <span className="doc-meta-value font-semibold">{payloadData.patient}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Medicines (Rx)</span>
            <span className="doc-meta-value">
              {Array.isArray(payloadData.drugs) ? payloadData.drugs.join(', ') : payloadData.drugs}
            </span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Prescribing Doctor</span>
            <span className="doc-meta-value">{payloadData.doctor}</span>
          </div>
        </>
      );
    }

    if (documentType === 'certificate') {
      return (
        <>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Recipient Name</span>
            <span className="doc-meta-value font-semibold">{payloadData.recipient}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Degree / Course</span>
            <span className="doc-meta-value">{payloadData.course}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Institution</span>
            <span className="doc-meta-value">{payloadData.institution}</span>
          </div>
        </>
      );
    }

    if (documentType === 'ticket') {
      return (
        <>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Attendee Name</span>
            <span className="doc-meta-value font-semibold">{payloadData.attendee}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Event Name</span>
            <span className="doc-meta-value">{payloadData.event}</span>
          </div>
          {payloadData.seat && (
            <div className="doc-meta-row">
              <span className="doc-meta-label">Seat Assignment</span>
              <span className="doc-meta-value">{payloadData.seat}</span>
            </div>
          )}
        </>
      );
    }

    if (documentType === 'invoice') {
      return (
        <>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Biller</span>
            <span className="doc-meta-value font-semibold">{payloadData.biller}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Payer</span>
            <span className="doc-meta-value">{payloadData.payer}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Amount</span>
            <span className="doc-meta-value font-semibold">{payloadData.amount}</span>
          </div>
        </>
      );
    }

    if (documentType === 'event_pass') {
      return (
        <>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Attendee Name</span>
            <span className="doc-meta-value font-semibold">{payloadData.attendee}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Event</span>
            <span className="doc-meta-value">{payloadData.event}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Designated Gate</span>
            <span className="doc-meta-value">{payloadData.gate}</span>
          </div>
        </>
      );
    }

    if (documentType === 'id_card') {
      return (
        <>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Holder Name</span>
            <span className="doc-meta-value font-semibold">{payloadData.holder}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Employee ID</span>
            <span className="doc-meta-value mono">{payloadData.employee_id}</span>
          </div>
          <div className="doc-meta-row">
            <span className="doc-meta-label">Organisation</span>
            <span className="doc-meta-value">{payloadData.organisation}</span>
          </div>
        </>
      );
    }

    // Default fallback
    return Object.entries(payloadData).map(([k, v]) => (
      <div key={k} className="doc-meta-row">
        <span className="doc-meta-label capitalize">{k.replace('_', ' ')}</span>
        <span className="doc-meta-value">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
      </div>
    ));
  };

  return (
    <div className="doc-created-card">
      <div className="doc-created-header">
        <div className="doc-created-badge">
          <FileCheck size={18} />
          <span>Document Created Successfully</span>
        </div>
        <h2 className="doc-created-title capitalize">{documentType.replace('_', ' ')} Minted</h2>
        <p className="doc-created-subtitle">
          Cryptographically signed and anchored in the TrustMint ledger.
        </p>
      </div>

      {/* Prominent AI Warnings Banner (Render ONLY if real warnings returned) */}
      {warnings && warnings.length > 0 && (
        <div className="ai-warnings-card" role="alert">
          <div className="ai-warning-header">
            <ShieldAlert size={18} className="ai-warning-icon" />
            <h4 className="ai-warning-title">AI Safety Check</h4>
          </div>
          <ul className="ai-warnings-list">
            {warnings.map((w, idx) => (
              <li key={idx} className="ai-warning-item">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {pdfError && (
        <div className="error-banner" role="alert">
          <AlertTriangle size={18} />
          <span>{pdfError}</span>
        </div>
      )}

      <div className="doc-created-body">
        {/* QR Code Presentation Box */}
        <div className="doc-qr-presentation">
          <div className="doc-qr-canvas-frame">
            {qrHash ? (
              <QRCodeSVG
                value={qrHash}
                size={180}
                bgColor="#ffffff"
                fgColor="#2F2925"
                level="M"
                includeMargin={true}
              />
            ) : (
              <div className="doc-qr-empty">No QR Hash</div>
            )}
          </div>
          <span className="doc-qr-instruction">Scan with any camera QR scanner to verify</span>
        </div>

        {/* Metadata Information Grid */}
        <div className="doc-meta-details">
          <div className="doc-meta-row">
            <span className="doc-meta-label">Document Type</span>
            <span className="doc-meta-value capitalize">{documentType.replace('_', ' ')}</span>
          </div>

          {renderPayloadRows()}

          {docId && (
            <div className="doc-meta-row">
              <span className="doc-meta-label">Document ID</span>
              <span className="doc-meta-value mono">{docId}</span>
            </div>
          )}

          <div className="doc-hash-container">
            <div className="doc-hash-header">
              <span className="doc-hash-label">Cryptographic SHA-256 Hash</span>
              <button
                type="button"
                id="btn-copy-hash"
                className="btn-copy-sm"
                onClick={handleCopyHash}
                title="Copy hash to clipboard"
              >
                {copied ? (
                  <>
                    <Check size={12} color="var(--color-primary)" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="doc-hash-text" title={qrHash}>
              {qrHash}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="doc-created-actions">
        {onNavigateDashboard && (
          <button
            type="button"
            id="btn-back-dashboard-created"
            className="btn-secondary"
            onClick={onNavigateDashboard}
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <button
          type="button"
          id="btn-download-pdf"
          className="btn-secondary"
          onClick={handleDownloadPdf}
          disabled={isDownloadingPdf || !docId}
        >
          {isDownloadingPdf ? (
            <>
              <div className="spinner" />
              <span>Downloading PDF...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download PDF</span>
            </>
          )}
        </button>

        <button
          type="button"
          id="btn-issue-another"
          className="btn-secondary"
          onClick={onResetIssue}
        >
          <PlusCircle size={16} />
          <span>Issue Another</span>
        </button>

        {onNavigateVerify && (
          <button
            type="button"
            id="btn-navigate-verify-created"
            className="btn-primary"
            onClick={() => onNavigateVerify(qrHash)}
          >
            <span>Verify Document</span>
            <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
