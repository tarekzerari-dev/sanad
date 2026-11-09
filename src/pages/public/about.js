// ============================
// About Page — مدرسة سند للقرآن الكريم وعلومه
// ============================

import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { initIcons } from '../../utils/helpers.js';

export function renderAboutPage() {
  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderNavbar('/about')}
    
    <main class="section" style="padding-top: var(--space-10); padding-bottom: var(--space-16);">
      <div class="container about-section" style="max-width: 960px;">
        <div class="section-header" style="margin-bottom: var(--space-10); text-align: center;">
          <span class="badge badge-emerald" style="margin-bottom: var(--space-3); font-weight: 500;">
            <i data-lucide="info" style="width: 14px; height: 14px; margin-left: 6px;"></i>
            التعريف بالمؤسسة
          </span>
          <h2 style="font-family: var(--font-family-serif-display); font-size: var(--font-size-3xl); color: var(--emerald-900); margin-bottom: var(--space-2);">عن المدرسة القرآنية</h2>
          <p style="color: var(--text-muted); font-size: var(--font-size-base); max-width: 520px; margin: 0 auto;">رسالة سامية في خدمة كتاب الله تعالى وتنشئة الناشئة على مائدته العطرة</p>
        </div>

        <!-- Institutional Intro Card -->
        <div class="card" style="margin-bottom: var(--space-8); border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); overflow: hidden;">
          <div style="height: 6px; background: linear-gradient(90deg, var(--emerald-800), var(--brass-500), var(--emerald-800));"></div>
          <div class="card-body" style="padding: var(--space-10); text-align: center;">
            <div style="width: 76px; height: 76px; margin: 0 auto var(--space-6); background: linear-gradient(135deg, var(--emerald-800), var(--emerald-950)); border-radius: var(--border-radius-xl); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); border: 2px solid var(--brass-300);">
              <i data-lucide="book-open" style="width: 36px; height: 36px; color: var(--brass-100);"></i>
            </div>
            <h3 style="font-family: var(--font-family-serif-display); font-size: var(--font-size-2xl); margin-bottom: var(--space-4); color: var(--emerald-950);">مدرسة سند للقرآن الكريم وعلومه</h3>
            <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); max-width: 680px; margin: 0 auto; line-height: 2.1; font-size: var(--font-size-lg);">
              مؤسسة تعليمية متخصصة في تحفيظ القرآن الكريم وتدريس أحكام التجويد والآداب الإسلامية للأطفال والناشئة، تقع بحي الأهرام في مدينة عين البيضاء (ولاية أم البواقي). 
              تسعى المدرسة إلى غرس حب كلام الله تعالى في قلوب الناشئة وفق منهجية تربوية أصيلة تمزج بين رصانة السند ومرونة الوسائل التقنية الحديثة.
            </p>
          </div>
        </div>

        <!-- Vision & Mission Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-6); margin-bottom: var(--space-8);">
          <div class="card card-interactive" style="border: 1px solid var(--border-color); border-top: 3px solid var(--emerald-800);">
            <div class="card-body" style="text-align: center; padding: var(--space-8);">
              <div style="width: 52px; height: 52px; margin: 0 auto var(--space-4); background: var(--emerald-50); color: var(--emerald-800); border-radius: var(--border-radius-lg); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="eye" style="width: 26px; height: 26px;"></i>
              </div>
              <h4 style="font-family: var(--font-family-serif-display); font-size: var(--font-size-xl); margin-bottom: var(--space-3); color: var(--emerald-900);">رؤيتنا</h4>
              <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); font-size: var(--font-size-base); line-height: 1.9;">
                أن نكون صرحاً قرآنياً رائداً ونموذجاً يحتذى به في إتقان الحفظ وسلامة الأداء، وبناء جيل قرآني متخلق بأخلاق القرآن.
              </p>
            </div>
          </div>
          <div class="card card-interactive" style="border: 1px solid var(--border-color); border-top: 3px solid var(--brass-500);">
            <div class="card-body" style="text-align: center; padding: var(--space-8);">
              <div style="width: 52px; height: 52px; margin: 0 auto var(--space-4); background: var(--brass-50); color: var(--brass-700); border-radius: var(--border-radius-lg); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="target" style="width: 26px; height: 26px;"></i>
              </div>
              <h4 style="font-family: var(--font-family-serif-display); font-size: var(--font-size-xl); margin-bottom: var(--space-3); color: var(--emerald-900);">رسالتنا</h4>
              <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); font-size: var(--font-size-base); line-height: 1.9;">
                تقديم برامج تعليمية متكاملة للحفظ والتجويد عبر حلقات تفاعلية، مع المتابعة اليومية الدقيقة لكل طالب وتحفيزهم بالمسابقات الدورية.
              </p>
            </div>
          </div>
        </div>

        <!-- Values Section -->
        <div style="margin-bottom: var(--space-10);">
          <h3 style="font-family: var(--font-family-serif-display); text-align: center; margin-bottom: var(--space-6); color: var(--emerald-900); font-size: var(--font-size-2xl);">قيمنا الراسخة</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-5);">
            <div class="card card-interactive" style="border: 1px solid var(--border-color); padding: var(--space-6); text-align: center; display: flex; flex-direction: column; justify-content: flex-start; height: 100%;">
              <div style="width: 48px; height: 48px; margin: 0 auto var(--space-3); background: var(--emerald-50); color: var(--emerald-800); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="heart" style="width: 22px; height: 22px;"></i>
              </div>
              <h4 style="font-family: var(--font-family-serif-display); margin-bottom: var(--space-2); color: var(--emerald-950); font-size: var(--font-size-lg);">الإخلاص</h4>
              <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); font-size: var(--font-size-sm); line-height: 1.8; margin: 0;">ابتغاء وجه الله تعالى ورضوانه في كل كلمة وحرف يُعلَّم.</p>
            </div>

            <div class="card card-interactive" style="border: 1px solid var(--border-color); padding: var(--space-6); text-align: center; display: flex; flex-direction: column; justify-content: flex-start; height: 100%;">
              <div style="width: 48px; height: 48px; margin: 0 auto var(--space-3); background: var(--brass-50); color: var(--brass-700); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="sparkles" style="width: 22px; height: 22px;"></i>
              </div>
              <h4 style="font-family: var(--font-family-serif-display); margin-bottom: var(--space-2); color: var(--emerald-950); font-size: var(--font-size-lg);">الإتقان والابتكار</h4>
              <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); font-size: var(--font-size-sm); line-height: 1.8; margin: 0;">العناية بالرواية الصحيحة مع اعتماد تقنيات المتابعة والتحفيز.</p>
            </div>

            <div class="card card-interactive" style="border: 1px solid var(--border-color); padding: var(--space-6); text-align: center; display: flex; flex-direction: column; justify-content: flex-start; height: 100%;">
              <div style="width: 48px; height: 48px; margin: 0 auto var(--space-3); background: var(--sage-50); color: var(--sage-700); border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center;">
                <i data-lucide="users" style="width: 22px; height: 22px;"></i>
              </div>
              <h4 style="font-family: var(--font-family-serif-display); margin-bottom: var(--space-2); color: var(--emerald-950); font-size: var(--font-size-lg);">الرعاية والتعاون</h4>
              <p style="font-family: var(--font-family-serif-text); color: var(--text-secondary); font-size: var(--font-size-sm); line-height: 1.8; margin: 0;">الاهتمام بالبناء النفسي والتربوي للطفل بالتنسيق الدائم مع الأولياء.</p>
            </div>
          </div>
        </div>

        <!-- Contact & Location Box -->
        <div class="card" style="border: 1px solid var(--border-color); background: var(--surface-card); box-shadow: var(--shadow-sm);">
          <div class="card-body" style="padding: var(--space-8); text-align: center;">
            <h4 style="font-family: var(--font-family-serif-display); margin-bottom: var(--space-6); color: var(--emerald-900); font-size: var(--font-size-xl);">معلومات الاتصال والموقع</h4>
            <div style="display: flex; justify-content: center; gap: var(--space-8); flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-secondary);">
                <div style="width: 36px; height: 36px; border-radius: var(--border-radius-md); background: var(--emerald-50); color: var(--emerald-800); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="map-pin" style="width:18px;height:18px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">المقر</div>
                  <span style="font-weight: 500; color: var(--text-primary); font-size: var(--font-size-sm);">حي الأهرام، عين البيضاء (أم البواقي)</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-secondary);">
                <div style="width: 36px; height: 36px; border-radius: var(--border-radius-md); background: var(--emerald-50); color: var(--emerald-800); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="phone" style="width:18px;height:18px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">الهاتف</div>
                  <span style="font-weight: 600; color: var(--emerald-800); font-size: var(--font-size-sm); direction: ltr; display: inline-block;">+213 555 123 456</span>
                </div>
              </div>

              <div style="display: flex; align-items: center; gap: var(--space-3); color: var(--text-secondary);">
                <div style="width: 36px; height: 36px; border-radius: var(--border-radius-md); background: var(--brass-50); color: var(--brass-700); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="clock" style="width:18px;height:18px;"></i>
                </div>
                <div style="text-align: right;">
                  <div style="font-size: var(--font-size-xs); color: var(--text-muted);">أوقات الحلقات</div>
                  <span style="font-weight: 500; color: var(--text-primary); font-size: var(--font-size-sm);">السبت — الأربعاء: 09:00 — 10:30</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin-top: var(--space-8);">
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
