// ============================
// Toast Notifications
// ============================

import { initIcons } from '../utils/helpers.js';

export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = '';
  switch(type) {
    case 'success': icon = '<i data-lucide="check-circle"></i>'; break;
    case 'error': icon = '<i data-lucide="alert-circle"></i>'; break;
    case 'info': icon = '<i data-lucide="info"></i>'; break;
  }
  
  toast.innerHTML = `${icon}<span>${message}</span>`;
  container.appendChild(toast);
  initIcons();
  
  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
