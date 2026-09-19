import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessRestricted({ roleName, onBackToDashboard }) {
  return (
    <div className="access-restricted-container">
      <div className="access-restricted-card">
        <div className="restricted-icon-circle">
          <ShieldAlert size={36} />
        </div>
        <h2 className="restricted-title">Access Restricted</h2>
        <p className="restricted-message">
          Your current role {roleName ? `(${roleName})` : ''} does not have authorization to view this section. Navigation is restricted in accordance with the principle of least privilege.
        </p>
        <div className="restricted-actions">
          <button
            type="button"
            id="btn-back-to-dashboard"
            className="btn-primary"
            onClick={onBackToDashboard}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
}
