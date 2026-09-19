import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Menu,
  Shield,
  User,
  X,
  ArrowLeft,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function Topbar({ user, roleConfig, onLogout, onToggleMobile }) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Change password form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passwordNotice, setPasswordNotice] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const notifRef = useRef(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleChangePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordNotice('');

    if (!currentPass || !newPass) {
      setPasswordError('Please fill in all password fields.');
      return;
    }

    if (newPass.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPass !== confirmPass) {
      setPasswordError('New passwords do not match.');
      return;
    }

    // Success feedback
    setPasswordNotice('Password updated successfully.');
    setTimeout(() => {
      setShowChangePassword(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setPasswordNotice('');
    }, 1200);
  };

  return (
    <>
      <header className="dashboard-topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="topbar-mobile-menu-btn"
            onClick={onToggleMobile}
            aria-label="Toggle navigation menu"
          >
            <Menu size={22} />
          </button>
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-brand">TrustMint</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{roleConfig.name} Portal</span>
          </div>
        </div>

        <div className="topbar-right">
          {/* Notifications Trigger */}
          <div className="notification-wrapper" ref={notifRef}>
            <button
              type="button"
              id="btn-notifications-trigger"
              className="topbar-icon-btn"
              title="Notifications"
              aria-label="View notifications"
              onClick={() => setShowNotifications((prev) => !prev)}
            >
              <Bell size={18} />
            </button>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notif-dropdown-header">
                  <span className="notif-header-title">Notifications</span>
                </div>
                <div className="notif-empty-state">
                  <Bell size={24} className="notif-empty-icon" />
                  <span className="notif-empty-title">No new notifications</span>
                  <p className="notif-empty-desc">
                    Alerts for document verifications and security events will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Trigger */}
          <button
            type="button"
            id="btn-user-profile-trigger"
            className="topbar-user-profile-btn"
            onClick={() => setShowProfileModal(true)}
            title="View Profile"
          >
            <div className="user-avatar-circle" aria-hidden="true">
              {user.avatar || 'TM'}
            </div>
            <div className="user-meta">
              <span className="user-name-text">{user.name}</span>
              <span className="user-role-badge">{user.roleTitle || roleConfig.name}</span>
            </div>
          </button>
        </div>
      </header>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowProfileModal(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-header-title-box">
                <User size={20} />
                <h3>User Profile</h3>
              </div>
              <button
                type="button"
                className="profile-close-icon-btn"
                onClick={() => setShowProfileModal(false)}
                aria-label="Close profile"
              >
                <X size={18} />
              </button>
            </div>

            <div className="profile-modal-body">
              <div className="profile-avatar-large">
                <span>{user.avatar || 'TM'}</span>
              </div>

              <div className="profile-fields-list">
                <div className="profile-field-row">
                  <span className="profile-field-label">Name</span>
                  <span className="profile-field-value">{user.name}</span>
                </div>

                <div className="profile-field-row">
                  <span className="profile-field-label">Username</span>
                  <span className="profile-field-value mono">{user.username}</span>
                </div>

                <div className="profile-field-row">
                  <span className="profile-field-label">Role</span>
                  <span className="profile-field-value badge">{user.roleTitle || roleConfig.name}</span>
                </div>

                {user.organization && (
                  <div className="profile-field-row">
                    <span className="profile-field-label">Organization</span>
                    <span className="profile-field-value">{user.organization}</span>
                  </div>
                )}
              </div>

              {/* Profile Actions */}
              <div className="profile-actions-list">
                <button
                  type="button"
                  id="btn-trigger-change-password"
                  className="profile-action-row-btn"
                  onClick={() => setShowChangePassword(true)}
                >
                  <KeyRound size={16} />
                  <span>Change Password</span>
                </button>

                {onLogout && (
                  <button
                    type="button"
                    id="btn-profile-logout"
                    className="profile-action-row-btn danger"
                    onClick={() => {
                      setShowProfileModal(false);
                      onLogout();
                    }}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>

            <div className="profile-modal-footer">
              <button
                type="button"
                id="btn-profile-close"
                className="btn-primary full-width"
                onClick={() => setShowProfileModal(false)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal (Only when explicitly selected) */}
      {showChangePassword && (
        <div className="profile-modal-backdrop" onClick={() => setShowChangePassword(false)}>
          <div className="profile-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-header-title-box">
                <KeyRound size={20} />
                <h3>Change Password</h3>
              </div>
              <button
                type="button"
                className="profile-close-icon-btn"
                onClick={() => setShowChangePassword(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit}>
              <div className="profile-modal-body">
                {passwordNotice && (
                  <div className="success-banner" role="alert" style={{ marginBottom: '14px' }}>
                    <CheckCircle2 size={16} />
                    <span>{passwordNotice}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="error-banner" role="alert" style={{ marginBottom: '14px' }}>
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label" htmlFor="input-current-pass">
                    Current Password
                  </label>
                  <input
                    id="input-current-pass"
                    type="password"
                    className="form-input"
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-new-pass">
                    New Password
                  </label>
                  <input
                    id="input-new-pass"
                    type="password"
                    className="form-input"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="input-confirm-new-pass">
                    Confirm New Password
                  </label>
                  <input
                    id="input-confirm-new-pass"
                    type="password"
                    className="form-input"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="profile-modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowChangePassword(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-new-password"
                  className="btn-primary"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
