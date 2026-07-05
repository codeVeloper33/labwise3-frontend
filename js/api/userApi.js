/* ============================================================
   LabWise — userApi.js
   ============================================================ */

const UserApi = (() => {

  const BASE = 'https://codeveloper.pythonanywhere.com/api/users';

  async function _req(method, path, body) {
    const token = Storage.getToken();
    const opts  = {
      method,
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
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

  return { getMe, getMySessions, updateSettings, uploadAvatar };

})();
