// configuracion global de la tienda. modifico estos valores y se aplican en todo el sitio.
// carpeta raiz del sitio y carpeta /pages, calculadas desde la ubicacion de este modulo.
// de esta manera los fetch y los links funcionan desde index.html y desde pages/*.html.
export const ROOT = new URL('../', import.meta.url).href;
export const PAGES = ROOT + 'pages/';

/** convierto una ruta relativa a la raíz ("assets/x.png", "carrito.html") en URL absoluta. */
export function resolvePath(path = '') {
  if (!path || /^([a-z]+:|\/\/|#)/i.test(path)) return path;
  const isPage = /^[\w-]+\.html(\?|#|$)/.test(path) && !path.startsWith('index.html');
  return (isPage ? PAGES : ROOT) + path;
}

export const CONFIG = {
  storeName: 'UrbanShop',
  currency: 'ARS',
  locale: 'es-AR',
  freeShippingFrom: 80000, // envio gratis a partir de este subtotal
  shippingCost: 4500,
  installments: 12,
  paths: {
    products: ROOT + 'data/products.json',
    banners: ROOT + 'data/banners.json',
    videos: ROOT + 'data/videos.json',
    navbar: ROOT + 'components/navbar.html',
    footer: ROOT + 'components/footer.html'
  },
  storageKeys: {
    cart: 'urbanshop_cart',
    users: 'urbanshop_users',
    session: 'urbanshop_session',
    stock: 'urbanshop_stock',
    orders: 'urbanshop_orders'
  },
  demoUser: { name: 'nombre de prueba', email: 'urbanshop@gmail.com', password: 'urban1234' }
};
