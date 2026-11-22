import { CONFIG, resolvePath } from '../config.js';
import { finalPrice } from '../utils.js';
import { getStockOverrides } from './inventory.js';

const cache = new Map();

/** fetch y json con cache en memoria para no repetir pedidos. */
export async function fetchJSON(url) {
  if (cache.has(url)) return cache.get(url);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`no se pudo cargar ${url} (HTTP ${response.status})`);
  }
  const data = await response.json();
  cache.set(url, data);
  return data;
}

/**
devuelvo los productos con el stock real aplico las compras ya realizadas y el precio final calculado.
 */
export async function getProducts() {
  const base = await fetchJSON(CONFIG.paths.products);
  const overrides = getStockOverrides();
  return base.map((product) => ({
    ...product,
    stock: overrides[product.id] ?? product.stock,
    finalPrice: finalPrice(product)
  }));
}

export const getBanners = async () => (await fetchJSON(CONFIG.paths.banners)).map((b) => ({
  ...b,
  image: resolvePath(b.image),
  cta: b.cta && { ...b.cta, href: resolvePath(b.cta.href) }
}));
export const getVideos = async () => (await fetchJSON(CONFIG.paths.videos)).map((v) => ({
  ...v,
  src: resolvePath(v.src),
  poster: resolvePath(v.poster)
}));
