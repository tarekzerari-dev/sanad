// ============================
// Admin Login Page
// ============================

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
        <div class="login-brand">
          <img src="${settings.logoUrl || '/logo.png'}" alt="شعار سند" class="login-logo-img" />
          <h2>سَنَد</h2>
        </div>
        <p class="login-subtitle">لوحة تحكم المدرسة القرآنية</p>
        
        <div class="login-error" id="login-error">
          اسم المستخدم أو كلمة المرور غير صحيحة
        </div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني أو اسم المستخدم</label>
            <input type="text" id="login-username" class="form-input" placeholder="admin@sanad.edu أو admin" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label class="form-label">كلمة المرور</label>
            <input type="password" id="login-password" class="form-input" placeholder="أدخل كلمة المرور" autocomplete="current-password" required>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: var(--space-4);">
            <i data-lucide="log-in"></i>
            تسجيل الدخول
          </button>
        </form>
        
        <a href="#/" style="display: block; margin-top: var(--space-6); font-size: var(--font-size-sm); color: var(--text-muted);">
          <i data-lucide="arrow-right" style="width:14px;height:14px;"></i>
          العودة إلى الموقع
        </a>
      </div>
    </div>
  `;

  initIcons();

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    if (adminLogin(username, password)) {
      navigateTo('/admin/dashboard');
    } else {
      document.getElementById('login-error').classList.add('show');
      setTimeout(() => {
        document.getElementById('login-error')?.classList.remove('show');
      }, 3000);
    }
  });
}
