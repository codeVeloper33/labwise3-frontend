/* ============================================================
   LabWise — storage.js
   Thin wrapper around localStorage. Every other JS file
   reads/writes through this — never touches localStorage directly.
   ============================================================ */

const Storage = (() => {

  const KEYS = {
    TOKEN:         'lw_token',
    USER:          'lw_user',
    LAB_SESSION:   'lw_lab_session',
    EXPERIMENT:    'lw_experiment',
    PENDING_EMAIL: 'lw_pending_email',
  };

  /* ── Token ── */
  function getToken()      { return localStorage.getItem(KEYS.TOKEN); }
  function setToken(token) { localStorage.setItem(KEYS.TOKEN, token); }
  function removeToken()   { localStorage.removeItem(KEYS.TOKEN); }

  /* ── User ── */
  function getUser() {
    const raw = localStorage.getItem(KEYS.USER);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function setUser(user) { localStorage.setItem(KEYS.USER, JSON.stringify(user)); }
  function removeUser()  { localStorage.removeItem(KEYS.USER); }

  /* ── Lab session ── */
  function getLabSession() {
    const raw = localStorage.getItem(KEYS.LAB_SESSION);
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
  }
  function setLabSession(session) { localStorage.setItem(KEYS.LAB_SESSION, JSON.stringify(session)); }
  function clearLabSession()      { localStorage.removeItem(KEYS.LAB_SESSION); }

  /* ── Current experiment ── */
  function getExperiment()     { return localStorage.getItem(KEYS.EXPERIMENT); }
  function setExperiment(name) { localStorage.setItem(KEYS.EXPERIMENT, name); }
  function clearExperiment()   { localStorage.removeItem(KEYS.EXPERIMENT); }

  /* ── Pending email ── */
  function getPendingEmail()  { return localStorage.getItem(KEYS.PENDING_EMAIL); }
  function setPendingEmail(e) { localStorage.setItem(KEYS.PENDING_EMAIL, e); }
  function clearPendingEmail(){ localStorage.removeItem(KEYS.PENDING_EMAIL); }

  /* ── Auth helpers ── */
  function isLoggedIn() { return !!getToken() && !!getUser(); }

  function requireAuth() {
    if (!isLoggedIn()) { window.location.href = 'login.html'; return false; }
    return true;
  }

  function requireGuest() {
    if (isLoggedIn()) { window.location.href = 'dashboard.html'; return false; }
    return true;
  }

  /* ── Theme ── */
  function applyTheme() {
    const user  = getUser();
    const theme = user?.theme || 'dark';
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }

  /* ── Logout ── */
  function logout() {
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
    localStorage.removeItem(KEYS.LAB_SESSION);
    localStorage.removeItem(KEYS.EXPERIMENT);
    localStorage.removeItem(KEYS.PENDING_EMAIL);
  }

  return {
    getToken, setToken, removeToken,
    getUser,  setUser,  removeUser,
    getLabSession, setLabSession, clearLabSession,
    getExperiment, setExperiment, clearExperiment,
    getPendingEmail, setPendingEmail, clearPendingEmail,
    isLoggedIn, requireAuth, requireGuest,
    applyTheme, logout,
  };

})();
