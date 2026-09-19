import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  FilePlus,
  CheckCircle2,
  FolderArchive,
  History,
  LogOut,
  X,
} from 'lucide-react';

const ICON_MAP = {
  LayoutDashboard,
  FilePlus,
  CheckCircle2,
  FolderArchive,
  History,
};

export default function Sidebar({
  roleConfig,
  activeSection,
  onSelectSection,
  onLogout,
  mobileOpen,
  onCloseMobile,
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside className={`dashboard-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-logo-badge">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="sidebar-brand-name">TrustMint</span>
              <span className="sidebar-brand-tag">Forge-Proof Engine</span>
            </div>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-role-indicator">
          <span className="role-indicator-label">Active Workspace</span>
          <span className="role-indicator-badge">{roleConfig.name}</span>
        </div>

        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {roleConfig.navItems.map((item) => {
              const Icon = ICON_MAP[item.icon] || LayoutDashboard;
              const isActive = activeSection === item.id;
              return (
                <li key={item.id} className="sidebar-nav-item">
                  <button
                    type="button"
                    id={`nav-${item.id}`}
                    className={`sidebar-nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectSection(item.id);
                      if (onCloseMobile) onCloseMobile();
                    }}
                  >
                    <Icon size={18} className="sidebar-nav-icon" />
                    <span className="sidebar-nav-label">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            id="nav-logout"
            className="sidebar-nav-btn logout"
            onClick={onLogout}
          >
            <LogOut size={18} className="sidebar-nav-icon" />
            <span className="sidebar-nav-label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
