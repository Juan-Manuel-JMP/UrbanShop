import { register, isLoggedIn } from '../services/auth.js';
import { showToast } from '../ui/feedback.js';
import {
  isEmail, setError, clearErrors, showFormError, bindPasswordToggles, safeRedirect
} from '../ui/forms.js';

export function init() {
  const redirectParam = new URLSearchParams(location.search).get('redirect');
  const redirectTo = safeRedirect(redirectParam);

  if (isLoggedIn()) {
    location.replace(redirectTo);
    return;
  }

  if (redirectParam) {
    document.getElementById('goLogin').href = `login.html?redirect=${encodeURIComponent(redirectTo)}`;
  }

  const form = document.getElementById('registerForm');
  bindPasswordToggles(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(form);

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    const confirm = form.elements.confirm.value;
    let valid = true;

    if (name.length < 2) { setError(form, 'name', 'ingresa tu nombre completo'); valid = false; }
    if (!isEmail(email)) { setError(form, 'email', 'ingresa un email valido'); valid = false; }
    if (password.length < 6) { setError(form, 'password', 'debe tener al menos 6 caracteres'); valid = false; }
    if (confirm !== password) { setError(form, 'confirm', 'las contraseñas no coinciden'); valid = false; }
    if (!form.elements.terms.checked) { setError(form, 'terms', 'acepta los terminos'); valid = false; }
    if (!valid) return;

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;

    const result = await register({ name, email, password });
    if (!result.ok) {
      setError(form, result.field ?? 'email', result.message);
      submit.disabled = false;
      return;
    }

    showToast('cuenta creada, iniciaste sesion.');
    setTimeout(() => location.assign(redirectTo), 800);
  });
}