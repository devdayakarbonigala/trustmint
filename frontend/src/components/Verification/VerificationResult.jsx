import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ban,
  XCircle,
  ShieldAlert,
  ArrowLeft,
  Hash,
  FileText,
} from 'lucide-react';

const STATUS_DETAILS = {
  valid: {
    badge: 'VALID',
    title: 'DOCUMENT VERIFIED',
    subtitle: 'This document is authentic, cryptographically verified, and active in the TrustMint ledger.',
    themeClass: 'status-box-valid',
    icon: CheckCircle2,
  },
  already_used: {
    badge: 'ALREADY USED',
    title: 'DOCUMENT ALREADY USED',
    subtitle: 'This single-use credential was already redeemed and cannot be used again.',
    themeClass: 'status-box-used',
    icon: AlertTriangle,
  },
  used: {
    badge: 'ALREADY USED',
    title: 'DOCUMENT ALREADY USED',
    subtitle: 'This single-use credential was already redeemed and cannot be used again.',
    themeClass: 'status-box-used',
    icon: AlertTriangle,
  },
  expired: {
    badge: 'EXPIRED',
    title: 'DOCUMENT EXPIRED',
    subtitle: 'The validity period (TTL) for this document has elapsed. Verification rejected.',
    themeClass: 'status-box-expired',
    icon: Clock,
  },
  revoked: {
    badge: 'REVOKED',
    title: 'DOCUMENT REVOKED',
    subtitle: 'This credential has been explicitly revoked by the issuing authority and is no longer valid.',
    themeClass: 'status-box-revoked',
    icon: Ban,
  },
  invalid: {
    badge: 'INVALID',
    title: 'DOCUMENT INVALID',
    subtitle: 'No matching cryptographic record was found. This document may be unregistered or illegitimate.',
    themeClass: 'status-box-invalid',
    icon: XCircle,
  },
  tampered: {
    badge: 'TAMPERED',
    title: 'DOCUMENT TAMPERED',
    subtitle: 'Cryptographic signature mismatch or unauthorized payload alteration detected. Verification failed.',
    themeClass: 'status-box-tampered',
    icon: ShieldAlert,
  },
};

export default function VerificationResult({ resultData, verifiedHash, onBack }) {
  if (!resultData) return null;

  const resultKey = (resultData.result || 'invalid').toLowerCase();
  const config = STATUS_DETAILS[resultKey] || STATUS_DETAILS.invalid;
  const Icon = config.icon;

  const { payload, type, verification, created_at, ttl } = resultData;

  const renderPayloadFields = () => {
    if (!payload || typeof payload !== 'object') return null;

    return (
      <>
        {/* Prescription */}
        {payload.patient && (
          <div className="verif-detail-item">
            <span className="verif-label">Patient Name</span>
            <span className="verif-value font-semibold">{payload.patient}</span>
          </div>
        )}
        {payload.drugs && (
          <div className="verif-detail-item">
            <span className="verif-label">Prescribed Medicines</span>
            <span className="verif-value">
              {Array.isArray(payload.drugs) ? payload.drugs.join(', ') : payload.drugs}
            </span>
          </div>
        )}
        {payload.doctor && (
          <div className="verif-detail-item">
            <span className="verif-label">Prescriber / Doctor</span>
            <span className="verif-value">{payload.doctor}</span>
          </div>
        )}

        {/* Certificate */}
        {payload.recipient && (
          <div className="verif-detail-item">
            <span className="verif-label">Recipient Name</span>
            <span className="verif-value font-semibold">{payload.recipient}</span>
          </div>
        )}
        {payload.course && (
          <div className="verif-detail-item">
            <span className="verif-label">Degree / Course</span>
            <span className="verif-value">{payload.course}</span>
          </div>
        )}
        {payload.institution && (
          <div className="verif-detail-item">
            <span className="verif-label">Institution</span>
            <span className="verif-value">{payload.institution}</span>
          </div>
        )}

        {/* Ticket / Event Pass */}
        {payload.attendee && (
          <div className="verif-detail-item">
            <span className="verif-label">Attendee Name</span>
            <span className="verif-value font-semibold">{payload.attendee}</span>
          </div>
        )}
        {payload.event && (
          <div className="verif-detail-item">
            <span className="verif-label">Event Name</span>
            <span className="verif-value">{payload.event}</span>
          </div>
        )}
        {payload.seat && (
          <div className="verif-detail-item">
            <span className="verif-label">Seat Assigned</span>
            <span className="verif-value">{payload.seat}</span>
          </div>
        )}
        {payload.gate && (
          <div className="verif-detail-item">
            <span className="verif-label">Designated Gate</span>
            <span className="verif-value">{payload.gate}</span>
          </div>
        )}

        {/* Invoice */}
        {payload.biller && (
          <div className="verif-detail-item">
            <span className="verif-label">Biller</span>
            <span className="verif-value font-semibold">{payload.biller}</span>
          </div>
        )}
        {payload.payer && (
          <div className="verif-detail-item">
            <span className="verif-label">Payer</span>
            <span className="verif-value">{payload.payer}</span>
          </div>
        )}
        {payload.amount && (
          <div className="verif-detail-item">
            <span className="verif-label">Invoice Amount</span>
            <span className="verif-value font-semibold">{payload.amount}</span>
          </div>
        )}

        {/* ID Card */}
        {payload.holder && (
          <div className="verif-detail-item">
            <span className="verif-label">Card Holder</span>
            <span className="verif-value font-semibold">{payload.holder}</span>
          </div>
        )}
        {payload.employee_id && (
          <div className="verif-detail-item">
            <span className="verif-label">Employee ID</span>
            <span className="verif-value mono">{payload.employee_id}</span>
          </div>
        )}
        {payload.organisation && (
          <div className="verif-detail-item">
            <span className="verif-label">Organisation</span>
            <span className="verif-value">{payload.organisation}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="verification-result-wrapper">
      <div className={`verification-result-card ${config.themeClass}`}>
        {/* Status Header Banner */}
        <div className="verif-card-header">
          <div className="verif-icon-circle">
            <Icon size={30} />
          </div>
          <div>
            <div className="verif-badge">{config.badge}</div>
            <h2 className="verif-title">{config.title}</h2>
            <p className="verif-subtitle">{config.subtitle}</p>
          </div>
        </div>

        {/* Verification Details Grid */}
        <div className="verif-details-body">
          {type && (
            <div className="verif-detail-item">
              <span className="verif-label">Document Type</span>
              <span className="verif-value capitalize">{type.replace('_', ' ')}</span>
            </div>
          )}

          {renderPayloadFields()}

          {verification !== undefined && (
            <div className="verif-detail-item">
              <span className="verif-label">Verification Counter</span>
              <span className="verif-value font-semibold">#{verification}</span>
            </div>
          )}

          {created_at && (
            <div className="verif-detail-item">
              <span className="verif-label">Issued At</span>
              <span className="verif-value">{new Date(created_at * 1000).toLocaleString()}</span>
            </div>
          )}

          {ttl && (
            <div className="verif-detail-item">
              <span className="verif-label">Expires (TTL)</span>
              <span className="verif-value">{new Date(ttl * 1000).toLocaleString()}</span>
            </div>
          )}

          {verifiedHash && (
            <div className="verif-hash-box">
              <div className="verif-hash-header">
                <Hash size={14} />
                <span>Verified SHA-256 Hash</span>
              </div>
              <div className="verif-hash-text">{verifiedHash}</div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="verif-footer-actions">
          <button
            type="button"
            id="btn-back-to-verify"
            className="btn-secondary"
            onClick={onBack}
          >
            <ArrowLeft size={16} />
            <span>Verify Another Document</span>
          </button>
        </div>
      </div>
    </div>
  );
}
