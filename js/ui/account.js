/* ============================================================
   LabWise — account.js
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

  /* ── Profile avatar ── */
  loadAvatar(user);

  /* ── Avatar upload ── */
  const editBtn    = document.getElementById('avatar-edit-btn');
  const fileInput  = document.getElementById('avatar-input');
  const avatarMsg  = document.getElementById('avatar-msg');

  editBtn?.addEventListener('click', () => fileInput?.click());

  fileInput?.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      avatarMsg.textContent = '❌ File too large. Max 2MB.';
      return;
    }

    avatarMsg.textContent = '⏳ Uploading...';

    const formData = new FormData();
    formData.append('avatar', file);

    const token = Storage.getToken();
    const res = await fetch('https://codeveloper.pythonanywhere.com/api/users/me/avatar', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      avatarMsg.textContent = `❌ ${data.error || 'Upload failed'}`;
      return;
    }

    avatarMsg.textContent = '✅ Photo updated!';
    const avatarUrl = data.data.avatar_url;

    /* Update localStorage */
    const updatedUser = { ...Storage.getUser(), avatar_url: avatarUrl };
    Storage.setUser(updatedUser);

    /* Show new avatar */
    showAvatarImage(avatarUrl);

    /* Update sidebar */
    Sidebar.refresh();

    setTimeout(() => { avatarMsg.textContent = ''; }, 3000);
  });

  /* ── Profile card ── */
  setText('profile-name',   user.username);
  setText('profile-email',  user.email);

  const tierNames = {
    free:'Free', tier1:'Tier 1 — Basic',
    tier2:'Tier 2 — Standard', tier3:'Tier 3 — Premium'
  };
  const badgeEl = document.getElementById('profile-tier-badge');
  if (badgeEl) {
    badgeEl.textContent = tierNames[user.tier] || 'Free';
    badgeEl.className   = `profile-tier-badge tier-${user.tier || 'free'}`;
  }

  setText('stat-joined',         formatDate(user.created_at));
  setText('stat-sessions-month', user.sessions_this_month ?? 0);
  setText('stat-sessions-limit', tierInfo?.sessions_per_month ?? 2);

  /* ── Account info panel ── */
  setText('info-username', user.username);
  setText('info-email',    user.email);
  setText('info-phone',    user.phone || 'Not set');
  setText('info-verified', user.is_verified ? '✅ Verified' : '❌ Not verified');

  /* ── Sessions list ── */
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
      row.className = 'session-row';
      row.innerHTML = `
        <div class="session-row-left">
          <div class="session-icon ${s.experiment_name}">
            ${expIcon(s.experiment_name)}
          </div>
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
        s.status === 'completed' ? Router.graph() : Router.lab();
      });
      listEl?.appendChild(row);
    });
  }
});

/* ── Avatar helpers ── */
function loadAvatar(user) {
  if (user.avatar_url) {
    showAvatarImage(user.avatar_url);
  } else {
    const initial = (user.username || 'U').charAt(0).toUpperCase();
    setText('profile-avatar', initial);
  }
}

function showAvatarImage(url) {
  const img     = document.getElementById('profile-avatar-img');
  const initial = document.getElementById('profile-avatar');
  if (img) {
    img.src = url;
    img.classList.remove('hidden');
  }
  if (initial) initial.classList.add('hidden');
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? '';
}
function expIcon(name) {
  return { pendulum:'🔵', hookes:'🟢', moments:'🟡' }[name] || '⚗️';
}
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB',
    { day:'2-digit', month:'short', year:'numeric' });
          }
