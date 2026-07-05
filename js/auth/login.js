/* ============================================================
   LabWise — login.js  (2-step OTP)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (Storage.isLoggedIn()) { Router.dashboard(); return; }

  const loginFormWrap = document.getElementById('login-form-wrap');
  const otpFormWrap   = document.getElementById('otp-form-wrap');
  const loginBtn      = document.getElementById('login-btn');
  const otpBtn        = document.getElementById('otp-btn');
  const formError     = document.getElementById('form-error');
  const otpError      = document.getElementById('otp-error');
  const otpEmailEl    = document.getElementById('otp-email-display');
  const resendBtn     = document.getElementById('resend-otp-btn');

  let pendingEmail = '';

  document.getElementById('toggle-password')
    ?.addEventListener('click', () => {
      const input = document.getElementById('password');
      input.type  = input.type === 'password' ? 'text' : 'password';
    });

  /* ── Step 1: Submit email + password ── */
  document.getElementById('login-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;

      if (!email || !password) {
        showErr(formError, 'Please enter your email and password.');
        return;
      }

      setLoading(loginBtn, true, 'Checking…');
      hideErr(formError);

      const res = await AuthApi.login(email, password);
      setLoading(loginBtn, false, 'Sign In');

      if (!res.ok) {
        if (res.data?.data?.verification_required) {
          Storage.setPendingEmail(email);
          window.location.href = 'verify.html';
          return;
        }
        showErr(formError, res.data?.error || 'Invalid email or password.');
        return;
      }

      /* OTP sent — show step 2 */
      pendingEmail = res.data.data?.email || email;
      Storage.setPendingEmail(pendingEmail);
      if (otpEmailEl) otpEmailEl.textContent = pendingEmail;
      loginFormWrap.classList.add('hidden');
      otpFormWrap.classList.remove('hidden');
      document.getElementById('otp-code')?.focus();
    });

  /* ── Step 2: Submit OTP ── */
  document.getElementById('otp-form')
    ?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = document.getElementById('otp-code').value.trim();

      if (!code || code.length < 6) {
        showErr(otpError, 'Enter the 6-digit code from your email.');
        return;
      }

      setLoading(otpBtn, true, 'Verifying…');
      hideErr(otpError);

      const res = await AuthApi.loginVerify(pendingEmail, code);
      setLoading(otpBtn, false, 'Verify & Sign In');

      if (!res.ok) {
        showErr(otpError, res.data?.error || 'Invalid or expired code.');
        return;
      }

      Storage.setToken(res.data.data.token);
      Storage.setUser(res.data.data.user);
      Storage.clearPendingEmail();
      Router.dashboard();
    });

  /* ── Resend OTP ── */
  resendBtn?.addEventListener('click', async () => {
    resendBtn.disabled    = true;
    resendBtn.textContent = 'Sending…';
    await AuthApi.loginResend(pendingEmail);
    resendBtn.textContent = 'Code resent! ✅';
    setTimeout(() => {
      resendBtn.disabled    = false;
      resendBtn.textContent = 'Resend code';
    }, 30000);
  });

  /* ── Back to step 1 ── */
  document.getElementById('back-to-login')
    ?.addEventListener('click', () => {
      otpFormWrap.classList.add('hidden');
      loginFormWrap.classList.remove('hidden');
      hideErr(otpError);
    });
});

function setLoading(btn, on, label) {
  if (!btn) return;
  btn.disabled = on;
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  if (text)   { text.classList.toggle('hidden', on); if (!on && label) text.textContent = label; }
  if (loader) loader.classList.toggle('hidden', !on);
}
function showErr(el, msg) { if (el) { el.textContent = msg; el.classList.remove('hidden'); } }
function hideErr(el)      { if (el) { el.textContent = ''; el.classList.add('hidden'); } }
                       
