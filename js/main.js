import { CONFIG } from './config.js';
import { loadComponent } from './components.js';
import { initNavbar } from './ui/navbar.js';
import { initFooter } from './ui/footer.js';
import { seedDemoUser } from './services/auth.js';

/** aviso si se abrio el html con doble clic, fetch y los modulos requieren un servidor. */
function warnIfFileProtocol() {
  if (location.protocol !== 'file:') return false;
  const notice = document.createElement('div');
  notice.className = 'noscript';
  notice.innerHTML =
    '<strong>abri la tienda desde un servidor local.</strong> '
  document.body.prepend(notice);
  return true;
}

async function boot() {
  if (warnIfFileProtocol()) return;

  // navbar y footer reutilizables, cargados con fetch
  await Promise.all([
    loadComponent('navbar-root', CONFIG.paths.navbar),
    loadComponent('footer-root', CONFIG.paths.footer)
  ]);

  initNavbar();
  initFooter();
  await seedDemoUser();

  // cada html indica su pagina con <body data-page="...">
  const page = document.body.dataset.page;
  if (!page) return;

  try {
    const module = await import(`./pages/${page}.js`);
    await module.init();
  } catch (error) {
    console.error(`error al iniciar la pagina "${page}":`, error);
  }
}
boot();