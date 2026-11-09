// ============================================================
// سند — Admin Settings (إعدادات المنظومة والنسخ الاحتياطي)
// ============================================================

import { getSettings, updateSettings, updateAdminPassword, adminLogout, resetAllData, getDeveloperInfo, updateDeveloperInfo, exportAllData, importAllData, pushToCloud } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { showToast } from '../../components/toast.js';
import { confirmDialog } from '../../components/modal.js';
import { navigateTo } from '../../utils/router.js';
import { initIcons } from '../../utils/helpers.js';

export function renderSettingsPage() {
  const settings = getSettings();
  const devInfo = getDeveloperInfo();

  const content = `
    <!-- Page Header -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">إعدادات المنظومة والنسخ الاحتياطي</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          ضبط هوية المدرسة القرآنية، تأمين الحساب، تصدير واسترجاع قواعد البيانات، والمزامنة السحابية
        </p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
      
      <!-- Left Column: School Identity & Developer -->
      <div>
        
        <!-- School Identity Card -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
              <i data-lucide="school" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
              <span>هوية المدرسة القرآنية والشعار</span>
            </h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">الاسم الرسمي للمدرسة</label>
              <input type="text" id="set-school-name" class="form-input" value="${settings.schoolName}" placeholder="اسم المدرسة">
            </div>

            <div class="form-group">
              <label class="form-label">شعار المدرسة (مسار محلي أو رابط خارجي)</label>
              <div style="display: flex; gap: var(--space-3); align-items: center;">
                <img src="${settings.logoUrl || '/logo.png'}" id="logo-preview-img" style="height: 48px; width: 48px; object-fit: contain; background: var(--bg-canvas); padding: 4px; border-radius: var(--border-radius-md); border: 1.5px solid var(--brass-400);" />
                <input type="text" id="set-logo-url" class="form-input" value="${settings.logoUrl || '/logo.png'}" placeholder="مثال: /logo.png">
              </div>
            </div>

            <button class="btn btn-primary btn-sm" id="save-settings-btn" style="margin-top: var(--space-2);">
              <i data-lucide="check"></i>
              <span>حفظ بيانات وهوية المدرسة</span>
            </button>
          </div>
        </div>

        <!-- Developer Info Card -->
        <div class="card">
          <div class="card-header">
            <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
              <i data-lucide="code-2" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
              <span>معلومات صفحة "عن المطور"</span>
            </h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">اسم الأستاذ / المطور</label>
                <input type="text" id="dev-name" class="form-input" value="${devInfo.name}">
              </div>
              <div class="form-group">
                <label class="form-label">الصفة والتخصص</label>
                <input type="text" id="dev-title" class="form-input" value="${devInfo.title}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">رابط الصورة الشخصية (اختياري)</label>
              <input type="text" id="dev-photo" class="form-input" value="${devInfo.photoUrl || ''}" placeholder="رابط صورة الأستاذ">
            </div>

            <div class="form-group">
              <label class="form-label">نبذة تعريفية ورسالة المنظومة</label>
              <textarea id="dev-bio" class="form-textarea" rows="3">${devInfo.bio}</textarea>
            </div>

            <button class="btn btn-primary btn-sm" id="save-dev-info-btn">
              <i data-lucide="check"></i>
              <span>تحديث معلومات الأستاذ المطور</span>
            </button>
          </div>
        </div>

      </div>

      <!-- Right Column: Security, Cloud Sync & Backup -->
      <div>

        <!-- Cloud Sync & Backup Card -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
              <i data-lucide="cloud" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
              <span>المزامنة السحابية والنسخ الاحتياطي</span>
            </h3>
          </div>
          <div class="card-body">
            <p style="font-size: var(--font-size-xs); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-4);">
              يتم حفظ كافة البيانات تلقائياً، ويمكنك تصدير نسخة احتياطية كاملة بصيغة JSON لحفظها على حاسوبك الشخصي أو استعادتها في أي وقت.
            </p>

            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              <button class="btn btn-primary" id="cloud-sync-btn" style="width: 100%; justify-content: center; background: var(--brass-500); color: #1e1706; font-weight: 700;">
                <i data-lucide="refresh-cw"></i>
                <span>مزامنة سحابية فورية لكافة الهواتف والأجهزة</span>
              </button>

              <div style="display: flex; gap: var(--space-3);">
                <button class="btn btn-secondary btn-sm" id="export-backup-btn" style="flex: 1;">
                  <i data-lucide="download"></i>
                  <span>تصدير نسخة (JSON)</span>
                </button>
                
                <label class="btn btn-secondary btn-sm" style="flex: 1; cursor: pointer;">
                  <i data-lucide="upload"></i>
                  <span>استعادة نسخة</span>
                  <input type="file" id="import-backup-file" accept=".json" style="display: none;">
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Security & Password Card -->
        <div class="card" style="margin-bottom: var(--space-6);">
          <div class="card-header">
            <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
              <i data-lucide="lock" style="width: 18px; height: 18px; color: var(--emerald-800);"></i>
              <span>تأمين لوحة الإدارة وكلمة المرور</span>
            </h3>
          </div>
          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">كلمة المرور الجديدة</label>
                <input type="password" id="set-new-password" class="form-input" placeholder="كلمة المرور الجديدة" autocomplete="new-password">
              </div>
              <div class="form-group">
                <label class="form-label">تأكيد كلمة المرور</label>
                <input type="password" id="set-confirm-password" class="form-input" placeholder="أعد إدخال الكلمة" autocomplete="new-password">
              </div>
            </div>

            <button class="btn btn-primary btn-sm" id="change-password-btn">
              <i data-lucide="key"></i>
              <span>تحديث كلمة المرور</span>
            </button>
          </div>
        </div>

        <!-- Danger Zone Card -->
        <div class="card" style="border-color: #f8c9c9;">
          <div class="card-header" style="background: #fdf2f2;">
            <h3 style="display: flex; align-items: center; gap: var(--space-2); color: var(--danger); margin: 0;">
              <i data-lucide="alert-triangle" style="width: 18px; height: 18px;"></i>
              <span>منطقة الإجراءات الحاسمة</span>
            </h3>
          </div>
          <div class="card-body">
            <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: var(--space-4);">
              إعادة ضبط المنظومة وحذف جميع سجلات الطلبة واليوميات والحضور محلياً. لا يمكن التراجع عن هذا الإجراء إلا باستعادة نسخة احتياطية سابقة.
            </p>
            <button class="btn btn-danger btn-sm" id="reset-data-btn">
              <i data-lucide="trash-2"></i>
              <span>حذف وإعادة ضبط كافة البيانات</span>
            </button>
          </div>
        </div>

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
      showToast('تم حفظ إعدادات وهوية المدرسة بنجاح');
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
      showToast('كلمة المرور يجب أن تتكون من 4 أحرف على الأقل', 'error');
      return;
    }

    if (newPass !== confirmPass) {
      showToast('كلمات المرور غير متطابقة، يرجى التحقق', 'error');
      return;
    }

    updateAdminPassword(newPass);
    showToast('تم تحديث كلمة مرور مدير النظام بنجاح');
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
    showToast('تم تنزيل النسخة الاحتياطية بنجاح على جهازك');
  });

  // Import Backup JSON
  document.getElementById('import-backup-file')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const contentStr = event.target?.result;
      if (typeof contentStr === 'string') {
        confirmDialog('هل أنت متأكد من استعادة هذه النسخة الاحتياطية؟ سيتم استبدال البيانات الحالية.', () => {
          if (importAllData(contentStr)) {
            showToast('تمت استعادة البيانات بنجاح!');
            setTimeout(() => location.reload(), 800);
          } else {
            showToast('فشلت قراءة ملف النسخة الاحتياطية', 'error');
          }
        });
      }
    };
    reader.readAsText(file);
  });

  // Cloud Sync
  document.getElementById('cloud-sync-btn')?.addEventListener('click', async () => {
    showToast('جاري المزامنة مع سحابة مدرسة سند...', 'info');
    const res = await pushToCloud();
    if (res) {
      showToast('تمت المزامنة السحابية بنجاح وتحديث كافة الأجهزة المتصلة 🎉');
    } else {
      showToast('تم الحفظ محلياً وسيتم التزامن فور الاتصال');
    }
  });

  // Reset Data
  document.getElementById('reset-data-btn')?.addEventListener('click', () => {
    confirmDialog('تحذير شديد: هل أنت متأكد من حذف كافة البيانات والبدء من جديد؟ لا يمكن التراجع عن هذا الإجراء.', () => {
      resetAllData();
      adminLogout();
      showToast('تمت إعادة ضبط البيانات', 'info');
      setTimeout(() => navigateTo('/'), 400);
    });
  });
}
