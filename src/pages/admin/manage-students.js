// ============================================================
// سند — Admin Manage Students (إدارة شؤون الطلبة)
// ============================================================

import { getStudents, addStudent, updateStudent, deleteStudent, getStudentPoints } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar, renderAvatarSelector } from '../../utils/avatars.js';
import { openModal, closeModal, confirmDialog } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, generateId, LEVELS, GROUPS, debounce, getLevelBadgeClass, calculateMemorizationProgress } from '../../utils/helpers.js';

let searchQuery = '';
let filterGender = 'all';
let filterGroup = 'all';
let filterLevel = 'all';

export function renderManageStudentsPage() {
  const content = `
    <!-- Page Header & Action -->
    <div class="page-header">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">إدارة سجلات الطلبة</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          تسجيل، تعديل، ومتابعة البيانات الشخصية والمجموعات والمستويات لكافة طلبة المدرسة القرآنية
        </p>
      </div>
      <button class="btn btn-primary" id="add-student-btn">
        <i data-lucide="user-plus"></i>
        <span>تسجيل طالب جديد</span>
      </button>
    </div>

    <!-- Multifaceted Search & Filter Panel -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-4); margin-bottom: var(--space-5); box-shadow: var(--shadow-xs);">
      <div style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; justify-content: space-between;">
        
        <!-- Search Input -->
        <div class="search-box" style="flex: 1.2; min-width: 260px;">
          <span class="search-icon"><i data-lucide="search"></i></span>
          <input type="text" id="admin-student-search" placeholder="ابحث باسم الطالب أو لقبه..." class="form-input">
        </div>

        <!-- Group Filter Dropdown -->
        <div style="min-width: 150px;">
          <select id="admin-group-filter" class="form-select" style="padding-top: 8px; padding-bottom: 8px;">
            <option value="all">كافة الأفواج</option>
            ${GROUPS.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
        </div>

        <!-- Level Filter Dropdown -->
        <div style="min-width: 150px;">
          <select id="admin-level-filter" class="form-select" style="padding-top: 8px; padding-bottom: 8px;">
            <option value="all">كافة المستويات</option>
            ${LEVELS.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
        </div>

        <!-- Gender Filter Chips -->
        <div class="filter-chips" id="admin-filter-chips">
          <button class="filter-chip active" data-filter="all">الكل</button>
          <button class="filter-chip" data-filter="boys">الأولاد</button>
          <button class="filter-chip" data-filter="girls">البنات</button>
        </div>

      </div>

      <!-- Count Summary Bar -->
      <div id="students-counter-bar" style="margin-top: var(--space-3); font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-subtle); padding-top: var(--space-2);">
        <span id="students-shown-count">جاري التحميل...</span>
      </div>
    </div>

    <!-- Students Data Table -->
    <div class="admin-table-wrapper" id="students-table-wrapper"></div>

    <!-- Empty State -->
    <div class="empty-state" id="admin-empty-state" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
      <div class="empty-icon"><i data-lucide="users"></i></div>
      <h3>لم يتم العثور على أي طالب</h3>
      <p>لا توجد نتائج تطابق معايير البحث والتصفية المحددة.</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/students', content);
  initAdminLayout();
  initIcons();

  renderStudentsTable();
  initStudentEvents();
}

function renderStudentsTable() {
  const allStudents = getStudents();
  let students = [...allStudents];
  const wrapper = document.getElementById('students-table-wrapper');
  const emptyState = document.getElementById('admin-empty-state');
  const counterBar = document.getElementById('students-shown-count');

  // Filters
  if (filterGender === 'boys') students = students.filter(s => s.gender === 'ذكر');
  if (filterGender === 'girls') students = students.filter(s => s.gender === 'أنثى');
  if (filterGroup !== 'all') students = students.filter(s => s.group === filterGroup);
  if (filterLevel !== 'all') students = students.filter(s => s.level === filterLevel);
  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    students = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q));
  }

  if (counterBar) {
    counterBar.textContent = `عرض ${students.length} من إجمالي ${allStudents.length} طالب وطالبة`;
  }

  if (students.length === 0) {
    wrapper.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  wrapper.style.display = 'block';
  emptyState.style.display = 'none';

  wrapper.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>الطالب</th>
          <th>العمر</th>
          <th>الجنس</th>
          <th>المستوى</th>
          <th>الفوج</th>
          <th>التقدم القرآني</th>
          <th>النقاط</th>
          <th style="text-align: center;">الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(s => {
          const progress = calculateMemorizationProgress(s.memorization);
          const pointsData = getStudentPoints(s.id);
          return `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  ${renderAvatar(s.avatar, 'avatar-sm')}
                  <div>
                    <div style="font-weight: 700; color: var(--text-primary); font-size: var(--font-size-sm);">${s.firstName} ${s.lastName}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${s.notes ? s.notes.slice(0, 30) + '...' : 'تاريخ التسجيل: ' + (s.registrationDate || '—')}</div>
                  </div>
                </div>
              </td>
              <td style="font-size: var(--font-size-xs); font-weight: 600;">${s.age} سنوات</td>
              <td>
                <span class="badge ${s.gender === 'ذكر' ? 'badge-blue' : 'badge-gold'}" style="font-size: 11px;">
                  ${s.gender === 'ذكر' ? 'ولد' : 'بنت'}
                </span>
              </td>
              <td>
                <span class="badge ${getLevelBadgeClass(s.level)}">${s.level}</span>
              </td>
              <td>
                <span style="font-weight: 600; font-size: var(--font-size-xs); color: var(--text-secondary); background: var(--bg-subtle); padding: 3px 8px; border-radius: var(--border-radius-sm); border: 1px solid var(--border-subtle);">
                  ${s.group}
                </span>
              </td>
              <td style="min-width: 130px;">
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <div class="progress-bar progress-bar-sm" style="flex: 1;">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                  </div>
                  <span style="font-size: 11px; font-weight: 700; color: var(--emerald-800); min-width: 30px;">${progress}%</span>
                </div>
              </td>
              <td>
                <span class="badge ${pointsData.total > 0 ? 'badge-green' : (pointsData.total < 0 ? 'badge-red' : 'badge-gray')}" style="font-weight: 700;">
                  ${pointsData.total > 0 ? '+' : ''}${pointsData.total}
                </span>
              </td>
              <td>
                <div class="actions" style="justify-content: center;">
                  <a href="#/student/${s.id}" class="btn btn-ghost btn-sm btn-icon" title="معاينة الملف التربوي الكامل">
                    <i data-lucide="eye" style="width: 16px; height: 16px; color: var(--emerald-700);"></i>
                  </a>
                  <button class="btn btn-ghost btn-sm btn-icon edit-student-btn" data-id="${s.id}" title="تعديل البيانات">
                    <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm btn-icon delete-student-btn" data-id="${s.id}" title="حذف الطالب" style="color: var(--danger);">
                    <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;

  initIcons();

  // Edit Handlers
  wrapper.querySelectorAll('.edit-student-btn').forEach(btn => {
    btn.addEventListener('click', () => openStudentModal(btn.dataset.id));
  });

  // Delete Handlers
  wrapper.querySelectorAll('.delete-student-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const student = getStudents().find(s => s.id === btn.dataset.id);
      if (student) {
        confirmDialog(`هل أنت متأكد من حذف الطالب "${student.firstName} ${student.lastName}" نهائياً من سجلات المدرسة؟`, () => {
          deleteStudent(btn.dataset.id);
          showToast('تم حذف الطالب بنجاح');
          renderStudentsTable();
        });
      }
    });
  });
}

function initStudentEvents() {
  document.getElementById('add-student-btn')?.addEventListener('click', () => openStudentModal());

  const searchInput = document.getElementById('admin-student-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      searchQuery = e.target.value;
      renderStudentsTable();
    }, 200));
  }

  // Filter chips (Gender)
  document.querySelectorAll('#admin-filter-chips .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#admin-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterGender = chip.dataset.filter;
      renderStudentsTable();
    });
  });

  // Group filter
  document.getElementById('admin-group-filter')?.addEventListener('change', (e) => {
    filterGroup = e.target.value;
    renderStudentsTable();
  });

  // Level filter
  document.getElementById('admin-level-filter')?.addEventListener('change', (e) => {
    filterLevel = e.target.value;
    renderStudentsTable();
  });
}

function openStudentModal(studentId = null) {
  const existing = studentId ? getStudents().find(s => s.id === studentId) : null;
  const isEdit = !!existing;
  const title = isEdit ? 'تعديل بيانات الطالب' : 'تسجيل طالب جديد';

  const defaultGender = existing?.gender || 'ذكر';
  const defaultAvatar = existing?.avatar || (defaultGender === 'ذكر' ? 'boy1' : 'girl1');

  const body = `
    <form id="student-form">
      <div style="font-size: 11px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; margin-bottom: var(--space-3); padding-bottom: 4px; border-bottom: 1.5px solid var(--emerald-100);">
        المعلومات الشخصية
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">الاسم <span style="color:var(--danger)">*</span></label>
          <input type="text" id="sf-firstName" class="form-input" value="${existing?.firstName || ''}" required placeholder="مثال: عبد الرحمن">
        </div>
        <div class="form-group">
          <label class="form-label">اللقب <span style="color:var(--danger)">*</span></label>
          <input type="text" id="sf-lastName" class="form-input" value="${existing?.lastName || ''}" required placeholder="مثال: القاسمي">
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العمر (بالسنوات) <span style="color:var(--danger)">*</span></label>
          <input type="number" id="sf-age" class="form-input" value="${existing?.age || ''}" min="4" max="20" required placeholder="مثال: 10">
        </div>
        <div class="form-group">
          <label class="form-label">الجنس <span style="color:var(--danger)">*</span></label>
          <select id="sf-gender" class="form-select" required>
            <option value="ذكر" ${defaultGender === 'ذكر' ? 'selected' : ''}>ولد (ذكر)</option>
            <option value="أنثى" ${defaultGender === 'أنثى' ? 'selected' : ''}>بنت (أنثى)</option>
          </select>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; margin: var(--space-4) 0 var(--space-3); padding-bottom: 4px; border-bottom: 1.5px solid var(--emerald-100);">
        التسكين التربوي والتعليمي
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المستوى التعليمي</label>
          <select id="sf-level" class="form-select" required>
            ${LEVELS.map(l => `<option value="${l}" ${existing?.level === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">الفوج / الحلقة</label>
          <select id="sf-group" class="form-select" required>
            ${GROUPS.map(g => `<option value="${g}" ${existing?.group === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="font-size: 11px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; margin: var(--space-4) 0 var(--space-3); padding-bottom: 4px; border-bottom: 1.5px solid var(--emerald-100);">
        الصورة الرمزية (Avatar)
      </div>
      <div class="form-group">
        <div id="avatar-selector-container">
          ${renderAvatarSelector(defaultAvatar, defaultGender)}
        </div>
        <input type="hidden" id="sf-avatar" value="${defaultAvatar}">
      </div>

      <div class="form-group" style="margin-top: var(--space-4);">
        <label class="form-label">ملاحظات إدارية وتربوية خاصة</label>
        <textarea id="sf-notes" class="form-textarea" placeholder="مثال: يتقن أحكام النون الساكنة، سريع الحفظ...">${existing?.notes || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-student-btn">
      <i data-lucide="check"></i>
      <span>${isEdit ? 'حفظ التعديلات' : 'إتمام التسجيل'}</span>
    </button>
    <button class="btn btn-ghost" id="cancel-student-btn">إلغاء</button>
  `;

  openModal(title, body, footer);

  setTimeout(() => {
    initIcons();
    setupAvatarSelection();

    // Gender change => re-render avatars
    document.getElementById('sf-gender')?.addEventListener('change', (e) => {
      const gender = e.target.value;
      const firstAvatar = gender === 'ذكر' ? 'boy1' : 'girl1';
      document.getElementById('sf-avatar').value = firstAvatar;
      document.getElementById('avatar-selector-container').innerHTML = renderAvatarSelector(firstAvatar, gender);
      setupAvatarSelection();
    });

    // Save
    document.getElementById('save-student-btn')?.addEventListener('click', () => {
      const firstName = document.getElementById('sf-firstName').value.trim();
      const lastName = document.getElementById('sf-lastName').value.trim();
      const age = parseInt(document.getElementById('sf-age').value);
      const gender = document.getElementById('sf-gender').value;
      const level = document.getElementById('sf-level').value;
      const group = document.getElementById('sf-group').value;
      const avatar = document.getElementById('sf-avatar').value;
      const notes = document.getElementById('sf-notes').value.trim();

      if (!firstName || !lastName || isNaN(age)) {
        showToast('يرجى ملء جميع الحقول الإلزامية المطلوبة', 'error');
        return;
      }

      if (isEdit) {
        updateStudent(studentId, { firstName, lastName, age, gender, level, group, avatar, notes });
        showToast('تم تحديث بيانات الطالب بنجاح');
      } else {
        const newStudent = {
          id: generateId(),
          firstName,
          lastName,
          age,
          gender,
          avatar,
          level,
          group,
          registrationDate: new Date().toISOString().split('T')[0],
          notes,
          memorization: [],
          lastUpdate: new Date().toISOString().split('T')[0]
        };
        addStudent(newStudent);
        showToast('تمت إضافة الطالب بنجاح للسجلات');
      }

      closeModal();
      renderStudentsTable();
    });

    document.getElementById('cancel-student-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function setupAvatarSelection() {
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const avatarInput = document.getElementById('sf-avatar');
      if (avatarInput) avatarInput.value = opt.dataset.avatarId;
    });
  });
}
