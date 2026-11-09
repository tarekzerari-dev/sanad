// ============================================================
// سند — Admin Dashboard (Control Center)
// ============================================================

import { getStudents, getCompetitions, getTodayAttendanceStats, getJournalEntries, getWeeklySchedule, getAttendanceForDate } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { initIcons, calculateMemorizationProgress, formatDate, getTodayStr, getLevelBadgeClass } from '../../utils/helpers.js';
import { renderAvatar } from '../../utils/avatars.js';

export function renderDashboardPage() {
  const students = getStudents();
  const competitions = getCompetitions();
  const todayStats = getTodayAttendanceStats();
  const journalEntries = getJournalEntries();
  const weeklySchedule = getWeeklySchedule();
  const todayStr = getTodayStr();

  const boys = students.filter(s => s.gender === 'ذكر').length;
  const girls = students.filter(s => s.gender === 'أنثى').length;

  let avgProgress = 0;
  let totalVersesMemorized = 0;
  if (students.length > 0) {
    avgProgress = Math.round(
      students.reduce((sum, s) => sum + calculateMemorizationProgress(s.memorization), 0) / students.length
    );
    totalVersesMemorized = students.reduce((sum, s) => {
      return sum + (s.memorization || []).reduce((sub, m) => sub + (m.versesCount || 0), 0);
    }, 0);
  }

  // Level distribution
  const beginners = students.filter(s => s.level === 'مبتدئ').length;
  const intermediate = students.filter(s => s.level === 'متوسط').length;
  const advanced = students.filter(s => s.level === 'متقدم').length;

  // Absentees today for immediate follow-up
  const todayAttendance = getAttendanceForDate(todayStr);
  const absentStudents = students.filter(s => todayAttendance[s.id] === 'absent');
  const excusedStudents = students.filter(s => todayAttendance[s.id] === 'excused');

  // Today's schedule activity
  const daysMap = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const todayDayName = daysMap[new Date().getDay()];
  const todayScheduleItem = weeklySchedule.find(item => item.day === todayDayName);

  // Latest journal entry
  const latestJournal = journalEntries[0] || null;

  // Recent students
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.registrationDate || 0) - new Date(a.registrationDate || 0))
    .slice(0, 5);

  const content = `
    <!-- Top Welcome & Operational Action Bar -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-6); margin-bottom: var(--space-6); box-shadow: var(--shadow-xs); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
      <div>
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px;">
          <span class="badge badge-green" style="font-size: 11px;">
            <i data-lucide="calendar"></i>
            ${formatDate(todayStr)} (${todayDayName})
          </span>
          ${todayScheduleItem ? `
            <span class="badge badge-gold" style="font-size: 11px;">
              <i data-lucide="clock"></i>
              برنامج اليوم: ${todayScheduleItem.time}
            </span>
          ` : ''}
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 1.6rem; color: var(--emerald-950); margin: 0;">
          لوحة المتابعة والتحكم اليومي
        </h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-top: 4px;">
          مدرسة سند للقرآن الكريم وعلومه — نظرة عامة شاملة لحالة المدرسة وسير الحلقات
        </p>
      </div>

      <!-- Quick Action Buttons -->
      <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
        <a href="#/admin/attendance" class="btn btn-primary btn-sm">
          <i data-lucide="calendar-check"></i>
          <span>تسجيل حضور اليوم</span>
        </a>
        <a href="#/admin/memorization" class="btn btn-secondary btn-sm">
          <i data-lucide="book-open-check"></i>
          <span>إضافة تسميع</span>
        </a>
        <a href="#/admin/journal" class="btn btn-ghost btn-sm" style="border: 1px solid var(--border-color);">
          <i data-lucide="plus"></i>
          <span>تدوين يومية</span>
        </a>
      </div>
    </div>

    <!-- Core School Metrics -->
    <div class="stats-grid stagger">
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="users"></i></div>
        <div class="stat-info">
          <h3>إجمالي الطلبة المسجلين</h3>
          <div class="stat-value">${students.length}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${boys} أولاد • ${girls} بنات
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon green" style="background: #eaf6ee; color: var(--success);"><i data-lucide="user-check"></i></div>
        <div class="stat-info">
          <h3>الحاضرون اليوم</h3>
          <div class="stat-value" style="color: var(--success);">${todayStats.present}</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            من أصل ${todayStats.recorded} مسجّل اليوم
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon red"><i data-lucide="user-x"></i></div>
        <div class="stat-info">
          <h3>الغيابات اليوم</h3>
          <div class="stat-value" style="color: ${absentStudents.length > 0 ? 'var(--danger)' : 'var(--text-muted)'};">
            ${absentStudents.length + excusedStudents.length}
          </div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${absentStudents.length} غائب • ${excusedStudents.length} بعذر
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon gold"><i data-lucide="book-open"></i></div>
        <div class="stat-info">
          <h3>متوسط حفظ سورة الملك</h3>
          <div class="stat-value" style="color: var(--brass-700);">${avgProgress}%</div>
          <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
            ${totalVersesMemorized} آية محفوظة إجمالاً
          </div>
        </div>
      </div>
    </div>

    <!-- Attention Bar & Middle Layout -->
    <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--space-6); margin-bottom: var(--space-6);">
      
      <!-- Right: Operational Action & Absentee Follow-up -->
      <div class="card">
        <div class="card-header">
          <h3 style="display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="alert-circle" style="width: 18px; height: 18px; color: var(--brass-600);"></i>
            <span>تنبيهات ومتابعة الحضور اليومية</span>
          </h3>
          <a href="#/admin/attendance" class="btn btn-ghost btn-sm" style="font-size: 11px;">فتح سجل الحضور</a>
        </div>
        <div class="card-body">
          ${todayStats.recorded === 0 ? `
            <div style="text-align: center; padding: var(--space-6); background: var(--brass-50); border: 1px dashed var(--brass-300); border-radius: var(--border-radius-md);">
              <i data-lucide="clock" style="width: 32px; height: 32px; color: var(--brass-600); margin-bottom: var(--space-2);"></i>
              <div style="font-weight: 700; font-size: var(--font-size-sm); color: var(--emerald-950);">لم يتم رصد حضور اليوم بعد</div>
              <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: var(--space-2) 0 var(--space-4);">
                اضغط على الزر أدناه لرصد حضور وغياب الطلبة والتأكيد لحصة اليوم.
              </p>
              <a href="#/admin/attendance" class="btn btn-primary btn-sm">
                <i data-lucide="check"></i>
                بدء رصد الحضور الآن
              </a>
            </div>
          ` : (absentStudents.length === 0 && excusedStudents.length === 0) ? `
            <div style="text-align: center; padding: var(--space-6); background: var(--emerald-50); border: 1px solid var(--emerald-200); border-radius: var(--border-radius-md);">
              <i data-lucide="check-circle-2" style="width: 36px; height: 36px; color: var(--emerald-800); margin-bottom: var(--space-2);"></i>
              <div style="font-weight: 700; font-size: var(--font-size-base); color: var(--emerald-950);">مواظبة ممتازة — لا يوجد غائبون اليوم!</div>
              <p style="font-size: var(--font-size-xs); color: var(--emerald-700); margin-top: 4px;">
                جميع الطلبة المسجلين (${todayStats.present} طالب/طالبة) حضروا جلسة اليوم بانتظام.
              </p>
            </div>
          ` : `
            <div>
              <div style="font-size: var(--font-size-xs); font-weight: 600; color: var(--text-secondary); margin-bottom: var(--space-3);">
                طلبة تغيبوا عن حصة اليوم ويستدعي التواصل مع أوليائهم:
              </div>
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${absentStudents.map(s => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--att-absent-bg); border: 1px solid var(--att-absent-border); border-radius: var(--border-radius-md);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                      ${renderAvatar(s.avatar, 'avatar-xs')}
                      <div>
                        <div style="font-weight: 700; font-size: var(--font-size-sm); color: var(--att-absent-text);">${s.firstName} ${s.lastName}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">${s.group} • ${s.age} سنوات</div>
                      </div>
                    </div>
                    <span class="badge badge-red" style="font-size: 11px;">غائب</span>
                  </div>
                `).join('')}
                ${excusedStudents.map(s => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: var(--att-excused-bg); border: 1px solid var(--att-excused-border); border-radius: var(--border-radius-md);">
                    <div style="display: flex; align-items: center; gap: var(--space-3);">
                      ${renderAvatar(s.avatar, 'avatar-xs')}
                      <div>
                        <div style="font-weight: 700; font-size: var(--font-size-sm); color: var(--att-excused-text);">${s.firstName} ${s.lastName}</div>
                        <div style="font-size: 11px; color: var(--text-muted);">${s.group} • ${s.age} سنوات</div>
                      </div>
                    </div>
                    <span class="badge badge-gold" style="font-size: 11px;">بعذر</span>
                  </div>
                `).join('')}
              </div>
            </div>
          `}
        </div>
      </div>

      <!-- Left: Level Distribution & Quranic Track -->
      <div class="card">
        <div class="card-header">
          <h3 style="display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="bar-chart-2" style="width: 18px; height: 18px; color: var(--emerald-700);"></i>
            <span>توزيع المستويات التعليمية</span>
          </h3>
        </div>
        <div class="card-body">
          <!-- Beginners -->
          <div style="margin-bottom: var(--space-4);">
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 6px;">
              <span>مبتدئ</span>
              <span style="color: #0d6399;">${beginners} طالب (${students.length ? Math.round((beginners/students.length)*100) : 0}%)</span>
            </div>
            <div class="progress-bar progress-bar-sm">
              <div class="progress-fill" style="width: ${students.length ? (beginners/students.length)*100 : 0}%; background: #0ea5e9;"></div>
            </div>
          </div>

          <!-- Intermediate -->
          <div style="margin-bottom: var(--space-4);">
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 6px;">
              <span>متوسط</span>
              <span style="color: var(--emerald-800);">${intermediate} طالب (${students.length ? Math.round((intermediate/students.length)*100) : 0}%)</span>
            </div>
            <div class="progress-bar progress-bar-sm">
              <div class="progress-fill" style="width: ${students.length ? (intermediate/students.length)*100 : 0}%; background: var(--emerald-700);"></div>
            </div>
          </div>

          <!-- Advanced -->
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-xs); font-weight: 600; margin-bottom: 6px;">
              <span>متقدم</span>
              <span style="color: var(--brass-700);">${advanced} طالب (${students.length ? Math.round((advanced/students.length)*100) : 0}%)</span>
            </div>
            <div class="progress-bar progress-bar-sm">
              <div class="progress-fill" style="width: ${students.length ? (advanced/students.length)*100 : 0}%; background: var(--brass-500);"></div>
            </div>
          </div>

          <div style="background: var(--bg-canvas); border: 1px solid var(--border-subtle); border-radius: var(--border-radius-md); padding: var(--space-3); display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">
              <strong>المنهج الحالي:</strong> حفظ وتثبيت سورة الملك (30 آية)
            </div>
            <a href="#/admin/memorization" class="btn btn-ghost btn-sm" style="font-size: 11px;">متابعة الآيات</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Row: Recent Students & Latest Diary Entry -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
      
      <!-- Recent Students Registered -->
      <div class="card">
        <div class="card-header">
          <h3 style="display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="user-plus" style="width: 18px; height: 18px; color: var(--emerald-700);"></i>
            <span>آخر الطلبة المنضمين للمدرسة</span>
          </h3>
          <a href="#/admin/students" class="btn btn-ghost btn-sm" style="font-size: 11px;">عرض كافة الطلبة</a>
        </div>
        <div class="card-body" style="padding: 0;">
          ${recentStudents.length === 0 ? `
            <div class="empty-state" style="padding: var(--space-6);">
              <p>لا يوجد طلبة مسجلين بعد</p>
            </div>
          ` : `
            <div>
              ${recentStudents.map(s => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-5); border-bottom: 1px solid var(--border-subtle);">
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    ${renderAvatar(s.avatar, 'avatar-sm')}
                    <div>
                      <div style="font-weight: 700; font-size: var(--font-size-sm); color: var(--text-primary);">${s.firstName} ${s.lastName}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${s.group} • ${s.age} سنوات</div>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: var(--space-2);">
                    <span class="badge ${getLevelBadgeClass(s.level)}">${s.level}</span>
                    <a href="#/student/${s.id}" class="btn btn-ghost btn-sm btn-icon" title="معاينة الملف">
                      <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                    </a>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>

      <!-- Latest Teaching Diary Entry -->
      <div class="card">
        <div class="card-header">
          <h3 style="display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="book-open" style="width: 18px; height: 18px; color: var(--emerald-700);"></i>
            <span>آخر مدونة في اليوميات التربوية</span>
          </h3>
          <a href="#/admin/journal" class="btn btn-ghost btn-sm" style="font-size: 11px;">إدارة اليوميات</a>
        </div>
        <div class="card-body">
          ${latestJournal ? `
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                <span class="badge badge-green" style="font-size: 11px;">${formatDate(latestJournal.date)}</span>
                <span class="badge badge-gray" style="font-size: 11px;">${latestJournal.group}</span>
              </div>
              <h4 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
                ${latestJournal.title}
              </h4>
              
              <div style="font-size: var(--font-size-xs); line-height: 1.7; color: var(--text-secondary); background: var(--bg-canvas); padding: var(--space-3); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-3);" class="reading-content">
                <strong>الحفظ:</strong> ${latestJournal.memorizationText || '—'}
                <br>
                <strong>التجويد:</strong> ${latestJournal.tajweedText || '—'}
              </div>

              ${latestJournal.homeworkText ? `
                <div style="font-size: 11px; color: var(--brass-700); background: var(--brass-50); padding: 6px 10px; border-radius: var(--border-radius-sm); border: 1px solid var(--brass-200);">
                  <strong>الواجب المنزلي:</strong> ${latestJournal.homeworkText}
                </div>
              ` : ''}
            </div>
          ` : `
            <div class="empty-state" style="padding: var(--space-6);">
              <p>لا توجد مدونات يومية مسجلة بعد</p>
              <a href="#/admin/journal" class="btn btn-primary btn-sm" style="margin-top: var(--space-2);">إضافة أول حصة</a>
            </div>
          `}
        </div>
      </div>

    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/dashboard', content);
  initAdminLayout();
  initIcons();
}
