import { PAGES } from '../config.js';
import { getProducts, getBanners } from '../services/api.js';
import { createCarousel } from '../ui/carousel.js';
import { renderProductGrid, renderSkeletons } from '../ui/productCard.js';
import { renderError } from '../ui/feedback.js';
import { escapeHTML } from '../utils.js';

const CATEGORY_ICONS = {
  'Audio': '🎧',
  'Computación': '💻',
  'Celulares': '📱',
  'Gaming': '🎮',
  'Hogar': '🏠'
};

function renderPromos(container, banners) {
  container.innerHTML = banners.map((banner) => `
    <a class="promo-card" href="${escapeHTML(banner.cta.href)}">
      <img src="${escapeHTML(banner.image)}" alt="baners" loading="lazy">
      <span class="promo-discount">${escapeHTML(banner.badge)}</span>
      <div class="promo-body">
        <h3>${escapeHTML(banner.title)}</h3>
        <p>${escapeHTML(banner.subtitle)}</p>
        <span>${escapeHTML(banner.cta.label)} →</span>
      </div>
    </a>`).join('');
}

function renderCategories(container, products) {
  const counts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});

  container.innerHTML = Object.entries(counts).map(([category, total]) => `
    <a class="category-tile" href="${PAGES}productos.html?category=${encodeURIComponent(category)}">
      <span class="cat-icon" aria-hidden="true">${CATEGORY_ICONS[category] ?? '🛍️'}</span>
      <strong>${escapeHTML(category)}</strong>
      <small>${total} productos</small>
    </a>`).join('');
}

export async function init() {
  const featuredGrid = document.getElementById('featuredGrid');
  const offersGrid = document.getElementById('offersGrid');

  renderSkeletons(featuredGrid, 4);
  renderSkeletons(offersGrid, 4);

  try {
    const [products, banners] = await Promise.all([getProducts(), getBanners()]);

    createCarousel(
      document.getElementById('heroCarousel'),
      banners.filter((banner) => banner.type === 'hero')
    );
    renderPromos(
      document.getElementById('promoBanners'),
      banners.filter((banner) => banner.type === 'mini')
    );

    renderProductGrid(featuredGrid, products.filter((p) => p.featured).slice(0, 8));

    const offers = products
      .filter((p) => p.discount > 0 && p.stock > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 4);
    renderProductGrid(offersGrid, offers);

    renderCategories(document.getElementById('categoryGrid'), products);
  } catch (error) {
    console.error(error);
    renderError(featuredGrid, 'no cargo los productos.');
    offersGrid.replaceChildren();
  }
}
