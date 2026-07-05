/* ============================================================
   LabWise — settings.js  (full OTP verification flows)
   ============================================================ */

document.addEventListener('DOMContentLoaded', async () => {

  if (!Storage.requireAuth()) return;

  const res = await UserApi.getMe();
  if (!res.ok) return;

  const user = res.data.data.user;
  Storage.setUser(user);

  /* ── Profile card ── */
  const avatarEl = document.getElementById('profile-avatar');
  if (avatarEl) {
    if (user.avatar_url) {
      avatarEl.innerHTML = `<img src="${user.avatar_url}" alt="avatar"
        style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    } else {
      avatarEl.textContent = (user.username || 'U').charAt(0).toUpperCase();
    }
  }
  setText('profile-name',  user.username);
  setText('profile-email', user.email);

  const tierNames = { free:'Free', tier1:'Tier 1', tier2:'Tier 2', tier3:'Tier 3' };
  const badgeEl = document.getElementById('profile-tier-badge');
  if (badgeEl) {
    badgeEl.textContent = tierNames[user.tier] || 'Free';
    badgeEl.className   = `profile-tier-badge tier-${user.tier || 'free'}`;
  }

  /* Hide upgrade for tier3 */
  if (user.tier === 'tier3') {
    document.querySelector('a[href="upgrade.html"]')?.remove();
  }

  /* ── Theme ── */
  let currentTheme = user.theme || 'dark';
  applyThemeToPage(currentTheme);

  document.querySelectorAll('.theme-option').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.theme === currentTheme);
    opt.addEventListener('click', async () => {
      document.querySelectorAll('.theme-option').forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      currentTheme = opt.dataset.theme;
      applyThemeToPage(currentTheme);
      Storage.setUser({ ...Storage.getUser(), theme: currentTheme });
      await UserApi.updateSettings({ theme: currentTheme });
    });
  });

  /* ── Auto login ── */
  const autoToggle = document.getElementById('auto-login-toggle');
  if (autoToggle) {
    autoToggle.checked = user.auto_login || false;
    autoToggle.addEventListener('change', async () => {
      await UserApi.updateSettings({ auto_login: autoToggle.checked });
    });
  }

  /* ── Change Email (3-step OTP) ── */
  setupChangeEmail();

  /* ── Change Username (2-step OTP) ── */
  setupChangeUsername();

  /* ── Change Password (2-step OTP) ── */
  setupChangePassword();

});

/* ══════════════════════════════════════════════
   CHANGE EMAIL — 3 steps
   Step 1: enter new email → OTP sent to current email
   Step 2: enter OTP from current email → OTP sent to new email
   Step 3: enter OTP from new email → email updated
══════════════════════════════════════════════ */
function setupChangeEmail() {
  /* Step 1 form */
  document.getElementById('email-step1-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newEmail = document.getElementById('new-email')?.value.trim();
      if (!newEmail) { showMsg('email-msg', 'Enter your new email address.', 'error'); return; }

      const res = await UserApi.changeEmailStart(newEmail);
      if (!res.ok) { showMsg('email-msg', res.data?.error || 'Failed.', 'error'); return; }

      showMsg('email-msg', res.data.data?.message || 'Code sent to your current email.', 'success');
      showStep('email-step1', 'email-step2');
    });

  /* Step 2: verify current email OTP */
  document.getElementById('email-step2-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('email-otp1')?.value.trim();
      if (!code) { showMsg('email-msg2', 'Enter the code.', 'error'); return; }

      const res = await UserApi.changeEmailVerify(code);
      if (!res.ok) { showMsg('email-msg2', res.data?.error || 'Invalid code.', 'error'); return; }

      showMsg('email-msg2', res.data.data?.message || 'Code sent to new email.', 'success');
      showStep('email-step2', 'email-step3');
    });

  /* Step 3: verify new email OTP */
  document.getElementById('email-step3-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('email-otp2')?.value.trim();
      if (!code) { showMsg('email-msg3', 'Enter the code.', 'error'); return; }

      const res = await UserApi.changeEmailConfirm(code);
      if (!res.ok) { showMsg('email-msg3', res.data?.error || 'Invalid code.', 'error'); return; }

      showMsg('email-msg3', '✅ Email updated successfully!', 'success');
      Storage.setUser(res.data.data.user);
      setText('profile-email', res.data.data.user.email);
      setTimeout(() => showStep('email-step3', 'email-step1'), 2000);
    });
}

/* ══════════════════════════════════════════════
   CHANGE USERNAME — 2 steps
══════════════════════════════════════════════ */
function setupChangeUsername() {
  document.getElementById('username-step1-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newUsername = document.getElementById('new-username')?.value.trim();
      if (!newUsername) { showMsg('username-msg', 'Enter your new username.', 'error'); return; }

      const res = await UserApi.changeUsernameStart(newUsername);
      if (!res.ok) { showMsg('username-msg', res.data?.error || 'Failed.', 'error'); return; }

      showMsg('username-msg', res.data.data?.message || 'Code sent to your email.', 'success');
      showStep('username-step1', 'username-step2');
    });

  document.getElementById('username-step2-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('username-otp')?.value.trim();
      if (!code) { showMsg('username-msg2', 'Enter the code.', 'error'); return; }

      const res = await UserApi.changeUsernameConfirm(code);
      if (!res.ok) { showMsg('username-msg2', res.data?.error || 'Invalid code.', 'error'); return; }

      showMsg('username-msg2', '✅ Username updated!', 'success');
      Storage.setUser(res.data.data.user);
      setText('profile-name', res.data.data.user.username);
      setTimeout(() => showStep('username-step2', 'username-step1'), 2000);
    });
}

/* ══════════════════════════════════════════════
   CHANGE PASSWORD — 2 steps
══════════════════════════════════════════════ */
function setupChangePassword() {
  document.getElementById('password-step1-btn')
    ?.addEventListener('click', async () => {
      const res = await UserApi.changePasswordStart();
      if (!res.ok) { showMsg('password-msg', res.data?.error || 'Failed.', 'error'); return; }

      showMsg('password-msg', res.data.data?.message || 'Code sent to your email.', 'success');
      showStep('password-step1', 'password-step2');
    });

  document.getElementById('password-step2-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code    = document.getElementById('password-otp')?.value.trim();
      const newPass = document.getElementById('new-password')?.value;

      if (!code)           { showMsg('password-msg2', 'Enter the code.',               'error'); return; }
      if (!newPass || newPass.length < 6) {
        showMsg('password-msg2', 'Password must be at least 6 characters.', 'error'); return;
      }

      const res = await UserApi.changePasswordConfirm(code, newPass);
      if (!res.ok) { showMsg('password-msg2', res.data?.error || 'Invalid code.', 'error'); return; }

      showMsg('password-msg2', '✅ Password updated successfully!', 'success');
      setTimeout(() => showStep('password-step2', 'password-step1'), 2000);
    });
}

/* ── Helpers ── */
function showStep(hideId, showId) {
  document.getElementById(hideId)?.classList.add('hidden');
  document.getElementById(showId)?.classList.remove('hidden');
}
function applyThemeToPage(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}
function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val ?? ''; }
function showMsg(id, msg, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className   = type === 'success' ? 'form-success' : 'form-error';
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 5000);
         }
         
