// ============================
// Students List Page (Public)
// ============================

import { getStudents } from '../../data/store.js';
import { getStudentAttendanceStats } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { renderAvatar } from '../../utils/avatars.js';
import { initIcons, calculateMemorizationProgress, getLevelBadgeClass, debounce } from '../../utils/helpers.js';

let currentFilter = 'all';
let currentSearch = '';

export function renderStudentsPage() {
  const app = document.getElementById('app');
  
  app.innerHTML = `
    ${renderNavbar('/students')}
    
    <main class="section" style="padding-top: var(--space-10);">
      <div class="container">
        <div class="section-header" style="margin-bottom: var(--space-8);">
          <h2>الطلبة</h2>
          <p>تعرف على طلاب المدرسة القرآنية ومستوياتهم</p>
        </div>

        <!-- Search & Filter -->
        <div class="search-filter-bar">
          <div class="search-box">
            <span class="search-icon"><i data-lucide="search"></i></span>
            <input type="text" id="student-search" placeholder="ابحث عن طالب..." class="form-input">
          </div>
          <div class="filter-chips" id="filter-chips">
            <button class="filter-chip active" data-filter="all">الكل</button>
            <button class="filter-chip" data-filter="boys">الأولاد</button>
            <button class="filter-chip" data-filter="girls">البنات</button>
            <button class="filter-chip" data-filter="مبتدئ">مبتدئ</button>
            <button class="filter-chip" data-filter="متوسط">متوسط</button>
            <button class="filter-chip" data-filter="متقدم">متقدم</button>
          </div>
        </div>

        <!-- Students Grid -->
        <div class="students-grid stagger" id="students-grid">
        </div>

        <!-- Empty State -->
        <div class="empty-state" id="empty-state" style="display:none;">
          <div class="empty-icon">
            <i data-lucide="users"></i>
          </div>
          <h3>لم يتم العثور على طلبة</h3>
          <p>جرّب تغيير معايير البحث أو الفلتر</p>
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
  
  let filtered = students;

  // Apply filter
  if (currentFilter === 'boys') {
    filtered = filtered.filter(s => s.gender === 'ذكر');
  } else if (currentFilter === 'girls') {
    filtered = filtered.filter(s => s.gender === 'أنثى');
  } else if (['مبتدئ', 'متوسط', 'متقدم'].includes(currentFilter)) {
    filtered = filtered.filter(s => s.level === currentFilter);
  }

  // Apply search
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(s => 
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    grid.style.display = 'none';
    emptyState.style.display = 'block';
    if (students.length === 0) {
      emptyState.querySelector('h3').textContent = 'لم تتم إضافة أي طلبة بعد';
      emptyState.querySelector('p').textContent = 'سيظهر الطلبة هنا بعد إضافتهم من لوحة التحكم';
    }
    return;
  }

  grid.style.display = 'grid';
  emptyState.style.display = 'none';

  grid.innerHTML = filtered.map(student => {
    const progress = calculateMemorizationProgress(student.memorization);
    const attStats = getStudentAttendanceStats(student.id);
    const badgeClass = getLevelBadgeClass(student.level);
    
    return `
      <div class="student-card" data-student-id="${student.id}" onclick="window.location.hash='/student/${student.id}'">
        <div class="avatar-wrapper">
          ${renderAvatar(student.avatar, 'avatar-lg')}
        </div>
        <div class="student-name">${student.firstName} ${student.lastName}</div>
        <div class="student-age">${student.age} سنوات • ${student.gender === 'ذكر' ? 'ولد' : 'بنت'}</div>
        <span class="badge ${badgeClass}" style="margin-bottom: var(--space-4);">${student.level}</span>
        <div class="student-stats">
          <div class="student-stat">
            <span class="label"><i data-lucide="book-open"></i> الحفظ</span>
            <span class="value">${progress}%</span>
          </div>
          <div class="student-stat">
            <span class="label"><i data-lucide="calendar-check"></i> الحضور</span>
            <span class="value" style="color: ${attStats.percentage >= 90 ? 'var(--green-500)' : attStats.percentage >= 75 ? 'var(--gold-500)' : 'var(--danger)'};">${attStats.percentage}%</span>
          </div>
        </div>
        <div style="width:100%; margin-top: var(--space-4);">
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
