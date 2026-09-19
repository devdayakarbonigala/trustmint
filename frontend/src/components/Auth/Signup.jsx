import React, { useState } from 'react';
import { authService } from '../../config/authService';
import { ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';

export default function Signup({ onSignupSuccess, onNavigateLogin }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('doctor');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.signup({ name, username, password, role });
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onSignupSuccess(user);
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to register account.');
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        {/* Left Panel: Clean TrustMint Branding */}
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

        {/* Right Panel: Sign Up Form */}
        <div className="auth-form-panel">
          <div className="auth-form-card">
            <div className="auth-header">
              <h2 className="auth-title">Create an Account</h2>
              <p className="auth-subtitle">Register a new account on TrustMint</p>
            </div>

            {errorMessage && (
              <div className="auth-error-banner" role="alert">
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="auth-success-banner" role="alert">
                <ShieldCheck size={18} />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="signup-name">
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Dr. Priya Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-username">
                  Username
                </label>
                <input
                  id="signup-username"
                  type="text"
                  className="form-input"
                  placeholder="e.g. doctor01"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-role">
                  Role
                </label>
                <select
                  id="signup-role"
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="doctor">Doctor (Medical Prescriptions)</option>
                  <option value="pharmacist">Pharmacist (Verification Only)</option>
                  <option value="issuer">University Issuer (Degree Certificates)</option>
                  <option value="organizer">Event Organizer (Access Tickets)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  className="form-input"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <button
                type="submit"
                id="btn-signup-submit"
                className="btn-auth-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-nav">
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  id="link-sign-in"
                  className="link-btn"
                  onClick={onNavigateLogin}
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
