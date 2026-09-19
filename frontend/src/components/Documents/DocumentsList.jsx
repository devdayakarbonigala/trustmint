import React, { useState, useEffect } from 'react';
import {
  getIssuedDocuments,
  revokeDocument,
  downloadDocumentPdf,
} from '../../config/api';
import {
  FolderArchive,
  ArrowLeft,
  History,
  FileText,
  Download,
  Ban,
  Search,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function DocumentsList({ roleConfig, onVerifyDoc, onNavigateDashboard }) {
  const isVerificationHistory = roleConfig?.id === 'pharmacist';
  const [documents, setDocuments] = useState([]);
  const [revokingId, setRevokingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [actionError, setActionError] = useState('');

  const loadDocuments = () => {
    const list = getIssuedDocuments();
    setDocuments(list);
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleRevoke = async (docId) => {
    if (!window.confirm('Are you sure you want to revoke this document? This action is permanent.')) {
      return;
    }

    setActionError('');
    setActionNotice('');
    setRevokingId(docId);

    try {
      const res = await revokeDocument(docId);
      setActionNotice(`Document ${docId.slice(0, 8)}... successfully revoked.`);
      loadDocuments();
    } catch (err) {
      setActionError(err.message || 'Failed to revoke document.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleDownloadPdf = async (docId, typeId) => {
    setActionError('');
    setActionNotice('');
    setDownloadingId(docId);
    try {
      await downloadDocumentPdf(docId, typeId);
      setActionNotice('PDF downloaded successfully.');
    } catch (err) {
      setActionError(err.message || 'PDF download failed.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="panel-card doc-list-panel">
      {onNavigateDashboard && (
        <div className="section-top-nav-bar">
          <button
            type="button"
            id="btn-back-to-dashboard-docs"
            className="btn-link-back"
            onClick={onNavigateDashboard}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      )}

      <div className="panel-header">
        <div>
          <div className="panel-badge">
            {isVerificationHistory ? <History size={14} /> : <FolderArchive size={14} />}
            <span>{isVerificationHistory ? 'Verification Logs' : 'Document Ledger'}</span>
          </div>
          <h2 className="panel-title">
            {isVerificationHistory ? 'Verification History' : `${roleConfig?.name || 'Account'} Documents`}
          </h2>
          <p className="panel-subtitle">
            {isVerificationHistory
              ? 'Audit log of verified documents and cryptographic scan results.'
              : 'Cryptographic credentials issued and recorded in the ledger.'}
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="success-banner" role="alert" style={{ marginBottom: '16px' }}>
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {actionError && (
        <div className="error-banner" role="alert" style={{ marginBottom: '16px' }}>
          <AlertCircle size={16} />
          <span>{actionError}</span>
        </div>
      )}

      {documents.length > 0 && !isVerificationHistory ? (
        <div className="activity-table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Document ID</th>
                <th>Type</th>
                <th>Subject / Recipient</th>
                <th>Issued Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const subject =
                  doc.payload?.patient ||
                  doc.payload?.recipient ||
                  doc.payload?.attendee ||
                  doc.payload?.holder ||
                  doc.payload?.biller ||
                  'N/A';

                const isRevoked = doc.status === 'revoked';

                return (
                  <tr key={doc.doc_id}>
                    <td>
                      <span className="doc-id-pill" title={doc.doc_id}>
                        {doc.doc_id.slice(0, 13)}...
                      </span>
                    </td>
                    <td>
                      <div className="doc-item-title-col">
                        <FileText size={16} color="var(--color-primary)" />
                        <span className="doc-item-title-text capitalize">
                          {(doc.type_id || 'document').replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="activity-subject-text">{subject}</span>
                    </td>
                    <td>
                      <span className="activity-time-text">
                        {doc.created_at ? new Date(doc.created_at * 1000).toLocaleDateString() : 'Recent'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill ${doc.status || 'active'}`}>
                        {doc.status || 'active'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="table-actions-group">
                        <button
                          type="button"
                          className="btn-action-icon"
                          title="Download PDF"
                          disabled={downloadingId === doc.doc_id}
                          onClick={() => handleDownloadPdf(doc.doc_id, doc.type_id)}
                        >
                          <Download size={14} />
                        </button>

                        {!isRevoked && (
                          <button
                            type="button"
                            className="btn-action-icon btn-action-danger"
                            title="Revoke Document"
                            disabled={revokingId === doc.doc_id}
                            onClick={() => handleRevoke(doc.doc_id)}
                          >
                            <Ban size={14} />
                          </button>
                        )}

                        {onVerifyDoc && doc.qr_hash && (
                          <button
                            type="button"
                            className="btn-table-action"
                            title="Verify Hash"
                            onClick={() => onVerifyDoc(doc.qr_hash)}
                          >
                            <Search size={12} />
                            <span>Verify</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon-box">
            {isVerificationHistory ? <History size={28} /> : <FolderArchive size={28} />}
          </div>
          <h4 className="empty-state-title">
            {isVerificationHistory ? 'No verification history' : 'No documents available yet.'}
          </h4>
          <p className="empty-state-desc">
            {isVerificationHistory
              ? 'Verification records will appear here as credentials are authenticated.'
              : 'Newly minted credentials will appear in this ledger once created.'}
          </p>
        </div>
      )}
    </div>
  );
}
