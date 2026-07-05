
/* ============================================================
   LabWise — sidebar.js
   ============================================================ */

const Sidebar = (() => {

  const MENU_ITEMS = [
    { icon: '🏠', label: 'Dashboard',         href: 'dashboard.html'        },
    { icon: '🧪', label: 'Experiments',       href: 'experiments.html'      },
    { icon: '➕', label: 'Create Experiment', href: 'create-experiment.html'},
    { icon: '📊', label: 'Results',           href: 'results.html'          },
    { icon: '👤', label: 'Account',           href: 'account.html'          },
    { icon: '⚙️', label: 'Settings',          href: 'settings.html'         },
    { icon: '⭐', label: 'Upgrade',           href: 'upgrade.html'          },
  ];

  function render() {
    const container = document.getElementById('sidebar');
    if (!container) return;

    const currentPage = window.location.pathname.split('/').pop();

    let html = `
      <a href="dashboard.html" class="sidebar-logo">
        <span class="sidebar-logo-icon">⚗️</span>
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
          <span class="sidebar-icon">${item.icon}</span>
          <span class="sidebar-label">${item.label}</span>
        </a>
      `;
    });

    html += `</nav>`;

    html += `
      <div class="sidebar-footer">
        <a href="#" class="sidebar-item" id="sidebar-logout-btn">
          <span class="sidebar-icon">🚪</span>
          <span class="sidebar-label">Logout</span>
        </a>
      </div>
    `;

    container.innerHTML = html;
    _insertUserBlock(container);

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
    const tierLabel  = tierLabels[tier] || 'Free';

    /* Avatar: image if available, otherwise initial */
    const avatarHtml = user.avatar_url
      ? `<img src="${user.avatar_url}" alt="Avatar"
             style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid var(--border);"/>`
      : `<div class="sidebar-user-avatar">${initial}</div>`;

    const block = document.createElement('div');
    block.className = 'sidebar-user';
    block.innerHTML = `
      ${avatarHtml}
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.username || 'Student'}</div>
        <span class="sidebar-user-tier tier-${tier}">${tierLabel}</span>
      </div>
    `;

    const footer = container.querySelector('.sidebar-footer');
    if (footer) {
      container.insertBefore(block, footer);
    } else {
      container.appendChild(block);
    }
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
