import { $ } from '../utils.js';
import { resetStock } from '../services/inventory.js';
import { clearCart } from '../services/cart.js';
import { clearOrders } from '../services/orders.js';

export function initFooter() {
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // devuelvo el stock original y vacia carrito y pedidos
  $('[data-reset-demo]')?.addEventListener('click', () => {
    if (!confirm('restablecer stock, carrito y pedidos de la prueba?')) return;
    resetStock();
    clearCart();
    clearOrders();
    location.reload();
  });
}
