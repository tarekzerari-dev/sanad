// ============================================================
// سند — Admin Memorization & Progress (إدارة الحفظ والتقدم القرآني)
// ============================================================

import { getStudents, updateStudent } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { openModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, SURAHS, calculateMemorizationProgress, getMemorizedVersesCount, formatDate, getTodayStr, debounce, generateId, GROUPS, getLevelBadgeClass } from '../../utils/helpers.js';

let searchQuery = '';
let filterGroup = 'all';

export function renderMemorizationPage() {
  const content = `
    <!-- Page Header & Action Controls -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">متابعة الحفظ والتقدم القرآني</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          توثيق التسميع اليومي، رصد إتقان الآيات، وتقييم أحكام التلاوة والتجويد للطلبة
        </p>
      </div>

      <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
        <button class="btn btn-primary" id="btn-bulk-mem">
          <i data-lucide="users"></i>
          <span>إضافة تسميع جماعي للفوج</span>
        </button>
      </div>
    </div>

    <!-- Curriculum Overview Card (Surat Al-Mulk Focus) -->
    <div style="background: linear-gradient(145deg, #0f2c1c 0%, #1a4d2e 100%); color: #ffffff; border-radius: var(--border-radius-lg); padding: var(--space-5) var(--space-6); margin-bottom: var(--space-5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); box-shadow: var(--shadow-sm);">
      <div>
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 4px;">
          <span class="badge" style="background: var(--brass-500); color: #1e1706; font-weight: 700;">المنهج القرآني المعتمد</span>
          <span style="font-size: 12px; color: var(--brass-200);">30 آية كاملة</span>
        </div>
        <h3 style="font-family: var(--font-heading); font-size: 1.4rem; color: #ffffff; margin: 0;">
          سورة الملك — تلاوة وتجويداً وحفظاً
        </h3>
        <p style="font-size: var(--font-size-xs); color: rgba(255, 255, 255, 0.8); margin-top: 4px;">
          الهدف المرحلي لحلقات المدرسة: تثبيت السورة وإتقان أحكام النون الساكنة والتنوين والميم الساكنة.
        </p>
      </div>

      <div id="curriculum-stats-box" style="display: flex; gap: var(--space-5); text-align: center;">
        <!-- Injected via JavaScript -->
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-4); margin-bottom: var(--space-5); box-shadow: var(--shadow-xs); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3);">
      <div class="search-box" style="flex: 1.2; min-width: 250px;">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <input type="text" id="mem-search" placeholder="ابحث باسم الطالب..." class="form-input">
      </div>

      <div style="min-width: 170px;">
        <select id="mem-group-filter" class="form-select" style="padding-top: 8px; padding-bottom: 8px;">
          <option value="all">كافة الأفواج</option>
          ${GROUPS.map(g => `<option value="${g}">${g}</option>`).join('')}
        </select>
      </div>
    </div>

    <!-- Student Memorization List Container -->
    <div id="mem-students-list" style="display: flex; flex-direction: column; gap: var(--space-4);"></div>

    <!-- Empty State -->
    <div class="empty-state" id="mem-empty" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
      <div class="empty-icon"><i data-lucide="book-open"></i></div>
      <h3>لم يتم العثور على أي طالب</h3>
      <p>لا توجد نتائج تطابق معايير البحث المحددة.</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/memorization', content);
  initAdminLayout();
  initIcons();

  renderMemList();
  initMemEvents();
}

function renderMemList() {
  const allStudents = getStudents();
  let students = [...allStudents];
  const listContainer = document.getElementById('mem-students-list');
  const emptyState = document.getElementById('mem-empty');

  // Filters
  if (filterGroup !== 'all') {
    students = students.filter(s => s.group === filterGroup);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    students = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q));
  }

  // Update curriculum stats
  const statsBox = document.getElementById('curriculum-stats-box');
  if (statsBox) {
    const totalVersesAll = allStudents.reduce((sum, s) => sum + getMemorizedVersesCount(s.memorization), 0);
    const completedStudents = allStudents.filter(s => calculateMemorizationProgress(s.memorization) >= 100).length;
    statsBox.innerHTML = `
      <div style="background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: var(--border-radius-md);">
        <div style="font-size: 11px; color: var(--brass-200);">إجمالي الآيات المسمعة</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #ffffff;">${totalVersesAll}</div>
      </div>
      <div style="background: rgba(255, 255, 255, 0.1); padding: 8px 16px; border-radius: var(--border-radius-md);">
        <div style="font-size: 11px; color: var(--brass-200);">أتموا سورة الملك</div>
        <div style="font-size: 1.5rem; font-weight: 700; color: #ffffff;">${completedStudents}</div>
      </div>
    `;
  }

  if (students.length === 0) {
    if (listContainer) listContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  listContainer.innerHTML = students.map(s => {
    const progress = calculateMemorizationProgress(s.memorization);
    const versesCount = getMemorizedVersesCount(s.memorization);
    const memHistory = [...(s.memorization || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    const lastSession = memHistory[0] || null;

    return `
      <div class="card card-interactive" style="padding: var(--space-5);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: var(--space-4);">
          
          <!-- Student Identity -->
          <div style="display: flex; align-items: center; gap: var(--space-4); min-width: 240px;">
            ${renderAvatar(s.avatar, 'avatar-md')}
            <div>
              <div style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">
                ${s.firstName} ${s.lastName}
              </div>
              <div style="display: flex; gap: var(--space-2); align-items: center; margin-top: 2px;">
                <span class="badge ${getLevelBadgeClass(s.level)}" style="font-size: 10px;">${s.level}</span>
                <span style="font-size: 11px; color: var(--text-muted);">${s.group}</span>
                <span style="font-size: 11px; color: var(--text-muted);">${s.age} سنوات</span>
              </div>
            </div>
          </div>

          <!-- Progress In Surah Al-Mulk -->
          <div style="flex: 1; min-width: 260px; max-width: 380px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 12px; font-weight: 700; color: var(--emerald-900);">
                سورة الملك (الآيات: ${Math.min(versesCount, 30)} / 30)
              </span>
              <span style="font-size: 12px; font-weight: 800; color: var(--emerald-800);">${progress}%</span>
            </div>
            <div class="progress-bar progress-bar-md" style="height: 10px; background: var(--border-subtle);">
              <div class="progress-fill" style="width: ${progress}%; background: linear-gradient(90deg, var(--emerald-700), var(--emerald-500));"></div>
            </div>
            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px; display: flex; justify-content: space-between;">
              <span>بداية السورة (آية 1)</span>
              <span>ختام السورة (آية 30)</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: var(--space-2); align-items: center;">
            <button class="btn btn-secondary btn-sm add-single-mem-btn" data-id="${s.id}">
              <i data-lucide="plus"></i>
              <span>تسجيل تسميع</span>
            </button>
            <button class="btn btn-ghost btn-sm view-mem-history-btn" data-id="${s.id}" title="عرض السجل التاريخي للتسميع">
              <i data-lucide="history"></i>
              <span>السجل (${memHistory.length})</span>
            </button>
          </div>

        </div>

        <!-- Last Recitation Context Pill -->
        ${lastSession ? `
          <div style="margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-2); font-size: 12px;">
            <div style="display: flex; align-items: center; gap: var(--space-2); color: var(--text-secondary);">
              <i data-lucide="check-circle" style="width: 14px; height: 14px; color: var(--emerald-700);"></i>
              <span>آخر تسميع: <strong>سورة ${lastSession.surah || 'الملك'}</strong></span>
              <span>•</span>
              <span>الآيات: <strong>${lastSession.versesText || (lastSession.fromVerse + ' - ' + lastSession.toVerse)}</strong></span>
              <span>•</span>
              <span style="color: var(--text-muted);">${formatDate(lastSession.date)}</span>
            </div>
            ${lastSession.evaluation ? `
              <span class="badge ${lastSession.evaluation.includes('ممتاز') ? 'badge-green' : 'badge-gold'}" style="font-size: 10px;">
                ${lastSession.evaluation}
              </span>
            ` : ''}
          </div>
        ` : `
          <div style="margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px solid var(--border-subtle); font-size: 11px; color: var(--text-muted);">
            لم يتم تسجيل أي حصة تسميع سابقة لهذا الطالب بعد.
          </div>
        `}
      </div>
    `;
  }).join('');

  initIcons();

  // Attach Add Single Mem Handlers
  listContainer.querySelectorAll('.add-single-mem-btn').forEach(btn => {
    btn.addEventListener('click', () => openAddMemModal(btn.dataset.id));
  });

  // Attach History Handlers
  listContainer.querySelectorAll('.view-mem-history-btn').forEach(btn => {
    btn.addEventListener('click', () => openMemHistoryModal(btn.dataset.id));
  });
}

function initMemEvents() {
  const searchInput = document.getElementById('mem-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      searchQuery = e.target.value;
      renderMemList();
    }, 200));
  }

  document.getElementById('mem-group-filter')?.addEventListener('change', (e) => {
    filterGroup = e.target.value;
    renderMemList();
  });

  document.getElementById('btn-bulk-mem')?.addEventListener('click', openBulkMemModal);
}

// === Single Student Memorization Modal ===
function openAddMemModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const today = getTodayStr();

  const body = `
    <form id="single-mem-form">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); background: var(--bg-canvas); padding: var(--space-3); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle);">
        ${renderAvatar(student.avatar, 'avatar-sm')}
        <div>
          <div style="font-weight: 700; color: var(--text-primary);">${student.firstName} ${student.lastName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${student.group} • ${student.level}</div>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">السورة الكريمة</label>
          <select id="smf-surah" class="form-select">
            ${SURAHS.map(s => `<option value="${s}" ${s === 'الملك' ? 'selected' : ''}>سورة ${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الحصة</label>
          <input type="date" id="smf-date" class="form-input" value="${today}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">من الآية رقم</label>
          <input type="number" id="smf-from" class="form-input" min="1" max="286" value="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">إلى الآية رقم</label>
          <input type="number" id="smf-to" class="form-input" min="1" max="286" value="10" required>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">تقييم الأداء والتجويد</label>
        <select id="smf-eval" class="form-select">
          <option value="ممتاز — متقن للأحكام">ممتاز — متقن للأحكام والتلاوة</option>
          <option value="جيد جداً">جيد جداً — مع ملاحظات يسيرة</option>
          <option value="جيد">جيد</option>
          <option value="مقبول — يحتاج تثبيت">مقبول — يحتاج إعادة وتثبيت</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">ملاحظات الشيخ والموجه التربوي</label>
        <textarea id="smf-notes" class="form-textarea" placeholder="مثال: مخارج الحروف ممتازة، مراجعة إخفاء النون الساكنة..."></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-single-mem-btn">
      <i data-lucide="check"></i>
      <span>اعتماد وتوثيق التسميع</span>
    </button>
    <button class="btn btn-ghost" id="cancel-single-mem-btn">إلغاء</button>
  `;

  openModal(`تسجيل تسميع: ${student.firstName} ${student.lastName}`, body, footer);

  setTimeout(() => {
    initIcons();

    document.getElementById('save-single-mem-btn')?.addEventListener('click', () => {
      const surah = document.getElementById('smf-surah').value;
      const date = document.getElementById('smf-date').value;
      const fromVerse = parseInt(document.getElementById('smf-from').value);
      const toVerse = parseInt(document.getElementById('smf-to').value);
      const evaluation = document.getElementById('smf-eval').value;
      const notes = document.getElementById('smf-notes').value.trim();

      if (isNaN(fromVerse) || isNaN(toVerse) || toVerse < fromVerse) {
        showToast('يرجى التأكد من صحة أرقام الآيات', 'error');
        return;
      }

      const versesCount = toVerse - fromVerse + 1;
      const newEntry = {
        id: generateId(),
        date,
        surah,
        fromVerse,
        toVerse,
        versesText: `${fromVerse} - ${toVerse}`,
        versesCount,
        evaluation,
        notes
      };

      const updatedMem = [...(student.memorization || []), newEntry];
      updateStudent(student.id, { memorization: updatedMem, lastUpdate: date });

      showToast(`تم توثيق حفظ ${versesCount} آيات للطالب ${student.firstName} بنجاح`);
      closeModal();
      renderMemList();
    });

    document.getElementById('cancel-single-mem-btn')?.addEventListener('click', closeModal);
  }, 100);
}

// === Bulk Group Memorization Modal ===
function openBulkMemModal() {
  const students = getStudents();

  const body = `
    <form id="bulk-mem-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">السورة الكريمة</label>
          <select id="bmf-surah" class="form-select">
            ${SURAHS.map(s => `<option value="${s}" ${s === 'الملك' ? 'selected' : ''}>سورة ${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">تاريخ الحصة المشتركة</label>
          <input type="date" id="bmf-date" class="form-input" value="${getTodayStr()}">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">من الآية</label>
          <input type="number" id="bmf-from" class="form-input" min="1" max="286" value="1" required>
        </div>
        <div class="form-group">
          <label class="form-label">إلى الآية</label>
          <input type="number" id="bmf-to" class="form-input" min="1" max="286" value="10" required>
        </div>
      </div>

      <div class="form-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label class="form-label" style="margin: 0;">حدد الطلبة الحاضرين في الحلقة:</label>
          <div style="display: flex; gap: var(--space-2);">
            <button type="button" class="btn btn-ghost btn-sm" id="bmf-select-all" style="font-size: 11px; padding: 2px 8px;">تحديد الكل</button>
            <button type="button" class="btn btn-ghost btn-sm" id="bmf-deselect-all" style="font-size: 11px; padding: 2px 8px;">إلغاء الكل</button>
          </div>
        </div>

        <div style="max-height: 220px; overflow-y: auto; border: 1.5px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-2); background: var(--bg-surface);">
          ${students.map(s => `
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; border-radius: var(--border-radius-sm); cursor: pointer; border-bottom: 1px solid var(--border-subtle);" class="hover-bg">
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <input type="checkbox" class="bmf-student-checkbox" value="${s.id}" checked>
                <span style="font-size: var(--font-size-sm); font-weight: 600;">${s.firstName} ${s.lastName}</span>
              </div>
              <span class="badge badge-gray" style="font-size: 10px;">${s.group}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">ملاحظات مشتركة للحلقة</label>
        <textarea id="bmf-notes" class="form-textarea" placeholder="مثال: تسميع جماعي متقن مع تطبيق أحكام الميم الساكنة..."></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-bulk-mem-btn">
      <i data-lucide="check-check"></i>
      <span>تسجيل الحفظ لجميع الطلبة المحددين</span>
    </button>
    <button class="btn btn-ghost" id="cancel-bulk-mem-btn">إلغاء</button>
  `;

  openModal('إضافة حفظ وتسميع جماعي للحلقة', body, footer);

  setTimeout(() => {
    initIcons();

    // Select/Deselect handlers
    document.getElementById('bmf-select-all')?.addEventListener('click', () => {
      document.querySelectorAll('.bmf-student-checkbox').forEach(cb => cb.checked = true);
    });
    document.getElementById('bmf-deselect-all')?.addEventListener('click', () => {
      document.querySelectorAll('.bmf-student-checkbox').forEach(cb => cb.checked = false);
    });

    // Save
    document.getElementById('save-bulk-mem-btn')?.addEventListener('click', () => {
      const surah = document.getElementById('bmf-surah').value;
      const date = document.getElementById('bmf-date').value;
      const fromVerse = parseInt(document.getElementById('bmf-from').value);
      const toVerse = parseInt(document.getElementById('bmf-to').value);
      const notes = document.getElementById('bmf-notes').value.trim();

      const selectedCheckboxes = Array.from(document.querySelectorAll('.bmf-student-checkbox:checked'));
      const selectedIds = selectedCheckboxes.map(cb => cb.value);

      if (selectedIds.length === 0) {
        showToast('يرجى تحديد طالب واحد على الأقل', 'error');
        return;
      }

      if (isNaN(fromVerse) || isNaN(toVerse) || toVerse < fromVerse) {
        showToast('يرجى التأكد من صحة أرقام الآيات', 'error');
        return;
      }

      const versesCount = toVerse - fromVerse + 1;
      const newEntry = {
        id: generateId(),
        date,
        surah,
        fromVerse,
        toVerse,
        versesText: `${fromVerse} - ${toVerse}`,
        versesCount,
        evaluation: 'جيد — تسميع جماعي',
        notes
      };

      let count = 0;
      students.forEach(st => {
        if (selectedIds.includes(st.id)) {
          const updatedMem = [...(st.memorization || []), { ...newEntry, id: generateId() }];
          updateStudent(st.id, { memorization: updatedMem, lastUpdate: date });
          count++;
        }
      });

      showToast(`تم توثيق الحفظ لـ ${count} طالب وطالبة بنجاح! 🎉`);
      closeModal();
      renderMemList();
    });

    document.getElementById('cancel-bulk-mem-btn')?.addEventListener('click', closeModal);
  }, 100);
}

// === Memorization History Timeline Modal ===
function openMemHistoryModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const history = [...(student.memorization || [])].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const body = `
    <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4); background: var(--bg-canvas); padding: var(--space-3); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle);">
      ${renderAvatar(student.avatar, 'avatar-sm')}
      <div>
        <div style="font-weight: 700; color: var(--text-primary);">${student.firstName} ${student.lastName}</div>
        <div style="font-size: 11px; color: var(--text-muted);">${student.group} • التقدم: ${calculateMemorizationProgress(student.memorization)}%</div>
      </div>
    </div>

    ${history.length === 0 ? `
      <div style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
        لا توجد جلسات تسميع مسجلة في التاريخ لهذا الطالب.
      </div>
    ` : `
      <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-3);">
        ${history.map(item => `
          <div style="padding: var(--space-3) var(--space-4); background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 700; color: var(--emerald-900); font-size: var(--font-size-sm);">سورة ${item.surah || 'الملك'}</span>
              <span style="font-size: 11px; color: var(--text-muted);">${formatDate(item.date)}</span>
            </div>
            <div style="font-size: var(--font-size-xs); color: var(--text-secondary); display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap;">
              <span>الآيات: <strong>${item.versesText || (item.fromVerse + ' - ' + item.toVerse)}</strong> (${item.versesCount || 0} آية)</span>
              ${item.evaluation ? `<span>•</span> <span class="badge badge-green" style="font-size: 10px;">${item.evaluation}</span>` : ''}
            </div>
            ${item.notes ? `
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px; padding-top: 4px; border-top: 1px dashed var(--border-subtle);">
                ${item.notes}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `}
  `;

  openModal(`سجل التسميع التاريخي: ${student.firstName} ${student.lastName}`, body);
}
