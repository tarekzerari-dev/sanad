// ============================
// Admin - Memorization Management
// ============================

import { getStudents, updateStudent } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { openModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, SURAHS, calculateMemorizationProgress, formatDate, debounce } from '../../utils/helpers.js';

let searchQuery = '';

export function renderMemorizationPage() {
  const content = `
    <div class="page-header">
      <h2 style="font-size: var(--font-size-xl);">إدارة الحفظ والتقدم</h2>
    </div>

    <div class="search-filter-bar" style="margin-bottom: var(--space-6); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4);">
      <div class="search-box" style="flex: 1; min-width: 250px;">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <input type="text" id="mem-search" placeholder="ابحث عن طالب..." class="form-input">
      </div>
      <button class="btn btn-primary" id="btn-bulk-mem">
        <i data-lucide="users"></i>
        إضافة حفظ جماعي
      </button>
    </div>

    <div id="mem-students-list"></div>

    <div class="empty-state" id="mem-empty" style="display:none;">
      <div class="empty-icon"><i data-lucide="book-open"></i></div>
      <h3>لا يوجد طلبة</h3>
      <p>أضف طلبة أولاً من صفحة إدارة الطلبة</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/memorization', content);
  initAdminLayout();
  initIcons();

  renderMemList();

  document.getElementById('btn-bulk-mem')?.addEventListener('click', openBulkMemModal);

  document.getElementById('mem-search')?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value;
    renderMemList();
  }, 200));
}

function renderMemList() {
  let students = getStudents();
  const list = document.getElementById('mem-students-list');
  const emptyState = document.getElementById('mem-empty');

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    students = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q));
  }

  if (students.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  list.style.display = 'block';
  emptyState.style.display = 'none';

  list.innerHTML = students.map(s => {
    const progress = calculateMemorizationProgress(s.memorization);
    const lastEntry = s.memorization && s.memorization.length > 0
      ? [...s.memorization].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
      : null;

    return `
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-body" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
          <div style="display: flex; align-items: center; gap: var(--space-3);">
            ${renderAvatar(s.avatar, 'avatar-sm')}
            <div>
              <div style="font-weight: 600;">${s.firstName} ${s.lastName}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">
                ${lastEntry ? `آخر حفظ: سورة ${lastEntry.surah} (${formatDate(lastEntry.date)})` : 'لم يبدأ الحفظ بعد'}
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <div style="min-width: 120px;">
              <div class="progress-bar progress-bar-sm">
                <div class="progress-fill" style="width: ${progress}%;"></div>
              </div>
              <div style="font-size: var(--font-size-xs); color: var(--text-secondary); text-align: center; margin-top: 2px;">${progress}%</div>
            </div>
            <button class="btn btn-secondary btn-sm add-mem-btn" data-id="${s.id}">
              <i data-lucide="plus" style="width:14px;height:14px;"></i>
              إضافة حفظ
            </button>
            <button class="btn btn-ghost btn-sm view-mem-btn" data-id="${s.id}">
              <i data-lucide="eye" style="width:14px;height:14px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initIcons();

  // Add memorization buttons
  list.querySelectorAll('.add-mem-btn').forEach(btn => {
    btn.addEventListener('click', () => openAddMemModal(btn.dataset.id));
  });

  // View memorization
  list.querySelectorAll('.view-mem-btn').forEach(btn => {
    btn.addEventListener('click', () => openViewMemModal(btn.dataset.id));
  });
}

function openAddMemModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const body = `
    <form id="mem-form">
      <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-5);">
        إضافة حفظ جديد لـ <strong>${student.firstName} ${student.lastName}</strong>
      </p>
      <div class="form-group">
        <label class="form-label">السورة</label>
        <select id="mf-surah" class="form-select" required>
          ${SURAHS.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">من الآية</label>
          <input type="number" id="mf-from" class="form-input" min="1" value="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">إلى الآية</label>
          <input type="number" id="mf-to" class="form-input" min="1" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">التاريخ</label>
        <input type="date" id="mf-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
      </div>
      <div class="form-group">
        <label class="form-label">ملاحظات المعلم</label>
        <textarea id="mf-notes" class="form-textarea" placeholder="ملاحظات اختيارية..."></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-mem-btn">
      <i data-lucide="check"></i>
      حفظ
    </button>
    <button class="btn btn-ghost" id="cancel-mem-btn">إلغاء</button>
  `;

  openModal('إضافة حفظ جديد', body, footer);

  setTimeout(() => {
    initIcons();
    
    document.getElementById('save-mem-btn')?.addEventListener('click', () => {
      const surah = document.getElementById('mf-surah').value;
      const fromVerse = parseInt(document.getElementById('mf-from').value);
      const toVerse = parseInt(document.getElementById('mf-to').value);
      const date = document.getElementById('mf-date').value;
      const notes = document.getElementById('mf-notes').value.trim();

      if (!surah || !fromVerse || !toVerse || !date) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }

      if (toVerse < fromVerse) {
        showToast('رقم الآية الأخيرة يجب أن يكون أكبر من الأولى', 'error');
        return;
      }

      const newEntry = {
        surah,
        fromVerse,
        toVerse,
        versesCount: toVerse - fromVerse + 1,
        date,
        notes
      };

      const mem = [...(student.memorization || []), newEntry];
      updateStudent(studentId, { memorization: mem, lastUpdate: date });
      
      showToast(`تم إضافة حفظ ${toVerse - fromVerse + 1} آية من سورة ${surah} بنجاح`);
      closeModal();
      renderMemList();
    });

    document.getElementById('cancel-mem-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function openViewMemModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const entries = [...(student.memorization || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  const progress = calculateMemorizationProgress(student.memorization);

  const body = `
    <div style="text-align: center; margin-bottom: var(--space-5);">
      <div style="font-weight: 700; font-size: var(--font-size-lg); margin-bottom: var(--space-2);">${student.firstName} ${student.lastName}</div>
      <div class="progress-container" style="max-width: 300px; margin: 0 auto;">
        <div class="progress-label">
          <span class="label-text">نسبة الإنجاز</span>
          <span class="label-value">${progress}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%;"></div>
        </div>
      </div>
    </div>

    ${entries.length === 0 ? `
      <p style="text-align: center; color: var(--text-muted);">لم يبدأ الحفظ بعد</p>
    ` : `
      <div style="max-height: 400px; overflow-y: auto;">
        ${entries.map(e => `
          <div style="padding: var(--space-3); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: var(--font-size-sm);">سورة ${e.surah}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">الآيات ${e.fromVerse} — ${e.toVerse} (${e.versesCount} آية)</div>
              ${e.notes ? `<div style="font-size: var(--font-size-xs); color: var(--green-600); margin-top: 2px;">${e.notes}</div>` : ''}
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${formatDate(e.date)}</div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  openModal(`سجل الحفظ`, body);
}

function openBulkMemModal() {
  const students = getStudents();
  if (students.length === 0) {
    showToast('لا يوجد طلبة لإضافة الحفظ لهم', 'error');
    return;
  }

  const body = `
    <form id="bulk-mem-form">
      <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-5);">
        سيتم إضافة هذا الحفظ لجميع الطلبة المحددين في القائمة أدناه.
      </p>
      
      <div class="form-group">
        <label class="form-label">السورة</label>
        <select id="bmf-surah" class="form-select" required>
          ${SURAHS.map(s => `<option value="${s}">${s}</option>`).join('')}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">من الآية</label>
          <input type="number" id="bmf-from" class="form-input" min="1" value="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">إلى الآية</label>
          <input type="number" id="bmf-to" class="form-input" min="1" required>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">التاريخ</label>
        <input type="date" id="bmf-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
      </div>
      <div class="form-group">
        <label class="form-label">ملاحظات المعلم</label>
        <textarea id="bmf-notes" class="form-textarea" placeholder="ملاحظات اختيارية (ستضاف للجميع)..."></textarea>
      </div>
      
      <div class="form-group" style="margin-top: var(--space-6); border-top: 1px solid var(--border-color); padding-top: var(--space-4);">
        <label class="form-label" style="display: flex; justify-content: space-between;">
          <span>الطلبة المستهدفون</span>
          <label style="font-size: var(--font-size-xs); font-weight: normal; cursor: pointer;">
            <input type="checkbox" id="bmf-select-all" checked> تحديد الكل
          </label>
        </label>
        <div style="max-height: 200px; overflow-y: auto; background: var(--gray-50); padding: var(--space-3); border-radius: var(--border-radius-md); border: 1px solid var(--border-color);">
          ${students.map(s => `
            <label style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2); cursor: pointer;">
              <input type="checkbox" class="bmf-student-checkbox" value="${s.id}" checked>
              <span style="font-size: var(--font-size-sm);">${s.firstName} ${s.lastName}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-bulk-mem-btn">
      <i data-lucide="check"></i>
      حفظ للجميع
    </button>
    <button class="btn btn-ghost" id="cancel-bulk-mem-btn">إلغاء</button>
  `;

  openModal('إضافة حفظ جماعي', body, footer);

  setTimeout(() => {
    initIcons();
    
    // Select all logic
    const selectAllCb = document.getElementById('bmf-select-all');
    const studentCbs = document.querySelectorAll('.bmf-student-checkbox');
    
    if (selectAllCb) {
      selectAllCb.addEventListener('change', (e) => {
        studentCbs.forEach(cb => cb.checked = e.target.checked);
      });
    }

    // Individual checkboxes change logic to update "Select All" state
    studentCbs.forEach(cb => {
      cb.addEventListener('change', () => {
        const allChecked = Array.from(studentCbs).every(c => c.checked);
        if (selectAllCb) selectAllCb.checked = allChecked;
      });
    });

    document.getElementById('save-bulk-mem-btn')?.addEventListener('click', () => {
      const surah = document.getElementById('bmf-surah').value;
      const fromVerse = parseInt(document.getElementById('bmf-from').value);
      const toVerse = parseInt(document.getElementById('bmf-to').value);
      const date = document.getElementById('bmf-date').value;
      const notes = document.getElementById('bmf-notes').value.trim();

      const selectedIds = Array.from(document.querySelectorAll('.bmf-student-checkbox:checked')).map(cb => cb.value);

      if (selectedIds.length === 0) {
        showToast('يرجى تحديد طالب واحد على الأقل', 'error');
        return;
      }

      if (!surah || !fromVerse || !toVerse || !date) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
      }

      if (toVerse < fromVerse) {
        showToast('رقم الآية الأخيرة يجب أن يكون أكبر من الأولى', 'error');
        return;
      }

      const newEntry = {
        surah,
        fromVerse,
        toVerse,
        versesCount: toVerse - fromVerse + 1,
        date,
        notes
      };

      // Apply to all selected students
      let count = 0;
      students.forEach(student => {
        if (selectedIds.includes(student.id)) {
          const mem = [...(student.memorization || []), newEntry];
          updateStudent(student.id, { memorization: mem, lastUpdate: date });
          count++;
        }
      });
      
      showToast(`تم إضافة الحفظ لـ ${count} طالب/طالبة بنجاح`);
      closeModal();
      renderMemList();
    });

    document.getElementById('cancel-bulk-mem-btn')?.addEventListener('click', closeModal);
  }, 100);
}
