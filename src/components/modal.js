// ============================
// Modal Component
// ============================

export function openModal(title, bodyHtml, footerHtml = '') {
  const container = document.getElementById('modal-container');
  
  container.innerHTML = `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal" id="modal-content">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" id="modal-close-btn">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="modal-body">
          ${bodyHtml}
        </div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;
  
  // Trigger animation
  requestAnimationFrame(() => {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.add('open');
  });
  
  // Init icons
  if (window.lucide) window.lucide.createIcons();
  
  // Close handlers
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  
  // Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

export function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    setTimeout(() => {
      const container = document.getElementById('modal-container');
      if (container) container.innerHTML = '';
    }, 250);
  }
}

export function confirmDialog(message, onConfirm) {
  const body = `
    <p style="font-size: var(--font-size-base); color: var(--text-secondary); margin-bottom: var(--space-4);">${message}</p>
    <div class="confirm-actions">
      <button class="btn btn-danger" id="confirm-yes">نعم، تأكيد</button>
      <button class="btn btn-ghost" id="confirm-no">إلغاء</button>
    </div>
  `;
  
  openModal('تأكيد', body);
  
  setTimeout(() => {
    document.getElementById('confirm-yes')?.addEventListener('click', () => {
      closeModal();
      onConfirm();
    });
    document.getElementById('confirm-no')?.addEventListener('click', closeModal);
  }, 50);
}
