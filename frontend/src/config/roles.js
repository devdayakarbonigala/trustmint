/**
 * Centralized Role Configuration for TrustMint
 * Supports: Doctor, Pharmacist, University Issuer, Event Organizer
 * Enforces strict role-specific navigation, permissions, and clean empty states.
 */

export const ROLES = {
  doctor: {
    id: 'doctor',
    name: 'Doctor',
    dashboardTitle: 'Doctor Dashboard',
    description: 'Issue secure, tamper-proof medical prescriptions with TrustMint.',
    primaryDocType: 'prescription',
    primaryDocName: 'Medical Prescription',
    primaryActionLabel: 'Issue Prescription',
    primaryActionTarget: 'issue',
    canIssue: true,
    canVerify: false,
    navItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'issue', label: 'Issue Prescription', icon: 'FilePlus' },
      { id: 'documents', label: 'Documents', icon: 'FolderArchive' },
    ],
  },

  pharmacist: {
    id: 'pharmacist',
    name: 'Pharmacist',
    dashboardTitle: 'Pharmacist Dashboard',
    description: 'Verify prescription authenticity, enforce single-dispense protection, and prevent fraud.',
    primaryDocType: null,
    primaryDocName: null,
    primaryActionLabel: 'Verify Document',
    primaryActionTarget: 'verify',
    canIssue: false,
    canVerify: true,
    navItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'verify', label: 'Verify Document', icon: 'CheckCircle2' },
      { id: 'documents', label: 'Verification History', icon: 'History' },
    ],
  },

  issuer: {
    id: 'issuer',
    name: 'University Issuer',
    dashboardTitle: 'University Issuer Dashboard',
    description: 'Mint permanent, cryptographically verifiable academic degrees and student credentials.',
    primaryDocType: 'certificate',
    primaryDocName: 'Degree Certificate',
    primaryActionLabel: 'Issue Certificate',
    primaryActionTarget: 'issue',
    canIssue: true,
    canVerify: false,
    navItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'issue', label: 'Issue Document', icon: 'FilePlus' },
      { id: 'documents', label: 'Documents', icon: 'FolderArchive' },
    ],
  },

  organizer: {
    id: 'organizer',
    name: 'Event Organizer',
    dashboardTitle: 'Event Organizer Dashboard',
    description: 'Issue single-use event passes with automated gate check-in verification and fraud prevention.',
    primaryDocType: 'ticket',
    primaryDocName: 'Event Ticket',
    primaryActionLabel: 'Issue Ticket',
    primaryActionTarget: 'issue',
    canIssue: true,
    canVerify: false,
    navItems: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'issue', label: 'Issue Document', icon: 'FilePlus' },
      { id: 'documents', label: 'Documents', icon: 'FolderArchive' },
    ],
  },
};

// Aliases for seamless lookup by title or case
ROLES['Doctor'] = ROLES.doctor;
ROLES['Pharmacist'] = ROLES.pharmacist;
ROLES['University Issuer'] = ROLES.issuer;
ROLES['Event Organizer'] = ROLES.organizer;

/**
 * Robust role resolution helper
 */
export function getRoleConfig(roleInput) {
  if (!roleInput) return ROLES.doctor;
  if (ROLES[roleInput]) return ROLES[roleInput];

  const key = String(roleInput).toLowerCase();
  if (key.includes('doc')) return ROLES.doctor;
  if (key.includes('pharm')) return ROLES.pharmacist;
  if (key.includes('issue') || key.includes('univ')) return ROLES.issuer;
  if (key.includes('organ')) return ROLES.organizer;

  return ROLES.doctor;
}
