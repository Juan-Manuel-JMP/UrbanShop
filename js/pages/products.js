import { getProducts } from '../services/api.js';
import { renderProductGrid, renderSkeletons } from '../ui/productCard.js';
import { renderError } from '../ui/feedback.js';
import { debounce, normalize } from '../utils.js';

const SORTERS = {
  featured: (a, b) => Number(b.featured) - Number(a.featured) || b.discount - a.discount,
  'price-asc': (a, b) => a.finalPrice - b.finalPrice,
  'price-desc': (a, b) => b.finalPrice - a.finalPrice,
  discount: (a, b) => b.discount - a.discount,
  name: (a, b) => a.title.localeCompare(b.title, 'es')
};

export async function init() {
  const els = {
    grid: document.getElementById('productsGrid'),
    search: document.getElementById('searchInput'),
    category: document.getElementById('categorySelect'),
    sort: document.getElementById('sortSelect'),
    offers: document.getElementById('offersOnly'),
    count: document.getElementById('resultsCount'),
    reset: document.getElementById('resetFilters')
  };

  renderSkeletons(els.grid, 8);

  let products;
  try {
    products = await getProducts();
  } catch (error) {
    console.error(error);
    renderError(els.grid, 'no cargo el catalogo.');
    return;
  }

  // opciones de categoria a partir de los datos
  [...new Set(products.map((p) => p.category))].forEach((category) => {
    els.category.append(new Option(category, category));
  });

  // valores iniciales desde la url
  const params = new URLSearchParams(location.search);
  els.category.value = params.get('category') ?? '';
  els.offers.checked = params.get('offer') === '1';
  els.search.value = params.get('q') ?? '';

  function apply() {
    const term = normalize(els.search.value.trim());

    const result = products
      .filter((p) => !els.category.value || p.category === els.category.value)
      .filter((p) => !els.offers.checked || p.discount > 0)
      .filter((p) => !term || normalize(`${p.title} ${p.category} ${p.description}`).includes(term))
      .sort(SORTERS[els.sort.value]);

    renderProductGrid(els.grid, result);
    els.count.textContent = `${result.length} ${result.length === 1 ? 'producto' : 'productos'}`;

    // refleja los filtros en la url sin recargar
    const next = new URLSearchParams();
    if (els.category.value) next.set('category', els.category.value);
    if (els.offers.checked) next.set('offer', '1');
    if (els.search.value.trim()) next.set('q', els.search.value.trim());
    const query = next.toString();
    history.replaceState(null, '', query ? `?${query}` : location.pathname);
  }

  els.search.addEventListener('input', debounce(apply, 250));
  [els.category, els.sort, els.offers].forEach((el) => el.addEventListener('change', apply));
  els.reset.addEventListener('click', () => {
    els.search.value = '';
    els.category.value = '';
    els.sort.value = 'featured';
    els.offers.checked = false;
    apply();
  });

  apply();
}
