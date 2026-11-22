import { CONFIG } from './config.js';

const currencyFormatter = new Intl.NumberFormat(CONFIG.locale, {
  style: 'currency',
  currency: CONFIG.currency,
  maximumFractionDigits: 0
});

export const formatPrice = (value) => currencyFormatter.format(value);

/** precio final aplicando el porcentaje de descuento del producto. */
export const finalPrice = (product) =>
  Math.round(product.price * (1 - (product.discount || 0) / 100));

export function escapeHTML(value = '') {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(value).replace(/[&<>"']/g, (char) => map[char]);
}

/** minusculas y sin tildes, para busquedas. */
export const normalize = (text = '') =>
  String(text).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const debounce = (fn, delay = 250) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];