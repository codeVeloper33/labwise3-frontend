/* ============================================================
   LabWise — account.js (base64 avatar upload)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  if (!Storage.requireAuth()) return;

  const [meRes, sessRes] = await Promise.all([
    UserApi.getMe(),
    UserApi.getMySessions(),
  ]);

  if (!meRes.ok) return;

  const user     = meRes.data.data.user;
  const tierInfo = meRes.data.data.tier_info;
  Storage.setUser(user);

  loadAvatar(user);

  const editBtn   = document.getElementById('avatar-edit-btn');
  const fileInput = document.getElementById('avatar-input');
  const avatarMsg = document.getElementById('avatar-msg');

  editBtn?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (avatarMsg) avatarMsg.textContent = '❌ File too large. Max 2MB.';
      return;
    }

    if (avatarMsg) avatarMsg.textContent = '⏳ Uploading...';

    try {
      /* Convert to base64 */
      const base64 = await fileToBase64(file);

      const token = Storage.getToken();
      const res   = await fetch(
        'https://codeveloper.pythonanywhere.com/api/users/me/avatar',
        {
          method:  'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            avatar_data:  base64,
            content_type: file.type,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        if (avatarMsg) avatarMsg.textContent = `❌ ${data.error || 'Upload failed'}`;
        return;
      }

      const avatarUrl = data.data.avatar_url;
      if (avatarMsg) avatarMsg.textContent = '✅ Photo updated!';
      const updatedUser = { ...Storage.getUser(), avatar_url: avatarUrl };
      Storage.setUser(updatedUser);
      showAvatarImage(avatarUrl);
      Sidebar.refresh();
      setTimeout(() => { if (avatarMsg) avatarMsg.textContent = ''; }, 3000);

    } catch (err) {
      if (avatarMsg) avatarMsg.textContent = '❌ Upload failed. Check your connection.';
    }

    fileInput.value = '';
  });

  /* ── Profile card ── */
  setText('profile-name',  user.username);
  setText('profile-email', user.email);

  const tierNames = { free:'Free', tier1:'Tier 1 — Basic', tier2:'Tier 2 — Standard', tier3:'Tier 3 — Premium' };
  const badgeEl = document.getElementById('profile-tier-badge');
  if (badgeEl) {
    badgeEl.textContent = tierNames[user.tier] || 'Free';
    badgeEl.className   = `profile-tier-badge tier-${user.tier || 'free'}`;
  }

  if (user.tier === 'tier3') document.querySelector('a[href="upgrade.html"]')?.remove();

  setText('stat-joined',         formatDate(user.created_at));
  setText('stat-sessions-month', user.sessions_this_month ?? 0);
  setText('stat-sessions-limit', tierInfo?.sessions_per_month ?? 2);
  setText('info-username', user.username);
  setText('info-email',    user.email);
  setText('info-phone',    user.phone || 'Not set');
  setText('info-verified', user.is_verified ? '✅ Verified' : '❌ Not verified');

  const sessions  = sessRes.ok ? (sessRes.data.data.sessions || []) : [];
  const completed = sessions.filter(s => s.status === 'completed').length;
  setText('stat-total-completed', completed);

  const listEl  = document.getElementById('account-sessions-list');
  const emptyEl = document.getElementById('account-sessions-empty');

  if (!sessions.length) {
    emptyEl?.classList.remove('hidden');
  } else {
    emptyEl?.classList.add('hidden');
    sessions.slice(0, 6).forEach(s => {
      const row = document.createElement('div');
      row.className    = 'session-row';
      row.style.cursor = 'pointer';
      row.innerHTML = `
        <div class="session-row-left">
          <div class="session-icon">${expIcon(s.experiment_name)}</div>
          <div>
            <div class="session-title">${s.experiment_title || s.experiment_name}</div>
            <div class="session-date">${formatDate(s.created_at)}</div>
          </div>
        </div>
        <span class="status-pill ${s.status}">
          ${s.status === 'completed' ? 'Done' : 'In Progress'}
        </span>
      `;
      row.addEventListener('click', () => {
        Storage.setLabSession(s);
        Storage.setExperiment(s.experiment_name);
        window.location.href = s.status === 'completed' ? 'results.html' : 'lab.html';
      });
      listEl?.appendChild(row);
    });
  }
});

/* ── File to base64 ── */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function loadAvatar(user) {
  if (user.avatar_url) { showAvatarImage(user.avatar_url); return; }
  const el = document.getElementById('profile-avatar');
  if (el) el.textContent = (user.username || 'U').charAt(0).toUpperCase();
}
function showAvatarImage(url) {
  const img = document.getElementById('profile-avatar-img');
  const ini = document.getElementById('profile-avatar');
  if (img) { img.src = url; img.classList.remove('hidden'); }
  if (ini) ini.classList.add('hidden');
}
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val ?? ''; }
function expIcon(n) { return { pendulum:'🔵', hookes:'🟢', moments:'🟡' }[n] || '⚗️'; }
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  }
