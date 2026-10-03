// ============================
// Footer Component
// ============================

import { getSettings } from '../data/store.js';

export function renderFooter() {
  const settings = getSettings();

  return `
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-brand">
          <img src="${settings.logoUrl || '/logo.png'}" alt="سند" class="footer-logo-img" />
          <span>سَنَد — المدرسة القرآنية</span>
        </div>
        <p class="footer-text">
          منصة تربوية لمتابعة حفظ القرآن الكريم والحضور والمسابقات في المدرسة القرآنية
        </p>
        <div class="footer-links">
          <a href="#/">الرئيسية</a>
          <a href="#/journal">يوميات المدرسة</a>
          <a href="#/students">الطلبة</a>
          <a href="#/competitions">المسابقات</a>
          <a href="#/about">عن المدرسة</a>
          <a href="#/developer">عن المطور</a>
        </div>
        <div class="footer-copy">
          جميع الحقوق محفوظة &copy; ${new Date().getFullYear()} — مدرسة سند القرآنية
        </div>
      </div>
    </footer>
  `;
}
