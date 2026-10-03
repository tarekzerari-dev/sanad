// ============================
// Admin - Spinning Wheel
// ============================

import { getStudents } from '../../data/store.js';
import { renderAdminLayout, initAdminLayout } from '../../admin-layout.js';
import { openModal } from '../../components/modal.js';
import { initIcons } from '../../utils/helpers.js';

let activeStudents = [];
let wheelAngle = 0;
let isSpinning = false;
let colors = [
  '#4ec478', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#10b981', '#f43f5e', '#0ea5e9', '#d946ef', '#f97316',
  '#14b8a6', '#6366f1', '#84cc16', '#eab308', '#06b6d4'
];

export function renderWheelPage() {
  const students = getStudents();
  activeStudents = [...students];

  const content = `
    <div class="page-header">
      <div>
        <h2 style="font-size: var(--font-size-xl);">عجلة الاختيار العشوائي</h2>
        <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">اختر طالباً عشوائياً للتسميع أو المشاركة</p>
      </div>
    </div>

    <div style="display: flex; gap: var(--space-6); flex-wrap: wrap;">
      
      <!-- Wheel Container -->
      <div class="card" style="flex: 2; min-width: 300px; display: flex; flex-direction: column; align-items: center; padding: var(--space-6);">
        <div class="wheel-container" style="position: relative; width: 320px; height: 320px; margin-bottom: var(--space-6);">
          <div class="wheel-pointer" style="position: absolute; top: -15px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 20px solid transparent; border-right: 20px solid transparent; border-top: 40px solid var(--gray-800); z-index: 10;"></div>
          <canvas id="wheel-canvas" width="320" height="320" style="border-radius: 50%; border: 4px solid var(--gray-800); box-shadow: var(--shadow-xl); transition: transform 4s cubic-bezier(0.1, 0.9, 0.2, 1); transform: rotate(0deg);"></canvas>
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background: var(--gray-800); border-radius: 50%; z-index: 5; border: 4px solid white;"></div>
        </div>
        
        <button class="btn btn-primary btn-lg" id="spin-btn" style="width: 200px; font-size: var(--font-size-xl); font-weight: 800; border-radius: var(--border-radius-full);">
          <i data-lucide="play"></i>
          دَوِّر العجلة!
        </button>
      </div>

      <!-- Settings / Participants -->
      <div class="card" style="flex: 1; min-width: 250px;">
        <div class="card-header">
          <h3 style="font-size: var(--font-size-base); display: flex; align-items: center; gap: var(--space-2);">
            <i data-lucide="users" style="width:18px;height:18px;color:var(--green-500);"></i>
            الطلبة المشاركون
          </h3>
        </div>
        <div class="card-body">
          <div style="margin-bottom: var(--space-4); display: flex; gap: var(--space-2);">
            <button class="btn btn-secondary btn-sm" id="select-all-btn" style="flex: 1;">تحديد الكل</button>
            <button class="btn btn-ghost btn-sm" id="deselect-all-btn" style="flex: 1;">إلغاء الكل</button>
          </div>
          <div style="max-height: 400px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: var(--space-2);" id="wheel-participants">
            ${students.map(s => `
              <label style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); cursor: pointer; border-radius: var(--border-radius-sm);" class="participant-label hover-bg">
                <input type="checkbox" class="wheel-participant-check" value="${s.id}" checked>
                <span style="font-size: var(--font-size-sm);">${s.firstName} ${s.lastName}</span>
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
    ctx.fillStyle = '#f5f5f4';
    ctx.fill();
    
    ctx.fillStyle = '#a8a29e';
    ctx.font = '16px Cairo';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('لا يوجد طلبة محددين', centerX, centerY);
    return;
  }

  const sliceAngle = (2 * Math.PI) / activeStudents.length;

  for (let i = 0; i < activeStudents.length; i++) {
    const startAngle = i * sliceAngle;
    const endAngle = startAngle + sliceAngle;
    
    // Draw slice
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();

    // Draw text
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(startAngle + sliceAngle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Cairo';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    // Max width for text so it doesn't overlap center
    const name = activeStudents[i].firstName + ' ' + activeStudents[i].lastName;
    ctx.fillText(name, radius - 20, 0, radius - 60);
    ctx.restore();
  }
}

function initWheelEvents() {
  const checkboxes = document.querySelectorAll('.wheel-participant-check');
  const selectAllBtn = document.getElementById('select-all-btn');
  const deselectAllBtn = document.getElementById('deselect-all-btn');
  const spinBtn = document.getElementById('spin-btn');

  function updateActiveStudents() {
    const allStudents = getStudents();
    const selectedIds = Array.from(document.querySelectorAll('.wheel-participant-check:checked')).map(cb => cb.value);
    activeStudents = allStudents.filter(s => selectedIds.includes(s.id));
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
    spinBtn.style.opacity = '0.5';

    const canvas = document.getElementById('wheel-canvas');
    const sliceAngle = 360 / activeStudents.length;
    
    // Spin between 5 and 10 times, plus a random angle
    const spins = Math.floor(Math.random() * 5) + 5; 
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = (spins * 360) + randomAngle;
    
    wheelAngle += totalRotation;
    canvas.style.transform = `rotate(${wheelAngle}deg)`;

    // Calculate winner
    setTimeout(() => {
      isSpinning = false;
      spinBtn.disabled = false;
      spinBtn.style.opacity = '1';

      // The top pointer is at 270 degrees in canvas space (or -90).
      // Canvas starts 0 at right (3 o'clock). Top is -90deg.
      // So pointer is at 270 deg.
      // Since we rotate the canvas by wheelAngle, the slice at the top
      // is the one where (startAngle + wheelAngle) % 360 contains 270.
      
      const normalizedAngle = wheelAngle % 360;
      // To find the winning index:
      // The slice that ends up at the top pointer (270 degrees):
      // The angle of the canvas at the top pointer is 270 - normalizedAngle.
      let pointerAngle = (270 - normalizedAngle) % 360;
      if (pointerAngle < 0) pointerAngle += 360;
      
      const winningIndex = Math.floor(pointerAngle / sliceAngle);
      const winner = activeStudents[winningIndex];

      showWinnerModal(winner);
      
    }, 4000); // Wait for CSS transition
  });
}

function showWinnerModal(winner) {
  // Trigger confetti or special CSS
  const body = `
    <div style="text-align: center; padding: var(--space-4) 0;">
      <div style="font-size: 64px; margin-bottom: var(--space-4); animation: bounce 1s infinite;">🎉</div>
      <h3 style="font-size: var(--font-size-3xl); color: var(--green-600); margin-bottom: var(--space-2);">${winner.firstName} ${winner.lastName}</h3>
      <p style="font-size: var(--font-size-lg); color: var(--text-secondary);">الطالب المختار للتسميع أو المشاركة!</p>
    </div>
  `;
  
  openModal('نتيجة الاختيار', body);
}
