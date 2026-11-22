import { CONFIG } from '../config.js';
import { getProducts } from '../services/api.js';
import {
  addToCart, setQty, removeFromCart, clearCart, summarize, syncCart
} from '../services/cart.js';
import { getUser, isLoggedIn } from '../services/auth.js';
import { discountStock } from '../services/inventory.js';
import { createOrder } from '../services/orders.js';
import { showToast, renderEmpty, renderError } from '../ui/feedback.js';
import { escapeHTML, formatPrice, wait } from '../utils.js';

let products = [];
let processing = false;

const listEl = () => document.getElementById('cartList');
const summaryEl = () => document.getElementById('cartSummary');
const dialogEl = () => document.getElementById('checkoutDialog');
const dialogBody = () => document.getElementById('dialogBody');

/* ---------- renderizado ---------- */
function lineTemplate({ product, qty, subtotal }) {
  const atLimit = qty >= product.stock;
  const title = escapeHTML(product.title);
  return `
    <article class="cart-item" data-id="${product.id}">
      <img class="ci-img" src="${escapeHTML(product.images[0] ?? CONFIG.fallbackImage)}" alt="${title}" width="104" height="104">
      <div class="ci-info">
        <h3>${title}</h3>
        <small>${escapeHTML(product.category)}</small>
        <div class="pc-price">
          <span class="price-now">${formatPrice(product.finalPrice)}</span>
          ${product.discount > 0 ? `<span class="price-old">${formatPrice(product.price)}</span>` : ''}
        </div>
        ${atLimit ? '<small class="stock low">alcanzaste el stock disponible</small>' : ''}
      </div>
      <div class="ci-side">
        <div class="qty" role="group" aria-label="Cantidad de ${title}">
          <button class="qty-btn" type="button" data-action="dec" data-id="${product.id}" aria-label="quitar una unidad">−</button>
          <span class="qty-value" aria-live="polite">${qty}</span>
          <button class="qty-btn" type="button" data-action="inc" data-id="${product.id}" aria-label="agregar una unidad" ${atLimit ? 'disabled' : ''}>+</button>
        </div>
        <span class="ci-subtotal">${formatPrice(subtotal)}</span>
        <button class="ci-remove" type="button" data-action="remove" data-id="${product.id}">eliminar</button>
      </div>
    </article>`;
}

function summaryTemplate(summary) {
  const progress = Math.min(100, Math.round((summary.subtotal / CONFIG.freeShippingFrom) * 100));
  const shippingNote = summary.missingForFree === 0
    ? '<div class="ship-progress done">tenes envio gratuito</div>'
    : `<div class="ship-progress">
         <span>suma ${formatPrice(summary.missingForFree)} mas para tener envio gratis</span>
         <div class="ship-bar"><span style="width:${progress}%"></span></div>
       </div>`;

  return `
    <h2>Resumen</h2>
    ${shippingNote}
    <div class="summary-row"><span>Productos (${summary.items})</span><span>${formatPrice(summary.gross)}</span></div>
    ${summary.savings > 0 ? `<div class="summary-row saving"><span>Descuentos</span><span>-${formatPrice(summary.savings)}</span></div>` : ''}
    <div class="summary-row"><span>Envío</span><span>${summary.shipping === 0 ? 'Gratis' : formatPrice(summary.shipping)}</span></div>
    <div class="summary-row summary-total"><span>Total</span><span>${formatPrice(summary.total)}</span></div>
    <button class="btn btn-primary btn-block" type="button" data-action="checkout">finalizar compra/s</button>
    <button class="btn btn-danger btn-block" type="button" data-action="clear">vaciar carrito</button>
    <a class="text-link" href="productos.html" style="text-align:center"> seguir comprando</a>`;
}

function render() {
  const summary = summarize(products);

  if (!summary.lines.length) {
    summaryEl().hidden = true;
    renderEmpty(listEl(), {
      icon: '🛒',
      title: 'el carrito esta vacio',
      text: 'agrega productos para verlos aca.',
      actionLabel: 'Ver productos',
      actionHref: 'productos.html'
    });
    return;
  }

  listEl().innerHTML = summary.lines.map(lineTemplate).join('');
  summaryEl().hidden = false;
  summaryEl().innerHTML = summaryTemplate(summary);
}

/* ---------- acciones ---------- */
function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button || processing) return;

  const { action, id } = button.dataset;
  const product = products.find((p) => p.id === id);

  switch (action) {
    case 'inc': {
      const result = addToCart(product, 1);
      if (!result.ok) showToast(result.message, 'error');
      break;
    }
    case 'dec': {
      const line = summarize(products).lines.find((l) => l.product.id === id);
      setQty(id, (line?.qty ?? 1) - 1);
      break;
    }
    case 'remove':
      removeFromCart(id);
      showToast('producto eliminado del carrito', 'info');
      break;
    case 'clear':
      if (confirm('vaciar todo el carrito?')) clearCart();
      break;
    case 'checkout':
      checkout();
      break;
  }
}

/* ---------- compra simulada ---------- */
function openDialog(html) {
  dialogBody().innerHTML = html;
  if (!dialogEl().open) dialogEl().showModal();
}

async function checkout() {
  if (!isLoggedIn()) {
    showToast('inicia sesion para finalizar la compra', 'info');
    setTimeout(() => { location.href = 'login.html?redirect=carrito.html'; }, 900);
    return;
  }

  // vuelve a leer el stock real antes de cobrar
  products = await getProducts();
  const summary = summarize(products);
  const problem = summary.lines.find((line) => line.qty > line.product.stock);
  if (problem) {
    syncCart(products);
    showToast(`cambio el stock de "${problem.product.title}". revisa tu carrito.`, 'error');
    return;
  }

  processing = true;
  openDialog(`
    <div class="spinner" aria-hidden="true"></div>
    <h2 id="dialogTitle">procesando tu pago…</h2>
    <p>no cierres esta ventana.</p>`);

  await wait(1800); // simula la demora de la pasarela de pago

  // descuenta stock - guarda pedido  - vacia carrito
  discountStock(summary.lines.map(({ product, qty }) => ({ id: product.id, qty, stock: product.stock })));
  const order = createOrder(getUser(), summary);
  clearCart();
  products = await getProducts();
  processing = false;

  openDialog(`
    <div class="success-icon" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
    </div>
    <h2 id="dialogTitle">compra realizada</h2>
    <span class="order-id">pedido ${escapeHTML(order.id)}</span>
    <p>Pagaste <strong>${formatPrice(order.total)}</strong> por ${summary.items} ${summary.items === 1 ? 'producto' : 'productos'}.<br>Te enviamos el detalle a ${escapeHTML(order.email)}.</p>
    <div class="dialog-actions">
      <a class="btn btn-primary" href="productos.html"> seguir comprando</a>
      <button class="btn btn-ghost" type="button" data-close>cerrar</button>
    </div>`);
}

/* ---------- inicio ---------- */
export async function init() {
  try {
    products = await getProducts();
  } catch (error) {
    console.error(error);
    renderError(listEl(), 'no cargo tu carrito.');
    return;
  }

  syncCart(products);
  render();

  listEl().addEventListener('click', handleClick);
  summaryEl().addEventListener('click', handleClick);
  window.addEventListener('cart:updated', render);

  const dialog = dialogEl();
  dialog.addEventListener('cancel', (event) => { if (processing) event.preventDefault(); });
  dialog.addEventListener('click', (event) => { if (event.target.closest('[data-close]')) dialog.close(); });
  dialog.addEventListener('close', render);
}
