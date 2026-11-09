// ============================================================
// سند — Admin Attendance Management (إدارة الحضور والغياب)
// ============================================================

import { getStudents, getAttendanceForDate, setAttendanceForDate } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { showToast } from '../../components/toast.js';
import { initIcons, getTodayStr, formatDate, GROUPS, getLevelBadgeClass } from '../../utils/helpers.js';

let selectedDate = getTodayStr();
let selectedGroup = 'all';
let currentDraft = {};
let hasUnsavedChanges = false;

export function renderAttendancePage() {
  currentDraft = { ...getAttendanceForDate(selectedDate) };
  hasUnsavedChanges = false;

  const content = `
    <!-- Page Header & Global Controls -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">رصد وضبط حضور الطلبة</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          تسجيل حضور وغياب الحلقات القرآنية اليومية بدقة وسرعة مع التزامن السحابي الفوري
        </p>
      </div>

      <div style="display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap;">
        <button class="btn btn-secondary btn-sm" id="mark-all-present-btn" title="تحديد جميع طلبة الفوج المختار كحاضرين">
          <i data-lucide="check-check"></i>
          <span>تحديد الكل كحاضر</span>
        </button>

        <button class="btn btn-primary" id="save-attendance-btn">
          <i data-lucide="save"></i>
          <span id="save-btn-text">تأكيد وحفظ السجل</span>
        </button>
      </div>
    </div>

    <!-- Date Navigation & Group Switcher Bar -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-4) var(--space-5); margin-bottom: var(--space-5); box-shadow: var(--shadow-xs);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
        
        <!-- Date Selector with Day Stepper -->
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <button class="btn btn-ghost btn-sm btn-icon" id="prev-day-btn" title="اليوم السابق">
            <i data-lucide="chevron-right"></i>
          </button>
          
          <div style="position: relative;">
            <input type="date" id="att-date" value="${selectedDate}" class="form-input" style="padding: 7px 12px; font-weight: 600; font-size: var(--font-size-sm); border-radius: var(--border-radius-md);">
          </div>

          <button class="btn btn-ghost btn-sm btn-icon" id="next-day-btn" title="اليوم التالي">
            <i data-lucide="chevron-left"></i>
          </button>

          <button class="btn btn-secondary btn-sm" id="today-shortcut-btn" style="padding: 6px 12px;">
            اليوم
          </button>
        </div>

        <!-- Group Selector Tabs -->
        <div style="display: flex; align-items: center; gap: var(--space-2);">
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">الفوج:</span>
          <div class="filter-chips" id="group-filter-chips">
            <button class="filter-chip ${selectedGroup === 'all' ? 'active' : ''}" data-group="all">كافة الأفواج</button>
            ${GROUPS.map(g => `
              <button class="filter-chip ${selectedGroup === g ? 'active' : ''}" data-group="${g}">${g}</button>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- Live Attendance Metrics Strip -->
      <div id="attendance-summary-strip" style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3);">
        <!-- Injected via JavaScript -->
      </div>
    </div>

    <!-- Attendance Students List -->
    <div id="attendance-list-container" class="attendance-list"></div>

    <!-- Empty State -->
    <div class="empty-state" id="att-empty" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
      <div class="empty-icon"><i data-lucide="calendar-x"></i></div>
      <h3>لا يوجد طلبة في هذا الفوج</h3>
      <p>يرجى اختيار فوج آخر أو إضافة طلبة من قائمة إدارة الطلبة.</p>
    </div>

    <!-- Sticky Bottom Save Bar (Visible when there are students) -->
    <div style="margin-top: var(--space-6); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-4) var(--space-5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
      <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-xs); color: var(--text-secondary);">
        <i data-lucide="info" style="width: 16px; height: 16px; color: var(--emerald-700);"></i>
        <span>يتم رصد الحضور بنقرة واحدة ويتم اعتماد التعديلات ومزامنتها سحابياً بالضغط على زر الحفظ.</span>
      </div>
      <button class="btn btn-primary" id="save-attendance-btn-bottom">
        <i data-lucide="save"></i>
        <span>تأكيد وحفظ السجل</span>
      </button>
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
  const allStudents = getStudents();
  let students = [...allStudents];
  const container = document.getElementById('attendance-list-container');
  const emptyState = document.getElementById('att-empty');

  if (selectedGroup !== 'all') {
    students = students.filter(s => s.group === selectedGroup);
  }

  // Calculate live statistics
  let present = 0, absent = 0, excused = 0, unrecorded = 0;
  students.forEach(s => {
    const status = currentDraft[s.id];
    if (status === 'present') present++;
    else if (status === 'absent') absent++;
    else if (status === 'excused') excused++;
    else unrecorded++;
  });

  // Render Summary Strip
  const summaryStrip = document.getElementById('attendance-summary-strip');
  if (summaryStrip) {
    const total = students.length;
    const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;

    summaryStrip.innerHTML = `
      <div style="background: var(--bg-canvas); padding: 8px 12px; border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle); text-align: center;">
        <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">الطلبة باللائحة</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--text-primary);">${total}</div>
      </div>
      <div style="background: var(--att-present-bg); padding: 8px 12px; border-radius: var(--border-radius-md); border: 1px solid var(--att-present-border); text-align: center;">
        <div style="font-size: 11px; color: var(--att-present-text); font-weight: 600;">الحاضرون (${presentPercent}%)</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--att-present-text);">${present}</div>
      </div>
      <div style="background: var(--att-absent-bg); padding: 8px 12px; border-radius: var(--border-radius-md); border: 1px solid var(--att-absent-border); text-align: center;">
        <div style="font-size: 11px; color: var(--att-absent-text); font-weight: 600;">الغياب بدون عذر</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--att-absent-text);">${absent}</div>
      </div>
      <div style="background: var(--att-excused-bg); padding: 8px 12px; border-radius: var(--border-radius-md); border: 1px solid var(--att-excused-border); text-align: center;">
        <div style="font-size: 11px; color: var(--att-excused-text); font-weight: 600;">الغياب بعذر مسبق</div>
        <div style="font-size: 1.25rem; font-weight: 700; color: var(--att-excused-text);">${excused}</div>
      </div>
    `;
  }

  if (students.length === 0) {
    if (container) container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = students.map(s => {
    const status = currentDraft[s.id] || null;

    return `
      <div class="attendance-item" data-student-id="${s.id}">
        <div class="attendance-student">
          ${renderAvatar(s.avatar, 'avatar-md')}
          <div>
            <div class="name">${s.firstName} ${s.lastName}</div>
            <div class="sub" style="display: flex; gap: var(--space-2); align-items: center; margin-top: 2px;">
              <span>${s.age} سنوات</span>
              <span>•</span>
              <span class="badge ${getLevelBadgeClass(s.level)}" style="font-size: 10px; padding: 1px 6px;">${s.level}</span>
              <span>•</span>
              <span>${s.group}</span>
            </div>
          </div>
        </div>

        <div class="attendance-btns" role="group" aria-label="خيارات الحضور">
          <button class="attendance-btn present ${status === 'present' ? 'active' : ''}" data-status="present" data-student-id="${s.id}">
            <i data-lucide="check"></i>
            <span>حاضر</span>
          </button>
          <button class="attendance-btn absent ${status === 'absent' ? 'active' : ''}" data-status="absent" data-student-id="${s.id}">
            <i data-lucide="x"></i>
            <span>غائب</span>
          </button>
          <button class="attendance-btn excused ${status === 'excused' ? 'active' : ''}" data-status="excused" data-student-id="${s.id}">
            <i data-lucide="clock"></i>
            <span>بعذر</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  initIcons();

  // Attach button events
  container.querySelectorAll('.attendance-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const studentId = btn.dataset.studentId;
      const status = btn.dataset.status;

      // Toggle or select
      if (currentDraft[studentId] === status) {
        delete currentDraft[studentId]; // unselect
      } else {
        currentDraft[studentId] = status;
      }

      hasUnsavedChanges = true;
      renderAttendanceList();
    });
  });
}

function saveAttendance() {
  setAttendanceForDate(selectedDate, currentDraft);
  hasUnsavedChanges = false;
  showToast(`تم تأكيد وحفظ سجل الحضور ليوم ${formatDate(selectedDate)} بنجاح! 🎉`);
}

function initAttendanceEvents() {
  // Date change
  const dateInput = document.getElementById('att-date');
  dateInput?.addEventListener('change', (e) => {
    selectedDate = e.target.value;
    currentDraft = { ...getAttendanceForDate(selectedDate) };
    renderAttendanceList();
  });

  // Prev / Next day steppers
  document.getElementById('prev-day-btn')?.addEventListener('click', () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    selectedDate = d.toISOString().split('T')[0];
    if (dateInput) dateInput.value = selectedDate;
    currentDraft = { ...getAttendanceForDate(selectedDate) };
    renderAttendanceList();
  });

  document.getElementById('next-day-btn')?.addEventListener('click', () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    selectedDate = d.toISOString().split('T')[0];
    if (dateInput) dateInput.value = selectedDate;
    currentDraft = { ...getAttendanceForDate(selectedDate) };
    renderAttendanceList();
  });

  // Today shortcut
  document.getElementById('today-shortcut-btn')?.addEventListener('click', () => {
    selectedDate = getTodayStr();
    if (dateInput) dateInput.value = selectedDate;
    currentDraft = { ...getAttendanceForDate(selectedDate) };
    renderAttendanceList();
  });

  // Group filter chips
  document.querySelectorAll('#group-filter-chips .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#group-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedGroup = chip.dataset.group;
      renderAttendanceList();
    });
  });

  // Save buttons
  document.getElementById('save-attendance-btn')?.addEventListener('click', saveAttendance);
  document.getElementById('save-attendance-btn-bottom')?.addEventListener('click', saveAttendance);

  // Mark all present
  document.getElementById('mark-all-present-btn')?.addEventListener('click', () => {
    let students = getStudents();
    if (selectedGroup !== 'all') {
      students = students.filter(s => s.group === selectedGroup);
    }
    students.forEach(s => {
      currentDraft[s.id] = 'present';
    });
    hasUnsavedChanges = true;
    renderAttendanceList();
    showToast(`تم تحديد ${students.length} طالب كحاضرين. اضغط على حفظ لاعتماد السجل.`);
  });
}
