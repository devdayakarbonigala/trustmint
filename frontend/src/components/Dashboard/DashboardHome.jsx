import React, { useState, useEffect } from 'react';
import { getDashboardStats, getIssuedDocuments } from '../../config/api';
import StatsCards from './StatsCards';
import RecentActivity from './RecentActivity';
import {
  PlusCircle,
  Search,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export default function DashboardHome({ user, roleConfig, onSelectSection }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchStats = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load live dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Load recent session activity from local storage ledger
    const docs = getIssuedDocuments();
    const formatted = docs.map((d) => ({
      id: d.doc_id,
      type: (d.type_id || 'document').replace('_', ' ').toUpperCase(),
      action: 'Document Minted',
      subject: d.payload?.patient || d.payload?.recipient || d.payload?.attendee || d.payload?.holder || d.payload?.biller || 'Ledger Entry',
      status: d.status || 'active',
      time: d.created_at ? new Date(d.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
    }));
    setRecentActivities(formatted);
  }, []);

  // Time of day greeting
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const isIssuer = roleConfig.canIssue;
  const PrimaryActionIcon = isIssuer ? PlusCircle : Search;

  return (
    <div className="dashboard-home-wrapper">
      {/* Hero Welcome Banner */}
      <div className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-badge">
            <ShieldCheck size={14} />
            <span>Universal Forge-Proofing Active</span>
          </div>
          <h1 className="hero-title">{roleConfig.dashboardTitle}</h1>
          <p className="hero-greeting">
            {greetingTime}, <span className="greeting-name">{user.name}</span>
          </p>
          <p className="hero-description">{roleConfig.description}</p>
        </div>

        <div className="hero-banner-actions">
          <button
            type="button"
            id="btn-refresh-dashboard"
            className="btn-secondary btn-icon-only"
            onClick={fetchStats}
            title="Refresh Live Statistics"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
          </button>

          <button
            type="button"
            id="btn-primary-dashboard-action"
            className="hero-action-btn"
            onClick={() => onSelectSection(roleConfig.primaryActionTarget || 'verify')}
          >
            <PrimaryActionIcon size={18} />
            <span>{roleConfig.primaryActionLabel}</span>
          </button>
        </div>
      </div>

      {/* Live Dashboard Statistics Section */}
      <div className="dashboard-stats-section">
        <div className="section-header-inline">
          <div>
            <h2 className="section-title-sm">Cryptographic Ledger Metrics</h2>
            <p className="section-subtitle-sm">Live AWS DynamoDB statistics</p>
          </div>
          {stats && (
            <span className="live-status-pill">
              <span className="pulsing-dot" /> Live AWS Sync
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="dashboard-loading-card">
            <div className="spinner" />
            <span>Loading dashboard...</span>
          </div>
        ) : errorMessage ? (
          <div className="dashboard-error-card" role="alert">
            <AlertCircle size={20} />
            <div className="error-content">
              <span className="error-title">Could not fetch live dashboard metrics</span>
              <span className="error-desc">{errorMessage}</span>
            </div>
            <button
              type="button"
              id="btn-retry-stats"
              className="btn-secondary btn-sm"
              onClick={fetchStats}
            >
              Retry
            </button>
          </div>
        ) : (
          <StatsCards stats={stats} />
        )}
      </div>

      {/* Role-Specific Recent Activity Audit Table */}
      <RecentActivity
        activities={recentActivities}
        onNavigateAction={() => onSelectSection('documents')}
      />
    </div>
  );
}
