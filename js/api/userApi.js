/* ============================================================
   LabWise — userApi.js
   ============================================================ */

const UserApi = (() => {

  const BASE = 'https://codeveloper.pythonanywhere.com/api/users';

  async function _req(method, path, body) {
    const token = Storage.getToken();
    const opts  = {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res  = await fetch(BASE + path, opts);
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: { error: 'Network error' } };
    }
  }

  async function getMe()         { return _req('GET',  '/me'); }
  async function getMySessions() { return _req('GET',  '/me/sessions'); }
  async function updateSettings(payload) { return _req('PUT', '/me/settings', payload); }

  /* ── Avatar ── */
  async function uploadAvatar(file) {
    const token    = Storage.getToken();
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      const res  = await fetch(BASE + '/me/avatar', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: { error: 'Network error' } };
    }
  }

  /* ── Change email ── */
  async function changeEmailStart(newEmail)  { return _req('POST', '/me/change-email/start',   { new_email: newEmail }); }
  async function changeEmailVerify(code)     { return _req('POST', '/me/change-email/verify',  { code }); }
  async function changeEmailConfirm(code)    { return _req('POST', '/me/change-email/confirm', { code }); }

  /* ── Change username ── */
  async function changeUsernameStart(newUsername) { return _req('POST', '/me/change-username/start',   { new_username: newUsername }); }
  async function changeUsernameConfirm(code)      { return _req('POST', '/me/change-username/confirm', { code }); }

  /* ── Change password ── */
  async function changePasswordStart()              { return _req('POST', '/me/change-password/start',   {}); }
  async function changePasswordConfirm(code, newPw) { return _req('POST', '/me/change-password/confirm', { code, new_password: newPw }); }

  return {
    getMe, getMySessions, updateSettings, uploadAvatar,
    changeEmailStart, changeEmailVerify, changeEmailConfirm,
    changeUsernameStart, changeUsernameConfirm,
    changePasswordStart, changePasswordConfirm,
  };

})();
                 
