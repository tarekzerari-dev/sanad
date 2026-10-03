// ============================
// Developer Page (عن المطور)
// ============================

import { getDeveloperInfo } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { initIcons } from '../../utils/helpers.js';

export function renderDeveloperPage() {
  const app = document.getElementById('app');
  const dev = getDeveloperInfo();

  app.innerHTML = `
    ${renderNavbar('/developer')}
    
    <main class="section" style="padding-top: var(--space-10);">
      <div class="container" style="max-width: 800px;">
        <!-- Header -->
        <div class="section-header" style="margin-bottom: var(--space-8);">
          <h2>عن المطور</h2>
          <p>تعرّف على المطور وراء منصة سند القرآنية</p>
        </div>

        <!-- Developer Card -->
        <div class="card card-interactive" style="border-top: 4px solid var(--green-500); overflow: hidden; margin-bottom: var(--space-8);">
          <div class="card-body" style="padding: var(--space-10); text-align: center;">
            
            <!-- Photo / Avatar Container -->
            <div style="position: relative; width: 130px; height: 130px; margin: 0 auto var(--space-6);">
              ${dev.photoUrl ? `
                <img src="${dev.photoUrl}" alt="${dev.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius-full); border: 4px solid var(--green-500); box-shadow: var(--shadow-lg);" />
                <div style="display: none; width: 100%; height: 100%; border-radius: var(--border-radius-full); background: linear-gradient(135deg, var(--green-600), var(--green-800)); align-items: center; justify-content: center; color: white; border: 4px solid var(--green-400); box-shadow: var(--shadow-lg);">
                  <i data-lucide="user-check" style="width: 56px; height: 56px;"></i>
                </div>
              ` : `
                <div style="width: 100%; height: 100%; border-radius: var(--border-radius-full); background: linear-gradient(135deg, var(--green-600), var(--green-800)); display: flex; align-items: center; justify-content: center; color: white; border: 4px solid var(--green-400); box-shadow: var(--shadow-lg);">
                  <i data-lucide="code-2" style="width: 56px; height: 56px;"></i>
                </div>
              `}
              <div style="position: absolute; bottom: 4px; left: 4px; background: var(--gold-500); color: white; border-radius: var(--border-radius-full); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
                <i data-lucide="sparkles" style="width: 16px; height: 16px;"></i>
              </div>
            </div>

            <h2 style="font-size: var(--font-size-2xl); color: var(--green-700); margin-bottom: var(--space-2);">${dev.name}</h2>
            <div style="display: flex; justify-content: center; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-6);">
              <span class="badge badge-gold" style="font-size: var(--font-size-sm); padding: 6px 16px; border-radius: var(--border-radius-full);">
                <i data-lucide="user-check" style="width:16px;height:16px;margin-left:4px;"></i>
                أستاذ المدرسة
              </span>
              <span class="badge badge-green" style="font-size: var(--font-size-sm); padding: 6px 16px; border-radius: var(--border-radius-full);">
                <i data-lucide="graduation-cap" style="width:16px;height:16px;margin-left:4px;"></i>
                طالب بالجامعة العليا للإعلام الآلي (ESI)
              </span>
            </div>

            <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto var(--space-8); line-height: 1.9; font-size: var(--font-size-base);">
              ${dev.bio}
            </p>

            <!-- Contact & Social Info -->
            <div style="display: flex; justify-content: center; gap: var(--space-6); flex-wrap: wrap; background: var(--gray-50); padding: var(--space-6); border-radius: var(--border-radius-lg); border: 1px solid var(--border-color);">
              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-primary);">
                <div style="width: 36px; height: 36px; background: var(--green-100); color: var(--green-600); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="mail" style="width: 18px; height: 18px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">البريد الإلكتروني</div>
                  <a href="mailto:${dev.email}" style="font-size: var(--font-size-sm); font-weight: 600; color: var(--green-700); direction: ltr; display: inline-block;">${dev.email}</a>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-primary);">
                <div style="width: 36px; height: 36px; background: var(--gold-100); color: var(--gold-600); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="school" style="width: 18px; height: 18px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">المؤسسة التعليمية</div>
                  <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary);">ESI — المدرسة العليا للإعلام الآلي</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div style="text-align: center;">
          <a href="#/" class="btn btn-secondary">
            <i data-lucide="arrow-right"></i>
            العودة للرئيسية
          </a>
        </div>
      </div>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
}
