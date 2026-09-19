import React from 'react';
import { ArrowUpRight, Clock } from 'lucide-react';

export default function RecentActivity({ activities, onNavigateAction }) {
  const hasActivities = activities && activities.length > 0;

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active' || s === 'valid' || s === 'verified') {
      return <span className="status-pill active">{status}</span>;
    }
    if (s === 'used') {
      return <span className="status-pill used">Single-Use</span>;
    }
    if (s === 'expired') {
      return <span className="status-pill expired">{status}</span>;
    }
    return <span className="status-pill rejected">{status}</span>;
  };

  return (
    <div className="activity-panel-card">
      <div className="activity-panel-header">
        <div>
          <h3 className="activity-panel-title">Recent Activity</h3>
          <p className="activity-panel-subtitle">Latest cryptographic actions recorded for this account</p>
        </div>
        {hasActivities && onNavigateAction && (
          <button
            type="button"
            className="activity-view-all-btn"
            onClick={onNavigateAction}
          >
            <span>View All Records</span>
            <ArrowUpRight size={14} />
          </button>
        )}
      </div>

      {hasActivities ? (
        <div className="activity-table-wrapper">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Document / Action</th>
                <th>Recipient / Identifier</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="activity-item-main">
                      <span className="activity-type-badge">{item.type}</span>
                      <span className="activity-action-name">{item.action}</span>
                    </div>
                  </td>
                  <td>
                    <span className="activity-subject-text">{item.subject}</span>
                  </td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="activity-time-text">{item.time}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon-box">
            <Clock size={28} />
          </div>
          <h4 className="empty-state-title">No recent activity</h4>
          <p className="empty-state-desc">
            Activity logs will be recorded here when documents are issued or verified.
          </p>
        </div>
      )}
    </div>
  );
}
