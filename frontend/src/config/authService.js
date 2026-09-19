/**
 * Authentication Service Abstraction
 * Manages authentication, session persistence, and role retrieval.
 * Uses universal username credentials.
 *
 * Fresh Session Policy:
 * Uses sessionStorage so that fresh browser sessions always begin at the Login page.
 * Purges any legacy persistent localStorage session on initialization.
 */

import { DEMO_USERS } from './demoUsers';

const STORAGE_KEY = 'trustmint_auth_user';
const CUSTOM_USERS_KEY = 'trustmint_custom_users';

// Purge any legacy persistent localStorage session immediately on script load
try {
  localStorage.removeItem(STORAGE_KEY);
} catch {
  // Ignore in restricted environments
}

function getStoredCustomUsers() {
  try {
    const raw = localStorage.getItem(CUSTOM_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCustomUser(user) {
  const users = getStoredCustomUsers();
  users.push(user);
  localStorage.setItem(CUSTOM_USERS_KEY, JSON.stringify(users));
}

export const authService = {
  /**
   * Authenticate user with username and password
   * Automatically discovers and loads user role from account record.
   */
  async login(username, password) {
    // Artificial slight delay for realistic UX
    await new Promise((res) => setTimeout(res, 350));

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      throw new Error('Invalid username or password.');
    }

    const allUsers = [...DEMO_USERS, ...getStoredCustomUsers()];
    const user = allUsers.find(
      (u) => (u.username || '').toLowerCase() === cleanUsername && u.password === cleanPassword
    );

    if (!user) {
      throw new Error('Invalid username or password.');
    }

    // Never store plain password in active session state
    const { password: _, ...safeUser } = user;

    // Use sessionStorage so that a fresh browser session always starts at Login
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    localStorage.removeItem(STORAGE_KEY);

    return safeUser;
  },

  /**
   * Register a new account locally
   * Role is selected only at registration to establish permissions.
   */
  async signup({ name, username, password, role }) {
    await new Promise((res) => setTimeout(res, 400));

    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const allUsers = [...DEMO_USERS, ...getStoredCustomUsers()];

    if (allUsers.some((u) => (u.username || '').toLowerCase() === cleanUsername)) {
      throw new Error('An account with this username already exists.');
    }

    const initials = cleanName
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'TM';

    const roleKey = (role || 'doctor').toLowerCase();
    const roleTitle =
      roleKey === 'doctor'
        ? 'Doctor'
        : roleKey === 'pharmacist'
        ? 'Pharmacist'
        : roleKey === 'issuer' || roleKey.includes('university')
        ? 'University Issuer'
        : 'Event Organizer';

    const normalizedRole =
      roleKey.includes('pharm')
        ? 'pharmacist'
        : roleKey.includes('issue') || roleKey.includes('univ')
        ? 'issuer'
        : roleKey.includes('organ')
        ? 'organizer'
        : 'doctor';

    const newUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      password,
      role: normalizedRole,
      roleTitle,
      organization: 'TrustMint Verified Entity',
      avatar: initials,
    };

    saveCustomUser(newUser);

    const { password: _, ...safeUser } = newUser;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(safeUser));
    localStorage.removeItem(STORAGE_KEY);

    return safeUser;
  },

  /**
   * Retrieve active session user from sessionStorage.
   * Returns null if no active session in current window/tab.
   */
  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  },

  /**
   * Log out active user and clear all session and local storage
   */
  logout() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore in restricted environments
    }
  },
};
