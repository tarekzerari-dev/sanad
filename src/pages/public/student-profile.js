// ============================================================
// سند — Student Educational Profile (الملف التربوي والقرآني للطالب)
// ============================================================

import { getStudent, getStudentAttendanceStats, getCompetitions, getStudentPoints } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { renderAvatar } from '../../utils/avatars.js';
import { initIcons, formatDate, calculateMemorizationProgress, getMemorizedVersesCount, getLevelBadgeClass } from '../../utils/helpers.js';

export function renderStudentProfilePage(params) {
  const student = getStudent(params.id);
  const app = document.getElementById('app');

  if (!student) {
    app.innerHTML = `
      ${renderNavbar()}
      <main class="section">
        <div class="container">
          <div class="empty-state" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
            <div class="empty-icon"><i data-lucide="user-x"></i></div>
            <h3>السجل غير موجود</h3>
            <p>لم يتم العثور على سجل الطالب المطلوب في قاعدة بيانات المدرسة.</p>
            <a href="#/students" class="btn btn-primary" style="margin-top: var(--space-4);">العودة لقائمة الطلبة</a>
          </div>
        </div>
      </main>
      ${renderFooter()}
    `;
    initNavbar();
    initIcons();
    return;
  }

  const progress = calculateMemorizationProgress(student.memorization);
  const memorizedVerses = getMemorizedVersesCount(student.memorization);
  const attStats = getStudentAttendanceStats(student.id);
  const badgeClass = getLevelBadgeClass(student.level);
  const pointsData = getStudentPoints(student.id);
  
  // Competitions
  const allCompetitions = getCompetitions();
  const studentCompetitions = allCompetitions.filter(c => 
    c.participants && c.participants.includes(student.id)
  );

  // Memorization history
  const memEntries = [...(student.memorization || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastEntry = memEntries[0];

  app.innerHTML = `
    ${renderNavbar()}
    
    <main style="background: var(--bg-canvas); padding-bottom: var(--space-16);">
      
      <!-- Serene Profile Header Banner -->
      <div style="background: linear-gradient(145deg, #0d2315 0%, #1a4d2e 60%, #22633c 100%); color: #ffffff; padding: var(--space-12) 0 var(--space-16); position: relative; border-bottom: 2px solid var(--brass-400);">
        <div class="container" style="position: relative; z-index: 1;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-6);">
            <a href="#/students" class="btn btn-ghost btn-sm" style="color: #ffffff; background: rgba(255, 255, 255, 0.12); border-radius: var(--border-radius-full);">
              <i data-lucide="arrow-right"></i>
              <span>العودة لقائمة الطلبة</span>
            </a>
            <span style="font-size: 11px; color: var(--brass-200); font-weight: 600;">
              تاريخ التسجيل: ${student.registrationDate || '—'}
            </span>
          </div>

          <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
            <div style="width: 104px; height: 104px; border-radius: var(--border-radius-full); border: 3px solid var(--brass-400); padding: 4px; background: #ffffff; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25); margin-bottom: var(--space-4); display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${renderAvatar(student.avatar, 'avatar-xl')}
            </div>

            <h1 class="profile-name">
              ${student.firstName} ${student.lastName}
            </h1>

            <div class="profile-meta">
              <span><i data-lucide="calendar"></i> ${student.age} سنوات</span>
              <span>•</span>
              <span><i data-lucide="user"></i> ${student.gender === 'ذكر' ? 'ولد' : 'بنت'}</span>
              <span>•</span>
              <span class="badge ${badgeClass}">${student.level}</span>
              <span>•</span>
              <span class="badge" style="background: rgba(255,255,255,0.15); color: #ffffff;">${student.group}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- Main Dossier Workplace -->
      <div class="container" style="margin-top: calc(var(--space-8) * -1); position: relative; z-index: 2;">
        
        <!-- Top 4 Summary Cards -->
        <div class="stats-grid" style="margin-bottom: var(--space-6);">
          <div class="stat-card">
            <div class="stat-icon green"><i data-lucide="book-open"></i></div>
            <div class="stat-info">
              <h3>إنجاز سورة الملك</h3>
              <div class="stat-value" style="color: var(--emerald-800);">${progress}%</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon gold"><i data-lucide="star"></i></div>
            <div class="stat-info">
              <h3>نقاط التميز</h3>
              <div class="stat-value" style="color: ${pointsData.total > 0 ? 'var(--brass-700)' : 'var(--text-primary)'};">${pointsData.total || 0}</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon green" style="background: #eaf6ee; color: var(--success);"><i data-lucide="calendar-check"></i></div>
            <div class="stat-info">
              <h3>نسبة المواظبة</h3>
              <div class="stat-value" style="color: var(--success);">${attStats.percentage}%</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon blue"><i data-lucide="trophy"></i></div>
            <div class="stat-info">
              <h3>المسابقات</h3>
              <div class="stat-value" style="color: var(--info);">${studentCompetitions.length}</div>
            </div>
          </div>
        </div>

        <!-- 2-Column Educational Details -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-6);">
          
          <!-- Right: Quranic Memorization Track -->
          <div style="display: flex; flex-direction: column; gap: var(--space-6);">
            
            <!-- Surah Al-Mulk Milestone Card -->
            <div class="card">
              <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                  <i data-lucide="book-open-check" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
                  <span>التقدم في سورة الملك المقررة</span>
                </h3>
                <span class="badge badge-green">${memorizedVerses} / 30 آية</span>
              </div>
              <div class="card-body">
                <div class="progress-container" style="margin-bottom: var(--space-4);">
                  <div class="progress-bar progress-bar-lg" style="height: 12px;">
                    <div class="progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, var(--emerald-800), var(--emerald-500));"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                    <span>بداية السورة (آية 1)</span>
                    <span>ختام السورة (آية 30)</span>
                  </div>
                </div>

                ${lastEntry ? `
                  <div style="background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-4); margin-bottom: var(--space-4);">
                    <div style="font-size: 11px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; margin-bottom: 2px;">
                      آخر تسميع مسجل
                    </div>
                    <div style="font-weight: 700; font-size: var(--font-size-base); color: var(--text-primary); margin-bottom: 2px;">
                      سورة ${lastEntry.surah} — الآيات (${lastEntry.versesText || (lastEntry.fromVerse + ' - ' + lastEntry.toVerse)})
                    </div>
                    <div style="font-size: 12px; color: var(--text-muted); display: flex; gap: var(--space-2); align-items: center;">
                      <span>تاريخ الحصة: ${formatDate(lastEntry.date)}</span>
                      ${lastEntry.evaluation ? `<span>•</span> <span class="badge badge-green" style="font-size: 10px;">${lastEntry.evaluation}</span>` : ''}
                    </div>
                    ${lastEntry.notes ? `
                      <div class="notes-text" style="font-size: 12px; color: var(--text-secondary); margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--border-subtle);">
                        ${lastEntry.notes}
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Historical Memorization Entries -->
                <div style="font-size: 12px; font-weight: 700; color: var(--text-secondary); margin-bottom: var(--space-2);">
                  سجل حصص التسميع والمراجعة:
                </div>
                ${memEntries.length === 0 ? `
                  <div style="text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: var(--font-size-xs);">
                    لم يتم تسجيل أي تسميع بعد
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: var(--space-2); max-height: 240px; overflow-y: auto;">
                    ${memEntries.map(m => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: var(--bg-subtle); border-radius: var(--border-radius-sm); font-size: 12px;">
                        <div>
                          <strong>سورة ${m.surah}</strong> (${m.versesText || (m.fromVerse + ' - ' + m.toVerse)})
                          <span style="color: var(--text-muted); font-size: 10px; margin-right: 6px;">${formatDate(m.date)}</span>
                        </div>
                        <span class="badge badge-gray" style="font-size: 10px;">${m.evaluation || 'معتمد'}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>

            <!-- Notes & Observations Card -->
            ${student.notes ? `
              <div class="card">
                <div class="card-header">
                  <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                    <i data-lucide="message-square" style="width: 17px; height: 17px; color: var(--emerald-800);"></i>
                    <span>ملاحظات تربوية وإدارية</span>
                  </h3>
                </div>
                <div class="card-body">
                  <p class="reading-content" style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; line-height: 1.8;">
                    ${student.notes}
                  </p>
                </div>
              </div>
            ` : ''}

          </div>

          <!-- Left: Attendance & Competitions & Points -->
          <div style="display: flex; flex-direction: column; gap: var(--space-6);">
            
            <!-- Attendance History Card -->
            <div class="card">
              <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                  <i data-lucide="calendar-check" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
                  <span>المواظبة وسجل الحضور</span>
                </h3>
              </div>
              <div class="card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-2); text-align: center; margin-bottom: var(--space-4);">
                  <div style="background: var(--att-present-bg); padding: 8px; border-radius: var(--border-radius-md); border: 1px solid var(--att-present-border);">
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--att-present-text);">${attStats.present}</div>
                    <div style="font-size: 10px; color: var(--att-present-text); font-weight: 600;">حاضر</div>
                  </div>
                  <div style="background: var(--att-absent-bg); padding: 8px; border-radius: var(--border-radius-md); border: 1px solid var(--att-absent-border);">
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--att-absent-text);">${attStats.absent}</div>
                    <div style="font-size: 10px; color: var(--att-absent-text); font-weight: 600;">غائب</div>
                  </div>
                  <div style="background: var(--att-excused-bg); padding: 8px; border-radius: var(--border-radius-md); border: 1px solid var(--att-excused-border);">
                    <div style="font-size: 1.25rem; font-weight: 700; color: var(--att-excused-text);">${attStats.excused}</div>
                    <div style="font-size: 10px; color: var(--att-excused-text); font-weight: 600;">بعذر</div>
                  </div>
                </div>

                <div class="progress-container">
                  <div class="progress-label">
                    <span class="label-text">معدل الانضباط</span>
                    <span class="label-value" style="color: var(--emerald-800);">${attStats.percentage}%</span>
                  </div>
                  <div class="progress-bar progress-bar-sm">
                    <div class="progress-fill" style="width: ${attStats.percentage}%; background: var(--emerald-700);"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Competitions Card -->
            <div class="card">
              <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                  <i data-lucide="award" style="width: 18px; height: 18px; color: var(--brass-500);"></i>
                  <span>المسابقات والتتويجات</span>
                </h3>
              </div>
              <div class="card-body">
                ${studentCompetitions.length === 0 ? `
                  <div style="text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: var(--font-size-xs);">
                    لم يشارك الطالب في أي مسابقة رسمية بعد
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                    ${studentCompetitions.map(comp => {
                      const res = comp.results?.find(r => r.studentId === student.id);
                      const rankIcons = { 1: '🥇 المركز الأول', 2: '🥈 المركز الثاني', 3: '🥉 المركز الثالث' };
                      return `
                        <div style="padding: 10px; background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
                          <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div style="font-weight: 700; font-size: var(--font-size-xs); color: var(--text-primary);">${comp.name}</div>
                            <span style="font-size: 10px; color: var(--text-muted);">${formatDate(comp.date)}</span>
                          </div>
                          ${res ? `
                            <div style="margin-top: 4px; display: flex; justify-content: space-between; align-items: center;">
                              <span class="badge badge-gold" style="font-size: 10px;">${rankIcons[res.rank] || 'متوج'}</span>
                              <span style="font-size: 11px; color: var(--brass-700); font-weight: 600;">${res.prize}</span>
                            </div>
                          ` : `
                            <div style="margin-top: 4px;">
                              <span class="badge badge-gray" style="font-size: 10px;">مشارك في التصفيات</span>
                            </div>
                          `}
                        </div>
                      `;
                    }).join('')}
                  </div>
                `}
              </div>
            </div>

            <!-- Points History Card -->
            <div class="card">
              <div class="card-header">
                <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
                  <i data-lucide="star" style="width: 18px; height: 18px; color: var(--brass-500);"></i>
                  <span>سجل نقاط التميز</span>
                </h3>
                <span class="badge badge-green">${pointsData.total || 0} نقطة</span>
              </div>
              <div class="card-body">
                ${pointsData.history.length === 0 ? `
                  <div style="text-align: center; padding: var(--space-4); color: var(--text-muted); font-size: var(--font-size-xs);">
                    لا يوجد سجل نقاط مضاف بعد
                  </div>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: var(--space-2); max-height: 200px; overflow-y: auto;">
                    ${pointsData.history.slice(0, 5).map(e => `
                      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; background: var(--bg-canvas); border-radius: var(--border-radius-sm); border: 1px solid var(--border-subtle); font-size: 11px;">
                        <div>
                          <strong>${e.reason}</strong>
                          <div style="font-size: 10px; color: var(--text-muted);">${formatDate(e.date)}</div>
                        </div>
                        <span class="badge ${e.delta > 0 ? 'badge-green' : 'badge-red'}" style="font-weight: 700;">
                          ${e.delta > 0 ? '+' : ''}${e.delta}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                `}
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
