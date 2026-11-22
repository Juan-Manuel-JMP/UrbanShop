// formularios de login y registro.
import { ROOT } from '../config.js';

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

export function setError(form, name, message) {
  const output = form.querySelector(`[data-error-for="${name}"]`);
  const field = form.elements[name]?.closest('.field');
  if (output) output.textContent = message;
  field?.classList.toggle('invalid', Boolean(message));
}

export function clearErrors(form) {
  form.querySelectorAll('[data-error-for]').forEach((el) => { el.textContent = ''; });
  form.querySelectorAll('.field').forEach((field) => field.classList.remove('invalid'));
  showFormError(form, '');
}

export function showFormError(form, message) {
  const box = form.querySelector('.form-error');
  if (!box) return;
  box.textContent = message;
  box.hidden = !message;
}

export function bindPasswordToggles(form) {
  form.querySelectorAll('.toggle-pass').forEach((button) => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      button.textContent = show ? 'Ocultar' : 'Ver';
      button.setAttribute('aria-pressed', String(show));
    });
  });
}

/** solo permito volver a paginas internas como "carrito.html" */
export const safeRedirect = (value, fallback = ROOT + 'index.html') =>
  /^[\w-]+\.html$/.test(value || '') ? value : fallback;
