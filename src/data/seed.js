// ============================
// Seed Data — Real students
// ============================

import { generateId } from '../utils/helpers.js';
import * as store from './store.js';

export function seedData() {
  if (store.isInitialized() && localStorage.getItem('sanad_version') === '4.0') return;

  // Clear previous demo/old data if exists
  store.resetAllData();
  localStorage.setItem('sanad_version', '4.0');

  // === Real Students ===
  const students = [
    {
      id: generateId(),
      firstName: 'سيرين',
      lastName: 'قندوزي',
      age: 9,
      gender: 'أنثى',
      avatar: 'girl1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'لجين',
      lastName: 'حرزلاوي',
      age: 12,
      gender: 'أنثى',
      avatar: 'girl2',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'مرام',
      lastName: 'كاملي',
      age: 8,
      gender: 'أنثى',
      avatar: 'girl3',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'رزان',
      lastName: 'بن بلقاسم',
      age: 11,
      gender: 'أنثى',
      avatar: 'girl1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'ساجدة',
      lastName: 'كرارة',
      age: 10,
      gender: 'أنثى',
      avatar: 'girl2',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'نعمة',
      lastName: 'جباري',
      age: 7,
      gender: 'أنثى',
      avatar: 'girl3',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'جنى',
      lastName: 'كرازة',
      age: 13,
      gender: 'أنثى',
      avatar: 'girl1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'سجود',
      lastName: 'كرازة',
      age: 9,
      gender: 'أنثى',
      avatar: 'girl2',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'مهدي',
      lastName: 'كاملي',
      age: 12,
      gender: 'ذكر',
      avatar: 'boy1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'إياد',
      lastName: 'كاملي',
      age: 8,
      gender: 'ذكر',
      avatar: 'boy2',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'زكرياء',
      lastName: 'بوشكوة',
      age: 11,
      gender: 'ذكر',
      avatar: 'boy3',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'محمد',
      lastName: 'كاملي',
      age: 10,
      gender: 'ذكر',
      avatar: 'boy1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'إبراهيم',
      lastName: 'حرزلاوي',
      age: 13,
      gender: 'ذكر',
      avatar: 'boy2',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'يعقوب',
      lastName: 'يعقوب',
      age: 10,
      gender: 'ذكر',
      avatar: 'boy1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'أمير',
      lastName: 'حفصاوي',
      age: 7,
      gender: 'ذكر',
      avatar: 'boy3',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'أسماء',
      lastName: 'نعجة',
      age: 11,
      gender: 'أنثى',
      avatar: 'girl2',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    },
    {
      id: generateId(),
      firstName: 'عبير',
      lastName: 'اليهوم',
      age: 11,
      gender: 'أنثى',
      avatar: 'girl1',
      level: 'مبتدئ',
      group: 'الفوج 1',
      registrationDate: '2025-09-01',
      notes: '',
      memorization: [],
      lastUpdate: '2025-09-01'
    }
  ];

  // Save students with their memorization
  students.forEach(s => {
    let versesCount = 24; // 80% of 30 (Surat Al-Mulk)
    if (s.firstName.includes('محمد') && s.lastName.includes('كاملي')) versesCount = 15; // 50%
    if (s.firstName.includes('أمير')) versesCount = 6; // 20%
    
    s.memorization = [{
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      surah: 'الملك',
      versesText: '1 - ' + versesCount,
      versesCount: versesCount,
      evaluation: 'جيد'
    }];
    store.addStudent(s);
  });

  // Competitions (المسابقات)
  const savedStudents = store.getStudents();
  const getStudentId = (fName, lName) => {
    const s = savedStudents.find(st => st.firstName.includes(fName) && st.lastName.includes(lName));
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

  store.addCompetition({
    id: generateId(),
    name: 'مسابقة حفظ سورة الرحمن',
    date: '2026-08-18',
    type: 'حفظ',
    description: '',
    participants: compParticipants,
    results: []
  });

  // Generate past week journal entries and full attendance
  const pastDates = [
    { date: '2026-08-09', title: 'حصة يوم الأحد 9 أوت 2026' },
    { date: '2026-08-10', title: 'حصة يوم الاثنين 10 أوت 2026' },
    { date: '2026-08-11', title: 'حصة يوم الثلاثاء 11 أوت 2026' },
    { date: '2026-08-12', title: 'حصة يوم الأربعاء 12 أوت 2026' },
    { date: '2026-08-15', title: 'حصة يوم السبت 15 أوت 2026' },
    { date: '2026-08-16', title: 'حصة يوم الأحد 16 أوت 2026' }
  ];

  pastDates.forEach(d => {
    store.addJournalEntry({
      id: generateId(),
      date: d.date,
      group: 'الفوج 1',
      title: d.title,
      memorizationText: 'مراجعة وتثبيت ما تم حفظه من القرآن الكريم.',
      tajweedText: 'تطبيقات عملية لأحكام التجويد السابقة.',
      activitiesText: 'تلاوة فردية وتصحيح مخارج الحروف.',
      homeworkText: 'مراجعة الحفظ استعداداً للحصة القادمة.',
      archived: true,
      createdAt: new Date(`${d.date}T12:00:00Z`).toISOString()
    });

    const records = {};
    students.forEach(s => {
      let status = 'present';
      
      // Amir Hafsaoui absent all sessions
      if (s.firstName.includes('أمير')) {
        status = 'absent';
      }
      
      // Mohamed Kameli absent on 15 and 16 Aug
      if (s.firstName.includes('محمد') && s.lastName.includes('كاملي')) {
        if (d.date === '2026-08-15' || d.date === '2026-08-16') {
          status = 'absent';
        }
      }

      records[s.id] = status;
    });
    store.setAttendanceForDate(d.date, records);
  });

  // Create new entry for tomorrow (Monday, Aug 17, 2026)
  store.addJournalEntry({
    id: generateId(),
    date: '2026-08-17',
    group: 'الفوج 1',
    title: 'حصة يوم الاثنين 17 أوت 2026',
    memorizationText: 'إكمال حفظ سورة الملك.',
    tajweedText: 'أحكام الميم الساكنة.',
    activitiesText: 'تسميع فردي وشرح الأحكام.',
    homeworkText: 'مراجعة سورة الملك وحفظ أحكام الميم الساكنة.',
    archived: false,
    createdAt: new Date().toISOString()
  });

  // Mark as initialized
  store.markInitialized();
}
