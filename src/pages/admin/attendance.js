// ============================
// Admin - Attendance
// ============================

import { getStudents, getAttendanceForDate, setAttendanceForDate } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { showToast } from '../../components/toast.js';
import { initIcons, getTodayStr, formatDate, GROUPS } from '../../utils/helpers.js';

let selectedDate = getTodayStr();
let selectedGroup = 'all';
let currentDraft = {};

export function renderAttendancePage() {
  currentDraft = { ...getAttendanceForDate(selectedDate) };

  const content = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
      <div>
        <h2 style="font-size: var(--font-size-xl);">إدارة وتأكيد الحضور والغياب</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">حدد حضور الطلبة ثم اضغط على زر "حفظ وتأكيد الحضور" لإرسال البيانات ومشاركتها في اليوميات</p>
      </div>
      <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
        <button class="btn btn-secondary" id="mark-all-present-btn">
          <i data-lucide="check-check"></i>
          تحديد الكل كحاضر
        </button>
        <button class="btn btn-primary" id="save-attendance-btn">
          <i data-lucide="save"></i>
          حفظ وتأكيد الحضور
        </button>
      </div>
    </div>

    <!-- Date & Group Selector -->
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="card-body">
        <div class="form-row" style="margin-bottom: 0;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">التاريخ الميلادي</label>
            <input type="date" id="att-date" class="form-input" value="${selectedDate}">
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label">المجموعة / الفوج</label>
            <select id="att-group" class="form-select">
              <option value="all">جميع الأفواج</option>
              ${GROUPS.map(g => `<option value="${g}" ${selectedGroup === g ? 'selected' : ''}>${g}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Stats -->
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: var(--space-6);" id="att-stats">
    </div>

    <!-- Attendance List -->
    <div class="attendance-list" id="attendance-list">
    </div>

    <!-- Bottom Save Action Bar -->
    <div style="margin-top: var(--space-6); text-align: center;">
      <button class="btn btn-primary btn-lg" id="save-attendance-btn-bottom" style="min-width: 250px;">
        <i data-lucide="check-circle-2"></i>
        تأكيد وحفظ سجل الحضور اليومي
      </button>
    </div>

    <div class="empty-state" id="att-empty" style="display:none;">
      <div class="empty-icon"><i data-lucide="calendar"></i></div>
      <h3>لا يوجد طلبة</h3>
      <p>لا يوجد طلبة في هذه المجموعة</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/attendance', content);
  initAdminLayout();
  initIcons();

  renderAttendanceList();
  initAttendanceEvents();
}

function renderAttendanceList() {
  let students = getStudents();
  const list = document.getElementById('attendance-list');
  const emptyState = document.getElementById('att-empty');

  // Filter by group
  if (selectedGroup !== 'all') {
    students = students.filter(s => s.group === selectedGroup);
  }

  renderAttendanceStats();

  if (students.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
    initIcons();
    return;
  }

  list.style.display = 'flex';
  emptyState.style.display = 'none';

  list.innerHTML = students.map(s => {
    const status = currentDraft[s.id] || '';
    return `
      <div class="attendance-item" data-student-id="${s.id}">
        <div class="attendance-student">
          ${renderAvatar(s.avatar, 'avatar-sm')}
          <div>
            <div class="name">${s.firstName} ${s.lastName}</div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${s.group}</div>
          </div>
        </div>
        <div class="attendance-btns">
          <button class="attendance-btn present ${status === 'present' ? 'active' : ''}" data-status="present" data-student="${s.id}">🟢 حاضر</button>
          <button class="attendance-btn absent ${status === 'absent' ? 'active' : ''}" data-status="absent" data-student="${s.id}">🔴 غائب</button>
          <button class="attendance-btn excused ${status === 'excused' ? 'active' : ''}" data-status="excused" data-student="${s.id}">🟡 بعذر</button>
        </div>
      </div>
    `;
  }).join('');

  initIcons();

  // Attendance button clicks (updates draft state)
  list.querySelectorAll('.attendance-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const studentId = btn.dataset.student;
      const status = btn.dataset.status;

      if (currentDraft[studentId] === status) {
        delete currentDraft[studentId]; // Toggle off
      } else {
        currentDraft[studentId] = status;
      }

      // Update button classes locally
      const parentItem = btn.closest('.attendance-item');
      parentItem.querySelectorAll('.attendance-btn').forEach(b => b.classList.remove('active'));
      if (currentDraft[studentId]) {
        parentItem.querySelector(`.attendance-btn[data-status="${currentDraft[studentId]}"]`)?.classList.add('active');
      }

      renderAttendanceStats();
    });
  });
}

function renderAttendanceStats() {
  let students = getStudents();
  const statsEl = document.getElementById('att-stats');

  if (selectedGroup !== 'all') {
    students = students.filter(s => s.group === selectedGroup);
  }

  let present = 0, absent = 0, excused = 0;
  students.forEach(s => {
    const status = currentDraft[s.id];
    if (status === 'present') present++;
    else if (status === 'absent') absent++;
    else if (status === 'excused') excused++;
  });

  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon" style="background: #ecfdf5; color: var(--green-600);"><i data-lucide="check-circle"></i></div>
        <div class="stat-info">
          <h3>حاضر</h3>
          <div class="stat-value" style="color: var(--green-600);">${present}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red"><i data-lucide="x-circle"></i></div>
        <div class="stat-info">
          <h3>غائب</h3>
          <div class="stat-value" style="color: var(--danger);">${absent}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fffbeb; color: var(--warning);"><i data-lucide="alert-circle"></i></div>
        <div class="stat-info">
          <h3>بعذر</h3>
          <div class="stat-value" style="color: var(--warning);">${excused}</div>
        </div>
      </div>
    `;
    initIcons();
  }
}

function saveAttendance() {
  setAttendanceForDate(selectedDate, currentDraft);
  showToast(`تم تأكيد وحفظ سجل الحضور ليوم ${formatDate(selectedDate)} بنجاح!`);
}

function initAttendanceEvents() {
  document.getElementById('att-date')?.addEventListener('change', (e) => {
    selectedDate = e.target.value;
    currentDraft = { ...getAttendanceForDate(selectedDate) };
    renderAttendanceList();
  });

  document.getElementById('att-group')?.addEventListener('change', (e) => {
    selectedGroup = e.target.value;
    renderAttendanceList();
  });

  document.getElementById('save-attendance-btn')?.addEventListener('click', saveAttendance);
  document.getElementById('save-attendance-btn-bottom')?.addEventListener('click', saveAttendance);

  document.getElementById('mark-all-present-btn')?.addEventListener('click', () => {
    let students = getStudents();
    if (selectedGroup !== 'all') {
      students = students.filter(s => s.group === selectedGroup);
    }
    students.forEach(s => {
      currentDraft[s.id] = 'present';
    });
    renderAttendanceList();
    showToast('تم تحديد جميع الطلبة كحاضرين. اضغط "تأكيد وحفظ الحضور" للحفظ النهائي.');
  });
}
