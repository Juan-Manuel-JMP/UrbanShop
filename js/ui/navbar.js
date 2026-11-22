import { cartCount } from '../services/cart.js';
import { getUser, logout } from '../services/auth.js';
import { showToast } from './feedback.js';
import { $, $$ } from '../utils.js';

function markActiveLinks() {
  const current = location.pathname.split('/').pop() || 'index.html';
  $$('[data-nav]').forEach((link) => {
    const isActive = new URL(link.href).pathname.split('/').pop() === current;
    link.classList.toggle('active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });
}

function updateCartBadge() {
  const total = cartCount();
  $$('[data-cart-count]').forEach((badge) => {
    badge.textContent = total > 99 ? '99+' : total;
    badge.hidden = total === 0;
  });
}

function updateAuthArea() {
  const user = getUser();
  const guest = $('[data-auth="guest"]');
  const logged = $('[data-auth="user"]');
  if (!guest || !logged) return;

  guest.hidden = Boolean(user);
  logged.hidden = !user;

  if (user) {
    const firstName = user.name.split(' ')[0];
    $('[data-user-name]').textContent = firstName;
    $('[data-user-initial]').textContent = firstName.charAt(0).toUpperCase();
  }
}

export function initNavbar() {
  markActiveLinks();
  updateCartBadge();
  updateAuthArea();

  // la interfaz reacciona a los eventos de los servicios y a cambios hechos en otra pestaña)
  window.addEventListener('cart:updated', updateCartBadge);
  window.addEventListener('auth:changed', updateAuthArea);
  window.addEventListener('storage', () => { updateCartBadge(); updateAuthArea(); });

  $('[data-logout]')?.addEventListener('click', () => {
    logout();
    showToast('cerraste sesion', 'info');
  });

  const header = $('#siteHeader');
  const onScroll = () => header?.classList.toggle('scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
