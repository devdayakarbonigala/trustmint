import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({
  user,
  roleConfig,
  activeSection,
  onSelectSection,
  onLogout,
  children,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="dashboard-layout-root">
      <Sidebar
        roleConfig={roleConfig}
        activeSection={activeSection}
        onSelectSection={onSelectSection}
        onLogout={onLogout}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="dashboard-main-container">
        <Topbar
          user={user}
          roleConfig={roleConfig}
          onLogout={onLogout}
          onToggleMobile={() => setMobileOpen((prev) => !prev)}
        />

        <main className="dashboard-content-body">
          <div className="dashboard-content-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
