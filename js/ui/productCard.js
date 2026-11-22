import { CONFIG } from '../config.js';
import { escapeHTML, formatPrice } from '../utils.js';
import { addToCart } from '../services/cart.js';
import { showToast, renderEmpty } from './feedback.js';

function stockInfo(stock) {
  if (stock <= 0) return { text: 'agotado', cls: 'out' };
  if (stock <= 5) return { text: `ultimos ${stock}!`, cls: 'low' };
  return { text: `Stock: ${stock}`, cls: 'ok' };
}

/** galeria de imagenes de la card */
function initGallery(card, total) {
  if (total < 2) return;

  const slides = card.querySelector('.pc-slides');
  const dots = [...card.querySelectorAll('.pc-dot')];
  const media = card.querySelector('.pc-media');
  let index = 0;

  const go = (next) => {
    index = (next + total) % total;
    slides.style.setProperty('--index', index);
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  };

  media.addEventListener('click', (event) => {
    const nav = event.target.closest('.pc-nav');
    const dot = event.target.closest('.pc-dot');
    if (nav) go(index + (nav.classList.contains('next') ? 1 : -1));
    if (dot) go(Number(dot.dataset.index));
  });

  let startX = null;
  media.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  media.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const delta = e.changedTouches[0].clientX - startX;
    if (Math.abs(delta) > 35) go(index + (delta < 0 ? 1 : -1));
    startX = null;
  });

  go(0);
}

export function createProductCard(product) {
  const images = product.images?.length ? product.images : [CONFIG.fallbackImage];
  const stock = stockInfo(product.stock);
  const hasDiscount = product.discount > 0;
  const title = escapeHTML(product.title);
  const installment = formatPrice(Math.round(product.finalPrice / CONFIG.installments));

  const card = document.createElement('article');
  card.className = 'product-card';
  card.dataset.id = product.id;

  card.innerHTML = `
    <div class="pc-media">
      <div class="pc-badges">
        ${hasDiscount ? `<span class="badge badge-sale">-${product.discount}%</span>` : ''}
        ${product.featured ? '<span class="badge badge-featured">destacado</span>' : ''}
      </div>
      <div class="pc-slides">
        ${images.map((src, i) => `<img src="${escapeHTML(src)}" alt="${title} - imagen ${i + 1}" loading="lazy" width="700" height="700">`).join('')}
      </div>
      ${images.length > 1 ? `
        <button class="pc-nav prev" type="button" aria-label="imagen anterior">‹</button>
        <button class="pc-nav next" type="button" aria-label="imagen siguiente">›</button>
        <div class="pc-dots">
          ${images.map((_, i) => `<button class="pc-dot" type="button" data-index="${i}" aria-label="ver imagen ${i + 1}"></button>`).join('')}
        </div>` : ''}
    </div>
    <div class="pc-body">
      <span class="pc-category">${escapeHTML(product.category)}</span>
      <h3 class="pc-title">${title}</h3>
      <p class="pc-desc">${escapeHTML(product.description)}</p>
      <div class="pc-meta">
        <div class="pc-price">
          <span class="price-now">${formatPrice(product.finalPrice)}</span>
          ${hasDiscount ? `<span class="price-old">${formatPrice(product.price)}</span>` : ''}
          <span class="pc-installments">${CONFIG.installments} cuotas sin interes de ${installment}</span>
        </div>
        <span class="stock ${stock.cls}">${stock.text}</span>
      </div>
      <button class="btn btn-primary pc-add" type="button" ${product.stock <= 0 ? 'disabled' : ''}>
        ${product.stock <= 0 ? 'sin stock' : 'agregar al carrito'}
      </button>
    </div>`;

  initGallery(card, images.length);

  card.querySelector('.pc-add').addEventListener('click', () => {
    const result = addToCart(product, 1);
    showToast(result.message, result.ok ? 'success' : 'error');
  });

  return card;
}

export function renderProductGrid(container, products) {
  container.replaceChildren();

  if (!products.length) {
    renderEmpty(container, {
      title: 'no hay productos',
      text: 'ingresa otra busqueda o borra los filtros.'
    });
    return;
  }

  const fragment = document.createDocumentFragment();
  products.forEach((product) => fragment.append(createProductCard(product)));
  container.append(fragment);
}

export function renderSkeletons(container, count = 4) {
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="product-card skeleton-card" aria-hidden="true">
      <div class="skeleton sk-img"></div>
      <div class="pc-body"><div class="skeleton sk-line"></div><div class="skeleton sk-line short"></div></div>
    </div>`).join('');
}