// ============================
// سند — Main Entry Point
// ============================

import './style.css';
import { Router } from './utils/router.js';
import { isAdminLoggedIn, pullFromCloud, getStudents, addStudent, deleteStudent, addPointEntry, pushToCloud, addJournalEntry, setAttendanceForDate, getJournalEntries, updateStudent, addCompetition, getCompetitions } from './data/store.js';
import { generateId } from './utils/helpers.js';
import { seedData } from './data/seed.js';

// Import pages
import { renderHomePage } from './pages/public/home.js';
import { renderJournalPage } from './pages/public/journal.js';
import { renderStudentsPage } from './pages/public/students.js';
import { renderStudentProfilePage } from './pages/public/student-profile.js';
import { renderLeaderboardPage } from './pages/public/leaderboard.js';
import { renderCompetitionsPage } from './pages/public/competitions.js';
import { renderAboutPage } from './pages/public/about.js';
import { renderDeveloperPage } from './pages/public/developer.js';
import { renderLoginPage } from './pages/admin/login.js';
import { renderDashboardPage } from './pages/admin/dashboard.js';
import { renderManageJournalPage } from './pages/admin/manage-journal.js';
import { renderManageStudentsPage } from './pages/admin/manage-students.js';
import { renderAttendancePage } from './pages/admin/attendance.js';
import { renderMemorizationPage } from './pages/admin/memorization.js';
import { renderManageCompetitionsPage } from './pages/admin/manage-competitions.js';
import { renderPointsPage } from './pages/admin/points.js';
import { renderWheelPage } from './pages/admin/wheel.js';
import { renderSettingsPage } from './pages/admin/settings.js';

// Initialize seed data on first visit
seedData();

// Setup router
const router = new Router();

// Auto pull latest data from cloud API on load (for cross-device sync)
pullFromCloud().then(updated => {
  // Migration script for updating data requested by the user
  if (!localStorage.getItem('sanad_migration_4_1')) {
    const students = getStudents();
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Delete student "أمير حفصة" (or "أميرة")
    const amir = students.find(s => s.lastName === 'حفصة' || s.firstName === 'أميرة');
    if (amir) deleteStudent(amir.id);
    
    // 2. Add Yacoub Yacoub
    if (!students.find(s => s.firstName === 'يعقوب' && s.lastName === 'يعقوب')) {
      addStudent({ id: generateId(), firstName: 'يعقوب', lastName: 'يعقوب', age: 10, gender: 'ذكر', avatar: 'boy1', level: 'مبتدئ', group: 'الفوج 1', registrationDate: today, notes: '', memorization: [], lastUpdate: today });
    }
    
    // 3. Add Asma Nadja
    if (!students.find(s => s.firstName === 'أسماء' && s.lastName === 'نعجة')) {
      addStudent({ id: generateId(), firstName: 'أسماء', lastName: 'نعجة', age: 11, gender: 'أنثى', avatar: 'girl2', level: 'مبتدئ', group: 'الفوج 1', registrationDate: today, notes: '', memorization: [], lastUpdate: today });
    }
    
    // 4. Add Points
    const updatedStudents = getStudents(); // Refresh list
    const pointsToAdd = [
      { f: 'سيرين', l: 'قندوزي', pts: 4 },
      { f: 'مرام', l: 'كاملي', pts: 1 },
      { f: 'نعمة', l: 'جباري', pts: 5 },
      { f: 'مهدي', l: 'كاملي', pts: 3 },
      { f: 'إياد', l: 'كاملي', pts: 7 },
      { f: 'زكريا', l: 'بوشكوة', pts: 4 },
      { f: 'محمد', l: 'كاملي', pts: 1 },
      { f: 'إبراهيم', l: 'حرزلاوي', pts: 1 },
      { f: 'سامي', l: 'شهادة', pts: 2 },
      { f: 'لؤي', l: 'شهادة', pts: 2 },
    ];
    
    pointsToAdd.forEach(p => {
      const st = updatedStudents.find(s => s.firstName.includes(p.f) && s.lastName.includes(p.l));
      if (st) {
        addPointEntry(st.id, p.pts, 'مكافأة المشاركة والمواظبة', today);
      }
    });

    localStorage.setItem('sanad_migration_4_1', 'true');
    console.log('Data migration 4.1 completed.');
    pushToCloud();
  }

  // Migration 4.2: Add past week journal entries and full attendance, plus tomorrow's entry
  if (!localStorage.getItem('sanad_migration_4_2')) {
    const students = getStudents();
    const entries = getJournalEntries();

    const pastDates = [
      { date: '2026-08-09', title: 'حصة يوم الأحد 9 أوت 2026' },
      { date: '2026-08-10', title: 'حصة يوم الاثنين 10 أوت 2026' },
      { date: '2026-08-11', title: 'حصة يوم الثلاثاء 11 أوت 2026' },
      { date: '2026-08-12', title: 'حصة يوم الأربعاء 12 أوت 2026' },
      { date: '2026-08-15', title: 'حصة يوم السبت 15 أوت 2026' },
      { date: '2026-08-16', title: 'حصة يوم الأحد 16 أوت 2026' }
    ];

    pastDates.forEach(d => {
      if (!entries.find(e => e.date === d.date)) {
        addJournalEntry({
          id: generateId(), date: d.date, group: 'الفوج 1', title: d.title,
          memorizationText: 'مراجعة وتثبيت ما تم حفظه من القرآن الكريم.',
          tajweedText: 'تطبيقات عملية لأحكام التجويد السابقة.',
          activitiesText: 'تلاوة فردية وتصحيح مخارج الحروف.',
          homeworkText: 'مراجعة الحفظ استعداداً للحصة القادمة.',
          archived: true, createdAt: new Date(`${d.date}T12:00:00Z`).toISOString()
        });
      }
      const records = {};
      students.forEach(s => records[s.id] = 'present');
      setAttendanceForDate(d.date, records);
    });

    if (!entries.find(e => e.date === '2026-08-17')) {
      addJournalEntry({
        id: generateId(), date: '2026-08-17', group: 'الفوج 1', title: 'حصة يوم الاثنين 17 أوت 2026',
        memorizationText: 'إكمال حفظ سورة الملك.',
        tajweedText: 'أحكام الميم الساكنة.',
        activitiesText: 'تسميع فردي وشرح الأحكام.',
        homeworkText: 'مراجعة سورة الملك وحفظ أحكام الميم الساكنة.',
        archived: false, createdAt: new Date().toISOString()
      });
    }

    localStorage.setItem('sanad_migration_4_2', 'true');
    console.log('Data migration 4.2 completed.');
    pushToCloud();
  }

  // Migration 4.3: Memorization updates for Surat Al-Mulk
  if (!localStorage.getItem('sanad_migration_4_3')) {
    const students = getStudents();
    const today = new Date().toISOString().split('T')[0];

    // Restore Amir Hafsaoui if he was deleted
    if (!students.find(s => s.firstName.includes('أمير'))) {
      addStudent({ id: generateId(), firstName: 'أمير', lastName: 'حفصاوي', age: 7, gender: 'ذكر', avatar: 'boy3', level: 'مبتدئ', group: 'الفوج 1', registrationDate: today, notes: '', memorization: [], lastUpdate: today });
    }

    // Refresh students list
    const updatedStudents = getStudents();

    updatedStudents.forEach(s => {
      let versesCount = 24; // 80% of 30
      if (s.firstName.includes('محمد') && s.lastName.includes('كاملي')) versesCount = 15; // 50%
      if (s.firstName.includes('أمير')) versesCount = 6; // 20%

      updateStudent(s.id, {
        memorization: [{
          id: generateId(),
          date: today,
          surah: 'الملك',
          versesText: '1 - ' + versesCount,
          versesCount: versesCount,
          evaluation: 'جيد'
        }]
      });
    });

    localStorage.setItem('sanad_migration_4_3', 'true');
    console.log('Data migration 4.3 completed.');
    pushToCloud();
  }

  // Migration 4.4: Add student Abeer and competition
  if (!localStorage.getItem('sanad_migration_4_4')) {
    const students = getStudents();
    const today = new Date().toISOString().split('T')[0];

    // 1. Add Abeer Elyahoum
    let abeer = students.find(s => s.firstName.includes('عبير') && s.lastName.includes('اليهوم'));
    if (!abeer) {
      abeer = { id: generateId(), firstName: 'عبير', lastName: 'اليهوم', age: 11, gender: 'أنثى', avatar: 'girl1', level: 'مبتدئ', group: 'الفوج 1', registrationDate: today, notes: '', memorization: [], lastUpdate: today };
      addStudent(abeer);
    }
    
    // Set Abeer's memorization to 80% (24 verses)
    updateStudent(abeer.id, {
      memorization: [{
        id: generateId(),
        date: today,
        surah: 'الملك',
        versesText: '1 - 24',
        versesCount: 24,
        evaluation: 'جيد'
      }]
    });

    // Refresh students to get the latest state
    const currentStudents = getStudents();

    // 2. Add Competition
    const competitions = getCompetitions();
    if (!competitions.find(c => c.name === 'مسابقة حفظ سورة الرحمن')) {
      const getStudentId = (fName, lName) => {
        const s = currentStudents.find(st => st.firstName.includes(fName) && st.lastName.includes(lName));
        return s ? s.id : null;
      };

      const compParticipants = [
        getStudentId('أسماء', 'نعجة'),
        getStudentId('نعمة', 'جباري'),
        getStudentId('سيرين', 'قندوزي'),
        getStudentId('إياد', 'كاملي'),
        getStudentId('لجين', 'حرزلاوي'),
        getStudentId('عبير', 'اليهوم')
      ].filter(id => id !== null);

      addCompetition({
        id: generateId(),
        name: 'مسابقة حفظ سورة الرحمن',
        date: '2026-08-18',
        type: 'حفظ',
        description: '',
        participants: compParticipants,
        results: []
      });
    }

    localStorage.setItem('sanad_migration_4_4', 'true');
    console.log('Data migration 4.4 completed.');
    pushToCloud();
  }

  // Migration 4.5: Update attendance for Mohamed Kameli and Amir Hafsaoui
  if (!localStorage.getItem('sanad_migration_4_5')) {
    const students = getStudents();
    
    // Helper to get student ID by name
    const getStudentId = (fName, lName) => {
      const s = students.find(st => st.firstName.includes(fName) && (lName ? st.lastName.includes(lName) : true));
      return s ? s.id : null;
    };

    const mohamedId = getStudentId('محمد', 'كاملي');
    const amirId = getStudentId('أمير');

    const amirAbsentDates = [
      '2026-08-09', '2026-08-10', '2026-08-11',
      '2026-08-12', '2026-08-15', '2026-08-16'
    ];
    
    const mohamedAbsentDates = [
      '2026-08-15', '2026-08-16'
    ];

    import('./data/store.js').then(({ getAttendance, setAttendanceForDate }) => {
      const attendance = getAttendance();

      if (amirId) {
        amirAbsentDates.forEach(date => {
          if (attendance[date]) {
            attendance[date][amirId] = 'absent';
            setAttendanceForDate(date, attendance[date]);
          }
        });
      }

      if (mohamedId) {
        mohamedAbsentDates.forEach(date => {
          if (attendance[date]) {
            attendance[date][mohamedId] = 'absent';
            setAttendanceForDate(date, attendance[date]);
          }
        });
      }

      localStorage.setItem('sanad_migration_4_5', 'true');
      console.log('Data migration 4.5 completed.');
      pushToCloud();
    });
  }

  // Migration 4.6: Point adjustments
  if (!localStorage.getItem('sanad_migration_4_6')) {
    const students = getStudents();
    const today = new Date().toISOString().split('T')[0];
    
    const getStudentId = (fName, lName) => {
      const s = students.find(st => st.firstName.includes(fName) && (lName ? st.lastName.includes(lName) : true));
      return s ? s.id : null;
    };

    const adjustments = [
      { id: getStudentId('إياد', 'كاملي'), points: -1, reason: 'تعديل الإدارة' },
      { id: getStudentId('سيرين', 'قندوزي'), points: -1, reason: 'تعديل الإدارة' },
      { id: getStudentId('نعمة', 'جباري'), points: -1, reason: 'تعديل الإدارة' },
      { id: getStudentId('أسماء', 'نعجة'), points: 4, reason: 'تعديل الإدارة' }
    ];

    adjustments.forEach(adj => {
      if (adj.id) {
        addPointEntry(adj.id, adj.points, adj.reason, today);
      }
    });

    localStorage.setItem('sanad_migration_4_6', 'true');
    console.log('Data migration 4.6 completed.');
    pushToCloud();
  }

  // Migration 4.7: Fix points corruption ([object Object])
  if (!localStorage.getItem('sanad_migration_4_7')) {
    import('./data/store.js').then(({ getAllPoints }) => {
      const allPoints = getAllPoints();
      let fixed = false;
      
      for (const studentId in allPoints) {
        const pData = allPoints[studentId];
        if (typeof pData.total === 'string' && pData.total.includes('[object Object]')) {
          // Recalculate from history
          let correctTotal = 0;
          pData.history.forEach(h => {
            // Remove the corrupted object from history if it exists
            if (typeof h.delta === 'object') {
              h.delta = h.delta.points || 0;
            }
            correctTotal += Number(h.delta) || 0;
          });
          pData.total = correctTotal;
          fixed = true;
        }
      }

      if (fixed) {
        localStorage.setItem('sanad_points', JSON.stringify(allPoints));
        pushToCloud();
      }
      
      localStorage.setItem('sanad_migration_4_7', 'true');
      console.log('Data migration 4.7 completed.');
    });
  }

  if (updated) {
    router.resolve();
  }
});

// Route guard — protect admin routes
router.guard((hash) => {
  if (hash.startsWith('/admin/') && hash !== '/admin/login') {
    if (!isAdminLoggedIn()) {
      window.location.hash = '/admin/login';
      return false;
    }
  }
  // Scroll to top on navigation
  window.scrollTo(0, 0);
  return true;
});

// Public routes
router.add('/', () => renderHomePage());
router.add('/journal', () => renderJournalPage());
router.add('/students', () => renderStudentsPage());
router.add('/student/:id', (params) => renderStudentProfilePage(params));
router.add('/leaderboard', () => renderLeaderboardPage());
router.add('/competitions', () => renderCompetitionsPage());
router.add('/about', () => renderAboutPage());
router.add('/developer', () => renderDeveloperPage());

// Admin routes
router.add('/admin/login', () => renderLoginPage());
router.add('/admin/dashboard', () => renderDashboardPage());
router.add('/admin/journal', () => renderManageJournalPage());
router.add('/admin/students', () => renderManageStudentsPage());
router.add('/admin/attendance', () => renderAttendancePage());
router.add('/admin/memorization', () => renderMemorizationPage());
router.add('/admin/points', () => renderPointsPage());
router.add('/admin/wheel', () => renderWheelPage());
router.add('/admin/competitions', () => renderManageCompetitionsPage());
router.add('/admin/settings', () => renderSettingsPage());

// Keyboard shortcut (Ctrl + Shift + A) for secret admin login access
window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
    e.preventDefault();
    window.location.hash = '/admin/login';
  }
});

// Start
router.start();
