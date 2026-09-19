import React, { useState } from 'react';
import { authService } from './config/authService';
import { getRoleConfig } from './config/roles';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardHome from './components/Dashboard/DashboardHome';
import IssueDocument from './components/Documents/IssueDocument';
import VerifyDocument from './components/Verification/VerifyDocument';
import DocumentsList from './components/Documents/DocumentsList';
import AccessRestricted from './components/Layout/AccessRestricted';

export default function App() {
  // Session Authentication State
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
  const [authView, setAuthView] = useState('login'); // 'login' | 'signup'

  // Dashboard Section Navigation: 'dashboard' | 'issue' | 'verify' | 'documents'
  const [activeSection, setActiveSection] = useState('dashboard');

  // Transferred hash for verification
  const [pendingVerifyHash, setPendingVerifyHash] = useState('');

  // Handle Login
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveSection('dashboard');
    setPendingVerifyHash('');
  };

  // Handle Logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setAuthView('login');
    setActiveSection('dashboard');
    setPendingVerifyHash('');
  };

  // Navigate to Verification with pre-filled hash
  const handleNavigateVerify = (hash) => {
    setPendingVerifyHash(hash || '');
    setActiveSection('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If not logged in, render the Auth Flow (Login or Signup)
  if (!currentUser) {
    if (authView === 'signup') {
      return (
        <Signup
          onSignupSuccess={handleLoginSuccess}
          onNavigateLogin={() => setAuthView('login')}
        />
      );
    }

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateSignup={() => setAuthView('signup')}
      />
    );
  }

  // Retrieve current active role configuration using canonical resolver
  const roleConfig = getRoleConfig(currentUser.role);

  return (
    <DashboardLayout
      user={currentUser}
      roleConfig={roleConfig}
      activeSection={activeSection}
      onSelectSection={(sectionId) => {
        setActiveSection(sectionId);
        if (sectionId !== 'verify') {
          setPendingVerifyHash('');
        }
      }}
      onLogout={handleLogout}
    >
      {activeSection === 'dashboard' && (
        <DashboardHome
          user={currentUser}
          roleConfig={roleConfig}
          onSelectSection={(sectionId) => {
            setActiveSection(sectionId);
            if (sectionId !== 'verify') {
              setPendingVerifyHash('');
            }
          }}
        />
      )}

      {activeSection === 'issue' && (
        roleConfig.canIssue ? (
          <IssueDocument
            user={currentUser}
            roleConfig={roleConfig}
            onNavigateVerify={roleConfig.canVerify ? handleNavigateVerify : null}
            onNavigateDashboard={() => setActiveSection('dashboard')}
          />
        ) : (
          <AccessRestricted
            roleName={roleConfig.name}
            onBackToDashboard={() => setActiveSection('dashboard')}
          />
        )
      )}

      {activeSection === 'verify' && (
        roleConfig.canVerify ? (
          <VerifyDocument
            initialHash={pendingVerifyHash}
            onClearInitialHash={() => setPendingVerifyHash('')}
            onNavigateDashboard={() => setActiveSection('dashboard')}
          />
        ) : (
          <AccessRestricted
            roleName={roleConfig.name}
            onBackToDashboard={() => setActiveSection('dashboard')}
          />
        )
      )}

      {activeSection === 'documents' && (
        <DocumentsList
          roleConfig={roleConfig}
          onVerifyDoc={(docId) => {
            if (roleConfig.canVerify) {
              setActiveSection('verify');
            }
          }}
          onNavigateDashboard={() => setActiveSection('dashboard')}
        />
      )}
    </DashboardLayout>
  );
}
