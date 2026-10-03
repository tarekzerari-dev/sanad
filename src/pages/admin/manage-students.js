// ============================
// Admin - Manage Students
// ============================

import { getStudents, addStudent, updateStudent, deleteStudent } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar, renderAvatarSelector, getAvatarsForGender } from '../../utils/avatars.js';
import { openModal, closeModal, confirmDialog } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, generateId, LEVELS, GROUPS, debounce, getLevelBadgeClass } from '../../utils/helpers.js';

let searchQuery = '';
let filterGender = 'all';

export function renderManageStudentsPage() {
  const content = `
    <div class="page-header">
      <h2 style="font-size: var(--font-size-xl);">إدارة الطلبة</h2>
      <button class="btn btn-primary" id="add-student-btn">
        <i data-lucide="user-plus"></i>
        إضافة طالب
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="search-filter-bar" style="margin-bottom: var(--space-6);">
      <div class="search-box">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <input type="text" id="admin-student-search" placeholder="ابحث بالاسم..." class="form-input">
      </div>
      <div class="filter-chips" id="admin-filter-chips">
        <button class="filter-chip active" data-filter="all">الكل</button>
        <button class="filter-chip" data-filter="boys">الأولاد</button>
        <button class="filter-chip" data-filter="girls">البنات</button>
      </div>
    </div>

    <!-- Students Table -->
    <div class="admin-table-wrapper" id="students-table-wrapper">
    </div>

    <div class="empty-state" id="admin-empty-state" style="display:none;">
      <div class="empty-icon"><i data-lucide="users"></i></div>
      <h3>لم تتم إضافة أي طلبة بعد</h3>
      <p>اضغط على "إضافة طالب" لبدء تسجيل الطلبة</p>
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
  let students = getStudents();
  const wrapper = document.getElementById('students-table-wrapper');
  const emptyState = document.getElementById('admin-empty-state');

  // Apply filters
  if (filterGender === 'boys') students = students.filter(s => s.gender === 'ذكر');
  if (filterGender === 'girls') students = students.filter(s => s.gender === 'أنثى');
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    students = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q));
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
          <th>المجموعة</th>
          <th>الإجراءات</th>
        </tr>
      </thead>
      <tbody>
        ${students.map(s => `
          <tr>
            <td>
              <div style="display: flex; align-items: center; gap: var(--space-3);">
                ${renderAvatar(s.avatar, 'avatar-sm')}
                <div>
                  <div style="font-weight: 600;">${s.firstName} ${s.lastName}</div>
                </div>
              </div>
            </td>
            <td>${s.age} سنوات</td>
            <td>
              <span class="badge ${s.gender === 'ذكر' ? 'badge-blue' : 'badge-green'}" style="${s.gender === 'أنثى' ? 'background: #fce7f3; color: #db2777;' : ''}">
                ${s.gender === 'ذكر' ? 'ولد' : 'بنت'}
              </span>
            </td>
            <td><span class="badge ${getLevelBadgeClass(s.level)}">${s.level}</span></td>
            <td style="font-size: var(--font-size-sm);">${s.group}</td>
            <td>
              <div class="actions">
                <button class="btn btn-ghost btn-sm edit-student-btn" data-id="${s.id}" title="تعديل">
                  <i data-lucide="pencil" style="width:16px;height:16px;"></i>
                </button>
                <button class="btn btn-ghost btn-sm delete-student-btn" data-id="${s.id}" title="حذف" style="color: var(--danger);">
                  <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  initIcons();

  // Edit buttons
  wrapper.querySelectorAll('.edit-student-btn').forEach(btn => {
    btn.addEventListener('click', () => openStudentModal(btn.dataset.id));
  });

  // Delete buttons
  wrapper.querySelectorAll('.delete-student-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const student = getStudents().find(s => s.id === btn.dataset.id);
      if (student) {
        confirmDialog(`هل أنت متأكد من حذف الطالب "${student.firstName} ${student.lastName}"؟`, () => {
          deleteStudent(btn.dataset.id);
          showToast('تم حذف الطالب بنجاح');
          renderStudentsTable();
        });
      }
    });
  });
}

function initStudentEvents() {
  // Add button
  document.getElementById('add-student-btn').addEventListener('click', () => openStudentModal());

  // Search
  const searchInput = document.getElementById('admin-student-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      searchQuery = e.target.value;
      renderStudentsTable();
    }, 200));
  }

  // Filter chips
  document.querySelectorAll('#admin-filter-chips .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#admin-filter-chips .filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterGender = chip.dataset.filter;
      renderStudentsTable();
    });
  });
}

function openStudentModal(studentId = null) {
  const existing = studentId ? getStudents().find(s => s.id === studentId) : null;
  const isEdit = !!existing;
  const title = isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد';

  const defaultGender = existing?.gender || 'ذكر';
  const defaultAvatar = existing?.avatar || (defaultGender === 'ذكر' ? 'boy1' : 'girl1');

  const body = `
    <form id="student-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">الاسم</label>
          <input type="text" id="sf-firstName" class="form-input" value="${existing?.firstName || ''}" required placeholder="أدخل الاسم">
        </div>
        <div class="form-group">
          <label class="form-label">اللقب</label>
          <input type="text" id="sf-lastName" class="form-input" value="${existing?.lastName || ''}" required placeholder="أدخل اللقب">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">العمر</label>
          <input type="number" id="sf-age" class="form-input" value="${existing?.age || ''}" min="4" max="18" required placeholder="العمر">
        </div>
        <div class="form-group">
          <label class="form-label">الجنس</label>
          <select id="sf-gender" class="form-select" required>
            <option value="ذكر" ${defaultGender === 'ذكر' ? 'selected' : ''}>ولد</option>
            <option value="أنثى" ${defaultGender === 'أنثى' ? 'selected' : ''}>بنت</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">المستوى</label>
          <select id="sf-level" class="form-select" required>
            ${LEVELS.map(l => `<option value="${l}" ${existing?.level === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">المجموعة</label>
          <select id="sf-group" class="form-select" required>
            ${GROUPS.map(g => `<option value="${g}" ${existing?.group === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">الصورة الشخصية (Avatar)</label>
        <div id="avatar-selector-container">
          ${renderAvatarSelector(defaultAvatar, defaultGender)}
        </div>
        <input type="hidden" id="sf-avatar" value="${defaultAvatar}">
      </div>
      <div class="form-group">
        <label class="form-label">ملاحظات</label>
        <textarea id="sf-notes" class="form-textarea" placeholder="ملاحظات اختيارية...">${existing?.notes || ''}</textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-student-btn">
      <i data-lucide="check"></i>
      ${isEdit ? 'حفظ التعديلات' : 'إضافة الطالب'}
    </button>
    <button class="btn btn-ghost" id="cancel-student-btn">إلغاء</button>
  `;

  openModal(title, body, footer);

  setTimeout(() => {
    initIcons();
    
    // Avatar selection
    setupAvatarSelection();

    // Gender change => update avatars
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

      if (!firstName || !lastName || !age) {
        showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
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
        showToast('تمت إضافة الطالب بنجاح');
      }

      closeModal();
      renderStudentsTable();
    });

    // Cancel
    document.getElementById('cancel-student-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function setupAvatarSelection() {
  document.querySelectorAll('.avatar-option').forEach(opt => {
    opt.addEventListener('click', () => {
      document.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      document.getElementById('sf-avatar').value = opt.dataset.avatarId;
    });
  });
}
