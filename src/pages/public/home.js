// ============================================================
// سند — Public Home View (الواجهة التعريفية لمدرسة سند القرآنية)
// ============================================================

import { getStudents, getCompetitions, getSettings, getDeveloperInfo, getJournalEntries } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { initIcons, formatDate } from '../../utils/helpers.js';

export function renderHomePage() {
  const students = getStudents();
  const competitions = getCompetitions();
  const settings = getSettings();
  const developer = getDeveloperInfo();
  const journalEntries = getJournalEntries();
  
  const totalStudents = students.length;
  const boys = students.filter(s => s.gender === 'ذكر').length;
  const girls = students.filter(s => s.gender === 'أنثى').length;

  const recentCompetitions = [...competitions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 3);

  const app = document.getElementById('app');
  app.innerHTML = `
    ${renderNavbar('/')}
    
    <main style="background: var(--bg-canvas); min-height: 80vh;">
      
      <!-- Serene Hero Banner -->
      <section class="hero pattern-bg">
        <div class="hero-inner">
          <div class="hero-logo-container">
            <img src="${settings.logoUrl || '/logo.png'}" alt="${settings.schoolName}" class="hero-logo-img" />
          </div>

          <h1 style="font-family: var(--font-heading); font-size: clamp(2rem, 4vw, 3rem); margin-bottom: var(--space-2); color: #ffffff; text-shadow: 0 2px 10px rgba(0,0,0,0.25);">
            ${settings.schoolName || 'مدرسة سَنَد للقرآن الكريم وعلومه'}
          </h1>
          
          <p class="hero-subtitle">
            رحلة مباركة ومتقنة في حفظ كتاب الله تعالى وتلقي علومه وتجويده
          </p>
          
          <p class="hero-desc">
            منظومة تربوية متكاملة لمتابعة حفظ القرآن الكريم، تدريس أحكام التلاوة والتجويد، رصد المواظبة والحضور، والمسابقات التشجيعية لترسيخ القرآن في صدور الناشئة
          </p>
          
          <!-- Primary Focused Actions -->
          <div style="display: flex; gap: var(--space-4); justify-content: center; align-items: center; flex-wrap: wrap; margin-top: var(--space-6);">
            <a href="#/students" class="btn btn-brass btn-lg" style="border-radius: var(--border-radius-full); padding: 13px 28px; font-size: 1.05rem; display: inline-flex; align-items: center; gap: 8px;">
              <i data-lucide="users" style="width: 20px; height: 20px;"></i>
              <span>دليل الطلبة وسجلات الحفظ</span>
            </a>
            <a href="#/journal" class="btn btn-white btn-lg" style="border-radius: var(--border-radius-full); padding: 13px 28px; font-size: 1.05rem; display: inline-flex; align-items: center; gap: 8px;">
              <i data-lucide="book-open" style="width: 20px; height: 20px; color: var(--emerald-800);"></i>
              <span>دفتر اليوميات والبرنامج</span>
            </a>
          </div>
        </div>
      </section>

      <!-- Centered Metrics Deck -->
      <section class="section" style="padding-top: var(--space-10); padding-bottom: var(--space-10);">
        <div class="container">
          <div class="stats-grid stagger">
            <div class="stat-card">
              <div class="stat-icon green"><i data-lucide="users"></i></div>
              <div class="stat-info">
                <h3>إجمالي طلبة المدرسة</h3>
                <div class="stat-value">${totalStudents}</div>
                <div style="font-size: 11px; color: var(--text-muted);">${boys} أولاد • ${girls} بنات</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon gold"><i data-lucide="book-open"></i></div>
              <div class="stat-info">
                <h3>المنهج المرحلي</h3>
                <div class="stat-value" style="font-size: 1.4rem; color: var(--emerald-800);">سورة الملك</div>
                <div style="font-size: 11px; color: var(--text-muted);">حفظاً وتجويداً وإتقاناً</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon blue"><i data-lucide="calendar"></i></div>
              <div class="stat-info">
                <h3>الحصص الموثقة</h3>
                <div class="stat-value">${journalEntries.length}</div>
                <div style="font-size: 11px; color: var(--text-muted);">توثيق مستمر لليوميات</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon gold"><i data-lucide="trophy"></i></div>
              <div class="stat-info">
                <h3>المسابقات القرآنية</h3>
                <div class="stat-value">${competitions.length}</div>
                <div style="font-size: 11px; color: var(--text-muted);">تحفيز وتكريم للحفظة</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Educational Services & Pillars Grid -->
      <section class="section" style="padding-top: var(--space-4); padding-bottom: var(--space-14);">
        <div class="container">
          <div class="section-header">
            <h2>الأقسام والخدمات التربوية</h2>
            <p>منظومة متكاملة تتيح لأولياء الأمور والموجهين متابعة الإنجاز والمسار القرآني لأبنائهم</p>
          </div>

          <div class="services-grid stagger">
            
            <!-- Journal Card -->
            <div class="card card-interactive" style="border-top: 3px solid var(--emerald-800); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>
                <div style="width: 48px; height: 48px; border-radius: var(--border-radius-md); background: var(--emerald-50); color: var(--emerald-800); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); border: 1px solid var(--emerald-100);">
                  <i data-lucide="book-open" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
                  يوميات المدرسة والبرنامج
                </h3>
                <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-6);">
                  متابعة يومية لما تم تلقينه في الحلقات: الآيات المقررة، تطبيقات أحكام التجويد الشفاهية، والواجبات المنزلية والرزنامة الأسبوعية.
                </p>
              </div>
              <a href="#/journal" class="btn btn-primary" style="width: 100%; justify-content: center;">
                <span>تصفح دفتر اليوميات</span>
                <i data-lucide="arrow-left"></i>
              </a>
            </div>

            <!-- Students Card -->
            <div class="card card-interactive" style="border-top: 3px solid var(--brass-500); padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>
                <div style="width: 48px; height: 48px; border-radius: var(--border-radius-md); background: var(--brass-100); color: var(--brass-700); display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); border: 1px solid var(--brass-200);">
                  <i data-lucide="users" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
                  سجلات الطلبة والمتابعة
                </h3>
                <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-6);">
                  الاطلاع على الملف التربوي لكل طالب: نسبة إنجاز الحفظ القرآني، الحضور والغياب، المستوى الدراسي، ونقاط المواظبة المكتسبة.
                </p>
              </div>
              <a href="#/students" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                <span>قائمة طلبة المدرسة</span>
                <i data-lucide="arrow-left"></i>
              </a>
            </div>

            <!-- Leaderboard Card -->
            <div class="card card-interactive" style="border-top: 3px solid #2b6cb0; padding: var(--space-6); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
              <div>
                <div style="width: 48px; height: 48px; border-radius: var(--border-radius-md); background: #eef5fc; color: #2b6cb0; display: flex; align-items: center; justify-content: center; margin-bottom: var(--space-4); border: 1px solid #d5e5f5;">
                  <i data-lucide="star" style="width: 24px; height: 24px;"></i>
                </div>
                <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
                  لوحة الصدارة والتميز
                </h3>
                <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-6);">
                  تكريم الطلبة الأكثر انضباطاً وحفظاً وتميزاً في الحلقات القرآنية عبر نظام النقاط التشجيعي التنافسي المعتمد.
                </p>
              </div>
              <a href="#/leaderboard" class="btn btn-secondary" style="width: 100%; justify-content: center;">
                <span>مشاهدة لوحة الصدارة</span>
                <i data-lucide="arrow-left"></i>
              </a>
            </div>

          </div>
        </div>
      </section>

      <!-- Recent Competitions Spotlight -->
      ${recentCompetitions.length > 0 ? `
      <section class="section" style="background: var(--bg-surface); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding-top: var(--space-12); padding-bottom: var(--space-12);">
        <div class="container">
          <div class="section-header">
            <h2>المسابقات والتتويجات القرآنية</h2>
            <p>تكريم وتتويج المتفوقين في التلاوة والحفظ لتشجيع التنافس في الخيرات</p>
          </div>

          <div class="competitions-grid stagger">
            ${recentCompetitions.map(comp => `
              <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                <div style="background: linear-gradient(145deg, #12331f, #1a4d2e); color: #ffffff; padding: var(--space-4) var(--space-5); border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                    <span class="badge" style="background: var(--brass-500); color: #1e1706; font-weight: 700; font-size: 10px;">${comp.type || 'مسابقة قرآنية'}</span>
                    <span style="font-size: 11px; color: var(--brass-200);">${formatDate(comp.date)}</span>
                  </div>
                  <h3 style="font-family: var(--font-heading); font-size: 1.2rem; color: #ffffff; margin: 0;">${comp.name}</h3>
                </div>
                <div class="card-body" style="display: flex; flex-direction: column; justify-content: space-between; flex: 1;">
                  ${comp.description ? `<p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: var(--space-4); line-height: 1.7;">${comp.description}</p>` : ''}
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted); margin-top: auto; padding-top: var(--space-3); border-top: 1px solid var(--border-subtle);">
                    <span>المشاركون: <strong>${comp.participants ? comp.participants.length : 0} طالب</strong></span>
                    <a href="#/competitions" style="color: var(--emerald-800); font-weight: 600;">عرض النتائج &larr;</a>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
      ` : ''}

    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
}
