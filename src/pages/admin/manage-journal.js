// ============================
// Admin - Manage Journal & Schedule
// ============================

import { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, getWeeklySchedule, setWeeklySchedule, getAttendanceForDate, getStudents } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { openModal, closeModal, confirmDialog } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, generateId, formatDate, getTodayStr, GROUPS } from '../../utils/helpers.js';

let adminJournalFilter = 'all'; // 'all' | 'active' | 'archived'

export function renderManageJournalPage() {
  const content = `
    <div class="page-header">
      <div>
        <h2 style="font-size: var(--font-size-xl);">يوميات المدرسة والبرنامج الأسبوعي</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">إدخال ما تم تدريسه يومياً وإدارة الرزنامة الأسبوعية وميزة الأرشفة</p>
      </div>
      <div style="display: flex; gap: var(--space-3);">
        <button class="btn btn-secondary" id="edit-schedule-btn">
          <i data-lucide="calendar"></i>
          تعديل الرزنامة الأسبوعية
        </button>
        <button class="btn btn-primary" id="add-entry-btn">
          <i data-lucide="plus"></i>
          إضافة يومية جديدة
        </button>
      </div>
    </div>

    <!-- Weekly Schedule Preview -->
    <div class="card" style="margin-bottom: var(--space-6); border-top: 3px solid var(--green-500);">
      <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
          <i data-lucide="calendar-range" style="width: 18px; height: 18px; color: var(--green-500);"></i>
          الرزنامة الأسبوعية الحالية (السبت — الأربعاء • 09:00 — 10:30)
        </h3>
        <button class="btn btn-ghost btn-sm" id="edit-schedule-link">
          <i data-lucide="pencil" style="width: 14px; height: 14px;"></i>
          تعديل
        </button>
      </div>
      <div class="card-body">
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-3);" id="admin-schedule-grid">
        </div>
      </div>
    </div>

    <!-- Journal Entries List Header -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); flex-wrap: wrap; gap: var(--space-3);">
      <h3 style="font-size: var(--font-size-lg);">سجل اليوميات والأرشيف</h3>
      <div class="filter-chips" id="admin-journal-status-chips">
        <button class="filter-chip ${adminJournalFilter === 'all' ? 'active' : ''}" data-status="all">جميع اليوميات</button>
        <button class="filter-chip ${adminJournalFilter === 'active' ? 'active' : ''}" data-status="active">الحالية فقط</button>
        <button class="filter-chip ${adminJournalFilter === 'archived' ? 'active' : ''}" data-status="archived">المؤرشفة فقط</button>
      </div>
    </div>

    <!-- Journal Entries Container -->
    <div id="admin-journal-list"></div>

    <div class="empty-state" id="admin-journal-empty" style="display:none;">
      <div class="empty-icon"><i data-lucide="book-open"></i></div>
      <h3>لا توجد يوميات مسجلة بعد</h3>
      <p>اضغط على "إضافة يومية جديدة" لإدخال ما تم تدريسه اليوم</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/journal', content);
  initAdminLayout();
  initIcons();

  renderAdminScheduleGrid();
  renderAdminJournalList();

  document.getElementById('add-entry-btn')?.addEventListener('click', () => openJournalModal());
  document.getElementById('edit-schedule-btn')?.addEventListener('click', () => openScheduleModal());
  document.getElementById('edit-schedule-link')?.addEventListener('click', () => openScheduleModal());

  // Filter Status Chips
  document.querySelectorAll('#admin-journal-status-chips .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#admin-journal-status-chips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      adminJournalFilter = chip.dataset.status;
      renderAdminJournalList();
    });
  });
}

function renderAdminScheduleGrid() {
  const grid = document.getElementById('admin-schedule-grid');
  const schedule = getWeeklySchedule();

  if (!grid) return;

  grid.innerHTML = schedule.map(item => `
    <div style="background: var(--gray-50); padding: var(--space-3); border-radius: var(--border-radius-md); border: 1px solid var(--border-color); border-right: 3px solid var(--green-500); text-align: right;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; flex-direction: row-reverse;">
        <span class="badge badge-green" style="font-size: 10px;">${item.fawj}</span>
        <strong style="color: var(--green-600);">${item.day}</strong>
      </div>
      <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: 6px; text-align: right;">${item.time}</div>
      <div style="font-size: var(--font-size-xs); line-height: 1.5; text-align: right;">${item.activity}</div>
    </div>
  `).join('');
}

function renderAdminJournalList() {
  let entries = getJournalEntries();
  const list = document.getElementById('admin-journal-list');
  const emptyState = document.getElementById('admin-journal-empty');

  if (adminJournalFilter === 'active') {
    entries = entries.filter(e => !e.archived);
  } else if (adminJournalFilter === 'archived') {
    entries = entries.filter(e => e.archived);
  }

  if (entries.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = 'var(--space-4)';
  emptyState.style.display = 'none';

  list.innerHTML = entries.map(entry => `
    <div class="card" style="border-right: 4px solid ${entry.archived ? 'var(--text-muted)' : 'var(--green-500)'};">
      <div class="card-body">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); flex-wrap: wrap;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
              <span class="badge ${entry.archived ? 'badge-gray' : 'badge-green'}">${entry.group || 'جميع الأفواج'}</span>
              ${entry.archived ? `<span class="badge badge-gray"><i data-lucide="archive" style="width:12px;height:12px;"></i> في الأرشيف</span>` : ''}
              <span style="font-size: var(--font-size-xs); color: var(--text-muted);"><i data-lucide="calendar" style="width:12px;height:12px;"></i> ${formatDate(entry.date)} (تاريخ ميلادي)</span>
            </div>
            <h3 style="font-size: var(--font-size-base); color: ${entry.archived ? 'var(--text-secondary)' : 'var(--green-700)'}; margin-bottom: var(--space-3);">${entry.title}</h3>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-3); font-size: var(--font-size-xs);">
              ${entry.memorizationText ? `<div><strong>📖 الحفظ والتدريس:</strong> ${entry.memorizationText}</div>` : ''}
              ${entry.tajweedText ? `<div><strong>📜 أحكام التجويد:</strong> ${entry.tajweedText}</div>` : ''}
              ${entry.homeworkText ? `<div><strong>🏠 الواجب المنزلي:</strong> ${entry.homeworkText}</div>` : ''}
            </div>

            <!-- Daily Attendance Record Summary -->
            ${(() => {
              const att = getAttendanceForDate(entry.date);
              
              let entryStudents = getStudents();
              if (entry.group && entry.group !== 'الكل' && entry.group !== 'all') {
                entryStudents = entryStudents.filter(s => s.group === entry.group);
              }
              
              let present = 0, absent = 0, excused = 0, recordedCount = 0;
              entryStudents.forEach(s => {
                if (att[s.id]) {
                  recordedCount++;
                  if (att[s.id] === 'present') present++;
                  else if (att[s.id] === 'absent') absent++;
                  else if (att[s.id] === 'excused') excused++;
                }
              });

              const total = recordedCount;

              return `
                <div style="margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px dashed var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-2); font-size: 12px;">
                  <span style="color: var(--text-secondary); font-weight: 600;">سجل الحضور لهذه الحصة:</span>
                  ${total > 0 ? `
                    <div style="display: flex; gap: 6px; align-items: center;">
                      <span class="badge badge-green" style="font-size: 10px;">🟢 ${present} حاضر</span>
                      ${absent > 0 ? `<span class="badge" style="font-size: 10px; background: #fef2f2; color: #dc2626;">🔴 ${absent} غائب</span>` : ''}
                      ${excused > 0 ? `<span class="badge" style="font-size: 10px; background: #fffbeb; color: #d97706;">🟡 ${excused} بعذر</span>` : ''}
                      <a href="#/admin/attendance" class="btn btn-ghost btn-xs" style="padding: 2px 6px; font-size: 10px; color: var(--green-600);">تسجيل/تعديل الحضور</a>
                    </div>
                  ` : `
                    <div style="display: flex; gap: 6px; align-items: center;">
                      <span class="badge badge-gray" style="font-size: 10px;">لم يُسجل الحضور بعد</span>
                      <a href="#/admin/attendance" class="btn btn-ghost btn-xs" style="padding: 2px 6px; font-size: 10px; color: var(--green-600);">تسجيل الحضور</a>
                    </div>
                  `}
                </div>
              `;
            })()}
          </div>
          
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <button class="btn ${entry.archived ? 'btn-secondary' : 'btn-ghost'} btn-sm toggle-archive-btn" data-id="${entry.id}" title="${entry.archived ? 'إعادة للحالية' : 'نقل للأرشيف'}">
              <i data-lucide="${entry.archived ? 'archive-restore' : 'archive'}" style="width:16px;height:16px;"></i>
              ${entry.archived ? 'إعادة للحالية' : 'أرشفة'}
            </button>
            <button class="btn btn-ghost btn-sm edit-entry-btn" data-id="${entry.id}" title="تعديل">
              <i data-lucide="pencil" style="width:16px;height:16px;"></i>
            </button>
            <button class="btn btn-ghost btn-sm delete-entry-btn" data-id="${entry.id}" title="حذف" style="color: var(--danger);">
              <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  initIcons();

  list.querySelectorAll('.toggle-archive-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = getJournalEntries().find(e => e.id === btn.dataset.id);
      if (entry) {
        const newArchivedState = !entry.archived;
        updateJournalEntry(entry.id, { archived: newArchivedState });
        showToast(newArchivedState ? 'تمت أرشفة اليومية' : 'تمت إعادة اليومية للحصص الحالية');
        renderAdminJournalList();
      }
    });
  });

  list.querySelectorAll('.edit-entry-btn').forEach(btn => {
    btn.addEventListener('click', () => openJournalModal(btn.dataset.id));
  });

  list.querySelectorAll('.delete-entry-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDialog('هل أنت متأكد من حذف هذه اليومية؟', () => {
        deleteJournalEntry(btn.dataset.id);
        showToast('تم حذف اليومية بنجاح');
        renderAdminJournalList();
      });
    });
  });
}

function openJournalModal(entryId = null) {
  const existing = entryId ? getJournalEntries().find(e => e.id === entryId) : null;
  const isEdit = !!existing;

  const body = `
    <form id="journal-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">التاريخ الميلادي</label>
          <input type="date" id="jf-date" class="form-input" value="${existing?.date || getTodayStr()}" required>
        </div>
        <div class="form-group">
          <label class="form-label">الفوج / المجموعة</label>
          <select id="jf-group" class="form-select" required>
            <option value="الكل" ${existing?.group === 'الكل' ? 'selected' : ''}>جميع الأفواج</option>
            ${GROUPS.map(g => `<option value="${g}" ${existing?.group === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">عنوان الحصة / الموضوع الرئيسي</label>
        <input type="text" id="jf-title" class="form-input" value="${existing?.title || ''}" required placeholder="مثال: حصة يوم الاثنين — تحفيظ سورة الملك وأحكام النون الساكنة والتنوين">
      </div>

      <div class="form-group">
        <label class="form-label">📖 برنامج الحفظ والتدريس في الحصة</label>
        <textarea id="jf-memorization" class="form-textarea" placeholder="ما تم حفظه وتسميعه ومراجعته خلال الحصة...">${existing?.memorizationText || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">📜 أحكام التجويد الشفاهية والعملية</label>
        <textarea id="jf-tajweed" class="form-textarea" placeholder="الأحكام والقواعد التجويدية التي تم شرحها وتطبيقها...">${existing?.tajweedText || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">🎯 أنشطة وتطبيقات أخرى</label>
        <input type="text" id="jf-activities" class="form-input" value="${existing?.activitiesText || ''}" placeholder="تمارين فردية، قراءة نموذجية، الخ...">
      </div>

      <div class="form-group">
        <label class="form-label">🏠 الواجب والبرنامج المنزلي (للأولياء)</label>
        <input type="text" id="jf-homework" class="form-input" value="${existing?.homeworkText || ''}" placeholder="الآيات المطلوب حفظها أو مراجعتها في المنزل...">
      </div>

      <div class="form-group">
        <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer;">
          <input type="checkbox" id="jf-archived" ${existing?.archived ? 'checked' : ''}>
          <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">أرشفة هذه اليومية (تظهر في قسم الأرشيف للأولياء)</span>
        </label>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-journal-btn">
      <i data-lucide="check"></i>
      ${isEdit ? 'حفظ التعديلات' : 'نشر اليومية'}
    </button>
    <button class="btn btn-ghost" id="cancel-journal-btn">إلغاء</button>
  `;

  openModal(isEdit ? 'تعديل اليومية' : 'إضافة يومية جديدة للمدرسة', body, footer);

  setTimeout(() => {
    initIcons();

    document.getElementById('save-journal-btn')?.addEventListener('click', () => {
      const date = document.getElementById('jf-date').value;
      const group = document.getElementById('jf-group').value;
      const title = document.getElementById('jf-title').value.trim();
      const memorizationText = document.getElementById('jf-memorization').value.trim();
      const tajweedText = document.getElementById('jf-tajweed').value.trim();
      const activitiesText = document.getElementById('jf-activities').value.trim();
      const homeworkText = document.getElementById('jf-homework').value.trim();
      const archived = document.getElementById('jf-archived').checked;

      if (!date || !title) {
        showToast('يرجى ملء التاريخ وعنوان الحصة', 'error');
        return;
      }

      if (isEdit) {
        updateJournalEntry(entryId, { date, group, title, memorizationText, tajweedText, activitiesText, homeworkText, archived });
        showToast('تم تحديث اليومية بنجاح');
      } else {
        addJournalEntry({
          id: generateId(),
          date,
          group,
          title,
          memorizationText,
          tajweedText,
          activitiesText,
          homeworkText,
          archived,
          createdAt: new Date().toISOString()
        });
        showToast('تم نشر اليومية بنجاح ليراها الأولياء');
      }

      closeModal();
      renderAdminJournalList();
    });

    document.getElementById('cancel-journal-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function openScheduleModal() {
  const currentSchedule = getWeeklySchedule();

  const body = `
    <div style="margin-bottom: var(--space-4); font-size: var(--font-size-xs); color: var(--text-muted);">
      يمكنك تعديل توقيت وبرنامج كل يوم من أيام الأسبوع في المدرسة:
    </div>
    <form id="schedule-form">
      <div style="display: flex; flex-direction: column; gap: var(--space-4);" id="schedule-items-container">
        ${currentSchedule.map((item, index) => `
          <div style="background: var(--gray-50); padding: var(--space-3); border-radius: var(--border-radius-md); border: 1px solid var(--border-color);" class="schedule-item-row">
            <div class="form-row" style="margin-bottom: var(--space-2);">
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size: 11px;">اليوم</label>
                <input type="text" class="form-input sch-day" value="${item.day}" required style="padding: 4px 8px; font-size: 13px;">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size: 11px;">التوقيت</label>
                <input type="text" class="form-input sch-time" value="${item.time}" required style="padding: 4px 8px; font-size: 13px;">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label" style="font-size: 11px;">الفوج</label>
                <input type="text" class="form-input sch-fawj" value="${item.fawj}" required style="padding: 4px 8px; font-size: 13px;">
              </div>
            </div>
            <div class="form-group" style="margin:0;">
              <label class="form-label" style="font-size: 11px;">النشاط والبرنامج المعتمد</label>
              <input type="text" class="form-input sch-activity" value="${item.activity}" required style="padding: 4px 8px; font-size: 13px;">
            </div>
          </div>
        `).join('')}
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-schedule-btn">
      <i data-lucide="check"></i>
      حفظ الرزنامة الأسبوعية
    </button>
    <button class="btn btn-ghost" id="cancel-schedule-btn">إلغاء</button>
  `;

  openModal('تعديل الرزنامة الأسبوعية', body, footer);

  setTimeout(() => {
    initIcons();

    document.getElementById('save-schedule-btn')?.addEventListener('click', () => {
      const rows = document.querySelectorAll('.schedule-item-row');
      const newSchedule = [];

      rows.forEach(row => {
        const day = row.querySelector('.sch-day').value.trim();
        const time = row.querySelector('.sch-time').value.trim();
        const fawj = row.querySelector('.sch-fawj').value.trim();
        const activity = row.querySelector('.sch-activity').value.trim();

        if (day && activity) {
          newSchedule.push({ day, time, fawj, activity });
        }
      });

      setWeeklySchedule(newSchedule);
      showToast('تم تحديث الرزنامة الأسبوعية بنجاح');
      closeModal();
      renderAdminScheduleGrid();
    });

    document.getElementById('cancel-schedule-btn')?.addEventListener('click', closeModal);
  }, 100);
}
