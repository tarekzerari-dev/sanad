// ============================================================
// سند — Admin Manage Journal & Schedule (اليوميات والبرنامج الأسبوعي)
// ============================================================

import { getJournalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry, getWeeklySchedule, setWeeklySchedule, getAttendanceForDate, getStudents } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { openModal, closeModal, confirmDialog } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, generateId, formatDate, getTodayStr, GROUPS } from '../../utils/helpers.js';

let adminJournalFilter = 'all'; // 'all' | 'active' | 'archived'
let activeTab = 'journal'; // 'journal' | 'schedule'

export function renderManageJournalPage() {
  const content = `
    <!-- Page Header & Action Controls -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">يوميات المدرسة والبرنامج التعليمي</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          تدوين تفاصيل الدروس اليومية، أحكام التجويد الملقنة، ومتابعة الرزنامة الأسبوعية للحلقات
        </p>
      </div>

      <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
        <button class="btn btn-secondary btn-sm" id="edit-schedule-btn">
          <i data-lucide="calendar"></i>
          <span>تعديل الرزنامة الأسبوعية</span>
        </button>
        <button class="btn btn-primary" id="add-entry-btn">
          <i data-lucide="plus"></i>
          <span>تدوين حصة جديدة</span>
        </button>
      </div>
    </div>

    <!-- View Mode Tabs (Journal vs Schedule) -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-5); flex-wrap: wrap; gap: var(--space-3);">
      
      <!-- Primary Tabs -->
      <div style="display: flex; gap: var(--space-2); background: var(--bg-surface); padding: 4px; border-radius: var(--border-radius-md); border: 1px solid var(--border-color);">
        <button class="btn btn-sm ${activeTab === 'journal' ? 'btn-primary' : 'btn-ghost'}" id="tab-journal-btn" style="border-radius: var(--border-radius-sm);">
          <i data-lucide="book-open"></i>
          <span>دفتر اليوميات</span>
        </button>
        <button class="btn btn-sm ${activeTab === 'schedule' ? 'btn-primary' : 'btn-ghost'}" id="tab-schedule-btn" style="border-radius: var(--border-radius-sm);">
          <i data-lucide="calendar-days"></i>
          <span>الرزنامة والتوقيت</span>
        </button>
      </div>

      <!-- Journal Sub-filters (Visible when Journal Tab is active) -->
      <div id="journal-filters-bar" style="display: ${activeTab === 'journal' ? 'flex' : 'none'}; gap: var(--space-2); align-items: center;">
        <span style="font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">الحالة:</span>
        <div class="filter-chips" id="admin-journal-filters">
          <button class="filter-chip ${adminJournalFilter === 'all' ? 'active' : ''}" data-filter="all">الكل</button>
          <button class="filter-chip ${adminJournalFilter === 'active' ? 'active' : ''}" data-filter="active">الجارية</button>
          <button class="filter-chip ${adminJournalFilter === 'archived' ? 'active' : ''}" data-filter="archived">المؤرشفة</button>
        </div>
      </div>

    </div>

    <!-- Journal Section View -->
    <div id="journal-section-view" style="display: ${activeTab === 'journal' ? 'block' : 'none'};">
      <div id="admin-entries-list" style="display: flex; flex-direction: column; gap: var(--space-5);"></div>

      <div class="empty-state" id="journal-empty" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
        <div class="empty-icon"><i data-lucide="book-open"></i></div>
        <h3>لا توجد مدونات مسجلة</h3>
        <p>اضغط على "تدوين حصة جديدة" لتوثيق مجريات الحصة اليومية.</p>
      </div>
    </div>

    <!-- Weekly Schedule Section View -->
    <div id="schedule-section-view" style="display: ${activeTab === 'schedule' ? 'block' : 'none'};">
      <div class="card" style="padding: var(--space-5);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
            <i data-lucide="calendar" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
            <span>الجدول الزمني الأسبوعي لحلقات القرآن الكريم</span>
          </h3>
          <span class="badge badge-green">الموسم الدراسي الحالي</span>
        </div>
        <div id="schedule-grid-container"></div>
      </div>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/journal', content);
  initAdminLayout();
  initIcons();

  renderAdminEntriesList();
  renderAdminScheduleGrid();
  initJournalEvents();
}

function renderAdminEntriesList() {
  const allEntries = getJournalEntries();
  let entries = [...allEntries];
  const listContainer = document.getElementById('admin-entries-list');
  const emptyState = document.getElementById('journal-empty');

  if (adminJournalFilter === 'active') {
    entries = entries.filter(e => !e.archived);
  } else if (adminJournalFilter === 'archived') {
    entries = entries.filter(e => e.archived);
  }

  if (entries.length === 0) {
    if (listContainer) listContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  const allStudents = getStudents();

  listContainer.innerHTML = entries.map(entry => {
    const attData = getAttendanceForDate(entry.date);
    let presentCount = 0;
    Object.values(attData).forEach(st => {
      if (st === 'present') presentCount++;
    });

    return `
      <div class="card" style="border: 1px solid var(--border-color); ${entry.archived ? 'opacity: 0.85;' : ''}">
        
        <!-- Card Header -->
        <div class="card-header" style="background: var(--bg-canvas);">
          <div style="display: flex; align-items: center; gap: var(--space-3); flex-wrap: wrap;">
            <span class="badge badge-green" style="font-size: 11px;">
              <i data-lucide="calendar"></i>
              ${formatDate(entry.date)}
            </span>
            <span class="badge badge-gray" style="font-size: 11px;">
              ${entry.group}
            </span>
            ${entry.archived ? `
              <span class="badge badge-gold" style="font-size: 10px;">
                <i data-lucide="archive"></i>
                مؤرشفة
              </span>
            ` : `
              <span class="badge" style="background: #eaf6ee; color: var(--emerald-800); font-size: 10px;">
                حصة نشطة
              </span>
            `}
          </div>

          <div class="actions">
            <button class="btn btn-ghost btn-sm btn-icon edit-entry-btn" data-id="${entry.id}" title="تعديل المدونة">
              <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon toggle-archive-btn" data-id="${entry.id}" title="${entry.archived ? 'استعادة من الأرشيف' : 'أرشفة الحصة'}">
              <i data-lucide="${entry.archived ? 'archive-restore' : 'archive'}" style="width: 15px; height: 15px;"></i>
            </button>
            <button class="btn btn-ghost btn-sm btn-icon delete-entry-btn" data-id="${entry.id}" title="حذف" style="color: var(--danger);">
              <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
            </button>
          </div>
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <h3 style="font-family: var(--font-heading); font-size: 1.3rem; color: var(--emerald-950); margin-bottom: var(--space-3);">
            ${entry.title}
          </h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
            
            <!-- Memorization Component -->
            <div style="background: var(--bg-canvas); padding: var(--space-4); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: var(--font-size-xs); color: var(--emerald-900); margin-bottom: 6px;">
                <i data-lucide="book-open" style="width: 15px; height: 15px; color: var(--emerald-700);"></i>
                <span>الحفظ والتلاوة المقررة</span>
              </div>
              <div class="reading-content" style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                ${entry.memorizationText || '—'}
              </div>
            </div>

            <!-- Tajweed Component -->
            <div style="background: var(--bg-canvas); padding: var(--space-4); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle);">
              <div style="display: flex; align-items: center; gap: 6px; font-weight: 700; font-size: var(--font-size-xs); color: var(--brass-700); margin-bottom: 6px;">
                <i data-lucide="mic-2" style="width: 15px; height: 15px; color: var(--brass-600);"></i>
                <span>أحكام التجويد والتطبيق</span>
              </div>
              <div class="reading-content" style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                ${entry.tajweedText || '—'}
              </div>
            </div>

          </div>

          <!-- Classroom Activities & Observations -->
          ${entry.activitiesText ? `
            <div style="margin-bottom: var(--space-3); font-size: var(--font-size-xs); color: var(--text-secondary);">
              <strong>الأنشطة الصفية والملاحظات:</strong> ${entry.activitiesText}
            </div>
          ` : ''}

          <!-- Homework / Assignment -->
          ${entry.homeworkText ? `
            <div style="background: var(--brass-50); border: 1px solid var(--brass-200); border-radius: var(--border-radius-sm); padding: 8px 12px; font-size: 12px; color: var(--brass-800); display: flex; align-items: center; gap: var(--space-2);">
              <i data-lucide="check-square" style="width: 15px; height: 15px; color: var(--brass-600);"></i>
              <span><strong>الواجب والتكليف المنزلي:</strong> ${entry.homeworkText}</span>
            </div>
          ` : ''}
        </div>

        <!-- Card Footer (Attendance Link) -->
        <div class="card-footer" style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: var(--text-muted);">
          <div style="display: flex; align-items: center; gap: 6px;">
            <i data-lucide="users" style="width: 14px; height: 14px; color: var(--emerald-700);"></i>
            <span>الحضور الموثق في هذه الحصة: <strong>${presentCount} طالب</strong></span>
          </div>
          <a href="#/admin/attendance" style="font-weight: 600; color: var(--emerald-800);">فتح سجل الحضور لهذا اليوم &larr;</a>
        </div>

      </div>
    `;
  }).join('');

  initIcons();

  // Attach Action Handlers
  listContainer.querySelectorAll('.edit-entry-btn').forEach(btn => {
    btn.addEventListener('click', () => openEntryModal(btn.dataset.id));
  });

  listContainer.querySelectorAll('.toggle-archive-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const entry = allEntries.find(e => e.id === btn.dataset.id);
      if (entry) {
        updateJournalEntry(entry.id, { archived: !entry.archived });
        showToast(entry.archived ? 'تمت استعادة الحصة من الأرشيف' : 'تمت أرشفة الحصة بنجاح');
        renderAdminEntriesList();
      }
    });
  });

  listContainer.querySelectorAll('.delete-entry-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDialog('هل أنت متأكد من حذف هذه الحصة اليومية نهائياً؟', () => {
        deleteJournalEntry(btn.dataset.id);
        showToast('تم حذف المدونة بنجاح');
        renderAdminEntriesList();
      });
    });
  });
}

function renderAdminScheduleGrid() {
  const schedule = getWeeklySchedule();
  const container = document.getElementById('schedule-grid-container');
  if (!container) return;

  container.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 140px;">اليوم</th>
            <th style="width: 160px;">التوقيت</th>
            <th style="width: 140px;">الفوج</th>
            <th>النشاط والمقرر المعتمد</th>
          </tr>
        </thead>
        <tbody>
          ${schedule.map(item => `
            <tr>
              <td style="font-weight: 700; color: var(--emerald-950);">${item.day}</td>
              <td style="font-size: var(--font-size-xs); font-weight: 600; color: var(--text-secondary);">${item.time}</td>
              <td><span class="badge badge-gray" style="font-size: 11px;">${item.fawj}</span></td>
              <td style="font-size: var(--font-size-sm); color: var(--text-primary);">${item.activity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function initJournalEvents() {
  document.getElementById('add-entry-btn')?.addEventListener('click', () => openEntryModal());
  document.getElementById('edit-schedule-btn')?.addEventListener('click', openScheduleModal);

  // Tab switching
  const tabJournal = document.getElementById('tab-journal-btn');
  const tabSchedule = document.getElementById('tab-schedule-btn');
  const viewJournal = document.getElementById('journal-section-view');
  const viewSchedule = document.getElementById('schedule-section-view');
  const filtersBar = document.getElementById('journal-filters-bar');

  tabJournal?.addEventListener('click', () => {
    activeTab = 'journal';
    tabJournal.className = 'btn btn-sm btn-primary';
    tabSchedule.className = 'btn btn-sm btn-ghost';
    viewJournal.style.display = 'block';
    viewSchedule.style.display = 'none';
    if (filtersBar) filtersBar.style.display = 'flex';
  });

  tabSchedule?.addEventListener('click', () => {
    activeTab = 'schedule';
    tabSchedule.className = 'btn btn-sm btn-primary';
    tabJournal.className = 'btn btn-sm btn-ghost';
    viewJournal.style.display = 'none';
    viewSchedule.style.display = 'block';
    if (filtersBar) filtersBar.style.display = 'none';
  });

  // Filters
  document.querySelectorAll('#admin-journal-filters .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#admin-journal-filters .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      adminJournalFilter = chip.dataset.filter;
      renderAdminEntriesList();
    });
  });
}

function openEntryModal(entryId = null) {
  const existing = entryId ? getJournalEntries().find(e => e.id === entryId) : null;
  const isEdit = !!existing;
  const title = isEdit ? 'تعديل مدونة الحصة' : 'تدوين حصة تعليمية جديدة';

  const defaultDate = existing?.date || getTodayStr();
  const defaultGroup = existing?.group || 'الفوج 1';

  const body = `
    <form id="journal-entry-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">عنوان الحصة <span style="color:var(--danger)">*</span></label>
          <input type="text" id="jef-title" class="form-input" value="${existing?.title || ''}" placeholder="مثال: حصة الأحد 16 أوت — سورة الملك" required>
        </div>
        <div class="form-group">
          <label class="form-label">الفوج المستهدف</label>
          <select id="jef-group" class="form-select">
            ${GROUPS.map(g => `<option value="${g}" ${defaultGroup === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">تاريخ الحصة</label>
        <input type="date" id="jef-date" class="form-input" value="${defaultDate}" required>
      </div>

      <div class="form-group">
        <label class="form-label">ما تم حفظه وتسميعه في الحصة</label>
        <textarea id="jef-memorization" class="form-textarea" placeholder="مثال: مراجعة الآيات 1 إلى 24 وتسميع الآيات 25 إلى 30 من سورة الملك...">${existing?.memorizationText || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">أحكام التجويد ومخارج الحروف المدروسة</label>
        <textarea id="jef-tajweed" class="form-textarea" placeholder="مثال: تطبيقات عملية لأحكام الميم الساكنة (الإدغام الشفوي والإخفاء)...">${existing?.tajweedText || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">الأنشطة الصفية والملاحظات التربوية</label>
        <textarea id="jef-activities" class="form-textarea" placeholder="مثال: تلاوة فردية للطلبة مع تصحيح المخارج ومسابقات تشجيعية...">${existing?.activitiesText || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="form-label">الواجب والتكليف المنزلي</label>
        <input type="text" id="jef-homework" class="form-input" value="${existing?.homeworkText || ''}" placeholder="مثال: حفظ وتثبيت سورة الملك استعداداً للاختبار القادم">
      </div>

      <div class="form-group">
        <label style="display: flex; align-items: center; gap: var(--space-2); cursor: pointer; font-size: var(--font-size-sm);">
          <input type="checkbox" id="jef-archived" ${existing?.archived ? 'checked' : ''}>
          <span>أرشفة هذه الحصة (إخفاؤها من الواجهة الرئيسية لليوميات الجارية)</span>
        </label>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-journal-entry-btn">
      <i data-lucide="check"></i>
      <span>${isEdit ? 'حفظ التعديلات' : 'نشر وتوثيق الحصة'}</span>
    </button>
    <button class="btn btn-ghost" id="cancel-journal-entry-btn">إلغاء</button>
  `;

  openModal(title, body, footer);

  setTimeout(() => {
    initIcons();

    document.getElementById('save-journal-entry-btn')?.addEventListener('click', () => {
      const titleVal = document.getElementById('jef-title').value.trim();
      const group = document.getElementById('jef-group').value;
      const date = document.getElementById('jef-date').value;
      const memorizationText = document.getElementById('jef-memorization').value.trim();
      const tajweedText = document.getElementById('jef-tajweed').value.trim();
      const activitiesText = document.getElementById('jef-activities').value.trim();
      const homeworkText = document.getElementById('jef-homework').value.trim();
      const archived = document.getElementById('jef-archived').checked;

      if (!titleVal || !date) {
        showToast('يرجى كتابة عنوان وتاريخ الحصة', 'error');
        return;
      }

      if (isEdit) {
        updateJournalEntry(entryId, { title: titleVal, group, date, memorizationText, tajweedText, activitiesText, homeworkText, archived });
        showToast('تم تحديث المدونة اليومية بنجاح');
      } else {
        const newEntry = {
          id: generateId(),
          title: titleVal,
          group,
          date,
          memorizationText,
          tajweedText,
          activitiesText,
          homeworkText,
          archived,
          createdAt: new Date().toISOString()
        };
        addJournalEntry(newEntry);
        showToast('تم نشر وتوثيق الحصة بنجاح في اليوميات');
      }

      closeModal();
      renderAdminEntriesList();
    });

    document.getElementById('cancel-journal-entry-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function openScheduleModal() {
  const schedule = getWeeklySchedule();

  const body = `
    <form id="schedule-edit-form">
      <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
        يمكنك تعديل توقيت وأنشطة كل يوم من أيام الأسبوع في البرنامج المعتمد للمدرسة:
      </p>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);" id="schedule-rows-wrapper">
        ${schedule.map((item, idx) => `
          <div class="schedule-item-row" style="background: var(--bg-canvas); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-3);">
            <div class="form-row" style="margin-bottom: var(--space-2);">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 11px;">اليوم</label>
                <input type="text" class="form-input sch-day" value="${item.day}" required style="padding: 6px 10px; font-weight: 700;">
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 11px;">التوقيت</label>
                <input type="text" class="form-input sch-time" value="${item.time}" required style="padding: 6px 10px;">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 11px;">الفوج المستهدف</label>
                <input type="text" class="form-input sch-fawj" value="${item.fawj || 'الفوج 1'}" required style="padding: 6px 10px;">
              </div>
              <div class="form-group" style="margin: 0;">
                <label class="form-label" style="font-size: 11px;">النشاط والمقرر المعتمد</label>
                <input type="text" class="form-input sch-activity" value="${item.activity}" required style="padding: 6px 10px;">
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-schedule-btn">
      <i data-lucide="check"></i>
      <span>حفظ التعديلات في الرزنامة</span>
    </button>
    <button class="btn btn-ghost" id="cancel-schedule-btn">إلغاء</button>
  `;

  openModal('تعديل الرزنامة والجدول الأسبوعي', body, footer);

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
