// ============================
// Admin - Manage Points
// ============================

import { getStudents, getStudentPoints, addPointEntry } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { openModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, formatDate, debounce } from '../../utils/helpers.js';

let searchQuery = '';

export function renderPointsPage() {
  const content = `
    <div class="page-header">
      <div>
        <h2 style="font-size: var(--font-size-xl);">إدارة نقاط الطلبة</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">إضافة أو إنقاص نقاط من رصيد الطلبة مع ذكر السبب للمتابعة</p>
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="search-filter-bar" style="margin-bottom: var(--space-6);">
      <div class="search-box">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <input type="text" id="points-search" placeholder="ابحث عن طالب..." class="form-input">
      </div>
    </div>

    <div id="points-list"></div>

    <div class="empty-state" id="points-empty" style="display:none;">
      <div class="empty-icon"><i data-lucide="star"></i></div>
      <h3>لا يوجد طلبة</h3>
      <p>لم يتم العثور على طلبة في هذا البحث</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/points', content);
  initAdminLayout();
  initIcons();

  renderPointsList();

  document.getElementById('points-search')?.addEventListener('input', debounce((e) => {
    searchQuery = e.target.value;
    renderPointsList();
  }, 200));
}

function renderPointsList() {
  let students = getStudents();
  const list = document.getElementById('points-list');
  const emptyState = document.getElementById('points-empty');

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
    const pointsData = getStudentPoints(s.id);
    const totalPoints = pointsData.total;
    const badgeColor = totalPoints > 0 ? 'badge-green' : (totalPoints < 0 ? 'badge-danger' : 'badge-gray');
    
    return `
      <div class="card" style="margin-bottom: var(--space-4);">
        <div class="card-body">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-4);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              ${renderAvatar(s.avatar, 'avatar-sm')}
              <div>
                <div style="font-weight: 600;">${s.firstName} ${s.lastName}</div>
                <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">${s.group}</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: var(--space-4);">
              <div style="text-align: center; min-width: 60px;">
                <span class="badge ${badgeColor}" style="font-size: var(--font-size-base); font-weight: 700; padding: 4px 12px;">${totalPoints}</span>
              </div>
              
              <div style="display: flex; gap: var(--space-2);">
                <button class="btn btn-secondary btn-sm add-point-btn" data-id="${s.id}" data-action="add" style="color: var(--green-600); border-color: var(--green-200); background: var(--green-50);">
                  <i data-lucide="plus" style="width:16px;height:16px;"></i> نقطة
                </button>
                <button class="btn btn-secondary btn-sm subtract-point-btn" data-id="${s.id}" data-action="subtract" style="color: var(--danger); border-color: #fca5a5; background: #fef2f2;">
                  <i data-lucide="minus" style="width:16px;height:16px;"></i> نقطة
                </button>
                <button class="btn btn-ghost btn-sm history-btn" data-id="${s.id}" title="سجل النقاط">
                  <i data-lucide="history" style="width:16px;height:16px;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initIcons();

  list.querySelectorAll('.add-point-btn').forEach(btn => {
    btn.addEventListener('click', () => openPointsModal(btn.dataset.id, 1));
  });
  
  list.querySelectorAll('.subtract-point-btn').forEach(btn => {
    btn.addEventListener('click', () => openPointsModal(btn.dataset.id, -1));
  });

  list.querySelectorAll('.history-btn').forEach(btn => {
    btn.addEventListener('click', () => openHistoryModal(btn.dataset.id));
  });
}

function openPointsModal(studentId, delta) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const actionText = delta > 0 ? 'إضافة نقطة لـ' : 'إنقاص نقطة من';
  
  const body = `
    <form id="point-form">
      <p style="font-size: var(--font-size-sm); margin-bottom: var(--space-4);">
        ${actionText} <strong>${student.firstName} ${student.lastName}</strong>
      </p>
      
      <div class="form-group">
        <label class="form-label">السبب / التعليق (إلزامي)</label>
        <textarea id="point-reason" class="form-textarea" placeholder="مثال: ${delta > 0 ? 'حفظ ممتاز ومشاركة إيجابية' : 'شغب في القسم'}" required rows="3"></textarea>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn ${delta > 0 ? 'btn-primary' : 'btn-danger'}" id="save-point-btn">
      <i data-lucide="${delta > 0 ? 'plus-circle' : 'minus-circle'}"></i>
      تأكيد
    </button>
    <button class="btn btn-ghost" id="cancel-point-btn">إلغاء</button>
  `;

  openModal(delta > 0 ? 'إضافة نقطة' : 'إنقاص نقطة', body, footer);

  setTimeout(() => {
    initIcons();
    
    document.getElementById('save-point-btn')?.addEventListener('click', () => {
      const reason = document.getElementById('point-reason').value.trim();

      if (!reason) {
        showToast('يرجى إدخال سبب التعديل', 'error');
        return;
      }

      addPointEntry(studentId, delta, reason);
      showToast(`تم ${delta > 0 ? 'إضافة' : 'إنقاص'} نقطة بنجاح`);
      closeModal();
      renderPointsList();
    });

    document.getElementById('cancel-point-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function openHistoryModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const pointsData = getStudentPoints(studentId);
  const history = pointsData.history;

  const body = `
    <div style="text-align: center; margin-bottom: var(--space-5);">
      <div style="font-weight: 700; font-size: var(--font-size-lg);">${student.firstName} ${student.lastName}</div>
      <div style="color: var(--text-secondary); font-size: var(--font-size-sm);">مجموع النقاط: <strong style="color: ${pointsData.total > 0 ? 'var(--green-600)' : (pointsData.total < 0 ? 'var(--danger)' : 'var(--text-primary)')}">${pointsData.total}</strong></div>
    </div>

    ${history.length === 0 ? `
      <p style="text-align: center; color: var(--text-muted);">لا يوجد سجل نقاط لهذا الطالب</p>
    ` : `
      <div style="max-height: 400px; overflow-y: auto;">
        ${history.map(entry => `
          <div style="padding: var(--space-3); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; gap: var(--space-3);">
            <div>
              <div style="font-size: var(--font-size-sm); color: var(--text-primary);">${entry.reason}</div>
              <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${formatDate(entry.date)}</div>
            </div>
            <span class="badge ${entry.delta > 0 ? 'badge-green' : 'badge-danger'}" style="min-width: 40px; text-align: center;">${entry.delta > 0 ? '+' : ''}${entry.delta}</span>
          </div>
        `).join('')}
      </div>
    `}
  `;

  openModal('سجل النقاط', body);
}
