// ============================
// Admin - Manage Competitions
// ============================

import { getCompetitions, getStudents, addCompetition, updateCompetition, deleteCompetition } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { openModal, closeModal, confirmDialog } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, generateId, formatDate, COMPETITION_TYPES } from '../../utils/helpers.js';

export function renderManageCompetitionsPage() {
  const content = `
    <div class="page-header">
      <h2 style="font-size: var(--font-size-xl);">إدارة المسابقات</h2>
      <button class="btn btn-primary" id="add-comp-btn">
        <i data-lucide="plus"></i>
        إضافة مسابقة
      </button>
    </div>

    <div id="comp-list"></div>

    <div class="empty-state" id="comp-empty" style="display:none;">
      <div class="empty-icon"><i data-lucide="trophy"></i></div>
      <h3>لا توجد مسابقات</h3>
      <p>اضغط على "إضافة مسابقة" لإنشاء مسابقة جديدة</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/competitions', content);
  initAdminLayout();
  initIcons();

  renderCompList();

  document.getElementById('add-comp-btn').addEventListener('click', () => openCompModal());
}

function renderCompList() {
  const competitions = [...getCompetitions()].sort((a, b) => new Date(b.date) - new Date(a.date));
  const list = document.getElementById('comp-list');
  const emptyState = document.getElementById('comp-empty');

  if (competitions.length === 0) {
    list.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  list.style.display = 'block';
  emptyState.style.display = 'none';

  list.innerHTML = competitions.map(comp => {
    const students = getStudents();
    const winners = comp.results || [];

    return `
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-body">
          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap;">
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
                <h3 style="font-size: var(--font-size-lg);">${comp.name}</h3>
                <span class="badge badge-gold">${comp.type}</span>
              </div>
              <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-3);">${comp.description}</p>
              <div style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--font-size-xs); color: var(--text-muted);">
                <span style="display: flex; align-items: center; gap: var(--space-1);">
                  <i data-lucide="calendar" style="width:14px;height:14px;"></i>
                  ${formatDate(comp.date)}
                </span>
                <span style="display: flex; align-items: center; gap: var(--space-1);">
                  <i data-lucide="users" style="width:14px;height:14px;"></i>
                  ${comp.participants ? comp.participants.length : 0} مشارك
                </span>
              </div>
              ${winners.length > 0 ? `
                <div style="display: flex; gap: var(--space-3); margin-top: var(--space-3); flex-wrap: wrap;">
                  ${winners.slice(0, 3).map(w => {
                    const s = students.find(st => st.id === w.studentId);
                    const emoji = w.rank === 1 ? '🏆' : w.rank === 2 ? '🥈' : '🥉';
                    return `<span style="font-size: var(--font-size-xs); background: var(--gold-100); padding: 2px 8px; border-radius: var(--border-radius-full);">${emoji} ${s ? s.firstName : '—'}</span>`;
                  }).join('')}
                </div>
              ` : ''}
            </div>
            <div style="display: flex; gap: var(--space-2);">
              <button class="btn btn-ghost btn-sm edit-comp-btn" data-id="${comp.id}">
                <i data-lucide="pencil" style="width:16px;height:16px;"></i>
              </button>
              <button class="btn btn-ghost btn-sm delete-comp-btn" data-id="${comp.id}" style="color: var(--danger);">
                <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initIcons();

  // Edit buttons
  list.querySelectorAll('.edit-comp-btn').forEach(btn => {
    btn.addEventListener('click', () => openCompModal(btn.dataset.id));
  });

  // Delete buttons
  list.querySelectorAll('.delete-comp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const comp = getCompetitions().find(c => c.id === btn.dataset.id);
      confirmDialog(`هل أنت متأكد من حذف مسابقة "${comp?.name}"؟`, () => {
        deleteCompetition(btn.dataset.id);
        showToast('تم حذف المسابقة بنجاح');
        renderCompList();
      });
    });
  });
}

function openCompModal(compId = null) {
  const existing = compId ? getCompetitions().find(c => c.id === compId) : null;
  const isEdit = !!existing;
  const students = getStudents();

  const body = `
    <form id="comp-form">
      <div class="form-group">
        <label class="form-label">اسم المسابقة</label>
        <input type="text" id="cf-name" class="form-input" value="${existing?.name || ''}" required placeholder="مثال: مسابقة حفظ جزء عمّ">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">التاريخ</label>
          <input type="date" id="cf-date" class="form-input" value="${existing?.date || new Date().toISOString().split('T')[0]}" required>
        </div>
        <div class="form-group">
          <label class="form-label">النوع</label>
          <select id="cf-type" class="form-select" required>
            ${COMPETITION_TYPES.map(t => `<option value="${t}" ${existing?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">الوصف</label>
        <textarea id="cf-desc" class="form-textarea" placeholder="وصف قصير للمسابقة...">${existing?.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">المشاركون</label>
        <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-2);">
          ${students.map(s => `
            <label style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); cursor: pointer; border-radius: var(--border-radius-sm);" class="participant-label">
              <input type="checkbox" class="participant-check" value="${s.id}" ${existing?.participants?.includes(s.id) ? 'checked' : ''}>
              <span style="font-size: var(--font-size-sm);">${s.firstName} ${s.lastName}</span>
            </label>
          `).join('')}
        </div>
      </div>
      
      <h4 style="font-size: var(--font-size-sm); margin-bottom: var(--space-3); color: var(--text-secondary);">النتائج (اختياري)</h4>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">🏆 المركز الأول</label>
          <select id="cf-rank1" class="form-select">
            <option value="">— اختر —</option>
            ${students.map(s => `<option value="${s.id}" ${existing?.results?.find(r => r.rank === 1)?.studentId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
          </select>
          <input type="text" id="cf-prize1" class="form-input" placeholder="الجائزة" value="${existing?.results?.find(r => r.rank === 1)?.prize || ''}" style="margin-top: var(--space-2);">
        </div>
        <div class="form-group">
          <label class="form-label">🥈 المركز الثاني</label>
          <select id="cf-rank2" class="form-select">
            <option value="">— اختر —</option>
            ${students.map(s => `<option value="${s.id}" ${existing?.results?.find(r => r.rank === 2)?.studentId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
          </select>
          <input type="text" id="cf-prize2" class="form-input" placeholder="الجائزة" value="${existing?.results?.find(r => r.rank === 2)?.prize || ''}" style="margin-top: var(--space-2);">
        </div>
      </div>
      <div class="form-group" style="max-width: 50%;">
        <label class="form-label">🥉 المركز الثالث</label>
        <select id="cf-rank3" class="form-select">
          <option value="">— اختر —</option>
          ${students.map(s => `<option value="${s.id}" ${existing?.results?.find(r => r.rank === 3)?.studentId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
        </select>
        <input type="text" id="cf-prize3" class="form-input" placeholder="الجائزة" value="${existing?.results?.find(r => r.rank === 3)?.prize || ''}" style="margin-top: var(--space-2);">
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-comp-btn">
      <i data-lucide="check"></i>
      ${isEdit ? 'حفظ التعديلات' : 'إنشاء المسابقة'}
    </button>
    <button class="btn btn-ghost" id="cancel-comp-btn">إلغاء</button>
  `;

  openModal(isEdit ? 'تعديل المسابقة' : 'إنشاء مسابقة جديدة', body, footer);

  setTimeout(() => {
    initIcons();

    document.getElementById('save-comp-btn')?.addEventListener('click', () => {
      const name = document.getElementById('cf-name').value.trim();
      const date = document.getElementById('cf-date').value;
      const type = document.getElementById('cf-type').value;
      const description = document.getElementById('cf-desc').value.trim();

      if (!name || !date) {
        showToast('يرجى ملء الحقول المطلوبة', 'error');
        return;
      }

      const participants = [];
      document.querySelectorAll('.participant-check:checked').forEach(cb => {
        participants.push(cb.value);
      });

      const results = [];
      for (let i = 1; i <= 3; i++) {
        const studentId = document.getElementById(`cf-rank${i}`).value;
        const prize = document.getElementById(`cf-prize${i}`).value.trim();
        if (studentId) {
          results.push({ studentId, rank: i, prize: prize || 'شهادة تقدير' });
        }
      }

      if (isEdit) {
        updateCompetition(compId, { name, date, type, description, participants, results });
        showToast('تم تحديث المسابقة بنجاح');
      } else {
        addCompetition({ id: generateId(), name, date, type, description, participants, results });
        showToast('تم إنشاء المسابقة بنجاح');
      }

      closeModal();
      renderCompList();
    });

    document.getElementById('cancel-comp-btn')?.addEventListener('click', closeModal);
  }, 100);
}
