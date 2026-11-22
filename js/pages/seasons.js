import { getProducts, getVideos } from '../services/api.js';
import { renderProductGrid, renderSkeletons } from '../ui/productCard.js';
import { renderVideoGrid } from '../ui/videoCard.js';
import { renderError } from '../ui/feedback.js';
import { escapeHTML } from '../utils.js';

export async function init() {
  const chipsBox = document.getElementById('seasonChips');
  const videosBox = document.getElementById('seasonVideos');
  const offersBox = document.getElementById('seasonOffers');

  renderSkeletons(offersBox, 4);

  try {
    const [videos, products] = await Promise.all([getVideos(), getProducts()]);

    // --- videos de temporada con filtro por estacion ---
    const seasonal = videos.filter((video) => video.category === 'temporada');
    const seasons = [...new Set(seasonal.map((video) => video.season))];
    let active = 'Todas';

    const paint = () => {
      chipsBox.innerHTML = ['Todas', ...seasons].map((name) => `
        <button class="chip ${name === active ? 'active' : ''}" type="button" data-season="${escapeHTML(name)}" aria-pressed="${name === active}">
          ${escapeHTML(name)}
        </button>`).join('');

      // si es "todas", muestro 6. si es otra estacion, muestra los de esa estacion.
      const filteredVideos = active === 'Todas' 
        ? seasonal.slice(0, 6) 
        : seasonal.filter((video) => video.season === active);

      renderVideoGrid(videosBox, filteredVideos);
    };

    chipsBox.addEventListener('click', (event) => {
      const chip = event.target.closest('[data-season]');
      if (!chip) return;
      active = chip.dataset.season;
      paint();
    });
    paint();

    // --- productos con mayor descuento ---
    const offers = products
      .filter((product) => product.discount >= 20 && product.stock > 0)
      .sort((a, b) => b.discount - a.discount)
      .slice(0, 8);
    renderProductGrid(offersBox, offers);
  } catch (error) {
    console.error(error);
    renderError(videosBox, 'no cargo el contenido.');
    offersBox.replaceChildren();
  }
}