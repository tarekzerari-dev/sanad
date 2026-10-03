// ============================
// Admin - Settings
// ============================

import { getSettings, updateSettings, updateAdminPassword, adminLogout, resetAllData, getDeveloperInfo, updateDeveloperInfo, exportAllData, importAllData, pushToCloud, pullFromCloud } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { showToast } from '../../components/toast.js';
import { confirmDialog } from '../../components/modal.js';
import { navigateTo } from '../../utils/router.js';
import { initIcons } from '../../utils/helpers.js';

export function renderSettingsPage() {
  const settings = getSettings();

  const content = `
    <div class="page-header">
      <h2 style="font-size: var(--font-size-xl);">الإعدادات</h2>
    </div>

    <!-- School Settings -->
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="card-header">
        <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
          <i data-lucide="school" style="width:18px;height:18px;color:var(--green-500);"></i>
          إعدادات المدرسة
        </h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">اسم المدرسة</label>
          <input type="text" id="set-school-name" class="form-input" value="${settings.schoolName}" placeholder="اسم المدرسة">
        </div>
        <div class="form-group">
          <label class="form-label">شعار / لوغو المدرسة (رابط أو مسار الصورة)</label>
          <div style="display: flex; gap: var(--space-3); align-items: center;">
            <img src="${settings.logoUrl || '/logo.png'}" id="logo-preview-img" style="height: 48px; width: auto; max-width: 100px; object-fit: contain; background: var(--gray-100); padding: 4px; border-radius: var(--border-radius-md); border: 1px solid var(--border-color);" />
            <input type="text" id="set-logo-url" class="form-input" value="${settings.logoUrl || '/logo.png'}" placeholder="مثال: /logo.png أو رابط صورة خارجية">
          </div>
        </div>
        <button class="btn btn-primary" id="save-settings-btn">
          <i data-lucide="check"></i>
          حفظ الإعدادات والشعار
        </button>
      </div>
    <!-- Developer Settings -->
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="card-header">
        <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
          <i data-lucide="code-2" style="width:18px;height:18px;color:var(--green-500);"></i>
          معلومات صفحة "عن المطور"
        </h3>
      </div>
      <div class="card-body">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">اسم المطور واللقب</label>
            <input type="text" id="dev-name" class="form-input" value="${getDeveloperInfo().name}">
          </div>
          <div class="form-group">
            <label class="form-label">الصفة / التخصص</label>
            <input type="text" id="dev-title" class="form-input" value="${getDeveloperInfo().title}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">رابط الصورة الشخصية (Photo URL)</label>
          <input type="text" id="dev-photo" class="form-input" value="${getDeveloperInfo().photoUrl || ''}" placeholder="ضع رابط أو مسار الصورة هنا (مثال: https://... أو /logo.png)">
        </div>
        <div class="form-group">
          <label class="form-label">نبذة عن المطور</label>
          <textarea id="dev-bio" class="form-textarea" rows="3">${getDeveloperInfo().bio}</textarea>
        </div>
        <button class="btn btn-primary" id="save-dev-info-btn">
          <i data-lucide="check"></i>
          حفظ معلومات المطور
        </button>
      </div>
    </div>

    <!-- Password Change -->
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="card-header">
        <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
          <i data-lucide="lock" style="width:18px;height:18px;color:var(--green-500);"></i>
          تغيير كلمة المرور
        </h3>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">كلمة المرور الجديدة</label>
          <input type="password" id="set-new-password" class="form-input" placeholder="أدخل كلمة المرور الجديدة" autocomplete="new-password">
        </div>
        <div class="form-group">
          <label class="form-label">تأكيد كلمة المرور</label>
          <input type="password" id="set-confirm-password" class="form-input" placeholder="أعد إدخال كلمة المرور" autocomplete="new-password">
        </div>
        <button class="btn btn-primary" id="change-password-btn">
          <i data-lucide="key"></i>
          تغيير كلمة المرور
        </button>
      </div>
    </div>

    <!-- Backup & Restore Data -->
    <div class="card" style="margin-bottom: var(--space-6);">
      <div class="card-header">
        <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
          <i data-lucide="download-cloud" style="width:18px;height:18px;color:var(--green-500);"></i>
          النسخ الاحتياطي وتصدير البيانات
        </h3>
      </div>
      <div class="card-body">
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-bottom: var(--space-4);">
          يمكنك تحميل نسخة احتياطية من جميع بيانات المدرسة (الطلبة، الحضور، اليوميات، المسابقات) وحفظها على جهازك، أو استعادتها في أي وقت.
        </p>
        <div style="display: flex; gap: var(--space-3); flex-wrap: wrap;">
          <button class="btn btn-primary" id="export-backup-btn">
            <i data-lucide="download"></i>
            تصدير نسخة احتياطية (JSON)
          </button>
          <label class="btn btn-secondary" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
            <i data-lucide="upload"></i>
            استعادة نسخة احتياطية
            <input type="file" id="import-backup-file" accept=".json" style="display: none;">
          </label>
          <button class="btn btn-primary" id="cloud-sync-btn" style="background: var(--gold-500); border: none; color: white;">
            <i data-lucide="refresh-cw"></i>
            مزامنة البيانات فورياً مع كافة الهواتف (Cloud Sync)
          </button>
        </div>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="card" style="border-color: var(--danger);">
      <div class="card-header" style="background: #fef2f2;">
        <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2); color: var(--danger);">
          <i data-lucide="alert-triangle" style="width:18px;height:18px;"></i>
          منطقة الخطر
        </h3>
      </div>
      <div class="card-body">
        <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--space-4);">
          حذف جميع البيانات وإعادة تعيين الموقع بالكامل. هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <button class="btn btn-danger" id="reset-data-btn">
          <i data-lucide="trash-2"></i>
          حذف جميع البيانات
        </button>
      </div>
    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/settings', content);
  initAdminLayout();
  initIcons();

  // Save settings
  document.getElementById('save-settings-btn')?.addEventListener('click', () => {
    const schoolName = document.getElementById('set-school-name').value.trim();
    const logoUrl = document.getElementById('set-logo-url').value.trim();

    if (schoolName) {
      updateSettings({ schoolName, logoUrl: logoUrl || '/logo.png' });
      showToast('تم حفظ الإعدادات والشعار بنجاح');
      const preview = document.getElementById('logo-preview-img');
      if (preview) preview.src = logoUrl || '/logo.png';
    }
  });

  // Save developer info
  document.getElementById('save-dev-info-btn')?.addEventListener('click', () => {
    const name = document.getElementById('dev-name').value.trim();
    const title = document.getElementById('dev-title').value.trim();
    const photoUrl = document.getElementById('dev-photo').value.trim();
    const bio = document.getElementById('dev-bio').value.trim();

    if (name) {
      updateDeveloperInfo({ name, title, photoUrl, bio });
      showToast('تم حفظ معلومات المطور بنجاح');
    }
  });

  // Change password
  document.getElementById('change-password-btn')?.addEventListener('click', () => {
    const newPass = document.getElementById('set-new-password').value;
    const confirmPass = document.getElementById('set-confirm-password').value;

    if (!newPass || newPass.length < 4) {
      showToast('كلمة المرور يجب أن تكون 4 أحرف على الأقل', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('كلمات المرور غير متطابقة', 'error');
      return;
    }

    updateAdminPassword(newPass);
    showToast('تم تغيير كلمة المرور بنجاح');
    document.getElementById('set-new-password').value = '';
    document.getElementById('set-confirm-password').value = '';
  });

  // Export Backup JSON
  document.getElementById('export-backup-btn')?.addEventListener('click', () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanad_school_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('تم تحميل نسخة احتياطية من البيانات بنجاح');
  });

  // Import Backup JSON
  document.getElementById('import-backup-file')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        confirmDialog('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.', () => {
          if (importAllData(content)) {
            showToast('تمت استعادة البيانات بنجاح!');
            setTimeout(() => location.reload(), 1000);
          } else {
            showToast('فشلت قراءة ملف النسخة الاحتياطية', 'error');
          }
        });
      }
    };
    reader.readAsText(file);
  });

  // Cloud Sync Online Button
  document.getElementById('cloud-sync-btn')?.addEventListener('click', async () => {
    showToast('جاري مزامنة البيانات أونلاين عبر السحابة...', 'info');
    const res = await pushToCloud();
    if (res) {
      showToast('تمت المزامنة السحابية أونلاين بنجاح! تظهر الآن البيانات الجديدة في جميع الهواتف والأجهزة فوراً 🎉');
    } else {
      showToast('تم حفظ البيانات محلياً وسيتم تحديثها فور الاتصال بالإنترنت');
    }
  });

  // Reset data
  document.getElementById('reset-data-btn')?.addEventListener('click', () => {
    confirmDialog('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!', () => {
      resetAllData();
      adminLogout();
      showToast('تم حذف جميع البيانات', 'info');
      setTimeout(() => navigateTo('/'), 500);
    });
  });
}
