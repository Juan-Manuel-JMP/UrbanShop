# UrbanShop · Ecommerce

tienda realizada en HTML5, CSS3 y JavaScript con modulos ES (`type="module"`).

## realizado para Talento Tech

## características

| Consignas de las clases | 
|---|---|
| Navegacion entre paginas | 7 páginas HTML enlazadas (`index`, `productos`, `temporadas`, `local`, `carrito`, login`,`registro`) |
| Es responsiva | CSS con grillas fluidas y media queries |
| Agrego inicio de sesion y registro | `login.html`, `registro.html`, `js/services/auth.js` |
| Cards con varias imagenes, titulo, descripcion, precio y stock | `js/ui/productCard.js`   |
| Json con varios productos | `data/products.json` (24 productos, 5 categorias) |
| Carrito con funcionalidades, agregar, eliminar, sumar/restar y simular compra | `carrito.html`, `js/services/cart.js`, `js/pages/cart.js` |
| Descuento de stock al comprar | `js/services/inventory.js` |
| Banners con descuentos | Carrusel mas banners por producto (`data/banners.json`) |
| Videos de temporadas y del local en cards | `temporadas.html`, `local.html`, `js/ui/videoCard.js` |
| iframe del local | `local.html` (Google Maps) |
| Footer | `components/footer.html` |
| Productos destacados | Seccion en `index.html` (campo `featured` del Json) |
| `fetch` | Productos, banners, videos, navbar y footer |
| Manipulacion del DOM | `createElement`, `innerHTML`, delegación de eventos, `dialog` |
| Logo | `assets/img/logo.svg` |
| Menu movil flotante tipo vidrio (glass) | `.nav-dock.glass` en `components/navbar.html` + `css/layout.css` |
| Navbar y footer reutilizables | `components/` cargados con `fetch` desde `js/main.js` |
|---|---|

## estructura del proyecto

```
UrbanShop/
├── index.html              inicio: banners, destacados, categorías y ofertas
├── productos.html          catalogo con busqueda, filtros y orden
├── temporadas.html         videos promocionales de temporada mas ofertas
├── local.html              videos del local mas datos e iframe de mapa
├── carrito.html            carrito y compra simulada
├── login.html              inicio de sesion
├── registro.html           registro de usuarios
├── README.md
│
├── components/             html reutilizable (se carga con fetch)
│   ├── navbar.html         header de escritorio mas menu movil con estilo flotante vidrio (glass)
│   └── footer.html
│
├── css/
│   ├── base.css            variables, reset, botones y formularios
│   ├── layout.css          header, menu movil vidrio (glass), footer
│   ├── components.css      cards, carrusel, videos, toasts, diálogo
│   └── pages.css           estilos especificos de cada pagina
│
├── data/
│   ├── products.json       11 productos (imagenes, precio, descuento, stock)
│   ├── banners.json        banners principales y por producto
│   └── videos.json         videos de temporada y del local
│
├── assets/
│   ├── img/                logo
│   └── videos/             videos
│
└── js/
    ├── main.js             punto de entrada: carga componentes y la pagina actual
    ├── config.js           moneda, envío gratis, rutas y claves de almacenamiento
    ├── utils.js            formato de precio, escape de html, debounce
    ├── components.js       loadComponent() fetch de navbar y footer
    ├── services/           logica de negocio
    │   ├── storage.js      localStorage mas eventos globales
    │   ├── api.js          fetch de JSON y stock real de productos
    │   ├── cart.js         agregar, quitar, sumar, totales y envio
    │   ├── auth.js         registro, login y sesion
    │   ├── inventory.js    descuento de stock al comprar
    │   └── orders.js       pedidos simulados
    ├── ui/                 componentes de interfaz reutilizables
    │   ├── productCard.js  card de producto con galeria
    │   ├── carousel.js     carrusel de banners
    │   ├── videoCard.js    card de video con controles
    │   ├── navbar.js       link activo, contador del carrito, usuario
    │   ├── footer.js       año y reinicio de la prueba 
    │   ├── feedback.js     toasts, estados vacios y errores
    │   └── forms.js        validacion y utilidades de formularios
    └── pages/              un modulo por pagina (export function init)
        ├── home.js
        ├── products.js
        ├── seasons.js
        ├── local.js
        ├── cart.js
        ├── login.js
        └── register.js
```

## cuenta de prueba

- email: `urbanshop@gmail.com`
- contraseña: `urban1234`

se puede crear una cuenta desde `registro.html`.

## flujo de compra

1. se agrergan productos desde las cards (no se puede superar el stock).
2. en `carrito.html` sumas, restas o eliminas productos, se calculan descuentos, envio y total.
3. al tocar **finalizar compra**, si se inicio la sesion te redirijo al `login.html` y luego volves al carrito.
4. se simula el pago, se **descuenta el stock**, se guarda el pedido y se vacia el carrito.
5. para volver a los valores originales, clickeas en **reiniciar datos de la prueba** en el footer.

## personalizacion

**productos**: se puede editar el json en `data/products.json`. cada producto tiene:

```json
{
  "id": "p01",
  "title": "Nombre",
  "category": "Audio",
  "description": "algna descripcion",
  "price": 89900,
  "discount": 20,
  "stock": 25,
  "featured": true,
  "images": ["src", "src", "src", "src"]
}
```

- `discount` es un porcentaje (0 = sin descuento).
- `featured: true` lo muestra en "productos destacados".
- las imagenes las busque en varios lugares entre ellos unsplash.

**videos**: se puede cambiar los videos en `assets/videos/` y tener que cambiar los nombres en `data/videos.json`:

```json
{ "id": "v1", "category": "temporada", "season": "Primavera",
  "title": "Promo Primavera", "description": "…",
  "src": "assets/videos/promo-primavera.mp4", "poster": "" }
```

- `category: "temporada"` aparece en `temporadas.html` (filtrable por `season`).
- `category: "local"` aparece en `local.html`.
- `poster` es opcional ruta a la imagen de portada.
- si el archivo no existe, la card muestra un aviso con la ruta esperada.
- formatos de los videos: **mp4

**mapa de la tinda**: en Google Maps `<iframe>` en `local.html`. `components/footer.html`.

**banners**: se puede editar tambien en `data/banners.json` (`type: "hero"` para el carrusel, `type: "mini"` para los banners por producto).

**moneda, envio y cuotas**: `js/config.js`.

**colores**: variables css al inicio de `css/base.css`.

## como funciona

- cada html tiene `<body data-page="home">` y carga solo `js/main.js`. Ese archivo inyecta navbar y footer con `fetch` y luego importa de forma dinamica `js/pages/<page>.js`.
- Los servicios (`services/`) no tocan el DOM: guardan datos en `localStorage` y emiten eventos (`cart:updated`, `auth:changed`, `stock:updated`) a los que reacciona la interfaz.
- el stock original vive en `products.json` es solo lectura. Las compras guardan el stock restante en `localStorage` y `getProducts()` lo combina al cargar.
- el menu movil (≤ 860 px) es una barra flotante con `backdrop-filter: blur()`, efecto vidrio (glass) y un respaldo opaco para navegadores sin soporte.

## info importante

- no hay backend ni pagos reales. Los usuarios, el carrito, el stock y los pedidos viven en el `localStorage` del navegador.
- el hash SHA-256 de las contraseñas es solo ilustrativo. 
- si se cambia de navegador o se borra los datos del sitio, se pierden cuentas, carrito y stock modificado.

## algunas ideas para seguir construyendo...

- pagina de detalle de producto y favoritos.
- historial de pedidos del usuario (ya se guardan en `localStorage`; faltaria la vista).
- cupones de descuento y medios de pago simulados.
- backend (node, php, entre otros.) con base de datos real.