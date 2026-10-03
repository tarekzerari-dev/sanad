// ============================
// Admin Dashboard
// ============================

import { getStudents, getCompetitions, getTodayAttendanceStats } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { initIcons, calculateMemorizationProgress } from '../../utils/helpers.js';

export function renderDashboardPage() {
  const students = getStudents();
  const competitions = getCompetitions();
  const todayStats = getTodayAttendanceStats();
  
  const boys = students.filter(s => s.gender === 'ذكر').length;
  const girls = students.filter(s => s.gender === 'أنثى').length;
  
  let avgProgress = 0;
  if (students.length > 0) {
    avgProgress = Math.round(
      students.reduce((sum, s) => sum + calculateMemorizationProgress(s.memorization), 0) / students.length
    );
  }

  // Level distribution
  const beginners = students.filter(s => s.level === 'مبتدئ').length;
  const intermediate = students.filter(s => s.level === 'متوسط').length;
  const advanced = students.filter(s => s.level === 'متقدم').length;

  // Recent students (last 5 added)
  const recentStudents = [...students]
    .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
    .slice(0, 5);

  const content = `
    <!-- Stats Grid -->
    <div class="stats-grid stagger">
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="users"></i></div>
        <div class="stat-info">
          <h3>إجمالي الطلبة</h3>
          <div class="stat-value">${students.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i data-lucide="user"></i></div>
        <div class="stat-info">
          <h3>الأولاد</h3>
          <div class="stat-value">${boys}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fce7f3; color: #db2777;"><i data-lucide="user"></i></div>
        <div class="stat-info">
          <h3>البنات</h3>
          <div class="stat-value">${girls}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #ecfdf5; color: var(--green-600);"><i data-lucide="user-check"></i></div>
        <div class="stat-info">
          <h3>الحاضرون اليوم</h3>
          <div class="stat-value">${todayStats.present}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i data-lucide="user-x"></i></div>
        <div class="stat-info">
          <h3>الغائبون اليوم</h3>
          <div class="stat-value">${todayStats.absent + todayStats.excused}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon gold"><i data-lucide="trophy"></i></div>
        <div class="stat-info">
          <h3>المسابقات</h3>
          <div class="stat-value">${competitions.length}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="trending-up"></i></div>
        <div class="stat-info">
          <h3>متوسط التقدم</h3>
          <div class="stat-value">${avgProgress}%</div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
      <!-- Level Distribution -->
      <div class="card">
        <div class="card-header">
          <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="bar-chart-3" style="width:18px;height:18px;color:var(--green-500);"></i>
            توزيع المستويات
          </h3>
        </div>
        <div class="card-body">
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: var(--space-2);">
              <span>مبتدئ</span>
              <span style="font-weight: 600;">${beginners}</span>
            </div>
            <div class="progress-bar progress-bar-sm">
              <div class="progress-fill" style="width: ${students.length ? (beginners/students.length)*100 : 0}%; background: linear-gradient(90deg, #7dd3fc, #38bdf8);"></div>
            </div>
          </div>
          <div style="margin-bottom: var(--space-5);">
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: var(--space-2);">
              <span>متوسط</span>
              <span style="font-weight: 600;">${intermediate}</span>
            </div>
            <div class="progress-bar progress-bar-sm">
              <div class="progress-fill" style="width: ${students.length ? (intermediate/students.length)*100 : 0}%;"></div>
            </div>
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm); margin-bottom: var(--space-2);">
              <span>متقدم</span>
              <span style="font-weight: 600;">${advanced}</span>
            </div>
            <div class="progress-bar progress-bar-sm">
              <div class="progress-fill" style="width: ${students.length ? (advanced/students.length)*100 : 0}%; background: linear-gradient(90deg, var(--gold-400), var(--gold-500));"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Students -->
      <div class="card">
        <div class="card-header">
          <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="clock" style="width:18px;height:18px;color:var(--green-500);"></i>
            آخر الطلبة المسجلين
          </h3>
        </div>
        <div class="card-body" style="padding: 0;">
          ${recentStudents.length === 0 ? `
            <p style="padding: var(--space-6); text-align: center; color: var(--text-muted); font-size: var(--font-size-sm);">لا يوجد طلبة بعد</p>
          ` : `
            ${recentStudents.map(s => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-5); border-bottom: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  <div style="width: 36px; height: 36px; background: ${s.gender === 'ذكر' ? 'var(--green-100)' : '#fce7f3'}; border-radius: var(--border-radius-full); display: flex; align-items: center; justify-content: center; color: ${s.gender === 'ذكر' ? 'var(--green-600)' : '#db2777'};">
                    <i data-lucide="user" style="width:16px;height:16px;"></i>
                  </div>
                  <div>
                    <div style="font-weight: 600; font-size: var(--font-size-sm);">${s.firstName} ${s.lastName}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${s.group}</div>
                  </div>
                </div>
                <span class="badge ${s.level === 'مبتدئ' ? 'badge-beginner' : s.level === 'متوسط' ? 'badge-intermediate' : 'badge-advanced'}">${s.level}</span>
              </div>
            `).join('')}
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
