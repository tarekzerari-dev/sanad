// ============================================================
// سند — Admin Layout (Master Shell)
// ============================================================

import { adminLogout, getSettings, pushToCloud, pullFromCloud } from './data/store.js';
import { navigateTo } from './utils/router.js';
import { initIcons } from './utils/helpers.js';
import { showToast } from './components/toast.js';

export function renderAdminLayout(currentPath, contentHtml) {
  const settings = getSettings();

  const navGroups = [
    {
      groupTitle: 'المتابعة اليومية',
      items: [
        { path: '/admin/dashboard', icon: 'layout-dashboard', label: 'الرئيسية' },
        { path: '/admin/attendance', icon: 'calendar-check', label: 'حضور اليوم' },
        { path: '/admin/memorization', icon: 'book-open-check', label: 'متابعة الحفظ' },
        { path: '/admin/journal', icon: 'book-open', label: 'اليوميات والبرنامج' },
      ]
    },
    {
      groupTitle: 'الطلبة والأنشطة',
      items: [
        { path: '/admin/students', icon: 'users', label: 'إدارة الطلبة' },
        { path: '/admin/points', icon: 'star', label: 'نقاط الطلبة' },
        { path: '/admin/wheel', icon: 'disc-3', label: 'العجلة الدوارة' },
        { path: '/admin/competitions', icon: 'trophy', label: 'المسابقات القرآنية' },
      ]
    },
    {
      groupTitle: 'المنظومة',
      items: [
        { path: '/admin/settings', icon: 'settings-2', label: 'الإعدادات والنسخ' },
      ]
    }
  ];

  let pageTitle = 'لوحة التحكم الإدارية';
  for (const g of navGroups) {
    const match = g.items.find(i => i.path === currentPath);
    if (match) {
      pageTitle = match.label;
      break;
    }
  }

  return `
    <div class="admin-layout">
      <div class="admin-sidebar-overlay" id="sidebar-overlay"></div>
      
      <!-- Administrative Sidebar -->
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar-brand">
          <a href="#/admin/dashboard" class="admin-brand-link">
            <img src="${settings.logoUrl || '/logo.png'}" alt="شعار سند" class="brand-logo-img-sm" />
            <div>
              <div class="brand-name">مدرسة سَنَد</div>
              <div class="brand-sub">الإدارة التربوية والقرآنية</div>
            </div>
          </a>
        </div>

        <nav class="admin-sidebar-nav">
          ${navGroups.map(g => `
            <div style="margin-bottom: var(--space-4);">
              <div style="font-size: 11px; font-weight: 700; color: #728a7b; padding: 0 14px 6px; letter-spacing: 0.05em; text-transform: uppercase;">
                ${g.groupTitle}
              </div>
              ${g.items.map(item => `
                <a href="#${item.path}" class="admin-nav-item ${currentPath === item.path ? 'active' : ''}">
                  <i data-lucide="${item.icon}"></i>
                  <span>${item.label}</span>
                </a>
              `).join('')}
            </div>
          `).join('')}
        </nav>

        <div class="admin-sidebar-footer">
          <a href="#/" class="admin-nav-item" style="margin-bottom: var(--space-2); color: #c4d1c8;">
            <i data-lucide="external-link"></i>
            <span>معاينة الموقع العام</span>
          </a>
          <button class="admin-nav-item" id="admin-logout-btn" style="width: 100%; color: #f87171;">
            <i data-lucide="log-out"></i>
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      <!-- Main Administrative Workplace -->
      <div class="admin-main">
        <header class="admin-topbar">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <button class="admin-sidebar-toggle btn btn-ghost btn-icon" id="sidebar-toggle" aria-label="فتح القائمة">
              <i data-lucide="menu"></i>
            </button>
            <div>
              <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                <span>سند</span>
                <span>/</span>
                <span style="color: var(--emerald-800); font-weight: 600;">لوحة الإدارة</span>
              </div>
              <h1 class="admin-topbar-title">${pageTitle}</h1>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <button class="btn btn-secondary btn-sm" id="global-sync-btn" style="border-color: var(--brass-300); color: var(--brass-700); background: var(--brass-50);" title="مزامنة فورية لكافة الأجهزة">
              <i data-lucide="cloud-sync" id="sync-icon"></i>
              <span>مزامنة سحابية</span>
            </button>

            <span class="admin-badge-user">
              <i data-lucide="shield-check"></i>
              <span>المدير التربوي</span>
            </span>
          </div>
        </header>

        <main class="admin-content page-enter">
          ${contentHtml}
        </main>
      </div>
    </div>
  `;
}

export function initAdminLayout() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('admin-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('open');
  }

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      const isOpen = sidebar.classList.toggle('open');
      if (overlay) {
        if (isOpen) overlay.classList.add('open');
        else overlay.classList.remove('open');
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  sidebar?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      adminLogout();
      navigateTo('/');
    });
  }

  const globalSyncBtn = document.getElementById('global-sync-btn');
  if (globalSyncBtn) {
    globalSyncBtn.addEventListener('click', async () => {
      const icon = document.getElementById('sync-icon');
      if (icon) icon.classList.add('spinning');
      
      showToast('جاري المزامنة السحابية مع كافة أجهزة المدرسة...', 'info');
      
      await pushToCloud();
      const updated = await pullFromCloud();
      
      if (icon) icon.classList.remove('spinning');
      
      showToast('تمت المزامنة بنجاح! البيانات الآن محدثة على جميع الأجهزة 🎉');
      
      if (updated) {
        setTimeout(() => location.reload(), 800);
      }
    });
  }

  initIcons();
}
