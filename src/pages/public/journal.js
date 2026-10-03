// ============================
// Public Journal Page (يوميات المدرسة والبرنامج)
// ============================

import { getJournalEntries, getWeeklySchedule, getAttendanceForDate, getStudents } from '../../data/store.js';
import { renderNavbar, initNavbar } from '../../components/navbar.js';
import { renderFooter } from '../../components/footer.js';
import { renderAvatar } from '../../utils/avatars.js';
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
    
    <main class="section" style="padding-top: var(--space-10);">
      <div class="container">
        <!-- Section Header -->
        <div class="section-header" style="margin-bottom: var(--space-8);">
          <h2>يوميات المدرسة والبرنامج</h2>
          <p>اطّلع على برنامج الحصص اليومية، التدريس، أحكام التجويد، وسجل الحضور (اضغط على الحضور للتفاصيل)</p>
        </div>

        <!-- Weekly Schedule Section -->
        <div class="card" style="margin-bottom: var(--space-10); border-top: 4px solid var(--green-500);">
          <div class="card-header" style="display: flex; justify-content: flex-start; align-items: center; gap: var(--space-4); background: var(--green-50); text-align: right;">
            <div class="stat-icon green" style="width: 44px; height: 44px; flex-shrink: 0;">
              <i data-lucide="calendar-range"></i>
            </div>
            <div style="text-align: right;">
              <h3 style="font-size: var(--font-size-lg); color: var(--green-700); margin-bottom: 2px; text-align: right;">الرزنامة الأسبوعية للحصص</h3>
              <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin: 0; text-align: right;">أوقات وبرامج الحصص الأسبوعية المعتمدة في المدرسة (من السبت إلى الأربعاء • 09:00 — 10:30)</p>
            </div>
          </div>
          <div class="card-body" style="padding: var(--space-6); background: var(--bg-primary);">
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-5); text-align: right;">
              ${schedule.map(item => `
                <div style="background: #ffffff; border: 1px solid var(--border-color); border-top: 4px solid var(--green-500); border-radius: var(--border-radius-lg); padding: var(--space-5); position: relative; text-align: right; box-shadow: var(--shadow-md); transition: transform var(--transition-base);">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-3); flex-direction: row-reverse;">
                    <span class="badge badge-green" style="background: var(--green-50); color: var(--green-700); font-weight: 700;">${item.fawj}</span>
                    <span style="font-weight: 800; color: var(--green-800); font-size: var(--font-size-lg);">${item.day}</span>
                  </div>
                  <div style="font-size: var(--font-size-xs); color: var(--green-700); font-weight: 600; display: flex; align-items: center; justify-content: flex-end; gap: var(--space-2); margin-bottom: var(--space-3); background: var(--green-50); padding: 6px 10px; border-radius: var(--border-radius-full); width: fit-content; margin-right: auto; margin-left: auto;">
                    <span>${item.time}</span>
                    <i data-lucide="clock" style="width: 14px; height: 14px;"></i>
                  </div>
                  <div style="font-size: var(--font-size-sm); line-height: 1.6; color: var(--text-secondary); text-align: center; font-weight: 500;">
                    ${item.activity}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Filter & Archive Tabs Bar -->
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-4); margin-bottom: var(--space-6);">
          <div>
            <h3 style="font-size: var(--font-size-xl); display: flex; align-items: center; gap: var(--space-2); color: var(--green-700);">
              <i data-lucide="book-open" style="color: var(--green-500);"></i>
              سجل اليوميات والحصص
            </h3>
          </div>
          
          <!-- View Tabs (الحصص الحالية / الأرشيف) -->
          <div class="filter-chips" id="journal-tab-chips">
            <button class="filter-chip ${selectedViewTab === 'active' ? 'active' : ''}" data-tab="active">
              <i data-lucide="sparkles" style="width:14px;height:14px;"></i>
              الحصص الحالية (${activeCount})
            </button>
            <button class="filter-chip ${selectedViewTab === 'archive' ? 'active' : ''}" data-tab="archive">
              <i data-lucide="archive" style="width:14px;height:14px;"></i>
              أرشيف اليوميات (${archiveCount})
            </button>
            <button class="filter-chip ${selectedViewTab === 'all' ? 'active' : ''}" data-tab="all">
              الكل (${journalEntries.length})
            </button>
          </div>
        </div>

        <!-- Groups Sub-Filter -->
        <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-6);">
          <span style="font-size: var(--font-size-xs); color: var(--text-muted);">الفوج:</span>
          <div class="filter-chips" id="journal-group-chips">
            <button class="filter-chip ${selectedGroupFilter === 'all' ? 'active' : ''}" data-group="all">جميع الأفواج</button>
            ${GROUPS.map(g => `
              <button class="filter-chip ${selectedGroupFilter === g ? 'active' : ''}" data-group="${g}">${g}</button>
            `).join('')}
          </div>
        </div>

        <!-- Journal Entries List -->
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
  let filtered = entries;

  // Filter by Archive Tab
  if (selectedViewTab === 'active') {
    filtered = filtered.filter(e => !e.archived);
  } else if (selectedViewTab === 'archive') {
    filtered = filtered.filter(e => e.archived);
  }

  // Filter by Group
  if (selectedGroupFilter !== 'all') {
    filtered = filtered.filter(e => e.group === selectedGroupFilter || e.group === 'الكل');
  }

  if (filtered.length === 0) {
    const emptyTitle = selectedViewTab === 'archive' ? 'لا توجد يوميات مؤرشفة حالياً' : 'لا توجد يوميات مسجلة لهذا الفوج';
    const emptyDesc = selectedViewTab === 'archive' ? 'اليوميات السابقة التي تتم أرشفتها ستظهر هنا' : 'سيقوم المعلم بإضافة ملخصات الحصص اليومية قريباً';
    return `
      <div class="empty-state">
        <div class="empty-icon"><i data-lucide="${selectedViewTab === 'archive' ? 'archive' : 'book-open'}"></i></div>
        <h3>${emptyTitle}</h3>
        <p>${emptyDesc}</p>
      </div>
    `;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: var(--space-8); position: relative; padding-right: 24px; margin-top: var(--space-4);">
      <!-- Vertical Timeline Line -->
      <div style="position: absolute; right: 8px; top: 10px; bottom: 10px; width: 3px; background: linear-gradient(to bottom, var(--green-300), var(--green-100)); border-radius: 4px;"></div>
      
      ${filtered.map((entry, index) => `
        <article style="position: relative;">
          <!-- Timeline Dot -->
          <div style="position: absolute; right: -25px; top: 20px; width: 18px; height: 18px; border-radius: 50%; background: ${entry.archived ? 'var(--gray-300)' : 'var(--green-500)'}; border: 4px solid var(--bg-secondary); box-shadow: 0 0 0 2px ${entry.archived ? 'var(--gray-200)' : 'var(--green-200)'}; z-index: 1;"></div>
          
          <div class="card card-interactive" style="border: 1px solid var(--border-color); box-shadow: var(--shadow-md); border-radius: var(--border-radius-xl); overflow: hidden; background: #ffffff;">
            <!-- Card Header -->
            <div style="padding: var(--space-4) var(--space-5); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-3); background: ${entry.archived ? 'var(--gray-50)' : 'linear-gradient(to left, #f0fdf4, #ffffff)'}; border-bottom: 1px solid var(--border-color);">
              <div>
                <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: 6px;">
                  <span class="badge ${entry.archived ? 'badge-gray' : 'badge-green'}" style="font-weight: 700; font-size: 11px;">${entry.group || 'جميع الأفواج'}</span>
                  ${entry.archived ? `<span class="badge badge-gray" style="display:flex;align-items:center;gap:4px;"><i data-lucide="archive" style="width:12px;height:12px;"></i> مأرشف</span>` : ''}
                  <span style="font-size: var(--font-size-xs); color: var(--text-muted); display: flex; align-items: center; gap: 4px; font-weight: 500;">
                    <i data-lucide="calendar-days" style="width: 14px; height: 14px;"></i>
                    ${formatDate(entry.date)}
                  </span>
                </div>
                <h3 style="font-size: var(--font-size-xl); color: ${entry.archived ? 'var(--text-secondary)' : 'var(--green-800)'}; margin: 0; font-weight: 800;">${entry.title}</h3>
              </div>
            </div>
            
            <!-- Card Body -->
            <div style="padding: var(--space-5);">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-5);">
                ${entry.memorizationText ? `
                  <div style="background: #f4fdf8; border: 1px solid #dcf5e3; padding: var(--space-4); border-radius: var(--border-radius-lg);">
                    <h4 style="font-size: var(--font-size-sm); color: var(--green-700); font-weight: 700; display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
                      <div style="background: var(--green-100); padding: 6px; border-radius: 8px;"><i data-lucide="book-marked" style="width: 16px; height: 16px; color: var(--green-700);"></i></div>
                      التدريس والحفظ
                    </h4>
                    <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; line-height: 1.8; font-weight: 500;">
                      ${entry.memorizationText}
                    </p>
                  </div>
                ` : ''}

                ${entry.tajweedText ? `
                  <div style="background: #fffbef; border: 1px solid #fef0c7; padding: var(--space-4); border-radius: var(--border-radius-lg);">
                    <h4 style="font-size: var(--font-size-sm); color: var(--gold-600); font-weight: 700; display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-3);">
                      <div style="background: #fef0c7; padding: 6px; border-radius: 8px;"><i data-lucide="award" style="width: 16px; height: 16px; color: var(--gold-600);"></i></div>
                      أحكام التجويد
                    </h4>
                    <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0; line-height: 1.8; font-weight: 500;">
                      ${entry.tajweedText}
                    </p>
                  </div>
                ` : ''}
              </div>

              ${entry.activitiesText || entry.homeworkText ? `
                <div style="margin-top: var(--space-5); padding-top: var(--space-5); border-top: 1px dashed var(--border-color); display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-5);">
                  ${entry.activitiesText ? `
                    <div style="display: flex; gap: var(--space-3);">
                      <div style="color: var(--info); padding-top: 2px;"><i data-lucide="target" style="width: 18px; height: 18px;"></i></div>
                      <div>
                        <span style="font-weight: 700; font-size: var(--font-size-sm); color: var(--text-primary); display: block; margin-bottom: 6px;">أنشطة وتطبيقات الحصة</span>
                        <span style="font-size: var(--font-size-sm); color: var(--text-muted); line-height: 1.7; display: block;">${entry.activitiesText}</span>
                      </div>
                    </div>
                  ` : ''}
                  ${entry.homeworkText ? `
                    <div style="display: flex; gap: var(--space-3);">
                      <div style="color: var(--green-600); padding-top: 2px;"><i data-lucide="home" style="width: 18px; height: 18px;"></i></div>
                      <div>
                        <span style="font-weight: 700; font-size: var(--font-size-sm); color: var(--text-primary); display: block; margin-bottom: 6px;">الواجب والبرنامج المنزلي للأولياء</span>
                        <span style="font-size: var(--font-size-sm); color: var(--green-800); font-weight: 600; line-height: 1.7; display: block;">${entry.homeworkText}</span>
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              <!-- Daily Attendance Record Summary (Clickable for full list) -->
              ${(() => {
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

                const total = recordedCount;

                return `
                  <div style="margin-top: var(--space-5); padding-top: var(--space-4); border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3);">
                    <div style="display: flex; align-items: center; gap: var(--space-2); font-size: var(--font-size-sm); font-weight: 700; color: var(--text-secondary);">
                      <i data-lucide="users" style="width: 18px; height: 18px; color: var(--green-500);"></i>
                      <span>سجل حضور الطلبة لهذه الحصة</span>
                    </div>
                    ${total > 0 ? `
                      <button class="btn btn-ghost btn-sm view-att-details-btn" data-date="${entry.date}" data-group="${entry.group || 'الكل'}" title="عرض تفاصيل الحضور" style="background: #f8fafc; border: 1px solid #e2e8f0; color: var(--text-primary); font-weight: 700; padding: 6px 14px; border-radius: var(--border-radius-full);">
                        <span style="color: var(--green-600);">● ${present} حاضر</span> &nbsp;|&nbsp; 
                        <span style="color: #ef4444;">● ${absent} غائب</span> 
                        ${excused > 0 ? `&nbsp;|&nbsp; <span style="color: #f59e0b;">● ${excused} بعذر</span>` : ''} 
                        <i data-lucide="chevron-left" style="width: 16px; height: 16px; margin-right: 8px; color: var(--text-muted);"></i>
                      </button>
                    ` : `
                      <span class="badge badge-gray" style="font-size: 12px; font-weight: 500; background: var(--gray-100);">لم يُسجل الحضور بعد</span>
                    `}
                  </div>
                `;
              })()}
            </div>
          </div>
        </article>
      `).join('')}
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
  const unrecordedStudents = students.filter(s => !att[s.id]);

  const bodyHtml = `
    <div style="margin-bottom: var(--space-4); text-align: center;">
      <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: 2px;">تاريخ الحصة:</div>
      <div style="font-size: var(--font-size-base); font-weight: 700; color: var(--green-700);">${formatDate(date)} (ميلادي)</div>
    </div>

    <!-- Summary Badges -->
    <div style="display: flex; justify-content: center; gap: var(--space-3); margin-bottom: var(--space-6); flex-wrap: wrap;">
      <span class="badge badge-green" style="font-size: 13px; padding: 6px 14px;">🟢 ${presentStudents.length} حاضر</span>
      <span class="badge" style="font-size: 13px; padding: 6px 14px; background: #fef2f2; color: #dc2626;">🔴 ${absentStudents.length} غائب</span>
      ${excusedStudents.length > 0 ? `<span class="badge" style="font-size: 13px; padding: 6px 14px; background: #fffbeb; color: #d97706;">🟡 ${excusedStudents.length} بعذر</span>` : ''}
    </div>

    <div style="display: flex; flex-direction: column; gap: var(--space-6);">
      <!-- Present Students Section -->
      <div>
        <h4 style="font-size: var(--font-size-sm); color: var(--green-700); margin-bottom: var(--space-3); display: flex; align-items: center; gap: var(--space-2); border-bottom: 2px solid var(--green-200); padding-bottom: 6px;">
          <i data-lucide="check-circle-2" style="width: 18px; height: 18px; color: var(--green-600);"></i>
          قائمة الحاضرين في الحصة (${presentStudents.length})
        </h4>
        ${presentStudents.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-2);">
            ${presentStudents.map(s => `
              <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: var(--space-2) var(--space-3); border-radius: var(--border-radius-md); text-align: right;">
                <div style="font-weight: 700; font-size: var(--font-size-xs); color: var(--green-800);">${s.firstName} ${s.lastName}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${s.group}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="font-size: var(--font-size-xs); color: var(--text-muted); font-style: italic;">لا يوجد حاضرين مسجلين</p>
        `}
      </div>

      <!-- Absent Students Section -->
      <div>
        <h4 style="font-size: var(--font-size-sm); color: #dc2626; margin-bottom: var(--space-3); display: flex; align-items: center; gap: var(--space-2); border-bottom: 2px solid #fecdd3; padding-bottom: 6px;">
          <i data-lucide="x-circle" style="width: 18px; height: 18px; color: #dc2626;"></i>
          قائمة الغائبين عن الحصة (${absentStudents.length})
        </h4>
        ${absentStudents.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-2);">
            ${absentStudents.map(s => `
              <div style="background: #fef2f2; border: 1px solid #fecdd3; padding: var(--space-2) var(--space-3); border-radius: var(--border-radius-md); text-align: right;">
                <div style="font-weight: 700; font-size: var(--font-size-xs); color: #991b1b;">${s.firstName} ${s.lastName}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${s.group}</div>
              </div>
            `).join('')}
          </div>
        ` : `
          <p style="font-size: var(--font-size-xs); color: var(--green-600); font-weight: 500;">لا يوجد غائبين في هذه الحصة 🎉</p>
        `}
      </div>

      <!-- Excused Students Section (if any) -->
      ${excusedStudents.length > 0 ? `
        <div>
          <h4 style="font-size: var(--font-size-sm); color: #d97706; margin-bottom: var(--space-3); display: flex; align-items: center; gap: var(--space-2); border-bottom: 2px solid #fef3c7; padding-bottom: 6px;">
            <i data-lucide="alert-circle" style="width: 18px; height: 18px; color: #d97706;"></i>
            قائمة الغائبين بعذر (${excusedStudents.length})
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-2);">
            ${excusedStudents.map(s => `
              <div style="background: #fffbeb; border: 1px solid #fef3c7; padding: var(--space-2) var(--space-3); border-radius: var(--border-radius-md); text-align: right;">
                <div style="font-weight: 700; font-size: var(--font-size-xs); color: #92400e;">${s.firstName} ${s.lastName}</div>
                <div style="font-size: 10px; color: var(--text-muted);">${s.group}</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  openModal('قائمة الحضور والغياب التفصيلية', bodyHtml);
  initIcons();
}

function initJournalFilters() {
  // Tab Filter (الحصص الحالية / الأرشيف / الكل)
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

  // Group Filter
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
