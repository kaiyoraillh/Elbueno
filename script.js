/* =============================================
   EL BUENO BURGER — Script
   ============================================= */

// ===== MENU DATA =====

const SIZES = { simple: 'Simple', doble: 'Doble', triple: 'Triple' };

const MENU = {
  burgers: [
    {
      id: 'cheese',
      name: 'Cheese',
      emoji: '🧀',
      desc: 'Carne, queso',
      prices: { simple: 12000, doble: 15000, triple: 17000 },
    },
    {
      id: 'clasica',
      name: 'Clásica',
      emoji: '🥬',
      desc: 'Lechuga, tomate, salsa thousand island',
      prices: { simple: 12000, doble: 15000, triple: 17000 },
    },
    {
      id: 'cuarto',
      name: 'Cuarto',
      emoji: '🍔',
      desc: 'Ketchup, mostaza, cebolla cruda en cubitos',
      prices: { simple: 12000, doble: 15000, triple: 17000 },
    },
    {
      id: 'labuena',
      name: 'La Buena',
      emoji: '⭐',
      desc: 'Panceta, cebolla caramelizada, salsa la buena',
      prices: { simple: 13000, doble: 16000, triple: 18000 },
    },
    {
      id: 'oklahoma',
      name: 'Oklahoma',
      emoji: '🔥',
      desc: 'Cebolla smasheada, salsa la buena',
      prices: { simple: 13000, doble: 16000, triple: 18000 },
    },
    {
      id: 'bigbuena',
      name: 'Big Buena',
      emoji: '👑',
      desc: 'Lechuga, pickles, salsa big m*c',
      prices: { simple: 13000, doble: 16000, triple: 18000 },
    },
  ],
  papas: [
    {
      id: 'papas',
      name: 'Papas Fritas',
      desc: 'Papas fritas crujientes',
      price: 6000,
    },
    {
      id: 'papas-cheddar',
      name: 'Papas + Cheddar',
      desc: 'Papas con salsa cheddar derretida',
      price: 7000,
    },
    {
      id: 'animals-style',
      name: "Animal's Style",
      desc: 'Papas, cheddar, cebolla caramelizada y salsa especial',
      price: 8000,
    },
  ],
  bebidas: [
    { id: 'gaseosa',         name: 'Gaseosa',          price: 3000 },
    { id: 'agua',            name: 'Agua',              price: 2500 },
    { id: 'cerveza-chica',   name: 'Cerveza (330ml)',   price: 4000 },
    { id: 'cerveza-grande',  name: 'Cerveza (500ml)',   price: 5000 },
    { id: 'agua-saborizada', name: 'Agua Saborizada',   price: 3000 },
  ],
  adicionales: [
    { id: 'extra-carne',  name: 'Extra Carne + Cheddar', price: 4000 },
    { id: 'pote-cheddar', name: 'Pote de Cheddar',       price: 3000 },
    { id: 'panceta',      name: 'Panceta',               price: 1500 },
    { id: 'pepinos',      name: 'Pepinos Agridulces',    price: 500  },
  ],
};

// ===== HELPERS =====

function fmt(n) {
  return '$' + n.toLocaleString('es-AR');
}

function $(id) { return document.getElementById(id); }

// ===== CART STATE =====
let cart = [];

// ===== RENDER MENU =====

function renderBurgers() {
  $('burgers-grid').innerHTML = MENU.burgers.map(b => `
    <div class="burger-card" id="card-${b.id}">
      <div class="burger-card-top">
        <div class="burger-badges">
          <span class="badge-fries">+ PAPAS FRITAS</span>
        </div>
      </div>
      <h3 class="burger-name">${b.name}</h3>
      <p class="burger-desc">${b.desc}</p>
      <div class="size-selector" id="sizes-${b.id}">
        ${Object.entries(b.prices).map(([size, price], i) => `
          <button class="size-btn${i === 0 ? ' active' : ''}" data-size="${size}">
            ${SIZES[size]}<span class="size-price">${fmt(price)}</span>
          </button>
        `).join('')}
      </div>
      <button class="add-to-cart-btn" id="addbtn-${b.id}" onclick="addBurger('${b.id}')">
        ＋ AGREGAR AL PEDIDO
      </button>
    </div>
  `).join('');

  // Wire up size selectors
  MENU.burgers.forEach(b => {
    const selector = $(`sizes-${b.id}`);
    selector.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selector.querySelectorAll('.size-btn').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  });
}

function renderItems(containerId, items, type) {
  $(containerId).innerHTML = items.map(item => `
    <div class="item-card">
      <div class="item-info">
        <div class="item-name">${item.name}</div>
        ${item.desc ? `<div class="item-desc">${item.desc}</div>` : ''}
      </div>
      <span class="item-price">${fmt(item.price)}</span>
      <button
        class="item-add-btn"
        id="addbtn-${type}-${item.id}"
        onclick="addItem('${type}', '${item.id}')"
        aria-label="Agregar ${item.name}"
      >+</button>
    </div>
  `).join('');
}

function renderMenu() {
  renderBurgers();
  renderItems('papas-list',      MENU.papas,      'papas');
  renderItems('bebidas-list',    MENU.bebidas,    'bebidas');
  renderItems('adicionales-list', MENU.adicionales, 'adicionales');
}

// ===== CART LOGIC =====

function addBurger(burgerId) {
  const selector = $(`sizes-${burgerId}`);
  const activeBtn = selector.querySelector('.size-btn.active');
  const size = activeBtn.dataset.size;
  const burger = MENU.burgers.find(b => b.id === burgerId);
  const price = burger.prices[size];
  const cartId = `${burgerId}-${size}`;

  const existing = cart.find(i => i.cartId === cartId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ cartId, type: 'burger', name: burger.name, size, price, qty: 1 });
  }

  updateCart();
  flashBtn(`addbtn-${burgerId}`, true);
}

function addItem(type, itemId) {
  const item = MENU[type].find(i => i.id === itemId);
  const cartId = `${type}-${itemId}`;

  const existing = cart.find(i => i.cartId === cartId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ cartId, type, name: item.name, size: null, price: item.price, qty: 1 });
  }

  updateCart();
  flashBtn(`addbtn-${type}-${itemId}`, false);
}

function changeQty(cartId, delta) {
  const idx = cart.findIndex(i => i.cartId === cartId);
  if (idx === -1) return;
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  updateCart();
}

// ===== BUTTON FEEDBACK =====

function flashBtn(btnId, isBigBtn) {
  const btn = $(btnId);
  if (!btn) return;

  btn.classList.add('added', 'pop');
  const orig = btn.textContent;
  btn.textContent = isBigBtn ? '✓ AGREGADO!' : '✓';

  setTimeout(() => {
    btn.classList.remove('added', 'pop');
    btn.textContent = orig;
  }, 850);
}

// ===== UPDATE CART UI =====

function updateCart() {
  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Counts
  $('cart-count').textContent = totalItems;
  $('cart-fab-qty').textContent = totalItems;
  $('cart-fab-total').textContent = fmt(totalPrice);
  $('cart-total-value').textContent = fmt(totalPrice);

  // FAB visibility
  $('cart-fab').style.display = totalItems > 0 ? 'flex' : 'none';

  // Cart body
  const body = $('cart-body');
  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty-state">
        <p>Tu pedido está vacío</p>
        <p style="font-weight:600;color:#aaa;font-size:.85rem">¡Elegí algo del menú!</p>
      </div>`;
    $('cart-footer').style.display = 'none';
  } else {
    body.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${item.size ? `<div class="cart-item-size">${SIZES[item.size]}</div>` : ''}
          <div class="cart-item-price">${fmt(item.price * item.qty)}</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn minus" onclick="changeQty('${item.cartId}', -1)" aria-label="Quitar uno">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.cartId}', 1)" aria-label="Agregar uno">+</button>
        </div>
      </div>
    `).join('');
    $('cart-footer').style.display = 'flex';
  }
}

// ===== CART DRAWER OPEN / CLOSE =====

function openCart() {
  $('cart-drawer').classList.add('open');
  $('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('cart-drawer').classList.remove('open');
  $('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ===== WHATSAPP MESSAGE =====

function buildMessage() {
  const notes = $('cart-notes').value.trim();

  const burgers    = cart.filter(i => i.type === 'burger');
  const papas      = cart.filter(i => i.type === 'papas');
  const bebidas    = cart.filter(i => i.type === 'bebidas');
  const adicionales = cart.filter(i => i.type === 'adicionales');

  const lines = ['🍔 *PEDIDO EL BUENO BURGER*\n'];

  if (burgers.length) {
    lines.push('*🍔 HAMBURGUESAS:*');
    burgers.forEach(i =>
      lines.push(`• ${i.name} ${SIZES[i.size]} x${i.qty} — ${fmt(i.price * i.qty)}`)
    );
    lines.push('');
  }
  if (papas.length) {
    lines.push('*🍟 PAPAS:*');
    papas.forEach(i => lines.push(`• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`));
    lines.push('');
  }
  if (bebidas.length) {
    lines.push('*🥤 BEBIDAS:*');
    bebidas.forEach(i => lines.push(`• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`));
    lines.push('');
  }
  if (adicionales.length) {
    lines.push('*➕ ADICIONALES:*');
    adicionales.forEach(i => lines.push(`• ${i.name} x${i.qty} — ${fmt(i.price * i.qty)}`));
    lines.push('');
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  lines.push(`*TOTAL: ${fmt(total)}*`);
  lines.push('');
  lines.push('📦 Retiro en local — Patricios 1715, Maschwitz');

  if (notes) lines.push(`\n📝 Aclaraciones: ${notes}`);

  return lines.join('\n');
}

function sendWhatsApp() {
  if (cart.length === 0) return;
  const msg = buildMessage();
  window.open(`https://wa.me/5491164550748?text=${encodeURIComponent(msg)}`, '_blank');
}

// ===== OPEN / CLOSED STATUS =====

function updateOpenStatus() {
  const now = new Date();
  // Argentina UTC-3
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const arg = new Date(utc + 3600000 * -3);

  const day  = arg.getDay();  // 0=Sun…6=Sat
  const mins = arg.getHours() * 60 + arg.getMinutes();

  // Open: Wed(3), Thu(4), Fri(5), Sat(6), Sun(0) from 19:30 to 23:00
  const openDays  = [0, 3, 4, 5, 6];
  const openMins  = 19 * 60 + 30;
  const closeMins = 23 * 60;

  const isOpen = openDays.includes(day) && mins >= openMins && mins < closeMins;

  const badge = $('open-status');
  if (badge) {
    badge.textContent = isOpen ? '● ABIERTO' : '● CERRADO';
    badge.classList.toggle('open', isOpen);
  }
}

// ===== STICKY NAV ACTIVE SECTION =====

function updateNavActive() {
  const sections = ['hamburguesas', 'extras', 'adicionales'];
  const scrollY = window.scrollY + 80;

  let current = sections[0];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= scrollY) current = id;
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// ===== MOBILE LAYOUT =====

function applyMobileStyles() {
  const isMobile = window.innerWidth <= 768;

  const heroTitle   = document.querySelector('.hero-title');
  const tEl         = document.querySelector('.t-el');
  const tBueno      = document.querySelector('.t-bueno');
  const heroRight   = document.querySelector('.hero-right');
  const openBadge   = document.querySelector('.open-badge');
  const heroHours   = document.querySelector('.hero-hours');
  const heroAddress = document.querySelector('.hero-address');

  if (isMobile) {
    // Apilar EL / BUENO verticalmente
    if (heroTitle) {
      heroTitle.style.flexDirection = 'column';
      heroTitle.style.lineHeight    = '0.9';
    }
    if (tEl)    { tEl.style.fontSize    = '36px'; }
    if (tBueno) { tBueno.style.fontSize = '36px'; }

    // Contenedor derecho: limitar ancho y evitar desborde
    if (heroRight) {
      heroRight.style.paddingLeft  = '8px';
      heroRight.style.paddingRight = '12px';
      heroRight.style.maxWidth     = 'calc(50% - 10px)';
      heroRight.style.overflow     = 'hidden';
      heroRight.style.boxSizing    = 'border-box';
    }

    // Badges más chicos y sin desborde
    [openBadge, heroHours, heroAddress].forEach(el => {
      if (!el) return;
      el.style.fontSize   = '9px';
      el.style.padding    = '2px 6px';
      el.style.maxWidth   = '100%';
      el.style.width      = '100%';
      el.style.boxSizing  = 'border-box';
      el.style.whiteSpace = 'nowrap';
      el.style.overflow   = 'hidden';
      el.style.textOverflow = 'ellipsis';
    });

  } else {
    // Restaurar estilos desktop
    if (heroTitle) { heroTitle.style.flexDirection = ''; heroTitle.style.lineHeight = ''; }
    if (tEl)    { tEl.style.fontSize    = ''; }
    if (tBueno) { tBueno.style.fontSize = ''; }

    if (heroRight) {
      heroRight.style.paddingLeft  = '';
      heroRight.style.paddingRight = '';
      heroRight.style.maxWidth     = '';
      heroRight.style.overflow     = '';
      heroRight.style.boxSizing    = '';
    }

    [openBadge, heroHours, heroAddress].forEach(el => {
      if (!el) return;
      el.style.fontSize = el.style.padding = el.style.maxWidth =
      el.style.width = el.style.boxSizing = el.style.whiteSpace =
      el.style.overflow = el.style.textOverflow = '';
    });
  }
}

// ===== INIT =====

document.addEventListener('DOMContentLoaded', () => {
  renderMenu();
  updateCart();
  updateOpenStatus();
  applyMobileStyles();

  $('cart-nav-btn').addEventListener('click', openCart);
  $('cart-fab').addEventListener('click', openCart);
  $('cart-close').addEventListener('click', closeCart);
  $('cart-overlay').addEventListener('click', closeCart);
  $('wa-btn').addEventListener('click', sendWhatsApp);

  window.addEventListener('scroll', updateNavActive, { passive: true });
  window.addEventListener('resize', applyMobileStyles, { passive: true });

  // Keyboard close
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCart();
  });
});
