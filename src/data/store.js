// ============================
// Data Store (localStorage)
// ============================

import { showToast } from '../components/toast.js';

const KEYS = {
  STUDENTS: 'sanad_students',
  ATTENDANCE: 'sanad_attendance',
  COMPETITIONS: 'sanad_competitions',
  ADMIN: 'sanad_admin',
  SETTINGS: 'sanad_settings',
  JOURNAL: 'sanad_journal',
  WEEKLY_SCHEDULE: 'sanad_weekly_schedule',
  DEVELOPER: 'sanad_developer',
  INITIALIZED: 'sanad_initialized',
  POINTS: 'sanad_points',
  QUOTES: 'sanad_quotes',
  LAST_UPDATE: 'sanad_last_update'
};

function get(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

let cloudSyncDebounceTimer = null;
let isSyncing = false;

function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  if (!isSyncing && key !== KEYS.INITIALIZED && key !== KEYS.ADMIN && key !== KEYS.LAST_UPDATE) {
    localStorage.setItem(KEYS.LAST_UPDATE, JSON.stringify(Date.now()));
    clearTimeout(cloudSyncDebounceTimer);
    cloudSyncDebounceTimer = setTimeout(() => {
      pushToCloud();
    }, 1000);
  }
}

// === Students ===
export function getStudents() {
  return get(KEYS.STUDENTS) || [];
}

export function getStudent(id) {
  return getStudents().find(s => s.id === id) || null;
}

export function addStudent(student) {
  const students = getStudents();
  students.push(student);
  set(KEYS.STUDENTS, students);
  return student;
}

export function updateStudent(id, updates) {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) return null;
  students[index] = { ...students[index], ...updates };
  set(KEYS.STUDENTS, students);
  return students[index];
}

export function deleteStudent(id) {
  const students = getStudents().filter(s => s.id !== id);
  set(KEYS.STUDENTS, students);
  // Also clean up attendance
  const attendance = getAttendance();
  for (const date in attendance) {
    delete attendance[date][id];
  }
  set(KEYS.ATTENDANCE, attendance);
}

// === Attendance ===
export function getAttendance() {
  return get(KEYS.ATTENDANCE) || {};
}

export function getAttendanceForDate(date) {
  const attendance = getAttendance();
  return attendance[date] || {};
}

export function setAttendanceForStudent(date, studentId, status) {
  const attendance = getAttendance();
  if (!attendance[date]) attendance[date] = {};
  attendance[date][studentId] = status;
  set(KEYS.ATTENDANCE, attendance);
}

export function setAttendanceForDate(date, records) {
  const attendance = getAttendance();
  attendance[date] = records;
  set(KEYS.ATTENDANCE, attendance);
}

export function getStudentAttendanceStats(studentId) {
  const attendance = getAttendance();
  let present = 0, absent = 0, excused = 0, total = 0;
  
  for (const date in attendance) {
    if (attendance[date][studentId] !== undefined) {
      total++;
      const status = attendance[date][studentId];
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'excused') excused++;
    }
  }
  
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return { present, absent, excused, total, percentage };
}

export function getTodayAttendanceStats() {
  const today = new Date().toISOString().split('T')[0];
  const todayAtt = getAttendanceForDate(today);
  const students = getStudents();
  let present = 0, absent = 0, excused = 0;
  
  for (const student of students) {
    const status = todayAtt[student.id];
    if (status === 'present') present++;
    else if (status === 'absent') absent++;
    else if (status === 'excused') excused++;
  }
  
  return { present, absent, excused, total: students.length, recorded: Object.keys(todayAtt).length };
}

// === Competitions ===
export function getCompetitions() {
  return get(KEYS.COMPETITIONS) || [];
}

export function getCompetition(id) {
  return getCompetitions().find(c => c.id === id) || null;
}

export function addCompetition(competition) {
  const competitions = getCompetitions();
  competitions.push(competition);
  set(KEYS.COMPETITIONS, competitions);
  return competition;
}

export function updateCompetition(id, updates) {
  const competitions = getCompetitions();
  const index = competitions.findIndex(c => c.id === id);
  if (index === -1) return null;
  competitions[index] = { ...competitions[index], ...updates };
  set(KEYS.COMPETITIONS, competitions);
  return competitions[index];
}

export function deleteCompetition(id) {
  const competitions = getCompetitions().filter(c => c.id !== id);
  set(KEYS.COMPETITIONS, competitions);
}

// === Admin Auth ===
export function getAdminCredentials() {
  return get(KEYS.ADMIN) || { username: 'tarek', email: 'nt_zerari@esi.dz', password: 'tarek30092005' };
}

export function isAdminLoggedIn() {
  return localStorage.getItem('sanad_admin_session') === 'true' || sessionStorage.getItem('sanad_admin_session') === 'true';
}

export function adminLogin(identifier, password) {
  const creds = getAdminCredentials();
  const cleanId = (identifier || '').trim().toLowerCase();
  
  if ((cleanId === creds.username.toLowerCase() || cleanId === creds.email.toLowerCase()) && password === creds.password) {
    // Persistent session so user stays logged in on their personal PC
    localStorage.setItem('sanad_admin_session', 'true');
    sessionStorage.setItem('sanad_admin_session', 'true');
    return true;
  }
  return false;
}

export function adminLogout() {
  localStorage.removeItem('sanad_admin_session');
  sessionStorage.removeItem('sanad_admin_session');
}

export function updateAdminPassword(newPassword) {
  const creds = getAdminCredentials();
  creds.password = newPassword;
  set(KEYS.ADMIN, creds);
}

// === Settings ===
export function getSettings() {
  return get(KEYS.SETTINGS) || { schoolName: 'مدرسة سند للقرآن الكريم وعلومه', logoUrl: '/logo.png' };
}

export function updateSettings(updates) {
  const settings = getSettings();
  Object.assign(settings, updates);
  set(KEYS.SETTINGS, settings);
  return settings;
}

// === Journal (اليوميات) ===
export function getJournalEntries() {
  return get(KEYS.JOURNAL) || [];
}

export function addJournalEntry(entry) {
  const entries = getJournalEntries();
  entries.unshift(entry); // newest first
  set(KEYS.JOURNAL, entries);
  return entry;
}

export function updateJournalEntry(id, updates) {
  const entries = getJournalEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index === -1) return null;
  entries[index] = { ...entries[index], ...updates };
  set(KEYS.JOURNAL, entries);
  return entries[index];
}

export function deleteJournalEntry(id) {
  const entries = getJournalEntries().filter(e => e.id !== id);
  set(KEYS.JOURNAL, entries);
}

// === Quotes (الأحاديث والحكم) ===
export function getQuotes() {
  return get(KEYS.QUOTES) || [];
}

export function addQuote(quote) {
  const quotes = getQuotes();
  quotes.unshift(quote); // newest first
  set(KEYS.QUOTES, quotes);
  return quote;
}

export function deleteQuote(id) {
  const quotes = getQuotes().filter(q => q.id !== id);
  set(KEYS.QUOTES, quotes);
}

// === Weekly Schedule (الرزنامة الأسبوعية) ===
export function getWeeklySchedule() {
  return get(KEYS.WEEKLY_SCHEDULE) || [
    { day: 'السبت', time: '09:00 — 10:30', fawj: 'الفوج 1', activity: 'تحفيظ سورة الملك + أحكام النون الساكنة والتنوين' },
    { day: 'الأحد', time: '09:00 — 10:30', fawj: 'الفوج 1', activity: 'تحفيظ سورة الملك + أحكام النون الساكنة والتنوين' },
    { day: 'الاثنين', time: '09:00 — 10:30', fawj: 'الفوج 1', activity: 'تحفيظ سورة الملك + أحكام النون الساكنة والتنوين' },
    { day: 'الثلاثاء', time: '09:00 — 10:30', fawj: 'الفوج 1', activity: 'تحفيظ سورة الملك + أحكام النون الساكنة والتنوين' },
    { day: 'الأربعاء', time: '09:00 — 10:30', fawj: 'الفوج 1', activity: 'تحفيظ سورة الملك + أحكام النون الساكنة والتنوين' }
  ];
}

export function setWeeklySchedule(schedule) {
  set(KEYS.WEEKLY_SCHEDULE, schedule);
  return schedule;
}

// === Developer Info (عن المطور) ===
export function getDeveloperInfo() {
  return get(KEYS.DEVELOPER) || {
    name: 'طارق زراري',
    title: 'أستاذ المدرسة • طالب بالمدرسة العليا للإعلام الآلي (ESI)',
    bio: 'أستاذ ومعلم مدرسة سند للقرآن الكريم وعلومه، وطالب في المدرسة العليا للإعلام الآلي (ESI). قمت بتطوير وبناء هذه المنصة خصيصاً لمتابعة حفظ وتلاوة أبنائنا في المدرسة القرآنية، ولتيسير تواصل الأولياء مع البرنامج الدراسي.',
    email: 'nt_zerari@esi.dz',
    photoUrl: '' // Empty by default, can be set/changed in admin settings
  };
}

export function updateDeveloperInfo(updates) {
  const info = getDeveloperInfo();
  Object.assign(info, updates);
  set(KEYS.DEVELOPER, info);
  return info;
}

// === Initialization ===
export function isInitialized() {
  return get(KEYS.INITIALIZED) === true;
}

export function markInitialized() {
  set(KEYS.INITIALIZED, true);
}

export function resetAllData() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  sessionStorage.removeItem('sanad_admin_session');
}

// === Backup & Restore (تصدير واستعادة البيانات) ===
export function exportAllData() {
  const exportData = {};
  Object.entries(KEYS).forEach(([name, key]) => {
    exportData[key] = get(key);
  });
  return JSON.stringify(exportData, null, 2);
}

export function importAllData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    isSyncing = true;
    Object.entries(parsed).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        set(key, value);
      }
    });
    isSyncing = false;
    return true;
  } catch (e) {
    isSyncing = false;
    console.error('Import failed:', e);
    return false;
  }
}

// === Points (نظام النقاط) ===
export function getStudentPoints(studentId) {
  const pointsData = get(KEYS.POINTS) || {};
  return pointsData[studentId] || { total: 0, history: [] };
}

export function getAllPoints() {
  return get(KEYS.POINTS) || {};
}

export function addPointEntry(studentId, delta, reason, date = new Date().toISOString().split('T')[0]) {
  const pointsData = get(KEYS.POINTS) || {};
  if (!pointsData[studentId]) {
    pointsData[studentId] = { total: 0, history: [] };
  }
  
  pointsData[studentId].total += delta;
  pointsData[studentId].history.unshift({
    id: Date.now().toString(),
    delta,
    reason,
    date
  });
  
  set(KEYS.POINTS, pointsData);
  return pointsData[studentId];
}

// === Cloud Synchronization (Netlify Blobs) ===
const SHARED_CLOUD_URL = '/api/sync';

export async function pushToCloud() {
  const dataStr = exportAllData();
  try {
    const res = await fetch(SHARED_CLOUD_URL, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: dataStr
    });
    if (res.ok) {
      console.log('Successfully synced data to Netlify Blobs!');
      return true;
    } else {
      console.error('Failed to sync to Netlify. Status:', res.status);
      showToast('⚠️ خطأ في مزامنة البيانات مع السحابة، تأكد من الاتصال بالإنترنت.', 'error');
    }
  } catch (e) {
    console.error('Push to cloud failed, using local storage:', e);
    showToast('⚠️ لم يتم حفظ البيانات في السحابة بسبب انقطاع الاتصال.', 'error');
  }
  return false;
}

export async function pullFromCloud() {
  try {
    const res = await fetch(SHARED_CLOUD_URL, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const jsonText = await res.text();
      if (jsonText && jsonText.length > 10) {
        const cloudData = JSON.parse(jsonText);
        const cloudTimestamp = cloudData[KEYS.LAST_UPDATE] || 0;
        const localTimestamp = get(KEYS.LAST_UPDATE) || 0;
        
        if (cloudTimestamp > localTimestamp) {
          importAllData(jsonText);
          console.log('Successfully pulled latest data from Netlify Blobs!');
          return true;
        } else if (localTimestamp > cloudTimestamp) {
          console.log('Local data is newer, pushing to Netlify Blobs...');
          pushToCloud();
        } else {
          console.log('Data is up to date.');
        }
      }
    }
  } catch (e) {
    console.warn('Pull from cloud failed, using local storage:', e);
  }
  return false;
}


