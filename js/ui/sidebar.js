/* ============================================================
   LabWise — sidebar.js
   SVG icons, mobile hamburger menu support
   ============================================================ */

const Sidebar = (() => {

  /* ── SVG icons ── */
  const ICONS = {
    home: `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    flask: `<svg viewBox="0 0 24 24"><path d="M9 3h6M9 3v7l-4 9a1 1 0 0 0 .9 1.5h12.2A1 1 0 0 0 21 19l-4-9V3"/><line x1="6.5" y1="14" x2="17.5" y2="14"/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    chart: `<svg viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    user: `<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    logout: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    logo: `<svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M9 3v7l-4 9a1 1 0 0 0 .9 1.5h12.2A1 1 0 0 0 21 19l-4-9V3"/><line x1="6.5" y1="14" x2="17.5" y2="14"/></svg>`,
  };

  const MENU_ITEMS = [
    { icon: 'home',     label: 'Dashboard',         href: 'dashboard.html'         },
    { icon: 'flask',    label: 'Experiments',        href: 'experiments.html'       },
    { icon: 'plus',     label: 'Create Experiment',  href: 'create-experiment.html' },
    { icon: 'chart',    label: 'Results',            href: 'results.html'           },
    { icon: 'user',     label: 'Account',            href: 'account.html'           },
    { icon: 'settings', label: 'Settings',           href: 'settings.html'          },
    { icon: 'star',     label: 'Upgrade',            href: 'upgrade.html'           },
  ];

  function render() {
    const container = document.getElementById('sidebar');
    if (!container) return;

    const currentPage = window.location.pathname.split('/').pop();

    /* ── Build sidebar HTML ── */
    let html = `
      <a href="dashboard.html" class="sidebar-logo">
        <span class="sidebar-logo-icon">${ICONS.logo}</span>
        <span class="sidebar-logo-text">LabWise</span>
      </a>
      <nav class="sidebar-menu">
    `;

    MENU_ITEMS.forEach(item => {
      const isActive = currentPage === item.href;
      html += `
        <a href="${item.href}"
           class="sidebar-item${isActive ? ' active' : ''}"
           ${isActive ? 'aria-current="page"' : ''}>
          <span class="sidebar-icon">${ICONS[item.icon]}</span>
          <span class="sidebar-label">${item.label}</span>
        </a>
      `;
    });

    html += `</nav>`;
    html += `
      <div class="sidebar-footer">
        <a href="#" class="sidebar-item" id="sidebar-logout-btn">
          <span class="sidebar-icon">${ICONS.logout}</span>
          <span class="sidebar-label">Logout</span>
        </a>
      </div>
    `;

    container.innerHTML = html;
    _insertUserBlock(container);
    _initMobile(container);

    document.getElementById('sidebar-logout-btn')
      ?.addEventListener('click', e => {
        e.preventDefault();
        if (window.Storage) Storage.logout();
        window.location.href = 'login.html';
      });
  }

  function _insertUserBlock(container) {
    if (!window.Storage) return;
    const user = Storage.getUser();
    if (!user) return;

    const tier       = user.tier || 'free';
    const initial    = (user.username || 'U').charAt(0).toUpperCase();
    const tierLabels = { free:'Free', tier1:'Tier 1', tier2:'Tier 2', tier3:'Tier 3' };

    const avatarHtml = user.avatar_url
      ? `<img src="${user.avatar_url}" alt="Avatar"
             style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid var(--border);flex-shrink:0;"/>`
      : `<div class="sidebar-user-avatar">${initial}</div>`;

    const block = document.createElement('div');
    block.className = 'sidebar-user';
    block.innerHTML = `
      ${avatarHtml}
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.username || 'Student'}</div>
        <span class="sidebar-user-tier tier-${tier}">${tierLabels[tier] || 'Free'}</span>
      </div>
    `;

    const footer = container.querySelector('.sidebar-footer');
    footer ? container.insertBefore(block, footer) : container.appendChild(block);
  }

  function _initMobile(container) {
    /* Create hamburger button */
    const btn = document.createElement('button');
    btn.className    = 'hamburger-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.innerHTML = `
      <svg viewBox="0 0 24 24">
        <line x1="3" y1="6"  x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    `;
    document.body.appendChild(btn);

    /* Create overlay */
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
      container.classList.add('mobile-open');
      overlay.classList.add('visible');
      btn.setAttribute('aria-expanded', 'true');
    }
    function closeMenu() {
      container.classList.remove('mobile-open');
      overlay.classList.remove('visible');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', () => {
      container.classList.contains('mobile-open') ? closeMenu() : openMenu();
    });

    overlay.addEventListener('click', closeMenu);

    /* Close menu when a link is tapped */
    container.querySelectorAll('.sidebar-item').forEach(item => {
      item.addEventListener('click', closeMenu);
    });
  }

  function refresh() {
    const existing = document.querySelector('.sidebar-user');
    if (existing) existing.remove();
    const container = document.getElementById('sidebar');
    if (container) _insertUserBlock(container);
  }

  document.addEventListener('DOMContentLoaded', render);

  return { render, refresh };

})();
