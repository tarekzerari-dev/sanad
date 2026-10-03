// ============================
// About Page
// ============================

import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { initIcons } from '../../utils/helpers.js';

export function renderAboutPage() {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderNavbar('/about')}
    
    <main class="section" style="padding-top: var(--space-10);">
      <div class="container about-section">
        <div class="section-header" style="margin-bottom: var(--space-10);">
          <h2>عن المدرسة</h2>
          <p>تعرف على مدرسة سند القرآنية ورسالتها</p>
        </div>

        <div class="card" style="margin-bottom: var(--space-8);">
          <div class="card-body" style="padding: var(--space-10); text-align: center;">
            <div style="width: 80px; height: 80px; margin: 0 auto var(--space-6); background: linear-gradient(135deg, var(--green-500), var(--green-600)); border-radius: var(--border-radius-xl); display: flex; align-items: center; justify-content: center;">
              <i data-lucide="book-open" style="width: 36px; height: 36px; color: white;"></i>
            </div>
            <h2 style="font-size: var(--font-size-2xl); margin-bottom: var(--space-4); color: var(--green-700);">مدرسة سند للقرآن الكريم وعلومه</h2>
            <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto; line-height: 1.9; font-size: var(--font-size-base);">
              مؤسسة تعليمية متخصصة في تعليم القرآن الكريم وعلومه للأطفال، تقع بحي الأهرام، مدينة عين البيضاء (أم البواقي). تهدف إلى بناء جيل قرآني 
              متميز في بيئة تربوية حديثة تجمع بين الأصالة والمعاصرة. نسعى لتقديم تجربة تعليمية ممتعة 
              ومحفزة تساعد الأطفال على حب القرآن وحفظه.
            </p>
          </div>
        </div>

        <!-- Vision & Mission -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-8);">
          <div class="card">
            <div class="card-body" style="text-align: center; padding: var(--space-8);">
              <div class="icon-wrapper" style="margin: 0 auto var(--space-4);">
                <i data-lucide="eye"></i>
              </div>
              <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--space-3); color: var(--green-700);">رؤيتنا</h3>
              <p style="color: var(--text-secondary); font-size: var(--font-size-sm); line-height: 1.8;">
                أن نكون المدرسة القرآنية الرائدة في تعليم الأطفال القرآن الكريم بأساليب حديثة 
                ومبتكرة تنمي حب القرآن في نفوس الأطفال
              </p>
            </div>
          </div>
          <div class="card">
            <div class="card-body" style="text-align: center; padding: var(--space-8);">
              <div class="icon-wrapper" style="margin: 0 auto var(--space-4); background: var(--gold-100); color: var(--gold-600);">
                <i data-lucide="target"></i>
              </div>
              <h3 style="font-size: var(--font-size-xl); margin-bottom: var(--space-3); color: var(--green-700);">رسالتنا</h3>
              <p style="color: var(--text-secondary); font-size: var(--font-size-sm); line-height: 1.8;">
                تقديم برامج تعليمية متكاملة لحفظ القرآن الكريم وتجويده، مع متابعة مستمرة 
                لتقدم كل طالب وتحفيزه من خلال المسابقات والأنشطة
              </p>
            </div>
          </div>
        </div>

        <!-- Values -->
        <h3 style="text-align: center; margin-bottom: var(--space-6); color: var(--green-700);">قيمنا</h3>
        <div class="about-values stagger" style="margin-bottom: var(--space-8);">
          <div class="card about-card card-interactive">
            <div class="icon-wrapper" style="background: var(--green-100); color: var(--green-600);">
              <i data-lucide="heart"></i>
            </div>
            <h4 style="margin-bottom: var(--space-2);">الإخلاص</h4>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">نعمل بإخلاص لوجه الله تعالى في تعليم كتابه الكريم</p>
          </div>
          <div class="card about-card card-interactive">
            <div class="icon-wrapper" style="background: #eff6ff; color: #2563eb;">
              <i data-lucide="sparkles"></i>
            </div>
            <h4 style="margin-bottom: var(--space-2);">الإبداع</h4>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">نستخدم أساليب تعليمية حديثة ومبتكرة تناسب الأطفال</p>
          </div>
          <div class="card about-card card-interactive">
            <div class="icon-wrapper" style="background: var(--gold-100); color: var(--gold-600);">
              <i data-lucide="users"></i>
            </div>
            <h4 style="margin-bottom: var(--space-2);">التعاون</h4>
            <p style="color: var(--text-secondary); font-size: var(--font-size-sm);">نعمل بروح الفريق ونتعاون مع الأولياء لنجاح أبنائهم</p>
          </div>
        </div>

        <!-- Contact -->
        <div class="card">
          <div class="card-body" style="text-align: center; padding: var(--space-8);">
            <h3 style="margin-bottom: var(--space-5); color: var(--green-700);">تواصل معنا</h3>
            <div style="display: flex; justify-content: center; gap: var(--space-8); flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary);">
                <i data-lucide="map-pin" style="width:18px;height:18px;color:var(--green-500);"></i>
                <span>حي الأهرام، مدينة عين البيضاء، أم البواقي</span>
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary);">
                <i data-lucide="phone" style="width:18px;height:18px;color:var(--green-500);"></i>
                <span style="direction: ltr;">+213 555 123 456</span>
              </div>
              <div style="display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary);">
                <i data-lucide="clock" style="width:18px;height:18px;color:var(--green-500);"></i>
                <span>السبت — الأربعاء: 09:00 — 10:30</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
}
