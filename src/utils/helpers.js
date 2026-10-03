// ============================
// Helper Utilities
// ============================

// Quran Surahs data
export const SURAHS = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف',
  'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
  'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه', 'الأنبياء', 'الحج', 'المؤمنون',
  'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص',
  'الزمر', 'غافر', 'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
  'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق', 'الذاريات', 'الطور',
  'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر',
  'الممتحنة', 'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم',
  'الملك', 'القلم', 'الحاقة', 'المعارج', 'نوح', 'الجن', 'المزمل', 'المدثر',
  'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس', 'التكوير',
  'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية',
  'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق',
  'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر',
  'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس'
];

// Surah verse counts
export const SURAH_VERSES = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99,
  128, 111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60,
  34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37,
  35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24,
  13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56,
  40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
  30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3,
  9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

export const LEVELS = ['مبتدئ', 'متوسط', 'متقدم'];

export const GROUPS = ['الفوج 1', 'الفوج 2', 'الفوج 3'];

export const COMPETITION_TYPES = ['حفظ', 'تجويد', 'تفسير', 'مسابقة عامة'];

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('ar-DZ', {
    month: 'short',
    day: 'numeric'
  });
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function getLevelBadgeClass(level) {
  switch (level) {
    case 'مبتدئ': return 'badge-beginner';
    case 'متوسط': return 'badge-intermediate';
    case 'متقدم': return 'badge-advanced';
    default: return 'badge-gray';
  }
}

export function getAttendanceColor(percentage) {
  if (percentage >= 90) return 'var(--green-500)';
  if (percentage >= 75) return 'var(--gold-500)';
  if (percentage >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

export function calculateMemorizationProgress(memorization) {
  if (!memorization || !memorization.length) return 0;
  // Total verses for Surat Al-Mulk: 30
  const totalVerses = 30;
  let memorizedVerses = 0;
  
  for (const entry of memorization) {
    memorizedVerses += entry.versesCount || 0;
  }
  
  return Math.min(Math.round((memorizedVerses / totalVerses) * 100), 100);
}

export function getMemorizedVersesCount(memorization) {
  if (!memorization || !memorization.length) return 0;
  let total = 0;
  for (const entry of memorization) {
    total += entry.versesCount || 0;
  }
  return total;
}

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function createLucideIcon(name, size = 20) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;"></i>`;
}

export function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
