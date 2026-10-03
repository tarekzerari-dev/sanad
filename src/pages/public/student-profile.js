// ============================
// Student Profile Page (Public)
// ============================

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
          <div class="empty-state">
            <div class="empty-icon"><i data-lucide="user-x"></i></div>
            <h3>الطالب غير موجود</h3>
            <p>لم يتم العثور على الطالب المطلوب</p>
            <a href="#/students" class="btn btn-primary" style="margin-top: var(--space-6);">العودة للطلبة</a>
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
  
  // Get competitions this student participated in
  const allCompetitions = getCompetitions();
  const studentCompetitions = allCompetitions.filter(c => 
    c.participants && c.participants.includes(student.id)
  );

  // Get memorization entries sorted by date
  const memEntries = [...(student.memorization || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const lastEntry = memEntries[0];

  app.innerHTML = `
    ${renderNavbar()}
    
    <main>
      <!-- Profile Header -->
      <div class="profile-header pattern-bg">
        <div style="position: relative; z-index: 1; text-align: center;">
          <a href="#/students" class="back-btn" style="color: rgba(255,255,255,0.8); position: absolute; top: -40px; right: 20px;">
            <i data-lucide="arrow-right"></i>
            العودة
          </a>
          <div class="profile-avatar avatar avatar-xl" style="margin: 0 auto var(--space-5); border-color: rgba(255,255,255,0.3);">
            ${renderAvatar(student.avatar, '').replace('<div class="avatar ">', '').replace('</div>', '')}
          </div>
          <h1 class="profile-name">${student.firstName} ${student.lastName}</h1>
          <div class="profile-meta">
            <span><i data-lucide="calendar"></i> ${student.age} سنوات</span>
            <span><i data-lucide="user"></i> ${student.gender === 'ذكر' ? 'ولد' : 'بنت'}</span>
            <span class="badge ${badgeClass}" style="font-size: var(--font-size-xs);">${student.level}</span>
            <span><i data-lucide="users"></i> ${student.group}</span>
          </div>
        </div>
      </div>

      <!-- Profile Body -->
      <div class="profile-body">
        <!-- Stats Row -->
        <div class="stats-grid" style="grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); margin-bottom: var(--space-8);">
          <div class="stat-card">
            <div class="stat-icon green"><i data-lucide="book-open"></i></div>
            <div class="stat-info">
              <h3>التقدم في الحفظ</h3>
              <div class="stat-value">${progress}%</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #fffbeb; color: var(--warning);"><i data-lucide="star"></i></div>
            <div class="stat-info">
              <h3>النقاط</h3>
              <div class="stat-value" style="color: ${pointsData.total > 0 ? 'var(--green-500)' : (pointsData.total < 0 ? 'var(--danger)' : 'var(--text-primary)')}">${pointsData.total}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon blue"><i data-lucide="hash"></i></div>
            <div class="stat-info">
              <h3>الآيات المحفوظة</h3>
              <div class="stat-value">${memorizedVerses}</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: #ecfdf5; color: var(--green-600);"><i data-lucide="calendar-check"></i></div>
            <div class="stat-info">
              <h3>الحضور</h3>
              <div class="stat-value" style="color: ${attStats.percentage >= 90 ? 'var(--green-500)' : attStats.percentage >= 75 ? 'var(--gold-500)' : 'var(--danger)'}">${attStats.percentage}%</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon gold"><i data-lucide="trophy"></i></div>
            <div class="stat-info">
              <h3>المسابقات</h3>
              <div class="stat-value">${studentCompetitions.length}</div>
            </div>
          </div>
        </div>

        <div class="profile-grid">
          <!-- Memorization Progress -->
          <div class="card">
            <div class="card-header">
              <h3 style="font-size: var(--font-size-lg); display: flex; align-items: center; gap: var(--space-2);">
                <i data-lucide="book-open-check" style="width:20px;height:20px;color:var(--green-500);"></i>
                تقدم الحفظ
              </h3>
            </div>
            <div class="card-body">
              <!-- Progress Bar -->
              <div class="progress-container" style="margin-bottom: var(--space-6);">
                <div class="progress-label">
                  <span class="label-text">نسبة الإنجاز</span>
                  <span class="label-value">${progress}%</span>
                </div>
                <div class="progress-bar progress-bar-lg">
                  <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
              </div>

              ${lastEntry ? `
              <div style="background: var(--green-50); padding: var(--space-4); border-radius: var(--border-radius-md); margin-bottom: var(--space-5);">
                <div style="font-size: var(--font-size-xs); color: var(--green-600); font-weight: 600; margin-bottom: var(--space-1);">آخر إنجاز</div>
                <div style="font-size: var(--font-size-sm); font-weight: 600;">سورة ${lastEntry.surah}</div>
                <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">الآيات ${lastEntry.fromVerse} — ${lastEntry.toVerse} • ${formatDate(lastEntry.date)}</div>
              </div>
              ` : ''}

              <!-- Memorized Surahs -->
              <h4 style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-3);">السور المحفوظة</h4>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                ${memEntries.map(m => `
                  <span class="badge badge-green" style="font-size: var(--font-size-xs);">
                    ${m.surah} (${m.fromVerse}-${m.toVerse})
                  </span>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Attendance & Activity -->
          <div style="display: flex; flex-direction: column; gap: var(--space-6);">
            <!-- Attendance Card -->
            <div class="card">
              <div class="card-header">
                <h3 style="font-size: var(--font-size-lg); display: flex; align-items: center; gap: var(--space-2);">
                  <i data-lucide="calendar-check" style="width:20px;height:20px;color:var(--info);"></i>
                  الحضور والغياب
                </h3>
              </div>
              <div class="card-body">
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); text-align: center; margin-bottom: var(--space-4);">
                  <div>
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--green-500);">${attStats.present}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">حاضر</div>
                  </div>
                  <div>
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--danger);">${attStats.absent}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">غائب</div>
                  </div>
                  <div>
                    <div style="font-size: var(--font-size-2xl); font-weight: 800; color: var(--warning);">${attStats.excused}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">بعذر</div>
                  </div>
                </div>
                <div class="progress-container">
                  <div class="progress-label">
                    <span class="label-text">نسبة الحضور</span>
                    <span class="label-value" style="color: ${attStats.percentage >= 90 ? 'var(--green-500)' : 'var(--gold-500)'};">${attStats.percentage}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${attStats.percentage}%; background: ${attStats.percentage >= 90 ? 'linear-gradient(90deg, var(--green-400), var(--green-500))' : 'linear-gradient(90deg, var(--gold-400), var(--gold-500))'}"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Competitions Card -->
            <div class="card">
              <div class="card-header">
                <h3 style="font-size: var(--font-size-lg); display: flex; align-items: center; gap: var(--space-2);">
                  <i data-lucide="trophy" style="width:20px;height:20px;color:var(--gold-500);"></i>
                  المسابقات
                </h3>
              </div>
              <div class="card-body">
                ${studentCompetitions.length === 0 ? `
                  <p style="color: var(--text-muted); font-size: var(--font-size-sm); text-align: center; padding: var(--space-4);">
                    لم يشارك في أي مسابقة بعد
                  </p>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    ${studentCompetitions.map(comp => {
                      const result = comp.results?.find(r => r.studentId === student.id);
                      const rankEmoji = result ? (result.rank === 1 ? '🏆' : result.rank === 2 ? '🥈' : result.rank === 3 ? '🥉' : '') : '';
                      return `
                        <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--border-radius-md);">
                          <div style="display: flex; align-items: center; justify-content: space-between;">
                            <div>
                              <div style="font-weight: 600; font-size: var(--font-size-sm);">${comp.name}</div>
                              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${formatDate(comp.date)}</div>
                            </div>
                            ${result ? `<span style="font-size: var(--font-size-lg);">${rankEmoji}</span>` : '<span class="badge badge-gray">مشارك</span>'}
                          </div>
                          ${result ? `<div style="font-size: var(--font-size-xs); color: var(--gold-600); margin-top: var(--space-1);">المركز ${result.rank} — ${result.prize}</div>` : ''}
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
                <h3 style="font-size: var(--font-size-lg); display: flex; align-items: center; gap: var(--space-2);">
                  <i data-lucide="star" style="width:20px;height:20px;color:var(--warning);"></i>
                  سجل النقاط
                </h3>
              </div>
              <div class="card-body">
                ${pointsData.history.length === 0 ? `
                  <p style="color: var(--text-muted); font-size: var(--font-size-sm); text-align: center; padding: var(--space-4);">
                    لا يوجد سجل نقاط لهذا الطالب
                  </p>
                ` : `
                  <div style="display: flex; flex-direction: column; gap: var(--space-3);">
                    ${pointsData.history.slice(0, 5).map(entry => `
                      <div style="padding: var(--space-3); background: var(--gray-50); border-radius: var(--border-radius-md); display: flex; justify-content: space-between; align-items: center;">
                        <div>
                          <div style="font-weight: 600; font-size: var(--font-size-sm);">${entry.reason}</div>
                          <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${formatDate(entry.date)}</div>
                        </div>
                        <span class="badge ${entry.delta > 0 ? 'badge-green' : 'badge-danger'}" style="font-size: var(--font-size-sm); font-weight: 700;">${entry.delta > 0 ? '+' : ''}${entry.delta}</span>
                      </div>
                    `).join('')}
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>

        ${student.notes ? `
        <div class="card" style="margin-top: var(--space-6);">
          <div class="card-body" style="display: flex; align-items: center; gap: var(--space-3);">
            <i data-lucide="message-circle" style="width:20px;height:20px;color:var(--text-muted);flex-shrink:0;"></i>
            <div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-1);">ملاحظات</div>
              <div style="font-size: var(--font-size-sm);">${student.notes}</div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
}
