// ============================================================
// سند — Admin Login Page (بوابة تسجيل دخول الإدارة)
// ============================================================

import { adminLogin, isAdminLoggedIn, getSettings } from '../../data/store.js';
import { navigateTo } from '../../utils/router.js';
import { initIcons } from '../../utils/helpers.js';

export function renderLoginPage() {
  if (isAdminLoggedIn()) {
    navigateTo('/admin/dashboard');
    return;
  }

  const settings = getSettings();
  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="login-page">
      <div class="login-card animate-slide-up">
        
        <!-- School Brand Header -->
        <div class="login-brand">
          <img src="${settings.logoUrl || '/logo.png'}" alt="شعار سند" class="login-logo-img" />
          <h2 style="font-family: var(--font-heading); margin-top: 4px;">مدرسة سَنَد</h2>
        </div>
        <p class="login-subtitle">بوابة الإدارة التربوية والقرآنية</p>
        
        <!-- Error Message Alert -->
        <div class="login-error" id="login-error">
          <i data-lucide="alert-circle" style="width: 15px; height: 15px; display: inline-block; vertical-align: middle; margin-left: 4px;"></i>
          <span>اسم المستخدم أو كلمة المرور غير صحيحة، يرجى المحاولة مجدداً</span>
        </div>

        <!-- Form -->
        <form id="login-form">
          <div class="form-group" style="text-align: right;">
            <label class="form-label">البريد الإلكتروني أو اسم المستخدم</label>
            <input type="text" id="login-username" class="form-input" placeholder="اسم المستخدم أو البريد" autocomplete="username" required>
          </div>

          <div class="form-group" style="text-align: right;">
            <label class="form-label">كلمة المرور</label>
            <input type="password" id="login-password" class="form-input" placeholder="أدخل كلمة المرور" autocomplete="current-password" required>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: var(--space-4); padding: 12px 20px; font-weight: 700;">
            <i data-lucide="log-in"></i>
            <span>دخول لوحة التحكم</span>
          </button>
        </form>
        
        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle);">
          <a href="#/" style="display: inline-flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-xs); color: var(--text-secondary);">
            <i data-lucide="arrow-right" style="width: 14px; height: 14px;"></i>
            <span>العودة إلى الواجهة العامة للمدرسة</span>
          </a>
        </div>

      </div>
    </div>
  `;

  initIcons();

  document.getElementById('login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (adminLogin(username, password)) {
      navigateTo('/admin/dashboard');
    } else {
      const errBox = document.getElementById('login-error');
      if (errBox) {
        errBox.classList.add('show');
        setTimeout(() => errBox.classList.remove('show'), 3500);
      }
    }
  });
}
