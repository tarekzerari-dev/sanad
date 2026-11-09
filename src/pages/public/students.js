// ============================================================
// سند — Public Students Directory (سجل طلبة المدرسة)
// ============================================================

import { getStudents, getStudentAttendanceStats, getStudentPoints } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { renderAvatar } from '../../utils/avatars.js';
import { initIcons, calculateMemorizationProgress, getLevelBadgeClass, debounce, GROUPS } from '../../utils/helpers.js';

let currentFilter = 'all';
let currentSearch = '';
let currentGroup = 'all';

export function renderStudentsPage() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${renderNavbar('/students')}
    
    <main class="section" style="padding-top: var(--space-8); padding-bottom: var(--space-16); background: var(--bg-canvas);">
      <div class="container">
        
        <div class="section-header" style="margin-bottom: var(--space-6);">
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; color: var(--emerald-950);">سجلات طلبة مدرسة سند</h2>
          <p>تصفح بطاقات أبنائنا وبناتنا المسجلين في حلقات القرآن الكريم ومتابعة إنجازاتهم</p>
        </div>

        <!-- Search & Filter Controls -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: var(--space-4) var(--space-5); margin-bottom: var(--space-6); box-shadow: var(--shadow-xs);">
          <div style="display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center; justify-content: space-between;">
            
            <div class="search-box" style="flex: 1.2; min-width: 250px;">
              <span class="search-icon"><i data-lucide="search"></i></span>
              <input type="text" id="student-search" placeholder="ابحث باسم الطالب..." class="form-input">
            </div>

            <!-- Group Selector -->
            <div style="min-width: 150px;">
              <select id="public-group-select" class="form-select" style="padding-top: 8px; padding-bottom: 8px;">
                <option value="all">كافة الأفواج</option>
                ${GROUPS.map(g => `<option value="${g}">${g}</option>`).join('')}
              </select>
            </div>

            <!-- Gender & Level Chips -->
            <div class="filter-chips" id="filter-chips">
              <button class="filter-chip active" data-filter="all">الكل</button>
              <button class="filter-chip" data-filter="boys">الأولاد</button>
              <button class="filter-chip" data-filter="girls">البنات</button>
              <button class="filter-chip" data-filter="مبتدئ">مبتدئ</button>
              <button class="filter-chip" data-filter="متوسط">متوسط</button>
              <button class="filter-chip" data-filter="متقدم">متقدم</button>
            </div>

          </div>

          <div style="margin-top: var(--space-3); font-size: 11px; color: var(--text-muted); display: flex; justify-content: space-between; border-top: 1px solid var(--border-subtle); padding-top: var(--space-2);">
            <span id="public-students-count">جاري التحميل...</span>
          </div>
        </div>

        <!-- Students Grid -->
        <div class="students-grid stagger" id="students-grid"></div>

        <!-- Empty State -->
        <div class="empty-state" id="empty-state" style="display:none; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
          <div class="empty-icon"><i data-lucide="users"></i></div>
          <h3>لم يتم العثور على أي طالب</h3>
          <p>جرّب تعديل معايير البحث أو خيارات التصفية.</p>
        </div>

      </div>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
  initFilters();
  initSearch();
  renderStudentCards();
}

function renderStudentCards() {
  const students = getStudents();
  const grid = document.getElementById('students-grid');
  const emptyState = document.getElementById('empty-state');
  const counter = document.getElementById('public-students-count');
  
  let filtered = [...students];

  // Apply group filter
  if (currentGroup !== 'all') {
    filtered = filtered.filter(s => s.group === currentGroup);
  }

  // Apply chip filter
  if (currentFilter === 'boys') {
    filtered = filtered.filter(s => s.gender === 'ذكر');
  } else if (currentFilter === 'girls') {
    filtered = filtered.filter(s => s.gender === 'أنثى');
  } else if (['مبتدئ', 'متوسط', 'متقدم'].includes(currentFilter)) {
    filtered = filtered.filter(s => s.level === currentFilter);
  }

  // Apply search
  if (currentSearch) {
    const q = currentSearch.toLowerCase().trim();
    filtered = filtered.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
    );
  }

  if (counter) {
    counter.textContent = `عرض ${filtered.length} من إجمالي ${students.length} طالب وطالبة`;
  }

  if (filtered.length === 0) {
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (grid) grid.style.display = 'grid';
  if (emptyState) emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(student => {
    const progress = calculateMemorizationProgress(student.memorization);
    const attStats = getStudentAttendanceStats(student.id);
    const badgeClass = getLevelBadgeClass(student.level);
    const pointsData = getStudentPoints(student.id);
    
    return `
      <div class="student-card" data-student-id="${student.id}" onclick="window.location.hash='/student/${student.id}'">
        <div class="avatar-wrapper" style="margin-top: 4px;">
          ${renderAvatar(student.avatar, 'avatar-lg')}
        </div>
        
        <h3 class="student-name">${student.firstName} ${student.lastName}</h3>
        
        <div class="student-age">${student.age} سنوات • ${student.group}</div>
        
        <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-4);">
          <span class="badge ${badgeClass}">${student.level}</span>
          ${pointsData.total > 0 ? `<span class="badge badge-gold">+${pointsData.total} نقطة</span>` : ''}
        </div>
        
        <div class="student-stats">
          <div class="student-stat">
            <span class="label"><i data-lucide="book-open" style="color: var(--emerald-800);"></i> سورة الملك</span>
            <span class="value" style="color: var(--emerald-800);">${progress}%</span>
          </div>
          <div class="student-stat">
            <span class="label"><i data-lucide="calendar-check" style="color: var(--success);"></i> المواظبة</span>
            <span class="value" style="color: ${attStats.percentage >= 90 ? 'var(--success)' : (attStats.percentage >= 75 ? 'var(--brass-700)' : 'var(--danger)')};">
              ${attStats.percentage}%
            </span>
          </div>
        </div>

        <div style="width: 100%; margin-top: var(--space-4);">
          <div class="progress-bar progress-bar-sm">
            <div class="progress-fill" style="width: ${progress}%;"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initIcons();
}

function initFilters() {
  const chips = document.querySelectorAll('#filter-chips .filter-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderStudentCards();
    });
  });

  document.getElementById('public-group-select')?.addEventListener('change', (e) => {
    currentGroup = e.target.value;
    renderStudentCards();
  });
}

function initSearch() {
  const input = document.getElementById('student-search');
  if (input) {
    input.addEventListener('input', debounce((e) => {
      currentSearch = e.target.value;
      renderStudentCards();
    }, 200));
  }
}
