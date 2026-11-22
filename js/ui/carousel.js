import { escapeHTML } from '../utils.js';

const slideTemplate = (banner, index) => `
  <article class="slide">
    <img src="${escapeHTML(banner.image)}" alt="" ${index === 0 ? '' : 'loading="lazy"'}>
    <div class="slide-content">
      <span class="slide-badge">${escapeHTML(banner.badge)}</span>
      <h2>${escapeHTML(banner.title)}</h2>
      <p>${escapeHTML(banner.subtitle)}</p>
      <a class="btn btn-light" href="${escapeHTML(banner.cta.href)}">${escapeHTML(banner.cta.label)}</a>
    </div>
  </article>`;

/** carrusel de banners con autoplay. */
export function createCarousel(root, banners, { interval = 5500 } = {}) {
  if (!banners.length) { root.remove(); return; }

  root.innerHTML = `
    <div class="carousel-track">${banners.map(slideTemplate).join('')}</div>
    <button class="carousel-btn prev" type="button" aria-label="Banner anterior">‹</button>
    <button class="carousel-btn next" type="button" aria-label="Banner siguiente">›</button>
    <div class="carousel-dots">
      ${banners.map((_, i) => `<button class="carousel-dot" type="button" aria-label="Ir al banner ${i + 1}"></button>`).join('')}
    </div>`;

  const track = root.querySelector('.carousel-track');
  const dots = [...root.querySelectorAll('.carousel-dot')];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let timer = null;

  const go = (next) => {
    index = (next + banners.length) % banners.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };
  const stop = () => clearInterval(timer);
  const start = () => {
    stop();
    if (banners.length > 1 && !reduceMotion) timer = setInterval(() => go(index + 1), interval);
  };

  root.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.classList.contains('prev')) go(index - 1);
    else if (button.classList.contains('next')) go(index + 1);
    else go(dots.indexOf(button));
    start();
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  let startX = null;
  root.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stop(); }, { passive: true });
  root.addEventListener('touchend', (e) => {
    if (startX !== null) {
      const delta = e.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
    }
    startX = null;
    start();
  });

  go(0);
  start();
}
