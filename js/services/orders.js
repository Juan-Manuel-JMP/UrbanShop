import { CONFIG } from '../config.js';
import { storage } from './storage.js';

const KEY = CONFIG.storageKeys.orders;

/** guardo un pedido simulado con summary es el resultado de cart.summarize(). */
export function createOrder(user, summary) {
  const orders = storage.get(KEY, []);
  const order = {
    id: `NS-${Date.now().toString(36).toUpperCase()}`,
    date: new Date().toISOString(),
    userId: user.id,
    email: user.email,
    items: summary.lines.map(({ product, qty }) => ({
      id: product.id,
      title: product.title,
      qty,
      unitPrice: product.finalPrice
    })),
    subtotal: summary.subtotal,
    shipping: summary.shipping,
    total: summary.total
  };
  orders.push(order);
  storage.set(KEY, orders);
  return order;
}

export const getOrders = (userId) => storage.get(KEY, []).filter((order) => order.userId === userId);
export const clearOrders = () => storage.remove(KEY);
