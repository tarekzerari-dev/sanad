// ============================================================
// سند — Admin Spinning Wheel (العجلة الدوارة للاختيار العشوائي)
// ============================================================

import { getStudents } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { openModal } from '../../components/modal.js';
import { initIcons } from '../../utils/helpers.js';
import { renderAvatar } from '../../utils/avatars.js';

let activeStudents = [];
let wheelAngle = 0;
let isSpinning = false;

// Refined educational Islamic palette
const sliceColors = [
  '#1a4d2e', '#22633c', '#2c7a4b', '#38955d', '#c29334', 
  '#a87f28', '#2b6cb0', '#3182ce', '#319795', '#285e61',
  '#4a5568', '#718096', '#805ad5', '#6b46c1', '#b7791f'
];

export function renderWheelPage() {
  const students = getStudents();
  activeStudents = [...students];

  const content = `
    <!-- Page Header -->
    <div class="page-header" style="margin-bottom: var(--space-5);">
      <div>
        <h2 style="font-size: 1.5rem; margin-bottom: 4px;">عجلة الاختيار العشوائي للحلقة</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-secondary); margin: 0;">
          اختيار عادل وتفاعلي لطالب للتسميع الفردي، الإجابة عن أحكام التجويد، أو قيادة التلاوة
        </p>
      </div>
    </div>

    <!-- Main Interactive Stage -->
    <div style="display: grid; grid-template-columns: 1.6fr 1fr; gap: var(--space-6); align-items: start;">
      
      <!-- Wheel Canvas Board -->
      <div class="card" style="display: flex; flex-direction: column; align-items: center; padding: var(--space-8) var(--space-6); text-align: center;">
        
        <!-- Wheel Visual Stage -->
        <div style="position: relative; width: 340px; height: 340px; margin-bottom: var(--space-6);">
          
          <!-- Top Arrow Pointer -->
          <div style="position: absolute; top: -14px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 18px solid transparent; border-right: 18px solid transparent; border-top: 36px solid #171a18; z-index: 10; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));"></div>
          
          <!-- Canvas Wheel -->
          <canvas id="wheel-canvas" width="340" height="340" style="border-radius: 50%; border: 6px solid #ffffff; box-shadow: 0 12px 36px rgba(18, 44, 28, 0.2); transition: transform 4.5s cubic-bezier(0.12, 0.95, 0.2, 1); transform: rotate(0deg);"></canvas>
          
          <!-- Center Golden Core Hub -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; background: #ffffff; border-radius: 50%; z-index: 5; border: 4px solid var(--brass-400); box-shadow: 0 4px 10px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
            <div style="width: 14px; height: 14px; background: var(--emerald-800); border-radius: 50%;"></div>
          </div>
        </div>
        
        <!-- Spin Trigger Button -->
        <button class="btn btn-primary btn-lg" id="spin-btn" style="min-width: 240px; font-size: 1.15rem; font-weight: 700; border-radius: var(--border-radius-full); box-shadow: var(--shadow-green); padding: 14px 32px;">
          <i data-lucide="play"></i>
          <span>تدوير العجلة الآن!</span>
        </button>

        <div style="font-size: 11px; color: var(--text-muted); margin-top: var(--space-3);">
          الطلبة النشطون في القرعة: <strong id="active-wheel-count">${activeStudents.length}</strong> طالب
        </div>
      </div>

      <!-- Participants Filter & Select Panel -->
      <div class="card">
        <div class="card-header">
          <h3 style="display: flex; align-items: center; gap: var(--space-2); margin: 0;">
            <i data-lucide="users" style="width: 17px; height: 17px; color: var(--emerald-800);"></i>
            <span>الطلبة المؤهلون للقرعة</span>
          </h3>
          <div style="display: flex; gap: var(--space-1);">
            <button class="btn btn-ghost btn-sm" id="select-all-btn" style="font-size: 11px; padding: 2px 8px;">تحديد الكل</button>
            <button class="btn btn-ghost btn-sm" id="deselect-all-btn" style="font-size: 11px; padding: 2px 8px;">إلغاء</button>
          </div>
        </div>

        <div class="card-body">
          <div style="max-height: 420px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-2); background: var(--bg-surface);" id="wheel-participants">
            ${students.map(s => `
              <label style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; cursor: pointer; border-radius: var(--border-radius-sm); border-bottom: 1px solid var(--border-subtle);" class="hover-bg">
                <div style="display: flex; align-items: center; gap: var(--space-2);">
                  <input type="checkbox" class="wheel-participant-check" value="${s.id}" checked>
                  ${renderAvatar(s.avatar, 'avatar-xs')}
                  <span style="font-size: var(--font-size-sm); font-weight: 600; color: var(--text-primary);">${s.firstName} ${s.lastName}</span>
                </div>
                <span class="badge badge-gray" style="font-size: 10px;">${s.group}</span>
              </label>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;

  const app = document.getElementById('app');
  app.innerHTML = renderAdminLayout('/admin/wheel', content);
  initAdminLayout();
  initIcons();

  drawWheel();
  initWheelEvents();
}

function drawWheel() {
  const canvas = document.getElementById('wheel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = centerX;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (activeStudents.length === 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f4f3ed';
    ctx.fill();
    
    ctx.fillStyle = '#787e78';
    ctx.font = '500 15px "Thmanyah Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('يرجى تحديد طلبة للمشاركة', centerX, centerY);
    return;
  }

  const sliceAngle = (2 * Math.PI) / activeStudents.length;

  for (let i = 0; i < activeStudents.length; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    
    // Slice Fill
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = sliceColors[i % sliceColors.length];
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Text Label (Strictly Thmanyah Sans)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px "Thmanyah Sans", sans-serif';
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 3;
    
    const name = activeStudents[i].firstName + ' ' + activeStudents[i].lastName;
    ctx.fillText(name, radius - 22, 5, radius - 70);
    ctx.restore();
  }
}

function initWheelEvents() {
  const checkboxes = document.querySelectorAll('.wheel-participant-check');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deselectAllBtn = document.getElementById('deselect-all-btn');
  const spinBtn = document.getElementById('spin-btn');
  const counter = document.getElementById('active-wheel-count');

  function updateActiveStudents() {
    const allStudents = getStudents();
    const selectedIds = Array.from(document.querySelectorAll('.wheel-participant-check:checked')).map(cb => cb.value);
    activeStudents = allStudents.filter(s => selectedIds.includes(s.id));
    if (counter) counter.textContent = activeStudents.length;
    drawWheel();
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateActiveStudents));

  selectAllBtn?.addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = true);
    updateActiveStudents();
  });

  deselectAllBtn?.addEventListener('click', () => {
    checkboxes.forEach(cb => cb.checked = false);
    updateActiveStudents();
  });

  spinBtn?.addEventListener('click', () => {
    if (isSpinning || activeStudents.length === 0) return;
    
    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.style.opacity = '0.6';

    const canvas = document.getElementById('wheel-canvas');
    const sliceAngle = 360 / activeStudents.length;
    
    // Random spin between 5 and 9 rotations plus random offset
    const spins = Math.floor(Math.random() * 5) + 5; 
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = (spins * 360) + randomAngle;
    
    wheelAngle += totalRotation;
    canvas.style.transform = `rotate(${wheelAngle}deg)`;

    setTimeout(() => {
      isSpinning = false;
      spinBtn.disabled = false;
      spinBtn.style.opacity = '1';

      // Pointer is at top (270 deg)
      const normalizedAngle = wheelAngle % 360;
      let pointerAngle = (270 - normalizedAngle) % 360;
      if (pointerAngle < 0) pointerAngle += 360;
      
      const winningIndex = Math.floor(pointerAngle / sliceAngle);
      const winner = activeStudents[winningIndex];

      if (winner) {
        showWinnerModal(winner);
      }
    }, 4500);
  });
}

function showWinnerModal(winner) {
  const body = `
    <div style="text-align: center; padding: var(--space-6) var(--space-4);">
      <div style="width: 72px; height: 72px; margin: 0 auto var(--space-4); border: 3px solid var(--brass-400); border-radius: var(--border-radius-full); padding: 4px; background: var(--brass-50);">
        ${renderAvatar(winner.avatar, 'avatar-md')}
      </div>
      
      <div style="font-size: 11px; font-weight: 700; color: var(--brass-700); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-1);">
        وقع الاختيار على
      </div>
      
      <h3 style="font-family: var(--font-heading); font-size: 2rem; color: var(--emerald-950); margin-bottom: var(--space-2);">
        ${winner.firstName} ${winner.lastName}
      </h3>
      
      <div style="display: flex; justify-content: center; gap: var(--space-2); margin-bottom: var(--space-4);">
        <span class="badge badge-green">${winner.group}</span>
        <span class="badge badge-gray">${winner.level}</span>
      </div>

      <p style="font-size: var(--font-size-sm); color: var(--text-secondary); max-width: 320px; margin: 0 auto;">
        المشارك المختار للتسميع اليومي والمشاركة في حلقة القرآن الكريم. نسأل الله له التوفيق والتيسير.
      </p>
    </div>
  `;
  
  openModal('نتيجة القرعة العشوائية', body);
}
