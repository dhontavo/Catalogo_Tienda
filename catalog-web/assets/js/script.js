// Valores cargados dinámicamente desde env.php
let API_BASE = '';
let API_KEY = '';
let HEADERS = {};

async function loadEnv() {
    try {
        const response = await fetch('env.php');
        if (!response.ok) throw new Error('No se pudo cargar la configuración de entorno');
        const config = await response.json();
        
        API_BASE = config.API_BASE || '';
        API_KEY = config.API_KEY || '';
        HEADERS['X-API-Key'] = API_KEY;
    } catch (error) {
        console.error('Error cargando configuración:', error);
    }
}


// Utility: Convert Hex to RGB for shadow manipulation
function hexToRgb(hex) {
    let c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
        c = hex.substring(1).split('');
        if (c.length == 3) {
            c = [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c = '0x' + c.join('');
        return [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',');
    }
    return '99, 102, 241';
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function showMessage(title, desc) {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('product-grid').style.display = 'none';
    const msgBox = document.getElementById('message-container');
    msgBox.style.display = 'block';
    // document.getElementById('msg-title').innerText = title;
    // document.getElementById('msg-desc').innerText = desc;
    if (title === 'Error' || desc === 'Error') {

        msgBox.style.backgroundImage = 'url(http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png)';
        msgBox.style.backgroundSize = 'contain';
        msgBox.style.backgroundRepeat = 'no-repeat';
        msgBox.style.backgroundPosition = 'center';
    }
}

async function initializeCatalog() {
    await loadEnv();

    const urlParams = new URLSearchParams(window.location.search);
    const idStore = urlParams.get('id_store');

    if (!idStore) {
        showMessage('Enlace Inválido', 'Por favor, proporciona el id_store en la URL.');
        return;
    }

    try {
        const storeResponse = await fetch(`${API_BASE}/store?id_store=${idStore}`, { headers: HEADERS });
        const storeResult = await storeResponse.json();

        if (!storeResult.success || !storeResult.data) {
            throw new Error(storeResult.error || 'Tienda no encontrada.');
        }

        const store = storeResult.data;

        document.title = `${store.store ?? 'Tienda'} - Catálogo`;
        document.getElementById('store-name').innerText = store.store ?? 'ShoppyCatalog';

        if (store.image) {
            const logoEl = document.getElementById('store-logo');
            logoEl.src = store.image;
            logoEl.style.display = 'block';
        }

        let primaryColor = '#0058b8';
        let gradientStart = '#e0efff';
        let gradientEnd = '#f8f9fb';

        if (store.colors) {
            try {
                const colorsArray = JSON.parse(store.colors);
                if (Array.isArray(colorsArray) && colorsArray.length >= 1) {
                    primaryColor = colorsArray[0];
                    const rgb = hexToRgb(primaryColor);
                    const [r, g, b] = rgb.split(',').map(Number);
                    gradientStart = `rgba(${r}, ${g}, ${b}, 0.06)`;
                    gradientEnd = `rgba(${r}, ${g}, ${b}, 0.15)`;
                }
            } catch (e) {
                console.warn('Failed to parse store.colors', e);
            }
        }

        const primaryRgb = hexToRgb(primaryColor);
        const [r, g, b] = primaryRgb.split(',').map(Number);

        document.documentElement.style.setProperty('--primary-color', primaryColor);
        document.documentElement.style.setProperty('--primary-color-hover', adjustColor(primaryColor, -20));
        document.documentElement.style.setProperty('--primary-color-rgb', primaryRgb);
        document.documentElement.style.setProperty('--bg-gradient-start', gradientStart);
        document.documentElement.style.setProperty('--bg-gradient-end', gradientEnd);
        document.documentElement.style.setProperty('--card-border', `rgba(${r}, ${g}, ${b}, 0.18)`);

        const nameEl = document.getElementById('store-name');
        if (nameEl) {
            nameEl.style.background = `linear-gradient(to right, ${primaryColor}, ${adjustColor(primaryColor, 40)})`;
            nameEl.style.webkitBackgroundClip = 'text';
            nameEl.style.webkitTextFillColor = 'transparent';
        }

        if (store.image) {
            const faviconLink = document.getElementById('dynamic-favicon') || (function () {
                const link = document.createElement('link');
                link.id = 'dynamic-favicon';
                link.rel = 'icon';
                document.head.appendChild(link);
                return link;
            })();
            faviconLink.href = store.image;
        }

        const productsResponse = await fetch(`${API_BASE}/products?id_store=${idStore}&limit=100`, { headers: HEADERS });
        const productsResult = await productsResponse.json();

        document.getElementById('loader').style.display = 'none';

        if (!productsResult.success) {
            throw new Error(productsResult.error || 'Error al cargar los productos.');
        }

        const products = productsResult.data;

        if (products.length === 0) {
            showMessage('Catálogo Vacío', 'Esta tienda aún no tiene productos disponibles para mostrar.');
            return;
        }

        getConfig();
        renderProducts(products);
        loadCart();
        updateCartUI();

    } catch (error) {
        console.error('Error inicializando el catálogo:', error);
        showMessage('Error', error.message || 'Hubo un problema al cargar el catálogo. Inténtalo de nuevo más tarde.');
    }
}

async function storeDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const idStore = urlParams.get('id_store');
    const response = await fetch(`${API_BASE}/store?id_store=${idStore}`, { headers: HEADERS });
    const data = await response.json();
    if (data.success) {
        return data.data;
    }
}
// ─── Config  ───────────────────────────────────────────────────────────────

let config = [];

async function getConfig() {
    const response = await fetch(`${API_BASE}/config`, { headers: HEADERS });
    const data = await response.json();
    if (data.success) {
        config = data.data;
    }
}

async function placeOrder() {
    const urlParams = new URLSearchParams(window.location.search);
    const idStore = urlParams.get('id_store');
    const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...HEADERS
        },
        body: JSON.stringify({
            id_store: idStore,
            products: cart,
        }),
    });
    const data = await response.json();
    if (data.success) {
        clearCart();
        showMessage('Pedido realizado', 'Tu pedido ha sido realizado exitosamente.');
    }
}

// ─── Cart state ───────────────────────────────────────────────────────────────
let cart = [];

// Una sola clave por tienda → array completo de productos
function getCartStorageKey() {
    const urlParams = new URLSearchParams(window.location.search);
    const idStore = urlParams.get('id_store');
    return idStore ? `cart_${idStore}` : null;
}

function saveCart() {
    const key = getCartStorageKey();
    if (key) localStorage.setItem(key, JSON.stringify(cart));
}

function loadCart() {
    const key = getCartStorageKey();
    if (!key) return;
    const stored = localStorage.getItem(key);
    if (stored) {
        try {
            cart = JSON.parse(stored).map(p => ({
                ...p,
                id_product: String(p.id_product) // normaliza a string
            }));
        }
        catch (e) { cart = []; }
    }
}

let currentProduct = null;

function formatMXN(amount) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// ─── Cart UI ──────────────────────────────────────────────────────────────────
function updateCartUI() {
    const count = cart.reduce((s, p) => s + p.quantity, 0);
    document.getElementById('cart-count').innerText = count;

    const list = document.getElementById('cart-items');

    if (cart.length === 0) {
        list.innerHTML = '<li class="cart-empty">No hay productos en el carrito.</li>';
        document.getElementById('cart-total').innerText = '';
        return;
    }

    list.innerHTML = cart.map(p => {
        const imgSrc = p.image && p.image.trim() !== ''
            ? p.image
            : 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

        return `
            <li class="cart-item" id="cart-item-${p.id_product}">
                <div class="cart-item-image">
                    <img src="${imgSrc}"
                         alt="${p.name}"
                         onerror="this.src='http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <span class="cart-item-name">${p.name}</span>
                        <button class="btn-cart-remove" data-id="${p.id_product}" title="Eliminar" aria-label="Eliminar producto">
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-item-footer">
                        <div class="cart-item-qty-controls">
                            <button class="btn-qty" data-id="${p.id_product}" data-action="decrease" aria-label="Disminuir">−</button>
                            <span class="cart-item-qty">${p.quantity}</span>
                            <button class="btn-qty" data-id="${p.id_product}" data-action="increase" aria-label="Aumentar">+</button>
                        </div>
                        <div class="cart-item-price-wrapper">
                            <span class="cart-item-price">${formatMXN(p.price * p.quantity)}</span>
                        </div>
                    </div>
                </div>
            </li>
        `;
    }).join('');

    const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);
    document.getElementById('cart-total').innerText = `Total: ${formatMXN(total)}`;
}

// ─── Product Modal ────────────────────────────────────────────────────────────
function openProductModal(product) {
    currentProduct = product;
    const imgSrc = product.image && product.image.trim() !== ''
        ? product.image
        : 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

    document.getElementById('modal-title').innerText = product.name;
    document.getElementById('modal-image').src = imgSrc;
    document.getElementById('modal-image').onerror = function () {
        this.src = 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';
    };
    document.getElementById('modal-description').innerText = product.description || 'Sin descripción detallada.';
    document.getElementById('modal-price').innerText = formatMXN(product.price);

    const modal = document.getElementById('product-modal');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('visible'));
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 300);
    currentProduct = null;
}

function addCurrentToCart() {
    if (!currentProduct) return;

    const productId = String(currentProduct.id);

    const existing = cart.find(p => String(p.id) === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: productId, name: currentProduct.name, price: currentProduct.price, image: currentProduct.image, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    closeProductModal();


    setTimeout(() => {
        openCartModal();
        setTimeout(() => {
            const li = document.getElementById(`cart-item-${productId}`);
            if (li) {
                li.classList.add('cart-item-highlight');
                li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setTimeout(() => li.classList.remove('cart-item-highlight'), 800);
            }
        }, 150);
    }, 100);
}
// ─── Cart Modal ───────────────────────────────────────────────────────────────
function openCartModal() {
    updateCartUI();
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.add('visible'));
}

function closeCartModal() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('visible');
    setTimeout(() => modal.classList.add('hidden'), 300);
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
}

// ─── Delegación de eventos sobre document (sobrevive rerenders del innerHTML) ─
document.addEventListener('click', e => {
    // Eliminar item
    const removeBtn = e.target.closest('.btn-cart-remove');
    if (removeBtn) {
        const id = removeBtn.dataset.id;
        const idx = cart.findIndex(p => String(p.id_product) === String(id));
        if (idx !== -1) cart.splice(idx, 1);
        saveCart();
        updateCartUI();
        return;
    }

    // Aumentar / disminuir cantidad
    const qtyBtn = e.target.closest('.btn-qty');
    if (qtyBtn) {
        const id = qtyBtn.dataset.id;
        const action = qtyBtn.dataset.action;
        const item = cart.find(p => String(p.id_product) === String(id));
        if (!item) return;

        if (action === 'increase') {
            item.quantity += 1;
        } else if (action === 'decrease') {
            item.quantity -= 1;
            if (item.quantity <= 0) {
                cart.splice(cart.indexOf(item), 1);
            }
        }

        saveCart();
        updateCartUI();

        const li = document.getElementById(`cart-item-${id}`);
        if (li) {
            li.classList.add('cart-item-highlight');
            setTimeout(() => li.classList.remove('cart-item-highlight'), 600);
        }
    }
});

// ─── Toast notification ───────────────────────────────────────────────────────
function showCartToast(name) {
    let toast = document.getElementById('cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'cart-toast';
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.innerText = `✓ "${name}" agregado al carrito`;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── Cerrar modales ───────────────────────────────────────────────────────────
document.getElementById('product-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('product-modal')) closeProductModal();
});
document.getElementById('cart-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('cart-modal')) closeCartModal();
});
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProductModal(); closeCartModal(); }
});

document.getElementById('cart-button').addEventListener('click', openCartModal);

// ─── Product rendering ────────────────────────────────────────────────────────
function renderProducts(products) {
    const grid = document.getElementById('product-grid');

    grid.innerHTML = products.map((product, index) => {
        const imageSrc = product.image && product.image.trim() !== ''
            ? product.image
            : 'http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png';

        return `
            <div class="product-card" style="animation-delay: ${index * 0.05}s">
                <div class="product-image-container">
                    <img src="${imageSrc}" alt="${product.name}" class="product-image"
                         onerror="this.src='http://localhost/Catalogo_Tienda/backend/public/uploads/logo-system/ERROR.png'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description || 'Sin descripción detallada.'}</p>
                    <div class="product-footer">
                        <span class="product-price">${formatMXN(product.price)}</span>
                        <button class="btn-view" data-index="${index}">Ver más</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    grid.addEventListener('click', e => {
        const btn = e.target.closest('.btn-view');
        if (!btn) return;
        openProductModal(products[parseInt(btn.dataset.index, 10)]);
    });

    setTimeout(() => grid.classList.add('visible'), 100);
}

// ─── Initialize on load ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', initializeCatalog);