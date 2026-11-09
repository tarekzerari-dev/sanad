// ============================================================
// سند — Public Competitions Showcase (المسابقات والجوائز القرآنية)
// ============================================================

import { getCompetitions, getStudent } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { renderAvatar } from '../../utils/avatars.js';
import { initIcons, formatDate } from '../../utils/helpers.js';

export function renderCompetitionsPage() {
  const competitions = [...getCompetitions()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const app = document.getElementById('app');

  app.innerHTML = `
    ${renderNavbar('/competitions')}
    
    <main class="section" style="padding-top: var(--space-8); padding-bottom: var(--space-16); background: var(--bg-canvas);">
      <div class="container">
        
        <div class="section-header" style="margin-bottom: var(--space-8);">
          <h1 style="font-family: var(--font-heading); font-size: 2.25rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
            المسابقات والجوائز القرآنية
          </h1>
          <p>توثيق المسابقات التنافسية في حفظ وتجويد وتلاوة كتاب الله تعالى وتكريم الحفظة المتميزين</p>
        </div>

        ${competitions.length === 0 ? `
          <div class="empty-state" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
            <div class="empty-icon"><i data-lucide="trophy"></i></div>
            <h3>لا توجد مسابقات قرآنية منشورة حالياً</h3>
            <p>ترقبوا إعلان المسابقات القرآنية الدورية القادمة بإذن الله تعالى.</p>
          </div>
        ` : `
          <div class="competitions-grid stagger">
            ${competitions.map(comp => {
              const winners = comp.results || [];
              const participantCount = comp.participants ? comp.participants.length : 0;

              return `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; box-shadow: var(--shadow-xs);">
                  
                  <!-- Card Header -->
                  <div style="background: linear-gradient(145deg, #12331f, #1a4d2e); color: #ffffff; padding: var(--space-5); border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                      <span class="badge" style="background: var(--brass-500); color: #1e1706; font-weight: 700; font-size: 10px;">
                        ${comp.type || 'مسابقة قرآنية'}
                      </span>
                      <span style="font-size: 11px; color: var(--brass-200); display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="calendar" style="width: 13px; height: 13px;"></i>
                        ${formatDate(comp.date)}
                      </span>
                    </div>

                    <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: #ffffff; margin: 0;">
                      ${comp.name}
                    </h3>
                  </div>

                  <!-- Card Body -->
                  <div class="card-body" style="flex: 1;">
                    ${comp.description ? `
                      <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.7; margin-bottom: var(--space-4);">
                        ${comp.description}
                      </p>
                    ` : ''}

                    <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-4);">
                      <span class="badge badge-gray" style="font-size: 11px;">
                        <i data-lucide="users" style="width: 13px; height: 13px;"></i>
                        ${participantCount} مشارك ومنافس
                      </span>
                    </div>

                    <!-- Winners List -->
                    ${winners.length > 0 ? `
                      <div style="font-size: 11px; font-weight: 700; color: var(--emerald-900); text-transform: uppercase; margin-bottom: var(--space-2); display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="award" style="width: 14px; height: 14px; color: var(--brass-500);"></i>
                        <span>منصة التتويج والمراكز الأولى:</span>
                      </div>
                      
                      <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                        ${winners.map(w => {
                          const student = getStudent(w.studentId);
                          const rankIcons = { 1: '🥇 المركز الأول', 2: '🥈 المركز الثاني', 3: '🥉 المركز الثالث' };
                          const isGold = w.rank === 1;

                          return `
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: ${isGold ? 'var(--brass-50)' : 'var(--bg-canvas)'}; border: 1px solid ${isGold ? 'var(--brass-300)' : 'var(--border-subtle)'}; border-radius: var(--border-radius-md);">
                              <div style="display: flex; align-items: center; gap: var(--space-3);">
                                ${student ? renderAvatar(student.avatar, 'avatar-xs') : ''}
                                <div>
                                  <div style="font-weight: 700; font-size: var(--font-size-xs); color: var(--text-primary);">
                                    ${student ? `${student.firstName} ${student.lastName}` : 'طالب مشارك'}
                                  </div>
                                  <div style="font-size: 10px; color: var(--brass-700); font-weight: 600;">
                                    ${rankIcons[w.rank] || `المركز ${w.rank}`}
                                  </div>
                                </div>
                              </div>
                              <span class="badge badge-gold" style="font-size: 10px;">
                                ${w.prize || 'شهادة تقدير'}
                              </span>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    ` : `
                      <div style="padding: var(--space-4); background: var(--bg-canvas); border-radius: var(--border-radius-sm); border: 1px dashed var(--border-color); text-align: center; color: var(--text-muted); font-size: 11px;">
                        لم تُعلن نتائج التتويج بعد
                      </div>
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
