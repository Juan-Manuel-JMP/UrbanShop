import { login, isLoggedIn } from '../services/auth.js';
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

  // conserva el destino si la persona decide registrarse
  if (redirectParam) {
    document.getElementById('goRegister').href = `registro.html?redirect=${encodeURIComponent(redirectTo)}`;
  }

  const form = document.getElementById('loginForm');
  bindPasswordToggles(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearErrors(form);

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    let valid = true;

    if (!isEmail(email)) { setError(form, 'email', 'ingresa un email valido'); valid = false; }
    if (!password) { setError(form, 'password', 'ingresa tu contraseña'); valid = false; }
    if (!valid) return;

    const submit = form.querySelector('[type="submit"]');
    submit.disabled = true;

    const result = await login({ email, password });
    if (!result.ok) {
      showFormError(form, result.message);
      submit.disabled = false;
      return;
    }

    showToast(`Hola, ${result.user.name.split(' ')[0]}!`);
    setTimeout(() => location.assign(redirectTo), 700);
  });
}
