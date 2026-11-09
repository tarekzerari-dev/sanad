// ============================================================
// سند — Admin Points Management (نقاط التميز والمواظبة)
// ============================================================

import { getStudents, getStudentPoints, addPointEntry } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { openModal, closeModal } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, formatDate, debounce, getLevelBadgeClass } from '../../utils/helpers.js';

let searchQuery = '';

export function renderPointsPage() {
  const content = `
    <!-- Page Header & Overview -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">نقاط التميز والتحفيز القرآني</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          نظام النقاط التربوية لمكافأة المواظبة، حسن التلاوة، المشاركة الفعالة، والالتزام بآداب الحلقة
        </p>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-4); margin-bottom: var(--space-5); box-shadow: var(--shadow-xs);">
      <div class="search-box">
        <span class="search-icon"><i data-lucide="search"></i></span>
        <input type="text" id="points-search" placeholder="ابحث باسم الطالب لرصد النقاط..." class="form-input">
      </div>
    </div>

    <!-- Students Points Table / List -->
    <div id="points-list"></div>

    <!-- Empty State -->
    <div class="empty-state" id="points-empty" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
      <div class="empty-icon"><i data-lucide="star"></i></div>
      <h3>لم يتم العثور على أي طالب</h3>
      <p>لا يوجد طالب يطابق معايير البحث الحالية.</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/points', content);
  initAdminLayout();
  initIcons();

  renderPointsList();
  initPointsEvents();
}

function renderPointsList() {
  const allStudents = getStudents();
  let students = [...allStudents];
  const listContainer = document.getElementById('points-list');
  const emptyState = document.getElementById('points-empty');

  if (searchQuery) {
    const q = searchQuery.toLowerCase().trim();
    students = students.filter(s => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q));
  }

  // Sort by points descending
  students.sort((a, b) => {
    const pA = getStudentPoints(a.id).total || 0;
    const pB = getStudentPoints(b.id).total || 0;
    return pB - pA;
  });

  if (students.length === 0) {
    if (listContainer) listContainer.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  listContainer.innerHTML = `
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th style="width: 70px; text-align: center;">الترتيب</th>
            <th>الطالب</th>
            <th>الفوج والمستوى</th>
            <th>رصيد النقاط</th>
            <th>آخر إضافة</th>
            <th style="text-align: center;">إدارة الرصيد</th>
          </tr>
        </thead>
        <tbody>
          ${students.map((s, idx) => {
            const pData = getStudentPoints(s.id);
            const total = pData.total || 0;
            const lastEntry = (pData.history && pData.history[0]) ? pData.history[0] : null;

            return `
              <tr>
                <td style="text-align: center;">
                  ${idx === 0 ? '<span style="font-size: 18px;" title="المتصدر">🥇</span>' : 
                    idx === 1 ? '<span style="font-size: 18px;" title="المركز الثاني">🥈</span>' : 
                    idx === 2 ? '<span style="font-size: 18px;" title="المركز الثالث">🥉</span>' : 
                    `<span style="font-weight: 700; color: var(--text-muted); font-size: 12px;">#${idx + 1}</span>`}
                </td>
                <td>
                  <div style="display: flex; align-items: center; gap: var(--space-3);">
                    ${renderAvatar(s.avatar, 'avatar-sm')}
                    <div>
                      <div style="font-weight: 700; color: var(--text-primary);">${s.firstName} ${s.lastName}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${s.age} سنوات</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="display: flex; gap: var(--space-2); align-items: center;">
                    <span class="badge ${getLevelBadgeClass(s.level)}" style="font-size: 10px;">${s.level}</span>
                    <span style="font-size: 11px; color: var(--text-muted);">${s.group}</span>
                  </div>
                </td>
                <td>
                  <span class="badge ${total > 0 ? 'badge-green' : (total < 0 ? 'badge-red' : 'badge-gray')}" style="font-size: 14px; font-weight: 800; padding: 4px 12px;">
                    ${total > 0 ? '+' : ''}${total} نقطة
                  </span>
                </td>
                <td style="font-size: 12px; color: var(--text-secondary);">
                  ${lastEntry ? `
                    <div><strong>${lastEntry.delta > 0 ? '+' : ''}${lastEntry.delta}:</strong> ${lastEntry.reason}</div>
                    <div style="font-size: 10px; color: var(--text-muted);">${formatDate(lastEntry.date)}</div>
                  ` : '<span style="color: var(--text-muted);">—</span>'}
                </td>
                <td>
                  <div class="actions" style="justify-content: center;">
                    <button class="btn btn-primary btn-sm add-points-btn" data-id="${s.id}">
                      <i data-lucide="plus"></i>
                      <span>تعديل الرصيد</span>
                    </button>
                    <button class="btn btn-ghost btn-sm btn-icon view-history-btn" data-id="${s.id}" title="عرض كشف السجل">
                      <i data-lucide="history" style="width: 16px; height: 16px;"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  initIcons();

  // Attach buttons
  listContainer.querySelectorAll('.add-points-btn').forEach(btn => {
    btn.addEventListener('click', () => openAddPointsModal(btn.dataset.id));
  });

  listContainer.querySelectorAll('.view-history-btn').forEach(btn => {
    btn.addEventListener('click', () => openHistoryModal(btn.dataset.id));
  });
}

function initPointsEvents() {
  const searchInput = document.getElementById('points-search');
  if (searchInput) {
    searchInput.addEventListener('input', debounce((e) => {
      searchQuery = e.target.value;
      renderPointsList();
    }, 200));
  }
}

function openAddPointsModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const pointsData = getStudentPoints(studentId);

  const body = `
    <form id="points-form">
      <div style="display: flex; align-items: center; justify-content: space-between; background: var(--bg-canvas); padding: var(--space-4); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-4);">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          ${renderAvatar(student.avatar, 'avatar-sm')}
          <div>
            <div style="font-weight: 700; color: var(--text-primary); font-size: var(--font-size-base);">${student.firstName} ${student.lastName}</div>
            <div style="font-size: 11px; color: var(--text-muted);">${student.group} • ${student.level}</div>
          </div>
        </div>
        <div style="text-align: left;">
          <div style="font-size: 11px; color: var(--text-muted);">الرصيد الحالي</div>
          <div style="font-size: 1.5rem; font-weight: 800; color: var(--emerald-800);">${pointsData.total || 0}</div>
        </div>
      </div>

      <!-- Quick Preset Points Selector -->
      <div class="form-group">
        <label class="form-label">مقدار النقاط (اختر خياراً سريعاً أو اكتب القيمة):</label>
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-2); margin-bottom: var(--space-3);">
          <button type="button" class="btn btn-secondary preset-pt-btn" data-pts="1">+1 نقطة</button>
          <button type="button" class="btn btn-secondary preset-pt-btn" data-pts="2">+2 نقطة</button>
          <button type="button" class="btn btn-secondary preset-pt-btn" data-pts="5">+5 نقاط</button>
          <button type="button" class="btn btn-secondary preset-pt-btn" data-pts="-1" style="color: var(--danger);">-1 نقطة</button>
        </div>
        <input type="number" id="pf-points" class="form-input" value="1" placeholder="أدخل عدد النقاط (+ للإضافة، - للخصم)" required>
      </div>

      <!-- Common Reasons Selector -->
      <div class="form-group">
        <label class="form-label">سبب التعديل / المكافأة</label>
        <select id="pf-reason-preset" class="form-select" style="margin-bottom: var(--space-2);">
          <option value="مكافأة المواظبة والحضور في الوقت">مكافأة المواظبة والحضور في الوقت</option>
          <option value="إتقان التسميع اليومي مع أحكام التجويد">إتقان التسميع اليومي مع أحكام التجويد</option>
          <option value="المشاركة المتميزة في الحلقة">المشاركة المتميزة في الحلقة</option>
          <option value="إنجاز الواجب المنزلي بإتقان">إنجاز الواجب المنزلي بإتقان</option>
          <option value="الفوز في المسابقة القرآنية المصغرة">الفوز في المسابقة القرآنية المصغرة</option>
          <option value="تعديل الإدارة">تعديل الإدارة</option>
          <option value="custom">سبب مخصص آخر...</option>
        </select>
        <input type="text" id="pf-reason" class="form-input" value="مكافأة المواظبة والحضور في الوقت" placeholder="اكتب السبب بالتفصيل" required>
      </div>

      <div class="form-group">
        <label class="form-label">التاريخ</label>
        <input type="date" id="pf-date" class="form-input" value="${new Date().toISOString().split('T')[0]}">
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-points-btn">
      <i data-lucide="check"></i>
      <span>اعتماد وتحديث الرصيد</span>
    </button>
    <button class="btn btn-ghost" id="cancel-points-btn">إلغاء</button>
  `;

  openModal(`تعديل نقاط الطالب: ${student.firstName} ${student.lastName}`, body, footer);

  setTimeout(() => {
    initIcons();

    // Preset buttons
    document.querySelectorAll('.preset-pt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const pts = btn.dataset.pts;
        const ptsInput = document.getElementById('pf-points');
        if (ptsInput) ptsInput.value = pts;
      });
    });

    // Reason preset
    document.getElementById('pf-reason-preset')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const reasonInput = document.getElementById('pf-reason');
      if (val !== 'custom') {
        if (reasonInput) reasonInput.value = val;
      } else {
        if (reasonInput) {
          reasonInput.value = '';
          reasonInput.focus();
        }
      }
    });

    // Save
    document.getElementById('save-points-btn')?.addEventListener('click', () => {
      const ptsVal = parseInt(document.getElementById('pf-points').value);
      const reason = document.getElementById('pf-reason').value.trim();
      const date = document.getElementById('pf-date').value;

      if (isNaN(ptsVal) || !reason) {
        showToast('يرجى تحديد عدد النقاط وسبب التعديل', 'error');
        return;
      }

      addPointEntry(student.id, ptsVal, reason, date);
      showToast(`تم ${ptsVal > 0 ? 'إضافة' : 'خصم'} ${Math.abs(ptsVal)} نقطة للطالب ${student.firstName} بنجاح`);
      closeModal();
      renderPointsList();
    });

    document.getElementById('cancel-points-btn')?.addEventListener('click', closeModal);
  }, 100);
}

function openHistoryModal(studentId) {
  const student = getStudents().find(s => s.id === studentId);
  if (!student) return;

  const pointsData = getStudentPoints(studentId);
  const history = pointsData.history || [];

  const body = `
    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-canvas); padding: var(--space-4); border-radius: var(--border-radius-md); border: 1px solid var(--border-subtle); margin-bottom: var(--space-4);">
      <div style="display: flex; align-items: center; gap: var(--space-3);">
        ${renderAvatar(student.avatar, 'avatar-sm')}
        <div>
          <div style="font-weight: 700; color: var(--text-primary); font-size: var(--font-size-base);">${student.firstName} ${student.lastName}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${student.group} • ${student.level}</div>
        </div>
      </div>
      <div>
        <span class="badge ${pointsData.total > 0 ? 'badge-green' : 'badge-gray'}" style="font-size: 16px; font-weight: 800; padding: 4px 14px;">
          ${pointsData.total > 0 ? '+' : ''}${pointsData.total} نقطة
        </span>
      </div>
    </div>

    ${history.length === 0 ? `
      <div style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
        لا يوجد سجل نقاط سابق لهذا الطالب
      </div>
    ` : `
      <div style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: var(--space-2);">
        ${history.map(entry => `
          <div style="padding: 10px 14px; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); display: flex; justify-content: space-between; align-items: center; gap: var(--space-3);">
            <div>
              <div style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary);">${entry.reason}</div>
              <div style="font-size: 11px; color: var(--text-muted);">${formatDate(entry.date)}</div>
            </div>
            <span class="badge ${entry.delta > 0 ? 'badge-green' : 'badge-red'}" style="min-width: 44px; text-align: center; font-size: 13px; font-weight: 700;">
              ${entry.delta > 0 ? '+' : ''}${entry.delta}
            </span>
          </div>
        `).join('')}
      </div>
    `}
  `;

  openModal(`كشف سجل نقاط: ${student.firstName} ${student.lastName}`, body);
}
