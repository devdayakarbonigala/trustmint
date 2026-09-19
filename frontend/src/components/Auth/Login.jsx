import React, { useState } from 'react';
import { authService } from '../../config/authService';
import { ShieldCheck, AlertCircle, ArrowRight, Info, X } from 'lucide-react';

export default function Login({ onLoginSuccess, onNavigateSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login(cleanUser, cleanPass);
      onLoginSuccess(user);
    } catch (err) {
      setErrorMessage('Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        {/* Left Panel: ONLY TrustMint Branding & Tagline per Modification 2 */}
        <div className="auth-branding-panel">
          <div className="branding-content brand-centered-clean">
            <div className="brand-header-badge">
              <div className="brand-logo-icon">
                <ShieldCheck size={36} />
              </div>
              <span className="brand-logo-text">TrustMint</span>
            </div>

            <div className="branding-tagline-container">
              <p className="branding-tagline">
                &ldquo;If it doesn't exist until you need it,
                <br />
                it can't be faked before you need it.&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Clean Username + Password Login Form */}
        <div className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-header">
              <h2 className="auth-title">Welcome Back</h2>
              <p className="auth-subtitle">Sign in to your TrustMint workspace</p>
            </div>

            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="auth-username">
                  Username
                </label>
                <input
                  id="auth-username"
                  type="text"
                  className="form-input"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="auth-password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="forgot-password-btn"
                    onClick={() => setShowForgotModal(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <input
                  id="auth-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                className="btn-auth-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-nav">
              <p>
                Don't have an account?{' '}
                <button
                  type="button"
                  id="link-create-account"
                  className="link-btn"
                  onClick={onNavigateSignup}
                >
                  Create account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Information Modal */}
      {showForgotModal && (
        <div className="profile-modal-backdrop" onClick={() => setShowForgotModal(false)}>
          <div className="profile-modal-card forgot-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="profile-header-title-box">
                <Info size={18} />
                <h3>Password Recovery</h3>
              </div>
              <button
                type="button"
                className="profile-close-icon-btn"
                onClick={() => setShowForgotModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="profile-modal-body" style={{ padding: '16px 0' }}>
              <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Automated password recovery and self-service resets will be available with production AWS Cognito integration.
              </p>
              <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-muted)' }}>
                Please contact your workspace administrator for temporary account access.
              </p>
            </div>
            <div className="profile-modal-footer">
              <button
                type="button"
                className="btn-primary full-width"
                onClick={() => setShowForgotModal(false)}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
