// ============================
// Developer Page (عن المطور) — مدرسة سند
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
    
    <main class="section" style="padding-top: var(--space-10); padding-bottom: var(--space-16);">
      <div class="container" style="max-width: 820px;">
        <!-- Header -->
        <div class="section-header" style="margin-bottom: var(--space-8); text-align: center;">
          <span class="badge badge-brass" style="margin-bottom: var(--space-3); font-weight: 500;">
            <i data-lucide="code-2" style="width: 14px; height: 14px; margin-left: 6px;"></i>
            التصميم والتطوير
          </span>
          <h2 style="font-family: var(--font-family-serif-display); font-size: var(--font-size-3xl); color: var(--emerald-900); margin-bottom: var(--space-2);">عن المشرف والمطور</h2>
          <p style="color: var(--text-muted); font-size: var(--font-size-base); max-width: 520px; margin: 0 auto;">تعرّف على المشرف التربوي ومطور المنصة التقنية لمدرسة سند القرآنية</p>
        </div>

        <!-- Developer Card -->
        <div class="card card-interactive" style="border: 1px solid var(--border-color); border-top: 4px solid var(--emerald-800); overflow: hidden; margin-bottom: var(--space-8); box-shadow: var(--shadow-md);">
          <div class="card-body" style="padding: var(--space-10); text-align: center;">
            
            <!-- Photo / Avatar Container -->
            <div style="position: relative; width: 140px; height: 140px; margin: 0 auto var(--space-6);">
              ${dev.photoUrl ? `
                <img src="${dev.photoUrl}" alt="${dev.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" style="width: 100%; height: 100%; object-fit: cover; border-radius: var(--border-radius-full); border: 4px solid var(--surface-card); box-shadow: 0 0 0 3px var(--brass-400), var(--shadow-lg);" />
                <div style="display: none; width: 100%; height: 100%; border-radius: var(--border-radius-full); background: linear-gradient(135deg, var(--emerald-800), var(--emerald-950)); align-items: center; justify-content: center; color: var(--brass-300); border: 4px solid var(--surface-card); box-shadow: 0 0 0 3px var(--brass-400), var(--shadow-lg);">
                  <i data-lucide="user-check" style="width: 60px; height: 60px;"></i>
                </div>
              ` : `
                <div style="width: 100%; height: 100%; border-radius: var(--border-radius-full); background: linear-gradient(135deg, var(--emerald-800), var(--emerald-950)); display: flex; align-items: center; justify-content: center; color: var(--brass-300); border: 4px solid var(--surface-card); box-shadow: 0 0 0 3px var(--brass-400), var(--shadow-lg);">
                  <i data-lucide="code-2" style="width: 60px; height: 60px;"></i>
                </div>
              `}
              <div style="position: absolute; bottom: 4px; left: 4px; background: var(--brass-500); color: white; border-radius: var(--border-radius-full); width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: var(--shadow-sm);">
                <i data-lucide="sparkles" style="width: 18px; height: 18px;"></i>
              </div>
            </div>

            <h3 style="font-family: var(--font-family-serif-display); font-size: var(--font-size-2xl); color: var(--emerald-950); margin-bottom: var(--space-3);">${dev.name}</h3>
            
            <div style="display: flex; justify-content: center; gap: var(--space-2); flex-wrap: wrap; margin-bottom: var(--space-6);">
              <span class="badge badge-brass" style="font-size: var(--font-size-sm); padding: 6px 16px; border-radius: var(--border-radius-full);">
                <i data-lucide="award" style="width:16px;height:16px;margin-left:6px;"></i>
                أستاذ ومشرف المدرسة
              </span>
              <span class="badge badge-emerald" style="font-size: var(--font-size-sm); padding: 6px 16px; border-radius: var(--border-radius-full);">
                <i data-lucide="graduation-cap" style="width:16px;height:16px;margin-left:6px;"></i>
                طالب بالمدرسة الوطنية العليا للإعلام الآلي (ESI)
              </span>
            </div>

            <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); max-width: 620px; margin: 0 auto var(--space-8); line-height: 2.1; font-size: var(--font-size-lg);">
              ${dev.bio}
            </p>

            <!-- Contact & Academic Meta -->
            <div style="display: flex; justify-content: center; gap: var(--space-6); flex-wrap: wrap; background: var(--surface-ivory); padding: var(--space-6); border-radius: var(--border-radius-lg); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-primary);">
                <div style="width: 40px; height: 40px; background: var(--emerald-50); color: var(--emerald-800); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="mail" style="width: 20px; height: 20px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">البريد الإلكتروني المباشر</div>
                  <a href="mailto:${dev.email}" style="font-size: var(--font-size-sm); font-weight: 600; color: var(--emerald-800); direction: ltr; display: inline-block;">${dev.email}</a>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-primary);">
                <div style="width: 40px; height: 40px; background: var(--brass-50); color: var(--brass-700); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="school" style="width: 20px; height: 20px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">المؤسسة الأكاديمية</div>
                  <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary);">المدرسة الوطنية العليا للإعلام الآلي — ESI الجزائر</span>
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
