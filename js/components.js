import { resolvePath } from './config.js';

/**
cargo un componente html reutilizable (navbar, footer) con fetch y lo inyecto dentro del elemento indicado.
 */
export async function loadComponent(targetId, url) {
  const target = document.getElementById(targetId);
  if (!target) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    target.innerHTML = await response.text();
    // las rutas del componente estan escritas desde la raiz, las ajusto segun la pagina actual.
    target.querySelectorAll('[href], [src]').forEach((el) => {
      ['href', 'src'].forEach((attr) => {
        if (el.hasAttribute(attr)) el.setAttribute(attr, resolvePath(el.getAttribute(attr)));
      });
    });
  } catch (error) {
    console.error(`no cargo el componente ${url}:`, error);
    target.innerHTML = `<p class="noscript">no se pudo cargar ${url}.</p>`;
  }
}
