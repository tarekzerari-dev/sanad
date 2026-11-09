// ============================================================
// سند — Admin Manage Competitions (إدارة المسابقات القرآنية)
// ============================================================

import { getCompetitions, getStudents, addCompetition, updateCompetition, deleteCompetition } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { renderAvatar } from '../../utils/avatars.js';
import { openModal, closeModal, confirmDialog } from '../../components/modal.js';
import { showToast } from '../../components/toast.js';
import { initIcons, generateId, formatDate, COMPETITION_TYPES, getLevelBadgeClass } from '../../utils/helpers.js';

export function renderManageCompetitionsPage() {
  const content = `
    <!-- Page Header & Action Controls -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">إدارة المسابقات والجوائز القرآنية</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          تنظيم المسابقات التنافسية في حفظ وتجويد القرآن الكريم وتوثيق الفائزين والمكافآت
        </p>
      </div>

      <button class="btn btn-primary" id="add-comp-btn">
        <i data-lucide="plus"></i>
        <span>إنشاء مسابقة جديدة</span>
      </button>
    </div>

    <!-- Competitions Grid / List -->
    <div id="comp-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: var(--space-5);"></div>

    <!-- Empty State -->
    <div class="empty-state" id="comp-empty" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
      <div class="empty-icon"><i data-lucide="trophy"></i></div>
      <h3>لا توجد مسابقات قرآنية مسجلة</h3>
      <p>اضغط على "إنشاء مسابقة جديدة" لتدشين مسابقة لحفظ وتجويد القرآن الكريم.</p>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/competitions', content);
  initAdminLayout();
  initIcons();

  renderCompList();

  document.getElementById('add-comp-btn')?.addEventListener('click', () => openCompModal());
}

function renderCompList() {
  const competitions = getCompetitions();
  const students = getStudents();
  const list = document.getElementById('comp-list');
  const emptyState = document.getElementById('comp-empty');

  if (competitions.length === 0) {
    if (list) list.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  list.innerHTML = competitions.map(comp => {
    const participants = (comp.participants || []).map(id => students.find(s => s.id === id)).filter(Boolean);
    const results = (comp.results || []).sort((a, b) => a.rank - b.rank);

    return `
      <div class="card" style="display: flex; flex-direction: column; justify-content: space-between;">
        
        <!-- Competition Header -->
        <div style="background: linear-gradient(145deg, #12331f, #1a4d2e); color: #ffffff; padding: var(--space-4) var(--space-5); border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
            <span class="badge" style="background: var(--brass-500); color: #1e1706; font-weight: 700; font-size: 10px;">
              ${comp.type || 'مسابقة قرآنية'}
            </span>
            <div style="display: flex; gap: var(--space-1);">
              <button class="btn btn-ghost btn-sm btn-icon edit-comp-btn" data-id="${comp.id}" style="color: #ffffff;" title="تعديل">
                <i data-lucide="pencil" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn btn-ghost btn-sm btn-icon delete-comp-btn" data-id="${comp.id}" style="color: #fca5a5;" title="حذف">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </div>

          <h3 style="font-family: var(--font-heading); font-size: 1.25rem; color: #ffffff; margin-bottom: 4px;">
            ${comp.name}
          </h3>
          <div style="font-size: 11px; color: var(--brass-200); display: flex; align-items: center; gap: 4px;">
            <i data-lucide="calendar" style="width: 13px; height: 13px;"></i>
            <span>تاريخ المسابقة: ${formatDate(comp.date)}</span>
          </div>
        </div>

        <!-- Competition Body -->
        <div class="card-body" style="flex: 1;">
          ${comp.description ? `
            <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: var(--space-4); line-height: 1.6;">
              ${comp.description}
            </p>
          ` : ''}

          <!-- Winners Podium -->
          <div style="margin-bottom: var(--space-4);">
            <div style="font-size: 11px; font-weight: 700; color: var(--emerald-900); text-transform: uppercase; margin-bottom: var(--space-2); display: flex; align-items: center; gap: 4px;">
              <i data-lucide="award" style="width: 14px; height: 14px; color: var(--brass-500);"></i>
              <span>منصة التتويج والمراكز الأولى:</span>
            </div>

            ${results.length === 0 ? `
              <div style="font-size: 11px; color: var(--text-muted); padding: 8px; background: var(--bg-canvas); border-radius: var(--border-radius-sm); border: 1px dashed var(--border-color); text-align: center;">
                لم تُسجل نتائج التتويج بعد
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                ${results.map(r => {
                  const winner = students.find(s => s.id === r.studentId);
                  const rankIcons = { 1: '🥇', 2: '🥈', 3: '🥉' };
                  const rankColors = { 1: 'var(--brass-50)', 2: 'var(--bg-canvas)', 3: 'var(--bg-canvas)' };
                  const rankBorder = { 1: 'var(--brass-300)', 2: 'var(--border-subtle)', 3: 'var(--border-subtle)' };

                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 10px; background: ${rankColors[r.rank] || 'var(--bg-canvas)'}; border: 1px solid ${rankBorder[r.rank] || 'var(--border-subtle)'}; border-radius: var(--border-radius-md);">
                      <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <span style="font-size: 16px;">${rankIcons[r.rank] || '🏅'}</span>
                        ${winner ? renderAvatar(winner.avatar, 'avatar-xs') : ''}
                        <span style="font-weight: 700; font-size: var(--font-size-xs); color: var(--text-primary);">
                          ${winner ? `${winner.firstName} ${winner.lastName}` : 'طالب غير محدد'}
                        </span>
                      </div>
                      <span class="badge badge-gold" style="font-size: 10px;">${r.prize || 'شهادة تقدير'}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Participants Strip -->
          <div style="border-top: 1px solid var(--border-subtle); padding-top: var(--space-3); font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center;">
            <span>المشاركون: <strong>${participants.length} طالب وطالبة</strong></span>
            <div style="display: flex; margin-right: -4px;">
              ${participants.slice(0, 5).map(p => `
                <div style="margin-left: -6px; border: 1.5px solid #ffffff; border-radius: var(--border-radius-full);">
                  ${renderAvatar(p.avatar, 'avatar-xs')}
                </div>
              `).join('')}
              ${participants.length > 5 ? `
                <div style="width: 28px; height: 28px; border-radius: var(--border-radius-full); background: var(--emerald-100); color: var(--emerald-800); font-weight: 700; font-size: 10px; display: flex; align-items: center; justify-content: center; margin-left: -6px; border: 1.5px solid #ffffff;">
                  +${participants.length - 5}
                </div>
              ` : ''}
            </div>
          </div>

        </div>

      </div>
    `;
  }).join('');

  initIcons();

  // Edit
  list.querySelectorAll('.edit-comp-btn').forEach(btn => {
    btn.addEventListener('click', () => openCompModal(btn.dataset.id));
  });

  // Delete
  list.querySelectorAll('.delete-comp-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      confirmDialog('هل أنت متأكد من حذف هذه المسابقة القرآنية؟', () => {
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

  const rank1 = existing?.results?.find(r => r.rank === 1);
  const rank2 = existing?.results?.find(r => r.rank === 2);
  const rank3 = existing?.results?.find(r => r.rank === 3);

  const existingParticipants = existing?.participants || [];

  const body = `
    <form id="comp-form">
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">عنوان المسابقة <span style="color:var(--danger)">*</span></label>
          <input type="text" id="cf-name" class="form-input" value="${existing?.name || ''}" placeholder="مثال: مسابقة سورة الرحمن في الحفظ والإتقان" required>
        </div>
        <div class="form-group">
          <label class="form-label">نوع المسابقة</label>
          <select id="cf-type" class="form-select">
            ${COMPETITION_TYPES.map(t => `<option value="${t}" ${existing?.type === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">تاريخ المسابقة <span style="color:var(--danger)">*</span></label>
          <input type="date" id="cf-date" class="form-input" value="${existing?.date || getTodayStr()}" required>
        </div>
        <div class="form-group">
          <label class="form-label">وصف المسابقة والشروط</label>
          <input type="text" id="cf-desc" class="form-input" value="${existing?.description || ''}" placeholder="وصف موجز للمسابقة">
        </div>
      </div>

      <!-- Participants Multi-select -->
      <div class="form-group">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <label class="form-label" style="margin: 0;">الطلبة المتنافسون في المسابقة:</label>
          <div style="display: flex; gap: var(--space-2);">
            <button type="button" class="btn btn-ghost btn-sm" id="cf-select-all" style="font-size: 11px; padding: 2px 8px;">تحديد الكل</button>
            <button type="button" class="btn btn-ghost btn-sm" id="cf-deselect-all" style="font-size: 11px; padding: 2px 8px;">إلغاء الكل</button>
          </div>
        </div>
        <div style="max-height: 160px; overflow-y: auto; border: 1.5px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-2); background: var(--bg-surface);">
          ${students.map(s => `
            <label style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; border-radius: var(--border-radius-sm); cursor: pointer;" class="hover-bg">
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <input type="checkbox" class="participant-check" value="${s.id}" ${existingParticipants.includes(s.id) ? 'checked' : ''}>
                <span style="font-size: var(--font-size-xs); font-weight: 600;">${s.firstName} ${s.lastName}</span>
              </div>
              <span class="badge badge-gray" style="font-size: 10px;">${s.group}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- Winners Podium Section -->
      <div style="font-size: 11px; font-weight: 700; color: var(--emerald-800); text-transform: uppercase; margin: var(--space-4) 0 var(--space-2); padding-bottom: 4px; border-bottom: 1.5px solid var(--emerald-100);">
        تحديد منصة الفائزين (اختياري):
      </div>

      <!-- Rank 1 -->
      <div class="form-row" style="margin-bottom: var(--space-2);">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 11px;">🥇 المركز الأول</label>
          <select id="cf-rank1" class="form-select" style="padding-top: 6px; padding-bottom: 6px;">
            <option value="">-- اختر الفائز بالمركز الأول --</option>
            ${students.map(s => `<option value="${s.id}" ${rank1?.studentId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 11px;">الجائزة / المكافأة</label>
          <input type="text" id="cf-prize1" class="form-input" value="${rank1?.prize || 'مصحف شريف + شهادة امتياز'}" style="padding: 6px 10px;">
        </div>
      </div>

      <!-- Rank 2 -->
      <div class="form-row" style="margin-bottom: var(--space-2);">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 11px;">🥈 المركز الثاني</label>
          <select id="cf-rank2" class="form-select" style="padding-top: 6px; padding-bottom: 6px;">
            <option value="">-- اختر الفائز بالمركز الثاني --</option>
            ${students.map(s => `<option value="${s.id}" ${rank2?.studentId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 11px;">الجائزة / المكافأة</label>
          <input type="text" id="cf-prize2" class="form-input" value="${rank2?.prize || 'شهادة تفوق + هدية تشجيعية'}" style="padding: 6px 10px;">
        </div>
      </div>

      <!-- Rank 3 -->
      <div class="form-row">
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 11px;">🥉 المركز الثالث</label>
          <select id="cf-rank3" class="form-select" style="padding-top: 6px; padding-bottom: 6px;">
            <option value="">-- اختر الفائز بالمركز الثالث --</option>
            ${students.map(s => `<option value="${s.id}" ${rank3?.studentId === s.id ? 'selected' : ''}>${s.firstName} ${s.lastName}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin: 0;">
          <label class="form-label" style="font-size: 11px;">الجائزة / المكافأة</label>
          <input type="text" id="cf-prize3" class="form-input" value="${rank3?.prize || 'شهادة تشجيع'}" style="padding: 6px 10px;">
        </div>
      </div>
    </form>
  `;

  const footer = `
    <button class="btn btn-primary" id="save-comp-btn">
      <i data-lucide="check"></i>
      <span>${isEdit ? 'حفظ التعديلات' : 'اعتماد المسابقة'}</span>
    </button>
    <button class="btn btn-ghost" id="cancel-comp-btn">إلغاء</button>
  `;

  openModal(isEdit ? 'تعديل المسابقة القرآنية' : 'إنشاء مسابقة قرآنية جديدة', body, footer);

  setTimeout(() => {
    initIcons();

    document.getElementById('cf-select-all')?.addEventListener('click', () => {
      document.querySelectorAll('.participant-check').forEach(cb => cb.checked = true);
    });
    document.getElementById('cf-deselect-all')?.addEventListener('click', () => {
      document.querySelectorAll('.participant-check').forEach(cb => cb.checked = false);
    });

    document.getElementById('save-comp-btn')?.addEventListener('click', () => {
      const name = document.getElementById('cf-name').value.trim();
      const date = document.getElementById('cf-date').value;
      const type = document.getElementById('cf-type').value;
      const description = document.getElementById('cf-desc').value.trim();

      if (!name || !date) {
        showToast('يرجى ملء اسم وتاريخ المسابقة', 'error');
        return;
      }

      const participants = Array.from(document.querySelectorAll('.participant-check:checked')).map(cb => cb.value);

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
        showToast('تم تحديث بيانات المسابقة بنجاح');
      } else {
        addCompetition({ id: generateId(), name, date, type, description, participants, results });
        showToast('تم تدشين المسابقة القرآنية بنجاح 🎉');
      }

      closeModal();
      renderCompList();
    });

    document.getElementById('cancel-comp-btn')?.addEventListener('click', closeModal);
  }, 100);
}
