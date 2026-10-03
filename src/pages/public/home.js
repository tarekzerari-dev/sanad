// ============================
// Home Page - Designed for Maximum Aesthetics & Quick Navigation
// ============================

import { getStudents, getCompetitions, getTodayAttendanceStats, getSettings, getDeveloperInfo } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { initIcons, calculateMemorizationProgress } from '../../utils/helpers.js';

export function renderHomePage() {
  const students = getStudents();
  const competitions = getCompetitions();
  const settings = getSettings();
  const developer = getDeveloperInfo();
  
  const totalStudents = students.length;
  const boys = students.filter(s => s.gender === 'ذكر').length;
  const girls = students.filter(s => s.gender === 'أنثى').length;

  // Recent competitions (last 3)
  const recentCompetitions = [...competitions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderNavbar('/')}
    
    <main>
      <!-- Hero Section -->
      <section class="hero pattern-bg" style="padding-top: var(--space-12); padding-bottom: var(--space-12);">
        <div class="hero-decoration hero-decoration-1"></div>
        <div class="hero-decoration hero-decoration-2"></div>
        <div class="hero-inner">
          <div class="hero-logo-container" style="box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);">
            <img src="${settings.logoUrl || '/logo.png'}" alt="${settings.schoolName}" class="hero-logo-img" />
          </div>
          <h1 style="font-size: var(--font-size-4xl); margin-bottom: var(--space-2); color: #ffffff; text-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);">${settings.schoolName || 'سَنَد'}</h1>
          <p class="hero-subtitle" style="font-size: var(--font-size-xl); font-weight: 700; color: #FEF08A; margin-bottom: var(--space-3); text-shadow: 0 1px 6px rgba(0, 0, 0, 0.2);">
            تابع رحلة أبنائنا المباركة في حفظ كتاب الله تعالى
          </p>
          <p class="hero-desc" style="max-width: 680px; margin-left: auto; margin-right: auto; line-height: 1.8; color: rgba(255, 255, 255, 0.95); font-size: var(--font-size-base); font-weight: 500; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);">
            منصة تربوية رقمية لمتابعة حفظ القرآن الكريم، أحكام التجويد، تسجيل الحضور، اليوميات والمسابقات التشجيعية بحي الأهرام مدينة عين البيضاء
          </p>
          
          <!-- Hero Quick Action Buttons (Unified Color Design) -->
          <div style="display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; margin-top: var(--space-8);">
            <a href="#/students" class="hero-nav-btn">
              <i data-lucide="users"></i>
              قائمة الطلبة
            </a>
            <a href="#/journal" class="hero-nav-btn">
              <i data-lucide="book-open"></i>
              يوميات المدرسة والبرنامج
            </a>
            <a href="#/competitions" class="hero-nav-btn">
              <i data-lucide="trophy"></i>
              المسابقات والجوائز
            </a>
            <a href="#/developer" class="hero-nav-btn">
              <i data-lucide="code-2"></i>
              عن المطور والأستاذ
            </a>
          </div>
        </div>
      </section>

      <!-- Quick Stats Bar -->
      <section class="section" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
        <div class="container">
          <div class="stats-bar stagger">
            <div class="stat-card">
              <div class="stat-icon green">
                <i data-lucide="users"></i>
              </div>
              <div class="stat-info">
                <h3>إجمالي الطلبة</h3>
                <div class="stat-value">${totalStudents}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon blue">
                <i data-lucide="user"></i>
              </div>
              <div class="stat-info">
                <h3>الأولاد</h3>
                <div class="stat-value">${boys}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon" style="background: #fce7f3; color: #db2777;">
                <i data-lucide="user"></i>
              </div>
              <div class="stat-info">
                <h3>البنات</h3>
                <div class="stat-value">${girls}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon gold">
                <i data-lucide="trophy"></i>
              </div>
              <div class="stat-info">
                <h3>المسابقات والأنشطة</h3>
                <div class="stat-value">${competitions.length}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Navigation Quick Cards (أقسام المنصة الرئيسية) -->
      <section class="section" style="background: var(--gray-50); padding-top: var(--space-10); padding-bottom: var(--space-12);">
        <div class="container">
          <div class="section-header" style="margin-bottom: var(--space-8);">
            <h2>أقسام ومميزات المنصة</h2>
            <p>تصفح خيارات المنصة للتواصل ومتابعة أبنائك في المدرسة القرآنية</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--space-6);" class="stagger">
            
            <!-- Journal Card -->
            <div class="card card-interactive" style="border-top: 4px solid var(--green-500); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="icon-wrapper" style="background: var(--green-100); color: var(--green-600); width: 48px; height: 48px; border-radius: var(--border-radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                  <i data-lucide="book-open" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: var(--font-size-lg); color: var(--green-700); margin-bottom: var(--space-2);">يوميات المدرسة والبرنامج</h3>
                <p class="text-muted" style="font-size: var(--font-size-sm); line-height: 1.7; margin-bottom: var(--space-6);">
                  اطّلع على برنامج الحصص اليومية، ما تم تدريسه، أحكام التجويد الشفاهية، والرزنامة الأسبوعية للحصص وسجل الحضور والغياب.
                </p>
              </div>
              <a href="#/journal" class="btn btn-primary" style="width: 100%;">
                <i data-lucide="arrow-left"></i>
                تصفح اليوميات والبرنامج
              </a>
            </div>

            <!-- Competitions Card -->
            <div class="card card-interactive" style="border-top: 4px solid var(--gold-500); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="icon-wrapper" style="background: var(--gold-100); color: var(--gold-600); width: 48px; height: 48px; border-radius: var(--border-radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                  <i data-lucide="trophy" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: var(--font-size-lg); color: var(--gold-600); margin-bottom: var(--space-2);">المسابقات والجوائز</h3>
                <p class="text-muted" style="font-size: var(--font-size-sm); line-height: 1.7; margin-bottom: var(--space-6);">
                  استكشف نتائج المسابقات والتحديات القرآنية، لوحة الشرف، وقوائم الطلبة المتفوقين والجوائز الممنوحة لتشجيع الحفظ.
                </p>
              </div>
              <a href="#/competitions" class="btn" style="background: var(--gold-500); color: #fff; width: 100%; border: none; font-weight: 600;">
                <i data-lucide="arrow-left"></i>
                استكشف المسابقات
              </a>
            </div>

            <!-- Students List Card -->
            <div class="card card-interactive" style="border-top: 4px solid #2563eb; padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="icon-wrapper" style="background: #eff6ff; color: #2563eb; width: 48px; height: 48px; border-radius: var(--border-radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                  <i data-lucide="users" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: var(--font-size-lg); color: #1d4ed8; margin-bottom: var(--space-2);">قائمة الطلبة والمتابعة</h3>
                <p class="text-muted" style="font-size: var(--font-size-sm); line-height: 1.7; margin-bottom: var(--space-6);">
                  تصفح بطاقات الطلبة، نسب تقدمهم في حفظ السور القرآنية، تقييم التجويد، والحضور والغياب بشكل شفاف ومباشر.
                </p>
              </div>
              <a href="#/students" class="btn btn-secondary" style="width: 100%;">
                <i data-lucide="arrow-left"></i>
                عرض جميع الطلبة
              </a>
            </div>

            <!-- Developer & Teacher Card -->
            <div class="card card-interactive" style="border-top: 4px solid var(--gray-700); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="icon-wrapper" style="background: var(--gray-100); color: var(--gray-700); width: 48px; height: 48px; border-radius: var(--border-radius-md); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4);">
                  <i data-lucide="code-2" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-size: var(--font-size-lg); color: var(--gray-800); margin-bottom: var(--space-2);">عن المطور وأستاذ المدرسة</h3>
                <p class="text-muted" style="font-size: var(--font-size-sm); line-height: 1.7; margin-bottom: var(--space-6);">
                  تعرف على الأستاذ ${developer.name}، مطور المنصة وطالب بالمدرسة العليا للإعلام الآلي ESI، ومعلومات التواصل معه.
                </p>
              </div>
              <a href="#/developer" class="btn btn-ghost" style="width: 100%; border: 1px solid var(--border-color); background: #fff;">
                <i data-lucide="arrow-left"></i>
                صفحة عن المطور
              </a>
            </div>

          </div>
        </div>
      </section>

      <!-- Recent Competitions Preview -->
      ${recentCompetitions.length > 0 ? `
      <section class="section" style="padding-top: var(--space-12); padding-bottom: var(--space-12);">
        <div class="container">
          <div class="section-header">
            <h2>آخر المسابقات القرآنية</h2>
            <p>نتائج أحدث المسابقات والأنشطة والجوائز في المدرسة</p>
          </div>
          <div class="competitions-grid stagger">
            ${recentCompetitions.map(comp => {
              const winners = comp.results || [];
              return `
                <div class="competition-card">
                  <div class="competition-card-header">
                    <h3>${comp.name}</h3>
                    <div class="comp-date">
                      <i data-lucide="calendar"></i>
                      ${new Date(comp.date).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                  <div class="competition-card-body">
                    <p class="comp-desc">${comp.description}</p>
                    <div class="winners-list">
                      ${winners.slice(0, 3).map(w => {
                        const student = getStudents().find(s => s.id === w.studentId);
                        const rankEmoji = w.rank === 1 ? '🏆' : w.rank === 2 ? '🥈' : '🥉';
                        return `
                          <div class="winner-item">
                            <div class="winner-rank">${rankEmoji}</div>
                            <div>
                              <div class="winner-name">${student ? `${student.firstName} ${student.lastName}` : 'غير معروف'}</div>
                              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${w.prize}</div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          <div class="text-center" style="margin-top: var(--space-8);">
            <a href="#/competitions" class="btn btn-secondary btn-lg">
              <i data-lucide="trophy"></i>
              استكشف جميع المسابقات
            </a>
          </div>
        </div>
      </section>
      ` : ''}

      <!-- Bottom Call To Action Banner -->
      <section class="section" style="background: var(--green-50); border-top: 1px solid var(--green-100); padding-top: var(--space-12); padding-bottom: var(--space-12);">
        <div class="container text-center">
          <h2 style="margin-bottom: var(--space-4); color: var(--green-800);">مرحباً بكم في مدرسة سند للقرآن الكريم وعلومه</h2>
          <p class="text-muted" style="margin-bottom: var(--space-6); max-width: 600px; margin-left: auto; margin-right: auto; line-height: 1.8;">
            يسعدنا تواصل الأولياء والاطلاع اليومي على مستوى أبنائهم في حفظ كتاب الله، الأحكام، والحضور.
          </p>
          <div style="display: flex; gap: var(--space-4); justify-content: center; flex-wrap: wrap;">
            <a href="#/students" class="btn btn-primary btn-lg">
              <i data-lucide="users"></i>
              تصفح قائمة الطلبة
            </a>
            <a href="#/journal" class="btn btn-secondary btn-lg">
              <i data-lucide="book-open"></i>
              اليوميات والبرنامج
            </a>
          </div>
        </div>
      </section>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
}
