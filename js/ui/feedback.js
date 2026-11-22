import { escapeHTML } from '../utils.js';

let toastContainer;

/** notificacion flotante */
export function showToast(message, type = 'success', duration = 3200) {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    document.body.append(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.append(toast);
  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

/** vacio dentro de un contenedor */
export function renderEmpty(container, { icon = '🔍', title, text = '', actionLabel = '', actionHref = '' }) {
  container.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon" aria-hidden="true">${icon}</span>
      <h3>${escapeHTML(title)}</h3>
      ${text ? `<p>${escapeHTML(text)}</p>` : ''}
      ${actionLabel ? `<a class="btn btn-primary" href="${escapeHTML(actionHref)}">${escapeHTML(actionLabel)}</a>` : ''}
    </div>`;
}

export function renderError(container, message) {
  container.innerHTML = `
    <div class="empty-state is-error" role="alert">
      <span class="empty-icon" aria-hidden="true">⚠️</span>
      <h3>algo no salio bien</h3>
      <p>${escapeHTML(message)}</p>
    </div>`;
}
