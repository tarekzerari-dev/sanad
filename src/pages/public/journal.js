// ============================================================
// سند — Public Journal Page (يوميات المدرسة والبرنامج الأسبوعي)
// ============================================================

import { getJournalEntries, getWeeklySchedule, getAttendanceForDate, getStudents } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { openModal } from '../../components/modal.js';
import { initIcons, formatDate, GROUPS } from '../../utils/helpers.js';

let selectedGroupFilter = 'all';
let selectedViewTab = 'active'; // 'active' | 'archive' | 'all'

export function renderJournalPage() {
  const app = document.getElementById('app');
  const journalEntries = getJournalEntries();
  const schedule = getWeeklySchedule();

  const activeCount = journalEntries.filter(e => !e.archived).length;
  const archiveCount = journalEntries.filter(e => e.archived).length;

  app.innerHTML = `
    ${renderNavbar('/journal')}
    
    <main class="section" style="padding-top: var(--space-8); padding-bottom: var(--space-16); background: var(--bg-canvas);">
      <div class="container">
        
        <!-- Section Header -->
        <div class="section-header" style="margin-bottom: var(--space-6);">
          <h2 style="font-family: var(--font-heading); font-size: 2.25rem; color: var(--emerald-950);">يوميات المدرسة والبرنامج التعليمي</h2>
          <p>متابعة تفاصيل الحصص اليومية المقررة، تطبيقات أحكام التجويد، والرزنامة الأسبوعية للحلقات</p>
        </div>

        <!-- Weekly Schedule Section -->
        <div class="card" style="margin-bottom: var(--space-8); border-top: 3px solid var(--emerald-800);">
          <div class="card-header" style="background: var(--bg-canvas);">
            <div style="display: flex; align-items: center; gap: var(--space-3);">
              <div class="stat-icon green" style="width: 38px; height: 38px;">
                <i data-lucide="calendar-range"></i>
              </div>
              <div>
                <h3 style="font-family: var(--font-heading); font-size: 1.15rem; color: var(--emerald-950); margin: 0;">الرزنامة والتوقيت الأسبوعي للحصص</h3>
                <p style="font-size: 11px; color: var(--text-muted); margin: 0;">مواقيت وبرامج الحصص القرآنية المعتمدة في مدرسة سند (09:00 — 10:30)</p>
              </div>
            </div>
            <span class="badge badge-green" style="font-size: 11px;">الموسم الدراسي الحالي</span>
          </div>

          <div class="card-body">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: var(--space-4);">
              ${schedule.map(item => `
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-top: 3px solid var(--brass-500); border-radius: var(--border-radius-md); padding: var(--space-4); box-shadow: var(--shadow-xs);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                    <span style="font-family: var(--font-heading); font-weight: 700; color: var(--emerald-950); font-size: 1.1rem;">${item.day}</span>
                    <span class="badge badge-gray" style="font-size: 10px;">${item.fawj}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--brass-700); font-weight: 600; display: flex; align-items: center; gap: 4px; margin-bottom: var(--space-2); background: var(--brass-50); padding: 4px 8px; border-radius: var(--border-radius-sm); border: 1px solid var(--brass-200); width: fit-content;">
                    <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
                    <span>${item.time}</span>
                  </div>
                  <div style="font-size: var(--font-size-xs); line-height: 1.6; color: var(--text-secondary);">
                    ${item.activity}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Filter & Archive Tabs Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-5);">
          <div>
            <h3 style="font-family: var(--font-heading); font-size: 1.35rem; color: var(--emerald-950); margin: 0; display: flex; align-items: center; gap: var(--space-2);">
              <i data-lucide="book-open" style="width: 20px; height: 20px; color: var(--emerald-800);"></i>
              <span>سجل مدونات الحصص اليومية</span>
            </h3>
          </div>
          
          <!-- View Tabs (الحصص الحالية / الأرشيف) -->
          <div class="filter-chips" id="journal-tab-chips">
            <button class="filter-chip ${selectedViewTab === 'active' ? 'active' : ''}" data-tab="active">
              الحصص الجارية (${activeCount})
            </button>
            <button class="filter-chip ${selectedViewTab === 'archive' ? 'active' : ''}" data-tab="archive">
              الأرشيف (${archiveCount})
            </button>
            <button class="filter-chip ${selectedViewTab === 'all' ? 'active' : ''}" data-tab="all">
              الكل (${journalEntries.length})
            </button>
          </div>
        </div>

        <!-- Groups Sub-Filter -->
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
          <span style="font-size: var(--font-size-xs); font-weight: 700; color: var(--text-muted); text-transform: uppercase;">الفوج:</span>
          <div class="filter-chips" id="journal-group-chips">
            <button class="filter-chip ${selectedGroupFilter === 'all' ? 'active' : ''}" data-group="all">جميع الأفواج</button>
            ${GROUPS.map(g => `
              <button class="filter-chip ${selectedGroupFilter === g ? 'active' : ''}" data-group="${g}">${g}</button>
            `).join('')}
          </div>
        </div>

        <!-- Journal Entries Timeline Container -->
        <div id="journal-entries-container">
          ${renderEntriesList(journalEntries)}
        </div>

      </div>
    </main>

    ${renderFooter()}
  `;

  initNavbar();
  initIcons();
  initJournalFilters();
}

function renderEntriesList(entries) {
  let filtered = [...entries];

  if (selectedViewTab === 'active') {
    filtered = filtered.filter(e => !e.archived);
  } else if (selectedViewTab === 'archive') {
    filtered = filtered.filter(e => e.archived);
  }

  if (selectedGroupFilter !== 'all') {
    filtered = filtered.filter(e => e.group === selectedGroupFilter || e.group === 'الكل');
  }

  if (filtered.length === 0) {
    const emptyTitle = selectedViewTab === 'archive' ? 'لا توجد يوميات مؤرشفة حالياً' : 'لا توجد مدونات مسجلة لهذا الفوج';
    const emptyDesc = selectedViewTab === 'archive' ? 'اليوميات السابقة المؤرشفة ستظهر هنا.' : 'سيقوم المعلم بإضافة ملخصات وتفاصيل الحصص قريباً.';
    return `
      <div class="empty-state" style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg);">
        <div class="empty-icon"><i data-lucide="${selectedViewTab === 'archive' ? 'archive' : 'book-open'}"></i></div>
        <h3>${emptyTitle}</h3>
        <p>${emptyDesc}</p>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-6); position: relative; padding-right: 20px;">
      <!-- Subtle Vertical Timeline Line -->
      <div style="position: absolute; right: 8px; top: 12px; bottom: 12px; width: 2px; background: var(--emerald-200); border-radius: 2px;"></div>
      
      ${filtered.map((entry) => {
        const att = getAttendanceForDate(entry.date);
        let entryStudents = getStudents();
        if (entry.group && entry.group !== 'الكل' && entry.group !== 'all') {
          entryStudents = entryStudents.filter(s => s.group === entry.group);
        }
        
        let present = 0, absent = 0, excused = 0, recordedCount = 0;
        entryStudents.forEach(s => {
          if (att[s.id]) {
            recordedCount++;
            if (att[s.id] === 'present') present++;
            else if (att[s.id] === 'absent') absent++;
            else if (att[s.id] === 'excused') excused++;
          }
        });

        return `
          <article style="position: relative;">
            <!-- Timeline Pin Dot -->
            <div style="position: absolute; right: -18px; top: 22px; width: 14px; height: 14px; border-radius: 50%; background: ${entry.archived ? 'var(--text-muted)' : 'var(--emerald-800)'}; border: 3px solid var(--bg-canvas); z-index: 1;"></div>
            
            <div class="card card-interactive" style="border: 1px solid var(--border-color); box-shadow: var(--shadow-xs);">
              
              <!-- Header -->
              <div style="padding: var(--space-4) var(--space-5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); background: var(--bg-canvas); border-bottom: 1px solid var(--border-subtle);">
                <div style="display: flex; align-items: center; gap: var(--space-3);">
                  <span class="badge ${entry.archived ? 'badge-gray' : 'badge-green'}" style="font-weight: 700; font-size: 11px;">${entry.group || 'جميع الأفواج'}</span>
                  ${entry.archived ? `<span class="badge badge-gray" style="font-size: 10px;">مؤرشف</span>` : ''}
                  <span style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 4px;">
                    <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                    ${formatDate(entry.date)}
                  </span>
                </div>
              </div>
              
              <!-- Body -->
              <div class="card-body">
                <h3 style="font-family: var(--font-heading); font-size: 1.35rem; color: var(--emerald-950); margin-bottom: var(--space-4);">
                  ${entry.title}
                </h3>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-4);">
                  
                  <!-- Memorization Block -->
                  ${entry.memorizationText ? `
                    <div style="background: var(--bg-canvas); border: 1px solid var(--border-color); padding: var(--space-4); border-radius: var(--border-radius-md);">
                      <div style="font-size: 12px; color: var(--emerald-800); font-weight: 700; display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <i data-lucide="book-open" style="width: 15px; height: 15px;"></i>
                        <span>ما تم تدريسه وتسميعه</span>
                      </div>
                      <p class="reading-content" style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; line-height: 1.75;">
                        ${entry.memorizationText}
                      </p>
                    </div>
                  ` : ''}

                  <!-- Tajweed Block -->
                  ${entry.tajweedText ? `
                    <div style="background: var(--brass-50); border: 1px solid var(--brass-200); padding: var(--space-4); border-radius: var(--border-radius-md);">
                      <div style="font-size: 12px; color: var(--brass-700); font-weight: 700; display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                        <i data-lucide="mic-2" style="width: 15px; height: 15px;"></i>
                        <span>أحكام التجويد ومخارج الحروف</span>
                      </div>
                      <p class="reading-content" style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; line-height: 1.75;">
                        ${entry.tajweedText}
                      </p>
                    </div>
                  ` : ''}

                </div>

                <!-- Activities & Homework -->
                ${entry.activitiesText || entry.homeworkText ? `
                  <div style="padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: var(--space-2);">
                    ${entry.activitiesText ? `
                      <div style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.6;">
                        <strong>الأنشطة الصفية:</strong> ${entry.activitiesText}
                      </div>
                    ` : ''}
                    ${entry.homeworkText ? `
                      <div style="background: var(--bg-canvas); border: 1px solid var(--brass-300); border-radius: var(--border-radius-sm); padding: 8px 12px; font-size: 12px; color: var(--brass-800); display: flex; align-items: center; gap: var(--space-2);">
                        <i data-lucide="check-square" style="width: 15px; height: 15px; color: var(--brass-600);"></i>
                        <span><strong>الواجب المنزلي للأولياء:</strong> ${entry.homeworkText}</span>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}

                <!-- Attendance Strip -->
                <div style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
                  <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-xs); font-weight: 600; color: var(--text-secondary);">
                    <i data-lucide="users" style="width: 15px; height: 15px; color: var(--emerald-800);"></i>
                    <span>حضور هذه الحصة:</span>
                  </div>

                  ${recordedCount > 0 ? `
                    <button class="btn btn-ghost btn-sm view-att-details-btn" data-date="${entry.date}" data-group="${entry.group || 'الكل'}" title="عرض تفاصيل الحضور" style="background: var(--bg-canvas); border: 1px solid var(--border-color); font-size: 11px; padding: 4px 12px; border-radius: var(--border-radius-full);">
                      <span style="color: var(--success); font-weight: 700;">● ${present} حاضر</span> &nbsp;|&nbsp; 
                      <span style="color: var(--danger); font-weight: 700;">● ${absent} غائب</span> 
                      ${excused > 0 ? `&nbsp;|&nbsp; <span style="color: var(--warning); font-weight: 700;">● ${excused} بعذر</span>` : ''} 
                      <i data-lucide="chevron-left" style="width: 14px; height: 14px; margin-right: 4px;"></i>
                    </button>
                  ` : `
                    <span class="badge badge-gray" style="font-size: 11px;">لم يُسجل الحضور بعد</span>
                  `}
                </div>

              </div>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function openAttendanceDetailsModal(date, groupFilter) {
  const att = getAttendanceForDate(date);
  let students = getStudents();

  if (groupFilter && groupFilter !== 'الكل' && groupFilter !== 'all') {
    students = students.filter(s => s.group === groupFilter);
  }

  const presentStudents = students.filter(s => att[s.id] === 'present');
  const absentStudents = students.filter(s => att[s.id] === 'absent');
  const excusedStudents = students.filter(s => att[s.id] === 'excused');

  const bodyHtml = `
    <div style="margin-bottom: var(--space-4); text-align: center;">
      <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: 2px;">تاريخ الحصة القرآنية:</div>
      <div style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: var(--emerald-950);">${formatDate(date)}</div>
    </div>

    <!-- Summary Badges -->
    <div style="display: flex; justify-content: center; gap: var(--space-2); margin-bottom: var(--space-5); flex-wrap: wrap;">
      <span class="badge badge-green" style="font-size: 12px; padding: 5px 12px;">🟢 ${presentStudents.length} حاضر</span>
      <span class="badge badge-red" style="font-size: 12px; padding: 5px 12px;">🔴 ${absentStudents.length} غائب</span>
      ${excusedStudents.length > 0 ? `<span class="badge badge-gold" style="font-size: 12px; padding: 5px 12px;">🟡 ${excusedStudents.length} بعذر</span>` : ''}
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-5);">
      <!-- Present -->
      <div>
        <div style="font-size: 12px; font-weight: 700; color: var(--success); margin-bottom: var(--space-2); padding-bottom: 4px; border-bottom: 1.5px solid var(--emerald-100);">
          قائمة الحاضرين (${presentStudents.length})
        </div>
        ${presentStudents.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-2);">
            ${presentStudents.map(s => `
              <div style="background: var(--att-present-bg); border: 1px solid var(--att-present-border); padding: 6px 10px; border-radius: var(--border-radius-sm);">
                <div style="font-weight: 700; font-size: var(--font-size-xs); color: var(--att-present-text);">${s.firstName} ${s.lastName}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${s.group}</div>
              </div>
            `).join('')}
          </div>
        ` : `<p style="font-size: 11px; color: var(--text-muted);">لا يوجد حاضرون مسجلون</p>`}
      </div>

      <!-- Absent -->
      <div>
        <div style="font-size: 12px; font-weight: 700; color: var(--danger); margin-bottom: var(--space-2); padding-bottom: 4px; border-bottom: 1.5px solid #fecdd3;">
          قائمة الغائبين (${absentStudents.length})
        </div>
        ${absentStudents.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-2);">
            ${absentStudents.map(s => `
              <div style="background: var(--att-absent-bg); border: 1px solid var(--att-absent-border); padding: 6px 10px; border-radius: var(--border-radius-sm);">
                <div style="font-weight: 700; font-size: var(--font-size-xs); color: var(--att-absent-text);">${s.firstName} ${s.lastName}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${s.group}</div>
              </div>
            `).join('')}
          </div>
        ` : `<p style="font-size: 11px; color: var(--success); font-weight: 600;">لا يوجد غائبون في هذه الحصة 🎉</p>`}
      </div>

      <!-- Excused -->
      ${excusedStudents.length > 0 ? `
        <div>
          <div style="font-size: 12px; font-weight: 700; color: var(--warning); margin-bottom: var(--space-2); padding-bottom: 4px; border-bottom: 1.5px solid var(--brass-200);">
            قائمة الغائبين بعذر (${excusedStudents.length})
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: var(--space-2);">
            ${excusedStudents.map(s => `
              <div style="background: var(--att-excused-bg); border: 1px solid var(--att-excused-border); padding: 6px 10px; border-radius: var(--border-radius-sm);">
                <div style="font-weight: 700; font-size: var(--font-size-xs); color: var(--att-excused-text);">${s.firstName} ${s.lastName}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${s.group}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  openModal('قائمة الحضور والغياب الموثقة للحصة', bodyHtml);
  initIcons();
}

function initJournalFilters() {
  const tabChips = document.querySelectorAll('#journal-tab-chips .filter-chip');
  tabChips.forEach(chip => {
    chip.addEventListener('click', () => {
      tabChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedViewTab = chip.dataset.tab;
      const container = document.getElementById('journal-entries-container');
      if (container) {
        container.innerHTML = renderEntriesList(getJournalEntries());
        initIcons();
        attachAttendanceModalListeners();
      }
    });
  });

  const groupChips = document.querySelectorAll('#journal-group-chips .filter-chip');
  groupChips.forEach(chip => {
    chip.addEventListener('click', () => {
      groupChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedGroupFilter = chip.dataset.group;
      const container = document.getElementById('journal-entries-container');
      if (container) {
        container.innerHTML = renderEntriesList(getJournalEntries());
        initIcons();
        attachAttendanceModalListeners();
      }
    });
  });

  attachAttendanceModalListeners();
}

function attachAttendanceModalListeners() {
  document.querySelectorAll('.view-att-details-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const date = btn.dataset.date;
      const group = btn.dataset.group;
      openAttendanceDetailsModal(date, group);
    });
  });
}
