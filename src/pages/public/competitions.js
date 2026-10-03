// ============================
// Competitions Page (Public)
// ============================

import { getCompetitions, getStudent } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { initIcons, formatDate } from '../../utils/helpers.js';

export function renderCompetitionsPage() {
  const competitions = [...getCompetitions()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderNavbar('/competitions')}
    
    <main class="section" style="padding-top: var(--space-10);">
      <div class="container">
        <div class="section-header" style="margin-bottom: var(--space-8);">
          <h2>المسابقات والأنشطة</h2>
          <p>جميع المسابقات والأنشطة التي تم تنظيمها في المدرسة</p>
        </div>

        ${competitions.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">
              <i data-lucide="trophy"></i>
            </div>
            <h3>لا توجد مسابقات حالياً</h3>
            <p>تابعنا لمعرفة الأنشطة القادمة</p>
          </div>
        ` : `
          <div class="competitions-grid stagger">
            ${competitions.map(comp => {
              const winners = comp.results || [];
              return `
                <div class="competition-card">
                  <div class="competition-card-header">
                    <h3>${comp.name}</h3>
                    <div class="comp-date">
                      <i data-lucide="calendar"></i>
                      ${formatDate(comp.date)}
                    </div>
                  </div>
                  <div class="competition-card-body">
                    <p class="comp-desc">${comp.description}</p>
                    
                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
                      <span class="badge badge-green">${comp.type}</span>
                      <span class="badge badge-gray">
                        <i data-lucide="users" style="width:12px;height:12px;"></i>
                        ${comp.participants ? comp.participants.length : 0} مشارك
                      </span>
                    </div>

                    ${winners.length > 0 ? `
                      <h4 style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-3);">النتائج</h4>
                      <div class="winners-list">
                        ${winners.map(w => {
                          const student = getStudent(w.studentId);
                          const rankEmoji = w.rank === 1 ? '🏆' : w.rank === 2 ? '🥈' : w.rank === 3 ? '🥉' : `${w.rank}`;
                          return `
                            <div class="winner-item">
                              <div class="winner-rank">${rankEmoji}</div>
                              <div style="flex: 1;">
                                <div class="winner-name">${student ? `${student.firstName} ${student.lastName}` : 'غير معروف'}</div>
                                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${w.prize}</div>
                              </div>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    ` : `
                      <p style="color: var(--text-muted); font-size: var(--font-size-sm);">لم يتم إعلان النتائج بعد</p>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
}
