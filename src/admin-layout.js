// ============================
// Admin Layout (Sidebar)
// ============================

import { adminLogout, getSettings, pushToCloud, pullFromCloud } from './data/store.js';
import { navigateTo } from './utils/router.js';
import { initIcons } from './utils/helpers.js';
import { showToast } from './components/toast.js';

export function renderAdminLayout(currentPath, contentHtml) {
  const settings = getSettings();
  const navItems = [
    { path: '/admin/dashboard', icon: 'layout-dashboard', label: 'الرئيسية' },
    { path: '/admin/journal', icon: 'book-open', label: 'اليوميات والبرنامج' },
    { path: '/admin/students', icon: 'users', label: 'الطلبة' },
    { path: '/admin/attendance', icon: 'calendar-check', label: 'الحضور' },
    { path: '/admin/memorization', icon: 'book-open-check', label: 'الحفظ' },
    { path: '/admin/points', icon: 'star', label: 'نقاط الطلبة' },
    { path: '/admin/wheel', icon: 'disc-3', label: 'العجلة الدوارة' },
    { path: '/admin/competitions', icon: 'trophy', label: 'المسابقات' },
    { path: '/admin/settings', icon: 'settings', label: 'الإعدادات' },
  ];

  const pageTitle = navItems.find(n => n.path === currentPath)?.label || 'لوحة التحكم';

  return `
    <div class="admin-layout">
      <div class="admin-sidebar-overlay" id="sidebar-overlay"></div>
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="admin-sidebar-brand">
          <a href="#/" class="admin-brand-link">
            <img src="${settings.logoUrl || '/logo.png'}" alt="سند" class="brand-logo-img-sm" />
            <div>
              <div class="brand-name">سَنَد</div>
              <div class="brand-sub">لوحة التحكم</div>
            </div>
          </a>
        </div>
        <nav class="admin-sidebar-nav">
          ${navItems.map(item => `
            <a href="#${item.path}" class="admin-nav-item ${currentPath === item.path ? 'active' : ''}">
              <i data-lucide="${item.icon}"></i>
              ${item.label}
            </a>
          `).join('')}
        </nav>
        <div class="admin-sidebar-footer">
          <a href="#/" class="admin-nav-item" style="margin-bottom: var(--space-2);">
            <i data-lucide="globe"></i>
            عرض الموقع
          </a>
          <button class="admin-nav-item" id="admin-logout-btn" style="width: 100%; color: var(--danger);">
            <i data-lucide="log-out"></i>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <div class="admin-main">
        <header class="admin-topbar">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <button class="admin-sidebar-toggle btn btn-ghost btn-icon" id="sidebar-toggle" aria-label="القائمة">
              <i data-lucide="menu"></i>
            </button>
            <h1 class="admin-topbar-title">${pageTitle}</h1>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            <button class="btn btn-primary" id="global-sync-btn" style="padding: 6px 12px; font-size: 13px; gap: 6px; display: flex; align-items: center; border: none; background: var(--gold-500); color: white;">
              <i data-lucide="cloud-sync" style="width: 16px; height: 16px;"></i>
              حفظ ومزامنة
            </button>
            <span class="admin-badge-user">
              <i data-lucide="shield-check"></i>
              مدير النظام
            </span>
          </div>
        </header>

        <div class="admin-content page-enter">
          ${contentHtml}
        </div>
      </div>
    </div>
  `;
}

export function initAdminLayout() {
  // Sidebar toggle & overlay for mobile/tablet
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

  // Close sidebar on link click on mobile
  sidebar?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeSidebar);
  });

  // Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      adminLogout();
      navigateTo('/');
    });
  }

  // Global Sync Button
  const globalSyncBtn = document.getElementById('global-sync-btn');
  if (globalSyncBtn) {
    globalSyncBtn.addEventListener('click', async () => {
      const icon = globalSyncBtn.querySelector('i');
      if (icon) icon.classList.add('spinning'); // Assume we can add a spin effect via CSS, or just showToast
      
      showToast('جاري المزامنة والحفظ مع جميع الأجهزة...', 'info');
      
      // Push first to save local changes, then pull to get others' changes
      await pushToCloud();
      const updated = await pullFromCloud();
      
      if (icon) icon.classList.remove('spinning');
      
      showToast('تمت المزامنة بنجاح! البيانات الآن محدثة لدى جميع الأجهزة 🎉');
      
      if (updated) {
        // Reload current view to reflect pulled changes
        setTimeout(() => location.reload(), 1000);
      }
    });
  }

  initIcons();
}
