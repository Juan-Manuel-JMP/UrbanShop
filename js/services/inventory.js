import { CONFIG } from '../config.js';
import { storage, emit } from './storage.js';

const KEY = CONFIG.storageKeys.stock;

/** stock idProducto, stockActual con los stocks modificados por compras. */
export const getStockOverrides = () => storage.get(KEY, {});

/**
 descuento stock luego de una compra. items id, qty, stock donde stock es el stock actual del producto.
 */
export function discountStock(items) {
  const overrides = getStockOverrides();
  items.forEach(({ id, qty, stock }) => {
    overrides[id] = Math.max(0, stock - qty);
  });
  storage.set(KEY, overrides);
  emit('stock:updated');
}

export function resetStock() {
  storage.remove(KEY);
  emit('stock:updated');
}
