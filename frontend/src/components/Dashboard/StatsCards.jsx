import React from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle,
  Clock,
  Ban,
  ShieldAlert,
  Layers,
} from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  const cardItems = [
    {
      id: 'stat-total',
      label: 'Total Documents',
      value: stats.total,
      icon: Layers,
      highlight: false,
    },
    {
      id: 'stat-active',
      label: 'Active',
      value: stats.active,
      icon: ShieldCheck,
      highlight: false,
    },
    {
      id: 'stat-used',
      label: 'Used (Single-Use)',
      value: stats.used,
      icon: CheckCircle,
      highlight: false,
    },
    {
      id: 'stat-verified',
      label: 'Verified',
      value: stats.verified,
      icon: FileText,
      highlight: false,
    },
    {
      id: 'stat-revoked',
      label: 'Revoked',
      value: stats.revoked,
      icon: Ban,
      highlight: false,
    },
    {
      id: 'stat-expired',
      label: 'Expired',
      value: stats.expired,
      icon: Clock,
      highlight: false,
    },
    {
      id: 'stat-fraud-attempts',
      label: 'Forgery Attempts Blocked',
      value: stats.fraud_attempts,
      icon: ShieldAlert,
      highlight: true, // Prominently highlighted per requirement
    },
  ];

  return (
    <div className="stats-grid seven-grid">
      {cardItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.id}
            id={item.id}
            className={`stat-card ${item.highlight ? 'stat-card-highlight' : ''}`}
          >
            <div className="stat-card-header">
              <span className="stat-label">{item.label}</span>
              <div className={`stat-icon-wrapper ${item.highlight ? 'icon-highlight' : ''}`}>
                <Icon size={18} />
              </div>
            </div>
            <div className="stat-card-body">
              <div className="stat-value">{item.value ?? 0}</div>
              {item.highlight && (
                <div className="stat-badge-security">
                  <span>Cryptographic Defense Active</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
