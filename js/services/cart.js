import { CONFIG } from '../config.js';
import { storage, emit } from './storage.js';

const KEY = CONFIG.storageKeys.cart;

export const getCart = () => storage.get(KEY, []);

function save(cart) {
  storage.set(KEY, cart);
  emit('cart:updated');
}

export const getQty = (id) => getCart().find((item) => item.id === id)?.qty ?? 0;
export const cartCount = () => getCart().reduce((total, item) => total + item.qty, 0);

/** agrego unidades respetando el stock disponible. */
export function addToCart(product, qty = 1) {
  if (product.stock <= 0) return { ok: false, message: 'este producto esta agotado' };

  const cart = getCart();
  const item = cart.find((entry) => entry.id === product.id);
  const current = item?.qty ?? 0;

  if (current + qty > product.stock) {
    return { ok: false, message: `quedan ${product.stock} unidades de este producto` };
  }

  if (item) item.qty += qty;
  else cart.push({ id: product.id, qty });

  save(cart);
  return { ok: true, message: `agregaste "${product.title}" al carrito` };
}

/** fijo la cantidad. si es 0 o menos, elimino el producto. */
export function setQty(id, qty) {
  if (qty <= 0) return removeFromCart(id);
  const cart = getCart().map((item) => (item.id === id ? { ...item, qty } : item));
  save(cart);
}

export function removeFromCart(id) {
  save(getCart().filter((item) => item.id !== id));
}

export function clearCart() {
  save([]);
}

/** quito productos inexistentes/agotados y ajusto cantidades al stock actual. */
export function syncCart(products) {
  const cart = getCart();
  const fixed = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product || product.stock <= 0) return null;
      return { id: item.id, qty: Math.min(item.qty, product.stock) };
    })
    .filter(Boolean);

  if (JSON.stringify(fixed) !== JSON.stringify(cart)) save(fixed);
}

/** calculo lineas, descuentos, envio y total. */
export function summarize(products) {
  const lines = getCart()
    .map(({ id, qty }) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, qty, subtotal: product.finalPrice * qty } : null;
    })
    .filter(Boolean);

  const gross = lines.reduce((total, line) => total + line.product.price * line.qty, 0);
  const subtotal = lines.reduce((total, line) => total + line.subtotal, 0);
  const shipping = subtotal === 0 || subtotal >= CONFIG.freeShippingFrom ? 0 : CONFIG.shippingCost;

  return {
    lines,
    items: lines.reduce((total, line) => total + line.qty, 0),
    gross,
    subtotal,
    savings: gross - subtotal,
    shipping,
    total: subtotal + shipping,
    missingForFree: Math.max(0, CONFIG.freeShippingFrom - subtotal)
  };
}
